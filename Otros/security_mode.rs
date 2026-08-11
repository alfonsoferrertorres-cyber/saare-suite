// Core Engine: perimetershield/src/security_mode.rs

pub struct SecurityModeConfig {
    pub enforce_strict_ast: bool,
    pub pii_masking_enabled: bool,
    pub prompt_injection_threshold: f32,
    pub log_signed_evidences: bool,
}

impl SecurityModeConfig {
    pub fn high_security_baseline() -> Self {
        Self {
            enforce_strict_ast: true,
            pii_masking_enabled: true,
            prompt_injection_threshold: 0.85, // Umbral de bloqueo estricto
            log_signed_evidences: true,
        }
    }
}

pub fn process_incoming_payload(
    payload: &str,
    config: &SecurityModeConfig,
) -> Result<String, SecurityViolation> {
    // 1. Análisis de Inyección de Prompts en Capa 7 (~0.3ms)
    if config.enforce_strict_ast && detect_jailbreak_ast(payload, config.prompt_injection_threshold) {
        return Err(SecurityViolation::PromptInjectionDetected);
    }

    // 2. Anonimización y enmascaramiento PII en RAM (~0.4ms)
    let sanitized_payload = if config.pii_masking_enabled {
        mask_pii_in_ram(payload)
    } else {
        payload.to_string()
    };

    // 3. Generación de Evidencia Criptográfica ISO 8601 UTC (~0.3ms)
    if config.log_signed_evidences {
        evidence_vault::emit_signed_log(
            &sanitized_payload, 
            chrono::Utc::now().to_rfc3339()
        );
    }

    Ok(sanitized_payload)
}