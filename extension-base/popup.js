const API_BASE = "https://api.saare.es/api/v1";
const CONSOLE_URL = "https://console.saare.es";

document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status-indicator");
  const tenantEl = document.getElementById("tenant-name");
  const userEl = document.getElementById("user-account");
  const roleEl = document.getElementById("user-role");
  const tokenInput = document.getElementById("token-input");
  const saveBtn = document.getElementById("save-credentials-btn");
  const openVaultBtn = document.getElementById("open-vault-btn");

  // 1. Cargar credenciales desde el almacenamiento local de la extensión
  function loadStoredCredentials() {
    return new Promise((resolve) => {
      chrome.storage?.local.get(["saare_tenant_domain", "saare_user_email", "saare_token", "saare_user_role"], (res) => {
        resolve({
          tenant: res?.saare_tenant_domain || "ENTERPRISE",
          user: res?.saare_user_email || "ciso@saare.es",
          token: res?.saare_token || "",
          role: res?.saare_user_role || "CISO_ADMIN"
        });
      });
    });
  }

  const identity = await loadStoredCredentials();
  tenantEl.innerText = identity.tenant;
  userEl.innerText = identity.user;
  roleEl.innerText = identity.role;
  if (identity.token) {
    tokenInput.value = identity.token;
  }

  // 2. Comprobar la conexión con la API de la Bóveda en api.saare.es
  async function verifyConnection() {
    try {
      const headers = {
        "x-saare-tenant": identity.tenant,
        "x-saare-user": identity.user,
        "x-saare-role": identity.role
      };
      if (identity.token) {
        headers["Authorization"] = `Bearer ${identity.token}`;
      }

      const res = await fetch(`${API_BASE}/status`, { headers });
      if (res.ok) {
        statusEl.className = "status connected";
        statusEl.innerText = "🟢 BÓVEDA D1 CONECTADA";
      } else {
        throw new Error();
      }
    } catch {
      statusEl.className = "status disconnected";
      statusEl.innerText = "🔴 ERROR DE CONEXIÓN CON BÓVEDA";
    }
  }

  await verifyConnection();

  // 3. Guardar credencial tokenizada
  saveBtn.addEventListener("click", () => {
    const newToken = tokenInput.value.trim();
    chrome.storage?.local.set({ saare_token: newToken }, async () => {
      saveBtn.innerText = "✅ Credenciales Sincronizadas";
      setTimeout(() => { saveBtn.innerText = "💾 Sincronizar Credenciales"; }, 2000);
      await verifyConnection();
    });
  });

  // 4. Abrir la Consola GRC en una pestaña nueva
  openVaultBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: `${CONSOLE_URL}` });
  });
});