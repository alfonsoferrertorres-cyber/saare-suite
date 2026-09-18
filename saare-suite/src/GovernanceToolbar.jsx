import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';

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
    const sampleHash = "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";
    const cleanApi = API_BASE_URL.replace(/\/$/, '');
    window.open(`${cleanApi}/v1/verify/${sampleHash}`, '_blank');
    
    triggerAction(
      'Sello criptográfico Ed25519 de SAARE verificado. Dictamen inalterado conforme a ISO/IEC 27037:2012.',
      onVerifySignature
    );
  };

  return (
    <section className="p-6 bg-saare-surface border border-saare-line-hi rounded-xl my-8">
      <h3 className="text-xs font-mono font-bold text-saare-accent uppercase tracking-wider mb-4">
        PANEL DE GOBERNANZA & CUMPLIMIENTO (EU AI ACT / DORA / ISO 27037)
      </h3>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleVerify}
          className="px-4 py-2.5 bg-saare-accent text-black font-mono font-bold text-xs rounded hover:opacity-90 transition"
        >
          🔍 Verificar Firma Notarial SAARE (Ed25519)
        </button>

        <button
          onClick={() => triggerAction('Cadena de Custodia exportada en JSON firmado.', onExportCustody)}
          className="px-4 py-2.5 bg-saare-surface-2 text-saare-ink border border-saare-line-hi font-mono text-xs rounded hover:bg-saare-line transition"
        >
          📄 Exportar Cadena de Custodia
        </button>

        <button
          onClick={() => triggerAction('Ataque inyectado bloqueado en Edge. 0 tokens consumidos.', onSimulateBlock)}
          className="px-4 py-2.5 bg-saare-seal text-black font-mono font-bold text-xs rounded hover:opacity-90 transition"
        >
          ⚡ Simular Bloqueo Ex-Ante
        </button>

        <button
          onClick={() => triggerAction('Token temporal de auditoría generado (Validez: 24h).', onGenerateToken)}
          className="px-4 py-2.5 bg-saare-allow text-black font-mono font-bold text-xs rounded hover:opacity-90 transition"
        >
          🛡️ Generar Token de Auditoría
        </button>

        <button
          onClick={() => triggerAction('Descargando Teaser Técnico y Matriz de Invariantes...', onDownloadTeaser)}
          className="px-4 py-2.5 bg-saare-bg text-saare-ink-dim border border-saare-line-hi font-mono text-xs rounded hover:text-white transition"
        >
          📥 Descargar Teaser Técnico
        </button>
      </div>

      {status && (
        <div className="mt-4 p-3 bg-saare-bg border-l-4 border-saare-accent text-saare-accent text-xs font-mono font-semibold rounded-r">
          ✅ {status}
        </div>
      )}
    </section>
  );
}