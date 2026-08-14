import fs from "fs";
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>S.A.A.R.E. - Compliance Command Center V2.2</title>
  <style>
    :root { --bg-primary: #0a0e17; --bg-card: #111827; --border-color: #1f2937; --text-main: #f3f4f6; --text-muted: #9ca3af; --accent-green: #10b981; --accent-blue: #3b82f6; }
    body { margin: 0; font-family: monospace; background: var(--bg-primary); color: var(--text-main); }
    header { display: flex; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border-color); background: var(--bg-card); }
    .status-badge { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); padding: 6px 12px; border-radius: 4px; border: 1px solid var(--accent-green); font-weight: bold; }
    .layout { display: grid; grid-template-columns: 240px 1fr; height: calc(100vh - 65px); }
    sidebar { border-right: 1px solid var(--border-color); background: var(--bg-card); padding: 16px; }
    sidebar button { width: 100%; text-align: left; padding: 12px; margin-bottom: 8px; background: transparent; border: 1px solid transparent; color: var(--text-muted); border-radius: 6px; cursor: pointer; }
    sidebar button.active, sidebar button:hover { background: var(--border-color); color: var(--text-main); border-color: var(--accent-blue); }
    main { padding: 24px; overflow-y: auto; }
    .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .card h3 { margin-top: 0; color: var(--accent-blue); }
    pre { background: #000; padding: 12px; border-radius: 6px; overflow-x: auto; color: #a7f3d0; }
  </style>
</head>
<body>
  <header>
    <div><strong>S.A.A.R.E.</strong> | Compliance Command Center V2.2</div>
    <div style="display: flex; gap: 16px; align-items: center;">
      <span>Rol Activo: <strong>Engineer</strong></span>
      <div class="status-badge">SECURITY & RESILIENCE ?</div>
    </div>
  </header>
  <div class="layout">
    <sidebar>
      <button onclick="showSection(\x27dashboard\x27)">Compliance Dashboard</button>
      <button onclick="showSection(\x27resilience\x27)">Resilience Gate</button>
      <button onclick="showSection(\x27evidence\x27)">Evidence Explorer</button>
      <button onclick="showSection(\x27mapping\x27)">Control Mapping</button>
    </sidebar>
    <main id="mainContent"></main>
  </div>
  <script>
    const API_BASE = "http://localhost:3001/api/v1";
    async function showSection(sec) {
      const main = document.getElementById("mainContent");
      if (sec === "dashboard") {
        const scenarios = await (await fetch(API_BASE + "/scenarios")).json();
        main.innerHTML = "<div class=\x27card\x27><h3>Compliance Command Center</h3><p>Escenarios Activos: " + scenarios.length + "</p></div>";
      }
      if (sec === "resilience") {
        const gate = await (await fetch(API_BASE + "/resilience-gate")).json();
        main.innerHTML = "<div class=\x27card\x27><h3>Resilience Gate: " + gate.verdict + " (" + gate.satisfiedInvariants + "/8 PASS)</h3></div>";
      }
      if (sec === "evidence") {
        main.innerHTML = "<div class=\x27card\x27><h3>Evidence Explorer</h3><button onclick=\x27generateDossier()\x27>Generar Dossier Firmado</button><div id=\x27out\x27></div></div>";
      }
      if (sec === "mapping") {
        const scenarios = await (await fetch(API_BASE + "/scenarios")).json();
        main.innerHTML = "<div class=\x27card\x27><h3>Control Mapping</h3><pre>" + JSON.stringify(scenarios, null, 2) + "</pre></div>";
      }
    }
    async function generateDossier() {
      const res = await fetch(API_BASE + "/dossier/generate", { method: "POST", headers: { "X-User-Role": "Engineer" } });
      const data = await res.json();
      document.getElementById("out").innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
    }
    showSection("dashboard");
  </script>
</body>
</html>`;
fs.writeFileSync("consoleApp.html", htmlContent);
console.log("=== consoleApp.html generado exitosamente ===");

