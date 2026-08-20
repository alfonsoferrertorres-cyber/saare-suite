/* S.A.A.R.E. L7 RAM Network Interceptor */
(function() {
  const DLP = {
    // Acepta cualquier letra tras 8 dígitos para frenar pruebas y erratas (incluida la 'U')
    dni: /\b(\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])\b/i,
    iban: /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{20,22}\b/i,
    card: /\b(?:\d{4}[\s-]?){3}\d{4}\b|\b\d{15,16}\b/
  };

  function checkPayload(str) {
    if (!str || typeof str !== "string") return null;
    if (DLP.dni.test(str)) return { category: "PII_DNI", norma: "España - LOPDGDD & AEPD", reason: "Detección de DNI/NIE en memoria RAM" };
    if (DLP.iban.test(str.replace(/\s+/g, ""))) return { category: "DATOS_BANCARIOS", norma: "RGPD Art. 5, 32 / LOPDGDD", reason: "Detección de Cuenta Bancaria / IBAN" };
    if (DLP.card.test(str.replace(/[\s-]+/g, ""))) return { category: "TARJETA_CREDITO", norma: "PCI-DSS / RGPD", reason: "Detección de Tarjeta Financiera" };
    return null;
  }

  // Interceptar XMLHttpRequest (StreamGenerate de Gemini)
  const rawSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    if (body && typeof body === "string") {
      const violation = checkPayload(body);
      if (violation) {
        window.postMessage({ type: "SAARE_BLOCKED_EVENT", violation: violation }, "*");
        throw new Error("[S.A.A.R.E. L7] Petición cancelada en RAM: Infracción de Cumplimiento.");
      }
    }
    return rawSend.apply(this, arguments);
  };

  // Interceptar Fetch nativo
  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    if (config && config.body && typeof config.body === "string") {
      const violation = checkPayload(config.body);
      if (violation) {
        window.postMessage({ type: "SAARE_BLOCKED_EVENT", violation: violation }, "*");
        return new Response(JSON.stringify({ error: "S.A.A.R.E. Security Intercept" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
    }
    return rawFetch.apply(this, arguments);
  };
})();
