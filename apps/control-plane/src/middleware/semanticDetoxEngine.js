// apps/control-plane/src/middleware/semanticDetoxEngine.js
// Módulo de Desintoxicación Semántica Ex-Ante en Memoria RAM (Capa 7 - S.A.A.R.E. SGP 1.0 + ISO 42001 + RFC 8785 + Mahalanobis L7)

const DEFAULT_EXPEDIENTE_REF = "MS3V-SGP1.0-MASTER-2026";
const MAHALANOBIS_K_MIN = 5;
const MAHALANOBIS_DELTA_THRESHOLD = 0.0001; // 0.0100%

export function canonicalizeRfc8785(val) {
  if (val === null || typeof val !== "object") {
    if (typeof val === "number" && Object.is(val, -0)) {
      return "0";
    }
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map((item) => canonicalizeRfc8785(item)).join(",") + "]";
  }
  const keys = Object.keys(val).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalizeRfc8785(val[k])).join(",") + "}";
}

export function evaluateMahalanobisL7(
  text = "",
  rulesTriggered = [],
  hasMediaAttachment = false,
  expedienteId = DEFAULT_EXPEDIENTE_REF
) {
  const str = typeof text === "string" ? text : String(text ?? "");
  const len = str.length;
  const nonAsciiCount = (str.match(/[^\x00-\x7F]/g) || []).length;
  const upperRatio = len > 0 ? ((str.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length / len) : 0;
  const symbolRatio = len > 0 ? ((str.match(/[^a-zA-Z0-9\s]/g) || []).length / len) : 0;
  const quasiIdCount =
    (str.match(/\b(?:\d{8}|[XYZ]\d{7})[- ]?[A-Za-z]\b/gi) || []).length +
    (str.match(/\b[A-Z]{2}\d{2}[\s-]?(?:\d{4}[\s-]?){4}\d{2,4}\b/gi) || []).length +
    (str.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi) || []).length +
    (str.match(/\b(?:\+34[\s-]?)?[6789]\d{8}\b/g) || []).length;

  const featureVector = [
    Math.min(len / 500, 10),
    Math.min((nonAsciiCount / Math.max(len, 1)) * 10, 10),
    Math.min(upperRatio * 10, 10),
    Math.min(symbolRatio * 10, 10),
    Math.min(quasiIdCount, 10),
    Math.min(rulesTriggered.length + (hasMediaAttachment ? 2 : 0), 10)
  ];

  const mu = [1.2, 0.2, 1.1, 0.8, 0.0, 0.0];
  const sigmaInvDiag = [1.0, 1.5, 1.2, 1.4, 2.5, 2.0];

  let quadForm = 0;
  for (let i = 0; i < featureVector.length; i++) {
    const diff = featureVector[i] - mu[i];
    quadForm += diff * sigmaInvDiag[i] * diff;
  }

  const distance = Number(Math.sqrt(Math.max(0, quadForm)).toFixed(6));
  const quasiIdDensity = Number(featureVector[4]);
  const estimatedKAnonymity = Math.max(1, Math.round(10 / (1 + quasiIdDensity)));
  const kAnonymitySatisfied = quasiIdDensity === 0 ? true : estimatedKAnonymity >= MAHALANOBIS_K_MIN;
  const divergenceDelta = Number((distance * 0.00005).toFixed(6));
  const triggerGateFired = divergenceDelta > MAHALANOBIS_DELTA_THRESHOLD || (!kAnonymitySatisfied && quasiIdDensity > 0);

  return {
    metric: "MAHALANOBIS_D_X_MU",
    expediente: expedienteId || DEFAULT_EXPEDIENTE_REF,
    distance,
    featureVector,
    quasiIdCount: quasiIdDensity,
    kMinRequired: MAHALANOBIS_K_MIN,
    estimatedKAnonymity,
    kAnonymitySatisfied,
    divergenceDelta,
    divergencePercent: `${(divergenceDelta * 100).toFixed(4)}%`,
    thresholdPercent: "0.0100%",
    triggerGateFired,
    failClosedHttpStatus: triggerGateFired ? 403 : 200
  };
}

