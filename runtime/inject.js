/* SAARE L7 Execution Authorization & Network Interceptor (SGP 1.0) */
(function() {
  const CANONICAL_PARENT_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const DLP = {
    dni: /(?:^|\D)(\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])(?!\w)/i,
    iban: /ES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}|ES\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/,
    health: /(?:diagn[oó]stico|cardiopat[ií]a|receta|historia cl[ií]nica|paciente|tratamiento|patolog[ií]a)\b/i,
    jailbreak: /(?:modo dan|ignore previous instructions|ignora todas las instrucciones|system prompt|override security|bypass rules)/i,
    voice_clone: /(?:clonar voz|clonaci[oó]n de voz|avatar sint[eé]tico|suplantar identidad|deepfake voz|audio sint[eé]tico sin consentimiento)/i,
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
    } catch {}

    return {
      cumplimiento_corporativo_integral: true,
      auditoria_dictamen_normativo: true,
      razonamiento_activo_l7: true,
      deepfake_fake_disprover: true,
      subvenciones_requisitos_infranqueables: true,
      subOptions: {}
    };
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

  // Motor Determinista de Autorización (SAARE Judge)
  function evaluatePayload(rawBody, url) {
    const settings = getSettings();
    const str = parseBody(rawBody);
    if (!str || isIgnoredRequest(url, str)) return null;

    const cleanPrompt = extractCleanPrompt(str) || str.substring(0, 500);
    if (!cleanPrompt || cleanPrompt.length < 1) return null;

    const seal = computeL7Seal(cleanPrompt);
    const subOpts = settings.subOptions;
    const timestampIso = new Date().toISOString();
    const runRandomId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 01. CAPA: SUBVENCIONES Y FONDOS PÚBLICOS
    if (settings.subvenciones_requisitos_infranqueables && DLP.invoices.test(cleanPrompt) && subOpts.enforce_no_double_funding !== false) {
      const match = cleanPrompt.match(DLP.invoices)[0];
      return {
        verdict_schema: "SGP_1.0",
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy_id: "POL-GRANTS-DNSH-05",
        policy_version: "2.1.0",
        risk_level: "HIGH",
        rules_matched: ["RULE_NO_DOUBLE_FUNDING_INVOICE"],
        reason: `Bloqueo Subvenciones: Detección de factura [${match}] con potencial solapamiento o principio DNSH no justificado.`,
        cleanPrompt: sanitize(cleanPrompt),
        sanitizedPrompt: sanitize(cleanPrompt),
        evidence_id: `EV-GRANT-${runRandomId}`,
        cryptoSeal: seal,
        parentHash: CANONICAL_PARENT_HASH,
        timestamp: timestampIso
      };
    }

    // 02. CAPA: PROTECCIÓN DEL HONOR & DEEPFAKES (LO 1/1982)
    if (settings.deepfake_fake_disprover && (DLP.voice_clone.test(cleanPrompt) || DLP.unsupported.test(cleanPrompt))) {
      return {
        verdict_schema: "SGP_1.0",
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy_id: "POL-HONOR-SYNTHETIC-03",
        policy_version: "2.0.0",
        risk_level: "CRITICAL",
        rules_matched: ["RULE_SYNTHETIC_IDENTITY_NO_CONSENT", "RULE_NO_UNSUPPORTED_CLAIMS"],
        reason: "Bloqueo Ley Orgánica 1/1982: Detección de intento de clonación sintética de voz/imagen sin acreditación de consentimiento expreso.",
        cleanPrompt: cleanPrompt,
        sanitizedPrompt: cleanPrompt,
        evidence_id: `EV-HONOR-${runRandomId}`,
        cryptoSeal: seal,
        parentHash: CANONICAL_PARENT_HASH,
        timestamp: timestampIso
      };
    }

    // 03. CAPA: ROBUSTEZ L7 & ANTI-JAILBREAK (AI ACT ART. 15)
    if (settings.razonamiento_activo_l7 && DLP.jailbreak.test(cleanPrompt) && subOpts.anti_dan_jailbreak !== false) {
      return {
        verdict_schema: "SGP_1.0",
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy_id: "POL-AI-ACT-ROBUSTNESS-15",
        policy_version: "3.4.0",
        risk_level: "HIGH",
        rules_matched: ["RULE_PROMPT_INJECTION_MITIGATION", "RULE_ACTIVE_SHIELD_ENFORCE"],
        reason: "Bloqueo Seguridad L7: Intento de Jailbreak o manipulación perimetral neutralizado conforme al Art. 15 del EU AI Act.",
        cleanPrompt: cleanPrompt,
        sanitizedPrompt: cleanPrompt,
        evidence_id: `EV-SEC-${runRandomId}`,
        cryptoSeal: seal,
        parentHash: CANONICAL_PARENT_HASH,
        timestamp: timestampIso
      };
    }

    // 04. CAPA: PRIVACIDAD, PII & SECRETO EMPRESARIAL (RGPD ART. 9)
    if (settings.cumplimiento_corporativo_integral) {
      const isDni = subOpts.dlp_dni_nie !== false && (DLP.dni.test(cleanPrompt) || DLP.dni.test(str));
      const isIban = subOpts.dlp_iban_cards !== false && (DLP.iban.test(cleanPrompt.replace(/[\s-]/g, "")) || DLP.iban.test(str.replace(/[\s-]/g, "")));
      const isCard = subOpts.dlp_iban_cards !== false && (DLP.card.test(cleanPrompt.replace(/[\s-]+/g, "")) || DLP.card.test(str.replace(/[\s-]+/g, "")));
      const isHealth = subOpts.dlp_health_art9 !== false && (DLP.health.test(cleanPrompt) || DLP.health.test(str));

      if (isDni || isIban || isCard || isHealth) {
        let policyId = "POL-RGPD-PII-01";
        let rules = ["RULE_PII_DNI_DETECTED"];
        let riskLevel = "HIGH";

        if (isHealth) {
          policyId = "POL-RGPD-HEALTH-ART9";
          rules = ["RULE_SPECIAL_CATEGORY_HEALTH_DATA"];
        } else if (isIban) {
          policyId = "POL-DORA-FIN-IBAN";
          rules = ["RULE_FINANCIAL_DATA_PROTECTION"];
        } else if (isCard) {
          policyId = "POL-PCI-DSS-PAN";
          rules = ["RULE_PAYMENT_CARD_DETECTED"];
          riskLevel = "CRITICAL";
        }

        const displayPrompt = sanitize(cleanPrompt);

        return {
          verdict_schema: "SGP_1.0",
          decision: "DENY",
          enforcement: { action: "BLOCK" },
          validity_state: "VALID",
          system_id: "L7-AGENT-SENSOR",
          policy_id: policyId,
          policy_version: "4.2.1",
          risk_level: riskLevel,
          rules_matched: rules,
          reason: "Bloqueo Privacidad: Detección ex-ante de datos regulados en búfer volátil de runtime.",
          cleanPrompt: displayPrompt,
          sanitizedPrompt: displayPrompt,
          evidence_id: `EV-PII-${runRandomId}`,
          cryptoSeal: seal,
          parentHash: CANONICAL_PARENT_HASH,
          timestamp: timestampIso
        };
      }
    }

    // 05. SI NO HAY INFRACCIÓN: VEREDICTO ALLOW
    if (!settings.auditoria_dictamen_normativo) return null;

    return {
      verdict_schema: "SGP_1.0",
      decision: "ALLOW",
      enforcement: { action: "PASS" },
      validity_state: "VALID",
      system_id: "L7-AGENT-SENSOR",
      policy_id: "POL-CORP-GOVERNANCE-01",
      policy_version: "1.0.0",
      risk_level: "LOW",
      rules_matched: ["RULE_PAYLOAD_CONFORME"],
      reason: "Inferencia autorizada bajo perímetro determinista L7.",
      cleanPrompt: cleanPrompt,
      sanitizedPrompt: cleanPrompt,
      evidence_id: `EV-ALLOW-${runRandomId}`,
      cryptoSeal: seal,
      parentHash: CANONICAL_PARENT_HASH,
      timestamp: timestampIso
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
    const verdict = evaluatePayload(body, this._saare_url);
    if (verdict) {
      window.postMessage({ type: "SAARE_VERDICT_EVENT", payload: verdict }, "*");
      if (verdict.decision === "DENY" || verdict.enforcement?.action === "BLOCK") {
        throw new Error(`[SAARE JUDGE] Acción rechazada por política [${verdict.policy_id}].`);
      }
    }
    return rawSend.apply(this, arguments);
  };

  // Hook Fetch
  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    const url = typeof resource === "string" ? resource : (resource?.url || "");
    if (config && config.body) {
      const verdict = evaluatePayload(config.body, url);
      if (verdict) {
        window.postMessage({ type: "SAARE_VERDICT_EVENT", payload: verdict }, "*");
        if (verdict.decision === "DENY" || verdict.enforcement?.action === "BLOCK") {
          return new Response(JSON.stringify({
            verdict: "DENY",
            decision: "DENY",
            enforcement: { action: "BLOCK" },
            error: "SAARE Judge: Bloqueo Ex-Ante en Runtime",
            policy_id: verdict.policy_id,
            reason: verdict.reason,
            evidence_id: verdict.evidence_id,
            crypto_seal: verdict.cryptoSeal
          }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
    return rawFetch.apply(this, arguments);
  };
})();