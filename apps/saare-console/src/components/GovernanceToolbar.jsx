// saare-console/src/components/GovernanceToolbar.jsx
import React, { useState } from 'react';
import { API_HOST } from '../utils/api';

export default function GovernanceToolbar({
  targetHash = '',
  onVerifySignature,
  onExportCustody,
  onGenerateToken,
  onDownloadTeaser,
  onExportGrantDossier,
  onOpenFriaModal,
  onExecuteEnforcementCheck,
  onOpenReportModal,
  onExportGovernancePackage
}) {
  const [status, setStatus] = useState('');

  const getBaseUrl = () => {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      API_HOST ||
      (typeof window !== 'undefined' && window.location?.origin) ||
      ''
    );
  };

  const triggerAction = (msg, callback) => {
    setStatus(msg);
    if (typeof callback === 'function') {
      callback();
    }
    setTimeout(() => setStatus(''), 4000);
  };

  const handleVerify = (customHash) => {
    const hashToVerify = typeof customHash === 'string' && customHash.trim()
      ? customHash.trim()
      : targetHash.trim();

    if (!hashToVerify) {
      triggerAction('No hay ningún hash de evidencia seleccionado para verificar.');
      return;
    }

    const baseUrl = String(getBaseUrl()).replace(/\/$/, '');
    if (baseUrl && typeof window !== 'undefined') {
      window.open(`${baseUrl}/api/v1/verify/${encodeURIComponent(hashToVerify)}`, '_blank', 'noopener,noreferrer');
    }

    triggerAction(
      `Verificación solicitada para el hash ${hashToVerify.substring(0, 12)}...`,
      () => {
        if (typeof onVerifySignature === 'function') {
          onVerifySignature(hashToVerify);
        }
      }
    );
  };

  return (
    <section style={{ padding: '16px', background: '#020617', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Acciones de Gobernanza &amp; Auditoría Operativa
      </h3>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleVerify()}
          style={{ padding: '8px 12px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Verificar Firma (Ed25519)
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Exportando cadena de custodia del tenant...', onExportCustody)}
          style={{ padding: '8px 12px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Exportar Custodia
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Generando expediente de justificación...', onExportGrantDossier)}
          style={{ padding: '8px 12px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Dossier Subvenciones
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Ejecutando verificación de cumplimiento...', onExecuteEnforcementCheck)}
          style={{ padding: '8px 12px', background: '#d97706', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Auditoría Ex-Ante (L7)
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Abriendo evaluación de impacto FRIA...', onOpenFriaModal)}
          style={{ padding: '8px 12px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Evaluación FRIA (Art. 27)
        </button>

        {typeof onExportGovernancePackage === 'function' && (
          <button
            type="button"
            onClick={() => triggerAction('Generando paquete de gobernanza...', onExportGovernancePackage)}
            style={{ padding: '8px 12px', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
          >
            4 Plantillas GRC
          </button>
        )}

        <button
          type="button"
          onClick={() => triggerAction('Abriendo gestor de informes oficiales...', onOpenReportModal)}
          style={{ padding: '8px 12px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Informes Oficiales (PDF)
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Solicitando token temporal de auditoría...', onGenerateToken)}
          style={{ padding: '8px 12px', background: '#1e293b', border: '1px solid #059669', color: '#34d399', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Token de Auditoría
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Descargando documentación técnica...', onDownloadTeaser)}
          style={{ padding: '8px 12px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Teaser Técnico
        </button>
      </div>

      {status && (
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#090d16', borderLeft: '3px solid #38bdf8', borderRadius: '4px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600' }}>
          System Log: {status}
        </div>
      )}
    </section>
  );
}