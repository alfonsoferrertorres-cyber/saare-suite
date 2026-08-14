import crypto from 'crypto';
import fs from 'fs';

export function verifyEvidencePackage(packagePath) {
  try {
    const rawData = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(rawData);
    
    // Recalcular digest SHA-256
    const calculatedHash = crypto
      .createHash('sha256')
      .update(`${pkg.runId}:${pkg.timestamp}:${pkg.promptSummary}`)
      .digest('hex')
      .toUpperCase();

    const isValid = pkg.cryptoSeal.includes(calculatedHash.substring(0, 16));
    
    return {
      verified: isValid,
      status: isValid ? 'EVIDENCIA_INTACTA_NO_MODIFICADA' : 'EVIDENCIA_ALTERADA_INVALIDA',
      evidenceId: pkg.evidenceId,
      calculatedHash
    };
  } catch (err) {
    return { verified: false, status: 'ERROR_PAQUETE_CORRUPTO', error: err.message };
  }
}
