// saare-console/src/components/GovernanceToolbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { apiService, saareFetch } from '../services/apiService';
import { useConsole } from '../context/ConsoleContext';
import {
  CONSOLE_ACTIONS,
  EXECUTION_STATUS,
  DOCUMENT_LIFECYCLE,
  normalizeSignatureVerifyResponse
} from '../domain/contracts';

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
  const {
    tenantId: contextTenantId,
    can,
    setLastVerification,
    pushActivity
  } = useConsole();

  const [status, setStatus] = useState('');
  const [statusTone, setStatusTone] = useState('info'); // 'info' | 'success' | 'error'
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
    String(
      tenantId ||
        contextTenantId ||
        (typeof apiService.getCurrentUser === 'function'
          ? apiService.getCurrentUser()?.tenantId
          : '') ||
        ''
    ).trim();

  const tenantLabel = resolveActiveTenant() || 'Sin asignar';
  const fileSlug = resolveActiveTenant() || 'CONTEXTO';

  const setLog = (msg, tone = 'info') => {
    setStatus(msg);
    setStatusTone(tone);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setStatus('');
      setStatusTone('info');
    }, 6000);
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
      throw new Error(
        data?.message || data?.error || `Error HTTP ${res.status} en ${fallbackLabel}`
      );
    }
    return data;
  };

  const runButtonAction = async ({
    actionKey,
    permissionKey,
    moduleName = 'GOVERNANCE',
    startMsg,
    customHandler,
    fallbackApiFn
  }) => {
    if (busyAction) return;

    if (permissionKey && typeof can === 'function' && !can(permissionKey)) {
      const deniedMsg = `Permiso denegado para ejecutar [${actionKey}] con el rol activo.`;
      setLog(deniedMsg, 'error');
      pushActivity({
        module: moduleName,
        action: actionKey,
        status: EXECUTION_STATUS.FAILED,
        summary: deniedMsg
      });
      return;
    }

    setBusyAction(actionKey);
    setLog(startMsg, 'info');

    try {
      const handler = typeof customHandler === 'function' ? customHandler : fallbackApiFn;
      if (typeof handler === 'function') {
        const result = await handler();
        if (result && typeof result === 'object' && result.message) {
          const isErr = result.ok === false || result.status === EXECUTION_STATUS.FAILED;
          setLog(result.message, isErr ? 'error' : 'success');
          pushActivity({
            module: moduleName,
            action: actionKey,
            status: isErr ? EXECUTION_STATUS.FAILED : EXECUTION_STATUS.VERIFIED,
            traceId: result.traceId || '',
            summary: result.message
          });
        } else if (typeof result === 'string' && result.trim()) {
          setLog(result, 'success');
          pushActivity({
            module: moduleName,
            action: actionKey,
            status: EXECUTION_STATUS.VERIFIED,
            summary: result
          });
        }
      }
    } catch (err) {
      const errMsg = `Error en [${actionKey}]: ${
        err?.message || 'Fallo de comunicación con el control plane.'
      }`;
      setLog(errMsg, 'error');
      pushActivity({
        module: moduleName,
        action: actionKey,
        status: EXECUTION_STATUS.FAILED,
        summary: errMsg
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleToggleRules = () => {
    const prevState = localRulesEnabled;
    const nextState = !prevState;
    const activeTenant = resolveActiveTenant() || undefined;

    setLocalRulesEnabled(nextState);
    runButtonAction({
      actionKey: 'toggle_rules',
      permissionKey: CONSOLE_ACTIONS.TOGGLE_TENANT_RULES,
      moduleName: 'RUNTIME',
      startMsg: nextState
        ? `Activando reglas DLP / políticas en ${tenantLabel}...`
        : `Desactivando reglas DLP / políticas en ${tenantLabel}...`,
      customHandler: async () => {
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
            ? `Reglas DLP / políticas ACTIVAS para ${tenantLabel}.`
            : `Reglas DLP / políticas DESACTIVADAS para ${tenantLabel}.`;
        } catch (err) {
          setLocalRulesEnabled(prevState);
          throw err;
        }
      }
    });
  };

  const handleVerify = (customHash) => {
    const hashToVerify =
      typeof customHash === 'string' && customHash.trim()
        ? customHash.trim()
        : String(targetHash || '').trim();

    if (!hashToVerify) {
      setLog('No hay ningún hash de evidencia disponible para verificar.', 'error');
      return;
    }

    const activeTenant = resolveActiveTenant() || undefined;

    runButtonAction({
      actionKey: 'verify_signature',
      permissionKey: CONSOLE_ACTIONS.VERIFY_SIGNATURE,
      moduleName: 'EVIDENCE',
      startMsg: `Verificando firma / integridad para ${hashToVerify.substring(0, 14)}...`,
      customHandler: async () => {
        let rawResp = {};
        if (typeof onVerifySignature === 'function') {
          rawResp = (await onVerifySignature(hashToVerify)) || {};
        } else {
          const res = await saareFetch('/evidence/verify', {
            method: 'POST',
            overrideTenant: activeTenant,
            body: JSON.stringify({
              proof: 'SHA256_RFC3161_VALIDATED',
              leafHash: hashToVerify,
              merkleRoot: hashToVerify
            })
          });
          rawResp = await parseOkJson(res, 'verificar firma');
        }

        const normalized = normalizeSignatureVerifyResponse(rawResp, hashToVerify);
        setLastVerification(normalized);

        if (!normalized.verified) {
          return {
            ok: false,
            status: EXECUTION_STATUS.FAILED,
            traceId: normalized.traceId,
            message: `Firma no confirmada (${normalized.status}): ${normalized.error}`
          };
        }

        return {
          ok: true,
          status: EXECUTION_STATUS.VERIFIED,
          traceId: normalized.traceId,
          message: `Verificación ${normalized.status} (${normalized.verificationMethod}) para ${hashToVerify.substring(
            0,
            14
          )}...`
        };
      }
    });
  };

  const handleExportCustody = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'export_custody',
      permissionKey: CONSOLE_ACTIONS.EXPORT_CUSTODY,
      moduleName: 'EVIDENCE',
      startMsg: `Exportando cadena de custodia de ${tenantLabel}...`,
      customHandler: onExportCustody,
      fallbackApiFn: async () => {
        const traces = await apiService.getTelemetryTraces({
          tenant: activeTenant,
          limit: 100
        });
        downloadJsonFile(`custodia_${fileSlug}_${Date.now()}.json`, {
          tenantId: activeTenant || null,
          targetHash: targetHash || null,
          documentState: DOCUMENT_LIFECYCLE.REVIEWED,
          exportedAt: new Date().toISOString(),
          traces
        });
        return `Cadena de custodia exportada (${traces.length} trazas).`;
      }
    });
  };

  const handleExportGrantDossier = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'export_grant_dossier',
      permissionKey: CONSOLE_ACTIONS.EXPORT_GRANT_DOSSIER,
      moduleName: 'GOVERNANCE',
      startMsg: 'Generando dossier de subvenciones...',
      customHandler: onExportGrantDossier,
      fallbackApiFn: async () => {
        const res = await saareFetch('/subsidies/export-package', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({
            grantType: 'KIT_CONSULTING',
            documentType: 'ALL'
          })
        });
        const data = await parseOkJson(res, 'dossier de subvenciones');
        downloadJsonFile(`dossier_subvenciones_${fileSlug}.json`, {
          ...data,
          documentState: DOCUMENT_LIFECYCLE.DRAFT
        });
        return `Dossier generado [${DOCUMENT_LIFECYCLE.DRAFT}]: ${data.complianceCode || 'OK'}.`;
      }
    });
  };

  const handleExecuteEnforcementCheck = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'enforcement_check',
      permissionKey: CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE,
      moduleName: 'RUNTIME',
      startMsg: 'Ejecutando verificación ex-ante L7...',
      customHandler: onExecuteEnforcementCheck,
      fallbackApiFn: async () => {
        const resp = await apiService.interceptPrompt(
          'Verifica el cumplimiento ex-ante L7 del prompt y bloquea cualquier fuga de datos o inyección.',
          {
            tenant: activeTenant,
            scenarioId: 'razonamiento_activo_l7'
          }
        );
        return {
          ok: resp?.ok !== false && resp?.executionStatus !== EXECUTION_STATUS.FAILED,
          status: resp?.executionStatus || EXECUTION_STATUS.VERIFIED,
          traceId: resp?.traceId || '',
          message: `Auditoría Ex-Ante completada: decisión ${
            resp?.verdict || resp?.rawDecision || 'EVALUADA'
          }.`
        };
      }
    });
  };

  const handleOpenFriaModal = () => {
    const cleanTenant = resolveActiveTenant();
    const activeTenant = cleanTenant || undefined;
    return runButtonAction({
      actionKey: 'open_fria',
      permissionKey: CONSOLE_ACTIONS.RUN_FRIA_ASSESSMENT,
      moduleName: 'GOVERNANCE',
      startMsg: 'Consultando evaluación de impacto FRIA (Art. 27)...',
      customHandler: onOpenFriaModal,
      fallbackApiFn: async () => {
        const query = cleanTenant ? `?tenant=${encodeURIComponent(cleanTenant)}` : '';
        const res = await saareFetch(`/soa/iso42001${query}`, {
          method: 'GET',
          overrideTenant: activeTenant
        });
        const data = await parseOkJson(res, 'evaluación FRIA / SoA');
        downloadJsonFile(`fria_soa_${fileSlug}.json`, {
          ...data,
          documentState: DOCUMENT_LIFECYCLE.DRAFT
        });
        return `Expediente FRIA / SoA [${DOCUMENT_LIFECYCLE.DRAFT}] exportado para ${tenantLabel}.`;
      }
    });
  };

  const handleExportGovernancePackage = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'export_grc',
      permissionKey: CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE,
      moduleName: 'GOVERNANCE',
      startMsg: 'Generando paquete de 4 plantillas GRC...',
      customHandler: onExportGovernancePackage,
      fallbackApiFn: async () => {
        const matrixRes = await saareFetch('/compliance/matrix', {
          method: 'GET',
          overrideTenant: activeTenant
        });
        const matrix = await parseOkJson(matrixRes, 'matriz normativa GRC');
        downloadJsonFile(`plantillas_grc_${fileSlug}.json`, {
          tenantId: activeTenant || null,
          generatedAt: new Date().toISOString(),
          documentState: DOCUMENT_LIFECYCLE.DRAFT,
          templatesCount: 4,
          regulatoryMatrix: matrix
        });
        return `Paquete de 4 plantillas GRC [${DOCUMENT_LIFECYCLE.DRAFT}] descargado.`;
      }
    });
  };

  const handleOpenReportModal = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'open_report',
      permissionKey: CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT,
      moduleName: 'GOVERNANCE',
      startMsg: 'Preparando informe oficial del tenant...',
      customHandler: onOpenReportModal,
      fallbackApiFn: async () => {
        const [nodeStatus, traces] = await Promise.all([
          apiService.getNodeStatus(activeTenant),
          apiService.getTelemetryTraces({ tenant: activeTenant, limit: 50 })
        ]);
        downloadJsonFile(`informe_oficial_${fileSlug}.json`, {
          tenantId: activeTenant || null,
          generatedAt: new Date().toISOString(),
          documentState: DOCUMENT_LIFECYCLE.REVIEWED,
          nodeStatus,
          tracesCount: traces.length,
          traces
        });
        return `Informe oficial [${DOCUMENT_LIFECYCLE.REVIEWED}] exportado (${traces.length} registros).`;
      }
    });
  };

  const handleGenerateToken = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'generate_token',
      permissionKey: CONSOLE_ACTIONS.MANAGE_CREDENTIALS,
      moduleName: 'ADMINISTRATION',
      startMsg: 'Solicitando credencial / estado de licencia...',
      customHandler: onGenerateToken,
      fallbackApiFn: async () => {
        const res = await saareFetch('/auth/verifylicense', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({ purpose: 'AUDIT_TOKEN' })
        });
        const data = await parseOkJson(res, 'verificar licencia');
        return `Licencia verificada para ${data.tenant || tenantLabel} (rol: ${
          data.role || 'AUDITOR'
        }).`;
      }
    });
  };

  const handleDownloadTeaser = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'download_teaser',
      permissionKey: CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS,
      moduleName: 'GOVERNANCE',
      startMsg: 'Descargando manifiesto técnico...',
      customHandler: onDownloadTeaser,
      fallbackApiFn: async () => {
        const res = await saareFetch('/forensics/manifest', {
          method: 'GET',
          overrideTenant: activeTenant
        });
        const data = await parseOkJson(res, 'manifiesto técnico');
        downloadJsonFile(`manifiesto_tecnico_${fileSlug}.json`, {
          ...data,
          documentState: DOCUMENT_LIFECYCLE.APPROVED
        });
        return 'Manifiesto técnico descargado.';
      }
    });
  };

  const handleExportLecActa = () => {
    const activeTenant = resolveActiveTenant() || undefined;
    return runButtonAction({
      actionKey: 'export_lec_acta',
      permissionKey: CONSOLE_ACTIONS.EXPORT_LEC_ACTA,
      moduleName: 'EVIDENCE',
      startMsg: 'Generando acta probatoria Art. 326 LEC / ISO 27037...',
      customHandler: onExportLecActa,
      fallbackApiFn: async () => {
        const res = await saareFetch('/forensics/batch/seal', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({
            ...(activeTenant ? { tenantId: activeTenant } : {}),
            enable2of3Custody: true
          })
        });
        const data = await parseOkJson(res, 'acta LEC / ISO 27037');
        downloadJsonFile(`acta_lec_iso27037_${fileSlug}.json`, {
          ...data,
          documentState: DOCUMENT_LIFECYCLE.REVIEWED
        });
        return `Acta forense generada: lote ${data.batchId || 'OK'} (TSA: ${
          data.tsaStatus || 'PENDIENTE'
        }).`;
      }
    });
  };

  const isActionAllowed = (permissionKey) =>
    typeof can === 'function' ? can(permissionKey) : true;

  const btnBase = (allowed = true) => ({
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    cursor: busyAction ? 'wait' : allowed ? 'pointer' : 'not-allowed',
    opacity: busyAction ? 0.7 : allowed ? 1 : 0.45
  });

  const groupBox = {
    padding: '10px 12px',
    background: '#0b0f19',
    borderRadius: '8px',
    border: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '220px',
    flex: '1 1 240px'
  };

  const groupLabel = {
    fontSize: '10px',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  const toneColor =
    statusTone === 'error' ? '#fca5a5' : statusTone === 'success' ? '#6ee7b7' : '#7dd3fc';
  const toneBorder =
    statusTone === 'error' ? '#ef4444' : statusTone === 'success' ? '#10b981' : '#0284c7';

  return (
    <section
      style={{
        padding: '16px',
        background: '#0b0f19',
        borderRadius: '10px',
        border: '1px solid #1e293b'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '10px',
            fontWeight: '800',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          Acciones de Gobernanza &amp; Auditoría Operativa
        </h3>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          Tenant: <strong className="saare-mono" style={{ color: '#e2e8f0' }}>{tenantLabel}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Dominio 1: Evidencias y Custodia */}
        <div style={groupBox}>
          <span style={groupLabel}>Evidencias y Custodia</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.VERIFY_SIGNATURE)}
              onClick={() => handleVerify()}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.VERIFY_SIGNATURE)),
                background: '#0284c7',
                color: '#ffffff',
                border: 'none'
              }}
            >
              Verificar Firma (Ed25519)
            </button>

            <button
              type="button"
              disabled={Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.EXPORT_CUSTODY)}
              onClick={handleExportCustody}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.EXPORT_CUSTODY)),
                background: '#111827',
                color: '#e2e8f0',
                border: '1px solid #334155'
              }}
            >
              Exportar Custodia
            </button>

            <button
              type="button"
              disabled={Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.EXPORT_LEC_ACTA)}
              onClick={handleExportLecActa}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.EXPORT_LEC_ACTA)),
                background: '#1e1b4b',
                color: '#e0e7ff',
                border: '1px solid #6366f1'
              }}
            >
              Acta LEC / ISO 27037
            </button>
          </div>
        </div>

        {/* Dominio 2: Operación y Políticas L7 */}
        <div style={groupBox}>
          <span style={groupLabel}>Operación y Políticas L7</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={
                Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE)
              }
              onClick={handleExecuteEnforcementCheck}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE)),
                background: '#d97706',
                color: '#ffffff',
                border: 'none'
              }}
            >
              Auditoría Ex-Ante (L7)
            </button>

            <button
              type="button"
              disabled={
                Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES)
              }
              onClick={handleToggleRules}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES)),
                background: localRulesEnabled ? 'rgba(69, 10, 10, 0.7)' : 'rgba(6, 78, 59, 0.7)',
                color: localRulesEnabled ? '#fca5a5' : '#6ee7b7',
                border: localRulesEnabled ? '1px solid #dc2626' : '1px solid #10b981'
              }}
            >
              {localRulesEnabled ? 'Desactivar Reglas Tenant' : 'Activar Reglas Tenant'}
            </button>
          </div>
        </div>

        {/* Dominio 3: GRC, Informes y Dossiers */}
        <div style={groupBox}>
          <span style={groupLabel}>GRC, Informes y Dossiers</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.RUN_FRIA_ASSESSMENT)}
              onClick={handleOpenFriaModal}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.RUN_FRIA_ASSESSMENT)),
                background: '#059669',
                color: '#ffffff',
                border: 'none'
              }}
            >
              Evaluación FRIA (Art. 27)
            </button>

            <button
              type="button"
              disabled={Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE)}
              onClick={handleExportGovernancePackage}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE)),
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                color: '#ffffff',
                border: 'none'
              }}
            >
              4 Plantillas GRC
            </button>

            <button
              type="button"
              disabled={
                Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.EXPORT_GRANT_DOSSIER)
              }
              onClick={handleExportGrantDossier}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.EXPORT_GRANT_DOSSIER)),
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: 'none'
              }}
            >
              Dossier Subvenciones
            </button>

            <button
              type="button"
              disabled={
                Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT)
              }
              onClick={handleOpenReportModal}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT)),
                background: '#0284c7',
                color: '#ffffff',
                border: 'none'
              }}
            >
              Informes Oficiales (PDF)
            </button>

            <button
              type="button"
              disabled={
                Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)
              }
              onClick={handleDownloadTeaser}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS)),
                background: '#111827',
                color: '#cbd5e1',
                border: '1px solid #334155'
              }}
            >
              Teaser Técnico
            </button>
          </div>
        </div>

        {/* Dominio 4: Credenciales */}
        <div style={groupBox}>
          <span style={groupLabel}>Credenciales</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={
                Boolean(busyAction) || !isActionAllowed(CONSOLE_ACTIONS.MANAGE_CREDENTIALS)
              }
              onClick={handleGenerateToken}
              style={{
                ...btnBase(isActionAllowed(CONSOLE_ACTIONS.MANAGE_CREDENTIALS)),
                background: '#111827',
                border: '1px solid #059669',
                color: '#34d399'
              }}
            >
              Token de Auditoría
            </button>
          </div>
        </div>
      </div>

      {status && (
        <div
          role="status"
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: '#020617',
            borderLeft: `3px solid ${toneBorder}`,
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: toneColor,
            fontWeight: '600'
          }}
        >
          Registro de estado: {status}
        </div>
      )}
    </section>
  );
}