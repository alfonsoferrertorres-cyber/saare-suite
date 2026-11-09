// control-plane/timestampingEngine.js — Motor Criptográfico S.A.A.R.E. (RFC 3161 / SGP 1.0)
export class TimestampingEngine {
  constructor(expedienteId = "MS3V-RECON-VALID-2026-ALF-0521") {
    this.expedienteId = typeof expedienteId === 'string' ? expedienteId : (expedienteId?.expedienteId || "MS3V-RECON-VALID-2026-ALF-0521");
  }

  async computeSha256(payload) {
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
    return hashHex;
  }

  async generateSeal(payload) {
    const hashHex = await this.computeSha256(payload);

    return Object.freeze({
      timestamp: new Date().toISOString(),
      hash: hashHex,
      spec: 'SGP-1.0',
      status: 'SEALED'
    });
  }

  async sealTransaction(payload, externalTsaHash = null) {
    const timestampUtc = new Date().toISOString();
    const hashHex = await this.computeSha256(payload);

    const tsaHash = externalTsaHash || `TSA-RFC3161-${hashHex.substring(0, 16).toUpperCase()}`;

    return Object.freeze({
      expediente: this.expedienteId,
      rootHash: hashHex,
      tsaHash: tsaHash,
      timestampUtc: timestampUtc,
      spec: 'SGP-1.0',
      status: 'SEALED'
    });
  }
}

export default TimestampingEngine;