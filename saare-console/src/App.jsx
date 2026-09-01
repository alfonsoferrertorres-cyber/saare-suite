import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const API_BASE = import.meta.env.VITE_API_BASE || "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://saare.es";

function resolveInitialUser() {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const tokenParam = urlParams.get('token');
  const emailParam = urlParams.get('email') || urlParams.get('user');
  const tenantParam = urlParams.get('tenant');

  if (tokenParam && emailParam) {
    const fromUrlUser = {
      email: emailParam,
      tenantName: tenantParam || 'Corporate Workload Node',
      tenantId: 'tenant_admin_01',
      apiKey: tokenParam,
      role: urlParams.get('role') || 'CISO / Global Admin',
      licenseType: 'ENTERPRISE_EXECUTION_RUNTIME'
    };
    localStorage.setItem('saare_user', JSON.stringify(fromUrlUser));
    localStorage.setItem('saare_suite_user', JSON.stringify(fromUrlUser));
    localStorage.setItem('saare_vault_session', JSON.stringify(fromUrlUser));
    window.history.replaceState({}, document.title, window.location.pathname);
    return fromUrlUser;
  }

  const consoleSaved = localStorage.getItem('saare_user');
  const suiteSaved = localStorage.getItem('saare_suite_user') || localStorage.getItem('saare_vault_session');

  if (consoleSaved) {
    try { return JSON.parse(consoleSaved); } catch {}
  }
  if (suiteSaved) {
    try {
      const parsed = JSON.parse(suiteSaved);
      localStorage.setItem('saare_user', JSON.stringify(parsed));
      return parsed;
    } catch {}
  }
  return {
    email: "alfonsosb1@gmail.com",
    tenantName: "Corporate Enterprise Node",
    role: "CISO / Global Admin",
    apiKey: "sk_saare_live_master_kv_session",
    licenseType: "ENTERPRISE_EXECUTION_RUNTIME"
  };
}

