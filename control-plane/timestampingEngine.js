// control-plane/timestampingEngine.js
export class TimestampingEngine {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Genera una evidencia inmutable SHA-256 en memoria volátil (<2ms)
   * @param {Object|string} payload - Datos del evento L7
   */
  async generateSeal(payload) {
    let serializedData;
    if (typeof payload === 'string') {
      serializedData = payload;
    } else {
      try {
        serializedData = JSON.stringify(payload);
      } catch (err) {
        serializedData = String(payload);
      }
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(serializedData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const uint8Array = new Uint8Array(hashBuffer);
    
    let hashHex = '';
    for (let i = 0; i < uint8Array.length; i++) {
      hashHex += uint8Array[i].toString(16).padStart(2, '0');
    }

    return Object.freeze({
      timestamp: new Date().toISOString(),
      hash: hashHex,
      spec: 'SGP-1.0',
      status: 'SEALED'
    });
  }
}

export default TimestampingEngine;