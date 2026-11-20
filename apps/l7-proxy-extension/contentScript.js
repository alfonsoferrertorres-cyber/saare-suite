// S.A.A.R.E. Content Script — Interceptor Universal Resiliente (SGP 1.0 Production + ISO 42001 Alarms)

(function () {
  console.log("[S.A.A.R.E. L7 Proxy] Agente de Inspección Resiliente Activo.");

  let isProcessing = false;
  let bypassNextAction = false;
  let lastSubmittedSignature = "";
  let lastSubmittedAt = 0;

  function isExtensionContextValid() {
    try {
      return typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  function extractSanitizedPrompt(verdictData, rawPrompt) {
    const candidate =
      verdictData?.sanitizedPrompt ||
      verdictData?.sanitized_payload ||
      verdictData?.detox?.sanitizedPayload ||
      verdictData?.enforcement?.sanitizedPrompt;

    if (!candidate || typeof candidate !== "string" || candidate === rawPrompt) {
      return null;
    }

    const isAuditStamp =
      candidate.includes("[S.A.A.R.E.") ||
      candidate.includes("MS3V BLOCK LOGIC");

    return isAuditStamp ? null : candidate;
  }

  function formatAlarmSummary(verdictData) {
    const alarm = verdictData?.alarm || {};
    const rules = Array.isArray(alarm.rulesTriggered) && alarm.rulesTriggered.length > 0
      ? alarm.rulesTriggered.join(", ")
      : (Array.isArray(verdictData?.detox?.rulesTriggered) ? verdictData.detox.rulesTriggered.join(", ") : "POLÍTICA L7");

    const controls = Array.isArray(alarm.iso42001_controls) && alarm.iso42001_controls.length > 0
      ? alarm.iso42001_controls.join(", ")
      : "A.5.4 / A.6.2 / A.7.4";

    const severity = alarm.severity || "HIGH";
    const evidenceId = verdictData?.evidence_id || verdictData?.trace_id || verdictData?.id || "N/A";
    const detail = verdictData?.error || verdictData?.reason || verdictData?.category || "Infracción de Política ISO 42001";

    return { alarm, rules, controls, severity, evidenceId, detail };
  }

  async function inspectWithControlPlane(rawPrompt, userAction = "DEFAULT_POLICY") {
    return await chrome.runtime.sendMessage({
      action: "INSPECT_PROMPT_EX_ANTE",
      payload: rawPrompt,
      userAction,
      origin: window.location.hostname
    });
  }

  function findActiveAiInput(referenceEl) {
    if (referenceEl && isAiInputField(referenceEl)) return referenceEl;
    const active = document.activeElement;
    if (active && isAiInputField(active)) return active;

    const selectors = [
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea#prompt-textarea',
      'textarea'
    ];
    for (const sel of selectors) {
      const candidates = Array.from(document.querySelectorAll(sel));
      const withText = candidates.find(el => getInputValue(el).trim().length > 0);
      if (withText) return withText;
      if (candidates.length > 0) return candidates[candidates.length - 1];
    }
    return null;
  }

  function isSendButtonTarget(target) {
    if (!target || typeof target.closest !== "function") return false;
    const btn = target.closest(
      'button[aria-label*="Send"], button[aria-label*="Enviar"], button[data-testid="send-button"], button[type="submit"], div[role="button"][aria-label*="Send"], div[role="button"][aria-label*="Enviar"], button.send-button'
    );
    if (!btn) return false;
    if (btn.hasAttribute("disabled") || btn.getAttribute("aria-disabled") === "true") {
      return false;
    }
    return true;
  }

  async function evaluateAndProcess(event, inputEl) {
    const rawPrompt = getInputValue(inputEl);
    const trimmedPrompt = rawPrompt ? rawPrompt.trim() : "";
    if (!trimmedPrompt) return;

    const now = Date.now();
    if (trimmedPrompt === lastSubmittedSignature && (now - lastSubmittedAt) < 2500) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (isProcessing) return;
    isProcessing = true;
    console.log("[S.A.A.R.E. L7] Interceptando Prompt Ex-Ante...");

    try {
      if (!isExtensionContextValid()) {
        console.warn("[S.A.A.R.E.] Contexto de extensión invalidado. Passthrough activado.");
        markAndSubmit(inputEl, trimmedPrompt);
        return;
      }

      let response = await inspectWithControlPlane(rawPrompt, "DEFAULT_POLICY");

      if (response && response.success && response.verdict) {
        let verdictData = response.verdict;
        let sanitizedPrompt = extractSanitizedPrompt(verdictData, rawPrompt);

        const isBlocked =
          verdictData.decision === "DENY" ||
          verdictData.verdict === "RECHAZADO" ||
          verdictData.verdict === "FAIL_CLOSED_BLOCKED";

        if (isBlocked) {
          const { alarm, rules, controls, severity, evidenceId, detail } = formatAlarmSummary(verdictData);
          const canSanitizeAndSend =
            Boolean(alarm?.requiresUserDecision) &&
            Array.isArray(alarm?.allowedActions) &&
            alarm.allowedActions.includes("SANITIZE_AND_SEND") &&
            Boolean(sanitizedPrompt);

          if (canSanitizeAndSend) {
            const preview = sanitizedPrompt.slice(0, 220) + (sanitizedPrompt.length > 220 ? "..." : "");
            const confirmed = window.confirm(
              `[ALARMA S.A.A.R.E. · ISO/IEC 42001 (${severity})]\n` +
              `Controles: ${controls}\n` +
              `Reglas detectadas: ${rules}\n` +
              `Evidencia: ${evidenceId}\n\n` +
              `Texto sanitizado propuesto:\n"${preview}"\n\n` +
              `¿Deseas enviar el texto ya sanitizado? (Cancelar bloquea el envío)`
            );

            if (!confirmed) {
              return;
            }

            const retryResponse = await inspectWithControlPlane(rawPrompt, "SANITIZE_AND_SEND");
            if (!retryResponse || !retryResponse.success || !retryResponse.verdict || retryResponse.verdict.decision === "DENY") {
              alert("[S.A.A.R.E. SECURITY BLOCK]\nEl envío sanitizado no fue autorizado por el Control Plane.");
              return;
            }

            verdictData = retryResponse.verdict;
            sanitizedPrompt = extractSanitizedPrompt(verdictData, rawPrompt) || sanitizedPrompt;
          } else {
            alert(
              `[ALARMA CRÍTICA S.A.A.R.E. · ISO/IEC 42001 (${severity})]\n` +
              `Acceso Bloqueado por Política Ex-Ante L7.\n\n` +
              `Controles: ${controls}\n` +
              `Reglas: ${rules}\n` +
              `Evidencia: ${evidenceId}\n` +
              `Detalle: ${detail}`
            );
            return;
          }
        }

        const finalText = (sanitizedPrompt && typeof sanitizedPrompt === "string" && sanitizedPrompt !== rawPrompt)
          ? sanitizedPrompt
          : rawPrompt;

        if (finalText !== rawPrompt) {
          setInputValue(inputEl, finalText);
        }

        const sigToMark = finalText.trim() || trimmedPrompt;
        setTimeout(() => {
          markAndSubmit(inputEl, sigToMark);
        }, 60);

      } else {
        const shouldBlock = response?.failClosed !== false;
        if (shouldBlock) {
          alert("[S.A.A.R.E. FAIL-CLOSED]\nBloqueado por seguridad: el Control Plane L7 no devolvió un veredicto válido.");
          return;
        }
        console.warn("[S.A.A.R.E.] Sin respuesta válida del Service Worker. Fail-Open activado.");
        markAndSubmit(inputEl, trimmedPrompt);
      }
    } catch (err) {
      console.error("[S.A.A.R.E. Proxy Error]:", err);
      alert("[S.A.A.R.E. FAIL-CLOSED]\nBloqueado por error de comunicación con el agente de gobernanza L7.");
    } finally {
      isProcessing = false;
    }
  }

  function markAndSubmit(el, signature) {
    lastSubmittedSignature = signature;
    lastSubmittedAt = Date.now();
    bypassNextAction = true;
    dispatchOriginalSubmit(el);
    setTimeout(() => {
      bypassNextAction = false;
    }, 300);
  }

  async function handleKeyDown(event) {
    if (bypassNextAction) {
      return;
    }

    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;

    const inputEl = event.target;
    if (!isAiInputField(inputEl)) return;

    await evaluateAndProcess(event, inputEl);
  }

  async function handleClick(event) {
    if (bypassNextAction) {
      return;
    }

    if (!isSendButtonTarget(event.target)) return;

    const inputEl = findActiveAiInput(null);
    if (!inputEl) return;

    await evaluateAndProcess(event, inputEl);
  }

  function isAiInputField(el) {
    if (!el || typeof el.getAttribute !== "function") return false;
    const tag = el.tagName.toLowerCase();
    return (
      tag === "textarea" ||
      tag === "input" ||
      el.isContentEditable ||
      el.getAttribute("role") === "textbox"
    );
  }

  function getInputValue(el) {
    const tag = el.tagName.toLowerCase();
    if (tag === "textarea" || tag === "input") {
      return el.value;
    }
    return el.innerText || el.textContent || "";
  }

  function setInputValue(el, text) {
    const tag = el.tagName.toLowerCase();
    if (tag === "textarea" || tag === "input") {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }

      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (el.isContentEditable) {
      el.focus();
      document.execCommand("selectAll", false, null);
      document.execCommand("insertText", false, text);
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function dispatchOriginalSubmit(el) {
    const container = el.closest("form") || el.closest("div[class*='relative']") || document;
    const sendButton = container.querySelector(
      'button[aria-label*="Send"], button[aria-label*="Enviar"], button[data-testid="send-button"], button[type="submit"], div[role="button"][aria-label*="Send"], div[role="button"][aria-label*="Enviar"]'
    );

    if (sendButton && !sendButton.hasAttribute("disabled") && sendButton.getAttribute("aria-disabled") !== "true") {
      sendButton.click();
      return;
    }

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    });
    el.dispatchEvent(enterEvent);
  }

  function attachListeners() {
    window.removeEventListener("keydown", handleKeyDown, true);
    document.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("click", handleClick, true);
    document.removeEventListener("click", handleClick, true);

    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("click", handleClick, true);
    document.addEventListener("click", handleClick, true);
  }

  attachListeners();

  const observer = new MutationObserver(() => {
    if (!window.__saare_active) {
      window.__saare_active = true;
      attachListeners();
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener("error", () => {
    if (isProcessing) isProcessing = false;
  });
})();