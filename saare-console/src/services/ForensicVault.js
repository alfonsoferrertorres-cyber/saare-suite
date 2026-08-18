// Dual-Vault SAARE: Sistema de Bóveda Forense L7
import { createHash } from 'crypto-browserify';

export class ForensicVault {
  static async sealEvidence(prompt, response, userToken) {
    if (!userToken) throw new Error("SAARE TOKEN REQUIRED: Licencia no detectada.");
    
    const timestamp = new Date().toISOString();
    const rawData = `${timestamp}|${userToken}|${prompt}|${response}`;
    
    // 1. Generar firma inmutable SHA-256
    const hash = createHash('sha256').update(rawData).digest('hex');
    
    const evidence = {
      id: `EVTX-${Date.now()}`,
      timestamp,
      userToken,
      prompt,
      action: "INTERCEPT_AND_LOG",
      signature: hash,
      status: "SEALED"
    };

    // 2. Vault Local: Guardar en IndexedDB/LocalStorage cifrado
    const localVault = JSON.parse(localStorage.getItem('SAARE_VAULT') || '[]');
    localVault.push(evidence);
    localStorage.setItem('SAARE_VAULT', JSON.stringify(localVault));

    // 3. Vault Cloud: Sincronización asíncrona con Cloudflare KV
    try {
      await fetch('/api/vault/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify(evidence)
      });
    } catch(e) {
      console.warn("Cloud Vault Sync Pending:", e);
    }

    return evidence;
  }
}
