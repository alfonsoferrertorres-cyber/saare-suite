document.addEventListener("DOMContentLoaded", () => {
  const inputUser = document.getElementById("input-user");
  const inputToken = document.getElementById("input-token");
  const dispTenant = document.getElementById("disp-tenant");
  const btnSave = document.getElementById("btn-save-creds");

  const viewForm = document.getElementById("view-form");
  const viewVerified = document.getElementById("view-verified");
  const verifiedUser = document.getElementById("verified-user");
  const verifiedTenant = document.getElementById("verified-tenant");
  const btnReconfig = document.getElementById("btn-reconfig");

  function renderState() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (res) => {
        const tenant = res?.saare_tenant_domain || "ENTERPRISE";
        const email = res?.saare_user_email || "";
        const token = res?.saare_token || "";

        dispTenant.innerText = tenant;

        if (email && token) {
          // Si ya hay datos, mostrar vista de Credenciales Verificadas / Auditando
          verifiedTenant.innerText = tenant;
          verifiedUser.innerText = email;
          viewForm.style.display = "none";
          viewVerified.style.display = "block";
        } else {
          // Si faltan datos, mostrar el formulario de configuración
          viewForm.style.display = "block";
          viewVerified.style.display = "none";
        }
      });
    }
  }

  renderState();

  if (btnSave) {
    btnSave.addEventListener("click", () => {
      const email = inputUser.value.trim().toLowerCase();
      const token = inputToken.value.trim();

      if (!email || !token) {
        alert("Por favor introduce un email y token válidos.");
        return;
      }

      chrome.storage.local.set({
        saare_user_email: email,
        saare_token: token
      }, () => {
        renderState();
      });
    });
  }

  if (btnReconfig) {
    btnReconfig.addEventListener("click", () => {
      viewVerified.style.display = "none";
      viewForm.style.display = "block";
    });
  }
});