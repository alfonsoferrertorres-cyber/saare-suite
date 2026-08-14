use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SovereigntyMode {
    MilitaryAirGapped,
    EdgeIotSovereign,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPolicy {
    pub allow_outbound: bool,
    pub max_latency_ms: f32,
    pub mode: SovereigntyMode,
}

pub struct SovereigntyEngine;

impl SovereigntyEngine {
    pub fn new() -> Self {
        Self
    }

    /// Aplica las politicas restrictivas segun el modo de soberania seleccionado
    pub fn apply_policy(&self, mode: SovereigntyMode) -> NetworkPolicy {
        match mode {
            SovereigntyMode::MilitaryAirGapped => NetworkPolicy {
                allow_outbound: false, // Bloqueo absoluto de salida
                max_latency_ms: 0.0,
                mode,
            },
            SovereigntyMode::EdgeIotSovereign => NetworkPolicy {
                allow_outbound: true,
                max_latency_ms: 1.5, // Limite estricto de latencia en Edge
                mode,
            },
        }
    }

    /// Verifica que las reglas de aislamiento no han sido vulneradas en tiempo de ejecucion
    pub fn verify_network_isolation(&self, policy: &NetworkPolicy) -> Result<(), &'static str> {
        if policy.mode == SovereigntyMode::MilitaryAirGapped && policy.allow_outbound {
            return Err(
                "FATAL: Violacion de aislamiento Air-Gapped detectada. Abortando ejecucion.",
            );
        }
        Ok(())
    }
}

impl Default for SovereigntyEngine {
    fn default() -> Self {
        Self::new()
    }
}
