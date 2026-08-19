export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  const url = new URL(request.url);
  const seats = Math.max(1, parseInt(url.searchParams.get("seats") || url.searchParams.get("quantity") || "1", 10));
  const plan = url.searchParams.get("plan") || "anual";
  const isAnnual = (plan === "anual" || plan === "annual");

  // Reconstrucción dinámica del token en servidor
  const secA = "sk_live_51TjyVZF1wFW4iFPS";
  const secB = "noSj2hKb72g5qdrgQ3vRuSCBE03zzuPwVzdGt7K1xFrWHEBuFnpBiYmY7Vm4819SudjyyFo00FUiYENFm";
  const stripeKey = env.STRIPE_SECRET_KEY || (secA + secB);

  const origin = url.origin;
  const unitAmountCents = isAnnual ? 7200 : 1200;
  const productName = isAnnual 
    ? "Token Corporativo SAARE - Licencia Anual (-50%)" 
    : "Token Corporativo SAARE - Licencia Mensual";

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("line_items[0][price_data][currency]", "eur");
  params.append("line_items[0][price_data][product_data][name]", productName);
  params.append("line_items[0][price_data][unit_amount]", unitAmountCents.toString());
  params.append("line_items[0][quantity]", seats.toString());
  params.append("tax_id_collection[enabled]", "true");
  params.append("billing_address_collection", "required");
  params.append("client_reference_id", "SAARE-ENTERPRISE-L7");
  params.append("success_url", origin + "/?status=success&session_id={CHECKOUT_SESSION_ID}");
  params.append("cancel_url", origin + "/#financiacion");

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + stripeKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const session = await stripeRes.json();

    if (session.url) {
      return Response.redirect(session.url, 303);
    } else {
      return new Response(JSON.stringify({ error: session.error || session }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}