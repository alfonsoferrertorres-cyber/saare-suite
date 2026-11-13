(() => {
  const originalFetch = window.fetch;

  function evaluateExAnteViaBridge(promptText) {
    return new Promise((resolve) => {
      const requestId = 'saare_' + Date.now() + '_' + Math.random().toString(36).slice(2);

      const handleReply = (event) => {
        if (event.source !== window || event.data?.type !== 'SAARE_L7_VERDICT') return;
        if (event.data.requestId !== requestId) return;
        window.removeEventListener('message', handleReply);
        resolve(event.data.payload);
      };

      window.addEventListener('message', handleReply);
      window.postMessage({
        type: 'SAARE_L7_INTERCEPT',
        requestId,
        prompt: promptText,
        origin: window.location.hostname
      }, '*');
    });
  }

  window.fetch = async function (...args) {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource?.url || '';

    // Detectar envío de conversación en ChatGPT
    if (url.includes('/backend-api/conversation') && config?.method === 'POST' && config?.body) {
      try {
        const bodyObj = JSON.parse(config.body);
        const parts = bodyObj?.messages?.[0]?.content?.parts;
        const promptText = Array.isArray(parts) ? parts.join(' ') : '';

        if (promptText) {
          const verdict = await evaluateExAnteViaBridge(promptText);
          if (verdict?.decision === 'DENY' || verdict?.blocked) {
            console.warn('[S.A.A.R.E. L7] Prompt bloqueado ex-ante por política DLP/GRC.');
            return new Response(
              JSON.stringify({ detail: 'Bloqueado por S.A.A.R.E. L7 Ex-Ante Policy (PII/Compliance)' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (e) {
        console.error('[S.A.A.R.E. L7] Error analizando payload:', e);
      }
    }

    return originalFetch.apply(this, args);
  };
})();