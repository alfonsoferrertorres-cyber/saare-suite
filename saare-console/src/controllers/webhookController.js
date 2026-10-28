// control-plane/src/controllers/webhookController.js
import Stripe from 'stripe';
import { tenantManager } from '../services/tenantManager.js';
import { keyManager } from '../services/keyManager.js';
import { sendOnboardingEmail } from '../services/resendMailer.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  // 1. Verificación obligatoria de firma criptográfica de Stripe (Prevención de Suplantación)
  try {
    if (!endpointSecret || !sig) {
      throw new Error('Falta el encabezado stripe-signature o la variable STRIPE_WEBHOOK_SECRET');
    }
    // Nota: Requiere que req.body sea el Buffer raw de la petición (express.raw({type: 'application/json'}))
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Fallo en la firma del Webhook de Stripe: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Procesamiento de eventos autorizados
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const clientEmail = session.customer_details?.email;
    const clientName = session.customer_details?.name || 'Empresa B2B';
    const planType = session.metadata?.plan_type || 'TRIAL_7DIAS';

    if (!clientEmail) {
      console.error('❌ Error: La sesión del checkout no contiene el email del cliente.');
      return res.status(200).json({ status: 'SKIPPED_MISSING_EMAIL' });
    }

    console.log(`⚡ Aprovisionando automáticamente a: ${clientName} (${clientEmail})`);

    try {
      // 1. Crear o recuperar Tenant (Idempotencia)
      const tenant = await tenantManager.getOrCreateTenant({
        name: clientName,
        email: clientEmail,
        plan: planType,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription
      });

      // 2. Generar Licencia y Firma Criptográfica Ed25519
      const license = await keyManager.generateSignedLicense({
        tenantId: tenant.id,
        issuedTo: clientName,
        expiresInDays: planType === 'TRIAL_7DIAS' ? 7 : 365
      });

      // 3. Enviar correo con credenciales y paquete de descarga
      await sendOnboardingEmail({
        to: clientEmail,
        clientName: clientName,
        licenseKey: license.rawKey,
        downloadUrl: `https://api.saare.es/api/v1/deploy/download?token=${tenant.downloadToken}`
      });

      return res.status(200).json({ status: 'PROVISIONED_SUCCESSFULLY', tenantId: tenant.id });
    } catch (error) {
      console.error(`❌ Fallo crítico en aprovisionamiento de ${clientEmail}:`, error);
      // Retorna 500 para que Stripe vuelva a reintentar la entrega del webhook automáticamente
      return res.status(500).json({ error: 'PROVISIONING_FAILED', details: error.message });
    }
  }

  return res.status(200).send('Event received');
}