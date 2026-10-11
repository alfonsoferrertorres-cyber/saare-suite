/* SAARE L7 Execution Authorization & Network Interceptor (SGP 1.0 - Full Dashboard Rules Integrated) */
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
      const raw = document.documentElement?.getAttribute('data-saare-settings');
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
    } catch (e) {
      console.warn("[SAARE] Error parsing settings attributes, falling back to defaults:", e);
    }

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

  function getIdentityContext() {
    return {
      user: document.documentElement?.getAttribute("data-saare-user") || "ciso@saare.es",
      tenant: document.documentElement?.getAttribute("data-saare-tenant") || "ENTERPRISE"
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
          if (Array.isArray(outer)) {
            function deepFindPrompt(arr) {
              for (const item of arr) {
                if (typeof item === "string") {
                  if (item.startsWith("[") && item.endsWith("]")) {
                    try {
                      const parsedSub = JSON.parse(item);
                      const found = deepFindPrompt(parsedSub);
                      if (found) return found;
                    } catch {}
                  } else if (
                    item.length > 1 && 
                    !item.startsWith("!") && 
                    !item.startsWith("at=") && 
                    !item.includes("bard_activity") &&
                    !item.includes("f.req=")
                  ) {
                    return item;
                  }
                } else if (Array.isArray(item)) {
                  const found = deepFindPrompt(item);
                  if (found) return found;
                }
              }
              return null;
            }
            const prompt = deepFindPrompt(outer);
            if (prompt) return prompt.trim();
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
    const identity = getIdentityContext();
    const str = parseBody(rawBody);
    
    if (!str || isIgnoredRequest(url, str)) return null;

    const cleanPrompt = extractCleanPrompt(str);
    if (!cleanPrompt || cleanPrompt.length < 1 || cleanPrompt.includes("f.req=")) return null;

    const seal = computeL7Seal(cleanPrompt);
    const subOpts = settings.subOptions;
    const timestampIso = new Date().toISOString();
    const runRandomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const canonicalVerdictId = `VRD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const baseVerdict = {
      verdict_schema: "SGP_1.0",
      verdictId: canonicalVerdictId,
      user: identity.user,
      tenant: identity.tenant,
      cryptoSeal: seal,
      parentHash: CANONICAL_PARENT_HASH,
      timestamp: timestampIso
    };

    // 01. ORQUESTADORES & WORKFLOWS GUARD
    if (settings.orquestacion_workflows_guard && DLP.tool_mutation.test(cleanPrompt)) {
      return {
        ...baseVerdict,
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
        evidence_id: `EV-TOOL-${runRandomId}`
      };
    }

    // 02. SUBVENCIONES Y FONDOS PÚBLICOS
    if (settings.subvenciones_requisitos_infranqueables && DLP.invoices.test(cleanPrompt) && subOpts.enforce_no_double_funding !== false) {
      const match = cleanPrompt.match(DLP.invoices)?.[0] || "REF_DESCONOCIDA";
      return {
        ...baseVerdict,
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
        evidence_id: `EV-GRANT-${runRandomId}`
      };
    }

    // 03. PROTECCIÓN DEL HONOR & DEEPFAKES
    if (settings.deepfake_fake_disprover && (DLP.voice_clone.test(cleanPrompt) || DLP.unsupported.test(cleanPrompt))) {
      return {
        ...baseVerdict,
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        executionPermit: null,
        validity_state: "VALID",
        system_id: "L7-AGENT-SENSOR",
        policy: { id: "POL-HONOR-SYNTHETIC-03", version: "2.0.0" },
        risk_level: "CRITICAL",
        rules_matched: ["RULE_SYNTHETIC_IDENTITY_NO_CONSENT", "RULE_NO_UNSUPPORTED_CLAIMS"],
        reason: "Bloqueo Ley Orgánica 1/1982: Detección de intento de clonación sintética de voz/imagen sin acreditación de consentimiento expreso