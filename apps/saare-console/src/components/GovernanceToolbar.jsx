// saare-console/src/components/GovernanceToolbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { API_HOST } from '../utils/api';
import { SAARE_CONFIG } from '../config/saareState';

export default function GovernanceToolbar({
  targetHash = '',
  tenantId = '',
  rulesEnabled = true,
  onToggleTenantRules,
  onVerifySignature,
  onExportCustody,
  onGenerateToken,
  onDownloadTeaser,
  onExportGrantDossier,
  onOpenFriaModal,
  onExecuteEnforcementCheck,
  onOpenReportModal,
  onExportGovernancePackage,
  onExportLecActa
}) {
  const [status, setStatus] = useState('');
  const [localRulesEnabled, setLocalRulesEnabled] = useState(Boolean(rulesEnabled));
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalRulesEnabled(Boolean(rulesEnabled));
  }, [rulesEnabled]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getBaseUrl = () => {
    const raw =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      SAARE_CONFIG?.API_BASE_URL ||
      API_HOST ||
      (typeof window !== 'undefined' && window.location?.origin) ||
      '';
    return String(raw).trim().replace(/\/+$/, '').replace(/\/api\/v1$/i, '');
  };

  const triggerAction = (msg, callback) => {
    setStatus(msg);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setStatus('');
    }, 4500);

    if (typeof callback === 'function') {
      callback();
    }
  };

  const handleToggleRules = () => {
    const nextState = !localRulesEnabled;
    const tenantLabel = tenantId ? ` (${tenantId})` : '';
    const actionMsg = nextState
      ? `Activando reglas DLP / políticas del tenant${tenantLabel}...`
      : `Desactivando reglas DLP / políticas del tenant${tenantLabel} (modo permisivo)...`;

    triggerAction(actionMsg, () => {
      setLocalRulesEnabled(nextState);
      if (typeof onToggleTenantRules === 'function') {
        onToggleTenantRules(nextState);
      }
    });
  };

  const handleVerify = (customHash) => {
    const hashToVerify = typeof customHash === 'string' && customHash.trim()
      ? customHash.trim()
      : String(targetHash || '').trim();

    if (!hashToVerify) {
      triggerAction('No hay ningún hash de evidencia disponible para verificar.');
      return;
    }

    const baseUrl = getBaseUrl();
    if (baseUrl && typeof window !== 'undefined') {
      window.open(
        `${baseUrl}/api/v1/verify/${encodeURIComponent(hashToVerify)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }

    triggerAction(
      `Verificación Ed25519 solicitada para el hash ${hashToVerify.substring(0, 14)}...`,
      () => {
        if (typeof onVerifySignature === 'function') {
          onVerifySignature(hashToVerify);
        }
      }
    );
  };

  const btnBase = {
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '800',
    cursor: 'pointer'
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
          style={{ ...btnBase, background: '#0284c7', color: '#ffffff', border: 'none' }}
        >
          Verificar Firma (Ed25519)
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Exportando cadena de custodia del tenant...', onExportCustody)}
          style={{ ...btnBase, background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}
        >
          Exportar Custodia
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Generando expediente de justificación...', onExportGrantDossier)}
          style={{ ...btnBase, background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#ffffff', border: 'none' }}
        >
          Dossier Subvenciones
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Ejecutando verificación de cumplimiento...', onExecuteEnforcementCheck)}
          style={{ ...btnBase, background: '#d97706', color: '#ffffff', border: 'none' }}
        >
          Auditoría Ex-Ante (L7)
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Abriendo evaluación de impacto FRIA...', onOpenFriaModal)}
          style={{ ...btnBase, background: '#059669', color: '#ffffff', border: 'none' }}
        >
          Evaluación FRIA (Art. 27)
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Generando paquete de 4 plantillas GRC...', onExportGovernancePackage)}
          style={{ ...btnBase, background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', color: '#ffffff', border: 'none' }}
        >
          4 Plantillas GRC
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Abriendo gestor de informes oficiales...', onOpenReportModal)}
          style={{ ...btnBase, background: '#0284c7', color: '#ffffff', border: 'none' }}
        >
          Informes Oficiales (PDF)
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Solicitando token temporal de auditoría...', onGenerateToken)}
          style={{ ...btnBase, background: '#1e293b', border: '1px solid #059669', color: '#34d399' }}
        >
          Token de Auditoría
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Descargando documentación técnica...', onDownloadTeaser)}
          style={{ ...btnBase, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
        >
          Teaser Técnico
        </button>

        <button
          type="button"
          onClick={() => triggerAction('Generando acta probatoria Art. 326 LEC / ISO 27037...', onExportLecActa)}
          style={{ ...btnBase, background: '#312e81', color: '#e0e7ff', border: '1px solid #6366f1' }}
        >
          Acta LEC / ISO 27037
        </button>

        <button
          type="button"
          onClick={handleToggleRules}
          style={{
            ...btnBase,
            background: localRulesEnabled ? '#450a0a' : '#064e3b',
            color: localRulesEnabled ? '#fca5a5' : '#6ee7b7',
            border: localRulesEnabled ? '1px solid #dc2626' : '1px solid #10b981'
          }}
        >
          {localRulesEnabled ? 'Desactivar Reglas Tenant' : 'Activar Reglas Tenant'}
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