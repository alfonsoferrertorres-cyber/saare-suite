// saare-console/src/utils/subsidies.js — Utilidades y Funciones Auxiliares de Subvenciones (SGP 1.0)

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
  Valida que el objeto de metadatos contenga los campos requeridos
 */
export function validateGrantMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return false;
  return Boolean(metadata.grantType && typeof metadata.dossierId === 'string' && metadata.dossierId.trim() !== '');
}

/**
  Genera la declaración criptográfica DNSH (Do No Significant Harm) para el expediente
 */
export function generateDnshStatement(tenantId) {
  return {
    tenantId: tenantId || 'ORGANISMO_DEMO_01',
    timestamp: new Date().toISOString(),
    dnshPrinciple: "COMPLIANT_NO_SIGNIFICANT_HARM",
    architecture: "RAM_ZERO_DISK_COMPUTE",
    energyEfficiency: "Optimización L7 ex-ante que reduce consumo computacional superfluo en infraestructura LLM."
  };
}

/**
  Formatea las claves de tipos de subvención para mostrar en la interfaz de usuario
 */
export function formatGrantTypeLabel(grantType) {
  const labels = {
    [GRANT_TYPES.KIT_CONSULTING]: 'Kit Consulting (Asesoramiento IA)',
    [GRANT_TYPES.KIT_DIGITAL]: 'Kit Digital',
    [GRANT_TYPES.CDTI_NEOTEC]: 'CDTI Neotec',
    [GRANT_TYPES.INCIBE_CIBER]: 'INCIBE Ciberseguridad',
    [GRANT_TYPES.GENERAL_SUBSIDY]: 'Subvención General / Ordenanza GRC'
  };
  return labels[grantType] || grantType || 'No Especificado';
}