export class SemanticDetoxEngine {
  constructor(options = {}) {
    this.version = "v1.5-DETOX-RAM-ISO42001-RFC8785-MAHALANOBIS";
    this.expediente = options?.expedienteId || options?.EXPEDIENTE_ID || DEFAULT_EXPEDIENTE_REF;

    this.injectionPatterns = [
      {
        regex: /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "PROMPT_INJECTION",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /disregard\s+(the\s+)?above/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "PROMPT_INJECTION",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /you\s+are\s+now\s+a/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "ROLE_OVERRIDE",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /(?:^|\n)\s*system\s*:\s*/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "SYSTEM_PRIVILEGE_SPOOF",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /<\s*\/?\s*system\s*>/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "TAG_INJECTION",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /forget\s+everything\s+you\s+know/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "CONTEXT_WIPE_ATTEMPT",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /simula\s+que\s+no\s+existen\s+reglas/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "POLICY_BYPASS_ES",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /act[uú]a\s+como\s+un\s+sistema\s+sin\s+restricciones/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "POLICY_BYPASS_ES",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /\bdrop\s+table\b/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "SQL_DESTRUCTIVE_PATTERN",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      },
      {
        regex: /\bdan\s+mode\b/gi,
        rule: "ANTI_JAILBREAK_TRIGGERED",
        category: "JAILBREAK_PERSONA_DAN",
        severity: "CRITICAL",
        iso42001_control: "A.6.2 / A.9.4"
      }
    ];

    this.highRiskSecretPatterns = [
      {
        regex: /(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})/gi,
        mask: "[SECRET_MASKED_KEY]",
        rule: "SECRET_SCANNING_API_KEY",
        category: "CREDENTIAL_EXPOSURE",
        severity: "CRITICAL",
        iso42001_control: "A.5.4 / A.9.4"
      },
      {
        regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g,
        mask: "[PCI_CARD_MASKED]",
        rule: "DLP_PCI_CARD_PAN",
        category: "FINANCIAL_HIGH_RISK",
        severity: "CRITICAL",
        iso42001_control: "A.5.4 / A.7.4"
      }
    ];

