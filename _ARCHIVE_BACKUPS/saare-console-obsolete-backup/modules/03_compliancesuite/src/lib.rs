use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Minimal,
    Limited,
    High,
    Unacceptable,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EuAiActAssessment {
    pub risk_level: RiskLevel,
    pub art9_risk_management_active: bool,
    pub art12_record_keeping_active: bool,
    pub art14_human_oversight_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Iso42001AuditRecord {
    pub timestamp: u64,
    pub control_id: String,
    pub compliance_status: bool,
    pub evidence_hash: String,
}

pub struct ComplianceEngine;

impl ComplianceEngine {
    pub fn new() -> Self {
        Self
    }

    pub fn evaluate_eu_ai_act(&self, high_risk_context: bool) -> EuAiActAssessment {
        let risk_level = if high_risk_context {
            RiskLevel::High
        } else {
            RiskLevel::Limited
        };

        EuAiActAssessment {
            risk_level,
            art9_risk_management_active: true,
            art12_record_keeping_active: true,
            art14_human_oversight_active: true,
        }
    }

    pub fn generate_iso_record(&self, control_id: &str, status: bool) -> Iso42001AuditRecord {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        Iso42001AuditRecord {
            timestamp,
            control_id: control_id.to_string(),
            compliance_status: status,
            evidence_hash: format!(
                "{:x}",
                md5::compute(format!("{}:{}", control_id, timestamp))
            ),
        }
    }
}

impl Default for ComplianceEngine {
    fn default() -> Self {
        Self::new()
    }
}
