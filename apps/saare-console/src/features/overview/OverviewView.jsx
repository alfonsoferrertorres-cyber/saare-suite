// saare-console/src/features/overview/OverviewView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService } from '../../services/apiService';
import { CONSOLE_ACTIONS, EXECUTION_STATUS } from '../../domain/contracts';

const OVERVIEW_PALETTE = {
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
  slate: '#4A5258'
};

export default function OverviewView({
  evidences = [],
  billingInfo = null,
  isBillingLoading = false,
  onSyncVault,
  onOpenExecutiveView,
  onStartStripeUpgrade,
  onOpenStripePortal,
  onOpenAuthModal
}) {
  const {
    tenantId,
    routeMode,
    nodeStatus,
    loadingNode,
    refreshNodeStatus,
    lastVerification,
    activityLog,
    navigateTo,
    routes,
    can
  } = useConsole();

  const [kpis, setKpis] = useState({
    totalInterceptions: 0,
    allowedActions: 0,
    deniedActions: 0,
    pendingConsolidation: 0
  });
  const [loadingKpis, setLoadingKpis] = useState(false);

  const loadOverviewMetrics = useCallback(async () => {
    setLoadingKpis(true);
    try {
      const [kpiRes, traces] = await Promise.all([
        typeof apiService.getKpis === 'function'
          ? apiService.getKpis({ tenant: tenantId || undefined })
          : Promise.resolve(null),
        typeof apiService.getTelemetryTraces === 'function'
          ? apiService.getTelemetryTraces({ tenant: tenantId || undefined, limit: 50 })
          : Promise.resolve([])
      ]);

      const remoteList = Array.isArray(traces)
        ? traces
        : Array.isArray(traces?.traces)
        ? traces.traces
        : Array.isArray(traces?.evidences)
        ? traces.evidences
        : [];

      const matchingEvidences = Array.isArray(evidences)
        ? tenantId
          ? evidences.filter((item) => !item?.tenant || item.tenant === tenantId)
          : evidences
        : [];

      const sourceTraces = remoteList.length > 0 ? remoteList : matchingEvidences;

      const pendingCount = sourceTraces.filter(
        (t) => !t?.batchId && t?.tsaStatus !== 'TSA_VERIFIED' && Number(t?.anchored || 0) === 0
      ).length;

      const fallbackTotal = sourceTraces.length;
      const fallbackDenied = sourceTraces.filter(
        (t) => t?.verdict === 'DENY' || t?.verdict === 'RECHAZADO' || t?.decision === 'DENY'
      ).length;
      const fallbackAllowed = Math.max(0, fallbackTotal - fallbackDenied);

      setKpis({
        totalInterceptions: Number(kpiRes?.totalInterceptions ?? fallbackTotal),
        allowedActions: Number(kpiRes?.allowedActions ?? fallbackAllowed),
        deniedActions: Number(kpiRes?.deniedActions ?? fallbackDenied),
        pendingConsolidation: Number(kpiRes?.pendingConsolidation ?? pendingCount)
      });
    } catch {
      const matchingEvidences = Array.isArray(evidences)
        ? tenantId
          ? evidences.filter((item) => !item?.tenant || item.tenant === tenantId)
          : evidences
        : [];
      const fallbackTotal = matchingEvidences.length;
      const fallbackDenied = matchingEvidences.filter(
        (t) => t?.verdict === 'DENY' || t?.verdict === 'RECHAZADO' || t?.decision === 'DENY'
      ).length;
      setKpis({
        totalInterceptions: fallbackTotal,
        allowedActions: Math.max(0, fallbackTotal - fallbackDenied),
        deniedActions: fallbackDenied,
        pendingConsolidation: 0
      });
    } finally {
      setLoadingKpis(false);
    }
  }, [tenantId, evidences]);

  useEffect(() => {
    loadOverviewMetrics();
  }, [loadOverviewMetrics]);

  const handleRefreshAll = async () => {
    const tasks = [refreshNodeStatus(), loadOverviewMetrics()];
    if (typeof onSyncVault === 'function' && tenantId) {
      tasks.push(onSyncVault(tenantId));
    }
    await Promise.all(tasks);
  };

  const isRuntimeOk = Boolean(nodeStatus?.healthy);
  const canEvaluateL7 =
    can(CONSOLE_ACTIONS.EVALUATE_SIMULATION) || can(CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE);
  const canVerifyEvidence =
    can(CONSOLE_ACTIONS.VERIFY_SIGNATURE) || can(CONSOLE_ACTIONS.SYNC_VAULT);
  const verificationStatus = lastVerification?.status || EXECUTION_STATUS.NOT_RUN;

  const verificationLabel =
    verificationStatus === EXECUTION_STATUS.VERIFIED
      ? 'VERIFIED'
      : verificationStatus === EXECUTION_STATUS.FAILED
      ? 'FAILED'
      : 'NOT_RUN';

  const blockRate =
    kpis.totalInterceptions > 0
      ? ((kpis.deniedActions / kpis.totalInterceptions) * 100).toFixed(1)
      : '0.0';

  const cardStyle = {
    background: OVERVIEW_PALETTE.cardBg,
    border: `1px solid ${OVERVIEW_PALETTE.border}`,
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '800',
    color: OVERVIEW_PALETTE.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  const secondaryBtnStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    background: OVERVIEW_PALETTE.secondaryBtnBg,
    color: OVERVIEW_PALETTE.secondaryBtnText,
    border: `1px solid ${OVERVIEW_PALETTE.border}`,
    fontSize: '0.74rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {/* Cabecera primaria: estado del nodo, Fail-Closed y acciones nucleares */}
      <section
        style={{
          background: OVERVIEW_PALETTE.cardBg,
          border: `1px solid ${OVERVIEW_PALETTE.border}`,
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={labelStyle}>Estado operativo y PEP</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                background: isRuntimeOk ? '#DCE3DF' : '#E7D8D6',
                color: isRuntimeOk ? '#1F3A2D' : '#5C231E',
                border: `1px solid ${isRuntimeOk ? '#7C9487' : '#B88984'}`
              }}
            >
              {nodeStatus?.status || 'NO_DISPONIBLE'}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '999px',
                background: OVERVIEW_PALETTE.mutedBg,
                color: OVERVIEW_PALETTE.textPrimary,
                border: `1px solid ${OVERVIEW_PALETTE.border}`
              }}
            >
              PEP: {nodeStatus?.mode || 'FAIL-CLOSED'}
            </span>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: OVERVIEW_PALETTE.textSecondary,
              wordBreak: 'break-word'
            }}
          >
            Tenant: <strong style={{ color: OVERVIEW_PALETTE.textPrimary }}>{tenantId || 'Sin tenant vinculado'}</strong> ·
            Ruta: <strong style={{ color: OVERVIEW_PALETTE.textPrimary }}>{routeMode}</strong>
            {billingInfo?.planId ? ` · Plan: ${billingInfo.planId}` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            disabled={!canEvaluateL7}
            onClick={() => navigateTo(routes.RUNTIME)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: canEvaluateL7 ? OVERVIEW_PALETTE.primaryBtnBg : OVERVIEW_PALETTE.mutedBg,
              color: canEvaluateL7 ? OVERVIEW_PALETTE.primaryBtnText : OVERVIEW_PALETTE.textMuted,
              border: `1px solid ${canEvaluateL7 ? OVERVIEW_PALETTE.charcoal : OVERVIEW_PALETTE.border}`,
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: canEvaluateL7 ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap'
            }}
          >
            Evaluar consulta L7
          </button>

          <button
            type="button"
            disabled={!canVerifyEvidence}
            onClick={() => navigateTo(routes.EVIDENCE)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: OVERVIEW_PALETTE.secondaryBtnBg,
              color: canVerifyEvidence ? OVERVIEW_PALETTE.textPrimary : OVERVIEW_PALETTE.textMuted,
              border: `1px solid ${OVERVIEW_PALETTE.border}`,
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: canVerifyEvidence ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap'
            }}
          >
            Verificar evidencias
          </button>

          {!tenantId && typeof onOpenAuthModal === 'function' && (
            <button
              type="button"
              onClick={() => onOpenAuthModal('TOKEN')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: OVERVIEW_PALETTE.mutedBg,
                color: OVERVIEW_PALETTE.textPrimary,
                border: `1px solid ${OVERVIEW_PALETTE.charcoal}`,
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Cargar token
            </button>
          )}

          <button
            type="button"
            disabled={loadingNode || loadingKpis}
            onClick={handleRefreshAll}
            style={{
              ...secondaryBtnStyle,
              color: OVERVIEW_PALETTE.textSecondary,
              cursor: loadingNode || loadingKpis ? 'wait' : 'pointer'
            }}
          >
            {loadingNode || loadingKpis ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </section>

      {/* Indicadores clave de inspección, bloqueo y consolidación */}
      <section
        aria-label="Indicadores operativos"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px'
        }}
      >
        <div style={cardStyle}>
          <span style={labelStyle}>Inspecciones L7</span>
          <strong
            className="saare-mono"
            style={{ fontSize: '1.15rem', color: OVERVIEW_PALETTE.textPrimary }}
          >
            {loadingKpis ? '—' : kpis.totalInterceptions}
          </strong>
          <span style={{ fontSize: '0.72rem', color: OVERVIEW_PALETTE.textSecondary }}>
            Permitidas: {kpis.allowedActions} · Denegadas: {kpis.deniedActions} ({blockRate}%)
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Runtime</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.15rem',
              color: isRuntimeOk ? '#1F3A2D' : '#5C231E'
            }}
          >
            {nodeStatus?.status || 'NO_DISPONIBLE'}
          </strong>
          <span style={{ fontSize: '0.72rem', color: OVERVIEW_PALETTE.textSecondary }}>
            Nodo: {nodeStatus?.nodeId || '—'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Evidencias pendientes</span>
          <strong
            className="saare-mono"
            style={{ fontSize: '1.15rem', color: OVERVIEW_PALETTE.textPrimary }}
          >
            {loadingKpis ? '—' : kpis.pendingConsolidation}
          </strong>
          <span style={{ fontSize: '0.72rem', color: OVERVIEW_PALETTE.textSecondary }}>
            Por consolidar en lote
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Última verificación</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.15rem',
              color:
                verificationStatus === EXECUTION_STATUS.VERIFIED
                  ? '#1F3A2D'
                  : verificationStatus === EXECUTION_STATUS.FAILED
                  ? '#5C231E'
                  : OVERVIEW_PALETTE.textSecondary
            }}
          >
            {verificationLabel}
          </strong>
          <span
            style={{
              fontSize: '0.72rem',
              color: OVERVIEW_PALETTE.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {lastVerification?.verified
              ? `Digest: ${lastVerification.payloadDigest || '—'}`
              : lastVerification?.error || 'Sin resultado confirmado'}
          </span>
        </div>
      </section>

      {/* Actividad reciente observable */}
      <section style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}
        >
          <span style={labelStyle}>Actividad reciente</span>
          <span
            className="saare-mono"
            style={{ fontSize: '0.72rem', color: OVERVIEW_PALETTE.textMuted }}
          >
            {activityLog.length} evento(s) en sesión
          </span>
        </div>

        {activityLog.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: OVERVIEW_PALETTE.textSecondary }}>
            No hay operaciones registradas en la sesión actual.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activityLog.slice(0, 8).map((ev) => {
              const failed = ev.status === EXECUTION_STATUS.FAILED;
              return (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: OVERVIEW_PALETTE.insetBg,
                    border: `1px solid ${OVERVIEW_PALETTE.border}`,
                    borderLeft: `3px solid ${failed ? '#9E3B33' : OVERVIEW_PALETTE.slate}`,
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <span
                      style={{
                        color: OVERVIEW_PALETTE.textPrimary,
                        fontWeight: '600',
                        wordBreak: 'break-word'
                      }}
                    >
                      {ev.summary}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: OVERVIEW_PALETTE.textMuted }}>
                      {ev.module} · {ev.action} · {ev.timestamp}
                    </span>
                  </div>
                  <span
                    className="saare-mono"
                    style={{
                      color: failed ? '#5C231E' : OVERVIEW_PALETTE.textSecondary,
                      whiteSpace: 'nowrap',
                      fontSize: '0.72rem'
                    }}
                  >
                    [{ev.status}]{ev.traceId ? ` · trace: ${ev.traceId}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Acciones secundarias: vista ejecutiva y gestión de suscripción */}
      {(typeof onOpenExecutiveView === 'function' ||
        typeof onStartStripeUpgrade === 'function' ||
        (typeof onOpenStripePortal === 'function' && billingInfo?.planId)) && (
        <section
          aria-label="Acciones secundarias"
          style={{
            ...cardStyle,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '12px 16px'
          }}
        >
          <span style={{ fontSize: '0.74rem', color: OVERVIEW_PALETTE.textSecondary }}>
            Informes ejecutivos y gestión de suscripción
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeof onOpenExecutiveView === 'function' && (
              <button type="button" onClick={onOpenExecutiveView} style={secondaryBtnStyle}>
                Vista ejecutiva
              </button>
            )}

            {typeof onStartStripeUpgrade === 'function' && (
              <button
                type="button"
                disabled={isBillingLoading}
                onClick={() => onStartStripeUpgrade('PROFESSIONAL_649')}
                style={{
                  ...secondaryBtnStyle,
                  background: OVERVIEW_PALETTE.mutedBg,
                  borderColor: OVERVIEW_PALETTE.slate,
                  color: OVERVIEW_PALETTE.textPrimary,
                  cursor: isBillingLoading ? 'wait' : 'pointer'
                }}
              >
                {isBillingLoading ? 'Facturación...' : 'Mejorar plan'}
              </button>
            )}

            {typeof onOpenStripePortal === 'function' && billingInfo?.planId && (
              <button
                type="button"
                disabled={isBillingLoading}
                onClick={onOpenStripePortal}
                style={{
                  ...secondaryBtnStyle,
                  cursor: isBillingLoading ? 'wait' : 'pointer'
                }}
              >
                Portal facturación
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}