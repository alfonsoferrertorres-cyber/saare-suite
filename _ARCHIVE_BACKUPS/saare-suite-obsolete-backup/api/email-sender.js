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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utiliza POST.' });
  }

  if (!resend) {
    console.error('ALERTA: Variable RESEND_API_KEY no encontrada en el entorno.');
    return res.status(500).json({ error: 'El servicio de envío de e-mail no está configurado.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { to, subject, html, text, attachments } = body || {};

    if (!to) {
      return res.status(400).json({ error: 'El parámetro "to" es obligatorio.' });
    }

    const sender = process.env.EMAIL_FROM || 'SAARE Licensing <licensing@saare.es>';

    const response = await resend.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject: subject || 'Notificación SAARE Platform',
      html: html || `<p>${text || 'Mensaje de SAARE Platform'}</p>`,
      attachments: attachments || [],
    });

    if (response.error) {
      console.error('Error de Resend:', response.error);
      return res.status(400).json({ error: response.error.message });
    }

    return res.status(200).json({
      success: true,
      id: response.data?.id || 'sent',
    });
  } catch (error) {
    console.error('Error en /api/email-sender:', error);
    return res.status(500).json({
      error: 'Error interno enviando el email.',
      details: error.message,
    });
  }
}