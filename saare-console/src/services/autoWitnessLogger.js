import fs from 'fs';
import path from 'path';

export async function processGovernanceReceipt(evidenceLog, userToken) {
  // A. Impresión testigo en la consola global
  console.log(`[REGISTRO_GLOBAL] Evidencia: ${evidenceLog.id} | Estado: ${evidenceLog.status} | Usuario: ${evidenceLog.user}`);

  // B. Notificación y registro en Control-Plane con el Token del usuario
  try {
    await fetch('http://localhost:3001/api/intercept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken || 'SAARE-TOKEN-USER-DEFAULT'}`
      },
      body: JSON.stringify(evidenceLog)
    });
  } catch (err) {
    console.error('[CONTROL-PLANE] Error de sincronización con el token:', err);
  }
}

