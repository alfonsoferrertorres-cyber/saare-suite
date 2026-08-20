/* S.A.A.R.E. L7 Perimeter Engine - Deep RAM Hook */
(function() {
  const DLP_PATTERNS = {
    dni: /\b(\d{8}[A-HJ-NP-TV-Z]|[XYZ]\d{7}[A-HJ-NP-TV-Z])\b/i,
    iban: /\bES\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}[\s-]?\d{10}\b|\bES\d{22}\b/i,
    card: /\b(?:\d{4}[\s-]?){3}\d{4}\b/
  };

  function inspectContent(str) {
    if (!str || typeof str !== "string") return null;
    if (DLP_PATTERNS.dni.test(str)) return { category: "PII_DNI", norma: "España - LOPDGDD & AEPD", reason: "Detección de DNI/NIE en memoria RAM" };
    if (DLP_PATTERNS.iban.test(str.replace(/\s+/g, ""))) return { category: "DATOS_BANCARIOS", norma: "RGPD Art. 5, 32 / LOPDGDD", reason: "Detección de IBAN" };
    if (DLP_PATTERNS.card.test(str.replace(/[\s-]+/g, ""))) return { category: "TARJETA_CREDITO", norma: "PCI-DSS / RGPD", reason: "Detección de Tarjeta Financiera" };
    return null;
  }

  // Interceptar XMLHttpRequest (Gemini StreamGenerate)
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    if (body && typeof body === "string") {
      const violation = inspectContent(body);
      if (violation) {
        window.postMessage({ type: "SAARE_PERIMETER_BLOCKED", violation: violation, payloadRaw: body.substring(0, 100) }, "*");
        throw new Error("[S.A.A.R.E. L7] Petición abortada en RAM por infracción de cumplimiento.");
      }
    }
    return origSend.apply(this, arguments);
  };

  // Interceptar Fetch nativo
  const origFetch = window.fetch;
  window.fetch = async function(resource, config) {
    if (config && config.body && typeof config.body === "string") {
      const violation = inspectContent(config.body);
      if (violation) {
        window.postMessage({ type: "SAARE_PERIMETER_BLOCKED", violation: violation, payloadRaw: config.body.substring(0, 100) }, "*");
        return new Response(JSON.stringify({ error: "S.A.A.R.E. L7 Blocked" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
    }
    return origFetch.apply(this, arguments);
  };
})();
