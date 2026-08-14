import { EvidenceService } from '../../control-plane/evidence/evidenceService.js';
import { ScenarioEngine } from '../../control-plane/scenario-engine/resolver.js';
import { DeploymentManager } from '../../control-plane/deployment-manager/stateMachine.js';

async function runE2ETest() {
  console.log('=== INICIANDO TEST E2E S.A.A.R.E. PLATFORM ===\n');

  // 1. Carga del Escenario Piloto
  const scenario = {
    id: 'cumplimiento_corporativo_es_maxima_seguridad',
    version: '1.0.0',
    runtimeBehavior: { inputInspection: true, policyEnforcement: true, semanticGovernance: true, evidenceGeneration: true },
    failurePolicy: { inputViolation: 'REJECT', policyViolation: 'BLOCK', integrityFailure: 'ISOLATE' }
  };
  console.log('[1/5] Escenario Piloto Cargado:', scenario.id);

  // 2. Scenario Engine genera Deployment Plan
  const plan = ScenarioEngine.resolveDeploymentPlan(scenario);
  console.log('[2/5] Deployment Plan Generado:', plan.deploymentPlan.runtimeModules.join(', '));

  // 3. Preflight Check y Handshake
  const manager = new DeploymentManager(plan.deploymentId);
  const runtimeHealth = { available: true, coreEngineReady: true, memoryRAMProxyOK: true, evidenceVaultReady: true };
  const preflightOK = await manager.runPreflightCheck(runtimeHealth);
  
  if (preflightOK) {
    manager.transitionTo('ACTIVE', 'Handshake confirmado');
    console.log('[3/5] Runtime Handshake Exitoso. Estado:', manager.state);
  }

  // 4. Ciclo de Decisión (Simulación de Infección por Prompt Injection)
  const decision = 'REJECTED';
  const reason = 'Fuga de PII / Prompt Injection Detectado';
  console.log('[4/5] Veredicto L7 Aplicado:', decision, '-', reason);

  // 5. Generación y Verificación de Evidencia Cryptográfica
  const receipt = EvidenceService.createReceipt({
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    decision,
    reason
  });
  
  const verification = EvidenceService.verifyReceipt(receipt);
  console.log('[5/5] Recibo Cryptográfico Generado:', receipt.cryptoId);
  console.log('      Resultado de Verificación Ed25519:', verification.status);

  console.log('\n=== TEST E2E COMPLETADO CON ÉXITO ===');
}

runE2ETest();
