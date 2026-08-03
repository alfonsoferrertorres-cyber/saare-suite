// ============================================================================
// S.A.A.R.E. ISV Suite v4.2 - Zero-Disk License Validation Engine
// In-Memory Token & Feature Entitlement Verifier
// ============================================================================

#[derive(Debug, PartialEq, Clone)]
pub enum LicenseError {
    InvalidFormat,
    InvalidSignature,
    Expired,
    ModuleNotAuthorized(String),
}

#[derive(Debug, PartialEq, Clone)]
pub struct LicensePayload {
    pub tenant_id: String,
    pub allowed_modules: Vec<String>,
    pub expires_at_epoch: u64,
}

pub struct LicenseGuard {
    secret_key: String,
}

impl LicenseGuard {
    pub fn new(secret_key: &str) -> Self {
        Self { secret_key: secret_key.to_string() }
    }

    /// Simulación de generación de firma HMAC/Hash criptográfico Zero-Disk
    fn compute_signature(&self, payload_str: &str) -> String {
        let mut hash: u64 = 5381;
        for byte in payload_str.bytes().chain(self.secret_key.bytes()) {
            hash = ((hash << 5).wrapping_add(hash)).wrapping_add(byte as u64);
        }
        format!("{:x}", hash)
    }

    /// Valida un token en formato "PAYLOAD_BASE64.FIRMA"
    pub fn verify_token(
        &self,
        token: &str,
        target_module: &str,
        current_epoch: u64,
    ) -> Result<LicensePayload, LicenseError> {
        let parts: Vec<&str> = token.split('.').collect();
        if parts.len() != 2 {
            return Err(LicenseError::InvalidFormat);
        }

        let payload_raw = parts[0];
        let signature = parts[1];

        // 1. Validar la firma
        let expected_sig = self.compute_signature(payload_raw);
        if signature != expected_sig {
            return Err(LicenseError::InvalidSignature);
        }

        // 2. Parsear el payload ("TENANT|EXPIRES|MOD1,MOD2")
        let fields: Vec<&str> = payload_raw.split('|').collect();
        if fields.len() != 3 {
            return Err(LicenseError::InvalidFormat);
        }

        let tenant_id = fields[0].to_string();
        let expires_at_epoch: u64 = fields[1].parse().map_err(|_| LicenseError::InvalidFormat)?;
        let allowed_modules: Vec<String> = fields[2].split(',').map(|s| s.trim().to_lowercase()).collect();

        // 3. Comprobar fecha de caducidad
        if current_epoch > expires_at_epoch {
            return Err(LicenseError::Expired);
        }

        // 4. Comprobar derecho de uso sobre el módulo solicitado
        let req_mod = target_module.to_lowercase();
        let normalized_req = req_mod.split('_').last().unwrap_or(&req_mod);

        let is_authorized = allowed_modules.iter().any(|m| {
            m == "*" || m == &req_mod || m == normalized_req
        });

        if !is_authorized {
            return Err(LicenseError::ModuleNotAuthorized(target_module.to_string()));
        }

        Ok(LicensePayload {
            tenant_id,
            allowed_modules,
            expires_at_epoch,
        })
    }

    /// Helper para generar tokens válidos de prueba
    pub fn issue_token(&self, tenant: &str, expires_epoch: u64, modules: &[&str]) -> String {
        let payload_raw = format!("{}|{}|{}", tenant, expires_epoch, modules.join(","));
        let sig = self.compute_signature(&payload_raw);
        format!("{}.{}", payload_raw, sig)
    }
}

// ============================================================================
// SUITE DE PRUEBAS UNITARIAS DE LICENCIAMIENTO
// ============================================================================
#[cfg(test)]
mod tests {
    use super::*;

    const SECRET: &str = "SAARE_ENTERPRISE_SECRET_KEY_2026";

    #[test]
    fn test_valid_license() {
        let guard = LicenseGuard::new(SECRET);
        let token = guard.issue_token("Santander_Bank", 2000000000, &["perimetershield", "compliancesuite"]);

        let res = guard.verify_token(&token, "01_perimetershield", 1700000000);
        assert!(res.is_ok());
        let payload = res.unwrap();
        assert_eq!(payload.tenant_id, "Santander_Bank");
    }

    #[test]
    fn test_unauthorized_module() {
        let guard = LicenseGuard::new(SECRET);
        let token = guard.issue_token("Health_Corp", 2000000000, &["edututorguard"]);

        let res = guard.verify_token(&token, "01_perimetershield", 1700000000);
        assert_eq!(res, Err(LicenseError::ModuleNotAuthorized("01_perimetershield".to_string())));
    }

    #[test]
    fn test_expired_license() {
        let guard = LicenseGuard::new(SECRET);
        let token = guard.issue_token("Expired_Client", 1600000000, &["*"]);

        let res = guard.verify_token(&token, "05_sovereigntynode", 1700000000);
        assert_eq!(res, Err(LicenseError::Expired));
    }

    #[test]
    fn test_tampered_signature() {
        let guard = LicenseGuard::new(SECRET);
        let mut token = guard.issue_token("Fake_Client", 2000000000, &["*"]);
        token.push_str("bad_sig");

        let res = guard.verify_token(&token, "05_sovereigntynode", 1700000000);
        assert_eq!(res, Err(LicenseError::InvalidSignature));
    }

    #[test]
    fn test_invalid_format() {
        let guard = LicenseGuard::new(SECRET);
        let bad_token = "invalid_token_without_dots";

        let res = guard.verify_token(bad_token, "05_sovereigntynode", 1700000000);
        assert_eq!(res, Err(LicenseError::InvalidFormat));
    }
}
