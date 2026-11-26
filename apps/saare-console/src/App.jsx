// saare-console/src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConsoleProvider, useConsole } from './context/ConsoleContext';
import ConsoleShell from './layouts/ConsoleShell';
import OverviewView from './features/overview/OverviewView';
import RuntimeView from './features/runtime/RuntimeView';
import EvidenceView from './features/evidence/EvidenceView';
import GovernanceView from './features/governance/GovernanceView';
import AdministrationView from './features/administration/AdministrationView';
import OfficialReportModal from './components/OfficialReportModal';
import { SubsidiesHub } from './components/SubsidiesHub';
import { ExecutiveView } from './components/ExecutiveView';
import SeatsManagementModal from './components/SeatsManagementModal';
import ReportExportModal from './components/ReportExportModal';
import FriaWizardModal from './components/FriaReportModal';
import SoaIso42001CompilerButton from './components/SoaIso42001CompilerButton';
import { SAARE_CONFIG } from './config/saareState';
import apiService from './services/apiService';

const SAARE_PROTOCOL_COMMANDS = [
  {
    label: 'Auditoría Forense',
    code: 'SAARE-MD-FOR',
    prompt:
      'SAARE-MD-FOR — Ejecuta el protocolo S.A.A.R.E. en formato de Auditoría Forense sobre los logs del sistema. Incluye identificadores CRYPTO-ID y marcas de tiempo de los nodos.'
  },
  {
    label: 'Certificación Corporativa',
    code: 'SAARE-MD-CORP',
    prompt:
      'SAARE-MD-CORP — Genera un informe oficial de S.A.A.R.E. con formato de Certificación Corporativa. Incluye matriz de KPIs de resiliencia y el resumen ejecutivo orientado a negocio.'
  },
  {
    label: 'Blindaje Activo',
    code: 'SAARE-MD-SECU',
    prompt:
      'SAARE-MD-SECU — Activa el protocolo S.A.A.R.E. en Modo Seguridad. Despliega filtros perimetrales y de mitigación en tiempo real para contrarrestar vulnerabilidades lógicas.'
  },
  {
    label: 'Veredicto de Integridad',
    code: 'SAARE-MD-VERD',
    prompt:
      'SAARE-MD-VERD — Ejecuta el Veredicto de Integridad del Protocolo S.A.A.R.E. sobre el flujo de datos. Clasifica cada componente como VALIDADO o RECHAZADO y proporciona la justificación forense.'
  },
  {
    label: 'Auditoría Jurídica',
    code: 'SAARE-MD-LEGAL',
    prompt:
      'SAARE-MD-LEGAL — Ejecuta la Auditoría Jurídica del Protocolo S.A.A.R.E. sobre el contexto legal/procesal provisto. Contrasta las variables frente a marcos normativos vigentes.'
  },
  {
    label: 'Propiedad Intelectual (IP)',
    code: 'SAARE-MD-IPRES',
    prompt:
      'SAARE-MD-IPRES — Ejecuta la Auditoría de Propiedad Intelectual (IP) del Protocolo S.A.A.R.E. sobre el activo/código del expediente para emitir la tasa de similitud y blindaje industrial.'
  },
  {
    label: 'Cumplimiento Ex-Ante',
    code: 'INICIAR_CUMPLIMIENTO_EXANTE_SAARE',
    prompt: 'INICIAR_CUMPLIMIENTO_EXANTE_SAARE'
  },
  {
    label: 'Kill-Switch L7',
    code: 'SAARE_CONTROL.PY --KILL',
    danger: true,
    prompt: 'SAARE_CONTROL.PY --KILL'
  }
];

const DEFAULT_PROTOCOL_COMMANDS_STATE = SAARE_PROTOCOL_COMMANDS.reduce((acc, cmd) => {
  acc[cmd.code] = true;
  return acc;
}, {});

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

const normalizeTenantId = (id = '') => {
  return String(id || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '_')
    .slice(0, 32);
};

const readStorageItem = (key = '') => {
  if (!key || typeof window === 'undefined') return '';
  try {
    return window.sessionStorage?.getItem(key) || window.localStorage?.getItem(key) || '';
  } catch {
    return '';
  }
};

const writeStorageItem = (key = '', value = '') => {
  if (!key || typeof window === 'undefined') return;
  try {
    if (value) {
      window.localStorage?.setItem(key, value);
      window.sessionStorage?.setItem(key, value);
    } else {
      window.localStorage?.removeItem(key);
      window.sessionStorage?.removeItem(key);
    }
  } catch {
    // Ignorar restricciones de almacenamiento
  }
};

const getRulesEnabledStorageKey = (tenant = '') => {
  const clean = normalizeTenantId(tenant);
  return `saare_rules_enabled_${clean || 'default'}`;
};

const readStoredRulesEnabled = (tenant = '') => {
  if (!tenant) return true;
  const raw = readStorageItem(getRulesEnabledStorageKey(tenant));
  if (!raw) return true;
  return raw !== 'false';
};

const getProtocolCommandsStorageKey = (tenant = '') => {
  const clean = normalizeTenantId(tenant);
  return `saare_protocol_cmds_${clean || 'default'}`;
};

const readStoredProtocolCommands = (tenant = '') => {
  try {
    const raw = readStorageItem(getProtocolCommandsStorageKey(tenant));
    if (!raw) return { ...DEFAULT_PROTOCOL_COMMANDS_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROTOCOL_COMMANDS_STATE,
      ...(parsed && typeof parsed === 'object' ? parsed : {})
    };
  } catch {
    return { ...DEFAULT_PROTOCOL_COMMANDS_STATE };
  }
};

