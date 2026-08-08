import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
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
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');

        const governanceProfile = {
          environmentType: payload.deploymentModel || payload.environment || 'Hybrid Enterprise AI',
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

        const logPath = path.join(process.cwd(), 'leads_log.json');
        let logs = [];
        if (fs.existsSync(logPath)) {
          const content = fs.readFileSync(logPath, 'utf8');
          if (content.trim()) logs = JSON.parse(content);
        }
        logs.push(record);
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          profile: governanceProfile,
          discoveryToken,
          message: 'Governance Profile Generated'
        }));

      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SAARE Enterprise Discovery API Active');
  }
});

server.listen(PORT, () => {
  console.log(`Backend de licencias/webhooks activo en http://localhost:${PORT}`);
});
