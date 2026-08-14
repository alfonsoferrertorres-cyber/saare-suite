use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use saare_core::get_audit_timestamp;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct AuditRecord {
    pub sequence: u64,
    pub timestamp: String,
    pub client_id: String,
    pub action: String,
    pub previous_signature: Vec<u8>,
    pub signature: Vec<u8>,
}

#[derive(Debug, PartialEq)]
pub enum VaultError {
    InvalidChainLink,
    SignatureVerificationFailed,
    EmptyVault,
}

pub struct EvidenceVault {
    signing_key: SigningKey,
    verifying_key: VerifyingKey,
    records: Vec<AuditRecord>,
}

impl EvidenceVault {
    pub fn new(signing_key: SigningKey) -> Self {
        let verifying_key = signing_key.verifying_key();
        Self {
            signing_key,
            verifying_key,
            records: Vec::new(),
        }
    }

    pub fn record_event(&mut self, client_id: &str, action: &str) -> AuditRecord {
        let sequence = self.records.len() as u64;
        let timestamp = get_audit_timestamp();
        let previous_signature = match self.records.last() {
            Some(last_rec) => last_rec.signature.clone(),
            None => vec![0u8; 64],
        };

        let payload_str = format!(
            "{}:{}:{}:{}:{:?}",
            sequence, timestamp, client_id, action, previous_signature
        );

        let signature = self.signing_key.sign(payload_str.as_bytes());

        let record = AuditRecord {
            sequence,
            timestamp,
            client_id: client_id.to_string(),
            action: action.to_string(),
            previous_signature,
            signature: signature.to_bytes().to_vec(),
        };

        self.records.push(record.clone());
        record
    }

    pub fn verify_integrity(&self) -> Result<bool, VaultError> {
        if self.records.is_empty() {
            return Err(VaultError::EmptyVault);
        }

        let mut expected_prev_sig = vec![0u8; 64];

        for record in &self.records {
            if record.previous_signature != expected_prev_sig {
                return Err(VaultError::InvalidChainLink);
            }

            let payload_str = format!(
                "{}:{}:{}:{}:{:?}",
                record.sequence,
                record.timestamp,
                record.client_id,
                record.action,
                record.previous_signature
            );

            let sig_array: [u8; 64] = record
                .signature
                .as_slice()
                .try_into()
                .map_err(|_| VaultError::SignatureVerificationFailed)?;

            let signature = Signature::from_bytes(&sig_array);
            self.verifying_key
                .verify(payload_str.as_bytes(), &signature)
                .map_err(|_| VaultError::SignatureVerificationFailed)?;

            expected_prev_sig = record.signature.clone();
        }

        Ok(true)
    }

    pub fn len(&self) -> usize {
        self.records.len()
    }

    pub fn is_empty(&self) -> bool {
        self.records.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vault_append_and_verify_chain() {
        let secret_bytes: [u8; 32] = rand::random();
        let signing_key = SigningKey::from_bytes(&secret_bytes);
        let mut vault = EvidenceVault::new(signing_key);

        vault.record_event("CORP_BANKING_01", "BOOTSTRAP_MODULE_01");
        vault.record_event("CORP_BANKING_01", "EXECUTE_ISOLATED_PAYLOAD");
        vault.record_event("CORP_BANKING_01", "SHUTDOWN_CLEANUP");

        assert_eq!(vault.len(), 3);
        assert!(vault.verify_integrity().unwrap());
    }

    #[test]
    fn test_vault_tamper_detection() {
        let secret_bytes: [u8; 32] = rand::random();
        let signing_key = SigningKey::from_bytes(&secret_bytes);
        let mut vault = EvidenceVault::new(signing_key);

        vault.record_event("CORP_BANKING_01", "INITIAL_STATE");
        vault.record_event("CORP_BANKING_01", "CRITICAL_TRANSACTION");

        // Alteración maliciosa del contenido de la evidencia
        vault.records[1].action = "ALTERED_TRANSACTION".to_string();

        let verification_result = vault.verify_integrity();
        assert!(verification_result.is_err());
        assert_eq!(
            verification_result.unwrap_err(),
            VaultError::SignatureVerificationFailed
        );
    }
}
