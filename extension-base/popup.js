document.addEventListener('DOMContentLoaded', () => {
  function updateDisplay(user, tenant, token) {
    const finalUser = user || 'auditor@tenant.local';
    const finalTenant = tenant || (finalUser.includes('@') ? finalUser.split('@')[1] : 'ORGANIZACION_AUDITADA');
    
    const dispUser = document.getElementById('disp-user');
    const dispTenant = document.getElementById('disp-tenant');
    const btnLink = document.getElementById('btn-link');

    if (dispUser) dispUser.innerText = finalUser;
    if (dispTenant) dispTenant.innerText = finalTenant;

    if (token && btnLink) {
      btnLink.href = `https://console.saare.es/?user=${encodeURIComponent(finalUser)}&token=${encodeURIComponent(token)}&tenant=${encodeURIComponent(finalTenant)}&status=ACTIVE`;
    }
  }

  function loadTelemetryLogs() {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(['saare_logs'], (res) => {
        const logs = Array.isArray(res?.saare_logs) ? res.saare_logs : [];
        const countEl = document.getElementById('disp-count');
        const lastLogEl = document.getElementById('disp-last-verdict');

        if (countEl) countEl.innerText = logs.length;

        if (lastLogEl) {
          if (logs.length > 0) {
            const last = logs[0];
            const id = last.evidence_id || last.verdictId || 'EV-L7-ACTIVE';
            const decision = last.decision || 'ALLOW';
            const time = last.timestamp ? new Date(last.timestamp).toLocaleTimeString() : 'En vivo';
            const color = decision === 'DENY' ? '#f87171' : '#a7f3d0';
            
            lastLogEl.style.color = color;
            lastLogEl.innerText = `[${time}] ${id} · ${decision}`;
          } else {
            lastLogEl.style.color = '#9ca3af';
            lastLogEl.innerText = 'Sin eventos en memoria volátil';
          }
        }
      });
    }
  }

  function fallbackLocal() {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(['saare_user_email', 'saare_tenant_domain', 'saare_bootstrap_token', 'saare_token'], (res) => {
        const user = res?.saare_user_email;
        const tenant = res?.saare_tenant_domain;
        const token = res?.saare_token || res?.saare_bootstrap_token;
        updateDisplay(user, tenant, token);
      });
    } else {
      updateDisplay(null, null, null);
    }
  }

  if (typeof chrome !== "undefined" && chrome.storage?.managed) {
    chrome.storage.managed.get(['saare_user_email', 'saare_tenant_domain', 'saare_token', 'saare_bootstrap_token'], (managed) => {
      if (chrome.runtime.lastError || !managed?.saare_user_email) {
        fallbackLocal();
      } else {
        updateDisplay(managed.saare_user_email, managed.saare_tenant_domain, managed.saare_token || managed.saare_bootstrap_token);
      }
    });
  } else {
    fallbackLocal();
  }

  loadTelemetryLogs();

  const btnClear = document.getElementById('btn-clear-ram');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ saare_logs: [] }, () => {
          loadTelemetryLogs();
        });
      }
    });
  }
});