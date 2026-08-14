// ============================================================================
// S.A.A.R.E. ISV Suite v4.2 - Centralized Preset Configuration Manager
// Zero-Disk Runtime Memory Presets (Modules 01 to 09)
// ============================================================================

// --- MÓDULO 01: PerimeterShield ---
#[derive(Debug, PartialEq)]
pub enum PerimeterShieldPreset {
    BankingShield,
    HealthGuard,
    EnterpriseAntiJailbreak,
}
#[derive(Debug, PartialEq)]
pub struct PerimeterShieldConfig {
    pub mask_financial_data: bool,
    pub anonymize_phi: bool,
    pub block_prompt_injection: bool,
}

impl PerimeterShieldPreset {
    pub fn apply(&self) -> PerimeterShieldConfig {
        match self {
            PerimeterShieldPreset::BankingShield => PerimeterShieldConfig {
                mask_financial_data: true,
                anonymize_phi: false,
                block_prompt_injection: true,
            },
            PerimeterShieldPreset::HealthGuard => PerimeterShieldConfig {
                mask_financial_data: false,
                anonymize_phi: true,
                block_prompt_injection: true,
            },
            PerimeterShieldPreset::EnterpriseAntiJailbreak => PerimeterShieldConfig {
                mask_financial_data: false,
                anonymize_phi: false,
                block_prompt_injection: true,
            },
        }
    }
}

// --- MÓDULO 03: EvidenceVault ---
#[derive(Debug, PartialEq)]
pub enum EvidenceVaultPreset {
    CourtVerifier,
    IncidentResponseSoc,
}
#[derive(Debug, PartialEq)]
pub struct EvidenceVaultConfig {
    pub offline_certification: bool,
    pub instant_ram_sealing: bool,
}

impl EvidenceVaultPreset {
    pub fn apply(&self) -> EvidenceVaultConfig {
        match self {
            EvidenceVaultPreset::CourtVerifier => EvidenceVaultConfig {
                offline_certification: true,
                instant_ram_sealing: false,
            },
            EvidenceVaultPreset::IncidentResponseSoc => EvidenceVaultConfig {
                offline_certification: false,
                instant_ram_sealing: true,
            },
        }
    }
}

// --- MÓDULO 04: ComplianceSuite ---
#[derive(Debug, PartialEq)]
pub enum ComplianceSuitePreset {
    EuAiActAuditor,
    Iso42001Certifier,
}
#[derive(Debug, PartialEq)]
pub struct ComplianceSuiteConfig {
    pub enforce_eu_ai_act_rules: bool,
    pub generate_aepd_docs: bool,
    pub continuous_evidence_matrix: bool,
}

impl ComplianceSuitePreset {
    pub fn apply(&self) -> ComplianceSuiteConfig {
        match self {
            ComplianceSuitePreset::EuAiActAuditor => ComplianceSuiteConfig {
                enforce_eu_ai_act_rules: true,
                generate_aepd_docs: true,
                continuous_evidence_matrix: false,
            },
            ComplianceSuitePreset::Iso42001Certifier => ComplianceSuiteConfig {
                enforce_eu_ai_act_rules: false,
                generate_aepd_docs: false,
                continuous_evidence_matrix: true,
            },
        }
    }
}

// --- MÓDULO 05: SovereigntyNode ---
#[derive(Debug, PartialEq)]
pub enum SovereigntyNodePreset {
    MilitaryAirgapped,
    EdgeIotSovereign,
}
#[derive(Debug, PartialEq)]
pub struct SovereigntyNodeConfig {
    pub absolute_isolation: bool,
    pub max_latency_ms: f32,
}

impl SovereigntyNodePreset {
    pub fn apply(&self) -> SovereigntyNodeConfig {
        match self {
            SovereigntyNodePreset::MilitaryAirgapped => SovereigntyNodeConfig {
                absolute_isolation: true,
                max_latency_ms: 0.0,
            },
            SovereigntyNodePreset::EdgeIotSovereign => SovereigntyNodeConfig {
                absolute_isolation: false,
                max_latency_ms: 1.5,
            },
        }
    }
}

// --- MÓDULO 06: TokenMatrix ---
#[derive(Debug, PartialEq)]
pub enum TokenMatrixPreset {
    SmartCostRouter,
    MultiLlmFailover,
}
#[derive(Debug, PartialEq)]
pub struct TokenMatrixConfig {
    pub cost_optimization_routing: bool,
    pub auto_failover_enabled: bool,
}

