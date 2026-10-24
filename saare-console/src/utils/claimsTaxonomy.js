// saare-console/src/utils/claimsTaxonomy.js — Taxonomía Unificada de Riesgos y Marcos Normativos (SGP 1.0)

export const CLAIMS_TAXONOMY = {
  'EU_AI_ACT_ART15': {
    code: 'EU AI Act Art. 15',
    title: 'Precisión, Robustez y Ciberseguridad Ex-Ante',
    category: 'Gobernanza Regulatoria EU',
    description: 'Exige resiliencia contra vulnerabilidades de IA, inyección de prompts y manipulación de datos.',
    controlVector: 'L7 Interception Shield + FAIL-CLOSED RAM Isolation'
  },
  'EU_AI_ACT_ART27': {
    code: 'EU AI Act Art. 27',
    title: 'Evaluación de Impacto en Derechos Fundamentales (FRIA)',
    category: 'Evaluación de Riesgos',
    description: 'Obligación para desplegadores de sistemas de alto riesgo de evaluar impactos en derechos fundamentales.',
    controlVector: 'FRIA Wizard + Merkle Proof Anchoring'
  },
  'OWASP_LLM_01': {
    code: 'LLM01:2025',
    title: 'Prompt Injection (Directa e Indirecta)',
    category: 'OWASP LLM Top 10',
    description: 'Manipulación de entrada para eludir barreras de seguridad o ejecutar acciones no autorizadas.',
    controlVector: 'Semantic Prompt Filtering + Strict Regex Boundaries'
  },
  'OWASP_LLM_02': {
    code: 'LLM02:2025',
    title: 'Divulgación de Datos Sensibles (PII Leakage)',
    category: 'OWASP LLM Top 10',
    description: 'Fuga inadvertida de PII, secretos comerciales o credenciales en respuestas de LLMs.',
    controlVector: 'RAM PII Sanitization Engine + Masking'
  },
  'DORA_ICT_RISK': {
    code: 'DORA Art. 6',
    title: 'Gestión del Riesgo de las TIC e Invariantes Operativos',
    category: 'Resiliencia Financiera',
    description: 'Marcos de prueba de resiliencia operativa digital y mitigación de proveedores de software.',
    controlVector: 'Circuit Breaker + Resilience Lab Invariants'
  },
  'ISO_42001_A8': {
    code: 'ISO/IEC 42001 A.8',
    title: 'Controles Operativos y Cadena de Custodia',
    category: 'Estándar Internacional IA',
    description: 'Trazabilidad inmutable de decisiones tomadas por agentes de Inteligencia Artificial.',
    controlVector: 'Ed25519 Signatures + RFC 3161 Qualified TSA'
  }
};