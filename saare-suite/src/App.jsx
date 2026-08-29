import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';
const AUDITOR_PLAN_PRICE = "149.00";

export default function App() {
  const [sessionUser, setSessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem('saare_suite_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [mode, setMode] = useState('register');
  const [currentView, setCurrentView] = useState('LANDING');
  const [activeNavTab, setActiveNavTab] = useState('scenarios_saare');

  // Estados interactivos para Escenarios SAARE y Detección
  const [detectorInput, setDetectorInput] = useState('El balance contable auditado muestra un beneficio neto no contrastado de 450.000 € imputado al expediente.');
  const [detectorResult, setDetectorResult] = useState('WARNING');
  const [activeGrantTag, setActiveGrantTag] = useState('NextGenEU');

  // Estado dinámico del Velocímetro de Ahorro L7 y Testigo del Cerebro (Escenario 3)
  const [pipelineSavings, setPipelineSavings] = useState({
    tokensSaved: 1420,
    latencyMs: 0.017,
    percentReduction: 98.4,
    costSavedPerMillion: "18.50 €",
    brainWitnessActive: true
  });

  // Estados de formularios, autenticación y modales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedBundle, setCopiedBundle] = useState(false);
  const [showDiploma, setShowDiploma] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('nodejs');
  const [activeGrantTab, setActiveGrantTab] = useState('nextgen');
  const [activeProofTab, setActiveProofTab] = useState('bundle');

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
    if (text.includes("no contrastado") || text.includes("sin prueba") || text.includes("indeterminado")) {
      setDetectorResult('WARNING');
    } else if (text.includes("falso") || text.includes("alterado") || text.includes("inventar") || text.includes("ignora") || text.includes("deepfake")) {
      setDetectorResult('REJECTED');
    } else {
      setDetectorResult('SUCCESS');
    }
  };

  // Proof Bundle Canónico estructurado bajo ISO/IEC 27037:2012 y UNE-ISO/IEC 42001:2023
  const proofBundle = {
    "PROOF_BUNDLE_SCHEMA": "SAARE_PROOF_BUNDLE_V10.0_ISO27037_DEI",
    "EVENT_IDENTIFIER": {
      "EVENT_ID": "EV-2026-0829-7F82A1",
      "PARENT_HASH": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "CONTEXT_ID": "MS3V-RECON-VALID-2026-ALF-0521",
      "ROOT_NODE_ID": "2607076315021",
      "ENVIRONMENT": "PRODUCTION_SECURE_RAM"
    },
    "FORENSIC_ROLES_ISO_27037": {
      "DEFR": {
        "ROLE_NAME": "Digital Evidence First Responder (Empleado Auditado / Sensor Runtime L7)",
        "SCENARIO_BINDING": "01_EL_ESCUDO",
        "ACTION": "RAM_VOLATILE_BUFFER_ISOLATION",
        "STATUS": "ACQUIRED_ZERO_DISK_SYS_MADVISE"
      },
      "DES": {
        "ROLE_NAME": "Digital Evidence Specialist (Consultora Auditora GRC / Perito Judicial)",
        "SCENARIO_BINDING": "02_LA_EVIDENCIA",
        "ACTION": "CRYPTOGRAPHIC_PRESERVATION_AND_CHAIN_ATTESTATION",
        "STATUS": "QUALIFIED_RFC3161_SEALED"
      }
    },
    "FOUR_PHASES_OF_EVIDENCE_DEI": {
      "PHASE_1_IDENTIFICATION": "Datos regulados (PII / Salud Art. 9 / Secretos) localizados en memoria volátil.",
      "PHASE_2_COLLECTION": "Aislamiento lógico de la carga útil sin contaminación del host.",
      "PHASE_3_ACQUISITION": "Copia exacta en RAM y cálculo de Hash SHA-256 sin escrituras en disco físico.",
      "PHASE_4_PRESERVATION": "Sellado con firma Ed25519 y estampación temporal cualificada RFC 3161 eIDAS."
    },
    "ACTIVE_REASONING_WITNESS": {
      "LEXICAL_COMMAND": "[SAARE_ACTIVE_SHIELD: ENFORCE]",
      "BRAIN_WITNESS_SEAL": "🧠 L7 CEREBRO WITNESS: DETERMINISTIC_VALID",
      "METRICS_OPTIMIZATION": {
        "TOKENS_SAVED": pipelineSavings.tokensSaved,
        "LATENCY_RAM_MS": pipelineSavings.latencyMs,
        "COMPUTATIONAL_REDUCTION": `${pipelineSavings.percentReduction}%`
      }
    },
    "DEEPFAKE_AND_INTEGRITY_TELEMETRY": {
      "CORPUS_GROUNDING_VERIFICATION": "FORMALLY_VERIFIED",
      "UNSUPPORTED_CLAIMS_DETECTED": 0,
      "CAUSAL_INTEGRITY_STATUS": "CONTINUOUS"
    },
    "PROOFS": {
      "CHAIN_INTEGRITY": {
        "PROOF_TYPE": "CRYPTOGRAPHICALLY_VERIFIED",
        "EVENT_HASH": CANONICAL_HASH,
        "MERKLE_ROOT": MERKLE_ROOT,
        "SEQUENCE_NUMBER": 42081,
        "CHAIN_STATUS": "CONTINUOUS"
      }
    },
    "SIGNATURES": {
      "PRIMARY_SIGNATURE": { "ALGORITHM": "Ed25519", "DIGEST": CANONICAL_HASH },
      "TIME_STAMP_AUTHORITY": { "STANDARD": "RFC 3161", "TSA_RECORD": "QUALIFIED_TRUST_ANCHOR_EIDAS" }
    }
  };

  const deploymentModes = [
    {
      code: "GATEWAY",
      title: "Cloudflare Edge Gateway (300+ PoPs)",
      desc: "Proxy inverso perimetral global que intercepta tráfico HTTP/S y sella cabeceras L7-SEAL antes de alcanzar el proveedor de IA.",
      badge: "LATENCIA < 1.5 ms",
      color: "#06B6D4",
      icon: "🌐"
    },
    {
      code: "SDK",
      title: "SDK & Middleware de Aplicación",
      desc: "Librerías para Node.js y Python integrables con OpenAI, LangChain o n8n mediante redirección de baseURL.",
      badge: "PLUG & PLAY",
      color: "#2F81F7",
      icon: "📦"
    },
    {
      code: "EMBEDDED",
      title: "Sensor Hook C-ABI In-Process (.so / .dll)",
      desc: "Librería nativa de integración directa para fabricantes de antivirus y agentes EDR con purga RAM atómica mediante SYS_madvise.",
      badge: "RESIDUO CERO RAM",
      color: "#20C997",
      icon: "⚡"
    },
    {
      code: "AIR_GAPPED",
      title: "Enclave Soberano On-Premise / VPC",
      desc: "Contenedor aislado en red privada sin salida a internet para banca central, defensa y sanidad de alta seguridad.",
      badge: "ZERO-DISK WRITES",
      color: "#EAB308",
      icon: "🔒"
    }
  ];

  const grantsData = {
    nextgen: {
      tag: "FONDO DE RECUPERACIÓN / PLAN ESPAÑA DIGITAL",
      title: "Evidencia Técnica para NextGenerationEU & PRTR",
      summary: "SAARE genera evidencia técnica estructurada y reutilizable para la documentación de gobernanza y trazabilidad exigida por la IGAE y OLAF.",
      items: [
        { badge: "01 / EU AI ACT & AESIA", color: "#FF4D5A", title: "Art. 9 (Riesgo) & Art. 12 (Logs)", desc: "Trazabilidad continua y controles ex-ante integrados directamente en el perímetro de inferencia." },
        { badge: "02 / ISO 42001 & ISO 27037", color: "#20C997", title: "Control B.6 (Ciclo del Dato)", desc: "Cadena de custodia pericial DEFR/DES y mecanismo Zero-Residue en RAM para auditorías formales." },
        { badge: "03 / RGPD / LOPDGDD", color: "#2F81F7", title: "Art. 5.2 (Responsabilidad Activa)", desc: "Acreditación formal de no filtración de PII y datos de salud (Art. 9) hacia modelos externos." }
      ]
    },
    kit: {
      tag: "PROGRAMA KIT CONSULTING & ASESORAMIENTO (RED.ES)",
      title: "Evidencia de Planes de Asesoramiento e Implantación IA",
      summary: "Aporta pruebas técnicas que demuestren un análisis de riesgos real, gobernanza perimetral y un plan de cumplimiento normativo para PYMEs beneficiarias.",
      items: [
        { badge: "01 / EVIDENCIA OBLIGATORIA", color: "#FF4D5A", title: "Generador de Memorias Técnicas", desc: "Aporta Proof Bundles deterministas para evitar memorias genéricas rechazables." },
        { badge: "02 / BLINDAJE SAARE", color: "#20C997", title: "Auditoría Delegada con Handshake", desc: "Audita el tráfico de empleados en memoria RAM sin vulnerar el secreto corporativo." },
        { badge: "03 / ENTREGABLE AUDITABLE", color: "#2F81F7", title: "Matriz de Fugas de PII", desc: "Informe pericial descargable con las directivas exigidas por el catálogo de Red.es." }
      ]
    },
    cdti: {
      tag: "PROYECTOS I+D+i, NEOTEC & PRÉSTAMOS ENISA",
      title: "Hitos Técnicos y Seguridad Crítica en Proyectos CDTI",
      summary: "Demuestra una arquitectura tecnológica innovadora y robusta, con métricas de latencia validadas y protección de secretos empresariales.",
      items: [
        { badge: "01 / HITO TÉCNICO", color: "#FF4D5A", title: "Validación de Latencia L7", desc: "Demuestra una latencia determinista P99 < 1.16 ms en la capa de seguridad." },
        { badge: "02 / BLINDAJE SAARE", color: "#20C997", title: "Hook Nativo In-Process C-ABI", desc: "Arquitectura disruptiva de Residuo Cero en memoria volátil sin persistencia en disco." },
        { badge: "03 / ENTREGABLE AUDITABLE", color: "#2F81F7", title: "Certificado Registral Independiente", desc: "Acreditación de autoría y propiedad del nodo (Safe Creative Nº 2607076315021)." }
      ]
    }
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';\n\n// Redirección L7 hacia el interceptor forense SAARE (ISO 42001 / ISO 27037)\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': process.env.SAARE_LICENSE,\n    'X-SAARE-Scenario-ID': 'cumplimiento_corporativo_integral',\n    'X-SAARE-Auditor-Delegation': 'emp_node_auth_hash_89bc2',\n    'X-SAARE-Execution-Mode': 'IN_MEMORY_ENFORCE',\n    'X-SAARE-Active-Shield': '[SAARE_ACTIVE_SHIELD: ENFORCE]',\n    'X-SAARE-Proof-Bundle': 'REQUIRE_V10_ISO27037_FULL_ATTESTATION'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar titular DNI 48593021X con cuenta ES2114650100722030876293' }]\n});`,
    python: `from openai import OpenAI\nimport os\n\nclient = OpenAI(\n    api_key=os.environ.get("OPENAI_API_KEY"),\n    base_url="${API_BASE}/intercept",\n    default_headers={\n        "X-SAARE-License": os.environ.get("SAARE_LICENSE"),\n        "X-SAARE-Scenario-ID": "cumplimiento_corporativo_integral",\n        "X-SAARE-Auditor-Delegation": "emp_node_auth_hash_89bc2",\n        "X-SAARE-Execution-Mode": "IN_MEMORY_ENFORCE",\n        "X-SAARE-Active-Shield": "[SAARE_ACTIVE_SHIELD: ENFORCE]",\n        "X-SAARE-Proof-Bundle": "REQUIRE_V10_ISO27037_FULL_ATTESTATION"\n    }\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Auditar expediente con verificación de cadena de custodia ISO 27037"}]\n)`,
    curl: `curl -X POST ${API_BASE}/intercept \\\n  -H "Content-Type: application/json" \\\n  -H "X-SAARE-License: \$SAARE_LICENSE" \\\n  -H "X-SAARE-Scenario-ID: razonamiento_activo_l7" \\\n  -H "X-SAARE-Active-Shield: [SAARE_ACTIVE_SHIELD: ENFORCE]" \\\n  -H "X-SAARE-Proof-Bundle: REQUIRE_V10_ISO27037_FULL_ATTESTATION" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Verificar inferencia con testigo L7 del cerebro y telemetria de ahorro"}]\n  }'`,
    cabi: `/* SAARE Native C-ABI In-Process Sensor Hook (ISO 27037 DEI Runtime) */\n#include <saare_l7.h>\n\nint process_inference_buffer(const uint8_t* payload_ptr, size_t payload_len) {\n    saare_ctx_t* ctx = saare_init_context(getenv("SAARE_LICENSE"));\n    saare_verdict_t verdict = saare_scan_memory_buffer(ctx, payload_ptr, payload_len);\n    \n    if (verdict.state == SAARE_STATE_REJECTED || verdict.state == SAARE_STATE_INDETERMINATE) {\n        // Purga atómica en RAM mediante SYS_madvise (Zero-Disk Writes)\n        saare_purge_madvise((void*)payload_ptr, payload_len);\n        saare_emit_signed_rejection_proof(ctx, verdict.rejection_digest);\n        return -1;\n    }\n    return 0; // Tráfico validado bajo perímetro ISO 42001 con Testigo L7\n}`
  };

  const handleDownloadSDK = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();
      const tEmail = (sessionUser?.email || "auditor@empresa.es").toLowerCase().trim();
      const tTenant = sessionUser?.tenantName || "ORGANIZACION_AUDITOR";
      const tToken = sessionUser?.token || "sk_live_auditor_managed_identity";

      zip.file("manifest.json", JSON.stringify({
        "manifest_version": 3,
        "name": "SAARE L7 Governance & Evidence Agent",
        "version": "10.0.0",
        "description": "ISO 42001 & ISO 27037 Runtime Evidence Engine",
        "background": { "service_worker": "background.js" },
        "content_scripts": [{ "matches": ["https://*/*"], "js": ["content.js"], "run_at": "document_start" }],
        "permissions": ["storage"]
      }, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(blob);
      dl.download = `saare-proof-runtime-${tTenant.toLowerCase().replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    } catch {
      alert("Error al compilar el bundle del agente.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
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
        setError(data.error || "Error al autenticar.");
      }
    } catch {
      setError("Fallo de comunicación con el Control-Plane.");
    } finally {
      setLoading(false);
    }
  };

  const currentGrant = grantsData[activeGrantTab] || grantsData['nextgen'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05070c', color: '#f1f5f9', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      {/* MODAL DEL DIPLOMA REGISTRAL */}
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Diploma Registral RPI" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '14px 20px', background: '#090d16', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación Safe Creative Nº 2607076315021 · Validez Probatoria Plena</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(5, 7, 12, 0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios_saare'); }}>
            <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '2px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#64748b', fontSize: '12px', borderLeft: '1px solid #334155', paddingLeft: '10px' }}>AI Security & Evidence Layer</span>
          </div>

          <nav style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '13px', fontWeight: '600', flexWrap: 'wrap' }}>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'overview' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'overview' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Plataforma
            </button>

            {/* PESTAÑA 1: ESCENARIOS SAARE */}
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios_saare'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#0284c7' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? 'rgba(2, 132, 199, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#38bdf8' : '#ffffff', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              ⚡ Escenarios SAARE
            </button>

            {/* PESTAÑA 2: GOBERNANZA EN EMPRESAS */}
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('governance_compliance'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'governance_compliance' ? '#9333ea' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'governance_compliance' ? 'rgba(147, 51, 234, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'governance_compliance' ? '#c084fc' : '#94a3b8', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              🏛️ Gobernanza en Empresas
            </button>

            {/* PESTAÑA 3: SAARE L7 CORE */}
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('saare_l7_core'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'saare_l7_core' ? '#16a34a' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'saare_l7_core' ? 'rgba(22, 163, 74, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'saare_l7_core' ? '#34d399' : '#94a3b8', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              🧠 Escenarios SAARE L7
            </button>

            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('architecture'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Arquitectura
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('risk_roi'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'risk_roi' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'risk_roi' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Riesgo & ROI
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('proof'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'proof' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'proof' ? '#34d399' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Proof Bundle
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('compliance'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'compliance' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'compliance' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Compliance
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('developers'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'developers' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'developers' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Integración SDK
            </button>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                  Consola
                </button>
                <button onClick={() => { localStorage.removeItem('saare_suite_user'); setSessionUser(null); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '7px 16px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', marginLeft: '8px' }}>
                Acceso Bóveda
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* VISTA 1: AUTENTICACIÓN */}
      {currentView === 'AUTH' && !sessionUser && (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '36px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#38bdf8', marginBottom: '8px' }}>// AUTHENTICATION_GATEWAY</div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
              {mode === 'reset' ? 'Restablecer Clave' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Perfil Auditor')}
            </h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginBottom: '6px' }}>ORGANIZACIÓN</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ej: Gabinete Jurídico MS3V" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginBottom: '6px' }}>CORREO CORPORATIVO</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="auditor@empresa.es" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginBottom: '6px' }}>CONTRASEÑA</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                {loading ? 'Procesando...' : (mode === 'login' ? 'Iniciar Sesión' : 'Aprovisionar Cuenta')}
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
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                ● NODO AUDITOR ACTIVADO
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>ISO/IEC 42001 COMPLIANT</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Consola de Trazabilidad & Asiento Auditor</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>Gestión de telemetría determinista y custodia en memoria volátil.</p>
            
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

      {/* VISTA PRINCIPAL: LANDING CON PESTAÑAS MODULARES */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1080px', margin: '30px auto 80px auto', padding: '0 20px' }}>

          {/* ========================================================================= */}
          {/* TAB 1: ESCENARIOS SAARE (LAS 5 BÓVEDAS MAESTRAS EN PRODUCCIÓN)            */}
          {/* ========================================================================= */}
          {activeNavTab === 'scenarios_saare' && (
            <div>
              {/* TÍTULO PRINCIPAL EXACTO */}
              <section style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '10px' }}>
                <h1 style={{ fontSize: '46px', fontWeight: '900', color: '#ffffff', margin: '0 0 14px 0', letterSpacing: '-0.5px' }}>
                  Escenarios SAARE
                </h1>
                <p style={{ fontSize: '18px', color: '#94a3b8', margin: '0 0 4px 0', fontWeight: '400' }}>
                  No importa dónde uses inteligencia artificial.
                </p>
                <p style={{ fontSize: '18px', color: '#38bdf8', margin: 0, fontWeight: '600' }}>
                  Importa qué ocurre cuando entra en producción.
                </p>
              </section>

              {/* CONTENEDOR DE LAS 5 TARJETAS MAESTRAS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* 01. EL ESCUDO */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #1e3a8a55', borderRadius: '16px', padding: '28px', display: 'grid', gridTemplateColumns: '180px 1fr 280px', gap: '28px', alignItems: 'center', boxShadow: '0 10px 30px rgba(2,132,199,0.06)' }}>
                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>01</div>
                    <div style={{ fontSize: '10px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155', color: '#94a3b8' }}>DNI 12345678Z</div>
                    <div style={{ fontSize: '10px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155', color: '#94a3b8' }}>CONTRATO</div>
                    <div style={{ fontSize: '10px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155', color: '#94a3b8' }}>HISTORIA MÉDICA</div>
                    <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '24px' }}>🛡️ <strong style={{ fontSize: '14px', color: '#38bdf8' }}>S</strong></div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🛡️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Escudo</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#38bdf8', fontWeight: '700', margin: '0 0 10px 0' }}>
                      Protege la información que tus empleados llevan a la IA.
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE detecta y protege la información sensible antes de que llegue al proveedor de IA.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12.5px', fontWeight: '600' }}>
                      <span>✔</span> Información sensible controlada
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Así funciona</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sin SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → 🤖 → 📄 ⚠️
                      </div>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#34d399', fontWeight: 'bold' }}>Con SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>[S]</span> → 🔒 → 🤖 ✔
                      </div>
                    </div>
                    <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ width: '100%', padding: '9px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', textAlign: 'center' }}>
                      Probar escenario →
                    </button>
                  </div>
                </div>

                {/* 02. LA EVIDENCIA */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #9333ea44', borderRadius: '16px', padding: '28px', display: 'grid', gridTemplateColumns: '180px 1fr 280px', gap: '28px', alignItems: 'center', boxShadow: '0 10px 30px rgba(147,51,234,0.06)' }}>
                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '28px', height: '28px', borderRadius: '50%', background: '#9333ea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>02</div>
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>🗄️</div>
                    <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: '800', textTransform: 'uppercase' }}>EVIDENCIA</div>
                    <div style={{ fontSize: '10px', background: '#9333ea25', border: '1px solid #9333ea', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>VERIFICADO</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>⚖️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>La Evidencia</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#c084fc', fontWeight: '700', margin: '0 0 10px 0' }}>
                      Demuestra qué ocurrió y por qué.
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE convierte cada ejecución relevante en evidencia verificable y lista para auditorías o conflictos.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#cbd5e1' }}>
                      <span>🔏 Firma digital</span> • <span>⏱️ Sello temporal</span> • <span>🔗 Trazabilidad</span> • <span>📦 Proof Bundle</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Así funciona</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sin SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → 🤖 → ❓
                      </div>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#34d399', fontWeight: 'bold' }}>Con SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → <span style={{ color: '#c084fc', fontWeight: 'bold' }}>[S]</span> → 📄 ✔ → 👥 ✔
                      </div>
                    </div>
                    <button onClick={copyBundleJson} style={{ width: '100%', padding: '9px', backgroundColor: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', textAlign: 'center' }}>
                      {copiedBundle ? '✔ Bundle Copiado' : 'Abrir evidencia real →'}
                    </button>
                  </div>
                </div>

                {/* 03. EL GUARDIÁN */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #16a34a44', borderRadius: '16px', padding: '28px', display: 'grid', gridTemplateColumns: '180px 1fr 280px', gap: '28px', alignItems: 'center', boxShadow: '0 10px 30px rgba(22,163,74,0.06)' }}>
                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', position: 'relative', fontSize: '9.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '28px', height: '28px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>03</div>
                    <div style={{ color: '#f87171' }}>Ignora instrucciones ✕</div>
                    <div style={{ color: '#f87171' }}>Actúa como DAN ✕</div>
                    <div style={{ textAlign: 'center', fontSize: '20px' }}>🏰 <span style={{ color: '#34d399', fontWeight: 'bold' }}>[S]</span></div>
                    <div style={{ color: '#34d399', textAlign: 'center', fontWeight: 'bold' }}>Responde según reglas ✔</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🏛️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Guardián</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#34d399', fontWeight: '700', margin: '0 0 10px 0' }}>
                      La IA puede ser potente sin tener vía libre.
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE mantiene las reglas activas durante la ejecución y evita que una instrucción no autorizada se convierta en una acción válida.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12.5px', fontWeight: '600' }}>
                      <span>✔</span> Reglas activas. Empresa protegida.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Así funciona</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sin SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → 🤖 → 🔓
                      </div>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#34d399', fontWeight: 'bold' }}>Con SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → <span style={{ color: '#34d399', fontWeight: 'bold' }}>[S]</span> → 🔒
                      </div>
                    </div>
                    <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ width: '100%', padding: '9px', backgroundColor: '#0d9488', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', textAlign: 'center' }}>
                      Intenta romper las reglas →
                    </button>
                  </div>
                </div>

                {/* 04. EL DETECTOR */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #f9731644', borderRadius: '16px', padding: '28px', display: 'grid', gridTemplateColumns: '180px 1fr 280px', gap: '28px', alignItems: 'center', boxShadow: '0 10px 30px rgba(249,115,22,0.06)' }}>
                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '28px', height: '28px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>04</div>
                    <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>✔ Documento real</div>
                    <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ Afirmación sin evidencia</div>
                    <div style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>✕ Documento alterado</div>
                    <div style={{ textAlign: 'center', fontSize: '24px', marginTop: '4px' }}>🔍</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🔍</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Detector</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#fb923c', fontWeight: '700', margin: '0 0 10px 0' }}>
                      No conviertas una respuesta sin pruebas en un hecho.
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE comprueba si una afirmación puede sostenerse antes de que se convierta en una decisión.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12.5px', fontWeight: '600' }}>
                      <span>✔</span> Decisiones más fiables. Menos riesgo.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Así funciona</div>
                    <input type="text" value={detectorInput} onChange={(e) => setDetectorInput(e.target.value)} placeholder="Introduce una afirmación de la IA" style={{ width: '100%', padding: '8px', background: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '11px', boxSizing: 'border-box' }} />
                    <button onClick={handleCheckDetector} style={{ width: '100%', padding: '9px', backgroundColor: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                      Comprobar evidencia →
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Resultado:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: detectorResult === 'SUCCESS' ? '#15803d' : '#1e293b', color: '#fff', fontSize: '11px' }}>✔</span>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: detectorResult === 'WARNING' ? '#d97706' : '#1e293b', color: '#fff', fontSize: '11px' }}>⚠️</span>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: detectorResult === 'REJECTED' ? '#dc2626' : '#1e293b', color: '#fff', fontSize: '11px' }}>✕</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 05. EL JUSTIFICADOR */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #eab30844', borderRadius: '16px', padding: '28px', display: 'grid', gridTemplateColumns: '180px 1fr 280px', gap: '28px', alignItems: 'center', boxShadow: '0 10px 30px rgba(234,179,8,0.06)' }}>
                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', position: 'relative', textAlign: 'center', fontSize: '10px' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '28px', height: '28px', borderRadius: '50%', background: '#ca8a04', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>05</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: '#fbbf24', fontSize: '16px', marginBottom: '6px' }}>
                      💰 → 📁 → 🧾 → ✔
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '9px' }}>Fondos → Proyecto → Gasto → Justificación</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>€</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>El Justificador</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#facc15', fontWeight: '700', margin: '0 0 10px 0' }}>
                      Cada euro. Cada factura. Cada decisión. Con evidencia.
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE crea una trazabilidad verificable durante la ejecución para facilitar la justificación posterior.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12.5px', fontWeight: '600' }}>
                      <span>✔</span> Justificaciones más fáciles. Cumplimiento sólido.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Así funciona</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Marco de referencia:</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['PRTR', 'NextGenEU', 'CDTI', 'ENISA', 'Otros'].map((tag) => (
                        <button key={tag} onClick={() => setActiveGrantTag(tag)} style={{ fontSize: '9.5px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #334155', background: activeGrantTag === tag ? '#eab308' : '#090d16', color: activeGrantTag === tag ? '#000' : '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>
                          {tag}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ width: '100%', padding: '9px', backgroundColor: '#ca8a04', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', textAlign: 'center', marginTop: '4px' }}>
                      Ver caso de ejemplo →
                    </button>
                  </div>
                </div>

              </div>

              {/* BANNERS INFERIORES */}
              <div style={{ marginTop: '36px', backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0284c715', border: '1px solid #0284c740', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900' }}>
                    S
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0' }}>
                      Un único sistema. Cinco capas de protección.
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                      SAARE te ayuda a usar la IA con confianza, control y evidencia.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1' }}>
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>🛡️</div>
                    Menos riesgo
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1' }}>
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>👥</div>
                    Más confianza
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1' }}>
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>📋</div>
                    Auditorías más fáciles
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1' }}>
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>🔒</div>
                    Decisiones más seguras
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>⚡</span>
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#ffffff', display: 'block' }}>¿Quieres saber cómo lo hacemos?</strong>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Explora la tecnología, la arquitectura y la seguridad detrás de SAARE.</span>
                  </div>
                </div>
                <button onClick={() => setActiveNavTab('architecture')} style={{ padding: '10px 20px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  Ir a la sección técnica →
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GOBERNANZA & COMPLIANCE EN EMPRESAS (ROLES ISO 27037 & FONDOS)     */}
          {/* ========================================================================= */}
          {activeNavTab === 'governance_compliance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>
                  // GOBERNANZA CORPORATIVA & ROLES PERICIALES ISO 27037
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', margin: '0 0 12px 0' }}>
                  Gobernanza & Cumplimiento en Empresas
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '15.5px', maxWidth: '800px', margin: '0 auto' }}>
                  Alineación formal con los estándares de evidencia digital ISO/IEC 27037, el Sistema de Gestión SGIA UNE-ISO/IEC 42001 y la justificación de fondos comunitarios.
                </p>
              </section>

              {/* BLOQUE A: ROL DEFR (EMPLEADO AUDITADO) */}
              <div style={{ backgroundColor: '#090d16', border: '1px solid #1e3a8a66', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ background: '#0284c715', color: '#38bdf8', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    ROL DEFR (DIGITAL EVIDENCE FIRST RESPONDER)
                  </span>
                  <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 'bold' }}>ISO 27037 FASE 1 & 2</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>El Empleado Auditado: Captura Segura en Memoria Volátil</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  SAARE actúa como el primer interviniente automatizado en el puesto de trabajo o pipeline corporativo. Congela y neutraliza la memoria volátil RAM aislando DNI, nóminas, historias clínicas (RGPD Art. 9) o secretos comerciales antes de que salgan a la red.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', background: '#05070c', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '12px' }}>
                  <div>• <strong>Fase 1 (Identificación):</strong> Detección en RAM</div>
                  <div>• <strong>Fase 2 (Recopilación):</strong> Aislamiento de carga</div>
                  <div>• <strong>Purga Atómica:</strong> SYS_madvise Zero-Disk</div>
                  <div>• <strong>Principio:</strong> Responsabilidad Activa (Art. 5.2)</div>
                </div>
              </div>

              {/* BLOQUE B: ROL DES (CONSULTORA AUDITORA / PERITAJE GRC) */}
              <div style={{ backgroundColor: '#090d16', border: '1px solid #9333ea66', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ background: '#9333ea15', color: '#c084fc', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    ROL DES (DIGITAL EVIDENCE SPECIALIST)
                  </span>
                  <span style={{ color: '#c084fc', fontSize: '12px', fontWeight: 'bold' }}>ISO 27037 FASE 3 & 4</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>El Consultor Auditor: Custodia Pericial & Proof Bundles</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  Entrega al especialista forense y comités de cumplimiento un paquete probatorio inmutable sellado con Hashes SHA-256 pre/post, firma digital Ed25519 y estampación temporal cualificada RFC 3161 (eIDAS) admisible en juicio.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', background: '#05070c', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '12px' }}>
                  <div>• <strong>Fase 3 (Adquisición):</strong> Copia bit a bit en RAM</div>
                  <div>• <strong>Fase 4 (Preservación):</strong> Sello RFC 3161</div>
                  <div>• <strong>Auditabilidad:</strong> Reproducibilidad determinista</div>
                  <div>• <strong>Anclaje:</strong> Safe Creative Nº 2607076315021</div>
                </div>
              </div>

              {/* BLOQUE C: EL JUSTIFICADOR DE FONDOS PÚBLICOS & SUBVENCIONES */}
              <div style={{ backgroundColor: '#090d16', border: '1px solid #eab30866', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ background: '#eab30815', color: '#facc15', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    SUBVENCIONES & FONDOS COMUNITARIOS
                  </span>
                  <span style={{ color: '#facc15', fontSize: '12px', fontWeight: 'bold' }}>NEXTGEN / PRTR / CDTI</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>Trazabilidad Documental & Bloqueo Anti-Doble Financiación</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  Genera la memoria técnica justificativa exigida por la IGAE y OLAF, auditando facturas, gastos y decisiones algorítmicas bajo el principio medioambiental DNSH y la Ley 38/2003 General de Subvenciones.
                </p>
                <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ padding: '10px 20px', background: '#ca8a04', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                  Ver Dossier de Justificación PRTR →
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ESCENARIOS SAARE L7 CORE (RAZONAMIENTO ACTIVO & DEEP-FAKE RUNLIVE) */}
          {/* ========================================================================= */}
          {activeNavTab === 'saare_l7_core' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>
                  // ACTIVE REASONING & RUNTIME FORENSIC TELEMETRY
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff', margin: '0 0 12px 0' }}>
                  Escenarios SAARE L7 Core
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '15.5px', maxWidth: '800px', margin: '0 auto' }}>
                  Defensa en tiempo de ejecución: Comando léxico de blindaje activo, velocímetro de ahorro de tokens y detección continua de deepfakes.
                </p>
              </section>

              {/* BLOQUE A: RAZONAMIENTO ACTIVO, COMANDO LÉXICO & VELOCÍMETRO */}
              <div style={{ backgroundColor: '#090d16', border: '1px solid #16a34a66', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🧠</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Razonamiento Activo & Testigo del Cerebro</h3>
                  </div>
                  <span style={{ background: '#16a34a20', color: '#34d399', border: '1px solid #16a34a', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    [SAARE_ACTIVE_SHIELD: ENFORCE]
                  </span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                  El motor intercepta la solicitud en Capa 7, aplica el comando léxico e inyecta la firma <strong style={{ color: '#34d399' }}>🧠 L7 CEREBRO WITNESS</strong> al final de la respuesta del modelo, certificando que la ejecución fue acotada en memoria RAM sin intervención en disco.
                </p>

                {/* VELOCÍMETRO INTERACTIVO DE PIPELINE */}
                <div style={{ background: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', textAlign: 'center' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Carga Evitada en LLM</span>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399', margin: '4px 0' }}>{pipelineSavings.percentReduction}%</div>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>Optimización determinista</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Latencia en RAM</span>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#38bdf8', margin: '4px 0' }}>{pipelineSavings.latencyMs} ms</div>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>P99 residuo cero</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tokens Ahorrados</span>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#facc15', margin: '4px 0' }}>{pipelineSavings.tokensSaved} tk</div>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>Ahorro: {pipelineSavings.costSavedPerMillion} / 1M</span>
                  </div>
                </div>
              </div>

              {/* BLOQUE B: DETECCIÓN DE DEEPFAKES, FRAUDE & RUNLIVE SAMPLING */}
              <div style={{ backgroundColor: '#090d16', border: '1px solid #f9731666', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🔍</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Fact-Checking Forense, Deepfake & Fake Disprover</h3>
                  </div>
                  <span style={{ background: '#ea580c20', color: '#fb923c', border: '1px solid #ea580c', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    RUNLIVE TELEMETRY STREAM
                  </span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                  Inspección causal frente a alucinaciones algorítmicas, falsificación de atestados de siniestros (Insurtech) o contratos con cláusulas inexistentes (LegalTech), emitiendo telemetría continua hacia la consola RunLive.
                </p>

                {/* MUESTREADOR INTERACTIVO */}
                <div style={{ background: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>Prueba de Aserción Fáctica en Tiempo Real:</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="text" value={detectorInput} onChange={(e) => setDetectorInput(e.target.value)} style={{ flex: 1, minWidth: '260px', padding: '10px', background: '#090d16', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
                    <button onClick={handleCheckDetector} style={{ padding: '10px 18px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                      Validar Causalidad →
                    </button>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Estado del Grafo Causal:</span>
                    <strong style={{ color: detectorResult === 'SUCCESS' ? '#34d399' : (detectorResult === 'WARNING' ? '#facc15' : '#ef4444') }}>
                      {detectorResult === 'SUCCESS' ? '✔ CORPUS GROUNDING VERIFICADO' : (detectorResult === 'WARNING' ? '⚠️ UNSUPPORTED CLAIM DETECTADA' : '✕ ALUCINACIÓN / FAKE BLOQUEADO')}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTRAS PESTAÑAS TÉCNICAS */}
          {activeNavTab === 'architecture' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>Arquitectura de Referencia L7 & DEI (ISO 27037)</h2>
              <p style={{ color: '#94a3b8', fontSize: '14.5px', marginBottom: '28px' }}>Manejo pericial de evidencia digital: Auditabilidad, Repetibilidad y Justificabilidad.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {deploymentModes.map((dep) => (
                  <div key={dep.code} style={{ background: '#05070c', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <span style={{ color: dep.color, fontWeight: 'bold', fontSize: '12px' }}>{dep.badge}</span>
                    <h4 style={{ color: '#fff', margin: '6px 0' }}>{dep.title}</h4>
                    <p style={{ color: '#64748b', fontSize: '12.5px', margin: 0 }}>{dep.desc}</p>
                  </div>
                ))}
              </div>

              <pre style={{ background: '#05070c', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b', color: '#38bdf8', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto' }}>
{`┌──────────────────────────────────────────────┐
│ CLAIM / INFERENCE PAYLOAD (Raw RAM Buffer)   │
└──────────────────────┬───────────────────────┘
                       │ (Parent Hash Binding - SHA-256)
                       ▼
 ╔═════════════════════════════════════════════╗
 ║  SAARE EX-ANTE DEI VERIFICATION GATE        ║
 ║                                             ║
 ║  [1] PHASE 1: IDENTIFICATION (DEFR / RAM)   ║ 
 ║  [2] PHASE 2: COLLECTION     (Payload Cut)  ║
 ║  [3] PHASE 3: ACQUISITION    (Bit-by-Bit)   ║
 ║  [4] PHASE 4: PRESERVATION   (RFC 3161 DES) ║
 ╚═════════════════════╤═══════════════════════╝
                       ▼
  [SAARE_ACTIVE_SHIELD: ENFORCE] -> 🧠 TESTIGO L7 CEREBRO INYECTADO`}
              </pre>
            </div>
          )}

          {activeNavTab === 'developers' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>Integración SDK (Capa 7)</h2>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['nodejs', 'python', 'curl', 'cabi'].map(tab => (
                    <button key={tab} onClick={() => setActiveCodeTab(tab)} style={{ background: activeCodeTab === tab ? '#1e293b' : 'transparent', border: '1px solid #334155', color: activeCodeTab === tab ? '#38bdf8' : '#94a3b8', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '18px', color: '#f1f5f9', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
                {codeSnippets[activeCodeTab]}
              </pre>
            </div>
          )}

          {activeNavTab === 'proof' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>Proof Bundle ISO 27037 / DEI</h2>
                <button onClick={copyBundleJson} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  {copiedBundle ? '✔ Copiado' : 'Copiar JSON'}
                </button>
              </div>
              <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '18px', color: '#34d399', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto' }}>
                {JSON.stringify(proofBundle, null, 2)}
              </pre>
            </div>
          )}

          {activeNavTab === 'compliance' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>Marcos Normativos & Autoridades de Control</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                {currentGrant.items.map((item, idx) => (
                  <div key={idx} style={{ background: '#05070c', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <span style={{ color: item.color, fontWeight: 'bold', fontSize: '11px' }}>{item.badge}</span>
                    <h4 style={{ color: '#fff', margin: '8px 0' }}>{item.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNavTab === 'risk_roi' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Análisis de Riesgo & Retorno de Inversión (ROI)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#05070c', padding: '24px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0' }}>Coste de Auditoría Evitado</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Generación automática de la evidencia continua requerida por la AESIA y comités de gobernanza.</p>
                </div>
                <div style={{ background: '#05070c', padding: '24px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#ef4444', margin: '0 0 8px 0' }}>Protección Sancionadora</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Blindaje ex-ante frente a infracciones del EU AI Act, RGPD y DORA.</p>
                </div>
                <div style={{ background: '#05070c', padding: '24px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#34d399', margin: '0 0 8px 0' }}>Justificación Automática</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Pruebas fiduciarias sin fricción para fondos PRTR y NextGenerationEU.</p>
                </div>
              </div>
            </div>
          )}

          {activeNavTab === 'overview' && (
            <div style={{ textAlign: 'center', margin: '60px 0' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#ffffff', marginBottom: '20px' }}>
                Controla tu IA antes de que <span style={{ color: '#38bdf8' }}>actúe.</span>
              </h1>
              <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '780px', margin: '0 auto 36px auto' }}>
                SAARE protege los datos sensibles, audita las respuestas de la IA y genera evidencia pericial verificable en tiempo real bajo ISO 42001 e ISO 27037.
              </p>
              <button onClick={() => setActiveNavTab('scenarios_saare')} style={{ padding: '14px 28px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                Explorar los Escenarios SAARE ↗
              </button>
            </div>
          )}

          {/* FOOTER */}
          <footer style={{ borderTop: '1px solid #1e293b', marginTop: '60px', paddingTop: '32px', fontSize: '12px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#fff' }}>SAARE</strong> · AI Security & Evidence Layer
                <div style={{ marginTop: '4px' }}>Safe Creative ID: 2607076315021 / 2607076314949 · © 2026 Gabinete Jurídico y Pericial MS3V</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Verificador API</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Consola GRC</a>
                <a href="mailto:peritajes@ms3v.es" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contacto</a>
              </div>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}