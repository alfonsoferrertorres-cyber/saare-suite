/**
 * S.A.A.R.E. Stripe Webhook & Automated Tenant Provisioning v10.0 (SGP 1.0)
 * Cloudflare KV Identity & License Provisioning
 */

export async function handleStripeWebhook(request, env) {
  const bodyText = await request.text();

  let event;
  try {
    event = JSON.parse(bodyText);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON Payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 1. Procesamiento de suscripción completada
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    const customerName = (session.customer_details?.name || "Organización Suscrita").trim();
    
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: "No customer email found in session" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const tenantId = `tenant_${crypto.randomUUID().slice(0, 8)}`;
    const apiKey = `sk_saare_live_${crypto.randomUUID().replace(/-/g, '')}`;
    const isEnterprise = session.amount_total >= 29900;

    const tenantRecord = {
      tenantId,
      email: customerEmail,
      tenantName: customerName,
      companyName: customerName,
      apiKey: apiKey,
      token: apiKey,
      status: "ACTIVE",
      role: "AUDITOR PERICIAL",
      licenseType: isEnterprise ? "TIER_ENTERPRISE_AUDITOR" : "ASIENTO_AUDITOR_ACTIVO",
      plan: isEnterprise ? "ENTERPRISE_AUDIT" : "PRO_RUNTIME_SEAT",
      quota: isEnterprise ? 500000 : 100000,
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

    // 2. Persistencia atómica en Cloudflare KV
    if (env.SAARE_VAULT_KV) {
      // Clave indexada por email del usuario
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      // Clave indexada por tenant_id
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
      // Clave indexada por apiKey para validación ultrarrápida en proxy
      await env.SAARE_VAULT_KV.put(`apikey:${apiKey}`, JSON.stringify({
        tenantId,
        email: customerEmail,
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

  return new Response(JSON.stringify({ status: "IGNORED", type: event.type }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}