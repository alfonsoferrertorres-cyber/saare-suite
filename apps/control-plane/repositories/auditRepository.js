// control-plane/repositories/auditRepository.js
import { BaseRepository } from "./baseRepository.js";

export class AuditRepository extends BaseRepository {
  constructor(env) {
    super(env);
  }

  // Registra un evento de inferencia/comando sellado ex-ante
  async logAuditEvent(eventData) {
    const query = `
      INSERT INTO audit_logs (id, audit_token, provider, digest, timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      eventData.id,
      eventData.auditToken,
      eventData.provider,
      eventData.digest,
      eventData.timestamp || Date.now(),
      eventData.status || "VERIFIED"
    ];

    const executor = await this.prepare(query, params);
    return await executor.run();
  }

  // Consulta el historial de evidencias para la consola GRC
  async getLatestLogs(limit = 50) {
    const query = `
      SELECT * FROM audit_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    const executor = await this.prepare(query, [limit]);
    return await executor.all();
  }
}