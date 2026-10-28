// saare-console/src/utils/subsidies.js — Constantes y Utilidades de Subvenciones
/**
 * Constantes y funciones de utilidad para la gestión de Ayudas y Subvenciones.
 */

export const GRANT_TYPES = {
  KIT_CONSULTING: 'KIT_CONSULTING',
  KIT_DIGITAL: 'KIT_DIGITAL',
  CDTI_NEOTEC: 'CDTI_NEOTEC',
  INCIBE_CIBER: 'INCIBE_CIBER',
  GENERAL_SUBSIDY: 'GENERAL_SUBSIDY'
};

export const DEFAULT_GRANT_METADATA = {
  grantType: GRANT_TYPES.KIT_CONSULTING,
  dossierId: '',
  complianceStatus: 'PENDING',
  dnshCompliant: true,
  filesIncluded: [],
  generatedAt: new Date().toISOString()
};

/**
 * Valida la estructura básica de los metadatos de subvención.
 * @param {Object} metadata 
 * @returns {boolean}
 */
export function validateGrantMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return false;
  return Boolean(metadata.grantType && String(metadata.dossierId || '').trim().length > 0);
}

/**
 * Genera la declaración oficial de cumplimiento del principio DNSH (Do No Significant Harm).
 * @param {string} tenantId - Identificador de la organización.
 * @returns {Object}
 */
export function generateDnshStatement(tenantId = 'ENTERPRISE') {
  return {
    tenantId,
    timestamp: new Date().toISOString(),
    dnshPrinciple: "COMPLIANT_NO_SIGNIFICANT_HARM",
    architecture: "RAM_ZERO_DISK_COMPUTE",
    energyEfficiency: "Optimización L7 ex-ante que reduce consumo computacional superfluo en infraestructura LLM."
  };
}