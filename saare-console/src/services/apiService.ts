import { saareFetch } from '../utils/api';

export interface WebhookConfigPayload {
  tenant_id?: string;
  [key: string]: any;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export interface ComplianceReportData {
  fria?: Record<string, any>;
  vault?: Record<string, any>;
  grc?: Record<string, any>;
}

// 1. Guardar configuración Webhook
export const saveWebhookConfig = async (config: WebhookConfigPayload): Promise<WebhookResponse> => {
  const response = await saareFetch('/subsidies/webhook/config', {
    method: 'POST',
    headers: {
      'x-saare-tenant': config.tenant_id || 'ENTERPRISE'
    },
    body: JSON.stringify(config)
  });
  return response.json();
};

// 2. Probar Webhook
export const triggerWebhookTest = async (tenantId: string = 'ENTERPRISE'): Promise<WebhookResponse> => {
  const response = await saareFetch(`/subsidies/webhook/test?tenant_id=${tenantId}`, {
    method: 'POST',
    headers: {
      'x-saare-tenant': tenantId
    }
  });
  return response.json();
};

// 3. Obtener Datos para Informes (FRIA, Vault, GRC)
export const fetchReportData = async (
  useCaseId: string, 
  tenantId: string = 'ENTERPRISE'
): Promise<ComplianceReportData> => {
  const response = await saareFetch(`/reports/data/${useCaseId}`, {
    method: 'GET',
    headers: {
      'x-saare-tenant': tenantId,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener los datos del informe (${response.status})`);
  }

  return response.json();
};