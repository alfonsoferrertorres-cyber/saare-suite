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

            // Normalización multi-clave para sustitución del prompt sanitizado
            const sanitizedPrompt = verdictData.sanitizedPrompt 
              || verdictData.sanitized_payload 
              || verdictData.inference?.responseContent 
              || verdictData.enforcement?.sanitizedPrompt;

            if (sanitizedPrompt && sanitizedPrompt !== rawPrompt) {
              setInputValue(inputEl, sanitizedPrompt);
            }

            setTimeout(() => {
              dispatchOriginalSubmit(inputEl);
            }, 50);

          } else {
            console.warn("[S.A.A.R.E.] Fallo en respuesta de inspección:", response?.error || "Sin respuesta válida del Service Worker", "-> Aplicando contingencia pass-through.");
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
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (el.isContentEditable) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function dispatchOriginalSubmit(el) {
    const container = el.closest("form") || el.closest("div[class*='relative']") || document;
    const sendButton = container.querySelector(
      'button[aria-label*="Send"], button[aria-label*="Enviar"], button[data-testid="send-button"], button[type="submit"], div[role="button"][aria-label*="Send"]'
    );
    
    if (sendButton) {
      sendButton.removeAttribute("disabled");
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
})();