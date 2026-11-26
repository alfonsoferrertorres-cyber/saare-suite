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
        typeof apiService.getKpis === 'function' ? apiService.getKpis() : Promise.resolve(null),
        typeof apiService.getTelemetryTraces === 'function'
          ? apiService.getTelemetryTraces({ tenant: tenantId || undefined, limit: 50 })
          : Promise.resolve([])
      ]);

      const sourceTraces =
        Array.isArray(traces) && traces.length > 0
          ? traces
          : Array.isArray(evidences)
          ? evidences
          : [];

      const pendingCount = sourceTraces.filter(
        (t) => !t.batchId && t.tsaStatus !== 'TSA_VERIFIED' && Number(t.anchored || 0) === 0
      ).length;

      const fallbackTotal = sourceTraces.length;
      const fallbackDenied = sourceTraces.filter(
        (t) => t.verdict === 'DENY' || t.decision === 'DENY'
      ).length;
      const fallbackAllowed = Math.max(0, fallbackTotal - fallbackDenied);

      setKpis({
        totalInterceptions: Number(kpiRes?.totalInterceptions ?? fallbackTotal),
        allowedActions: Number(kpiRes?.allowedActions ?? fallbackAllowed),
        deniedActions: Number(kpiRes?.deniedActions ?? fallbackDenied),
        pendingConsolidation: Number(kpiRes?.pendingConsolidation ?? pendingCount)
      });
    } catch {
      const fallbackTotal = Array.isArray(evidences) ? evidences.length : 0;
      const fallbackDenied = Array.isArray(evidences)
        ? evidences.filter((t) => t.verdict === 'DENY' || t.decision === 'DENY').length
        : 0;
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
  }, [loadOverviewMetrics, tenantId]);

  const handleRefreshAll = async () => {
    const tasks = [refreshNodeStatus(), loadOverviewMetrics()];
    if (typeof onSyncVault === 'function' && tenantId) {
      tasks.push(onSyncVault(tenantId));
    }
    await Promise.all(tasks);
  };

  const isRuntimeOk = Boolean(nodeStatus?.healthy);
  const verificationStatus = lastVerification?.status || EXECUTION_STATUS.NOT_RUN;

  const verificationLabel =
    verificationStatus === EXECUTION_STATUS.VERIFIED
      ? 'VERIFIED'
      : verificationStatus === EXECUTION_STATUS.FAILED
      ? 'FAILED'
      : 'NOT_RUN';

  const cardStyle = {
    background: '#090d16',
    border: '1px solid #1e293b',
    borderRadius: '8px',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      {/* Cabecera de estado del nodo y acciones rápidas */}
      <section
        style={{
          background: '#020617',
          border: '1px solid #1e293b',
          borderRadius: '8px',
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
            <span style={labelStyle}>Estado general del nodo</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                background: isRuntimeOk ? '#064e3b' : '#450a0a',
                color: isRuntimeOk ? '#6ee7b7' : '#fca5a5',
                border: `1px solid ${isRuntimeOk ? '#10b981' : '#ef4444'}`
              }}
            >
              {nodeStatus?.status || 'NO_DISPONIBLE'}
            </span>
            {billingInfo?.planId && (
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
                Plan: {billingInfo.planId}
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', wordBreak: 'break-word' }}>
            Tenant: <strong>{tenantId || 'Sin tenant seleccionado'}</strong> · Ruta:{' '}
            <strong>{routeMode}</strong> · Modo PEP: <strong>{nodeStatus?.mode || 'FAIL-CLOSED'}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={!can(CONSOLE_ACTIONS.EVALUATE_SIMULATION) && !can(CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE)}
            onClick={() => navigateTo(routes.RUNTIME)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Evaluar consulta L7
          </button>

          <button
            type="button"
            disabled={!can(CONSOLE_ACTIONS.VERIFY_SIGNATURE) && !can(CONSOLE_ACTIONS.SYNC_VAULT)}
            onClick={() => navigateTo(routes.EVIDENCE)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Verificar evidencias
          </button>

          {typeof onOpenExecutiveView === 'function' && (
            <button
              type="button"
              onClick={onOpenExecutiveView}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#0f172a',
                color: '#7dd3fc',
                border: '1px solid #0284c7',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Vista ejecutiva
            </button>
          )}

          {typeof onStartStripeUpgrade === 'function' && (
            <button
              type="button"
              disabled={isBillingLoading}
              onClick={() => onStartStripeUpgrade('PROFESSIONAL_649')}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#065f46',
                color: '#ecfdf5',
                border: '1px solid #10b981',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: isBillingLoading ? 'wait' : 'pointer',
                whiteSpace: 'nowrap'
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
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #334155',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: isBillingLoading ? 'wait' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Portal facturación
            </button>
          )}

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
              padding: '8px 12px',
              borderRadius: '6px',
              background: '#090d16',
              color: '#94a3b8',
              border: '1px solid #334155',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: loadingNode || loadingKpis ? 'wait' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {loadingNode || loadingKpis ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </section>

      {/* Indicadores clave */}
      <section
        aria-label="Indicadores operativos"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}
      >
        <div style={cardStyle}>
          <span style={labelStyle}>Runtime</span>
          <strong
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
          <span style={labelStyle}>Inspecciones L7</span>
          <strong style={{ fontSize: '1.15rem', color: '#f8fafc' }}>
            {loadingKpis ? '—' : kpis.totalInterceptions}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Permitidas: {kpis.allowedActions} · Denegadas: {kpis.deniedActions}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Evidencias pendientes</span>
          <strong style={{ fontSize: '1.15rem', color: '#f8fafc' }}>
            {loadingKpis ? '—' : kpis.pendingConsolidation}
          </strong>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Por consolidar en lote
          </span>
        </div>

        <div style={cardStyle}>
          <span style={labelStyle}>Última verificación</span>
          <strong
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
      <section
        style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px'
          }}
        >
          <span style={labelStyle}>Actividad reciente</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
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
                    <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{ev.summary}</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {ev.module} · {ev.action} · {ev.timestamp}
                    </span>
                  </div>
                  <span style={{ color: '#94a3b8', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                    [{ev.status}]{ev.traceId ? ` · trace: ${ev.traceId}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}