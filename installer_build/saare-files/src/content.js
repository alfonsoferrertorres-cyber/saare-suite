// SAARE L7 UNIVERSAL COMPLIANCE & DYNAMIC RULES ENGINE
console.log("[SAARE L7 Engine] Interceptor Dual Activo (Normativa Base + Reglas Personalizadas)");

let dynamicCustomRules = [];

function syncCustomRules() {
  fetch("https://saare-api.alfonsoferrertorres.workers.dev/api/v1/custom-rules")
    .then(r => r.json())
    .then(data => { if (Array.isArray(data)) dynamicCustomRules = data; })
    .catch(() => {});
}
syncCustomRules();
setInterval(syncCustomRules, 3000);

function getGeminiInputData() {
  const el = document.querySelector('rich-textarea div[contenteditable="true"], .ql-editor, div[contenteditable="true"], textarea, rich-textarea p, p');
  const text = el ? (el.innerText || el.textContent || el.value || "").trim() : "";

  const attachmentChips = document.querySelectorAll('file-chip, .file-chip, [aria-label*="sentencia"], [aria-label*="PDF"], .attachment-container');
  let attachmentNames = [];
  attachmentChips.forEach(chip => {
    const name = (chip.innerText || chip.textContent || chip.getAttribute('aria-label') || "").trim();
    if (name) attachmentNames.push(name);
  });

  return { text, attachments: attachmentNames, el };
}

function evaluateComplianceRisks(text) {
  if (!text || text.trim() === "") return { isViolation: false, category: null, reason: null, norma: null };
  const cleanText = text.trim();

  // 1. Reglas Personalizadas Dinámicas
  for (const rule of dynamicCustomRules) {
    try {
      const isRegex = rule.pattern.startsWith("/") && rule.pattern.lastIndexOf("/") > 0;
      let matched = false;
      if (isRegex) {
        const lastSlash = rule.pattern.lastIndexOf("/");
        const regexBody = rule.pattern.substring(1, lastSlash);
        const regexFlags = rule.pattern.substring(lastSlash + 1) || "i";
        matched = new RegExp(regexBody, regexFlags).test(cleanText);
      } else {
        matched = cleanText.toLowerCase().includes(rule.pattern.toLowerCase());
      }

      if (matched) {
        return {
          isViolation: true,
          category: "REGLA_PERSONALIZADA",
          reason: `Coincidencia con regla personalizada: "${rule.label || rule.pattern}"`,
          norma: "Política Corporativa Interna"
        };
      }
    } catch (e) {
      if (cleanText.toLowerCase().includes(rule.pattern.toLowerCase())) {
        return {
          isViolation: true,
          category: "REGLA_PERSONALIZADA",
          reason: `Coincidencia con regla personalizada: "${rule.label || rule.pattern}"`,
          norma: "Política Corporativa Interna"
        };
      }
    }
  }

  // 2. Normativa Base: Privacidad RGPD / LOPDGDD
  const dniNieRegex = /\b(?:\d{7,8}[A-HJ-NP-TV-Z]?|[XYZ]\d{7}[A-HJ-NP-TV-Z]?)\b/i;
  const creditCardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{16}\b/;
  const ibanRegex = /\b[A-Z]{2}\d{2}[ ]?(?:\d{4}[ ]?){4,6}\d{1,4}\b/i;
  const nssRegex = /\b\d{2}[\/\s-]?\d{8}[\/\s-]?\d{2}\b/;
  const piiKeywords = /\b(dni|nie|nif|cif|pasaporte|nómina|nomina|sueldo|salario|retención|finiquito|historial clínico|diagnóstico|tarjeta|cvv|cuenta bancaria|password)\b/i;

  if (dniNieRegex.test(cleanText) || creditCardRegex.test(cleanText) || ibanRegex.test(cleanText) || nssRegex.test(cleanText) || piiKeywords.test(cleanText)) {
    return {
      isViolation: true,
      category: "PRIVACIDAD_LOPD_AEPD",
      reason: "Detección de Identificadores (DNI/NIE/NIF) o Datos Sensibles no disociados (RGPD Art. 5/25, LOPDGDD)",
      norma: "RGPD Arts. 5, 25, 32 / LOPDGDD"
    };
  }

  // 3. Normativa Base: AI Act & OWASP
  const jailbreakRegex = /\b(dan mode|jailbreak|bypass|ignora (?:todas )?las instrucciones|desactiva los filtros|sin restricciones|do anything now|simula que no tienes reglas|pretend you have no rules|system override)\b/i;
  const prohibitedAiActRegex = /\b(reconocimiento de emociones|inferir orientaci[oó]n sexual|social scoring|puntuaci[oó]n social de empleados|perfilado biom[eé]trico no consentido|manipulaci[oó]n subliminal)\b/i;

  if (jailbreakRegex.test(cleanText) || prohibitedAiActRegex.test(cleanText)) {
    return {
      isViolation: true,
      category: "SEGURIDAD_AI_ACT_ART5_ART15",
      reason: "Intento de Evasión Perimetral / Práctica Prohibida por el Reglamento Europeo de IA (Art. 5/15)",
      norma: "AI Act Arts. 5 y 15 / OWASP LLM01"
    };
  }

  return { isViolation: false, category: null, reason: null, norma: null };
}

