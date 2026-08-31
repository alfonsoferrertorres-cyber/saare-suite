// SAARE L7 TELEMETRY & DOM BRIDGE v10.0
// ISO/IEC 27037:2012 (DEFR/DES) · UNE-ISO/IEC 42001:2023 · EU AI Act
console.log("[SAARE L7 Engine] Puente DOM & Telemetría Forense Activo en Memoria");

const API_INGEST_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs";

const DEFAULT_SETTINGS_V10 = {
  cumplimiento_corporativo_integral: true,
  auditoria_dictamen_normativo: true,
  razonamiento_activo_l7: true,
  deepfake_fake_disprover: true,
  subvenciones_requisitos_infranqueables: true,
  subOptions: {
    dlp_dni_nie: true,
    dlp_iban_cards: true,
    dlp_health_art9: true,
    purge_sys_madvise: true,
    rfc3161_qualified_tsa: true,
    ed25519_signatures: true,
    merkle_root_anchoring: true,
    safe_creative_anchor: true,
    lexical_enforce_active: true,
    brain_witness_injection: true,
    anti_dan_jailbreak: true,
    pipeline_savings_meter: true,
    strict_corpus_grounding: true,
    reject_unsupported_claims: true,
    deepfake_sampling_stream: true,
    anti_tamper_evidence: true,
    enforce_no_double_funding: true,
    enforce_dnsh_principle: true,
    prtr_nextgen_dossier: true,
    daci_conflict_prevention: true
  }
};

// 1. Sincronizar directivas y sub-opciones en el DOM
function updateDomSettings(settings) {
  if (settings) {
    document.documentElement.setAttribute('data-saare-settings', JSON.stringify(settings));
  }
}

if (typeof chrome !== "undefined" && chrome.storage?.local) {
  chrome.storage.local.get(["saare_settings", "saare_user_email"], (res) => {
    updateDomSettings(res?.saare_settings || DEFAULT_SETTINGS_V10);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.saare_settings) {
      updateDomSettings(changes.saare_settings.newValue);
    }
  });
}

// 2. Inyección del interceptor L7 en el contexto Window
try {
  const injectScript = document.createElement("script");
  injectScript.src = chrome.runtime.getURL("inject.js");
  injectScript.onload = function() { this.remove(); };
  (document.head || document.documentElement).appendChild(injectScript);
} catch (e) {
  console.warn("[SAARE L7] Script injection fallback:", e.message);
}

// 3. Resolución de identidad activa (DOM scraping + Fallback de Storage)
function getActiveAccountFromDom() {
  const profileEl = document.querySelector('a[aria-label*="@"], button[aria-label*="@"], img[alt*="@"], div[aria-label*="@"], span[data-user-email]');
  const label = profileEl ? (profileEl.getAttribute('aria-label') || profileEl.getAttribute('alt') || profileEl.getAttribute('data-user-email') || '') : '';
  const match = label.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase().trim() : null;
}

// 4. Modal visual de bloqueo perimetral (Error Lógico 0 en RAM)
function showModal(text, violationInfo) {
  const old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style = "position:fixed; bottom:20px; right:20px; width:480px; background:#090d16; color:#ffffff; padding:18px; border-radius:10px; border:2px solid #ef4444; box-shadow:0 20px 40px rgba(0,0,0,0.8); z-index:999999; font-family:system-ui,-apple-system,sans-serif;";
  
  const normTitle = violationInfo?.norma || "RGPD (Art. 5/32) / EU AI Act";
  const reasonText = violationInfo?.reason || "Carga regulada interceptada en memoria volátil";
  const scenarioTitle = violationInfo?.scenario_id || "cumplimiento_corporativo_integral";
  const seal = violationInfo?.cryptoSeal || "L7-SEAL:ACTIVE";

  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.1rem;">🛡️</span>
        <span style="font-weight:900; font-size:0.85rem; color:#f87171; text-transform:uppercase; letter-spacing:0.3px;">S.A.A.R.E. RUNTIME L7 (DEFR)</span>
      </div>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px;">BLOQUEO EX-ANTE</span>
    </div>
    
    <div style="font-size:0.82rem; margin:0 0 10px 0; color:#cbd5e1; line-height:1.45;">
      <div><strong>Bóveda:</strong> <span style="color:#38bdf8; font-family:monospace;">${scenarioTitle}</span></div>
      <div><strong>Normativa:</strong> <span style="color:#fca5a5;">${normTitle}</span></div>
      <div><strong>Causa:</strong> ${reasonText}</div>
    </div>

    <div style="background:#020617; border:1px solid #1e293b; border-left:3px solid #ef4444; padding:8px 10px; border-radius:6px; font-size:0.78rem; color:#93c5fd; margin-bottom:10px; word-break:break-all; font-family:monospace;">
      Carga Neutralizada (RAM): "${text.substring(0, 140)}..."
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#64748b; font-family:monospace; border-top:1px dashed #1e293b; padding-top:8px;">
      <span>SELLO: <strong style="color:#38bdf8;">${seal}</strong></span>
      <span>CERO ESCRITURAS EN DISCO (RAM)</span>
    </div>
  `;

  document.body.appendChild(banner);
  setTimeout(() => { if (banner && banner.parentNode) banner.remove(); }, 6500);
}

// 5. Transmisión dual de la evidencia forense (Service Worker + Direct Fallback Ingest)
function sendEvidenceToBackground(auditData) {
  const text = auditData.cleanPrompt || auditData.sanitizedPrompt || "";
  if (!text || text.trim() === "") return;

  const detectedUser = getActiveAccountFromDom() || "auditor@ms3v.es";

  const payload = {
    promptInput: text.trim().substring(0, 5000),
    user: detectedUser,
    scenario_id: auditData.scenario_id || "cumplimiento_corporativo_integral",
    timestamp: new Date().toISOString(),
    verdict: auditData.verdict,
    category: auditData.category,
    norma: auditData.norma,
    cryptoSeal: auditData.cryptoSeal,
    forensic_role: auditData.forensic_role || "DEFR (Digital Evidence First Responder)",
    dei_phase: auditData.dei_phase || "Fase 1: Identificación & Aislamiento en RAM",
    parentHash: auditData.parentHash,
    violationDetails: {
      category: auditData.category,
      norma: auditData.norma,
      reason: auditData.reason,
      cryptoSeal: auditData.cryptoSeal,
      scenario_id: auditData.scenario_id
    }
  };

  if (auditData.verdict === "RECHAZADO") {
    showModal(text, auditData);
  }

  // Canal A: Mensajería estándar Chrome Runtime
  let messageSent = false;
  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    try {
      chrome.runtime.sendMessage({
        type: "SAARE_LOG_EVENT",
        payload: payload
      }, () => {
        if (chrome.runtime.lastError) {
          // Fallback al Canal B si el background está dormido
          sendDirectBeacon(payload);
        }
      });
      messageSent = true;
    } catch {
      messageSent = false;
    }
  }

  // Canal B: Envío directo si falla el background
  if (!messageSent) {
    sendDirectBeacon(payload);
  }
}

// Canal de respaldo directo a Cloudflare Workers
function sendDirectBeacon(payload) {
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(API_INGEST_URL, blob);
    } else {
      fetch(API_INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch {}
}

// 6. Receptor de mensajes del interceptor Window
window.addEventListener("message", (event) => {
  if (event.data?.type === "SAARE_EVENT" && event.data.data) {
    sendEvidenceToBackground(event.data.data);
  }
});