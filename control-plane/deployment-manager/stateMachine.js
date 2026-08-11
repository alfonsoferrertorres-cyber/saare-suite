export const DEPLOYMENT_STATES = {
  DRAFT: 'DRAFT',
  VALIDATING: 'VALIDATING',
  READY: 'READY',
  DEPLOYING: 'DEPLOYING',
  STARTING: 'STARTING',
  ACTIVE: 'ACTIVE',
  FAILED: 'FAILED',
  STOPPED: 'STOPPED'
};

export class DeploymentManager {
  constructor(deploymentId) {
    this.id = deploymentId;
    this.state = DEPLOYMENT_STATES.DRAFT;
    this.logs = [];
  }

  transitionTo(nextState, reason = '') {
    this.logs.push({ from: this.state, to: nextState, timestamp: new Date().toISOString(), reason });
    this.state = nextState;
    return this.state;
  }

  async runPreflightCheck(runtimeHealth) {
    this.transitionTo(DEPLOYMENT_STATES.VALIDATING, 'Iniciando Preflight Check');
    
    const checks = [
      runtimeHealth.available,
      runtimeHealth.coreEngineReady,
      runtimeHealth.memoryRAMProxyOK,
      runtimeHealth.evidenceVaultReady
    ];

    const allPassed = checks.every(Boolean);

    if (allPassed) {
      this.transitionTo(DEPLOYMENT_STATES.READY, 'Preflight Check superado con exito');
      return true;
    } else {
      this.transitionTo(DEPLOYMENT_STATES.FAILED, 'Fallo en Preflight Check');
      return false;
    }
  }
}