impl TokenMatrixPreset {
    pub fn apply(&self) -> TokenMatrixConfig {
        match self {
            TokenMatrixPreset::SmartCostRouter => TokenMatrixConfig {
                cost_optimization_routing: true,
                auto_failover_enabled: false,
            },
            TokenMatrixPreset::MultiLlmFailover => TokenMatrixConfig {
                cost_optimization_routing: false,
                auto_failover_enabled: true,
            },
        }
    }
}

// --- MÓDULO 07: EduTutorGuard ---
#[derive(Debug, PartialEq)]
pub enum EduTutorGuardPreset {
    K12SafeSearch,
    UniversityAcademic,
}
#[derive(Debug, PartialEq)]
pub struct EduTutorGuardConfig {
    pub strict_content_filter: bool,
    pub enforce_citations: bool,
    pub max_complexity_level: u8,
}

impl EduTutorGuardPreset {
    pub fn apply(&self) -> EduTutorGuardConfig {
        match self {
            EduTutorGuardPreset::K12SafeSearch => EduTutorGuardConfig {
                strict_content_filter: true,
                enforce_citations: false,
                max_complexity_level: 3,
            },
            EduTutorGuardPreset::UniversityAcademic => EduTutorGuardConfig {
                strict_content_filter: false,
                enforce_citations: true,
                max_complexity_level: 10,
            },
        }
    }
}

// --- MÓDULO 08: CodeSentinel ---
#[derive(Debug, PartialEq)]
pub enum CodeSentinelPreset {
    CiCdPipeline,
    DeepAuditSec,
}
#[derive(Debug, PartialEq)]
pub struct CodeSentinelConfig {
    pub block_critical_vulns: bool,
    pub deep_static_analysis: bool,
    pub max_scan_time_sec: u32,
}

impl CodeSentinelPreset {
    pub fn apply(&self) -> CodeSentinelConfig {
        match self {
            CodeSentinelPreset::CiCdPipeline => CodeSentinelConfig {
                block_critical_vulns: true,
                deep_static_analysis: false,
                max_scan_time_sec: 45,
            },
            CodeSentinelPreset::DeepAuditSec => CodeSentinelConfig {
                block_critical_vulns: true,
                deep_static_analysis: true,
                max_scan_time_sec: 1200,
            },
        }
    }
}

// --- MÓDULO 09: LabEngine ---
#[derive(Debug, PartialEq)]
pub enum LabEnginePreset {
    DevLightweight,
    AgentCircuitBreaker,
    RagZeroHallucination,
}
#[derive(Debug, PartialEq)]
pub struct LabEngineConfig {
    pub compress_prompts: bool,
    pub enable_logging: bool,
    pub max_agent_loops: u32,
    pub enforce_ast_integrity: bool,
}

impl LabEnginePreset {
    pub fn apply(&self) -> LabEngineConfig {
        match self {
            LabEnginePreset::DevLightweight => LabEngineConfig {
                compress_prompts: true,
                enable_logging: false,
                max_agent_loops: 10,
                enforce_ast_integrity: false,
            },
            LabEnginePreset::AgentCircuitBreaker => LabEngineConfig {
                compress_prompts: false,
                enable_logging: true,
                max_agent_loops: 3,
                enforce_ast_integrity: false,
            },
            LabEnginePreset::RagZeroHallucination => LabEngineConfig {
                compress_prompts: false,
                enable_logging: true,
                max_agent_loops: 5,
                enforce_ast_integrity: true,
            },
        }
    }
}

// --- MÓDULO CENTRAL: NexusOrchestrator ---
#[derive(Debug, PartialEq)]
pub enum NexusOrchestratorPreset {
    HighAvailabilityMesh,
    SingleNodeStealth,
}
#[derive(Debug, PartialEq)]
pub struct NexusOrchestratorConfig {
    pub enable_mesh_sync: bool,
    pub heartbeat_interval_ms: u32,
}

impl NexusOrchestratorPreset {
    pub fn apply(&self) -> NexusOrchestratorConfig {
        match self {
            NexusOrchestratorPreset::HighAvailabilityMesh => NexusOrchestratorConfig {
                enable_mesh_sync: true,
                heartbeat_interval_ms: 10,
            },
            NexusOrchestratorPreset::SingleNodeStealth => NexusOrchestratorConfig {
                enable_mesh_sync: false,
                heartbeat_interval_ms: 0,
            },
        }
    }
}

