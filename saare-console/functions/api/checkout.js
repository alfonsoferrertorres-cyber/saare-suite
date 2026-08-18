export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { seats, plan, totalAmount, email, companyName, cif } = data;

    // Validación básica de parámetros
    const quantity = parseInt(seats) || 1;
    const finalPrice = parseFloat(totalAmount) || (quantity * (plan === 'annual' ? 72 : 108));

    // Retornar URL de pago dinámica (Stripe Checkout / Redsys)
    // Puedes inyectar STRIPE_SECRET_KEY en las variables de entorno de Cloudflare
    return new Response(JSON.stringify({
      success: true,
      orderId: `SAARE-${Date.now()}`,
      seats: quantity,
      totalAmount: finalPrice,
      currency: "EUR",
      // Si usas Stripe Payment Link con cantidad dinámica:
      checkoutUrl: `https://buy.stripe.com/TU_ENLACE_BASE?quantity=${quantity}&client_reference_id=${encodeURIComponent(cif || 'B2B')}&prefilled_email=${encodeURIComponent(email || '')}`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
