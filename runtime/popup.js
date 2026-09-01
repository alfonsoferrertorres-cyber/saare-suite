/**
 * S.A.A.R.E. Extension Popup Controller (SGP 1.0)
 * AI-Native Audit & Decision Layer™ · SAARE VERDICT™ Local Node
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
              tenant: managedRes.saare_tenant_domain || "Directiva GPO Corporativa",
              user: managedRes.saare_user_email || "Usuario GPO"
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
            resolve({
              tenant: localRes?.saare_tenant_domain || "SAARE Enterprise Node",
              user: localRes?.saare_user_email || "auditor@empresa.es",
              verdictsCount: Array.isArray(localRes?.saare_verdicts) ? localRes.saare_verdicts.length : 0
            });
          });
        } else {
          resolve({
            tenant: "SAARE Enterprise Node",
            user: "auditor@empresa.es",
            verdictsCount: 0
          });
        }
      }
    });
  }

  const identity = await resolveIdentity();
  if (tenantEl) tenantEl.innerText = identity.tenant;
  if (userEl) userEl.innerText = identity.user;
  if (verdictStatsEl && identity.verdictsCount !== undefined) {
    verdictStatsEl.innerText = `${identity.verdictsCount} veredictos locales`;
  }

  // 2. Comprobar enlace y latencia con el Governance Decision Layer (Cloudflare Workers)
  const startTime = performance.now();
  try {
    const res = await fetch(`${API_BASE}/custom-rules?user=${encodeURIComponent(identity.user)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const elapsedMs = (performance.now() - startTime).toFixed(1);

    if (res.ok && statusEl) {
      statusEl.className = "status connected";
      statusEl.style.color = "#34d399";
      statusEl.innerText = `🟢 GOVERNANCE JUDGE ACTIVO (${elapsedMs} ms)`;
    } else {
      throw new Error("HTTP Status: " + res.status);
    }
  } catch {
    if (statusEl) {
      statusEl.className = "status disconnected";
      statusEl.style.color = "#f87171";
      statusEl.innerText = "🔴 ERROR DE ENLACE CON DECISION LAYER";
    }
  }
});