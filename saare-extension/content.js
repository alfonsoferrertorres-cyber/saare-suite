/* S.A.A.R.E. L7 Compliance Gateway - v4.0.0 */
console.log("%c[SAARE L7 Engine] Escudo Perimetral Universal Activo", "color: #06b6d4; font-weight: bold;");

// Inyectar el interceptor en el contexto principal
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject.js");
(document.head || document.documentElement).appendChild(script);
script.onload = () => script.remove();

const DLP = {
  dni: /\b(\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])\b/i,
  iban: /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{20,22}\b/i,
  card: /\b(?:\d{4}[\s-]?){3}\d{4}\b|\b\d{15,16}\b/
};

function evaluateText(raw) {
  if (!raw) return { isViolation: false };
  if (DLP.dni.test(raw)) return { isViolation: true, category: "PII_DNI", norma: "España - LOPDGDD & AEPD", reason: "Detección de DNI/NIE en entrada" };
  if (DLP.iban.test(raw.replace(/\s+/g, ""))) return { isViolation: true, category: "DATOS_BANCARIOS", norma: "RGPD Art. 5, 32 / LOPDGDD", reason: "Detección de IBAN" };
  if (DLP.card.test(raw.replace(/[\s-]+/g, ""))) return { isViolation: true, category: "TARJETA_CREDITO", norma: "PCI-DSS / RGPD", reason: "Detección de Tarjeta Financiera" };
  return { isViolation: false };
}

function showToast(evidenceId, norma, reason) {
  const old = document.getElementById("saare-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "saare-toast";
  toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;max-width:420px;background:#090d16;border:1px solid rgba(239,68,68,0.8);border-radius:10px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,0.9);color:#e2e8f0;font-family:-apple-system,sans-serif;font-size:13px;";

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

function processAndDispatch(violationInfo) {
  const evidenceId = "EV-" + Math.floor(100000 + Math.random() * 900000);
  showToast(evidenceId, violationInfo.norma, violationInfo.reason);

  const hashBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)));
  const hashHex = hashBytes.map(b => b.toString(16).padStart(2, "0")).join("");

  const payload = {
    evidenceId: evidenceId,
    timestamp: new Date().toISOString(),
    event: `Exfiltración PII: ${violationInfo.category}`,
    verdict: "RECHAZADO",
    user: "alfonsosb1@gmail.com",
    licenseKey: "SAARE-MASTER-2026-ROOT-001",
    origin: window.location.hostname,
    action: "REDACTED (RAM)",
    status: "RECHAZADO",
    violationDetails: violationInfo,
    hash: hashHex
  };

  chrome.runtime.sendMessage({ type: "SAARE_LOG_EVENT", payload: payload });
}

// 1. Detección DOM en fase de Captura
function handleInputCheck(e) {
  const inputEl = document.querySelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"], textarea, #prompt-textarea');
  const rawText = inputEl ? (inputEl.innerText || inputEl.value || inputEl.textContent || "") : "";
  const result = evaluateText(rawText);

  if (result.isViolation) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    processAndDispatch(result);
  }
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) handleInputCheck(e);
}, true);

window.addEventListener("click", (e) => {
  if (e.target.closest('button, [role="button"], mat-icon-button, .send-button')) handleInputCheck(e);
}, true);

// 2. Detección desde Hook de Red L7
window.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SAARE_BLOCKED_EVENT") {
    processAndDispatch(e.data.violation);
  }
});
