// SAARE L7 TELEMETRY & DOM BRIDGE v10.0.14 (SGP 1.0)
console.log("[SAARE L7 Engine] DOM Bridge & Execution Guard Active");

const DEFAULT_SETTINGS_V10 = {
  cumplimiento_corporativo_integral: true,
  auditoria_dictamen_normativo: true,
  razonamiento_activo_l7: true
};

/**
 * Filtro de Ruido L7 para descartar telemetría de red interna de Gemini/Google
 */
function isNoisePayload(text) {
  if (!text || typeof text !== "string") return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("f.req=") ||
    lower.includes("bard_activity") ||
    lower.includes("generic") ||
    lower.includes("at=aovx") ||
    lower.startsWith("[[[\"")
  );
}

function updateDomContext(settings, userEmail, tenantDomain) {
  if (settings) document.documentElement.setAttribute("data-saare-settings", JSON.stringify(settings));
  if (userEmail) document.documentElement.setAttribute("data-saare-user", userEmail);
  if (tenantDomain) document.documentElement.setAttribute("data-saare-tenant", tenantDomain);
}

function syncStorageAndContext() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    // 1. Priorizar la lectura de local storage (tokenizado)
    chrome.storage.local.get(["saare_settings", "saare_user_email", "saare_tenant_domain"], (local) => {
      if (local?.saare_user_email) {
        updateDomContext(local.saare_settings || DEFAULT_SETTINGS_V10, local.saare_user_email, local.saare_tenant_domain || "ENTERPRISE");
      } else if (chrome.storage.managed) {
        // Fallback a Enterprise Managed (MDM)
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

// Inyección limpia de inject.js en la RAM de la página
try {
  const injectScript = document.createElement("script");
  injectScript.src = chrome.runtime.getURL("inject.js");
  injectScript.onload = function () { this.remove(); };
  (document.head || document.documentElement).appendChild(injectScript);
} catch (e) {}

function sendEvidenceToBackground(verdictData) {
  const text = verdictData.cleanPrompt || verdictData.rawPrompt || verdictData.prompt || "";

  // FILTRO EX-ANTE: Descartar telemetría interna o textos vacíos
  if (isNoisePayload(text)) {
    return;
  }

  // Resuelve la identidad en vivo directamente de las propiedades del DOM
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

// Escucha de eventos emitidos desde inject.js
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "SAARE_VERDICT_EVENT" || event.data?.type === "SAARE_EVENT") {
    const verdictData = event.data.payload || event.data.data;
    if (verdictData) {
      sendEvidenceToBackground(verdictData);
    }
  }
});