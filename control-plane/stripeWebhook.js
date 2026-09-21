// Función helper para verificar la firma de Stripe en Cloudflare Workers
async function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const elements = signatureHeader.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
  const signature = elements.find(e => e.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !signature) return false;

  // Ventana de tolerancia: rechaza firmas con más de 5 minutos de antigüedad (anti-replay)
  const TOLERANCE_SECONDS = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > TOLERANCE_SECONDS) return false;

  const encoder = new TextEncoder();
  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expectedSignatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSignatureArray = Array.from(new Uint8Array(expectedSignatureBuffer));
  const expectedSignatureHex = expectedSignatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Comparación en tiempo constante (evita timing attacks)
  if (expectedSignatureHex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedSignatureHex.length; i++) {
    diff |= expectedSignatureHex.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export async function handleStripeWebhook(request, env) {
  const bodyText = await request.text();
  const signature = request.headers.get("stripe-signature");

  // 1. Verificación de Seguridad Crítica
  const isValidStripeEvent = await verifyStripeSignature(bodyText, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValidStripeEvent) {
    return new Response(JSON.stringify({ error: "Firma de webhook inválida" }), { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(bodyText);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // 2. Idempotencia: evita reprocesar el mismo evento (Stripe reintenta entregas)
  if (env.SAARE_VAULT_KV && event.id) {
    const seenKey = `stripe_event:${event.id}`;
    const alreadyProcessed = await env.SAARE_VAULT_KV.get(seenKey);
    if (alreadyProcessed) {
      return new Response(JSON.stringify({ status: "ALREADY_PROCESSED", eventId: event.id }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    await env.SAARE_VAULT_KV.put(seenKey, "1", { expirationTtl: 60 * 60 * 24 * 30 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    const customerName = session.customer_details?.name || session.metadata?.organization || "Organización Suscrita";
    const plan = session.metadata?.plan || "Software Core L7";
    // crypto.randomUUID() está disponible globalmente en Workers
    const tenantId = `tenant_${crypto.randomUUID().slice(0, 8)}`;

    // Si el pago no está confirmado, no aprovisionamos todavía
    if (session.payment_status && session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return new Response(JSON.stringify({ status: "PENDING_PAYMENT", sessionId: session.id }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (!customerEmail) {
      console.error("Webhook checkout.session.completed sin email de cliente:", session.id);
      return new Response(JSON.stringify({ status: "NO_EMAIL", sessionId: session.id }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const tenantRecord = {
      tenantId,
      customerEmail,
      companyName: customerName,
      status: "ACTIVE",
      plan: plan,
      createdAt: new Date().toISOString()
    };

    // 3. Sincronización con Cloudflare KV
    if (env.SAARE_VAULT_KV) {
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
    }

    // 4. Sincronización con D1 Database
    if (env.DB) {
      try {
        // La tabla se crea por migración CLI en producción; aquí se mantiene
        // IF NOT EXISTS por compatibilidad con el auto-aprovisionamiento.
        await env.DB.exec(`
          CREATE TABLE IF NOT EXISTS tenants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            name TEXT,
            plan TEXT,
            status TEXT,
            updated_at TEXT
          );
        `);

        await env.DB.prepare(`
          INSERT INTO tenants (email, name, plan, status, updated_at)
          VALUES (?, ?, ?, 'ACTIVE', datetime('now'))
          ON CONFLICT(email) DO UPDATE SET plan = ?, status = 'ACTIVE', updated_at = datetime('now')
        `).bind(customerEmail, customerName, plan, plan).run();
      } catch (e) {
        console.error("Error updating D1 on webhook:", e);
        // Devolvemos 500 para que Stripe reintente: si D1 falla, el tenant no quedó registrado
        return new Response(JSON.stringify({ error: "DB_SYNC_FAILED" }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ status: "PROVISIONED", tenantId }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ status: "IGNORED", type: event.type }), { status: 200, headers: { "Content-Type": "application/json" } });
}
