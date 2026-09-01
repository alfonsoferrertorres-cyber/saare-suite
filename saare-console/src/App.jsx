import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const API_BASE = import.meta.env.VITE_API_BASE || "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://saare.es";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';

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
      role: urlParams.get('role') || 'CISO',
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
    email: "workload-operator@empresa.com",
    tenantName: "Corporate Enterprise Node",
    role: "CISO",
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

  const [activeTab, setActiveTab] = useState('RUNLIVE');
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

  // CATÁLOGO CANÓNICO DE LAS 5 BÓVEDAS DE AUTORIZACIÓN (SGP 1.0)
  const masterScenariosConfig = {
    cumplimiento_corporativo_integral: {
      name: "01. PRIVACY & SENSITIVE DATA CONTROL (DEFR)",
      category: "01 / PRIVACY CONTROL",
      badgeColor: "#0284c7",
      desc: "Evaluación y aislamiento en memoria volátil de runtime. Identifica, aísla y redacta DNIs, NIEs, IBANs, tarjetas de pago (PCI-DSS) y datos de salud (RGPD Art. 9) antes de la ejecución.",
      llmEffect: "Veredicto DENY o contención REDACT en memoria volátil antes del dispatch al LLM.",
      norma: "Workflow aligned with ISO/IEC 27037:2012 · RGPD Art. 5.2, 9 y 32 · LOPDGDD 3/2018 · DORA",
      icon: "🛡️",
      options: [
        { key: "dlp_dni_nie", label: "Detección estricta DNI / NIE", default: true },
        { key: "dlp_iban_cards", label: "Aislamiento IBAN & PAN Tarjetas (PCI-DSS)", default: true },
        { key: "dlp_health_art9", label: "Protección Datos de Salud (RGPD Art. 9)", default: true },
        { key: "ephemeral_ram_lock", label: "Aislamiento en Memoria Volátil Efímera", default: true }
      ]
    },
    razonamiento_activo_l7: {
      name: "02. L7 RUNTIME SECURITY & ROBUSTNESS",
      category: "02 / RUNTIME SECURITY",
      badgeColor: "#16a34a",
      desc: "Mitigación ex-ante de ataques adversarios (Jailbreaks, Modo DAN, anulación de directivas e inyecciones lógicas según el Art. 15 del EU AI Act).",
      llmEffect: "Emite decisión DENY / BLOCK ante manipulaciones de prompt garantizando la contención perimetral.",
      norma: "EU AI Act Art. 15 · OWASP Top 10 LLM01/02 · Controls mapped to ISO/IEC 42001",
      icon: "⚡",
      options: [
        { key: "anti_dan_jailbreak", label: "Bloqueo Modo DAN & Evasión de Restricciones", default: true },
        { key: "prompt_guard_active", label: "Inspección de System Prompts & Injection", default: true },
        { key: "runtime_containment", label: "Barrera de Contención Activa Fail-Closed", default: true }
      ]
    },
    deepfake_fake_disprover: {
      name: "03. SYNTHETIC MEDIA & RIGHTS CONTROLS",
      category: "03 / RIGHTS & MEDIA",
      badgeColor: "#ea580c",
      desc: "Inspección causal y rechazo estricto (No-Unsupported-Claims) ante clonación o síntesis no consentida de voz/imagen conforme a la Ley Orgánica 1/1982 y el Art. 50 del EU AI Act.",
      llmEffect: "Emite veredicto DENY determinista si la inferencia intenta generar medios sintéticos no autorizados.",
      norma: "Ley Orgánica 1/1982 · EU AI Act Art. 13 & 50 · Controls mapped to ISO/IEC 42001",
      icon: "🔍",
      options: [
        { key: "strict_corpus_grounding", label: "Grounding Estricto en Corpus Litigioso", default: true },
        { key: "reject_unsupported_claims", label: "Rechazo Inmediato de Unsupported Claims", default: true },
        { key: "voice_clone_guard", label: "Protección contra Clonación de Voz/Imagen (LO 1/1982)", default: true },
        { key: "anti_tamper_evidence", label: "Verificación de Integridad de Digest", default: true }
      ]
    },
    auditoria_dictamen_normativo: {
      name: "04. EVIDENCE CAPTURE & PROOF BUNDLE (DES)",
      category: "04 / EVIDENCE RECORD",
      badgeColor: "#9333ea",
      desc: "Generación automatizada de expedientes probatorios inmutables (SAARE VERDICT™). Genera Proof Bundles con Hashes SHA-256, firma asimétrica Ed25519 y sellado temporal RFC 3161.",
      llmEffect: "Emite SAARE VERDICT estructurado con trazabilidad no repudiable para auditorías y comités.",
      norma: "Workflow aligned with ISO/IEC 27037:2012 · EU AI Act Art. 12 Logs · RFC 3161",
      icon: "⚖️",
      options: [
        { key: "rfc3161_qualified_tsa", label: "Estampado Temporal RFC 3161", default: true },
        { key: "ed25519_signatures", label: "Firma Criptográfica Asimétrica Ed25519", default: true },
        { key: "action_digest_binding", label: "Action Digest Binding (SHA-256)", default: true },
        { key: "safe_creative_anchor", label: "Anclaje de Integridad Fiduciaria", default: true }
      ]
    },
    subvenciones_requisitos_infranqueables: {
      name: "05. FIDUCIARY TRACEABILITY & PUBLIC FUNDS",
      category: "05 / TRACEABILITY",
      badgeColor: "#ca8a04",
      desc: "Control automatizado de no-doble financiación (hash SHA-256 de facturas/gastos), principio medioambiental DNSH y generación de memorias técnicas de justificación.",
      llmEffect: "Bloquea transacciones o facturas duplicadas garantizando el principio de no solapamiento.",
      norma: "Ley 38/2003 LGS · Orden HFP/1030/2021 · PRTR / NextGenEU · 2 CFR 200",
      icon: "🏛️",
      options: [
        { key: "enforce_no_double_funding", label: "Bloqueo Anti-Doble Financiación (Hash Facturas)", default: true },
        { key: "enforce_dnsh_principle", label: "Acreditación Principio No Perjuicio Significativo (DNSH)", default: true },
        { key: "prtr_nextgen_dossier", label: "Generador de Memorias de Trazabilidad PRTR", default: true }
      ]
    }
  };

  const [directives, setDirectives] = useState({
    cumplimiento_corporativo_integral: true,
    razonamiento_activo_l7: true,
    deepfake_fake_disprover: true,
    auditoria_dictamen_normativo: true,
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
      a.download = `proof-bundle-${eventLog.verdict_id || eventLog.runId || eventLog.evidence_id || 'EV'}.json`;
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
      const tEmail = sessionUser?.email || "workload-operator@empresa.com";
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
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', background: '#1e3a8a', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0' }}>SAARE CONTROL CONSOLE</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>AI Execution Authorization & Verdict Ledger (SGP 1.0)</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Correo Corporativo (CISO / Operador)" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña de Acceso" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            {loginError && <div style={{ padding: '12px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', textAlign: 'center', fontSize: '0.85rem' }}>{loginError}</div>}
            <button type="submit" disabled={loadingLogin} style={{ padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: loadingLogin ? 'not-allowed' : 'pointer' }}>
              {loadingLogin ? 'Autenticando...' : '🔒 Iniciar Sesión en Control Plane'}
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href={PORTAL_URL} style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none' }}>← Volver al Portal Principal (saare.es)</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#f8fafc' }}>
      
      {/* CABECERA CORPORATIVA */}
      <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#0284c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#fff' }}>S</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.5px' }}>SAARE EXECUTION CONTROL CONSOLE</h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>AI Execution Authorization Infrastructure · SGP 1.0 Canonical Contract</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0b0f19', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: kvStatus.online ? '#10b981' : '#ef4444' }}></span>
            <span style={{ color: '#94a3b8' }}>DECISION STORE:</span>
            <strong style={{ color: kvStatus.online ? '#34d399' : '#ef4444' }}>
              {kvStatus.online ? `ACTIVO (${kvStatus.latencyMs} ms)` : 'ERROR SYNC'}
            </strong>
          </div>
          <button onClick={handleLogout} style={{ padding: '6px 14px', background: '#450a0a', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
            SALIR
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 24px' }}>
        
        {/* PANEL INFORMATIVO DEL TENANT */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px 24px', border: '1px solid #334155', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#ffffff' }}>
                  AUTORIZACIÓN EN TIEMPO DE EJECUCIÓN (L7 RUNTIME)
                </h2>
                <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                  CANONICAL SGP 1.0
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                TENANT: <strong style={{ color: '#ffffff' }}>{sessionUser.tenantName || 'CORP_ENTERPRISE_DOMAIN'}</strong> | OPERADOR: <strong style={{ color: '#38bdf8' }}>{sessionUser.email}</strong> | DIRECTIVAS: <strong style={{ color: '#34d399' }}>{activeDirectivesCount} ACTIVAS</strong> | <strong style={{ color: disabledDirectivesCount > 0 ? '#f87171' : '#34d399' }}>{disabledDirectivesCount} SUSPENDIDAS</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleDownloadTokenizedAgent} 
                disabled={downloadingAgentZip}
                style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', cursor: downloadingAgentZip ? 'default' : 'pointer' }}
              >
                {downloadingAgentZip ? 'Generando...' : '⬇ DESCARGAR SENSOR (.ZIP)'}
              </button>
              <a href={PORTAL_URL} style={{ padding: '8px 14px', background: '#0f172a', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', textDecoration: 'none' }}>
                PORTAL SAARE.ES ↗
              </a>
            </div>
          </div>

          {/* FILTROS POR BÓVEDA */}
          <div style={{ borderTop: '1px dashed #334155', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginRight: '6px', whiteSpace: 'nowrap' }}>
              BÓVEDAS DE CONTROL:
            </span>

            <button
              onClick={() => setActiveScenarioFilter('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeScenarioFilter === 'ALL' ? '#0284c7' : '#334155',
                background: activeScenarioFilter === 'ALL' ? '#0369a1' : '#0b0f19',
                color: '#ffffff',
                whiteSpace: 'nowrap'
              }}
            >
              TODAS ({events.length})
            </button>

            {Object.entries(masterScenariosConfig).map(([key, scn]) => {
              const isEnabled = directives[key];
              const isSelected = activeScenarioFilter === key;
              const countInScenario = events.filter(e => (e.policy?.id || e.policy_id || e.scenario_id || '').toLowerCase().includes(key.toLowerCase())).length;

              return (
                <button
                  key={key}
                  onClick={() => setActiveScenarioFilter(key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? scn.badgeColor : '#334155',
                    background: isSelected ? `${scn.badgeColor}33` : '#0b0f19',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ color: isEnabled ? '#10b981' : '#ef4444', fontSize: '9px' }}>
                    {isEnabled ? '●' : '○'}
                  </span>
                  <span>{scn.icon}</span>
                  <span>{scn.category}</span>
                  <span style={{ background: isEnabled ? '#064e3b' : '#450a0a', color: isEnabled ? '#34d399' : '#fca5a5', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7rem' }}>
                    {isEnabled ? (countInScenario > 0 ? countInScenario : 'ON') : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '12px 28px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: activeTab === 'RUNLIVE' ? '#0284c7' : '#1e293b', color: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            MONITOR DE EJECUCIÓN EN VIVO ({events.length})
          </button>
          <button onClick={() => setActiveTab('GLOBAL')} style={{ padding: '12px 28px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: activeTab === 'GLOBAL' ? '#0284c7' : '#1e293b', color: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            REGISTRO DE VEREDICTOS HISTÓRICO
          </button>
          <button onClick={() => setActiveTab('CONFIG')} style={{ padding: '12px 28px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: activeTab === 'CONFIG' ? '#0284c7' : '#1e293b', color: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            POLÍTICAS DE AUTORIZACIÓN ({activeDirectivesCount} ACTIVAS)
          </button>
        </div>

        {/* TAB 1: RUNLIVE */}
        {activeTab === 'RUNLIVE' && (
          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '900' }}>
                  TELEMETRÍA & EVALUACIÓN EN TIEMPO DE EJECUCIÓN (SAARE JUDGE)
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Adjudicación determinista de permisos de ejecución según el contrato canónico SGP 1.0.
                </span>
              </div>
              <span style={{ background: '#064e3b', color: '#34d399', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', border: '1px solid #10b981' }}>
                ● SAARE JUDGE ACTIVO
              </span>
            </div>

            {lastEvent ? (
              <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div>VERDICT ID: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{lastEvent.verdict_id || lastEvent.runId || lastEvent.evidence_id}</strong></div>
                  <div>POLÍTICA: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{lastEvent.policy?.id || lastEvent.policy_id || 'POL-CORP-GOVERNANCE-01'}</strong></div>
                  <div>DECISIÓN: <strong style={{ color: (lastEvent.decision === 'DENY' || lastEvent.decision === 'BLOCK' || lastEvent.verdict === 'RECHAZADO') ? '#ef4444' : '#10b981' }}>{lastEvent.decision || (lastEvent.verdict === 'RECHAZADO' ? 'DENY' : 'ALLOW')}</strong></div>
                  <div>ENFORCEMENT: <strong style={{ color: '#f59e0b' }}>{lastEvent.enforcement?.action || lastEvent.enforcement_action || 'PASS'}</strong></div>
                  <div>TIMESTAMP: <strong>{new Date(lastEvent.issuedAt || lastEvent.timestamp || Date.now()).toLocaleString()}</strong></div>
                  <div>SELLO: <strong style={{ color: '#c084fc', fontFamily: 'monospace' }}>{lastEvent.cryptoSeal || 'L7-SEAL:ED25519'}</strong></div>
                </div>

                <div style={{ background: '#020617', padding: '16px', borderLeft: `4px solid ${(lastEvent.decision === 'DENY' || lastEvent.decision === 'BLOCK' || lastEvent.verdict === 'RECHAZADO') ? '#ef4444' : '#10b981'}`, borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
                  <div style={{ fontSize: '0.75rem', color: (lastEvent.decision === 'DENY' || lastEvent.decision === 'BLOCK' || lastEvent.verdict === 'RECHAZADO') ? '#ef4444' : '#10b981', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                    PAYLOAD EVALUADO EN RUNTIME:
                  </div>
                  "{lastEvent.promptInput || lastEvent.cleanPrompt || lastEvent.payload || 'Sin contenido'}"
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                  <button onClick={() => handleExportProofBundle(lastEvent)} disabled={exportingBundle} style={{ padding: '8px 16px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                    📦 {exportingBundle ? 'Generando...' : 'Exportar Proof Bundle (Ed25519 / RFC 3161)'}
                  </button>
                </div>

                <pre style={{ background: '#020617', padding: '14px', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto', margin: 0 }}>
                  {JSON.stringify(lastEvent, null, 2)}
                </pre>
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
                <strong>Esperando llamadas de agentes o sensores L7...</strong>
                <p style={{ fontSize: '0.85rem', margin: '6px 0 0 0' }}>Realiza una acción o inferencia para observar el veredicto canónico en tiempo real.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GLOBAL LEDGER */}
        {activeTab === 'GLOBAL' && (
          <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', fontWeight: '900' }}>SAARE VERDICT™ LEDGER</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Filtro: <strong>{activeScenarioFilter}</strong> | Veredictos registrados: <strong>{filteredEvents.length}</strong>
                </span>
              </div>
              <input
                type="text"
                placeholder="Buscar por ID, Política, Digest o Payload..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0b0f19', color: '#fff', fontSize: '0.85rem', width: '280px' }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{ background: '#0b0f19', borderBottom: '1px solid #334155' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
                    <th style={{ padding: '12px 16px' }}>VERDICT ID</th>
                    <th style={{ padding: '12px 16px' }}>POLÍTICA</th>
                    <th style={{ padding: '12px 16px' }}>PAYLOAD EVALUADO</th>
                    <th style={{ padding: '12px 16px' }}>DECISIÓN</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>EXPEDIENTE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        No hay veredictos registrados para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev, i) => {
                      const id = ev.verdict_id || ev.evidence_id || ev.runId || `VRD-${i + 1}`;
                      const timestamp = ev.issuedAt || ev.timestamp ? new Date(ev.issuedAt || ev.timestamp).toLocaleString() : 'En vivo';
                      const policy = ev.policy?.id || ev.policy_id || ev.category || 'POL-CORP-GOVERNANCE-01';
                      const promptText = ev.promptInput || ev.cleanPrompt || ev.payload || "Sin contenido";
                      const isDenied = ev.decision === 'DENY' || ev.decision === 'BLOCK' || ev.verdict === 'RECHAZADO';
                      const decision = isDenied ? 'DENY' : 'ALLOW';

                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #334155', background: i % 2 === 0 ? '#1e293b' : '#182234' }}>
                          <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{timestamp}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace' }}>{id}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '700', color: '#ffffff' }}>{policy}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ev.reason || 'Autorización determinista'}</div>
                          </td>
                          <td style={{ padding: '12px 16px', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#cbd5e1' }}>
                            "{promptText}"
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '900', color: isDenied ? '#ef4444' : '#10b981' }}>
                            {decision}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button onClick={() => setSelectedJson(ev)} style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
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

        {/* TAB 3: CONFIGURACIÓN DE POLÍTICAS */}
        {activeTab === 'CONFIG' && (
          <div>
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '900' }}>
                    DIRECTIVAS DE AUTORIZACIÓN & REGLAS DETERMINISTAS
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                    Configuración de políticas del SAARE Judge para autorización de acciones en tiempo de ejecución.
                  </p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>
                  + AÑADIR REGLA
                </button>
              </div>

              {customRules.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#0b0f19', border: '1px solid #334155', borderRadius: '6px' }}>
                      <div>
                        <strong style={{ color: '#ffffff', marginRight: '12px' }}>{rule.label}</strong>
                        <code style={{ background: '#0369a1', color: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{rule.pattern}</code>
                      </div>
                      <button onClick={() => removeCustomRule(idx)} style={{ background: '#450a0a', color: '#fca5a5', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem' }}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GRID DE LAS 5 BÓVEDAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
              {Object.entries(masterScenariosConfig).map(([key, scn]) => {
                const isEnabled = directives[key] === true;
                return (
                  <div
                    key={key}
                    style={{
                      background: '#1e293b',
                      padding: '24px',
                      borderRadius: '12px',
                      border: `1px solid ${isEnabled ? '#10b981' : '#334155'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ background: '#0369a1', color: '#e0f2fe', padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900' }}>
                          {scn.category}
                        </span>
                        <span style={{ border: `1px solid ${isEnabled ? '#10b981' : '#ef4444'}`, color: isEnabled ? '#34d399' : '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                          {isEnabled ? 'ACTIVA' : 'SUSPENDIDA'}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '900', color: '#ffffff' }}>
                        {scn.icon} {scn.name}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        {scn.desc}
                      </p>

                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace', marginBottom: '12px' }}>
                        Normativa: {scn.norma}
                      </div>

                      <div style={{ borderTop: '1px dashed #334155', paddingTop: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                          Controles Específicos:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {scn.options.map((opt) => {
                            const isOptActive = vaultSubOptions[opt.key] !== false;
                            return (
                              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer', background: '#0b0f19', padding: '6px 10px', borderRadius: '4px' }}>
                                <span>{opt.label}</span>
                                <input
                                  type="checkbox"
                                  checked={isOptActive}
                                  onChange={() => handleToggleSubOption(opt.key)}
                                  disabled={!isEnabled || syncingKv}
                                  style={{ cursor: 'pointer' }}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDirective(key)}
                      disabled={syncingKv}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: isEnabled ? '#10b981' : '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '900',
                        cursor: syncingKv ? 'wait' : 'pointer',
                        fontSize: '0.85rem'
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

        {/* MODAL JSON SAARE VERDICT™ */}
        {selectedJson && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedJson(null)}>
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px', maxWidth: '720px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>SAARE VERDICT™ CANONICAL RECORD (SGP 1.0)</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleExportProofBundle(selectedJson)} disabled={exportingBundle} style={{ background: '#9333ea', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>
                    📦 {exportingBundle ? 'Exportando...' : 'Descargar Proof Bundle'}
                  </button>
                  <button onClick={() => setSelectedJson(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}>✕</button>
                </div>
              </div>
              <pre style={{ flex: 1, overflowY: 'auto', background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', color: '#34d399', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {JSON.stringify(selectedJson, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* MODAL AÑADIR REGLAS */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', maxWidth: '440px', width: '90%' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>Añadir Regla de Autorización</h3>
              <input type="text" placeholder="Identificador (ej: PROPIEDAD_INTELECTUAL)" value={newRule.label} onChange={(e) => setNewRule({...newRule, label: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#0b0f19', color: '#fff', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Patrón Regex (ej: /confidencial/i)" value={newRule.pattern} onChange={(e) => setNewRule({...newRule, pattern: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #334155', background: '#0b0f19', color: '#fff', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={addCustomRule} style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Guardar Regla</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ADVERTENCIA DE DESACTIVACIÓN */}
        {confirmModal.isOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '12px', padding: '28px', maxWidth: '440px', width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>
                Advertencia de Desactivación de Control
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Estás a punto de suspender la directiva:<br/>
                <strong style={{ color: '#ef4444', display: 'block', marginTop: '6px' }}>
                  {masterScenariosConfig[confirmModal.directiveKey]?.name}
                </strong>
                <br/>
                Esto desactivará la emisión de permisos de ejecución para este dominio.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={() => setConfirmModal({ isOpen: false, directiveKey: null })} style={{ padding: '10px 18px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '800' }}>Cancelar</button>
                <button onClick={confirmDeactivation} style={{ padding: '10px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '800' }}>Sí, desactivar</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}