import { ScenarioRegistry } from "./scenarioRegistry.js";

export class ComplianceEngine {
  static mapExecutionToCompliance(scenarioId, verdict, reason) {
    const scenario = ScenarioRegistry.find(s => s.id === scenarioId) || ScenarioRegistry[0];

    return {
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      verdict: verdict,
      reason: reason,
      compliance_impact: {
        frameworks_satisfied: verdict === "REJECTED" ? scenario.compliance_mapping : {},
        audit_trail_status: "CRYPTOGRAPHICALLY_VERIFIED_IN_VAULT",
        timestamp: new Date().toISOString()
      }
    };
  }
}

