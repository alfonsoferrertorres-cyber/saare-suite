// policies/index.js — Registro Maestro de Políticas de Gobernanza S.A.A.R.E. (SGP 1.0)
import policySchema from './schema.json' with { type: 'json' };

export const DEFAULT_POLICIES = [
  {
    id: "POL_DORA_RESILIENCE",
    name: "Política de Resiliencia Operativa Digital (DORA)",
    description: "Inspección Ex-Ante y aislamiento de riesgos TIC en servicios financieros",
    version: "1.0.0",
    status: "ACTIVE",
    scope: "GLOBAL",
    effectiveFrom: "2026-01-01T00:00:00Z",
    owner: "ciso@saare.es",
    controls: ["CTL_L7_RAM_FILTER", "CTL_ED25519_PROOF"],
    rules: [
      { ruleId: "R_NO_API_KEYS", action: "DENY", pattern: "sk-proj-[a-zA-Z0-9]+" },
      { ruleId: "R_NO_CREDIT_CARDS", action: "DENY", pattern: "\\b[A-Z]{2}\\d{2}[\\s-]?(?:\\d{4}[\\s-]?){4}\\d{2,4}\\b" }
    ]
  },
  {
    id: "POL_EU_AI_ACT_GOVERNANCE",
    name: "Gobernanza y Transparencia de IA (EU AI Act)",
    description: "Evaluación continua de sesgos, protección PII y auditoría de decisiones en tiempo de ejecución",
    version: "1.0.0",
    status: "ACTIVE",
    scope: "GLOBAL",
    effectiveFrom: "2026-01-01T00:00:00Z",
    owner: "dpo@saare.es",
    controls: ["CTL_FRIA_EVALUATION", "CTL_MERKLE_ANCHOR"],
    rules: [
      { ruleId: "R_NO_DNI_EXPOSURE", action: "DENY", pattern: "\\b\\d{7,8}[A-Za-z]\\b" }
    ]
  }
];

export { policySchema };

export function getPolicyById(id) {
  return DEFAULT_POLICIES.find(p => p.id === id) || null;
}