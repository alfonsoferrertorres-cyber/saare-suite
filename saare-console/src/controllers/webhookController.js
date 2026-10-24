// control-plane/src/controllers/webhookController.js
import { tenantManager } from '../services/tenantManager.js';
import { keyManager } from '../services/keyManager.js';
import { sendOnboardingEmail } from '../services/resendMailer.js';

export async function handleStripeWebhook(req, res) {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const clientEmail = session.customer_details.email;
    const clientName = session.customer_details.name || 'Empresa B2B';
    const planType = session.metadata.plan_type || 'TRIAL_7DIAS';

    console.log(`⚡ Aprovisionando automáticamente a: ${clientName} (${clientEmail})`);

    // 1. Crear Inquilino/Tenant
    const tenant = await tenantManager.createTenant({
      name: clientName,
      email: clientEmail,
      plan: planType
    });

    // 2. Generar Licencia y Firma Criptográfica
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
      downloadUrl: `https://api.saare.es/v1/deploy/download?token=${tenant.downloadToken}`
    });

    return res.status(200).json({ status: 'PROVISIONED_SUCCESSFULLY' });
  }

  res.status(200).send('Event received');
}