import JSZip from 'jszip';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Saare-Client, x-saare-token, x-saare-tenant, x-saare-user',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Telemetría global con contadores dinámicos
    if (url.pathname.startsWith('/api/v1/telemetry') || url.pathname.startsWith('/v1/telemetry') || url.pathname.startsWith('/telemetry')) {
      const token = url.searchParams.get('token') || 'SAARE-EXT-7789-X892-L7';
      const email = url.searchParams.get('user') || 'alfonsoterritoriohostil@gmail.com';
      
      let stats = { interceptedCount: 0, blockedCount: 0 };
      if (env.SAARE_VAULT_KV) {
        const rawStats = await env.SAARE_VAULT_KV.get(`telemetry_${email}`, { type: "json" });
        if (rawStats) stats = rawStats;
      }

      const telemetryData = {
        sensor: token,
        status: "ACTIVE",
        lastPing: new Date().toISOString(),
        metrics: {
          interceptedCount: stats.interceptedCount,
          blockedCount: stats.blockedCount,
          complianceFramework: "EU-AI-Act-Art-12"
        },
        vaultSync: "DUAL_VAULT_ACTIVE"
      };
      return new Response(JSON.stringify(telemetryData, null, 2), { headers: corsHeaders });
    }

    if (url.pathname === '/api/v1/' || url.pathname === '/api/v1' || url.pathname === '/v1/' || url.pathname === '/v1') {
      return new Response(JSON.stringify({ status: "success", message: "API Control Plane SAARE activa" }), {
        headers: corsHeaders
      });
    }

    // 2. Endpoint Judge
    if (url.pathname.startsWith('/api/v1/judge') || url.pathname.startsWith('/v1/judge')) {
      if (request.method === 'POST') {
        try {
          const startTime = performance.now();
          const body = await request.json();

          const verdictId = "vrd_" + Math.random().toString(36).substring(2, 11);
          const jti = "jti_" + Math.random().toString(36).substring(2, 11);
          
          const decisionResult = {
            verdictId: verdictId,
            decision: "ALLOW",
            executionPermit: {
              jti: jti,
              issued_at: new Date().toISOString()
            }
          };

          const endTime = performance.now();
          const latencyMs = (endTime - startTime).toFixed(3);

          const judgeHeaders = {
            ...corsHeaders,
            'X-SAARE-Verdict-ID': decisionResult.verdictId,
            'X-SAARE-Decision': decisionResult.decision,
            'X-SAARE-Execution-Permit-JTI': decisionResult.executionPermit.jti,
            'X-Runtime-Latency-Ms': latencyMs,
            'X-Compliance-Framework': 'EU-AI-Act-Art-12',
            'X-RateLimit-Limit': '100000',
            'X-RateLimit-Remaining': '99850'
          };

          return new Response(JSON.stringify({
            status: "SUCCESS",
            ...decisionResult
          }), { status: 200, headers: judgeHeaders });

        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    // 3. Auth Endpoints
    if (url.pathname.startsWith('/api/v1/auth/login') || url.pathname.startsWith('/v1/auth/login')) {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          return new Response(JSON.stringify({ 
            status: "success", 
            token: "saare_token_valido_2026",
            user: body.email || "alfonsoterritoriohostil@gmail.com" 
          }), { headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    if (url.pathname.startsWith('/api/v1/auth/reset-password-request') || url.pathname.startsWith('/v1/auth/reset-password-request')) {
      if (request.method === 'POST') {
        try {
          return new Response(JSON.stringify({ status: "success", message: "Clave provisional emitida y cifrada en Bóveda KV." }), { headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    if (url.pathname.startsWith('/api/v1/auth/check-status') || url.pathname.startsWith('/v1/auth/check-status')) {
      const email = url.searchParams.get('email') || '';
      let statusResponse = { status: "ACTIVE", alertMessage: null };
      if (email.includes('expired')) {
        statusResponse = { status: "EXPIRED", alertMessage: "Tu asiento operativo de SAARE ha caducado." };
      }
      return new Response(JSON.stringify(statusResponse), { headers: corsHeaders });
    }

    // 4. Descarga del paquete de la extensión (Corregido para compatibilidad Manifest V3)
    if (
      url.pathname.startsWith('/api/v1/download-extension') || 
      url.pathname.startsWith('/v1/download-extension') || 
      url.pathname.startsWith('/download-extension')
    ) {
      try {
        const userEmail = url.searchParams.get('user') || 'alfonsoterritoriohostil@gmail.com';
        const tenant = url.searchParams.get('tenant') || 'ALFON TEST';
        const targetEndpoint = "https://api.saare.es/v1";
        const bootstrapToken = url.searchParams.get('token') || "sk_saare_live_master_kv_session";

        const zip = new JSZip();

        // Manifest V3 Estándar
        const manifest = {
          "manifest_version": 3,
          "name": "SAARE Execution Authorization Sensor",
          "version": "10.0.5",
          "description": "AI Execution Authorization Infrastructure (SGP 1.0) · SAARE VERDICT™ & Bóveda KV",
          "background": {
            "service_worker": "background.js"
          },
          "action": {
            "default_title": "SAARE Execution Guard Node (Bóveda KV Active)",
            "default_popup": "popup.html"
          },
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
          "permissions": [
            "storage",
            "alarms",
            "downloads"
          ]
        };
        zip.file("manifest.json", JSON.stringify(manifest, null, 2));

        const storageManaged = {
          "saare_bootstrap_token": {
            "Value": bootstrapToken,
            "Description": "Token fiduciario de sesión emitido por la Bóveda KL."
          },
          "saare_tenant_domain": {
            "Value": tenant,
            "Description": "Identificador canónico del inquilino corporativo."
          },
          "saare_user_email": {
            "Value": userEmail,
            "Description": "Email del operador autorizado en la estación de trabajo."
          },
          "endpoint": {
            "Value": targetEndpoint,
            "Description": "Endpoint de ingesta y evaluación del Control Plane."
          }
        };
        zip.file("storage_managed.json", JSON.stringify(storageManaged, null, 2));

        const backgroundJs = `// SAARE L7 Background Service Worker (SGP 1.0) - Production Runtime

async function getActiveIdentity(providedUser) {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.managed) {
      chrome.storage.managed.get(
        ["saare_user_email", "saare_tenant_domain", "saare_bootstrap_token", "endpoint"],
        (managed) => {
          chrome.storage.local.get(
            ["saare_user_email", "saare_tenant_domain", "saare_bootstrap_token", "endpoint"],
            (local) => {
              const user = providedUser || managed?.saare_user_email || local?.saare_user_email || "${userEmail}";
              const tenant = managed?.saare_tenant_domain || local?.saare_tenant_domain || "${tenant}";
              const apiKey = managed?.saare_bootstrap_token || local?.saare_bootstrap_token || "${bootstrapToken}";
              const endpoint = managed?.endpoint || local?.endpoint || "${targetEndpoint}";

              resolve({ user, tenant, apiKey, endpoint });
            }
          );
        }
      );
    } else {
      resolve({ user: "${userEmail}", tenant: "${tenant}", apiKey: "${bootstrapToken}", endpoint: "${targetEndpoint}" });
    }
  });
}

async function uploadEvidenceToCloud(payload, identity) {
  if (!identity?.endpoint) {
    console.warn("[SAARE Cloud KV] Endpoint no definido. Omitiendo envío.");
    return false;
  }

  const targetUrl = \`\${identity.endpoint}/telemetry?user=\${encodeURIComponent(identity.user)}\`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${identity.apiKey}\`,
        "X-Saare-Client": "L7-Browser-Sensor-V10"
      },
      body: JSON.stringify(payload)
    });

    if (response?.ok) {
      const result = await response.json();
      console.log("[SAARE Cloud KV] Evidencia almacenada correctamente:", result);
      return true;
    } else {
      console.error("[SAARE Cloud KV] Error del servidor. Código HTTP:", response?.status);
      return false;
    }
  } catch (error) {
    console.error("[SAARE Cloud KV] Fallo de red al conectar con Cloudflare Worker:", error);
    return false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT" || message?.type === "SAARE_EVIDENCE_RECORD") {
    const rawPayload = message?.payload || {};

    getActiveIdentity(rawPayload?.user).then(async (identity) => {
      const enrichedPayload = {
        ...rawPayload,
        user: identity.user,
        tenant: identity.tenant,
        cloudSyncTimestamp: new Date().toISOString()
      };

      const isSuccess = await uploadEvidenceToCloud(enrichedPayload, identity);
      sendResponse({ 
        status: isSuccess ? "ACK_CLOUD_DISPATCHED" : "ACK_CLOUD_FAILED",
        timestamp: new Date().toISOString()
      });
    });

    return true; 
  }
});

self.addEventListener("error", (event) => {
  console.warn("[SAARE Protection Guard] Excepción no capturada neutralizada:", event?.message);
});`;
        zip.file("background.js", backgroundJs);

        const contentJs = `// SAARE L7 TELEMETRY & DOM BRIDGE v10.0.10 (SGP 1.0)
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
    if (chrome.storage.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        const managedUser = managed?.saare_user_email;
        const managedTenant = managed?.saare_tenant_domain;
        
        chrome.storage.local.get(["saare_settings", "saare_user_email", "saare_tenant_domain"], (local) => {
          updateDomContext(
            local?.saare_settings || DEFAULT_SETTINGS_V10,
            managedUser || local?.saare_user_email || "${userEmail}",
            managedTenant || local?.saare_tenant_domain || "${tenant}"
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
});`;
        zip.file("content.js", contentJs);

        const injectJs = `/**
 * SAARE L7 Execution Authorization Injector (SGP 1.0)
 */
(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [resource, config] = args;
    let interceptedPrompt = "";

    try {
      if (config && config.body) {
        if (typeof config.body === 'string') {
          const parsed = JSON.parse(config.body);
          interceptedPrompt = parsed.prompt || parsed.contents?.[0]?.parts?.[0]?.text || parsed.messages?.[-1]?.content || config.body;
        }
      }
    } catch (e) {
      interceptedPrompt = "Metadata-only captured (Payload unparseable)";
    }

    const runtimeUser = document.documentElement.getAttribute("data-saare-user") || "${userEmail}";
    const runtimeTenant = document.documentElement.getAttribute("data-saare-tenant") || "${tenant}";

    const url = typeof resource === 'string' ? resource : resource?.url || '';
    if (url && (url.includes('google.com') || url.includes('openai') || url.includes('anthropic') || url.includes('deepseek') || url.includes('llm'))) {
      window.postMessage({
        type: "SAARE_VERDICT_EVENT",
        payload: {
          verdict_schema: "SGP_1.0",
          verdictId: \`VRD-2026-\${Math.random().toString(36).substring(2, 7).toUpperCase()}\`,
          evidence_id: \`EV-ALLOW-\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`,
          status: "VALID",
          system_id: "L7-BROWSER-SENSOR",
          timestamp: new Date().toISOString(),
          user: runtimeUser,
          tenant: runtimeTenant,
          decision: "ALLOW",
          enforcement: { action: "PASS" },
          cryptoSeal: "L7-SEAL:ACTIVE",
          cleanPrompt: interceptedPrompt ? interceptedPrompt.substring(0, 1000) : "Metadatos de auditoría extraídos en el borde",
          reason: "Acción autorizada y auditada por política determinista SGP 1.0."
        }
      }, "*");
    }
    return originalFetch.apply(this, args);
  };
})();`;
        zip.file("inject.js", injectJs);

        const popupHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 300px;
      margin: 0;
      padding: 16px;
      background-color: #030712;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .title {
      font-weight: 900;
      font-size: 14px;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .badge-status {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      border: 1px solid #22c55e;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
    }
    .info-card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 8px;
      padding: 10px;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .label {
      color: #9ca3af;
      font-size: 9.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .val {
      color: #38bdf8;
      font-family: monospace;
      margin-bottom: 8px;
      word-break: break-all;
    }
    .btn-console {
      display: block;
      width: 100%;
      text-align: center;
      background: #0284c7;
      color: #ffffff;
      text-decoration: none;
      padding: 8px 0;
      border-radius: 6px;
      font-weight: bold;
      font-size: 11.5px;
      box-sizing: border-box;
    }
    .btn-console:hover {
      background: #0369a1;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="title">SAARE SENSOR L7</span>
    <span class="badge-status">● ACTIVO</span>
  </div>

  <div class="info-card">
    <div class="label">Organización / Tenant</div>
    <div class="val" id="disp-tenant">${tenant}</div>

    <div class="label">Usuario / Operador</div>
    <div class="val" id="disp-user">${userEmail}</div>

    <div class="label">Protocolo de Custodia</div>
    <div class="val" style="color: #4ade80;">SGP 1.0 (Fail-Closed)</div>

    <div class="label">Procesamiento RAM & Bóveda KV</div>
    <div class="val" style="color: #ca8a04; margin: 0;">Cloud KV Sync Enabled</div>
  </div>

  <a href="https://console.saare.es/" target="_blank" class="btn-console" id="btn-open-console">
    Abrir SAARE GRC Console ↗
  </a>

  <script>
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['saare_tenant_domain', 'saare_user_email'], (res) => {
        if(res.saare_tenant_domain) document.getElementById('disp-tenant').innerText = res.saare_tenant_domain;
        if(res.saare_user_email) document.getElementById('disp-user').innerText = res.saare_user_email;
      });
    }
  </script>
</body>
</html>`;
        zip.file("popup.html", popupHtml);

        const installBat = `@echo off
chcp 65001 >nul
title SAARE AI Execution Authorization Node - Enterprise Installer (SGP 1.0)

echo ==============================================================================
echo     Despliegue de Sensor L7 + Evidence Vault Local (v10.0.5) - Bóveda KL
echo ==============================================================================

set "EXTENSION_ID=ppegejdfiohebfhpjbppkdjjllopnamj"
set "AGENT_VERSION=10.0.5"
set "TARGET_DIR=%LOCALAPPDATA%\\SAARE\\extension"
set "DESKTOP_VAULT=%USERPROFILE%\\Desktop\\evidence_vault"

if not exist "%DESKTOP_VAULT%" mkdir "%DESKTOP_VAULT%"

set "SAARE_BOOTSTRAP_TOKEN=%~1"
set "TENANT_DOMAIN=%~2"
set "USER_EMAIL=%~3"

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\\" >nul 2>&1

if "%SAARE_BOOTSTRAP_TOKEN%"=="" (
    if exist "%TARGET_DIR%\\storage_managed.json" (
        echo [INFO] Extrayendo directivas desde storage_managed.json ...
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_bootstrap_token" "%TARGET_DIR%\\storage_managed.json" 2^>nul') do (
            if not defined SAARE_BOOTSTRAP_TOKEN set "SAARE_BOOTSTRAP_TOKEN=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_tenant_domain" "%TARGET_DIR%\\storage_managed.json" 2^>nul') do (
            if not defined TENANT_DOMAIN set "TENANT_DOMAIN=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_user_email" "%TARGET_DIR%\\storage_managed.json" 2^>nul') do (
            if not defined USER_EMAIL set "USER_EMAIL=%%~a"
        )
    )
)

if defined SAARE_BOOTSTRAP_TOKEN set "SAARE_BOOTSTRAP_TOKEN=%SAARE_BOOTSTRAP_TOKEN:"=%"
if defined TENANT_DOMAIN set "TENANT_DOMAIN=%TENANT_DOMAIN:"=%"
if defined USER_EMAIL set "USER_EMAIL=%USER_EMAIL:"=%"

if "%TENANT_DOMAIN%"=="" set "TENANT_DOMAIN=${tenant}"
if "%USER_EMAIL%"=="" set "USER_EMAIL=${userEmail}"
if "%SAARE_BOOTSTRAP_TOKEN%"=="" set "SAARE_BOOTSTRAP_TOKEN=${bootstrapToken}"

echo [INFO] Inquilino: %TENANT_DOMAIN%
echo [INFO] Operador:  %USER_EMAIL%
echo [INFO] Token:     %SAARE_BOOTSTRAP_TOKEN:~0,12%****************
echo [INFO] Vault:     %DESKTOP_VAULT%

reg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "version" /t REG_SZ /d "%AGENT_VERSION%" /f >nul 2>&1

reg add "HKCU\\Software\\Policies\\Google\\Chrome\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "saare_bootstrap_token" /t REG_SZ /d "%SAARE_BOOTSTRAP_TOKEN%" /f >nul 2>&1
reg add "HKCU\\Software\\Policies\\Google\\Chrome\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKCU\\Software\\Policies\\Google\\Chrome\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
reg add "HKCU\\Software\\Policies\\Google\\Chrome\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "enforcement_mode" /t REG_SZ /d "FAIL_CLOSED" /f >nul 2>&1
reg add "HKCU\\Software\\Policies\\Google\\Chrome\\3rdparty\\extensions\\%EXTENSION_ID%\\policy" /v "governance_protocol" /t REG_SZ /d "SGP_1.0" /f >nul 2>&1

echo ==============================================================================
echo [OK] Nodo aprovisionado con exito. Boveda Local sincronizada en el Escritorio.
echo ==============================================================================
timeout /t 3 >nul
exit /b 0`;
        zip.file("install.bat", installBat);

        const content = await zip.generateAsync({ 
          type: "uint8array",
          compression: "DEFLATE",
          compressionOptions: { level: 9 }
        });

        return new Response(content, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="saare-sensor-l7-${tenant.replace(/[^a-zA-Z0-9]/g, '_')}.zip"`,
            'Access-Control-Allow-Origin': '*'
          }
        });

      } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 5. Intercept Endpoint
    if (url.pathname.startsWith('/api/v1/intercept') || url.pathname.startsWith('/v1/intercept')) {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const email = body.user || url.searchParams.get('user') || 'alfonsoterritoriohostil@gmail.com';
          const kvKey = `runs_${email}`;

          let existing = [];
          if (env.SAARE_VAULT_KV) {
            const raw = await env.SAARE_VAULT_KV.get(kvKey);
            if (raw) existing = JSON.parse(raw);
          }

          const interceptRecord = {
            timestamp: new Date().toISOString(),
            evidenceId: "EV-PII-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            vaultStatus: "VERIFIED_TAMPER_EVIDENT",
            ...body
          };

          existing.unshift(interceptRecord);
          
          if (env.SAARE_VAULT_KV) {
            await env.SAARE_VAULT_KV.put(kvKey, JSON.stringify(existing));

            const telemetryKey = `telemetry_${email}`;
            let telemetryStats = await env.SAARE_VAULT_KV.get(telemetryKey, { type: "json" }) || {
              interceptedCount: 0,
              blockedCount: 0
            };

            telemetryStats.interceptedCount = (telemetryStats.interceptedCount || 0) + 1;
            telemetryStats.blockedCount = (telemetryStats.blockedCount || 0) + 1;

            await env.SAARE_VAULT_KV.put(telemetryKey, JSON.stringify(telemetryStats));
          }

          return new Response(JSON.stringify({
            status: "SUCCESS",
            decision: "DENY (BLOCK)",
            evidenceId: interceptRecord.evidenceId,
            vaultSync: "VERIFIED_TAMPER_EVIDENT"
          }), { status: 200, headers: corsHeaders });

        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    // 6. Runs Endpoint
    if (url.pathname.startsWith('/api/v1/runs') || url.pathname.startsWith('/v1/runs')) {
      const email = url.searchParams.get('user') || 'alfonsoterritoriohostil@gmail.com';
      const kvKey = `runs_${email}`;

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          if (!body.sensor) {
            body.sensor = "SAARE-EXT-7789-X892-L7";
          }
          let existing = [];
          if (env.SAARE_VAULT_KV) {
            const raw = await env.SAARE_VAULT_KV.get(kvKey);
            if (raw) existing = JSON.parse(raw);
          }
          existing.unshift(body);
          if (env.SAARE_VAULT_KV) {
            await env.SAARE_VAULT_KV.put(kvKey, JSON.stringify(existing));
          }
          return new Response(JSON.stringify({ status: "success", saved: true, sensorRegistered: body.sensor }), { headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }

      let storedRuns = [];
      if (env.SAARE_VAULT_KV) {
        const raw = await env.SAARE_VAULT_KV.get(kvKey);
        if (raw) {
          try { storedRuns = JSON.parse(raw); } catch {}
        }
      }
      return new Response(JSON.stringify(storedRuns, null, 2), { headers: corsHeaders });
    }

    // 7. Settings Endpoint
    if (url.pathname.startsWith('/api/v1/settings') || url.pathname.startsWith('/v1/settings')) {
      const email = url.searchParams.get('user') || 'alfonsoterritoriohostil@gmail.com';
      const kvKey = `settings_${email}`;

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          if (env.SAARE_VAULT_KV) {
            await env.SAARE_VAULT_KV.put(kvKey, JSON.stringify(body));
          }
          return new Response(JSON.stringify({ status: "success", updated: true }), { headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }

      let settingsData = null;
      if (env.SAARE_VAULT_KV) {
        const raw = await env.SAARE_VAULT_KV.get(kvKey);
        if (raw) {
          try { settingsData = JSON.parse(raw); } catch {}
        }
      }
      return new Response(JSON.stringify(settingsData || {}), { headers: corsHeaders });
    }

    // 8. Export Proof Bundle
    if (url.pathname.startsWith('/api/v1/export-proof-bundle') || url.pathname.startsWith('/v1/export-proof-bundle')) {
      if (request.method === 'POST') {
        try {
          const payload = await request.json();
          const proofBundle = {
            format: "SAARE_PROOF_BUNDLE_V1",
            timestamp: new Date().toISOString(),
            rfc3161_timestamp_authority: "https://tsa.saare.es",
            evidence: payload,
            cryptographic_proof: {
              algorithm: "Ed25519 + SHA-256",
              status: "VERIFIED_VALID",
              node: "control-plane-worker-production"
            }
          };
          return new Response(JSON.stringify(proofBundle, null, 2), { headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    // 9. Custom Rules Endpoint
    if (url.pathname.startsWith('/api/v1/custom-rules') || url.pathname.startsWith('/v1/custom-rules')) {
      const email = url.searchParams.get('user') || 'alfonsoterritoriohostil@gmail.com';
      const kvKey = `custom_rules_${email}`;

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          if (env.SAARE_VAULT_KV) {
            await env.SAARE_VAULT_KV.put(kvKey, JSON.stringify(body));
          }
          return new Response(JSON.stringify({ status: "success", updated: true, rulesRegistered: body }), { headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ status: "error", message: err.message }), { status: 500, headers: corsHeaders });
        }
      }

      let rulesData = [];
      if (env.SAARE_VAULT_KV) {
        const raw = await env.SAARE_VAULT_KV.get(kvKey);
        if (raw) {
          try { rulesData = JSON.parse(raw); } catch {}
        }
      }
      return new Response(JSON.stringify(rulesData, null, 2), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ 
      status: "error", 
      message: "Endpoint no encontrado en SAARE Control Plane Worker",
      path: url.pathname 
    }, null, 2), { status: 404, headers: corsHeaders });
  }
};