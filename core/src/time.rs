use chrono::{DateTime, SecondsFormat, Utc};

/// Retorna el timestamp actual en formato UTC ISO 8601 estricto con precisión de milisegundos.
pub fn get_audit_timestamp() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)
}

/// Valida si una cadena de texto es un timestamp ISO 8601 válido y UTC.
pub fn validate_iso8601(timestamp: &str) -> bool {
    DateTime::parse_from_rfc3339(timestamp)
        .map(|dt| dt.timezone().local_minus_utc() == 0)
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audit_timestamp_format() {
        let ts = get_audit_timestamp();
        assert!(ts.ends_with('Z'));
        assert!(validate_iso8601(&ts));
    }
}