// ============================================================================
// UNIT TESTS SUITE FOR ZERO-DISK PRESETS
// ============================================================================
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_perimeter_shield_presets() {
        let bank = PerimeterShieldPreset::BankingShield.apply();
        assert!(bank.mask_financial_data);
        assert!(!bank.anonymize_phi);
        assert!(bank.block_prompt_injection);

        let health = PerimeterShieldPreset::HealthGuard.apply();
        assert!(!health.mask_financial_data);
        assert!(health.anonymize_phi);

        let anti_jailbreak = PerimeterShieldPreset::EnterpriseAntiJailbreak.apply();
        assert!(anti_jailbreak.block_prompt_injection);
    }

    #[test]
    fn test_evidence_vault_presets() {
        let court = EvidenceVaultPreset::CourtVerifier.apply();
        assert!(court.offline_certification);
        assert!(!court.instant_ram_sealing);

        let soc = EvidenceVaultPreset::IncidentResponseSoc.apply();
        assert!(!soc.offline_certification);
        assert!(soc.instant_ram_sealing);
    }

    #[test]
    fn test_compliance_suite_presets() {
        let eu_act = ComplianceSuitePreset::EuAiActAuditor.apply();
        assert!(eu_act.enforce_eu_ai_act_rules);
        assert!(eu_act.generate_aepd_docs);

        let iso = ComplianceSuitePreset::Iso42001Certifier.apply();
        assert!(iso.continuous_evidence_matrix);
        assert!(!iso.enforce_eu_ai_act_rules);
    }

    #[test]
    fn test_sovereignty_node_presets() {
        let military = SovereigntyNodePreset::MilitaryAirgapped.apply();
        assert!(military.absolute_isolation);
        assert_eq!(military.max_latency_ms, 0.0);

        let iot = SovereigntyNodePreset::EdgeIotSovereign.apply();
        assert!(!iot.absolute_isolation);
        assert_eq!(iot.max_latency_ms, 1.5);
    }

    #[test]
    fn test_token_matrix_presets() {
        let cost = TokenMatrixPreset::SmartCostRouter.apply();
        assert!(cost.cost_optimization_routing);
        assert!(!cost.auto_failover_enabled);

        let failover = TokenMatrixPreset::MultiLlmFailover.apply();
        assert!(failover.auto_failover_enabled);
    }

    #[test]
    fn test_edu_tutor_guard_presets() {
        let k12 = EduTutorGuardPreset::K12SafeSearch.apply();
        assert!(k12.strict_content_filter);
        assert_eq!(k12.max_complexity_level, 3);

        let uni = EduTutorGuardPreset::UniversityAcademic.apply();
        assert!(uni.enforce_citations);
        assert_eq!(uni.max_complexity_level, 10);
    }

    #[test]
    fn test_code_sentinel_presets() {
        let cicd = CodeSentinelPreset::CiCdPipeline.apply();
        assert!(cicd.block_critical_vulns);
        assert_eq!(cicd.max_scan_time_sec, 45);

        let audit = CodeSentinelPreset::DeepAuditSec.apply();
        assert!(audit.deep_static_analysis);
        assert_eq!(audit.max_scan_time_sec, 1200);
    }

    #[test]
    fn test_lab_engine_presets() {
        let dev = LabEnginePreset::DevLightweight.apply();
        assert!(dev.compress_prompts);

        let cb = LabEnginePreset::AgentCircuitBreaker.apply();
        assert_eq!(cb.max_agent_loops, 3);

        let rag = LabEnginePreset::RagZeroHallucination.apply();
        assert!(rag.enforce_ast_integrity);
    }

    #[test]
    fn test_nexus_orchestrator_presets() {
        let ha = NexusOrchestratorPreset::HighAvailabilityMesh.apply();
        assert!(ha.enable_mesh_sync);
        assert_eq!(ha.heartbeat_interval_ms, 10);

        let stealth = NexusOrchestratorPreset::SingleNodeStealth.apply();
        assert!(!stealth.enable_mesh_sync);
        assert_eq!(stealth.heartbeat_interval_ms, 0);
    }
}
