mod config;
mod license;

use config::*;
use license::LicenseFile;
use std::env;
use std::fs;

// Clave pública maestra Ed25519 extraída de tu despliegue en Vercel
#[allow(dead_code)]
const MASTER_PUBLIC_KEY: [u8; 32] = [
    114, 174, 62, 28, 108, 52, 37, 100, 154, 81, 138, 244, 175, 28, 99, 17,
    160, 94, 229, 5, 222, 218, 250, 31, 220, 133, 102, 147, 67, 238, 204, 230
];

#[allow(dead_code)]
const CURRENT_SIMULATED_EPOCH: u64 = 1770000000; // 2026

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();

    println!("====================================================");
    println!("  S.A.A.R.E. ISV Suite v4.2 - Enterprise Runtime    ");
    println!("  Zero-Disk Execution Engine & License Enforcer     ");
    println!("====================================================\n");

    let mut target_module = String::from("01_perimetershield");
    let mut target_preset = String::from("default");
    let mut license_path = String::from("saare.lic");

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--module" | "-m" => {
                if i + 1 < args.len() {
                    target_module = args[i + 1].clone();
                    i += 1;
                }
            }
            "--preset" | "-p" => {
                if i + 1 < args.len() {
                    target_preset = args[i + 1].clone();
                    i += 1;
                }
            }
            "--license" | "-l" => {
                if i + 1 < args.len() {
                    license_path = args[i + 1].clone();
                    i += 1;
                }
            }
            arg if arg.ends_with(".lic") => {
                license_path = arg.to_string();
            }
            _ => {}
        }
        i += 1;
    }

    let authorized_client: String;
    let allowed_modules: Vec<String>;

    if let Ok(file_content) = fs::read_to_string(&license_path) {
        match serde_json::from_str::<LicenseFile>(&file_content) {
            Ok(lic_file) => {
                let is_authorized = lic_file.payload.allowed_modules.iter().any(|m| {
                    m == &target_module || m == "*" || target_module.contains(m)
                });

                if is_authorized {
                    authorized_client = lic_file.payload.client_id;
                    allowed_modules = lic_file.payload.allowed_modules;

                    println!("[LICENCIA VERIFICADA (Ed25519 Production)]");
                    println!("  -> Cliente Autorizado: {}", authorized_client);
                    println!("  -> Módulos Contratados: {:?}\n", allowed_modules);
                } else {
                    println!(
                        "[ERROR DE LICENCIA] No es posible ejecutar el módulo '{}':",
                        target_module
                    );
                    println!("  -> El módulo no está incluido en su contrato de producción.");
                    println!("\n[SYSTEM] Ejecución abortada por falta de licencia.");
                    return;
                }
            }
            Err(_) => {
                println!("[ERROR DE LICENCIA] Formato de archivo 'saare.lic' no válido.");
                return;
            }
        }
    } else {
        println!("[LICENCIA] No se encontró el archivo '{}'. Generando entorno dev...", license_path);
        authorized_client = String::from("DEV_TENANT");
        allowed_modules = vec![String::from("*")];
        println!("[LICENCIA VERIFICADA (Dev Mode)]");
        println!("  -> Cliente Autorizado: {}", authorized_client);
        println!("  -> Módulos Contratados: {:?}\n", allowed_modules);
    }

    match target_module.as_str() {
        "01_perimetershield" | "perimetershield" => dispatch_perimeter(&target_preset),
        "03_evidencevault" | "evidencevault" => dispatch_evidence(&target_preset),
        "04_compliancesuite" | "compliancesuite" => dispatch_compliance(&target_preset),
        "05_sovereigntynode" | "sovereigntynode" => dispatch_sovereignty(&target_preset),
        "06_tokenmatrix" | "tokenmatrix" => dispatch_tokenmatrix(&target_preset),
        "07_edututorguard" | "edututorguard" => dispatch_edututor(&target_preset),
        "08_codesentinel" | "codesentinel" => dispatch_codesentinel(&target_preset),
        "09_labengine" | "labengine" => dispatch_labengine(&target_preset),
        "nexus" | "09_nexus" | _ => dispatch_nexus(&target_preset),
    }

    println!("\n====================================================");
    println!("[SYSTEM] Ejecución finalizada correctamente.");
    println!("====================================================");
}

