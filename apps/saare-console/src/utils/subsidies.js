// saare-console/src/utils/subsidies.js — Gestión de Subvenciones y Expedientes de Justificación

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

export function validateGrantMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return false;
  return Boolean(metadata.grantType && metadata.dossierId);
}

export function generateDnshStatement(tenantId) {
  return {
    tenantId,
    timestamp: new Date().toISOString(),
    dnshPrinciple: "COMPLIANT_NO_SIGNIFICANT_HARM",
    architecture: "RAM_ZERO_DISK_COMPUTE",
    energyEfficiency: "Optimización L7 ex-ante que reduce consumo computacional superfluo en infraestructura LLM."
  };
}