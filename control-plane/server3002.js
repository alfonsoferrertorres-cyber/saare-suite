const http = require("http");
const fs = require("fs");
const path = require("path");

const LOG_DIR = "C:\\MS3V_SAARE_Auditoria";
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const LEDGER_FILE = path.join(LOG_DIR, "saare_enterprise_ledger.jsonl");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") { res.writeHead(200); return res.end(); }

  const url = req.url;

  if (url.includes("scenarios")) {
    res.writeHead(200);
    return res.end(JSON.stringify({
      scenarios: [
        { id: "scen-corp-governance", title: "Cumplimiento Corporativo ES", description: "Protección L7 con bloqueo de PII" },
        { id: "scen-dora-strict", title: "Banca & DORA / PCI-DSS", description: "Perfil estricto entidades financieras" }
      ]
    }));
  }

  if (url.includes("logs")) {
    if (!fs.existsSync(LEDGER_FILE)) return res.end(JSON.stringify({ logs: [] }));
    const lines = fs.readFileSync(LEDGER_FILE, "utf8").trim().split("\n").filter(Boolean);
    const logs = lines.map(line => {
      try {
        const d = JSON.parse(line);
        return {
          id: d.evidenceId || d.id || "EV-LOCAL",
          timestamp: d.timestamp || new Date().toISOString(),
          user: d.userAnonymized || d.user || "USER-EDD4309534",
          status: d.decision || d.status || "RECHAZADO",
          signature: d.sha256 || d.signature || "a29d21f5bf04f769"
        };
      } catch(e) { return null; }
    }).filter(Boolean).reverse();
    res.writeHead(200);
    return res.end(JSON.stringify({ logs }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "No encontrado", path: url }));
});

server.listen(3002, () => {
  console.log("=== SAARE BRIDGE OPERATIVO EN PUERTO 3002 ===");
});
