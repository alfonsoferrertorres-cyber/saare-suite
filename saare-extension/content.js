/* S.A.A.R.E. L7 Engine - Universal Real-Time Interceptor v3.4.0 */
console.log("%c[SAARE L7 Engine] Interceptor Perimetral Activo en LLM", "color: #06b6d4; font-weight: bold;");

const USER_CONFIG = {
  user: "alfonsosb1@gmail.com",
  licenseKey: "SAARE-MASTER-2026-ROOT-001"
};

let isProcessing = false;

// 1. Extractor universal de texto para Gemini, ChatGPT y Claude
function getActivePromptText() {
  // Gemini Rich Textarea
  const geminiInput = document.querySelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"][role="textbox"], rich-textarea p');
  if (geminiInput && geminiInput.innerText) {
    return geminiInput.innerText.trim();
  }

  // ChatGPT & Claude Textarea / ContentEditable
  const genericInput = document.querySelector('#prompt-textarea, textarea, div[contenteditable="true"]');
  if (genericInput) {
    return (genericInput.value || genericInput.innerText || genericInput.textContent || "").trim();
  }

  return "";
}

// 2. Motor de Inspección DLP
function evaluatePrompt(raw) {
  if (!raw) return { isViolation: false };

  // DNI / NIE
  if (/\b(\d{8}[A-HJ-NP-TV-Z]|[XYZ]\d{7}[A-HJ-NP-TV-Z])\b/i.test(raw)) {
    return { isViolation: true, category: "PII_DOCUMENTO", norma: "España - LOPDGDD & AEPD", reason: "Detección de DNI/NIE en texto de entrada" };
  }
  // IBAN Bancario
  if (/\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{22}\b/i.test(raw.replace(/\s+/g, ''))) {
    return { isViolation: true, category: "DATOS_BANCARIOS", norma: "RGPD Arts. 5, 25, 32 / LOPDGDD", reason: "Detección de Cuenta Bancaria / IBAN" };
  }
  // Tarjetas de Crédito (PCI-DSS)
  if (/\b(?:\d{4}[\s-]?){3}\d{4}\b/.test(raw.replace(/[\s-]+/g, ''))) {
    return { isViolation: true, category: "TARJETA_CREDITO", norma: "PCI-DSS / RGPD Art. 32", reason: "Detección de Tarjeta Financiera" };
  }

  return { isViolation: false };
}

// 3. Notificación Modal Toast
function showToast(evidenceId, norma, reason) {
  const oldToast = document.getElementById("saare-toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.id = "saare-toast";
  toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;max-width:420px;background:#090d16;border:1px solid rgba(239,68,68,0.6);border-radius:10px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,0.85);color:#e2e8f0;font-family:-apple-system,sans-serif;font-size:13px;";

  toast.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <strong style="color:#ef4444;font-size:12px;">🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR</strong>
      <button id="saare-toast-close" style="background:transparent;border:none;color:#94a3b8;font-size:18px;cursor:pointer;line-height:1;">&times;</button>
    </div>
    <div style="margin-bottom:4px;color:#f8fafc;font-weight:600;">BLOQUEADO: ${reason}</div>
    <div style="font-size:11px;color:#64748b;margin-bottom:12px;">${norma} | ID: ${evidenceId}</div>
    <div style="display:flex;justify-content:flex-end;gap:8px;">
      <button id="saare-btn-registry" style="background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.4);color:#22d3ee;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;">Ver Registro Global</button>
      <button id="saare-btn-dismiss" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;">Cerrar</button>
    </div>
  `;

  (document.body || document.documentElement).appendChild(toast);
  const remove = () => toast.remove();
  toast.querySelector("#saare-toast-close").onclick = remove;
  toast.querySelector("#saare-btn-dismiss").onclick = remove;
  toast.querySelector("#saare-btn-registry").onclick = () => { window.open("https://console.saare.es", "_blank"); remove(); };
  setTimeout(remove, 10000);
}

// 4. Interceptación y Despacho de Evidencia
function handleExecution(event) {
  if (isProcessing) return;

  const rawText = getActivePromptText();
  if (!rawText) return;

  const result = evaluatePrompt(rawText);
  const evidenceId = "EV-" + Math.floor(100000 + Math.random() * 900000);
  const hashBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)));
  const hashHex = hashBytes.map(b => b.toString(16).padStart(2, "0")).join("");

  const payload = {
    evidenceId: evidenceId,
    timestamp: new Date().toISOString(),
    event: result.isViolation ? `Exfiltración PII: ${result.category}` : "Interacción IA Conforme",
    verdict: result.isViolation ? "RECHAZADO" : "CONFORME",
    user: USER_CONFIG.user,
    licenseKey: USER_CONFIG.licenseKey,
    origin: window.location.hostname,
    action: result.isViolation ? "REDACTED (RAM)" : "LOGGED",
    status: result.isViolation ? "RECHAZADO" : "CONFORME",
    violationDetails: result.isViolation ? result : { isViolation: false, category: "NINGUNA" },
    hash: hashHex
  };

  if (result.isViolation) {
    // Freno inmediato en fase de captura
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    showToast(evidenceId, result.norma, result.reason);
  }

  isProcessing = true;
  chrome.runtime.sendMessage({ type: "SAARE_LOG_EVENT", payload: payload }, () => {
    setTimeout(() => { isProcessing = false; }, 300);
  });
}

// 5. Escucha en fase de Captura de Ventana (Prioridad Máxima sobre frameworks)
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    handleExecution(e);
  }
}, true);

window.addEventListener("click", (e) => {
  const btn = e.target.closest('button, [role="button"], mat-icon-button, .send-button');
  if (btn) {
    handleExecution(e);
  }
}, true);
