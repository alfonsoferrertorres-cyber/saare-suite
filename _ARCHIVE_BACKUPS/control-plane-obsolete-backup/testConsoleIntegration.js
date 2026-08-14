import http from "http";
import { server } from "./server.js";
console.log("=== SUITE V2.2 - CONSOLE INTEGRATION & CONTRACT TEST ===");
setTimeout(async () => {
  try {
    const scenariosRes = await fetch("http://localhost:3001/api/v1/scenarios");
    const scenarios = await scenariosRes.json();
    console.log(`\n[TEST 1] /api/v1/scenarios -> ${scenarios.length} escenarios devueltos.`);
    const gateRes = await fetch("http://localhost:3001/api/v1/resilience-gate");
    const gate = await gateRes.json();
    console.log(`[TEST 2] /api/v1/resilience-gate -> Verdict: ${gate.verdict} (${gate.satisfiedInvariants}/8 PASS).`);
    const dossierRes = await fetch("http://localhost:3001/api/v1/dossier/generate", {
      method: "POST",
      headers: { "X-User-Role": "Engineer" }
    });
    const dossier = await dossierRes.json();
    console.log(`[TEST 3] /api/v1/dossier/generate -> Dossier ID: ${dossier.dossierId}`);
    if (scenarios.length > 0 && gate.verdict === "PASS" && dossier.dossierId) {
      console.log("\n=== FASE V2.2 COMMAND CENTER INTEGRADA CON ÉXITO (DOD 10/10) ===");
      server.close(() => process.exit(0));
    } else {
      console.error("\n=== FAIL EN PRUEBA DE CONSOLA ===");
      server.close(() => process.exit(1));
    }
  } catch (err) {
    console.error("Error durante la prueba:", err.message);
    server.close(() => process.exit(1));
  }
}, 1000);

