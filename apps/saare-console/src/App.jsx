// saare-console/src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GovernanceToolbar from './components/GovernanceToolbar';
import OfficialReportModal from './components/OfficialReportModal';
import { SubsidiesHub } from './components/SubsidiesHub';
import { ExecutiveView } from './components/ExecutiveView';
import SeatsManagementModal from './components/SeatsManagementModal';
import ReportExportModal from './components/ReportExportModal';
import FriaWizardModal from './components/FriaReportModal';
import SoaIso42001CompilerButton from './components/SoaIso42001CompilerButton';
import { SAARE_CONFIG } from './config/saareState';
import apiService from './services/apiService';

const EXTENSION_ID = 'jmlakofckaafjpjnfbihgchkeiglamme';

const ISO_42001_PRESET_RULES = [
  {
    id: 'ISO42001-DLP-DNI-NIE',
    name: '[ISO 42001 / RGPD] Bloqueo DNI y NIE (DENY)',
    pattern: '\\b(?:\\d{8}|[XYZ]\\d{7})[- ]?[A-Za-z]\\b'
  },
  {
    id: 'ISO42001-DLP-IBAN',
    name: '[ISO 42001 / DORA] Bloqueo IBAN (DENY)',
    pattern: '\\b[A-Z]{2}\\d{2}[\\s]?\\d{4}[\\s]?\\d{4}[\\s]?\\d{2}[\\s]?\\d{2}[\\s]?\\d{10}\\b'
  },
  {
    id: 'ISO42001-DLP-EMAIL',
    name: '[ISO 42001 / RGPD] Bloqueo Correo Electrónico (DENY)',
    pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b'
  },
  {
    id: 'ISO42001-SEC-INJECTION',
    name: '[ISO 42001 / AIMS] Bloqueo Prompt Injection (DENY)',
    pattern: '(ignore all previous instructions|system prompt|drop table|jailbreak)'
  }
];

const getRulesEnabledStorageKey = (tenant = '') => {
  return `saare_rules_enabled_${String(tenant || 'default').trim()}`;
};

const readStoredRulesEnabled = (tenant = '') => {
  if (!tenant) return true;
  const raw = localStorage.getItem(getRulesEnabledStorageKey(tenant));
  if (raw === null) return true;
  return raw !== 'false';
};

