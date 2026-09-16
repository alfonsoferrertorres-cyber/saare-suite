// saare-console/src/utils/claimsTaxonomy.js

export const SAARE_CLAIM_LEVELS = {
  DECLARED: { level: 1, label: 'DECLARED', desc: 'Afirmación de existencia del control' },
  IMPLEMENTED: { level: 2, label: 'IMPLEMENTED', desc: 'Control desplegado en código/runtime' },
  TESTED: { level: 3, label: 'TESTED', desc: 'Superadas pruebas automatizadas en Resilience Lab' },
  VERIFIED: { level: 4, label: 'VERIFIED', desc: 'Verificación matemática independiente PASS/FAIL' },
  CERTIFIED: { level: 5, label: 'CERTIFIED', desc: 'Acreditación jurídica/normativa formal' }
};

export const SAARE_CLAIM_IDS = {
  'STAT_STATELESS_L7_RAM': { id: 'SAARE-CLM-001', claim: 'Sanitización ex-ante en memoria RAM sin almacenamiento', defaultLevel: 'VERIFIED' },
  'ED25519_PROOF_BUNDLE': { id: 'SAARE-CLM-002', claim: 'Firma forense inmutable ISO/IEC 27037', defaultLevel: 'VERIFIED' },
  'FAIL_CLOSED_GATEWAY': { id: 'SAARE-CLM-003', claim: 'Bloqueo preventivo ante indisponibilidad del Control Plane', defaultLevel: 'TESTED' },
  'FRIA_ART27_COMPLIANCE': { id: 'SAARE-CLM-004', claim: 'Evaluación de Impacto en Derechos Fundamentales EU AI Act', defaultLevel: 'IMPLEMENTED' }
};