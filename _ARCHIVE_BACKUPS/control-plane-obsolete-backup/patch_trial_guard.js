const fs = require('fs');
const path = 'server.js';
let content = fs.readFileSync(path, 'utf8');

// Inyectar base de datos en memoria para emails reclamados
if (!content.includes('claimedEmails')) {
  const insertIndex = content.indexOf('const app = express();');
  content = content.slice(0, insertIndex) + 'const claimedEmails = new Set();\n' + content.slice(insertIndex);
}

// Inyectar middleware de verificación de duplicados
const validationSnippet = \
  if (req.body.type === 'EVALUATION_TRIAL') {
    const email = (req.body.email || '').toLowerCase().trim();
    if (claimedEmails.has(email)) {
      console.log('[Control Plane] BLOQUEADO: Intento de reutilización de token de prueba para:', email);
      return res.status(400).json({ success: false, error: 'Este correo corporativo ya ha consumido su periodo de prueba ilimitado.' });
    }
    claimedEmails.add(email);
  }
\;

if (!content.includes('claimedEmails.has(email)')) {
  content = content.replace("app.post('/api/runtime/deploy', (req, res) => {", "app.post('/api/runtime/deploy', (req, res) => {" + validationSnippet);
}

fs.writeFileSync(path, content, 'utf8');
console.log('? Guard de seguridad contra emails duplicados inyectado en Control Plane');
