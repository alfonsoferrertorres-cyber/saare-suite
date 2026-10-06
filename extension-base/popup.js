document.addEventListener('DOMContentLoaded', () => {
  function updateDisplay(user, tenant, token) {
    const finalUser = user || 'auditor@tenant.local';
    const finalTenant = tenant || (finalUser.includes('@') ? finalUser.split('@')[1].split('.')[0].toUpperCase() : 'ORGANIZACION_AUDITADA');
    
    const dispUser = document.getElementById('disp-user');
    const dispTenant = document.getElementById('disp-tenant');
    const btnLink = document.getElementById('btn-link');

    if (dispUser) dispUser.innerText = finalUser;
    if (dispTenant) dispTenant.innerText = finalTenant;

    if (token && btnLink) {
      btnLink.href = `https://console.saare.es/?user=${encodeURIComponent(finalUser)}&token=${encodeURIComponent(token)}&tenant=${encodeURIComponent(finalTenant)}&status=ACTIVE`;
    }
  }

  function fallbackLocal() {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(['saare_user_email', 'saare_tenant_domain', 'saare_bootstrap_token', 'saareUser', 'saareTenant'], (res) => {
        const user = res?.saare_user_email || res?.saareUser;
        const tenant = res?.saare_tenant_domain || res?.saareTenant;
        const token = res?.saare_bootstrap_token;
        updateDisplay(user, tenant, token);
      });
    } else {
      updateDisplay(null, null, null);
    }
  }

  // 1. Lectura de credenciales gestionadas por MDM/GPO empresarial
  if (typeof chrome !== "undefined" && chrome.storage?.managed) {
    chrome.storage.managed.get(['saare_user_email', 'saare_tenant_domain', 'saare_bootstrap_token'], (managed) => {
      if (chrome.runtime.lastError || !managed?.saare_user_email) {
        fallbackLocal();
      } else {
        updateDisplay(managed.saare_user_email, managed.saare_tenant_domain, managed.saare_bootstrap_token);
      }
    });
  } else {
    fallbackLocal();
  }
});