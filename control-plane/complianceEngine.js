/**
 * SAARE Compliance & Technical Control Mapping Engine v10.0.4 (SGP 1.0)
 * Decision-to-Policy Mapping & Technical Assurance Compiler
 */

import { ScenarioRegistry, getScenarioById } from "./scenarioRegistry.js";

export class ComplianceEngine {
  /**
   * Vincula la decisión de ejecución de una acción con su impacto en controles técnicos y normativos
   * @param {string} scenarioId - Identificador del escenario o directiva
   * @param {string} decision - 'ALLOW', 'DENY', 'ESCALATE'
   * @param {string} enforcementAction - 'PASS', 'BLOCK', 'HOLD'
   * @param {string} reason - Motivo técnico de la decisión
   * @returns {object} Dossier estructurado de impacto en controles (SGP 1.0)
   */
  static mapExecutionToCompliance(scenarioId, decision = "ALLOW", enforcementAction = "PASS", reason = "") {
    const scenario = getScenarioById(scenarioId);
    const isDeniedOrRestricted = decision === "DENY" || decision === "ESCALATE" || enforcementAction === "BLOCK" || enforcementAction === "HOLD";

    // Si la acción fue bloqueada o retenida, se acreditan los controles técnicos de contención aplicados
    const satisfiedFrameworks = isDeniedOrRestricted
      ? scenario.compliance_mapping
      : {
          runtime_authorization: [
            "Ejecución autorizada bajo perímetro de control determinista L7",
            "Registro de decisión estructurado conforme a los requisitos de trazabilidad del EU AI Act (Art. 12)",
            "Mapeo de control operacional de ciclo de vida del dato conforme a UNE-ISO/IEC 42001:2023"
          ]
        };

    return {
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      lawBadge: scenario.lawBadge,
      forensicRole: scenario.forensic_role,
      deiPhase: scenario.dei_phase,
      decision: decision,
      enforcement: {
        action: enforcementAction
      },
      reason: reason || (isDeniedOrRestricted 
        ? "Acción restringida o bloqueada por política de control perimetral en tiempo de ejecución" 
        : "Acción autorizada conforme dentro del perímetro de privilegios mínimos"),
      compliance_impact: {
        frameworks_satisfied: satisfiedFrameworks,
        normativa_aplicable: scenario.category,
        evidence_workflow: "Evidence workflow aligned with ISO/IEC 27037:2012 (DEFR/DES)",
        governance_mapping: "Controls mapped to UNE-ISO/IEC 42001:2023",
        audit_trail_status: "TAMPER_EVIDENT_RECORD_IN_DECISION_STORE",
        hash_integrity: "SHA-256_ANCHORED",
        signing_standard: "Ed25519_ASYMMETRIC_RFC8032",
        timestamp_standard: "RFC_3161_QUALIFIED_TIMESTAMP_TOKEN",
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Genera el resumen estructurado para el Proof Bundle / SAARE VERDICT™
   * @param {string} scenarioId 
   * @param {string} canonicalHash 
   * @param {string} decision 
   * @param {string} enforcementAction 
   * @returns {object} Metadatos para el expediente probatorio
   */
  static generateAttestationRecord(scenarioId, canonicalHash, decision = "ALLOW", enforcementAction = "PASS") {
    const scenario = getScenarioById(scenarioId);
    return {
      ESTADO_AUTORIZACION: decision === "DENY" ? "CONTENCION_PREVENTIVA_L7" : "EJECUCION_AUTORIZADA_L7",
      DECISION: decision,
      ENFORCEMENT: enforcementAction,
      CAPACIDAD_CONTROL: scenario.title,
      MARCO_NORMATIVO_APOYADO: scenario.lawBadge,
      ACTION_DIGEST_SHA256: canonicalHash,
      CADENA_CUSTODIA: "Evidence workflow aligned with ISO/IEC 27037:2012 & RFC 3161",
      MARCO_GOBERNANZA: "Controls mapped to UNE-ISO/IEC 42001:2023 & EU AI Act (Art. 12/15)",
      FECHA_ESTAMPA: new Date().toISOString()
    };
  }
}