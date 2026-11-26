// saare-console/src/features/governance/GovernanceView.jsx
import React, { useState } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService, saareFetch } from '../../services/apiService';
import {
  CONSOLE_ACTIONS,
  DOCUMENT_LIFECYCLE,
  EXECUTION_STATUS
} from '../../domain/contracts';

const GOVERNANCE_ITEMS = [
  {
    key: 'fria_soa',
    title: 'Evaluación FRIA (Art. 27) y SoA ISO/IEC 42001',
    scope: 'Evaluación interna y declaración de aplicabilidad',
    documentState: DOCUMENT_LIFECYCLE.DRAFT,
    permission: CONSOLE_ACTIONS.RUN_FRIA_ASSESSMENT,
    description:
      'Consulta y exporta el expediente FRIA y el Statement of Applicability (SoA) asociado al tenant activo.'
  },
  {
    key: 'grc_templates',
    title: 'Paquete de 4 Plantillas GRC y Matriz Normativa',
    scope: 'Documentación base de gobernanza y riesgo',
    documentState: DOCUMENT_LIFECYCLE.DRAFT,
    permission: CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE,
    description:
      'Genera un paquete JSON con la matriz regulatoria y las 4 plantillas GRC de trabajo interno.'
  },
  {
    key: 'grant_dossier',
    title: 'Dossier de Subvenciones',
    scope: 'Soporte documental de elegibilidad / expediente',
    documentState: DOCUMENT_LIFECYCLE.DRAFT,
    permission: CONSOLE_ACTIONS.EXPORT_GRANT_DOSSIER,
    description:
      'Solicita al control plane el paquete documental de subvenciones para el tenant seleccionado.'
  },
  {
    key: 'official_report',
    title: 'Informe Oficial del Tenant',
    scope: 'Reporte operativo de estado y trazas observadas',
    documentState: DOCUMENT_LIFECYCLE.REVIEWED,
    permission: CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT,
    description:
      'Compila el estado observado del nodo y las trazas recientes de telemetría del tenant.'
  },
  {
    key: 'technical_manifest',
    title: 'Manifiesto / Teaser Técnico',
    scope: 'Especificación técnica de arquitectura y forense',
    documentState: DOCUMENT_LIFECYCLE.APPROVED,
    permission: CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS,
    description:
      'Descarga el manifiesto técnico publicado por el servicio forense del control plane.'
  }
];

function triggerJsonDownload(filename, payload) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
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
}

