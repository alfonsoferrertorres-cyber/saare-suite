/**
 * S.A.A.R.E. L7 Governance Agent Background Service Worker (SGP 1.0)
 * AI-Native Audit & Decision Layer™ · SAARE VERDICT™ Ledger Ingest
 */

const WORKER_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

// 1. Resolución de identidad corporativa: Managed Storage (GPO) -> Local Storage -> Fallback
async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "SAARE Enterprise Node"
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
          const finalUser = local?.saare_user_email || payloadUser || "auditor@empresa.es";
          const finalTenant = local?.saare_tenant_domain || "SAARE Enterprise Node";
          resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
        });
      } else {
        resolve({ user: (payloadUser || "auditor@empresa.es").toLowerCase().trim(), tenant: "SAARE Enterprise Node" });
      }
    }
  });
}

// 2. Sincronización periódica de políticas y directivas desde el Control Plane
async function syncDynamicSettings() {
  const { user } = await resolveIdentity();
  if (user && user !== "usuario_anonimo@tenant.es") {
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
      // Tolerancia a microcortes de red
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

// 4. Recepción, estructuración normativa (SGP 1.0) y transmisión de veredictos
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "SAARE_LOG_EVENT" || message?.type === "SAARE_VERDICT_EVENT") {
      resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
        const timestampIso = message.payload?.timestamp || new Date().toISOString();
        const runId = message.payload?.evidence_id || message.payload?.runId || `EV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        // Estructura Canónica SGP 1.0 (SAARE VERDICT™)
        const verdictPayload = {
          verdict_schema: "SGP_1.0",
          verdict_id: message.payload?.verdict_id || `VRD-${runId.replace('EV-', '')}`,
          evidence_id: runId,
          validity_state: message.payload?.validity_state || "VALID",
          system_id: message.payload?.system_id || "L7-BROWSER-SENSOR",
          actor_id: user,
          tenant: tenant,
          user: user,
          model_id: message.payload?.model_id || "browser-llm-endpoint",
          decision: message.payload?.decision || (message.payload?.verdict === "RECHAZADO" ? "BLOCK" : "ALLOW"),
          enforcement_action: message.payload?.enforcement_action || (message.payload?.verdict === "RECHAZADO" ? "BLOCK_AND_PURGE_RAM" : "ALLOW_AND_ATTEST"),
          policy_id: message.payload?.policy_id || message.payload?.scenario_id || "POL-CORP-GOVERNANCE-01",
          policy_version: message.payload?.policy_version || "1.0.0",
          risk_level: message.payload?.risk_level || (message.payload?.verdict === "RECHAZADO" ? "HIGH" : "LOW"),
          rules_matched: message.payload?.rules_matched || (message.payload?.category ? [message.payload.category] : []),
          reason: message.payload?.reason || "Evaluación determinista bajo perímetro L7",
          promptInput: message.payload?.promptInput || "",
          timestamp: timestampIso,
          cryptoSeal: message.payload?.cryptoSeal || "L7-SEAL:ACTIVE",
          parentHash: message.payload?.parentHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          // Retrocompatibilidad con esquemas previos
          verdict: message.payload?.decision === "BLOCK" || message.payload?.verdict === "RECHAZADO" ? "RECHAZADO" : "PERMITIDO",
          category: message.payload?.policy_id || message.payload?.category,
          norma: message.payload?.policy_id || message.payload?.norma,
          violationDetails: message.payload?.violationDetails || {
            category: message.payload?.policy_id,
            norma: message.payload?.policy_id,
            reason: message.payload?.reason,
            cryptoSeal: message.payload?.cryptoSeal
          }
        };

        // Persistencia en búfer local del navegador
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

      return true; // Mantiene el puerto de mensajería abierto para respuesta asíncrona
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