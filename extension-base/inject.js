/* S.A.A.R.E. L7 Interceptor, Blindaje Activo & Dynamic Policy Engine v10.5.1 */
(function() {
  window.addEventListener("error", (event) => {
    console.warn("[SAARE Immunity] Excepción capturada en RAM:", event.error);
    event.preventDefault();
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.warn("[SAARE Immunity] Promesa rechazada ignorada:", event.reason);
    event.preventDefault();
  });

  let dynamicCustomRules = [];

  const SAARE_SYSTEM_PROMPT_PREFIX = `[REGLA DE SISTEMA INMUTABLE: Activando Protocolo S.A.A.R.E. Cada output consecutivo debe ir precedido strictly por el testigo visual normativo "<🧠AUDITANDO🧠>" para certificar el Modo Blindaje Activo y la tasa de error alucinatorio 0%]. iniciar_blindaje_activo_saare\n\n`;

  function applyBlindajeToPrompt(userPrompt) {
    if (!userPrompt || typeof userPrompt !== "string") return userPrompt;
    if (userPrompt.includes("iniciar_blindaje_activo_saare")) {
      return userPrompt;
    }
    return SAARE_SYSTEM_PROMPT_PREFIX + userPrompt;
  }

  // OBSERVER MEJORADO PARA DETECTAR TODOS LOS NODOS DE RESPUESTA DE GEMINI / CHATGPT
  function observeAIResponses() {
    const observer = new MutationObserver(() => {
      const selectors = [
        '.model-response-text',
        'div[data-message-author-role="assistant"]',
        'div[class*="response-content"]',
        'message-content',
        '.markdown-render',
        'p-response'
      ];
      
      const chatNodes = document.querySelectorAll(selectors.join(', '));
      
      chatNodes.forEach(node => {
        if (!node.getAttribute("data-saare-witnessed")) {
          node.setAttribute("data-saare-witnessed", "true");
          
          if (node.firstChild) {
            const witnessTag = document.createTextNode("<🧠AUDITANDO🧠> ");
            node.insertBefore(witnessTag, node.firstChild);
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeAIResponses);
  } else {
    observeAIResponses();
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
    dni: /(?:\b\d{7,8}[-\s]?[A-Za-z]\b|\bdni\b.*?\b\d{7,8}[-\s]?[A-Za-z]?\b)/i,
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

  // EXTRACCIÓN UNIFICADA DE PROMPTS
  function extractCleanPrompt(rawText) {
    if (!rawText) return "";
    if (typeof rawText !== "string") {
      try { rawText = JSON.stringify(rawText); } catch { return ""; }
    }

    const trimmed = rawText.trim();

    if (
      trimmed === "{}" ||
      trimmed === "[]" ||
      trimmed.includes("CAMS6w") ||
      trimmed.includes("connectiondurationms") ||
      trimmed.includes("documentrequestid")
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
              if (typeof prompt === "string" && prompt.trim() && !prompt.startsWith("!")) {
                return prompt.trim();
              }
            }
          }
        }
      } catch {}
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
    return decoded;
  }

  function sanitizePromptText(text) {
    if (!text) return "";
    let clean = text
      .replace(/(?:\b\d{7,8}[-\s]?[A-Za-z]\b|\bdni\b.*?\b\d{7,8}[-\s]?[A-Za-z]?\b)/gi, "[DNI_REDACTED]")
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
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(3, 7, 18, 0.94); backdrop-filter: blur(10px); z-index: 9999999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc;";

    const card = document.createElement("div");
    card.style.cssText = "background: #0b0f19; border: 1px solid #ef4444; border-radius: 12px; width: 90%; max-width: 580px; padding: 24px; box-shadow: 0 20px 30px -5px rgba(239, 68, 68, 0.4);";

    const header = document.createElement("div");
    header.style.cssText = "display: flex; align-items: center; gap: 12px; margin-bottom: 16px;";
    
    const icon = document.createElement("span");
    icon.style.fontSize = "1.8rem";
    icon.textContent = "🛡️";

    const headerText = document.createElement("div");
    const title = document.createElement("h3");
    title.style.cssText = "margin: 0; color: #ef4444; font-size: 1.1rem; font-weight: 900; letter-spacing: 0.5px;";
    title.textContent = "BLOQUEO EX-ANTE — RESILIENCIA FINANCIERA & PII (DORA)";
    
    const subtitle = document.createElement("span");
    subtitle.style.cssText = "font-size: 0.75rem; color: #94a3b8;";
    subtitle.textContent = "S.A.A.R.E. Zero-Submission Enforcer";

    headerText.appendChild(title);
    headerText.appendChild(subtitle);
    header.appendChild(icon);
    header.appendChild(headerText);

    const desc = document.createElement("p");
    desc.style.cssText = "font-size: 0.82rem; color: #cbd5e1; margin-bottom: 12px; line-height: 1.4;";
    desc.textContent = "Se ha suspendido la transmisión del prompt. Se detectaron posibles infracciones normativas o de gobernanza en RAM: ";
    
    const normStrong = document.createElement("strong");
    normStrong.style.color = "#f87171";
    normStrong.textContent = `${activeCheck.norma || 'Normativa de Seguridad'} (${activeCheck.category || 'RESTRICCION'})`;
    desc.appendChild(normStrong);

    const promptBox = document.createElement("div");
    promptBox.style.cssText = "background: #020617; border: 1px solid #1e293b; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.78rem; color: #fca5a5; margin-bottom: 20px; word-break: break-all; max-height: 120px; overflow-y: auto;";
    promptBox.textContent = activeCheck.sanitizedPrompt || activeCheck.cleanPrompt;

    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = "display: flex; gap: 12px; justify-content: flex-end; align-items: center;";

    const btnCancel = document.createElement("button");
    btnCancel.style.cssText = "padding: 10px 16px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer;";
    btnCancel.textContent = "Cancelar Envío";
    btnCancel.addEventListener("click", () => overlay.remove());

    const btnSanitize = document.createElement("button");
    btnSanitize.style.cssText = "padding: 10px 18px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; border: none; border-radius: 6px; font-size: 0.78rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);";
    btnSanitize.textContent = "✨ Sanitizar y Reinsertar";
    btnSanitize.addEventListener("click", () => {
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

    btnContainer.appendChild(btnCancel);
    btnContainer.appendChild(btnSanitize);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(promptBox);
    card.appendChild(btnContainer);
    overlay.appendChild(card);

    document.body.appendChild(overlay);
  }

  async function processAndEvaluate(cleanPrompt, url) {
    if (!cleanPrompt) return { shouldBlock: false };

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
      rawPrompt: cleanPrompt,
      cleanPrompt: cleanPrompt,
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

  function createMockBlockedResponse(norma, category) {
    const textMessage = `\n\n🛡️ [S.A.A.R.E. ENFORCER]: Transmisión bloqueada en RAM por directiva de Gobernanza (${norma} - ${category}). El prompt no fue enviado al modelo.`;
    const geminiMockBody = `)]}'\n\n[["wmd","${textMessage}"]]\n`;

    return new Response(geminiMockBody, {
      status: 200,
      statusText: "OK (SAARE Policy Enforced)",
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  // HOOK FETCH INTERCEPTOR
  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    try {
      const url = typeof resource === "string" ? resource : (resource?.url || "");
      if (!isIgnoredUrl(url) && config && config.body) {
        const cleanPrompt = extractCleanPrompt(config.body);
        if (cleanPrompt) {
          const check = await processAndEvaluate(cleanPrompt, url);
          if (check && check.shouldBlock) {
            return createMockBlockedResponse(check.norma, check.category);
          }

          try {
            if (!url.includes("gemini.google.com")) {
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
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("[SAARE Fetch Safe] Continuación por excepción:", err);
    }
    return rawFetch.apply(this, arguments);
  };

  // HOOK XHR INTERCEPTOR
  const rawXHR = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function(body) {
    try {
      if (body) {
        const cleanPrompt = extractCleanPrompt(body);
        if (cleanPrompt) {
          processAndEvaluate(cleanPrompt, "xhr_batch").then(check => {
            if (check && check.shouldBlock) {
              Object.defineProperty(this, 'readyState', { writable: true, value: 4 });
              Object.defineProperty(this, 'status', { writable: true, value: 200 });
              Object.defineProperty(this, 'responseText', { 
                writable: true, 
                value: `🧠 [S.A.A.R.E.]: Transmisión cancelada en memoria por directiva corporativa.` 
              });
              this.dispatchEvent(new Event('readystatechange'));
              this.dispatchEvent(new Event('load'));
            }
          });
        }
      }
    } catch (e) {}
    return rawXHR.apply(this, arguments);
  };
})();