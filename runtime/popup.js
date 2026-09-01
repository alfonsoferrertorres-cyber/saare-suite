/**
 * SAARE Extension Popup Controller (SGP 1.0)
 * Execution Authorization Sensor Node · SAARE VERDICT™ Local Inspector
 */

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status-indicator");
  const tenantEl = document.getElementById("tenant-name");
  const userEl = document.getElementById("user-account");
  const verdictStatsEl = document.getElementById("verdict-stats");

  // 1. Resolver identidad corporativa (Managed GPO > Local Storage > Default)
  function resolveIdentity() {
    return new Promise((resolve) => {
      // Prioridad A: Directiva GPO Empresarial
      if (typeof chrome !== "undefined" && chrome.storage?.managed) {
        chrome.storage.managed.get(["saare_tenant_domain", "saare_user_email"], (managedRes) => {
          if (!chrome.runtime.lastError && (managedRes?.saare_tenant_domain || managedRes?.saare_user_email)) {
            return resolve({
              tenant: managedRes.saare_tenant_domain || "GPO Workload Domain",
              user: managedRes.saare_user_email || "workload-operator@empresa.com"
            });
          }
          fallbackLocal();
        });
      } else {
        fallbackLocal();
      }

      // Prioridad B: Almacenamiento local sincronizado
      function fallbackLocal() {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.get(["saare_tenant_domain", "saare_user_email", "saare_verdicts"], (localRes) => {
            const verdicts = Array.isArray(localRes?.saare_verdicts) ? localRes.saare_verdicts : [];
            const allowed = verdicts.filter(v => v.decision === "ALLOW").length;
            const denied = verdicts.filter(v => v.decision === "DENY" || v.enforcement?.action === "BLOCK" || v.decision === "BLOCK").length;

            resolve({
              tenant: localRes?.saare_tenant_domain || "Corporate Workload Node",
              user: localRes?.saare_user_email || "operator@empresa.com",
              verdictsCount: verdicts.length,
              allowedCount: allowed,
              deniedCount: denied
            });
          });
        } else {
          resolve({
            tenant: "Corporate Workload Node",
            user: "operator@empresa.com",
            verdictsCount: 0,
            allowedCount: 0,
            deniedCount: 0
          });
        }
      }
    });
  }

  const identity = await resolveIdentity();
  if (tenantEl) tenantEl.innerText = identity.tenant;
  if (userEl) userEl.innerText = identity.user;
  if (verdictStatsEl && identity.verdictsCount !== undefined) {
    verdictStatsEl.innerText = `${identity.verdictsCount} acciones evaluadas (${identity.allowedCount} ALLOW · ${identity.deniedCount} DENIED)`;
  }

  // 2. Comprobar enlace de latencia real con el SAARE Judge (Cloudflare Workers)
  const startTime = performance.now();
  try {
    const res = await fetch(`${API_BASE}/scenarios`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const elapsedMs = (performance.now() - startTime).toFixed(1);

    if (res.ok && statusEl) {
      statusEl.className = "status connected";
      statusEl.style.color = "#34d399";
      statusEl.innerText = `● SAARE JUDGE CONECTADO (${elapsedMs} ms)`;
    } else {
      throw new Error("HTTP Status: " + res.status);
    }
  } catch {
    if (statusEl) {
      statusEl.className = "status disconnected";
      statusEl.style.color = "#f87171";
      statusEl.innerText = "○ ERROR DE ENLACE CON SAARE JUDGE";
    }
  }
});