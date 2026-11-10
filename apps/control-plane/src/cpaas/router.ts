// apps/control-plane/src/cpaas/router.ts
import { ICPaaSAdapter, CPaaSMessagePayload, CPaaSResponse } from './interface';

export class CPaaSManager {
  private adapters: Map<string, ICPaaSAdapter> = new Map();

  registerAdapter(key: string, adapter: ICPaaSAdapter) {
    this.adapters.set(key, adapter);
  }

  async sendWithFailover(payload: CPaaSMessagePayload, priorityOrder: string[]): Promise<CPaaSResponse> {
    for (const providerKey of priorityOrder) {
      const adapter = this.adapters.get(providerKey);
      if (!adapter) continue;

      try {
        const result = await adapter.sendMessage(payload);
        if (result.success) return result;
      } catch (err) {
        console.warn(`[CPaaS Failover] Falló ${providerKey}, probando siguiente proveedor...`);
      }
    }
    throw new Error('[CPaaS Error] Ninguno de los 4 proveedores CPaaS pudo procesar el mensaje.');
  }
}