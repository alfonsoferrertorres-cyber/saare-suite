// apps/control-plane/src/middleware/semanticDetoxEngine.js
// Módulo de Desintoxicación Semántica Ex-Ante en Memoria RAM (Capa 7 - S.A.A.R.E. SGP 1.0 + ISO 42001)

export class SemanticDetoxEngine {
  constructor() {
    this.version = "v1.3-DETOX-RAM-ISO42001-FULL";

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
        regex: /\b([0-9]{8}|[XYZ][0-9]{7})[-\s]?[A-HJ-NP-TV-Z]\b/gi,
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
    // Normalización NFC y limpieza de caracteres de control invisibles en RAM
    return text
      .normalize("NFC")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) =>
        ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""
      );
  }

  compileCustomRuleRegex(pattern) {
    if (!pattern || typeof pattern !== "string") return null;
    const trimmed = pattern.trim();
    if (!trimmed) return null;

    try {
      if (trimmed.startsWith("/") && trimmed.lastIndexOf("/") > 0) {
        const lastSlash = trimmed.lastIndexOf("/");
        const body = trimmed.slice(1, lastSlash);
        const flags = trimmed.slice(lastSlash + 1).replace(/g/g, "") + "g";
        return new RegExp(body, flags.includes("i") ? flags : `${flags}i`);
      }
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "gi");
    } catch (e) {
      return null;
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
          piiDetected = true;
          const ruleCode = `TENANT_DLP_${String(rule?.name || "CUSTOM").toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
          rx.lastIndex = 0;
          sanitized = sanitized.replace(rx, `[REDACTED_TENANT_POLICY:${rule?.name || "CUSTOM"}]`);
          addRule(ruleCode, {
            rule: ruleCode,
            category: "TENANT_CUSTOM_DLP",
            severity: "HIGH",
            iso42001_control: "A.5.4 / A.7.4"
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

    const cleanPrompt = wrapUntrusted
      ? `<user_input_untrusted>\n${sanitized}\n</user_input_untrusted>`
      : sanitized;

    const status = highRiskDetected
      ? "BLOCKED"
      : (threatDetected ? "SANITIZED" : "CLEAN");

    return {
      cleanPrompt,
      sanitizedText: sanitized,
      sanitizedPayload: sanitized,
      rulesTriggered,
      findings,
      threatDetected,
      jailbreakDetected,
      highRiskDetected,
      piiDetected,
      status
    };
  }
}