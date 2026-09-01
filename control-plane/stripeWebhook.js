/**
 * SAARE Stripe Webhook & Automated Tenant Provisioning v10.0 (SGP 1.0)
 * Cloudflare KV Workload Identity & Runtime License Provisioning
 */

/**
 * Valida la firma del webhook de Stripe utilizando Web Crypto en el Edge
 */
async function verifyStripeSignature(payloadText, signatureHeader, webhookSecret) {
  if (!signatureHeader || !webhookSecret) return true; // Si no hay secreto configurado en entorno local

  try {
    const signatureParts = signatureHeader.split(",").reduce((acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {});

    const timestamp = signatureParts.t;
    const expectedSignature = signatureParts.v1;
    if (!timestamp || !expectedSignature) return false;

    // Verificar tolerancia de tiempo (5 minutos)
    const timestampMs = parseInt(timestamp, 10) * 1000;
    if (Math.abs(Date.now() - timestampMs) > 300000) {
      return false;
    }

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signedPayload = enc.encode(`${timestamp}.${payloadText}`);
    const signatureBytes = await crypto.subtle.sign("HMAC", key, signedPayload);
    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return computedSignature === expectedSignature;
  } catch {
    return false;
  }
}

export async function handleStripeWebhook(request, env) {
  const bodyText = await request.text();
  const signatureHeader = request.headers.get("stripe-signature") || "";
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET || "";

  // 1. Verificación de firma criptográfica
  const isValidSignature = await verifyStripeSignature(bodyText, signatureHeader, webhookSecret);
  if (!isValidSignature) {
    return new Response(JSON.stringify({ error: "Firma de webhook inválida o expirada" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  let event;
  try {
    event = JSON.parse(bodyText);
  } catch {
    return new Response(JSON.stringify({ error: "Payload JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Aprovisionamiento automatizado de Tenant de Autorización
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    const customerName = (session.customer_details?.name || "Corporate Workload Tenant").trim();

    if (!customerEmail) {
      return new Response(JSON.stringify({ error: "No se localizó el correo corporativo en la sesión" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const tenantId = `tenant_${crypto.randomUUID().slice(0, 8)}`;
    const apiKey = `sk_saare_live_${crypto.randomUUID().replace(/-/g, '')}`;
    const isEnterprise = (session.amount_total || 0) >= 29900;

    const tenantRecord = {
      tenantId,
      ownerEmail: customerEmail,
      name: customerName,
      companyName: customerName,
      apiKey,
      token: apiKey,
      status: "ACTIVE",
      role: "CISO",
      licenseType: isEnterprise ? "ENTERPRISE_EXECUTION_RUNTIME" : "DEVELOPER_RUNTIME_SEAT",
      plan: isEnterprise ? "ENTERPRISE_RUNTIME" : "DEVELOPER_USAGE",
      quota: isEnterprise ? 10000000 : 1000000,
      usedQuota: 0,
      protocol: "SGP_1.0",
      activeScenarios: [
        "cumplimiento_corporativo_integral",
        "razonamiento_activo_l7",
        "deepfake_fake_disprover",
        "auditoria_dictamen_normativo",
        "subvenciones_requisitos_infranqueables"
      ],
      createdAt: new Date().toISOString()
    };

    // 3. Persistencia atómica en Cloudflare KV
    if (env.SAARE_VAULT_KV) {
      // Registro de identidad de usuario / CISO
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      // Registro de configuración del Tenant
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
      // Índice de clave API para validación directa en proxy / gateway
      await env.SAARE_VAULT_KV.put(`apikey:${apiKey}`, JSON.stringify({
        tenantId,
        ownerEmail: customerEmail,
        agentId: "primary-workload-agent",
        status: "ACTIVE"
      }));
    }

    return new Response(JSON.stringify({
      status: "PROVISIONED",
      tenantId,
      email: customerEmail,
      protocol: "SGP_1.0",
      license: tenantRecord.licenseType
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ status: "IGNORED", eventType: event.type }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}