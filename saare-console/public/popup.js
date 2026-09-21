// popup.js
document.addEventListener("DOMContentLoaded", () => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (res) => {
      if (res?.saare_tenant_domain) {
        document.getElementById("disp-tenant").innerText = res.saare_tenant_domain;
      }
      if (res?.saare_user_email) {
        document.getElementById("disp-user").innerText = res.saare_user_email;
      }
    });
  }
});