const getApiEndpoint = (path = '') => {
  const baseUrl = (SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es').trim().replace(/\/+$/, '');
  const cleanBase = baseUrl.replace(/\/api\/v1$/i, '').replace(/\/api$/i, '').replace(/\/v1$/i, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const isSafeRedirectUrl = (url = '') => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const redactSensitiveText = (value = '') => {
  return String(value || '')
    .replace(/\b\d{8}[- ]?[A-Za-z]\b/g, '[DNI_REDACTED]')
    .replace(/\b[XYZ]\d{7}[- ]?[A-Za-z]\b/gi, '[NIE_REDACTED]')
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, '[IBAN_REDACTED]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARD_REDACTED]');
};

const isValidTenantId = (id = '') => {
  const normalized = String(id || '').trim();
  if (!normalized || normalized.length < 2) return false;
  if (normalized.includes('@')) return false;
  return true;
};

const triggerBlobDownload = (content, filename, mimeType = 'application/json;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const urlTenant = queryParams.get('tenant') ? queryParams.get('tenant').trim() : null;
  const urlRole = queryParams.get('role') ? queryParams.get('role').trim() : null;
  const checkoutStatus = queryParams.get('checkout');

  // Arranque 100% virgen: sin DEFAULT_USER, DEFAULT_TENANT ni DEFAULT_ROLE preinyectados
  const [userEmail, setUserEmail] = useState(() => {
    return (localStorage.getItem('saare_user_email') || '').trim().toLowerCase();
  });

  const [tenantId, setTenantId] = useState(() => {
    const candidate = (urlTenant || localStorage.getItem('saare_tenant_domain') || '').trim();
    return isValidTenantId(candidate) ? candidate : '';
  });

  const [userRole, setUserRole] = useState(() => {
    return (urlRole || localStorage.getItem('saare_user_role') || '').trim();
  });

  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token') || ''
  );

  const [availableTenants, setAvailableTenants] = useState(() => {
    const initial = [];
    const current = (urlTenant || localStorage.getItem('saare_tenant_domain') || '').trim();
    if (current && isValidTenantId(current)) {
      initial.push({ id: current, name: current });
    }
    return initial;
  });

  const [viewMode, setViewMode] = useState('GRC_AUDIT');
  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [isFetchingVault, setIsFetchingVault] = useState(false);
  const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState('');

  const [billingInfo, setBillingInfo] = useState(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('TOKEN');
  const [authForm, setAuthForm] = useState({
    email: '',
    companyName: '',
    name: '',
    password: '',
    token: '',
    tenantId: ''
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const [showOfficialReportModal, setShowOfficialReportModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFriaModal, setShowFriaModal] = useState(false);
  const [selectedEvidenceForPdf, setSelectedEvidenceForPdf] = useState(null);

  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [customRules, setCustomRules] = useState([]);
  const [tenantRulesEnabled, setTenantRulesEnabled] = useState(() => {
    const candidate = (urlTenant || localStorage.getItem('saare_tenant_domain') || '').trim();
    return readStoredRulesEnabled(isValidTenantId(candidate) ? candidate : '');
  });
  const [ruleForm, setRuleForm] = useState({ name: '', pattern: '' });
  const [isRulesLoading, setIsRulesLoading] = useState(false);

  const [evidences, setEvidences] = useState([]);
  const [tenantMetrics, setTenantMetrics] = useState([]);

  const toastTimerRef = useRef(null);

  const triggerGovernance = useCallback((msg) => {
    setGovernanceStatus(msg);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setGovernanceStatus('');
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const persistSessionData = useCallback(({ token, tenant, email, role, planId, apiKey, companyName }) => {
    const cleanToken = String(token || '').replace(/^Bearer\s+/i, '').trim();
    const cleanTenant = String(tenant || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanRole = String(role || '').trim();

    if (cleanToken) {
      localStorage.setItem('saare_token', cleanToken);
      localStorage.setItem('saare_auth_token', cleanToken);
      sessionStorage.setItem('saare_auth_token', cleanToken);
      setAuthToken(cleanToken);
    }

    if (cleanTenant && isValidTenantId(cleanTenant)) {
      localStorage.setItem('saare_tenant_domain', cleanTenant);
      sessionStorage.setItem('saare_tenant_domain', cleanTenant);
      setTenantId(cleanTenant);
      setTenantRulesEnabled(readStoredRulesEnabled(cleanTenant));
      setAvailableTenants((prev) =>
        prev.some((t) => t.id === cleanTenant)
          ? prev
          : [{ id: cleanTenant, name: companyName ? `${companyName} (${cleanTenant})` : cleanTenant }, ...prev]
      );
    }

    if (cleanEmail) {
      localStorage.setItem('saare_user_email', cleanEmail);
      sessionStorage.setItem('saare_user_email', cleanEmail);
      setUserEmail(cleanEmail);
    }

    if (cleanRole) {
      localStorage.setItem('saare_user_role', cleanRole);
      sessionStorage.setItem('saare_user_role', cleanRole);
      setUserRole(cleanRole);
    }

    if (planId) {
      localStorage.setItem('saare_plan_id', planId);
    }

    if (apiKey) {
      localStorage.setItem('saare_api_key', apiKey);
    }

    return { cleanToken, cleanTenant, cleanEmail, cleanRole };
  }, []);

  const fetchBillingUsage = useCallback(async (overrideTenant = null, overrideToken = null) => {
    const targetTenant = overrideTenant || tenantId;
    const activeTok = overrideToken !== null ? overrideToken : authToken;
    if (!targetTenant) {
      setBillingInfo(null);
      return;
    }
    try {
      const headers = { 'x-saare-tenant': targetTenant };
      if (activeTok) headers.Authorization = `Bearer ${activeTok}`;
      const res = await fetch(getApiEndpoint('/api/v1/billing/usage'), { headers });
      if (res.ok) {
        const data = await res.json();
        setBillingInfo(data);
      } else {
        setBillingInfo(null);
      }
    } catch {
      setBillingInfo(null);
    }
  }, [tenantId, authToken]);

  const fetchCustomRules = useCallback(async (overrideTenant = null, overrideToken = null) => {
    const targetTenant = overrideTenant || tenantId;
    const activeTok = overrideToken !== null ? overrideToken : authToken;
    if (!targetTenant) {
      setCustomRules([]);
      return;
    }
    setIsRulesLoading(true);
    try {
      const headers = { 'x-saare-tenant': targetTenant, 'Content-Type': 'application/json' };
      if (activeTok) headers.Authorization = `Bearer ${activeTok}`;
      const res = await fetch(getApiEndpoint('/api/v1/custom-rules'), { headers });
      if (res.ok) {
        const data = await res.json();
        setCustomRules(Array.isArray(data?.rules) ? data.rules : []);
        if (typeof data?.enabled === 'boolean') {
          setTenantRulesEnabled(data.enabled);
          localStorage.setItem(getRulesEnabledStorageKey(targetTenant), String(data.enabled));
        } else {
          setTenantRulesEnabled(readStoredRulesEnabled(targetTenant));
        }
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      triggerGovernance('Error al cargar reglas personalizadas desde D1.');
    } finally {
      setIsRulesLoading(false);
    }
  }, [tenantId, authToken, triggerGovernance]);

  const handleToggleTenantRules = useCallback(async (nextEnabled) => {
    if (!tenantId) {
      triggerGovernance('Configura un Tenant ID antes de cambiar el estado de las reglas.');
      return;
    }

    const desiredState = Boolean(nextEnabled);
    setTenantRulesEnabled(desiredState);
    localStorage.setItem(getRulesEnabledStorageKey(tenantId), String(desiredState));
    setIsRulesLoading(true);

    try {
      const headers = { 'x-saare-tenant': tenantId, 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch(getApiEndpoint('/api/v1/custom-rules'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          enabled: desiredState,
          rules: customRules
        })
      });

      const data = res.ok ? await res.json().catch(() => null) : null;
      const effectiveEnabled = typeof data?.enabled === 'boolean' ? data.enabled : desiredState;
      setTenantRulesEnabled(effectiveEnabled);
      localStorage.setItem(getRulesEnabledStorageKey(tenantId), String(effectiveEnabled));

      if (Array.isArray(data?.rules)) {
        setCustomRules(data.rules);
      }

      triggerGovernance(
        effectiveEnabled
          ? `Reglas DLP / políticas activadas para [${tenantId}].`
          : `Reglas DLP / políticas desactivadas para [${tenantId}].`
      );
    } catch {
      triggerGovernance(
        desiredState
          ? `Reglas marcadas como activas en sesión para [${tenantId}].`
          : `Reglas marcadas como desactivadas en sesión para [${tenantId}].`
      );
    } finally {
      setIsRulesLoading(false);
    }
  }, [tenantId, authToken, customRules, triggerGovernance]);

  const handleApplyIso42001Governance = async () => {
    if (!tenantId) {
      triggerGovernance('Carga tu token y Tenant ID antes de aplicar políticas.');
      return;
    }
    setIsRulesLoading(true);
    const mergedById = new Map();
    [...customRules, ...ISO_42001_PRESET_RULES].forEach((r, i) => {
      const key = r.id || `ISO42001-${i}`;
      mergedById.set(key, r);
    });
    const finalRules = Array.from(mergedById.values());

    try {
      const headers = { 'x-saare-tenant': tenantId, 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch(getApiEndpoint('/api/v1/custom-rules'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ preset: 'ISO_42001', enabled: tenantRulesEnabled, rules: finalRules })
      });

      const data = res.ok ? await res.json().catch(() => null) : null;
      setCustomRules(Array.isArray(data?.rules) ? data.rules : finalRules);

      if (res.ok) {
        triggerGovernance(`Gobernanza ISO 42001 aplicada y sincronizada para [${tenantId}].`);
      } else {
        triggerGovernance(`Gobernanza ISO 42001 cargada en sesión para [${tenantId}].`);
      }
    } catch {
      setCustomRules(finalRules);
      triggerGovernance('Gobernanza ISO 42001 cargada en modo local.');
    } finally {
      setIsRulesLoading(false);
    }
  };

  const handleSaveCustomRule = async (e) => {
    e.preventDefault();
    if (!tenantId) {
      triggerGovernance('Configura tu Tenant ID antes de guardar reglas.');
      return;
    }
    const trimmedName = ruleForm.name.trim();
    const trimmedPattern = ruleForm.pattern.trim();
    if (!trimmedName || !trimmedPattern) return;

    try {
      new RegExp(trimmedPattern);
    } catch {
      triggerGovernance('Expresión regular inválida en el patrón de la regla.');
      return;
    }

    setIsRulesLoading(true);
    try {
      const newRule = { id: `RULE-${Date.now()}`, name: trimmedName, pattern: trimmedPattern };
      const updatedRules = [...customRules, newRule];
      const headers = { 'x-saare-tenant': tenantId, 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch(getApiEndpoint('/api/v1/custom-rules'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ enabled: tenantRulesEnabled, rules: updatedRules })
      });

      if (!res.ok) {
        throw new Error('Error al sincronizar regla en Bóveda D1');
      }

      const data = await res.json().catch(() => null);
      setCustomRules(Array.isArray(data?.rules) ? data.rules : updatedRules);
      setRuleForm({ name: '', pattern: '' });
      triggerGovernance('Regla DLP personalizada guardada y sincronizada.');
    } catch {
      triggerGovernance('Error al guardar la regla personalizada.');
    } finally {
      setIsRulesLoading(false);
    }
  };

  const mapEvidences = useCallback((remoteEvidences, activeTenantId) => {
    const rawList = Array.isArray(remoteEvidences)
      ? remoteEvidences
      : (remoteEvidences?.evidences || remoteEvidences?.traces || []);

    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    return rawList
      .filter((item) => item && typeof item === 'object')
      .map((item, idx) => {
        const isDeny = item.final_decision === 'DENY' || item.decision === 'DENY' || item.verdict === 'RECHAZADO';
        const rawPromptVal = item.prompt || item.rawPrompt || item.input || '';
        const safePrompt = isDeny
          ? '[CONTENIDO BLOQUEADO Y SANITIZADO EX-ANTE POR POLÍTICA DLP]'
          : redactSensitiveText(rawPromptVal || '(Sin instrucción)');

        return {
          id: item.trace_id || item.id || `EV-L7-${1000 + idx}`,
          time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          rawTimestamp: item.timestamp || new Date().toISOString(),
          cat: item.cat || (isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME'),
          sub: item.sub || '',
          prompt: safePrompt,
          responseOutput: isDeny ? '[BLOQUEADO EX-ANTE]' : redactSensitiveText(item.responseOutput || item.response || ''),
          verdict: item.verdict || (isDeny ? 'RECHAZADO' : 'PERMITIDO'),
          decision: isDeny ? 'DENY' : 'ALLOW',
          anchored: item.anchored !== undefined ? item.anchored : 0,
          type: isDeny ? 'PRIVACIDAD' : 'WORKFLOWS',
          user: item.user || '',
          tenant: isValidTenantId(item.tenant_id || item.tenant) ? (item.tenant_id || item.tenant) : activeTenantId,
          merkleRoot: item.ms3v_hash || item.merkle_root || item.merkleRoot || '',
          latency: item.execution_latency_ms || item.latency || 0,
          rawJson: item
        };
      });
  }, []);

  const fetchTenantMetrics = useCallback(async (overrideTenant = null, overrideToken = null, overrideRole = null) => {
    const targetTenant = overrideTenant || tenantId;
    const activeTok = overrideToken !== null ? overrideToken : authToken;
    const activeRole = overrideRole || userRole;
    if (!targetTenant) {
      setTenantMetrics([]);
      return;
    }

    setIsFetchingMetrics(true);
    setMetricsError('');
    try {
      const endpoint = getApiEndpoint('/v1/metrics/tenants');
      const headers = {
        'x-saare-tenant': targetTenant,
        ...(activeRole ? { 'x-saare-role': activeRole } : {}),
        'Content-Type': 'application/json'
      };
      if (activeTok) {
        headers.Authorization = `Bearer ${activeTok}`;
      }

      const res = await fetch(endpoint, { method: 'GET', headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} al consultar métricas multi-tenant`);
      }

      const json = await res.json();
      const rawRows = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);

      const isGlobalAdmin = activeRole === 'CISO_ADMIN' && Boolean(activeTok);
      const cleanRows = rawRows
        .filter((row) => isValidTenantId(row?.tenant_id))
        .filter((row) => isGlobalAdmin || row.tenant_id === targetTenant);

      setTenantMetrics(cleanRows);
    } catch (e) {
      setMetricsError(e.message || 'Error al cargar métricas agregadas desde D1.');
    } finally {
      setIsFetchingMetrics(false);
    }
  }, [tenantId, userRole, authToken]);

  const fetchTelemetryDirectFromVault = useCallback(async (overrideTenant = null, overrideToken = null) => {
    const targetTenant = overrideTenant || tenantId;
    const activeTok = overrideToken !== null ? overrideToken : authToken;
    if (!targetTenant) {
      setEvidences([]);
      setTenantMetrics([]);
      setBillingInfo(null);
      return;
    }

    setIsFetchingVault(true);
    try {
      const traces = await apiService.getTelemetryTraces({
        tenant: targetTenant,
        user: userEmail,
        token: activeTok,
        role: userRole
      });

      const mapped = mapEvidences(traces, targetTenant);
      setEvidences(mapped);
      triggerGovernance(`Bóveda D1 [${targetTenant}] sincronizada (${mapped.length} registros).`);

      await Promise.all([
        fetchTenantMetrics(targetTenant, activeTok, userRole),
        fetchBillingUsage(targetTenant, activeTok)
      ]);
    } catch {
      setEvidences([]);
      triggerGovernance(`Bóveda D1 [${targetTenant}] sin registros o error de conexión.`);
    } finally {
      setIsFetchingVault(false);
    }
  }, [tenantId, userEmail, authToken, userRole, mapEvidences, fetchTenantMetrics, fetchBillingUsage, triggerGovernance]);

  const handleTenantChange = (newTenant) => {
    setTenantId(newTenant);
    setTenantRulesEnabled(readStoredRulesEnabled(newTenant));
    setTestResult(null);
    setCustomRules([]);
    if (newTenant) {
      localStorage.setItem('saare_tenant_domain', newTenant);
      fetchTelemetryDirectFromVault(newTenant);
      if (activeTab === 'RULES') {
        fetchCustomRules(newTenant);
      }
    } else {
      localStorage.removeItem('saare_tenant_domain');
      setEvidences([]);
      setTenantMetrics([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_token');
    localStorage.removeItem('saare_auth_token');
    localStorage.removeItem('saare_api_key');
    localStorage.removeItem('saare_plan_id');
    localStorage.removeItem('saare_tenant_domain');
    localStorage.removeItem('saare_user_email');
    localStorage.removeItem('saare_user_role');
    localStorage.removeItem('saare_session');

    sessionStorage.removeItem('saare_token');
    sessionStorage.removeItem('saare_auth_token');
    sessionStorage.removeItem('saare_tenant_domain');
    sessionStorage.removeItem('saare_user_email');
    sessionStorage.removeItem('saare_user_role');

    setAuthToken('');
    setTenantId('');
    setUserEmail('');
    setUserRole('');
    setAvailableTenants([]);
    setEvidences([]);
    setTenantMetrics([]);
    setBillingInfo(null);
    setCustomRules([]);
    setTenantRulesEnabled(true);
    setTestResult(null);
    triggerGovernance('Sesión cerrada. Consola restablecida en estado virgen.');
  };

  useEffect(() => {
    if (checkoutStatus === 'success' && urlTenant) {
      localStorage.setItem('saare_tenant_domain', urlTenant);
      triggerGovernance(`Suscripción activada para [${urlTenant}].`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkoutStatus, urlTenant, triggerGovernance]);

  useEffect(() => {
    const updateClock = () => setTimeStr(new Date().toTimeString().split(' ')[0]);
    updateClock();
    const intervalClock = setInterval(updateClock, 1000);
    return () => clearInterval(intervalClock);
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchTelemetryDirectFromVault();
    }
  }, [tenantId, fetchTelemetryDirectFromVault]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError('');

    try {
      if (authTab === 'TOKEN') {
        const cleanToken = String(authForm.token || '').replace(/^Bearer\s+/i, '').trim();
        const targetTenant = String(authForm.tenantId || tenantId || '').trim();

        if (!cleanToken) {
          throw new Error('Introduce un Token Bearer o API Key válido.');
        }

        if (!targetTenant || !isValidTenantId(targetTenant)) {
          throw new Error('Indica el Tenant ID de tu organización.');
        }

        const { cleanTenant } = persistSessionData({
          token: cleanToken,
          tenant: targetTenant,
          email: authForm.email || userEmail,
          role: userRole || 'TENANT_ADMIN'
        });

        setShowAuthModal(false);
        setAuthForm({ email: '', companyName: '', name: '', password: '', token: '', tenantId: '' });
        triggerGovernance(`Token cargado para [${cleanTenant}].`);
        await fetchTelemetryDirectFromVault(cleanTenant, cleanToken);
        return;
      }

      const endpoint = authTab === 'SANDBOX'
        ? getApiEndpoint('/api/v1/sandbox/provision')
        : getApiEndpoint('/api/v1/auth/login');

      const payload = authTab === 'SANDBOX'
        ? {
            email: authForm.email,
            companyName: authForm.companyName,
            name: authForm.name || authForm.email.split('@')[0],
            password: authForm.password
          }
        : {
            email: authForm.email,
            password: authForm.password
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data?.token) {
        throw new Error(data?.message || data?.error || 'No se pudo completar la autenticación.');
      }

      const newTenant = data.user?.tenantId || data.user?.tenantName || authForm.tenantId || '';
      const newEmail = data.user?.email || authForm.email;
      const newRole = data.user?.role || 'TENANT_ADMIN';

      persistSessionData({
        token: data.token,
        tenant: newTenant,
        email: newEmail,
        role: newRole,
        planId: data.user?.planId,
        apiKey: data.user?.apiKey,
        companyName: authForm.companyName
      });

      setShowAuthModal(false);
      setAuthForm({ email: '', companyName: '', name: '', password: '', token: '', tenantId: '' });
      triggerGovernance(`Sesión iniciada${newTenant ? ` en [${newTenant}]` : ''}.`);
      await fetchTelemetryDirectFromVault(newTenant, data.token);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleStartStripeUpgrade = async (targetPlan = 'PROFESSIONAL_649') => {
    setIsBillingLoading(true);
    try {
      const res = await fetch(getApiEndpoint('/api/v1/billing/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          companyName: billingInfo?.companyName || tenantId,
          planId: targetPlan
        })
      });
      const data = await res.json();
      if (res.ok && data?.checkoutUrl) {
        if (isSafeRedirectUrl(data.checkoutUrl)) {
          window.location.href = data.checkoutUrl;
          return;
        }
        throw new Error('URL de checkout no segura');
      }
      triggerGovernance(data?.message || 'No se pudo abrir Stripe Checkout.');
    } catch {
      triggerGovernance('Error de red conectando con Stripe Billing.');
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setIsBillingLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json', ...(tenantId ? { 'x-saare-tenant': tenantId } : {}) };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch(getApiEndpoint('/api/v1/billing/portal'), { method: 'POST', headers });
      const data = await res.json();
      if (res.ok && data?.url) {
        if (isSafeRedirectUrl(data.url)) {
          window.location.href = data.url;
          return;
        }
        throw new Error('URL de portal no segura');
      }
      triggerGovernance(data?.message || 'No hay suscripción activa para gestionar.');
    } catch {
      triggerGovernance('Error abriendo el portal de facturación.');
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleDownloadL7Extension = () => {
    const a = document.createElement('a');
    a.href = '/deploy/saare_l7_proxy_extension.zip';
    a.download = `saare_l7_proxy_extension_${tenantId || 'cliente'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerGovernance(`Paquete Extensión L7 (.ZIP) descargado para [${tenantId || 'cliente'}].`);
  };

  const handleDownloadSidecarPackage = () => {
    const a = document.createElement('a');
    a.href = '/deploy/saare_native_sidecar.zip';
    a.download = `saare_native_sidecar_${tenantId || 'cliente'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerGovernance(`Paquete Sidecar L7 (.ZIP) descargado para [${tenantId || 'cliente'}].`);
  };

  const handleDownloadEnterpriseGpoReg = async () => {
    try {
      const query = tenantId ? `?tenant=${encodeURIComponent(tenantId)}` : '';
      const res = await fetch(getApiEndpoint(`/api/v1/deploy/gpo-policy${query}`));
      if (res.ok) {
        const regText = await res.text();
        triggerBlobDownload(regText, `SAARE_L7_POLICY_${tenantId || 'cliente'}.reg`, 'text/plain;charset=utf-8');
        triggerGovernance(`Directiva GPO generada para [${tenantId || 'cliente'}].`);
        return;
      }
    } catch {}

    const gateway = getApiEndpoint('/v1/chat/completions');
    const trustAnchor = SAARE_CONFIG?.TRUST_ANCHOR || '';
    const licenseKey = billingInfo?.credentials?.licenseKey || authToken || localStorage.getItem('saare_api_key') || '';

    const regContent = [
      'Windows Registry Editor Version 5.00',
      '',
      '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge\\ExtensionInstallForcelist]',
      `"1"="${EXTENSION_ID};https://edge.microsoft.com/extensionwebstorebase/v1/crx"`,
      '',
      '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome\\ExtensionInstallForcelist]',
      `"1"="${EXTENSION_ID};https://clients2.google.com/service/update2/crx"`,
      '',
      `[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome\\3rdparty\\extensions\\${EXTENSION_ID}\\policy]`,
      `"TenantId"="${tenantId}"`,
      `"LicenseKey"="${licenseKey}"`,
      `"ProxyGateway"="${gateway}"`,
      `"TrustAnchor"="${trustAnchor}"`,
      '"FailClosed"=dword:00000001',
      '"EnableExAnteEnforcement"=dword:00000001'
    ].join('\r\n') + '\r\n';

    triggerBlobDownload(regContent, `SAARE_L7_POLICY_${tenantId || 'cliente'}.reg`, 'text/plain;charset=utf-8');
    triggerGovernance(`Directiva GPO generada para [${tenantId || 'cliente'}].`);
  };

  const handleDownloadK8sManifest = () => {
    const yamlContent = [
      'apiVersion: v1',
      'kind: ConfigMap',
      'metadata:',
      '  name: saare-ip-manifest',
      '  namespace: saare-system',
      'data:',
      `  TENANT_ID: "${tenantId}"`,
      `  GATEWAY_URL: "${getApiEndpoint('/v1/chat/completions')}"`
    ].join('\n') + '\n';

    triggerBlobDownload(yamlContent, `01-ip-manifest-${(tenantId || 'cliente').toLowerCase()}.yaml`, 'text/yaml;charset=utf-8');
    triggerGovernance('Manifiesto YAML K8s generado.');
  };

  const handleDownloadIso42001Dossier = () => {
    const inspections = evidences.length;
    const denied = evidences.filter((e) => e.decision === 'DENY').length;
    const allowed = inspections - denied;
    const blockRate = inspections > 0 ? ((denied / inspections) * 100).toFixed(1) : '0.0';

    const dossier = {
      reportType: 'SAARE_ISO_42001_RGPD_COMPLIANCE_DOSSIER',
      generatedAt: new Date().toISOString(),
      tenantId: tenantId || 'UNASSIGNED',
      planId: billingInfo?.planId || localStorage.getItem('saare_plan_id') || 'N/A',
      metrics: {
        totalInspections: inspections,
        allowedCount: allowed,
        deniedCount: denied,
        blockRatePercent: blockRate
      },
      rulesEnabled: tenantRulesEnabled,
      activeCustomRulesCount: customRules.length,
      customRules,
      iso42001BaselineControls: ISO_42001_PRESET_RULES.map((r) => r.id),
      recentEvidenceHashes: evidences.slice(0, 25).map((e) => ({
        id: e.id,
        timestamp: e.rawTimestamp,
        decision: e.decision,
        merkleRoot: e.merkleRoot || null
      }))
    };

    triggerBlobDownload(
      JSON.stringify(dossier, null, 2),
      `dossier-iso42001-${(tenantId || 'cliente').toLowerCase()}-${Date.now()}.json`,
      'application/json;charset=utf-8'
    );
    triggerGovernance(`Dossier ISO 42001 / RGPD descargado para [${tenantId || 'cliente'}].`);
  };

  const handleExportTracesJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      tenantId: tenantId || 'UNASSIGNED',
      totalRecords: evidences.length,
      traces: evidences.map((ev) => ({
        id: ev.id,
        timestamp: ev.rawTimestamp,
        decision: ev.decision,
        verdict: ev.verdict,
        category: ev.cat,
        promptSanitized: ev.prompt,
        merkleRoot: ev.merkleRoot,
        latencyMs: ev.latency
      }))
    };

    triggerBlobDownload(
      JSON.stringify(payload, null, 2),
      `trazas-l7-${(tenantId || 'cliente').toLowerCase()}-${Date.now()}.json`,
      'application/json;charset=utf-8'
    );
    triggerGovernance(`Exportadas ${evidences.length} trazas en JSON para [${tenantId || 'cliente'}].`);
  };

  const handleOpenPdfReport = useCallback((evidence) => {
    setSelectedEvidenceForPdf(evidence);
    setShowOfficialReportModal(true);
  }, []);

  const handleGenerateAuditToken = () => {
    const auditTokenPreview = `AUD-${(tenantId || 'TENANT').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    triggerBlobDownload(
      JSON.stringify({
        issuedAt: new Date().toISOString(),
        tenantId: tenantId || 'UNASSIGNED',
        requestedBy: userEmail || 'anonymous',
        auditToken: auditTokenPreview,
        ttlMinutes: 60
      }, null, 2),
      `audit-token-${(tenantId || 'cliente').toLowerCase()}.json`
    );
    triggerGovernance(`Token de auditoría generado (${auditTokenPreview}).`);
  };

  const handleDownloadTechnicalTeaser = () => {
    triggerBlobDownload(
      JSON.stringify({
        product: 'S.A.A.R.E. Console GRC & Ex-Ante L7 Runtime',
        compliance: ['EU AI Act', 'RGPD', 'DORA', 'NIS2', 'ISO 27001', 'ISO 42001', 'ISO 27037', 'Art. 326 LEC'],
        generatedAt: new Date().toISOString()
      }, null, 2),
      'saare-technical-teaser.json'
    );
    triggerGovernance('Teaser técnico descargado.');
  };

  const handleExportLecActa = () => {
    triggerBlobDownload(
      JSON.stringify({
        documentType: 'ACTA_EVIDENCIA_DIGITAL_ART_326_LEC_ISO_27037',
        generatedAt: new Date().toISOString(),
        tenantId: tenantId || 'UNASSIGNED',
        totalEvidences: evidences.length,
        chainSample: evidences.slice(0, 15).map((e) => ({
          id: e.id,
          timestamp: e.rawTimestamp,
          decision: e.decision,
          merkleRoot: e.merkleRoot || null
        }))
      }, null, 2),
      `acta-lec-iso27037-${(tenantId || 'cliente').toLowerCase()}-${Date.now()}.json`
    );
    triggerGovernance('Acta probatoria Art. 326 LEC / ISO 27037 generada.');
  };

  const handleExecuteTestExAnte = async (customPrompt = null) => {
    const promptToRun = customPrompt || testPrompt;
    if (!promptToRun.trim()) return;

    setIsEvaluating(true);
    const t0 = performance.now();

    try {
      const data = await apiService.interceptPrompt({
        prompt: promptToRun,
        user: userEmail,
        tenant: tenantId,
        token: authToken,
        role: userRole
      });
      const latencyMs = `${(performance.now() - t0).toFixed(2)} ms`;
      const isDeny = data?.decision === 'DENY' || data?.verdict === 'FAIL_CLOSED_BLOCKED' || data?.verdict === 'RECHAZADO';

      const evalResult = {
        verdict: isDeny ? 'RECHAZADO / SANITIZADO EN RAM' : 'PERMITIDO CONFORME',
        decision: isDeny ? 'DENY' : 'ALLOW',
        sanitizedPrompt: isDeny
          ? '[PAYLOAD BLOQUEADO Y REDACTADO EN RAM]'
          : redactSensitiveText(data?.sanitizedPrompt || data?.enforcement?.executedCommand || promptToRun),
        latency: latencyMs,
        seal: data?.enforcement?.ms3vIntegrityHash || data?.proofBundle?.ms3vAudit?.hash || ''
      };

      setTestResult(evalResult);
      triggerGovernance(`Prompt interceptado (${evalResult.decision}).`);
      await fetchTelemetryDirectFromVault();
    } catch {
      triggerGovernance('Error al evaluar el prompt en el gateway L7.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const totalInspecciones = evidences.length;
  const totalDeny = evidences.filter((e) => e.decision === 'DENY').length;
  const tasaBloqueo = totalInspecciones > 0 ? ((totalDeny / totalInspecciones) * 100).toFixed(1) : '0.0';
  const resolvedApiKey = billingInfo?.credentials?.licenseKey || localStorage.getItem('saare_api_key') || '';
  const isUnconfiguredClient = !authToken && !tenantId;

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {governanceStatus && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: '8px', zIndex: 10000, fontWeight: '800', fontSize: '0.82rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {governanceStatus}
        </div>
      )}

      <header style={{ width: '100%', background: '#0b0f19', borderBottom: '1px solid #1e293b', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1280px', padding: '0 16px', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '900', color: '#38bdf8', fontSize: '1.1rem', letterSpacing: '0.5px' }}>S.A.A.R.E. CONSOLE GRC</span>
            <span style={{
              background: authToken ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: authToken ? '#34d399' : '#fbbf24',
              border: `1px solid ${authToken ? '#10b981' : '#f59e0b'}`,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: '800',
              fontFamily: 'monospace'
            }}>
              {authToken ? 'TOKEN ACTIVO' : 'SIN TOKEN'}
            </span>
            {(billingInfo?.planId || localStorage.getItem('saare_plan_id')) && (
              <span style={{ background: '#1e293b', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                {billingInfo?.planId || localStorage.getItem('saare_plan_id')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setViewMode('GRC_AUDIT')} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'GRC_AUDIT' ? '#059669' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              GRC &amp; AUDIT
            </button>
            <button type="button" onClick={() => setViewMode('EXECUTIVE')} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'EXECUTIVE' ? '#0284c7' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              EJECUTIVO
            </button>
            <button type="button" onClick={() => setViewMode('SUBSIDIES')} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'SUBSIDIES' ? '#d97706' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              SUBVENCIONES
            </button>
            <button type="button" onClick={() => setShowSeatsModal(true)} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#cbd5e1', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              ROLES/ASIENTOS ({billingInfo?.maxSeats ?? 0})
            </button>
            <button type="button" onClick={() => setShowFriaModal(true)} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #38bdf8', background: '#0284c7', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              AUDITORÍA FRIA
            </button>
            <button type="button" onClick={handleDownloadL7Extension} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #38bdf8', background: '#0c4a6e', color: '#7dd3fc', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              EXTENSIÓN L7 (.ZIP)
            </button>
            <button type="button" onClick={handleDownloadSidecarPackage} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #06b6d4', background: '#164e63', color: '#67e8f9', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              SIDECAR L7 (.ZIP)
            </button>
            <button type="button" onClick={handleDownloadEnterpriseGpoReg} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #10b981', background: '#064e3b', color: '#34d399', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              POLÍTICA GPO (.REG)
            </button>
            <button type="button" onClick={handleDownloadK8sManifest} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #8b5cf6', background: '#4c1d95', color: '#c084fc', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              MANIFIESTO K8S
            </button>
            <button type="button" onClick={handleDownloadIso42001Dossier} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #a855f7', background: '#3b0764', color: '#e9d5ff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              DOSSIER ISO 42001
            </button>
            <SoaIso42001CompilerButton
              apiBaseUrl={getApiEndpoint('')}
              tenantId={tenantId}
              authToken={authToken}
              userEmail={userEmail}
              onCompiled={(hash) => triggerGovernance(`SoA ISO 42001 compilada (${hash.slice(0, 12)}...) para [${tenantId || 'TENANT'}].`)}
            />
            <button type="button" onClick={handleExportTracesJson} style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #14b8a6', background: '#134e4a', color: '#5eead4', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              EXPORTAR TRAZAS (.JSON)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthTab('TOKEN');
                setAuthForm((prev) => ({
                  ...prev,
                  token: authToken || '',
                  tenantId: tenantId || '',
                  email: userEmail || ''
                }));
                setShowAuthModal(true);
              }}
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #f59e0b', background: '#78350f', color: '#fde68a', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {authToken ? 'GESTIONAR TOKEN' : 'CARGAR TOKEN'}
            </button>
            {(authToken || tenantId) && (
              <button type="button" onClick={handleLogout} style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: '#450a0a', color: '#fca5a5', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
                SALIR
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
        {isUnconfiguredClient && (
          <div style={{ marginBottom: '20px', padding: '16px 20px', background: '#0f172a', border: '1px solid #f59e0b', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: '900', color: '#fbbf24', fontSize: '0.9rem' }}>
                Entorno listo para configurar — Sin token ni tenant vinculado
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.78rem', marginTop: '4px' }}>
                Introduce tu Token Bearer / API Key y tu Tenant ID para conectar la consola con tu bóveda de auditoría.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthTab('TOKEN');
                setShowAuthModal(true);
              }}
              style={{ padding: '9px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              CARGAR TOKEN DE CLIENTE
            </button>
          </div>
        )}

        {viewMode === 'SUBSIDIES' && (
          <SubsidiesHub tenantId={tenantId} onBack={() => setViewMode('GRC_AUDIT')} />
        )}

        {viewMode === 'EXECUTIVE' && (
          <ExecutiveView tenantId={tenantId} userRole={userRole} evidences={evidences} onManageSeats={() => setShowSeatsModal(true)} />
        )}

        {viewMode === 'GRC_AUDIT' && (
          <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '24px', border: '1px solid #1e293b' }}>
            <GovernanceToolbar
              targetHash={evidences[0]?.merkleRoot || ''}
              tenantId={tenantId}
              rulesEnabled={tenantRulesEnabled}
              onToggleTenantRules={handleToggleTenantRules}
              onVerifySignature={(h) => triggerGovernance(`Hash ${h.slice(0, 14)}... enviado a verificación Ed25519.`)}
              onExportCustody={handleExportTracesJson}
              onExportGrantDossier={handleDownloadIso42001Dossier}
              onExecuteEnforcementCheck={() => setActiveTab('RUNLIVE')}
              onOpenFriaModal={() => setShowFriaModal(true)}
              onExportGovernancePackage={handleDownloadIso42001Dossier}
              onOpenReportModal={() => {
                if (evidences[0]) {
                  handleOpenPdfReport(evidences[0]);
                } else {
                  triggerGovernance('No hay evidencias cargadas para generar el informe PDF.');
                }
              }}
              onGenerateToken={handleGenerateAuditToken}
              onDownloadTeaser={handleDownloadTechnicalTeaser}
              onExportLecActa={handleExportLecActa}
              onExportClick={() => setShowExportModal(true)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: '20px 0' }}>
              <div style={{ background: '#020617', border: '1px solid #38bdf8', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>ORGANISMO / TENANT ACTIVO</div>
                <select
                  value={tenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  style={{ width: '100%', marginTop: '6px', padding: '6px 8px', background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', fontWeight: '900', fontSize: '0.9rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {availableTenants.length === 0 ? (
                    <option value="">Sin tenant seleccionado</option>
                  ) : (
                    availableTenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                    ))
                  )}
                </select>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                  Token / Key: <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{(authToken || resolvedApiKey) ? `${String(authToken || resolvedApiKey).slice(0, 18)}...` : 'No configurado'}</span>
                </div>
              </div>

              <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>INSPECCIONES CAPA 7</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f8fafc', marginTop: '2px' }}>{totalInspecciones}</div>
                <div style={{ fontSize: '0.68rem', color: '#34d399' }}>Tasa de Bloqueo: {tasaBloqueo}%</div>
              </div>

              <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>PLAN &amp; CUOTA MENSUAL</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#fbbf24', marginTop: '4px' }}>
                  {billingInfo?.planId || localStorage.getItem('saare_plan_id') || 'N/A'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  {billingInfo?.usage ? `${billingInfo.usage.verdictsConsumed} / ${billingInfo.usage.monthlyQuota} veredictos` : 'Sin datos de cuota'}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button type="button" onClick={() => handleStartStripeUpgrade('PROFESSIONAL_649')} disabled={isBillingLoading} style={{ padding: '4px 8px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer' }}>
                    Upgrade Pro
                  </button>
                  <button type="button" onClick={handleOpenStripePortal} disabled={isBillingLoading} style={{ padding: '4px 8px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700', cursor: 'pointer' }}>
                    Facturación
                  </button>
                </div>
              </div>

              <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>ESTADO DEL RUNTIME</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#34d399', marginTop: '4px' }}>OPERATIVO</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Reloj Local: {timeStr}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setActiveTab('GLOBAL')} style={{ padding: '10px 16px', background: activeTab === 'GLOBAL' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  EVIDENCIAS Y TRAZAS D1
                </button>
                <button type="button" onClick={() => { setActiveTab('METRICS'); fetchTenantMetrics(); }} style={{ padding: '10px 16px', background: activeTab === 'METRICS' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  CONSUMO MULTI-TENANT
                </button>
                <button type="button" onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '10px 16px', background: activeTab === 'RUNLIVE' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  EVALUADOR EX-ANTE EN RAM
                </button>
                <button type="button" onClick={() => { setActiveTab('RULES'); fetchCustomRules(); }} style={{ padding: '10px 16px', background: activeTab === 'RULES' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  REGLAS DLP / CUSTOM
                </button>
              </div>

              <button type="button" onClick={() => fetchTelemetryDirectFromVault()} disabled={isFetchingVault || !tenantId} style={{ padding: '6px 14px', marginBottom: '6px', background: '#0f172a', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: tenantId ? 'pointer' : 'not-allowed', opacity: tenantId ? 1 : 0.5 }}>
                {isFetchingVault ? 'Consultando Bóveda...' : `Sincronizar Bóveda (${tenantId || 'N/A'})`}
              </button>
            </div>

            {activeTab === 'GLOBAL' && (
              <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>HORA</th>
                      <th style={{ padding: '12px' }}>EVIDENCIA ID</th>
                      <th style={{ padding: '12px' }}>PROMPT / INSTRUCCIÓN</th>
                      <th style={{ padding: '12px' }}>VEREDICTO</th>
                      <th style={{ padding: '12px' }}>HUELLA INTEGRIDAD</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>INFORME OFICIAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidences.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                          Sin registros de evidencia para el tenant <strong>{tenantId || 'no definido'}</strong>.
                        </td>
                      </tr>
                    ) : (
                      evidences.map((ev, idx) => (
                        <tr key={ev.id || idx} style={{ borderBottom: '1px solid #1e293b', background: idx % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{ev.time}</td>
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{ev.id}</td>
                          <td style={{ padding: '12px', color: '#cbd5e1', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.prompt}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: '800', background: ev.decision === 'DENY' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: ev.decision === 'DENY' ? '#ef4444' : '#10b981', border: `1px solid ${ev.decision === 'DENY' ? '#ef4444' : '#10b981'}` }}>
                              {ev.decision === 'DENY' ? 'DENY (RECHAZADO)' : 'ALLOW (PERMITIDO)'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b', fontSize: '0.72rem' }}>
                            {ev.merkleRoot ? `${ev.merkleRoot.substring(0, 20)}...` : 'N/A'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button type="button" onClick={() => handleOpenPdfReport(ev)} style={{ padding: '4px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>
                              IMPRIMIR PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'METRICS' && (
              <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', background: '#020617' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1rem', fontWeight: '800' }}>
                    Métricas Agregadas de Consumo por Inquilino
                  </h3>
                  <button type="button" onClick={() => fetchTenantMetrics()} disabled={isFetchingMetrics || !tenantId} style={{ padding: '5px 12px', background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: tenantId ? 'pointer' : 'not-allowed' }}>
                    {isFetchingMetrics ? 'Actualizando...' : 'Refrescar Métricas'}
                  </button>
                </div>

                {metricsError && (
                  <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.78rem' }}>
                    {metricsError}
                  </div>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>TENANT ID</th>
                      <th style={{ padding: '12px' }}>PLAN</th>
                      <th style={{ padding: '12px' }}>TOTAL PROMPTS</th>
                      <th style={{ padding: '12px' }}>APROBADOS (ALLOW)</th>
                      <th style={{ padding: '12px' }}>BLOQUEADOS (DENY)</th>
                      <th style={{ padding: '12px' }}>ÚLTIMA ACTIVIDAD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFetchingMetrics ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          Consultando consumo agregado multi-tenant...
                        </td>
                      </tr>
                    ) : tenantMetrics.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          Sin registros de consumo acumulado para el ámbito seleccionado.
                        </td>
                      </tr>
                    ) : (
                      tenantMetrics.map((row, idx) => (
                        <tr key={row.tenant_id || idx} style={{ borderBottom: '1px solid #1e293b', background: idx % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold', fontFamily: 'monospace' }}>{row.tenant_id}</td>
                          <td style={{ padding: '12px', color: '#fbbf24', fontWeight: '700' }}>{row.plan_id || 'N/A'}</td>
                          <td style={{ padding: '12px', color: '#f8fafc', fontWeight: 'bold' }}>{row.total_prompts ?? 0}</td>
                          <td style={{ padding: '12px', color: '#34d399', fontWeight: 'bold' }}>{row.aprobados ?? 0}</td>
                          <td style={{ padding: '12px', color: '#f87171', fontWeight: 'bold' }}>{row.bloqueados_pii ?? 0}</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{row.ultima_actividad || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'RUNLIVE' && (
              <div style={{ background: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '1rem', fontWeight: '800' }}>EVALUADOR PROMPT EX-ANTE EN RAM</h3>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Introduce un prompt para evaluar..."
                  style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => handleExecuteTestExAnte()}
                  disabled={isEvaluating}
                  style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer' }}
                >
                  {isEvaluating ? 'PROCESANDO EN DISYUNTOR L7...' : `EJECUTAR RUNTIME EX-ANTE PARA [${tenantId || 'TENANT'}]`}
                </button>

                {testResult && (
                  <div style={{ marginTop: '16px', background: '#0b0f19', border: `1px solid ${testResult.decision === 'DENY' ? '#ef4444' : '#10b981'}`, padding: '14px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '900', color: testResult.decision === 'DENY' ? '#f87171' : '#34d399' }}>VEREDICTO: {testResult.verdict}</div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px', fontFamily: 'monospace' }}>Payload Resultante: {testResult.sanitizedPrompt}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>Sello Merkle Integrity: {testResult.seal || 'N/A'} | Latencia: {testResult.latency}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'RULES' && (
              <div style={{ background: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1rem', fontWeight: '800' }}>
                      Gestión de Reglas y Patrones DLP Personalizados
                    </h3>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      background: tenantRulesEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: tenantRulesEnabled ? '#34d399' : '#fca5a5',
                      border: `1px solid ${tenantRulesEnabled ? '#10b981' : '#ef4444'}`
                    }}>
                      {tenantRulesEnabled ? 'REGLAS ACTIVAS' : 'REGLAS DESACTIVADAS'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleTenantRules(!tenantRulesEnabled)}
                      disabled={isRulesLoading || !tenantId}
                      style={{
                        padding: '8px 14px',
                        background: tenantRulesEnabled ? '#450a0a' : '#064e3b',
                        color: tenantRulesEnabled ? '#fca5a5' : '#6ee7b7',
                        border: `1px solid ${tenantRulesEnabled ? '#dc2626' : '#10b981'}`,
                        borderRadius: '6px',
                        fontWeight: '800',
                        fontSize: '0.78rem',
                        cursor: tenantId ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {tenantRulesEnabled ? 'Desactivar Reglas Tenant' : 'Activar Reglas Tenant'}
                    </button>
                    <button type="button" onClick={handleApplyIso42001Governance} disabled={isRulesLoading} style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: '1px solid #38bdf8', borderRadius: '6px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer' }}>
                      Gobernanza ISO 42001
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveCustomRule} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                  <input type="text" required placeholder="Nombre de la regla" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} style={{ padding: '10px', background: '#0b0f19', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }} />
                  <input type="text" required placeholder="Patrón regex" value={ruleForm.pattern} onChange={(e) => setRuleForm({ ...ruleForm, pattern: e.target.value })} style={{ padding: '10px', background: '#0b0f19', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }} />
                  <button type="submit" disabled={isRulesLoading} style={{ padding: '10px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {isRulesLoading ? 'Guardando...' : '+ Añadir Regla'}
                  </button>
                </form>

                <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                        <th style={{ padding: '12px' }}>ID DE REGLA</th>
                        <th style={{ padding: '12px' }}>NOMBRE</th>
                        <th style={{ padding: '12px' }}>PATRÓN / EXPRESIÓN REGULAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customRules.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                            No hay reglas personalizadas definidas para este tenant.
                          </td>
                        </tr>
                      ) : (
                        customRules.map((rule, idx) => (
                          <tr key={rule.id || idx} style={{ borderBottom: '1px solid #1e293b', background: idx % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                            <td style={{ padding: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>{rule.id}</td>
                            <td style={{ padding: '12px', color: '#f8fafc', fontWeight: 'bold' }}>{rule.name}</td>
                            <td style={{ padding: '12px', color: '#34d399', fontFamily: 'monospace' }}>{rule.pattern}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#0b0f19', border: '1px solid #38bdf8', borderRadius: '12px', maxWidth: '460px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.05rem', fontWeight: '900' }}>
                Acceso y Carga de Token — S.A.A.R.E.
              </h3>
              <button type="button" onClick={() => setShowAuthModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <button type="button" onClick={() => { setAuthTab('TOKEN'); setAuthError(''); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: authTab === 'TOKEN' ? '#d97706' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer' }}>
                Cargar Token
              </button>
              <button type="button" onClick={() => { setAuthTab('LOGIN'); setAuthError(''); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: authTab === 'LOGIN' ? '#0284c7' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer' }}>
                Iniciar Sesión
              </button>
              <button type="button" onClick={() => { setAuthTab('SANDBOX'); setAuthError(''); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: authTab === 'SANDBOX' ? '#059669' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.72rem', cursor: 'pointer' }}>
                Alta Sandbox
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authTab === 'TOKEN' && (
                <>
                  <textarea
                    rows={3}
                    required
                    placeholder="Pega aquí tu Token Bearer o API Key..."
                    value={authForm.token}
                    onChange={(e) => setAuthForm({ ...authForm, token: e.target.value })}
                    style={{ padding: '10px', background: '#020617', border: '1px solid #334155', color: '#38bdf8', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.78rem', resize: 'vertical' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Tenant ID de tu organización (ej: mi-empresa)"
                    value={authForm.tenantId}
                    onChange={(e) => setAuthForm({ ...authForm, tenantId: e.target.value })}
                    style={{ padding: '10px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}
                  />
                  <input
                    type="email"
                    placeholder="Correo del operador (opcional)"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    style={{ padding: '10px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}
                  />
                </>
              )}

              {authTab === 'SANDBOX' && (
                <>
                  <input type="text" required placeholder="Nombre de la empresa u organismo" value={authForm.companyName} onChange={(e) => setAuthForm({ ...authForm, companyName: e.target.value })} style={{ padding: '10px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                  <input type="text" placeholder="Nombre del responsable (opcional)" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} style={{ padding: '10px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                </>
              )}

              {authTab !== 'TOKEN' && (
                <>
                  <input type="email" required placeholder="Correo corporativo" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} style={{ padding: '10px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                  <input type="password" required minLength={6} placeholder="Contraseña (mínimo 6 caracteres)" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} style={{ padding: '10px', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                </>
              )}

              {authError && (
                <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.78rem' }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                style={{
                  padding: '11px',
                  background: authTab === 'TOKEN' ? '#d97706' : authTab === 'SANDBOX' ? '#059669' : '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                {authSubmitting
                  ? 'Procesando...'
                  : authTab === 'TOKEN'
                    ? 'GUARDAR Y APLICAR TOKEN'
                    : authTab === 'SANDBOX'
                      ? 'CREAR ENTORNO SANDBOX'
                      : 'ENTRAR A LA CONSOLA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showOfficialReportModal && selectedEvidenceForPdf && (
        <OfficialReportModal
          evidence={selectedEvidenceForPdf}
          tenantId={tenantId}
          userEmail={userEmail}
          onClose={() => {
            setShowOfficialReportModal(false);
            setSelectedEvidenceForPdf(null);
          }}
        />
      )}

      {showSeatsModal && (
        <SeatsManagementModal
          tenantId={tenantId}
          onClose={() => setShowSeatsModal(false)}
        />
      )}

      {showExportModal && (
        <ReportExportModal
          tenantId={tenantId}
          evidences={evidences}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showFriaModal && (
        <FriaWizardModal
          tenantId={tenantId}
          onClose={() => setShowFriaModal(false)}
        />
      )}
    </div>
  );
}