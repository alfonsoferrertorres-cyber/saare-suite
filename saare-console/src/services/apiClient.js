export function getRole() { return 'User'; }
export function setRole() {}

export async function fetchScenarios() {
  return {
    scenarios: [
      { id: 'scen-corp-governance', title: 'Cumplimiento Corporativo ES (Máxima Seguridad)', description: 'Protección integral L7 con bloqueo de PII y Prompt Injection' },
      { id: 'scen-dora-strict', title: 'Banca & DORA / PCI-DSS Strict', description: 'Perfil estricto para entidades financieras bajo normativa europea' }
    ]
  };
}

export async function createDeployment(scenarioId, apiKey) {
  return {
    execution_id: 'exec_loc_' + Date.now(),
    scenario: scenarioId,
    status: 'ACTIVE_ZERO_TRUST'
  };
}

export function subscribeToTelemetry(callback) {
  let count = 12804;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 3);
    callback({
      interceptions: count,
      p50_ms: (0.20 + Math.random() * 0.05).toFixed(2),
      p95_ms: (0.45 + Math.random() * 0.10).toFixed(2),
      p99_ms: (0.90 + Math.random() * 0.15).toFixed(2)
    });
  }, 3000);

  return () => clearInterval(interval);
}
