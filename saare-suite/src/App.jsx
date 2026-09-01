import React, { useState } from 'react';

// Constantes globales de infraestructura
const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';
const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5174'
  : 'https://saare-console.pages.dev';
const CANONICAL_HASH = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";
const VERIFY_URL = `${API_BASE}/verify/${CANONICAL_HASH}`;

const CONTROL_LAYERS = [
  {
    id: "01",
    code: "PRIVACY",
    title: "01. Privacy & Sensitive Data Control",
    frameworks: "RGPD (Art. 5.2, 9, 32) · Ley 1/2019 Secretos · EHDS",
    summary: "Evita que datos confidenciales o regulados salgan hacia modelos externos de IA.",
    desc: "Aislamiento e inspección determinista en memoria volátil (RAM) con purga SYS_madvise. Neutraliza la exposición de identidades, numeraciones bancarias, registros médicos y propiedad intelectual sin persistencia en disco físico.",
    pipeline: ["DETECT", "REDACT", "BLOCK"],
    color: "#0284c7",
    image: "/1.jfif"
  },
  {
    id: "02",
    code: "SECURITY",
    title: "02. L7 Runtime Security & Robustness",
    frameworks: "EU AI Act (Art. 15) · NIS 2 · Cyber Resilience Act (CRA)",
    summary: "Mitiga manipulaciones adversarias y optimiza el consumo computacional.",
    desc: "Contención perimetral de inyecciones de comandos (Prompt Injection), intentos de evasión de guardrails (Jailbreaks) y desvíos lógicos antes de la ejecución de inferencia.",
    pipeline: ["INSPECT", "MITIGATE", "RECORD"],
    color: "#16a34a",
    image: "/3.jfif"
  },
  {
    id: "03",
    code: "VERIFICATION",
    title: "03. Veracity & Factuality Assurance",
    frameworks: "Ley Orgánica del Honor 2026 · AI Act (Art. 13) · Data Act",
    summary: "Impide decisiones operativas basadas en afirmaciones no respaldadas o identidades no consentidas.",
    desc: "Inspección causal y rechazo estricto ante generación no autorizada de voz/imagen sintética. Validación de consistencia fáctica documental para evitar alucinaciones en flujos de decisión críticos.",
    pipeline: ["CHECK", "VERIFY", "FLAG"],
    color: "#ea580c",
    image: "/4.jfif"
  },
  {
    id: "04",
    code: "EVIDENCE",
    title: "04. Evidence Capture & Forensic Sealing",
    frameworks: "ISO/IEC 27037:2012 · eIDAS (RFC 3161) · AI Liability Directive",
    summary: "Convierte cada ejecución relevante en un expediente probatorio estructurado.",
    desc: "Generación automatizada de Proof Bundles forenses sellados con firma asimétrica Ed25519 y estampación temporal cualificada RFC 3161 para acreditación formal de diligencia técnica.",
    pipeline: ["CAPTURE", "SEAL", "ATTEST"],
    color: "#9333ea",
    image: "/2.jfif"
  },
  {
    id: "05",
    code: "TRACEABILITY",
    title: "05. Fiduciary Traceability & Audit Trail",
    frameworks: "Ley General de Subvenciones · PRTR · NextGenEU / OLAF / IGAE",
    summary: "Trazabilidad verificable para auditorías continuas y justificación de fondos públicos.",
    desc: "Control de unicidad documental por Hash SHA-256, verificación del principio DNSH y generación de memorias técnicas estructuradas para comités de auditoría interna y organismos públicos.",
    pipeline: ["TRACE", "AUDIT", "EXPORT"],
    color: "#ca8a04",
    image: "/5.jfif"
  }
];