const getApiEndpoint = (path = '') => {
  const baseUrl = String(SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es')
    .trim()
    .replace(/\/+$/, '');
  const cleanBase = baseUrl
    .replace(/\/api\/v1$/i, '')
    .replace(/\/api$/i, '')
    .replace(/\/v1$/i, '');
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
  const raw = String(id || '').trim();
  if (!raw || raw.length < 2) return false;
  if (raw.includes('@')) return false;
  const normalized = normalizeTenantId(raw);
  return normalized.length >= 2;
};

const triggerBlobDownload = (content, filename, mimeType = 'application/json;charset=utf-8') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
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

const triggerBase64Download = (base64Data, filename, mimeType = 'application/timestamp-reply') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const computeSha256Hex = async (text = '') => {
  const data = new TextEncoder().encode(String(text || ''));
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

function SaareConsoleInner() {
  const {
    activeRoute,
    routes,
    navigateTo,
    tenantId,
    selectTenant,
    userEmail,
    setUserEmail,
    role,
    setRole,
    pushActivity
  } = useConsole();

  const queryParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const urlTenant = queryParams.get('tenant') ? normalizeTenantId(queryParams.get('tenant')) : null;
  const urlRole = queryParams.get('role') ? queryParams.get('role').trim() : null;
  const checkoutStatus = queryParams.get('checkout');

  const [authToken, setAuthToken] = useState(
    () => readStorageItem('saare_token') || readStorageItem('saare_auth_token') || ''
  );

  const [availableTenants, setAvailableTenants] = useState(() => {
    const initial = [];
    const current =
      urlTenant ||
      tenantId ||
      normalizeTenantId(readStorageItem('saare_tenant_domain') || readStorageItem('saare_tenant') || '');
    if (current && isValidTenantId(current)) {
      initial.push({ id: current, name: current });
    }
    return initial;
  });

  const [secondaryMode, setSecondaryMode] = useState(''); // '' | 'EXECUTIVE' | 'SUBSIDIES'
  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [isFetchingVault, setIsFetchingVault] = useState(false);
  const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState('');

  const [billingInfo, setBillingInfo] = useState(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const [forensicBatch, setForensicBatch] = useState(null);
  const [isSealingBatch, setIsSealingBatch] = useState(false);
  const [inclusionStatusByEvidence, setInclusionStatusByEvidence] = useState({});

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
  const [selectedEvidenceDetail, setSelectedEvidenceDetail] = useState(null);

  const [pendingDangerCommand, setPendingDangerCommand] = useState(null);

  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [runningProtocolCode, setRunningProtocolCode] = useState('');
  const [protocolOutput, setProtocolOutput] = useState(null);
  const [dossierRef, setDossierRef] = useState('');
  const [protocolCommandsEnabled, setProtocolCommandsEnabled] = useState(() => {
    const candidate =
      urlTenant ||
      tenantId ||
      normalizeTenantId(readStorageItem('saare_tenant_domain') || readStorageItem('saare_tenant') || '');
    return readStoredProtocolCommands(isValidTenantId(candidate) ? candidate : '');
  });

  const [customRules, setCustomRules] = useState([]);
  const [tenantRulesEnabled, setTenantRulesEnabled] = useState(() => {
    const candidate =
      urlTenant ||
      tenantId ||
      normalizeTenantId(readStorageItem('saare_tenant_domain') || readStorageItem('saare_tenant') || '');
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

  const handleUnauthorizedSession = useCallback(
    (contextLabel = 'sesión') => {
      writeStorageItem('saare_token', '');
      writeStorageItem('saare_auth_token', '');
      setAuthToken('');
      triggerGovernance(
        `Sesión no autorizada o caducada (HTTP 401) en ${contextLabel}. Vuelve a cargar el token o iniciar sesión.`
      );
    },
    [triggerGovernance]
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const hasOpenModal =
      showAuthModal ||
      showOfficialReportModal ||
      showSeatsModal ||
      showExportModal ||
      showFriaModal ||
      Boolean(pendingDangerCommand);
    if (!hasOpenModal) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (pendingDangerCommand) setPendingDangerCommand(null);
      else if (showAuthModal) setShowAuthModal(false);
      else if (showOfficialReportModal) {
        setShowOfficialReportModal(false);
        setSelectedEvidenceForPdf(null);
      } else if (showSeatsModal) setShowSeatsModal(false);
      else if (showExportModal) setShowExportModal(false);
      else if (showFriaModal) setShowFriaModal(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    showAuthModal,
    showOfficialReportModal,
    showSeatsModal,
    showExportModal,
    showFriaModal,
    pendingDangerCommand
  ]);

  useEffect(() => {
    if (urlTenant && isValidTenantId(urlTenant) && urlTenant !== tenantId) {
      selectTenant(urlTenant);
    }
    if (urlRole) {
      setRole(urlRole);
    }
  }, [urlTenant, urlRole, tenantId, selectTenant, setRole]);

  const persistSessionData = useCallback(
    ({ token, tenant, email, role: nextRole, planId, apiKey, companyName }) => {
      const cleanToken = String(token || '').replace(/^Bearer\s+/i, '').trim();
      const cleanTenant = normalizeTenantId(tenant);
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanRole = String(nextRole || '').trim();

      if (cleanToken) {
        writeStorageItem('saare_token', cleanToken);
        writeStorageItem('saare_auth_token', cleanToken);
        setAuthToken(cleanToken);
      }

      if (cleanTenant && isValidTenantId(cleanTenant)) {
        writeStorageItem('saare_tenant_domain', cleanTenant);
        writeStorageItem('saare_tenant', cleanTenant);
        selectTenant(cleanTenant);
        setTenantRulesEnabled(readStoredRulesEnabled(cleanTenant));
        setProtocolCommandsEnabled(readStoredProtocolCommands(cleanTenant));
        setAvailableTenants((prev) =>
          prev.some((t) => t.id === cleanTenant)
            ? prev
            : [
                { id: cleanTenant, name: companyName ? `${companyName} (${cleanTenant})` : cleanTenant },
                ...prev
              ]
        );
      }

      if (cleanEmail) {
        writeStorageItem('saare_user_email', cleanEmail);
        setUserEmail(cleanEmail);
      }

      if (cleanRole) {
        writeStorageItem('saare_user_role', cleanRole);
        setRole(cleanRole);
      }

      if (planId) {
        writeStorageItem('saare_plan_id', planId);
      }

      if (apiKey) {
        writeStorageItem('saare_api_key', apiKey);
      }

      return { cleanToken, cleanTenant, cleanEmail, cleanRole };
    },
    [selectTenant, setUserEmail, setRole]
  );

  const fetchBillingUsage = useCallback(
    async (overrideTenant = null, overrideToken = null) => {
      const targetTenant = normalizeTenantId(overrideTenant || tenantId);
      const activeTok = String(overrideToken !== null ? overrideToken : authToken).trim();
      if (!targetTenant) {
        setBillingInfo(null);
        return;
      }
      try {
        const headers = { 'x-saare-tenant': targetTenant };
        if (activeTok) headers.Authorization = `Bearer ${activeTok}`;
        const res = await fetch(getApiEndpoint('/api/v1/billing/usage'), { headers });
        if (res.status === 401) {
          setBillingInfo(null);
          handleUnauthorizedSession('facturación');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setBillingInfo(data);
        } else {
          setBillingInfo(null);
        }
      } catch {
        setBillingInfo(null);
      }
    },
    [tenantId, authToken, handleUnauthorizedSession]
  );

  const fetchCustomRules = useCallback(
    async (overrideTenant = null, overrideToken = null) => {
      const targetTenant = normalizeTenantId(overrideTenant || tenantId);
      const activeTok = String(overrideToken !== null ? overrideToken : authToken).trim();
      if (!targetTenant) {
        setCustomRules([]);
        return;
      }
      setIsRulesLoading(true);
      try {
        const headers = { 'x-saare-tenant': targetTenant, 'Content-Type': 'application/json' };
        if (activeTok) headers.Authorization = `Bearer ${activeTok}`;
        const res = await fetch(getApiEndpoint('/api/v1/custom-rules'), { headers });
        if (res.status === 401) {
          handleUnauthorizedSession('reglas de gobernanza');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setCustomRules(Array.isArray(data?.rules) ? data.rules : []);
          if (typeof data?.enabled === 'boolean') {
            setTenantRulesEnabled(data.enabled);
            writeStorageItem(getRulesEnabledStorageKey(targetTenant), String(data.enabled));
          } else {
            setTenantRulesEnabled(readStoredRulesEnabled(targetTenant));
          }
          if (data?.protocolCommands && typeof data.protocolCommands === 'object') {
            const mergedCmds = { ...DEFAULT_PROTOCOL_COMMANDS_STATE, ...data.protocolCommands };
            setProtocolCommandsEnabled(mergedCmds);
            writeStorageItem(getProtocolCommandsStorageKey(targetTenant), JSON.stringify(mergedCmds));
          }
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch {
        triggerGovernance('Error al cargar reglas personalizadas desde D1.');
      } finally {
        setIsRulesLoading(false);
      }
    },
    [tenantId, authToken, handleUnauthorizedSession, triggerGovernance]
  );

  const syncProtocolCommandsConfig = useCallback(
    async (nextCommandsMap) => {
      const storageKey = getProtocolCommandsStorageKey(tenantId);
      writeStorageItem(storageKey, JSON.stringify(nextCommandsMap));

      if (!tenantId || !authToken) return;
      try {
        await fetch(getApiEndpoint('/api/v1/custom-rules'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-saare-tenant': tenantId,
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            enabled: tenantRulesEnabled,
            rules: customRules,
            protocolCommands: nextCommandsMap
          })
        });
      } catch {
        // Mantiene el estado local aunque la sincronización remota falle
      }
    },
    [tenantId, authToken, tenantRulesEnabled, customRules]
  );

  const handleToggleProtocolCommand = useCallback(
    async (code) => {
      const nextValue = !(protocolCommandsEnabled[code] !== false);
      const updated = {
        ...protocolCommandsEnabled,
        [code]: nextValue
      };
      setProtocolCommandsEnabled(updated);
      await syncProtocolCommandsConfig(updated);
      triggerGovernance(`Comando ${code} ${nextValue ? 'ACTIVADO' : 'DESACTIVADO'}.`);
    },
    [protocolCommandsEnabled, syncProtocolCommandsConfig, triggerGovernance]
  );

  const handleSetAllProtocolCommands = useCallback(
    async (enabledValue) => {
      const nextState = Boolean(enabledValue);
      const updated = SAARE_PROTOCOL_COMMANDS.reduce((acc, cmd) => {
        acc[cmd.code] = nextState;
        return acc;
      }, {});
      setProtocolCommandsEnabled(updated);
      await syncProtocolCommandsConfig(updated);
      triggerGovernance(
        nextState
          ? 'Todos los botones de protocolo ACTIVADOS.'
          : 'Todos los botones de protocolo DESACTIVADOS.'
      );
    },
    [syncProtocolCommandsConfig, triggerGovernance]
  );

  const handleToggleTenantRules = useCallback(
    async (nextEnabled) => {
      if (!tenantId) {
        triggerGovernance('Configura un Tenant ID antes de cambiar el estado de las reglas.');
        return;
      }

      const desiredState = Boolean(nextEnabled);
      setTenantRulesEnabled(desiredState);
      writeStorageItem(getRulesEnabledStorageKey(tenantId), String(desiredState));
      setIsRulesLoading(true);

      try {
        const headers = { 'x-saare-tenant': tenantId, 'Content-Type': 'application/json' };
        if (authToken) headers.Authorization = `Bearer ${authToken}`;

        const res = await fetch(getApiEndpoint('/api/v1/custom-rules'), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            enabled: desiredState,
            rules: customRules,
            protocolCommands: protocolCommandsEnabled
          })
        });

        if (res.status === 401) {
          handleUnauthorizedSession('actualización de reglas');
          return;
        }

        const data = res.ok ? await res.json().catch(() => null) : null;
        const effectiveEnabled = typeof data?.enabled === 'boolean' ? data.enabled : desiredState;
        setTenantRulesEnabled(effectiveEnabled);
        writeStorageItem(getRulesEnabledStorageKey(tenantId), String(effectiveEnabled));

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
    },
    [tenantId, authToken, customRules, protocolCommandsEnabled, handleUnauthorizedSession, triggerGovernance]
  );

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
        body: JSON.stringify({
          preset: 'ISO_42001',
          enabled: tenantRulesEnabled,
          rules: finalRules,
          protocolCommands: protocolCommandsEnabled
        })
      });

      if (res.status === 401) {
        handleUnauthorizedSession('políticas ISO 42001');
        return;
      }

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
        body: JSON.stringify({
          enabled: tenantRulesEnabled,
          rules: updatedRules,
          protocolCommands: protocolCommandsEnabled
        })
      });

      if (res.status === 401) {
        handleUnauthorizedSession('guardado de regla DLP');
        return;
      }

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

  const handleRemoveCustomRule = async (ruleId) => {
    if (!tenantId || !ruleId) return;
    setIsRulesLoading(true);
    const updatedRules = customRules.filter((r) => r.id !== ruleId);
    try {
      const headers = { 'x-saare-tenant': tenantId, 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch(getApiEndpoint('/api/v1/custom-rules'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          enabled: tenantRulesEnabled,
          rules: updatedRules,
          protocolCommands: protocolCommandsEnabled
        })
      });

      if (res.status === 401) {
        handleUnauthorizedSession('eliminación de regla DLP');
        return;
      }

      if (!res.ok) {
        throw new Error('Error al eliminar regla en Bóveda D1');
      }

      const data = await res.json().catch(() => null);
      setCustomRules(Array.isArray(data?.rules) ? data.rules : updatedRules);
      triggerGovernance('Regla personalizada eliminada.');
    } catch {
      triggerGovernance('Error al eliminar la regla personalizada.');
    } finally {
      setIsRulesLoading(false);
    }
  };

  const mapEvidences = useCallback((remoteEvidences, activeTenantId) => {
    const rawList = Array.isArray(remoteEvidences)
      ? remoteEvidences
      : remoteEvidences?.evidences || remoteEvidences?.traces || [];

    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    return rawList
      .filter((item) => item && typeof item === 'object')
      .map((item, idx) => {
        const isDeny =
          item.final_decision === 'DENY' || item.decision === 'DENY' || item.verdict === 'RECHAZADO';
        const rawPromptVal = item.prompt || item.rawPrompt || item.input || '';
        const safePrompt = isDeny
          ? '[CONTENIDO BLOQUEADO Y SANITIZADO EX-ANTE POR POLÍTICA DLP]'
          : redactSensitiveText(rawPromptVal || '(Sin instrucción)');

        return {
          id: item.trace_id || item.id || `EV-L7-${1000 + idx}`,
          time: item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
          rawTimestamp: item.timestamp || new Date().toISOString(),
          cat: item.cat || (isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME'),
          sub: item.sub || '',
          prompt: safePrompt,
          responseOutput: isDeny
            ? '[BLOQUEADO EX-ANTE]'
            : redactSensitiveText(item.responseOutput || item.response || ''),
          verdict: item.verdict || (isDeny ? 'RECHAZADO' : 'PERMITIDO'),
          decision: isDeny ? 'DENY' : 'ALLOW',
          anchored: item.anchored !== undefined ? item.anchored : 0,
          type: isDeny ? 'PRIVACIDAD' : 'WORKFLOWS',
          user: item.user || '',
          tenant: isValidTenantId(item.tenant_id || item.tenant)
            ? normalizeTenantId(item.tenant_id || item.tenant)
            : activeTenantId,
          merkleRoot: item.ms3v_hash || item.merkle_root || item.merkleRoot || '',
          latency: item.execution_latency_ms || item.latency || 0,
          rawJson: item
        };
      });
  }, []);

  const fetchTenantMetrics = useCallback(
    async (overrideTenant = null, overrideToken = null, overrideRole = null) => {
      const targetTenant = normalizeTenantId(overrideTenant || tenantId);
      const activeTok = String(overrideToken !== null ? overrideToken : authToken).trim();
      const activeRole = overrideRole || role;
      if (!targetTenant) {
        setTenantMetrics([]);
        return;
      }

      setIsFetchingMetrics(true);
      setMetricsError('');
      try {
        const endpoint = getApiEndpoint('/api/v1/metrics/tenants');
        const headers = {
          'x-saare-tenant': targetTenant,
          ...(activeRole ? { 'x-saare-role': activeRole } : {}),
          'Content-Type': 'application/json'
        };
        if (activeTok) {
          headers.Authorization = `Bearer ${activeTok}`;
        }

        const res = await fetch(endpoint, { method: 'GET', headers });
        if (res.status === 401) {
          setTenantMetrics([]);
          setMetricsError('Sesión no autorizada (HTTP 401) al consultar métricas de tenants.');
          handleUnauthorizedSession('métricas de tenants');
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} al consultar métricas multi-tenant`);
        }

        const json = await res.json();
        const rawRows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

        const isGlobalAdmin = activeRole === 'PLATFORM_ADMIN' && Boolean(activeTok);
        const cleanRows = rawRows
          .filter((row) => isValidTenantId(row?.tenant_id))
          .map((row) => ({ ...row, tenant_id: normalizeTenantId(row.tenant_id) }))
          .filter((row) => isGlobalAdmin || row.tenant_id === targetTenant);

        setTenantMetrics(cleanRows);
      } catch (e) {
        setMetricsError(e.message || 'Error al cargar métricas agregadas desde D1.');
      } finally {
        setIsFetchingMetrics(false);
      }
    },
    [tenantId, role, authToken, handleUnauthorizedSession]
  );

  const fetchTelemetryDirectFromVault = useCallback(
    async (overrideTenant = null, overrideToken = null) => {
      const targetTenant = normalizeTenantId(overrideTenant || tenantId);
      const activeTok = String(overrideToken !== null ? overrideToken : authToken).trim();
      if (!targetTenant) {
        setEvidences([]);
        setTenantMetrics([]);
        setBillingInfo(null);
        setForensicBatch(null);
        setInclusionStatusByEvidence({});
        return;
      }

      setIsFetchingVault(true);
      try {
        const traces = await apiService.getTelemetryTraces({
          tenant: targetTenant,
          user: userEmail,
          token: activeTok,
          role
        });

        const mapped = mapEvidences(traces, targetTenant);
        setEvidences(mapped);
        triggerGovernance(`Bóveda D1 [${targetTenant}] sincronizada (${mapped.length} registros).`);

        await Promise.all([
          fetchTenantMetrics(targetTenant, activeTok, role),
          fetchBillingUsage(targetTenant, activeTok)
        ]);
      } catch {
        setEvidences([]);
        triggerGovernance(`Bóveda D1 [${targetTenant}] sin registros o error de conexión.`);
      } finally {
        setIsFetchingVault(false);
      }
    },
    [
      tenantId,
      userEmail,
      authToken,
      role,
      mapEvidences,
      fetchTenantMetrics,
      fetchBillingUsage,
      triggerGovernance
    ]
  );

  const handleSealForensicBatch = useCallback(async () => {
    if (!tenantId) {
      triggerGovernance('Configura un Tenant ID antes de sellar un lote forense.');
      return;
    }

    if (!authToken) {
      setAuthError('Introduce un Token Bearer o inicia sesión para sellar lotes forenses.');
      setAuthTab('TOKEN');
      setShowAuthModal(true);
      return;
    }

    setIsSealingBatch(true);
    try {
      const res = await fetch(getApiEndpoint('/api/v1/forensics/batch/seal'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saare-tenant': tenantId,
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          tenantId,
          enable2of3Custody: true,
          limit: 100
        })
      });

      if (res.status === 401) {
        handleUnauthorizedSession('sellado de lote forense');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      setForensicBatch(data);
      setInclusionStatusByEvidence({});
      const sealLabel =
        data.timestampSeal?.status ||
        (data.isQualifiedEidas ? 'eIDAS Cualificado' : data.assuranceLevel);
      triggerGovernance(`Lote ${data.batchId} sellado (${sealLabel}).`);
      pushActivity({
        module: 'EVIDENCE',
        action: 'SEAL_MERKLE_BATCH',
        status: 'VERIFIED',
        summary: `Lote ${data.batchId} sellado (${sealLabel}).`
      });
    } catch (err) {
      triggerGovernance(err?.message || 'Error al sellar el lote forense.');
    } finally {
      setIsSealingBatch(false);
    }
  }, [tenantId, authToken, handleUnauthorizedSession, triggerGovernance, pushActivity]);

  const handleDownloadForensicBatchBundle = useCallback(() => {
    if (!forensicBatch) return;
    triggerBlobDownload(
      JSON.stringify(forensicBatch, null, 2),
      `lote-forense-merkle-${(forensicBatch.batchId || tenantId || 'batch').toLowerCase()}.json`,
      'application/json;charset=utf-8'
    );
    triggerGovernance(`Comprobante completo del lote ${forensicBatch.batchId} descargado.`);
  }, [forensicBatch, tenantId, triggerGovernance]);

  const handleDownloadTsaToken = useCallback(() => {
    const tsrBase64 = forensicBatch?.timestampSeal?.tsrBase64;
    if (!tsrBase64) return;
    triggerBase64Download(
      tsrBase64,
      `sello-rfc3161-${(forensicBatch.batchId || tenantId || 'tsa').toLowerCase()}.tsr`,
      'application/timestamp-reply'
    );
    triggerGovernance(`Archivo binario RFC 3161 (.tsr) descargado para ${forensicBatch.batchId}.`);
  }, [forensicBatch, tenantId, triggerGovernance]);

  const handleExportTenantSovereigntyCertificate = useCallback(async () => {
    if (!tenantId) {
      triggerGovernance('Configura un Tenant ID antes de exportar el Certificado de Soberanía D1.');
      return;
    }

    const issuedAt = new Date().toISOString();
    const inspections = evidences.length;
    const denied = evidences.filter((e) => e.decision === 'DENY').length;
    const allowed = inspections - denied;
    const blockRate = inspections > 0 ? ((denied / inspections) * 100).toFixed(1) : '0.0';
    const latestHash = forensicBatch?.merkleRoot || evidences[0]?.merkleRoot || 'SIN_TRAZAS_SELLADAS';

    const canonicalPayload = {
      certificateType: 'SAARE_D1_SOVEREIGNTY_AND_INTEGRITY_ATTESTATION',
      protocol: 'SGP 1.0',
      issuedAtUtc: issuedAt,
      tenant: {
        tenantId,
        companyName: billingInfo?.companyName || tenantId,
        planId: billingInfo?.planId || readStorageItem('saare_plan_id') || 'STANDARD',
        operatorEmail: userEmail || 'N/A'
      },
      infrastructure: {
        apiEndpoint: getApiEndpoint('/health'),
        vaultScope: 'D1 / Edge State Store',
        tenantIsolation: 'STRICT_TENANT_ID_SCOPING'
      },
      cryptographicState: {
        latestMerkleOrTraceDigest: latestHash,
        latestBatchId: forensicBatch?.batchId || null,
        tsaStatus: forensicBatch?.timestampSeal?.status || 'PENDING_BATCH_SEAL',
        tsaReference: forensicBatch?.timestampSeal?.tsaReference || null,
        custody2of3: Boolean(forensicBatch?.custody2of3)
      },
      telemetrySummary: {
        totalInspections: inspections,
        allowedCount: allowed,
        deniedCount: denied,
        blockRatePercent: blockRate
      }
    };

    const canonicalJson = JSON.stringify(canonicalPayload, null, 2);
    const certificateSha256 = await computeSha256Hex(canonicalJson);

    const printableHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Certificado de Anclaje y Soberanía D1 - ${tenantId}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 36px; line-height: 1.45; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 14px; margin-bottom: 20px; }
    h1 { font-size: 20px; margin: 0 0 6px 0; color: #0f172a; }
    .sub { font-size: 12px; color: #475569; }
    h2 { font-size: 13px; text-transform: uppercase; color: #0369a1; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 22px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; word-break: break-all; }
    .box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; font-size: 12px; }
    .footer { margin-top: 28px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    @media print { body { margin: 18px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>CERTIFICADO DE ANCLAJE TÉCNICO Y SOBERANÍA D1 (SGP 1.0)</h1>
    <div class="sub">Emitido por S.A.A.R.E. Control Plane · Fecha UTC: <strong>${issuedAt}</strong></div>
  </div>

  <div class="box">
    <strong>Entidad / Tenant Auditado:</strong> ${canonicalPayload.tenant.companyName} (<code>${tenantId}</code>) &nbsp;|&nbsp;
    <strong>Plan:</strong> ${canonicalPayload.tenant.planId}
  </div>

  <h2>1. Acreditación de Infraestructura y Aislamiento Multitenant</h2>
  <p style="font-size:12px;">
    Este documento acredita los parámetros técnicos y el estado criptográfico registrados para el inquilino
    <strong>${tenantId}</strong>. Las consultas, métricas, reglas DLP y lotes forenses operan bajo aislamiento
    por <code>tenant_id</code>.
  </p>

  <h2>2. Sello de Metadatos Criptográficos e Integridad (SHA-256)</h2>
  <div class="box">
    <strong>SHA-256 DEL CERTIFICADO EMITIDO:</strong><br/>
    <span class="mono">${certificateSha256}</span><br/><br/>
    <strong>ÚLTIMA RAÍZ MERKLE / HUELLA DE TRAZA (${tenantId}):</strong><br/>
    <span class="mono">${latestHash}</span><br/><br/>
    <strong>LOTE FORENSE Y SELLADO RFC 3161:</strong>
    Lote: <code>${canonicalPayload.cryptographicState.latestBatchId || 'Sin lote sellado'}</code> |
    Estado TSA: <code>${canonicalPayload.cryptographicState.tsaStatus}</code> |
    Ref. TSA: <code>${canonicalPayload.cryptographicState.tsaReference || 'N/A'}</code>
  </div>

  <h2>3. Correspondencia Técnica Normativa y Alcance Probatorio</h2>
  <table>
    <thead>
      <tr><th>Marco</th><th>Requisito Técnico</th><th>Mecanismo Implementado en Tenant</th></tr>
    </thead>
    <tbody>
      <tr><td>EU AI Act (Art. 12 y 27)</td><td>Trazabilidad y evaluación de impacto (FRIA)</td><td>Registro encadenado por hash y módulo de auditoría FRIA en consola (${inspections} inspecciones).</td></tr>
      <tr><td>RGPD (Art. 5 y 25)</td><td>Minimización y privacidad desde el diseño</td><td>Sanitización ex-ante en RAM antes de persistencia (${denied} bloqueos DLP).</td></tr>
      <tr><td>DORA (UE 2022/2554)</td><td>Resiliencia operativa digital en TIC</td><td>Política Fail-Closed y aislamiento lógico por <code>tenant_id</code>.</td></tr>
      <tr><td>Art. 326 LEC</td><td>Integridad y verificabilidad documental</td><td>Firma Ed25519, árbol de Merkle y sellado temporal RFC 3161 verificables por lote.</td></tr>
    </tbody>
  </table>

  <div class="footer">
    Diligencia técnica: La consistencia entre el SHA-256 de este documento, los registros en D1 y los comprobantes
    RFC 3161 del lote permite verificar la integridad frente a alteraciones posteriores. Este documento constituye
    soporte técnico de trazabilidad e integridad para auditoría y cumplimiento, sujeto a la verificación pericial y
    valoración jurídica aplicables en cada procedimiento.
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'noopener,noreferrer');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printableHtml);
      printWin.document.close();
    } else {
      triggerBlobDownload(
        printableHtml,
        `certificado-soberania-d1-${tenantId.toLowerCase()}-${Date.now()}.html`,
        'text/html;charset=utf-8'
      );
    }

    triggerGovernance(
      `Certificado de Soberanía D1 emitido para [${tenantId}] (SHA-256: ${certificateSha256.slice(0, 12)}...).`
    );
  }, [tenantId, evidences, forensicBatch, billingInfo, userEmail, triggerGovernance]);

  const handleVerifyEvidenceInclusion = useCallback(
    async (ev) => {
      if (!forensicBatch?.merkleRoot || !forensicBatch?.proofsByEvidenceId) {
        triggerGovernance('Primero sella un lote de Merkle para verificar pruebas de inclusión.');
        return;
      }

      const proofEntry =
        forensicBatch.proofsByEvidenceId[ev.id] ||
        forensicBatch.proofsByEvidenceId[ev.rawJson?.evidence_id] ||
        null;

      if (!proofEntry) {
        setInclusionStatusByEvidence((prev) => ({ ...prev, [ev.id]: 'NO_IN_BATCH' }));
        triggerGovernance(`La evidencia ${ev.id} no está incluida en el lote ${forensicBatch.batchId}.`);
        return;
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(tenantId ? { 'x-saare-tenant': tenantId } : {})
        };
        if (authToken) headers.Authorization = `Bearer ${authToken}`;

        const res = await fetch(getApiEndpoint('/api/v1/forensics/batch/verify'), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            leafHash: proofEntry.leafHash,
            proof: proofEntry.proof,
            merkleRoot: forensicBatch.merkleRoot
          })
        });

        const data = await res.json();
        const valid = Boolean(res.ok && data?.verified);
        setInclusionStatusByEvidence((prev) => ({
          ...prev,
          [ev.id]: valid ? 'VERIFIED' : 'INVALID'
        }));
        triggerGovernance(
          valid
            ? `Inclusión Merkle verificada para ${ev.id}.`
            : `La prueba de inclusión de ${ev.id} no coincide con la raíz.`
        );
      } catch {
        triggerGovernance('Error al verificar la prueba de inclusión.');
      }
    },
    [forensicBatch, tenantId, authToken, triggerGovernance]
  );

  const handleTenantChange = (rawTenant) => {
    const newTenant = normalizeTenantId(rawTenant);
    selectTenant(newTenant);
    setTenantRulesEnabled(readStoredRulesEnabled(newTenant));
    setProtocolCommandsEnabled(readStoredProtocolCommands(newTenant));
    setTestResult(null);
    setProtocolOutput(null);
    setCustomRules([]);
    setBillingInfo(null);
    setTenantMetrics([]);
    setForensicBatch(null);
    setInclusionStatusByEvidence({});
    setSelectedEvidenceDetail(null);

    if (newTenant) {
      writeStorageItem('saare_tenant_domain', newTenant);
      writeStorageItem('saare_tenant', newTenant);
      fetchTelemetryDirectFromVault(newTenant);
      if (activeTab === 'RULES') {
        fetchCustomRules(newTenant);
      }
    } else {
      writeStorageItem('saare_tenant_domain', '');
      writeStorageItem('saare_tenant', '');
      setEvidences([]);
    }
  };

  const handleLogout = () => {
    [
      'saare_token',
      'saare_auth_token',
      'saare_api_key',
      'saare_plan_id',
      'saare_tenant_domain',
      'saare_tenant',
      'saare_user_email',
      'saare_user_role',
      'saare_session',
      'saare_consent_accepted'
    ].forEach((k) => {
      writeStorageItem(k, '');
    });

    setAuthToken('');
    setUserEmail('');
    setRole('READ_ONLY');
    selectTenant('');
    setAvailableTenants([]);
    setEvidences([]);
    setTenantMetrics([]);
    setBillingInfo(null);
    setForensicBatch(null);
    setInclusionStatusByEvidence({});
    setCustomRules([]);
    setTenantRulesEnabled(true);
    setProtocolCommandsEnabled({ ...DEFAULT_PROTOCOL_COMMANDS_STATE });
    setTestResult(null);
    setProtocolOutput(null);
    setSelectedEvidenceDetail(null);
    setSecondaryMode('');
    triggerGovernance('Sesión cerrada. Consola restablecida.');
  };

  useEffect(() => {
    if (checkoutStatus === 'success' && urlTenant) {
      writeStorageItem('saare_tenant_domain', urlTenant);
      writeStorageItem('saare_tenant', urlTenant);
      selectTenant(urlTenant);
      triggerGovernance(`Suscripción activada para [${urlTenant}].`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkoutStatus, urlTenant, selectTenant, triggerGovernance]);

  useEffect(() => {
    const updateClock = () => setTimeStr(new Date().toTimeString().split(' ')[0]);
    updateClock();
    const intervalClock = setInterval(updateClock, 1000);
    return () => clearInterval(intervalClock);
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchTelemetryDirectFromVault(tenantId, authToken);
    }
  }, [tenantId, authToken, fetchTelemetryDirectFromVault]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError('');

    try {
      if (authTab === 'TOKEN') {
        const cleanToken = String(authForm.token || '').replace(/^Bearer\s+/i, '').trim();
        const targetTenant = normalizeTenantId(authForm.tenantId || tenantId || '');

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
          role: role && role !== 'READ_ONLY' ? role : 'TENANT_ADMIN'
        });

        setShowAuthModal(false);
        setAuthForm({ email: '', companyName: '', name: '', password: '', token: '', tenantId: '' });
        triggerGovernance(`Token cargado para [${cleanTenant}].`);
        await fetchTelemetryDirectFromVault(cleanTenant, cleanToken);
        return;
      }

      const targetTenant = normalizeTenantId(authForm.tenantId || tenantId || '');
      const endpoint =
        authTab === 'SANDBOX'
          ? getApiEndpoint('/api/v1/sandbox/provision')
          : getApiEndpoint('/api/v1/auth/login');

      const payload =
        authTab === 'SANDBOX'
          ? {
              email: authForm.email,
              companyName: authForm.companyName,
              name: authForm.name || authForm.email.split('@')[0],
              password: authForm.password,
              ...(targetTenant ? { tenantId: targetTenant } : {})
            }
          : {
              email: authForm.email,
              password: authForm.password,
              ...(targetTenant ? { tenantId: targetTenant, tenant: targetTenant } : {})
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(targetTenant ? { 'x-saare-tenant': targetTenant } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data?.token) {
        throw new Error(data?.message || data?.error || 'No se pudo completar la autenticación.');
      }

      const newTenant = normalizeTenantId(
        data.user?.tenantId || data.user?.tenantName || authForm.tenantId || ''
      );
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
      const headers = {
        'Content-Type': 'application/json',
        ...(tenantId ? { 'x-saare-tenant': tenantId } : {})
      };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const res = await fetch(getApiEndpoint('/api/v1/billing/checkout'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: userEmail || undefined,
          companyName: billingInfo?.companyName || tenantId || undefined,
          tenantId: tenantId || undefined,
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
      triggerGovernance(data?.message || data?.error || 'No se pudo abrir Stripe Checkout.');
    } catch {
      triggerGovernance('Error de red conectando con Stripe Billing.');
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setIsBillingLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(tenantId ? { 'x-saare-tenant': tenantId } : {})
      };
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
      triggerGovernance(data?.message || data?.error || 'No hay suscripción activa para gestionar.');
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
        triggerBlobDownload(
          regText,
          `SAARE_L7_POLICY_${tenantId || 'cliente'}.reg`,
          'text/plain;charset=utf-8'
        );
        triggerGovernance(`Directiva GPO generada para [${tenantId || 'cliente'}].`);
        return;
      }
    } catch {}

    const gateway = getApiEndpoint('/v1/chat/completions');
    const trustAnchor = SAARE_CONFIG?.TRUST_ANCHOR || '';
    const licenseKey =
      billingInfo?.credentials?.licenseKey || authToken || readStorageItem('saare_api_key') || '';
    const extensionId = String(SAARE_CONFIG?.EXTENSION_ID || '').trim();

    const lines = [
      'Windows Registry Editor Version 5.00',
      '',
      `[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome\\3rdparty\\extensions\\${extensionId || 'SAARE_EXTENSION'}\\policy]`,
      `"TenantId"="${tenantId}"`,
      `"LicenseKey"="${licenseKey}"`,
      `"ProxyGateway"="${gateway}"`,
      `"TrustAnchor"="${trustAnchor}"`,
      '"FailClosed"=dword:00000001',
      '"EnableExAnteEnforcement"=dword:00000001'
    ];

    triggerBlobDownload(
      `${lines.join('\r\n')}\r\n`,
      `SAARE_L7_POLICY_${tenantId || 'cliente'}.reg`,
      'text/plain;charset=utf-8'
    );
    triggerGovernance(`Directiva GPO generada para [${tenantId || 'cliente'}].`);
  };

  const handleDownloadK8sManifest = () => {
    const yamlContent =
      [
        'apiVersion: v1',
        'kind: ConfigMap',
        'metadata:',
        '  name: saare-ip-manifest',
        '  namespace: saare-system',
        'data:',
        `  TENANT_ID: "${tenantId}"`,
        `  GATEWAY_URL: "${getApiEndpoint('/v1/chat/completions')}"`
      ].join('\n') + '\n';

    triggerBlobDownload(
      yamlContent,
      `01-ip-manifest-${(tenantId || 'cliente').toLowerCase()}.yaml`,
      'text/yaml;charset=utf-8'
    );
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
      planId: billingInfo?.planId || readStorageItem('saare_plan_id') || 'N/A',
      metrics: {
        totalInspections: inspections,
        allowedCount: allowed,
        deniedCount: denied,
        blockRatePercent: blockRate
      },
      latestForensicBatch: forensicBatch
        ? {
            batchId: forensicBatch.batchId,
            merkleRoot: forensicBatch.merkleRoot,
            leafCount: forensicBatch.leafCount,
            isQualifiedEidas: forensicBatch.isQualifiedEidas,
            assuranceLevel: forensicBatch.assuranceLevel,
            tsaStatus: forensicBatch.timestampSeal?.status || null,
            tsaReference: forensicBatch.timestampSeal?.tsaReference || null,
            hasTsrBase64: Boolean(forensicBatch.timestampSeal?.tsrBase64),
            custody2of3Enabled: Boolean(forensicBatch.custody2of3)
          }
        : null,
      rulesEnabled: tenantRulesEnabled,
      activeCustomRulesCount: customRules.length,
      customRules,
      protocolCommandsEnabled,
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
    const auditTokenPreview = `AUD-${(tenantId || 'TENANT').toUpperCase()}-${Date.now()
      .toString(36)
      .toUpperCase()}`;
    triggerBlobDownload(
      JSON.stringify(
        {
          issuedAt: new Date().toISOString(),
          tenantId: tenantId || 'UNASSIGNED',
          requestedBy: userEmail || 'anonymous',
          auditToken: auditTokenPreview,
          ttlMinutes: 60
        },
        null,
        2
      ),
      `audit-token-${(tenantId || 'cliente').toLowerCase()}.json`
    );
    triggerGovernance(`Token de auditoría generado (${auditTokenPreview}).`);
  };

  const handleDownloadTechnicalTeaser = () => {
    triggerBlobDownload(
      JSON.stringify(
        {
          product: 'S.A.A.R.E. Console GRC & Ex-Ante L7 Runtime',
          compliance: [
            'EU AI Act',
            'RGPD',
            'DORA',
            'NIS2',
            'ISO 27001',
            'ISO 42001',
            'ISO 27037',
            'Art. 326 LEC'
          ],
          generatedAt: new Date().toISOString()
        },
        null,
        2
      ),
      'saare-technical-teaser.json'
    );
    triggerGovernance('Teaser técnico descargado.');
  };

  const handleExportLecActa = () => {
    triggerBlobDownload(
      JSON.stringify(
        {
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
        },
        null,
        2
      ),
      `acta-lec-iso27037-${(tenantId || 'cliente').toLowerCase()}-${Date.now()}.json`
    );
    triggerGovernance('Acta probatoria Art. 326 LEC / ISO 27037 generada.');
  };

  const handleDownloadIso27037Manifest = useCallback(async () => {
    try {
      const headers = {
        ...(tenantId ? { 'x-saare-tenant': tenantId } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };
      const res = await fetch(getApiEndpoint('/api/v1/forensics/manifest'), { headers });
      if (res.status === 401) {
        handleUnauthorizedSession('manifiesto ISO/IEC 27037');
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const rawText = await res.text();
      const headerHash = res.headers.get('X-SAARE-Manifest-SHA256') || '';
      const localHash = await computeSha256Hex(rawText);

      const dateStamp = new Date().toISOString().slice(0, 10);
      triggerBlobDownload(
        rawText,
        `iso27037-attestation-manifest-${dateStamp}.json`,
        'application/json;charset=utf-8'
      );

      const matchNote = headerHash
        ? headerHash === localHash
          ? `SHA-256 verificado (${localHash.slice(0, 12)}...)`
          : `Aviso: hash cabecera distinto al local (${localHash.slice(0, 12)}...)`
        : `SHA-256: ${localHash.slice(0, 12)}...`;

      triggerGovernance(`Manifiesto ISO/IEC 27037 descargado · ${matchNote}`);
    } catch {
      triggerGovernance('No se pudo obtener el manifiesto ISO/IEC 27037 desde la API.');
    }
  }, [tenantId, authToken, handleUnauthorizedSession, triggerGovernance]);

  const runProtocolCommandNow = useCallback(
    async (cmd) => {
      if (!cmd?.prompt) return;

      const cleanRef = String(dossierRef || '').trim();
      const effectivePrompt = cleanRef
        ? `${cmd.prompt} [Expediente/Activo: ${cleanRef}]`
        : cmd.prompt;

      setRunningProtocolCode(cmd.code);
      const t0 = performance.now();

      try {
        const data = await apiService.interceptPrompt({
          prompt: effectivePrompt,
          commandCode: cmd.code,
          ...(cleanRef ? { dossierRef: cleanRef } : {}),
          user: userEmail,
          tenant: tenantId,
          token: authToken,
          role
        });
        const latencyMs = `${(performance.now() - t0).toFixed(2)} ms`;
        if (data?.httpStatus === 401 || data?.verdict === 'UNAUTHORIZED_401') {
          handleUnauthorizedSession(`comando ${cmd.code}`);
        }
        const isDeny =
          data?.decision === 'DENY' ||
          data?.verdict === 'FAIL_CLOSED_BLOCKED' ||
          data?.verdict === 'UNAUTHORIZED_401' ||
          data?.verdict === 'RECHAZADO';

        setProtocolOutput({
          code: cmd.code,
          label: cmd.label,
          dossierRef: cleanRef || 'N/A',
          decision: isDeny ? 'DENY' : 'ALLOW',
          verdict: data?.verdict || (isDeny ? 'RECHAZADO' : 'PERMITIDO'),
          evidenceId: data?.evidence_id || data?.trace_id || 'N/A',
          hash:
            data?.chainHash ||
            data?.enforcement?.ms3vIntegrityHash ||
            data?.proofBundle?.ms3vAudit?.hash ||
            'N/A',
          latency: latencyMs,
          content:
            data?.inference?.responseContent ||
            data?.sanitizedOutput ||
            data?.sanitizedPrompt ||
            data?.message ||
            data?.error ||
            ''
        });

        triggerGovernance(`Comando ${cmd.code} ejecutado (${isDeny ? 'DENY' : 'ALLOW'}).`);
        if (tenantId) {
          await fetchTelemetryDirectFromVault(tenantId, authToken);
        }
      } catch (err) {
        triggerGovernance(err?.message || `Error al ejecutar ${cmd.code}.`);
      } finally {
        setRunningProtocolCode('');
      }
    },
    [
      dossierRef,
      tenantId,
      authToken,
      userEmail,
      role,
      handleUnauthorizedSession,
      triggerGovernance,
      fetchTelemetryDirectFromVault
    ]
  );

  const handleExecuteProtocolCommand = useCallback(
    async (cmd) => {
      if (!cmd?.prompt) return;

      if (protocolCommandsEnabled[cmd.code] === false) {
        triggerGovernance(`El comando ${cmd.code} está desactivado en la consola.`);
        return;
      }

      if (cmd.danger) {
        setPendingDangerCommand(cmd);
        return;
      }

      await runProtocolCommandNow(cmd);
    },
    [protocolCommandsEnabled, triggerGovernance, runProtocolCommandNow]
  );

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
        role
      });
      const latencyMs = `${(performance.now() - t0).toFixed(2)} ms`;
      if (data?.httpStatus === 401 || data?.verdict === 'UNAUTHORIZED_401') {
        handleUnauthorizedSession('evaluación ex-ante');
      }
      const isDeny =
        data?.decision === 'DENY' ||
        data?.verdict === 'FAIL_CLOSED_BLOCKED' ||
        data?.verdict === 'UNAUTHORIZED_401' ||
        data?.verdict === 'RECHAZADO';

      const evalResult = {
        verdict:
          data?.verdict === 'UNAUTHORIZED_401'
            ? 'NO AUTORIZADO (HTTP 401)'
            : isDeny
              ? 'RECHAZADO / SANITIZADO EN RAM'
              : 'PERMITIDO CONFORME',
        decision: isDeny ? 'DENY' : 'ALLOW',
        sanitizedPrompt: isDeny
          ? '[PAYLOAD BLOQUEADO Y REDACTADO EN RAM]'
          : redactSensitiveText(
              data?.sanitizedPrompt || data?.enforcement?.executedCommand || promptToRun
            ),
        latency: latencyMs,
        seal: data?.enforcement?.ms3vIntegrityHash || data?.proofBundle?.ms3vAudit?.hash || ''
      };

      setTestResult(evalResult);
      triggerGovernance(`Prompt interceptado (${evalResult.decision}).`);
      await fetchTelemetryDirectFromVault(tenantId, authToken);
    } catch (err) {
      triggerGovernance(err?.message || 'Error al evaluar el prompt en el gateway L7.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const totalInspecciones = evidences.length;
  const totalDeny = evidences.filter((e) => e.decision === 'DENY').length;
  const tasaBloqueo =
    totalInspecciones > 0 ? ((totalDeny / totalInspecciones) * 100).toFixed(1) : '0.0';
  const resolvedApiKey = billingInfo?.credentials?.licenseKey || readStorageItem('saare_api_key') || '';
  const isUnconfiguredClient = !authToken && !tenantId;

  const detailPanel =
    activeRoute?.id === routes.EVIDENCE.id && selectedEvidenceDetail ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: '800',
            color: '#38bdf8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          Ficha técnica de evidencia
        </div>
        <div
          style={{
            background: '#020617',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div>
            <strong style={{ color: '#94a3b8' }}>ID:</strong>{' '}
            <span className="saare-mono" style={{ color: '#f8fafc', fontWeight: '700' }}>
              {selectedEvidenceDetail.evidenceId || selectedEvidenceDetail.id}
            </span>
          </div>
          <div>
            <strong style={{ color: '#94a3b8' }}>Veredicto:</strong>{' '}
            <span className="saare-mono" style={{ color: '#f8fafc' }}>
              {selectedEvidenceDetail.verdict}
            </span>
          </div>
          <div>
            <strong style={{ color: '#94a3b8' }}>Ciclo:</strong>{' '}
            <span style={{ color: '#cbd5e1' }}>{selectedEvidenceDetail.lifecycle}</span>
          </div>
          <div style={{ wordBreak: 'break-all' }}>
            <strong style={{ color: '#94a3b8' }}>Hash:</strong>{' '}
            <span className="saare-mono" style={{ color: '#38bdf8', fontSize: '0.68rem' }}>
              {selectedEvidenceDetail.hash || '—'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleOpenPdfReport(selectedEvidenceDetail.raw || selectedEvidenceDetail)}
            style={{
              padding: '7px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#0284c7',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Informe PDF
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            style={{
              padding: '7px 12px',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: '#111827',
              color: '#e2e8f0',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Exportar acta
          </button>
        </div>
      </div>
    ) : null;

  const renderMainContent = () => {
    if (secondaryMode === 'SUBSIDIES') {
      return (
        <SubsidiesHub
          tenantId={tenantId}
          onBack={() => {
            setSecondaryMode('');
            navigateTo(routes.GOVERNANCE);
          }}
        />
      );
    }

    if (secondaryMode === 'EXECUTIVE') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setSecondaryMode('');
                navigateTo(routes.OVERVIEW);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #334155',
                background: '#111827',
                color: '#e2e8f0',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Volver a Resumen general
            </button>
            <button
              type="button"
              onClick={() => setSecondaryMode('SUBSIDIES')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d97706',
                background: '#451a03',
                color: '#fcd34d',
                fontSize: '0.74rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Subvenciones
            </button>
          </div>
          <ExecutiveView
            tenantId={tenantId}
            userRole={role}
            evidences={evidences}
            onManageSeats={() => setShowSeatsModal(true)}
          />
        </div>
      );
    }

    const sharedActionProps = {
      tenantId,
      authToken,
      userEmail,
      role,
      timeStr,
      billingInfo,
      isBillingLoading,
      forensicBatch,
      isSealingBatch,
      inclusionStatusByEvidence,
      evidences,
      tenantMetrics,
      customRules,
      tenantRulesEnabled,
      ruleForm,
      setRuleForm,
      isRulesLoading,
      activeTab,
      setActiveTab,
      testPrompt,
      setTestPrompt,
      testResult,
      isEvaluating,
      runningProtocolCode,
      protocolOutput,
      dossierRef,
      setDossierRef,
      protocolCommands: SAARE_PROTOCOL_COMMANDS,
      protocolCommandsEnabled,
      availableTenants,
      resolvedApiKey,
      totalInspecciones,
      totalDeny,
      tasaBloqueo,
      isFetchingVault,
      isFetchingMetrics,
      metricsError,
      onTenantChange: handleTenantChange,
      onOpenAuthModal: (tab = 'TOKEN') => {
        setAuthError('');
        setAuthTab(tab);
        setAuthForm((prev) => ({
          ...prev,
          token: authToken || '',
          tenantId: tenantId || '',
          email: userEmail || ''
        }));
        setShowAuthModal(true);
      },
      onLogout: handleLogout,
      onSyncVault: fetchTelemetryDirectFromVault,
      onFetchMetrics: fetchTenantMetrics,
      onFetchRules: fetchCustomRules,
      onToggleTenantRules: handleToggleTenantRules,
      onApplyIso42001: handleApplyIso42001Governance,
      onSaveCustomRule: handleSaveCustomRule,
      onRemoveCustomRule: handleRemoveCustomRule,
      onToggleProtocolCommand: handleToggleProtocolCommand,
      onSetAllProtocolCommands: handleSetAllProtocolCommands,
      onExecuteProtocolCommand: handleExecuteProtocolCommand,
      onExecuteTestExAnte: handleExecuteTestExAnte,
      onSealForensicBatch: handleSealForensicBatch,
      onDownloadForensicBatchBundle: handleDownloadForensicBatchBundle,
      onDownloadTsaToken: handleDownloadTsaToken,
      onVerifyEvidenceInclusion: handleVerifyEvidenceInclusion,
      onOpenPdfReport: handleOpenPdfReport,
      onOpenSeatsModal: () => setShowSeatsModal(true),
      onOpenExportModal: () => setShowExportModal(true),
      onOpenFriaModal: () => setShowFriaModal(true),
      onOpenExecutiveView: () => setSecondaryMode('EXECUTIVE'),
      onOpenSubsidiesHub: () => setSecondaryMode('SUBSIDIES'),
      onStartStripeUpgrade: handleStartStripeUpgrade,
      onOpenStripePortal: handleOpenStripePortal,
      onExportSovereigntyCert: handleExportTenantSovereigntyCertificate,
      onDownloadL7Extension: handleDownloadL7Extension,
      onDownloadSidecarPackage: handleDownloadSidecarPackage,
      onDownloadGpoReg: handleDownloadEnterpriseGpoReg,
      onDownloadK8sManifest: handleDownloadK8sManifest,
      onDownloadIso42001Dossier: handleDownloadIso42001Dossier,
      onDownloadIso27037Manifest: handleDownloadIso27037Manifest,
      onExportTracesJson: handleExportTracesJson,
      onGenerateAuditToken: handleGenerateAuditToken,
      onDownloadTechnicalTeaser: handleDownloadTechnicalTeaser,
      onExportLecActa: handleExportLecActa,
      onTriggerGovernance: triggerGovernance,
      SoaCompilerSlot: (
        <SoaIso42001CompilerButton
          apiBaseUrl={getApiEndpoint('')}
          tenantId={tenantId}
          authToken={authToken}
          userEmail={userEmail}
          onCompiled={(hash) =>
            triggerGovernance(
              `SoA ISO 42001 compilada (${hash.slice(0, 12)}...) para [${tenantId || 'TENANT'}].`
            )
          }
        />
      )
    };

    switch (activeRoute?.id) {
      case routes.RUNTIME.id:
        return <RuntimeView {...sharedActionProps} />;
      case routes.EVIDENCE.id:
        return (
          <EvidenceView
            {...sharedActionProps}
            onSelectEvidence={(ev) => setSelectedEvidenceDetail(ev || null)}
          />
        );
      case routes.GOVERNANCE.id:
        return <GovernanceView {...sharedActionProps} />;
      case routes.ADMINISTRATION.id:
        return <AdministrationView {...sharedActionProps} />;
      case routes.OVERVIEW.id:
      default:
        return <OverviewView {...sharedActionProps} />;
    }
  };

  return (
    <>
      {governanceStatus && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#059669',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: 10000,
            fontWeight: '800',
            fontSize: '0.82rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
        >
          {governanceStatus}
        </div>
      )}

      <ConsoleShell
        detailPanel={detailPanel}
        availableTenants={availableTenants.map((t) => t.id)}
        onLogout={authToken || tenantId ? handleLogout : undefined}
      >
        {isUnconfiguredClient && (
          <div
            style={{
              marginBottom: '16px',
              padding: '14px 18px',
              background: '#0b0f19',
              border: '1px solid #f59e0b',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontWeight: '800', color: '#fbbf24', fontSize: '0.88rem' }}>
                Entorno listo para configurar — Sin token ni tenant vinculado
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.76rem', marginTop: '3px' }}>
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
              style={{
                padding: '8px 14px',
                background: '#d97706',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              CARGAR TOKEN DE CLIENTE
            </button>
          </div>
        )}

        {renderMainContent()}
      </ConsoleShell>

      {pendingDangerCommand && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#14070a',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              maxWidth: '440px',
              width: '100%',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <strong style={{ color: '#fca5a5', fontSize: '0.95rem' }}>
              Confirmar ejecución de {pendingDangerCommand.code}
            </strong>
            <p style={{ margin: 0, color: '#fecaca', fontSize: '0.78rem', lineHeight: 1.45 }}>
              Vas a ejecutar <strong>{pendingDangerCommand.label}</strong> sobre el tenant{' '}
              <strong className="saare-mono">{tenantId || 'SIN_TENANT'}</strong>. Esta acción quedará
              registrada en la actividad de sesión.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setPendingDangerCommand(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#111827',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const cmdToRun = pendingDangerCommand;
                  setPendingDangerCommand(null);
                  await runProtocolCommandNow(cmdToRun);
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #ef4444',
                  background: '#991b1b',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Confirmar ejecución
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#0b0f19',
              border: '1px solid #38bdf8',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.05rem', fontWeight: '900' }}>
                Acceso y Carga de Token — S.A.A.R.E.
              </h3>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('TOKEN');
                  setAuthError('');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: authTab === 'TOKEN' ? '#d97706' : '#1e293b',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Cargar Token
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('LOGIN');
                  setAuthError('');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: authTab === 'LOGIN' ? '#0284c7' : '#1e293b',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('SANDBOX');
                  setAuthError('');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: authTab === 'SANDBOX' ? '#059669' : '#1e293b',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Alta Sandbox
              </button>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {authTab === 'TOKEN' && (
                <>
                  <textarea
                    rows={3}
                    required
                    placeholder="Pega aquí tu Token Bearer o API Key..."
                    value={authForm.token}
                    onChange={(e) => setAuthForm({ ...authForm, token: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#38bdf8',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      resize: 'vertical'
                    }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Tenant ID de tu organización"
                    value={authForm.tenantId}
                    onChange={(e) => setAuthForm({ ...authForm, tenantId: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Correo del operador (opcional)"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  />
                </>
              )}

              {authTab === 'SANDBOX' && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Nombre de la empresa u organismo"
                    value={authForm.companyName}
                    onChange={(e) => setAuthForm({ ...authForm, companyName: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Nombre del responsable (opcional)"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px'
                    }}
                  />
                </>
              )}

              {authTab !== 'TOKEN' && (
                <>
                  <input
                    type="email"
                    required
                    placeholder="Correo corporativo"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px'
                    }}
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Tenant ID (opcional)"
                    value={authForm.tenantId}
                    onChange={(e) => setAuthForm({ ...authForm, tenantId: e.target.value })}
                    style={{
                      padding: '10px',
                      background: '#020617',
                      border: '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  />
                </>
              )}

              {authError && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    color: '#fca5a5',
                    fontSize: '0.78rem'
                  }}
                >
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                style={{
                  padding: '11px',
                  background:
                    authTab === 'TOKEN' ? '#d97706' : authTab === 'SANDBOX' ? '#059669' : '#0284c7',
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
        <SeatsManagementModal tenantId={tenantId} onClose={() => setShowSeatsModal(false)} />
      )}

      {showExportModal && (
        <ReportExportModal
          tenantId={tenantId}
          evidences={evidences}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showFriaModal && (
        <FriaWizardModal tenantId={tenantId} onClose={() => setShowFriaModal(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <ConsoleProvider>
      <SaareConsoleInner />
    </ConsoleProvider>
  );
}