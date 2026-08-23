// Webhook Stripe -> Cloudflare KV Provisioning
export async function handleStripeWebhook(request, env) {
  const signature = request.headers.get("Stripe-Signature");
  const bodyText = await request.text();
  
  // Procesamiento del payload
  let event;
  try {
    event = JSON.parse(bodyText);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = (session.customer_details?.email || session.customer_email || "").toLowerCase().trim();
    const customerName = session.customer_details?.name || "Organización Suscrita";
    const tenantId = `tenant_${crypto.randomUUID().slice(0, 8)}`;

    const tenantRecord = {
      tenantId,
      customerEmail,
      companyName: customerName,
      status: "ACTIVE",
      plan: session.amount_total === 29900 ? "ENTERPRISE" : "PRO",
      createdAt: new Date().toISOString()
    };

    // Guardar en KV
    if (env.SAARE_VAULT_KV) {
      await env.SAARE_VAULT_KV.put(`user:${customerEmail}`, JSON.stringify(tenantRecord));
      await env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantRecord));
    }

    return new Response(JSON.stringify({ status: "PROVISIONED", tenantId }), { status: 200 });
  }

  return new Response(JSON.stringify({ status: "IGNORED" }), { status: 200 });
}