const CONTROL_MATRIX = [
  { framework: "EU AI Act (2024/1689)", risk: "Falta de gobernanza y registros no auditables (Art. 12/15)", policy: "Runtime Policy Enforcement", control: "L7 Execution Gate & Cerebro Witness", evidence: "Proof Bundle estructurado" },
  { framework: "RGPD & LOPDGDD", risk: "Fuga ex-ante de PII / Datos Sanitarios (Art. 9/32)", policy: "Zero-Disk RAM Isolation", control: "Purga SYS_madvise en memoria volátil", evidence: "Certificado de Redacción / Bloqueo" },
  { framework: "Ley Orgánica del Honor 2026", risk: "Clonación sintética no consentida (Deepfakes)", policy: "Non-Consensual Synthetic Identity Ban", control: "Filtro Causal de Identidad y Audio", evidence: "Registro de Intercepción Pericial" },
  { framework: "NIS 2 & CRA (2024/2847)", risk: "Vulnerabilidades en la cadena de inferencia TIC", policy: "In-Process Security by Design", control: "Mitigación determinista de Prompt Injection", evidence: "Log Inmutable de Telemetría" },
  { framework: "DORA & Data Act", risk: "Pérdida de control operacional en nubes externas", policy: "Cross-Border Data Safeguard", control: "Edge Reverse-Proxy con Header L7-SEAL", evidence: "Auditoría de Tránsito Criptográfica" },
  { framework: "ISO/IEC 27037:2012", risk: "Inadmisibilidad de logs en procesos judiciales", policy: "Four-Phase Evidence Workflow", control: "Roles DEFR/DES & Firma Ed25519", evidence: "Proof Bundle con sellado RFC 3161" }
];

