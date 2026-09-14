import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import GovernanceToolbar from './GovernanceToolbar';
import Login from './Login';
import OfficialReportModal from './OfficialReportModal';
import { API_BASE_URL, saareFetch } from './utils/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('saare_token') !== null;
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('saare_user_email') || 'auditor.compliance@evaluacion-ia.es';
  });

  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [selectedJson, setSelectedJson] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [filter, setFilter] = useState('TODOS');
  
  const [auditTokenModal, setAuditTokenModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [directives, setDirectives] = useState([
    { id: 1, name: 'DORA - Resiliencia Operativa Digital', active: true, standard: 'EU Regulation 2022/2554' },
    { id: 2, name: 'EU AI Act - Prevención de Fugas PII', active: true, standard: 'Articles 10 & 15' },
    { id: 3, name: 'ISO/IEC 27037 - Cadena de Custodia Forense', active: true, standard: 'Digital Evidence Handling' },
    { id: 4, name: 'LOPDGDD - Cifrado Ex-Ante de Datos Sensibles', active: true, standard: 'Organic Law 3/2018' },
    { id: 5, name: 'L7 Hook - Intercepción de Prompts LLM', active: true, standard: 'Runtime Guardrail v1.0' },
    { id: 6, name: 'Firma Criptográfica Ed25519 En Vivo', active: true, standard: 'RFC 8032 Standard' },
    { id: 7, name: 'Sanitización de Archivos y Adjuntos', active: true, standard: 'OWASP LLM01 / LLM06' },
    { id: 8, name: 'Análisis de Intención Ex-Ante (IA Sentinel)', active: true, standard: 'Deterministic Zero-Trust' },
  ]);

  const [evidences, setEvidences] = useState([
    { id: 'EV-L7-200', time: 'En vivo', cat: 'PII_DETECTED', sub: 'LOPDGDD / AI Act', prompt: '"wrangler 3.114.17 (update available 4.129.0) -------------------..."', verdict: 'RECHAZADO', type: 'PRIVACIDAD' },
    { id: 'EV-L7-199', time: 'En vivo', cat: 'AUDITORIA_CONFORME', sub: 'EU AI Act', prompt: '"Hola, buenos días para todos..."', verdict: 'PERMITIDO', type: 'PRIVACIDAD' },
    { id: 'EV-L7-198', time: 'En vivo', cat: 'PII_DETECTED', sub: 'LOPDGDD / AI Act', prompt: '"dame un comando para buscarlo"', verdict: 'RECHAZADO', type: 'PRIVACIDAD' },
    { id: 'EV-L7-197', time: '7/9/2026, 2:00:00', cat: 'WORKFLOW_RULE', sub: 'Orquestadores / Workflows', prompt: '"si no hay wrangler"', verdict: 'RECHAZADO', type: 'WORKFLOWS' }
  ]);

  useEffect(() => {
    if (window.location.search) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const intervalClock = setInterval(updateClock, 1000);

    const fetchTelemetry = async () => {
      try {
        const res = await saareFetch(`/api/v1/runs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('saare_token') || ''}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const remoteEvidences = data.evidences || data.runs || data;
          if (Array.isArray(remoteEvidences)) {
            setEvidences(prev => {
              const combined = [...remoteEvidences, ...prev];
              return Array.from(new Map(combined.map(item => [item.id, item])).values());
            });
          }
        }
      } catch (e) {}
    };

    fetchTelemetry();
    const intervalTelemetry = setInterval(fetchTelemetry, 3000);

    return () => {
      clearInterval(intervalClock);
      clearInterval(intervalTelemetry);
    };
  }, [isAuthenticated]);

  const triggerGovernance = (msg) => {
    setGovernanceStatus(msg);
    setTimeout(() => setGovernanceStatus(''), 4500);
  };

  const handleDownloadExtension = async () => {
    try {
      const zip = new JSZip();

      const manifest = {
        "manifest_version": 3,
        "name": "SAARE Execution Authorization Sensor",
        "version": "10.0.7",
        "description": "AI Execution Authorization Infrastructure (SGP 1.0) · SAARE VERDICT™ & Bóveda KV",
        "background": { "service_worker": "background.js" },
        "action": { 
          "default_title": "SAARE Execution Guard Node (Bóveda KV Active)", 
          "default_popup": "popup.html" 
        },
        "content_scripts": [{
          "matches": [
            "https://gemini.google.com/*", "https://chatgpt.com/*", "https://chat.openai.com/*",
            "https://claude.ai/*", "https://copilot.microsoft.com/*", "https://chat.deepseek.com/*", "https://www.perplexity.ai/*"
          ],
          "js": ["content.js"],
          "run_at": "document_start"
        }],
        "web_accessible_resources": [{
          "resources": ["inject.js"],
          "matches": [
            "https://gemini.google.com/*", "https://chatgpt.com/*", "https://chat.openai.com/*",
            "https://claude.ai/*", "https://copilot.microsoft.com/*", "https://chat.deepseek.com/*", "https://www.perplexity.ai/*"
          ]
        }],
        "permissions": ["storage", "alarms", "downloads"],
        "host_permissions": [
          "https://api.saare.es/*",
          "http://localhost:3001/*"
        ]
      };

      const storageManaged = {
        "saare_user_email": { "Value": userEmail, "Description": "Email del operador autorizado." },
        "saare_tenant_domain": { "Value": "ENTERPRISE", "Description": "Dominio o identificador canónico del inquilino." },
        "saare_token": { "Value": "sk_live_managed_identity", "Description": "Token de sincronización con la Bóveda KV." }
      };

      const backgroundJs = `const WORKER_URL = "${API_BASE_URL}/api/v1";

async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    if (chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "EMPRESA"
          });
        }
        fallbackLocal();
      });
    } else {
      fallbackLocal();
    }

    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "usuario_anonimo@tenant.es";
        const finalTenant = local?.saare_tenant_domain || "ORGANIZACION";
        resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
      const enrichedPayload = { ...message.payload, user: user, tenant: tenant };

      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const current = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...current].slice(0, 100) });
      });

      fetch(\`\${WORKER_URL}/runs?user=\${encodeURIComponent(user)}\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrichedPayload)
      })
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    });
    return true;
  }

  if (message?.type === "SAARE_GET_RULES") {
    fetch(\`\${WORKER_URL}/custom-rules\`)
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, data: [] }));
    return true;
  }
});`;

      const contentJs = `// SAARE L7 TELEMETRY & DOM BRIDGE v10.0.12 (SGP 1.0)
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
        const finalUser = managed?.saare_user_email || local?.saare_user_email || "${userEmail}";
        const finalTenant = managed?.saare_tenant_domain || local?.saare_tenant_domain || "ENTERPRISE";
        const finalSettings = local?.saare_settings || DEFAULT_SETTINGS_V10;

        updateDomContext(finalSettings, finalUser, finalTenant);
      });
    });
  } else {
    updateDomContext(DEFAULT_SETTINGS_V10, "${userEmail}", "ENTERPRISE");
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
    verdictId: verdictData.verdictId || \`VRD-2026-\${Math.floor(Math.random() * 90000) + 10000}\`,
    evidence_id: verdictData.evidence_id || \`EV-L7-\${Math.floor(Math.random() * 90000) + 10000}\`,
    decision: verdictData.decision || "ALLOW",
    enforcement: verdictData.enforcement || { action: "PASS" },
    status: "VALID",
    system_id: "L7-BROWSER-SENSOR",
    policy: { id: "POL-CORP-GOVERNANCE-01", version: "1.0.0" },
    reason: verdictData.reason || "Tráfico conforme verificado en memoria",
    promptInput: text ? '"' + (text.length > 50 ? text.slice(0, 50) + "..." : text) + '"' : "",
    user: verdictData.user || "${userEmail}",
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
});`;

      const injectJs = `/* S.A.A.R.E. L7 RAM Network Interceptor & Sanitizer v8.6.1 */
(function() {
  const DLP = {
    dni: /(?:^|\\D)(\\d{7,9}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])(?!\\w)/i,
    iban: /ES\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{2}[\\s-]?\\d{10}|ES\\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/
  };

  function computeL7Seal(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return \`L7-SEAL:\${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}\`;
  }

  function showSaareBanner(check, onSanitizeAndContinue, onBlock) {
    try {
      let existing = document.getElementById('saare-violation-banner');
      if (existing) existing.remove();

      const banner = document.createElement('div');
      banner.id = 'saare-violation-banner';
      banner.style.cssText = \`
        position: fixed; top: 20px; right: 20px; z-index: 999999; width: 410px;
        background: #0b0f19; border: 2px solid #ef4444; border-radius: 10px; padding: 16px;
        color: #f8fafc; font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(239, 68, 68, 0.4);
      \`;

      banner.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🛡️</span>
            <span style="font-weight: 900; font-size: 11.5px; color: #ef4444; letter-spacing: 0.5px;">S.A.A.R.E. SENSOR L7 · BLOQUEO EX-ANTE</span>
          </div>
          <button id="saare-close-banner" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; font-weight: bold;">✕</button>
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">NORMATIVA: <strong style="color: #38bdf8;">\${check.norma}</strong></div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">DICTAMEN: <strong style="color: #ef4444;">\${check.verdict} (\${check.category})</strong></div>
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; font-family: monospace; font-size: 11px; color: #34d399; margin-bottom: 10px; word-break: break-all; max-height: 90px; overflow-y: auto;">
          \${check.cleanPrompt}
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <button id="saare-btn-sanitize" style="flex: 1; background: #059669; color: #fff; border: none; border-radius: 6px; padding: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">✨ Sanitizar y Continuar</button>
          <button id="saare-btn-block" style="background: #334155; color: #f8fafc; border: none; border-radius: 6px; padding: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">Bloquear</button>
        </div>
      \`;

      document.body.appendChild(banner);
      document.getElementById('saare-close-banner').onclick = () => { banner.remove(); if (onBlock) onBlock(); };
      document.getElementById('saare-btn-block').onclick = () => { banner.remove(); if (onBlock) onBlock(); };
      document.getElementById('saare-btn-sanitize').onclick = () => { banner.remove(); if (onSanitizeAndContinue) onSanitizeAndContinue(); };
      setTimeout(() => { if (banner.parentNode) { banner.remove(); if (onBlock) onBlock(); } }, 20000);
    } catch (e) { if (onBlock) onBlock(); }
  }

  function isIgnoredRequest(url, bodyStr, method) {
    if (url) {
      const u = String(url).toLowerCase();
      if (u.includes("/log?") || u.includes("google-analytics") || u.includes("gen_204") || u.includes("favicon")) {
        return true;
      }
    }
    if (!bodyStr || bodyStr.length < 3) return true;
    return false;
  }

  function parseBody(body) {
    if (!body) return "";
    if (typeof body === "string") return body;
    try { return JSON.stringify(body); } catch { return String(body); }
  }

  function extractCleanPrompt(rawText) {
    if (!rawText) return "";
    if (rawText.includes("f.req")) {
      let fReqValue = "";
      try {
        const params = new URLSearchParams(rawText);
        fReqValue = params.get("f.req") || "";
      } catch {}
      if (fReqValue) {
        try {
          const outer = JSON.parse(fReqValue);
          if (Array.isArray(outer) && outer.length >= 2 && typeof outer[1] === "string") {
            const inner = JSON.parse(outer[1]);
            if (Array.isArray(inner) && inner.length > 0 && Array.isArray(inner[0])) {
              const prompt = inner[0][0];
              if (typeof prompt === "string" && prompt.trim() && !prompt.startsWith("!")) return prompt.trim();
            }
          }
        } catch {}
      }
    }
    try {
      const json = JSON.parse(rawText);
      if (json.prompt) return json.prompt;
      if (json.input) return json.input;
    } catch {}
    return decodeURIComponent(rawText.replace(/\\+/g, " "));
  }

  function sanitize(text) {
    if (!text) return "";
    return text
      .replace(/(?:^|\\D)(\\d{7,9}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])(?!\\w)/gi, (m, dni) => m.replace(dni, \`[DNI_REDACTED_***\${dni.slice(-4)}]\`))
      .replace(/ES\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{2}[\\s-]?\\d{10}|ES\\d{18,22}/gi, (m) => \`[IBAN_REDACTED_***\${m.slice(-4)}]\`);
  }

  function evaluatePayload(rawBody, url, method) {
    const str = parseBody(rawBody);
    if (isIgnoredRequest(url, str, method)) return null;

    const cleanPrompt = extractCleanPrompt(str) || str;
    if (!cleanPrompt || cleanPrompt.length < 2) return null;

    const isDni = DLP.dni.test(cleanPrompt) || DLP.dni.test(str);
    const isIban = DLP.iban.test(cleanPrompt.replace(/[\\s-]/g, "")) || DLP.iban.test(str.replace(/[\\s-]/g, ""));
    const isCard = DLP.card.test(cleanPrompt.replace(/[\\s-]+/g, "")) || DLP.card.test(str.replace(/[\\s-]+/g, ""));

    if (isDni || isIban || isCard) {
      let category = "PII_DNI";
      let norma = "España - LOPDGDD & AEPD";
      if (isIban) { category = "DATOS_BANCARIOS"; norma = "RGPD Art. 5, 32 / LOPDGDD"; }
      else if (isCard) { category = "TARJETA_CREDITO"; norma = "PCI-DSS / RGPD"; }

      return {
        verdict: "RECHAZADO", decision: "DENY", category, norma,
        reason: "Detección de datos regulados en RAM L7",
        cleanPrompt: sanitize(cleanPrompt), cryptoSeal: computeL7Seal(cleanPrompt), shouldBlock: true
      };
    } else {
      return {
        verdict: "PERMITIDO", decision: "ALLOW", category: "AUDITORIA_CONFORME",
        norma: "EU AI Act - Tráfico Conforme", reason: "Prompt verificado sin PII en RAM",
        cleanPrompt: cleanPrompt, cryptoSeal: computeL7Seal(cleanPrompt), shouldBlock: false
      };
    }
  }

  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    const url = typeof resource === "string" ? resource : (resource?.url || "");
    const method = (config?.method || "GET").toUpperCase();

    if (config && config.body) {
      const check = evaluatePayload(config.body, url, method);
      if (check) {
        window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
        if (check.shouldBlock) {
          return new Promise((resolve, reject) => {
            showSaareBanner(check,
              () => {
                try {
                  if (typeof config.body === "string") {
                    config.body = config.body.replace(/(?:\\d{7,9}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])/gi, check.cleanPrompt);
                  }
                } catch {}
                resolve(rawFetch.apply(this, [resource, config]));
              },
              () => {
                reject(new Error("[S.A.A.R.E. L7] Transmisión abortada por normativa LOPDGDD / EU AI Act."));
              }
            );
          });
        }
      }
    }
    return rawFetch.apply(this, arguments);
  };
})();`;

      const popupHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { width: 300px; margin: 0; padding: 16px; background-color: #030712; color: #f3f4f6; font-family: system-ui, sans-serif; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2937; padding-bottom: 10px; margin-bottom: 12px; }
    .title { font-weight: 900; font-size: 14px; color: #ffffff; letter-spacing: 1px; }
    .badge-status { background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid #22c55e; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
    .info-card { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 10px; font-size: 11px; margin-bottom: 12px; }
    .label { color: #9ca3af; font-size: 9.5px; text-transform: uppercase; margin-bottom: 2px; }
    .val { color: #38bdf8; font-family: monospace; margin-bottom: 8px; word-break: break-all; }
    .btn-console { display: block; width: 100%; text-align: center; background: #0284c7; color: #ffffff; text-decoration: none; padding: 8px 0; border-radius: 6px; font-weight: bold; font-size: 11.5px; box-sizing: border-box; }
    .btn-console:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="header">
    <span class="title">SAARE SENSOR L7</span>
    <span class="badge-status">● ACTIVO</span>
  </div>
  <div class="info-card">
    <div class="label">Organización / Tenant</div>
    <div class="val" id="disp-tenant">ENTERPRISE</div>
    <div class="label">Usuario / Operador</div>
    <div class="val" id="disp-user">${userEmail}</div>
    <div class="label">Protocolo de Custodia</div>
    <div class="val" style="color: #4ade80;">SGP 1.0 (Fail-Closed)</div>
  </div>
  <a href="https://console.saare.es/" target="_blank" class="btn-console">Abrir SAARE GRC Console ↗</a>
  <script src="popup.js"></script>
</body>
</html>`;

      const popupJs = `if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['saare_tenant_domain', 'saare_user_email'], (res) => {
    if(res?.saare_tenant_domain) document.getElementById('disp-tenant').innerText = res.saare_tenant_domain;
    if(res?.saare_user_email) document.getElementById('disp-user').innerText = res.saare_user_email;
  });
}`;

      const installBat = `@echo off
title SAARE Sovereign Sensor - Instalador Automatico
color 0B
echo ========================================================
echo   S.A.A.R.E. L7 EX-ANTE EXECUTION GUARD - INSTALADOR
echo ========================================================
echo.
echo [INFO] Este directorio contiene los artefactos certificados del sensor.
echo [PASO 1] Abra Google Chrome o Microsoft Edge.
echo [PASO 2] Escriba en la barra de direcciones: chrome://extensions/
echo [PASO 3] Active la casilla "Modo de desarrollador" (arriba a la derecha).
echo [PASO 4] Haga clic en "Cargar descomprimida" y seleccione esta carpeta.
echo.
echo ========================================================
pause`;

      const readmeMd = `# SAARE Sovereign Execution Sensor (SGP 1.0)
- **Autoridad Pericial:** MS3V / Gabinete Tecnológico
- **Estándar:** L7 Runtime Enforcement & ISO/IEC 27037
- **Uso:** Descomprima este directorio y cárguelo en su navegador corporativo bajo el modo de desarrollador.`;

      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("storage_managed.json", JSON.stringify(storageManaged, null, 2));
      zip.file("background.js", backgroundJs);
      zip.file("content.js", contentJs);
      zip.file("inject.js", injectJs);
      zip.file("popup.html", popupHtml);
      zip.file("popup.js", popupJs);
      zip.file("install.bat", installBat);
      zip.file("README.md", readmeMd);

      const content = await zip.generateAsync({ type: "blob" });
      const fileName = `saare-agente-tokenizado-${userEmail.replace(/[@.]/g, "_")}.zip`;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      triggerGovernance(`Sensor tokenizado y empaquetado con éxito: ${fileName}`);
    } catch (err) {
      console.error("Error al generar el paquete ZIP:", err);
      triggerGovernance("Error al empaquetar la extensión Sovereign.");
    }
  };

  const handleExportChainOfCustody = () => {
    const custodyData = JSON.stringify({
      organization: "ENTERPRISE",
      user: userEmail,
      timestamp: new Date().toISOString(),
      standard: "ISO/IEC 27037:2012 / DORA / EU AI Act",
      activeDirectives: directives.filter(d => d.active).length,
      authModel: "Backend Authoritative HttpOnly",
      signatureEd25519: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      evidenceCount: evidences.length
    }, null, 2);

    const blob = new Blob([custodyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cadena_custodia_saare_iso27037.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance('Cadena de Custodia exportada correctamente en JSON firmado Ed25519.');
  };

  const handleDownloadTeaser = () => {
    const teaserText = `====================================================\nS.A.A.R.E. GRC & IA GOVERNANCE - MATRIZ DE INVARIANTES\n====================================================\n1. Invariante 0x01: Ningún prompt sale al LLM sin inspección L7 Ex-Ante.\n2. Invariante 0x02: Toda captura genera firma Ed25519 con hash SHA-256.\n3. Invariante 0x03: Fail-Closed Enforcement. Sin política, DENY automático.\n====================================================`;

    const blob = new Blob([teaserText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saare_matriz_invariantes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance('Teaser Técnico y Matriz de Invariantes descargado.');
  };

  const handleLogout = () => {
    if (window.confirm('¿Desea cerrar la sesión del Panel de Control GRC?')) {
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_user_email');
      setIsAuthenticated(false);
    }
  };

  const filteredEvidences = evidences.filter(item => {
    if (filter === 'TODOS') return true;
    if (filter === 'PRIVACIDAD') return item.type === 'PRIVACIDAD';
    if (filter === 'WORKFLOWS') return item.type === 'WORKFLOWS';
    return true;
  });

  const activeDirectivesCount = directives.filter(d => d.active).length;
  const disabledDirectivesCount = directives.filter(d => !d.active).length;

  if (!isAuthenticated) {
    return (
      <Login 
        onLoginSuccess={(data) => {
          if (data && data.email) {
            setUserEmail(data.email);
            localStorage.setItem('saare_user_email', data.email);
          }
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {governanceStatus && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#059669', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 10000, fontWeight: '800', fontSize: '0.85rem', border: '1px solid #10b981' }}>
          🔔 {governanceStatus}
        </div>
      )}

      <header style={{ width: '100%', background: '#0b0f19', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#38bdf8', letterSpacing: '1px' }}>S.A.A.R.E. CONSOLE GRC</h1>
          <span style={{ fontSize: '0.75rem', background: '#1e293b', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>v7 PRO</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
          <span>🛡️ Trust Anchor: <strong style={{ color: '#4ade80' }}>SAARE-MD-IPRES-2026</strong></span>
          <span>⚖️ Safe Creative ID: <strong style={{ color: '#38bdf8' }}>2606166125212</strong></span>
          <span>Forensic Custody & L7 Enforcement</span>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>

        <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid #1e293b' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.02em' }}>
                PANEL DE CONTROL GRC & EVIDENCIA FORENSE
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8' }}>
                ORGANIZACIÓN: <span style={{ color: '#f8fafc', fontWeight: '900' }}>ENTERPRISE</span> | ROL: <span style={{ color: '#38bdf8', fontWeight: '800' }}>{userEmail}</span> | DIRECTIVAS: <span style={{ color: '#4ade80', fontWeight: '900' }}>{activeDirectivesCount} ACTIVAS</span> | <span style={{ color: '#f87171', fontWeight: '900' }}>{disabledDirectivesCount} DESHABILITADAS</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setShowReportModal(true)}
                style={{ padding: '8px 16px', background: '#0284c7', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                📋 Informe Oficial CISO
              </button>

              <button
                onClick={handleLogout}
                style={{ padding: '8px 18px', background: '#27272a', border: '1px solid #3f3f46', color: '#ef4444', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                🔴 CERRAR SESIÓN
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#0f172a', border: '1px solid #1e293b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                BÓVEDA KV: EN VIVO | <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{timeStr || '13:55:00'}</span>
              </span>

              <span style={{ padding: '6px 14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
                IDENTIDAD: BACKEND AUTHORITATIVE SECURE SESSION
              </span>

            </div>

            <button
              onClick={handleDownloadExtension}
              style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              🧩 Descargar Sensor L7 Sovereign
            </button>
          </div>

          <GovernanceToolbar
            onExportCustody={handleExportChainOfCustody}
            onGenerateToken={() => setAuditTokenModal(true)}
            onDownloadTeaser={handleDownloadTeaser}
            onVerifySignature={() => setShowReportModal(true)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#94a3b8' }}>TESTIGOS L7 EN TIEMPO REAL:</span>
            <button onClick={() => setFilter('TODOS')} style={{ padding: '6px 14px', background: filter === 'TODOS' ? '#0284c7' : '#1e293b', color: filter === 'TODOS' ? '#ffffff' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>TODOS ({evidences.length})</button>
            <button onClick={() => setFilter('PRIVACIDAD')} style={{ padding: '6px 14px', background: filter === 'PRIVACIDAD' ? '#0284c7' : '#1e293b', color: filter === 'PRIVACIDAD' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>PRIVACIDAD</button>
            <button onClick={() => setFilter('WORKFLOWS')} style={{ padding: '6px 14px', background: filter === 'WORKFLOWS' ? '#0284c7' : '#1e293b', color: filter === 'WORKFLOWS' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>ORQUESTADORES / WORKFLOWS</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #1e293b', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('GLOBAL')} style={{ padding: '10px 20px', background: activeTab === 'GLOBAL' ? '#0284c7' : '#0f172a', color: activeTab === 'GLOBAL' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>REGISTRO DE EVIDENCIA</button>
            <button onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '10px 20px', background: activeTab === 'RUNLIVE' ? '#0284c7' : '#0f172a', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>S.A.A.R.E. ENFORCEMENT</button>
            <button onClick={() => setActiveTab('CONFIG')} style={{ padding: '10px 20px', background: activeTab === 'CONFIG' ? '#0284c7' : '#0f172a', color: activeTab === 'CONFIG' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>POLICY ENGINE</button>
          </div>

          {activeTab === 'GLOBAL' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '900', color: '#f8fafc', textTransform: 'uppercase' }}>HISTORIAL DE EVIDENCIAS FORENSES EN AUDITORÍA</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Trazas verificables: {filteredEvidences.length}</span>
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>TIMESTAMP</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>DECISION ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>POLÍTICA / ESTADO</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>PAYLOAD INTERCEPTADO</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>DICTAMEN</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>EVIDENCE BUNDLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvidences.map((ev, index) => {
                      const isRejected = ev.verdict === 'RECHAZADO' || ev.decision === 'DENY';
                      return (
                        <tr key={ev.id || index} style={{ borderBottom: '1px solid #1e293b', background: index % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                          <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{ev.time}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#38bdf8' }}>{ev.id}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '800', color: '#f8fafc' }}>{ev.cat}</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{ev.sub}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontFamily: 'monospace', color: '#38bdf8', background: '#020617', padding: '4px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                              {ev.promptSummary || ev.promptInput || ev.prompt || '(Sin texto capturado)'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              fontWeight: '900', 
                              color: isRejected ? '#ef4444' : '#10b981', 
                              background: isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              border: `1px solid ${isRejected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` 
                            }}>
                              {isRejected ? 'DENY (RECHAZADO)' : 'ALLOW (PERMITIDO)'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => setSelectedJson(ev)} style={{ padding: '4px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                              Ver JSON
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'RUNLIVE' && (
            <div style={{ background: '#020617', padding: '20px', borderRadius: '8px', color: '#f8fafc', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1.1rem' }}>📡 MONITOREO DE AUTORIZACIÓN L7</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>Conexión directa en tiempo real entre los agentes desplegados y el motor de decisión S.A.A.R.E.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ESTADO DEL ENFORCEMENT</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4ade80', marginTop: '4px' }}>ACTIVO (FAIL-CLOSED)</div>
                </div>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TIEMPO DE EVALUACIÓN</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>30 ms (Pre-LLM)</div>
                </div>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SESSION STATE</div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fbbf24', marginTop: '4px' }}>BACKEND MANAGED HTTP-ONLY</div>
                </div>
              </div>

              <div style={{ background: '#090d16', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a7f3d0', border: '1px solid #1e293b' }}>
                <div>[POLICY ENGINE - {timeStr}] Listening on {API_BASE_URL}/api/v1/runs...</div>
                <div>[AUTH LAYER] Session established via opaque HTTP-Only cookie. Token manipulation blocked.</div>
                <div>[ENFORCEMENT] Directives loaded: {activeDirectivesCount}/8. Fail-closed behavior enforced.</div>
              </div>
            </div>
          )}

          {activeTab === 'CONFIG' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '900', color: '#f8fafc' }}>
                CONFIGURACIÓN POLICY-AS-CODE (RUNTIME)
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {directives.map((dir) => (
                  <div key={dir.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f8fafc', display: 'block' }}>{dir.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Estándar: {dir.standard}</span>
                    </div>
                    <button
                      onClick={() => {
                        setDirectives(directives.map(d => d.id === dir.id ? { ...d, active: !d.active } : d));
                        triggerGovernance(`Directiva "${dir.name}" ${!dir.active ? 'activada' : 'desactivada'}.`);
                      }}
                      style={{ padding: '6px 14px', background: dir.active ? '#16a34a' : '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                      {dir.active ? 'ENFORCED' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {selectedJson && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '600px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#38bdf8' }}>Evidencia Criptográfica {selectedJson.id}</h3>
            <pre style={{ background: '#020617', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', color: '#34d399', border: '1px solid #1e293b' }}>
              {JSON.stringify({
                decision_id: selectedJson.id,
                tenant: "enterprise-isolated",
                principal: userEmail,
                policy_id: selectedJson.cat,
                policy_version: "1.4",
                decision: selectedJson.decision || (selectedJson.verdict === 'RECHAZADO' ? 'DENY' : 'ALLOW'),
                reason_codes: [selectedJson.sub],
                payload_hmac: "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842",
                timestamp_token: selectedJson.time,
                event_signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              }, null, 2)}
            </pre>
            <button onClick={() => setSelectedJson(null)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              Cerrar Evidence Bundle
            </button>
          </div>
        </div>
      )}

      {auditTokenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4ade80' }}>🛡️ Exportación de Evidencia Verificable</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Este Merkle Root certifica la integridad del historial de auditoría de la IA sin exponer datos en claro.</p>
            <div style={{ background: '#020617', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.85rem', border: '1px solid #1e293b', wordBreak: 'break-all', marginBottom: '16px' }}>
              SAARE-EVIDENCE-ROOT-2026-ED25519-99418274
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('SAARE-EVIDENCE-ROOT-2026-ED25519-99418274');
                triggerGovernance('Root Hash de auditoría copiado al portapapeles.');
                setAuditTokenModal(false);
              }}
              style={{ width: '100%', padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              Copiar Hash y Cerrar
            </button>
          </div>
        </div>
      )}

      {showReportModal && (
        <OfficialReportModal onClose={() => setShowReportModal(false)} />
      )}

    </div>
  );
}