// control-plane/subsidiesWebhook.js — Módulo de Despacho e Integración de Webhooks
const ramWebhookConfigCache = new Map();

export async function dispatchWebhookEvent(tenantId, payload, env) {
  try {
    let config = null;

    // 1. Buscar configuración en Cloudflare KV
    if (env && env.SAARE_VAULT_KV) {
      try {
        config = await env.SAARE_VAULT_KV.get(`webhook_config_${tenantId}`, 'json');
      } catch (e) {
        console.warn("[Subsidies Webhook] Error leyendo KV:", e);
      }
    }

    // 2. Fallback a memoria RAM si no está en KV
    if (!config) {
      config = ramWebhookConfigCache.get(tenantId);
    }

    if (!config || !config.target_url) {
      return { success: false, reason: "No webhook target configured" };
    }

    const response = await fetch(config.target_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Saare-Signature': config.secret_token || '',
        'Authorization': config.secret_token ? `Bearer ${config.secret_token}` : ''
      },
      body: JSON.stringify(payload)
    });

    return { success: response.ok, status: response.status };
  } catch (err) {
    console.error("[Subsidies Webhook] Error dispatching event:", err);
    return { success: false, error: err.message };
  }
}

export async function handleWebhookTestRoute(request, url, env) {
  if (url.pathname === '/api/v1/subsidies/webhook/test' && request.method === 'POST') {
    const tenantId = url.searchParams.get('tenant_id') || 'ENTERPRISE';

    const payload = {
      event_type: 'TEST_PING',
      timestamp: new Date().toISOString(),
      tenant_id: tenantId,
      status: 'OPERATIONAL'
    };

    const result = await dispatchWebhookEvent(tenantId, payload, env);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }

  return null;
}