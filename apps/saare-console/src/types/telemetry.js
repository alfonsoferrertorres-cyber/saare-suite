// saare-console/src/utils/subsidies.js — Constantes y Utilidades de Subvenciones (SGP 1.0)

/**
 * Constantes y funciones de utilidad para la gestión de Ayudas y Subvenciones.
 */

export const GRANT_TYPES = {
  KIT_CONSULTING: 'KIT_CONSULTING',
  KIT_DIGITAL: 'KIT_DIGITAL',
  CDTI_NEOTEC: 'CDTI_NEOTEC',
  INCIBE_CIBER: 'INCIBE_CIBER',
  IMPULSO_IA: 'IMPULSO_IA',
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
export function generateDnshStatement(tenantId = 'ORGANISMO_DEMO_01') {
  return {
    tenantId,
    timestamp: new Date().toISOString(),
    dnshPrinciple: "COMPLIANT_NO_SIGNIFICANT_HARM",
    architecture: "RAM_ZERO_DISK_COMPUTE",
    energyEfficiency: "Optimización L7 ex-ante que reduce consumo computacional superfluo en infraestructura LLM."
  };
}

/**
 * Mapea las claves técnicas de GRANT_TYPES a etiquetas legibles para selectores y modales de la interfaz.
 * @param {string} grantType 
 * @returns {string}
 */
export function formatGrantTypeLabel(grantType) {
  const labels = {
    [GRANT_TYPES.KIT_CONSULTING]: 'Kit Consulting (Asesoramiento IA)',
    [GRANT_TYPES.KIT_DIGITAL]: 'Kit Digital',
    [GRANT_TYPES.CDTI_NEOTEC]: 'CDTI Neotec',
    [GRANT_TYPES.INCIBE_CIBER]: 'INCIBE Ciberseguridad',
    [GRANT_TYPES.IMPULSO_IA]: 'Programa Impulso IA',
    [GRANT_TYPES.GENERAL_SUBSIDY]: 'Subvención General / Ordenanza GRC'
  };
  return labels[grantType] || grantType || 'No Especificado';
}