/* S.A.A.R.E. L7 RAM Network Interceptor & Credential Attestation v8.2.0 */
(function() {
  const DLP = {
    dni: /(?:^|\D)(\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])(?!\w)/i,
    iban: /ES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}|ES\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/
  };

  function computeL7Seal(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return `L7-SEAL:${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
  }

  function isIgnoredRequest(url, bodyStr) {
    if (url) {
      const u = String(url).toLowerCase();
      if (u.includes("/log?") || u.includes("play.google.com") || u.includes("google-analytics") || u.includes("/collect?") || u.includes("gen_204") || u.includes("/upload/")) {
        return true;
      }
    }
    if (bodyStr) {
      if (bodyStr.startsWith("trace=Error:") || bodyStr.includes("at Object.") || bodyStr.includes("at https://")) {
        return true;
      }
    }
    return false;
  }

  function parseBody(body) {
    if (!body) return "";
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      try {
        const parts = [];
        body.forEach((val, key) => { parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`); });
        return parts.join("&");
      } catch { return ""; }
    }
    if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
      return body.toString();
    }
    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
      try { return new TextDecoder("utf-8").decode(body); } catch { return ""; }
    }
    if (typeof body === "string") {
      return body;
    }
    try { return JSON.stringify(body); } catch { return String(body); }
  }

  function extractCleanPrompt(rawText) {
    if (!rawText) return "";

    // 1. Google Gemini (f.req)
    if (rawText.includes("f.req")) {
      let fReqValue = "";
      try {
        const params = new URLSearchParams(rawText);
        fReqValue = params.get("f.req") || "";
      } catch {}

      if (!fReqValue) {
        const match = rawText.match(/(?:^|&)f\.req=([^&]+)/);
        if (match) {
          try { fReqValue = decodeURIComponent(match[1].replace(/\+/g, " ")); } catch { fReqValue = match[1]; }
        }
      }

      if (fReqValue) {
        try {
          const outer = JSON.parse(fReqValue);
          if (Array.isArray(outer) && outer.length >= 2 && typeof outer[1] === "string") {
            try {
              const inner = JSON.parse(outer[1]);
              if (Array.isArray(inner) && inner.length > 0 && Array.isArray(inner[0])) {
                const prompt = inner[0][0];
                if (typeof prompt === "string" && prompt.trim() && !prompt.startsWith("!")) {
                  return prompt.trim();
                }
              }
            } catch {}
          }
        } catch {}
      }
      return "";
    }

    // 2. JSON Estándar (ChatGPT, Claude, DeepSeek, etc.)
    try {
      const json = JSON.parse(rawText);
      if (json.messages && Array.isArray(json.messages)) {
        const lastMsg = json.messages[json.messages.length - 1];
        if (lastMsg?.content?.parts) return lastMsg.content.parts.join(" ");
        if (typeof lastMsg?.content === "string") return lastMsg.content;
      }
      if (json.prompt) return json.prompt;
      if (json.input) return json.input;
    } catch {}

    return "";
  }

  function sanitize(text) {
    if (!text) return "";
    return text
      .replace(/(?:^|\D)(\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])(?!\w)/gi, (match, dni) => {
        const last = dni.slice(-4);
        return match.replace(dni, `[DNI_REDACTED_***${last}]`);
      })
      .replace(/ES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}|ES\d{18,22}/gi, (match) => {
        const last = match.slice(-4);
        return `[IBAN_REDACTED_***${last}]`;
      })
      .replace(/(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/g, (match) => {
        const last = match.slice(-4);
        return `[CARD_REDACTED_***${last}]`;
      });
  }

  function evaluatePayload(rawBody, url) {
    const str = parseBody(rawBody);
    if (!str || isIgnoredRequest(url, str)) return null;

    const cleanPrompt = extractCleanPrompt(str);
    if (!cleanPrompt || cleanPrompt.length < 1) return null;

    const isDni = DLP.dni.test(cleanPrompt) || DLP.dni.test(str);
    const isIban = DLP.iban.test(cleanPrompt.replace(/[\s-]/g, "")) || DLP.iban.test(str.replace(/[\s-]/g, ""));
    const isCard = DLP.card.test(cleanPrompt.replace(/[\s-]+/g, "")) || DLP.card.test(str.replace(/[\s-]+/g, ""));

    if (isDni || isIban || isCard) {
      let category = "PII_DNI";
      let norma = "España - LOPDGDD & AEPD";

      if (isIban) {
        category = "DATOS_BANCARIOS";
        norma = "RGPD Art. 5, 32 / LOPDGDD";
      } else if (isCard) {
        category = "TARJETA_CREDITO";
        norma = "PCI-DSS / RGPD";
      }

      const displayPrompt = sanitize(cleanPrompt);

      return {
        verdict: "RECHAZADO",
        category,
        norma,
        reason: "Detección de datos regulados en memoria RAM L7",
        cleanPrompt: displayPrompt,
        sanitizedPrompt: displayPrompt,
        cryptoSeal: computeL7Seal(cleanPrompt)
      };
    }

    return {
      verdict: "PERMITIDO",
      category: "AUDITORIA_CONFORME",
      norma: "ISO/IEC 42001 & EU AI Act",
      reason: "Tráfico conforme verificado en memoria",
      cleanPrompt: cleanPrompt,
      sanitizedPrompt: cleanPrompt,
      cryptoSeal: computeL7Seal(cleanPrompt)
    };
  }

  // Intercepción XHR
  const rawOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._saare_url = url;
    return rawOpen.apply(this, arguments);
  };

  const rawSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    const check = evaluatePayload(body, this._saare_url);
    if (check) {
      if (check.verdict === "RECHAZADO") {
        window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
        throw new Error("[S.A.A.R.E. L7] Transmisión bloqueada en RAM.");
      } else if (check.verdict === "PERMITIDO") {
        window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
      }
    }
    return rawSend.apply(this, arguments);
  };

  // Intercepción Fetch
  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    const url = typeof resource === "string" ? resource : (resource?.url || "");
    if (config && config.body) {
      const check = evaluatePayload(config.body, url);
      if (check) {
        if (check.verdict === "RECHAZADO") {
          window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
          return new Response(JSON.stringify({ error: "S.A.A.R.E. Intercept: Bloqueado en RAM" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        } else if (check.verdict === "PERMITIDO") {
          window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
        }
      }
    }
    return rawFetch.apply(this, arguments);
  };
})();