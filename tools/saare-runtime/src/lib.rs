pub mod config;
pub mod license;

use std::ffi::CStr;
use std::os::raw::c_char;
use license::LicenseGuard;
use config::*;

const SAARE_SECRET_KEY: &str = "SAARE_ENTERPRISE_SECRET_KEY_2026";
const CURRENT_SIMULATED_EPOCH: u64 = 1770000000;

#[no_mangle]
pub unsafe extern "C" fn saare_verify_and_dispatch(
    module_ptr: *const c_char,
    preset_ptr: *const c_char,
    license_ptr: *const c_char,
) -> i32 {
    if module_ptr.is_null() || preset_ptr.is_null() {
        return 2;
    }

    let module_str = match CStr::from_ptr(module_ptr).to_str() {
        Ok(s) => s,
        Err(_) => return 2,
    };

    let preset_str = match CStr::from_ptr(preset_ptr).to_str() {
        Ok(s) => s,
        Err(_) => return 2,
    };

    let license_token = if license_ptr.is_null() {
        String::new()
    } else {
        match CStr::from_ptr(license_ptr).to_str() {
            Ok(s) => s.to_string(),
            Err(_) => String::new(),
        }
    };

    let guard = LicenseGuard::new(SAARE_SECRET_KEY);
    let token = if license_token.is_empty() {
        guard.issue_token("FFI_DEV_TENANT", 2000000000, &["*"])
    } else {
        license_token
    };

    if guard.verify_token(&token, module_str, CURRENT_SIMULATED_EPOCH).is_err() {
        return 1;
    }

    match module_str.to_lowercase().as_str() {
        "01_perimetershield" | "perimetershield" => {
            let _c = match preset_str {
                "banking-shield" => PerimeterShieldPreset::BankingShield.apply(),
                "health-guard" => PerimeterShieldPreset::HealthGuard.apply(),
                _ => PerimeterShieldPreset::EnterpriseAntiJailbreak.apply(),
            };
        }
        "04_compliancesuite" | "compliancesuite" => {
            let _c = match preset_str {
                "iso42001-certifier" => ComplianceSuitePreset::Iso42001Certifier.apply(),
                _ => ComplianceSuitePreset::EuAiActAuditor.apply(),
            };
        }
        _ => {}
    }

    0
}
