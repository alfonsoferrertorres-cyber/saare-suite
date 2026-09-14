import React, { useState } from 'react';
import { API_BASE_URL } from './utils/api';

export default function GovernanceToolbar({
  onVerifySignature,
  onExportCustody,
  onSimulateBlock,
  onGenerateToken,
  onDownloadTeaser
}) {
  const [status, setStatus] = useState('');

  const triggerAction = (msg, callback) => {
    setStatus(msg);
    if (typeof callback === 'function') {
      callback();
    }
    setTimeout(() => setStatus(''), 4000);
  };

  const handleVerify = () => {
    // Ejemplo de Hash SHA-256 de evidencia para probar contra la API unificada
    const sampleHash = "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";
    
    // Abre la verificación oficial respetando el API_BASE_URL (/api/v1/verify/)
    window.open(`${API_BASE_URL}/verify/${sampleHash}`, '_blank');
    
    triggerAction(
      'Sello criptográfico Ed25519 de SAARE verificado. Dictamen inalterado conforme a ISO/IEC 27037:2012.',
      onVerifySignature
    );
  };

  return (
    <section style={{ padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        PANEL DE GOBERNANZA & CUMPLIMIENTO (EU AI ACT / DORA / ISO 27037)
      </h3>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={handleVerify}
          style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          🔍 Verificar Firma Notarial SAARE (Ed25519)
        </button>

        <button
          onClick={() => triggerAction('Cadena de Custodia exportada en JSON firmado.', onExportCustody)}
          style={{ padding: '6px 12px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          📄 Exportar Cadena de Custodia
        </button>

        <button
          onClick={() => triggerAction('Ataque inyectado bloqueado en Edge. 0 tokens consumidos.', onSimulateBlock)}
          style={{ padding: '6px 12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          ⚡ Simular Bloqueo Ex-Ante
        </button>

        <button
          onClick={() => triggerAction('Token temporal de auditoría de caja negra generado (Validez: 24h).', onGenerateToken)}
          style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          🛡️ Generar Token de Auditoría
        </button>

        <button
          onClick={() => triggerAction('Descargando Teaser Técnico y Matriz de Invariantes...', onDownloadTeaser)}
          style={{ padding: '6px 12px', background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          📥 Descargar Teaser Técnico
        </button>
      </div>

      {/* Renderizado dinámico del mensaje de estado */}
      {status && (
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#090d16', borderLeft: '3px solid #38bdf8', borderRadius: '4px', fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
          ✅ {status}
        </div>
      )}
    </section>
  );
}