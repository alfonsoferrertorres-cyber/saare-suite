// saare-console/src/context/ConsoleContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CONSOLE_ROUTES,
  ROUTE_LIST,
  resolveRouteByPath,
  normalizeRole,
  canPerformAction,
  normalizeNodeStatus,
  EXECUTION_STATUS,
  ROLES
} from '../domain/contracts';
import { apiService } from '../services/apiService';

const ConsoleContext = createContext(null);

const TENANT_STORAGE_KEYS = ['saare_tenant_domain', 'saare_tenant'];
const TOKEN_STORAGE_KEYS = ['saare_token', 'saare_auth_token'];
const EXTRA_SESSION_KEYS = ['saare_api_key', 'saare_plan_id', 'saare_session', 'saare_consent_accepted'];
const USER_STORAGE_KEY = 'saare_user_email';
const ROLE_STORAGE_KEY = 'saare_user_role';

export function normalizeConsoleTenantId(id = '') {
  return String(id || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '_')
    .slice(0, 32);
}

function sanitizeTokenString(raw = '') {
  const clean = String(raw || '')
    .replace(/^Bearer\s+/i, '')
    .trim();
  if (!clean || clean.toLowerCase() === 'null' || clean.toLowerCase() === 'undefined') {
    return '';
  }
  return clean;
}

function readStoredValue(keys = [], { isToken = false } = {}) {
  if (typeof window === 'undefined') return '';
  for (const key of keys) {
    try {
      const sessionVal = window.sessionStorage?.getItem(key) || '';
      const cleanSession = isToken ? sanitizeTokenString(sessionVal) : sessionVal.trim();
      if (cleanSession) return cleanSession;

      const localVal = window.localStorage?.getItem(key) || '';
      const cleanLocal = isToken ? sanitizeTokenString(localVal) : localVal.trim();
      if (cleanLocal) return cleanLocal;
    } catch {
      // Ignorar restricciones de almacenamiento del navegador
    }
  }
  return '';
}

function writeStoredValue(keys = [], value = '') {
  if (typeof window === 'undefined') return;
  const clean = String(value || '').trim();
  for (const key of keys) {
    try {
      if (clean) {
        window.localStorage?.setItem(key, clean);
        window.sessionStorage?.setItem(key, clean);
      } else {
        window.localStorage?.removeItem(key);
        window.sessionStorage?.removeItem(key);
      }
    } catch {
      // Ignorar restricciones de almacenamiento del navegador
    }
  }
}

function readInitialSession() {
  const rawTenant = readStoredValue(TENANT_STORAGE_KEYS);
  const rawToken = readStoredValue(TOKEN_STORAGE_KEYS, { isToken: true });
  const rawEmail = readStoredValue([USER_STORAGE_KEY]);
  const rawRole = readStoredValue([ROLE_STORAGE_KEY]);

  const currentUser = apiService?.getCurrentUser?.() || {};
  const finalTenant = normalizeConsoleTenantId(rawTenant || currentUser.tenantId || '');
  const finalUser = String(rawEmail || currentUser.email || '').trim().toLowerCase();
  const hasSessionToken = Boolean(rawToken);

  const detectedRole =
    rawRole ||
    currentUser.role ||
    (hasSessionToken || finalTenant ? ROLES.TENANT_ADMIN : ROLES.READ_ONLY);

  return {
    tenantId: finalTenant,
    userEmail: finalUser,
    role: normalizeRole(detectedRole),
    hasSessionToken
  };
}

function getInitialRoute() {
  if (typeof window === 'undefined') return CONSOLE_ROUTES.OVERVIEW;
  return resolveRouteByPath(window.location?.pathname || '');
}

