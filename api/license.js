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

  // Manejo de Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Healthcheck Endpoint
  if (req.method === 'GET') {
    return res.status(200).send('SAARE Enterprise Discovery API Active');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        payload = {};
      }
    }
    payload = payload || {};

    const governanceProfile = {
      environmentType: payload.deploymentModel || payload.environment || payload.env || 'Hybrid Enterprise AI',
      governanceMaturity: 'Developing',
      exposureAreas: [
        'Runtime Policy Enforcement',
        'AI Agent & MCP Boundary Control',
        'Auditable Evidence Logging',
        'Sensitive Data Exposure (DLP)'
      ]
    };

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const discoveryToken = Buffer.from(JSON.stringify({
      company: payload.company || 'Enterprise Client',
      program: 'SAARE_DISCOVERY_PROGRAM',
      nodes: 5,
      exp: expires.toISOString()
    })).toString('base64');

    // Despacho de correo transaccional vía Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'SAARE Leads <legal@saare.es>',
          to: ['alfonsoferrertorres@gmail.com'],
          subject: `🚀 [NUEVO LEAD] ${payload.company || 'Empresa'} - ${payload.name || 'Cliente'}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 24px; border-radius: 8px;">
              <h2 style="color: #06b6d4; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 0;">
                Nueva Solicitud de Arquitectura / Lead Recibido
              </h2>
              <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 8px; color: #94a3b8; width: 35%;">Nombre Completo:</td><td style="padding: 8px; color: #fff;"><b>${payload.name || 'N/A'}</b></td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Empresa / Organización:</td><td style="padding: 8px; color: #fff;"><b>${payload.company || 'N/A'}</b></td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Email Corporativo:</td><td style="padding: 8px; color: #38bdf8;"><b>${payload.email || 'N/A'}</b></td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Rol / Cargo:</td><td style="padding: 8px; color: #fff;">${payload.role || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Entorno (Target):</td><td style="padding: 8px; color: #fbbf24;">${payload.deploymentModel || payload.environment || payload.env || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Carga de Trabajo (Workload):</td><td style="padding: 8px; color: #fff;">${payload.workload || payload.useCase || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Normativas Requeridas:</td><td style="padding: 8px; color: #34d399;">${Array.isArray(payload.frameworks) ? payload.frameworks.join(', ') : (Array.isArray(payload.complianceNeeds) ? payload.complianceNeeds.join(', ') : 'EU AI Act')}</td></tr>
              </table>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('❌ Error no bloqueante enviando email:', mailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      status: 'success',
      profile: governanceProfile,
      discoveryToken,
      message: 'Governance Profile Generated'
    });

  } catch (err) {
    console.error('❌ Error procesando solicitud:', err.message);
    return res.status(400).json({ status: 'error', message: 'Invalid JSON Payload' });
  }
}