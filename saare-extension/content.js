/* S.A.A.R.E. L7 Compliance Gateway - Content Script v2.5.1 */
console.log("[SAARE L7 Engine] Interceptor Dual Activo (Normativa Base + Reglas Personalizadas)");

let customRulesCache = [];

function syncCustomRules() {
  const endpoints = [
    "http://localhost:3001/api/v1/custom-rules",
    "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/custom-rules"
  ];
  endpoints.forEach(url => {
    fetch(url).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) customRulesCache = data;
    }).catch(() => {});
  });
}
syncCustomRules();
setInterval(syncCustomRules, 30000);

// Motor de Detección DLP
function evaluateDLP(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return { isViolation: false, category: null, reason: null, norma: null };
  }
  const raw = text.trim();

  // 1. DNI / NIE
  const dniRegex = /\b(\d{8}[A-HJ-NP-TV-Z]|[XYZ]\d{7}[A-HJ-NP-TV-Z])\b/i;
  if (dniRegex.test(raw)) {
    return { isViolation: true, category: "PII_DOCUMENTO", norma: "España - LOPDGDD & AEPD", reason: "Detección de DNI/NIE en texto de entrada" };
  }

  // 2. IBAN
  const ibanRegex = /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{22}\b/i;
  if (ibanRegex.test(raw.replace(/\s+/g, ''))) {
    return { isViolation: true, category: "DATOS_BANCARIOS", norma: "RGPD Arts. 5, 25, 32 / LOPDGDD", reason: "Detección de Cuenta Bancaria / IBAN" };
  }

  // 3. Tarjetas
  const creditCardRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/;
  if (creditCardRegex.test(raw.replace(/[\s-]+/g, ''))) {
    return { isViolation: true, category: "TARJETA_CREDITO", norma: "PCI-DSS / RGPD Art. 32", reason: "Detección de Tarjeta Financiera" };
  }

  // 4. Jailbreak
  const jailbreakRegex = /(ignore previous instructions|anula tus directivas|ignore all rules|system prompt override|jailbreak)/i;
  if (jailbreakRegex.test(raw)) {
    return { isViolation: true, category: "SEGURIDAD_L7", norma: "TOP L7: Jailbreak Guard", reason: "Patrón de anulación de directivas perimetrales" };
  }

  // 5. Reglas Personalizadas
  for (const rule of customRulesCache) {
    if (!rule.active) continue;
    try {
      let match = false;
      if (rule.type === 'regex') {
        const parts = rule.pattern.match(/^\/(.*?)\/(.*)$/);
        const re = parts ? new RegExp(parts[1], parts[2]) : new RegExp(rule.pattern, 'i');
        match = re.test(raw);
      } else {
        match = raw.toLowerCase().includes(rule.pattern.toLowerCase());
      }
      if (match) {
        return { isViolation: true, category: "REGLA_PERSONALIZADA", norma: rule.norma || "Política Interna", reason: rule.name || "Filtro Personalizado" };
      }
    } catch (e) {}
  }
  return { isViolation: false, category: null, reason: null, norma: null };
}

// Banner Modal Seguro
function showModal(evId, text, violationInfo) {
  try {
    let old = document.getElementById("saare-block-modal");
    if (old) old.remove();

    const banner = document.createElement("div");
    banner.id = "saare-block-modal";
    banner.style = "position:fixed; bottom:20px; right:20px; width:460px; background:#0f172a; color:#ffffff; padding:16px; border-radius:8px; border:2px solid #ef4444; box-shadow:0 12px 28px rgba(0,0,0,0.6); z-index:99999999; font-family:system-ui,-apple-system,sans-serif;";

    const normTitle = violationInfo?.norma || "España - LOPDGDD & AEPD";
    const reasonText = violationInfo?.reason || "Carga de riesgo detectada";

    banner.innerHTML = `
      
        🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR (L7)
        BLOQUEADO
      
      
        Normativa: ${normTitle}
        Motivo: ${reasonText}
      
      
        EVIDENCIA: ${evId} | Prompt interceptado en memoria RAM
      
      Cerrar Aviso
    `;

    document.body.appendChild(banner);
    const btn = banner.querySelector("#saare-close-btn");
    if (btn) btn.onclick = () => banner.remove();
  } catch (err) {
    console.error("[SAARE Modal Render Error]:", err);
  }
}

// Envío Dual y Resiliente de Evidencias
function sendEvidence(summary, violationInfo) {
  if (!summary || summary.trim() === '') return;

  const isBlocked = !!violationInfo?.isViolation;
  const localEvId = "EV-" + Math.floor(100000 + Math.random() * 900000);

  // 1. Mostrar banner
  if (isBlocked) {
    showModal(localEvId, summary, violationInfo);
  }

  // 2. Construir payload
  const payload = {
    evidenceId: localEvId,
    promptInput: summary.trim(),
    user: "alfonsosb1@gmail.com",
    timestamp: new Date().toISOString(),
    verdict: isBlocked ? "RECHAZADO" : "PERMITIDO",
    violationDetails: violationInfo
  };

  // 3. Enviar simultáneamente a la Bóveda Local y al Worker de Producción
  const endpoints = [
    "http://localhost:3001/api/v1/runs",
    "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs"
  ];

  endpoints.forEach(url => {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(e => console.warn("[SAARE Telemetry Sync]:", url, e.message));
  });
}

function extractPromptText() {
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
    return activeEl.value;
  }
  const richEditor = document.querySelector('rich-textarea div[contenteditable="true"], div[contenteditable="true"], p.is-empty, textarea');
  if (richEditor) {
    return richEditor.innerText || richEditor.textContent || richEditor.value || '';
  }
  return '';
}

function handleIntercept(e) {
  const text = extractPromptText();
  if (!text || text.trim() === '') return;

  const risk = evaluateDLP(text);
  if (risk && risk.isViolation) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    sendEvidence(text, risk);
    return false;
  }
}

// Fase de Captura Prioritaria
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    handleIntercept(e);
  }
}, true);

window.addEventListener("click", (e) => {
  const btn = e.target.closest('button[aria-label*="Enviar"], button[aria-label*="Send"], button.send-button, .send-button');
  if (btn) {
    handleIntercept(e);
  }
}, true);


