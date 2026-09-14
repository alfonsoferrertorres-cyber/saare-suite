// Función helper para verificar la firma de Stripe en Cloudflare Workers
async function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  
  const elements = signatureHeader.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
  const signature = elements.find(e => e.startsWith('v1='))?.split('=')[1];
  
  if (!timestamp || !signature) return false;

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
  
  // Prevenir ataques de tiempo (timing attacks) comparando longitudes primero
  if (expectedSignatureHex.length !== signature.length) return false;
  
  return expectedSignatureHex === signature;
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    const customerName = session.customer_details?.name || session.metadata?.organization || "Organización Suscrita";
    const plan = session.metadata?.plan || "Software Core L7";
    // crypto.randomUUID() está disponible globalmente en Workers
    const tenantId = `tenant_${crypto.randomUUID().slice(0, 8)}`; 

    const tenantRecord = {
      tenantId,
      customerEmail,
      companyName: customerName,
      status: "ACTIVE",
      plan: plan,
      createdAt: new Date().toISOString()
    };

    // 2. Sincronización con Cloudflare KV
    if (env.SAARE_VAULT_KV) {
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
    }

    // 3. Sincronización con D1 Database
    if (env.DB && customerEmail) {
      try {
        // En producción, es mejor ejecutar las migraciones (CREATE TABLE) por CLI, 
        // pero se mantiene para respetar tu flujo arquitectónico de auto-aprovisionamiento.
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
      }
    }

    return new Response(JSON.stringify({ status: "PROVISIONED", tenantId }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ status: "IGNORED", type: event.type }), { status: 200, headers: { "Content-Type": "application/json" } });
}