// control-plane/subsidiesWebhook.js — Módulo de Despacho e Integración de Webhooks (SAARE Core SGP 1.0)
const ramWebhookConfigCache = new Map();

/**
 * Genera un HMAC-SHA256 para validación de la firma del webhook
 */
async function generateHmacSignature(secret, bodyString) {
  if (!secret) return '';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(bodyString);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function dispatchWebhookEvent(tenantId, payload, env) {
  try {
    let config = null;

    // 1. Lectura prioritaria desde KV
    if (env && env.SAARE_VAULT_KV) {
      try {
        config = await env.SAARE_VAULT_KV.get(`webhook_config_${tenantId}`, 'json');
        if (config) {
          ramWebhookConfigCache.set(tenantId, config); // Actualizar cache volátil
        }
      } catch (e) {
        console.warn("[Subsidies Webhook] Error leyendo Cloudflare KV:", e);
      }
    }

    // 2. Fallback a cache en RAM si falla o no está disponible KV
    if (!config) {
      config = ramWebhookConfigCache.get(tenantId);
    }

    if (!config || !config.target_url) {
      return { success: false, reason: "No webhook target configured" };
    }

    const enrichedPayload = {
      ...payload,
      specVersion: "SGP-1.0",
      trustAnchor: "SAARE-MD-IPRES-2026"
    };

    const bodyString = JSON.stringify(enrichedPayload);
    
    // Generar firma HMAC-SHA256 con el secret_token
    const signature = await generateHmacSignature(config.secret_token, bodyString);

    const headers = {
      'Content-Type': 'application/json',
      'X-Saare-Signature': signature,
      'X-Saare-Tenant-ID': tenantId,
      'X-Saare-Spec': 'SGP-1.0'
    };

    if (config.secret_token) {
      headers['Authorization'] = `Bearer ${config.secret_token}`;
    }

    // Control de tiempo límite (5000 ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(config.target_url, {
      method: 'POST',
      headers,
      body: bodyString,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    return { 
      success: response.ok, 
      status: response.status,
      timestamp: new Date().toISOString()
    };

  } catch (err) {
    console.error("[Subsidies Webhook] Error dispatching event:", err);
    return { 
      success: false, 
      error: err.name === 'AbortError' ? 'Fetch timeout (5s)' : err.message 
    };
  }
}

export async function handleWebhookTestRoute(request, url, env) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Saare-Signature, X-Saare-Tenant-ID'
  };

  // Manejo de preflight CORS (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (url.pathname === '/api/v1/subsidies/webhook/test' && request.method === 'POST') {
    const tenantId = url.searchParams.get('tenant_id') || 'ENTERPRISE';

    const payload = {
      event_type: 'TEST_PING',
      timestamp: new Date().toISOString(),
      tenant_id: tenantId,
      status: 'OPERATIONAL',
      platform: 'S.A.A.R.E. Sovereign Control Plane (SGP 1.0 / v8.4)'
    };

    const result = await dispatchWebhookEvent(tenantId, payload, env);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: corsHeaders
    });
  }

  return null;
}