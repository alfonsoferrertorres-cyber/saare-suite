import Stripe from 'stripe';
import { Resend } from 'resend';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Mapeo oficial de Price IDs de Stripe a los 4 Pilares de SAARE Platform
const PRICE_TIER_MAP = {
  // Test Tier (0.50€)
  'price_1U0y94FlwFW4ifPSpmUw7WMV': {
    preset_id: 'PRESET_TIER1_GATEWAY',
    tier_name: 'SAARE Platform - Cloud Security Gateway (Test)',
    max_nodes: 10,
    allowed_modules: [
      '01_perimetershield',  // Active Shield
      '03_compliancesuite',  // Compliance Center
      '05_tokenmatrix'       // Token Smart Router
    ]
  },
  // Tier 1: Cloud & Sidecar Gateway (15,000€/año)
  'price_1U0zYCFlwFW4ifPSZwysl3al': {
    preset_id: 'PRESET_TIER1_GATEWAY',
    tier_name: 'SAARE Platform - Cloud Security Gateway',
    max_nodes: 10,
    allowed_modules: [
      '01_perimetershield',  // Active Shield
      '03_compliancesuite',  // Compliance Center
      '05_tokenmatrix'       // Token Smart Router
    ]
  },
  // Tier 2: Embedded Native Engine (42,000€/año)
  'price_1U0zYIFlwFW4ifPS4FmGkGz2': {
    preset_id: 'PRESET_TIER2_EMBEDDED',
    tier_name: 'SAARE Platform - Embedded Native Engine',
    format: 'dll_so',
    allowed_modules: [
      '01_perimetershield', '02_evidencevault', '03_compliancesuite',
      '04_sovereignty_node', '05_tokenmatrix', '06_labengine', '09_deepfakeshield'
    ]
  },
  // Tier 3: Whitelabel OEM Partner (Custom / Revenue Share)
  'personalizado': {
    preset_id: 'PRESET_TIER3_OEM_WHITELABEL',
    tier_name: 'SAARE Platform - Whitelabel OEM Partner',
    allowed_modules: [
      '01_perimetershield', '02_evidencevault', '03_compliancesuite',
      '04_sovereignty_node', '05_tokenmatrix', '06_labengine',
      '07_edututorguard', '08_authorvault', '09_deepfakeshield'
    ]
  }
};

// Helper para convertir el Stream entrante en Búfer para la verificación de Stripe
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  // 1. Validar la firma criptográfica del Webhook de Stripe
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Error validando Webhook de Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Procesar el pago completado
  if (event.type === 'checkout.session.completed') {
    const sessionObj = event.data.object;

    let purchasedPriceId = null;
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionObj.id);
      purchasedPriceId = lineItems.data?.[0]?.price?.id;
    } catch (e) {
      console.warn('Error obteniendo line_items de Stripe:', e.message);
    }

    const customerEmail = sessionObj.customer_details?.email || 'legal@saare.es';
    const empresaName = String(
      sessionObj.custom_fields?.find((f) => f.key === 'empresa')?.text?.value ||
      sessionObj.customer_details?.name ||
      'Cliente_Enterprise'
    ).trim();

    const tierConfig = (purchasedPriceId && PRICE_TIER_MAP[purchasedPriceId]) 
      ? PRICE_TIER_MAP[purchasedPriceId] 
      : PRICE_TIER_MAP['personalizado'];

    // Período de validez: 1 año de licencia comercial
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setFullYear(now.getFullYear() + 1);

    const payload = {
      client_id: empresaName,
      preset_id: tierConfig.preset_id,
      issued_at: now.toISOString(),
      expires_at: expirationDate.toISOString(),
      allowed_modules: tierConfig.allowed_modules,
      ...(tierConfig.max_nodes && { max_nodes: tierConfig.max_nodes }),
      ...(tierConfig.format && { format: tierConfig.format })
    };

    const privateKeyRaw = process.env.SAARE_PRIVATE_KEY;
    if (!privateKeyRaw) {
      console.error('ALERTA CRÍTICA: Falta la variable SAARE_PRIVATE_KEY en Vercel');
      return res.status(500).json({ error: 'Configuración criptográfica incompleta.' });
    }

    // 3. Generar la firma Ed25519 en formato LicenseGuard
    try {
      // Normalizar saltos de línea para claves almacenadas en variables de entorno Vercel
      const formattedKey = privateKeyRaw.includes('-----BEGIN')
        ? privateKeyRaw.replace(/\\n/g, '\n')
        : `-----BEGIN PRIVATE KEY-----\n${privateKeyRaw.replace(/\\n/g, '\n')}\n-----END PRIVATE KEY-----`;

      const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');

      const privateKey = crypto.createPrivateKey({
        key: formattedKey,
        format: 'pem',
        type: 'pkcs8',
      });

      // Firmar el payload utilizando la clave privada Ed25519
      const signatureBuffer = crypto.sign(null, payloadBytes, privateKey);
      
      // Extraer la clave pública correspondiente en bytes (últimos 32 bytes del SPKI DER)
      const publicKeyObj = crypto.createPublicKey(privateKey);
      const pubKeyDer = publicKeyObj.export({ format: 'der', type: 'spki' });
      const publicKeyBytes = Array.from(pubKeyDer.subarray(-32));

      // Estructura oficial del token saare.lic
      const token = {
        payload,
        signature: Array.from(signatureBuffer),
        public_key: publicKeyBytes,
      };

      const licenseJsonContent = JSON.stringify(token, null, 2);

      // 4. Enviar el correo transaccional vía Resend con la licencia adjunta
      if (process.env.RESEND_API_KEY && customerEmail) {
        const { data, error } = await resend.emails.send({
          from: 'S.A.A.R.E. Licensing <licensing@saare.es>',
          to: [customerEmail],
          subject: `Licencia Comercial SAARE Platform - ${empresaName}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
              <h2 style="color: #0284c7;">¡Gracias por tu suscripción a SAARE Platform!</h2>
              <p>Adjunto encontrarás tu archivo oficial de licencia de producción <code>saare.lic</code>, válida por 1 año.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;"><strong>Titular:</strong></td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${empresaName}</td></tr>
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;"><strong>Plan Activado:</strong></td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${tierConfig.tier_name}</td></tr>
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;"><strong>Módulos Habilitados:</strong></td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${tierConfig.allowed_modules.length} módulos activos</td></tr>
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;"><strong>Expira:</strong></td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${expirationDate.toLocaleDateString('es-ES')}</td></tr>
              </table>
              <hr style="margin-top: 20px; border: 0; border-top: 1px solid #cbd5e1;" />
              <p><small>Este es un correo automático emitido por el departamento de operaciones de MS3V S.A.A.R.E. SL (legal@saare.es).</small></p>
            </div>
          `,
          attachments: [
            {
              filename: 'saare.lic',
              content: Buffer.from(licenseJsonContent, 'utf-8').toString('base64'),
            },
          ],
        });

        if (error) {
          console.error('Error al enviar correo mediante Resend:', error);
          return res.status(500).json({ error: 'Error en servicio de correo', details: error });
        } else {
          console.log('Licencia comercial emitida y enviada con éxito:', data?.id);
        }
      }
    } catch (cryptoErr) {
      console.error('Error criptográfico al firmar licencia:', cryptoErr);
      return res.status(500).json({ error: 'Fallo criptográfico', details: cryptoErr.message });
    }
  }

  return res.status(200).json({ received: true });
}

// Desactivar el Body Parser por defecto de Vercel para permitir la validación de firma de Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};