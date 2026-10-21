/**
 * Constantes y funciones de utilidad para la gestión de Ayudas y Subvenciones.
 */

export const GRANT_TYPES = {
  KIT_CONSULTING: 'KIT_CONSULTING',
  KIT_DIGITAL: 'KIT_DIGITAL',
  CDTI_NEOTEC: 'CDTI_NEOTEC',
  GENERAL_SUBSIDY: 'GENERAL_SUBSIDY'
};

export const DEFAULT_GRANT_METADATA = {
  grantType: GRANT_TYPES.KIT_CONSULTING,
  dossierId: '',
  complianceStatus: 'PENDING',
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
  return Boolean(metadata.grantType && metadata.dossierId);
}