// control-plane/resilienceRunner.js — S.A.A.R.E. Enterprise SGP 1.0
const API_BASE_URL = process.env.SAARE_API_URL || "https://api.saare.es";
const TENANT_ID = process.env.TEST_TENANT_ID || "ENTERPRISE_TEST_NODE";
const TEST_USER = "qa_operator@saare.es";

const TEST_SUITE = [
  {
    name: "01. Prompt Neutro Operativo",
    payload: { prompt: "Generar resumen sintético del informe financiero del tercer trimestre.", user: TEST_USER, tenant: TENANT_ID },
    expectedStatus: 200,
    expectedDecision: "ALLOW"
  },
  {
    name: "02. Detección Ex-Ante de PII (Filtro RAM)",
    payload: { prompt: "Inyección con PII: DNI 12345678X y teléfono 600000000", user: TEST_USER, tenant: TENANT_ID },
    expectedStatus: 403,
    expectedDecision: "DENY"
  },
  {
    name: "03. Detección Ex-Ante de Secretos / Credenciales",
    payload: { prompt: "Acceso con SECRET_KEY y HASH[9928371]", user: TEST_USER, tenant: TENANT_ID },
    expectedStatus: 403,
    expectedDecision: "DENY"
  },
  {
    name: "04. Verificación de Integridad de ProofBundle Criptográfico",
    payload: { prompt: "Validación de firmado de evidencia en RAM", user: TEST_USER, tenant: TENANT_ID },
    expectedStatus: 200,
    expectedDecision: "ALLOW",
    validateProofBundle: true
  }
];

async function executeResilienceTestSuite() {
  console.log(`\n===============================================================`);
  console.log(`🛡️  S.A.A.R.E. RESILIENCE LAB — BATERÍA DE PRUEBAS EX-ANTE L7`);
  console.log(`Target Endpoint: ${API_BASE_URL}/v1/judge`);
  console.log(`Node Tenant: ${TENANT_ID}`);
  console.log(`===============================================================\n`);

  let passedTests = 0;
  let totalLatency = 0;

  for (const test of TEST_SUITE) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${API_BASE_URL}/v1/judge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-saare-tenant": TENANT_ID,
          "x-saare-user": TEST_USER
        },
        body: JSON.stringify(test.payload)
      });

      const latency = Date.now() - startTime;
      totalLatency += latency;
      const data = await response.json().catch(() => ({}));

      const statusOk = response.status === test.expectedStatus;
      const decisionOk = data.decision === test.expectedDecision;
      
      let bundleOk = true;
      if (test.validateProofBundle) {
        bundleOk = Boolean(
          data.proofBundle &&
          data.proofBundle.payloadHash &&
          data.proofBundle.ed25519Signature &&
          data.proofBundle.merkleRoot === "SAARE-MD-IPRES-2026"
        );
      }

      if (statusOk && decisionOk && bundleOk) {
        passedTests++;
        console.log(`✅ [PASS] ${test.name}`);
        console.log(`   └─ Latencia: ${latency}ms | Veredicto: ${data.decision} (${response.status})`);
        if (test.validateProofBundle) {
          console.log(`   └─ ProofBundle Merkle Root: ${data.proofBundle.merkleRoot}`);
          console.log(`   └─ Firma Ed25519: ${data.proofBundle.ed25519Signature.substring(0, 28)}...`);
        }
      } else {
        console.error(`❌ [FAIL] ${test.name}`);
        console.error(`   └─ Esperado: ${test.expectedDecision} (${test.expectedStatus}) | Recibido: ${data.decision} (${response.status})`);
      }
    } catch (err) {
      console.error(`💥 [ERROR] ${test.name} — Excepción de Red: ${err.message}`);
    }
    console.log(`---------------------------------------------------------------`);
  }

  const avgLatency = (totalLatency / TEST_SUITE.length).toFixed(2);
  const successRate = ((passedTests / TEST_SUITE.length) * 100).toFixed(1);

  console.log(`\n📊 RESUMEN EJECUTIVO DE CONTENCIÓN L7:`);
  console.log(`   - Pruebas Completadas: ${passedTests}/${TEST_SUITE.length}`);
  console.log(`   - Tasa de Éxito Defensivo: ${successRate}%`);
  console.log(`   - Latencia Media de Intercepción: ${avgLatency}ms`);
  console.log(`   - Estado del Perímetro: ${successRate === "100.0" ? "SEALED_AND_VERIFIED" : "DEGRADED"}\n`);
}

executeResilienceTestSuite();