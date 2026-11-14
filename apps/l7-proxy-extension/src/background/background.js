// S.A.A.R.E. Enterprise L7 Service Worker (SGP 1.0 Production)

const DEFAULT_GATEWAY = "https://api.saare.es/v1/chat/completions";

async function resolveEffectiveConfig() {
  let managed = {};
  try {
    managed = await chrome.storage.managed.get([
      "TenantId",
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
    const originHost = msg.origin || (sender?.tab?.url ? new URL(sender.tab.url).hostname : "browser-l7");

    (async () => {
      const config = await resolveEffectiveConfig();

      if (!config.enableEnforcement) {
        sendResponse({
          success: true,
          failClosed: config.failClosed,
          verdict: { decision: "ALLOW", sanitizedPrompt: rawPrompt }
        });
        return;
      }

      try {
        const headers = {
          "Content-Type": "application/json",
          "x-saare-tenant": config.tenantId,
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
            user: config.userEmail,
            source: originHost,
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

        sendResponse({
          success: true,
          failClosed: config.failClosed,
          verdict: data
        });
      } catch (err) {
        console.error("[S.A.A.R.E. L7 Service Worker Error]:", err);
        sendResponse({
          success: true,
          failClosed: config.failClosed,
          verdict: {
            decision: config.failClosed ? "DENY" : "ALLOW",
            verdict: config.failClosed ? "FAIL_CLOSED_BLOCKED" : "FAIL_OPEN_ALLOWED",
            category: "CONTROL_PLANE_UNREACHABLE",
            error: err.message || "Control Plane L7 inalcanzable"
          }
        });
      }
    })();

    return true; // Mantiene el canal abierto para respuesta asíncrona
  }
});