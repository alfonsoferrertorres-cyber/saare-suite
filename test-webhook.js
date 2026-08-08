import http from 'node:http';
import { Resend } from 'resend';
import fs from 'node:fs';
import path from 'node:path';

// Configuración de credenciales desde variables de entorno para evitar fuga de secretos
const resend = new Resend(process.env.RESEND_API_KEY);
const DESTINATION_EMAIL = 'alfonsoferrertorres@gmail.com'; // Tu correo donde recibes los avisos
const SENDER_EMAIL = 'SAARE Platform <legal@saare.es>';   // El remitente oficial desde tu dominio verificado

const PORT = process.env.PORT || 8080;

// Helper: Generador de Token Efímero de Evaluación (14 días de validez)
function generateEvalToken(company) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 14);
  const payload = {
    company: company,
    type: "EVALUATION_SANDBOX",
    exp: expires.toISOString()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

const server = http.createServer((req, res) => {
  // Cabeceras CORS para comunicación con el Frontend (Vite/Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejo de peticiones preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }

      // Endpoint de captura de Leads y emisión de Sandbox
      if (req.url === '/api/v1/leads') {
        console.log('\n[SAARE LEADS] Solicitud de Arquitectura Recibida:');
        console.log(JSON.stringify(parsedBody, null, 2));

        // Extracción de campos del formulario
        const name = parsedBody.name || 'Enterprise Client';
        const email = parsedBody.email || 'Sin especificar';
        const company = parsedBody.company || 'Sin especificar';
        const role = parsedBody.role || 'Sin especificar';
        const environment = parsedBody.environment || parsedBody.env || 'Sin especificar';
        const useCase = parsedBody.useCase || 'Sin especificar';
        const type = parsedBody.type === 'oem' ? 'OEM / ISV Integration' : 'Enterprise Deployment';
        
        const complianceNeeds = Array.isArray(parsedBody.complianceNeeds) && parsedBody.complianceNeeds.length > 0
          ? parsedBody.complianceNeeds.join(', ')
          : 'None Specified';

        // Generar Token Efímero de Evaluación y comando de despliegue
        const evalToken = generateEvalToken(company);
        const dockerDeployCmd = `docker run -d -p 8080:8080 -e SAARE_EVAL_KEY="${evalToken}" ghcr.io/alfonsoferrertorres-cyber/saare-sidecar:latest`;

        // 1. Guardar el Lead localmente en un archivo JSON de respaldo
        try {
          const leadRecord = {
            timestamp: new Date().toISOString(),
            name,
            email,
            company,
            role,
            environment,
            useCase,
            complianceNeeds,
            type,
            evalToken
          };
          fs.appendFileSync(path.resolve('./leads_log.json'), JSON.stringify(leadRecord) + '\n', 'utf8');
          console.log('[LOG LOCAL] Lead y Token de Evaluación registrados en leads_log.json');
        } catch (fileErr) {
          console.error('[ERROR LOG LOCAL]', fileErr.message);
        }

        // 2. Notificación interna para tu correo personal
        try {
          await resend.emails.send({
            from: SENDER_EMAIL,
            to: [DESTINATION_EMAIL],
            subject: `[SAARE Lead] New Request: ${name} (${company})`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #ffffff;">
                <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #C5A059; padding-bottom: 8px;">Nueva Solicitud de Arquitectura (Self-Service)</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                  <tr><td style="padding: 6px 0; font-weight: bold; width: 40%;">Nombre Completo:</td><td>${name}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Empresa / Organización:</td><td>${company}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Email Corporativo:</td><td><a href="mailto:${email}" style="color: #0284c7;">${email}</a></td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Rol / Función:</td><td>${role}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Entorno Objetivo:</td><td>${environment}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Caso de Uso Principal:</td><td>${useCase}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Marcos Normativos:</td><td>${complianceNeeds}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Perfil de Solicitud:</td><td><span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">${type}</span></td></tr>
                  <tr><td style="padding: 6px 0; font-weight: bold;">Eval Token:</td><td><code style="font-size: 11px;">${evalToken}</code></td></tr>
                </table>

                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 11px; color: #64748b; margin: 0;">Notificación automática enviada desde SAARE Platform Backend.</p>
              </div>
            `
          });
          console.log(`[AVISO INTERNO] Notificación enviada a ${DESTINATION_EMAIL}`);
        } catch (emailError) {
          console.error('[ERROR AVISO INTERNO]', emailError.message);
        }

        // 3. Respuesta automática Autoservicio enviada al cliente (Fase 1 + Fase 2)
        if (email !== 'Sin especificar') {
          try {
            const whitepaperPath = path.resolve('./public/docs/SAARE-Technical-Whitepaper-v14.pdf');
            let attachments = [];

            if (fs.existsSync(whitepaperPath)) {
              attachments.push({
                filename: 'SAARE_Platform_Technical_Whitepaper_v14.pdf',
                content: fs.readFileSync(whitepaperPath)
              });
            }

            await resend.emails.send({
              from: SENDER_EMAIL,
              to: [email],
              subject: 'SAARE Platform — Instant Sandbox & Technical Package',
              html: `
                <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #ffffff;">
                  <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #00f0ff; padding-bottom: 8px;">SAARE Instant Sandbox & Architecture Package</h2>
                  <p>Dear <strong>${name}</strong> (${company}),</p>
                  <p>Thank you for requesting the architecture package for <strong>${environment}</strong>.</p>
                  
                  <p>We have provisioned your automated evaluation environment for <em>${useCase}</em> focusing on <strong>${complianceNeeds}</strong> requirements:</p>

                  <div style="background-color: #0f172a; color: #ffffff; border-radius: 6px; padding: 16px; margin: 16px 0;">
                    <h4 style="margin: 0 0 8px 0; color: #00f0ff;">1. Your 14-Day Evaluation Key</h4>
                    <code style="display: block; background-color: #1e293b; color: #cbd5e1; padding: 8px; border-radius: 4px; font-size: 11px; word-break: break-all; font-family: monospace;">${evalToken}</code>

                    <h4 style="margin: 16px 0 8px 0; color: #00f0ff;">2. Quickstart Docker Deployment</h4>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">Deploy a local test instance to evaluate L7 interception and Ed25519 receipts:</p>
                    <code style="display: block; background-color: #1e293b; color: #00f0ff; padding: 10px; border-radius: 4px; font-size: 12px; font-family: monospace; word-break: break-all;">${dockerDeployCmd}</code>
                  </div>

                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
                    <h4 style="margin: 0 0 4px 0; color: #0f172a;">3. Technical Documentation Package</h4>
                    <p style="margin: 0; font-size: 13px; color: #475569;">The official Technical Architecture Whitepaper is attached to this email for offline audit.</p>
                  </div>

                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #64748b; margin: 0;">
                    MS3V S.A.A.R.E. SL • Enterprise AI Governance Infrastructure<br>
                    For technical inquiries or custom licensing queries, reply directly to this automated email or contact <a href="mailto:legal@saare.es" style="color: #0284c7;">legal@saare.es</a>.
                  </p>
                </div>
              `,
              attachments: attachments
            });

            console.log(`[RESPUESTA CLIENTE] Paquete de Sandbox enviado a ${email} desde ${SENDER_EMAIL}`);
          } catch (clientEmailError) {
            console.error('[ERROR RESPUESTA CLIENTE]', clientEmailError.message);
          }
        }

        // Respuesta HTTP para el Frontend con credenciales inmediatas
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'success', 
          timestamp: new Date().toISOString(),
          sandboxAccess: {
            token: evalToken,
            dockerCommand: dockerDeployCmd
          }
        }));

      } else {
        console.log('\n[SAARE TELEMETRY] Evento L7 Recibido:');
        console.log(JSON.stringify(parsedBody, null, 2));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', timestamp: new Date().toISOString() }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('SAARE Webhook Telemetry & Leads Server Active\n');
  }
});

server.listen(PORT, () => {
  console.log(`\nServidor SAARE escuchando en puerto ${PORT}`);
  console.log(`- Telemetría L7: http://localhost:${PORT}/api/v1/telemetry`);
  console.log(`- Solicitud Leads: http://localhost:${PORT}/api/v1/leads\n`);
});