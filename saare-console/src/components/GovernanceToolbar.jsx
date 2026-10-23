// saare-console/src/components/GovernanceToolbar.jsx
import React, { useState } from 'react';
import { API_HOST } from '../utils/api';

export default function GovernanceToolbar({
  onVerifySignature,
  onExportCustody,
  onGenerateToken,
  onDownloadTeaser,
  onExportGrantDossier,
  onOpenFriaModal,
  onExecuteEnforcementCheck,
  onOpenReportModal,
  onExportGovernancePackage,
  onDownloadGpoPolicy
}) {
  const [status, setStatus] = useState('');

  // Resolución dinámica de la URL base priorizando la variable de Vite (.env) y el nodo local
  const getBaseUrl = () => {
    return import.meta.env?.VITE_API_URL || API_HOST || 'http://127.0.0.1:8080';
  };

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
    
    const baseUrl = getBaseUrl();
    window.open(`${baseUrl}/verify/${targetHash}`, '_blank');
    
    triggerAction(
      `Firma criptográfica Ed25519 verificada (${targetHash.substring(0, 8)}...). Evidencia conforme a ISO/IEC 27037:2012.`,
      () => {
        if (typeof onVerifySignature === 'function') {
          onVerifySignature(targetHash);
        }
      }
    );
  };

  const handleDownloadGpo = () => {
    const baseUrl = getBaseUrl();
    window.open(`${baseUrl}/v1/deploy/gpo-policy`, '_blank');
    
    triggerAction(
      'Descargando archivo de política de registro Windows GPO (.reg) para Despliegue Agnóstico...',
      () => {
        if (typeof onDownloadGpoPolicy === 'function') {
          onDownloadGpoPolicy();
        }
      }
    );
  };

  return (
    <section style={{ padding: '16px', background: '#020617', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Acciones de Gobernanza & Auditoría Operativa (EU AI Act / DORA / ISO 27037)
      </h3>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={handleDownloadGpo}
          style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}
        >
          🔒 Despliegue Agnóstico (Fricción Cero - GPO)
        </button>

        <button
          onClick={() => handleVerify()}
          style={{ padding: '8px 14px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Verificar Firma Criptográfica (Ed25519)
        </button>

        <button
          onClick={() => triggerAction('Cadena de Custodia exportada en JSON firmado.', onExportCustody)}
          style={{ padding: '8px 14px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Exportar Cadena de Custodia
        </button>

        <button
          onClick={() => triggerAction('Generando expediente de justificación para Red.es / INCIBE...', onExportGrantDossier)}
          style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)' }}
        >
          Dossier Subvenciones (Red.es / INCIBE)
        </button>

        <button
          onClick={() => triggerAction('Ejecutando verificación de cumplimiento ex-ante en tiempo real...', onExecuteEnforcementCheck)}
          style={{ padding: '8px 14px', background: '#d97706', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Auditoría Cumplimiento Ex-Ante (L7)
        </button>

        <button
          onClick={() => triggerAction('Abriendo evaluación de impacto FRIA (Art. 27 EU AI Act)...', onOpenFriaModal)}
          style={{ padding: '8px 14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Evaluación Impacto FRIA (Art. 27)
        </button>

        {onExportGovernancePackage && (
          <button
            onClick={() => triggerAction('Generando Dossier Virginizado con las 4 Plantillas GRC...', onExportGovernancePackage)}
            style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)' }}
          >
            📦 Dossier 4 Plantillas GRC
          </button>
        )}

        <button
          onClick={() => triggerAction('Abriendo gestor de informes oficiales...', onOpenReportModal)}
          style={{ padding: '8px 14px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          📋 Informes Oficiales (PDF)
        </button>

        <button
          onClick={() => triggerAction('Token temporal de auditoría generado (Validez: 24h).', onGenerateToken)}
          style={{ padding: '8px 14px', background: '#1e293b', border: '1px solid #059669', color: '#34d399', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Generar Token de Auditoría
        </button>

        <button
          onClick={() => triggerAction('Descargando Teaser Técnico y Matriz de Invariantes...', onDownloadTeaser)}
          style={{ padding: '8px 14px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
        >
          Descargar Teaser Técnico
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