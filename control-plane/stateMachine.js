// control-plane/stateMachine.js — Máquina de Estados Finita de Despliegue (SGP 1.0)

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

// Matriz estricta de transiciones de estado permitidas
const ALLOWED_TRANSITIONS = {
  [DEPLOYMENT_STATES.DRAFT]: [DEPLOYMENT_STATES.VALIDATING, DEPLOYMENT_STATES.FAILED],
  [DEPLOYMENT_STATES.VALIDATING]: [DEPLOYMENT_STATES.READY, DEPLOYMENT_STATES.FAILED],
  [DEPLOYMENT_STATES.READY]: [DEPLOYMENT_STATES.DEPLOYING, DEPLOYMENT_STATES.FAILED, DEPLOYMENT_STATES.STOPPED],
  [DEPLOYMENT_STATES.DEPLOYING]: [DEPLOYMENT_STATES.STARTING, DEPLOYMENT_STATES.FAILED],
  [DEPLOYMENT_STATES.STARTING]: [DEPLOYMENT_STATES.ACTIVE, DEPLOYMENT_STATES.FAILED],
  [DEPLOYMENT_STATES.ACTIVE]: [DEPLOYMENT_STATES.STOPPED, DEPLOYMENT_STATES.FAILED],
  [DEPLOYMENT_STATES.FAILED]: [DEPLOYMENT_STATES.DRAFT, DEPLOYMENT_STATES.VALIDATING],
  [DEPLOYMENT_STATES.STOPPED]: [DEPLOYMENT_STATES.DRAFT, DEPLOYMENT_STATES.VALIDATING]
};

export class DeploymentManager {
  constructor(deploymentId) {
    this.id = deploymentId || `DEP-${Date.now()}-${crypto.randomUUID().substring(0, 6)}`;
    this.state = DEPLOYMENT_STATES.DRAFT;
    this.logs = [];
  }

  /**
   * Transiciona el estado verificando la validez en la matriz de gobernanza.
   */
  transitionTo(nextState, reason = '') {
    const validNextStates = ALLOWED_TRANSITIONS[this.state] || [];
    
    if (!validNextStates.includes(nextState)) {
      const errorMsg = `[STATE_MACHINE_ERROR] Transición inválida: de ${this.state} a ${nextState}`;
      console.warn(errorMsg);
      this.logs.push({ 
        from: this.state, 
        to: DEPLOYMENT_STATES.FAILED, 
        timestamp: new Date().toISOString(), 
        reason: errorMsg 
      });
      this.state = DEPLOYMENT_STATES.FAILED;
      return this.state;
    }

    this.logs.push({ 
      from: this.state, 
      to: nextState, 
      timestamp: new Date().toISOString(), 
      reason 
    });
    
    this.state = nextState;
    return this.state;
  }

  /**
   * Preflight Check resiliente a fallos de objeto nulo.
   */
  async runPreflightCheck(runtimeHealth) {
    this.transitionTo(DEPLOYMENT_STATES.VALIDATING, 'Iniciando Preflight Check');

    if (!runtimeHealth || typeof runtimeHealth !== 'object') {
      this.transitionTo(DEPLOYMENT_STATES.FAILED, 'Preflight abortado: runtimeHealth nulo o no válido');
      return false;
    }
    
    const checks = [
      Boolean(runtimeHealth.available),
      Boolean(runtimeHealth.coreEngineReady),
      Boolean(runtimeHealth.memoryRAMProxyOK),
      Boolean(runtimeHealth.evidenceVaultReady)
    ];

    const allPassed = checks.every(Boolean);

    if (allPassed) {
      this.transitionTo(DEPLOYMENT_STATES.READY, 'Preflight Check superado con éxito');
      return true;
    } else {
      this.transitionTo(DEPLOYMENT_STATES.FAILED, 'Fallo de verificación en Preflight Check');
      return false;
    }
  }

  /**
   * Ejecuta el ciclo completo de activación en producción.
   */
  async executeDeployment() {
    if (this.state !== DEPLOYMENT_STATES.READY) {
      throw new Error(`[DEPLOYMENT_ERROR] No se puede desplegar desde el estado ${this.state}`);
    }

    this.transitionTo(DEPLOYMENT_STATES.DEPLOYING, 'Transfiriendo artefactos a Edge Workers');
    this.transitionTo(DEPLOYMENT_STATES.STARTING, 'Inicializando Bóveda Dual y proxies RAM');
    this.transitionTo(DEPLOYMENT_STATES.ACTIVE, 'Servicio S.A.A.R.E. activo en producción');
    
    return this.state;
  }

  /**
   * Apagado controlado del servicio.
   */
  stop(reason = 'Detención manual solicitada') {
    return this.transitionTo(DEPLOYMENT_STATES.STOPPED, reason);
  }
}