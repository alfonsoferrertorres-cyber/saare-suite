use ed25519_dalek::{Signer, SigningKey};
use evidencevault::EvidenceVault;
use perimetershield::{LicensePayload, PerimeterShieldEngine, SignedLicenseToken};
use saare_core::get_audit_timestamp;
use std::process;

fn main() {
    println!("============================================================");
    println!("      S.A.A.R.E. ISV SUITE - ZERO-DISK RUNTIME ENGINE       ");
    println!("     Compliance: DORA Art.10 | NIS2 | ISO 27001 / ISO 42001");
    println!("============================================================\n");

    // 1. Simulación de Autoridad Emisora de Licencia
    let secret_bytes: [u8; 32] = rand::random();
    let signing_key = SigningKey::from_bytes(&secret_bytes);
    let verifying_key = signing_key.verifying_key();

    let payload = LicensePayload {
        client_id: "CLIENTE_FINANCIERO_PROD_01".to_string(),
        preset_id: "PRESET_ENTERPRISE_HIGH_SECURITY".to_string(),
        issued_at: get_audit_timestamp(),
        expires_at: "2030-12-31T23:59:59Z".to_string(),
        allowed_modules: vec![
            "01_perimetershield".to_string(),
            "02_evidencevault".to_string(),
        ],
    };

    let payload_bytes = match serde_json::to_vec(&payload) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("[CRITICAL] Error al serializar el payload de la licencia: {:?}", e);
            process::exit(1);
        }
    };

    let signature = signing_key.sign(&payload_bytes);

    let token = SignedLicenseToken {
        payload,
        signature: signature.to_bytes().to_vec(),
        public_key: *verifying_key.as_bytes(),
    };

    let token_json = serde_json::to_string(&token).unwrap();
    println!("[+] Licencia criptográfica generada y cargada en memoria.");

    // 2. Inicialización del Perímetro de Aislamiento
    println!("[*] Inicializando PerimeterShield Engine...");
    let engine = match PerimeterShieldEngine::bootstrap(&token_json) {
        Ok(eng) => {
            println!("[+] Perímetro autenticado y activo. Buffer de sesión protegido en RAM.");
            eng
        }
        Err(err) => {
            eprintln!("[FAIL] Bootstrapping cancelado por el perímetro: {:?}", err);
            process::exit(1);
        }
    };

    if !engine.is_active() {
        eprintln!("[FAIL] El buffer del perímetro no está activo.");
        process::exit(1);
    }

    // 3. Cadena de Auditoría Inmutable (EvidenceVault)
    println!("[*] Conectando la bóveda criptográfica EvidenceVault...");
    let mut vault = EvidenceVault::new(signing_key);

    vault.record_event("CLIENTE_FINANCIERO_PROD_01", "ISOLATED_ENV_INIT");
    vault.record_event("CLIENTE_FINANCIERO_PROD_01", "PAYLOAD_EXECUTION_ZERO_DISK");
    vault.record_event("CLIENTE_FINANCIERO_PROD_01", "MEMORY_CLEANUP_ZEROIZE");

    println!("[+] Eventos de ejecución registrados. Total registros en cadena: {}", vault.len());

    // 4. Verificación Auditada Final
    match vault.verify_integrity() {
        Ok(true) => {
            println!("[SUCCESS] Integridad criptográfica validada. Cadena inalterada.");
            println!("============================================================");
        }
        Ok(false) | Err(_) => {
            eprintln!("[CRITICAL] La verificación de integridad de la evidencia ha fallado.");
            process::exit(1);
        }
    }
}
