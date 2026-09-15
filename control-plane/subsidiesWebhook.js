// Memoria en caliente oKV para los endpoints (si usas D1/KV cámbialo aquí)
const webhookConfigs = new Map();

export async function handleWebhookRoutes(request, env) {
  const url = new URL(request.url);

  // POST /api/v1/subsidies/webhook/config (Guardar URL)
  if (url.pathname === '/api/v1/subsidies/webhook/config' && request.method === 'POST') {
    const body = await request.json();
    webhookConfigs.set(body.tenant_id || 'ENTERPRISE', {
      target_url: body.target_url,
      secret_token: body.secret_token
    });

    return new Response(JSON.stringify({ status: 'success', message: 'Webhook guardado' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
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