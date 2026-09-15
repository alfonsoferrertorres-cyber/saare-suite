import { WebhookConfigPayload, WebhookResponse } from '../types/subsidies';

// URL base de tu Control Plane Worker
const API_BASE_URL = 'https://console.saare.es'; // O tu dominio de worker

export const saveWebhookConfig = async (config: WebhookConfigPayload): Promise<WebhookResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/subsidies/webhook/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-saare-tenant': config.tenant_id || 'ENTERPRISE'
    },
    body: JSON.stringify(config)
  });
  return response.json();
};

export const triggerWebhookTest = async (tenantId: string = 'ENTERPRISE'): Promise<WebhookResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/subsidies/webhook/test?tenant_id=${tenantId}`, {
    method: 'POST',
    headers: {
      'x-saare-tenant': tenantId
    }
  });
  return response.json();
};