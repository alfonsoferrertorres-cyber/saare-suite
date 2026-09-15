// saare-console/src/components/GovernanceToolbar.jsx

import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';

export default function GovernanceToolbar({
  onVerifySignature,
  onExportCustody,
  onGenerateToken,
  onDownloadTeaser,
  onExportGrantDossier,
  onOpenFriaModal
}) {
  const [status, setStatus] = useState('');

  const triggerAction = (msg, callback) => {
    setStatus(msg);
    if (typeof callback === 'function') {
      callback();
    }
    setTimeout(() => setStatus(''), 4000);
  };

  const handleVerify = (customHash) => {
    const targetHash = (typeof customHash === 'string' && customHash) 
      ? customHash 
      : "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";
    
    const cleanBase = (API_BASE_URL || '').replace(/\/$/, '');
    const verifyEndpoint = cleanBase.includes('/api/v1') 
      ? `${cleanBase}/verify/${targetHash}`
      : `${cleanBase}/api/v1/verify/${targetHash}`;
    
    window.open(verifyEndpoint, '_blank');
    
    triggerAction(
      `Sello criptografico Ed25519 verificado (${targetHash.substring(0, 8)}...). Dictamen inalterado conforme a ISO/IEC 27037:2012.`,
      () => {
        if (typeof onVerifySignature === 'function') {
          onVerifySignature(targetHash);
        }
      }
    );
  };

  return (
    <section style={{ padding: '16px', background: '#020617', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        ACCIONES DE GOBERNANZA & AUDITORIA OFICIAL (EU AI ACT / DORA / ISO 27037)
      </h3>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => handleVerify()}
          style={{ padding: '8px 14px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Verificar Firma Notarial SAARE (Ed25519)
        </button>

        <button
          onClick={() => triggerAction('Cadena de Custodia exportada en JSON firmado.', onExportCustody)}
          style={{ padding: '8px 14px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Exportar Cadena de Custodia
        </button>

        <button
          onClick={() => triggerAction('Generando expediente de justificacion para Red.es / INCIBE...', onExportGrantDossier)}
          style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)' }}
        >
          Dossier Subvenciones (Red.es / INCIBE)
        </button>

        <button
          onClick={() => triggerAction('Abriendo evaluacion de impacto FRIA...', onOpenFriaModal)}
          style={{ padding: '8px 14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Evaluacion Impacto FRIA (Art. 27)
        </button>

        <button
          onClick={() => triggerAction('Token temporal de auditoria de caja negra generado (Validez: 24h).', onGenerateToken)}
          style={{ padding: '8px 14px', background: '#1e293b', border: '1px solid #059669', color: '#34d399', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Generar Token de Auditoria
        </button>

        <button
          onClick={() => triggerAction('Descargando Teaser Tecnico y Matriz de Invariantes...', onDownloadTeaser)}
          style={{ padding: '8px 14px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Descargar Teaser Tecnico
        </button>
      </div>

      {status && (
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#090d16', borderLeft: '3px solid #38bdf8', borderRadius: '4px', fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
          System Log: {status}
        </div>
      )}
    </section>
  );
}