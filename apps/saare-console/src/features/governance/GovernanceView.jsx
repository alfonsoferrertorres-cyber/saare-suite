// saare-console/src/features/governance/GovernanceView.jsx
import React, { useState, useMemo } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService, saareFetch } from '../../services/apiService';
import {
  CONSOLE_ACTIONS,
  DOCUMENT_LIFECYCLE,
  EXECUTION_STATUS
} from '../../domain/contracts';

const GOV_PALETTE = {
  cardBg: '#F6F6F5',
  insetBg: '#FFFFFF',
  mutedBg: '#E4E2DC',
  primaryBtnBg: '#4A5258',
  primaryBtnText: '#F6F6F5',
  secondaryBtnBg: '#FFFFFF',
  secondaryBtnText: '#1A1D20',
  textPrimary: '#1A1D20',
  textSecondary: '#4A5258',
  textMuted: '#5C646B',
  border: '#B5B7B9',
  charcoal: '#1A1D20',
  slate: '#4A5258',
  allowBg: '#E3ECE7',
  allowText: '#1B4332',
  allowBorder: '#749C88',
  denyBg: '#F3E4E2',
  denyText: '#6B211B',
  denyBorder: '#B87A74'
};

const CCN_STIC_863_BLOCKS = [
  {
    id: 'CCN-1',
    title: '1. Filtrado y guardrails en tiempo de ejecución',
    codes: 'op.exp.2 · mp.s.2',
    saareCoverage: 'PEP / interceptación ex-ante, políticas DLP y Fail-Closed en runtime',
    consultorTask: 'Revisar reglas de entrada/salida, PII y contención de acciones/agentes'
  },
  {
    id: 'CCN-2',
    title: '2. Acceso, identidad y segregación',
    codes: 'op.acc.1–4 · op.ext.4',
    saareCoverage: 'Aislamiento por tenant_id, roles/sesiones y control de conectores',
    consultorTask: 'Validar permisos en RAG/repositorios, segregación de funciones y flujos externos'
  },
  {
    id: 'CCN-3',
    title: '3. Registro, trazabilidad, vigilancia y HITL/HOTL',
    codes: 'op.exp.8 · op.mon.1/3 · P1–P2',
    saareCoverage: 'Trazas en bóveda D1, lotes Merkle, sellado RFC 3161 y actividad de sesión',
    consultorTask: 'Verificar cadena de custodia, alertas/anomalías y aprobaciones/controles humanos'
  },
  {
    id: 'CCN-4',
    title: '4. Inventario, ciclo de vida, calidad/sesgos y continuidad',
    codes: 'op.exp.1/3/5/7 · mp.sw.1 · mp.info.6',
    saareCoverage: 'Versionado/reglas por tenant, trazas de evaluación y respaldo/recuperación',
    consultorTask: 'Mantener catálogo de activos/modelos, pruebas adversarias/sesgos y planes de respaldo'
  },
  {
    id: 'CCN-5',
    title: '5. Gobernanza, cumplimiento y alfabetización',
    codes: 'org.1–4 · mp.per.3–4 · mp.info.1',
    saareCoverage: 'Asistente FRIA (Art. 27), SoA ISO/IEC 42001, matriz GRC y certificados',
    consultorTask: 'Documentar clasificación RIA, riesgos R01–R08, EIPD/Art. 27 y formación por rol'
  }
];

