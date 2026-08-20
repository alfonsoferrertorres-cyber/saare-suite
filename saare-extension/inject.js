/* S.A.A.R.E. L7 RAM Network Interceptor v4.1.0 */
(function() {
  const DLP = {
    dni: /\b(\d{7,8}[-\s]?[A-Za-z]|[XYZ]\d{7}[-\s]?[A-Za-z])\b/i,
    iban: /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{20,22}\b/i,
    // Prefijos financieros reales: Visa (4), Mastercard (51-55), Amex (34/37)
    card: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/
  };

  function checkPayload(str) {
    if (!str || typeof str !== "string") return null;
    // Prioridad 1: DNI
    if (DLP.dni.test(str)) return { category: "PII_DNI", norma: "España - LOPDGDD & AEPD", reason: "Detección de DNI/NIE en memoria RAM" };
    // Prioridad 2: IBAN
    if (DLP.iban.test(str.replace(/\s+/g, ""))) return { category: "DATOS_BANCARIOS", norma: "RGPD Art. 5, 32 / LOPDGDD", reason: "Detección de Cuenta Bancaria / IBAN" };
    // Prioridad 3: Tarjetas reales
    if (DLP.card.test(str.replace(/[\s-]+/g, ""))) return { category: "TARJETA_CREDITO", norma: "PCI-DSS / RGPD", reason: "Detección de Tarjeta Financiera" };
    return null;
  }

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
