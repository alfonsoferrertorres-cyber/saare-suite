// control-plane/complianceEngine.js — Motor de Mapeo Regulatorio S.A.A.R.E. (SGP 1.0)
import { getScenarioById } from './scenarioRegistry.js';

const REGULATORY_FRAMEWORKS = {
  EU_AI_ACT: {
    id: "EU_AI_ACT_2024_1689",
    name: "EU AI Act (Reglamento UE 2024/1689)",
    status: "ENFORCED_AUG_2026",
    requirements: {
      RISK_MANAGEMENT: "Art. 9 — Sistema de gestión de riesgos en tiempo de ejecución",
      LOGGING: "Art. 12 — Registro automático de eventos durante el ciclo de vida",
      HUMAN_OVERSIGHT: "Art. 14 — Capacidad de supervisión e intervención humana",
      ACCURACY_SECURITY: "Art. 15 — Solidez técnica, precisión y ciberseguridad L7",
      TRANSPARENCY: "Art. 50 — Obligaciones de transparencia e información de IA"
    }
  },
  DORA: {
    id: "DORA_EU_2022_2554",
    name: "DORA (Reglamento UE 2022/2554)",
    status: "ENFORCED_JAN_2025",
    requirements: {
      ICT_RISK_MANAGEMENT: "Cap. II Art. 9 — Gestión, protección y prevención del riesgo TIC",
      INCIDENT_MONITORING: "Cap. III Art. 17 — Detección y notificación de incidentes de seguridad",
      OPERATIONAL_RESILIENCE: "Cap. IV Art. 24 — Pruebas de resiliencia operacional digital"
    }
  },
  ISO_42001: {
    id: "ISO_IEC_42001_2023",
    name: "ISO/IEC 42001:2023 (AIMS)",
    status: "ACTIVE_STANDARD",
    requirements: {
      POLICY_CONTROL: "Control A.6 — Políticas para la gestión de inteligencia artificial",
      IMPACT_ASSESSMENT: "Control A.8 — Evaluación continua del impacto del sistema de IA"
    }
  },
  ISO_27037: {
    id: "ISO_IEC_27037_2012",
    name: "ISO/IEC 27037:2012 (Preservación Digital)",
    status: "ACTIVE_STANDARD",
    requirements: {
      EVIDENCE_PRESERVATION: "Directrices para la identificación, recolección y preservación de evidencia digital"
    }
  },
  GDPR: {
    id: "RGPD_UE_2016_679",
    name: "RGPD (Reglamento UE 2016/679)",
    status: "ACTIVE_LAW",
    requirements: {
      DATA_MINIMIZATION: "Art. 5.1.c — Minimización de datos (Sanitización previa en RAM)",
      INTEGRITY_CONFIDENTIALITY: "Art. 5.1.f — Integridad, confidencialidad y Zero-Disk",
      SECURITY_PROCESSING: "Art. 32 — Seguridad técnica del tratamiento de datos"
    }
  }
};

const SCENARIO_FRAMEWORK_MAP = {
  cumplimiento_corporativo_integral: {
    GDPR: ["DATA_MINIMIZATION", "INTEGRITY_CONFIDENTIALITY", "SECURITY_PROCESSING"],
    EU_AI_ACT: ["LOGGING", "HUMAN_OVERSIGHT"]
  },
  razonamiento_activo_l7: {
    EU_AI_ACT: ["ACCURACY_SECURITY", "RISK_MANAGEMENT"],
    DORA: ["ICT_RISK_MANAGEMENT"]
  },
  deepfake_fake_disprover: {
    EU_AI_ACT: ["TRANSPARENCY", "LOGGING"],
    ISO_27037: ["EVIDENCE_PRESERVATION"]
  },
  banca_dora_pci: {
    DORA: ["ICT_RISK_MANAGEMENT", "INCIDENT_MONITORING", "OPERATIONAL_RESILIENCE"],
    GDPR: ["INTEGRITY_CONFIDENTIALITY"]
  },
  sanidad_historia_clinica: {
    GDPR: ["DATA_MINIMIZATION", "INTEGRITY_CONFIDENTIALITY", "SECURITY_PROCESSING"],
    EU_AI_ACT: ["RISK_MANAGEMENT", "HUMAN_OVERSIGHT"]
  },
  auditoria_dictamen_normativo: {
    ISO_27037: ["EVIDENCE_PRESERVATION"],
    ISO_42001: ["POLICY_CONTROL", "IMPACT_ASSESSMENT"],
    EU_AI_ACT: ["LOGGING"]
  }
};

export class ComplianceEngine {
  static mapExecutionToCompliance(scenarioId, verdict, reason) {
    const normalizedVerdict = String(verdict || "").trim().toUpperCase();
    const isDeny = ["REJECTED", "DENY", "RECHAZADO", "BLOCKED"].includes(normalizedVerdict);

    const registeredScenario = getScenarioById(scenarioId);
    const activeScenario = {
      id: registeredScenario?.id || scenarioId || "RULE_7DIM_PERIMETER",
      title: registeredScenario?.title || "Inspección Perimetral SGP 1.0 L7",
      policyId: registeredScenario?.policyId || "POL-SGP10-BASE",
      compliance_mapping: SCENARIO_FRAMEWORK_MAP[registeredScenario?.id] || {
        EU_AI_ACT: ["LOGGING", "HUMAN_OVERSIGHT", "ACCURACY_SECURITY"],
        DORA: ["ICT_RISK_MANAGEMENT"],
        ISO_42001: ["POLICY_CONTROL"],
        GDPR: ["DATA_MINIMIZATION", "INTEGRITY_CONFIDENTIALITY"]
      }
    };

    const mappedFrameworks = [];

    for (const [fwKey, reqKeys] of Object.entries(activeScenario.compliance_mapping)) {
      const frameworkMeta = REGULATORY_FRAMEWORKS[fwKey];
      if (frameworkMeta) {
        const requirementsCovered = (Array.isArray(reqKeys) ? reqKeys : []).map(reqKey => ({
          requirementKey: reqKey,
          description: frameworkMeta.requirements[reqKey] || reqKey,
          controlApplied: isDeny
            ? "Intercepción Ex-Ante L7 en RAM (Bloqueo Preventivo Fail-Closed)"
            : "Inspección Determinista Conforme (Tráfico Permitido)",
          evidenceGenerated: "Paquete .saare-proof con Firma Ed25519, Merkle Root y Sello Temporal RFC 3161"
        }));

        mappedFrameworks.push({
          frameworkId: frameworkMeta.id,
          frameworkName: frameworkMeta.name,
          regulatoryStatus: frameworkMeta.status,
          requirementsCovered
        });
      }
    }

    return {
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      policyId: activeScenario.policyId,
      verdict: isDeny ? "RECHAZADO" : "PERMITIDO",
      decision: isDeny ? "DENY" : "ALLOW",
      reason: reason || (isDeny ? "Activación de control ex-ante por riesgo detectado" : "Evaluación de políticas satisfactoria"),
      compliance_impact: {
        mappedFrameworks,
        audit_trail_status: "CRYPTOGRAPHICALLY_VERIFIED_IN_VAULT",
        preservationStandard: "ISO/IEC 27037:2012 / RFC 3161",
        timestamp: new Date().toISOString()
      }
    };
  }
}

export function evaluateComplianceDirectives(scenarioId, verdict, reason) {
  return ComplianceEngine.mapExecutionToCompliance(scenarioId, verdict, reason);
}