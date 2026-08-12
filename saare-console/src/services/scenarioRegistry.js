const STORAGE_KEY = 'saare_deployment_plan';

export async function saveDeploymentPlan(tenantId, scenarioConfig) {
  const payload = {
    tenant_id: tenantId,
    active_scenario: scenarioConfig.id,
    scenario_name: scenarioConfig.name,
    governance_level: scenarioConfig.level || 'STRICT',
    rules_applied: scenarioConfig.rules || [],
    updated_at: new Date().toISOString()
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(`${STORAGE_KEY}_${tenantId}`, JSON.stringify(payload));
  }

  try {
    await fetch('/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Silencioso en entornos offline/desconectados
  }

  return payload;
}

export function getActiveDeploymentPlan(tenantId) {
  if (typeof window !== 'undefined' && window.localStorage) {
    const localData = localStorage.getItem(`${STORAGE_KEY}_${tenantId}`);
    return localData ? JSON.parse(localData) : null;
  }
  return null;
}
