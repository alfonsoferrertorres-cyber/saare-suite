use ed25519_dalek::{Signer, SigningKey};
use saare_core::{get_audit_timestamp, LicenseVerifier};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LicensePayload {
    pub client_id: String,
    pub preset_id: String,
    pub issued_at: String,
    pub expires_at: String,
    pub allowed_modules: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SignedLicenseToken {
    pub payload: LicensePayload,
    pub signature: Vec<u8>,
    pub public_key: [u8; 32],
}

fn main() {
    println!("===============================================");
    println!(" S.A.A.R.E. ISV Suite - License Generator CLI");
    println!("===============================================");

    // 1. Generar par de claves Ed25519
    let secret_bytes: [u8; 32] = rand::random();
    let signing_key = SigningKey::from_bytes(&secret_bytes);
    let verifying_key = signing_key.verifying_key();

    // 2. Construir payload de licencia Compliance
    let payload = LicensePayload {
        client_id: "CORP_BANKING_ES_001".to_string(),
        preset_id: "PRESET_DORA_HIGH_AVAILABILITY".to_string(),
        issued_at: get_audit_timestamp(),
        expires_at: "2027-12-31T23:59:59Z".to_string(),
        allowed_modules: vec![
            "01_perimetershield".to_string(),
            "02_evidencevault".to_string(),
        ],
    };

    // 3. Firmar payload
    let payload_bytes = serde_json::to_vec(&payload).unwrap();
    let signature = signing_key.sign(&payload_bytes);

    let token = SignedLicenseToken {
        payload,
        signature: signature.to_bytes().to_vec(),
        public_key: *verifying_key.as_bytes(),
    };

    // 4. Validar el token generado usando la libreria central saare-core
    let signature_array: [u8; 64] = token.signature.as_slice().try_into().unwrap();
    
    // Instanciar LicenseVerifier sin argumentos
    let verifier = LicenseVerifier::new().unwrap();

    // Convertir a &str (UTF-8) y firma a Hexadecimal para cumplir la firma de verify(&str, &str)
    let payload_str = std::str::from_utf8(&payload_bytes).expect("Error al decodificar UTF-8");
    let signature_hex = hex::encode(signature_array);

    let is_valid = verifier.verify(payload_str, &signature_hex);

    println!();
    println!("Token de licencia emitido y firmado correctamente:");
    println!("{}", serde_json::to_string_pretty(&token).unwrap());

    println!();
    let status = if is_valid {
        "VALIDA (200 OK)"
    } else {
        "INVALIDA"
    };
    println!("Validacion de firma en tiempo de ejecucion: {}", status);
}