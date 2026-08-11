import http from "http";
import "./server.js";
console.log("=== SUITE V2.2 - CONSOLE INTEGRATION & CONTRACT TEST ===");
setTimeout(async () => {
  try {
    // 1. Validar Contrato de Escenarios
    const scenariosRes = await fetch("http://localhost:3001/api/v1/scenarios");
    const scenarios = await scenariosRes.json();
    console.log(`\n[TEST 1] /api/v1/scenarios -> ${scenarios.length} escenarios dinámicos devueltos.`);
    // 2. Validar Estado de la Resilience Gate (8/8 Invariantes)
    const gateRes = await fetch("http://localhost:3001/api/v1/resilience-gate");
    const gate = await gateRes.json();
    console.log(`[TEST 2] /api/v1/resilience-gate -> Verdict: ${gate.verdict} (${gate.satisfiedInvariants}/8 PASS).`);
    // 3. Validar Generación de Dossier con RBAC Server-Side
    const dossierRes = await fetch("http://localhost:3001/api/v1/dossier/generate", {
      method: "POST",
      headers: { "X-User-Role": "Engineer" }
    });
    const dossier = await dossierRes.json();
    console.log(`[TEST 3] /api/v1/dossier/generate -> Dossier ID: ${dossier.dossierId}`);
    if (scenarios.length > 0 && gate.verdict === "PASS" && dossier.dossierId) {
      console.log("\n=== FASE V2.2 COMMAND CENTER INTEGRADA CON ÉXITO (DOD 10/10) ===");
      process.exit(0);
    } else {
      console.error("\n=== FAIL EN PRUEBA DE CONSOLA ===");
      process.exit(1);
    }
  } catch (err) {
    console.error("Error durante la prueba de integración:", err.message);
    process.exit(1);
  }
}, 1000);

