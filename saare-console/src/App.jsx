import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const API_BASE = import.meta.env.VITE_API_BASE || "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://saare.es";
const HEADER_BANNER_SRC = "/Cabecera%20saare-console.jfif";

// Resolución de sesión vinculada a la Bóveda KL
function resolveInitialUser() {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const tokenParam = urlParams.get('token');
  const emailParam = urlParams.get('email') || urlParams.get('user');
  const tenantParam = urlParams.get('tenant');

  // Si entra con parámetros de sesión válidos por URL
  if (tokenParam && emailParam) {
    const fromUrlUser = {
      email: emailParam,
      tenantName: tenantParam ? tenantParam : emailParam.split('@')[0].toUpperCase(),
      tenantId: `tenant_${emailParam.replace(/[^a-zA-Z0-9]/g, '_')}`,
      apiKey: tokenParam,
      role: urlParams.get('role') ? urlParams.get('role') : 'CISO / Global Admin',
      licenseType: 'ENTERPRISE_EXECUTION_RUNTIME',
      klVaultStatus: 'SECURED_EPHEMERAL_LINKED'
    };
    localStorage.setItem('saare_user', JSON.stringify(fromUrlUser));
    localStorage.setItem('saare_suite_user', JSON.stringify(fromUrlUser));
    localStorage.setItem('saare_vault_session', JSON.stringify(fromUrlUser));
    window.history.replaceState({}, document.title, window.location.pathname);
    return fromUrlUser;
  }

  // Si ya tiene sesión activa guardada en la Bóveda KL
  const vaultSaved = localStorage.getItem('saare_vault_session') || localStorage.getItem('saare_suite_user') || localStorage.getItem('saare_user');

  if (vaultSaved) {
    try {
      const parsed = JSON.parse(vaultSaved);
      if (parsed?.email && parsed?.apiKey) {
        localStorage.setItem('saare_user', JSON.stringify(parsed));
        return parsed;
      }
    } catch {}
  }

  return null;
}

