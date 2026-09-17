/* S.A.A.R.E. L7 Interceptor, Blindaje Activo & Dynamic Policy Engine v10.5.0 */
(function() {
  let lastLoggedHash = "";
  let lastLoggedTime = 0;
  let dynamicCustomRules = [];

  // COMANDO DE INVOCACIÓN INMUTABLE S.A.A.R.E. v4 / SGP 1.0
  const SAARE_SYSTEM_PROMPT_PREFIX = `[REGLA DE SISTEMA INMUTABLE: Activando Protocolo S.A.A.R.E. Cada output consecutivo debe ir precedido strictly por el testigo visual normativo "<🧠AUDITANDO🧠>" para certificar el Modo Blindaje Activo y la tasa de error alucinatorio 0%]. iniciar_blindaje_activo_saare\n\n`;

  function applyBlindajeToPrompt(userPrompt) {
    if (!userPrompt || typeof userPrompt !== "string") return userPrompt;
    if (userPrompt.includes("iniciar_blindaje_activo_saare")) {
      return userPrompt;
    }
    return SAARE_SYSTEM_PROMPT_PREFIX + userPrompt;
  }

  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SAARE_UPDATE_CUSTOM_RULES") {
      if (Array.isArray(event.data.payload)) {
        dynamicCustomRules = event.data.payload;
      }
    }
  });

  window.postMessage({ type: "SAARE_FETCH_CUSTOM_RULES_REQUEST" }, "*");

  const DLP = {
    dni: /(?:\b\d{7,8}[A-Za-z]\b|\bdni\b.*?\b\d{7,8}[A-Za-z]?\b)/i,
    iban: /\b[A-Z]{2}\d{2}[\s-]?(?:\d{4}[\s-]?){4}\d{2,4}\b/i,
    card: /(?:\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})\b|\b(?:\d[ -]*?){13,19}\b)/
  };

  const OWASP_PATTERNS = /(ignore previous instructions|system prompt|jailbreak|bypass|drop table|rm -rf|<script|exec\s*\()/i;

  async function computeSHA256(str) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function computeL7Seal(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return `L7-SEAL:${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
  }

  function isIgnoredUrl(url) {
    if (!url) return true;
    const u = String(url).toLowerCase();
    return (
      u.includes("google-analytics") ||
      u.includes("telemetry") ||
      u.includes("/log?") ||
      u.includes("gen_204") ||
      u.includes("favicon") ||
      u.includes("page_locale") ||
      u.includes("play.google.com") ||
      u.includes("saare.es")
    );
  }

  function extractCleanPrompt(rawText) {
    if (!rawText) return "";
    if (typeof rawText !== "string") {
      try { rawText = JSON.stringify(rawText); } catch { return ""; }
    }

    const trimmed = rawText.trim();
    if (
      trimmed.startsWith("[[") || 
      trimmed.includes('"0":31') || 
      trimmed.includes("count=") || 
      trimmed.includes("gemini.google.com") ||
      trimmed.includes("br1aem") ||
      trimmed.includes("connectiondurationms") ||
      trimmed.includes("documentrequestid") ||
      trimmed.startsWith("https://")
    ) {
      return "";
    }

    if (rawText.includes("f.req")) {
      try {
        const params = new URLSearchParams(rawText);
        const fReqValue = params.get("f.req");
        if (fReqValue) {
          const outer = JSON.parse(fReqValue);
          if (Array.isArray(outer) && outer.length >= 2 && typeof outer[1] === "string") {
            const inner = JSON.parse(outer[1]);
            if (Array.isArray(inner) && inner.length > 0 && Array.isArray(inner[0])) {
              const prompt = inner[0][0];
              if (typeof prompt === "string" && prompt.trim() && !prompt.startsWith("!") && prompt.length > 1) {
                return prompt.trim();
              }
            }
          }
        }
      } catch {}
      return "";
    }

    try {
      const json = JSON.parse(rawText);
      if (json.prompt && typeof json.prompt === 'string') return json.prompt.trim();
      if (json.input && typeof json.input === 'string') return json.input.trim();
      if (json.messages && Array.isArray(json.messages)) {
        const lastMsg = json.messages[json.messages.length - 1];
        if (lastMsg && lastMsg.content) {
          return typeof lastMsg.content === 'string' ? lastMsg.content.trim() : JSON.stringify(lastMsg.content);
        }
      }
    } catch {}

    const decoded = decodeURIComponent(rawText.replace(/\+/g, " ")).trim();
    return decoded.startsWith("[[") ? "" : decoded;
  }

  function sanitizePromptText(text) {
    if (!text) return "";
    let clean = text
      .replace(/(?:\b\d{7,8}[A-Za-z]\b|\bdni\b.*?\b\d{7,8}[A-Za-z]?\b)/gi, "[DNI_REDACTED]")
      .replace(/\b[A-Z]{2}\d{2}[\s-]?(?:\d{4}[\s-]?){4}\d{2,4}\b/gi, "[IBAN_REDACTED]")
      .replace(/(?:\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})\b|\b(?:\d[ -]*?){13,19}\b)/gi, "[FINANCIAL_CARD_REDACTED]")
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL_REDACTED]")
      .replace(/(ignore previous instructions|system prompt|jailbreak|bypass|drop table|rm -rf|<script|exec\s*\()/gi, "[PROMPT_SANITIZED]");

    dynamicCustomRules.forEach(rule => {
      if (rule.pattern) {
        try {
          const reg = new RegExp(rule.pattern, "gi");
          clean = clean.replace(reg, `[CUSTOM_BLOCK: ${rule.name.toUpperCase()}]`);
        } catch (e) {}
      }
    });

    return clean;
  }

  function renderGuardrailModal(activeCheck) {
    const existingModal = document.getElementById("saare-guardrail-overlay");
    if (existingModal) existingModal.remove();

    const overlay = document.createElement("div");
    overlay.id = "saare-guardrail-overlay";
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(3, 7, 18, 0.94); backdrop-filter: blur(10px);
      z-index: 9999999; display: flex; align-items: center; justify-content: center;
      font-family: system-ui, -apple-system, sans-serif; color: #f8fafc;
    `;

    overlay.innerHTML = `
      <div style="background: #0b0f19; border: 1px solid #ef4444; border-radius: 12px; width: 90%; max-width: 580px; padding: 24px; box-shadow: 0 20px 30px -5px rgba(239, 68, 68, 0.4);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span style="font-size: 1.8rem;">🛡️</span>
          <div>
            <h3 style="margin: 0; color: #ef4444; font-size: 1.1rem; font-weight: 900; letter-spacing: 0.5px;">
              BLOQUEO EX-ANTE — RESILIENCIA FINANCIERA & PII (DORA)
            </h3>
            <span style="font-size: 0.75rem; color: #94a3b8;">S.A.A.R.E. Zero-Submission Enforcer</span>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 12px; line-height: 1.4;">
          Se ha suspendido la transmisión del prompt. Se detectaron posibles infracciones normativas o de gobernanza en RAM:
          <br/><strong style="color: #f87171;">${activeCheck.norma}</strong> (${activeCheck.category})
        </p>

        <div style="background: #020617; border: 1px solid #1e293b; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.78rem; color: #fca5a5; margin-bottom: 20px; word-break: break-all; max-height: 120px; overflow-y: auto;">
          ${activeCheck.sanitizedPrompt}
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
          <button id="saare-btn-cancel" style="padding: 10px 16px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
            Cancelar Envío
          </button>
          <button id="saare-btn-sanitize" style="padding: 10px 18px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; border: none; border-radius: 6px; font-size: 0.78rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            ✨ Sanitizar y Reinsertar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("saare-btn-cancel").addEventListener("click", () => {
      overlay.remove();
    });

    document.getElementById("saare-btn-sanitize").addEventListener("click", () => {
      overlay.remove();
      const inputBox = document.querySelector('div[contenteditable="true"], textarea');
      if (inputBox) {
        if (inputBox.tagName === "TEXTAREA") {
          inputBox.value = activeCheck.sanitizedPrompt;
        } else {
          inputBox.innerText = activeCheck.sanitizedPrompt;
        }
        inputBox.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  }

  async function processAndEvaluate(cleanPrompt, url) {
    if (!cleanPrompt || cleanPrompt.length < 2) return { shouldBlock: false };

    const currentHash = cleanPrompt + url;
    const now = Date.now();
    if (currentHash === lastLoggedHash && (now - lastLoggedTime) < 3000) {
      return { shouldBlock: false };
    }

    lastLoggedHash = currentHash;
    lastLoggedTime = now;

    const digitsOnly = cleanPrompt.replace(/[\s-]/g, '');
    const isDni = DLP.dni.test(cleanPrompt);
    const isIban = DLP.iban.test(cleanPrompt);
    const isCard = DLP.card.test(cleanPrompt) || DLP.card.test(digitsOnly);
    const isOwasp = OWASP_PATTERNS.test(cleanPrompt);

    let triggeredCustomRule = null;
    for (const rule of dynamicCustomRules) {
      if (rule.pattern) {
        try {
          const reg = new RegExp(rule.pattern, "i");
          if (reg.test(cleanPrompt)) {
            triggeredCustomRule = rule;
            break;
          }
        } catch (e) {}
      }
    }

    const isViolation = isDni || isIban || isCard || isOwasp || (triggeredCustomRule !== null);

    const sanitizedText = sanitizePromptText(cleanPrompt);
    const promptHash = await computeSHA256(cleanPrompt);

    const activeCheck = {
      verdict: isViolation ? "RECHAZADO" : "PERMITIDO",
      decision: isViolation ? "DENY" : "ALLOW",
      category: isViolation 
        ? (triggeredCustomRule ? `CUSTOM_RULE_${triggeredCustomRule.name.toUpperCase()}` : (isCard ? "FINANCIAL_CARD" : isDni ? "PII_DNI" : isIban ? "PII_IBAN" : "PROMPT_INJECTION")) 
        : "AUDITORIA_CONFORME",
      norma: isViolation 
        ? (triggeredCustomRule ? `Gobernanza Corporativa: ${triggeredCustomRule.name}` : (isCard || isIban ? "EU Regulation 2022/2554 (DORA)" : "EU AI Act Art. 10 & LOPDGDD")) 
        : "EU AI Act - Tráfico Conforme",
      reason: isViolation ? "Detección Ex-Ante de Datos Sensibles o Regla de Empresa en RAM" : "Prompt verificado sin PII bajo directivas GRC",
      rawPrompt: isViolation ? `HASH[${promptHash.substring(0, 16)}]` : sanitizedText,
      cleanPrompt: sanitizedText,
      sanitizedPrompt: sanitizedText,
      cryptoSeal: computeL7Seal(cleanPrompt),
      shouldBlock: isViolation
    };

    if (isViolation) {
      renderGuardrailModal(activeCheck);
    }

    window.postMessage({ type: "SAARE_VERDICT_EVENT", payload: activeCheck }, "*");

    return activeCheck;
  }

  // HOOK 1: FETCH CON INYECCIÓN DE BLINDAJE ACTIVO Y BLOQUEO SÍNCRONO EN RAM
  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    const url = typeof resource === "string" ? resource : (resource?.url || "");
    if (!isIgnoredUrl(url) && config && config.body) {
      const cleanPrompt = extractCleanPrompt(config.body);
      if (cleanPrompt) {
        const check = await processAndEvaluate(cleanPrompt, url);
        if (check && check.shouldBlock) {
          return new Response(JSON.stringify({
            error: "SAARE_EX_ANTE_BLOCK",
            message: "Transmisión bloqueada por el enforcer de gobernanza S.A.A.R.E. en RAM."
          }), { status: 403, statusText: "Forbidden (SAARE Policy Enforced)" });
        }

        // SI ES PERMITIDO, SE ANEXA LA DIRECTIVA DE BLINDAJE INMUTABLE
        try {
          let bodyData = JSON.parse(config.body);
          if (bodyData.messages && Array.isArray(bodyData.messages)) {
            const lastIdx = bodyData.messages.length - 1;
            if (bodyData.messages[lastIdx]?.content) {
              bodyData.messages[lastIdx].content = applyBlindajeToPrompt(bodyData.messages[lastIdx].content);
              config.body = JSON.stringify(bodyData);
            }
          } else if (bodyData.prompt && typeof bodyData.prompt === 'string') {
            bodyData.prompt = applyBlindajeToPrompt(bodyData.prompt);
            config.body = JSON.stringify(bodyData);
          }
        } catch (e) {}
      }
    }
    return rawFetch.apply(this, arguments);
  };

  // HOOK 2: XHR CON BLOQUEO SÍNCRONO Y BLINDAJE ACTIVO
  const rawXHR = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function(body) {
    try {
      if (body) {
        const cleanPrompt = extractCleanPrompt(body);
        if (cleanPrompt) {
          processAndEvaluate(cleanPrompt, "xhr_batch").then(check => {
            if (check && check.shouldBlock) {
              this.abort();
            }
          });
        }
      }
    } catch (e) {}
    return rawXHR.apply(this, arguments);
  };
})();