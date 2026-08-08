import crypto from 'crypto';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export default async function handler(req, res) {
  // Configuración de cabeceras CORS
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

  // GET: Healthcheck / Estado de la API de Licencias
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'SAARE Platform Licensing Engine',
      version: '4.2.0',
      timestamp: new Date().toISOString(),
    });
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
        // Formato ya procesado
      }
    }
    body = body || {};

    const company = String(body.company || body.empresa || body.name || 'Cliente_Enterprise').trim();
    const email = String(body.email || body.correo || '').trim().toLowerCase();
    const tierType = String(body.type || body.tier || 'EVALUATION_SANDBOX').trim();

    if (!email) {
      return res.status(400).json({ error: 'El parámetro email es obligatorio.' });
    }

    // Configuración de validez (14 días para Sandbox / 365 días para Comercial)
    const validDays = tierType === 'EVALUATION_SANDBOX' ? 14 : 365;
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + validDays);

    const payload = {
      company,
      type: tierType,
      issued_at: now.toISOString(),
      expires_at: expirationDate.toISOString(),
      modules: [
        '01_perimetershield',
        '02_evidencevault',
        '03_compliancesuite',
        '04_sovereignty_node',
        '05_tokenmatrix',
        '06_labengine',
        '09_deepfakeshield',
      ],
    };

    const privateKeyRaw = process.env.SAARE_PRIVATE_KEY;
    if (!privateKeyRaw) {
      console.error('ALERTA CRÍTICA: Falta la variable SAARE_PRIVATE_KEY en Vercel');
      return res.status(500).json({ error: 'Configuración criptográfica incompleta en el servidor.' });
    }

    // Normalización de clave privada PEM Ed25519 / PKCS#8
    const formattedKey = privateKeyRaw.includes('-----BEGIN')
      ? privateKeyRaw.replace(/\\n/g, '\n')
      : `-----BEGIN PRIVATE KEY-----\n${privateKeyRaw.replace(/\\n/g, '\n')}\n-----END PRIVATE KEY-----`;

    const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');

    const privateKey = crypto.createPrivateKey({
      key: formattedKey,
      format: 'pem',
      type: 'pkcs8',
    });

    // Firma con clave Ed25519
    const signatureBuffer = crypto.sign(null, payloadBytes, privateKey);

    // Extracción de clave pública en formato de bytes de 32 elementos (SPKI DER)
    const publicKeyObj = crypto.createPublicKey(privateKey);
    const pubKeyDer = publicKeyObj.export({ format: 'der', type: 'spki' });
    const publicKeyBytes = Array.from(pubKeyDer.subarray(-32));

    const licenseObject = {
      payload,
      signature: Array.from(signatureBuffer),
      public_key: publicKeyBytes,
    };

    const licenseJsonContent = JSON.stringify(licenseObject, null, 2);

    // Despacho de email con adjunto saare.lic en Base64 mediante Resend
    let emailSent = false;
    if (resend) {
      try {
        const sender = process.env.EMAIL_FROM || 'SAARE Licensing <licensing@saare.es>';
        await resend.emails.send({
          from: sender,
          to: [email],
          subject: `Licencia SAARE Platform (${tierType}) - ${company}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; max-width: 600px;">
              <h2 style="color: #0284c7;">Emisión de Licencia de Producción</h2>
              <p>Hola team de <strong>${company}</strong>,</p>
              <p>Se ha generado tu clave criptográfica oficial <code>saare.lic</code> para la suite SAARE v4.2.0.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 0;"><strong>Organización:</strong> ${company}</p>
                <p style="margin: 4px 0 0 0;"><strong>Válida hasta:</strong> ${expirationDate.toLocaleDateString('es-ES')}</p>
              </div>

              <p>Por favor, descarga el archivo adjunto y colócalo en la raíz de tu servicio o contenedor Docker.</p>
              <hr style="border: 0; border-top: 1px solid #cbd5e1; margin-top: 20px;" />
              <p style="font-size: 12px; color: #64748b;">MS3V S.A.A.R.E. SL | legal@saare.es</p>
            </div>
          `,
          attachments: [
            {
              filename: 'saare.lic',
              content: Buffer.from(licenseJsonContent, 'utf-8').toString('base64'),
            },
          ],
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Error no bloqueante enviando email:', mailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      company,
      license: licenseObject,
      email_sent: emailSent,
    });
  } catch (error) {
    console.error('Error en /api/license:', error);
    return res.status(500).json({
      error: 'Fallo interno generando la licencia.',
      details: error.message,
    });
  }
}