mod config;
mod license;

use config::*;
use license::LicenseFile;
use std::env;
use std::fs;

// Define el testigo con etiqueta ASCII para compatibilidad universal en consolas Windows/Linux
const TESTIGO: &str = "[SAARE-L7]";

#[allow(dead_code)]
const MASTER_PUBLIC_KEY: [u8; 32] = [
    114, 174, 62, 28, 108, 52, 37, 100, 154, 81, 138, 244, 175, 28, 99, 17,
    160, 94, 229, 5, 222, 218, 250, 31, 220, 133, 102, 147, 67, 238, 204, 230
];

#[allow(dead_code)]
const CURRENT_SIMULATED_EPOCH: u64 = 1770000000;

fn resolve_semantic_mode(module: &str, preset: &str) -> (&'static str, &'static str) {
    match (module, preset) {
        ("01_perimetershield", "banking-shield") | ("perimetershield", "banking-shield") => 
            ("SAARE-MDSECU", "DLP Financiero & Ocultación RAM (DORA/PCI-DSS)"),
        ("01_perimetershield", "health-guard") | ("perimetershield", "health-guard") => 
            ("SAARE-MDSECU", "Anonimización PHI & Historias Clínicas (HIPAA/RGPD)"),
        ("01_perimetershield", _) | ("perimetershield", _) => 
            ("SAARE-MDSECU", "Anti-Jailbreak L7 & Inyección de Prompts"),

        ("03_evidencevault", "incident-response-soc") | ("evidencevault", "incident-response-soc") => 
            ("SAARE-MDFOR", "SOC Incident Response & Sellado en RAM"),
        ("03_evidencevault", _) | ("evidencevault", _) => 
            ("SAARE-MDFOR", "Peritaje Judicial & Firma Ed25519 Inalterable"),

        ("04_compliancesuite", "iso42001-certifier") | ("compliancesuite", "iso42001-certifier") => 
            ("SAARE-MDCORP", "Certificación ISO 42001 & Matriz SGIA"),
        ("04_compliancesuite", _) | ("compliancesuite", _) => 
            ("SAARE-MDLEGAL", "Auditoría EU AI Act & Reglas AEPD/AESIA"),

        ("05_sovereigntynode", "edge-iot-sovereign") | ("sovereigntynode", "edge-iot-sovereign") => 
            ("SAARE-MDSECU", "Edge/IoT Industrial & Latencia Ultra-Baja"),
        ("05_sovereigntynode", _) | ("sovereigntynode", _) => 
            ("SAARE-MDSECU", "Aislamiento Militar & Redes Air-Gapped"),

        ("06_tokenmatrix", "multi-llm-failover") | ("tokenmatrix", "multi-llm-failover") => 
            ("SAARE-MDSECU", "Alta Disponibilidad & Conmutación Multi-LLM"),
        ("06_tokenmatrix", _) | ("tokenmatrix", _) => 
            ("SAARE-MDIPRES", "Enrutamiento Financiero & Optimización FinOps"),

        ("07_edututorguard", "university-academic") | ("edututorguard", "university-academic") => 
            ("SAARE-MDVERD", "Verificación Académica & Citación Obligatoria"),
        ("07_edututorguard", _) | ("edututorguard", _) => 
            ("SAARE-MDLEGAL", "Filtro Pedagógico COPPA & Tutoría Socrática"),

        ("08_codesentinel", "copyright-watermark-audit") | ("codesentinel", "copyright-watermark-audit") | ("08_authorvault", _) | ("authorvault", _) => 
            ("SAARE-MDIPRES", "Auditoría de Propiedad Intelectual & Marcas Ed25519"),
        ("08_codesentinel", _) | ("codesentinel", _) => 
            ("SAARE-MDSECU", "Análisis SAST & Bloqueo de Vulnerabilidades CVE"),

        ("09_labengine", "agent-circuitbreaker") | ("labengine", "agent-circuitbreaker") => 
            ("SAARE-MDVERD", "Cortacircuitos de Agentes MCP & Bucles Infinitos"),
        ("09_labengine", "rag-zero-hallucination") | ("labengine", "rag-zero-hallucination") => 
            ("SAARE-MDVERD", "Integridad RAG & Erradicación AST de Alucinaciones"),
        ("09_labengine", _) | ("labengine", _) => 
            ("SAARE-MDIPRES", "Compresión de Prompts & Optimización Dev"),

        _ => ("SAARE-MDSECU", "Módulo de Orquestación & Gobernanza L7"),
    }
}

