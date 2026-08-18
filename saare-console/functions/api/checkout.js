export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Obtener parámetros de la URL o del cuerpo de la petición
  let seats = url.searchParams.get("seats") || "1";
  let amount = url.searchParams.get("amount") || "72.00";
  let email = url.searchParams.get("email") || "";
  let company = url.searchParams.get("company") || "";

  if (context.request.method === "POST") {
    try {
      const body = await context.request.json();
      seats = body.seats || seats;
      amount = body.totalAmount || amount;
      email = body.email || email;
      company = body.companyName || company;
    } catch (e) {}
  }

  const quantity = parseInt(seats) || 1;

  // URL de Pasarela Stripe Checkout con cantidad de asientos dinámica
  // Sustituye TU_PAYMENT_LINK por tu enlace de Stripe (ej: https://buy.stripe.com/...)
  const stripePaymentLink = `https://buy.stripe.com/TU_PAYMENT_LINK?quantity=${quantity}&client_reference_id=${encodeURIComponent(company || 'B2B')}&prefilled_email=${encodeURIComponent(email)}`;

  // Redireccionar al usuario directamente a la pasarela de pago segura
  return Response.redirect(stripePaymentLink, 302);
}
