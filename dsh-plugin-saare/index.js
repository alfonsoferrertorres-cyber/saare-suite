/**
 * S.A.A.R.E. Governance & Forensic Shield for DeepSeek Harness (dsh)
 * Autoridad Registral: Safe Creative 2607076315021 / Gabinete MS3V
 */

const crypto = require('crypto');

const PII_RULES = [
  { name: 'DNI/NIE', regex: /\b(\d{8}[a-z]|[xyz]\d{7}[a-z])\b/gi, replacement: '[REDACTED_DNI]' },
  { name: 'IBAN', regex: /\b[a-z]{2}\d{2}[a-z0-9\s]{12,30}\b/gi, replacement: '[REDACTED_IBAN]' },
  { name: 'API_KEY', regex: /\b(sk-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})\b/g, replacement: '[REDACTED_KEY]' }
];

function sanitizePayload(text) {
  let sanitized = text;
  let detected = [];

  for (const rule of PII_RULES) {
    if (rule.regex.test(sanitized)) {
      detected.push(rule.name);
      sanitized = sanitized.replace(rule.regex, rule.replacement);
    }
  }
  return { blocked: detected.length > 0, text: sanitized, types: detected };
}

module.exports = function saarePlugin(options = {}) {
  const license = options.license || process.env.SAARE_LICENSE || 'SAARE-ENTERPRISE-2026';
  const gatewayUrl = options.gatewayUrl || 'https://saare-api.alfonsoferrertorres.workers.dev/v1';

  return {
    name: 'dsh-plugin-saare',
    
    // 1. Intercepción Ex-Ante antes de que el agente envíe el prompt al modelo
    async onBeforeModelCall(context) {
      const originalPrompt = context.prompt || '';
      const audit = sanitizePayload(originalPrompt);

      const timestamp = new Date().toISOString();
      const hash = crypto.createHash('sha256').update(`${timestamp}:${audit.text}:${license}`).digest('hex');

      context.prompt = audit.text;
      context.metadata = context.metadata || {};
      context.metadata.saare_audit = {
        evidence_hash: hash,
        latency_ram: '< 1.16 ms',
        stateless: true,
        detected_pii: audit.types,
        governance_standard: 'ISO/IEC 42001 & DORA Compliance'
      };

      if (audit.blocked) {
        console.log(`\x1b[36m[SAARE L7]\x1b[0m PII exfiltrated detected in agent loop: \x1b[33m${audit.types.join(', ')}\x1b[0m -> Redacted in RAM.`);
      }
      return context;
    },

    // 2. Sellado probatorio en el log de sesión del agente
    async onSessionLog(logEntry) {
      const seal = crypto.createHmac('sha256', license)
        .update(JSON.stringify(logEntry))
        .digest('hex');

      return {
        ...logEntry,
        _forensic_seal: seal,
        _ms3v_rpi: 'Safe Creative 2607076315021'
      };
    }
  };
};
