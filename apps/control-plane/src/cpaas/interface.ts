// apps/control-plane/src/cpaas/interface.ts

export interface CPaaSMessagePayload {
  to: string;
  from?: string;
  body: string;
  evidenceId?: string; // Trazabilidad SGP 1.0 / MS3V
}

export interface CPaaSResponse {
  success: boolean;
  provider: string;
  messageId: string;
  timestamp: string;
  rawResponse?: any;
}

export interface ICPaaSAdapter {
  name: string;
  sendMessage(payload: CPaaSMessagePayload): Promise<CPaaSResponse>;
}