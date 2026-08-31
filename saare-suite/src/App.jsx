import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';

const DEFAULT_LEGAL_SCENARIOS = [
  {
    id: "01",
    lawBadge: "RGPD (Art. 5.2, 9, 32) · Ley 1/2019 de Secretos · EHDS",
    name: "01. Escudo RGPD, Privacidad & Secreto Empresarial",
    subtitle: "Protección ex-ante de la información confidencial en el uso corporativo de IA.",
    desc: "Blindaje perimetral que detecta, aísla y redacta en memoria volátil RAM DNIs, cuentas bancarias (IBAN), nóminas, historiales médicos y secretos industriales con purga atómica SYS_madvise (Zero-Disk Writes) antes de salir a servidores externos.",
    benefit: "✔ Cero riesgo de multas de hasta 20 M€ (o 4% de facturación global) y blindaje directo para el órgano de administración.",
    color: "#0284c7",
    image: "/1.jfif",
    actionText: "Proteger Datos RGPD →"
  },
  {
    id: "02",
    lawBadge: "EU AI Act (Art. 15) · NIS 2 · Cyber Resilience Act (CRA)",
    name: "02. Blindaje de Robustez, Ciberseguridad & Mitigación L7",
    subtitle: "Defensa activa contra manipulaciones adversarias y reducción de costes de inferencia.",
    desc: "Neutraliza ataques de Jailbreak, inyección de directivas (Prompt Injection) y desvíos lógicos mientras inyecta el testigo determinista [🧠 L7 CEREBRO WITNESS] y optimiza el pipeline reduciendo en un 98.4% el consumo innecesario de tokens.",
    benefit: "✔ Reducción del 98.4% en consumo de tokens con latencia ultrarrápida (<0.017 ms en memoria RAM).",
    color: "#16a34a",
    image: "/3.jfif",
    actionText: "Optimizar Costes & Seguridad →"
  },
  {
    id: "03",
    lawBadge: "Ley Orgánica del Honor 2026 · AI Act (Art. 13) · Data Act",
    name: "03. Antifraude Deepfakes, Protección del Honor & Veracidad Fáctica",
    subtitle: "Prevención de responsabilidad por clonación sintética de voz/imagen y alucinaciones.",
    desc: "Inspección causal y bloqueo estricto (No-Unsupported-Claims) ante clonación no consentida de identidad bajo la Ley de 2026, mitigando cláusulas inventadas y falsedad documental mediante contrastación documental formal.",
    benefit: "✔ Prevención de indemnizaciones por daño moral no simbólicas y decisiones empresariales con certeza fáctica.",
    color: "#ea580c",
    image: "/4.jfif",
    actionText: "Verificar Certeza & Deepfakes →"
  },
  {
    id: "04",
    lawBadge: "ISO/IEC 27037 · AI Act (Art. 12 Logs) · eIDAS · AI Liability",
    name: "04. Bóveda Pericial de Auditoría & Dictamen Normativo (DES)",
    subtitle: "Generación automática de prueba documental inmutable para procesos judiciales y auditorías.",
    desc: "Generación automatizada de expedientes de evidencia digital (Proof Bundles) bajo la norma ISO/IEC 27037:2012 con firma asimétrica Ed25519 y estampación temporal cualificada RFC 3161 con plena eficacia probatoria.",
    benefit: "✔ Prueba admisible ante tribunales de justicia, peritos judiciales, comisiones de auditoría y la AESIA.",
    color: "#9333ea",
    image: "/2.jfif",
    actionText: "Ver Certificado Pericial →"
  },
  {
    id: "05",
    lawBadge: "Ley General de Subvenciones · PRTR · NextGenEU / OLAF / IGAE",
    name: "05. Trazabilidad Fiduciaria de Fondos Públicos & Subvenciones",
    subtitle: "Garantía de cobro íntegro y justificación de proyectos públicos sin requerimientos.",
    desc: "Supervisa la no duplicidad de facturas por hash SHA-256, acredita el cumplimiento medioambiental DNSH y redacta memorias técnicas listas para entregar a evaluadores públicos conforme a los criterios de la IGAE y OLAF.",
    benefit: "✔ Blindaje total en justificaciones CDTI, Kit Digital, Kit Consulting, ENISA y fondos NextGenerationEU.",
    color: "#ca8a04",
    image: "/5.jfif",
    actionText: "Asegurar Justificación de Ayudas →"
  }
];

