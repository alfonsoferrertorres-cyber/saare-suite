import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';

const VAULTS = [
  {
    id: "01",
    name: "01. Escudo RGPD, Privacidad & Secreto Empresarial",
    lawBadge: "RGPD (Art. 5.2, 9, 32) · Ley 1/2019 de Secretos · EHDS",
    tagline: "Protección ex-ante de la información confidencial en el uso corporativo de IA.",
    desc: "Blindaje perimetral que detecta, aísla y redacta en memoria volátil RAM DNIs, cuentas bancarias (IBAN), nóminas, historiales médicos y secretos industriales con purga atómica SYS_madvise (Zero-Disk Writes) antes de salir a servidores externos.",
    benefit: "✔ Cero riesgo de multas de hasta 20 M€ (o 4% de facturación global) y blindaje directo para el órgano de administración.",
    image: "/1.jfif",
    color: "#0284c7",
    actionText: "Proteger Datos RGPD →"
  },
  {
    id: "02",
    name: "02. Blindaje de Robustez, Ciberseguridad & Mitigación L7",
    lawBadge: "EU AI Act (Art. 15) · NIS 2 · Cyber Resilience Act (CRA)",
    tagline: "Defensa activa contra manipulaciones adversarias y reducción de costes de inferencia.",
    desc: "Neutraliza ataques de Jailbreak, inyección de directivas (Prompt Injection) y desvíos lógicos mientras inyecta el testigo determinista [🧠 L7 CEREBRO WITNESS] y optimiza el pipeline reduciendo en un 98.4% el consumo innecesario de tokens.",
    benefit: "✔ Reducción del 98.4% en consumo de tokens con latencia ultrarrápida (<0.017 ms en memoria RAM).",
    image: "/3.jfif",
    color: "#16a34a",
    actionText: "Optimizar Costes & Seguridad →"
  },
  {
    id: "03",
    name: "03. Antifraude Deepfakes, Protección del Honor & Veracidad Fáctica",
    lawBadge: "Ley Orgánica del Honor 2026 · AI Act (Art. 13) · Data Act",
    tagline: "Prevención de responsabilidad por clonación sintética de voz/imagen y alucinaciones.",
    desc: "Inspección causal y bloqueo estricto (No-Unsupported-Claims) ante clonación no consentida de identidad bajo la Ley de 2026, mitigando cláusulas inventadas y falsedad documental mediante contrastación documental formal.",
    benefit: "✔ Prevención de indemnizaciones por daño moral no simbólicas y decisiones empresariales con certeza fáctica.",
    image: "/4.jfif",
    color: "#ea580c",
    actionText: "Verificar Certeza & Deepfakes →"
  },
  {
    id: "04",
    name: "04. Bóveda Pericial de Auditoría & Dictamen Normativo (DES)",
    lawBadge: "ISO/IEC 27037 · AI Act (Art. 12 Logs) · eIDAS · AI Liability",
    tagline: "Generación automática de prueba documental inmutable para procesos judiciales y auditorías.",
    desc: "Generación automatizada de expedientes de evidencia digital (Proof Bundles) bajo la norma ISO/IEC 27037:2012 con firma asimétrica Ed25519 y estampación temporal cualificada RFC 3161 con plena eficacia probatoria.",
    benefit: "✔ Prueba admisible ante tribunales de justicia, peritos judiciales, comisiones de auditoría y la AESIA.",
    image: "/2.jfif",
    color: "#9333ea",
    actionText: "Ver Certificado Pericial →"
  },
  {
    id: "05",
    name: "05. Trazabilidad Fiduciaria de Fondos Públicos & Subvenciones",
    lawBadge: "Ley General de Subvenciones · PRTR · NextGenEU / OLAF / IGAE",
    tagline: "Garantía de cobro íntegro y justificación de proyectos públicos sin requerimientos.",
    desc: "Supervisa la no duplicidad de facturas por hash SHA-256, acredita el cumplimiento medioambiental DNSH y redacta memorias técnicas listas para entregar a evaluadores públicos conforme a los criterios de la IGAE y OLAF.",
    benefit: "✔ Blindaje total en justificaciones CDTI, Kit Digital, Kit Consulting, ENISA y fondos NextGenerationEU.",
    image: "/5.jfif",
    color: "#ca8a04",
    actionText: "Asegurar Justificación de Ayudas →"
  }
];