async function readJsonOrThrow(res, label) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Error HTTP ${res.status} en ${label}`);
  }
  return data;
}

export default function GovernanceView({
  customRules = [],
  tenantRulesEnabled = true,
  ruleForm: externalRuleForm,
  setRuleForm: externalSetRuleForm,
  isRulesLoading = false,
  onToggleTenantRules,
  onApplyIso42001,
  onSaveCustomRule,
  onRemoveCustomRule,
  onDownloadIso42001Dossier,
  onOpenFriaModal,
  onOpenSubsidiesHub,
  SoaCompilerSlot = null
}) {
  const { tenantId, can, pushActivity } = useConsole();

  const [busyKey, setBusyKey] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info'); // 'info' | 'success' | 'error'
  const [lastArtifact, setLastArtifact] = useState(null);
  const [localRuleForm, setLocalRuleForm] = useState({ name: '', pattern: '' });

  const activeRuleForm = externalRuleForm || localRuleForm;
  const updateRuleForm = externalSetRuleForm || setLocalRuleForm;

  const activeTenant = String(tenantId || '').trim() || 'DEFAULT_TENANT';

  const setFeedback = (msg, tone = 'info') => {
    setStatusMessage(msg);
    setStatusTone(tone);
  };

  const executeGovernanceItem = async (item) => {
    if (busyKey) return;

    if (item.permission && !can(item.permission)) {
      const denied = `Permiso denegado para ejecutar [${item.title}] con el rol actual.`;
      setFeedback(denied, 'error');
      pushActivity({
        module: 'GOVERNANCE',
        action: item.key.toUpperCase(),
        status: EXECUTION_STATUS.FAILED,
        summary: denied
      });
      return;
    }

    setBusyKey(item.key);
    setFeedback(`Procesando: ${item.title} (${activeTenant})...`, 'info');

    try {
      let exportedData = null;
      let filename = `${item.key}_${activeTenant}.json`;
      let summaryMsg = `${item.title} generado [${item.documentState}].`;

      if (item.key === 'fria_soa') {
        if (typeof onDownloadIso42001Dossier === 'function') {
          onDownloadIso42001Dossier();
          summaryMsg = `Dossier FRIA / SoA ISO 42001 exportado [${item.documentState}].`;
          setLastArtifact({
            title: item.title,
            filename: `dossier-iso42001-${activeTenant.toLowerCase()}.json`,
            documentState: item.documentState,
            generatedAt: new Date().toISOString()
          });
          setFeedback(summaryMsg, 'success');
          pushActivity({
            module: 'GOVERNANCE',
            action: item.key.toUpperCase(),
            status: EXECUTION_STATUS.VERIFIED,
            summary: summaryMsg
          });
          return;
        }

        const res = await saareFetch(
          `/soa/iso42001?tenant=${encodeURIComponent(activeTenant)}`,
          {
            method: 'GET',
            overrideTenant: activeTenant
          }
        );
        const raw = await readJsonOrThrow(res, 'FRIA / SoA ISO 42001');
        exportedData = {
          tenantId: activeTenant,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          certificationDisclaimer:
            'Documento de evaluación/gestión interna; no constituye certificación acreditada.',
          data: raw
        };
        filename = `fria_soa_${activeTenant}.json`;
      } else if (item.key === 'grc_templates') {
        const res = await saareFetch('/compliance/matrix', {
          method: 'GET',
          overrideTenant: activeTenant
        });
        const matrix = await readJsonOrThrow(res, 'matriz normativa GRC');
        exportedData = {
          tenantId: activeTenant,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          certificationDisclaimer:
            'Plantillas de trabajo GRC; no sustituyen auditoría ni certificación externa acreditada.',
          templatesCount: 4,
          regulatoryMatrix: matrix
        };
        filename = `plantillas_grc_${activeTenant}.json`;
      } else if (item.key === 'grant_dossier') {
        const res = await saareFetch('/subsidies/export-package', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({
            grantType: 'KIT_CONSULTING',
            documentType: 'ALL'
          })
        });
        const raw = await readJsonOrThrow(res, 'dossier de subvenciones');
        exportedData = {
          tenantId: activeTenant,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          data: raw
        };
        filename = `dossier_subvenciones_${activeTenant}.json`;
        if (raw?.complianceCode) {
          summaryMsg = `Dossier generado [${item.documentState}]: código ${raw.complianceCode}.`;
        }
      } else if (item.key === 'official_report') {
        const [nodeStatus, traces] = await Promise.all([
          apiService.getNodeStatus(),
          apiService.getTelemetryTraces({ tenant: activeTenant, limit: 50 })
        ]);
        exportedData = {
          tenantId: activeTenant,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          certificationDisclaimer:
            'Informe técnico generado por la consola; no equivale a dictamen o certificación acreditada.',
          nodeStatus,
          tracesCount: traces.length,
          traces
        };
        filename = `informe_oficial_${activeTenant}.json`;
        summaryMsg = `Informe oficial [${item.documentState}] exportado (${traces.length} trazas).`;
      } else if (item.key === 'technical_manifest') {
        const res = await saareFetch('/forensics/manifest', {
          method: 'GET',
          overrideTenant: activeTenant
        });
        const raw = await readJsonOrThrow(res, 'manifiesto técnico');
        exportedData = {
          tenantId: activeTenant,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          data: raw
        };
        filename = `manifiesto_tecnico_${activeTenant}.json`;
      }

      triggerJsonDownload(filename, exportedData);
      setLastArtifact({
        title: item.title,
        filename,
        documentState: item.documentState,
        generatedAt: new Date().toISOString()
      });
      setFeedback(summaryMsg, 'success');
      pushActivity({
        module: 'GOVERNANCE',
        action: item.key.toUpperCase(),
        status: EXECUTION_STATUS.VERIFIED,
        summary: summaryMsg
      });
    } catch (err) {
      const errMsg = `Error en [${item.title}]: ${
        err?.message || 'fallo de comunicación con el control plane.'
      }`;
      setFeedback(errMsg, 'error');
      pushActivity({
        module: 'GOVERNANCE',
        action: item.key.toUpperCase(),
        status: EXECUTION_STATUS.FAILED,
        summary: errMsg
      });
    } finally {
      setBusyKey('');
    }
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    if (typeof onSaveCustomRule === 'function') {
      await onSaveCustomRule(e);
      return;
    }
    setFeedback('Guarda de reglas no configurada en este entorno.', 'info');
  };

  const bannerColor =
    statusTone === 'error' ? '#fca5a5' : statusTone === 'success' ? '#6ee7b7' : '#7dd3fc';
  const bannerBorder =
    statusTone === 'error' ? '#ef4444' : statusTone === 'success' ? '#10b981' : '#0284c7';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {/* Aviso normativo y accesos directos de gobernanza */}
      <section
        style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: '800',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            Gobernanza, evaluaciones y documentación GRC
          </span>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
            Tenant activo: <strong>{activeTenant}</strong>
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.45 }}>
          Los artefactos generados desde la consola se clasifican por estado documental (
          <strong>{DOCUMENT_LIFECYCLE.DRAFT}</strong>, <strong>{DOCUMENT_LIFECYCLE.REVIEWED}</strong>{' '}
          o <strong>{DOCUMENT_LIFECYCLE.APPROVED}</strong>). Una plantilla, evaluación interna o
          informe técnico no equivale a una certificación acreditada por organismo externo.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {typeof onOpenFriaModal === 'function' && (
            <button
              type="button"
              onClick={onOpenFriaModal}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                background: '#0f172a',
                color: '#7dd3fc',
                border: '1px solid #0284c7',
                fontSize: '0.73rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Asistente FRIA (Art. 27)
            </button>
          )}

          {typeof onOpenSubsidiesHub === 'function' && (
            <button
              type="button"
              onClick={onOpenSubsidiesHub}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                background: '#451a03',
                color: '#fcd34d',
                border: '1px solid #d97706',
                fontSize: '0.73rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Hub de Subvenciones
            </button>
          )}

          {SoaCompilerSlot}
        </div>
      </section>

      {statusMessage && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            background: '#020617',
            borderLeft: `3px solid ${bannerBorder}`,
            fontSize: '0.76rem',
            color: bannerColor,
            fontWeight: '600'
          }}
        >
          {statusMessage}
        </div>
      )}

      {lastArtifact && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            background: '#020617',
            border: '1px solid #1e293b',
            fontSize: '0.74rem',
            color: '#cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span>
            Último artefacto exportado: <strong>{lastArtifact.filename}</strong> · Estado:{' '}
            <strong>{lastArtifact.documentState}</strong>
          </span>
          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{lastArtifact.generatedAt}</span>
        </div>
      )}

      {/* Catálogo de operaciones GRC */}
      <section
        aria-label="Operaciones de cumplimiento y documentación"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '12px'
        }}
      >
        {GOVERNANCE_ITEMS.map((item) => {
          const allowed = can(item.permission);
          const isBusy = busyKey === item.key;

          return (
            <article
              key={item.key}
              style={{
                background: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                minWidth: 0
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}
                >
                  <strong style={{ fontSize: '0.84rem', color: '#f8fafc' }}>{item.title}</strong>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: '#0f172a',
                      color: '#38bdf8',
                      border: '1px solid #0284c7',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.documentState}
                  </span>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Alcance: {item.scope}</div>

                <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {item.description}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  disabled={Boolean(busyKey) || !allowed}
                  onClick={() => executeGovernanceItem(item)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: allowed ? '#0284c7' : '#1e293b',
                    color: allowed ? '#ffffff' : '#64748b',
                    border: allowed ? 'none' : '1px solid #334155',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    cursor: busyKey ? 'wait' : allowed ? 'pointer' : 'not-allowed',
                    opacity: busyKey && !isBusy ? 0.65 : 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isBusy ? 'Generando...' : 'Generar y exportar'}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Reglas DLP y preset ISO 42001 */}
      <section
        style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: '800',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            Políticas DLP y reglas personalizadas ({customRules.length})
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeof onToggleTenantRules === 'function' && (
              <button
                type="button"
                disabled={isRulesLoading || !can(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES)}
                onClick={() => onToggleTenantRules(!tenantRulesEnabled)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: tenantRulesEnabled ? '#059669' : '#334155',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: isRulesLoading ? 'wait' : 'pointer'
                }}
              >
                {tenantRulesEnabled ? 'Reglas ACTIVAS' : 'Reglas INACTIVAS'}
              </button>
            )}

            {typeof onApplyIso42001 === 'function' && (
              <button
                type="button"
                disabled={isRulesLoading || !can(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES)}
                onClick={onApplyIso42001}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: isRulesLoading ? 'wait' : 'pointer'
                }}
              >
                Aplicar preset ISO 42001
              </button>
            )}
          </div>
        </div>

        {typeof onSaveCustomRule === 'function' && (
          <form onSubmit={handleRuleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={activeRuleForm.name || ''}
              onChange={(e) => updateRuleForm({ ...activeRuleForm, name: e.target.value })}
              placeholder="Nombre de la regla (ej: Bloqueo NIF)"
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontSize: '0.75rem',
                minWidth: '180px'
              }}
            />
            <input
              type="text"
              value={activeRuleForm.pattern || ''}
              onChange={(e) => updateRuleForm({ ...activeRuleForm, pattern: e.target.value })}
              placeholder="Expresión regular (ej: \\b\\d{8}[A-Z]\\b)"
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
                fontSize: '0.75rem',
                minWidth: '220px',
                flex: 1
              }}
            />
            <button
              type="submit"
              disabled={isRulesLoading || !can(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES)}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: '800',
                cursor: isRulesLoading ? 'wait' : 'pointer'
              }}
            >
              Guardar regla
            </button>
          </form>
        )}

        {Array.isArray(customRules) && customRules.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {customRules.map((rule) => (
              <div
                key={rule.id || rule.name}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#020617',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.74rem'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong style={{ color: '#f8fafc' }}>{rule.name}</strong>{' '}
                  <code style={{ color: '#38bdf8', fontSize: '0.7rem' }}>{rule.pattern}</code>
                </div>
                {typeof onRemoveCustomRule === 'function' && rule.id && (
                  <button
                    type="button"
                    disabled={isRulesLoading}
                    onClick={() => onRemoveCustomRule(rule.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      background: '#1e293b',
                      color: '#fca5a5',
                      border: '1px solid #334155',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}