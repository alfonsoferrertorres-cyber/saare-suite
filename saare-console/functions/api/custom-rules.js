export async function onRequestGet(context) {
  const defaultRules = [
    { id: "dni_nie", name: "DNI/NIE Español", pattern: "\\b\\d{8}[A-HJ-NP-TV-Z]\\b", action: "BLOCK", active: true },
    { id: "iban_es", name: "IBAN Bancario ES", pattern: "ES\\d{2}[ ]?\\d{4}[ ]?\\d{4}[ ]?\\d{4}[ ]?\\d{4}[ ]?\\d{4}", action: "BLOCK", active: true },
    { id: "jailbreak_dan", name: "Anti-Jailbreak DAN", pattern: "mode developer|actua como|jailbreak|sin filtros", action: "BLOCK", active: true }
  ];

  return new Response(JSON.stringify(defaultRules), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
