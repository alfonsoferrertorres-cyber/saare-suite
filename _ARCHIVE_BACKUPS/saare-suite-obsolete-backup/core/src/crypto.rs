use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use hex;

// 1. Clave pública estática incrustada en el binario (Ed25519)
pub const SAARE_PUBLIC_KEY: [u8; 32] = [49, 213, 147, 176, 17, 73, 61, 2, 79, 95, 149, 37, 74, 125, 84, 217, 28, 32, 29, 98, 63, 181, 43, 193, 211, 194, 87, 25, 144, 80, 96, 176];

pub struct LicenseVerifier {
    public_key: VerifyingKey,
}

impl LicenseVerifier {
    /// Inicializa el verificador usando la clave pública estática
    pub fn new() -> Result<Self, &'static str> {
        VerifyingKey::from_bytes(&SAARE_PUBLIC_KEY)
            .map(|public_key| Self { public_key })
            .map_err(|_| "La clave pública Ed25519 no es válida")
    }

    /// Verifica el contenido completo de una licencia o por partes (payload + firma hex)
    pub fn verify(&self, payload: &str, signature_hex: &str) -> bool {
        // Decodificamos la firma hex a bytes
        let sig_bytes_vec = match hex::decode(signature_hex.trim()) {
            Ok(bytes) => bytes,
            Err(_) => return false,
        };

        // Una firma Ed25519 debe medir exactamente 64 bytes
        if sig_bytes_vec.len() != 64 {
            return false;
        }

        let mut sig_bytes = [0u8; 64];
        sig_bytes.copy_from_slice(&sig_bytes_vec);
        let signature = Signature::from_bytes(&sig_bytes);

        // Verificación matemática de la firma contra el payload
        self.public_key.verify(payload.as_bytes(), &signature).is_ok()
    }

    /// Método helper para verificar el contenido completo del archivo (formato: Payload|.Signature)
    pub fn verify_license_file(&self, license_content: &str) -> bool {
        let parts: Vec<&str> = license_content.trim().split("|.").collect();
        if parts.len() != 2 {
            return false;
        }
        self.verify(parts[0], parts[1])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verifier_initialization() {
        let verifier = LicenseVerifier::new();
        assert!(verifier.is_ok());
    }

    #[test]
    fn test_invalid_signature_length() {
        let verifier = LicenseVerifier::new().unwrap();
        let payload = "Empresa|1787084480|*|*";
        let short_signature = "a9c4ebeb";

        assert!(!verifier.verify(payload, short_signature));
    }
}