function purgeDomElement(el) {
  if (!el) return;
  el.innerText = "";
  el.textContent = "";
  if (el.value !== undefined) el.value = "";
  el.innerHTML = "";
  el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true, cancelable: true }));
}

function sendEvidence(text, attachments, violationInfo = null) {
  let summary = text;
  if (!summary && attachments && attachments.length > 0) {
    summary = "[DOCUMENTO/ADJUNTO: " + attachments.join(", ") + "]";
  } else if (summary && attachments && attachments.length > 0) {
    summary = summary + " [Adjuntos: " + attachments.join(", ") + "]";
  }

  if (!summary || summary.trim() === "") return;

  const isBlocked = !!violationInfo?.isViolation;
  const payload = {
    promptInput: summary.trim(),
    user: "alfonsosb1@gmail.com",
    timestamp: new Date().toISOString(),
    verdict: isBlocked ? "RECHAZADO" : "PERMITIDO",
    violationDetails: violationInfo
  };

  fetch("https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (data.verdict === "RECHAZADO" || isBlocked) {
      showModal(data.runId || data.evidence?.evidenceId, summary, violationInfo || { norma: "Política de Seguridad", reason: "Directiva Activa" });
    }
  })
  .catch(err => console.error("[SAARE Error Vault Connection]:", err));
}

function showModal(evId, text, violationInfo) {
  let old = document.getElementById("saare-block-modal");
  if (old) old.remove();

  const banner = document.createElement("div");
  banner.id = "saare-block-modal";
  banner.style = "position:fixed; bottom:20px; right:20px; width:480px; background:#0f172a; color:#ffffff; padding:18px; border-radius:8px; border:2px solid #ef4444; box-shadow:0 12px 28px rgba(0,0,0,0.6); z-index:999999; font-family:system-ui,-apple-system,sans-serif;";
  
  const normTitle = violationInfo?.norma || "RGPD / EU AI Act";
  const reasonText = violationInfo?.reason || "Carga de riesgo detectada";

  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:900; font-size:0.85rem; color:#ef4444; letter-spacing:0.5px;">🛡️ S.A.A.R.E. RUNTIME INTERCEPTOR (L7)</span>
      <span style="background:#dc2626; color:#fff; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px; text-transform:uppercase;">BLOQUEADO (ZERO-SUBMISSION)</span>
    </div>
    <p style="font-size:0.82rem; margin:0 0 8px 0; color:#cbd5e1; line-height:1.4;">
      <strong>Normativa / Política:</strong> <span style="color:#f87171;">${normTitle}</span><br>
      <strong>Causa:</strong> ${reasonText}
    </p>
    <div style="background:#1e293b; border-left:3px solid #ef4444; padding:8px 10px; border-radius:4px; font-size:0.8rem; color:#93c5fd; margin-bottom:10px; word-break:break-all;">
      Carga Neutralizada: "${text}"
    </div>
    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#94a3b8; border-top:1px solid #334155; padding-top:8px;">
      <span>ID Evidencia: <strong style="color:#f59e0b;">${evId || 'EV-REGULATORY'}</strong></span>
      <span>Auditor: <strong style="color:#ffffff;">alfonsosb1@gmail.com</strong></span>
    </div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => { if (banner) banner.remove(); }, 7000);
}

function handleIntercept(e) {
  const { text, attachments, el } = getGeminiInputData();
  if (text.length > 0 || attachments.length > 0) {
    const risk = evaluateComplianceRisks(text);
    if (risk.isViolation) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      purgeDomElement(el);
      sendEvidence(text, attachments, risk);
    } else {
      sendEvidence(text, attachments, null);
    }
  }
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) handleIntercept(e);
}, true);

window.addEventListener("click", (e) => {
  const btn = e.target.closest('button[aria-label*="Enviar"], button[aria-label*="Send"], button.send-button, .send-button-container button, mat-icon[data-mat-icon-name="send"], button:has(svg), .send-button');
  if (btn) handleIntercept(e);
}, true);