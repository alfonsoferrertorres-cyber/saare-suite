// apps/control-plane/src/middleware/semanticDetoxEngine.js
// Módulo de Desintoxicación Semántica Ex-Ante en Memoria RAM (Capa 7 - S.A.A.R.E. SGP 1.0)

import unicodedata from 'node:util'; // O compatible con runtime edge de Cloudflare Workers

export class SemanticDetoxEngine {
  constructor() {
    this.version = "v1.0-DETOX-RAM";
    this.injectionPatterns = [
      /i?ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
      /i?disregard\s+(the\s+)?above/i,
      /i?you\s+are\s+now\s+a/i,
      /i?system\s*:\s*/i,
      /i?<\s*\/?\s*system\s*>/i,
      /i?forget\s+everything\s+you\s+know/i,
      /i?simula\s+que\s+no\s+existen\s+reglas/i,
      /i?actúa\s+como\s+un\s+sistema\s+sin\s+restricciones/i,
      /drop\s+table/i,
      /dan\s+mode/i
    ];
  }

  normalizeText(text) {
    if (typeof text !== 'string') return '';
    // Normalización NFC y limpieza de caracteres de control invisibles en RAM
    return text.normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) => (ch === '\n' || ch === '\r' || ch === '\t' ? ch : ''));
  }

  stripInjectionWrappers(text) {
    let sanitized = text;
    let threatDetected = false;
    const rulesTriggered = [];

    for (const pattern of this.injectionPatterns) {
      if (pattern.test(sanitized)) {
        threatDetected = true;
        sanitized = sanitized.replace(pattern, '[REDACTED_INDUCTION_PATTERN]');
        rulesTriggered.push("ANTI_JAILBREAK_TRIGGERED");
      }
    }

    // Detección y enmascaramiento de NIF / DNI / NIE flexible
    const nifRegex = /\b([0-9]{8}|[XYZ][0-9]{7})[-\s]?[A-HJ-NP-TV-Z]\b/gi;
    if (nifRegex.test(sanitized)) {
      sanitized = sanitized.replace(nifRegex, '[PII_ANONYMIZED_ES]');
      rulesTriggered.push("DLP_PII_NIF_ES");
    }

    // Detección de IBAN
    const ibanRegex = /\bES[0-9]{2}[0-9A-Z]{20}\b/gi;
    if (ibanRegex.test(sanitized)) {
      sanitized = sanitized.replace(ibanRegex, '[PHI_PII_IBAN_MASKED]');
      rulesTriggered.push("DLP_PII_IBAN_ES");
    }

    // Detección de API Keys sensibles
    const apiKeyRegex = /(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})/gi;
    if (apiKeyRegex.test(sanitized)) {
      sanitized = sanitized.replace(apiKeyRegex, '[SECRET_MASKED_KEY]');
      rulesTriggered.push("SECRET_SCANNING_API_KEY");
    }

    return { sanitized, threatDetected, rulesTriggered };
  }

  detoxify(rawInput) {
    const normalized = this.normalizeText(rawInput);
    const { sanitized, threatDetected, rulesTriggered } = this.stripInjectionWrappers(normalized);

    // Encapsulamiento estructural pasivo para el LLM
    const enclosedPrompt = `<user_input_untrusted>\n${sanitized}\n</user_input_untrusted>`;

    return {
      cleanPrompt: enclosedPrompt,
      sanitizedText: sanitized,
      rulesTriggered,
      threatDetected,
      status: threatDetected ? 'SANITIZED' : 'CLEAN'
    };
  }
}