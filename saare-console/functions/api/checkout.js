export async function onRequest(context) {
  const { request } = context;

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
    params = {
      quantity: url.searchParams.get("quantity") || url.searchParams.get("seats") || 1,
      email: url.searchParams.get("email") || url.searchParams.get("prefilled_email") || "",
      company: url.searchParams.get("company") || url.searchParams.get("client_reference_id") || "SAARE-Master",
      plan: url.searchParams.get("plan") || "anual"
    };
  }

  const quantity = Math.max(1, parseInt(params.quantity || 1, 10));
  const userEmail = params.email ? encodeURIComponent(params.email) : "";
  const companyRef = params.company ? encodeURIComponent(params.company) : "";
  const isAnnual = (params.plan === "anual" || params.plan === "annual");

  // Enlaces directos de Stripe
  const STRIPE_ANUAL_72 = "https://buy.stripe.com/00weVd8XX8Ch0pJ8858g003";
  const STRIPE_MENSUAL_12 = "https://buy.stripe.com/cNiaEX2zz2dTegz2NL8g004";

  const baseLink = isAnnual ? STRIPE_ANUAL_72 : STRIPE_MENSUAL_12;
  const targetUrl = new URL(baseLink);

  targetUrl.searchParams.set("quantity", quantity.toString());
  if (userEmail) targetUrl.searchParams.set("prefilled_email", decodeURIComponent(userEmail));
  if (companyRef) targetUrl.searchParams.set("client_reference_id", decodeURIComponent(companyRef));

  return Response.redirect(targetUrl.toString(), 302);
}
