/**
 * S.A.A.R.E. Extension Popup Controller v10.0
 * ISO/IEC 27037:2012 (DEFR/DES) · UNE-ISO/IEC 42001:2023
 */

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status-indicator");
  const tenantEl = document.getElementById("tenant-name");
  const userEl = document.getElementById("user-account");

  // 1. Resolver identidad dinámica (Managed GPO > Local Storage > Default)
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
          chrome.storage.local.get(["saare_tenant_domain", "saare_user_email", "saare_settings"], (localRes) => {
            resolve({
              tenant: localRes?.saare_tenant_domain || "Gabinete Jurídico y Pericial MS3V",
              user: localRes?.saare_user_email || "auditor@ms3v.es"
            });
          });
        } else {
          resolve({
            tenant: "Gabinete Jurídico y Pericial MS3V",
            user: "auditor@ms3v.es"
          });
        }
      }
    });
  }

  const identity = await resolveIdentity();
  if (tenantEl) tenantEl.innerText = identity.tenant;
  if (userEl) userEl.innerText = identity.user;

  // 2. Comprobar enlace en caliente y latencia con el Control-Plane Cloudflare
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
      statusEl.innerText = `🟢 CONTROL-PLANE ACTIVO (${elapsedMs} ms)`;
    } else {
      throw new Error("HTTP Status: " + res.status);
    }
  } catch (err) {
    if (statusEl) {
      statusEl.className = "status disconnected";
      statusEl.style.color = "#f87171";
      statusEl.innerText = "🔴 ERROR DE ENLACE CON BÓVEDA";
    }
  }
});