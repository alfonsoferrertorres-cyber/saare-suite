// SAARE L7 TELEMETRY & DOM BRIDGE v10.0.4 (SGP 1.0)
// AI Execution Authorization Infrastructure · SAARE VERDICT™ Sensor Bridge
console.log("[SAARE L7 Engine] Puente DOM & SAARE Execution Guard Activo (Bóveda KL)");

const DEFAULT_SETTINGS_V10 = {
  cumplimiento_corporativo_integral: true,
  auditoria_dictamen_normativo: true,
  razonamiento_activo_l7: true,
  deepfake_fake_disprover: true,
  subvenciones_requisitos_infranqueables: true,
  banca_dora_pci: true,
  sanidad_historia_clinica: true,
  orquestacion_workflows_guard: true,
  subOptions: {
    dlp_dni_nie: true,
    dlp_iban_cards: true,
    dlp_health_art9: true,
    rfc3161_qualified_tsa: true,
    ed25519_signatures: true,
    anti_dan_jailbreak: true,
    enforce_no_double_funding: true,
    enforce_dnsh_principle: true
  }
};

// 1. Sincronizar directivas y sub-opciones en el DOM
function updateDomSettings(settings) {
  if (settings) {
    document.documentElement.setAttribute("data-saare-settings", JSON.stringify(settings));
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

// 2. Inyección segura del interceptor L7 en el contexto Window
try {
  const injectScript = document.createElement("script");
  injectScript.src = chrome.runtime.getURL("inject.js");
  injectScript.onload = function () { this.remove(); };
  (document.head || document.documentElement).appendChild(injectScript);
} catch (e) {
  console.warn("[SAARE L7] Script injection fallback:", e.message);
}

// 3. Resolución de identidad activa en DOM
function getActiveAccountFromDom() {
  const profileEl = document.querySelector(
    'a[aria-label*="@"], button[aria-label*="@"], img[alt*="@"], div[aria-label*="@"], span[data-user-email]'
  );
  const label = profileEl
    ? profileEl.getAttribute("aria-label") ||
      profileEl.getAttribute("alt") ||
      profileEl.getAttribute("data-user-email") ||
      ""
    : "";
  const match = label.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase().trim() : null;
}

// 4. Modal visual determinista de denegación de ejecución (SAARE VERDICT™)
function showVerdictModal(text, verdictInfo) {
  const old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style =
    "position:fixed; bottom:20px; right:20px; width:480px; background:#0b0f19; color:#ffffff; padding:18px; border-radius:10px; border:2px solid #ef4444; box-shadow:0 20px 40px rgba(0,0,0,0.85); z-index:999999; font-family:system-ui,-apple-system,sans-serif;";

  const policyId = verdictInfo?.policy_id || verdictInfo?.policy?.id || "POL-CORP-GOVERNANCE-01";
  const reasonText =
    verdictInfo?.reason || "Acción denegada en tiempo de ejecución por política de autorización.";
  const decision = verdictInfo?.decision || "DENY";
  const enforcement =
    verdictInfo?.enforcement?.action || verdictInfo?.enforcement_action || "BLOCK";
  const evidenceId = verdictInfo?.evidence_id || verdictInfo?.verdictId || "EV-PENDING";

  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.1rem;">🛡️</span>
        <span style="font-weight:900; font-size:0.85rem; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px;">SAARE EXECUTION GUARD</span>
      </div>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px; font-family:monospace;">DECISION: ${decision} (${enforcement})</span>
    </div>
    
    <div style="font-size:0.82rem; margin:0 0 10px 0; color:#cbd5e1; line-height:1.45;">
      <div><strong>Política:</strong> <span style="color:#fca5a5; font-family:monospace;">${policyId}</span></div>
      <div><strong>Motivo:</strong> ${reasonText}</div>
      <div><strong>Evidence ID:</strong> <span style="color:#c084fc; font-family:monospace;">${evidenceId}</span></div>
    </div>

    <div style="background:#030712; border:1px solid #1f2937; border-left:3px solid #ef4444; padding:8px 10px; border-radius:6px; font-size:0.78rem; color:#93c5fd; margin-bottom:10px; word-break:break-all; font-family:monospace;">
      Payload Evaluado: "${text.substring(0, 140)}..."
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#64748b; font-family:monospace; border-top:1px dashed #1f2937; padding-top:8px;">
      <span>BÓVEDA KL: <strong style="color:#38bdf8;">VERIFIED_TAMPER_EVIDENT</strong></span>
      <span>EPHEMERAL RUNTIME MEMORY</span>
    </div>
  `;

  document.body.appendChild(banner);
  setTimeout(() => {
    if (banner && banner.parentNode) banner.remove();
  }, 7000);
}

// 5. Transmisión exclusiva hacia background.js para sellado Ed25519 y persistencia fiduciaria
function sendEvidenceToBackground(verdictData) {
  const text = verdictData.cleanPrompt || verdictData.sanitizedPrompt || verdictData.promptInput || "";
  if (!text || text.trim() === "") return;

  const detectedUser = getActiveAccountFromDom();
  const isDenied =
    verdictData.decision === "DENY" ||
    verdictData.decision === "BLOCK" ||
    verdictData.enforcement?.action === "BLOCK";

  const payload = {
    verdict_schema: verdictData.verdict_schema || "SGP_1.0",
    verdictId: verdictData.verdictId || verdictData.verdict_id,
    evidence_id: verdictData.evidence_id,
    decision: isDenied ? "DENY" : "ALLOW",
    enforcement: {
      action: isDenied ? "BLOCK" : "PASS"
    },
    status: verdictData.status || "VALID",
    system_id: verdictData.system_id || "L7-BROWSER-SENSOR",
    policy_id: verdictData.policy_id || verdictData.policy?.id || "POL-CORP-GOVERNANCE-01",
    policy_version: verdictData.policy_version || verdictData.policy?.version || "1.0.0",
    risk_level: verdictData.risk_level || "LOW",
    rules_matched: verdictData.rules_matched || verdictData.reasonCodes || [],
    reason: verdictData.reason,
    promptInput: text.trim().substring(0, 5000),
    user: detectedUser,
    timestamp: verdictData.timestamp || new Date().toISOString(),
    executionPermit: verdictData.executionPermit || null,
    verdict: isDenied ? "RECHAZADO" : "PERMITIDO"
  };

  if (isDenied) {
    showVerdictModal(text, verdictData);
  }

  // Canal Seguro: Transmisión al Service Worker para firma y despacho en servidor
  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    chrome.runtime.sendMessage({
      type: "SAARE_LOG_EVENT",
      payload: payload
    });
  }
}

// 6. Receptor de mensajes unificado (SGP 1.0)
window.addEventListener("message", (event) => {
  if (event.data?.type === "SAARE_VERDICT_EVENT" || event.data?.type === "SAARE_EVENT") {
    const verdictData = event.data.payload || event.data.data;
    if (verdictData) {
      sendEvidenceToBackground(verdictData);
    }
  }
});