use ed25519_dalek::{Signature, Verifier, VerifyingKey};

pub struct LicenseVerifier {
    public_key: VerifyingKey,
}

impl LicenseVerifier {
    pub fn new(public_key_bytes: &[u8; 32]) -> Result<Self, &'static str> {
        VerifyingKey::from_bytes(public_key_bytes)
            .map(|public_key| Self { public_key })
            .map_err(|_| "Clave pública Ed25519 inválida")
    }

    pub fn verify(&self, payload: &[u8], signature_bytes: &[u8; 64]) -> bool {
        let signature = Signature::from_bytes(signature_bytes);
        self.public_key.verify(payload, &signature).is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    #[test]
    fn test_valid_signature_verification() {
        let secret_bytes: [u8; 32] = rand::random();
        let signing_key = SigningKey::from_bytes(&secret_bytes);
        let verifying_key = signing_key.verifying_key();

        let message = b"PAYLOAD_LICENCIA_SAARE_2026";
        let signature = signing_key.sign(message);

        let verifier = LicenseVerifier::new(verifying_key.as_bytes()).unwrap();
        assert!(verifier.verify(message, &signature.to_bytes()));
    }

    #[test]
    fn test_tampered_payload_rejection() {
        let secret_bytes: [u8; 32] = rand::random();
        let signing_key = SigningKey::from_bytes(&secret_bytes);
        let verifying_key = signing_key.verifying_key();

        let message = b"PAYLOAD_VALIDO";
        let tampered_message = b"PAYLOAD_MODIFICADO";
        let signature = signing_key.sign(message);

        let verifier = LicenseVerifier::new(verifying_key.as_bytes()).unwrap();
        assert!(!verifier.verify(tampered_message, &signature.to_bytes()));
    }
}
