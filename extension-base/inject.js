/* S.A.A.R.E. L7 Interceptor & PII Guard v8.8.0 */
(function() {
  const DLP = {
    dni: /(?:\b\d{7,8}[A-Za-z]\b|\bdni\b.*?\b\d{7,8}[A-Za-z]?\b)/i,
    iban: /ES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}|ES\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/i
  };

  function computeL7Seal(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return `L7-SEAL:${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
  }

  function showSaareBanner(check, onSanitizeAndContinue, onBlock) {
    try {
      let existing = document.getElementById('saare-violation-banner');
      if (existing) existing.remove();

      const banner = document.createElement('div');
      banner.id = 'saare-violation-banner';
      banner.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 999999; width: 410px;
        background: #0b0f19; border: 2px solid #ef4444; border-radius: 10px; padding: 16px;
        color: #f8fafc; font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(239, 68, 68, 0.4);
      `;

      banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🛡️</span>
            <span style="font-weight: 900; font-size: 11.5px; color: #ef4444; letter-spacing: 0.5px;">S.A.A.R.E. SENSOR L7 · BLOQUEO EX-ANTE</span>
          </div>
          <button id="saare-close-banner" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; font-weight: bold;">✕</button>
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">NORMATIVA: <strong style="color: #38bdf8;">${check.norma}</strong></div>
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">DICTAMEN: <strong style="color: #ef4444;">${check.verdict} (${check.category})</strong></div>
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 8px; font-family: monospace; font-size: 11px; color: #34d399; margin-bottom: 10px; word-break: break-all; max-height: 90px; overflow-y: auto;">
          ${check.cleanPrompt}
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <button id="saare-btn-sanitize" style="flex: 1; background: #059669; color: #fff; border: none; border-radius: 6px; padding: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">✨ Sanitizar y Continuar</button>
          <button id="saare-btn-block" style="background: #334155; color: #f8fafc; border: none; border-radius: 6px; padding: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">Bloquear</button>
        </div>
      `;

      document.body.appendChild(banner);

      document.getElementById('saare-close-banner').onclick = () => { banner.remove(); if (onBlock) onBlock(); };
      document.getElementById('saare-btn-block').onclick = () => { banner.remove(); if (onBlock) onBlock(); };
      document.getElementById('saare-btn-sanitize').onclick = () => { banner.remove(); if (onSanitizeAndContinue) onSanitizeAndContinue(); };
    } catch (e) {
      if (onBlock) onBlock();
    }
  }

  function extractCleanPrompt(rawText) {
    if (!rawText) return "";
    if (rawText.includes("f.req")) {
      try {
        const params = new URLSearchParams(rawText);
        const fReqValue = params.get("f.req");
        if (fReqValue) {
          const outer = JSON.parse(fReqValue);
          if (Array.isArray(outer) && outer.length >= 2 && typeof outer[1] === "string") {
            const inner = JSON.parse(outer[1]);
            if (Array.isArray(inner) && inner[0] && inner[0][0]) {
              return String(inner[0][0]).trim();
            }
          }
        }
      } catch {}
    }
    try {
      const json = JSON.parse(rawText);
      if (json.prompt) return json.prompt;
      if (json.input) return json.input;
    } catch {}
    return decodeURIComponent(rawText.replace(/\+/g, " "));
  }

  function sanitizeText(text) {
    if (!text) return "";
    return text.replace(/\b\d{7,8}[A-Za-z]?\b/gi, (m) => `[DNI_REDACTED_***${m.slice(-4)}]`);
  }

  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    const url = typeof resource === "string" ? resource : (resource?.url || "");

    if (url.includes("google-analytics") || url.includes("telemetry") || url.includes("/batchedit")) {
      return rawFetch.apply(this, arguments);
    }

    let activeCheck = null;

    if (config && config.body) {
      const cleanPrompt = extractCleanPrompt(config.body);
      if (cleanPrompt && cleanPrompt.length > 2) {
        const isDni = DLP.dni.test(cleanPrompt);
        const isIban = DLP.iban.test(cleanPrompt);
        const isCard = DLP.card.test(cleanPrompt);

        if (isDni || isIban || isCard) {
          activeCheck = {
            verdict: "RECHAZADO",
            decision: "DENY",
            category: isDni ? "PII_DNI" : (isIban ? "DATOS_BANCARIOS" : "TARJETA_CREDITO"),
            norma: "EU AI Act Art. 10 & LOPDGDD",
            reason: "Detección Ex-Ante de Datos Sensibles (PII) en RAM",
            rawPrompt: cleanPrompt,
            cleanPrompt: sanitizeText(cleanPrompt),
            cryptoSeal: computeL7Seal(cleanPrompt),
            shouldBlock: true
          };

          return new Promise((resolve) => {
            showSaareBanner(
              activeCheck,
              async () => {
                if (typeof config.body === "string") {
                  config.body = config.body.replace(activeCheck.rawPrompt, activeCheck.cleanPrompt);
                }
                const res = await rawFetch.apply(this, [resource, config]);
                captureResponse(res.clone(), activeCheck);
                resolve(res);
              },
              () => {
                window.postMessage({ type: "SAARE_EVENT", data: activeCheck }, "*");
                resolve(new Response(JSON.stringify({
                  error: "SAARE_GRC_BLOCK",
                  message: "Transmisión abortada por normativa LOPDGDD / EU AI Act."
                }), { status: 403, headers: { "Content-Type": "application/json" } }));
              }
            );
          });
        } else {
          activeCheck = {
            verdict: "PERMITIDO",
            decision: "ALLOW",
            category: "AUDITORIA_CONFORME",
            norma: "EU AI Act - Tráfico Conforme",
            reason: "Prompt verificado sin PII en RAM",
            rawPrompt: cleanPrompt,
            cleanPrompt: cleanPrompt,
            cryptoSeal: computeL7Seal(cleanPrompt),
            shouldBlock: false
          };
        }
      }
    }

    const originalResponse = await rawFetch.apply(this, arguments);
    if (activeCheck) {
      captureResponse(originalResponse.clone(), activeCheck);
    }
    return originalResponse;
  };

  async function captureResponse(responseClone, checkData) {
    try {
      const text = await responseClone.text();
      checkData.responseOutput = text.slice(0, 300); // Primeros 300 caracteres de la respuesta capturada
      window.postMessage({ type: "SAARE_EVENT", data: checkData }, "*");
    } catch (e) {
      window.postMessage({ type: "SAARE_EVENT", data: checkData }, "*");
    }
  }
})();