export default function App() {
  const [sessionUser, setSessionUser] = useState(resolveInitialUser);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [activeTab, setActiveTab] = useState('CONFIG'); // CONFIG, RUNLIVE, GLOBAL
  const [events, setEvents] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedJson, setSelectedJson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingBundle, setExportingBundle] = useState(false);
  const [downloadingAgentZip, setDownloadingAgentZip] = useState(false);

  const [kvStatus, setKvStatus] = useState({
    online: true,
    latencyMs: 14,
    lastSync: new Date().toLocaleTimeString()
  });

  const [activeScenarioFilter, setActiveScenarioFilter] = useState('ALL');

  // CATÁLOGO DE LAS 5 BÓVEDAS CON LA ESTÉTICA CLÁSICA
  const masterScenariosConfig = {
    cumplimiento_corporativo_integral: {
      tag: "PRIVACIDAD ES",
      name: "ESPAÑA - LOPDGDD & AEPD",
      desc: "Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII.",
      norma: "Workflow aligned with ISO/IEC 27037:2012 · RGPD Art. 5.2, 9 y 32 · LOPDGDD 3/2018 · DORA",
      options: [
        { key: "dlp_dni_nie", label: "Detección estricta DNI / NIE" },
        { key: "dlp_iban_cards", label: "Aislamiento IBAN & PAN Tarjetas (PCI-DSS)" },
        { key: "dlp_health_art9", label: "Protección Datos de Salud (RGPD Art. 9)" },
        { key: "ephemeral_ram_lock", label: "Aislamiento en Memoria Volátil Efímera" }
      ]
    },
    razonamiento_activo_l7: {
      tag: "CIBERSEGURIDAD",
      name: "TOP L7: JAILBREAK & PROMPT INJECTION GUARD",
      desc: "Mitigación de ataques adversarios, modo DAN y anulación de directivas.",
      norma: "EU AI Act Art. 15 · OWASP Top 10 LLM01/02 · Controls mapped to ISO/IEC 42001",
      options: [
        { key: "anti_dan_jailbreak", label: "Bloqueo Modo DAN & Evasión de Restricciones" },
        { key: "prompt_guard_active", label: "Inspección de System Prompts & Injection" },
        { key: "runtime_containment", label: "Barrera de Contención Activa Fail-Closed" }
      ]
    },
    auditoria_dictamen_normativo: {
      tag: "TRAZABILIDAD FORENSE",
      name: "SELLO DE TIEMPO RFC 3161 & HASH CANÓNICO",
      desc: "Indexación criptográfica Ed25519 en Bóveda Forense sin almacenamiento en disco.",
      norma: "Workflow aligned with ISO/IEC 27037:2012 · EU AI Act Art. 12 Logs · RFC 3161",
      options: [
        { key: "rfc3161_qualified_tsa", label: "Estampado Temporal RFC 3161" },
        { key: "ed25519_signatures", label: "Firma Criptográfica Asimétrica Ed25519" },
        { key: "action_digest_binding", label: "Action Digest Binding (SHA-256)" },
        { key: "safe_creative_anchor", label: "Anclaje de Integridad Fiduciaria" }
      ]
    },
    deepfake_fake_disprover: {
      tag: "MEDIOS SINTÉTICOS",
      name: "CONTROL DE CLONACIÓN DE VOZ & DERECHOS DE IMAGEN",
      desc: "Inspección causal y rechazo estricto ante síntesis de voz o deepfakes no consentidos.",
      norma: "Ley Orgánica 1/1982 · EU AI Act Art. 13 & 50 · Controls mapped to ISO/IEC 42001",
      options: [
        { key: "strict_corpus_grounding", label: "Grounding Estricto en Corpus Litigioso" },
        { key: "reject_unsupported_claims", label: "Rechazo Inmediato de Unsupported Claims" },
        { key: "voice_clone_guard", label: "Protección contra Clonación de Voz/Imagen (LO 1/1982)" },
        { key: "anti_tamper_evidence", label: "Verificación de Integridad de Digest" }
      ]
    },
    subvenciones_requisitos_infranqueables: {
      tag: "FINOPS IT & FIDUCIARIO",
      name: "CONTROL DE COSTES Y CUOTA DE LLM / FONDOS PRTR",
      desc: "Control de no-doble financiación (hash de facturas), principio DNSH y cuota de inferencias.",
      norma: "Ley 38/2003 LGS · Orden HFP/1030/2021 · PRTR / NextGenEU · 2 CFR 200",
      options: [
        { key: "enforce_no_double_funding", label: "Bloqueo Anti-Doble Financiación (Hash Facturas)" },
        { key: "enforce_dnsh_principle", label: "Acreditación Principio No Perjuicio Significativo (DNSH)" },
        { key: "prtr_nextgen_dossier", label: "Generador de Memorias de Trazabilidad PRTR" }
      ]
    }
  };

  const [directives, setDirectives] = useState({
    cumplimiento_corporativo_integral: true,
    razonamiento_activo_l7: true,
    auditoria_dictamen_normativo: true,
    deepfake_fake_disprover: true,
    subvenciones_requisitos_infranqueables: true
  });

  const [vaultSubOptions, setVaultSubOptions] = useState({
    dlp_dni_nie: true,
    dlp_iban_cards: true,
    dlp_health_art9: true,
    ephemeral_ram_lock: true,
    anti_dan_jailbreak: true,
    prompt_guard_active: true,
    runtime_containment: true,
    strict_corpus_grounding: true,
    reject_unsupported_claims: true,
    voice_clone_guard: true,
    anti_tamper_evidence: true,
    rfc3161_qualified_tsa: true,
    ed25519_signatures: true,
    action_digest_binding: true,
    safe_creative_anchor: true,
    enforce_no_double_funding: true,
    enforce_dnsh_principle: true,
    prtr_nextgen_dossier: true
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, directiveKey: null });
  const [syncingKv, setSyncingKv] = useState(false);

  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState({ label: '', pattern: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  const totalDirectivesCount = Object.keys(masterScenariosConfig).length;
  const activeDirectivesCount = Object.keys(masterScenariosConfig).filter(k => directives[k] === true).length;
  const disabledDirectivesCount = Math.max(0, totalDirectivesCount - activeDirectivesCount);

  const persistSettingsToKV = async (newDirectivesState, newSubOptions = vaultSubOptions) => {
    if (!sessionUser?.email) return;
    setSyncingKv(true);
    try {
      await fetch(`${API_BASE}/settings?user=${encodeURIComponent(sessionUser.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newDirectivesState, subOptions: newSubOptions })
      });
      setKvStatus(prev => ({ ...prev, lastSync: new Date().toLocaleTimeString() }));
    } catch (err) {
      console.error("Fallo al sincronizar directivas con Decision Store", err);
    } finally {
      setSyncingKv(false);
    }
  };

  const fetchTelemetryAndVerifyKV = async () => {
    if (!sessionUser?.email) return;

    const startTime = performance.now();
    try {
      const userParam = encodeURIComponent(sessionUser.email);
      
      const [resRuns, resRules, resSettings, resAuth] = await Promise.all([
        fetch(`${API_BASE}/runs?user=${userParam}`).catch(() => null),
        fetch(`${API_BASE}/custom-rules?user=${userParam}`).catch(() => null),
        fetch(`${API_BASE}/settings?user=${userParam}`).catch(() => null),
        fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: sessionUser.email, token: sessionUser.apiKey || sessionUser.token || "session_check", source: 'console' })
        }).catch(() => null)
      ]);

      const elapsed = Math.round(performance.now() - startTime);

      if (resAuth && resAuth.ok) {
        const authData = await resAuth.json();
        if (authData.user) {
          setSessionUser(prev => ({ ...prev, ...authData.user }));
        }
      }

      if (resSettings && resSettings.ok) {
        const settingsData = await resSettings.json();
        if (settingsData.settings && !syncingKv) {
          setDirectives(prev => {
            const merged = { ...prev };
            Object.keys(masterScenariosConfig).forEach(k => {
              if (settingsData.settings[k] !== undefined) {
                merged[k] = settingsData.settings[k];
              }
            });
            return merged;
          });
        }
        if (settingsData.subOptions && !syncingKv) {
          setVaultSubOptions(prev => ({ ...prev, ...settingsData.subOptions }));
        }
      }

      if (resRuns && resRuns.ok) {
        const dataRuns = await resRuns.json();
        const runsList = Array.isArray(dataRuns) ? dataRuns : (dataRuns.events || dataRuns.logs || dataRuns.runs || []);
        runsList.sort((a, b) => new Date(b.issuedAt || b.timestamp || b.created_at || 0) - new Date(a.issuedAt || a.timestamp || a.created_at || 0));
        setEvents(runsList);
        if (runsList.length > 0) setLastEvent(runsList[0]);
        setConnected(true);
      }

      if (resRules && resRules.ok) {
        const dataRules = await resRules.json();
        if (Array.isArray(dataRules)) setCustomRules(dataRules);
      }

      setKvStatus({ online: true, latencyMs: elapsed, lastSync: new Date().toLocaleTimeString() });
    } catch {
      setConnected(false);
      setKvStatus(prev => ({ ...prev, online: false, lastSync: "Reintentando..." }));
    }
  };

  useEffect(() => {
    fetchTelemetryAndVerifyKV();
    const interval = setInterval(fetchTelemetryAndVerifyKV, 3500);
    return () => clearInterval(interval);
  }, [sessionUser?.email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput, source: 'console' })
      });
      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        const userObj = data.user;
        localStorage.setItem('saare_user', JSON.stringify(userObj));
        localStorage.setItem('saare_suite_user', JSON.stringify(userObj));
        localStorage.setItem('saare_vault_session', JSON.stringify(userObj));
        setSessionUser(userObj);
      } else {
        setLoginError(data.error || "Credenciales corporativas incorrectas.");
      }
    } catch {
      setLoginError("Error de comunicación con el servicio de autenticación.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_user');
    localStorage.removeItem('saare_suite_user');
    localStorage.removeItem('saare_vault_session');
    setSessionUser(null);
    setEvents([]);
    setLastEvent(null);
  };

  const handleToggleDirective = (key) => {
    if (directives[key]) {
      setConfirmModal({ isOpen: true, directiveKey: key });
    } else {
      const updated = { ...directives, [key]: true };
      setDirectives(updated);
      persistSettingsToKV(updated);
    }
  };

  const confirmDeactivation = () => {
    if (confirmModal.directiveKey) {
      const updated = { ...directives, [confirmModal.directiveKey]: false };
      setDirectives(updated);
      persistSettingsToKV(updated);
    }
    setConfirmModal({ isOpen: false, directiveKey: null });
  };

  const handleToggleSubOption = (optionKey) => {
    const updatedSub = { ...vaultSubOptions, [optionKey]: !vaultSubOptions[optionKey] };
    setVaultSubOptions(updatedSub);
    persistSettingsToKV(directives, updatedSub);
  };

  const addCustomRule = async () => {
    if (!newRule.pattern || !sessionUser?.email) return;
    const updated = [...customRules, newRule];
    setCustomRules(updated);
    setNewRule({ label: '', pattern: '' });
    setShowAddModal(false);
    try {
      await fetch(`${API_BASE}/custom-rules?user=${encodeURIComponent(sessionUser.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const removeCustomRule = async (index) => {
    if (!sessionUser?.email) return;
    const updated = customRules.filter((_, i) => i !== index);
    setCustomRules(updated);
    try {
      await fetch(`${API_BASE}/custom-rules?user=${encodeURIComponent(sessionUser.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const handleExportProofBundle = async (eventLog) => {
    try {
      setExportingBundle(true);
      const res = await fetch(`${API_BASE}/export-proof-bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventLog)
      });

      if (!res.ok) throw new Error("Fallo en la emisión del expediente probatorio.");

      const bundleData = await res.json();
      const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proof-bundle-${eventLog.verdictId || eventLog.runId || eventLog.evidence_id || 'EV'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al exportar Proof Bundle: " + err.message);
    } finally {
      setExportingBundle(false);
    }
  };

  const handleDownloadTokenizedAgent = async () => {
    try {
      setDownloadingAgentZip(true);
      const response = await fetch('/saare-extension.zip');
      if (!response.ok) throw new Error("No se pudo obtener el paquete base del sensor.");

      const zipArrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(zipArrayBuffer);

      const tTenant = sessionUser?.tenantName || "CORP_ENTERPRISE_DOMAIN";
      const tEmail = sessionUser?.email || "alfonsosb1@gmail.com";
      const tToken = sessionUser?.apiKey || sessionUser?.token || "sk_saare_live_" + Math.random().toString(36).substring(2, 12);

      const tokenizedManagedConfig = {
        "saare_bootstrap_token": { "Value": tToken },
        "saare_tenant_domain": { "Value": tTenant },
        "saare_user_email": { "Value": tEmail },
        "saare_license_type": { "Value": "ENTERPRISE_EXECUTION_RUNTIME" },
        "governance_protocol": { "Value": "SGP_1.0" },
        "enforcement_mode": { "Value": "FAIL_CLOSED" }
      };

      const runtimeConfig = {
        tenantDomain: tTenant,
        userEmail: tEmail,
        protocol: "SGP_1.0",
        enforcementMode: "FAIL_CLOSED",
        memoryMode: "EPHEMERAL",
        endpoint: API_BASE,
        provisionedAt: new Date().toISOString()
      };

      zip.file("storage_managed.json", JSON.stringify(tokenizedManagedConfig, null, 2));
      zip.file("saare_config.json", JSON.stringify(runtimeConfig, null, 2));

      const customizedBlob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(customizedBlob);
      dl.download = `saare-sensor-${tTenant.toLowerCase().replace(/[^a-z0-9]/g, '_')}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      URL.revokeObjectURL(dl.href);
    } catch (err) {
      alert("Error al empaquetar sensor: " + err.message);
    } finally {
      setDownloadingAgentZip(false);
    }
  };

  const filteredEvents = events.filter(ev => {
    const scenario = ev.policy?.id || ev.policy_id || ev.scenario_id || '';
    const matchesScenario = activeScenarioFilter === 'ALL' || scenario.toLowerCase().includes(activeScenarioFilter.toLowerCase());
    const matchesSearch = !searchQuery || JSON.stringify(ev).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScenario && matchesSearch;
  });

  if (!sessionUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#eef2f6', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '36px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>S.A.A.R.E. CONSOLE</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Acceso a Panel de Control y Auditoría L7</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Correo Corporativo (CISO / Admin)" style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña de Acceso" style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
            {loginError && <div style={{ padding: '10px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '4px', color: '#b91c1c', textAlign: 'center', fontSize: '12px' }}>{loginError}</div>}
            <button type="submit" disabled={loadingLogin} style={{ padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loadingLogin ? 'not-allowed' : 'pointer' }}>
              {loadingLogin ? 'Autenticando...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#dce3ec', color: '#1e293b', fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. HERO BANNER DORADO / BLANCO CORPORATIVO */}
      <div style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Logo Cerebro Tecnológico */}
            <div style={{ width: '110px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="brainGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
                <path d="M50 15 C35 15 20 25 20 42 C20 58 35 68 50 68 C65 68 80 58 80 42 C80 25 65 15 50 15 Z" fill="none" stroke="url(#brainGlow)" strokeWidth="4" />
                <path d="M30 35 Q40 25 50 35 T70 35" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                <path d="M25 45 Q40 38 50 48 T75 45" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                <path d="M35 55 Q45 48 50 55 T65 55" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="30" cy="35" r="2.5" fill="#f59e0b" />
                <circle cx="70" cy="35" r="2.5" fill="#f59e0b" />
                <circle cx="50" cy="48" r="3" fill="#38bdf8" />
                <line x1="10" y1="42" x2="20" y2="42" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="80" y1="42" x2="90" y2="42" stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            </div>

            {/* Texto Título Dorado Clásico */}
            <div>
              <div style={{ fontSize: '38px', fontWeight: '900', color: '#c59b27', letterSpacing: '-0.5px', lineHeight: 1 }}>
                Tecnología
              </div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#475569', letterSpacing: '0.2px', marginTop: '2px' }}>
                Control Perimetral y Pericial
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={handleDownloadTokenizedAgent}
              disabled={downloadingAgentZip}
              style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {downloadingAgentZip ? 'Generando...' : 'Descargar Sensor (.zip)'}
            </button>
            <button 
              onClick={handleLogout}
              style={{ padding: '6px 12px', background: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cerrar Sesión
            </button>
          </div>

        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '20px auto', padding: '0 20px' }}>
        
        {/* 2. BARRA DE ESTADO / USUARIO CISO */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
          <div>
            <div style={{ fontWeight: '900', fontSize: '13px', color: '#0f172a', letterSpacing: '0.3px' }}>
              PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA V2.5
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
              USUARIO: <strong style={{ color: '#0284c7' }}>{sessionUser.email}</strong> | ROL: <strong style={{ color: '#16a34a' }}>{sessionUser.role || 'CISO / Global Admin'}</strong> | DIRECTIVAS BASE: <strong style={{ color: '#16a34a' }}>{activeDirectivesCount} Activas</strong> | <strong style={{ color: '#ef4444' }}>{disabledDirectivesCount} Deshabilitadas</strong> | REGLAS PERSONALIZADAS: <strong style={{ color: '#0284c7' }}>{customRules.length} Filtros</strong>
            </div>
          </div>

          <div style={{ border: '1px solid #16a34a', background: 'rgba(22, 163, 74, 0.08)', color: '#16a34a', padding: '4px 10px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>
            LICENCIA ACTIVA<br />
            <span style={{ fontSize: '11px', fontWeight: '900' }}>001-ENTERPRISE</span>
          </div>
        </div>

        {/* 3. PESTAÑAS CLÁSICAS */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('GLOBAL')} 
            style={{ 
              padding: '8px 18px', 
              background: activeTab === 'GLOBAL' ? '#0284c7' : '#ffffff', 
              color: activeTab === 'GLOBAL' ? '#ffffff' : '#334155', 
              border: '1px solid #cbd5e1', 
              borderBottom: activeTab === 'GLOBAL' ? 'none' : '1px solid #cbd5e1', 
              borderRadius: '4px 4px 0 0', 
              fontWeight: 'bold', 
              fontSize: '11.5px', 
              cursor: 'pointer' 
            }}
          >
            REGISTRO GLOBAL ({events.length})
          </button>
          <button 
            onClick={() => setActiveTab('RUNLIVE')} 
            style={{ 
              padding: '8px 18px', 
              background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff', 
              color: activeTab === 'RUNLIVE' ? '#ffffff' : '#334155', 
              border: '1px solid #cbd5e1', 
              borderRadius: '4px 4px 0 0', 
              fontWeight: 'bold', 
              fontSize: '11.5px', 
              cursor: 'pointer' 
            }}
          >
            S.A.A.R.E. (RUNLIVE)
          </button>
          <button 
            onClick={() => setActiveTab('CONFIG')} 
            style={{ 
              padding: '8px 18px', 
              background: activeTab === 'CONFIG' ? '#0284c7' : '#ffffff', 
              color: activeTab === 'CONFIG' ? '#ffffff' : '#334155', 
              border: '1px solid #cbd5e1', 
              borderRadius: '4px 4px 0 0', 
              fontWeight: 'bold', 
              fontSize: '11.5px', 
              cursor: 'pointer' 
            }}
          >
            CONFIGURACIÓN ({activeDirectivesCount})
          </button>
        </div>

        {/* TAB 1: CONFIGURACIÓN (VISTA PRINCIPAL ORIGINAL) */}
        {activeTab === 'CONFIG' && (
          <div>
            {/* CAJA BLANCA: CONFIGURADOR DE SINTAXIS Y FILTROS PERSONALIZADOS */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                  CONFIGURADOR DE SINTAXIS Y FILTROS PERSONALIZADOS
                </h3>
                <button 
                  onClick={() => setShowAddModal(true)} 
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '3px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                >
                  + Añadir Filtro
                </button>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#64748b' }}>
                Define palabras clave, frases confidenciales o expresiones regulares (/regex/i) para bloqueo en tiempo real.
              </p>

              {customRules.length === 0 ? (
                <div style={{ padding: '14px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
                  No hay filtros personalizados activos. Las {activeDirectivesCount} directivas base de cumplimiento legal se mantienen en ejecución determinista.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {customRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11.5px' }}>
                        <strong style={{ color: '#0f172a', marginRight: '10px' }}>{rule.label}</strong>
                        <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>{rule.pattern}</code>
                      </div>
                      <button onClick={() => removeCustomRule(idx)} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #ef4444', padding: '2px 8px', borderRadius: '3px', fontWeight: 'bold', fontSize: '10.5px', cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GRID DE TARJETAS BLANCAS CLÁSICAS CON BOTONES VERDES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
              {Object.entries(masterScenariosConfig).map(([key, scn]) => {
                const isEnabled = directives[key] === true;
                return (
                  <div 
                    key={key} 
                    style={{ 
                      background: '#ffffff', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '4px', 
                      padding: '16px 18px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div>
                      {/* Fila Superior: Tag Azul y Badge Habilitada/Deshabilitada */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#0284c7', fontSize: '10.5px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {scn.tag}
                        </span>
                        <span style={{ 
                          border: `1px solid ${isEnabled ? '#16a34a' : '#ef4444'}`, 
                          color: isEnabled ? '#16a34a' : '#ef4444', 
                          padding: '1px 6px', 
                          borderRadius: '3px', 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          background: isEnabled ? 'rgba(22, 163, 74, 0.06)' : 'rgba(239, 68, 68, 0.06)'
                        }}>
                          {isEnabled ? 'HABILITADA' : 'DESHABILITADA'}
                        </span>
                      </div>

                      {/* Título de la Directiva */}
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '900', color: '#0f172a', lineHeight: 1.3 }}>
                        {scn.name}
                      </h4>

                      {/* Descripción */}
                      <p style={{ margin: '0 0 14px 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                        {scn.desc}
                      </p>
                    </div>

                    {/* Botón Verde Clásico: DESACTIVAR / ACTIVAR DIRECTIVA */}
                    <button
                      onClick={() => handleToggleDirective(key)}
                      disabled={syncingKv}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: isEnabled ? '#16a34a' : '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        cursor: syncingKv ? 'wait' : 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isEnabled ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RUNLIVE (MONITOR DE EJECUCIÓN) */}
        {activeTab === 'RUNLIVE' && (
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>
                  TELEMETRÍA & EVALUACIÓN EN TIEMPO DE EJECUCIÓN (SAARE JUDGE)
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Decisiones deterministas en Capa 7 emitidas bajo el estándar SGP 1.0.
                </span>
              </div>
              <span style={{ background: '#16a34a', color: '#fff', padding: '3px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold' }}>
                ● SAARE JUDGE ACTIVO
              </span>
            </div>

            {lastEvent ? (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11.5px', marginBottom: '12px' }}>
                  <div>VERDICT ID: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{lastEvent.verdictId || lastEvent.runId || lastEvent.evidence_id}</strong></div>
                  <div>DECISIÓN: <strong style={{ color: (lastEvent.decision === 'DENY' || lastEvent.decision === 'BLOCK') ? '#ef4444' : '#16a34a' }}>{lastEvent.decision || 'ALLOW'}</strong></div>
                  <div>ENFORCEMENT: <strong style={{ color: '#d97706' }}>{lastEvent.enforcement?.action || 'PASS'}</strong></div>
                  <div>FECHA: <strong>{new Date(lastEvent.issuedAt || lastEvent.timestamp || Date.now()).toLocaleTimeString()}</strong></div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px', borderLeft: `3px solid ${(lastEvent.decision === 'DENY' || lastEvent.decision === 'BLOCK') ? '#ef4444' : '#16a34a'}`, marginBottom: '12px', fontSize: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>PAYLOAD EN RUNTIME:</div>
                  "{lastEvent.promptInput || lastEvent.cleanPrompt || lastEvent.payload || 'Sin contenido'}"
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <button onClick={() => handleExportProofBundle(lastEvent)} disabled={exportingBundle} style={{ padding: '6px 12px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                    📦 {exportingBundle ? 'Exportando...' : 'Descargar Proof Bundle (RFC 3161)'}
                  </button>
                </div>

                <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto', margin: 0 }}>
                  {JSON.stringify(lastEvent, null, 2)}
                </pre>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                Esperando eventos o veredictos de agentes en tiempo real...
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REGISTRO GLOBAL (LEDGER HISTÓRICO) */}
        {activeTab === 'GLOBAL' && (
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: '#0f172a' }}>
                HISTORIAL DE VEREDICTOS Y ACCIONES AUDITADAS ({filteredEvents.length})
              </h3>
              <input 
                type="text" 
                placeholder="Buscar en el registro..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '3px', fontSize: '11px', width: '220px' }} 
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '8px 12px' }}>FECHA</th>
                    <th style={{ padding: '8px 12px' }}>VERDICT ID</th>
                    <th style={{ padding: '8px 12px' }}>POLÍTICA</th>
                    <th style={{ padding: '8px 12px' }}>PAYLOAD</th>
                    <th style={{ padding: '8px 12px' }}>DECISIÓN</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>EXPEDIENTE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        No hay veredictos persistidos en el Decision Store.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev, i) => {
                      const id = ev.verdictId || ev.evidence_id || ev.runId || `VRD-${i + 1}`;
                      const isDenied = ev.decision === 'DENY' || ev.decision === 'BLOCK';
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '8px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {new Date(ev.issuedAt || ev.timestamp || Date.now()).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#0284c7', fontFamily: 'monospace' }}>{id}</td>
                          <td style={{ padding: '8px 12px' }}>{ev.policy?.id || ev.policy_id || 'POL-CORP-GOVERNANCE-01'}</td>
                          <td style={{ padding: '8px 12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{ev.promptInput || ev.cleanPrompt || ev.payload || 'Sin contenido'}"
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 'bold', color: isDenied ? '#ef4444' : '#16a34a' }}>
                            {ev.decision || 'ALLOW'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button onClick={() => setSelectedJson(ev)} style={{ padding: '2px 8px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '10.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                              Ver JSON
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL JSON SAARE VERDICT™ */}
      {selectedJson && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedJson(null)}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '20px', maxWidth: '680px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>SAARE VERDICT™ CANONICAL RECORD</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleExportProofBundle(selectedJson)} disabled={exportingBundle} style={{ background: '#9333ea', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                  📦 Exportar Proof Bundle
                </button>
                <button onClick={() => setSelectedJson(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>✕</button>
              </div>
            </div>
            <pre style={{ flex: 1, overflowY: 'auto', background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
              {JSON.stringify(selectedJson, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* MODAL AÑADIR REGLAS */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '20px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Añadir Filtro Personalizado</h3>
            <input type="text" placeholder="Identificador (ej: SECRETO_EMPRESARIAL)" value={newRule.label} onChange={(e) => setNewRule({...newRule, label: e.target.value})} style={{ width: '100%', padding: '8px 10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '12px' }} />
            <input type="text" placeholder="Patrón Regex (ej: /confidencial/i)" value={newRule.pattern} onChange={(e) => setNewRule({...newRule, pattern: e.target.value})} style={{ width: '100%', padding: '8px 10px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '12px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '6px 12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Cancelar</button>
              <button onClick={addCustomRule} style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADVERTENCIA DE DESACTIVACIÓN */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', border: '1px solid #ef4444', borderRadius: '6px', padding: '24px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#b91c1c' }}>
              Advertencia de Desactivación
            </h3>
            <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Estás a punto de suspender la directiva:<br />
              <strong style={{ color: '#0f172a', display: 'block', marginTop: '4px' }}>
                {masterScenariosConfig[confirmModal.directiveKey]?.name}
              </strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setConfirmModal({ isOpen: false, directiveKey: null })} style={{ padding: '6px 14px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Cancelar</button>
              <button onClick={confirmDeactivation} style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Sí, desactivar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}