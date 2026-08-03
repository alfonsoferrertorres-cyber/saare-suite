import Stripe from 'stripe';
import { Resend } from 'resend';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido.' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Validación de la firma del Webhook de Stripe
        const rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Error validando el Webhook de Stripe:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Procesar evento de pago completado
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerEmail = session.customer_details.email;
        const empresaName = session.custom_fields?.find(f => f.key === 'empresa')?.text?.value || session.customer_details.name || 'Cliente_Enterprise';

        // 1. Duración para cliente de pago (ejemplo: 365 días)
        const durationDays = 365;
        const expirationEpoch = Math.floor(Date.now() / 1000) + (durationDays * 86400);

        // 2. Generar token criptográfico comercial
        const payload = `${empresaName}|${expirationEpoch}|*`;
        const secretKey = process.env.SAARE_SECRET_KEY || 'SAARE_ENTERPRISE_SECRET_KEY_2026';
        const signature = crypto.createHmac('sha256', secretKey)
                                .update(payload)
                                .digest('hex')
                                .substring(0, 16);
        const licenseKey = `${payload}.${signature}`;

        // 3. Envío automático por correo con la licencia definitiva de pago
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'MS3V S.A.A.R.E. Licensing <licensing@saare.es>',
                to: [customerEmail],
                subject: `Licencia Comercial S.A.A.R.E. ISV Suite v4.2 - ${empresaName}`,
                html: `
                    <h2>¡Gracias por tu suscripción Enterprise!</h2>
                    <p>Adjunto encontrarás tu licencia comercial de producción <code>saare.lic</code> válida por 1 año.</p>
                    <p><strong>Titular:</strong> ${empresaName}</p>
                    <p><strong>Módulos activos:</strong> Todos los presets (1 al 9)</p>
                `,
                attachments: [
                    {
                        filename: 'saare.lic',
                        content: Buffer.from(licenseKey, 'utf-8'),
                    },
                ],
            });
        }
    }

    return res.status(200).json({ received: true });
}

// Helper para leer el raw body necesario para Stripe
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export const config = {
    api: {
        bodyParser: false, // Desactivar el parseo automático para verificar la firma de Stripe
    },
};