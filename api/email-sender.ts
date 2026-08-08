import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permitir CORS para peticiones desde el frontend web
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const { email, clientName, companyName, licenseJson } = req.body;

  if (!email || !licenseJson) {
    return res.status(400).json({ 
      error: 'Faltan parámetros obligatorios: email y licenseJson son requeridos.' 
    });
  }

  const recipientName = clientName || 'Cliente Enterprise';
  const company = companyName || 'MS3V S.A.A.R.E. SL';
  const senderAddress = process.env.EMAIL_FROM || 'S.A.A.R.E. Legal <legal@saare.es>';

  try {
    const formattedLicense = typeof licenseJson === 'string' 
      ? licenseJson 
      : JSON.stringify(licenseJson, null, 2);

    const data = await resend.emails.send({
      from: senderAddress,
      to: [email],
      subject: `Licencia Comercial S.A.A.R.E. ISV Suite v4.2 - ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Activación de Licencia S.A.A.R.E. Enterprise</h2>
          <p>Estimado/a <strong>${recipientName}</strong>,</p>
          <p>Adjunto a este correo encontrarás el archivo criptográfico <code>saare.lic</code> correspondiente a la suscripción contratada para <strong>${company}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #0284c7; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #334155;">Instrucciones de integración offline:</p>
            <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
              <li>Guarda el archivo adjunto <code>saare.lic</code> en el directorio de tu aplicación.</li>
              <li>Inicia el motor binario pasando la ruta explícita:</li>
            </ol>
            <code style="display: block; background: #0f172a; color: #38bdf8; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 12px;">
              .\saare-runtime.exe --module "01_perimetershield" --license-file ".\saare.lic"
            </code>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            El archivo cuenta con validación asimétrica Ed25519 e inspección Zero-Disk en memoria RAM.<br>
            Para consultas de cumplimiento o soporte técnico: <a href="mailto:legal@saare.es" style="color: #0284c7;">legal@saare.es</a>.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            MS3V S.A.A.R.E. SL &copy; 2026. Todos los derechos reservados.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'saare.lic',
          content: Buffer.from(formattedLicense, 'utf-8'),
        },
      ],
    });

    return res.status(200).json({ success: true, messageId: data.id });
  } catch (error: any) {
    console.error('Error enviando email via Resend:', error);
    return res.status(500).json({
      error: 'Error en la entrega del correo de licencia.',
      details: error.message,
    });
  }
}