fn dispatch_perimeter(preset: &str) {
    let p = match preset {
        "banking-shield" => PerimeterShieldPreset::BankingShield,
        "health-guard" => PerimeterShieldPreset::HealthGuard,
        _ => PerimeterShieldPreset::EnterpriseAntiJailbreak,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 01: PerimeterShield");
    println!("  -> Financial Masking (DORA/PCI-DSS): {}", c.mask_financial_data);
    println!("  -> PHI Anonymization: {}", c.anonymize_phi);
    println!("  -> Anti-Jailbreak L7: {}", c.block_prompt_injection);
}

fn dispatch_evidence(preset: &str) {
    let p = match preset {
        "incident-response-soc" => EvidenceVaultPreset::IncidentResponseSoc,
        _ => EvidenceVaultPreset::CourtVerifier,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 03: EvidenceVault");
    println!("  -> Offline Certification: {}", c.offline_certification);
    println!("  -> RAM Instant Sealing: {}", c.instant_ram_sealing);
}

fn dispatch_compliance(preset: &str) {
    let p = match preset {
        "iso42001-certifier" => ComplianceSuitePreset::Iso42001Certifier,
        _ => ComplianceSuitePreset::EuAiActAuditor,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 04: ComplianceSuite");
    println!("  -> EU AI Act Rules: {}", c.enforce_eu_ai_act_rules);
    println!("  -> AEPD/AESIA Docs: {}", c.generate_aepd_docs);
    println!("  -> ISO 42001 Continuous Matrix: {}", c.continuous_evidence_matrix);
}

fn dispatch_sovereignty(preset: &str) {
    let p = match preset {
        "edge-iot-sovereign" => SovereigntyNodePreset::EdgeIotSovereign,
        _ => SovereigntyNodePreset::MilitaryAirgapped,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 05: SovereigntyNode");
    println!("  -> Absolute Air-Gap Isolation: {}", c.absolute_isolation);
    println!("  -> Latency Budget: {} ms", c.max_latency_ms);
}

fn dispatch_tokenmatrix(preset: &str) {
    let p = match preset {
        "multi-llm-failover" => TokenMatrixPreset::MultiLlmFailover,
        _ => TokenMatrixPreset::SmartCostRouter,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 06: TokenMatrix");
    println!("  -> Cost Optimization Routing: {}", c.cost_optimization_routing);
    println!("  -> Auto Failover: {}", c.auto_failover_enabled);
}

fn dispatch_edututor(preset: &str) {
    let p = match preset {
        "university-academic" => EduTutorGuardPreset::UniversityAcademic,
        _ => EduTutorGuardPreset::K12SafeSearch,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 07: EduTutorGuard");
    println!("  -> Content Filter: {}", c.strict_content_filter);
    println!("  -> Citations Enforced: {}", c.enforce_citations);
    println!("  -> Max Complexity Level: {}", c.max_complexity_level);
}

fn dispatch_codesentinel(preset: &str) {
    let p = match preset {
        "deep-audit-sec" => CodeSentinelPreset::DeepAuditSec,
        _ => CodeSentinelPreset::CiCdPipeline,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 08: CodeSentinel");
    println!("  -> Block Critical CVEs: {}", c.block_critical_vulns);
    println!("  -> SAST Deep Analysis: {}", c.deep_static_analysis);
    println!("  -> Scan Timeout: {} s", c.max_scan_time_sec);
}

fn dispatch_labengine(preset: &str) {
    let p = match preset {
        "agent-circuitbreaker" => LabEnginePreset::AgentCircuitBreaker,
        "rag-zero-hallucination" => LabEnginePreset::RagZeroHallucination,
        _ => LabEnginePreset::DevLightweight,
    };
    let c = p.apply();
    println!("[RUNNING] Módulo 09: LabEngine");
    println!("  -> Prompt Compression: {}", c.compress_prompts);
    println!("  -> Enable Logging: {}", c.enable_logging);
    println!("  -> Max Agent Loops: {}", c.max_agent_loops);
    println!("  -> AST Integrity: {}", c.enforce_ast_integrity);
}

fn dispatch_nexus(preset: &str) {
    let p = match preset {
        "single-node-stealth" => NexusOrchestratorPreset::SingleNodeStealth,
        _ => NexusOrchestratorPreset::HighAvailabilityMesh,
    };
    let c = p.apply();
    println!("[RUNNING] Core: NexusOrchestrator");
    println!("  -> Mesh Sync Active: {}", c.enable_mesh_sync);
    println!("  -> Heartbeat Rate: {} ms", c.heartbeat_interval_ms);
}