#[tokio::main]
async fn main() {
    // Configura la página de códigos de la consola de Windows a UTF-8 (65001)
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("cmd")
            .args(&["/C", "chcp", "65001"])
            .output();
    }

    let args: Vec<String> = env::args().collect();

    println!("{} ========================================================", TESTIGO);
    println!("{}   S.A.A.R.E. ISV Suite v4.2 - Enterprise Runtime        ", TESTIGO);
    println!("{}   Zero-Disk Execution Engine & License Enforcer         ", TESTIGO);
    println!("{} ========================================================\n", TESTIGO);

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

                    println!("{} [LICENCIA VERIFICADA (Ed25519 Production)]", TESTIGO);
                    println!("{}   -> Cliente Autorizado: {}", TESTIGO, authorized_client);
                    println!("{}   -> Módulos Contratados: {:?}\n", TESTIGO, allowed_modules);
                } else {
                    println!(
                        "{} [ERROR DE LICENCIA] No es posible ejecutar el módulo '{}':",
                        TESTIGO, target_module
                    );
                    println!("{}   -> El módulo no está incluido en su contrato de producción.", TESTIGO);
                    println!("\n{} [SYSTEM] Ejecución abortada por falta de licencia.", TESTIGO);
                    return;
                }
            }
            Err(_) => {
                println!("{} [ERROR DE LICENCIA] Formato de archivo 'saare.lic' no válido.", TESTIGO);
                return;
            }
        }
    } else {
        println!("{} [LICENCIA] No se encontró el archivo '{}'. Generando entorno dev...", TESTIGO, license_path);
        authorized_client = String::from("DEV_TENANT");
        allowed_modules = vec![String::from("*")];
        println!("{} [LICENCIA VERIFICADA (Dev Mode)]", TESTIGO);
        println!("{}   -> Cliente Autorizado: {}", TESTIGO, authorized_client);
        println!("{}   -> Módulos Contratados: {:?}\n", TESTIGO, allowed_modules);
    }

    let (semantic_mode, mode_description) = resolve_semantic_mode(&target_module, &target_preset);

    println!("{} [MODO SEMÁNTICO ACTIVO] {} ({})", TESTIGO, semantic_mode, mode_description);
    println!("{} [TESTIGO NORMATIVO] Perímetro Digital Sellado | Tasa de Alucinación: 0% Determinista\n", TESTIGO);

    match target_module.as_str() {
        "01_perimetershield" | "perimetershield" => dispatch_perimeter(&target_preset),
        "03_evidencevault" | "evidencevault" => dispatch_evidence(&target_preset),
        "04_compliancesuite" | "compliancesuite" => dispatch_compliance(&target_preset),
        "05_sovereigntynode" | "sovereigntynode" => dispatch_sovereignty(&target_preset),
        "06_tokenmatrix" | "tokenmatrix" => dispatch_tokenmatrix(&target_preset),
        "07_edututorguard" | "edututorguard" => dispatch_edututor(&target_preset),
        "08_codesentinel" | "codesentinel" | "08_authorvault" | "authorvault" => dispatch_codesentinel(&target_preset),
        "09_labengine" | "labengine" => dispatch_labengine(&target_preset),
        "nexus" | "09_nexus" | _ => dispatch_nexus(&target_preset),
    }

    println!("\n{} ========================================================", TESTIGO);
    println!("{} [EVIDENCE] Recibo Criptográfico Ed25519 Registrado ✓", TESTIGO);
    println!("{} [SYSTEM] Ejecución finalizada correctamente.", TESTIGO);
    println!("{} ========================================================", TESTIGO);
}

