import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Dominios públicos no permitidos (Gated Corporate Lead Magnet)
const FORBIDDEN_DOMAINS = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'protonmail.com'];

export default async function handler(req, res) {
  // 1. Configuración Completa de Cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
      } catch (e) {}
    }
    body = body || {};

    // Saneamiento de variables
    const empresa = String(body.empresa || body.company || body.nombre || 'Evaluador S.A.A.R.E.').trim();
    const email = String(body.email || body.correo || '').trim().toLowerCase();
    
    // 30 Días por defecto para el SAARE Discovery Program
    const duration_days = Number(body.duration_days || body.durationDays || 30);
    
    if (!email) {
      return res.status(400).json({ error: 'El parámetro email es obligatorio.' });
    }

    // 2. Validación de Dominio Corporativo (Gated Access B2B)
    const domain = email.split('@')[1];
    if (!domain || FORBIDDEN_DOMAINS.includes(domain)) {
      return res.status(400).json({ 
        error: 'Se requiere un correo corporativo de empresa para activar la evaluación de SAARE Platform.' 
      });
    }

    // Módulos y Presets por defecto: Active Shield + DeepFakeShield
    const defaultModules = '01_perimetershield,09_deepfakeshield';
    const defaultPresets = 'banking-shield,kyc-biometric-anti-spoofing';

    const moduleList = (Array.isArray(body.modules) ? body.modules.join(',') : String(body.modules || defaultModules)).trim();
    const presetList = (Array.isArray(body.presets) ? body.presets.join(',') : String(body.presets || defaultPresets)).trim();

    // 3. Control Anti-Abuso con Redis (Aislado por Dominio)
    if (redis) {
      try {
        const rateLimitKey = `trial_limit:${domain}`;
        const existingRequest = await redis.get(rateLimitKey);

        if (existingRequest && !body.force) {
          return res.status(429).json({ 
            error: 'Ya existe una licencia de evaluación emitida para este dominio corporativo.' 
          });
        }

        // Registrar bloqueo temporal de 30 días (2,592,000 segundos)
        await redis.set(rateLimitKey, Date.now(), { ex: 2592000 });
      } catch (redisErr) {
        console.error('Error no bloqueante en Redis:', redisErr.message);
      }
    }

    // 4. Cálculo de Expiración (Epoch Unix)
    const expirationEpoch = Math.floor(Date.now() / 1000) + (duration_days * 86400);

    // 5. Estructura y Firma Ed25519
    const payload = `${empresa}|${expirationEpoch}|${moduleList}|${presetList}`;
    
    const privateKeyRaw = process.env.SAARE_PRIVATE_KEY;
    if (!privateKeyRaw) {
      console.error("ALERTA CRÍTICA: Falta SAARE_PRIVATE_KEY en Vercel.");
      return res.status(500).json({ error: 'Configuración de servidor incompleta (Falta Clave Privada).' });
    }

    // Normalización robusta de clave PEM PKCS#8
    const formattedKey = privateKeyRaw.includes('-----BEGIN')
      ? privateKeyRaw.replace(/\\n/g, '\n')
      : `-----BEGIN PRIVATE KEY-----\n${privateKeyRaw.replace(/\\n/g, '\n')}\n-----END PRIVATE KEY-----`;

    const privateKey = crypto.createPrivateKey({
      key: formattedKey,
      format: 'pem',
      type: 'pkcs8'
    });
    
    const signatureBuffer = crypto.sign(null, Buffer.from(payload, 'utf8'), privateKey);
    const signatureHex = signatureBuffer.toString('hex');

    // Ensamblaje final de la licencia
    const licenseKey = `${payload}|${signatureHex}`;

    // 6. Envío de Email con Resend
    let emailSent = false;
    if (resend) {
      try {
        const sender = process.env.EMAIL_FROM || 'SAARE Licensing <licensing@saare.es>';
        await resend.emails.send({
          from: sender,
          to: [email],
          subject: `Licencia SAARE Discovery Program (${duration_days} Días) - ${empresa}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 8px;">SAARE Platform — Discovery Program</h2>
              <p>Estimado equipo de <strong>${empresa}</strong>,</p>
              <p>Adjunto encontrarás tu archivo de licencia de evaluación <code>saare.lic</code>, válido por <strong>${duration_days} días</strong>.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0 0 6px 0;"><strong>Capacidades Activas:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>Active Shield:</strong> Protección L7 contra prompt injections y filtrado DLP de PII/IBANs en RAM.</li>
                  <li><strong>DeepFakeShield:</strong> Verificación biométrica KYC y autenticación C2PA de medios sintéticos.</li>
                </ul>
              </div>

              <p><strong>Siguientes Pasos:</strong></p>
              <ol>
                <li>Descarga el archivo <code>saare.lic</code> adjunto.</li>
                <li>Sitúalo en el directorio de tu contenedor local o sidecar.</li>
                <li>Inicia el escaneo perimetral para generar tu <strong>AI Governance Score</strong>.</li>
              </ol>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #64748b;">
                Soporte técnico y solicitudes de revisión de arquitectura: <a href="mailto:support@saare.es" style="color: #0284c7;">support@saare.es</a> | MS3V S.A.A.R.E. SL
              </p>
            </div>
          `,
          attachments: [
            {
              filename: 'saare.lic',
              content: Buffer.from(licenseKey, 'utf-8').toString('base64'),
            },
          ],
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Error no bloqueante enviando email con Resend:', mailErr.message);
      }
    }

    // 7. Notificación a Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: '🚀 *Nueva Licencia Discovery Emitida*\n' +
                  '• *Empresa:* ' + empresa + '\n' +
                  '• *Email:* ' + email + '\n' +
                  '• *Duración:* ' + duration_days + ' días\n' +
                  '• *Módulos:* `' + moduleList + '`'
          })
        });
      } catch (slackErr) {
        console.error('Error no bloqueante notificando a Slack:', slackErr.message);
      }
    }

    // Respuesta Exitosa
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