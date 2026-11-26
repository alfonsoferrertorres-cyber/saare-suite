// saare-console/src/layouts/ConsoleShell.jsx
import React, { useState, useEffect } from 'react';
import { useConsole } from '../context/ConsoleContext';
import { EXECUTION_STATUS } from '../domain/contracts';

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
    activityLog
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#030712',
        color: '#f8fafc',
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
          background: '#090d16',
          borderBottom: '1px solid #1e293b',
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
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
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
              <span style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.04em' }}>
                S.A.A.R.E. CONSOLE
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
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
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {activeRoute?.label} · Modo PEP: {nodeStatus?.mode || 'FAIL-CLOSED'}
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
                background: '#020617',
                color: '#f8fafc',
                border: '1px solid #334155',
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
                  background: '#020617',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  fontSize: '0.75rem',
                  width: '150px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
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
              border: '1px solid #334155'
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
                background: routeMode === 'CLOUD_EDGE' ? '#0284c7' : '#020617',
                color: routeMode === 'CLOUD_EDGE' ? '#ffffff' : '#94a3b8'
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
                borderLeft: '1px solid #334155',
                whiteSpace: 'nowrap',
                background: routeMode === 'LOCAL_SIDECAR' ? '#0284c7' : '#020617',
                color: routeMode === 'LOCAL_SIDECAR' ? '#ffffff' : '#94a3b8'
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
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
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
                background: '#450a0a',
                color: '#fca5a5',
                border: '1px solid #dc2626',
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
            background: '#450a0a',
            color: '#fecaca',
            padding: '8px 16px',
            fontSize: '0.75rem',
            borderBottom: '1px solid #dc2626'
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
            background: '#090d16',
            borderBottom: '1px solid #1e293b',
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
                  background: active ? '#0f172a' : 'transparent',
                  color: active ? '#38bdf8' : '#cbd5e1',
                  border: active ? '1px solid #0284c7' : '1px solid transparent',
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
            background: '#090d16',
            borderRight: '1px solid #1e293b',
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
                color: '#64748b',
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
                    background: active ? '#0f172a' : 'transparent',
                    color: active ? '#38bdf8' : '#cbd5e1',
                    border: active ? '1px solid #0284c7' : '1px solid transparent',
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
              borderRadius: '6px',
              background: '#020617',
              border: '1px solid #1e293b',
              fontSize: '0.72rem',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div>
              <strong style={{ color: '#e2e8f0' }}>Rol:</strong> {role}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: '#e2e8f0' }}>Usuario:</strong> {userEmail || 'No autenticado'}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: '#e2e8f0' }}>Tenant:</strong> {tenantId || 'Sin asignar'}
            </div>
          </div>
        </aside>

        {/* Zona central de trabajo */}
        <main
          style={{
            flex: '1 1 540px',
            minWidth: 0,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              paddingBottom: '10px',
              borderBottom: '1px solid #1e293b'
            }}
          >
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
              {activeRoute?.label}
            </h1>
            {activeRoute?.description && (
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                {activeRoute.description}
              </p>
            )}
          </div>

          <div style={{ minWidth: 0 }}>{children}</div>

          {/* Actividad reciente observable con traceId */}
          {Array.isArray(activityLog) && activityLog.length > 0 && (
            <section
              aria-label="Actividad reciente"
              style={{
                marginTop: 'auto',
                padding: '12px 14px',
                background: '#090d16',
                borderRadius: '8px',
                border: '1px solid #1e293b'
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px'
                }}
              >
                Actividad reciente
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
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: '#020617',
                        borderLeft: `3px solid ${isFailed ? '#ef4444' : '#38bdf8'}`
                      }}
                    >
                      <span style={{ color: '#e2e8f0' }}>{item.summary}</span>
                      <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
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
              background: '#090d16',
              borderLeft: '1px solid #1e293b',
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