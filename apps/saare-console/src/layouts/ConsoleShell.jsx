// saare-console/src/layouts/ConsoleShell.jsx
import React, { useState, useEffect } from 'react';
import { useConsole } from '../context/ConsoleContext';
import { EXECUTION_STATUS } from '../domain/contracts';

const SHELL_PALETTE = {
  pageBg: '#E4E2DC',
  panelBg: '#F6F6F5',
  insetBg: '#FFFFFF',
  hoverBg: '#ECEAE4',
  activeBg: '#4A5258',
  activeText: '#F6F6F5',
  textPrimary: '#1A1D20',
  textSecondary: '#4A5258',
  textMuted: '#5C646B',
  border: '#B5B7B9',
  borderSubtle: '#C8CCD1',
  charcoal: '#1A1D20',
  slate: '#4A5258'
};

const ROLE_LABELS = {
  PLATFORM_ADMIN: 'Platform Admin',
  CISO_ADMIN: 'CISO Admin',
  CISO_SECOPS_LEVEL_3: 'SecOps L3',
  TENANT_ADMIN: 'Tenant Admin',
  DPO_GRC_LEVEL_2: 'DPO / GRC L2',
  BOARD_EXECUTIVE_LEVEL_1: 'Executive L1',
  OPERATIONAL_AGENT_USER: 'Operational Agent',
  READ_ONLY: 'Read Only'
};

function formatRoleLabel(role) {
  const clean = String(role || '').trim();
  if (!clean) return 'Sin rol';
  return ROLE_LABELS[clean] || clean.replace(/_/g, ' ');
}

