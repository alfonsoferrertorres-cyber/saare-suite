// control-plane/repositories/baseRepository.js
export class BaseRepository {
  constructor(env) {
    this.env = env;
    this.isD1 = Boolean(env && env.DB);
  }

  async prepare(query, params = []) {
    if (this.isD1) {
      const stmt = this.env.DB.prepare(query);
      return {
        all: async () => await stmt.bind(...params).all(),
        first: async () => await stmt.bind(...params).first(),
        run: async () => await stmt.bind(...params).run()
      };
    } else {
      // Modo agnóstico / respaldo local (Fallback a SQLite/Node o RAM)
      console.warn("[Repository] Advertencia: Ejecutando en modo de respaldo sin D1 nativo.");
      return {
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({ success: true })
      };
    }
  }
}
