// S.A.A.R.E. AI Runtime Interceptor - L7 Pre-Flight Hook con Inyección en Conversación
const SAARE_TOKEN = "VK4WH7ZA7rnYNC9";
const SAARE_USER = "Alfonso Ferrer (Auditor SOC)";
const LOCAL_ENDPOINT = "http://localhost:3001/api/v1/runs";

console.log("[S.A.A.R.E. L7 Engine] Interceptor de conversación activo para Gemini.");

function injectSaareMessageInChat(promptText, evId) {
  // Buscar el contenedor de la conversación en Gemini
  const chatContainer = document.querySelector('chat-window, .conversation-container, main, [role="main"]');
  
  const msgBox = document.createElement("div");
  msgBox.className = "saare-injected-response";
  msgBox.style.cssText = `
    margin: 16px 24px;
    padding: 16px 20px;
    background: #0f172a;
    border: 2px solid #ef4444;
    border-radius: 12px;
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    animation: fadeIn 0.3s ease;
  `;

  msgBox.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #334155; padding-bottom:8px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">🛡️</span>
        <strong style="color:#ef4444; font-size:13px; letter-spacing:0.5px;">S.A.A.R.E. RUNTIME INTERCEPTOR (L7)</strong>
      </div>
      <span style="background:#ef4444; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">BLOQUEADO</span>
    </div>
    <div style="font-size:12.5px; color:#e2e8f0; line-height:1.5; margin-bottom:10px;">
      <strong>Zero-Submission Enforcement:</strong> El prompt no ha sido transmitido a los servidores de inferencia (0 tokens procesados).
    </div>
    <div style="background:#1e293b; padding:8px 12px; border-radius:6px; font-family:Consolas, monospace; font-size:11px; color:#38bdf8; margin-bottom:10px; border-left:3px solid #ef4444;">
      <strong>Prompt Neutralizado:</strong> "${promptText}"
    </div>
    <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
      <span>ID Evidencia: <strong style="color:#f59e0b;">${evId || 'EV-PENDING'}</strong></span>
      <span>Auditor: <strong style="color:#f8fafc;">${SAARE_USER}</strong></span>
      <span style="color:#10b981;">ISO 42001 / LOPDGDD</span>
    </div>
  `;

  if (chatContainer) {
    chatContainer.appendChild(msgBox);
    msgBox.scrollIntoView({ behavior: "smooth" });
  } else {
    document.body.appendChild(msgBox);
  }
}

function interceptAndBlock(e) {
  const richEl = document.querySelector('rich-textarea, div[contenteditable="true"], textarea, [role="textbox"]');
  if (!richEl) return;

  const text = (richEl.innerText || richEl.value || richEl.textContent || "").trim();
  if (!text) return;

  const containsDni = /\b\d{8}[A-HJ-NP-TV-Z]\b/i.test(text);
  const containsSensitive = /nómina|sueldo|cuenta|iban|password|secreto|dni/i.test(text);

  if (containsDni || containsSensitive) {
    // 1. Cancelar evento para que Gemini no lo envíe
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    // 2. Limpiar la caja de entrada
    if (richEl.isContentEditable) {
      richEl.innerHTML = "";
      richEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      richEl.value = "";
      richEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 3. Notificar al Control Plane local y estampar la evidencia
    const payload = {
      promptInput: text,
      token: SAARE_TOKEN,
      user: SAARE_USER,
      source: "gemini_web_l7",
      timestamp: new Date().toISOString()
    };

    fetch(LOCAL_ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
      const evId = data.evidence?.evidenceId || ("EV-" + Math.floor(100000 + Math.random() * 900000));
      injectSaareMessageInChat(text, evId);
    })
    .catch(() => {
      const evId = "EV-" + Math.floor(100000 + Math.random() * 900000);
      injectSaareMessageInChat(text, evId);
    });
  }
}

// Escuchador de teclado en fase de captura previa
window.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    interceptAndBlock(e);
  }
}, true);

// Escuchador de clic en el botón de enviar
window.addEventListener("click", function(e) {
  const btn = e.target.closest('button, [role="button"], .send-button');
  if (btn) {
    const isSend = btn.getAttribute('aria-label')?.toLowerCase().includes('enviar') ||
                  btn.getAttribute('aria-label')?.toLowerCase().includes('send') ||
                  btn.classList.contains('send-button');
    if (isSend) {
      interceptAndBlock(e);
    }
  }
}, true);
