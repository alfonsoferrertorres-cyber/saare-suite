#![allow(dead_code)]
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct LicensePayload {
    pub client_id: String,
    pub preset_id: String,
    pub issued_at: String,
    pub expires_at: String,
    pub allowed_modules: Vec<String>,
    pub max_nodes: Option<u32>,
    pub format: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LicenseFile {
    pub payload: LicensePayload,
    pub signature: Vec<u8>,
    pub public_key: Vec<u8>,
}
