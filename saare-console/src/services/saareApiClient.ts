// saare-console/src/services/saareApiClient.ts
import { JudgeApiResponse, VaultRunsApiResponse } from '../types/saare';

const API_BASE_URL = process.env.NEXT_PUBLIC_SAARE_API_URL || 'https://api.saare.es';

export class SaareApiClient {
  private token: string | null;

  constructor(token?: string) {
    this.token = token || (typeof window !== 'undefined' ? localStorage.getItem('saare_token') : null);
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-SAARE-Spec': 'SGP-1.0',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
    };
  }

  /**
   * Envía un prompt o acción para juzgar Ex-Ante en RAM local
   */
  async judgePrompt(prompt: string, tenantId: string = 'ENTERPRISE'): Promise<JudgeApiResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/judge`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        prompt,
        tenant: tenantId,
        node_type: 'CONSOLE_PEP_L7'
      })
    });

    if (!response.ok && response.status !== 403) {
      throw new Error(`Error invocando Control Plane: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtiene el listado de evidencias y trazas registradas en la Bóveda Dual
   */
  async getVaultRuns(tenantId: string = 'ENTERPRISE'): Promise<VaultRunsApiResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/runs?tenant=${encodeURIComponent(tenantId)}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo evidencias de la bóveda: ${response.statusText}`);
    }

    return await response.json();
  }
}