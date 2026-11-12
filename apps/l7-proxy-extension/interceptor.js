// interceptor.js (world: "MAIN" - Intercepta fetch antes de salir a internet)
(() => {
  let saarePolicy = {
    tenantId: 'UNASSIGNED_TENANT',
    gateway: 'https://api.saare.es/v1/chat/completions',
    failClosed: true
  };

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'SAARE_POLICY_INIT') saarePolicy = e.data.config;
  });

  // Endpoints de generación de prompts en ChatGPT, Gemini, Claude y Copilot
  const LLM_ENDPOINTS = [
    /chatgpt\.com\/backend-api\/conversation/,
    /gemini\.google\.com\/_\/BardChatUi\/data\/assistant\.lamda\.BardFrontendService\/StreamGenerate/,
    /claude\.ai\/api\/organizations\/[^/]+\/chat_conversations\/[^/]+\/completion/,
    /copilot\.microsoft\.com\/c\/api\/conversations/
  ];

  const originalFetch = window.fetch;
  window.fetch = async function (input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const isPromptRequest = init?.method?.toUpperCase() === 'POST' &&
      LLM_ENDPOINTS.some((rx) => rx.test(url));

    if (!isPromptRequest) {
      return originalFetch.apply(this, arguments);
    }

    const rawBody = typeof init.body === 'string' ? init.body : '';

    try {
      const auditRes = await originalFetch(saarePolicy.gateway, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Saare-Tenant-ID': saarePolicy.tenantId,
          'x-saare-tenant': saarePolicy.tenantId
        },
        body: JSON.stringify({
          prompt: rawBody.slice(0, 12000),
          tenant: saarePolicy.tenantId,
          source_host: window.location.hostname
        })
      });

      const verdict = await auditRes.json();
      if (verdict?.decision === 'DENY' || verdict?.verdict === 'FAIL_CLOSED_BLOCKED') {
        alert(`🛡️ S.A.A.R.E. DLP [${saarePolicy.tenantId}]: Envío bloqueado por detección de datos sensibles o incumplimiento normativo.`);
        return new Response(JSON.stringify({ error: 'BLOCKED_BY_SAARE_L7' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      if (saarePolicy.failClosed) {
        return new Response(JSON.stringify({ error: 'SAARE_FAIL_CLOSED' }), { status: 503 });
      }
    }

    return originalFetch.apply(this, arguments);
  };
})();