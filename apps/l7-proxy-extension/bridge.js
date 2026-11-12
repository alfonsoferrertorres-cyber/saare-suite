// bridge.js (Contexto aislado de extensión: lee GPO/Intune)
chrome.storage.managed.get(['TenantId', 'ProxyGateway', 'FailClosed'], (policy) => {
  window.postMessage({
    type: 'SAARE_POLICY_INIT',
    config: {
      tenantId: policy?.TenantId || 'UNASSIGNED_TENANT',
      gateway: policy?.ProxyGateway || 'https://api.saare.es/v1/chat/completions',
      failClosed: policy?.FailClosed !== false
    }
  }, '*');
});