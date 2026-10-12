const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status-indicator");
  const tenantEl = document.getElementById("tenant-name");
  const userEl = document.getElementById("user-account");

  // Resolver identidad dinámica
  function resolveIdentity() {
    return new Promise((resolve) => {
      // 1. GPO empresarial
      if (chrome.storage?.managed) {
        chrome.storage.managed.get(["saare_tenant_domain", "saare_user_email"], (managedRes) => {
          if (!chrome.runtime.lastError && (managedRes?.saare_tenant_domain || managedRes?.saare_user_email)) {
            return resolve({
              tenant: managedRes.saare_tenant_domain || "Directiva GPO",
              user: managedRes.saare_user_email || "Usuario GPO"
            });
          }
          fallbackLocal();
        });
      } else {
        fallbackLocal();
      }

      // 2. Almacenamiento local
      function fallbackLocal() {
        chrome.storage?.local.get(["saare_tenant_domain", "saare_user_email"], (localRes) => {
          resolve({
            tenant: localRes?.saare_tenant_domain || "Organización no vinculada",
            user: localRes?.saare_user_email || "Sin identificar"
          });
        });
      }
    });
  }

  const identity = await resolveIdentity();
  tenantEl.innerText = identity.tenant;
  userEl.innerText = identity.user;

  // Comprobar enlace con el Control-Plane
  try {
    const res = await fetch(`${API_BASE}/custom-rules`);
    if (res.ok) {
      statusEl.className = "status connected";
      statusEl.innerText = "🟢 CONTROL-PLANE VINCULADO";
    } else {
      throw new Error();
    }
  } catch {
    statusEl.className = "status disconnected";
    statusEl.innerText = "🔴 ERROR DE ENLACE CON BÓVEDA";
  }
});