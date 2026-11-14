// S.A.A.R.E. Content Script — Interceptor Universal Resiliente (SGP 1.0 Production)

(function () {
  console.log("[S.A.A.R.E. L7 Proxy] Agente de Inspección Resiliente Activo.");

  let isProcessing = false;
  let bypassNextEnter = false;

  function isExtensionContextValid() {
    try {
      return typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  async function handleKeyDown(event) {
    if (bypassNextEnter) {
      bypassNextEnter = false;
      return;
    }

    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    if (isProcessing) return;

    const inputEl = event.target;
    if (!isAiInputField(inputEl)) return;

    const rawPrompt = getInputValue(inputEl);
    if (!rawPrompt || !rawPrompt.trim()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    isProcessing = true;
    console.log("[S.A.A.R.E. L7] Interceptando Prompt Ex-Ante...");

    try {
      if (!isExtensionContextValid()) {
        console.warn("[S.A.A.R.E.] Contexto de extensión invalidado. Passthrough activado.");
        bypassAndSubmit(inputEl);
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: "INSPECT_PROMPT_EX_ANTE",
        payload: rawPrompt,
        origin: window.location.hostname
      });

      if (response && response.success && response.verdict) {
        const verdictData = response.verdict;

        if (
          verdictData.decision === "DENY" ||
          verdictData.verdict === "RECHAZADO" ||
          verdictData.verdict === "FAIL_CLOSED_BLOCKED"
        ) {
          alert(
            `[S.A.A.R.E. SECURITY BLOCK]\nAcceso Bloqueado por Política Ex-Ante L7.\n\nEvidencia: ${
              verdictData.evidence_id || verdictData.trace_id || verdictData.id || "N/A"
            }\nDetalle: ${verdictData.error || verdictData.reason || verdictData.category || "Infracción de Política"}`
          );
          isProcessing = false;
          return;
        }

        const sanitizedPrompt =
          verdictData.sanitizedPrompt ||
          verdictData.sanitized_payload ||
          verdictData.enforcement?.sanitizedPrompt;

        const isAuditStamp = sanitizedPrompt && (
          sanitizedPrompt.includes("[S.A.A.R.E.") ||
          sanitizedPrompt.includes("MS3V BLOCK LOGIC")
        );

        if (
          sanitizedPrompt &&
          typeof sanitizedPrompt === "string" &&
          sanitizedPrompt !== rawPrompt &&
          !isAuditStamp
        ) {
          setInputValue(inputEl, sanitizedPrompt);
        }

        setTimeout(() => {
          bypassAndSubmit(inputEl);
        }, 50);

      } else {
        const shouldBlock = response?.failClosed !== false;
        if (shouldBlock) {
          alert("[S.A.A.R.E. FAIL-CLOSED]\nBloqueado por seguridad: el Control Plane L7 no devolvió un veredicto válido.");
          isProcessing = false;
          return;
        }
        console.warn("[S.A.A.R.E.] Sin respuesta válida del Service Worker. Fail-Open activado.");
        bypassAndSubmit(inputEl);
      }
    } catch (err) {
      console.error("[S.A.A.R.E. Proxy Error]:", err);
      isProcessing = false;
      alert("[S.A.A.R.E. FAIL-CLOSED]\nBloqueado por error de comunicación con el agente de gobernanza L7.");
    }
  }

  function bypassAndSubmit(el) {
    isProcessing = false;
    dispatchOriginalSubmit(el);
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
      'button[aria-label*="Send"], button[aria-label*="Enviar"], button[data-testid="send-button"], button[type="submit"], div[role="button"][aria-label*="Send"]'
    );

    if (sendButton && !sendButton.hasAttribute("disabled")) {
      sendButton.click();
      return;
    }

    bypassNextEnter = true;
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

    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
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