// S.A.A.R.E. Enterprise L7 Service Worker (SGP 1.0 Production + Semantic Detox + ISO 42001 Alarms + Multi-Profile)

const DEFAULT_GATEWAY = "https://api.saare.es/v1/chat/completions";

async function resolveEffectiveConfig() {
  let managed = {};
  try {
    managed = await chrome.storage.managed.get([
      "TenantId",
      "BrowserProfile",
      "ClientProfile",
      "LicenseKey",
      "ProxyGateway",
      "TrustAnchor",
      "FailClosed",
      "EnableExAnteEnforcement"
    ]);
  } catch (e) {
    // Entorno sin políticas GPO administradas
  }

  let local = {};
  try {
    const stored = await chrome.storage.local.get("saareConfig");
    local = stored?.saareConfig || {};
  } catch (e) {}

  return {
    tenantId: (managed.TenantId || local.tenantId || "DEMO_ENTERPRISE").trim(),
    browserProfile: (managed.BrowserProfile || local.browserProfile || "Chrome_Perfil_Cliente_01").trim(),
    clientProfile: (managed.ClientProfile || local.clientProfile || "Perfil_Auditoria_L7").trim(),
    apiKey: (managed.LicenseKey || local.apiKey || "").trim(),
    gateway: (managed.ProxyGateway || local.apiUrl || DEFAULT_GATEWAY).trim().replace(/\/+$/, ""),
    userEmail: (local.userEmail || "operador_l7@saare.local").trim().toLowerCase(),
    trustAnchor: (managed.TrustAnchor || "https://vault.saare.es").trim(),
    failClosed: managed.FailClosed !== undefined
      ? Boolean(managed.FailClosed)
      : (local.failClosed !== undefined ? Boolean(local.failClosed) : true),
    enableEnforcement: managed.EnableExAnteEnforcement !== undefined
      ? Boolean(managed.EnableExAnteEnforcement)
      : true
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action === "INSPECT_PROMPT_EX_ANTE" || msg?.action === "EVALUATE_EX_ANTE") {
    const rawPrompt = msg.payload || msg.prompt || "";
    const userAction = msg.userAction || "DEFAULT_POLICY";
    const originHost = msg.origin || (sender?.tab?.url ? new URL(sender.tab.url).hostname : "browser-l7");

    (async () => {
      const config = await resolveEffectiveConfig();

      if (!config.enableEnforcement) {
        sendResponse({
          success: true,
          failClosed: config.failClosed,
          verdict: {
            decision: "ALLOW",
            verdict: "PERMITIDO",
            sanitizedPrompt: rawPrompt,
            browserProfile: config.browserProfile,
            clientProfile: config.clientProfile,
            alarm: { triggered: false, severity: "INFO", allowedActions: ["ALLOW"] },
            detox: { status: "DISABLED", rulesTriggered: [], engine: "v1.4-DETOX-RAM-ISO42001-FULL" }
          }
        });
        return;
      }

      try {
        const headers = {
          "Content-Type": "application/json",
          "x-saare-tenant": config.tenantId,
          "x-saare-browser-profile": config.browserProfile,
          "x-saare-client-profile": config.clientProfile,
          "x-saare-user": config.userEmail,
          "x-saare-source": originHost
        };

        if (config.apiKey) {
          headers["Authorization"] = `Bearer ${config.apiKey}`;
          headers["x-saare-api-key"] = config.apiKey;
        }

        const res = await fetch(config.gateway, {
          method: "POST",
          headers,
          body: JSON.stringify({
            prompt: rawPrompt,
            messages: [{ role: "user", content: rawPrompt }],
            tenant_id: config.tenantId,
            browserProfile: config.browserProfile,
            clientProfile: config.clientProfile,
            user: config.userEmail,
            source: originHost,
            userAction,
            mode: "EX_ANTE_INSPECTION_ONLY"
          })
        });

        let data = {};
        try {
          data = await res.json();
        } catch (parseErr) {
          throw new Error(`Respuesta no JSON del Control Plane (HTTP ${res.status})`);
        }

        if (!res.ok && !data.decision) {
          throw new Error(data.error || data.message || `HTTP ${res.status} en Control Plane L7`);
        }

        const decision = data.decision || (res.ok ? "ALLOW" : "DENY");
        const verdict = data.verdict || (res.ok ? "PERMITIDO" : "RECHAZADO");

        const detoxInfo = data.detox || {
          status: res.ok ? "CLEAN" : "ERROR",
          rulesTriggered: [],
          findings: [],
          engine: "v1.4-DETOX-RAM-ISO42001-FULL"
        };

        const alarmInfo = data.alarm || {
          triggered: Array.isArray(detoxInfo.rulesTriggered) && detoxInfo.rulesTriggered.length > 0,
          tenant: config.tenantId,
          severity: decision === "DENY" ? "HIGH" : "INFO",
          iso42001_controls: [],
          rulesTriggered: detoxInfo.rulesTriggered || [],
          findings: detoxInfo.findings || [],
          requiresUserDecision: false,
          allowedActions: decision === "DENY" ? ["BLOCK"] : ["ALLOW"]
        };

        try {
          await chrome.storage.local.set({
            lastDetoxStatus: {
              ...detoxInfo,
              decision,
              verdict,
              browserProfile: data.profile_context?.browserProfile || config.browserProfile,
              clientProfile: data.profile_context?.clientProfile || config.clientProfile,
              profile_context: data.profile_context || {
                browserProfile: config.browserProfile,
                clientProfile: config.clientProfile
              },
              alarm: alarmInfo,
              timestamp: new Date().toISOString(),
              targetHost: originHost
            }
          });
        } catch (storageErr) {}

        const normalizedVerdict = {
          ...data,
          decision,
          verdict,
          browserProfile: config.browserProfile,
          clientProfile: config.clientProfile,
          sanitizedPrompt: detoxInfo.sanitizedPayload || data.sanitizedPrompt || rawPrompt,
          alarm: alarmInfo,
          detox: detoxInfo
        };

        sendResponse({
          success: true,
          failClosed: config.failClosed,
          verdict: normalizedVerdict
        });

      } catch (err) {
        console.error("[S.A.A.R.E. L7 Service Worker Error]:", err);

        const decision = config.failClosed ? "DENY" : "ALLOW";
        const verdict = config.failClosed ? "FAIL_CLOSED_BLOCKED" : "FAIL_OPEN_ALLOWED";

        const errorDetox = {
          engine: "v1.4-DETOX-RAM-ISO42001-FULL",
          status: "ERROR_UNREACHABLE",
          rulesTriggered: ["AIMS_FAIL_CLOSED_TRIGGERED"],
          findings: [
            {
              rule: "AIMS_FAIL_CLOSED_TRIGGERED",
              category: "AVAILABILITY_FAIL_SAFE",
              severity: "HIGH",
              iso42001_control: "A.6.2 / A.9.4"
            }
          ]
        };

        const errorAlarm = {
          triggered: true,
          tenant: config.tenantId,
          severity: config.failClosed ? "HIGH" : "INFO",
          iso42001_controls: ["A.6.2 / A.9.4"],
          rulesTriggered: ["AIMS_FAIL_CLOSED_TRIGGERED"],
          findings: errorDetox.findings,
          requiresUserDecision: false,
          allowedActions: config.failClosed ? ["BLOCK"] : ["ALLOW"]
        };

        try {
          await chrome.storage.local.set({
            lastDetoxStatus: {
              ...errorDetox,
              decision,
              verdict,
              browserProfile: config.browserProfile,
              clientProfile: config.clientProfile,
              alarm: errorAlarm,
              timestamp: new Date().toISOString(),
              targetHost: originHost
            }
          });
        } catch (e) {}

        sendResponse({
          success: true,
          failClosed: config.failClosed,
          verdict: {
            decision,
            verdict,
            browserProfile: config.browserProfile,
            clientProfile: config.clientProfile,
            category: "CONTROL_PLANE_UNREACHABLE",
            sanitizedPrompt: rawPrompt,
            alarm: errorAlarm,
            detox: errorDetox,
            error: err.message || "Control Plane L7 inalcanzable"
          }
        });
      }
    })();

    return true;
  }
});