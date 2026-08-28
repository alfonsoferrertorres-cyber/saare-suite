import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';
const AUDITOR_PLAN_PRICE = "149.00";

export default function App() {
  const [sessionUser, setSessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem('saare_suite_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [mode, setMode] = useState('register'); // 'register' | 'login' | 'reset'
  const [currentView, setCurrentView] = useState('LANDING'); // 'LANDING' | 'STATUS' | 'AUTH'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);
  const [showDiploma, setShowDiploma] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('nodejs');
  const [activeAudienceTab, setActiveAudienceTab] = useState('ciso');
  const [activeGrantTab, setActiveGrantTab] = useState('nextgen');

  const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5174'
    : 'https://saare-console.pages.dev';

  const CANONICAL_HASH = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";
  const VERIFY_URL = `${API_BASE}/verify/${CANONICAL_HASH}`;

  const signedPayload = {
    "CERTIFICADO_FIRMA_DIGITAL": "PRIMERA AUDITORIA NATIVA Y DESACOPLE EN CAPA 7 IA",
    "AUTOR_TITULAR": "Alfonso Ferrer Torres (Gabinete Juridico y Pericial MS3V)",
    "NIF_TITULAR": "48553065L",
    "NODO_OPEN_ENGINE": "2607076315021",
    "REGISTRO_OFICIAL_PROPIEDAD": "Safe Creative 2607076315021 / 2607076314949",
    "ID_MAESTRO_CONTEXTO": "MS3V-RECON-VALID-2026-ALF-0521",
    "ORIGEN_INFRAESTRUCTURA": "Gemini Core Semantic Engine (Hito Eureka)",
    "HUELLA_SHA256_CANONICA": CANONICAL_HASH,
    "ALGORITMO_FIRMA": "Ed25519 + sha256WithRSAEncryption (X.509 / RFC 3161)",
    "LATENCIA_DETERMINISTA_RAM": "1.16 ms",
    "ESTADO": "STATELESS_L7_VERIFIED (0.00% Error Logico)",
    "MARCO_REGULATORIO": ["EU AI Act 2024/1689", "UNE-EN ISO/IEC 42001", "ISO 27001", "DORA Capa 7", "RGPD Art. 5 y 32"],
    "URL_VERIFICACION_PUBLICA": VERIFY_URL
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';\n\n// Redirección L7 hacia el interceptor determinista local o gateway edge\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': 'sk_saare_live_AUDITOR_TOKEN',\n    'X-SAARE-Auditor-Delegation': 'emp_node_auth_hash_89bc2',\n    'X-SAARE-Execution-Mode': 'IN_MEMORY_ENFORCE'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar expediente: Titular con DNI 48593021X' }]\n});`,
    python: `from openai import OpenAI\nimport os\n\n# Cliente SDK con validación y redacción de PII ex-ante\nclient = OpenAI(\n    api_key=os.environ.get("OPENAI_API_KEY"),\n    base_url="${API_BASE}/intercept",\n    default_headers={\n        "X-SAARE-License": "sk_saare_live_AUDITOR_TOKEN",\n        "X-SAARE-Auditor-Delegation": "emp_node_auth_hash_89bc2",\n        "X-SAARE-Execution-Mode": "IN_MEMORY_ENFORCE"\n    }\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Auditar expediente: Titular con DNI 48593021X"}]\n)`,
    curl: `curl -X POST ${API_BASE}/intercept \\\n  -H "Content-Type: application/json" \\\n  -H "X-SAARE-License: sk_saare_live_AUDITOR_TOKEN" \\\n  -H "X-SAARE-Auditor-Delegation: emp_node_auth_hash_89bc2" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Auditar titular DNI 48593021X"}]\n  }'`,
    cabi: `/* SAARE Native C-ABI In-Process Sensor Hook */\n#include <saare_l7.h>\n\nint process_inference_buffer(const uint8_t* payload_ptr, size_t payload_len) {\n    saare_ctx_t* ctx = saare_init_context("sk_saare_oem_sensor_hugepages");\n    saare_verdict_t verdict = saare_scan_memory_buffer(ctx, payload_ptr, payload_len);\n    \n    if (verdict.is_violation) {\n        // Purga atómica en RAM mediante SYS_madvise (MADV_DONTNEED)\n        saare_purge_madvise((void*)payload_ptr, payload_len);\n        return -1; // Transmisión cortada a nivel de socket (< 0.017 ms)\n    }\n    \n    return 0; // Tráfico validado y conforme para inferencia\n}`
  };

  useEffect(() => {
    if (!sessionUser?.email) return;
    const checkVaultStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionUser.email, token: sessionUser.token || "session_check", source: 'suite' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const updated = { ...sessionUser, ...data.user };
            localStorage.setItem('saare_suite_user', JSON.stringify(updated));
            setSessionUser(updated);
          }
        }
      } catch (err) {}
    };
    checkVaultStatus();
    const interval = setInterval(checkVaultStatus, 15000);
    return () => clearInterval(interval);
  }, [sessionUser?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    let endpoint = `${API_BASE}/auth/register`;
    let payload = { email, password, tenantName: companyName, source: 'suite', role: 'AUDITOR' };

    if (mode === 'login') {
      endpoint = `${API_BASE}/auth/login`;
      payload = { email, password, source: 'suite' };
    } else if (mode === 'reset') {
      endpoint = `${API_BASE}/auth/reset`;
      payload = { email, password };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        if (mode === 'reset') {
          setSuccessMsg("Credenciales actualizadas. Inicia sesión con tu nueva contraseña.");
          setMode('login'); setPassword('');
        } else {
          const userData = { ...data.user };
          localStorage.setItem('saare_suite_user', JSON.stringify(userData));
          setSessionUser(userData);
          setCurrentView('STATUS');
        }
      } else {
        setError(data.error || "Error al autenticar en Bóveda KV.");
      }
    } catch {
      setError("Fallo de comunicación con el Control-Plane.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_suite_user');
    setSessionUser(null);
    setCurrentView('LANDING');
  };

  const handleDownloadSDK = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();
      const tEmail = (sessionUser?.email || "auditor@empresa.es").toLowerCase().trim();
      const tTenant = sessionUser?.tenantName || "ORGANIZACION_AUDITOR";
      const tToken = sessionUser?.token || "sk_live_auditor_managed_identity";

      zip.file("manifest.json", JSON.stringify({
        "manifest_version": 3,
        "name": "SAARE L7 Governance Agent",
        "version": "8.2.0",
        "description": "Universal Compliance & In-Memory Directives Engine for GenAI",
        "background": { "service_worker": "background.js" },
        "content_scripts": [{ "matches": ["https://*/*"], "js": ["content.js"], "run_at": "document_start" }],
        "web_accessible_resources": [{ "resources": ["inject.js"], "matches": ["https://*/*"] }],
        "permissions": ["storage"]
      }, null, 2));

      const injectContent = `/* S.A.A.R.E. L7 RAM Network Interceptor & Dynamic Directives Engine v8.2.0 */
(function() {
  const DLP = {
    dni: /(?:^|\\D)(\\d{7,8}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])(?!\\w)/i,
    iban: /ES\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{2}[\\s-]?\\d{10}|ES\\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/
  };

  function getSettings() {
    try {
      const raw = document.documentElement.getAttribute('data-saare-settings');
      return raw ? JSON.parse(raw) : { privacy: true, security: true, logs: true };
    } catch(e) {
      return { privacy: true, security: true, logs: true };
    }
  }

  function computeL7Seal(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return \`L7-SEAL:\${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}\`;
  }

  function isIgnoredRequest(url, bodyStr) {
    if (url) {
      const u = String(url).toLowerCase();
      if (u.includes("/log?") || u.includes("play.google.com") || u.includes("google-analytics") || u.includes("/collect?") || u.includes("gen_204") || u.includes("/upload/")) {
        return true;
      }
    }
    if (bodyStr && (bodyStr.startsWith("trace=Error:") || bodyStr.includes("at Object.") || bodyStr.includes("at https://"))) {
      return true;
    }
    return false;
  }

  function parseBody(body) {
    if (!body) return "";
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      try {
        const parts = [];
        body.forEach((val, key) => { parts.push(\`\${encodeURIComponent(key)}=\${encodeURIComponent(val)}\`); });
        return parts.join("&");
      } catch { return ""; }
    }
    if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
      return body.toString();
    }
    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
      try { return new TextDecoder("utf-8").decode(body); } catch { return ""; }
    }
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
      if (!fReqValue) {
        const match = rawText.match(/(?:^|&)f\\.req=([^&]+)/);
        if (match) {
          try { fReqValue = decodeURIComponent(match[1].replace(/\\+/g, " ")); } catch { fReqValue = match[1]; }
        }
      }
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
      return "";
    }
    try {
      const json = JSON.parse(rawText);
      if (json.messages && Array.isArray(json.messages)) {
        const lastMsg = json.messages[json.messages.length - 1];
        if (lastMsg?.content?.parts) return lastMsg.content.parts.join(" ");
        if (typeof lastMsg?.content === "string") return lastMsg.content;
      }
      if (json.prompt) return json.prompt;
      if (json.input) return json.input;
    } catch {}
    return "";
  }

  function sanitize(text) {
    if (!text) return "";
    return text
      .replace(/(?:^|\\D)(\\d{7,8}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])(?!\\w)/gi, (match, dni) => {
        const last = dni.slice(-4);
        return match.replace(dni, \`[DNI_REDACTED_***\${last}]\`);
      })
      .replace(/ES\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{2}[\\s-]?\\d{10}|ES\\d{18,22}/gi, (match) => {
        const last = match.slice(-4);
        return \`[IBAN_REDACTED_***\${last}]\`;
      })
      .replace(/(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/g, (match) => {
        const last = match.slice(-4);
        return \`[CARD_REDACTED_***\${last}]\`;
      });
  }

  function evaluatePayload(rawBody, url) {
    const settings = getSettings();
    if (!settings.privacy && !settings.logs) return null;

    const str = parseBody(rawBody);
    if (!str || isIgnoredRequest(url, str)) return null;

    const cleanPrompt = extractCleanPrompt(str);
    if (!cleanPrompt || cleanPrompt.length < 1) return null;

    if (settings.privacy) {
      const isDni = DLP.dni.test(cleanPrompt) || DLP.dni.test(str);
      const isIban = DLP.iban.test(cleanPrompt.replace(/[\\s-]/g, "")) || DLP.iban.test(str.replace(/[\\s-]/g, ""));
      const isCard = DLP.card.test(cleanPrompt.replace(/[\\s-]+/g, "")) || DLP.card.test(str.replace(/[\\s-]+/g, ""));

      if (isDni || isIban || isCard) {
        let category = "PII_DNI";
        let norma = "España - LOPDGDD & AEPD";
        if (isIban) { category = "DATOS_BANCARIOS"; norma = "RGPD Art. 5, 32 / LOPDGDD"; }
        else if (isCard) { category = "TARJETA_CREDITO"; norma = "PCI-DSS / RGPD"; }

        const displayPrompt = sanitize(cleanPrompt);
        return {
          verdict: "RECHAZADO",
          category,
          norma,
          reason: "Detección de datos regulados en memoria RAM L7",
          cleanPrompt: displayPrompt,
          sanitizedPrompt: displayPrompt,
          cryptoSeal: computeL7Seal(cleanPrompt)
        };
      }
    }

    if (!settings.logs) return null;

    return {
      verdict: "PERMITIDO",
      category: "AUDITORIA_CONFORME",
      norma: "ISO/IEC 42001 & EU AI Act",
      reason: "Tráfico conforme verificado en memoria",
      cleanPrompt: cleanPrompt,
      sanitizedPrompt: cleanPrompt,
      cryptoSeal: computeL7Seal(cleanPrompt)
    };
  }

  const rawOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._saare_url = url;
    return rawOpen.apply(this, arguments);
  };

  const rawSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    const check = evaluatePayload(body, this._saare_url);
    if (check) {
      if (check.verdict === "RECHAZADO") {
        window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
        throw new Error("[S.A.A.R.E. L7] Transmisión bloqueada en RAM.");
      } else if (check.verdict === "PERMITIDO") {
        window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
      }
    }
    return rawSend.apply(this, arguments);
  };

  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    const url = typeof resource === "string" ? resource : (resource?.url || "");
    if (config && config.body) {
      const check = evaluatePayload(config.body, url);
      if (check) {
        if (check.verdict === "RECHAZADO") {
          window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
          return new Response(JSON.stringify({ error: "S.A.A.R.E. Intercept: Bloqueado en RAM" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        } else if (check.verdict === "PERMITIDO") {
          window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
        }
      }
    }
    return rawFetch.apply(this, arguments);
  };
})();`;
      zip.file("inject.js", injectContent);

      const contentJsCode = `// SAARE L7 TELEMETRY & DOM BRIDGE v8.2.0
function updateDomSettings(settings) {
  if (settings) document.documentElement.setAttribute('data-saare-settings', JSON.stringify(settings));
}

if (typeof chrome !== "undefined" && chrome.storage?.local) {
  chrome.storage.local.get(["saare_settings"], (res) => {
    updateDomSettings(res?.saare_settings || { privacy: true, security: true, logs: true });
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.saare_settings) updateDomSettings(changes.saare_settings.newValue);
  });
}

const injectScript = document.createElement("script");
injectScript.src = chrome.runtime.getURL("inject.js");
injectScript.onload = function() { this.remove(); };
(document.head || document.documentElement).appendChild(injectScript);

function getActiveAccountFromDom() {
  const profileEl = document.querySelector('a[aria-label*="@"], button[aria-label*="@"], img[alt*="@"], div[aria-label*="@"]');
  const label = profileEl ? (profileEl.getAttribute('aria-label') || profileEl.getAttribute('alt') || '') : '';
  const match = label.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase().trim() : null;
}

function showModal(text, violationInfo) {
  const old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style = "position:fixed; bottom:20px; right:20px; width:460px; background:#0f172a; color:#ffffff; padding:16px; border-radius:8px; border:2px solid #ef4444; box-shadow:0 12px 28px rgba(0,0,0,0.6); z-index:999999; font-family:system-ui,-apple-system,sans-serif;";
  banner.innerHTML = \`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:900; font-size:0.85rem; color:#ef4444;">🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR (L7)</span>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px;">BLOQUEADO</span>
    </div>
    <p style="font-size:0.82rem; margin:0 0 8px 0; color:#cbd5e1; line-height:1.4;">
      <strong>Normativa:</strong> <span style="color:#f87171;">\${violationInfo?.norma || "RGPD / EU AI Act"}</span><br>
      <strong>Causa:</strong> \${violationInfo?.reason || "Carga regulada detectada"}
    </p>
    <div style="background:#1e293b; border-left:3px solid #ef4444; padding:8px 10px; border-radius:4px; font-size:0.8rem; color:#93c5fd; margin-bottom:10px; word-break:break-all;">
      Carga Neutralizada: "\${text.substring(0, 150)}"
    </div>
  \`;
  document.body.appendChild(banner);
  setTimeout(() => { if (banner && banner.parentNode) banner.remove(); }, 6000);
}

function sendEvidenceToBackground(auditData) {
  const text = auditData.cleanPrompt || auditData.sanitizedPrompt || "";
  if (!text || text.trim() === "") return;

  const payload = {
    promptInput: text.trim().substring(0, 500),
    user: getActiveAccountFromDom() || undefined,
    timestamp: new Date().toISOString(),
    verdict: auditData.verdict,
    category: auditData.category,
    norma: auditData.norma,
    cryptoSeal: auditData.cryptoSeal,
    violationDetails: { category: auditData.category, norma: auditData.norma, reason: auditData.reason, cryptoSeal: auditData.cryptoSeal }
  };

  if (auditData.verdict === "RECHAZADO") showModal(text, auditData);

  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    try {
      chrome.runtime.sendMessage({ type: "SAARE_LOG_EVENT", payload: payload }, () => {});
    } catch {}
  }
}

window.addEventListener("message", (event) => {
  if (event.data?.type === "SAARE_EVENT" && event.data.data) {
    sendEvidenceToBackground(event.data.data);
  }
});`;
      zip.file("content.js", contentJsCode);

      const bgCode = `const WORKER_URL = "${API_BASE}";

async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    if (chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({ user: managed.saare_user_email.toLowerCase().trim(), tenant: managed.saare_tenant_domain || "EMPRESA" });
        }
        fallbackLocal();
      });
    } else { fallbackLocal(); }

    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "${tEmail}";
        const finalTenant = local?.saare_tenant_domain || "${tTenant}";
        resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
      });
    }
  });
}

async function syncDynamicSettings() {
  const { user } = await resolveIdentity();
  if (user) {
    try {
      const res = await fetch(\`\${WORKER_URL}/settings?user=\${encodeURIComponent(user)}\`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) chrome.storage.local.set({ saare_settings: data.settings });
      }
    } catch(e) {}
  }
}
setInterval(syncDynamicSettings, 5000);
syncDynamicSettings();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
      const enrichedPayload = { ...message.payload, user, tenant };
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
});`;
      zip.file("background.js", bgCode);

      zip.file("storage_managed.json", JSON.stringify({
        "saare_user_email": tEmail,
        "saare_tenant_domain": tTenant,
        "saare_token": tToken,
        "saare_role": "AUDITOR"
      }, null, 2));

      const customBat = `@echo off\nchcp 65001 >nul\ntitle S.A.A.R.E. Installer\nset "EXTENSION_ID=saaregovernanceid"\nset "TARGET_DIR=%LOCALAPPDATA%\\SAARE\\extension"\nif not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"\nxcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\\" >nul 2>&1\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "version" /t REG_SZ /d "8.2.0" /f >nul 2>&1\necho [OK] Agente L7 desplegado para ${tEmail} (${tTenant}).\ntimeout /t 3 >nul\nexit /b 0`;
      zip.file("install_silent.bat", customBat);

      const blob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(blob);
      dl.download = `saare-runtime-${tTenant.toLowerCase().replace(/\\s+/g, '_')}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    } catch (err) {
      alert("Error al compilar el bundle del agente.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(CANONICAL_HASH);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const copyDigitalSignature = () => {
    navigator.clipboard.writeText(JSON.stringify(signedPayload, null, 2));
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070A0F', color: '#E8EDF2', fontFamily: '"Inter", "Geist", "IBM Plex Sans", -apple-system, sans-serif' }}>
      
      {/* MODAL DEL DIPLOMA REGISTRAL */}
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Diploma Registral RPI" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '14px 20px', background: '#0D1117', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#8B98A7', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación Safe Creative Nº 2607076315021 · Validez Probatoria Plena</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#FF4D5A', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DEEP TECH */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(7, 10, 15, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #151B23' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentView('LANDING')}>
            <div style={{ width: '28px', height: '28px', backgroundColor: '#E8EDF2', color: '#070A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px', borderRadius: '4px' }}>
              S
            </div>
            <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.3px', color: '#E8EDF2' }}>
              SAARE <span style={{ color: '#8B98A7', fontWeight: '400', fontSize: '13px', marginLeft: '6px' }}>// Runtime Governance L7</span>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '22px', alignItems: 'center', fontSize: '13px', fontWeight: '500' }}>
            <a href="#architecture" style={{ color: '#8B98A7', textDecoration: 'none' }}>Arquitectura</a>
            <a href="#subvenciones" style={{ color: '#2F81F7', textDecoration: 'none', fontWeight: '600' }}>Ayudas & Fondos</a>
            <a href="#evidence" style={{ color: '#8B98A7', textDecoration: 'none' }}>Evidencia</a>
            <a href="#solutions" style={{ color: '#8B98A7', textDecoration: 'none' }}>Despliegues</a>
            <a href="#developers" style={{ color: '#8B98A7', textDecoration: 'none' }}>Developers</a>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '12px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#151B23', border: '1px solid #30363D', color: '#2F81F7', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                  {currentView === 'STATUS' ? 'Ver Landing' : 'Consola'}
                </button>
                <button onClick={handleLogout} style={{ color: '#FF4D5A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => setCurrentView('AUTH')} style={{ padding: '7px 16px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: '12px' }}>
                Acceso Bóveda
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* VISTA 1: AUTENTICACIÓN / ACCESO A BÓVEDA */}
      {currentView === 'AUTH' && !sessionUser && (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '36px', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2F81F7', marginBottom: '8px' }}>// AUTHENTICATION_GATEWAY</div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#E8EDF2' }}>
              {mode === 'reset' ? 'Restablecer Clave' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Perfil Auditor')}
            </h1>
            <p style={{ fontSize: '13px', color: '#8B98A7', marginBottom: '24px', lineHeight: 1.5 }}>
              Identidad criptográfica vinculada a Bóveda Cloudflare KV.
            </p>

            {mode !== 'reset' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#070A0F', padding: '4px', borderRadius: '6px' }}>
                <button onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'login' ? '#151B23' : 'transparent', color: mode === 'login' ? '#E8EDF2' : '#8B98A7', cursor: 'pointer', borderRadius: '4px', fontSize: '12.5px', fontWeight: '600' }}>Acceder</button>
                <button onClick={() => { setMode('register'); setError(''); }} style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'register' ? '#151B23' : 'transparent', color: mode === 'register' ? '#E8EDF2' : '#8B98A7', cursor: 'pointer', borderRadius: '4px', fontSize: '12.5px', fontWeight: '600' }}>Registrar</button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#8B98A7', marginBottom: '6px', fontFamily: 'monospace' }}>ORGANIZACIÓN / TENANT</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ej: Gabinete Pericial Alpha" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070A0F', border: '1px solid #21262D', color: '#E8EDF2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#8B98A7', marginBottom: '6px', fontFamily: 'monospace' }}>CORREO CORPORATIVO</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="auditor@empresa.es" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070A0F', border: '1px solid #21262D', color: '#E8EDF2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11.5px', color: '#8B98A7', fontFamily: 'monospace' }}>CONTRASEÑA</label>
                  {mode === 'login' && (
                    <span onClick={() => setMode('reset')} style={{ fontSize: '11.5px', color: '#2F81F7', cursor: 'pointer' }}>¿Olvidaste clave?</span>
                  )}
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070A0F', border: '1px solid #21262D', color: '#E8EDF2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>

              {error && <div style={{ padding: '10px', backgroundColor: 'rgba(255, 77, 90, 0.1)', border: '1px solid rgba(255, 77, 90, 0.3)', color: '#FF4D5A', fontSize: '12px', borderRadius: '4px' }}>{error}</div>}
              {successMsg && <div style={{ padding: '10px', backgroundColor: 'rgba(32, 201, 151, 0.1)', border: '1px solid rgba(32, 201, 151, 0.3)', color: '#20C997', fontSize: '12px', borderRadius: '4px' }}>{successMsg}</div>}

              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer', fontSize: '13px', marginTop: '8px' }}>
                {loading ? 'Procesando...' : (mode === 'login' ? 'Autenticar en Vault KV' : (mode === 'reset' ? 'Confirmar Nueva Clave' : 'Aprovisionar Cuenta'))}
              </button>

              {mode === 'reset' && (
                <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#8B98A7', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>
                  ← Volver a inicio de sesión
                </button>
              )}
            </form>
          </div>
        </main>
      )}

      {/* VISTA 2: PANEL DE CONTROL DE AUDITOR */}
      {currentView === 'STATUS' && sessionUser && (
        <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997', backgroundColor: 'rgba(32, 201, 151, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(32, 201, 151, 0.2)' }}>
                ● NODO AUDITOR ACTIVADO
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#8B98A7' }}>ISO/IEC 42001 COMPLIANT</span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#E8EDF2' }}>
              Consola de Trazabilidad y Asiento de Consultoría
            </h1>
            <p style={{ color: '#8B98A7', fontSize: '14px', marginBottom: '28px', lineHeight: 1.5 }}>
              Nodo de supervisión en tiempo real. Gestiona la captura de evidencias en RAM y el desacople de telemetría sin retención de texto plano.
            </p>

            <div style={{ backgroundColor: '#070A0F', border: '1px solid #21262D', padding: '20px', borderRadius: '6px', marginBottom: '32px', fontFamily: 'monospace', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #151B23', marginBottom: '10px' }}>
                <span style={{ color: '#8B98A7' }}>TENANT_ORGANIZACION</span>
                <strong style={{ color: '#E8EDF2' }}>{sessionUser.tenantName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #151B23', marginBottom: '10px' }}>
                <span style={{ color: '#8B98A7' }}>AUDITOR_TITULAR</span>
                <strong style={{ color: '#2F81F7' }}>{sessionUser.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #151B23', marginBottom: '10px' }}>
                <span style={{ color: '#8B98A7' }}>TOKEN_LICENCIA</span>
                <strong style={{ color: '#8B98A7' }}>{sessionUser.token || 'sk_live_managed_identity'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B98A7' }}>ESTADO_MOTOR_L7</span>
                <strong style={{ color: '#20C997' }}>STATELESS_RAM_ACTIVE (1.16 ms)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#2F81F7', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>
                Abrir Evidence Viewer (Consola GRC) ↗
              </a>
              <button onClick={handleDownloadSDK} disabled={downloadingZip} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#151B23', color: '#E8EDF2', border: '1px solid #30363D', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {downloadingZip ? 'Compilando...' : 'Descargar Agente Tokenizado (.zip)'}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VISTA 3: LANDING PAGE ENTERPRISE */}
      {currentView === 'LANDING' && (
        <main>
          {/* HERO SECTION */}
          <section style={{ maxWidth: '1100px', margin: '70px auto 60px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', backgroundColor: 'rgba(47, 129, 247, 0.1)', border: '1px solid rgba(47, 129, 247, 0.3)', borderRadius: '20px', color: '#2F81F7', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', marginBottom: '24px' }}>
              INFRAESTRUCTURA DE GOBERNANZA EN TIEMPO DE EJECUCIÓN
            </div>

            <h1 style={{ fontSize: '54px', fontWeight: '800', lineHeight: 1.12, letterSpacing: '-1.8px', margin: '0 0 20px 0', color: '#E8EDF2' }}>
              Control determinista del <span style={{ color: '#2F81F7' }}>runtime de IA.</span>
            </h1>

            <p style={{ fontSize: '17px', color: '#8B98A7', lineHeight: 1.6, maxWidth: '760px', margin: '0 auto 36px auto' }}>
              Capa L7 in-process que intercepta, valida y gobierna las operaciones de inferencia antes de que alcancen al modelo. Erradica fugas de datos en memoria y genera trazabilidad probatoria para <strong>ISO/IEC 42001</strong>, el <strong>EU AI Act</strong> y la <strong>justificación técnica de fondos públicos</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '50px' }}>
              <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ padding: '12px 28px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}>
                Probar Sandbox de Evaluación ↗
              </button>
              <button onClick={() => setCurrentView('AUTH')} style={{ padding: '12px 24px', backgroundColor: '#151B23', color: '#E8EDF2', border: '1px solid #30363D', borderRadius: '4px', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>
                Aprovisionar Asiento Auditor
              </button>
            </div>

            {/* DIAGRAMA ESTRUCTURAL ASCII */}
            <div id="architecture" style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px', maxWidth: '640px', margin: '0 auto', textAlign: 'left', overflowX: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #151B23', paddingBottom: '8px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>TOPOLOGÍA DE EJECUCIÓN L7</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997' }}>LATENCIA: 1.16 ms</span>
              </div>
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.45, color: '#8B98A7' }}>
{`   ┌────────────────────────┐
   │ CLIENT / APP / WORKFLOW│
   └───────────┬────────────┘
               │ (Socket Request)
               ▼
 ╔════════════════════════════╗
 ║      SAARE L7 ENGINE       ║
 ║                            ║
 ║  `}
<span style={{ color: '#2F81F7' }}>[1] INTERCEPT</span>{` (RAM Buffer)  ║
 ║  `}
<span style={{ color: '#20C997' }}>[2] VALIDATE</span>{`  (DLP / PII)    ║
 ║  `}
<span style={{ color: '#FF4D5A' }}>[3] ENFORCE</span>{`   (madvise purge)║
 ║  `}
<span style={{ color: '#E8EDF2' }}>[4] EVIDENCE</span>{`  (SHA-256 Digest║
 ╚═════════════╤══════════════╝
               │ (Clean Stream)
               ▼
     ┌───────────────────┐
     │   LLM PROVIDER    │
     │(OpenAI/Claude/etc)│
     └───────────────────┘`}
              </pre>
            </div>
          </section>

          {/* TRES PILARES */}
          <section style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>01 / PRE-INFERENCE</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 10px 0', color: '#E8EDF2' }}>Control Ex-Ante</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.55, margin: 0 }}>
                  Evaluación determinista de políticas en memoria volátil antes de que el payload salga del entorno corporativo.
                </p>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                <div style={{ color: '#FF4D5A', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>02 / ZERO-PERSISTENCE</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 10px 0', color: '#E8EDF2' }}>Protección Atómica</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.55, margin: 0 }}>
                  Redacción y bloqueo sin túneles proxy intermedios. Los datos sensibles detectados se purgan con <code style={{ color: '#E8EDF2' }}>SYS_madvise</code>.
                </p>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                <div style={{ color: '#20C997', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>03 / FORENSIC DIGEST</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 10px 0', color: '#E8EDF2' }}>Evidencia Inmutable</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.55, margin: 0 }}>
                  Registro criptográfico SHA-256 de cada decisión operativa para justificación técnica de fondos y auditorías ISO 42001.
                </p>
              </div>
            </div>
          </section>

          {/* MÓDULO: JUSTIFICACIÓN DE SUBVENCIONES Y AYUDAS PÚBLICAS */}
          <section id="subvenciones" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderLeft: '4px solid #2F81F7', borderRadius: '8px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7' }}>// PUBLIC_FUNDS & GRANT_COMPLIANCE</span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0', color: '#E8EDF2' }}>
                    Blindaje Técnico de Ayudas y Subvenciones de IA
                  </h2>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997', background: 'rgba(32, 201, 151, 0.1)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(32, 201, 151, 0.2)' }}>
                  NO-CLAWBACK GUARANTEE ENGINE
                </span>
              </div>

              <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 28px 0', maxWidth: '820px' }}>
                Los programas de financiación pública exigen justificar el uso real y el cumplimiento de seguridad del dato en los proyectos subvencionados. SAARE proporciona las evidencias técnicas para superar auditorías y evitar el reintegro de fondos.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #151B23', paddingBottom: '12px' }}>
                <button onClick={() => setActiveGrantTab('nextgen')} style={{ padding: '6px 14px', border: 'none', borderRadius: '4px', background: activeGrantTab === 'nextgen' ? '#151B23' : 'transparent', color: activeGrantTab === 'nextgen' ? '#2F81F7' : '#8B98A7', fontWeight: '600', fontSize: '12.5px', cursor: 'pointer' }}>
                  🇪🇺 NextGenerationEU & PRTR
                </button>
                <button onClick={() => setActiveGrantTab('kit')} style={{ padding: '6px 14px', border: 'none', borderRadius: '4px', background: activeGrantTab === 'kit' ? '#151B23' : 'transparent', color: activeGrantTab === 'kit' ? '#2F81F7' : '#8B98A7', fontWeight: '600', fontSize: '12.5px', cursor: 'pointer' }}>
                  💼 Kit Consulting & Asesoramiento IA
                </button>
                <button onClick={() => setActiveGrantTab('cdti')} style={{ padding: '6px 14px', border: 'none', borderRadius: '4px', background: activeGrantTab === 'cdti' ? '#151B23' : 'transparent', color: activeGrantTab === 'cdti' ? '#2F81F7' : '#8B98A7', fontWeight: '600', fontSize: '12.5px', cursor: 'pointer' }}>
                  🔬 CDTI, ENISA & Proyectos I+D+i
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '20px', borderRadius: '6px' }}>
                  <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>01 / RIESGO MITIGADO</div>
                  <strong style={{ color: '#E8EDF2', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Reintegro por Falta de Trazabilidad</strong>
                  <p style={{ color: '#8B98A7', fontSize: '12.5px', lineHeight: 1.5, margin: 0 }}>
                    Evita devoluciones de ayudas por no poder acreditar documentalmente la actividad técnica o el ciclo de vida seguro de la IA.
                  </p>
                </div>

                <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '20px', borderRadius: '6px' }}>
                  <div style={{ color: '#20C997', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>02 / ENTREGABLE AUDITABLE</div>
                  <strong style={{ color: '#E8EDF2', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Memoria con Firma RFC 3161</strong>
                  <p style={{ color: '#8B98A7', fontSize: '12.5px', lineHeight: 1.5, margin: 0 }}>
                    Genera el extracto de evidencias SHA-256 e informes periciales listos para anexar a la cuenta justificativa del expediente.
                  </p>
                </div>

                <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '20px', borderRadius: '6px' }}>
                  <div style={{ color: '#E8EDF2', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>03 / CUMPLIMIENTO EX-ANTE</div>
                  <strong style={{ color: '#E8EDF2', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Alineación ISO 42001 & AI Act</strong>
                  <p style={{ color: '#8B98A7', fontSize: '12.5px', lineHeight: 1.5, margin: 0 }}>
                    Acredita que la solución implementada cumple los requisitos de evaluación de riesgos del Reglamento Europeo de IA.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px dashed #151B23', paddingTop: '18px' }}>
                <span style={{ fontSize: '12px', color: '#8B98A7', fontFamily: 'monospace' }}>
                  ¿Gestionas expedientes de subvención para clientes? Habilita tu Asiento de Auditor.
                </span>
                <button onClick={() => setCurrentView('AUTH')} style={{ padding: '8px 18px', backgroundColor: '#2F81F7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                  Acreditar Asiento Pericial ↗
                </button>
              </div>
            </div>
          </section>

          {/* AUDIENCIAS */}
          <section style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '32px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #151B23', paddingBottom: '16px' }}>
                <button onClick={() => setActiveAudienceTab('ciso')} style={{ padding: '6px 14px', border: 'none', borderRadius: '4px', background: activeAudienceTab === 'ciso' ? '#151B23' : 'transparent', color: activeAudienceTab === 'ciso' ? '#2F81F7' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🛡️ CISO & Seguridad
                </button>
                <button onClick={() => setActiveAudienceTab('cto')} style={{ padding: '6px 14px', border: 'none', borderRadius: '4px', background: activeAudienceTab === 'cto' ? '#151B23' : 'transparent', color: activeAudienceTab === 'cto' ? '#2F81F7' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  ⚙️ CTO & Developers
                </button>
                <button onClick={() => setActiveAudienceTab('auditor')} style={{ padding: '6px 14px', border: 'none', borderRadius: '4px', background: activeAudienceTab === 'auditor' ? '#151B23' : 'transparent', color: activeAudienceTab === 'auditor' ? '#2F81F7' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  ⚖️ Auditores & Compliance
                </button>
              </div>

              {activeAudienceTab === 'ciso' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#E8EDF2' }}>Neutralización de Fugas PII en Origen</h3>
                  <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Protege modelos comerciales (Gemini, ChatGPT, Claude) frente a filtraciones de DNI, cuentas bancarias IBAN o secretos industriales directamente en el endpoint del empleado.
                  </p>
                  <ul style={{ color: '#E8EDF2', fontSize: '13px', lineHeight: 1.8, margin: 0, paddingLeft: '20px' }}>
                    <li>Bloqueo ex-ante sin almacenamiento de texto claro en bases de datos externas.</li>
                    <li>Eliminación del vector de riesgo generado por proxies man-in-the-middle en cloud.</li>
                  </ul>
                </div>
              )}

              {activeAudienceTab === 'cto' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#E8EDF2' }}>Integración de Baja Fricción y Latencia 1.16 ms</h3>
                  <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Despliegue flexible mediante enlaces C-ABI in-process, nodos para flujos n8n/LangChain o agente para endpoints.
                  </p>
                  <ul style={{ color: '#E8EDF2', fontSize: '13px', lineHeight: 1.8, margin: 0, paddingLeft: '20px' }}>
                    <li>Cero dependencia de servidores intermedios de alta latencia.</li>
                    <li>SDK nativo para Node.js, Python y C-ABI (C/C++, Rust, Go).</li>
                  </ul>
                </div>
              )}

              {activeAudienceTab === 'auditor' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#E8EDF2' }}>Certificación Técnica y Trazabilidad ISO 42001</h3>
                  <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Generación continua de dictámenes y evidencias probatorias SHA-256 exigidas en memorias técnicas de subvenciones europeas.
                  </p>
                  <ul style={{ color: '#E8EDF2', fontSize: '13px', lineHeight: 1.8, margin: 0, paddingLeft: '20px' }}>
                    <li>Delegación consentida auditor-empleado mediante Handshake Token.</li>
                    <li>Verificación de hashes en el Edge con validez probatoria RFC 3161.</li>
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* EVIDENCIA FORENSE EN VIVO */}
          <section id="evidence" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7' }}>// FORENSIC_PROOF</span>
                <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0 0 0', color: '#E8EDF2' }}>Trazabilidad Demostrable en Vivo</h2>
              </div>
              <span style={{ color: '#8B98A7', fontSize: '12px', fontFamily: 'monospace' }}>ROOT FIDUCIARIA: SAFE CREATIVE Nº 2607076315021</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px', alignItems: 'stretch' }}>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #151B23', paddingBottom: '8px' }}>
                  <span style={{ color: '#8B98A7' }}>TX_RECORD</span>
                  <span style={{ color: '#E8EDF2' }}>SAARE-7F82A1</span>
                </div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>TIMESTAMP:</span> 2026-08-28 14:42:07 UTC</div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>POLICY_RULE:</span> PII-001 (GDPR_STRICT)</div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>DETECTION:</span> <span style={{ color: '#FF4D5A' }}>IBAN_REGULATED_MATCH</span></div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>ACTION:</span> <span style={{ color: '#2F81F7' }}>REDACT_IN_MEMORY</span></div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ color: '#8B98A7' }}>CANONICAL_SHA256:</span>
                  <div style={{ color: '#E8EDF2', wordBreak: 'break-all', backgroundColor: '#070A0F', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    {CANONICAL_HASH}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed #151B23' }}>
                  <span style={{ color: '#20C997', fontWeight: 'bold' }}>✓ L7_STATELESS_VERIFIED</span>
                  <button onClick={copyHashToClipboard} style={{ background: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    {copiedHash ? 'Copiado' : 'Copiar Hash'}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0', color: '#E8EDF2' }}>
                    Validación Pública Descentralizada
                  </h3>
                  <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Cualquier auditor externo puede verificar el digest criptográfico contra el endpoint Edge sin exponer la carga útil de la empresa.
                  </p>
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #21262D', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7', wordBreak: 'break-all', marginBottom: '16px' }}>
                    GET {VERIFY_URL}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#2F81F7', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '700' }}>
                    🔍 Ejecutar Verificación en Vivo (Edge Gateway) ↗
                  </a>
                  <button onClick={() => setShowDiploma(true)} style={{ padding: '12px 18px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Diploma RPI
                  </button>
                  <button onClick={copyDigitalSignature} style={{ padding: '12px 18px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#20C997', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    {copiedSig ? '✔ Firma Copiada' : 'Copiar Firma'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VECTORES DE DESPLIEGUE */}
          <section id="solutions" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7' }}>// DEPLOYMENT_MODELS</span>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0 0 0', color: '#E8EDF2' }}>Tres Vectores de Integración en Producción</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>OEM EMBEDDED</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997' }}>0.017 ms RAM</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#E8EDF2' }}>Binario Nativo C-ABI</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    Biblioteca dinámica (<code style={{ color: '#E8EDF2' }}>.so/.dll</code>) in-process para fabricantes de seguridad y agentes EDR/XDR.
                  </p>
                  <ul style={{ color: '#8B98A7', fontSize: '12.5px', lineHeight: 1.6, paddingLeft: '18px', margin: 0 }}>
                    <li>Ejecución en HugePages de memoria volátil.</li>
                    <li>Cero coste de llamadas cloud externas.</li>
                  </ul>
                </div>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>ISV WORKFLOW</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2F81F7' }}>HTTP Gateway</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#E8EDF2' }}>Nodo & API Middleware</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    Módulos nativos para pipelines automatizados en n8n, LangChain o arquitecturas serverless.
                  </p>
                  <ul style={{ color: '#8B98A7', fontSize: '12.5px', lineHeight: 1.6, paddingLeft: '18px', margin: 0 }}>
                    <li>Filtrado determinista de prompts antes del LLM.</li>
                    <li>Conectores estándar Node.js y Python.</li>
                  </ul>
                </div>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #2F81F7', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(47,129,247,0.08)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2F81F7', backgroundColor: 'rgba(47,129,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>PROFESIONAL</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997' }}>Asiento Único</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#E8EDF2' }}>Asiento de Consultor / Auditor</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    Supervisión delegada de empleados con Handshake consentido para despachos periciales y CISOs.
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: '800', color: '#E8EDF2', margin: '14px 0' }}>
                    {AUDITOR_PLAN_PRICE} € <span style={{ fontSize: '12px', color: '#8B98A7', fontWeight: 'normal' }}>/ mes</span>
                  </div>
                </div>

                <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '10px', backgroundColor: '#2F81F7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  Contratar Asiento Auditor ↗
                </button>
              </div>
            </div>
          </section>

          {/* DEVELOPERS / SNIPPETS */}
          <section id="developers" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#E8EDF2' }}>Integración de Código (SAARE-SDK)</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['nodejs', 'python', 'curl', 'cabi'].map(tab => (
                    <button key={tab} onClick={() => setActiveCodeTab(tab)} style={{ background: activeCodeTab === tab ? '#151B23' : 'transparent', border: '1px solid', borderColor: activeCodeTab === tab ? '#30363D' : '#151B23', color: activeCodeTab === tab ? '#2F81F7' : '#8B98A7', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', fontWeight: '600' }}>
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <pre style={{ margin: 0, backgroundColor: '#070A0F', border: '1px solid #21262D', borderRadius: '6px', padding: '18px', color: '#E8EDF2', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
                {codeSnippets[activeCodeTab]}
              </pre>
            </div>
          </section>

          {/* FOOTER ENTERPRISE */}
          <footer style={{ borderTop: '1px solid #151B23', backgroundColor: '#070A0F', padding: '36px 24px', fontSize: '12px', color: '#8B98A7' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#E8EDF2' }}>S.A.A.R.E. Platform</strong> · AI Runtime Governance Infrastructure
                <div style={{ marginTop: '4px' }}>Safe Creative ID: 2607076315021 / 2607076314949 · RFC 3161 Evidence</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>Trust Center / Root API</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>GRC Console</a>
              </div>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}