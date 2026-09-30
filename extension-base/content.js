// SAARE L7 TELEMETRY & DOM BRIDGE v10.5.1 (SGP 1.0 / Blindaje Activo - Fixed Filter & Session Sync)
console.log("[SAARE L7 Engine] DOM Bridge & Execution Guard Active");

const DEFAULT_SETTINGS_V10 = {
  cumplimiento_corporativo_integral: true,
  auditoria_dictamen_normativo: true,
  razonamiento_activo_l7: true
};

// Frases de interfaz, saludos iniciales y firmas de ruido de Gemini / Google
const KNOWN_UI_NOISE = [
  "f.req=",
  "bard_activity",
  "connectiondurationms",
  "documentrequestid",
  "¡hola! ¿en qué te puedo ayudar hoy?",
  "gemini no es un ser humano",
  "accede para vincular las apps de google",
  "saludo inicial",
  "tu privacidad y gemini",
  "cometer errores, incluso con información sobre personas"
];

// 1. FILTRO DE RUIDO Y PROMPTS AUTOMÁTICOS
function isNoisePayload(text) {
  if (!text || typeof text !== "string") return true;
  const clean = text.trim();
  
  // Ignorar cadenas vacías o fragmentos de menos de 2 caracteres
  if (clean.length < 2) return true;

  const lower = clean.toLowerCase();

  // Descarta si contiene firmas de ruido técnico o frases predeterminadas de la interfaz
  return KNOWN_UI_NOISE.some(noise => lower.includes(noise));
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
  let localUser = "";
  let localTenant = "ENTERPRISE";
  try {
    localUser = localStorage.getItem("saare_user_email") || "";
    localTenant = localStorage.getItem("saare_tenant_domain") || "ENTERPRISE";
  } catch (e) {}

  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get(["saare_settings", "saare_user_email", "saare_tenant_domain"], (local) => {
      const finalUser = local?.saare_user_email || localUser || "ciso@saare.es";
      const finalTenant = local?.saare_tenant_domain || localTenant || "ENTERPRISE";
      updateDomContext(local?.saare_settings || DEFAULT_SETTINGS_V10, finalUser, finalTenant);
    });
  } else {
    updateDomContext(DEFAULT_SETTINGS_V10, localUser || "ciso@saare.es", localTenant || "ENTERPRISE");
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

  // 1. Filtrar ruido técnico y fragmentos de UI
  if (isNoisePayload(text)) {
    return;
  }

  // 2. Resolver usuario y tenant garantizando que nunca queden vacíos
  const currentDomUser = document.documentElement.getAttribute("data-saare-user") || "ciso@saare.es";
  const currentDomTenant = document.documentElement.getAttribute("data-saare-tenant") || "ENTERPRISE";

  const finalUser = verdictData.user || currentDomUser;
  const finalTenant = verdictData.tenant || currentDomTenant;

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
    user: finalUser,
    tenant: finalTenant,
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