export default function ConsoleShell({
  children,
  detailPanel = null,
  availableTenants = [],
  onLogout,
  headerActions = null
}) {
  const {
    tenantId,
    selectTenant,
    userEmail,
    role,
    sessionSummary,
    routeList,
    activeRoute,
    navigateTo,
    mobileNavOpen,
    setMobileNavOpen,
    routeMode,
    changeRouteMode,
    nodeStatus,
    loadingNode,
    refreshNodeStatus,
    activityLog,
    clearActivityLog
  } = useConsole();

  const [manualTenantInput, setManualTenantInput] = useState(tenantId || '');
  const [routeBusy, setRouteBusy] = useState(false);
  const [routeError, setRouteError] = useState('');

  useEffect(() => {
    setManualTenantInput(tenantId || '');
  }, [tenantId]);

  const handleApplyTenant = (e) => {
    e.preventDefault();
    selectTenant(manualTenantInput);
  };

  const handleSelectDropdownTenant = (e) => {
    const val = e.target.value;
    setManualTenantInput(val);
    selectTenant(val);
  };

  const handleSwitchRouteMode = async (nextMode) => {
    if (routeBusy || nextMode === routeMode) return;
    setRouteBusy(true);
    setRouteError('');
    try {
      await changeRouteMode(nextMode);
    } catch (err) {
      setRouteError(err?.message || `No se pudo activar ${nextMode}.`);
    } finally {
      setRouteBusy(false);
    }
  };

  const isRuntimeOk = Boolean(nodeStatus?.healthy);
  const showShellActivityLog =
    activeRoute?.id !== 'overview' && Array.isArray(activityLog) && activityLog.length > 0;
  const isReadOnlyRole = !role || role === 'READ_ONLY';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: SHELL_PALETTE.pageBg,
        color: SHELL_PALETTE.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Cabecera compacta superior */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: SHELL_PALETTE.panelBg,
          borderBottom: `1px solid ${SHELL_PALETTE.border}`,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            aria-label="Alternar menú de navegación"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: SHELL_PALETTE.insetBg,
              color: SHELL_PALETTE.textPrimary,
              border: `1px solid ${SHELL_PALETTE.border}`,
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {mobileNavOpen ? 'Cerrar menú' : 'Menú'}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  color: SHELL_PALETTE.textPrimary
                }}
              >
                S.A.A.R.E. CONSOLE
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
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
                title={role || 'READ_ONLY'}
                aria-label={`Rol activo: ${formatRoleLabel(role)}`}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                  background: isReadOnlyRole ? SHELL_PALETTE.pageBg : '#D8DEE3',
                  color: SHELL_PALETTE.textPrimary,
                  border: `1px solid ${SHELL_PALETTE.border}`
                }}
              >
                Rol: {formatRoleLabel(role)}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: SHELL_PALETTE.textSecondary }}>
              {activeRoute?.label} · Modo PEP: {nodeStatus?.mode || 'FAIL-CLOSED'}
              {tenantId ? ` · Tenant: ${tenantId}` : ''}
            </div>
          </div>
        </div>

        {/* Contexto de Tenant y Ruta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {Array.isArray(availableTenants) && availableTenants.length > 0 ? (
            <select
              aria-label="Seleccionar tenant activo"
              value={tenantId || ''}
              onChange={handleSelectDropdownTenant}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: SHELL_PALETTE.insetBg,
                color: SHELL_PALETTE.textPrimary,
                border: `1px solid ${SHELL_PALETTE.border}`,
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              <option value="">Sin tenant seleccionado</option>
              {availableTenants.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <form onSubmit={handleApplyTenant} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <input
                type="text"
                aria-label="Tenant activo"
                placeholder="Tenant ID..."
                value={manualTenantInput}
                onChange={(e) => setManualTenantInput(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: SHELL_PALETTE.insetBg,
                  color: SHELL_PALETTE.textPrimary,
                  border: `1px solid ${SHELL_PALETTE.border}`,
                  fontSize: '0.75rem',
                  width: '150px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: SHELL_PALETTE.insetBg,
                  color: SHELL_PALETTE.textPrimary,
                  border: `1px solid ${SHELL_PALETTE.border}`,
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Aplicar
              </button>
            </form>
          )}

          {/* Selector de ruta CLOUD_EDGE / LOCAL_SIDECAR */}
          <div
            role="group"
            aria-label="Modo de ruta"
            style={{
              display: 'inline-flex',
              borderRadius: '6px',
              overflow: 'hidden',
              border: `1px solid ${SHELL_PALETTE.border}`
            }}
          >
            <button
              type="button"
              disabled={routeBusy}
              onClick={() => handleSwitchRouteMode('CLOUD_EDGE')}
              style={{
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: routeBusy ? 'wait' : 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                background: routeMode === 'CLOUD_EDGE' ? SHELL_PALETTE.activeBg : SHELL_PALETTE.insetBg,
                color: routeMode === 'CLOUD_EDGE' ? SHELL_PALETTE.activeText : SHELL_PALETTE.textSecondary
              }}
            >
              Cloud Edge
            </button>
            <button
              type="button"
              disabled={routeBusy}
              onClick={() => handleSwitchRouteMode('LOCAL_SIDECAR')}
              style={{
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: routeBusy ? 'wait' : 'pointer',
                border: 'none',
                borderLeft: `1px solid ${SHELL_PALETTE.border}`,
                whiteSpace: 'nowrap',
                background:
                  routeMode === 'LOCAL_SIDECAR' ? SHELL_PALETTE.activeBg : SHELL_PALETTE.insetBg,
                color: routeMode === 'LOCAL_SIDECAR' ? SHELL_PALETTE.activeText : SHELL_PALETTE.textSecondary
              }}
            >
              Local Sidecar
            </button>
          </div>

          <button
            type="button"
            disabled={loadingNode}
            onClick={() => refreshNodeStatus()}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: SHELL_PALETTE.insetBg,
              color: SHELL_PALETTE.textPrimary,
              border: `1px solid ${SHELL_PALETTE.border}`,
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: loadingNode ? 'wait' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {loadingNode ? 'Comprobando...' : 'Refrescar estado'}
          </button>

          {headerActions}

          {typeof onLogout === 'function' && (
            <button
              type="button"
              onClick={onLogout}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#E7D8D6',
                color: '#5C231E',
                border: '1px solid #B88984',
                fontSize: '0.72rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Salir
            </button>
          )}
        </div>
      </header>

      {routeError && (
        <div
          style={{
            background: '#E7D8D6',
            color: '#5C231E',
            padding: '8px 16px',
            fontSize: '0.75rem',
            borderBottom: '1px solid #B88984'
          }}
        >
          Aviso de ruta: {routeError}
        </div>
      )}

      {/* Menú desplegable en vista estrecha / móvil */}
      {mobileNavOpen && (
        <nav
          aria-label="Navegación móvil"
          style={{
            background: SHELL_PALETTE.panelBg,
            borderBottom: `1px solid ${SHELL_PALETTE.border}`,
            padding: '10px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {routeList.map((r) => {
            const active = activeRoute?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => navigateTo(r)}
                style={{
                  textAlign: 'left',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: active ? SHELL_PALETTE.activeBg : 'transparent',
                  color: active ? SHELL_PALETTE.activeText : SHELL_PALETTE.textPrimary,
                  border: active ? `1px solid ${SHELL_PALETTE.charcoal}` : '1px solid transparent',
                  fontSize: '0.8rem',
                  fontWeight: active ? '800' : '600',
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Cuerpo principal: Sidebar + Zona de trabajo + Panel contextual */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          minWidth: 0
        }}
      >
        {/* Navegación lateral (escritorio) */}
        <aside
          aria-label="Navegación principal"
          style={{
            width: '240px',
            flexShrink: 0,
            background: SHELL_PALETTE.panelBg,
            borderRight: `1px solid ${SHELL_PALETTE.border}`,
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: '800',
                color: SHELL_PALETTE.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0 8px 6px'
              }}
            >
              Módulos de consola
            </div>

            {routeList.map((r) => {
              const active = activeRoute?.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigateTo(r)}
                  style={{
                    textAlign: 'left',
                    padding: '9px 10px',
                    borderRadius: '6px',
                    background: active ? SHELL_PALETTE.activeBg : 'transparent',
                    color: active ? SHELL_PALETTE.activeText : SHELL_PALETTE.textPrimary,
                    border: active ? `1px solid ${SHELL_PALETTE.charcoal}` : '1px solid transparent',
                    fontSize: '0.78rem',
                    fontWeight: active ? '800' : '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: SHELL_PALETTE.insetBg,
              border: `1px solid ${SHELL_PALETTE.border}`,
              fontSize: '0.72rem',
              color: SHELL_PALETTE.textSecondary,
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ color: SHELL_PALETTE.textPrimary, fontWeight: '700' }}>Sesión</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: sessionSummary?.isConfigured ? '#DCE3DF' : '#ECE4CF',
                  color: sessionSummary?.isConfigured ? '#1F3A2D' : '#574313',
                  border: `1px solid ${sessionSummary?.isConfigured ? '#8CA397' : '#C7B27B'}`
                }}
              >
                {sessionSummary?.isConfigured ? 'Vinculada' : 'Sin configurar'}
              </span>
            </div>
            <div title={role || 'READ_ONLY'}>
              <strong style={{ color: SHELL_PALETTE.textPrimary }}>Rol:</strong> {formatRoleLabel(role)}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: SHELL_PALETTE.textPrimary }}>Usuario:</strong>{' '}
              {userEmail || 'No autenticado'}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: SHELL_PALETTE.textPrimary }}>Tenant:</strong>{' '}
              {tenantId || 'Sin asignar'}
            </div>
          </div>
        </aside>

        {/* Zona central de trabajo */}
        <main
          style={{
            flex: '1 1 540px',
            minWidth: 0,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              paddingBottom: '12px',
              borderBottom: `1px solid ${SHELL_PALETTE.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: SHELL_PALETTE.textPrimary
                }}
              >
                {activeRoute?.label}
              </h1>
              {activeRoute?.description && (
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: SHELL_PALETTE.textSecondary }}>
                  {activeRoute.description}
                </p>
              )}
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                color: SHELL_PALETTE.textMuted,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
              }}
            >
              {activeRoute?.path || '/overview'}
            </span>
          </div>

          <div style={{ minWidth: 0 }}>{children}</div>

          {/* Actividad reciente en rutas secundarias */}
          {showShellActivityLog && (
            <section
              aria-label="Actividad reciente"
              style={{
                marginTop: 'auto',
                padding: '12px 14px',
                background: SHELL_PALETTE.panelBg,
                borderRadius: '8px',
                border: `1px solid ${SHELL_PALETTE.border}`
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: SHELL_PALETTE.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  Actividad reciente
                </span>
                {typeof clearActivityLog === 'function' && (
                  <button
                    type="button"
                    onClick={clearActivityLog}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: SHELL_PALETTE.textSecondary,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activityLog.slice(0, 5).map((item) => {
                  const isFailed = item.status === EXECUTION_STATUS.FAILED;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        fontSize: '0.73rem',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: SHELL_PALETTE.insetBg,
                        borderLeft: `3px solid ${isFailed ? '#9E3B33' : SHELL_PALETTE.slate}`
                      }}
                    >
                      <span style={{ color: SHELL_PALETTE.textPrimary }}>{item.summary}</span>
                      <span
                        style={{
                          color: SHELL_PALETTE.textSecondary,
                          whiteSpace: 'nowrap',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                        }}
                      >
                        [{item.status}]{item.traceId ? ` · trace: ${item.traceId}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* Panel lateral contextual opcional */}
        {detailPanel && (
          <aside
            aria-label="Detalle contextual"
            style={{
              width: '320px',
              flex: '1 1 280px',
              maxWidth: '420px',
              background: SHELL_PALETTE.panelBg,
              borderLeft: `1px solid ${SHELL_PALETTE.border}`,
              padding: '16px',
              minWidth: 0
            }}
          >
            {detailPanel}
          </aside>
        )}
      </div>
    </div>
  );
}