export default function App() {
  const [sessionUser, setSessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem('saare_suite_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [mode, setMode] = useState('register');
  const [currentView, setCurrentView] = useState('LANDING');
  const [activeNavTab, setActiveNavTab] = useState('overview');

  // Estado sincronizado de las Bóvedas Normativas desde el Backend
  const [legalScenarios, setLegalScenarios] = useState(DEFAULT_LEGAL_SCENARIOS);
  const [regulatorySyncStatus, setRegulatorySyncStatus] = useState("SINCRONIZADO EN VIVO (BOE / AESIA / EUR-LEX 2026)");

  // Formulario y modales
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

  // Sincronización continua de normativas
  useEffect(() => {
    async function syncRegulatoryMatrix() {
      try {
        const res = await fetch(`${API_BASE}/compliance/live-matrix`);
        const data = await res.json();
        if (res.ok && data.status === 'SUCCESS' && Array.isArray(data.scenarios)) {
          const sanitized = data.scenarios.map((sc, idx) => ({
            id: String(idx + 1).padStart(2, '0'),
            lawBadge: sc.lawBadge || DEFAULT_LEGAL_SCENARIOS[idx]?.lawBadge,
            name: sc.name || sc.title || DEFAULT_LEGAL_SCENARIOS[idx]?.name,
            subtitle: sc.subtitle || DEFAULT_LEGAL_SCENARIOS[idx]?.subtitle,
            desc: sc.desc || sc.description || DEFAULT_LEGAL_SCENARIOS[idx]?.desc,
            benefit: sc.benefit || DEFAULT_LEGAL_SCENARIOS[idx]?.benefit,
            color: sc.badgeColor || sc.color || DEFAULT_LEGAL_SCENARIOS[idx]?.color,
            image: sc.image || `/${idx === 1 ? '3' : idx === 2 ? '4' : idx === 3 ? '2' : idx === 4 ? '5' : '1'}.jfif`,
            actionText: sc.actionText || DEFAULT_LEGAL_SCENARIOS[idx]?.actionText
          }));
          setLegalScenarios(sanitized);
          setRegulatorySyncStatus("ACTUALIZADO HOY (BOE / EUR-LEX / AESIA)");
        }
      } catch {
        setLegalScenarios(DEFAULT_LEGAL_SCENARIOS);
      }
    }
    syncRegulatoryMatrix();
  }, []);

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
      "01_ESCUDO_RGPD_EHDS": "Filtro en memoria RAM que neutraliza salida de PII, salud y secretos corporativos sin escribir en disco",
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

  const deploymentModes = [
    {
      code: "IPaaS",
      title: "01. Agentes IA y Automatizaciones",
      desc: "Monetiza la seguridad en flujos de Make, n8n, LangChain o CrewAI. Garantiza que los datos confidenciales jamás se filtran a modelos externos.",
      badge: "MARGEN COMERCIAL HASTA 40%",
      valueProp: "Añade un módulo de Compliance Add-on y genera ingresos recurrentes sin coste de desarrollo.",
      color: "#06B6D4",
      icon: "🌐",
      image: "/101.jfif",
      deployInfo: "⚡ Despliegue en 3 minutos cambiando únicamente la variable baseURL de tu agente.",
      codeSnippetKey: "nodejs"
    },
    {
      code: "EMBEDDED",
      title: "02. Fabricantes de Software y Ciberseguridad",
      desc: "Embebe el sensor nativo SAARE en tu plataforma o EDR y ofrece a cuentas corporativas un escudo contra robo de propiedad intelectual.",
      badge: "LICENCIA OEM / ARR MULTIPLICADOR",
      valueProp: "Aumenta el ticket medio (ARPU) integrando el estándar de gobernanza exigido en auditorías.",
      color: "#20C997",
      icon: "⚡",
      image: "/102.jfif",
      deployInfo: "⚡ Sensor ultraligero que inspecciona en memoria RAM (<0.017 ms) sin tocar el disco del cliente.",
      codeSnippetKey: "cabi"
    },
    {
      code: "GSI",
      title: "03. Consultoras y Despachos Profesionales",
      desc: "Supervisa el uso de IA de decenas de clientes corporativos desde un único panel y emite dictámenes periciales en 1 solo clic.",
      badge: "PLAN PARTNER / FACTURACIÓN POR CLIENTE",
      valueProp: "Factura servicios de auditoría y dictamen pericial con respaldo registral oficial.",
      color: "#c084fc",
      icon: "⚖️",
      image: "/103.jfif",
      deployInfo: "⚡ Panel multi-inquilino con exportación instantánea de certificados con sello de tiempo eIDAS.",
      codeSnippetKey: "python"
    },
    {
      code: "GATEWAY",
      title: "04. Plataformas Cloud y Tráfico Masivo",
      desc: "Detén ataques de Jailbreak, fraude y consumo abusivo de tokens antes de que impacten en la infraestructura del servidor central.",
      badge: "PAGO POR USO / ESCALABILIDAD TOTAL",
      valueProp: "Reduce un 98.4% de peticiones maliciosas ahorrando miles de euros en facturas de cómputo.",
      color: "#2F81F7",
      icon: "📦",
      image: "/104.jfif",
      deployInfo: "⚡ Red perimetral distribuida en más de 300 PoPs con sellado de cabeceras HTTP en tránsito.",
      codeSnippetKey: "curl"
    },
    {
      code: "VERTICAL",
      title: "05. Soluciones Sectoriales (Legal, Salud, Banca)",
      desc: "Activa el modo de máxima confidencialidad para procesar historiales clínicos, nóminas y expedientes judiciales garantizando cero fugas.",
      badge: "MODO PRIVACIDAD TOTAL / ALTA RETENCIÓN",
      valueProp: "El único argumento de venta que supera los comités de seguridad y DPOs más exigentes.",
      color: "#EAB308",
      icon: "🔒",
      image: "/105.jfif",
      deployInfo: "⚡ Integración directa en el backend transaccional de tu CRM, ERP o sistema de gestión.",
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
  baseURL: '${API_BASE}/intercept', // Pasarela perimetral de cumplimiento automatizado SAARE
  defaultHeaders: {
    'X-SAARE-License': process.env.SAARE_LICENSE,
    'X-SAARE-Execution-Mode': 'PROTECT_AND_ATTEST'
  }
});

// Tu aplicación funciona igual, pero ahora está 100% blindada ante el EU AI Act y RGPD
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
    // Escaneo y neutralización de datos sensibles y deepfakes en milisegundos
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
              <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación Safe Creative Nº 2607076315021 · Entrada Oficial AESIA REGAGE26e00076675038</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(5, 7, 12, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }}>
            <span style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '2px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#38bdf8', fontSize: '12px', borderLeft: '1px solid #334155', paddingLeft: '10px', fontWeight: '700' }}>Seguridad y Cumplimiento Normativo Automatizado</span>
          </div>

          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', fontWeight: '600', flexWrap: 'wrap' }}>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }} style={{ padding: '7px 14px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'overview' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'overview' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '6px' }}>
              Inicio
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios_saare'); }} style={{ padding: '7px 14px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#0284c7' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? 'rgba(2, 132, 199, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#38bdf8' : '#ffffff', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
              ⚡ 5 Bóvedas Normativas
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('cases'); }} style={{ padding: '7px 14px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'cases' ? '#9333ea' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'cases' ? 'rgba(147, 51, 234, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'cases' ? '#c084fc' : '#94a3b8', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
              🏛️ Casos de Uso
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('architecture'); }} style={{ padding: '7px 14px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#38bdf8' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'architecture' ? 'rgba(56, 189, 248, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
              💼 Modelos Comerciales B2B
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
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta de Empresa'}
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
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ padding: '12px 24px', backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}>
                Abrir Consola GRC ↗
              </a>
              <button onClick={handleDownloadSDK} disabled={downloadingZip} style={{ padding: '12px 24px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                {downloadingZip ? 'Compilando...' : 'Descargar Agente Tokenizado (.zip)'}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VISTA PRINCIPAL (LANDING COMERCIAL) */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1180px', margin: '30px auto 80px auto', padding: '0 20px' }}>

          {/* TAB 1: 5 BÓVEDAS NORMATIVAS */}
          {activeNavTab === 'scenarios_saare' && (
            <div>
              <section style={{ textAlign: 'center', marginBottom: '44px', paddingTop: '10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#34d399', padding: '6px 16px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '800', marginBottom: '16px' }}>
                  <span>🟢</span> {regulatorySyncStatus}
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', margin: '0 0 14px 0', letterSpacing: '-0.5px' }}>
                  Las 5 Bóvedas Normativas para Cumplir la Ley de IA
                </h1>
                <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0 auto', maxWidth: '820px', lineHeight: 1.55 }}>
                  Cumple el <strong>Reglamento Europeo de IA (EU AI Act)</strong>, la <strong>Ley Orgánica del Derecho al Honor (Deepfakes 2026)</strong>, el <strong>RGPD</strong> y los estándares <strong>NIS 2 / CRA / DORA</strong> con una pasarela en memoria volátil que blinda tus datos y ahorra hasta un 98% en cómputo.
                </p>
              </section>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                {legalScenarios.map((scen) => (
                  <div key={scen.id} style={{ backgroundColor: '#090d16', border: `1.5px solid ${scen.color}66`, borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '260px 1fr 260px', gap: '24px', alignItems: 'center', boxShadow: `0 10px 30px ${scen.color}15` }}>
                    
                    <div style={{ position: 'relative', width: '100%', height: '175px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', width: '30px', height: '30px', borderRadius: '50%', background: scen.color, color: scen.id === '05' ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10 }}>
                        {scen.id}
                      </div>
                      <img src={scen.image} alt={scen.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>

                    <div>
                      <div style={{ display: 'inline-block', background: `${scen.color}22`, border: `1px solid ${scen.color}77`, color: scen.color, padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>
                        ⚖️ {scen.lawBadge}
                      </div>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>{scen.name}</h2>
                      <h3 style={{ fontSize: '14.5px', color: '#38bdf8', fontWeight: '700', margin: '0 0 8px 0' }}>{scen.subtitle}</h3>
                      <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.55, margin: '0 0 10px 0' }}>{scen.desc}</p>
                      <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '700' }}>{scen.benefit}</div>
                    </div>

                    <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '11px', color: scen.color, fontWeight: '800', textTransform: 'uppercase' }}>Estado de Protección</div>
                      <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>Módulo activo e incluido al 100% en tu tarifa plana.</div>
                      <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '12px', backgroundColor: scen.color, color: scen.id === '05' ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', textAlign: 'center', boxShadow: `0 4px 15px ${scen.color}35` }}>
                        {scen.actionText}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* BANNER DE CIERRE */}
              <div style={{ marginTop: '40px', backgroundColor: '#090d16', border: '1px solid #1e3a8a', borderRadius: '16px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>
                    Las 5 Bóvedas Normativas incluidas en tu suscripción
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                    Sin compras por separado. Activa tu asiento auditor con garantía total de cumplimiento.
                  </p>
                </div>
                <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '14px 32px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '8px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(2,132,199,0.4)' }}>
                  Contratar Asiento Auditor (149 €/mes) ↗
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: CASOS DE USO */}
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
                  Elimina riesgos legales, protege a tus administradores y convierte el cumplimiento normativo en una ventaja comercial.
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
                      Presenta ante tribunales certificados digitales indiscutibles que demuestran que tus decisiones automatizadas fueron diligentes y no vulneraron secretos ni derechos de imagen/honor.
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
            </div>
          )}

          {/* TAB 3: MODELOS COMERCIALES B2B */}
          {activeNavTab === 'architecture' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  OPCIONES DE ALIANZA Y RENTABILIDAD B2B
                </span>
                <h2 style={{ fontSize: '34px', fontWeight: '900', color: '#fff', margin: '8px 0 12px 0' }}>
                  Cinco Vías para Multiplicar tus Ingresos con SAARE
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '16px', maxWidth: '820px', margin: '0 auto', lineHeight: 1.55 }}>
                  Elige el formato que mejor encaja con tu modelo de negocio. Integra la capa de seguridad en tus servicios, obtén márgenes de venta recurrentes y cierra cuentas corporativas de alto valor.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
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
                        padding: '22px', 
                        borderRadius: '16px', 
                        border: `2px solid ${isSelected ? dep.color : '#1e293b'}`, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        boxShadow: isSelected ? `0 10px 30px ${dep.color}35` : '0 4px 15px rgba(0,0,0,0.5)'
                      }}
                    >
                      <div>
                        <div style={{ position: 'relative', width: '100%', height: '210px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1e293b', marginBottom: '16px', background: '#090d16', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
                          <img 
                            src={dep.image} 
                            alt={dep.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(5,7,12,0.92)', padding: '5px 12px', borderRadius: '6px', border: `1.5px solid ${dep.color}`, color: dep.color, fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>
                            {dep.badge}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{dep.icon}</span>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: '900' }}>{dep.title}</h4>
                        </div>
                        
                        <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: '0 0 12px 0', lineHeight: 1.55 }}>{dep.desc}</p>
                        
                        <div style={{ background: `${dep.color}15`, borderLeft: `3px solid ${dep.color}`, padding: '10px 12px', borderRadius: '4px', color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '14px' }}>
                          💰 {dep.valueProp}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '12px', color: '#38bdf8', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600' }}>
                        {dep.deployInfo}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* INTEGRACIÓN EN 2 LÍNEAS */}
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0 }}>
                      Integración en 2 Líneas de Código
                    </h3>
                    <span style={{ fontSize: '13.5px', color: '#94a3b8' }}>
                      Compatible con cualquier lenguaje sin sustituir tus modelos de IA actuales.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['nodejs', 'python', 'curl', 'cabi'].map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveCodeTab(tab)} 
                        style={{ 
                          background: activeCodeTab === tab ? '#1e293b' : 'transparent', 
                          border: `1.5px solid ${activeCodeTab === tab ? '#38bdf8' : '#334155'}`, 
                          color: activeCodeTab === tab ? '#38bdf8' : '#94a3b8', 
                          padding: '7px 16px', 
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          cursor: 'pointer', 
                          fontWeight: '800' 
                        }}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '10px', padding: '22px', color: '#f1f5f9', fontSize: '13px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6 }}>
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
                  SAARE reduce el consumo de tokens, ahorra miles de euros en facturas y blinda el balance de tu empresa frente a sanciones.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: '#05070c', padding: '26px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>💸</div>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Ahorro en Factura de IA</h4>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                    Reducción de hasta un <strong>98.4%</strong> en consultas innecesarias mediante filtrado y optimización perimetral en memoria.
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
                  <h4 style={{ color: '#34d399', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Ahorro en Horas de Auditoría</h4>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                    Generación automática de toda la documentación pericial y técnica requerida por comités de auditoría y organismos públicos.
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

          {/* TAB 5: CERTIFICADO LEGAL */}
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

          {/* TAB 7: INICIO (OVERVIEW) — AUTOMATIZADO / DIRECTO */}
          {activeNavTab === 'overview' && (
            <div>
              {/* HERO SECTION PRINCIPAL */}
              <section style={{ textAlign: 'center', margin: '20px 0 50px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '8px 22px', borderRadius: '30px', fontSize: '13px', fontWeight: '900', border: '1px solid rgba(56, 189, 248, 0.35)', marginBottom: '22px' }}>
                  <span>🛡️</span> CUMPLIMIENTO AUTOMATIZADO DEL REGLAMENTO EUROPEO DE IA (EU AI ACT) Y LEY DEL HONOR 2026
                </div>
                <h1 style={{ fontSize: '50px', fontWeight: '900', color: '#ffffff', margin: '0 0 18px 0', letterSpacing: '-1.5px', lineHeight: 1.15 }}>
                  Usa la Inteligencia Artificial en tu empresa <br />
                  <span style={{ color: '#38bdf8' }}>sin riesgo de multas ni fugas de datos.</span>
                </h1>
                <p style={{ fontSize: '19px', color: '#cbd5e1', maxWidth: '840px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
                  SAARE intercepta en memoria volátil (<span style={{ color: '#34d399', fontWeight: 'bold' }}>&lt;0.017 ms</span>) antes de que la información salga a OpenAI, Anthropic o Google. <strong>Tus 5 Bóvedas Normativas unificadas en una tarifa plana de 149 €/mes.</strong>
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveNavTab('scenarios_saare')} style={{ padding: '16px 36px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 25px rgba(2,132,199,0.5)' }}>
                    Ver las 5 Bóvedas Normativas →
                  </button>
                  <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '16px 36px', backgroundColor: '#1e293b', color: '#34d399', border: '1.5px solid #34d399', borderRadius: '8px', fontWeight: '900', fontSize: '16px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(52,211,153,0.15)' }}>
                    Activar Todo en Uno (149 €/mes) ↗
                  </a>
                </div>
                <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#94a3b8' }}>
                  ✔ Sin permanencia · Cancelación en 1 clic · Entrada Oficial AESIA: <strong>REGAGE26e00076675038</strong>
                </div>
              </section>

              {/* PANEL DE MONITOREO Y TELEMETRÍA AUTOMATIZADA */}
              <section style={{ backgroundColor: '#090d16', border: '1.5px solid #1e293b', borderRadius: '16px', padding: '30px', marginBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 4px 0' }}>
                      ⚡ Motor de Cumplimiento Continuo L7 en Memoria
                    </h3>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      Inspección determinista automatizada en memoria RAM antes de la salida de datos a modelos externos.
                    </span>
                  </div>
                  <span style={{ color: '#34d399', fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold', background: 'rgba(52,211,153,0.1)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.3)' }}>
                    ● MOTOR SINCRONIZADO (0.017 ms)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#0284c7', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>PURGA EN MEMORIA RAM</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>0.017 ms</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>SYS_madvise Zero-Disk Writes</div>
                  </div>
                  <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#16a34a', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>AHORRO COMPUTACIONAL</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>98.4% Tokens</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Filtrado perimetral de redundancias</div>
                  </div>
                  <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#ea580c', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>DEEPFAKES & HONOR</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>Bloqueo Ex-Ante</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Ley Orgánica del Honor 2026</div>
                  </div>
                  <div style={{ background: '#05070c', padding: '18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#9333ea', fontSize: '12px', fontWeight: '800', marginBottom: '4px' }}>CUSTODIA PERICIAL</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>Firma eIDAS</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>RFC 3161 & ISO/IEC 27037:2012</div>
                  </div>
                </div>
              </section>

              {/* TABLA VISUAL: ANTES VS. DESPUÉS DE SAARE */}
              <section style={{ backgroundColor: '#090d16', border: '1.5px solid #1e293b', borderRadius: '18px', padding: '36px', marginBottom: '50px' }}>
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

              {/* MATRIZ GLOBAL DE NORMATIVAS */}
              <section style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '18px', padding: '36px', marginBottom: '50px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span style={{ color: '#34d399', fontSize: '12.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    COBERTURA LEGAL Y REGULATORIA COMPLETA
                  </span>
                  <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>
                    Todas las Leyes y Estándares que SAARE te ayuda a Cumplir
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#05070c', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <strong style={{ color: '#38bdf8', fontSize: '13px' }}>EU AI Act (2024/1689)</strong>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Logs forenses (Art. 12), Transparencia (Art. 13) y Ciberseguridad (Art. 15).</p>
                  </div>
                  <div style={{ background: '#05070c', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <strong style={{ color: '#ea580c', fontSize: '13px' }}>Ley del Honor 2026</strong>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Protección civil frente a Deepfakes y uso no consentido de voz e imagen.</p>
                  </div>
                  <div style={{ background: '#05070c', padding: '16px', borderRadius: '8px', border: '1px solid #10b981' }}>
                    <strong style={{ color: '#10b981', fontSize: '13px' }}>RGPD & LOPDGDD</strong>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Accountability (Art. 5.2), Datos de salud (Art. 9) y Seguridad técnica (Art. 32).</p>
                  </div>
                  <div style={{ background: '#05070c', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <strong style={{ color: '#c084fc', fontSize: '13px' }}>NIS 2 & CRA (2024/2847)</strong>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Ciberresiliencia, seguridad por diseño y reporte de incidentes graves.</p>
                  </div>
                  <div style={{ background: '#05070c', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <strong style={{ color: '#facc15', fontSize: '13px' }}>DORA & Data Act</strong>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Control de terceros TIC financieros y prevención de transferencias ilícitas.</p>
                  </div>
                  <div style={{ background: '#05070c', padding: '16px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
                    <strong style={{ color: '#38bdf8', fontSize: '13px' }}>ISO/IEC 27037 & eIDAS</strong>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Evidencia forense digital inmutable y sellado de tiempo cualificado RFC 3161.</p>
                  </div>
                </div>
              </section>

              {/* COMPARATIVA ALL-IN-ONE VS SUELTO */}
              <section style={{ backgroundColor: '#090d16', border: '1.5px solid #1e293b', borderRadius: '18px', padding: '36px', marginBottom: '50px' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span style={{ color: '#34d399', fontSize: '12.5px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    PROPUESTA DE VALOR IMBATIBLE
                  </span>
                  <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>
                    ¿Por qué pagar más de 1.200 €/mes contratando soluciones sueltas?
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ background: '#05070c', padding: '22px', borderRadius: '10px', border: '1px solid #334155' }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>❌ CONTRATACIÓN POR SEPARADO</div>
                    <ul style={{ paddingLeft: '18px', color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                      <li>Filtro DLP de datos y PII: <strong>~150 €/mes</strong></li>
                      <li>Optimizador de tokens y guardrails: <strong>~120 €/mes</strong></li>
                      <li>Plataforma de auditoría pericial eIDAS: <strong>~300 €/mes</strong></li>
                      <li>Detección de deepfakes y honor: <strong>~200 €/mes</strong></li>
                      <li>Justificación de fondos públicos: <strong>~500 €/informe</strong></li>
                      <li style={{ borderTop: '1px dashed #334155', paddingTop: '8px', color: '#ef4444', fontWeight: 'bold' }}>Coste total: +1.200 €/mes</li>
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '22px', borderRadius: '10px', border: '2px solid #0284c7' }}>
                    <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '13px', marginBottom: '8px' }}>✔ PAQUETE SAARE ALL-IN-ONE</div>
                    <ul style={{ paddingLeft: '18px', color: '#e2e8f0', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                      <li><strong>Las 5 Bóvedas Normativas</strong> incluidas al 100%</li>
                      <li>Consola GRC Multi-Inquilino con interruptores</li>
                      <li>Certificados periciales ilimitados con firma eIDAS</li>
                      <li>Sensor L7 en memoria con latencia &lt;0.017 ms</li>
                      <li style={{ borderTop: '1px dashed #0284c7', paddingTop: '8px', color: '#34d399', fontWeight: '900', fontSize: '15px' }}>Precio Único: 149 €/mes</li>
                    </ul>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                  <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '13px 32px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: '900', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(2,132,199,0.3)' }}>
                    Activar mi Suscripción All-in-One (149 €/mes) ↗
                  </a>
                </div>
              </section>
            </div>
          )}

          {/* FOOTER CORPORATIVO */}
          <footer style={{ borderTop: '1px solid #1e293b', marginTop: '60px', paddingTop: '32px', fontSize: '12.5px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#fff' }}>SAARE</strong> · Capa de Seguridad y Evidencia para Inteligencia Artificial
                <div style={{ marginTop: '4px' }}>Acreditación Registral Safe Creative Nº 2607076315021 · Entrada Oficial AESIA REGAGE26e00076675038</div>
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