const COMPLIANCE_GRID = [
  { title: "EU AI Act (2024/1689)", badge: "GOBERNANZA", desc: "Logs forenses (Art. 12), Transparencia (Art. 13) y Robustez técnica (Art. 15)." },
  { title: "Ley del Honor 2026", badge: "PROTECCIÓN CIVIL", desc: "Bloqueo de Deepfakes y uso no autorizado de identidades o voces sintéticas." },
  { title: "RGPD & LOPDGDD", badge: "PRIVACIDAD", desc: "Purga atómica en RAM (SYS_madvise) para datos de salud (Art. 9) y seguridad (Art. 32)." },
  { title: "NIS 2 & CRA (2024/2847)", badge: "CIBERRESILIENCIA", desc: "Seguridad por diseño en Capa 7 y reporte automatizado de incidentes graves." },
  { title: "DORA & Data Act", badge: "FINTECH & CLOUD", desc: "Control de proveedores TIC terceros y prevención de transferencias ilícitas." },
  { title: "ISO/IEC 27037 & eIDAS", badge: "EVIDENCIA DIGITAL", desc: "Custodia pericial DEFR/DES y estampación temporal cualificada RFC 3161." }
];

const PARTNER_MODELS = [
  {
    code: "IPaaS",
    title: "01. Agentes IA y Automatizaciones",
    desc: "Monetiza la seguridad en flujos de Make, n8n, LangChain o CrewAI. Garantiza que los datos confidenciales jamás se filtran a modelos externos.",
    badge: "MARGEN COMERCIAL HASTA 40%",
    valueProp: "Añade un módulo de Compliance Add-on y genera ingresos recurrentes sin coste de desarrollo.",
    color: "#06B6D4",
    image: "/101.jfif"
  },
  {
    code: "EMBEDDED",
    title: "02. Fabricantes de Software y EDR",
    desc: "Embebe el sensor nativo SAARE en tu plataforma o aplicación y ofrece a cuentas corporativas un escudo contra robo de propiedad intelectual.",
    badge: "LICENCIA OEM / ARR MULTIPLICADOR",
    valueProp: "Aumenta el ticket medio (ARPU) integrando el estándar de gobernanza exigido en licitaciones.",
    color: "#20C997",
    image: "/102.jfif"
  },
  {
    code: "GSI",
    title: "03. Consultoras y Despachos",
    desc: "Supervisa el uso de IA de decenas de clientes corporativos desde un único panel y emite dictámenes periciales en 1 solo clic.",
    badge: "PLAN PARTNER / FACTURACIÓN POR CLIENTE",
    valueProp: "Factura servicios de auditoría y dictamen pericial con respaldo registral oficial.",
    color: "#c084fc",
    image: "/103.jfif"
  },
  {
    code: "GATEWAY",
    title: "04. Plataformas Cloud y Tráfico Masivo",
    desc: "Detén ataques de Jailbreak, fraude y consumo abusivo de tokens antes de que impacten en la infraestructura del servidor central.",
    badge: "PAGO POR USO / ESCALABILIDAD TOTAL",
    valueProp: "Reduce un 98.4% de peticiones maliciosas ahorrando miles de euros en facturas de cómputo.",
    color: "#2F81F7",
    image: "/104.jfif"
  },
  {
    code: "VERTICAL",
    title: "05. Soluciones Sectoriales (Legal, Salud, Banca)",
    desc: "Activa el modo de máxima confidencialidad para procesar historiales clínicos, nóminas y contratos bancarios con cero fugas.",
    badge: "MODO PRIVACIDAD TOTAL / ALTA RETENCIÓN",
    valueProp: "El único argumento de venta que supera los comités de seguridad y DPOs más exigentes.",
    color: "#EAB308",
    image: "/105.jfif"
  }
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
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedBundle, setCopiedBundle] = useState(false);

  const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5174'
    : 'https://saare-console.pages.dev';

  const CANONICAL_HASH = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";
  const VERIFY_URL = `${API_BASE}/verify/${CANONICAL_HASH}`;

  const proofBundle = {
    "PROOF_BUNDLE_SCHEMA": "SAARE_PROOF_BUNDLE_V10.0_ENTERPRISE_LEGAL",
    "RESUMEN_EJECUTIVO": {
      "EXPEDIENTE_ID": "PB-2026-0829-7F82A1",
      "ESTADO_CUMPLIMIENTO": "100%_CONFORME_AUDITADO_EU_AI_ACT",
      "MARCO_REGULATORIO": "EU AI Act + Ley Honor 2026 + RGPD + NIS 2 + DORA + CRA + Data Act + EHDS",
      "GARANTIA_LEGAL": "Validez probatoria plena ante la AESIA, Inspecciones y Tribunales",
      "ANCLAJE_REGISTRAL": "Registro Oficial Safe Creative Nº 2607076315021",
      "REGISTRO_ADMINISTRACION_PUBLICA": "REGAGE26e00076675038 (Entrada Oficial AESIA)",
      "ENTORNO": "PRODUCCION_AISLADA_ZERO_FUGA"
    },
    "BLINDAJE_NORMATIVO_INTEGRAL": {
      "01_ESCUDO_RGPD_EHDS": "Filtro en memoria RAM que neutraliza salida de PII, salud y secretos corporativos sin persistencia en disco",
      "02_ROBUSTEZ_AI_ACT_CRA": "Mitigación determinista de prompt injection y robustez técnica con ahorro del 98.4% de tokens",
      "03_HONOR_DEEPFAKES_DATA_ACT": "Bloqueo de clonación no consentida de voz/imagen (Ley 2026) y control de alucinaciones",
      "04_CUSTODIA_PERICIAL_EIDAS": "Logs forenses bajo ISO/IEC 27037:2012 y sellado de tiempo cualificado RFC 3161 eIDAS",
      "05_TRAZABILIDAD_FONDOS": "Prevención de facturación duplicada y auditoría continua para PRTR y NextGenEU"
    },
    "SELLOS_Y_FIRMAS_LEGALES": {
      "INTEGRIDAD_DIGITAL": CANONICAL_HASH,
      "FIRMA_ASIMETRICA": "Ed25519_VALIDADA",
      "SELLO_DE_TIEMPO_OFICIAL": "RFC 3161 Cualificado eIDAS"
    }
  };

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(CANONICAL_HASH);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const copyBundleJson = () => {
    navigator.clipboard.writeText(JSON.stringify(proofBundle, null, 2));
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 2000);
  };

  const handleSubmit = async (e) => {
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
        setError(data.error || "No se pudo completar la autenticación.");
      }
    } catch {
      setError("Error de comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05070c', color: '#f1f5f9', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      {/* MODAL DEL CERTIFICADO REGISTRAL */}
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Diploma de Garantía Registral" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '14px 20px', background: '#090d16', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación Safe Creative Nº 2607076315021 · Entrada Oficial AESIA REGAGE26e00076675038</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(5, 7, 12, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('LANDING')}>
            <span style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '2px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#38bdf8', fontSize: '12px', borderLeft: '1px solid #334155', paddingLeft: '10px', fontWeight: '700' }}>Seguridad y Cumplimiento Normativo en IA</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {sessionUser ? (
              <>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                  Mi Panel
                </button>
                <button onClick={() => { localStorage.removeItem('saare_suite_user'); setSessionUser(null); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Salir</button>
              </>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '8px 18px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', boxShadow: '0 2px 10px rgba(2,132,199,0.3)' }}>
                Acceso Clientes
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VISTA 1: AUTENTICACIÓN */}
      {currentView === 'AUTH' && !sessionUser && (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '36px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#ffffff' }}>
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Corporativa'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' }}>Accede a tus certificados periciales y configuración en tiempo real.</p>
            {error && <div style={{ color: '#ef4444', fontSize: '12.5px', marginBottom: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>NOMBRE DE EMPRESA</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Tu Empresa S.L." style={{ width: '100%', padding: '11px 14px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>CORREO PROFESIONAL</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="direccion@empresa.com" style={{ width: '100%', padding: '11px 14px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>CONTRASEÑA</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '11px 14px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '13px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
                {loading ? 'Verificando...' : (mode === 'login' ? 'Entrar a mi Panel' : 'Activar Cuenta')}
              </button>
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ color: '#38bdf8', fontSize: '12.5px', cursor: 'pointer', fontWeight: '600' }}>
                  {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                </span>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* VISTA 2: PANEL DE CONTROL */}
      {currentView === 'STATUS' && sessionUser && (
        <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '5px 10px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: 'bold' }}>
                ● SUSCRIPCIÓN ACTIVA & PROTEGIDA
              </span>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>ENTRADA AESIA REGAGE26e00076675038</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Panel de Control SAARE</h1>
            <p style={{ color: '#94a3b8', fontSize: '14.5px', marginBottom: '28px' }}>Organización: <strong>{sessionUser.tenantName || 'Empresa Cliente'}</strong> · Cuenta: {sessionUser.email}</p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ padding: '12px 24px', backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}>
                Abrir Consola GRC ↗
              </a>
              <button onClick={() => setShowDiploma(true)} style={{ padding: '12px 24px', backgroundColor: '#1e293b', color: '#c084fc', border: '1px solid #9333ea', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                Ver Certificado Registral Oficial 📜
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VISTA PRINCIPAL: LANDING LINEAL Y COMPRENSIBLE */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1160px', margin: '30px auto 80px auto', padding: '0 20px' }}>

          {/* 1. HERO COMERCIAL DIRECTO */}
          <section style={{ textAlign: 'center', margin: '30px 0 60px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '8px 22px', borderRadius: '30px', fontSize: '13px', fontWeight: '900', border: '1px solid rgba(56, 189, 248, 0.35)', marginBottom: '22px' }}>
              <span>🛡️</span> CUMPLIMIENTO AUTOMATIZADO DEL REGLAMENTO EUROPEO DE IA (EU AI ACT) Y LEY DEL HONOR 2026
            </div>
            <h1 style={{ fontSize: '50px', fontWeight: '900', color: '#ffffff', margin: '0 0 18px 0', letterSpacing: '-1.5px', lineHeight: 1.15 }}>
              Usa la Inteligencia Artificial en tu empresa <br />
              <span style={{ color: '#38bdf8' }}>sin riesgo de multas ni fugas de datos.</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '840px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
              SAARE actúa como una pasarela técnica perimetral que neutraliza fugas de datos confidenciales en memoria RAM (<span style={{ color: '#34d399', fontWeight: 'bold' }}>&lt;0.017 ms</span>), bloquea deepfakes no consentidos y genera certificados periciales inmutables. <strong>Las 5 Bóvedas Normativas unificadas en una sola tarifa plana de 149 €/mes.</strong>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '16px 36px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '8px', fontWeight: '900', fontSize: '16px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(2,132,199,0.4)' }}>
                Activar Suscripción Todo en Uno (149 €/mes) ↗
              </a>
              <button onClick={() => setShowDiploma(true)} style={{ padding: '16px 32px', backgroundColor: '#1e293b', color: '#c084fc', border: '1.5px solid #9333ea', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                Ver Acreditación Oficial AESIA 📜
              </button>
            </div>
            <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#94a3b8' }}>
              ✔ Sin permanencia · Cancelación en 1 clic · Entrada Oficial AESIA: <strong>REGAGE26e00076675038</strong>
            </div>
          </section>

          {/* 2. PANEL DE MONITOREO Y TELEMETRÍA AUTOMATIZADA */}
          <section style={{ backgroundColor: '#090d16', border: '1.5px solid #1e293b', borderRadius: '18px', padding: '32px', marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 4px 0' }}>
                  ⚡ Motor de Cumplimiento Continuo L7 en Memoria RAM
                </h3>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Inspección determinista automatizada antes de la salida de datos a modelos externos.
                </span>
              </div>
              <span style={{ color: '#34d399', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', background: 'rgba(52,211,153,0.1)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.3)' }}>
                ● SENSOR ACTIVO EN RAM (0.017 ms)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#0284c7', fontSize: '11.5px', fontWeight: '800', marginBottom: '4px' }}>PURGA EN MEMORIA RAM</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>0.017 ms</div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>SYS_madvise Zero-Disk Writes</div>
              </div>
              <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#16a34a', fontSize: '11.5px', fontWeight: '800', marginBottom: '4px' }}>AHORRO COMPUTACIONAL</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>98.4% Tokens</div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Filtrado perimetral de redundancias</div>
              </div>
              <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#ea580c', fontSize: '11.5px', fontWeight: '800', marginBottom: '4px' }}>DEEPFAKES & HONOR</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>Bloqueo Ex-Ante</div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Ley Orgánica del Honor 2026</div>
              </div>
              <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#9333ea', fontSize: '11.5px', fontWeight: '800', marginBottom: '4px' }}>CUSTODIA PERICIAL</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>Firma eIDAS</div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>RFC 3161 & ISO/IEC 27037</div>
              </div>
            </div>
          </section>

          {/* 3. COMPARATIVA ANTES VS DESPUÉS */}
          <section style={{ backgroundColor: '#090d16', border: '1.5px solid #1e293b', borderRadius: '18px', padding: '36px', marginBottom: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ color: '#38bdf8', fontSize: '12.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                LA TRANQUILIDAD DE ESTAR PROTEGIDO
              </span>
              <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>
                ¿Qué ocurre en tu empresa con y sin SAARE?
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#05070c', padding: '24px', borderRadius: '12px', border: '1px solid #ef4444' }}>
                <h3 style={{ color: '#ef4444', fontWeight: '900', fontSize: '16px', margin: '0 0 12px 0' }}>❌ SIN SAARE (ALTO RIESGO)</h3>
                <ul style={{ paddingLeft: '18px', color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                  <li><strong>Fugas de datos:</strong> Empleados pegan contratos, DNIs y nóminas en ChatGPT sin control.</li>
                  <li><strong>Multas RGPD / AI Act:</strong> Responsabilidad legal directa para administradores y directivos.</li>
                  <li><strong>Demandas por Deepfakes:</strong> Clonación de voz e imagen sin consentimiento bajo la Ley de 2026.</li>
                  <li><strong>Facturas Cloud Desbocadas:</strong> Peticiones basura y lentitud en los flujos de trabajo.</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '24px', borderRadius: '12px', border: '2px solid #0284c7' }}>
                <h3 style={{ color: '#38bdf8', fontWeight: '900', fontSize: '16px', margin: '0 0 12px 0' }}>✔ CON SAARE (BLINDAJE TOTAL)</h3>
                <ul style={{ paddingLeft: '18px', color: '#f1f5f9', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                  <li><strong>Cero fugas en RAM:</strong> Anonimización atómica en milisegundos antes de salir a internet.</li>
                  <li><strong>Prueba pericial en 1 clic:</strong> Certificados sellados eIDAS válidos en juzgados e inspecciones.</li>
                  <li><strong>Bloqueo de Deepfakes:</strong> Cumplimiento estricto del derecho al honor y veracidad fáctica.</li>
                  <li><strong>Ahorro del 98.4%:</strong> Optimización determinista de tokens y latencia imperceptible (&lt;0.017 ms).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. LAS 5 BÓVEDAS NORMATIVAS (FOTOS 1 a 5) */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span style={{ color: '#34d399', fontSize: '12.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ARQUITECTURA DE LAS 5 BÓVEDAS
              </span>
              <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#ffffff', margin: '8px 0' }}>
                Las Cinco Bóvedas Normativas Incluidas
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>
                Un único sistema perimetral que automatiza el cumplimiento legal y la seguridad operativa de tu organización.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {VAULTS.map((vault) => (
                <div key={vault.id} style={{ backgroundColor: '#090d16', border: `1.5px solid ${vault.color}55`, borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '260px 1fr 240px', gap: '24px', alignItems: 'center', boxShadow: `0 10px 30px ${vault.color}15` }}>
                  
                  <div style={{ position: 'relative', width: '100%', height: '175px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '30px', height: '30px', borderRadius: '50%', background: vault.color, color: vault.id === '05' ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10 }}>
                      {vault.id}
                    </div>
                    <img src={vault.image} alt={vault.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>

                  <div>
                    <div style={{ display: 'inline-block', background: `${vault.color}22`, border: `1px solid ${vault.color}77`, color: vault.color, padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>
                      ⚖️ {vault.lawBadge}
                    </div>
                    <h3 style={{ fontSize: '21px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>{vault.name}</h3>
                    <h4 style={{ fontSize: '14.5px', color: '#38bdf8', fontWeight: '700', margin: '0 0 8px 0' }}>{vault.tagline}</h4>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.55, margin: '0 0 10px 0' }}>{vault.desc}</p>
                    <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '700' }}>{vault.benefit}</div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: vault.color, fontWeight: '800', textTransform: 'uppercase' }}>ESTADO DE PROTECCIÓN</div>
                    <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>Incluido al 100% en tu tarifa plana.</div>
                    <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ width: '100%', padding: '11px', backgroundColor: vault.color, color: vault.id === '05' ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '13px', textDecoration: 'none', boxSizing: 'border-box' }}>
                      {vault.actionText}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. MALLA REGULATORIA COMPLETA */}
          <section style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '18px', padding: '36px', marginBottom: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ color: '#38bdf8', fontSize: '12.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                MARCO JURÍDICO Y REGULATORIO 2026
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>
                Todas las Leyes y Estándares que SAARE te ayuda a Cumplir
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {COMPLIANCE_GRID.map((item, idx) => (
                <div key={idx} style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 'bold' }}>{item.badge}</span>
                  <h4 style={{ color: '#fff', fontSize: '15px', margin: '6px 0 4px 0', fontWeight: '800' }}>{item.title}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: 0, lineHeight: 1.45 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. MODELOS COMERCIALES B2B (FOTOS 101 a 105) */}
          <section style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '18px', padding: '36px', marginBottom: '60px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ color: '#c084fc', fontSize: '12.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                OPCIONES DE ALIANZA Y RENTABILIDAD B2B
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
                Cinco Vías para Rentabilizar SAARE en tu Negocio
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '780px', margin: '0 auto' }}>
                Integra la capa de seguridad en tus servicios, obtén márgenes recurrentes y cierra contratos corporativos.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {PARTNER_MODELS.map((dep) => (
                <div key={dep.code} style={{ background: '#05070c', padding: '22px', borderRadius: '16px', border: `1.5px solid ${dep.color}55`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1e293b', marginBottom: '16px', background: '#090d16' }}>
                      <img src={dep.image} alt={dep.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(5,7,12,0.92)', padding: '4px 10px', borderRadius: '6px', border: `1.5px solid ${dep.color}`, color: dep.color, fontSize: '10.5px', fontWeight: '900' }}>
                        {dep.badge}
                      </div>
                    </div>
                    <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '17px', fontWeight: '900' }}>{dep.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 12px 0', lineHeight: 1.5 }}>{dep.desc}</p>
                    <div style={{ background: `${dep.color}15`, borderLeft: `3px solid ${dep.color}`, padding: '10px 12px', borderRadius: '4px', color: '#fff', fontSize: '12.5px', fontWeight: '700' }}>
                      💰 {dep.valueProp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. CERTIFICADO DIGITAL INMUTABLE (PROOF BUNDLE JSON) */}
          <section style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '18px', padding: '36px', marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '0 0 4px 0' }}>
                  Certificado Digital de Evidencia (Proof Bundle)
                </h3>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  El documento pericial inmutable estructurado bajo ISO/IEC 27037:2012 para aportación directa a juicio.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={copyHashToClipboard} style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  {copiedHash ? '✔ Huella Copiada' : 'Copiar Huella Digital'}
                </button>
                <button onClick={copyBundleJson} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  {copiedBundle ? '✔ Copiado' : 'Copiar JSON'}
                </button>
              </div>
            </div>
            <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '18px', color: '#34d399', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
              {JSON.stringify(proofBundle, null, 2)}
            </pre>
          </section>

          {/* 8. OFERTA COMERCIAL Y PRECIO */}
          <section style={{ backgroundColor: '#090d16', border: '2px solid #0284c7', borderRadius: '18px', padding: '40px 30px', textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: '#34d399', fontSize: '13px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
              TARIFA PLANA ALL-IN-ONE
            </span>
            <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#fff', margin: '10px 0 6px 0' }}>
              Todas las Bóvedas por 149 €/mes
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '680px', margin: '0 auto 26px auto' }}>
              Sin costes ocultos. Sin contratar herramientas por separado que suman más de 1.200 €/mes. Acceso completo a la consola GRC, sensor en memoria RAM y generación ilimitada de certificados eIDAS.
            </p>
            <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '8px', fontWeight: '900', fontSize: '16px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(2,132,199,0.4)' }}>
              Comenzar Ahora con SAARE (149 €/mes) ↗
            </a>
            <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#64748b' }}>
              Garantía de cumplimiento oficial · Registro AESIA Nº REGAGE26e00076675038
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ borderTop: '1px solid #1e293b', paddingTop: '32px', fontSize: '12.5px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#fff' }}>SAARE</strong> · Capa de Seguridad y Evidencia para Inteligencia Artificial
                <div style={{ marginTop: '4px' }}>Acreditación Registral Safe Creative Nº 2607076315021 · Entrada Oficial AESIA REGAGE26e00076675038</div>
              </div>
              <div style={{ display: 'flex', gap: '18px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Verificar Certificado</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Consola GRC</a>
                <a href="mailto:enterprise.audit@saare.es" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contacto Comercial</a>
              </div>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}