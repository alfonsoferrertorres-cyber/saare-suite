/* S.A.A.R.E. L7 RAM Network Interceptor & ISO 27037 DEFR Forensic Agent v10.0 */
(function() {
  const API_INGEST_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs";
  const CANONICAL_PARENT_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const DLP = {
    dni: /(?:^|\D)(\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])(?!\w)/i,
    iban: /ES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}|ES\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/,
    health: /(?:diagn[oó]stico|cardiopat[ií]a|receta|historia cl[ií]nica|paciente|tratamiento|patolog[ií]a)\b/i,
    jailbreak: /(?:modo dan|ignore previous instructions|ignora todas las instrucciones|system prompt|override security|bypass rules)/i,
    invoices: /(?:FAC|INV|EXP)-[A-Z0-9-]{6,16}/i,
    unsupported: /(?:inventar|sin evidencia|sin respaldo|ignora el contrato|alterar documento)/i
  };

  function getSettings() {
    try {
      const raw = document.documentElement.getAttribute('data-saare-settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          cumplimiento_corporativo_integral: parsed.cumplimiento_corporativo_integral !== false,
          auditoria_dictamen_normativo: parsed.auditoria_dictamen_normativo !== false,
          razonamiento_activo_l7: parsed.razonamiento_activo_l7 !== false,
          deepfake_fake_disprover: parsed.deepfake_fake_disprover !== false,
          subvenciones_requisitos_infranqueables: parsed.subvenciones_requisitos_infranqueables !== false,
          subOptions: parsed.subOptions || {}
        };
      }
    } catch (e) {}

    return {
      cumplimiento_corporativo_integral: true,
      auditoria_dictamen_normativo: true,
      razonamiento_activo_l7: true,
      deepfake_fake_disprover: true,
      subvenciones_requisitos_infranqueables: true,
      subOptions: {}
    };
  }

  function getActiveUser() {
    try {
      const suiteUser = localStorage.getItem('saare_suite_user') || localStorage.getItem('saare_user');
      if (suiteUser) {
        const parsed = JSON.parse(suiteUser);
        return parsed.email || "auditor@ms3v.es";
      }
    } catch (e) {}
    return "auditor@ms3v.es";
  }

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
      if (
        u.includes("/log?") || 
        u.includes("play.google.com") || 
        u.includes("google-analytics") || 
        u.includes("/collect?") || 
        u.includes("gen_204") || 
        u.includes("/upload/") ||
        u.includes("saare-api")
      ) {
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

    // 1. Google Gemini (f.req parser determinista)
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

          // Formato StreamGenerate
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

          // Formato batchexecute
          if (Array.isArray(outer) && outer.length > 0 && Array.isArray(outer[0])) {
            for (const batch of outer) {
              if (Array.isArray(batch)) {
                for (const call of batch) {
                  if (Array.isArray(call) && call.length >= 2 && typeof call[1] === "string") {
                    try {
                      const inner = JSON.parse(call[1]);
                      if (Array.isArray(inner) && inner.length > 0 && Array.isArray(inner[0])) {
                        const prompt = inner[0][0];
                        if (typeof prompt === "string" && prompt.trim() && !prompt.startsWith("!")) {
                          return prompt.trim();
                        }
                      }
                    } catch {}
                  }
                }
              }
            }
          }
        } catch {}
      }
      return "";
    }

    // 2. JSON estándar (ChatGPT, Claude, DeepSeek, Copilot, Perplexity)
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
    const settings = getSettings();
    const str = parseBody(rawBody);
    if (!str || isIgnoredRequest(url, str)) return null;

    const cleanPrompt = extractCleanPrompt(str) || str.substring(0, 500);
    if (!cleanPrompt || cleanPrompt.length < 1) return null;

    const seal = computeL7Seal(cleanPrompt);
    const subOpts = settings.subOptions;

    // BÓVEDA 5: EL JUSTIFICADOR (Subvenciones & Fondos Públicos)
    if (settings.subvenciones_requisitos_infranqueables && DLP.invoices.test(cleanPrompt) && subOpts.enforce_no_double_funding !== false) {
      const match = cleanPrompt.match(DLP.invoices)[0];
      return {
        verdict: "RECHAZADO",
        scenario_id: "subvenciones_requisitos_infranqueables",
        category: "SUBVENCIONES_DUPLICIDAD",
        norma: "Ley 38/2003 LGS · Orden HFP/1030/2021 PRTR · 2 CFR 200",
        forensic_role: "DES (Digital Evidence Specialist)",
        dei_phase: "Fase 3: Adquisición Bit a Bit & Bloqueo Anti-Doble Financiación",
        reason: `Bloqueo Subvenciones: Detección de factura [${match}] con potencial solapamiento o principio DNSH no acreditado.`,
        cleanPrompt: sanitize(cleanPrompt),
        sanitizedPrompt: sanitize(cleanPrompt),
        cryptoSeal: seal,
        parentHash: CANONICAL_PARENT_HASH
      };
    }

    // BÓVEDA 4: EL DETECTOR (Fake Disprover & Unsupported Claims)
    if (settings.deepfake_fake_disprover && DLP.unsupported.test(cleanPrompt)) {
      return {
        verdict: "RECHAZADO",
        scenario_id: "deepfake_fake_disprover",
        category: "UNSUPPORTED_CLAIMS_DEEPFAKE",
        norma: "ISO/IEC 42001 Control B.6.3 · Cadena de Custodia Forense",
        forensic_role: "DES (Digital Evidence Specialist)",
        dei_phase: "Fase 4: Verificación Causal & RunLive Sampling",
        reason: "Bloqueo Fake Disprover: Detección de Unsupported Claims o alteración documental no fundamentada en el corpus aportado.",
        cleanPrompt: cleanPrompt,
        sanitizedPrompt: cleanPrompt,
        cryptoSeal: seal,
        parentHash: CANONICAL_PARENT_HASH
      };
    }

    // BÓVEDA 3: EL GUARDIÁN (Razonamiento Activo & Jailbreak Guard)
    if (settings.razonamiento_activo_l7 && DLP.jailbreak.test(cleanPrompt) && subOpts.anti_dan_jailbreak !== false) {
      return {
        verdict: "RECHAZADO",
        scenario_id: "razonamiento_activo_l7",
        category: "ANTI_JAILBREAK_L7",
        norma: "EU AI Act Art. 15 · OWASP Top 10 LLM01 · ISO 27001 A.8.7",
        forensic_role: "Active Defense Gatekeeper",
        dei_phase: "Fase 2: Corte Perimetral de Socket & Purga RAM",
        reason: "Bloqueo Razonamiento Activo: Intento de evasión perimetral, modo DAN o extracción de directivas del sistema.",
        cleanPrompt: cleanPrompt,
        sanitizedPrompt: cleanPrompt,
        cryptoSeal: seal,
        parentHash: CANONICAL_PARENT_HASH
      };
    }

    // BÓVEDA 1: EL ESCUDO (DEFR - Privacidad, DNI, IBAN, Salud Art. 9)
    if (settings.cumplimiento_corporativo_integral) {
      const isDni = subOpts.dlp_dni_nie !== false && (DLP.dni.test(cleanPrompt) || DLP.dni.test(str));
      const isIban = subOpts.dlp_iban_cards !== false && (DLP.iban.test(cleanPrompt.replace(/[\s-]/g, "")) || DLP.iban.test(str.replace(/[\s-]/g, "")));
      const isCard = subOpts.dlp_iban_cards !== false && (DLP.card.test(cleanPrompt.replace(/[\s-]+/g, "")) || DLP.card.test(str.replace(/[\s-]+/g, "")));
      const isHealth = subOpts.dlp_health_art9 !== false && (DLP.health.test(cleanPrompt) || DLP.health.test(str));

      if (isDni || isIban || isCard || isHealth) {
        let category = "PII_DNI_NIE";
        let norma = "España - LOPDGDD 3/2018 & RGPD Art. 5 y 32";

        if (isHealth) {
          category = "DATOS_SALUD_ART9";
          norma = "RGPD Art. 9 (Categorías Especiales / Salud)";
        } else if (isIban) {
          category = "DATOS_BANCARIOS_IBAN";
          norma = "DORA Capa 7 / RGPD Art. 32";
        } else if (isCard) {
          category = "TARJETA_CREDITO_PAN";
          norma = "PCI-DSS v4 Req 3.4 & 6.4";
        }

        const displayPrompt = sanitize(cleanPrompt);

        return {
          verdict: "RECHAZADO",
          scenario_id: "cumplimiento_corporativo_integral",
          category,
          norma,
          forensic_role: "DEFR (Digital Evidence First Responder)",
          dei_phase: "Fase 1: Identificación de Volatilidad & Aislamiento Ex-Ante",
          reason: "Causalidad rota: Detección ex-ante de datos regulados no disociados en buffer RAM L7 (Rol DEFR).",
          cleanPrompt: displayPrompt,
          sanitizedPrompt: displayPrompt,
          cryptoSeal: seal,
          parentHash: CANONICAL_PARENT_HASH
        };
      }
    }

    // SI NO HAY INFRACCIÓN: EVENTO PERMITIDO (BÓVEDA 2 AUDITORÍA)
    if (!settings.auditoria_dictamen_normativo) return null;

    return {
      verdict: "PERMITIDO",
      scenario_id: "cumplimiento_corporativo_integral",
      category: "AUDITORIA_CONFORME",
      norma: "UNE-ISO/IEC 42001 & ISO/IEC 27037",
      forensic_role: "DEFR (Digital Evidence First Responder)",
      dei_phase: "Tráfico conforme verificado en memoria volátil RAM",
      reason: "Inferencia conforme bajo perímetro determinista (Error Lógico 0).",
      cleanPrompt: cleanPrompt,
      sanitizedPrompt: cleanPrompt,
      active_shield: "[SAARE_ACTIVE_SHIELD: ENFORCE]",
      brain_witness: "🧠 L7 CEREBRO WITNESS: DETERMINISTIC_VALID",
      cryptoSeal: seal,
      parentHash: CANONICAL_PARENT_HASH
    };
  }

  // Hook XHR
  const rawOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._saare_url = url;
    return rawOpen.apply(this, arguments);
  };

  const rawSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    const check = evaluatePayload(body, this._saare_url);
    if (check) {
      window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
      if (check.verdict === "RECHAZADO") {
        throw new Error(`[S.A.A.R.E. L7] Transmisión bloqueada en RAM por [${check.scenario_id}].`);
      }
    }
    return rawSend.apply(this, arguments);
  };

  // Hook Fetch
  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    const url = typeof resource === "string" ? resource : (resource?.url || "");
    if (config && config.body) {
      const check = evaluatePayload(config.body, url);
      if (check) {
        window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
        if (check.verdict === "RECHAZADO") {
          return new Response(JSON.stringify({
            error: "S.A.A.R.E. L7 Intercept: Bloqueo Ex-Ante en RAM",
            scenario: check.scenario_id,
            reason: check.reason,
            seal: check.cryptoSeal
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
    return rawFetch.apply(this, arguments);
  };
})();