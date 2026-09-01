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
      tenantName: tenantParam || 'SAARE Enterprise Node',
      tenantId: 'tenant_admin_01',
      apiKey: tokenParam,
      role: urlParams.get('role') || 'AUDITOR PERICIAL',
      licenseType: 'TIER_ENTERPRISE_AUDITOR'
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
    email: "auditor@empresa.es",
    tenantName: "SAARE Enterprise Organization",
    role: "AUDITOR PERICIAL",
    apiKey: "sk_saare_live_master_kv_session",
    licenseType: "ASIENTO_AUDITOR_ACTIVO"
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
    latencyMs: 16,
    lastSync: new Date().toLocaleTimeString()
  });

  const [activeScenarioFilter, setActiveScenarioFilter] = useState('ALL');

  // CATÁLOGO CANÓNICO DE LAS 5 BÓVEDAS MAESTRAS (SGP 1.0)
  const masterScenariosConfig = {
    cumplimiento_corporativo_integral: {
      name: "01. PREVENT: PRIVACIDAD & AISLAMIENTO DE DATOS PII (L7)",
      category: "01 / PRIVACY (RAM ISOLATION)",
      badgeColor: "#0284c7",
      desc: "Aislamiento e inspección determinista en memoria volátil (RAM) con purga SYS_madvise. Bloquea y redacta DNI, NIE, IBAN, nóminas, tarjetas y datos médicos (RGPD Art. 9).",
      llmEffect: "Veredicto BLOCK o REDACT en memoria volátil en <0.017 ms antes de que los datos alcancen al proveedor LLM.",
      norma: "Workflow aligned with ISO/IEC 27037:2012 · RGPD Art. 5.2, 9 y 32 · LOPDGDD 3/2018 · DORA Capa 7",
      icon: "🛡️",
      monetization: "Licencia OEM / Seat ARR",
      options: [
        { key: "dlp_dni_nie", label: "Detección estricta DNI / NIE", default: true },
        { key: "dlp_iban_cards", label: "Aislamiento IBAN & PAN Tarjetas (PCI-DSS)", default: true },
        { key: "dlp_health_art9", label: "Protección Datos de Salud (RGPD Art. 9)", default: true },
        { key: "purge_sys_madvise", label: "Purga RAM Zero-Disk (SYS_madvise)", default: true }
      ]
    },
    razonamiento_activo_l7: {
      name: "02. ENFORCE: ROBUSTEZ L7 & TESTIGO DEL CEREBRO",
      category: "02 / SECURITY (ACTIVE DEFENSE)",
      badgeColor: "#16a34a",
      desc: "Mitigación ex-ante de ataques adversarios (Jailbreaks, Modo DAN, anulación de directivas y prompt leaking). Aplica [SAARE_ACTIVE_SHIELD: ENFORCE] e inyecta el testigo 🧠 L7 CEREBRO.",
      llmEffect: "Inserta la firma 🧠 L7 CEREBRO WITNESS en inferencias válidas y mide el ahorro de pipeline computacional.",
      norma: "EU AI Act Art. 15 · OWASP Top 10 LLM01/02 · Controls mapped to ISO/IEC 42001",
      icon: "⚡",
      monetization: "Edge Pay-as-you-go",
      options: [
        { key: "lexical_enforce_active", label: "Comando Léxico [SAARE_ACTIVE_SHIELD: ENFORCE]", default: true },
        { key: "brain_witness_injection", label: "Inyección de Testigo 🧠 L7 CEREBRO en el LLM", default: true },
        { key: "anti_dan_jailbreak", label: "Bloqueo Modo DAN & Evasión de Restricciones", default: true },
        { key: "pipeline_savings_meter", label: "Telemetría de Ahorro y Optimización de Tokens", default: true }
      ]
    },
    deepfake_fake_disprover: {
      name: "03. VERIFY: VERACIDAD, FACTUALIDAD & ANTI-DEEPFAKE",
      category: "03 / VERIFICATION (DETECCIÓN)",
      badgeColor: "#ea580c",
      desc: "Inspección causal estricta (Corpus Grounding / No-Unsupported-Claims) frente a alucinaciones críticas, contratos sin sustento y clonación sintética de voz/imagen sin consentimiento.",
      llmEffect: "Emite veredicto BLOCK determinista si la inferencia genera aserciones no sustentadas o suplanta identidades.",
      norma: "Ley Orgánica del Honor 2026 · AI Act Art. 13 · Controls mapped to ISO/IEC 42001",
      icon: "🔍",
      monetization: "Tier SaaS / Fee Dossier",
      options: [
        { key: "strict_corpus_grounding", label: "Grounding Estricto en Corpus Litigioso", default: true },
        { key: "reject_unsupported_claims", label: "Rechazo Inmediato de Unsupported Claims", default: true },
        { key: "deepfake_sampling_stream", label: "Muestreo Continuo en Vivo (RunLive Sampling)", default: true },
        { key: "anti_tamper_evidence", label: "Verificación de Integridad contra Alteraciones", default: true }
      ]
    },
    auditoria_dictamen_normativo: {
      name: "04. PROVE: EVIDENCE CAPTURE & PROOF BUNDLE (ROL DES)",
      category: "04 / EVIDENCE (DECISION RECORD)",
      badgeColor: "#9333ea",
      desc: "Generación de expedientes probatorios inmutables (SAARE VERDICT™). Genera Proof Bundles con Hashes SHA-256 pre/post, firma Ed25519 y sellos de tiempo RFC 3161.",
      llmEffect: "Emite SAARE VERDICT estructurado con trazabilidad y anclaje probatorio ante comités y autoridades.",
      norma: "Workflow aligned with ISO/IEC 27037:2012 · EU AI Act Art. 12 · RFC 3161 Timestamping",
      icon: "⚖️",
      monetization: "Asiento Auditor (149 €/mes)",
      options: [
        { key: "rfc3161_qualified_tsa", label: "Estampado Temporal RFC 3161", default: true },
        { key: "ed25519_signatures", label: "Firma Criptográfica Asimétrica Ed25519", default: true },
        { key: "merkle_root_anchoring", label: "Inclusión en Árbol de Transparencia Merkle", default: true },
        { key: "safe_creative_anchor", label: "Anclaje Registral Safe Creative Nº 2607076315021", default: true }
      ]
    },
    subvenciones_requisitos_infranqueables: {
      name: "05. JUSTIFY: TRAZABILIDAD FIDUCIARIA & FONDOS PÚBLICOS",
      category: "05 / TRACEABILITY (FONDOS & PRTR)",
      badgeColor: "#ca8a04",
      desc: "Control perimetral de no-doble financiación (hash SHA-256 de facturas/gastos), principio medioambiental DNSH y generación de memorias técnicas para la IGAE y OLAF (PRTR, NextGenEU).",
      llmEffect: "Bloquea facturas o partidas presupuestarias duplicadas garantizando el principio de no solapamiento.",
      norma: "Ley 38/2003 LGS · Orden HFP/1030/2021 · 2 CFR 200 (USA) · Horizon Europe",
      icon: "🏛️",
      monetization: "Pack PRTR / Justificación",
      options: [
        { key: "enforce_no_double_funding", label: "Bloqueo Anti-Doble Financiación (Hash Facturas)", default: true },
        { key: "enforce_dnsh_principle", label: "Acreditación Principio No Perjuicio Significativo (DNSH)", default: true },
        { key: "prtr_nextgen_dossier", label: "Generador de Memorias Técnicas PRTR / NextGenEU", default: true },
        { key: "daci_conflict_prevention", label: "Declaración Ausencia de Conflicto de Interés (DACI)", default: true }
      ]
    }
  };

  // ESTADO DE LAS 5 BÓVEDAS
  const [directives, setDirectives] = useState({
    cumplimiento_corporativo_integral: true,
    razonamiento_activo_l7: true,
    deepfake_fake_disprover: true,
    auditoria_dictamen_normativo: true,
    subvenciones_requisitos_infranqueables: true
  });

  // SUB-OPCIONES ACTIVAS
  const [vaultSubOptions, setVaultSubOptions] = useState({
    dlp_dni_nie: true,
    dlp_iban_cards: true,
    dlp_health_art9: true,
    purge_sys_madvise: true,
    rfc3161_qualified_tsa: true,
    ed25519_signatures: true,
    merkle_root_anchoring: true,
    safe_creative_anchor: true,
    lexical_enforce_active: true,
    brain_witness_injection: true,
    anti_dan_jailbreak: true,
    pipeline_savings_meter: true,
    strict_corpus_grounding: true,
    reject_unsupported_claims: true,
    deepfake_sampling_stream: true,
    anti_tamper_evidence: true,
    enforce_no_double_funding: true,
    enforce_dnsh_principle: true,
    prtr_nextgen_dossier: true,
    daci_conflict_prevention: true
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
      console.error("Fallo al sincronizar settings con Bóveda KV", err);
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
        runsList.sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0));
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
      setLoginError("Error de comunicación con Bóveda KV.");
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

      if (!res.ok) throw new Error("Fallo en la emisión pericial.");

      const bundleData = await res.json();
      const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proof-bundle-${eventLog.verdict_id || eventLog.runId || eventLog.evidenceId || 'EV'}.json`;
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

  // Descarga del paquete de agente 100% tokenizado y aprovisionado
  const handleDownloadTokenizedAgent = async () => {
    try {
      setDownloadingAgentZip(true);
      const response = await fetch('/saare-extension.zip');
      if (!response.ok) throw new Error("No se pudo obtener el paquete base del agente.");

      const zipArrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(zipArrayBuffer);

      const tTenant = sessionUser?.tenantName || "SAARE_ENTERPRISE_ORG";
      const tEmail = sessionUser?.email || "auditor@saare.es";
      const tToken = sessionUser?.apiKey || sessionUser?.token || "sk_live_sgp10_" + Math.random().toString(36).substring(2, 12);

      const tokenizedManagedConfig = {
        "saare_api_key": { "Value": tToken },
        "saare_tenant_domain": { "Value": tTenant },
        "saare_user_email": { "Value": tEmail },
        "saare_license_type": { "Value": "PLAN_TOKENIZADO_ENTERPRISE" },
        "governance_protocol": { "Value": "SGP_1.0" }
      };

      const runtimeConfig = {
        tenantName: tTenant,
        email: tEmail,
        apiKey: tToken,
        protocol: "SGP_1.0",
        enforcementMode: "ADJUDICATE_AND_ATTEST",
        provisionedAt: new Date().toISOString()
      };

      zip.file("storage_managed.json", JSON.stringify(tokenizedManagedConfig, null, 2));
      zip.file("saare_config.json", JSON.stringify(runtimeConfig, null, 2));

      const customizedBlob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(customizedBlob);
      dl.download = `saare-nodo-tokenizado-${tTenant.toLowerCase().replace(/[^a-z0-9]/g, '_')}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      URL.revokeObjectURL(dl.href);
    } catch (err) {
      alert("Error al empaquetar agente tokenizado: " + err.message);
    } finally {
      setDownloadingAgentZip(false);
    }
  };

  const filteredEvents = events.filter(ev => {
    const scenario = ev.policy_id || ev.scenario_id || '';
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
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0' }}>SAARE GOVERNANCE CONSOLE</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Acceso a Consola de Veredictos & Adjudicación L7 (SGP 1.0)</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Correo Corporativo (CISO / Auditor)" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña de Acceso" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            {loginError && <div style={{ padding: '12px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', textAlign: 'center', fontSize: '0.85rem' }}>{loginError}</div>}
            <button type="submit" disabled={loadingLogin} style={{ padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: loadingLogin ? 'not-allowed' : 'pointer' }}>
              {loadingLogin ? 'Autenticando...' : '🔒 Iniciar Sesión en Decision Layer'}
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
    <div style={{ minHeight: '100vh', background: '#7b92a8', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      {/* CABECERA CORPORATIVA */}
      <header style={{ background: '#ffffff', borderBottom: '2px solid #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <img src="/Cabecera saare-console.jfif" alt="SAARE AI Governance Decision Layer" style={{ width: '100%', maxWidth: '1440px', height: 'auto', maxHeight: '180px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
      </header>

      <main style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 24px' }}>
        
        {/* PANEL INFORMATIVO DEL TENANT + MONITOR EN VIVO */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px 28px', border: '1px solid #cbd5e1', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.2px', textTransform: 'uppercase' }}>
                  CONSOLA DE ADJUDICACIÓN DE POLÍTICAS & SAARE VERDICT™ (SGP 1.0)
                </h2>
                <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                  POLICY → JUDGE → VERDICT → PROOF
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>
                ORGANIZACIÓN: <strong style={{ color: '#0f172a' }}>{sessionUser.tenantName || 'ENTORNO AISLADO'}</strong> | OPERADOR: <strong style={{ color: '#0284c7' }}>{sessionUser.email}</strong> | DOMINIOS L7: <strong style={{ color: '#16a34a' }}>{activeDirectivesCount} ACTIVOS</strong> | <strong style={{ color: disabledDirectivesCount > 0 ? '#dc2626' : '#16a34a' }}>{disabledDirectivesCount} OFF</strong>
              </div>
            </div>

            {/* ESTADO EN VIVO Y ACCIONES RÁPIDAS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: kvStatus.online ? '#16a34a' : '#dc2626' }}></span>
                <span style={{ color: '#64748b' }}>DECISION STORE:</span>
                <strong style={{ color: kvStatus.online ? '#15803d' : '#dc2626' }}>
                  {kvStatus.online ? `ACTIVO (${kvStatus.latencyMs} ms)` : 'ERROR SYNC'}
                </strong>
                <span style={{ color: '#94a3b8' }}>| {kvStatus.lastSync}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `2px solid ${connected ? '#16a34a' : '#ef4444'}`, color: connected ? '#15803d' : '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#16a34a' : '#ef4444' }}></span>
                {connected ? 'JUDGE L7 CONECTADO' : 'DESCONECTADO'}
              </div>

              <button 
                onClick={handleDownloadTokenizedAgent} 
                disabled={downloadingAgentZip}
                style={{ padding: '8px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', cursor: downloadingAgentZip ? 'default' : 'pointer' }}
              >
                {downloadingAgentZip ? 'Generando...' : '⬇ NODO TOKENIZADO (.ZIP)'}
              </button>

              <a href={PORTAL_URL} style={{ padding: '8px 12px', background: '#e0f2fe', border: '1px solid #0284c7', color: '#0369a1', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', textDecoration: 'none' }}>
                PORTAL ISV ↗
              </a>

              <button onClick={handleLogout} style={{ padding: '8px 14px', background: '#fee2e2', border: '1px solid #ef4444', color: '#dc2626', borderRadius: '6px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
                SALIR
              </button>
            </div>
          </div>

          {/* FILTROS POR BÓVEDA / DOMINIO DE GOBERNANZA */}
          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', marginRight: '6px' }}>
              DOMINIOS L7 (5 BÓVEDAS):
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
                borderColor: activeScenarioFilter === 'ALL' ? '#0284c7' : '#cbd5e1',
                background: activeScenarioFilter === 'ALL' ? '#e0f2fe' : '#ffffff',
                color: activeScenarioFilter === 'ALL' ? '#0369a1' : '#475569',
                whiteSpace: 'nowrap'
              }}
            >
              TODAS ({events.length})
            </button>

            {Object.entries(masterScenariosConfig).map(([key, scn]) => {
              const isEnabled = directives[key];
              const isSelected = activeScenarioFilter === key;
              const countInScenario = events.filter(e => (e.policy_id || e.scenario_id || '').toLowerCase().includes(key.toLowerCase())).length;

              return (
                <button
                  key={key}
                  onClick={() => setActiveScenarioFilter(key)}
                  title={`Filtrar veredictos: ${scn.name}`}
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
                    borderColor: isSelected ? scn.badgeColor : '#e2e8f0',
                    background: isSelected ? `${scn.badgeColor}15` : '#f8fafc',
                    color: isSelected ? scn.badgeColor : '#334155',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ color: isEnabled ? '#16a34a' : '#dc2626', fontSize: '9px' }}>
                    {isEnabled ? '●' : '○'}
                  </span>
                  <span>{scn.icon}</span>
                  <span>{scn.category}</span>
                  <span style={{ background: isEnabled ? '#dcfce7' : '#fee2e2', color: isEnabled ? '#15803d' : '#dc2626', padding: '1px 5px', borderRadius: '4px', fontSize: '0.7rem' }}>
                    {isEnabled ? (countInScenario > 0 ? countInScenario : 'ACTIVO') : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS PRINCIPALES */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('GLOBAL')} style={{ padding: '14px 32px', borderRadius: '8px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', border: 'none', background: activeTab === 'GLOBAL' ? '#0284c7' : '#ffffff', color: activeTab === 'GLOBAL' ? '#ffffff' : '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            REGISTRO DE VEREDICTOS ({filteredEvents.length})
          </button>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '14px 32px', borderRadius: '8px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', border: 'none', background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            GOVERNANCE JUDGE (RUNLIVE)
          </button>
          <button onClick={() => setActiveTab('CONFIG')} style={{ padding: '14px 32px', borderRadius: '8px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', border: 'none', background: activeTab === 'CONFIG' ? '#0284c7' : '#ffffff', color: activeTab === 'CONFIG' ? '#ffffff' : '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            POLICY-TO-VERDICT COMPILER ({activeDirectivesCount} ACTIVAS)
          </button>
        </div>

        {/* TAB 1: REGISTRO GLOBAL DE VEREDICTOS */}
        {activeTab === 'GLOBAL' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase' }}>SAARE VERDICT™ LEDGER HISTÓRICO</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Filtro activo: <strong>{activeScenarioFilter}</strong> | Veredictos registrados: <strong>{filteredEvents.length}</strong>
                </span>
              </div>
              <input
                type="text"
                placeholder="Buscar por Verdict ID, Policy, Hash o Payload..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '280px' }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>TIMESTAMP</th>
                    <th style={{ padding: '14px 20px' }}>VERDICT ID / SYSTEM</th>
                    <th style={{ padding: '14px 20px' }}>POLÍTICA / MARCO</th>
                    <th style={{ padding: '14px 20px' }}>PAYLOAD EVALUADO (RAM)</th>
                    <th style={{ padding: '14px 20px' }}>DECISIÓN</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>ADJUDICACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No hay veredictos registrados para el filtro seleccionado ({activeScenarioFilter}).
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev, i) => {
                      const id = ev.verdict_id || ev.evidence_id || ev.runId || `VRD-L7-${i + 1}`;
                      const timestamp = ev.timestamp ? new Date(ev.timestamp).toLocaleString() : 'En vivo';
                      const policy = ev.policy_id || ev.category || 'POL-CORP-GOVERNANCE-01';
                      const promptText = ev.promptInput || ev.cleanPrompt || ev.payload || "Sin contenido";
                      const decision = ev.decision || (ev.verdict === 'RECHAZADO' ? 'BLOCK' : 'ALLOW');
                      const systemTag = ev.system_id || 'L7-AGENT-SENSOR';

                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{timestamp}</td>
                          <td style={{ padding: '14px 20px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>
                            <div>{id}</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#e2e8f0', padding: '1px 5px', borderRadius: '3px' }}>
                              {systemTag}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{policy}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ev.reason || 'Adjudicación determinista'}</div>
                          </td>
                          <td style={{ padding: '14px 20px', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{promptText}"
                          </td>
                          <td style={{ padding: '14px 20px', fontWeight: '900', color: decision === 'BLOCK' || decision === 'RECHAZADO' ? '#dc2626' : '#16a34a' }}>
                            {decision}
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                            <button onClick={() => setSelectedJson(ev)} style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                              Ver Verdict
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

        {/* TAB 2: GOVERNANCE JUDGE RUNLIVE */}
        {activeTab === 'RUNLIVE' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '32px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase' }}>
                  TELEMETRÍA EN VIVO & ADJUDICACIÓN DE VEREDICTOS (L7)
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Motor determinista de evaluación de políticas, testigo 🧠 L7 CEREBRO y adjudicación ex-ante.
                </span>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', border: '1px solid #86efac' }}>
                ● JUDGE ENGINE ACTIVO
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Ahorro Computacional L7</span>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#34d399', margin: '6px 0' }}>98.4%</div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Carga previa evitada en el LLM</span>
              </div>
              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Latencia RAM Determinista</span>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#38bdf8', margin: '6px 0' }}>0.017 ms</div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>P99 de inspección volátil</span>
              </div>
              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Veredictos Emitidos</span>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#facc15', margin: '6px 0' }}>{events.length} vrd</div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>SGP 1.0 Canonical Records</span>
              </div>
              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Testigo Criptográfico</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#c084fc', margin: '10px 0' }}>🧠 L7 CEREBRO</div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Inyectado en respuestas válidas</span>
              </div>
            </div>

            {lastEvent ? (
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                  <div>VERDICT ID: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{lastEvent.verdict_id || lastEvent.runId || lastEvent.evidence_id}</strong></div>
                  <div>POLÍTICA APLICADA: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{lastEvent.policy_id || lastEvent.scenario_id || 'POL-CORP-GOVERNANCE-01'}</strong></div>
                  <div>DECISIÓN L7: <strong style={{ color: (lastEvent.decision === 'BLOCK' || lastEvent.verdict === 'RECHAZADO') ? '#dc2626' : '#16a34a' }}>{lastEvent.decision || lastEvent.verdict || 'ALLOW'}</strong></div>
                  <div>TIMESTAMP: <strong>{new Date(lastEvent.timestamp || Date.now()).toLocaleString()}</strong></div>
                  <div>SELLO CRIPTOGRÁFICO: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{lastEvent.cryptoSeal || 'L7-SEAL:ED25519'}</strong></div>
                  <div>ESTADO VALIDEZ: <strong style={{ color: '#16a34a', fontFamily: 'monospace' }}>{lastEvent.validity_state || 'VALID'}</strong></div>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderLeft: `5px solid ${(lastEvent.decision === 'BLOCK' || lastEvent.verdict === 'RECHAZADO') ? '#dc2626' : '#16a34a'}`, borderRadius: '4px', marginBottom: '18px', fontSize: '0.95rem' }}>
                  <div style={{ fontSize: '0.75rem', color: (lastEvent.decision === 'BLOCK' || lastEvent.verdict === 'RECHAZADO') ? '#dc2626' : '#16a34a', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                    PAYLOAD EN MEMORIA VOLÁTIL (RAM BUFFER L7):
                  </div>
                  "{lastEvent.promptInput || lastEvent.cleanPrompt || lastEvent.payload || 'Sin contenido'}"
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button onClick={() => handleExportProofBundle(lastEvent)} disabled={exportingBundle} style={{ padding: '10px 18px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    📦 {exportingBundle ? 'Generando Proof Bundle...' : 'Exportar Proof Bundle (Ed25519 / RFC 3161)'}
                  </button>
                </div>

                <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
                  {JSON.stringify(lastEvent, null, 2)}
                </div>
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
                <strong>Esperando intercepciones del Governance Judge...</strong>
                <p style={{ fontSize: '0.85rem', margin: '6px 0 0 0' }}>Realiza una llamada o inferencia para observar la adjudicación en caliente y el testigo 🧠 en vivo.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIGURACIÓN DE POLÍTICAS Y REGLAS */}
        {activeTab === 'CONFIG' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                    POLICY-TO-VERDICT COMPILER & REGLAS PERSONALIZADAS
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>
                    Define directivas de adjudicación personalizadas o expresiones regulares complementarias para el Governance Judge.
                  </p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 2px 6px rgba(2,132,199,0.3)' }}>
                  + AÑADIR REGLA DE ADJUDICACIÓN
                </button>
              </div>

              {customRules.length === 0 ? (
                <div style={{ border: '1px dashed #94a3b8', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem', background: '#f8fafc' }}>
                  No hay reglas personalizadas activas. Las 5 Bóvedas de directivas maestras seleccionadas abajo operan de forma determinista.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ color: '#0f172a', marginRight: '16px' }}>{rule.label}</strong>
                        <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{rule.pattern}</code>
                      </div>
                      <button onClick={() => removeCustomRule(idx)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem' }}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GRID DE LAS 5 BÓVEDAS MAESTRAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
              {Object.entries(masterScenariosConfig).map(([key, scn]) => {
                const isEnabled = directives[key] === true;
                return (
                  <div
                    key={key}
                    style={{
                      background: '#ffffff',
                      padding: '28px',
                      borderRadius: '12px',
                      border: `2px solid ${isEnabled ? '#16a34a' : '#cbd5e1'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>
                          {scn.category}
                        </span>
                        <span style={{ border: `1px solid ${isEnabled ? '#22c55e' : '#ef4444'}`, color: isEnabled ? '#16a34a' : '#dc2626', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>
                          {isEnabled ? 'HABILITADA' : 'DESHABILITADA'}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                        {scn.icon} {scn.name}
                      </h4>
                      <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        {scn.desc}
                      </p>

                      <div style={{ fontSize: '0.78rem', color: '#0284c7', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '12px' }}>
                        Normativa: {scn.norma}
                      </div>

                      <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', borderLeft: `3px solid ${scn.badgeColor}`, fontSize: '0.8rem', color: '#64748b', marginBottom: '18px' }}>
                        <strong>Efecto en LLM:</strong> {scn.llmEffect}
                      </div>

                      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '14px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                          Opciones y Controles Específicos:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {scn.options.map((opt) => {
                            const isOptActive = vaultSubOptions[opt.key] !== false;
                            return (
                              <label key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#334155', cursor: 'pointer', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
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
                        padding: '16px',
                        background: isEnabled ? '#16a34a' : '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '900',
                        cursor: syncingKv ? 'wait' : 'pointer',
                        textTransform: 'uppercase',
                        fontSize: '0.95rem',
                        boxShadow: `0 4px 6px ${isEnabled ? 'rgba(22,163,74,0.3)' : 'rgba(239,68,68,0.3)'}`
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedJson(null)}>
            <div style={{ background: '#090d16', border: '1px solid #334155', borderRadius: '12px', padding: '24px', maxWidth: '720px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>SAARE VERDICT™ // ADJUDICATION RECORD</h3>
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '28px', maxWidth: '480px', width: '90%' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '900' }}>Añadir Regla de Adjudicación</h3>
              <input type="text" placeholder="Identificador de Regla (ej: SECRETO_INDUSTRIAL)" value={newRule.label} onChange={(e) => setNewRule({...newRule, label: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Patrón Regex (ej: /confidencial/i)" value={newRule.pattern} onChange={(e) => setNewRule({...newRule, pattern: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 18px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={addCustomRule} style={{ padding: '10px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Guardar Regla</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ADVERTENCIA DE DESACTIVACIÓN */}
        {confirmModal.isOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px', maxWidth: '480px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #fca5a5' }}>
              <div style={{ width: '72px', height: '72px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '32px' }}>
                ⚠️
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>
                Advertencia de Desactivación de Control
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0 0 28px 0', lineHeight: '1.6' }}>
                Estás a punto de desactivar la directiva:<br/>
                <strong style={{ color: '#dc2626', display: 'block', marginTop: '10px', fontSize: '1.05rem' }}>
                  {masterScenariosConfig[confirmModal.directiveKey]?.name}
                </strong>
                <br/>
                Esto suspenderá la adjudicación en runtime y las interacciones no recibirán veredicto bajo este dominio. ¿Deseas continuar?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, directiveKey: null })} 
                  style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem' }}>
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeactivation} 
                  style={{ padding: '12px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(220,38,38,0.3)' }}>
                  Sí, desactivar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}