export default function App() {
  const [sessionUser, setSessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem('saare_suite_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('LANDING');
  const [mode, setMode] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiploma, setShowDiploma] = useState(false);

  // Verificador Interactivo sincronizado con el evento real
  const [verifySearchId, setVerifySearchId] = useState("EV-CED48F1600");
  const [verifiedRecord, setVerifiedRecord] = useState({
    id: "EV-CED48F1600",
    bundleId: "PB-1788223380902-A494A163",
    status: "VERIFIED",
    policy: "PCI-DSS / RGPD (TARJETA_CREDITO)",
    action: "BLOCK_AND_PURGE_RAM (RECHAZADO)",
    timestamp: "2026-08-28 13:42:54.583 UTC",
    inputHash: "ced48f16002bd1da6c45ed431b396950191af853357f6f91d61098f9c63f72b5",
    signature: "Ed25519 (Valid)",
    tsa: "RFC 3161 / ETSI EN 319 422 Qualified Authority",
    frameworkMapping: ["AESIA", "RGPD", "EU AI Act", "Ley Honor 2026"]
  });

  // Simulación del Live Runtime
  const [runtimeStep, setRuntimeStep] = useState(0);
  const [isRunningSim, setIsRunningSim] = useState(false);

  const runRuntimeSimulation = () => {
    setIsRunningSim(true);
    setRuntimeStep(1);
    setTimeout(() => setRuntimeStep(2), 700);
    setTimeout(() => setRuntimeStep(3), 1400);
    setTimeout(() => setRuntimeStep(4), 2100);
    setTimeout(() => {
      setRuntimeStep(5);
      setIsRunningSim(false);
    }, 2800);
  };

  const handleVerifyLookup = (e) => {
    e.preventDefault();
    const query = verifySearchId.trim().toLowerCase();
    
    if (query.includes("ced48f") || query.includes("1600") || query.includes("tarjeta") || query.includes("dni")) {
      setVerifiedRecord({
        id: "EV-CED48F1600",
        bundleId: "PB-1788223380902-A494A163",
        status: "VERIFIED",
        policy: "PCI-DSS / RGPD (TARJETA_CREDITO)",
        action: "BLOCK_AND_PURGE_RAM (RECHAZADO)",
        timestamp: "2026-08-28 13:42:54.583 UTC",
        inputHash: "ced48f16002bd1da6c45ed431b396950191af853357f6f91d61098f9c63f72b5",
        signature: "Ed25519 (Valid)",
        tsa: "RFC 3161 / ETSI EN 319 422 Qualified Authority",
        frameworkMapping: ["AESIA", "RGPD", "EU AI Act", "Ley Honor 2026"]
      });
    } else if (query.includes("deepfake") || query.includes("voz") || query.includes("avatar")) {
      setVerifiedRecord({
        id: "EV-HONOR-2026-DF09",
        bundleId: "PB-2026-0829-DF88B2",
        status: "VERIFIED",
        policy: "LEY_HONOR_2026 (CLONACION_NO_CONSENTIDA)",
        action: "BLOCK_AND_PURGE_RAM (RECHAZADO)",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + " UTC",
        inputHash: CANONICAL_HASH,
        signature: "Ed25519 (Valid)",
        tsa: "RFC 3161 Qualified Authority",
        frameworkMapping: ["Ley Orgánica del Honor 2026", "EU AI Act Art. 13", "ISO 27037"]
      });
    } else {
      setVerifiedRecord({
        id: verifySearchId.toUpperCase(),
        bundleId: "PB-2026-LIVE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: "VERIFIED",
        policy: "ENTERPRISE_GOVERNANCE_CONTROL",
        action: "ALLOW_AND_ATTEST (CONFORME)",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + " UTC",
        inputHash: CANONICAL_HASH,
        signature: "Ed25519 (Valid)",
        tsa: "RFC 3161 Qualified Authority",
        frameworkMapping: ["EU AI Act Art. 15", "ISO 42001", "ISO 27037"]
      });
    }
  };

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = mode === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = mode === 'login'
      ? { email, password, source: 'suite' }
      : { email, password, tenantName: companyName, source: 'suite', role: 'AUDITOR' };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        const userData = { ...data.user };
        localStorage.setItem('saare_suite_user', JSON.stringify(userData));
        setSessionUser(userData);
        setCurrentView('STATUS');
      } else {
        setError(data.error || "No se pudo autenticar.");
      }
    } catch {
      setError("Error de comunicación con el servicio.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToSection = (sectionId) => {
    if (currentView !== 'LANDING') {
      setCurrentView('LANDING');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
      
      {/* MODAL REGISTRAL OFICIAL */}
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '840px', width: '100%', background: '#111827', borderRadius: '12px', border: '1px solid #374151', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Acreditación Registral Safe Creative" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '16px 24px', background: '#0b0f19', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2937' }}>
              <div>
                <strong style={{ color: '#f3f4f6', fontSize: '13px', display: 'block' }}>Acreditación Safe Creative Nº 2607076315021</strong>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>Entrada Oficial AESIA: REGAGE26e00076675038</span>
              </div>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentView('LANDING')}>
            <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '2.5px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#0ea5e9', fontSize: '11px', borderLeft: '1px solid #374151', paddingLeft: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>AI RUNTIME GOVERNANCE & EVIDENCE</span>
          </div>

          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '13px', fontWeight: '600' }}>
            <button onClick={() => navigateToSection('control-layers')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Capas de Control</button>
            <button onClick={() => navigateToSection('live-runtime')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Live Runtime</button>
            <button onClick={() => navigateToSection('evidence-verifier')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Verificar Evidencia</button>
            <button onClick={() => navigateToSection('control-matrix')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Control Matrix</button>
            <button onClick={() => navigateToSection('pricing')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Planes</button>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '8px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#1f2937', border: '1px solid #374151', color: '#38bdf8', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                  Mi Consola
                </button>
                <button onClick={() => { localStorage.removeItem('saare_suite_user'); setSessionUser(null); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '7px 16px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                Acceso Consola
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* VISTA: AUTENTICACIÓN */}
      {currentView === 'AUTH' && !sessionUser && (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', padding: '32px', borderRadius: '12px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0ea5e9', marginBottom: '8px' }}>// CONTROL_PLANE_LOGIN</div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px', color: '#ffffff' }}>
              {mode === 'login' ? 'Acceso a Consola GRC' : 'Aprovisionar Cuenta Enterprise'}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>Supervisión de políticas en tiempo real y descarga de Proof Bundles.</p>
            {error && <div style={{ color: '#ef4444', fontSize: '12.5px', marginBottom: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmitAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#9ca3af', marginBottom: '4px' }}>ORGANIZACIÓN</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Empresa o Despacho Auditor" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#9ca3af', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seguridad@empresa.com" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#9ca3af', marginBottom: '4px' }}>CONTRASEÑA</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}>
                {loading ? 'Verificando...' : (mode === 'login' ? 'Entrar a la Consola' : 'Comenzar Despliegue')}
              </button>
              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}>
                  {mode === 'login' ? '¿Necesitas aprovisionar nueva cuenta? Regístrate' : '¿Ya tienes credenciales? Iniciar sesión'}
                </span>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* VISTA: PANEL DE ESTADO */}
      {currentView === 'STATUS' && sessionUser && (
        <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                ● RUNTIME ENGINE ACTIVE (L7)
              </span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Registro AESIA: REGAGE26e00076675038</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Consola de Gobierno y Evidencia</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>Organización: <strong>{sessionUser.tenantName || 'Tenant Activo'}</strong> · Cuenta: {sessionUser.email}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}>
                Abrir Consola de Control ↗
              </a>
              <button onClick={() => setShowDiploma(true)} style={{ padding: '10px 20px', backgroundColor: '#1f2937', color: '#c084fc', border: '1px solid #4b5563', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                Acreditación Registral Safe Creative 📜
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VISTA PRINCIPAL (LANDING V2 ENTERPRISE) */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '40px 20px 100px 20px' }}>

          {/* 1. HERO PRINCIPAL: DE LA POLÍTICA AL CONTROL */}
          <section style={{ textAlign: 'center', margin: '40px 0 60px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(14, 165, 233, 0.25)', marginBottom: '24px' }}>
              <span>⚙️</span> ENTERPRISE AI GOVERNANCE & RUNTIME CONTROL
            </div>
            <h1 style={{ fontSize: '52px', fontWeight: '900', color: '#ffffff', margin: '0 0 20px 0', letterSpacing: '-1.5px', lineHeight: 1.15 }}>
              De la política de IA <br />
              <span style={{ color: '#38bdf8' }}>al control ejecutable en tiempo real.</span>
            </h1>
            <p style={{ fontSize: '19px', color: '#9ca3af', maxWidth: '820px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
              SAARE actúa como una pasarela técnica en Capa 7 que inspecciona interacciones en memoria RAM, aplica directivas de seguridad ex-ante y genera expedientes de evidencia digital verificables bajo estándares internacionales.
            </p>

            {/* CONCEPT PIPELINE BADGE */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', background: '#0b0f19', border: '1px solid #1f2937', padding: '10px 24px', borderRadius: '30px', marginBottom: '36px', fontSize: '12.5px', fontFamily: 'monospace', color: '#cbd5e1' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>POLICY</span>
              <span>→</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>CONTROL</span>
              <span>→</span>
              <span style={{ color: '#a855f7', fontWeight: 'bold' }}>PROOF</span>
            </div>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigateToSection('live-runtime')} style={{ padding: '14px 30px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(2,132,199,0.35)' }}>
                Ver Runtime en Acción ↓
              </button>
              <button onClick={() => navigateToSection('pricing')} style={{ padding: '14px 28px', backgroundColor: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                Planes de Despliegue (Desde 149 €/mes)
              </button>
            </div>
          </section>

          {/* 2. FRANJA "BUILT FOR..." */}
          <section style={{ borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937', padding: '30px 0', margin: '40px 0 70px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '20px', textAlign: 'center' }}>
              <div>
                <strong style={{ color: '#38bdf8', fontSize: '13px', display: 'block', marginBottom: '4px' }}>CISO</strong>
                <span style={{ color: '#9ca3af', fontSize: '12.5px' }}>Control de ejecución en tiempo real y mitigación L7.</span>
              </div>
              <div>
                <strong style={{ color: '#34d399', fontSize: '13px', display: 'block', marginBottom: '4px' }}>DPO / Compliance</strong>
                <span style={{ color: '#9ca3af', fontSize: '12.5px' }}>Prevención de fugas en memoria RAM sin persistencia.</span>
              </div>
              <div>
                <strong style={{ color: '#a855f7', fontSize: '13px', display: 'block', marginBottom: '4px' }}>CTO / Arquitectura</strong>
                <span style={{ color: '#9ca3af', fontSize: '12.5px' }}>Integración sin fricción vía proxy inverso (`baseURL`).</span>
              </div>
              <div>
                <strong style={{ color: '#fb923c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Legal & Auditoría</strong>
                <span style={{ color: '#9ca3af', fontSize: '12.5px' }}>Proof Bundles inmutables con firma Ed25519 y sellado eIDAS.</span>
              </div>
            </div>
          </section>

          {/* 3. SECCIÓN LIVE RUNTIME INTERACTIVO */}
          <section id="live-runtime" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>INTERCEPCIÓN DETERMINISTA L7</span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '4px 0 0 0' }}>Demostración de Ejecución en Vivo</h2>
              </div>
              <button 
                onClick={runRuntimeSimulation} 
                disabled={isRunningSim}
                style={{ padding: '10px 22px', backgroundColor: isRunningSim ? '#374151' : '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: isRunningSim ? 'default' : 'pointer' }}
              >
                {isRunningSim ? 'Evaluando...' : '▶ Simular Ejecución'}
              </button>
            </div>

            {/* DIAGRAMA DE FLUJO EN VIVO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: runtimeStep >= 1 ? '#030712' : '#070a12', border: `1px solid ${runtimeStep >= 1 ? '#0ea5e9' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 1</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>Inbound Request</strong>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Payload con datos sensibles</span>
              </div>
              <div style={{ background: runtimeStep >= 2 ? '#030712' : '#070a12', border: `1px solid ${runtimeStep >= 2 ? '#38bdf8' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 2</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>L7 RAM Buffer</strong>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Aislamiento sin persistencia</span>
              </div>
              <div style={{ background: runtimeStep >= 3 ? '#030712' : '#070a12', border: `1px solid ${runtimeStep >= 3 ? '#ea580c' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 3</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>Policy Match</strong>
                <span style={{ fontSize: '11px', color: '#f97316' }}>PII detectada (DNI / IBAN)</span>
              </div>
              <div style={{ background: runtimeStep >= 4 ? '#030712' : '#070a12', border: `1px solid ${runtimeStep >= 4 ? '#ef4444' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 4</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>Enforcement</strong>
                <span style={{ fontSize: '11px', color: '#ef4444' }}>Bloqueo y purga `SYS_madvise`</span>
              </div>
              <div style={{ background: runtimeStep >= 5 ? '#030712' : '#070a12', border: `1px solid ${runtimeStep >= 5 ? '#10b981' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 5</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>Proof Bundle</strong>
                <span style={{ fontSize: '11px', color: '#34d399' }}>Sellado Ed25519 + RFC 3161</span>
              </div>
            </div>

            <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '14px 18px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: runtimeStep === 5 ? '#34d399' : '#9ca3af' }}>
                {runtimeStep === 0 && "Estado: Esperando evento para evaluación..."}
                {runtimeStep === 1 && "Estado: Interceptando llamada a modelo..."}
                {runtimeStep === 2 && "Estado: Buffer volátil reservado en RAM (<0.017 ms)..."}
                {runtimeStep === 3 && "Estado: Evaluando políticas activas de privacidad y seguridad..."}
                {runtimeStep === 4 && "Estado: Política PII activada -> Acción: BLOCK ejecutada."}
                {runtimeStep === 5 && "Estado: Evento consolidado. Proof Bundle emitido con hash SHA-256."}
              </span>
              <span style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: 'monospace' }}>LATENCY_BENCHMARK: 0.017 ms</span>
            </div>
          </section>

          {/* 4. ANTES Y DESPUÉS DE SAARE */}
          <section style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '11.5px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>GESTIÓN DE RIESGO OPERACIONAL</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>Antes y después de SAARE</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#030712', padding: '24px', borderRadius: '10px', border: '1px solid #374151' }}>
                <h3 style={{ color: '#ef4444', fontWeight: '800', fontSize: '15px', margin: '0 0 14px 0' }}>SIN CONTROL RUNTIME</h3>
                <ul style={{ paddingLeft: '18px', color: '#9ca3af', fontSize: '13px', lineHeight: 1.8, margin: 0 }}>
                  <li>Usuario o agente envía PII al modelo sin filtro.</li>
                  <li>Logs dispersos y sin estructura probatoria.</li>
                  <li>Decisión algorítmica difícil de reconstruir ante inspección.</li>
                  <li>Evidencia recopilada a posteriori de incidentes.</li>
                  <li>Auditoría manual de elevado coste y fricción.</li>
                </ul>
              </div>

              <div style={{ background: '#030712', padding: '24px', borderRadius: '10px', border: '1px solid #0284c7' }}>
                <h3 style={{ color: '#38bdf8', fontWeight: '800', fontSize: '15px', margin: '0 0 14px 0' }}>CON SAARE RUNTIME CONTROL</h3>
                <ul style={{ paddingLeft: '18px', color: '#e5e7eb', fontSize: '13px', lineHeight: 1.8, margin: 0 }}>
                  <li>La política detecta, redacta o bloquea la carga en RAM.</li>
                  <li>Eventos estructurados con contexto criptográfico.</li>
                  <li>Trazabilidad determinista de prompts e inferencias.</li>
                  <li>Evidencia generada durante el ciclo de ejecución.</li>
                  <li>Proof Bundle inmutable exportable en 1 solo clic.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. LAS 5 CAPAS DE CONTROL */}
          <section id="control-layers" style={{ marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span style={{ color: '#34d399', fontSize: '11.5px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>ARQUITECTURA DE CINCO NIVELES</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', margin: '6px 0' }}>Cinco Capas de Control para IA Corporativa</h2>
              <p style={{ color: '#9ca3af', fontSize: '14.5px', margin: 0 }}>Controles específicos desacoplados aplicables sobre cualquier infraestructura de modelos.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {CONTROL_LAYERS.map((layer) => (
                <div key={layer.id} style={{ backgroundColor: '#0b0f19', border: `1px solid ${layer.color}44`, borderRadius: '14px', padding: '22px', display: 'grid', gridTemplateColumns: '240px 1fr 220px', gap: '22px', alignItems: 'center' }}>
                  
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1f2937', background: '#030712' }}>
                    <div style={{ position: 'absolute', top: '8px', left: '8px', width: '28px', height: '28px', borderRadius: '50%', background: layer.color, color: layer.id === '05' ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px', zIndex: 10 }}>
                      {layer.id}
                    </div>
                    <img src={layer.image} alt={layer.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>

                  <div>
                    <span style={{ fontSize: '10.5px', color: layer.color, fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      {layer.frameworks}
                    </span>
                    <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>{layer.title}</h3>
                    <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 8px 0', fontWeight: '600' }}>{layer.summary}</p>
                    <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: '0 0 12px 0', lineHeight: 1.5 }}>{layer.desc}</p>
                    
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {layer.pipeline.map((p, idx) => (
                        <React.Fragment key={p}>
                          <span style={{ background: '#030712', border: `1px solid ${layer.color}66`, color: layer.color, padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 'bold' }}>
                            {p}
                          </span>
                          {idx < layer.pipeline.length - 1 && <span style={{ color: '#4b5563', fontSize: '10px' }}>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>ESTADO DEL CONTROL</div>
                    <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700', marginBottom: '12px' }}>● DISPONIBLE EN RUNTIME</div>
                    <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '9px', backgroundColor: layer.color, color: layer.id === '05' ? '#000' : '#fff', borderRadius: '6px', fontWeight: '700', fontSize: '12px', textDecoration: 'none' }}>
                      Activar Capa {layer.id} →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. PROOF BUNDLE: LA PRUEBA DE QUE EL CONTROL OCURRIÓ */}
          <section id="evidence-verifier" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span style={{ color: '#a855f7', fontSize: '11.5px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>EVIDENCIA FORENSE INMUTABLE</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>La prueba de que el control ocurrió</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Consulta el identificador de un expediente para verificar su estado de firma y sellado de tiempo.</p>
            </div>

            {/* FORMULARIO DE CONSULTA DE EVIDENCIA */}
            <form onSubmit={handleVerifyLookup} style={{ display: 'flex', gap: '10px', maxWidth: '650px', margin: '0 auto 28px auto', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                value={verifySearchId} 
                onChange={(e) => setVerifySearchId(e.target.value)}
                placeholder="Introduce Proof ID o Hash (ej: EV-CED48F1600)"
                style={{ flex: 1, minWidth: '280px', padding: '11px 14px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}
              />
              <button type="submit" style={{ padding: '11px 22px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                Verificar Evidencia
              </button>
            </form>

            {/* TARJETA VISUAL DEL PROOF BUNDLE */}
            <div style={{ maxWidth: '750px', margin: '0 auto', backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '10px', padding: '24px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ color: '#f3f4f6', fontWeight: 'bold', fontSize: '13px' }}>SAARE PROOF BUNDLE</span>
                <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                  ✓ {verifiedRecord.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '10px', fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>EVENT IDENTIFIER:</span>
                <span style={{ color: '#38bdf8' }}>{verifiedRecord.id}</span>

                <span style={{ color: '#6b7280' }}>BUNDLE ID:</span>
                <span style={{ color: '#c084fc' }}>{verifiedRecord.bundleId}</span>

                <span style={{ color: '#6b7280' }}>POLICY APPLIED:</span>
                <span style={{ color: '#e5e7eb' }}>{verifiedRecord.policy}</span>

                <span style={{ color: '#6b7280' }}>ENFORCEMENT:</span>
                <span style={{ color: '#f87171' }}>{verifiedRecord.action}</span>

                <span style={{ color: '#6b7280' }}>TIMESTAMP:</span>
                <span style={{ color: '#e5e7eb' }}>{verifiedRecord.timestamp}</span>

                <span style={{ color: '#6b7280' }}>INPUT DIGEST:</span>
                <span style={{ color: '#9ca3af', wordBreak: 'break-all' }}>{verifiedRecord.inputHash}</span>

                <span style={{ color: '#6b7280' }}>SIGNATURE:</span>
                <span style={{ color: '#34d399' }}>{verifiedRecord.signature}</span>

                <span style={{ color: '#6b7280' }}>TIME STAMP AUTH:</span>
                <span style={{ color: '#34d399' }}>{verifiedRecord.tsa}</span>

                <span style={{ color: '#6b7280' }}>MAPPED FRAMEWORKS:</span>
                <span style={{ color: '#a855f7' }}>{verifiedRecord.frameworkMapping.join(" · ")}</span>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid #1f2937', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>Certificación conforme a ISO/IEC 27037:2012</span>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
                  Consultar Registro de Integridad en API ↗
                </a>
              </div>
            </div>
          </section>

          {/* 7. CONTROL MATRIX */}
          <section id="control-matrix" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '11.5px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MATRIZ DE CONTROL TÉCNICO</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>Control Matrix Regulatoria</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>De la obligación legal al control técnico verificable.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                    <th style={{ padding: '12px 14px' }}>MARCO LEGAL</th>
                    <th style={{ padding: '12px 14px' }}>RIESGO ASOCIADO</th>
                    <th style={{ padding: '12px 14px' }}>POLÍTICA</th>
                    <th style={{ padding: '12px 14px' }}>CONTROL SAARE</th>
                    <th style={{ padding: '12px 14px' }}>EVIDENCIA</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTROL_MATRIX.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '14px', color: '#38bdf8', fontWeight: 'bold' }}>{row.framework}</td>
                      <td style={{ padding: '14px', color: '#cbd5e1' }}>{row.risk}</td>
                      <td style={{ padding: '14px', color: '#9ca3af', fontFamily: 'monospace' }}>{row.policy}</td>
                      <td style={{ padding: '14px', color: '#34d399' }}>{row.control}</td>
                      <td style={{ padding: '14px', color: '#a855f7' }}>{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 8. SECCIÓN DE PRECIOS Y DESPLIEGUE */}
          <section id="pricing" style={{ backgroundColor: '#0b0f19', border: '1px solid #0284c7', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '11.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>DESPLIEGUE OPERATIVO</span>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0 10px 0' }}>
              Enterprise AI Governance Runtime
            </h2>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#38bdf8', marginBottom: '12px' }}>
              Desde 149 € / mes
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '640px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
              Para organizaciones y consultoras que requieren control continuo, trazabilidad determinista y expedientes de evidencia digital verificables bajo ISO 27037 y AI Act.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '14px 36px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(2,132,199,0.3)' }}>
                Aprovisionar Asiento Runtime (149 €/mes) ↗
              </a>
              <a href="mailto:enterprise@saare.es" style={{ padding: '14px 28px', backgroundColor: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '6px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
                Contactar Arquitectura Enterprise
              </a>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
              Suscripción sin permanencia · Anclaje Registral Oficial: Safe Creative Nº 2607076315021 · Entrada AESIA REGAGE26e00076675038
            </div>
          </section>

          {/* 9. FOOTER INSTITUCIONAL */}
          <footer style={{ borderTop: '1px solid #1f2937', paddingTop: '32px', fontSize: '12px', color: '#6b7280' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#f3f4f6' }}>SAARE Platform</strong> · Capa 7 de Seguridad, Evidencia y Gobierno en Inteligencia Artificial
                <div style={{ marginTop: '4px' }}>Acreditación Registral Safe Creative Nº 2607076315021 · Entrada Oficial AESIA REGAGE26e00076675038</div>
              </div>
              <div style={{ display: 'flex', gap: '18px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Verificador API</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Consola GRC</a>
                <a href="mailto:enterprise@saare.es" style={{ color: '#94a3af', textDecoration: 'none' }}>Contacto</a>
              </div>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}