const GOVERNANCE_ITEMS = [
  {
    key: 'fria_soa',
    title: 'Evaluación FRIA (Art. 27) y SoA ISO/IEC 42001',
    ccnTag: 'CCN-5 · org.1–4 / mp.info.1',
    scope: 'Evaluación interna y declaración de aplicabilidad',
    documentState: DOCUMENT_LIFECYCLE.DRAFT,
    permission: CONSOLE_ACTIONS.RUN_FRIA_ASSESSMENT,
    description:
      'Consulta y exporta el expediente FRIA y el Statement of Applicability (SoA) asociado al tenant activo.'
  },
  {
    key: 'grc_templates',
    title: 'Paquete de 4 Plantillas GRC y Matriz Normativa',
    ccnTag: 'CCN-5 · org.1–4',
    scope: 'Documentación base de gobernanza y riesgo',
    documentState: DOCUMENT_LIFECYCLE.DRAFT,
    permission: CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE,
    description:
      'Genera un paquete JSON con la matriz regulatoria y las 4 plantillas GRC de trabajo interno.'
  },
  {
    key: 'grant_dossier',
    title: 'Dossier de Subvenciones',
    ccnTag: 'CCN-5 · Gobernanza y expedientes',
    scope: 'Soporte documental de elegibilidad / expediente',
    documentState: DOCUMENT_LIFECYCLE.DRAFT,
    permission: CONSOLE_ACTIONS.EXPORT_GRANT_DOSSIER,
    description:
      'Solicita al control plane el paquete documental de subvenciones para el tenant seleccionado.'
  },
  {
    key: 'official_report',
    title: 'Informe Oficial del Tenant',
    ccnTag: 'CCN-3 · op.exp.8 / op.mon.3',
    scope: 'Reporte operativo de estado y trazas observadas',
    documentState: DOCUMENT_LIFECYCLE.REVIEWED,
    permission: CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT,
    description:
      'Compila el estado observado del nodo y las trazas recientes de telemetría del tenant.'
  },
  {
    key: 'technical_manifest',
    title: 'Manifiesto / Teaser Técnico',
    ccnTag: 'CCN-3 / CCN-4 · op.exp.8',
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
  const [statusTone, setStatusTone] = useState('info');
  const [lastArtifact, setLastArtifact] = useState(null);
  const [localRuleForm, setLocalRuleForm] = useState({ name: '', pattern: '' });

  const activeRuleForm = externalRuleForm || localRuleForm;
  const updateRuleForm = externalSetRuleForm || setLocalRuleForm;

  const cleanTenant = String(tenantId || '').trim();
  const tenantLabel = cleanTenant || 'Sin asignar';
  const fileTenantSlug = cleanTenant || 'CONTEXTO';
  const canManageRules = can(CONSOLE_ACTIONS.TOGGLE_TENANT_RULES);

  const docCounts = useMemo(() => {
    return GOVERNANCE_ITEMS.reduce(
      (acc, item) => {
        if (item.documentState === DOCUMENT_LIFECYCLE.APPROVED) acc.approved += 1;
        else if (item.documentState === DOCUMENT_LIFECYCLE.REVIEWED) acc.reviewed += 1;
        else acc.draft += 1;
        return acc;
      },
      { draft: 0, reviewed: 0, approved: 0 }
    );
  }, []);

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
    setFeedback(`Procesando: ${item.title} (${tenantLabel})...`, 'info');

    try {
      let exportedData = null;
      let filename = `${item.key}_${fileTenantSlug}.json`;
      let summaryMsg = `${item.title} generado [${item.documentState}].`;

      if (item.key === 'fria_soa') {
        if (typeof onDownloadIso42001Dossier === 'function') {
          const dossierRes = await onDownloadIso42001Dossier();
          if (dossierRes && dossierRes.ok === false) {
            throw new Error(dossierRes.error || 'No se pudo exportar el dossier FRIA / SoA');
          }
          summaryMsg = `Dossier FRIA / SoA ISO 42001 exportado [${item.documentState}].`;
          setLastArtifact({
            title: item.title,
            filename: `dossier-iso42001-${fileTenantSlug.toLowerCase()}.json`,
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

        const query = cleanTenant ? `?tenant=${encodeURIComponent(cleanTenant)}` : '';
        const res = await saareFetch(`/soa/iso42001${query}`, {
          method: 'GET',
          overrideTenant: cleanTenant || undefined
        });
        const raw = await readJsonOrThrow(res, 'FRIA / SoA ISO 42001');
        exportedData = {
          tenantId: cleanTenant || null,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          certificationDisclaimer:
            'Documento de evaluación/gestión interna; no constituye certificación acreditada.',
          data: raw
        };
        filename = `fria_soa_${fileTenantSlug}.json`;
      } else if (item.key === 'grc_templates') {
        const res = await saareFetch('/compliance/matrix', {
          method: 'GET',
          overrideTenant: cleanTenant || undefined
        });
        const matrix = await readJsonOrThrow(res, 'matriz normativa GRC');
        exportedData = {
          tenantId: cleanTenant || null,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          certificationDisclaimer:
            'Plantillas de trabajo GRC; no sustituyen auditoría ni certificación externa acreditada.',
          templatesCount: 4,
          regulatoryMatrix: matrix
        };
        filename = `plantillas_grc_${fileTenantSlug}.json`;
      } else if (item.key === 'grant_dossier') {
        const res = await saareFetch('/subsidies/export-package', {
          method: 'POST',
          overrideTenant: cleanTenant || undefined,
          body: JSON.stringify({
            grantType: 'KIT_CONSULTING',
            documentType: 'ALL'
          })
        });
        const raw = await readJsonOrThrow(res, 'dossier de subvenciones');
        exportedData = {
          tenantId: cleanTenant || null,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          data: raw
        };
        filename = `dossier_subvenciones_${fileTenantSlug}.json`;
        if (raw?.complianceCode) {
          summaryMsg = `Dossier generado [${item.documentState}]: código ${raw.complianceCode}.`;
        }
      } else if (item.key === 'official_report') {
        const [nodeStatus, traces] = await Promise.all([
          apiService.getNodeStatus(cleanTenant || undefined),
          apiService.getTelemetryTraces({ tenant: cleanTenant || undefined, limit: 50 })
        ]);
        const traceList = Array.isArray(traces) ? traces : [];
        exportedData = {
          tenantId: cleanTenant || null,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          certificationDisclaimer:
            'Informe técnico generado por la consola; no equivale a dictamen o certificación acreditada.',
          nodeStatus,
          tracesCount: traceList.length,
          traces: traceList
        };
        filename = `informe_oficial_${fileTenantSlug}.json`;
        summaryMsg = `Informe oficial [${item.documentState}] exportado (${traceList.length} trazas).`;
      } else if (item.key === 'technical_manifest') {
        const res = await saareFetch('/forensics/manifest', {
          method: 'GET',
          overrideTenant: cleanTenant || undefined
        });
        const raw = await readJsonOrThrow(res, 'manifiesto técnico');
        exportedData = {
          tenantId: cleanTenant || null,
          generatedAt: new Date().toISOString(),
          documentState: item.documentState,
          data: raw
        };
        filename = `manifiesto_tecnico_${fileTenantSlug}.json`;
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
    if (!canManageRules) {
      setFeedback('Permiso denegado para modificar reglas DLP con el rol actual.', 'error');
      return;
    }

    const name = String(activeRuleForm?.name || '').trim();
    const pattern = String(activeRuleForm?.pattern || '').trim();
    if (!name || !pattern) {
      setFeedback('Indica un nombre y una expresión regular para la regla.', 'error');
      return;
    }

    try {
      // eslint-disable-next-line no-new
      new RegExp(pattern);
    } catch {
      setFeedback('La expresión regular introducida no es válida.', 'error');
      return;
    }

    if (typeof onSaveCustomRule === 'function') {
      await onSaveCustomRule(e);
      return;
    }
    setFeedback('Guarda de reglas no configurada en este entorno.', 'info');
  };

  const bannerColor =
    statusTone === 'error'
      ? GOV_PALETTE.denyText
      : statusTone === 'success'
        ? GOV_PALETTE.allowText
        : GOV_PALETTE.textPrimary;
  const bannerBg =
    statusTone === 'error'
      ? GOV_PALETTE.denyBg
      : statusTone === 'success'
        ? GOV_PALETTE.allowBg
        : GOV_PALETTE.cardBg;
  const bannerBorder =
    statusTone === 'error'
      ? GOV_PALETTE.denyBorder
      : statusTone === 'success'
        ? GOV_PALETTE.allowBorder
        : GOV_PALETTE.slate;

  const rulesList = Array.isArray(customRules) ? customRules : [];

  const cardStyle = {
    background: GOV_PALETTE.cardBg,
    border: `1px solid ${GOV_PALETTE.border}`,
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '800',
    color: GOV_PALETTE.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      <section
        aria-label="Indicadores de políticas y gobernanza"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px'
        }}
      >
        <div style={cardStyle}>
          <span style={labelStyle}>Reglas DLP · CCN-1 (op.exp.2)</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.2rem',
              color: tenantRulesEnabled ? GOV_PALETTE.allowText : GOV_PALETTE.textSecondary,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {tenantRulesEnabled ? 'ACTIVAS' : 'INACTIVAS'}
          </strong>
          <span style={{ fontSize: '0.72rem', color: GOV_PALETTE.textSecondary }}>
            Reglas personalizadas: {rulesList.length}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Contexto normativo</span>
          <strong
            className="saare-mono"
            style={{ fontSize: '0.9rem', color: GOV_PALETTE.textPrimary }}
          >
            ISO/IEC 42001 · CCN-STIC 863
          </strong>
          <span style={{ fontSize: '0.72rem', color: GOV_PALETTE.textSecondary }}>
            Tenant: {tenantLabel}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Artefactos GRC</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.2rem',
              color: GOV_PALETTE.textPrimary,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {GOVERNANCE_ITEMS.length}
          </strong>
          <span style={{ fontSize: '0.72rem', color: GOV_PALETTE.textSecondary }}>
            {docCounts.draft} borrador · {docCounts.reviewed} revisado · {docCounts.approved} aprobado
          </span>
        </div>
      </section>

      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>
            Políticas DLP y reglas personalizadas ({rulesList.length})
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeof onToggleTenantRules === 'function' && (
              <button
                type="button"
                disabled={isRulesLoading || !canManageRules}
                onClick={() => onToggleTenantRules(!tenantRulesEnabled)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: !canManageRules
                    ? GOV_PALETTE.mutedBg
                    : tenantRulesEnabled
                      ? GOV_PALETTE.primaryBtnBg
                      : GOV_PALETTE.secondaryBtnBg,
                  color: !canManageRules
                    ? GOV_PALETTE.textMuted
                    : tenantRulesEnabled
                      ? GOV_PALETTE.primaryBtnText
                      : GOV_PALETTE.textPrimary,
                  border: `1px solid ${GOV_PALETTE.border}`,
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: isRulesLoading ? 'wait' : canManageRules ? 'pointer' : 'not-allowed'
                }}
              >
                {tenantRulesEnabled ? 'Reglas ACTIVAS' : 'Reglas INACTIVAS'}
              </button>
            )}

            {typeof onApplyIso42001 === 'function' && (
              <button
                type="button"
                disabled={isRulesLoading || !canManageRules}
                onClick={onApplyIso42001}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: GOV_PALETTE.secondaryBtnBg,
                  color: canManageRules ? GOV_PALETTE.textPrimary : GOV_PALETTE.textMuted,
                  border: `1px solid ${GOV_PALETTE.border}`,
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: isRulesLoading ? 'wait' : canManageRules ? 'pointer' : 'not-allowed'
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
                background: GOV_PALETTE.insetBg,
                color: GOV_PALETTE.textPrimary,
                border: `1px solid ${GOV_PALETTE.border}`,
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
                background: GOV_PALETTE.insetBg,
                color: GOV_PALETTE.textPrimary,
                border: `1px solid ${GOV_PALETTE.border}`,
                fontSize: '0.75rem',
                minWidth: '220px',
                flex: 1
              }}
            />
            <button
              type="submit"
              disabled={isRulesLoading || !canManageRules}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                background: canManageRules ? GOV_PALETTE.primaryBtnBg : GOV_PALETTE.mutedBg,
                color: canManageRules ? GOV_PALETTE.primaryBtnText : GOV_PALETTE.textMuted,
                border: `1px solid ${canManageRules ? GOV_PALETTE.charcoal : GOV_PALETTE.border}`,
                fontSize: '0.74rem',
                fontWeight: '800',
                cursor: isRulesLoading ? 'wait' : canManageRules ? 'pointer' : 'not-allowed'
              }}
            >
              Guardar regla
            </button>
          </form>
        )}

        {rulesList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rulesList.map((rule) => (
              <div
                key={rule.id || rule.name}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: GOV_PALETTE.insetBg,
                  border: `1px solid ${GOV_PALETTE.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.74rem'
                }}
              >
                <div style={{ minWidth: 0, wordBreak: 'break-all' }}>
                  <strong style={{ color: GOV_PALETTE.textPrimary }}>{rule.name}</strong>{' '}
                  <code
                    className="saare-mono"
                    style={{ color: GOV_PALETTE.textSecondary, fontSize: '0.7rem' }}
                  >
                    {rule.pattern}
                  </code>
                </div>
                {typeof onRemoveCustomRule === 'function' && rule.id && (
                  <button
                    type="button"
                    disabled={isRulesLoading || !canManageRules}
                    onClick={() => onRemoveCustomRule(rule.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      background: GOV_PALETTE.mutedBg,
                      color: canManageRules ? GOV_PALETTE.denyText : GOV_PALETTE.textMuted,
                      border: `1px solid ${GOV_PALETTE.border}`,
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: isRulesLoading
                        ? 'wait'
                        : canManageRules
                          ? 'pointer'
                          : 'not-allowed',
                      whiteSpace: 'nowrap'
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

      {statusMessage && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: bannerBg,
            border: `1px solid ${bannerBorder}`,
            borderLeft: `3px solid ${bannerBorder}`,
            fontSize: '0.76rem',
            color: bannerColor,
            fontWeight: '700'
          }}
        >
          {statusMessage}
        </div>
      )}

      {lastArtifact && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: GOV_PALETTE.insetBg,
            border: `1px solid ${GOV_PALETTE.border}`,
            fontSize: '0.74rem',
            color: GOV_PALETTE.textSecondary,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span>
            Último artefacto exportado:{' '}
            <strong className="saare-mono" style={{ color: GOV_PALETTE.textPrimary }}>
              {lastArtifact.filename}
            </strong>{' '}
            · Estado: <strong>{lastArtifact.documentState}</strong>
          </span>
          <span className="saare-mono" style={{ color: GOV_PALETTE.textMuted, fontSize: '0.7rem' }}>
            {lastArtifact.generatedAt}
          </span>
        </div>
      )}

      <section aria-label="Alineación CCN-STIC 863" style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>Guía de alineación · 5 categorías CCN-STIC 863</span>
          <span style={{ fontSize: '0.7rem', color: GOV_PALETTE.textSecondary }}>
            Soporte técnico en consola + verificación documental del consultor
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '8px'
          }}
        >
          {CCN_STIC_863_BLOCKS.map((block) => (
            <div
              key={block.id}
              style={{
                background: GOV_PALETTE.insetBg,
                border: `1px solid ${GOV_PALETTE.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ fontWeight: '800', color: GOV_PALETTE.textPrimary }}>
                {block.title}
              </div>
              <div
                className="saare-mono"
                style={{ fontSize: '0.67rem', color: GOV_PALETTE.textMuted }}
              >
                {block.codes}
              </div>
              <div style={{ color: GOV_PALETTE.textSecondary, lineHeight: 1.35 }}>
                <strong style={{ color: GOV_PALETTE.textPrimary }}>S.A.A.R.E.:</strong>{' '}
                {block.saareCoverage}
              </div>
              <div style={{ color: GOV_PALETTE.textSecondary, lineHeight: 1.35 }}>
                <strong style={{ color: GOV_PALETTE.textPrimary }}>Consultor:</strong>{' '}
                {block.consultorTask}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span style={labelStyle}>Documentación GRC, evaluaciones y subvenciones</span>
          <span style={{ fontSize: '0.72rem', color: GOV_PALETTE.textSecondary }}>
            Tenant activo: <strong style={{ color: GOV_PALETTE.textPrimary }}>{tenantLabel}</strong>
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.76rem',
            color: GOV_PALETTE.textSecondary,
            lineHeight: 1.45
          }}
        >
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
                background: GOV_PALETTE.secondaryBtnBg,
                color: GOV_PALETTE.textPrimary,
                border: `1px solid ${GOV_PALETTE.border}`,
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
                background: GOV_PALETTE.mutedBg,
                color: GOV_PALETTE.textPrimary,
                border: `1px solid ${GOV_PALETTE.border}`,
                fontSize: '0.73rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Hub de Subvenciones
            </button>
          )}

          {SoaCompilerSlot}
        </div>
      </section>

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
                background: GOV_PALETTE.cardBg,
                border: `1px solid ${GOV_PALETTE.border}`,
                borderRadius: '10px',
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
                  <strong style={{ fontSize: '0.84rem', color: GOV_PALETTE.textPrimary }}>
                    {item.title}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: GOV_PALETTE.mutedBg,
                      color: GOV_PALETTE.textPrimary,
                      border: `1px solid ${GOV_PALETTE.border}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.documentState}
                  </span>
                </div>

                <div
                  className="saare-mono"
                  style={{ fontSize: '0.68rem', color: GOV_PALETTE.textMuted }}
                >
                  {item.ccnTag}
                </div>

                <div style={{ fontSize: '0.7rem', color: GOV_PALETTE.textSecondary }}>
                  Alcance: {item.scope}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: GOV_PALETTE.textSecondary,
                    lineHeight: 1.45
                  }}
                >
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
                    background: allowed ? GOV_PALETTE.primaryBtnBg : GOV_PALETTE.mutedBg,
                    color: allowed ? GOV_PALETTE.primaryBtnText : GOV_PALETTE.textMuted,
                    border: `1px solid ${allowed ? GOV_PALETTE.charcoal : GOV_PALETTE.border}`,
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
    </div>
  );
}