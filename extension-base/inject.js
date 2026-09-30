// extension-base/inject.js — Función processAndEvaluate (SGP 1.0 / v8.2)

/**
 * Evalúa el prompt extraído de la interfaz Ex-Ante en Capa L7.
 * Incluye prevención de estado en Regex (/g lastIndex bug), filtro de ruido Gemini
 * y soporte para modo AUDIT / FAIL-CLOSED.
 */
async function processAndEvaluate(cleanPrompt, url) {
  if (!cleanPrompt || typeof cleanPrompt !== "string") return { shouldBlock: false };

  const trimmedPrompt = cleanPrompt.trim();
  if (trimmedPrompt.length < 3) return { shouldBlock: false };

  // 1. Descarte inmediato de telemetría y metadatos internos de Google/Gemini
  const lowerPrompt = trimmedPrompt.toLowerCase();
  if (
    lowerPrompt.includes("f.req=") || 
    lowerPrompt.includes("bard_activity") || 
    lowerPrompt.includes("connectiondurationms") ||
    lowerPrompt.includes("documentrequestid") ||
    lowerPrompt.includes("batchexecute") ||
    trimmedPrompt.startsWith("[[[") ||
    trimmedPrompt.startsWith("[\"")
  ) {
    return { shouldBlock: false };
  }

  // Helper para resetear 'lastIndex' y evitar fallos por flag '/g' en expresiones regulares
  const safeTest = (regex, text) => {
    if (!regex) return false;
    if (regex.global) regex.lastIndex = 0;
    return regex.test(text);
  };

  // 2. Evaluación DLP sobre texto limpio
  const isDni = typeof DLP !== "undefined" && DLP.dni ? safeTest(DLP.dni, trimmedPrompt) : false;
  const isIban = typeof DLP !== "undefined" && DLP.iban ? safeTest(DLP.iban, trimmedPrompt) : false;
  const isCard = typeof DLP !== "undefined" && DLP.card ? safeTest(DLP.card, trimmedPrompt) : false;
  const isOwasp = typeof OWASP_PATTERNS !== "undefined" ? safeTest(OWASP_PATTERNS, trimmedPrompt) : false;

  // 3. Evaluación de Reglas Personalizadas Dinámicas
  let triggeredCustomRule = null;
  const customRulesList = window.dynamicCustomRules || (typeof dynamicCustomRules !== "undefined" ? dynamicCustomRules : []);
  
  if (Array.isArray(customRulesList)) {
    for (const rule of customRulesList) {
      if (!rule || !rule.pattern) continue;
      try {
        const reg = new RegExp(rule.pattern, "i");
        if (safeTest(reg, trimmedPrompt)) {
          triggeredCustomRule = rule;
          break;
        }
      } catch (e) {
        // Fallback a búsqueda de texto plano si la sintaxis Regex es inválida
        if (lowerPrompt.includes(rule.pattern.toLowerCase())) {
          triggeredCustomRule = rule;
          break;
        }
      }
    }
  }

  const isViolation = isDni || isIban || isCard || isOwasp || (triggeredCustomRule !== null);

  // 4. Comprobación del Modo de Operación (FAIL-CLOSED vs AUDIT)
  // Si el nodo se configura como "AUDIT", registra la evidencia pero no interrumpe al usuario
  const currentMode = window.SAARE_MODE || "FAIL-CLOSED"; // "FAIL-CLOSED" | "AUDIT"
  const shouldBlock = isViolation && currentMode !== "AUDIT";

  // Sanitización y generación de sello forense
  const sanitizedText = typeof sanitizePromptText === "function" 
    ? sanitizePromptText(trimmedPrompt) 
    : trimmedPrompt;

  const cryptoSeal = typeof computeL7Seal === "function" 
    ? computeL7Seal(trimmedPrompt) 
    : `L7_SEAL_${Date.now()}`;

  // 5. Construcción del Veredicto Completo
  const activeCheck = {
    verdict: isViolation ? (shouldBlock ? "RECHAZADO" : "AUDITADO_PASIVO") : "PERMITIDO",
    decision: isViolation ? (shouldBlock ? "DENY" : "ALLOW") : "ALLOW",
    category: isViolation 
      ? (triggeredCustomRule ? `CUSTOM_RULE_${triggeredCustomRule.name.toUpperCase().replace(/\s+/g, '_')}` : (isCard ? "FINANCIAL_CARD" : isDni ? "PII_DNI" : isIban ? "PII_IBAN" : "PROMPT_INJECTION")) 
      : "AUDITORIA_CONFORME",
    norma: isViolation 
      ? (triggeredCustomRule ? `Gobernanza Corporativa: ${triggeredCustomRule.name}` : (isCard || isIban ? "EU Regulation 2022/2554 (DORA)" : "EU AI Act Art. 10 & LOPDGDD")) 
      : "EU AI Act - Tráfico Conforme",
    reason: isViolation 
      ? `Detección Ex-Ante de Datos Sensibles en RAM (${shouldBlock ? 'Bloqueado' : 'Modo Auditoría'})` 
      : "Prompt verificado sin PII bajo directivas GRC",
    rawPrompt: trimmedPrompt,
    cleanPrompt: trimmedPrompt,
    sanitizedPrompt: sanitizedText,
    cryptoSeal: cryptoSeal,
    shouldBlock: shouldBlock
  };

  // 6. Despliegue de ventana emergente únicamente si hay infracción activa
  if (shouldBlock && typeof renderGuardrailModal === "function") {
    renderGuardrailModal(activeCheck);
  }

  // 7. Notificación mediante evento para que content.js -> background.js registre la evidencia
  window.postMessage({ type: "SAARE_VERDICT_EVENT", payload: activeCheck }, "*");

  return activeCheck;
}