// control-plane/scenarioRegistry.js — Registro de Escenarios de Inspección L7
export const ScenarioRegistry = [
  {
    id: "banca_dora_pci_dss",
    title: "Banca & DORA / PCI-DSS Strict",
    category: "FINANCIAL_COMPLIANCE",
    riskLevel: "HIGH",
    compliance_mapping: {
      "DORA": ["ICT_RISK_MANAGEMENT", "INCIDENT_MONITORING"],
      "EU_AI_ACT": ["LOGGING", "HUMAN_OVERSIGHT", "ACCURACY_SECURITY"],
      "GDPR": ["DATA_MINIMIZATION", "INTEGRITY_CONFIDENTIALITY"]
    }
  },
  {
    id: "cumplimiento_corporativo_es",
    title: "España - LOPDGDD & AEPD",
    category: "DATA_PROTECTION",
    riskLevel: "CRITICAL",
    compliance_mapping: {
      "GDPR": ["DATA_MINIMIZATION", "INTEGRITY_CONFIDENTIALITY", "SECURITY_PROCESSING"],
      "ISO_27037": ["EVIDENCE_PRESERVATION"]
    }
  },
  {
    id: "fria_eu_ai_act_high_risk",
    title: "EU AI Act - Sistemas de IA de Alto Riesgo",
    category: "AI_GOVERNANCE",
    riskLevel: "HIGH",
    compliance_mapping: {
      "EU_AI_ACT": ["RISK_MANAGEMENT", "LOGGING", "HUMAN_OVERSIGHT", "ACCURACY_SECURITY", "TRANSPARENCY"],
      "ISO_42001": ["POLICY_CONTROL", "IMPACT_ASSESSMENT"]
    }
  }
];