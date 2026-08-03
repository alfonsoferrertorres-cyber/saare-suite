use ed25519_dalek::{Signer, SigningKey};
use evidencevault::EvidenceVault;
use perimetershield::{LicensePayload, PerimeterShieldEngine, SignedLicenseToken};
use saare_core::get_audit_timestamp;

#[test]
fn test_end_to_end_compliance_pipeline() {
    // 1. Emisión de Licencia Corporativa (Autoridad de Licencionamiento)
    let secret_bytes: [u8; 32] = rand::random();
    let signing_key = SigningKey::from_bytes(&secret_bytes);
    let verifying_key = signing_key.verifying_key();

    let payload = LicensePayload {
        client_id: "BANCO_SANTANDER_ES".to_string(),
        preset_id: "PRESET_DORA_CRITICAL_INFRA".to_string(),
        issued_at: get_audit_timestamp(),
        expires_at: "2028-12-31T23:59:59Z".to_string(),
        allowed_modules: vec![
            "01_perimetershield".to_string(),
            "02_evidencevault".to_string(),
        ],
    };

    let payload_bytes = serde_json::to_vec(&payload).unwrap();
    let signature = signing_key.sign(&payload_bytes);

    let token = SignedLicenseToken {
        payload,
        signature: signature.to_bytes().to_vec(),
        public_key: *verifying_key.as_bytes(),
    };
    let token_json = serde_json::to_string(&token).unwrap();

    // 2. Inicio del Motor Perimetral (PerimeterShield)
    let engine = PerimeterShieldEngine::bootstrap(&token_json)
        .expect("El bootstrap del perímetro debió ser exitoso");
    assert!(engine.is_active());

    // 3. Inicialización del Audit Vault con firmas enlazadas (EvidenceVault)
    let mut vault = EvidenceVault::new(signing_key);
    vault.record_event("BANCO_SANTANDER_ES", "SESSION_BOOTSTRAP_SUCCESS");
    vault.record_event("BANCO_SANTANDER_ES", "PAYLOAD_EXECUTION_MEMORY_ONLY");
    vault.record_event("BANCO_SANTANDER_ES", "SESSION_TEARDOWN_ZEROIZED");

    // 4. Verificación de Integridad Auditada
    assert_eq!(vault.len(), 3);
    assert!(vault
        .verify_integrity()
        .expect("La cadena de evidencias debe ser inmutable y válida"));
}
