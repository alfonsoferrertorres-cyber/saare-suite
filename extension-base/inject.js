// Reemplaza la función processAndEvaluate en extension-base/inject.js

async function processAndEvaluate(cleanPrompt, url) {
  if (!cleanPrompt || typeof cleanPrompt !== "string") return { shouldBlock: false };

  // 1. Descarte inmediato de telemetría y metadatos internos de Google/Gemini
  const lowerPrompt = cleanPrompt.toLowerCase();
  if (
    lowerPrompt.includes("f.req=") || 
    lowerPrompt.includes("bard_activity") || 
    lowerPrompt.includes("connectiondurationms") ||
    lowerPrompt.includes("documentrequestid") ||
    cleanPrompt.startsWith("[[[")
  ) {
    return { shouldBlock: false };
  }

  // 2. Evaluación DLP sobre texto limpio
  const isDni = DLP.dni.test(cleanPrompt);
  const isIban = DLP.iban.test(cleanPrompt);
  const isCard = DLP.card.test(cleanPrompt);
  const isOwasp = OWASP_PATTERNS.test(cleanPrompt);

  let triggeredCustomRule = null;
  for (const rule of dynamicCustomRules) {
    if (rule.pattern) {
      try {
        const reg = new RegExp(rule.pattern, "i");
        if (reg.test(cleanPrompt)) {
          triggeredCustomRule = rule;
          break;
        }
      } catch (e) {}
    }
  }

  const isViolation = isDni || isIban || isCard || isOwasp || (triggeredCustomRule !== null);
  const sanitizedText = sanitizePromptText(cleanPrompt);

  // 3. Construcción del veredicto completo (Tanto para tráfico conforme como bloqueos)
  const activeCheck = {
    verdict: isViolation ? "RECHAZADO" : "PERMITIDO",
    decision: isViolation ? "DENY" : "ALLOW",
    category: isViolation 
      ? (triggeredCustomRule ? `CUSTOM_RULE_${triggeredCustomRule.name.toUpperCase()}` : (isCard ? "FINANCIAL_CARD" : isDni ? "PII_DNI" : isIban ? "PII_IBAN" : "PROMPT_INJECTION")) 
      : "AUDITORIA_CONFORME",
    norma: isViolation 
      ? (triggeredCustomRule ? `Gobernanza Corporativa: ${triggeredCustomRule.name}` : (isCard || isIban ? "EU Regulation 2022/2554 (DORA)" : "EU AI Act Art. 10 & LOPDGDD")) 
      : "EU AI Act - Tráfico Conforme",
    reason: isViolation ? "Detección Ex-Ante de Datos Sensibles o Regla de Empresa en RAM" : "Prompt verificado sin PII bajo directivas GRC",
    rawPrompt: cleanPrompt,
    cleanPrompt: cleanPrompt,
    sanitizedPrompt: sanitizedText,
    cryptoSeal: computeL7Seal(cleanPrompt),
    shouldBlock: isViolation
  };

  // 4. Despliegue de ventana emergente únicamente si hay infracción
  if (isViolation) {
    renderGuardrailModal(activeCheck);
  }

  // 5. SIEMPRE emitir el evento para que content.js -> background.js registre la evidencia en saare-console
  window.postMessage({ type: "SAARE_VERDICT_EVENT", payload: activeCheck }, "*");

  return activeCheck;
}