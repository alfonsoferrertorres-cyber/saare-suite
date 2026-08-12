import React, { useState } from 'react';
import { verifyEvidenceReceipt } from '../services/evidenceVault';

export function EvidenceVerify() {
  const [receiptInput, setReceiptInput] = useState('');
  const [publicKey, setPublicKey] = useState('4c271015b341e1f016e320e672fe2b05f8437c0153822f05736f464239e7144e');
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    try {
      const parsedReceipt = JSON.parse(receiptInput);
      const res = await verifyEvidenceReceipt(parsedReceipt, publicKey);
      setResult(res);
    } catch (err) {
      setResult({ valid: false, reason: 'JSON malformado o inválido: ' + err.message });
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #F59E0B', borderRadius: '8px', background: '#0F141C', color: '#CBD5E1', margin: '20px 0' }}>
      <h3 style={{ color: '#F59E0B', marginTop: 0 }}>Portal de Verificación Criptográfica Offline (/verify)</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '5px' }}>Clave Pública (Hex - Ed25519):</label>
        <input 
          type="text" 
          value={publicKey} 
          onChange={(e) => setPublicKey(e.target.value)} 
          style={{ width: '100%', background: '#050811', border: '1px solid #1E293B', color: '#00F0FF', padding: '8px', fontFamily: 'monospace' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '5px' }}>Recibo de Evidencia (JSON):</label>
        <textarea 
          rows="5"
          placeholder="Pega aquí el JSON del recibo..."
          value={receiptInput}
          onChange={(e) => setReceiptInput(e.target.value)}
          style={{ width: '100%', background: '#050811', border: '1px solid #1E293B', color: '#FFF', padding: '8px', fontFamily: 'monospace' }}
        />
      </div>

      <button onClick={handleVerify} style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '10px 18px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
        Verificar Recibo (SHA-256 + Ed25519)
      </button>

      {result && (
        <div style={{ background: '#050811', padding: '12px', borderRadius: '4px', border: `1px solid ${result.valid ? '#10B981' : '#EF4444'}` }}>
          <strong style={{ color: result.valid ? '#10B981' : '#EF4444' }}>
            {result.valid ? 'VERIFICACIÓN EXITOSA ?' : 'VERIFICACIÓN FALLIDA ?'}
          </strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>{result.reason}</p>
        </div>
      )}
    </div>
  );
}