export function ConsoleProvider({ children, initialTenant = '', initialRole = '' }) {
  const initialSession = useMemo(() => readInitialSession(), []);

  const [tenantId, setTenantId] = useState(() =>
    normalizeConsoleTenantId(initialTenant || initialSession.tenantId || '')
  );
  const [userEmail, setUserEmailState] = useState(() => initialSession.userEmail || '');
  const [role, setRoleState] = useState(() =>
    initialRole ? normalizeRole(initialRole) : initialSession.role
  );
  const [hasSessionToken, setHasSessionToken] = useState(() => initialSession.hasSessionToken);

  const [activeRoute, setActiveRoute] = useState(() => getInitialRoute());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [routeMode, setRouteModeState] = useState(() =>
    apiService?.getRouteMode ? apiService.getRouteMode() : 'CLOUD_EDGE'
  );
  const [nodeStatus, setNodeStatus] = useState(() =>
    normalizeNodeStatus({ status: 'NO_DISPONIBLE' }, initialTenant || initialSession.tenantId)
  );
  const [loadingNode, setLoadingNode] = useState(false);

  const [lastVerification, setLastVerification] = useState({
    status: EXECUTION_STATUS.NOT_RUN,
    verified: false,
    traceId: '',
    payloadDigest: '',
    verifiedAt: '',
    error: ''
  });

  const [activityLog, setActivityLog] = useState([]);

  const syncSessionTokenState = useCallback(() => {
    const token = readStoredValue(TOKEN_STORAGE_KEYS, { isToken: true });
    const present = Boolean(token);
    setHasSessionToken(present);
    return present;
  }, []);

  const setUserEmail = useCallback((nextEmail = '') => {
    const clean = String(nextEmail || '').trim().toLowerCase();
    setUserEmailState(clean);
    writeStoredValue([USER_STORAGE_KEY], clean);
  }, []);

  const setRole = useCallback((nextRole = '') => {
    const normalized = normalizeRole(nextRole);
    setRoleState(normalized);
    writeStoredValue([ROLE_STORAGE_KEY], nextRole ? normalized : '');
  }, []);

  const pushActivity = useCallback((entry = {}) => {
    const item = {
      id: entry.id || `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      module: entry.module || 'SYSTEM',
      action: entry.action || 'OPERATION',
      status: entry.status || EXECUTION_STATUS.PENDING,
      traceId: entry.traceId || '',
      summary: entry.summary || ''
    };
    setActivityLog((prev) => [item, ...prev].slice(0, 50));
  }, []);

  const clearActivityLog = useCallback(() => {
    setActivityLog([]);
  }, []);

  const clearSession = useCallback(
    (reason = 'Sesión cerrada.') => {
      writeStoredValue(TOKEN_STORAGE_KEYS, '');
      writeStoredValue(TENANT_STORAGE_KEYS, '');
      writeStoredValue([USER_STORAGE_KEY], '');
      writeStoredValue([ROLE_STORAGE_KEY], '');
      writeStoredValue(EXTRA_SESSION_KEYS, '');

      setHasSessionToken(false);
      setTenantId('');
      setUserEmailState('');
      setRoleState(ROLES.READ_ONLY);
      setLastVerification({
        status: EXECUTION_STATUS.NOT_RUN,
        verified: false,
        traceId: '',
        payloadDigest: '',
        verifiedAt: '',
        error: ''
      });

      pushActivity({
        module: 'SESSION',
        action: 'CLEAR_SESSION',
        status: EXECUTION_STATUS.VERIFIED,
        summary: reason
      });
    },
    [pushActivity]
  );

  const navigateTo = useCallback((routeOrPath) => {
    const target =
      typeof routeOrPath === 'string'
        ? resolveRouteByPath(routeOrPath)
        : ROUTE_LIST.find((r) => r.id === routeOrPath?.id || r.path === routeOrPath?.path) ||
          CONSOLE_ROUTES.OVERVIEW;

    setActiveRoute(target);
    setMobileNavOpen(false);

    if (typeof window !== 'undefined' && window.history?.pushState) {
      try {
        const currentPath = window.location.pathname;
        const search = window.location.search || '';
        if (currentPath !== target.path) {
          window.history.pushState({ routeId: target.id }, '', `${target.path}${search}`);
        }
      } catch {
        // Ignorar si el historial no permite pushState
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onPopState = () => {
      setActiveRoute(resolveRouteByPath(window.location?.pathname || ''));
      setMobileNavOpen(false);
      syncSessionTokenState();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncSessionTokenState]);

  const selectTenant = useCallback(
    (nextTenantId) => {
      const clean = normalizeConsoleTenantId(nextTenantId);
      const hasToken = syncSessionTokenState();

      if (clean === tenantId) return;

      setTenantId(clean);
      writeStoredValue(TENANT_STORAGE_KEYS, clean);

      const storedExplicitRole = readStoredValue([ROLE_STORAGE_KEY]);
      if (!storedExplicitRole) {
        if (clean && role === ROLES.READ_ONLY) {
          setRoleState(ROLES.TENANT_ADMIN);
        } else if (!clean && !hasToken) {
          setRoleState(ROLES.READ_ONLY);
        }
      }

      setLastVerification({
        status: EXECUTION_STATUS.NOT_RUN,
        verified: false,
        traceId: '',
        payloadDigest: '',
        verifiedAt: '',
        error: ''
      });

      pushActivity({
        module: 'CONTEXT',
        action: 'SWITCH_TENANT',
        status: EXECUTION_STATUS.VERIFIED,
        summary: clean ? `Contexto cambiado a tenant [${clean}].` : 'Contexto de tenant limpiado.'
      });
    },
    [tenantId, role, pushActivity, syncSessionTokenState]
  );

  const changeRouteMode = useCallback(
    async (targetMode) => {
      if (!apiService?.setRouteMode) {
        setRouteModeState(targetMode);
        return { mode: targetMode };
      }
      try {
        const res = await apiService.setRouteMode(targetMode);
        const applied = res?.mode || targetMode;
        setRouteModeState(applied);
        pushActivity({
          module: 'RUNTIME',
          action: 'SET_ROUTE_MODE',
          status: EXECUTION_STATUS.VERIFIED,
          summary: `Ruta activa establecida en ${applied}.`
        });
        return res;
      } catch (err) {
        pushActivity({
          module: 'RUNTIME',
          action: 'SET_ROUTE_MODE',
          status: EXECUTION_STATUS.FAILED,
          summary: err?.message || `No se pudo cambiar la ruta a ${targetMode}.`
        });
        throw err;
      }
    },
    [pushActivity]
  );

  const refreshNodeStatus = useCallback(async () => {
    syncSessionTokenState();
    setLoadingNode(true);
    try {
      const rawStatus = apiService?.getNodeStatus
        ? await apiService.getNodeStatus(tenantId)
        : {};
      const normalized = normalizeNodeStatus(rawStatus, tenantId);
      setNodeStatus(normalized);
      return normalized;
    } catch (err) {
      const failed = normalizeNodeStatus({ status: 'NO_DISPONIBLE', healthy: false }, tenantId);
      setNodeStatus(failed);
      pushActivity({
        module: 'OVERVIEW',
        action: 'REFRESH_NODE_STATUS',
        status: EXECUTION_STATUS.FAILED,
        summary: err?.message || 'Error consultando estado del nodo.'
      });
      return failed;
    } finally {
      setLoadingNode(false);
    }
  }, [tenantId, pushActivity, syncSessionTokenState]);

  useEffect(() => {
    refreshNodeStatus();
  }, [refreshNodeStatus]);

  const can = useCallback((action) => canPerformAction(role, action), [role]);

  const sessionSummary = useMemo(() => {
    const hasTenant = Boolean(tenantId);
    const hasUser = Boolean(userEmail);
    const isConfigured = hasTenant && (hasSessionToken || hasUser);
    return {
      hasTenant,
      hasUser,
      hasSessionToken,
      isConfigured
    };
  }, [tenantId, userEmail, hasSessionToken]);

  const value = useMemo(
    () => ({
      tenantId,
      userEmail,
      role,
      hasSessionToken,
      sessionSummary,
      setUserEmail,
      setRole,
      selectTenant,
      syncSessionTokenState,
      clearSession,
      can,
      routes: CONSOLE_ROUTES,
      routeList: ROUTE_LIST,
      activeRoute,
      navigateTo,
      mobileNavOpen,
      setMobileNavOpen,
      routeMode,
      changeRouteMode,
      nodeStatus,
      loadingNode,
      refreshNodeStatus,
      lastVerification,
      setLastVerification,
      activityLog,
      pushActivity,
      clearActivityLog
    }),
    [
      tenantId,
      userEmail,
      role,
      hasSessionToken,
      sessionSummary,
      setUserEmail,
      setRole,
      selectTenant,
      syncSessionTokenState,
      clearSession,
      can,
      activeRoute,
      navigateTo,
      mobileNavOpen,
      routeMode,
      changeRouteMode,
      nodeStatus,
      loadingNode,
      refreshNodeStatus,
      lastVerification,
      activityLog,
      pushActivity,
      clearActivityLog
    ]
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole() {
  const ctx = useContext(ConsoleContext);
  if (!ctx) {
    throw new Error('useConsole debe utilizarse dentro de un ConsoleProvider.');
  }
  return ctx;
}

export default ConsoleContext;