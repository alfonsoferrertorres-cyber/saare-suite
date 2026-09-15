export interface WebhookConfigPayload {
  tenant_id?: string;
  target_url: string;
  secret_token: string;
}

export interface WebhookResponse {
  status?: string;
  success?: boolean;
  message?: string;
  error?: string;
  status_code?: number;
}