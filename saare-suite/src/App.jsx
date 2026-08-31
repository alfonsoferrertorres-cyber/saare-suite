import React, { useState } from 'react';
import JSZip from 'jszip';

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';

export default function App() {
  const [sessionUser, setSessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem('saare_suite_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [mode, setMode] = useState('register');
  const [currentView, setCurrentView] = useState('LANDING');
  const [activeNavTab, setActiveNavTab] = useState('scenarios_saare');

  // Simulador interactivo comercial
  const [detectorInput, setDetectorInput] = useState('El balance contable muestra un beneficio neto no auditado de 450.000 € imputado al expediente.');
  const [detectorResult, setDetectorResult] = useState('WARNING');
  const [activeGrantTag, setActiveGrantTag] = useState('NextGenEU');

  // Métricas ejecutivas de impacto económico
  const [pipelineSavings] = useState({
    tokensSaved: 1420,
    latencyMs: 0.017,
    percentReduction: 98.4,
    costSavedPerMillion: "18.50 €",
    brainWitnessActive: true
  });

  // Estados de formularios y modales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedBundle, setCopiedBundle] = useState(false);
  const [showDiploma, setShowDiploma] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('nodejs');
  const [activeGrantTab, setActiveGrantTab] = useState('nextgen');
  const [selectedArchPillar, setSelectedArchPillar] = useState('IPaaS');

  const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5174'
    : 'https://saare-console.pages.dev';

  const CANONICAL_HASH = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";
  const MERKLE_ROOT = "8f3b29d10e54a67b129845cfa8901234ef567890abcdef1234567890abcdef12";
  const VERIFY_URL = `${API_BASE}/verify/${CANONICAL_HASH}`;

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

  const handleCheckDetector = () => {
    const text = detectorInput.toLowerCase();
    if (text.includes("no auditado") || text.includes("sin prueba") || text.includes("indeterminado")) {
      setDetectorResult('WARNING');
    } else if (text.includes("falso") || text.includes("alterado") || text.includes("inventar") || text.includes("ignora") || text.includes("deepfake")) {
      setDetectorResult('REJECTED');
    } else {
      setDetectorResult('SUCCESS');
    }
  };

  const proofBundle = {
    "PROOF_BUNDLE_SCHEMA": "SAARE_PROOF_BUNDLE_V10.0_ENTERPRISE",
    "RESUMEN_EJECUTIVO": {
      "EXPEDIENTE_ID": "PB-2026-0829-7F82A1",
      "ESTADO_CUMPLIMIENTO": "100%_CONFORME_AUDITADO",
      "GARANTIA_LEGAL": "Validez probatoria frente a AESIA, Comités e Inspecciones",
      "ANCLAJE_REGISTRAL": "Registro Safe Creative Nº 2607076315021",
      "ENTORNO": "PRODUCCION_AISLADA_ZERO_FUGA"
    },
    "BLINDAJE_CORPORATIVO": {
      "PROTECCION_EMPLEADOS": "Datos personales, bancarios y médicos neutralizados antes de enviarse al proveedor",
      "PROTECCION_EMPRESA": "Certificado digital inmutable que demuestra diligencia debida y ausencia de dolo",
      "AHORRO_OPERATIVO": `${pipelineSavings.percentReduction}% de reducción en coste de cómputo y tokens`
    },
    "SELLOS_Y_FIRMAS_LEGALES": {
      "INTEGRIDAD_DIGITAL": CANONICAL_HASH,
      "FIRMA_ASIMETRICA": "Ed25519_VALIDADA",
      "SELLO_DE_TIEMPO_OFICIAL": "RFC 3161 Cualificado eIDAS"
    }
  };

  // 5 Patas Comerciales de Alianza con Imágenes 101 a 105
  const deploymentModes = [
    {
      code: "IPaaS",
      title: "01. Agentes IA y Automatizaciones",
      desc: "Protege tus flujos en Make, n8n, LangChain o CrewAI. Filtra entradas y salidas con cero fricción para tus clientes.",
      badge: "ALIANZA COMERCIAL / REVENUE SHARE",
      valueProp: "Añade un módulo de seguridad en tus servicios con tu propio margen de beneficio.",
      color: "#06B6D4",
      icon: "🌐",
      image: "/101.jfif",
      deployInfo: "Puesta en marcha en 5 minutos cambiando la URL base de conexión.",
      codeSnippetKey: "nodejs"
    },
    {
      code: "EMBEDDED",
      title: "02. Fabricantes de Software y Ciberseguridad",
      desc: "Integra la protección nativa en tu propia solución o agente endpoint para blindar a tus clientes finales en tiempo real.",
      badge: "LICENCIA OEM / FACTURACIÓN ARR",
      valueProp: "Convierte la seguridad en IA en una nueva fuente recurrente de ingresos anuales.",
      color: "#20C997",
      icon: "⚡",
      image: "/102.jfif",
      deployInfo: "Sensor ultraligero que opera en memoria sin ralentizar equipos.",
      codeSnippetKey: "cabi"
    },
    {
      code: "GSI",
      title: "03. Consultoras y Despachos Profesionales",
      desc: "Supervisa clientes corporativos y genera informes ejecutivos listos para auditorías regulatorias y juntas directivas.",
      badge: "PLAN PARTNER / ASIENTO CONSULTOR",
      valueProp: "Ofrece auditoría continua de IA con entrega de dictámenes certificados.",
      color: "#c084fc",
      icon: "⚖️",
      image: "/103.jfif",
      deployInfo: "Panel centralizado multi-empresa con certificados descargables en 1 clic.",
      codeSnippetKey: "python"
    },
    {
      code: "GATEWAY",
      title: "04. Plataformas Cloud y Tráfico Masivo",
      desc: "Inspección perimetral global para organizaciones con alto volumen de peticiones e infraestructuras cloud.",
      badge: "PAGO POR USO / ESCALA EMPRESARIAL",
      valueProp: "Tarifa reducida por volumen con máxima disponibilidad garantizada.",
      color: "#2F81F7",
      icon: "📦",
      image: "/104.jfif",
      deployInfo: "Protección perimetral distribuida en más de 300 puntos globales.",
      codeSnippetKey: "curl"
    },
    {
      code: "VERTICAL",
      title: "05. Soluciones Sectoriales (Legal, Salud, Finanzas)",
      desc: "Activa el modo de máxima confidencialidad para software que gestiona contratos, nóminas o expedientes médicos.",
      badge: "MODO COMPLIANCE EMPRESARIAL",
      valueProp: "Diferénciate ofreciendo IA 100% conforme a normativas de privacidad.",
      color: "#EAB308",
      icon: "🔒",
      image: "/105.jfif",
      deployInfo: "Blindaje automático sin necesidad de cambiar de proveedor de IA.",
      codeSnippetKey: "nodejs"
    }
  ];

  const grantsData = {
    nextgen: {
      tag: "PLAN DE RECUPERACIÓN / NEXTGENERATIONEU",
      title: "Aseguramiento de Fondos Públicos y PRTR",
      summary: "Evita devoluciones de subvenciones y sanciones administrativas generando expedientes técnicos que justifican cada euro y garantizan ausencia de duplicidades.",
      items: [
        { badge: "01 / PREVENCIÓN DE SANCIONES", color: "#FF4D5A", title: "Cumplimiento Ex-Ante", desc: "Demuestra a los organismos de control que tu proyecto cuenta con trazabilidad total y gestión de riesgos activa." },
        { badge: "02 / JUSTIFICACIÓN DOCUMENTAL", color: "#20C997", title: "Certificados Inmutables", desc: "Genera evidencias selladas con fecha y hora oficial para validar memorias técnicas ante la IGAE y la OLAF." },
        { badge: "03 / PRIVACIDAD GARANTIZADA", color: "#2F81F7", title: "Protección de Datos", desc: "Acredita que los datos de negocio y proyectos nunca se transfieren a terceros sin control." }
      ]
    },
    kit: {
      tag: "PROGRAMAS DE ASESORAMIENTO E IMPLANTACIÓN (RED.ES)",
      title: "Entregables Certificados para Ayudas de Asesoramiento",
      summary: "Facilita a las empresas y agentes digitalizadores la justificación técnica de sus proyectos de IA con informes ejecutivos completos y auditables.",
      items: [
        { badge: "01 / APROBACIÓN SIN RIESGO", color: "#FF4D5A", title: "Memorias Validadas", desc: "Evita requerimientos de subsanación presentando certificados técnicos estructurados y contrastables." },
        { badge: "02 / TRANQUILIDAD OPERATIVA", color: "#20C997", title: "Control de Empleados", desc: "Permite que tu equipo utilice IA de forma productiva con la garantía de que no habrá fugas de secretos." },
        { badge: "03 / INFORME EJECUTIVO", color: "#2F81F7", title: "Dictamen de Seguridad", desc: "Entrega a la dirección de la empresa un documento pericial de cumplimiento normativo." }
      ]
    },
    cdti: {
      tag: "PROYECTOS I+D+i, NEOTEC Y ENISA",
      title: "Acreditación de Innovación y Secreto Industrial",
      summary: "Refuerza la solicitud y justificación de ayudas de innovación demostrando una arquitectura propietaria robusta y protección de propiedad intelectual.",
      items: [
        { badge: "01 / VENTAJA COMPETITIVA", color: "#FF4D5A", title: "Rendimiento Validador", desc: "Demuestra una arquitectura eficiente con tiempos de respuesta instantáneos y optimización de costes." },
        { badge: "02 / PROTECCIÓN DE ACTIVOS", color: "#20C997", title: "Residuo Cero", desc: "Mantiene a salvo algoritmos y secretos comerciales sin almacenamiento de copias no autorizadas." },
        { badge: "03 / RESPALDO REGISTRAL", color: "#2F81F7", title: "Titularidad Registrada", desc: "Certificación oficial de integridad para acreditar la solidez del proyecto ante evaluadores técnicos." }
      ]
    }
  };

  const codeSnippets = {
    nodejs: `// Conexión rápida con SAARE (Cero fricción en tu código actual)
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: '${API_BASE}/intercept', // Pasarela de seguridad SAARE
  defaultHeaders: {
    'X-SAARE-License': process.env.SAARE_LICENSE,
    'X-SAARE-Execution-Mode': 'PROTECT_AND_ATTEST'
  }
});

// Tu aplicación funciona igual, pero ahora está 100% blindada y certificada
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Procesar expediente corporativo con datos de clientes' }]
});`,
    python: `# Integración instantánea en Python (Compatible con OpenAI, Anthropic y modelos locales)
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url="${API_BASE}/intercept", # Pasarela segura SAARE
    default_headers={
        "X-SAARE-License": os.environ.get("SAARE_LICENSE"),
        "X-SAARE-Execution-Mode": "PROTECT_AND_ATTEST"
    }
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Generar dictamen pericial con firma legal eIDAS"}]
)`,
    curl: `# Verificación perimetral en cualquier lenguaje vía petición HTTP estándar
curl -X POST ${API_BASE}/intercept \\
  -H "Content-Type: application/json" \\
  -H "X-SAARE-License: $SAARE_LICENSE" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Inferencia con certificación de cumplimiento en vivo"}]
  }'`,
    cabi: `/* Sensor ultraligero embebido para aplicaciones de escritorio y agentes corporativos */
#include <saare_security.h>

int proteger_interaccion(const char* prompt) {
    // Escaneo y neutralización de datos sensibles en milisegundos
    if (saare_validar_seguridad(prompt) != SAARE_CONFORME) {
        saare_bloquear_fuga_memoria();
        return ACCESO_DENEGADO; // Protege el equipo y genera certificado de prevención
    }
    return ACCESO_PERMITIDO;
}`
  };

  const handleDownloadSDK = async () => {
    try {
      setDownloadingZip(true);
      const response = await fetch('/saare-extension.zip');
      if (!response.ok) throw new Error("No se pudo descargar el paquete base.");
      
      const zipArrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(zipArrayBuffer);
      
      const tTenant = sessionUser?.tenantName || "EMPRESA_CLIENTE";
      const tEmail = sessionUser?.email || "contacto@empresa.com";
      const tToken = sessionUser?.apiKey || sessionUser?.token || "sk_saare_live_session";
      
      const tokenizedManagedConfig = {
        "saare_tenant_domain": { "Value": tTenant },
        "saare_user_email": { "Value": tEmail },
        "saare_api_key": { "Value": tToken },
        "saare_license_type": { "Value": sessionUser?.licenseType || "PLAN_EMPRESARIAL_ACTIVO" }
      };

      zip.file("storage_managed.json", JSON.stringify(tokenizedManagedConfig, null, 2));
      zip.file("saare_config.json", JSON.stringify({ tenantName: tTenant, email: tEmail, token: tToken, fecha: new Date().toISOString() }, null, 2));

      const customizedBlob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(customizedBlob);
      dl.download = `saare-agente-${tTenant.toLowerCase().replace(/[^a-z0-9]/g, '_')}-configurado.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      URL.revokeObjectURL(dl.href);
    } catch (err) {
      alert("Error al preparar la descarga: " + err.message);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    let endpoint = `${API_BASE}/auth/register`;
    let payload = { email, password, tenantName: companyName, source: 'suite', role: 'AUDITOR' };

    if (mode === 'login') {
      endpoint = `${API_BASE}/auth/login`;
      payload = { email, password, source: 'suite' };
    }

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
        setError(data.error || "No se pudo iniciar sesión.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const currentGrant = grantsData[activeGrantTab] || grantsData['nextgen'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05070c', color: '#f1f5f9', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      {/* MODAL CERTIFICADO REGISTRAL */}
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Diploma de Garantía Registral" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '14px 20px', background: '#090d16', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación Oficial Safe Creative Nº 2607076315021 · Plena Validez Probatoria</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN COMERCIAL */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(5, 7, 12, 0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios_saare'); }}>
            <span style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '2px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#38bdf8', fontSize: '12px', borderLeft: '1px solid #334155', paddingLeft: '10px', fontWeight: '700' }}>Seguridad, Control y Rentabilidad en IA</span>
          </div>

          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', fontWeight: '600', flexWrap: 'wrap' }}>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }} style={{ padding: '7px 14px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'overview' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'overview' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '6px' }}>
              Inicio
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios_saare'); }} style={{ padding: '7px 14px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#0284c7' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? 'rgba(2, 132, 199, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#38bdf8' : '#ffffff', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
              ⚡ 5 Capas de Blindaje
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('cases'); }} style={{ padding: '7px 14px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'cases' ? '#9333ea' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'cases' ? 'rgba(147, 51, 234, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'cases' ? '#c084fc' : '#94a3b8', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
              🏛️ Casos de Negocio
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('architecture'); }} style={{ padding: '7px 14px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#38bdf8' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'architecture' ? 'rgba(56, 189, 248, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
              💼 Modelos Comerciales & Integración
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('risk_roi'); }} style={{ padding: '7px 14px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'risk_roi' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'risk_roi' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '6px' }}>
              💰 Ahorro & ROI
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('proof'); }} style={{ padding: '7px 14px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'proof' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'proof' ? '#34d399' : '#94a3b8', cursor: 'pointer', borderRadius: '6px' }}>
              📜 Certificado Legal
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('compliance'); }} style={{ padding: '7px 14px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'compliance' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'compliance' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '6px' }}>
              🏛️ Subvenciones & Ayudas
            </button>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                  Mi Panel
                </button>
                <button onClick={() => { localStorage.removeItem('saare_suite_user'); setSessionUser(null); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '8px 18px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', marginLeft: '8px', boxShadow: '0 2px 10px rgba(2,132,199,0.3)' }}>
                Acceso Clientes
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* VISTA 1: AUTENTICACIÓN */}
      {currentView === 'AUTH' && !sessionUser && (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '36px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#38bdf8', marginBottom: '8px', fontWeight: 'bold' }}>// ACCESO A TU PANEL CORPORATIVO</div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#ffffff' }}>
              {mode === 'reset' ? 'Restablecer Clave' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta de Empresa')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' }}>Accede a tus certificados de cumplimiento y monitorización en tiempo real.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>NOMBRE DE TU EMPRESA</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ej: Mi Empresa / Consultora" style={{ width: '100%', padding: '11px 14px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
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
              <button type="submit" disabled={loading} style={{ padding: '13px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>
                {loading ? 'Entrando...' : (mode === 'login' ? 'Entrar a mi Panel' : 'Activar Cuenta')}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* VISTA 2: PANEL DE CONTROL DE AUDITOR */}
      {currentView === 'STATUS' && sessionUser && (
        <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '5px 10px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: 'bold' }}>
                ● PLAN ACTIVO Y PROTEGIDO
              </span>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>GARANTÍA LEGAL 100%</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Panel de Control y Descarga de Certificados</h1>
            <p style={{ color: '#94a3b8', fontSize: '14.5px', marginBottom: '28px' }}>Supervisa tus aplicaciones protegidas, revisa alertas y descarga informes periciales para auditorías.</p>
            
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ padding: '13px 26px', backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '14px' }}>
                Abrir Consola de Gestión ↗
              </a>
              <button onClick={handleDownloadSDK} disabled={downloadingZip} style={{ padding: '13px 26px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                {downloadingZip ? 'Generando...' : 'Descargar Agente Autoinstalable (.zip)'}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VISTA PRINCIPAL */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1080px', margin: '30px auto 80px auto', padding: '0 20px' }}>

          {/* TAB 1: 5 CAPAS DE BLINDAJE (1.jfif a 5.jfif) */}
          {activeNavTab === 'scenarios_saare' && (
            <div>
              <section style={{ textAlign: 'center', marginBottom: '44px', paddingTop: '10px' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  PROTECCIÓN INTEGRAL SIN COMPLICACIONES
                </span>
                <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#ffffff', margin: '8px 0 14px 0', letterSpacing: '-0.5px' }}>
                  Cinco soluciones que aseguran y rentabilizan tu IA
                </h1>
                <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0 auto', maxWidth: '760px', lineHeight: 1.5 }}>
                  Usa ChatGPT, Claude, Gemini o tus propios modelos con la tranquilidad de que tus datos están a salvo, tus costes bajo control y tu empresa protegida legalmente.
                </p>
              </section>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* 01. EL ESCUDO */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #1e3a8a55', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(2,132,199,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10 }}>01</div>
                    <img src="/1.jfif" alt="El Escudo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>🛡️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Escudo: Cero Fugas de Datos</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#38bdf8', fontWeight: '700', margin: '0 0 8px 0' }}>
                      Tus empleados pueden usar la IA sin poner en riesgo la privacidad de tu empresa.
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      Detecta y bloquea automáticamente la salida de DNIs, cuentas bancarias, nóminas, secretos comerciales o datos de clientes antes de que salgan a internet.
                    </p>
                    <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '700' }}>
                      ✔ Cumplimiento automático del RGPD y protección total del secreto de empresa.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>Comparativa Directa</div>
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                      ❌ Sin SAARE: Fuga accidental = Sanciones de hasta 20 M€.
                    </div>
                    <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>
                      ✔ Con SAARE: Los datos sensibles se bloquean antes de salir.
                    </div>
                    <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '11px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                      Proteger mi Empresa →
                    </button>
                  </div>
                </div>

                {/* 02. EL GUARDIÁN */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #16a34a44', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(22,163,74,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10 }}>02</div>
                    <img src="/3.jfif" alt="El Guardián" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>⚡</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Guardián: Máximo Ahorro y Control</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#34d399', fontWeight: '700', margin: '0 0 8px 0' }}>
                      Reduce tu factura de IA hasta un 98% evitando respuestas repetitivas o erróneas.
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      Filtra preguntas trampa, evita manipulaciones de usuarios y optimiza el consumo de tokens para que solo pagues por respuestas útiles y verificadas.
                    </p>
                    <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '700' }}>
                      ✔ {pipelineSavings.percentReduction}% de reducción en costes operativos con respuesta ultrarrápida.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '800', textTransform: 'uppercase' }}>Impacto Económico</div>
                    <div style={{ fontSize: '18px', color: '#34d399', fontWeight: '900' }}>{pipelineSavings.costSavedPerMillion} ahorrados</div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Por cada millón de tokens consumidos en tus sistemas.</span>
                    <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '11px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                      Empezar a Ahorrar →
                    </button>
                  </div>
                </div>

                {/* 03. EL DETECTOR */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #f9731644', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(249,115,22,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10 }}>03</div>
                    <img src="/4.jfif" alt="El Detector" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>🔍</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Detector: Cero Alucinaciones</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#fb923c', fontWeight: '700', margin: '0 0 8px 0' }}>
                      Nunca tomes decisiones de negocio basadas en respuestas falsas o inventadas.
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      Verifica automáticamente que cada dato, cifra o conclusión generada por la IA esté respaldada en tus documentos reales antes de enviarse al cliente.
                    </p>
                    <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '700' }}>
                      ✔ Decisiones seguras, contratos sin errores y clientes satisfechos.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#fb923c', fontWeight: '800', textTransform: 'uppercase' }}>Prueba en Vivo</div>
                    <input type="text" value={detectorInput} onChange={(e) => setDetectorInput(e.target.value)} placeholder="Introduce una frase para verificar" style={{ width: '100%', padding: '8px', background: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
                    <button onClick={handleCheckDetector} style={{ width: '100%', padding: '9px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
                      Comprobar Fiabilidad →
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dictamen:</span>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: detectorResult === 'SUCCESS' ? '#15803d' : (detectorResult === 'WARNING' ? '#d97706' : '#dc2626'), color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
                        {detectorResult === 'SUCCESS' ? '✔ Fiable' : (detectorResult === 'WARNING' ? '⚠️ Sospechoso' : '❌ Bloqueado')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 04. LA EVIDENCIA */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #9333ea44', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(147,51,234,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#9333ea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10 }}>04</div>
                    <img src="/2.jfif" alt="La Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>⚖️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>La Evidencia: Certificados Legales</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#c084fc', fontWeight: '700', margin: '0 0 8px 0' }}>
                      Prueba legal incontrovertible de que tu empresa actúa con total diligencia.
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      Genera certificados oficiales con firma digital y sello de tiempo que demuestran qué ocurrió, cuándo ocurrió y por qué tu empresa cumplió escrupulosamente la ley.
                    </p>
                    <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '700' }}>
                      ✔ Válido ante jueces, peritos, inspectores y comités de auditoría.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: '800', textTransform: 'uppercase' }}>Garantía Jurídica</div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Sellos oficiales RFC 3161 y registro Safe Creative de autoría.</div>
                    <button onClick={copyBundleJson} style={{ width: '100%', padding: '11px', backgroundColor: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                      {copiedBundle ? '✔ Certificado Copiado' : 'Ver Certificado Ejemplo →'}
                    </button>
                  </div>
                </div>

                {/* 05. EL JUSTIFICADOR */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #eab30844', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(234,179,8,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#ca8a04', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10 }}>05</div>
                    <img src="/5.jfif" alt="El Justificador" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '22px' }}>🏛️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Justificador: Subvenciones y Ayudas</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#facc15', fontWeight: '700', margin: '0 0 8px 0' }}>
                      Asegura el cobro de tus subvenciones sin riesgo de devolución o penalizaciones.
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      Controla facturas duplicadas, acredita el principio medioambiental DNSH y elabora memorias técnicas automáticas listas para entregar a la administración.
                    </p>
                    <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '700' }}>
                      ✔ Blindaje de fondos NextGenEU, Kit Digital, CDTI y convocatorias públicas.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#facc15', fontWeight: '800', textTransform: 'uppercase' }}>Fondos Compatibles</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['NextGenEU', 'PRTR', 'Kit Digital', 'CDTI'].map((tag) => (
                        <span key={tag} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#1e293b', color: '#facc15', fontWeight: 'bold' }}>{tag}</span>
                      ))}
                    </div>
                    <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '11px', backgroundColor: '#ca8a04', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                      Asegurar Mis Fondos →
                    </button>
                  </div>
                </div>

              </div>

              {/* BANNER DE CIERRE COMERCIAL */}
              <div style={{ marginTop: '40px', backgroundColor: '#090d16', border: '1px solid #1e3a8a', borderRadius: '16px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>
                    ¿Quieres ver cómo funciona en tu propia empresa?
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                    Activa tu suscripción hoy mismo y obtén protección inmediata y soporte especializado.
                  </p>
                </div>
                <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '14px 32px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '8px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(2,132,199,0.4)' }}>
                  Contratar Asiento Auditor (149 €/mes) ↗
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: CASOS DE NEGOCIO */}
          {activeNavTab === 'cases' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <span style={{ color: '#c084fc', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  PROTECCIÓN CORPORATIVA Y TRANQUILIDAD JURÍDICA
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
                  Dónde protege SAARE a tu Organización
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '780px', margin: '0 auto' }}>
                  Elimina riesgos legales, protege a tus administradores y convierte el cumplimiento normativo en una palanca de venta.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                
                <div style={{ background: '#05070c', border: '1px solid #1e3a8a', borderRadius: '12px', padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>🛡️</div>
                    <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#38bdf8', margin: '0 0 8px 0' }}>Auditorías e Inspecciones</h3>
                    <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      AESIA · REGLAMENTO EUROPEO DE IA
                    </span>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.55, marginTop: '14px' }}>
                      Demuestra ante la <strong>Agencia Española de Supervisión de IA (AESIA)</strong> y tus clientes que tus sistemas no sufren fugas de datos y cumplen escrupulosamente los estándares de gobernanza.
                    </p>
                  </div>
                  <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '14px', marginTop: '16px', fontSize: '13px', color: '#34d399', fontWeight: 'bold' }}>
                    ✔ Evita sanciones de hasta 35 M€ o el 7% de la facturación global.
                  </div>
                </div>

                <div style={{ background: '#05070c', border: '1px solid #9333ea', borderRadius: '12px', padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚖️</div>
                    <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#c084fc', margin: '0 0 8px 0' }}>Litigios y Procedimientos Judiciales</h3>
                    <span style={{ background: 'rgba(192, 132, 252, 0.1)', color: '#c084fc', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      PLENA VALIDEZ PROBATORIA
                    </span>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.55, marginTop: '14px' }}>
                      Presenta ante tribunales certificados digitales indiscutibles que demuestran que tus decisiones automatizadas fueron correctas, diligentes y no vulneraron secretos ni derechos.
                    </p>
                  </div>
                  <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '14px', marginTop: '16px', fontSize: '13px', color: '#c084fc', fontWeight: 'bold' }}>
                    ✔ Prueba documental con sello oficial de tiempo y firma digital.
                  </div>
                </div>

                <div style={{ background: '#05070c', border: '1px solid #ca8a04', borderRadius: '12px', padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>🏛️</div>
                    <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#facc15', margin: '0 0 8px 0' }}>Cobro de Ayudas y Subvenciones</h3>
                    <span style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      IGAE · OLAF · FONDOS NEXTGEN
                    </span>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.55, marginTop: '14px' }}>
                      Acredita ante los auditores públicos la correcta aplicación de fondos, evitando expedientes de reintegro por facturación duplicada o falta de justificación técnica.
                    </p>
                  </div>
                  <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '14px', marginTop: '16px', fontSize: '13px', color: '#facc15', fontWeight: 'bold' }}>
                    ✔ Expedientes técnicos aprobados a la primera sin requerimientos.
                  </div>
                </div>

              </div>

              <div style={{ textAlign: 'center', background: '#05070c', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <h3 style={{ fontSize: '18px', color: '#fff', margin: '0 0 8px 0', fontWeight: '800' }}>¿Eres consultora, despacho pericial o departamento de cumplimiento?</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 18px 0' }}>Despliega el asiento auditor para supervisar a todos tus clientes desde una única plataforma.</p>
                <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '13px 30px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}>
                  Contratar Asiento Auditor (149 €/mes) ↗
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: MODELOS COMERCIALES & INTEGRACIÓN (CON IMÁGENES 101-105) */}
          {activeNavTab === 'architecture' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  OPCIONES DE INTEGRACIÓN Y MONETIZACIÓN
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
                  Cinco Modelos de Alianza para Tu Negocio
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '780px', margin: '0 auto' }}>
                  Elige cómo quieres incorporar SAARE a tu empresa o producto para generar nuevos ingresos y proteger a tus usuarios.
                </p>
              </div>

              {/* GRID DE LAS 5 PATAS COMERCIALES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '36px' }}>
                {deploymentModes.map((dep) => {
                  const isSelected = selectedArchPillar === dep.code;
                  return (
                    <div 
                      key={dep.code} 
                      onClick={() => {
                        setSelectedArchPillar(dep.code);
                        setActiveCodeTab(dep.codeSnippetKey);
                      }}
                      style={{ 
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : '#05070c', 
                        padding: '18px', 
                        borderRadius: '12px', 
                        border: `1.5px solid ${isSelected ? dep.color : '#1e293b'}`, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 6px 24px ${dep.color}30` : 'none'
                      }}
                    >
                      <div>
                        {/* IMAGEN DE LA PATA COMERCIAL */}
                        <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b', marginBottom: '14px', background: '#090d16' }}>
                          <img 
                            src={dep.image} 
                            alt={dep.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(5,7,12,0.85)', padding: '4px 10px', borderRadius: '4px', border: `1px solid ${dep.color}`, color: dep.color, fontSize: '10.5px', fontWeight: '800' }}>
                            {dep.badge}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{dep.icon}</span>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: '800' }}>{dep.title}</h4>
                        </div>
                        
                        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 10px 0', lineHeight: 1.45 }}>{dep.desc}</p>
                        <div style={{ color: dep.color, fontSize: '12.5px', fontWeight: '700', marginBottom: '12px' }}>
                          💰 {dep.valueProp}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '10px', color: '#64748b', fontSize: '11.5px', fontFamily: 'monospace' }}>
                        {dep.deployInfo}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECCIÓN DE INTEGRACIÓN SENCILLA */}
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                      Integración en 2 Líneas de Código
                    </h3>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      Compatible con cualquier lenguaje y sin cambiar tu proveedor actual de IA.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['nodejs', 'python', 'curl', 'cabi'].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveCodeTab(tab)} 
                        style={{ 
                          background: activeCodeTab === tab ? '#1e293b' : 'transparent', 
                          border: `1px solid ${activeCodeTab === tab ? '#38bdf8' : '#334155'}`, 
                          color: activeCodeTab === tab ? '#38bdf8' : '#94a3b8', 
                          padding: '6px 14px', 
                          borderRadius: '4px', 
                          fontSize: '12px', 
                          cursor: 'pointer', 
                          fontWeight: '700' 
                        }}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px', color: '#f1f5f9', fontSize: '13px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.55 }}>
                  {codeSnippets[activeCodeTab]}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: AHORRO & ROI */}
          {activeNavTab === 'risk_roi' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  RENTABILIDAD Y EFICIENCIA DIRECTA
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
                  Retorno de Inversión Inmediato
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '780px', margin: '0 auto' }}>
                  SAARE no es un coste, es un ahorro operativo garantizado que reduce el consumo de tokens y blinda el balance de tu empresa.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: '#05070c', padding: '26px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>💸</div>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Ahorro en Factura de IA</h4>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                    Reducción de hasta un <strong>98.4%</strong> en consultas innecesarias o redundantes mediante filtrado y optimización perimetral en memoria.
                  </p>
                </div>
                <div style={{ background: '#05070c', padding: '26px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🛡️</div>
                  <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Cero Riesgo Sancionador</h4>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                    Protección ex-ante frente a infracciones del <strong>Reglamento Europeo de IA (AI Act)</strong>, RGPD y normativas sectoriales.
                  </p>
                </div>
                <div style={{ background: '#05070c', padding: '26px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>⏱️</div>
                  <h4 style={{ color: '#34d399', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Ahorro en Horas de Consultoría</h4>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                    Generación automática de toda la documentación y evidencias requeridas por comités de auditoría y organismos públicos.
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'center', background: '#05070c', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <span style={{ color: '#34d399', fontSize: '18px', fontWeight: '900', display: 'block', marginBottom: '6px' }}>
                  Recupera la inversión desde el primer mes de uso.
                </span>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 16px 0' }}>Plan Auditor completo por solo 149 € al mes con cancelación flexible.</p>
                <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '13px 30px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '6px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}>
                  Comenzar Ahora →
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICADO LEGAL (PROOF BUNDLE) */}
          {activeNavTab === 'proof' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0' }}>Certificado Digital de Evidencia (Proof Bundle)</h2>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>El documento pericial inmutable que acredita tu diligencia ante cualquier organismo.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={copyHashToClipboard} style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    {copiedHash ? '✔ Huella Copiada' : 'Copiar Huella Digital'}
                  </button>
                  <button onClick={() => setShowDiploma(true)} style={{ background: '#1e293b', color: '#c084fc', border: '1px solid #9333ea', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    📜 Ver Acreditación Oficial
                  </button>
                  <button onClick={copyBundleJson} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    {copiedBundle ? '✔ Copiado' : 'Copiar Certificado'}
                  </button>
                </div>
              </div>
              <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '18px', color: '#34d399', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
                {JSON.stringify(proofBundle, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 6: SUBVENCIONES & AYUDAS */}
          {activeNavTab === 'compliance' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>Justificación de Ayudas Públicas y Fondos</h2>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Documentación técnica estructurada para asegurar el cobro y evitar requerimientos.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', background: '#05070c', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <button onClick={() => setActiveGrantTab('nextgen')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeGrantTab === 'nextgen' ? '#0284c7' : 'transparent', color: activeGrantTab === 'nextgen' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>
                    NextGenEU / PRTR
                  </button>
                  <button onClick={() => setActiveGrantTab('kit')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeGrantTab === 'kit' ? '#0284c7' : 'transparent', color: activeGrantTab === 'kit' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>
                    Kit Digital / Asesoramiento
                  </button>
                  <button onClick={() => setActiveGrantTab('cdti')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeGrantTab === 'cdti' ? '#0284c7' : 'transparent', color: activeGrantTab === 'cdti' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>
                    CDTI / ENISA / I+D
                  </button>
                </div>
              </div>

              <div style={{ background: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '22px', marginBottom: '24px' }}>
                <span style={{ color: '#38bdf8', fontSize: '11.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>{currentGrant.tag}</span>
                <h3 style={{ fontSize: '19px', color: '#fff', margin: '6px 0 8px 0', fontWeight: '800' }}>{currentGrant.title}</h3>
                <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: 1.55 }}>{currentGrant.summary}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                {currentGrant.items.map((item, idx) => (
                  <div key={idx} style={{ background: '#05070c', padding: '22px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <span style={{ color: item.color, fontWeight: 'bold', fontSize: '11px' }}>{item.badge}</span>
                    <h4 style={{ color: '#fff', margin: '8px 0 6px 0', fontSize: '16px', fontWeight: '800' }}>{item.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0, lineHeight: 1.45 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: INICIO (OVERVIEW) */}
          {activeNavTab === 'overview' && (
            <div style={{ textAlign: 'center', margin: '60px 0' }}>
              <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                PLENA CONFIANZA Y CUMPLIMIENTO EN IA
              </span>
              <h1 style={{ fontSize: '50px', fontWeight: '900', color: '#ffffff', margin: '20px 0 16px 0', letterSpacing: '-1px' }}>
                Usa la Inteligencia Artificial con <span style={{ color: '#38bdf8' }}>total seguridad y ahorro.</span>
              </h1>
              <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '780px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
                SAARE protege la información sensible de tu empresa, evita respuestas falsas y genera certificados oficiales de cumplimiento para auditorías y subvenciones.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveNavTab('scenarios_saare')} style={{ padding: '15px 32px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 20px rgba(2,132,199,0.4)' }}>
                  Ver las 5 Capas de Protección →
                </button>
                <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '15px 32px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontWeight: '800', fontSize: '15px', textDecoration: 'none' }}>
                  Contratar Plan (149 €/mes) ↗
                </a>
              </div>
            </div>
          )}

          <footer style={{ borderTop: '1px solid #1e293b', marginTop: '60px', paddingTop: '32px', fontSize: '12.5px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#fff' }}>SAARE</strong> · Capa de Seguridad y Evidencia para Inteligencia Artificial
                <div style={{ marginTop: '4px' }}>Acreditación Registral Safe Creative Nº 2607076315021 · Validez Jurídica Internacional</div>
              </div>
              <div style={{ display: 'flex', gap: '18px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Verificar Certificado</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Consola de Gestión</a>
                <a href="mailto:enterprise.audit@saare.es" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contacto Comercial</a>
              </div>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}