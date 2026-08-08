import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utiliza POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Body ya parseado o no es JSON válido
      }
    }
    body = body || {};

    const priceId = body.priceId || 'price_1U0y94FlwFW4ifPSpmUw7WMV';
    const email = body.email || '';
    const company = body.company || body.empresa || '';

    // Creación de la sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
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
      },
      success_url: `https://www.saare.es/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.saare.es/pricing?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creando sesión de Stripe Checkout:', error);
    return res.status(500).json({ error: 'Fallo al iniciar Checkout', details: error.message });
  }
}