/**
 * SAARE L7 Execution Authorization Service Worker (SGP 1.0)
 * Browser Runtime Sensor & SAARE VERDICT™ Ledger Ingestion
 */

const WORKER_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

// 1. Resolución de identidad: Managed Storage (GPO) -> Local Storage -> Fallback
async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "Corporate Workload Node"
          });
        }
        fallbackLocal();
      });
    } else {
      fallbackLocal();
    }

    function fallbackLocal() {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
          const finalUser = local?.saare_user_email || payloadUser || "operator@empresa.com";
          const finalTenant = local?.saare_tenant_domain || "Corporate Workload Node";
          resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
        });
      } else {
        resolve({ user: (payloadUser || "operator@empresa.com").toLowerCase().trim(), tenant: "Corporate Workload Node" });
      }
    }
  });
}

// 2. Sincronización periódica de directivas desde el SAARE Control Plane
async function syncDynamicSettings() {
  const { user } = await resolveIdentity();
  if (user && user !== "anonymous@tenant.local") {
    try {
      const res = await fetch(`${WORKER_URL}/settings?user=${encodeURIComponent(user)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings && typeof chrome !== "undefined" && chrome.storage?.local) {
          await chrome.storage.local.set({
            saare_settings: {
              ...data.settings,
              subOptions: data.subOptions || {}
            }
          });
        }
      }
    } catch {
      // Tolerancia a microcortes de red en background
    }
  }
}

// 3. Ciclo de vida en Manifest V3 (Alarmas de sincronización)
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    syncDynamicSettings();
    if (chrome.alarms) {
      chrome.alarms.create("saare_sync_alarm", { periodInMinutes: 1 });
    }
  });

  chrome.runtime.onStartup.addListener(() => {
    syncDynamicSettings();
  });

  if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "saare_sync_alarm") {
        syncDynamicSettings();
      }
    });
  }
}

// 4. Recepción, estructuración (SGP 1.0) y transmisión de veredictos
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "SAARE_LOG_EVENT" || message?.type === "SAARE_VERDICT_EVENT") {
      resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
        const timestampIso = message.payload?.timestamp || new Date().toISOString();
        const runId = message.payload?.evidence_id || message.payload?.runId || `EV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const isDenied = message.payload?.decision === "DENY" || message.payload?.verdict === "RECHAZADO" || message.payload?.decision === "BLOCK";
        const decision = isDenied ? "DENY" : (message.payload?.decision || "ALLOW");
        const enforcementAction = isDenied ? "BLOCK" : (message.payload?.enforcement?.action || message.payload?.enforcement_action || "PASS");

        // Estructura Canónica SGP 1.0 (SAARE VERDICT™)
        const verdictPayload = {
          verdict_schema: "SGP_1.0",
          verdict_id: message.payload?.verdict_id || `VRD-${runId.replace('EV-', '')}`,
          evidence_id: runId,
          status: message.payload?.status || "VALID",
          system_id: message.payload?.system_id || "L7-BROWSER-SENSOR",
          subject: {
            type: "workload_agent",
            id: user
          },
          action: {
            type: message.payload?.action?.type || message.payload?.action || "generic_inference",
            resource: message.payload?.action?.resource || message.payload?.resource || "browser-llm-endpoint",
            digest: message.payload?.action?.digest || message.payload?.actionDigest || "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
          },
          policy: {
            id: message.payload?.policy_id || message.payload?.scenario_id || "POL-CORP-GOVERNANCE-01",
            version: message.payload?.policy_version || "1.0.0"
          },
          tenant: tenant,
          user: user,
          decision: decision,
          enforcement: {
            action: enforcementAction
          },
          executionPermit: message.payload?.executionPermit || null,
          reasonCodes: message.payload?.reasonCodes || message.payload?.rules_matched || (isDenied ? ["RULE_POLICY_VIOLATION"] : ["RULE_ACTION_PERMITTED"]),
          reason: message.payload?.reason || (isDenied ? "Acción denegada por política de autorización en tiempo de ejecución." : "Acción autorizada por política determinista."),
          promptInput: message.payload?.promptInput || "",
          issuedAt: timestampIso,
          cryptoSeal: message.payload?.cryptoSeal || "L7-SEAL:ACTIVE",
          // Retrocompatibilidad
          verdict: isDenied ? "RECHAZADO" : "PERMITIDO",
          violationDetails: {
            policy: message.payload?.policy_id || "POL-CORP-GOVERNANCE-01",
            reason: message.payload?.reason,
            cryptoSeal: message.payload?.cryptoSeal
          }
        };

        // Persistencia local en el búfer del navegador
        if (chrome.storage?.local) {
          chrome.storage.local.get({ saare_logs: [], saare_verdicts: [] }, (result) => {
            const currentLogs = Array.isArray(result.saare_logs) ? result.saare_logs : [];
            const currentVerdicts = Array.isArray(result.saare_verdicts) ? result.saare_verdicts : [];
            chrome.storage.local.set({
              saare_logs: [verdictPayload, ...currentLogs].slice(0, 100),
              saare_verdicts: [verdictPayload, ...currentVerdicts].slice(0, 100)
            });
          });
        }

        // Transmisión asíncrona hacia el Decision Store en Cloudflare Workers
        fetch(`${WORKER_URL}/runs?user=${encodeURIComponent(user)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verdictPayload)
        })
          .then((res) => res.json())
          .then((data) => sendResponse({ ok: true, data, verdict_id: verdictPayload.verdict_id }))
          .catch((err) => sendResponse({ ok: false, error: err.message }));
      });

      return true;
    }

    if (message?.type === "SAARE_GET_RULES") {
      resolveIdentity().then(({ user }) => {
        fetch(`${WORKER_URL}/custom-rules?user=${encodeURIComponent(user)}`)
          .then((res) => res.json())
          .then((data) => sendResponse({ ok: true, data }))
          .catch(() => sendResponse({ ok: false, data: [] }));
      });

      return true;
    }
  });
}