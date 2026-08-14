// SAARE L7 UNIVERSAL PROMPT INTERCEPTOR (AUDITORIA FORENSE TOTAL)
console.log("[SAARE L7 Engine] Interceptor Universal Activo - Captura 100%");

function getGeminiInputText() {
  const el = document.querySelector('rich-textarea div[contenteditable="true"], .ql-editor, div[contenteditable="true"], textarea, rich-textarea p');
  if (!el) return "";
  return (el.innerText || el.textContent || el.value || "").trim();
}

function sendEvidence(text, isBlocked = false) {
  if (!text || text.trim() === "") return;

  const payload = {
    promptInput: text.trim(),
    user: "alfonsosb1@gmail.com",
    timestamp: new Date().toISOString()
  };

  fetch("http://localhost:3001/api/v1/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    console.log("[SAARE Bóveda Registrada]:", data);
    if (data.verdict === "RECHAZADO" || isBlocked) {
      showModal(data.runId || data.evidence?.evidenceId, text);
    }
  })
  .catch(err => console.error("[SAARE Error Vault Connection]:", err));
}

function showModal(evId, text) {
  let old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style = "position:fixed; bottom:20px; right:20px; width:460px; background:#111827; color:#fff; padding:16px; border-radius:12px; border:2px solid #ef4444; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:999999; font-family:system-ui,sans-serif;";
  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:800; font-size:0.85rem; color:#ef4444; display:flex; align-items:center; gap:6px;">
        🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR (L7)
      </span>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:800; padding:2px 6px; border-radius:4px;">BLOQUEADO</span>
    </div>
    <p style="font-size:0.8rem; margin:0 0 8px 0; color:#9ca3af;">
      <strong>Zero-Submission Enforcement:</strong> El prompt no ha sido transmitido a los servidores de inferencia.
    </p>
    <div style="background:#1f2937; padding:8px 10px; border-radius:6px; font-size:0.8rem; color:#93c5fd; margin-bottom:8px;">
      Prompt Neutralizado: "${text}"
    </div>
    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#6b7280;">
      <span>ID Evidencia: <strong style="color:#f59e0b;">${evId || 'EV-LOCAL'}</strong></span>
      <span>Auditor: <strong style="color:#fff;">alfonsosb1@gmail.com</strong></span>
    </div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => { banner.remove(); }, 6000);
}

// 1. CAPTURA AL PULSAR ENTER
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const text = getGeminiInputText();
    if (text.length > 0) {
      const isSensitive = /\b\d{8}[A-HJ-NP-TV-Z]\b|nómina|nomina|iban|sueldo/i.test(text);
      if (isSensitive) {
        e.preventDefault();
        e.stopPropagation();
        const el = document.querySelector('rich-textarea div[contenteditable="true"], .ql-editor, div[contenteditable="true"], textarea, rich-textarea p');
        if (el) { el.innerText = ""; el.textContent = ""; el.value = ""; }
        sendEvidence(text, true);
      } else {
        // CUALQUIER TEXTO INOCUO -> ENVIAR INMEDIATAMENTE AL CONTROL-PLANE
        sendEvidence(text, false);
      }
    }
  }
}, true);

// 2. CAPTURA AL HACER CLIC EN BOTÓN DE ENVIAR
window.addEventListener("click", (e) => {
  const btn = e.target.closest('button[aria-label*="Enviar"], button[aria-label*="Send"], button.send-button, .send-button-container button, mat-icon[data-mat-icon-name="send"]');
  if (btn) {
    const text = getGeminiInputText();
    if (text.length > 0) {
      const isSensitive = /\b\d{8}[A-HJ-NP-TV-Z]\b|nómina|nomina|iban|sueldo/i.test(text);
      if (isSensitive) {
        e.preventDefault();
        e.stopPropagation();
        const el = document.querySelector('rich-textarea div[contenteditable="true"], .ql-editor, div[contenteditable="true"], textarea, rich-textarea p');
        if (el) { el.innerText = ""; el.textContent = ""; el.value = ""; }
        sendEvidence(text, true);
      } else {
        sendEvidence(text, false);
      }
    }
  }
}, true);
