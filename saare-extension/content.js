// S.A.A.R.E. L7 UNIVERSAL COMPLIANCE ENGINE v4.4.1
console.log("%c[SAARE L7 Engine] Agente Perimetral Activo en LLM", "color: #06b6d4; font-weight: bold;");

let dynamicCustomRules = [];

function syncRules() {
  chrome.runtime.sendMessage({ type: "SAARE_GET_RULES" }, (res) => {
    if (res && res.ok && Array.isArray(res.data)) {
      dynamicCustomRules = res.data;
    }
  });
}
syncRules();
setInterval(syncRules, 60000); // Polling controlado cada 60s

function getGeminiInputData() {
  const el = document.querySelector('rich-textarea div[contenteditable="true"], .ql-editor, div[contenteditable="true"], textarea, rich-textarea p, #prompt-textarea');
  const text = el ? (el.innerText || el.textContent || el.value || "").trim() : "";
  return { text, el };
}

function evaluateComplianceRisks(text) {
  if (!text || text.trim() === "") return { isViolation: false };
  const clean = text.trim();

  // 1. Reglas personalizadas
  for (const rule of dynamicCustomRules) {
    try {
      if (clean.toLowerCase().includes(rule.pattern.toLowerCase())) {
        return { isViolation: true, category: "REGLA_PERSONALIZADA", reason: `Coincidencia: "${rule.label || rule.pattern}"`, norma: "Política Corporativa" };
      }
    } catch(e) {}
  }

  // 2. Detección PII (DNI, NIE, Tarjetas, IBAN)
  const dniNieRegex = /\b(?:\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])\b/i;
  const creditCardRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/;
  const ibanRegex = /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{20,22}\b/i;

  if (dniNieRegex.test(clean) || creditCardRegex.test(clean) || ibanRegex.test(clean)) {
    return {
      isViolation: true,
      category: "PRIVACIDAD_LOPD_AEPD",
      reason: "Detección de DNI/NIE, Tarjeta o Cuenta Bancaria",
      norma: "RGPD Arts. 5, 25, 32 / LOPDGDD"
    };
  }

  // 3. Evasión Perimetral / Jailbreak
  const jailbreakRegex = /\b(dan mode|jailbreak|bypass|ignora (?:todas )?las instrucciones|desactiva los filtros|sin restricciones|system override)\b/i;
  if (jailbreakRegex.test(clean)) {
    return {
      isViolation: true,
      category: "SEGURIDAD_AI_ACT",
      reason: "Intento de Evasión Perimetral (Jailbreak)",
      norma: "AI Act Arts. 5 y 15"
    };
  }

  return { isViolation: false };
}

function purgeDomElement(el) {
  if (!el) return;
  el.innerText = "";
  el.textContent = "";
  if (el.value !== undefined) el.value = "";
  el.innerHTML = "";
  el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
}

function showModal(evId, text, violationInfo) {
  const old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style.cssText = "position:fixed; bottom:20px; right:20px; width:460px; background:#0f172a; color:#ffffff; padding:18px; border-radius:8px; border:2px solid #ef4444; box-shadow:0 12px 28px rgba(0,0,0,0.85); z-index:2147483647; font-family:system-ui,-apple-system,sans-serif;";

  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:900; font-size:0.85rem; color:#ef4444; letter-spacing:0.5px;">🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR (L7)</span>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px; text-transform:uppercase;">BLOQUEADO (ZERO-SUBMISSION)</span>
    </div>
    <p style="font-size:0.82rem; margin:0 0 8px 0; color:#cbd5e1; line-height:1.4;">
      <strong>Normativa:</strong> <span style="color:#f87171;">${violationInfo?.norma || "RGPD / AI Act"}</span><br>
      <strong>Causa:</strong> ${violationInfo?.reason || "Carga de riesgo"}
    </p>
    <div style="background:#1e293b; border-left:3px solid #ef4444; padding:8px 10px; border-radius:4px; font-size:0.8rem; color:#93c5fd; margin-bottom:10px; word-break:break-all;">
      Carga Neutralizada: "${text}"
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:#94a3b8; border-top:1px solid #334155; padding-top:8px;">
      <span>ID Evidencia: <strong style="color:#f59e0b;">${evId}</strong></span>
      <button id="saare-close-modal" style="background:#334155; border:none; color:#f8fafc; padding:3px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">Cerrar</button>
    </div>
  `;

  document.body.appendChild(banner);
  banner.querySelector("#saare-close-modal").onclick = (e) => {
    e.stopPropagation();
    banner.remove();
  };
  setTimeout(() => { if (document.body.contains(banner)) banner.remove(); }, 8000);
}

function handleIntercept(e) {
  if (e.target.closest && e.target.closest("#saare-block-modal")) return;

  const { text, el } = getGeminiInputData();
  if (text.length > 0) {
    const risk = evaluateComplianceRisks(text);
    if (risk.isViolation) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      purgeDomElement(el);

      const evId = "EV-" + Math.floor(100000 + Math.random() * 900000);
      const payload = {
        evidenceId: evId,
        promptInput: text.trim(),
        user: "alfonsosb1@gmail.com",
        timestamp: new Date().toISOString(),
        verdict: "RECHAZADO",
        action: "REDACTED (RAM)",
        status: "RECHAZADO",
        origin: window.location.hostname,
        violationDetails: risk
      };

      chrome.runtime.sendMessage({ type: "SAARE_LOG_EVENT", payload });
      showModal(evId, text, risk);
    }
  }
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) handleIntercept(e);
}, true);

window.addEventListener("click", (e) => {
  if (e.target.closest && e.target.closest('button, [role="button"], mat-icon-button, .send-button')) handleIntercept(e);
}, true);