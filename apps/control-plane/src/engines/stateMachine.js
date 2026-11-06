// control-plane/stateMachine.js — Máquina de Estados Finita de Despliegue (SGP 1.0 / v8.4 SRP)

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

// Matriz estricta de transiciones de estado permitidas (Gobernanza Fail-Closed)
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
  constructor(deploymentId = null, initialState = DEPLOYMENT_STATES.DRAFT) {
    const randomId = (typeof crypto !== "undefined" && crypto.randomUUID) 
      ? crypto.randomUUID().substring(0, 6) 
      : Math.random().toString(36).substring(2, 8);

    this.id = deploymentId || `DEP-${Date.now()}-${randomId.toUpperCase()}`;
    this.state = DEPLOYMENT_STATES[initialState] ? initialState : DEPLOYMENT_STATES.DRAFT;
    this.logs = [];
    this.trustAnchor = "SAARE-MD-IPRES-2026";
    this.specVersion = "SGP-1.0";
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
   * Preflight Check resiliente a fallos de objeto nulo y alineado con SGP 1.0.
   */
  async runPreflightCheck(runtimeHealth) {
    this.transitionTo(DEPLOYMENT_STATES.VALIDATING, 'Iniciando Preflight Check de Infraestructura');

    if (!runtimeHealth || typeof runtimeHealth !== 'object') {
      this.transitionTo(DEPLOYMENT_STATES.FAILED, 'Preflight abortado: runtimeHealth nulo o no válido');
      return false;
    }
    
    const checks = [
      Boolean(runtimeHealth.available ?? true),
      Boolean(runtimeHealth.coreEngineReady ?? true),
      Boolean(runtimeHealth.memoryRAMProxyOK ?? true),
      Boolean(runtimeHealth.evidenceVaultReady ?? true)
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
   * Ejecuta el ciclo completo de activación en producción Edge / Workers.
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

  /**
   * Exporta la estructura completa a JSON para persistencia.
   */
  toJSON() {
    return {
      id: this.id,
      state: this.state,
      logs: this.logs,
      trustAnchor: this.trustAnchor,
      specVersion: this.specVersion,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Reconstruye una instancia activa desde datos JSON guardados.
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') return new DeploymentManager();
    const instance = new DeploymentManager(data.id, data.state);
    instance.logs = Array.isArray(data.logs) ? data.logs : [];
    if (data.trustAnchor) instance.trustAnchor = data.trustAnchor;
    if (data.specVersion) instance.specVersion = data.specVersion;
    return instance;
  }

  /**
   * Guarda el estado actual de la máquina de estados en Cloudflare KV.
   */
  async saveToKV(env) {
    if (!env || !env.SAARE_VAULT_KV) return false;
    try {
      await env.SAARE_VAULT_KV.put(`deployment_state:${this.id}`, JSON.stringify(this.toJSON()));
      return true;
    } catch (e) {
      console.error("[DeploymentManager KV Save Error]:", e);
      return false;
    }
  }

  /**
   * Carga una máquina de estados previamente persistida en Cloudflare KV.
   */
  static async loadFromKV(deploymentId, env) {
    if (!env || !env.SAARE_VAULT_KV || !deploymentId) return null;
    try {
      const raw = await env.SAARE_VAULT_KV.get(`deployment_state:${deploymentId}`, 'json');
      return raw ? DeploymentManager.fromJSON(raw) : null;
    } catch (e) {
      console.error("[DeploymentManager KV Load Error]:", e);
      return null;
    }
  }
}