    this.standardPiiPatterns = [
      {
        regex: /\b([0-9]{8}|[XYZ][0-9]{7})[-\s]?[A-Za-z]\b/gi,
        mask: "[PII_ANONYMIZED_ES]",
        rule: "DLP_PII_NIF_ES",
        category: "PERSONAL_IDENTIFIER_ES",
        severity: "HIGH",
        iso42001_control: "A.5.4 / A.7.4"
      },
      {
        regex: /\bES[0-9]{2}[0-9A-Z]{20}\b/gi,
        mask: "[PHI_PII_IBAN_MASKED]",
        rule: "DLP_PII_IBAN_ES",
        category: "FINANCIAL_ACCOUNT_ES",
        severity: "HIGH",
        iso42001_control: "A.5.4 / A.7.4"
      },
      {
        regex: /\b(?:\+34[\s.-]?)?[6789][0-9]{2}[\s.-]?[0-9]{3}[\s.-]?[0-9]{3}\b/g,
        mask: "[PII_PHONE_ES_MASKED]",
        rule: "DLP_PII_PHONE_ES",
        category: "CONTACT_DATA_ES",
        severity: "HIGH",
        iso42001_control: "A.7.4"
      },
      {
        regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        mask: "[PII_EMAIL_MASKED]",
        rule: "DLP_PII_EMAIL",
        category: "CONTACT_DATA_EMAIL",
        severity: "HIGH",
        iso42001_control: "A.7.4"
      }
    ];
  }

  normalizeText(text) {
    if (typeof text !== "string") return "";
    return text
      .normalize("NFC")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) =>
        ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""
      );
  }

  isSafeRegexSource(source) {
    if (!source || typeof source !== "string") return false;
    const trimmed = source.trim();
    if (!trimmed || trimmed.length > 240) return false;
    if (/(\+|\*|\{\d+,?\d*\})\s*(\+|\*|\{\d+,?\d*\})/.test(trimmed)) return false;
    return true;
  }

  compileCustomRuleRegex(pattern) {
    if (!pattern || typeof pattern !== "string") return null;
    const trimmed = pattern.trim();
    if (!trimmed) return null;

    try {
      if (trimmed.startsWith("/") && trimmed.lastIndexOf("/") > 0) {
        const lastSlash = trimmed.lastIndexOf("/");
        const body = trimmed.slice(1, lastSlash);
        if (!this.isSafeRegexSource(body)) return null;
        const rawFlags = trimmed.slice(lastSlash + 1).replace(/[^gimsuy]/g, "");
        const flags = Array.from(new Set(`${rawFlags}gi`.split(""))).join("");
        return new RegExp(body, flags);
      }

      if (!this.isSafeRegexSource(trimmed)) return null;
      return new RegExp(trimmed, "gi");
    } catch {
      try {
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(escaped, "gi");
      } catch {
        return null;
      }
    }
  }

  stripInjectionWrappers(text, customRules = []) {
    let sanitized = text;
    let jailbreakDetected = false;
    let highRiskDetected = false;
    let piiDetected = false;
    const rulesTriggered = [];
    const findings = [];

    const addRule = (ruleName, findingObj) => {
      if (!rulesTriggered.includes(ruleName)) {
        rulesTriggered.push(ruleName);
      }
      findings.push(findingObj);
    };

    for (const item of this.injectionPatterns) {
      item.regex.lastIndex = 0;
      if (item.regex.test(sanitized)) {
        jailbreakDetected = true;
        highRiskDetected = true;
        item.regex.lastIndex = 0;
        sanitized = sanitized.replace(item.regex, "[REDACTED_INDUCTION_PATTERN]");
        addRule(item.rule, {
          rule: item.rule,
          category: item.category,
          severity: item.severity,
          iso42001_control: item.iso42001_control
        });
      }
    }

    for (const item of this.highRiskSecretPatterns) {
      item.regex.lastIndex = 0;
      if (item.regex.test(sanitized)) {
        highRiskDetected = true;
        item.regex.lastIndex = 0;
        sanitized = sanitized.replace(item.regex, item.mask);
        addRule(item.rule, {
          rule: item.rule,
          category: item.category,
          severity: item.severity,
          iso42001_control: item.iso42001_control
        });
      }
    }

    for (const item of this.standardPiiPatterns) {
      item.regex.lastIndex = 0;
      if (item.regex.test(sanitized)) {
        piiDetected = true;
        item.regex.lastIndex = 0;
        sanitized = sanitized.replace(item.regex, item.mask);
        addRule(item.rule, {
          rule: item.rule,
          category: item.category,
          severity: item.severity,
          iso42001_control: item.iso42001_control
        });
      }
    }

    if (Array.isArray(customRules) && customRules.length > 0) {
      for (const rule of customRules) {
        const rx = this.compileCustomRuleRegex(rule?.pattern);
        if (!rx) continue;
        rx.lastIndex = 0;
        if (rx.test(sanitized)) {
          const meta = `${rule?.name || ""} ${rule?.id || ""}`.toUpperCase();
          const isSecurityRule =
            meta.includes("INJECTION") ||
            meta.includes("JAILBREAK") ||
            meta.includes("SEC") ||
            meta.includes("DROP TABLE");

          if (isSecurityRule) {
            jailbreakDetected = true;
            highRiskDetected = true;
          } else {
            piiDetected = true;
          }

          const ruleCode = `TENANT_DLP_${String(rule?.name || rule?.id || "CUSTOM")
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")}`;
          rx.lastIndex = 0;
          sanitized = sanitized.replace(rx, `[REDACTED_TENANT_POLICY:${rule?.name || "CUSTOM"}]`);
          addRule(ruleCode, {
            rule: ruleCode,
            category: isSecurityRule ? "TENANT_CUSTOM_SECURITY" : "TENANT_CUSTOM_DLP",
            severity: isSecurityRule ? "CRITICAL" : "HIGH",
            iso42001_control: isSecurityRule ? "A.6.2 / A.9.4" : "A.5.4 / A.7.4"
          });
        }
      }
    }

    const threatDetected = jailbreakDetected || highRiskDetected || piiDetected;
    return {
      sanitized,
      threatDetected,
      jailbreakDetected,
      highRiskDetected,
      piiDetected,
      rulesTriggered,
      findings
    };
  }

  detoxify(rawInput, customRules = [], options = {}) {
    const wrapUntrusted = options?.wrapUntrusted !== false;
    const hasMediaAttachment = Boolean(options?.hasMediaAttachment);
    const expedienteId = options?.expedienteId || options?.EXPEDIENTE_ID || this.expediente;
    const normalized = this.normalizeText(rawInput);
    const {
      sanitized,
      threatDetected,
      jailbreakDetected,
      highRiskDetected,
      piiDetected,
      rulesTriggered,
      findings
    } = this.stripInjectionWrappers(normalized, customRules);

    const mahalanobis = evaluateMahalanobisL7(normalized, rulesTriggered, hasMediaAttachment, expedienteId);

    const cleanPrompt = wrapUntrusted
      ? `<user_input_untrusted>\n${sanitized}\n</user_input_untrusted>`
      : sanitized;

    const status = highRiskDetected || mahalanobis.triggerGateFired
      ? "BLOCKED"
      : threatDetected
      ? "SANITIZED"
      : "CLEAN";

    const canonicalSummary = canonicalizeRfc8785({
      version: this.version,
      expediente: expedienteId,
      status,
      rulesTriggered,
      mahalanobisDistance: mahalanobis.distance,
      kAnonymitySatisfied: mahalanobis.kAnonymitySatisfied
    });

    return {
      cleanPrompt,
      sanitizedText: sanitized,
      sanitizedPayload: sanitized,
      expedienteId,
      rulesTriggered,
      findings,
      mahalanobis,
      canonicalSummary,
      threatDetected,
      jailbreakDetected,
      highRiskDetected,
      piiDetected,
      status
    };
  }
}

export default SemanticDetoxEngine;