chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'EVALUATE_EX_ANTE') {
    chrome.storage.managed.get(['TenantId', 'ProxyGateway', 'FailClosed'], async (policy) => {
      const tenantId = policy.TenantId || 'DEMO_ENTERPRISE';
      const gateway = policy.ProxyGateway || 'https://api.saare.es/v1/chat/completions';
      const failClosed = policy.FailClosed !== undefined ? Boolean(policy.FailClosed) : true;

      try {
        const res = await fetch(gateway, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-saare-tenant': tenantId,
            'x-saare-source': msg.origin || 'browser-l7'
          },
          body: JSON.stringify({
            prompt: msg.prompt,
            tenant_id: tenantId,
            source: msg.origin || 'chatgpt.com'
          })
        });

        const data = await res.json();
        sendResponse(data);
      } catch (err) {
        sendResponse({ decision: failClosed ? 'DENY' : 'ALLOW', error: err.message });
      }
    });
    return true; // Mantiene abierto el canal asíncrono para sendResponse
  }
});