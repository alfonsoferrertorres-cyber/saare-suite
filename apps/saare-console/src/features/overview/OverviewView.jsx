// saare-console/src/features/overview/OverviewView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useConsole } from '../../context/ConsoleContext';
import { apiService } from '../../services/apiService';
import { CONSOLE_ACTIONS, EXECUTION_STATUS } from '../../domain/contracts';

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
    background: '#0b0f19',
    border: '1px solid #1e293b',
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
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  };

  const secondaryBtnStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    background: '#111827',
    color: '#cbd5e1',
    border: '1px solid #334155',
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
          background: '#0b0f19',
          border: '1px solid #1e293b',
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
                background: isRuntimeOk ? 'rgba(6, 78, 59, 0.7)' : 'rgba(69, 10, 10, 0.7)',
                color: isRuntimeOk ? '#6ee7b7' : '#fca5a5',
                border: `1px solid ${isRuntimeOk ? '#10b981' : '#ef4444'}`
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
                background: '#0f172a',
                color: '#7dd3fc',
                border: '1px solid #0284c7'
              }}
            >
              PEP: {nodeStatus?.mode || 'FAIL-CLOSED'}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', wordBreak: 'break-word' }}>
            Tenant: <strong>{tenantId || 'Sin tenant vinculado'}</strong> · Ruta:{' '}
            <strong>{routeMode}</strong>
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
              background: canEvaluateL7 ? '#0284c7' : '#1e293b',
              color: canEvaluateL7 ? '#ffffff' : '#64748b',
              border: 'none',
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
              background: '#111827',
              color: canVerifyEvidence ? '#e2e8f0' : '#64748b',
              border: '1px solid #334155',
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
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
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
              color: '#94a3b8',
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
          <strong className="saare-mono" style={{ fontSize: '1.15rem', color: '#f8fafc' }}>
            {loadingKpis ? '—' : kpis.totalInterceptions}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Permitidas: {kpis.allowedActions} · Denegadas: {kpis.deniedActions} ({blockRate}%)
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Runtime</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.15rem',
              color: isRuntimeOk ? '#34d399' : '#f87171'
            }}
          >
            {nodeStatus?.status || 'NO_DISPONIBLE'}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Nodo: {nodeStatus?.nodeId || '—'}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Evidencias pendientes</span>
          <strong className="saare-mono" style={{ fontSize: '1.15rem', color: '#f8fafc' }}>
            {loadingKpis ? '—' : kpis.pendingConsolidation}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Por consolidar en lote</span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Última verificación</span>
          <strong
            className="saare-mono"
            style={{
              fontSize: '1.15rem',
              color:
                verificationStatus === EXECUTION_STATUS.VERIFIED
                  ? '#34d399'
                  : verificationStatus === EXECUTION_STATUS.FAILED
                  ? '#f87171'
                  : '#94a3b8'
            }}
          >
            {verificationLabel}
          </strong>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
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
          <span className="saare-mono" style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {activityLog.length} evento(s) en sesión
          </span>
        </div>

        {activityLog.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
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
                    background: '#020617',
                    borderLeft: `3px solid ${failed ? '#ef4444' : '#38bdf8'}`,
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                    <span style={{ color: '#e2e8f0', fontWeight: '600', wordBreak: 'break-word' }}>
                      {ev.summary}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {ev.module} · {ev.action} · {ev.timestamp}
                    </span>
                  </div>
                  <span
                    className="saare-mono"
                    style={{
                      color: failed ? '#fca5a5' : '#94a3b8',
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
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
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
                  borderColor: '#10b981',
                  color: '#6ee7b7',
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