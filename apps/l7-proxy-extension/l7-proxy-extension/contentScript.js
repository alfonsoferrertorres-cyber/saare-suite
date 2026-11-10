// S.A.A.R.E. Content Script — Interceptor Universal de Interfaces Web de IA en RAM (SGP 1.0)

(function () {
  console.log("[S.A.A.R.E. L7 Proxy] Agente de Inspección Activo.");

  document.addEventListener("keydown", async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const inputEl = event.target;
      if (isAiInputField(inputEl)) {
        const rawPrompt = getInputValue(inputEl);
        if (!rawPrompt || !rawPrompt.trim()) return;

        event.preventDefault();
        event.stopPropagation();

        console.log("[S.A.A.R.E. L7] Interceptando Prompt Ex-Ante...");

        try {
          const response = await chrome.runtime.sendMessage({
            action: "INSPECT_PROMPT_EX_ANTE",
            payload: rawPrompt
          });

          if (response && response.success && response.verdict) {
            const verdictData = response.verdict;

            // Bloqueo explícito Ex-Ante (DENY / RECHAZADO)
            if (verdictData.decision === "DENY" || verdictData.verdict === "RECHAZADO" || verdictData.verdict === "FAIL_CLOSED_BLOCKED") {
              alert(`[S.A.A.R.E. SECURITY BLOCK]\nAcceso Bloqueado por Política Ex-Ante L7.\n\nEvidencia: ${verdictData.evidence_id || verdictData.id || 'N/A'}\nDetalle: ${verdictData.error || verdictData.category || 'Infracción de Política'}`);
              return;
            }

            // Normalización multi-clave para la sustitución de prompt sanitizado
            const sanitizedPrompt = verdictData.sanitizedPrompt 
              || verdictData.sanitized_payload 
              || verdictData.inference?.responseContent 
              || verdictData.enforcement?.sanitizedPrompt;

            if (sanitizedPrompt && sanitizedPrompt !== rawPrompt) {
              setInputValue(inputEl, sanitizedPrompt);
            }

            dispatchOriginalSubmit(inputEl);
          } else {
            console.warn("[S.A.A.R.E.] Fallo en respuesta de inspección, aplicando contingencia.");
            dispatchOriginalSubmit(inputEl);
          }
        } catch (err) {
          console.error("[S.A.A.R.E. Proxy Error]:", err);
          dispatchOriginalSubmit(inputEl);
        }
      }
    }
  }, true);

  function isAiInputField(el) {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === "textarea" || el.isContentEditable || el.getAttribute("role") === "textbox";
  }

  function getInputValue(el) {
    if (el.tagName.toLowerCase() === "textarea" || el.tagName.toLowerCase() === "input") {
      return el.value;
    }
    return el.innerText || el.textContent || "";
  }

  function setInputValue(el, text) {
    if (el.tagName.toLowerCase() === "textarea" || el.tagName.toLowerCase() === "input") {
      el.value = text;
    } else if (el.isContentEditable) {
      el.innerText = text;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function dispatchOriginalSubmit(el) {
    const form = el.closest("form");
    if (form && typeof form.requestSubmit === "function") {
      try {
        form.requestSubmit();
        return;
      } catch (e) {}
    }

    const container = el.closest("fieldset") || el.closest("form") || el.parentElement?.parentElement || document;
    const sendButton = container.querySelector('button[aria-label*="Send"], button[aria-label*="Enviar"], button[data-testid="send-button"], button[type="submit"]');
    
    if (sendButton && !sendButton.disabled) {
      sendButton.click();
    }
  }
})();