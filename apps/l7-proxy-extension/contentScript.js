// S.A.A.R.E. Content Script — Interceptor de Interfaces Web de IA en RAM

(function () {
  console.log("[S.A.A.R.E. L7 Proxy] Agente de Inspección Activo.");

  // Interceptar pulsación de teclas (Enter sin Shift) en las cajas de texto de chatbots
  document.addEventListener("keydown", async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const inputEl = event.target;
      if (isAiInputField(inputEl)) {
        const rawPrompt = inputEl.value || inputEl.innerText || "";
        if (!rawPrompt.trim()) return;

        // Detener temporalmente el envío
        event.preventDefault();
        event.stopPropagation();

        console.log("[S.A.A.R.E. L7] Interceptando Prompt Ex-Ante...");

        try {
          const response = await chrome.runtime.sendMessage({
            action: "INSPECT_PROMPT_EX_ANTE",
            payload: rawPrompt
          });

          if (response.success && response.verdict) {
            const verdictData = response.verdict;

            if (verdictData.decision === "DENY" || verdictData.verdict === "RECHAZADO") {
              alert(`[S.A.A.R.E. SECURITY BLOCK]\nAcceso Bloqueado por Política Ex-Ante.\n\nEvidencia: ${verdictData.evidence_id}\nHash MS3V: ${verdictData.enforcement?.ms3vIntegrityHash || 'N/A'}`);
              return;
            }

            // Si es SANCP_SANITIZED o PERMITIDO, sustituir/permitir
            if (verdictData.enforcement?.sanitizedInRam) {
              const sanitized = verdictData.inference?.responseContent || rawPrompt;
              setInputValue(inputEl, sanitized);
            }

            // Re-disparar el envío original
            dispatchOriginalSubmit(inputEl);
          } else {
            console.warn("[S.A.A.R.E.] Fallo en inspección, aplicando política de contingencia.");
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

  function setInputValue(el, text) {
    if (el.tagName.toLowerCase() === "textarea") {
      el.value = text;
    } else if (el.isContentEditable) {
      el.innerText = text;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function dispatchOriginalSubmit(el) {
    const form = el.closest("form");
    if (form) {
      form.requestSubmit();
    }
  }
})();