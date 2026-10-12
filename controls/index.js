// controls/index.js — Catálogo de Controles de Ejecución de 7 Dimensiones S.A.A.R.E. (SGP 1.0)
import controlSchema from './schema.json' with { type: 'json' };

export const DIMENSIONS = {
  DIM_01_IDENTITY: "DIM_01_IDENTITY",
  DIM_02_ACTION: "DIM_02_ACTION",
  DIM_03_CONTEXT: "DIM_03_CONTEXT",
  DIM_04_RESOURCE: "DIM_04_RESOURCE",
  DIM_05_DATA: "DIM_05_DATA",
  DIM_06_RISK: "DIM_06_RISK",
  DIM_07_POLICY: "DIM_07_POLICY"
};

export const DEFAULT_CONTROLS = [
  {
    id: "CTL_L7_RAM_FILTER",
    name: "Filtro Perimetral L7 Zero-Disk en RAM",
    description: "Detección Ex-Ante de inyecciones de código, prompt injection y datos sensibles en memoria volátil",
    version: "1.0.0",
    enabled: true,
    dimension: DIMENSIONS.DIM_05_DATA,
    actionOnTrigger: "DENY",
    rules: [
      { condition: "MATCH_REGEX", pattern: "\\b\\d{7,8}[A-Za-z]\\b", description: "DNI / NIF Español" },
      { condition: "MATCH_REGEX", pattern: "\\b[A-Z]{2}\\d{2}[\\s-]?(?:\\d{4}[\\s-]?){4}\\d{2,4}\\b", description: "IBAN Bancario" },
      { condition: "MATCH_REGEX", pattern: "sk-proj-[a-zA-Z0-9]+", description: "API Key de OpenAI" }
    ]
  },
  {
    id: "CTL_ED25519_PROOF",
    name: "Sellado Criptográfico Ed25519 e ISO/IEC 27037",
    description: "Generación de prueba electrónica e inmutabilidad mediante firmas Ed25519 y sellos de tiempo RFC 3161",
    version: "1.0.0",
    enabled: true,
    dimension: DIMENSIONS.DIM_07_POLICY,
    actionOnTrigger: "ALLOW",
    rules: [
      { condition: "ALWAYS_ON", pattern: ".*", description: "Firma obligatoria para toda traza de ejecución" }
    ]
  },
  {
    id: "CTL_FRIA_EVALUATION",
    name: "Evaluación Ex-Ante de Riesgo Algorítmico (FRIA)",
    description: "Supervisión de impacto en derechos fundamentales bajo el Reglamento UE 2024/1689 (EU AI Act)",
    version: "1.0.0",
    enabled: true,
    dimension: DIMENSIONS.DIM_06_RISK,
    actionOnTrigger: "REVIEW",
    rules: [
      { condition: "MATCH_KEYWORDS", pattern: "clonar|facial|biometrico|jailbreak", description: "Técnicas de IA de alto riesgo" }
    ]
  }
];

export { controlSchema };

export function getControlById(id) {
  return DEFAULT_CONTROLS.find(c => c.id === id) || null;
}

export function getControlsByDimension(dimension) {
  return DEFAULT_CONTROLS.filter(c => c.dimension === dimension);
}