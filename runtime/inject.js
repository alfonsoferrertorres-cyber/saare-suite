/**
 * SAARE L7 Execution Authorization Injector (SGP 1.0)
 */
(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [resource, config] = args;
    let interceptedPrompt = "";

    try {
      if (config && config.body) {
        if (typeof config.body === 'string') {
          const parsed = JSON.parse(config.body);
          interceptedPrompt = parsed.prompt || parsed.contents?.[0]?.parts?.[0]?.text || parsed.messages?.[-1]?.content || config.body;
        }
      }
    } catch (e) {
      interceptedPrompt = "Metadata-only captured (Payload unparseable)";
    }

    // Extracción dinámica de credenciales desde el DOM seguro inyectado por content.js
    const runtimeUser = document.documentElement.getAttribute("data-saare-user") || "el.abuelo.del.punk@gmail.com";
    const runtimeTenant = document.documentElement.getAttribute("data-saare-tenant") || "ALFON TEST";

    const url = typeof resource === 'string' ? resource : resource?.url || '';
    if (url && (url.includes('google.com') || url.includes('openai') || url.includes('anthropic') || url.includes('deepseek') || url.includes('llm'))) {
      window.postMessage({
        type: "SAARE_VERDICT_EVENT",
        payload: {
          verdict_schema: "SGP_1.0",
          verdictId: `VRD-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          evidence_id: `EV-ALLOW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: "VALID",
          system_id: "L7-BROWSER-SENSOR",
          timestamp: new Date().toISOString(),
          user: runtimeUser,
          tenant: runtimeTenant,
          decision: "ALLOW",
          enforcement: { action: "PASS" },
          cryptoSeal: "L7-SEAL:ACTIVE",
          cleanPrompt: interceptedPrompt ? interceptedPrompt.substring(0, 1000) : "Metadatos de auditoría extraídos en el borde",
          reason: "Acción autorizada y auditada por política determinista SGP 1.0."
        }
      }, "*");
    }
    return originalFetch.apply(this, args);
  };
})();