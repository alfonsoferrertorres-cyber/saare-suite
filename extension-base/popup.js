const API_BASE = "https://api.saare.es/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status-indicator");
  const tenantEl = document.getElementById("tenant-name");
  const userEl = document.getElementById("user-account");

  function resolveIdentity() {
    return new Promise((resolve) => {
      if (chrome.storage?.managed) {
        chrome.storage.managed.get(["saare_tenant_domain", "saare_user_email"], (managedRes) => {
          if (!chrome.runtime.lastError && (managedRes?.saare_tenant_domain || managedRes?.saare_user_email)) {
            return resolve({
              tenant: managedRes.saare_tenant_domain || "ENTERPRISE",
              user: managedRes.saare_user_email || "Usuario GPO"
            });
          }
          fallbackLocal();
        });
      } else {
        fallbackLocal();
      }

      function fallbackLocal() {
        chrome.storage?.local.get(["saare_tenant_domain", "saare_user_email"], (localRes) => {
          const rawTenant = localRes?.saare_tenant_domain || "ENTERPRISE";
          resolve({
            tenant: rawTenant.includes("@") ? "ENTERPRISE" : rawTenant,
            user: localRes?.saare_user_email || "Sin identificar"
          });
        });
      }
    });
  }

  const identity = await resolveIdentity();
  tenantEl.innerText = identity.tenant;
  userEl.innerText = identity.user;

  try {
    const res = await fetch(`${API_BASE}/custom-rules`);
    if (res.ok) {
      statusEl.className = "status connected";
      statusEl.innerText = "🟢 BÓVEDA D1 VINCULADA";
    } else {
      throw new Error();
    }
  } catch {
    statusEl.className = "status disconnected";
    statusEl.innerText = "🔴 ERROR DE ENLACE CON BÓVEDA";
  }
});