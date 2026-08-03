import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido.' });
    }

    try {
        const { empresa, email, duration_days = 15, modules = ['*'] } = req.body;

        if (!empresa || !email) {
            return res.status(400).json({ error: 'Empresa e email son obligatorios.' });
        }

        // Control Anti-Abuso (Rate Limiting por Dominio)
        if (redis) {
            const domain = email.split('@')[1] || email;
            const rateLimitKey = 'trial_limit:' + domain.toLowerCase();
            const existingRequest = await redis.get(rateLimitKey);

            if (existingRequest) {
                return res.status(429).json({
                    error: 'Límite alcanzado',
                    details: 'Ya se ha emitido una licencia de prueba para este dominio en los últimos 30 días.'
                });
            }

            await redis.set(rateLimitKey, Date.now(), { ex: 2592000 });
        }

        // Cálculo de Expiración (Epoch Unix)
        const expirationEpoch = Math.floor(Date.now() / 1000) + (duration_days * 86400);
        const moduleList = Array.isArray(modules) ? modules.join(',') : modules;

        // Generación del Payload y Firma HMAC
        const payload = empresa + '|' + expirationEpoch + '|' + moduleList;
        const secretKey = process.env.SAARE_SECRET_KEY || 'SAARE_ENTERPRISE_SECRET_KEY_2026';
        const signature = crypto.createHmac('sha256', secretKey)
                                .update(payload)
                                .digest('hex')
                                .substring(0, 16);

        const licenseKey = payload + '.' + signature;

        // Envío por Email Transaccional con Resend
        let emailSent = false;
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'MS3V S.A.A.R.E. Licensing <licensing@saare.es>',
                to: [email],
                subject: 'Licencia de Evaluación S.A.A.R.E. ISV Suite v4.2 - ' + empresa,
                html: '<h2>S.A.A.R.E. ISV Suite v4.2 Enterprise</h2>' +
                      '<p>Estimado equipo de <strong>' + empresa + '</strong>,</p>' +
                      '<p>Adjunto encontrarás tu archivo de licencia <code>saare.lic</code> válido por ' + duration_days + ' días.</p>' +
                      '<hr><p>Soporte técnico: <a href="mailto:support@saare.es">support@saare.es</a></p>',
                attachments: [
                    {
                        filename: 'saare.lic',
                        content: Buffer.from(licenseKey, 'utf-8'),
                    },
                ],
            });
            emailSent = true;
        }

        // Notificación automática a Slack
        if (process.env.SLACK_WEBHOOK_URL) {
            await fetch(process.env.SLACK_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: '🚀 *Nueva Licencia de Evaluación Emitida*\n' +
                          '• *Empresa:* ' + empresa + '\n' +
                          '• *Email:* ' + email + '\n' +
                          '• *Duración:* ' + duration_days + ' días\n' +
                          '• *Licencia:* `' + licenseKey + '`'
                })
            });
        }

        return res.status(200).json({
            success: true,
            tenant_id: empresa,
            expires_at: expirationEpoch,
            license_key: licenseKey,
            email_sent: emailSent
        });

    } catch (error) {
        console.error('Error en /api/trial:', error);
        return res.status(500).json({ error: 'Error interno generando la licencia.', details: error.message });
    }
}