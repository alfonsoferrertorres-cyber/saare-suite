// SAARE L7 TELEMETRY & DOM BRIDGE v10.0.10 (SGP 1.0)
console.log("[SAARE L7 Engine] Puente DOM & SAARE Execution Guard Activo (Bóveda KL)");

const DEFAULT_SETTINGS_V10 = {
  cumplimiento_corporativo_integral: true,
  auditoria_dictamen_normativo: true,
  razonamiento_activo_l7: true
};

function updateDomContext(settings, userEmail, tenantDomain) {
  if (settings) {
    document.documentElement.setAttribute("data-saare-settings", JSON.stringify(settings));
  }
  if (userEmail) {
    document.documentElement.setAttribute("data-saare-user", userEmail);
  }
  if (tenantDomain) {
    document.documentElement.setAttribute("data-saare-tenant", tenantDomain);
  }
}

function syncStorageAndContext() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    // Primero intentamos leer de storage.managed (Políticas de empresa del .bat)
    if (chrome.storage.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        const managedUser = managed?.saare_user_email;
        const managedTenant = managed?.saare_tenant_domain;
        
        // Si no hay managed, leemos de local
        chrome.storage.local.get(["saare_settings", "saare_user_email", "saare_tenant_domain"], (local) => {
          updateDomContext(
            local?.saare_settings || DEFAULT_SETTINGS_V10,
            managedUser || local?.saare_user_email || "operator@corporate.local",
            managedTenant || local?.saare_tenant_domain || "CORPORATE_TENANT"
          );
        });
      });
    }
  }
}

syncStorageAndContext();

if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener(() => {
    syncStorageAndContext();
  });
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
    verdictId: verdictData.verdictId,
    evidence_id: verdictData.evidence_id,
    decision: verdictData.decision || "ALLOW",
    enforcement: verdictData.enforcement || { action: "PASS" },
    status: "VALID",
    system_id: "L7-BROWSER-SENSOR",
    policy: { id: "POL-CORP-GOVERNANCE-01", version: "1.0.0" },
    reason: verdictData.reason,
    promptInput: text ? "[METADATA_EDGE_SECURED]" : "",
    user: verdictData.user,
    tenant: verdictData.tenant,
    timestamp: verdictData.timestamp || new Date().toISOString(),
    cryptoSeal: verdictData.cryptoSeal || "L7-SEAL:ACTIVE",
    verdict: "PERMITIDO"
  };

  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    chrome.runtime.sendMessage({
      type: "SAARE_LOG_EVENT",
      payload: payload
    });
  }
}

window.addEventListener("message", (event) => {
  if (event.data?.type === "SAARE_VERDICT_EVENT") {
    const verdictData = event.data.payload;
    if (verdictData) {
      sendEvidenceToBackground(verdictData);
    }
  }
});