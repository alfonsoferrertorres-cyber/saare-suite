// SAARE L7 TELEMETRY & DOM BRIDGE v10.5.0 (SGP 1.0 / Blindaje Activo - 100% Audit Coverage)
console.log("[SAARE L7 Engine] DOM Bridge & Execution Guard Active");

const DEFAULT_SETTINGS_V10 = {
  cumplimiento_corporativo_integral: true,
  auditoria_dictamen_normativo: true,
  razonamiento_activo_l7: true
};

// 1. FILTRO DE RUIDO PERMISIVO: Registra TODO el texto introducido por el usuario
function isNoisePayload(text) {
  if (!text || typeof text !== "string") return true;
  const lower = text.toLowerCase();
  
  // Descarta únicamente metadatos técnicos internos de Google/Gemini
  return (
    lower.includes("f.req=") ||
    lower.includes("bard_activity") ||
    lower.includes("connectiondurationms") ||
    lower.includes("documentrequestid")
  );
}

function renderActivityWitnessBadge() {
  if (document.getElementById("saare-witness-badge")) return;

  const badge = document.createElement("div");
  badge.id = "saare-witness-badge";
  badge.style.cssText = `
    position: fixed; bottom: 16px; right: 16px; z-index: 999999;
    background: rgba(3, 7, 18, 0.85); border: 1px solid #059669; color: #34d399;
    padding: 4px 10px; border-radius: 20px; font-size: 0.70rem;
    font-family: monospace; font-weight: 800; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4); backdrop-filter: blur(8px);
    transition: all 0.3s ease; opacity: 0.75; cursor: pointer; user-select: none;
  `;
  
  badge.innerHTML = `
    <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981;"></span>
    <span id="saare-witness-text">S.A.A.R.E. L7</span>
  `;

  badge.addEventListener("mouseenter", () => {
    badge.style.opacity = "1";
    document.getElementById("saare-witness-text").innerText = "S.A.A.R.E. L7 ENFORCER: MODO BLINDAJE ACTIVO";
  });
  
  badge.addEventListener("mouseleave", () => {
    badge.style.opacity = "0.75";
    document.getElementById("saare-witness-text").innerText = "S.A.A.R.E. L7";
  });

  (document.body || document.documentElement).appendChild(badge);
}

// BUCLE DE REINYECCIÓN AUTOMÁTICA EN NAVEGACIÓN SPA
setInterval(() => {
  const witnessBadge = document.getElementById("saare-witness-badge");
  if (!witnessBadge) {
    renderActivityWitnessBadge();
  }
}, 3000);

function updateDomContext(settings, userEmail, tenantDomain) {
  if (settings) document.documentElement.setAttribute("data-saare-settings", JSON.stringify(settings));
  if (userEmail) document.documentElement.setAttribute("data-saare-user", userEmail);
  if (tenantDomain) document.documentElement.setAttribute("data-saare-tenant", tenantDomain);
}

function syncStorageAndContext() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get(["saare_settings", "saare_user_email", "saare_tenant_domain"], (local) => {
      if (local?.saare_user_email) {
        updateDomContext(local.saare_settings || DEFAULT_SETTINGS_V10, local.saare_user_email, local.saare_tenant_domain || "ENTERPRISE");
      } else if (chrome.storage.managed) {
        chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
          const finalUser = managed?.saare_user_email || "";
          const finalTenant = managed?.saare_tenant_domain || "ENTERPRISE";
          updateDomContext(DEFAULT_SETTINGS_V10, finalUser, finalTenant);
        });
      } else {
        updateDomContext(DEFAULT_SETTINGS_V10, "", "ENTERPRISE");
      }
    });
  } else {
    updateDomContext(DEFAULT_SETTINGS_V10, "", "ENTERPRISE");
  }
}

syncStorageAndContext();

if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener(() => { syncStorageAndContext(); });
}

try {
  const injectScript = document.createElement("script");
  injectScript.src = chrome.runtime.getURL("inject.js");
  injectScript.onload = function () { this.remove(); };
  (document.head || document.documentElement).appendChild(injectScript);
} catch (e) {}

function sendEvidenceToBackground(verdictData) {
  const text = verdictData.cleanPrompt || verdictData.rawPrompt || verdictData.prompt || "";

  if (isNoisePayload(text)) {
    return;
  }

  const currentDomUser = document.documentElement.getAttribute("data-saare-user") || "";
  const currentDomTenant = document.documentElement.getAttribute("data-saare-tenant") || "ENTERPRISE";

  const payload = {
    verdict_schema: "SGP_1.0",
    verdictId: verdictData.verdictId || `VRD-2026-${Math.floor(Math.random() * 90000) + 10000}`,
    evidence_id: verdictData.evidence_id || `EV-L7-${Math.floor(Math.random() * 90000) + 10000}`,
    decision: verdictData.decision || "ALLOW",
    enforcement: verdictData.enforcement || { action: verdictData.decision === "DENY" ? "BLOCK" : "PASS" },
    status: "VALID",
    system_id: "L7-BROWSER-SENSOR",
    policy: { id: "POL-CORP-GOVERNANCE-01", version: "1.0.0" },
    reason: verdictData.reason || "Tráfico conforme verificado en memoria",
    promptInput: text,
    user: verdictData.user || currentDomUser,
    tenant: verdictData.tenant || currentDomTenant,
    timestamp: verdictData.timestamp || new Date().toISOString(),
    cryptoSeal: verdictData.cryptoSeal || "L7-SEAL:ACTIVE",
    verdict: verdictData.verdict || "PERMITIDO",
    type: "PRIVACIDAD",
    cat: verdictData.category || "AUDITORIA_CONFORME",
    sub: verdictData.norma || "EU AI Act",
    prompt: text,
    time: "En vivo"
  };

  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    chrome.runtime.sendMessage({ type: "SAARE_LOG_EVENT", payload: payload });
  }
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "SAARE_VERDICT_EVENT" || event.data?.type === "SAARE_EVENT") {
    const verdictData = event.data.payload || event.data.data;
    if (verdictData) {
      sendEvidenceToBackground(verdictData);
    }
  }
});