export default function App() {
  const [sessionUser, setSessionUser] = useState(resolveInitialUser);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [activeTab, setActiveTab] = useState('RUNLIVE'); // CONFIG, RUNLIVE, GLOBAL
  const [events, setEvents] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(true);
  const [selectedJson, setSelectedJson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingBundle, setExportingBundle] = useState(false);
  const [downloadingAgentZip, setDownloadingAgentZip] = useState(false);

  const [kvStatus, setKvStatus] = useState({
    online: true,
    latencyMs: 35,
    lastSync: new Date().toLocaleTimeString()
  });

  const [activeWitnessFilter, setActiveWitnessFilter] = useState('TODOS');

  // Catálogo canónico de directivas SGP 1.0
  const masterDirectives = {
    cumplimiento_corporativo_integral: {
      tag: "PRIVACIDAD ES",
      title: "ESPAÑA - LOPDGDD & AEPD",
      desc: "Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII en memoria RAM.",
      effectColor: "#ef4444",
      effectText: "El DNI/IBAN se redacta o bloquea antes de que la petición salga hacia el LLM."
    },
    razonamiento_activo_l7: {
      tag: "CIBERSEGURIDAD",
      title: "TOP L7: JAILBREAK & PROMPT INJECTION GUARD",
      desc: "Mitigación de ataques adversarios, modo DAN y anulación de directivas.",
      effectColor: "#0284c7",
      effectText: "Corta la conexión al socket L7 si el prompt intenta saltarse las restricciones del modelo."
    },
    deepfake_fake_disprover: {
      tag: "TRAZABILIDAD",
      title: "FACT-CHECKING FORENSE & NO-UNSUPPORTED CLAIMS",
      desc: "Sellado criptográfico SHA-256 / Ed25519 y rechazo de alucinaciones sin respaldo causal.",
      effectColor: "#ef4444",
      effectText: "Si la inferencia no coincide con el corpus pericial, emite un dictamen RECHAZADO."
    },
    subvenciones_requisitos_infranqueables: {
      tag: "FINOPS IT",
      title: "OPTIMIZADOR DE TOKENS & COSTGUARD",
      desc: "Sanitización de espacios en blanco y compresión contextual reduciendo consumo de tokens (20-35%).",
      effectColor: "#0284c7",
      effectText: "Comprime el contexto en RAM ahorrando costes de API por cada consulta."
    },
    banca_dora_pci: {
      tag: "BANCA / DORA",
      title: "BANCA & FINTECH: DORA CAPA 7 & PCI-DSS",
      desc: "Aislamiento de cuentas corrientes, tarjetas y atestación de purga RAM (SYS_madvise) con Zero-Disk Writes.",
      effectColor: "#f59e0b",
      effectText: "Garantiza no persistencia de datos crediticios o bancarios en almacenamiento físico."
    },
    sanidad_historia_clinica: {
      tag: "SALUD LOPD",
      title: "SANIDAD: RESGUARDO DE HISTORIAS CLÍNICAS",
      desc: "Anonimización y bloqueo de diagnósticos médicos y recetas bajo el amparo de RGPD Art. 9.",
      effectColor: "#8b5cf6",
      effectText: "Impide la transmisión de historiales clínicos sin procesar a nubes de IA públicas."
    },
    auditoria_dictamen_normativo: {
      tag: "GSI / PERITAJE",
      title: "AUDITORÍA & DICTAMEN PERICIAL SGP 1.0",
      desc: "Cadena de custodia RFC 3161 y anclaje probatorio fiduciario de veredictos emitidos.",
      effectColor: "#10b981",
      effectText: "Genera el Proof Bundle firmado con Ed25519 e integrable en informes periciales."
    },
    orquestacion_workflows_guard: {
      tag: "ORQUESTADORES / WORKFLOWS",
      title: "ORQUESTACIÓN & TOOL GATEWAY L7",
      desc: "Inspección de Tool Calling, Execution Permits con Single-Use JTI y anti-repetición.",
      effectColor: "#06b6d4",
      effectText: "Emite token de autorización de un solo uso antes de permitir el dispatch del nodo."
    }
  };

  const [directivesState, setDirectivesState] = useState({
    cumplimiento_corporativo_integral: true,
    razonamiento_activo_l7: true,
    deepfake_fake_disprover: true,
    subvenciones_requisitos_infranqueables: true,
    banca_dora_pci: true,
    sanidad_historia_clinica: true,
    auditoria_dictamen_normativo: true,
    orquestacion_workflows_guard: true
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, directiveKey: null });
  const [syncingKv, setSyncingKv] = useState(false);

  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState({ label: '', pattern: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  const totalDirectivesCount = Object.keys(masterDirectives).length;
  const activeDirectivesCount = Object.keys(masterDirectives).filter(k => directivesState[k] === true).length;
  const disabledDirectivesCount = totalDirectivesCount - activeDirectivesCount;

  const persistSettingsToKV = async (newState) => {
    if (!sessionUser?.email) return;
    setSyncingKv(true);
    try {
      await fetch(`${API_BASE}/settings?user=${encodeURIComponent(sessionUser.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newState })
      });
      setKvStatus(prev => ({ ...prev, lastSync: new Date().toLocaleTimeString() }));
    } catch (err) {
      console.error("Fallo al sincronizar directivas", err);
    } finally {
      setSyncingKv(false);
    }
  };

  const fetchTelemetryAndVerifyKV = async () => {
    if (!sessionUser?.email) return;
    const startTime = performance.now();
    try {
      const activeEmail = sessionUser.email;
      const [resRuns, resRules, resSettings] = await Promise.all([
        fetch(`${API_BASE}/runs?user=${encodeURIComponent(activeEmail)}`).catch(() => null),
        fetch(`${API_BASE}/custom-rules?user=${encodeURIComponent(activeEmail)}`).catch(() => null),
        fetch(`${API_BASE}/settings?user=${encodeURIComponent(activeEmail)}`).catch(() => null)
      ]);

      const elapsed = Math.round(performance.now() - startTime);

      if (resSettings && resSettings.ok) {
        const settingsData = await resSettings.json();
        if (settingsData.settings && !syncingKv) {
          setDirectivesState(prev => ({ ...prev, ...settingsData.settings }));
        }
      }

      if (resRuns && resRuns.ok) {
        const dataRuns = await resRuns.json();
        const runsList = Array.isArray(dataRuns) ? dataRuns : (dataRuns.events ? dataRuns.events : (dataRuns.logs ? dataRuns.logs : []));
        runsList.sort((a, b) => new Date(b.issuedAt ? b.issuedAt : (b.timestamp ? b.timestamp : 0)) - new Date(a.issuedAt ? a.issuedAt : (a.timestamp ? a.timestamp : 0)));
        setEvents(runsList);
        if (runsList.length > 0) setLastEvent(runsList[0]);
        setConnected(true);
      }

      if (resRules && resRules.ok) {
        const dataRules = await resRules.json();
        if (Array.isArray(dataRules)) setCustomRules(dataRules);
      }

      setKvStatus({ online: true, latencyMs: elapsed ? elapsed : 35, lastSync: new Date().toLocaleTimeString() });
    } catch {
      setConnected(false);
      setKvStatus(prev => ({ ...prev, online: false }));
    }
  };

  useEffect(() => {
    if (sessionUser?.email) {
      fetchTelemetryAndVerifyKV();
      const interval = setInterval(fetchTelemetryAndVerifyKV, 3500);
      return () => clearInterval(interval);
    }
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
        const loggedUser = {
          email: data.user?.email ? data.user.email : emailInput,
          tenantName: data.user?.tenantName ? data.user.tenantName : (emailInput.split('@')[0].toUpperCase()),
          tenantId: data.user?.tenantId ? data.user.tenantId : `tenant_${emailInput.replace(/[^a-zA-Z0-9]/g, '_')}`,
          apiKey: data.token ? data.token : (data.user?.apiKey ? data.user.apiKey : "sk_saare_live_session_token"),
          role: data.user?.role ? data.user.role : "CISO / Global Admin",
          licenseType: data.user?.licenseType ? data.user.licenseType : "ENTERPRISE_EXECUTION_RUNTIME",
          klVaultStatus: "SECURED_EPHEMERAL_LINKED"
        };
        localStorage.setItem('saare_user', JSON.stringify(loggedUser));
        localStorage.setItem('saare_suite_user', JSON.stringify(loggedUser));
        localStorage.setItem('saare_vault_session', JSON.stringify(loggedUser));
        setSessionUser(loggedUser);
      } else {
        setLoginError(data.error ? data.error : "Credenciales incorrectas en la Bóveda KL.");
      }
    } catch {
      setLoginError("Error de comunicación con la Bóveda KL.");
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
  };

  const handleToggleDirective = (key) => {
    if (directivesState[key]) {
      setConfirmModal({ isOpen: true, directiveKey: key });
    } else {
      const updated = { ...directivesState, [key]: true };
      setDirectivesState(updated);
      persistSettingsToKV(updated);
    }
  };

  const confirmDeactivation = () => {
    if (confirmModal.directiveKey) {
      const updated = { ...directivesState, [confirmModal.directiveKey]: false };
      setDirectivesState(updated);
      persistSettingsToKV(updated);
    }
    setConfirmModal({ isOpen: false, directiveKey: null });
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
      a.download = `proof-bundle-${eventLog.verdictId ? eventLog.verdictId : (eventLog.evidence_id ? eventLog.evidence_id : 'EV')}.json`;
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

  // DESCARGA DINÁMICA DE 6 ELEMENTOS: Vincula directamente el bootstrap token en storage_managed.json
  const handleDownloadTokenizedExtension = async () => {
    try {
      if (!sessionUser?.email || !sessionUser?.apiKey) {
        alert("Debes iniciar sesión para generar tu extensión tokenizada.");
        return;
      }

      setDownloadingAgentZip(true);
      const response = await fetch('/saare-extension.zip');
      if (!response.ok) throw new Error("No se pudo cargar el archivo base /saare-extension.zip.");

      const zipArrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(zipArrayBuffer);

      // Inyección en storage_managed.json con los datos de la Bóveda KL
      const managedStorageConfig = {
        saare_bootstrap_token: { Value: sessionUser.apiKey },
        saare_tenant_domain: { Value: sessionUser.tenantName },
        saare_user_email: { Value: sessionUser.email },
        saare_license_type: { Value: sessionUser.licenseType ? sessionUser.licenseType : "ENTERPRISE_EXECUTION_RUNTIME" },
        governance_protocol: { Value: "SGP_1.0" },
        enforcement_mode: { Value: "FAIL_CLOSED" },
        boveda_kl_status: { Value: "ENFORCED" },
        endpoint: { Value: API_BASE }
      };

      zip.file("storage_managed.json", JSON.stringify(managedStorageConfig, null, 2));

      // Limpiar archivos redundantes para preservar exactamente la estructura limpia de 6 archivos
      zip.remove("popup.html");
      zip.remove("popup.js");
      zip.remove("saare_token.json");
      zip.remove("saare_config.json");
      zip.remove("icons");

      const blob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(blob);
      const fileSlug = sessionUser.tenantName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      dl.download = `saare-extension-${fileSlug}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      URL.revokeObjectURL(dl.href);
    } catch (err) {
      alert("Error al descargar la extensión: " + err.message);
    } finally {
      setDownloadingAgentZip(false);
    }
  };

  const witnesses = [
    { key: "TODOS", label: `TODOS (${events.length})`, count: events.length },
    { key: "PRIVACIDAD ES", label: "PRIVACIDAD ES", status: "ACTIVO" },
    { key: "CIBERSEGURIDAD", label: "CIBERSEGURIDAD", status: "ACTIVO" },
    { key: "TRAZABILIDAD", label: "TRAZABILIDAD", status: "ACTIVO" },
    { key: "FINOPS IT", label: "FINOPS IT", status: "ACTIVO" },
    { key: "BANCA / DORA", label: "Banca / DORA", status: "VALID" },
    { key: "ORQUESTADORES / WORKFLOWS", label: "Orquestadores / Workflows", status: "VALID" },
    { key: "EDR C-ABI", label: "EDR C-ABI", status: "VALID" },
    { key: "GSI / PERITAJE", label: "GSI / Peritaje", status: "VALID" },
    { key: "SALUD LOPD", label: "Salud LOPD", status: "VALID" }
  ];

  const filteredEvents = events.filter(ev => {
    const scenario = ev.policy?.id ? ev.policy.id : '';
    const matchesWitness = activeWitnessFilter === 'TODOS' || scenario.toLowerCase().includes(activeWitnessFilter.toLowerCase());
    const matchesSearch = !searchQuery || JSON.stringify(ev).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWitness && matchesSearch;
  });

  if (!sessionUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '400px', width: '100%', background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', textAlign: 'center', margin: '0 0 16px 0' }}>SAARE GRC Console</h1>
          <div style={{ fontSize: '11px', textAlign: 'center', color: '#64748b', marginBottom: '16px', fontWeight: 'bold' }}>
            ACCESO PROTEGIDO · BÓVEDA KL SGP 1.0
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Email Corporativo" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            {loginError && <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center' }}>{loginError}</div>}
            <button type="submit" disabled={loadingLogin} style={{ padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loadingLogin ? 'Validando en Bóveda KL...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#64748b', fontFamily: 'Arial, sans-serif', paddingBottom: '40px' }}>
      
      {/* 1. Cabecera institucional */}
      <div style={{ width: '100%', background: '#eae4d9', borderBottom: '2px solid #cbd5e1', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img 
          src={HEADER_BANNER_SRC} 
          alt="Tecnología de IA Segura y Certificada" 
          style={{ width: '100%', maxWidth: '1320px', height: 'auto', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      <div style={{ maxWidth: '1280px', margin: '16px auto 0 auto', padding: '0 16px' }}>
        
        {/* 2. Barra de control superior con la sesión real y Bóveda KL */}
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px 24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
          
          <div style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.2px', marginBottom: '4px' }}>
            PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA V2.5
          </div>
          
          <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 'bold', marginBottom: '16px' }}>
            ORGANIZACIÓN: <span style={{ color: '#0f172a' }}>{sessionUser.tenantName}</span> | USUARIO: <span style={{ color: '#0284c7' }}>{sessionUser.email}</span> | DIRECTIVAS: <span style={{ color: '#16a34a' }}>{activeDirectivesCount} ACTIVAS</span> | <span style={{ color: '#ef4444' }}>-{disabledDirectivesCount} DESHABILITADAS</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Badge Bóveda KL / KV Vault */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', color: '#475569', background: '#f8fafc' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }}></span>
                <span>BÓVEDA KL: <strong style={{ color: '#16a34a' }}>EN VIVO ({kvStatus.latencyMs} ms)</strong></span>
                <span style={{ color: '#94a3b8' }}>| {kvStatus.lastSync}</span>
              </div>

              {/* Hook Activo */}
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1.5px solid #16a34a', color: '#16a34a', borderRadius: '6px', padding: '6px 14px', fontSize: '11.5px', fontWeight: '900', cursor: 'default' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                L7 HOOK ACTIVO
              </button>

              {/* Botón Salir */}
              <button onClick={handleLogout} style={{ background: '#ffffff', border: '1.5px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '6px 18px', fontSize: '11.5px', fontWeight: '900', cursor: 'pointer' }}>
                SALIR
              </button>
            </div>

            {/* Descarga de Extensión Tokenizada */}
            <div>
              <button
                onClick={handleDownloadTokenizedExtension}
                disabled={downloadingAgentZip}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: '900',
                  cursor: downloadingAgentZip ? 'wait' : 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <span>⬇</span>
                <span>{downloadingAgentZip ? 'GENERANDO EXTENSIÓN...' : 'DESCARGAR EXTENSIÓN TOKENIZADA (.ZIP)'}</span>
              </button>
            </div>
          </div>

          {/* Testigos L7 */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#475569', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
              TESTIGOS L7 EN TIEMPO REAL:
            </span>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {witnesses.map((wit) => {
                const isSelected = activeWitnessFilter === wit.key;
                return (
                  <button
                    key={wit.key}
                    onClick={() => setActiveWitnessFilter(wit.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: isSelected ? '#0284c7' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{wit.label}</span>
                    {wit.status && (
                      <span style={{ color: isSelected ? '#bae6fd' : '#16a34a', fontSize: '10px' }}>{wit.status}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3. Pestañas de Navegación */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab('GLOBAL')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'GLOBAL' ? '#0284c7' : '#ffffff',
              color: activeTab === 'GLOBAL' ? '#ffffff' : '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            REGISTRO GLOBAL ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('RUNLIVE')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff',
              color: activeTab === 'RUNLIVE' ? '#ffffff' : '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            S.A.A.R.E. (RUNLIVE)
          </button>
          <button
            onClick={() => setActiveTab('CONFIG')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'CONFIG' ? '#0284c7' : '#ffffff',
              color: activeTab === 'CONFIG' ? '#ffffff' : '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            CONFIGURACIÓN ({activeDirectivesCount} ACTIVAS)
          </button>
        </div>

        {/* TAB: CONFIGURACIÓN */}
        {activeTab === 'CONFIG' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                  CONFIGURADOR DE SINTAXIS Y FILTROS PERSONALIZADOS
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '900', fontSize: '11.5px', cursor: 'pointer' }}
                >
                  + AÑADIR BLOQUEO
                </button>
              </div>
              <p style={{ margin: '0 0 14px 0', fontSize: '11.5px', color: '#64748b' }}>
                Define palabras clave corporativas o expresiones regulares complementarias para el perímetro L7.
              </p>

              {customRules.length === 0 ? (
                <div style={{ padding: '16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#64748b', fontSize: '11.5px' }}>
                  No hay filtros personalizados activos. Las directivas base seleccionadas abajo se mantienen en ejecución.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {customRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11.5px' }}>
                        <strong style={{ color: '#0f172a', marginRight: '10px' }}>{rule.label}</strong>
                        <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>{rule.pattern}</code>
                      </div>
                      <button onClick={() => removeCustomRule(idx)} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #ef4444', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10.5px', cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '16px' }}>
              {Object.entries(masterDirectives).map(([key, scn]) => {
                const isEnabled = directivesState[key] === true;
                return (
                  <div
                    key={key}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10.5px', fontWeight: '900', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {scn.tag}
                        </span>
                        <span style={{
                          border: `1.5px solid ${isEnabled ? '#16a34a' : '#ef4444'}`,
                          color: isEnabled ? '#16a34a' : '#ef4444',
                          padding: '2px 10px',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          fontWeight: '900'
                        }}>
                          {isEnabled ? 'HABILITADA' : 'DESHABILITADA'}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                        {scn.title}
                      </h4>

                      <p style={{ margin: '0 0 14px 0', fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                        {scn.desc}
                      </p>

                      <div style={{ background: '#f8fafc', borderLeft: `3px solid ${scn.effectColor ? scn.effectColor : '#ef4444'}`, padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', color: '#0f172a', lineHeight: 1.35, display: 'block' }}>
                          <strong>Efecto en LLM:</strong> {scn.effectText}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDirective(key)}
                      disabled={syncingKv}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: isEnabled ? '#16a34a' : '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '900',
                        fontSize: '12px',
                        cursor: syncingKv ? 'wait' : 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
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

        {/* TAB: RUNLIVE */}
        {activeTab === 'RUNLIVE' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>
                  TELEMETRÍA & EVALUACIÓN EN TIEMPO DE EJECUCIÓN (SAARE JUDGE)
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  Decisiones deterministas en Capa 7 emitidas bajo el estándar SGP 1.0.
                </span>
              </div>
              <span style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold' }}>
                ● SAARE JUDGE ACTIVO
              </span>
            </div>

            {lastEvent ? (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11.5px', marginBottom: '12px' }}>
                  <div>VERDICT ID: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{lastEvent.verdictId ? lastEvent.verdictId : (lastEvent.evidence_id ? lastEvent.evidence_id : 'EV-ACT')}</strong></div>
                  <div>DECISIÓN: <strong style={{ color: (lastEvent.decision === 'DENY' || lastEvent.decision === 'BLOCK') ? '#ef4444' : '#16a34a' }}>{lastEvent.decision ? lastEvent.decision : 'ALLOW'}</strong></div>
                  <div>ENFORCEMENT: <strong style={{ color: '#d97706' }}>{lastEvent.enforcement?.action ? lastEvent.enforcement.action : 'PASS'}</strong></div>
                  <div>FECHA: <strong>{new Date(lastEvent.issuedAt ? lastEvent.issuedAt : (lastEvent.timestamp ? lastEvent.timestamp : Date.now())).toLocaleTimeString()}</strong></div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px', borderLeft: `3px solid ${(lastEvent.decision === 'DENY' || lastEvent.decision === 'BLOCK') ? '#ef4444' : '#16a34a'}`, marginBottom: '12px', fontSize: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>ACCIONES EVALUADAS:</div>
                  "{lastEvent.promptInput ? lastEvent.promptInput : (lastEvent.cleanPrompt ? lastEvent.cleanPrompt : (lastEvent.payload ? lastEvent.payload : 'Acción registrada'))}"
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <button onClick={() => handleExportProofBundle(lastEvent)} disabled={exportingBundle} style={{ padding: '8px 14px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                    📦 {exportingBundle ? 'Exportando...' : 'Descargar Proof Bundle (RFC 3161)'}
                  </button>
                </div>

                <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto', margin: 0 }}>
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

        {/* TAB: REGISTRO GLOBAL */}
        {activeTab === 'GLOBAL' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>
                HISTORIAL DE VEREDICTOS Y ACCIONES AUDITADAS ({filteredEvents.length})
              </h3>
              <input 
                type="text" 
                placeholder="Buscar en el registro..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11.5px', width: '240px' }} 
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11.5px' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '10px 14px' }}>FECHA</th>
                    <th style={{ padding: '10px 14px' }}>VERDICT ID</th>
                    <th style={{ padding: '10px 14px' }}>POLÍTICA</th>
                    <th style={{ padding: '10px 14px' }}>ACCIONES</th>
                    <th style={{ padding: '10px 14px' }}>DECISIÓN</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>EXPEDIENTE</th>
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
                      const id = ev.verdictId ? ev.verdictId : (ev.evidence_id ? ev.evidence_id : `VRD-${i + 1}`);
                      const isDenied = ev.decision === 'DENY' || ev.decision === 'BLOCK';
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {new Date(ev.issuedAt ? ev.issuedAt : (ev.timestamp ? ev.timestamp : Date.now())).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#0284c7', fontFamily: 'monospace' }}>{id}</td>
                          <td style={{ padding: '10px 14px' }}>{ev.policy?.id ? ev.policy.id : 'POL-CORP-GOVERNANCE-01'}</td>
                          <td style={{ padding: '10px 14px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{ev.promptInput ? ev.promptInput : (ev.cleanPrompt ? ev.cleanPrompt : (ev.payload ? ev.payload : 'Acción evaluada'))}"
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 'bold', color: isDenied ? '#ef4444' : '#16a34a' }}>
                            {ev.decision ? ev.decision : 'ALLOW'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <button onClick={() => setSelectedJson(ev)} style={{ padding: '4px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
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

      {/* Modal JSON */}
      {selectedJson && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedJson(null)}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', maxWidth: '680px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>SAARE VERDICT™ CANONICAL RECORD</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleExportProofBundle(selectedJson)} disabled={exportingBundle} style={{ background: '#9333ea', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                  📦 Exportar Proof Bundle
                </button>
                <button onClick={() => setSelectedJson(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>✕</button>
              </div>
            </div>
            <pre style={{ flex: 1, overflowY: 'auto', background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', margin: 0 }}>
              {JSON.stringify(selectedJson, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Modal Añadir Bloqueo */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Añadir Filtro Personalizado</h3>
            <input type="text" placeholder="Identificador (ej: SECRETO_EMPRESARIAL)" value={newRule.label} onChange={(e) => setNewRule({...newRule, label: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '12px' }} />
            <input type="text" placeholder="Patrón Regex (ej: /confidencial/i)" value={newRule.pattern} onChange={(e) => setNewRule({...newRule, pattern: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '12px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Cancelar</button>
              <button onClick={addCustomRule} style={{ padding: '8px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Advertencia de Desactivación */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', border: '1px solid #ef4444', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#b91c1c' }}>
              Advertencia de Desactivación
            </h3>
            <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Estás a punto de suspender la directiva:<br />
              <strong style={{ color: '#0f172a', display: 'block', marginTop: '4px' }}>
                {masterDirectives[confirmModal.directiveKey]?.title}
              </strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setConfirmModal({ isOpen: false, directiveKey: null })} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Cancelar</button>
              <button onClick={confirmDeactivation} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Sí, desactivar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}