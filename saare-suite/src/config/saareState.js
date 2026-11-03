// saare-suite/src/config/saareState.js — Configuración Global Multitenant SGP 1.0

export const SAARE_CONFIG = {
  SPEC_VERSION: "SGP 1.0",
  TRUST_ANCHOR: import.meta.env.VITE_TRUST_ANCHOR || "SAARE-MD-IPRES-2026",
  EXPEDIENTE_FRAMEWORK: import.meta.env.VITE_EXPEDIENTE_FRAMEWORK || "MS3V-RECON-VALID-2026",
  
  // Valores por defecto no sensibles (pueden sobreescribirse por .env)
  DEFAULT_TENANT: import.meta.env.VITE_DEFAULT_TENANT || "ORGANISMO_DEMO_01",
  DEFAULT_ROLE: import.meta.env.VITE_DEFAULT_ROLE || "OPERATIONAL_AGENT_USER",
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://api.saare.es",
  CONTROL_PLANE_NODE: import.meta.env.VITE_CONTROL_PLANE_NODE || "saare-control-plane-prod",
  D1_REGION: import.meta.env.VITE_D1_REGION || "D1-EU-WESTERN-EUROPE",

  /**
   * Helper para obtener el contexto dinámico del cliente actual desde la sesión local.
   */
  getCurrentContext: () => {
    return {
      userEmail: localStorage.getItem('saare_user_email') || null,
      tenantId: localStorage.getItem('saare_tenant_domain') || import.meta.env.VITE_DEFAULT_TENANT || "DEMO_ENTERPRISE",
      userRole: localStorage.getItem('saare_user_role') || "OPERATIONAL_AGENT_USER",
      token: localStorage.getItem('saare_auth_token') || localStorage.getItem('saare_token') || null,
    };
  }
};

export default SAARE_CONFIG;