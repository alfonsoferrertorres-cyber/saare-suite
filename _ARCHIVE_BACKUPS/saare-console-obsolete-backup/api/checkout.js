import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;

  // Cabeceras CORS para permitir la interacción desde la web React
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  try {
    // 1. Validar la Clave Secreta de Stripe desde las variables de entorno de Cloudflare
    const apiKey = env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Falta la variable de entorno STRIPE_SECRET_KEY en Cloudflare.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createSubresourceHTTPClient(), // Optimización nativa para Cloudflare Workers
    });

    // 2. Parsear el cuerpo de la petición (JSON)
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    const priceId = body.priceId || 'price_1U0y94FlwFW4ifPSpmUw7WMV';
    const email = body.email || '';
    const company = body.company || body.empresa || '';
    const mode = body.mode || 'subscription'; // 'subscription' para suscripciones o 'payment' para cobro único

    // 3. Crear la sesión de Checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: mode,
      customer_email: email.trim() !== '' ? email.trim() : undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      custom_fields: [
        {
          key: 'empresa',
          label: { type: 'custom', custom: 'Nombre de la Empresa / Organización' },
          type: 'text',
          optional: false,
        },
      ],
      metadata: {
        company: company,
        source: 'SAARE_PLATFORM_CLOUDFLARE',
      },
      success_url: `https://www.saare.es/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.saare.es/pricing?canceled=true`,
    });

    // 4. Devolver la URL de la sesión
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en Cloudflare Function Stripe Checkout:', error);
    return new Response(
      JSON.stringify({ error: 'Error al iniciar Stripe Checkout', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Manejador para pre-flight CORS (OPTIONS)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}