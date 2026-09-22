document.addEventListener("DOMContentLoaded", () => {
  const inputUser = document.getElementById("input-user");
  const inputToken = document.getElementById("input-token");
  const dispTenant = document.getElementById("disp-tenant");
  const btnSave = document.getElementById("btn-save-creds");

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (res) => {
      if (res?.saare_tenant_domain) dispTenant.innerText = res.saare_tenant_domain;
      if (res?.saare_user_email) inputUser.value = res.saare_user_email;
      if (res?.saare_token) inputToken.value = res.saare_token;
    });

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
        alert("Credenciales guardadas correctamente.");
      });
    });
  }
});