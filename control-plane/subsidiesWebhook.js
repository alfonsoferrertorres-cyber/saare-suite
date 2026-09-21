// Memoria en caliente oKV para los endpoints (si usas D1/KV cámbialo aquí)
const webhookConfigs = new Map();

export async function dispatchWebhookEvent(tenantId, payload, env) {
  try {
    // Buscar configuración de webhook en KV o caché
    let config = null;
    if (env.SAARE_VAULT_KV) {
      config = await env.SAARE_VAULT_KV.get(`webhook_config_${tenantId}`, 'json');
    }
    
    if (!config || !config.target_url) {
      return { success: false, reason: "No webhook target configured" };
    }

    const response = await fetch(config.target_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Saare-Signature': config.secret_token || ''
      },
      body: JSON.stringify(payload)
    });

    return { success: response.ok, status: response.status };
  } catch (err) {
    console.error("[Subsidies Webhook] Error dispatching event:", err);
    return { success: false, error: err.message };
  }
}

  // POST /api/v1/subsidies/webhook/test (Probar envío)
  if (url.pathname === '/api/v1/subsidies/webhook/test' && request.method === 'POST') {
    const tenantId = url.searchParams.get('tenant_id') || 'ENTERPRISE';
    const config = webhookConfigs.get(tenantId);

    if (!config) {
      return new Response(JSON.stringify({ error: 'Webhook no configurado' }), { status: 404 });
    }

    const payload = {
      event_type: 'TEST_PING',
      timestamp: new Date().toISOString(),
      tenant_id: tenantId,
      status: 'OPERATIONAL'
    };

    try {
      const res = await fetch(config.target_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.secret_token}`
        },
        body: JSON.stringify(payload)
      });

      return new Response(JSON.stringify({ success: res.ok, status_code: res.status }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
  }

  return null; // Si no coincide la ruta, pasa de largo
}