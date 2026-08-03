use saare_core::{get_audit_timestamp, LicenseVerifier, SecureBuffer};
use serde::{Deserialize, Serialize};
use std::fmt;

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

#[derive(Debug, PartialEq)]
pub enum PerimeterError {
    InvalidSignature,
    ModuleNotAuthorized,
    SerializationError,
}

pub struct PerimeterShieldEngine {
    session_buffer: SecureBuffer,
}

impl fmt::Debug for PerimeterShieldEngine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("PerimeterShieldEngine")
            .field("session_buffer", &"<REDACTED_SECURE_BUFFER>")
            .finish()
    }
}

impl PerimeterShieldEngine {
    pub fn bootstrap(token_json: &str) -> Result<Self, PerimeterError> {
        let token: SignedLicenseToken = serde_json::from_str(token_json)
            .map_err(|_| PerimeterError::SerializationError)?;

        let payload_bytes = serde_json::to_vec(&token.payload)
            .map_err(|_| PerimeterError::SerializationError)?;

        let signature_array: [u8; 64] = token
            .signature
            .as_slice()
            .try_into()
            .map_err(|_| PerimeterError::InvalidSignature)?;

        let verifier = LicenseVerifier::new(&token.public_key)
            .map_err(|_| PerimeterError::InvalidSignature)?;

        if !verifier.verify(&payload_bytes, &signature_array) {
            return Err(PerimeterError::InvalidSignature);
        }

        if !token.payload.allowed_modules.contains(&"01_perimetershield".to_string()) {
            return Err(PerimeterError::ModuleNotAuthorized);
        }

        let session_data = format!("SESSION_INIT_CLIENT_{}_{}", token.payload.client_id, get_audit_timestamp());
        let session_buffer = SecureBuffer::new(session_data.into_bytes());

        Ok(Self { session_buffer })
    }

    pub fn is_active(&self) -> bool {
        !self.session_buffer.as_slice().is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    fn generate_mock_token(modules: Vec<String>) -> (SignedLicenseToken, SigningKey) {
        let secret_bytes: [u8; 32] = rand::random();
        let signing_key = SigningKey::from_bytes(&secret_bytes);
        let verifying_key = signing_key.verifying_key();

        let payload = LicensePayload {
            client_id: "TEST_CLIENT".to_string(),
            preset_id: "PRESET_DORA".to_string(),
            issued_at: get_audit_timestamp(),
            expires_at: "2030-01-01T00:00:00Z".to_string(),
            allowed_modules: modules,
        };

        let payload_bytes = serde_json::to_vec(&payload).unwrap();
        let signature = signing_key.sign(&payload_bytes);

        (
            SignedLicenseToken {
                payload,
                signature: signature.to_bytes().to_vec(),
                public_key: *verifying_key.as_bytes(),
            },
            signing_key,
        )
    }

    #[test]
    fn test_perimeter_bootstrap_success() {
        let (token, _) = generate_mock_token(vec!["01_perimetershield".to_string()]);
        let token_json = serde_json::to_string(&token).unwrap();
        let engine = PerimeterShieldEngine::bootstrap(&token_json);

        assert!(engine.is_ok());
        assert!(engine.unwrap().is_active());
    }

    #[test]
    fn test_perimeter_unauthorized_module_rejection() {
        let (token, _) = generate_mock_token(vec!["02_evidencevault".to_string()]);
        let token_json = serde_json::to_string(&token).unwrap();
        let result = PerimeterShieldEngine::bootstrap(&token_json);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), PerimeterError::ModuleNotAuthorized);
    }

    #[test]
    fn test_perimeter_invalid_signature_rejection() {
        let (mut token, _) = generate_mock_token(vec!["01_perimetershield".to_string()]);
        token.signature[0] ^= 0xFF;

        let token_json = serde_json::to_string(&token).unwrap();
        let result = PerimeterShieldEngine::bootstrap(&token_json);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), PerimeterError::InvalidSignature);
    }
}
