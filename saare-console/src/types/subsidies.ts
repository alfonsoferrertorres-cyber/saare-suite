export interface WebhookConfigPayload {
  tenant_id?: string;
  target_url: string;
  secret_token?: string;
  [key: string]: any;
}

export interface WebhookResponse {
  status?: string;
  success?: boolean;
  message?: string;
  error?: string;
  status_code?: number;
  [key: string]: any;
}