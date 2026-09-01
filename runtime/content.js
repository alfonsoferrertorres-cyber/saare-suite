// SAARE L7 TELEMETRY & DOM BRIDGE v10.0 (SGP 1.0)
// AI-Native Audit & Decision Layer™ · SAARE VERDICT™ Adjudication
console.log("[SAARE L7 Engine] Puente DOM & Governance Decision Layer Activo en Memoria");

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

// 3. Resolución de identidad activa en DOM
function getActiveAccountFromDom() {
  const profileEl = document.querySelector('a[aria-label*="@"], button[aria-label*="@"], img[alt*="@"], div[aria-label*="@"], span[data-user-email]');
  const label = profileEl ? (profileEl.getAttribute('aria-label') || profileEl.getAttribute('alt') || profileEl.getAttribute('data-user-email') || '') : '';
  const match = label.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase().trim() : null;
}

// 4. Modal visual de adjudicación perimetral (SAARE VERDICT™)
function showVerdictModal(text, verdictInfo) {
  const old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style = "position:fixed; bottom:20px; right:20px; width:500px; background:#0b0f19; color:#ffffff; padding:18px; border-radius:10px; border:2px solid #ef4444; box-shadow:0 20px 40px rgba(0,0,0,0.85); z-index:999999; font-family:system-ui,-apple-system,sans-serif;";
  
  const policyId = verdictInfo?.policy_id || "POL-GENERIC-GOV";
  const reasonText = verdictInfo?.reason || "Acción rechazada en memoria volátil RAM por política de gobernanza.";
  const decision = verdictInfo?.decision || "BLOCK";
  const evidenceId = verdictInfo?.evidence_id || "EV-PENDING";
  const seal = verdictInfo?.cryptoSeal || "L7-SEAL:ACTIVE";

  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.1rem;">⚖️</span>
        <span style="font-weight:900; font-size:0.85rem; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px;">SAARE GOVERNANCE JUDGE™</span>
      </div>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px; font-family:monospace;">VERDICT: ${decision}</span>
    </div>
    
    <div style="font-size:0.82rem; margin:0 0 10px 0; color:#cbd5e1; line-height:1.45;">
      <div><strong>Política:</strong> <span style="color:#fca5a5; font-family:monospace;">${policyId}</span></div>
      <div><strong>Dictamen:</strong> ${reasonText}</div>
      <div><strong>Evidence ID:</strong> <span style="color:#c084fc; font-family:monospace;">${evidenceId}</span></div>
    </div>

    <div style="background:#030712; border:1px solid #1f2937; border-left:3px solid #ef4444; padding:8px 10px; border-radius:6px; font-size:0.78rem; color:#93c5fd; margin-bottom:10px; word-break:break-all; font-family:monospace;">
      Payload Neutralizado (RAM): "${text.substring(0, 140)}..."
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#64748b; font-family:monospace; border-top:1px dashed #1f2937; padding-top:8px;">
      <span>SELLO: <strong style="color:#38bdf8;">${seal}</strong></span>
      <span>SYS_MADVISE ZERO-DISK PURGE</span>
    </div>
  `;

  document.body.appendChild(banner);
  setTimeout(() => { if (banner && banner.parentNode) banner.remove(); }, 7000);
}

// 5. Transmisión dual de la evidencia y veredicto
function sendEvidenceToBackground(verdictData) {
  const text = verdictData.cleanPrompt || verdictData.sanitizedPrompt || "";
  if (!text || text.trim() === "") return;

  const detectedUser = getActiveAccountFromDom() || "auditor@ms3v.es";

  const payload = {
    verdict_schema: verdictData.verdict_schema || "SGP_1.0",
    decision: verdictData.decision,
    enforcement_action: verdictData.enforcement_action,
    validity_state: verdictData.validity_state || "VALID",
    system_id: verdictData.system_id || "L7-AGENT-SENSOR",
    policy_id: verdictData.policy_id,
    policy_version: verdictData.policy_version || "1.0.0",
    risk_level: verdictData.risk_level || "MEDIUM",
    rules_matched: verdictData.rules_matched || [],
    reason: verdictData.reason,
    evidence_id: verdictData.evidence_id,
    promptInput: text.trim().substring(0, 5000),
    user: detectedUser,
    timestamp: verdictData.timestamp || new Date().toISOString(),
    cryptoSeal: verdictData.cryptoSeal,
    parentHash: verdictData.parentHash,
    active_shield: verdictData.active_shield,
    brain_witness: verdictData.brain_witness,
    // Compatibilidad retroactiva con backends legacy
    verdict: verdictData.decision === "BLOCK" ? "RECHAZADO" : "PERMITIDO",
    category: verdictData.policy_id,
    norma: verdictData.policy_id
  };

  if (verdictData.decision === "BLOCK") {
    showVerdictModal(text, verdictData);
  }

  // Canal A: Service Worker Chrome Runtime
  let messageSent = false;
  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    try {
      chrome.runtime.sendMessage({
        type: "SAARE_LOG_EVENT",
        payload: payload
      }, () => {
        if (chrome.runtime.lastError) {
          sendDirectBeacon(payload);
        }
      });
      messageSent = true;
    } catch {
      messageSent = false;
    }
  }

  // Canal B: Fallback directo a Cloudflare Workers
  if (!messageSent) {
    sendDirectBeacon(payload);
  }
}

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

// 6. Receptor de mensajes unificado (SGP 1.0 + Compatibilidad previa)
window.addEventListener("message", (event) => {
  if (
    (event.data?.type === "SAARE_VERDICT_EVENT" || event.data?.type === "SAARE_EVENT") && 
    event.data.data
  ) {
    sendEvidenceToBackground(event.data.data);
  }
});