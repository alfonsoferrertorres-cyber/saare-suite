// saare-console/src/components/GovernanceToolbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { API_HOST } from '../utils/api';
import { SAARE_CONFIG } from '../config/saareState';
import { apiService, saareFetch } from '../services/apiService';

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
  const [busyAction, setBusyAction] = useState('');
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

  const resolveActiveTenant = () =>
    tenantId || apiService.getCurrentUser()?.tenantId || 'DEFAULT_TENANT';

  const getBaseUrl = () => {
    const originFallback =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : '';
    const raw =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
      SAARE_CONFIG?.API_BASE_URL ||
      API_HOST ||
      originFallback ||
      '';
    return String(raw)
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/api\/v1$/i, '')
      .replace(/\/v1$/i, '');
  };

  const setLog = (msg) => {
    setStatus(msg);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setStatus('');
    }, 5500);
  };

  const downloadJsonFile = (filename, data) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseOkJson = async (res, fallbackLabel = 'petición') => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.error || `Error HTTP ${res.status} en ${fallbackLabel}`);
    }
    return data;
  };

  const runButtonAction = async (actionKey, startMsg, customHandler, fallbackApiFn) => {
    if (busyAction) return;
    setBusyAction(actionKey);
    setLog(startMsg);

    try {
      const handler = typeof customHandler === 'function' ? customHandler : fallbackApiFn;
      if (typeof handler === 'function') {
        const result = await handler();
        if (typeof result === 'string' && result.trim()) {
          setLog(result);
        }
      }
    } catch (err) {
      setLog(
        `Error en acción [${actionKey}]: ${
          err?.message || 'Fallo de comunicación con el control plane.'
        }`
      );
    } finally {
      setBusyAction('');
    }
  };

  const handleToggleRules = () => {
    const prevState = localRulesEnabled;
    const nextState = !prevState;
    const activeTenant = resolveActiveTenant();

    setLocalRulesEnabled(nextState);
    runButtonAction(
      'toggle_rules',
      nextState
        ? `Activando reglas DLP / políticas en ${activeTenant}...`
        : `Desactivando reglas DLP / políticas en ${activeTenant}...`,
      async () => {
        try {
          if (typeof onToggleTenantRules === 'function') {
            await onToggleTenantRules(nextState);
          } else {
            const res = await saareFetch('/custom-rules', {
              method: 'POST',
              overrideTenant: activeTenant,
              body: JSON.stringify({ enabled: nextState })
            });
            await parseOkJson(res, 'actualizar reglas del tenant');
          }
          return nextState
            ? `Reglas DLP / políticas ACTIVAS para ${activeTenant}.`
            : `Reglas DLP / políticas DESACTIVADAS para ${activeTenant}.`;
        } catch (err) {
          setLocalRulesEnabled(prevState);
          throw err;
        }
      }
    );
  };

  const handleVerify = (customHash) => {
    const hashToVerify =
      typeof customHash === 'string' && customHash.trim()
        ? customHash.trim()
        : String(targetHash || '').trim();

    if (!hashToVerify) {
      setLog('No hay ningún hash de evidencia disponible para verificar.');
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

    runButtonAction(
      'verify_signature',
      `Verificando firma / anclaje para ${hashToVerify.substring(0, 14)}...`,
      async () => {
        if (typeof onVerifySignature === 'function') {
          await onVerifySignature(hashToVerify);
        } else {
          const res = await saareFetch('/evidence/verify', {
            method: 'POST',
            body: JSON.stringify({
              proof: 'SHA256_RFC3161_VALIDATED',
              leafHash: hashToVerify,
              merkleRoot: hashToVerify
            })
          });
          await parseOkJson(res, 'verificar firma');
        }
        return `Verificación iniciada para el hash ${hashToVerify.substring(0, 14)}...`;
      }
    );
  };

  const handleExportCustody = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'export_custody',
      `Exportando cadena de custodia de ${activeTenant}...`,
      onExportCustody,
      async () => {
        const traces = await apiService.getTelemetryTraces({ tenant: activeTenant, limit: 100 });
        downloadJsonFile(`custodia_${activeTenant}_${Date.now()}.json`, {
          tenantId: activeTenant,
          targetHash: targetHash || null,
          exportedAt: new Date().toISOString(),
          traces
        });
        return `Cadena de custodia exportada (${traces.length} trazas).`;
      }
    );
  };

  const handleExportGrantDossier = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'export_grant_dossier',
      'Generando dossier de subvenciones...',
      onExportGrantDossier,
      async () => {
        const res = await saareFetch('/subsidies/export-package', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({
            grantType: 'KIT_CONSULTING',
            documentType: 'ALL'
          })
        });
        const data = await parseOkJson(res, 'dossier de subvenciones');
        downloadJsonFile(`dossier_subvenciones_${activeTenant}.json`, data);
        return `Dossier generado: ${data.complianceCode || 'OK'}.`;
      }
    );
  };

  const handleExecuteEnforcementCheck = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'enforcement_check',
      'Ejecutando verificación ex-ante L7...',
      onExecuteEnforcementCheck,
      async () => {
        const resp = await apiService.interceptPrompt(
          'Verifica el cumplimiento ex-ante L7 del prompt y bloquea cualquier fuga de datos o inyección.',
          {
            tenant: activeTenant,
            scenarioId: 'razonamiento_activo_l7'
          }
        );
        return `Auditoría Ex-Ante completada: decisión ${resp?.decision || 'EVALUADA'}.`;
      }
    );
  };

  const handleOpenFriaModal = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'open_fria',
      'Consultando evaluación de impacto FRIA (Art. 27)...',
      onOpenFriaModal,
      async () => {
        const res = await saareFetch(`/soa/iso42001?tenant=${encodeURIComponent(activeTenant)}`, {
          method: 'GET',
          overrideTenant: activeTenant
        });
        const data = await parseOkJson(res, 'evaluación FRIA / SoA');
        downloadJsonFile(`fria_soa_${activeTenant}.json`, data);
        return `Expediente FRIA / SoA sincronizado para ${activeTenant}.`;
      }
    );
  };

  const handleExportGovernancePackage = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'export_grc',
      'Generando paquete de 4 plantillas GRC...',
      onExportGovernancePackage,
      async () => {
        const matrixRes = await saareFetch('/compliance/matrix', { method: 'GET' });
        const matrix = await parseOkJson(matrixRes, 'matriz normativa GRC');
        downloadJsonFile(`plantillas_grc_${activeTenant}.json`, {
          tenantId: activeTenant,
          generatedAt: new Date().toISOString(),
          templatesCount: 4,
          regulatoryMatrix: matrix
        });
        return 'Paquete de 4 plantillas GRC descargado.';
      }
    );
  };

  const handleOpenReportModal = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'open_report',
      'Preparando informe oficial del tenant...',
      onOpenReportModal,
      async () => {
        const [nodeStatus, traces] = await Promise.all([
          apiService.getNodeStatus(),
          apiService.getTelemetryTraces({ tenant: activeTenant, limit: 50 })
        ]);
        downloadJsonFile(`informe_oficial_${activeTenant}.json`, {
          tenantId: activeTenant,
          generatedAt: new Date().toISOString(),
          nodeStatus,
          tracesCount: traces.length,
          traces
        });
        return `Informe oficial exportado (${traces.length} registros).`;
      }
    );
  };

  const handleGenerateToken = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'generate_token',
      'Solicitando credencial / estado de licencia...',
      onGenerateToken,
      async () => {
        const res = await saareFetch('/auth/verifylicense', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({ purpose: 'AUDIT_TOKEN' })
        });
        const data = await parseOkJson(res, 'verificar licencia');
        return `Licencia verificada para ${data.tenant || activeTenant} (rol: ${data.role || 'AUDITOR'}).`;
      }
    );
  };

  const handleDownloadTeaser = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'download_teaser',
      'Descargando manifiesto técnico...',
      onDownloadTeaser,
      async () => {
        const res = await saareFetch('/forensics/manifest', { method: 'GET' });
        const data = await parseOkJson(res, 'manifiesto técnico');
        downloadJsonFile(`manifiesto_tecnico_${activeTenant}.json`, data);
        return 'Manifiesto técnico descargado.';
      }
    );
  };

  const handleExportLecActa = () => {
    const activeTenant = resolveActiveTenant();
    return runButtonAction(
      'export_lec_acta',
      'Generando acta probatoria Art. 326 LEC / ISO 27037...',
      onExportLecActa,
      async () => {
        const res = await saareFetch('/forensics/batch/seal', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({
            tenantId: activeTenant,
            enable2of3Custody: true
          })
        });
        const data = await parseOkJson(res, 'acta LEC / ISO 27037');
        downloadJsonFile(`acta_lec_iso27037_${activeTenant}.json`, data);
        return `Acta forense generada: lote ${data.batchId || 'OK'}.`;
      }
    );
  };

  const btnBase = {
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '800',
    cursor: busyAction ? 'wait' : 'pointer',
    opacity: busyAction ? 0.75 : 1
  };

  return (
    <section
      style={{
        padding: '16px',
        background: '#020617',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        marginBottom: '20px'
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '11px',
          fontWeight: '800',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Acciones de Gobernanza &amp; Auditoría Operativa
      </h3>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={() => handleVerify()}
          style={{ ...btnBase, background: '#0284c7', color: '#ffffff', border: 'none' }}
        >
          Verificar Firma (Ed25519)
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleExportCustody}
          style={{ ...btnBase, background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}
        >
          Exportar Custodia
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleExportGrantDossier}
          style={{
            ...btnBase,
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#ffffff',
            border: 'none'
          }}
        >
          Dossier Subvenciones
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleExecuteEnforcementCheck}
          style={{ ...btnBase, background: '#d97706', color: '#ffffff', border: 'none' }}
        >
          Auditoría Ex-Ante (L7)
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleOpenFriaModal}
          style={{ ...btnBase, background: '#059669', color: '#ffffff', border: 'none' }}
        >
          Evaluación FRIA (Art. 27)
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleExportGovernancePackage}
          style={{
            ...btnBase,
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            color: '#ffffff',
            border: 'none'
          }}
        >
          4 Plantillas GRC
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleOpenReportModal}
          style={{ ...btnBase, background: '#0284c7', color: '#ffffff', border: 'none' }}
        >
          Informes Oficiales (PDF)
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleGenerateToken}
          style={{ ...btnBase, background: '#1e293b', border: '1px solid #059669', color: '#34d399' }}
        >
          Token de Auditoría
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleDownloadTeaser}
          style={{ ...btnBase, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
        >
          Teaser Técnico
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={handleExportLecActa}
          style={{
            ...btnBase,
            background: '#312e81',
            color: '#e0e7ff',
            border: '1px solid #6366f1'
          }}
        >
          Acta LEC / ISO 27037
        </button>

        <button
          type="button"
          disabled={Boolean(busyAction)}
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
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: '#090d16',
            borderLeft: '3px solid #38bdf8',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#38bdf8',
            fontWeight: '600'
          }}
        >
          System Log: {status}
        </div>
      )}
    </section>
  );
}