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
    unsupported: /(?:inventar|sin evidencia|sin respaldo|ignora el contrato|alterar documento)/i,
    tool_mutation: /(?:delete_customer_account|delete_database|drop_table|truncate_table|execute_raw_sql|exec_shell)/i
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
          banca_dora_pci: parsed.banca_dora_pci !== false,
          sanidad_historia_clinica: parsed.sanidad_historia_clinica !== false,
          orquestacion_workflows_guard: parsed.orquestacion_workflows_guard !== false,
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
      banca_dora_pci: true,
      sanidad_historia_clinica: true,
      orquestacion_workflows_guard: true,
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

    try {
      const json = JSON.parse(rawText);
      if (json.messages && Array.isArray(json.messages)) {
        const lastMsg = json.messages[json.messages.length - 1];
        if (lastMsg?.content?.parts) return lastMsg.content.parts.join(" ");
        if (typeof lastMsg?.content === "string") return lastMsg.content;
      }
      if (json.prompt) return json.prompt;
      if (json.input) return json.input;
      if (json.action && json.resource) return `${json.action}:${json.resource}`;
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
    const timestampIso = new Date().toISOString();
    const runRandomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const canonicalVerdictId = `VRD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 01. ORQUESTADORES & WORKFLOWS GUARD
    if (settings.orquestacion_workflows_guard && DLP.tool_mutation.test(cleanPrompt)) {
      return {
        verdict_schema: "SGP_1.0",
        verdictId: canonicalVerdictId,
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        executionPermit: null,
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy: { id: "POL-CRM-LEAST-PRIV-03", version: "1.4.0" },
        risk_level: "CRITICAL",
        rules_matched: ["RULE_PRIVILEGED_MUTATION_DENIED"],
        reason: "El perfil de privilegios mínimos deniega mutaciones destructivas o comandos directos sin permiso.",
        cleanPrompt: cleanPrompt,
        sanitizedPrompt: cleanPrompt,
        evidence_id: `EV-TOOL-${runRandomId}`,
        cryptoSeal: seal,
        parentHash: CANONICAL_PARENT_HASH,
        timestamp: timestampIso
      };
    }

    // 02. SUBVENCIONES Y FONDOS PÚBLICOS
    if (settings.subvenciones_requisitos_infranqueables && DLP.invoices.test(cleanPrompt) && subOpts.enforce_no_double_funding !== false) {
      const match = cleanPrompt.match(DLP.invoices)[0];
      return {
        verdict_schema: "SGP_1.0",
        verdictId: canonicalVerdictId,
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        executionPermit: null,
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy: { id: "POL-GRANTS-DNSH-05", version: "2.1.0" },
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

    // 03. PROTECCIÓN DEL HONOR & DEEPFAKES
    if (settings.deepfake_fake_disprover && (DLP.voice_clone.test(cleanPrompt) || DLP.unsupported.test(cleanPrompt))) {
      return {
        verdict_schema: "SGP_1.0",
        verdictId: canonicalVerdictId,
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        executionPermit: null,
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy: { id: "POL-HONOR-SYNTHETIC-03", version: "2.0.0" },
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

    // 04. ROBUSTEZ L7 & ANTI-JAILBREAK
    if (settings.razonamiento_activo_l7 && DLP.jailbreak.test(cleanPrompt) && subOpts.anti_dan_jailbreak !== false) {
      return {
        verdict_schema: "SGP_1.0",
        verdictId: canonicalVerdictId,
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        executionPermit: null,
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy: { id: "POL-AI-ACT-ROBUSTNESS-15", version: "3.4.0" },
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

    // 05. PRIVACIDAD, PII, SALUD & BANCA
    if (settings.cumplimiento_corporativo_integral || settings.banca_dora_pci || settings.sanidad_historia_clinica) {
      const isDni = subOpts.dlp_dni_nie !== false && (DLP.dni.test(cleanPrompt) || DLP.dni.test(str));
      const isIban = settings.banca_dora_pci && subOpts.dlp_iban_cards !== false && (DLP.iban.test(cleanPrompt.replace(/[\s-]/g, "")) || DLP.iban.test(str.replace(/[\s-]/g, "")));
      const isCard = settings.banca_dora_pci && subOpts.dlp_iban_cards !== false && (DLP.card.test(cleanPrompt.replace(/[\s-]+/g, "")) || DLP.card.test(str.replace(/[\s-]+/g, "")));
      const isHealth = settings.sanidad_historia_clinica && subOpts.dlp_health_art9 !== false && (DLP.health.test(cleanPrompt) || DLP.health.test(str));

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
          verdictId: canonicalVerdictId,
          decision: "DENY",
          enforcement: { action: "BLOCK" },
          executionPermit: null,
          validity_state: "VALID",
          system_id: "L7-AGENT-SENSOR",
          policy: { id: policyId, version: "4.2.1" },
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

    // 06. VEREDICTO ALLOW
    if (!settings.auditoria_dictamen_normativo) return null;

    return {
      verdict_schema: "SGP_1.0",
      verdictId: canonicalVerdictId,
      decision: "ALLOW",
      enforcement: { action: "PASS" },
      executionPermit: { status: "ISSUED" },
      validity_state: "VALID",
      system_id: "L7-AGENT-SENSOR",
      policy: { id: "POL-CORP-GOVERNANCE-01", version: "1.0.0" },
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
        throw new Error(`[SAARE JUDGE] Acción rechazada por política.`);
      }
    }
    return rawSend.apply(this, arguments);
  };

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
            verdictId: verdict.verdictId,
            policy: verdict.policy,
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
