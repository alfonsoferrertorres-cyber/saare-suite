use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LlmProvider {
    LocalSovereign,
    CloudHighCompute,
}

pub struct TokenMatrixRouter;

impl TokenMatrixRouter {
    pub fn new() -> Self {
        Self
    }

    /// Enruta la peticion segun la complejidad y el coste
    pub fn route_request(&self, complexity_score: u32) -> LlmProvider {
        if complexity_score > 75 {
            LlmProvider::CloudHighCompute // Deriva a modelo superior
        } else {
            LlmProvider::LocalSovereign // Ahorro de coste usando modelo local
        }
    }
}

impl Default for TokenMatrixRouter {
    fn default() -> Self {
        Self::new()
    }
}
