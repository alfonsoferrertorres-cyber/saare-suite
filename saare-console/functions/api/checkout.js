export async function onRequest(context) {
  const { request } = context;

  // Manejo de CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  const url = new URL(request.url);
  let params = {};

  if (request.method === "POST") {
    try {
      params = await request.json();
    } catch (e) {
      params = {};
    }
  } else {
    // Parámetros por Query String (GET)
    params = {
      quantity: url.searchParams.get("quantity") || url.searchParams.get("seats") || 1,
      email: url.searchParams.get("email") || url.searchParams.get("prefilled_email") || "",
      company: url.searchParams.get("company") || url.searchParams.get("client_reference_id") || "SAARE-Master",
      plan: url.searchParams.get("plan") || "anual"
    };
  }

  const quantity = Math.max(1, parseInt(params.quantity || 1, 10));
  const userEmail = encodeURIComponent(params.email || "");
  const companyRef = encodeURIComponent(params.company || "SAARE-Enterprise");
  const isAnnual = (params.plan === "anual" || params.plan === "annual" || !params.plan);

  // Enlaces de Stripe
  // 1. Enlace Anual (-50%): 72,00 € / asiento / año (6,00 € / mes)
  const STRIPE_LINK_ANUAL = "https://buy.stripe.com/00weVd8XX8Ch0pJ8858g003";
  // 2. Enlace Mensual Regular: 12,00 € / asiento / mes
  const STRIPE_LINK_MENSUAL = "https://buy.stripe.com/00weVd8XX8Ch0pJ8858g003"; 

  const baseStripeLink = isAnnual ? STRIPE_LINK_ANUAL : STRIPE_LINK_MENSUAL;

  const targetUrl = new URL(baseStripeLink);
  targetUrl.searchParams.set("quantity", quantity.toString());
  if (userEmail) targetUrl.searchParams.set("prefilled_email", decodeURIComponent(userEmail));
  if (companyRef) targetUrl.searchParams.set("client_reference_id", decodeURIComponent(companyRef));

  return Response.redirect(targetUrl.toString(), 302);
}