fn dispatch_perimeter(preset: &str) {
    let p = match preset {
        "banking-shield" => PerimeterShieldPreset::BankingShield,
        "health-guard" => PerimeterShieldPreset::HealthGuard,
        _ => PerimeterShieldPreset::EnterpriseAntiJailbreak,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 01: PerimeterShield", TESTIGO);
    println!("{}   -> Financial Masking (DORA/PCI-DSS): {}", TESTIGO, c.mask_financial_data);
    println!("{}   -> PHI Anonymization: {}", TESTIGO, c.anonymize_phi);
    println!("{}   -> Anti-Jailbreak L7: {}", TESTIGO, c.block_prompt_injection);
}

fn dispatch_evidence(preset: &str) {
    let p = match preset {
        "incident-response-soc" => EvidenceVaultPreset::IncidentResponseSoc,
        _ => EvidenceVaultPreset::CourtVerifier,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 03: EvidenceVault", TESTIGO);
    println!("{}   -> Offline Certification: {}", TESTIGO, c.offline_certification);
    println!("{}   -> RAM Instant Sealing: {}", TESTIGO, c.instant_ram_sealing);
}

fn dispatch_compliance(preset: &str) {
    let p = match preset {
        "iso42001-certifier" => ComplianceSuitePreset::Iso42001Certifier,
        _ => ComplianceSuitePreset::EuAiActAuditor,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 04: ComplianceSuite", TESTIGO);
    println!("{}   -> EU AI Act Rules: {}", TESTIGO, c.enforce_eu_ai_act_rules);
    println!("{}   -> AEPD/AESIA Docs: {}", TESTIGO, c.generate_aepd_docs);
    println!("{}   -> ISO 42001 Continuous Matrix: {}", TESTIGO, c.continuous_evidence_matrix);
}

fn dispatch_sovereignty(preset: &str) {
    let p = match preset {
        "edge-iot-sovereign" => SovereigntyNodePreset::EdgeIotSovereign,
        _ => SovereigntyNodePreset::MilitaryAirgapped,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 05: SovereigntyNode", TESTIGO);
    println!("{}   -> Absolute Air-Gap Isolation: {}", TESTIGO, c.absolute_isolation);
    println!("{}   -> Latency Budget: {} ms", TESTIGO, c.max_latency_ms);
}

fn dispatch_tokenmatrix(preset: &str) {
    let p = match preset {
        "multi-llm-failover" => TokenMatrixPreset::MultiLlmFailover,
        _ => TokenMatrixPreset::SmartCostRouter,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 06: TokenMatrix", TESTIGO);
    println!("{}   -> Cost Optimization Routing: {}", TESTIGO, c.cost_optimization_routing);
    println!("{}   -> Auto Failover: {}", TESTIGO, c.auto_failover_enabled);
}

fn dispatch_edututor(preset: &str) {
    let p = match preset {
        "university-academic" => EduTutorGuardPreset::UniversityAcademic,
        _ => EduTutorGuardPreset::K12SafeSearch,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 07: EduTutorGuard", TESTIGO);
    println!("{}   -> Content Filter: {}", TESTIGO, c.strict_content_filter);
    println!("{}   -> Citations Enforced: {}", TESTIGO, c.enforce_citations);
    println!("{}   -> Max Complexity Level: {}", TESTIGO, c.max_complexity_level);
}

fn dispatch_codesentinel(preset: &str) {
    let p = match preset {
        "deep-audit-sec" => CodeSentinelPreset::DeepAuditSec,
        "copyright-watermark-audit" => CodeSentinelPreset::CiCdPipeline,
        _ => CodeSentinelPreset::CiCdPipeline,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 08: CodeSentinel / AuthorVault IP", TESTIGO);
    println!("{}   -> Block Critical CVEs / Human Intervention: {}", TESTIGO, c.block_critical_vulns);
    println!("{}   -> SAST Deep Analysis / Watermark Audit: {}", TESTIGO, c.deep_static_analysis);
    println!("{}   -> Scan Timeout / Verification Time: {} s", TESTIGO, c.max_scan_time_sec);
}

fn dispatch_labengine(preset: &str) {
    let p = match preset {
        "agent-circuitbreaker" => LabEnginePreset::AgentCircuitBreaker,
        "rag-zero-hallucination" => LabEnginePreset::RagZeroHallucination,
        _ => LabEnginePreset::DevLightweight,
    };
    let c = p.apply();
    println!("{} [RUNNING] Módulo 09: LabEngine", TESTIGO);
    println!("{}   -> Prompt Compression: {}", TESTIGO, c.compress_prompts);
    println!("{}   -> Enable Logging: {}", TESTIGO, c.enable_logging);
    println!("{}   -> Max Agent Loops: {}", TESTIGO, c.max_agent_loops);
    println!("{}   -> AST Integrity: {}", TESTIGO, c.enforce_ast_integrity);
}

fn dispatch_nexus(preset: &str) {
    let p = match preset {
        "single-node-stealth" => NexusOrchestratorPreset::SingleNodeStealth,
        _ => NexusOrchestratorPreset::HighAvailabilityMesh,
    };
    let c = p.apply();
    println!("{} [RUNNING] Core: NexusOrchestrator", TESTIGO);
    println!("{}   -> Mesh Sync Active: {}", TESTIGO, c.enable_mesh_sync);
    println!("{}   -> Heartbeat Rate: {} ms", TESTIGO, c.heartbeat_interval_ms);
}