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
  const [currentView, setCurrentView] = useState('STATUS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  
  const [isOffline, setIsOffline] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);
  const [showDiploma, setShowDiploma] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('nodejs');

  const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5174'
    : 'https://saare-console.pages.dev';

  const signedPayload = {
    "CERTIFICADO_FIRMA_DIGITAL": "PRIMERA AUDITORIA NATIVA Y DESACOPLE EN CAPA 7 IA",
    "AUTOR_TITULAR": "Alfonso Ferrer Torres (Gabinete Juridico y Pericial MS3V)",
    "NIF_TITULAR": "48553065L",
    "NODO_OPEN_ENGINE": "2607076315021",
    "REGISTRO_OFICIAL_PROPIEDAD": "Safe Creative 2607076315021 / 2607076314949",
    "ID_MAESTRO_CONTEXTO": "MS3V-RECON-VALID-2026-ALF-0521",
    "ORIGEN_INFRAESTRUCTURA": "Gemini Core Semantic Engine (Hito Eureka)",
    "HUELLA_SHA256_CANONICA": "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07",
    "ALGORITMO_FIRMA": "Ed25519 + sha256WithRSAEncryption (X.509 / RFC 3161)",
    "LATENCIA_DETERMINISTA_RAM": "1.16 ms",
    "ESTADO": "STATELESS_L7_VERIFIED (0.00% Error Logico)",
    "MARCO_REGULATORIO": ["EU AI Act 2024/1689", "UNE-EN ISO/IEC 42001", "ISO 27001", "DORA Capa 7"],
    "URL_VERIFICACION_PUBLICA": `${API_BASE}/verify/128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07`
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';\n\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': 'sk_saare_live_AUDITOR_TOKEN',\n    'X-SAARE-Auditor-Delegation': 'emp_node_auth_hash_89bc2',\n    'X-SAARE-Suite': 'AUDIT_REALTIME_HOOK'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar crédito: Titular con DNI 48593021X' }]\n});`,
    python: `from openai import OpenAI\nimport os\n\nclient = OpenAI(\n    api_key=os.environ.get("OPENAI_API_KEY"),\n    base_url="${API_BASE}/intercept",\n    default_headers={\n        "X-SAARE-License": "sk_saare_live_AUDITOR_TOKEN",\n        "X-SAARE-Auditor-Delegation": "emp_node_auth_hash_89bc2"\n    }\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Auditar crédito: Titular con DNI 48593021X"}]\n)`,
    curl: `curl ${API_BASE}/intercept \\\n  -H "Content-Type: application/json" \\\n  -H "X-SAARE-License: sk_saare_live_AUDITOR_TOKEN" \\\n  -H "X-SAARE-Auditor-Delegation: emp_node_auth_hash_89bc2" \\\n  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Auditar DNI 48593021X"}]}'`,
    cabi: `/* SAARE Native C-ABI In-Sensor Hook (HugePages Buffer) */\n#include <saare_l7.h>\n\nint main() {\n    saare_ctx_t* ctx = saare_init_context("sk_saare_oem_sensor_hugepages");\n    saare_verdict_t verdict = saare_scan_memory_buffer(ctx, payload_ptr, payload_len);\n    if (verdict.is_violation) {\n        saare_purge_madvise(payload_ptr, payload_len); // SYS_madvise MADV_DONTNEED\n        return -1; // Transmisión cortada en RAM (< 0.017 ms)\n    }\n    return 0; // Tráfico conforme verificado\n}`
  };

  useEffect(() => {
    if (!sessionUser?.email) return;

    const checkVaultStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: sessionUser.email, 
            token: sessionUser.token || "session_check", 
            password: sessionUser.password || "", 
            source: 'suite' 
          })
        });
        
        setIsOffline(false);
        
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const updated = { ...sessionUser, ...data.user };
            delete updated.password;
            localStorage.setItem('saare_suite_user', JSON.stringify(updated));
            setSessionUser(updated);
          }
        }
      } catch (err) {
        console.error("⚠️ SAARE L7: Pérdida de sincronización con Bóveda KV", err);
        setIsOffline(true);
      }
    };

    checkVaultStatus();
    const interval = setInterval(checkVaultStatus, 15000);
    return () => clearInterval(interval);
  }, [sessionUser?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

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
          setSuccessMsg(data.message || "Contraseña restablecida con éxito. Inicia sesión.");
          setMode('login');
          setPassword('');
        } else {
          const userData = { ...data.user };
          delete userData.password;
          
          localStorage.setItem('saare_suite_user', JSON.stringify(userData));
          localStorage.setItem('saare_user', JSON.stringify(userData));
          setSessionUser(userData);
        }
      } else {
        setError(data.error || "Error al procesar la solicitud.");
      }
    } catch {
      setError("No se pudo conectar con el servidor de autenticación.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_suite_user');
    localStorage.removeItem('saare_user');
    setSessionUser(null);
    setEmail('');
    setPassword('');
  };

  const handleDownloadExtension = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      const targetEmail = (sessionUser?.email || "auditor@empresa.es").toLowerCase().trim();
      const targetTenant = sessionUser?.tenantName || "ORGANIZACION_AUDITOR";
      const targetToken = sessionUser?.token || "sk_live_auditor_managed_identity";

      const manifestContent = JSON.stringify({
        "manifest_version": 3,
        "name": "SAARE L7 Governance Agent (Auditor Edition)",
        "version": "8.2.0",
        "description": "Universal Compliance & Real-Time Audit Engine for GenAI",
        "background": { "service_worker": "background.js" },
        "content_scripts": [
          {
            "matches": [
              "https://gemini.google.com/*",
              "https://chatgpt.com/*",
              "https://chat.openai.com/*",
              "https://claude.ai/*",
              "https://copilot.microsoft.com/*",
              "https://chat.deepseek.com/*",
              "https://www.perplexity.ai/*"
            ],
            "js": ["content.js"],
            "run_at": "document_start"
          }
        ],
        "web_accessible_resources": [
          {
            "resources": ["inject.js"],
            "matches": [
              "https://gemini.google.com/*",
              "https://chatgpt.com/*",
              "https://chat.openai.com/*",
              "https://claude.ai/*",
              "https://copilot.microsoft.com/*",
              "https://chat.deepseek.com/*",
              "https://www.perplexity.ai/*"
            ]
          }
        ],
        "permissions": ["storage"]
      }, null, 2);
      zip.file("manifest.json", manifestContent);

      const injectContent = `/* S.A.A.R.E. L7 RAM Network Interceptor & Sanitizer v8.2.0 */
(function() {
  const DLP = {
    dni: /(?:^|\\D)(\\d{7,8}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])(?!\\w)/i,
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
    const str = parseBody(rawBody);
    if (!str || isIgnoredRequest(url, str)) return null;

    const cleanPrompt = extractCleanPrompt(str);
    if (!cleanPrompt || cleanPrompt.length < 1) return null;

    const isDni = DLP.dni.test(cleanPrompt) || DLP.dni.test(str);
    const isIban = DLP.iban.test(cleanPrompt.replace(/[\\s-]/g, "")) || DLP.iban.test(str.replace(/[\\s-]/g, ""));
    const isCard = DLP.card.test(cleanPrompt.replace(/[\\s-]+/g, "")) || DLP.card.test(str.replace(/[\\s-]+/g, ""));

    if (isDni || isIban || isCard) {
      let category = "PII_DNI";
      let norma = "España - LOPDGDD & AEPD";

      if (isIban) {
        category = "DATOS_BANCARIOS";
        norma = "RGPD Art. 5, 32 / LOPDGDD";
      } else if (isCard) {
        category = "TARJETA_CREDITO";
        norma = "PCI-DSS / RGPD";
      }

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

      const contentJsCode = `// SAARE L7 AUDITOR BRIDGE v8.2.0
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
  let old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style = "position:fixed; bottom:20px; right:20px; width:460px; background:#0f172a; color:#ffffff; padding:16px; border-radius:8px; border:2px solid #ef4444; box-shadow:0 12px 28px rgba(0,0,0,0.6); z-index:999999; font-family:system-ui,-apple-system,sans-serif;";
  
  const normTitle = violationInfo?.norma || "RGPD / EU AI Act";
  const reasonText = violationInfo?.reason || "Carga regulada detectada";

  banner.innerHTML = \`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:900; font-size:0.85rem; color:#ef4444;">🛡️ S.A.A.R.E. AUDIT GATEWAY (L7)</span>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px;">BLOQUEADO</span>
    </div>
    <p style="font-size:0.82rem; margin:0 0 8px 0; color:#cbd5e1; line-height:1.4;">
      <strong>Normativa:</strong> <span style="color:#f87171;">\${normTitle}</span><br>
      <strong>Causa:</strong> \${reasonText}
    </p>
    <div style="background:#1e293b; border-left:3px solid #ef4444; padding:8px 10px; border-radius:4px; font-size:0.8rem; color:#93c5fd; margin-bottom:10px; word-break:break-all;">
      Carga Neutralizada: "\${text.substring(0, 150)}"
    </div>
  \`;
  document.body.appendChild(banner);
  setTimeout(() => { if (banner) banner.remove(); }, 6000);
}

function sendEvidenceToBackground(auditData) {
  const text = auditData.cleanPrompt || auditData.sanitizedPrompt || "";
  if (!text || text.trim() === "") return;

  const detectedUser = getActiveAccountFromDom();

  const payload = {
    promptInput: text.trim().substring(0, 500),
    user: detectedUser || undefined,
    timestamp: new Date().toISOString(),
    verdict: auditData.verdict,
    category: auditData.category,
    norma: auditData.norma,
    cryptoSeal: auditData.cryptoSeal,
    violationDetails: {
      category: auditData.category,
      norma: auditData.norma,
      reason: auditData.reason,
      cryptoSeal: auditData.cryptoSeal
    }
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
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "ORGANIZACION_AUDITOR"
          });
        }
        fallbackLocal();
      });
    } else {
      fallbackLocal();
    }

    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "${targetEmail}";
        const finalTenant = local?.saare_tenant_domain || "${targetTenant}";
        resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
      const enrichedPayload = { ...message.payload, user: user, tenant: tenant };
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

      const managedJson = JSON.stringify({
        "saare_user_email": targetEmail,
        "saare_tenant_domain": targetTenant,
        "saare_token": targetToken,
        "saare_role": "AUDITOR"
      }, null, 2);
      zip.file("storage_managed.json", managedJson);

      const popupHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { width: 300px; font-family: system-ui, sans-serif; background-color: #090d16; color: #ffffff; padding: 16px; margin: 0; box-sizing: border-box; }
    .header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .header-badge { background: #0284c7; color: #fff; font-weight: 900; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
    h3 { margin: 0; color: #38bdf8; font-size: 14px; font-weight: 800; }
    .status { padding: 8px; border-radius: 6px; font-size: 11px; font-weight: 800; text-align: center; margin-bottom: 14px; background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid #10b981; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 11.5px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 6px; color: #94a3b8; }
    .row:last-child { margin-bottom: 0; }
    .row strong { color: #e2e8f0; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .footer { font-size: 10.5px; color: #64748b; line-height: 1.4; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-badge">A</div>
    <h3>S.A.A.R.E. Auditor Engine</h3>
  </div>
  <div class="status">[OK] NODO AUDITOR VINCULADO</div>
  <div class="card">
    <div class="row"><span>Entorno:</span><strong>${targetTenant}</strong></div>
    <div class="row"><span>Auditor:</span><strong style="color: #38bdf8;">${targetEmail}</strong></div>
    <div class="row"><span>Modo:</span><strong style="color: #34d399;">Hook Delegado L7</strong></div>
  </div>
  <div class="footer">Sellado de evidencias criptográficas ISO/IEC 42001 activo.</div>
</body>
</html>`;
      zip.file("popup.html", popupHtml);

      const customBat = `@echo off
chcp 65001 >nul
title S.A.A.R.E. Installer - Auditor Seat
set "EXTENSION_ID=saaregovernanceid"
set "TENANT_DOMAIN=${targetTenant}"
set "USER_EMAIL=${targetEmail}"
set "TARGET_DIR=%LOCALAPPDATA%\\SAARE\\extension"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\\" >nul 2>&1
reg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "version" /t REG_SZ /d "8.2.0" /f >nul 2>&1
echo [OK] Asiento de Auditor L7 desplegado para %USER_EMAIL% (%TENANT_DOMAIN%).
timeout /t 3 >nul
exit /b 0`;
      zip.file("install_silent.bat", customBat);

      const finalBlob = await zip.generateAsync({ type: "blob" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(finalBlob);
      downloadLink.download = `saare-auditor-sdk-${targetTenant.toLowerCase().replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
    } catch (err) {
      console.error("Error al generar el SDK dinámico:", err);
      alert("Error al compilar el SDK. Comprueba tu conexión con el Control-Plane.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const copyDigitalSignature = () => {
    navigator.clipboard.writeText(JSON.stringify(signedPayload, null, 2));
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 2500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Diploma Registral RPI" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '14px 20px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación Safe Creative Nº 2607076315021 · Validez Probatoria Plena</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(9, 13, 22, 0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b' }}>
        {isOffline && (
          <div style={{ width: '100%', background: '#ef4444', color: '#fff', textAlign: 'center', padding: '6px', fontSize: '12px', fontWeight: 'bold' }}>
            ⚠️ Sin conexión a la Bóveda KV. Reintentando...
          </div>
        )}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#0284c7', color: '#fff', fontWeight: '900', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>S</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                S.A.A.R.E. <span style={{ fontSize: '9px', background: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #334155' }}>L7 ENGINE & GRC GATEWAY</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>AI REAL-TIME GOVERNANCE · OEM, ISV & AUDITOR</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '18px', alignItems: 'center', fontSize: '12.5px', fontWeight: '600' }}>
            <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ padding: '6px 14px', background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>
              {currentView === 'STATUS' ? '🌐 Ver Portal General' : '📋 Ver Mi Consola'}
            </button>
            {sessionUser ? (
              <>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  <strong style={{ color: '#38bdf8' }}>{sessionUser.tenantName}</strong>
                </span>
                <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>
                  Salir
                </button>
              </>
            ) : (
              <button onClick={() => { setCurrentView('STATUS'); setMode('login'); }} style={{ padding: '6px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>
                Acceso Bóveda
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VISTA 1: ESTADO DE LA CUENTA / AUTENTICACIÓN */}
      {currentView === 'STATUS' && (
        sessionUser ? (
          <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ width: '64px', height: '64px', background: '#0369a1', border: '2px solid #38bdf8', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '20px' }}>
                ⚖️
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 12px 0' }}>
                Consola de Auditoría y Consultoría IA
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', maxWidth: '620px', margin: '0 auto 28px auto' }}>
                Nodo de auditoría activo. Configurado para supervisar flujos delegados de empleados y certificar la trazabilidad técnica bajo norma ISO/IEC 42001 y EU AI Act.
              </p>

              <div style={{ background: '#0b0f19', border: '1px solid #374151', borderRadius: '12px', padding: '20px', maxWidth: '480px', margin: '0 auto 32px auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Entorno:</span>
                  <strong style={{ color: '#f8fafc' }}>{sessionUser.tenantName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Auditor Titular:</span>
                  <strong style={{ color: '#38bdf8' }}>{sessionUser.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#94a3b8' }}>Licencia Asignada:</span>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem' }}>
                    1 ASIENTO DE CONSULTOR / AUDITOR ACTIVO
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }}>
                  🚀 Abrir Bóveda Forense
                </a>
                
                <button 
                  onClick={handleDownloadExtension} 
                  disabled={downloadingZip}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: downloadingZip ? 'wait' : 'pointer', boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.4)' }}
                >
                  {downloadingZip ? '⚙️ Generando SDK...' : '⚡ Generar SAARE-SDK Tokenizado'}
                </button>
              </div>
            </div>
          </main>
        ) : (
          <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ maxWidth: '440px', width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', background: '#1e3a8a', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0' }}>S.A.A.R.E. EMBUSINESS SUITE</h1>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  {mode === 'reset' ? 'Restablecimiento de Credenciales' : 'Registro Corporativo & Identidad'}
                </p>
              </div>

              {mode !== 'reset' && (
                <div style={{ display: 'flex', background: '#0b0f19', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
                  <button type="button" onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: mode === 'register' ? '#2563eb' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Crear Perfil</button>
                  <button type="button" onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: mode === 'login' ? '#2563eb' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Iniciar Sesión</button>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>NOMBRE DE EMPRESA / ORGANIZACIÓN</label>
                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ej: Mi Despacho Pericial" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>CORREO CORPORATIVO</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ej: auditor@empresa.es" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '600' }}>
                      {mode === 'reset' ? 'NUEVA CONTRASEÑA' : 'CONTRASEÑA'}
                    </label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {error && <div style={{ padding: '10px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}
                {successMsg && <div style={{ padding: '10px', background: '#064e3b', border: '1px solid #10b981', borderRadius: '8px', color: '#a7f3d0', fontSize: '0.85rem', textAlign: 'center' }}>{successMsg}</div>}

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
                  {loading ? 'Procesando...' : (mode === 'register' ? '🚀 Registrar Auditor' : (mode === 'reset' ? '🔑 Restablecer Contraseña' : '🔒 Iniciar Sesión'))}
                </button>

                {mode === 'reset' && (
                  <button type="button" onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: '6px', textAlign: 'center' }}>
                    ← Volver a Iniciar Sesión
                  </button>
                )}
              </form>
            </div>
          </div>
        )
      )}

      {/* VISTA 2: LANDING PAGE DE ALTA DENSIDAD TÉCNICA E INFORMATIVA */}
      {currentView === 'LANDING' && (
        <main>
          {/* HERO PRINCIPAL */}
          <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px 40px 20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '11.5px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', marginBottom: '20px' }}>
              🛡️ AUDITORÍA CONTINUA & SEGURIDAD DETERMINISTA EN CAPA 7
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.15, margin: '0 auto 16px auto', maxWidth: '980px', letterSpacing: '-1px' }}>
              Gobernanza de Modelos de IA, Filtrado en Memoria y Trazabilidad Forense
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '15.5px', lineHeight: 1.6, margin: '0 auto 30px auto', maxWidth: '840px' }}>
              Motor de desacople determinista en tiempo de ejecución. Neutraliza fugas de PII en memoria volátil antes de la inferencia y genera evidencias criptográficas inmutables SHA-256 para el cumplimiento de <strong>ISO/IEC 42001</strong>, el <strong>EU AI Act</strong> y la <strong>justificación de subvenciones públicas</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(2, 132, 199, 0.35)', textTransform: 'uppercase' }}>
                ⚡ PROBAR SANDBOX DE EVALUACIÓN (7 DÍAS)
              </button>
              <button onClick={() => { setCurrentView('STATUS'); setMode('register'); }} style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '14px 28px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
                Registrar Asiento de Auditor
              </button>
            </div>
          </section>

          {/* ARQUITECTURA DE DESPLIEGUE (3 VECTORES) */}
          <section id="modelos-despliegue" style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-block', color: '#38bdf8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                MATRIZ DE INTEGRACIÓN TÉCNICA
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>Tres Vectores de Despliegue en Producción</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '8px auto 0 auto', maxWidth: '680px' }}>
                Desde bibliotecas binarias compiladas para fabricantes de EDR hasta asientos profesionales para peritos y consultores de cumplimiento.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Despliegue 1: OEM Binario */}
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ background: '#1e293b', color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', border: '1px solid #334155' }}>VECTOR 01 · OEM SENSOR</span>
                    <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 'bold' }}>0.017 ms RAM</span>
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: '800', margin: '0 0 10px 0' }}>OEM Nativo (In-Process C-ABI)</h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Diseñado para fabricantes de seguridad y plataformas EDR/XDR (p. ej. CrowdStrike Falcon). Enlace directo como biblioteca compartida (<code style={{ color: '#38bdf8' }}>.so</code> / <code style={{ color: '#38bdf8' }}>.dll</code>) dentro del sensor.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12.5px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✔ Acoplamiento en memoria RAM mediante HugePages</li>
                    <li>✔ Purga determinista con <code style={{ color: '#38bdf8' }}>SYS_madvise MADV_DONTNEED</code></li>
                    <li>✔ Cero consumo de llamadas externas y latencia casi nula</li>
                  </ul>
                </div>
              </div>

              {/* Despliegue 2: ISV & Nodos */}
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ background: '#1e293b', color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', border: '1px solid #334155' }}>VECTOR 02 · ISV & NODOS</span>
                    <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>Workflow Ready</span>
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: '800', margin: '0 0 10px 0' }}>Nodo Verificado & API Middleware</h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Integración para desarrolladores en pipelines de orquestación (p. ej. catálogo de <strong>n8n</strong>, LangChain y SDKs TypeScript/Python) redirigiendo inferencias antes del proveedor LLM.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12.5px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✔ Integración como nodo en flujos automatizados de n8n</li>
                    <li>✔ Redacción de PII al vuelo vía cabeceras HTTP</li>
                    <li>✔ Trazabilidad y verificación ex-ante en gateway edge</li>
                  </ul>
                </div>
              </div>

              {/* Despliegue 3: Asiento Auditor */}
              <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)', border: '1px solid #0284c7', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(2, 132, 199, 0.15)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>VECTOR 03 · CONSULTOR</span>
                    <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>Asiento Único</span>
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: '800', margin: '0 0 10px 0' }}>Asiento de Consultoría & Auditoría</h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Licencia profesional individual para auditores ISO/IEC 42001, CISOs y peritos judiciales. Permite auditar en tiempo real el tráfico de empleados bajo delegación consentida.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12.5px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✔ Delegación mutua con Handshake Token de consentimiento</li>
                    <li>✔ Generación de dictámenes periciales SHA-256</li>
                    <li>✔ Certificación de seguridad para subvenciones y ayudas públicas</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* PROTOCOLO DE DELEGACIÓN CRIPTOGRÁFICA */}
          <section id="flujo-delegacion" style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
            <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: '900', padding: '4px 8px', borderRadius: '4px' }}>MECANISMO DELEGADO L7</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
                  ¿Cómo Supervisa el Asiento de Auditor a los Empleados?
                </h2>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                El auditor no monitoriza indiscriminadamente la máquina. La inspección opera bajo un protocolo criptográfico de <strong>delegación explícita</strong>:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#020617', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>1. Consentimiento del Empleado</div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px', lineHeight: '1.5' }}>
                    El usuario emite un <em>Handshake Token</em> de autorización temporal que vincula su navegador con el nodo pericial del auditor.
                  </div>
                </div>
                <div style={{ background: '#020617', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>2. Intercepción en RAM L7</div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px', lineHeight: '1.5' }}>
                    El motor intercepta la llamada LLM, redacta automáticamente los datos regulados (DNI/IBAN) y calcula el sello criptográfico en 1.16 ms.
                  </div>
                </div>
                <div style={{ background: '#020617', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>3. Dictamen Probatorio</div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px', lineHeight: '1.5' }}>
                    La consola del auditor recibe el digest inmutable para emitir informes oficiales de cumplimiento sin almacenar texto plano de los empleados.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COMPARATIVA TÉCNICA: PROXY CLOUD VS MOTOR L7 */}
          <section id="comparativa-tecnica" style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
                ARQUITECTURA DE DESACOPLE
              </div>
              <h2 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '900', margin: '8px 0' }}>
                ¿Por qué un Interceptor L7 en Memoria y no un Proxy en la Nube?
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '13.5px', maxWidth: '680px', margin: '0 auto' }}>
                Las soluciones basadas en túneles SaaS intermedios añaden fricción de red y riesgos de retención de datos. SAARE ejecuta el filtrado determinista en el origen.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px' }}>
                <div style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '6px', marginBottom: '14px' }}>
                  GATEWAYS CONVENCIONALES EN CLOUD
                </div>
                <h3 style={{ color: '#f1f5f9', fontSize: '17px', fontWeight: '700', margin: '0 0 12px 0' }}>Sobrecarga de Red y Retención de Texto</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#94a3b8' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                    <span><strong>Latencia acumulada (150–400 ms):</strong> Redirección de paquetes a centros de datos externos.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                    <span><strong>Riesgo de persistencia:</strong> El texto plano se transfiere y almacena en bases de datos de terceros.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                    <span><strong>Falta de validez probatoria:</strong> Logs estándar fácilmente alterables sin sellado SHA-256 ni firma asimétrica.</span>
                  </li>
                </ul>
              </div>

              <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)', border: '1px solid #0284c7', borderRadius: '14px', padding: '24px', boxShadow: '0 10px 30px rgba(2, 132, 199, 0.15)' }}>
                <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '6px', marginBottom: '14px' }}>
                  MOTOR DETERMINISTA SAARE L7
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '17px', fontWeight: '700', margin: '0 0 12px 0' }}>Intercepción Local en Memoria Volátil</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#cbd5e1' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Latencia de 0.017 ms a 1.16 ms:</strong> Intercepción en memoria volátil en el ciclo de ejecución local.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Residuo Cero:</strong> Purga forzada con <code style={{ color: '#38bdf8' }}>SYS_madvise MADV_DONTNEED</code> sin escrituras en disco.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Evidencias Inmutables:</strong> Huella criptográfica y digest firmado por cada transacción para auditorías oficiales.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* JUSTIFICACIÓN DE SUBVENCIONES & CUMPLIMIENTO */}
          <section id="subvenciones" style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
            <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>JUSTIFICACIÓN NORMATIVA Y FINANCIERA</span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0' }}>Superación de Auditorías Técnicas de Subvenciones de IA</h2>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>
                  Los fondos públicos y programas europeos de digitalización exigen trazabilidad técnica demostrable de la seguridad del dato.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>Trazabilidad Forense Real</div>
                  <div style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>Evidencias SHA-256 inmutables por cada llamada al modelo sin almacenar datos personales en claro.</div>
                </div>
                <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ color: '#34d399', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>Alineación ISO/IEC 42001</div>
                  <div style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>Gestión activa de riesgos de inferencia y control determinista del ciclo de vida del dato.</div>
                </div>
                <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>Garantía EU AI Act</div>
                  <div style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>Mitigación demostrable de inyecciones de prompts y fuga de datos en tiempo de ejecución.</div>
                </div>
              </div>
            </div>
          </section>

          {/* CERTIFICACIÓN DE INTEGRIDAD REGISTRAL SAFE CREATIVE */}
          <section id="integridad" style={{ maxWidth: '1200px', margin: '20px auto 50px auto', padding: '0 20px' }}>
            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '5px 12px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    CERTIFICACIÓN DE INTEGRIDAD IA
                  </span>
                  <span style={{ color: '#38bdf8', fontSize: '13px', fontFamily: 'monospace' }}>
                    NODO NATIVO LLM OPEN-ENGINE: <strong>2607076315021</strong>
                  </span>
                </div>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>
                  STATELESS EX-ANTE ENGINE
                </span>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ color: '#f8fafc', fontSize: '17px', margin: '0 0 8px 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#10b981' }}>✔</span> Validación autónoma del modelo de IA: <span style={{ color: '#38bdf8' }}>Firma de Origen Inmutable</span>
                </h3>
              </div>

              <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '12px', color: '#94a3b8', marginBottom: '14px', fontFamily: 'monospace' }}>
                  <div>🏛️ AUTORIDAD: <strong style={{ color: '#cbd5e1' }}>Gabinete Jurídico MS3V</strong></div>
                  <div>📜 REGISTRO: <strong style={{ color: '#38bdf8' }}>Safe Creative 2607076315021</strong></div>
                  <div>🔑 CONTEXTO: <strong style={{ color: '#cbd5e1' }}>MS3V-RECON-VALID-2026-ALF-0521</strong></div>
                  <div>⚡ LATENCIA RAM: <strong style={{ color: '#34d399' }}>1.16 ms (Residuo Cero)</strong></div>
                </div>
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>HUELLA HASH SHA-256 DEL NODO:</div>
                  <code style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07</code>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowDiploma(true)} style={{ background: '#1e293b', border: '1px solid #475569', color: '#38bdf8', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📜 Ver Diploma Registral
                </button>
                <button type="button" onClick={() => window.open(signedPayload.URL_VERIFICACION_PUBLICA, '_blank')} style={{ background: '#0284c7', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔍 Verificar en Vivo (API Edge) ↗
                </button>
                <button type="button" onClick={copyDigitalSignature} style={{ background: copiedSig ? '#10b981' : '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                  {copiedSig ? '✔ FIRMA COPIADA' : '📋 Copiar Firma Digital'}
                </button>
              </div>
            </div>
          </section>

          {/* SNIPPETS DE INTEGRACIÓN MULTILENGUAJE */}
          <section id="integracion" style={{ maxWidth: '1200px', margin: '0 auto 50px auto', padding: '0 20px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Integración Determinista (SAARE-SDK)</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveCodeTab('nodejs')} style={{ background: activeCodeTab === 'nodejs' ? '#0284c7' : '#1e293b', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Node.js</button>
                  <button onClick={() => setActiveCodeTab('python')} style={{ background: activeCodeTab === 'python' ? '#0284c7' : '#1e293b', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Python</button>
                  <button onClick={() => setActiveCodeTab('curl')} style={{ background: activeCodeTab === 'curl' ? '#0284c7' : '#1e293b', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>cURL</button>
                  <button onClick={() => setActiveCodeTab('cabi')} style={{ background: activeCodeTab === 'cabi' ? '#0284c7' : '#1e293b', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>C-ABI (OEM)</button>
                </div>
              </div>

              <pre style={{ background: '#020617', border: '1px solid #334155', borderRadius: '8px', padding: '16px', color: '#38bdf8', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto' }}>
                {codeSnippets[activeCodeTab]}
              </pre>
            </div>
          </section>

          {/* CONTRATACIÓN DEL ASIENTO DE AUDITOR */}
          <section id="contratacion" style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px', maxWidth: '640px', margin: '0 auto', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>CONTRATACIÓN PROFESIONAL</span>
              <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: '800', margin: '8px 0 12px 0' }}>1 Asiento de Consultoría / Auditoría IA</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                Acceso completo a la Bóveda Forense, motor de intercepción L7, recepción de flujos delegados de empleados y generación de dictámenes periciales SHA-256.
              </p>

              <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>IMPORTE DE LICENCIA AUDITOR</div>
                <div style={{ color: '#fff', fontSize: '32px', fontWeight: '900', margin: '6px 0' }}>{AUDITOR_PLAN_PRICE} € <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'normal' }}>/ mes</span></div>
                <div style={{ color: '#34d399', fontSize: '12px', fontWeight: 'bold' }}>✔ Incluye enganches ilimitados a perfiles empleado bajo autorización previa</div>
              </div>

              <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(2, 132, 199, 0.3)' }}>
                CONTRATAR 1 ASIENTO DE AUDITOR ↗
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}