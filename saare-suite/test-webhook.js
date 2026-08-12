import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Resend } from 'resend';

const PORT = process.env.PORT || 8080;
const resend = new Resend(process.env.RESEND_API_KEY);

const server = http.createServer((req, res) => {
  // Encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => { 
      body += chunk.toString(); 
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');

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

        const record = {
          lead: payload,
          profile: governanceProfile,
          discoveryToken,
          createdAt: new Date().toISOString()
        };

        // 1. Guardar copia local en JSON asíncronamente
        const logPath = path.join(process.cwd(), 'leads_log.json');
        let logs = [];
        try {
          const content = await fs.readFile(logPath, 'utf8');
          if (content.trim()) logs = JSON.parse(content);
        } catch {
          // El archivo no existe aún, se creará uno nuevo
        }
        logs.push(record);
        await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

        // 2. Despachar notificación vía Resend API (Esperando resolución antes de responder)
        if (process.env.RESEND_API_KEY) {
          try {
            const emailResponse = await resend.emails.send({
              from: 'SAARE Leads <legal@saare.es>',
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
            console.log('📧 Correo enviado mediante Resend:', emailResponse);
          } catch (resendErr) {
            console.error('❌ Error al enviar email:', resendErr.message);
          }
        }

        // 3. Respuesta JSON limpia
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          profile: governanceProfile,
          discoveryToken,
          message: 'Governance Profile Generated'
        }));

      } catch (err) {
        console.error('❌ Error procesando solicitud:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON Payload' }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SAARE Enterprise Discovery API Active');
  }
});

server.listen(PORT, () => {
  console.log(`Backend activo en http://localhost:${PORT}`);
});