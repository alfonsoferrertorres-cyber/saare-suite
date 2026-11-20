// saare-console/src/utils/subsidies.js

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
  return Boolean(
    metadata.grantType &&
    typeof metadata.dossierId === 'string' &&
    metadata.dossierId.trim() !== ''
  );
}

export function generateDnshStatement(tenantId = '', options = {}) {
  return {
    tenantId: tenantId || '',
    timestamp: new Date().toISOString(),
    dnshPrinciple: options.dnshPrinciple || 'COMPLIANT_NO_SIGNIFICANT_HARM',
    architecture: options.architecture || '',
    energyEfficiency: options.energyEfficiency || ''
  };
}

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