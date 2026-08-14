// SAARE L7 Proxy Interceptor - Hook Completo (Intro & Submit)
(function() {
  console.log('[S.A.A.R.E. PROXY L7] Canal activo: Escuchando Intro y botones');

  function cleanText(raw) {
    if (!raw) return '';
    return raw
      .replace(/\[ADJUNTO:[^\]]*\]/gi, '')
      .replace(/Convertir chat a PDF/gi, '')
      .replace(/Abrir este chat en Acrobat/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function processPrompt(rawInput) {
    const text = cleanText(rawInput);
    if (!text || text.length < 2) return;
    const currentToken = localStorage.getItem('saare_auth_token') || 'SAARE-TOKEN-ENT-M57TOVV';

    try {
      const response = await fetch('http://localhost:3001/api/v1/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          promptInput: text,
          prompt: text,
          token: currentToken,
          user: 'Alfonso Ferrer (Auditor SOC)'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verdict === 'RECHAZADO') {
          showNotification(data.explanation, data.evidence?.cryptoSeal || 'AES256-AEPD-ES');
        }
      }
    } catch (err) {
      console.warn('[S.A.A.R.E.] Error enviando al Proxy L7 local :3001', err);
    }
  }

  function showNotification(explanation, seal) {
    let box = document.getElementById('saare-alert-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'saare-alert-box';
      box.style.cssText = 'position:fixed;top:20px;left:20px;z-index:999999;background:#0f172a;border:2px solid #ef4444;border-radius:12px;padding:16px;color:#fff;font-family:system-ui,sans-serif;box-shadow:0 20px 25px -5px rgba(0,0,0,0.6);max-width:340px;';
      document.body.appendChild(box);
    }
    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:1.2rem;">⛔</span>
        <strong style="color:#f87171;font-size:0.88rem;">BLOQUEADO POR CONTROL PLANE S.A.A.R.E.</strong>
      </div>
      <p style="margin:0 0 8px 0;font-size:0.8rem;color:#cbd5e1;">${explanation}</p>
      <div style="font-size:0.7rem;color:#94a3b8;border-top:1px solid #334155;padding-top:6px;">
        SELLO: <code style="color:#38bdf8;">${seal}</code>
      </div>
    `;
    setTimeout(() => { if (box) box.remove(); }, 4000);
  }

  // 1. Interceptar TECLA INTRO / ENTER
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true' || activeEl.classList.contains('ql-editor'))) {
        const text = activeEl.innerText || activeEl.value || '';
        processPrompt(text);
      }
    }
  }, true);

  // 2. Interceptar CLICKS en botones de envío
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button, [role="button"]');
    if (btn) {
      const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (aria.includes('enviar') || aria.includes('send') || btn.querySelector('svg')) {
        const inputEl = document.querySelector('textarea, [contenteditable="true"], .ql-editor');
        if (inputEl) {
          const text = inputEl.innerText || inputEl.value || '';
          processPrompt(text);
        }
      }
    }
  }, true);
})();
