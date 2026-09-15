// SAARE L7 TELEMETRY & DOM BRIDGE v10.0.12 (SGP 1.0)
console.log("[SAARE L7 Engine] Puente DOM & SAARE Execution Guard Activo (Bóveda KV)");

const DEFAULT_SETTINGS_V10 = {
  cumplimiento_corporativo_integral: true,
  auditoria_dictamen_normativo: true,
  razonamiento_activo_l7: true
};

function updateDomContext(settings, userEmail, tenantDomain) {
  if (settings) document.documentElement.setAttribute("data-saare-settings", JSON.stringify(settings));
  if (userEmail) document.documentElement.setAttribute("data-saare-user", userEmail);
  if (tenantDomain) document.documentElement.setAttribute("data-saare-tenant", tenantDomain);
}

function syncStorageAndContext() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const fetchManaged = (callback) => {
      if (chrome.storage.managed) {
        chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
          callback(managed || {});
        });
      } else {
        callback({});
      }
    };

    fetchManaged((managed) => {
      chrome.storage.local.get(["saare_settings", "saare_user_email", "saare_tenant_domain"], (local) => {
        const finalUser = managed?.saare_user_email || local?.saare_user_email || "legal@saare.es";
        const finalTenant = managed?.saare_tenant_domain || local?.saare_tenant_domain || "ENTERPRISE";
        const finalSettings = local?.saare_settings || DEFAULT_SETTINGS_V10;

        updateDomContext(finalSettings, finalUser, finalTenant);
      });
    });
  } else {
    updateDomContext(DEFAULT_SETTINGS_V10, "legal@saare.es", "ENTERPRISE");
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
  const text = verdictData.cleanPrompt || "";
  const payload = {
    verdict_schema: "SGP_1.0",
    verdictId: verdictData.verdictId || `VRD-2026-${Math.floor(Math.random() * 90000) + 10000}`,
    evidence_id: verdictData.evidence_id || `EV-L7-${Math.floor(Math.random() * 90000) + 10000}`,
    decision: verdictData.decision || "ALLOW",
    enforcement: verdictData.enforcement || { action: "PASS" },
    status: "VALID",
    system_id: "L7-BROWSER-SENSOR",
    policy: { id: "POL-CORP-GOVERNANCE-01", version: "1.0.0" },
    reason: verdictData.reason || "Tráfico conforme verificado en memoria",
    promptInput: text ? '"' + (text.length > 50 ? text.slice(0, 50) + "..." : text) + '"' : "",
    user: verdictData.user || "legal@saare.es",
    tenant: verdictData.tenant || "ENTERPRISE",
    timestamp: verdictData.timestamp || new Date().toISOString(),
    cryptoSeal: verdictData.cryptoSeal || "L7-SEAL:ACTIVE",
    verdict: verdictData.verdict || "PERMITIDO",
    type: "PRIVACIDAD",
    cat: verdictData.category || "AUDITORIA_CONFORME",
    sub: verdictData.norma || "EU AI Act",
    prompt: '"' + (text.length > 50 ? text.slice(0, 50) + "..." : text) + '"',
    time: "En vivo"
  };

  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    chrome.runtime.sendMessage({ type: "SAARE_LOG_EVENT", payload: payload });
  }
}

window.addEventListener("message", (event) => {
  if (event.data?.type === "SAARE_VERDICT_EVENT" || event.data?.type === "SAARE_EVENT") {
    const verdictData = event.data.payload || event.data.data;
    if (verdictData) sendEvidenceToBackground(verdictData);
  }
});