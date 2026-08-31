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

  // Estados interactivos para las 5 Bóvedas Maestras
  const [detectorInput, setDetectorInput] = useState('El balance contable auditado muestra un beneficio neto no contrastado de 450.000 € imputado al expediente.');
  const [detectorResult, setDetectorResult] = useState('WARNING');
  const [activeGrantTag, setActiveGrantTag] = useState('NextGenEU');

  // Estado dinámico del Velocímetro de Ahorro L7 y Testigo del Cerebro
  const [pipelineSavings] = useState({
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
    if (text.includes("no contrastado") || text.includes("sin prueba") || text.includes("indeterminado")) {
      setDetectorResult('WARNING');
    } else if (text.includes("falso") || text.includes("alterado") || text.includes("inventar") || text.includes("ignora") || text.includes("deepfake")) {
      setDetectorResult('REJECTED');
    } else {
      setDetectorResult('SUCCESS');
    }
  };

  const proofBundle = {
    "PROOF_BUNDLE_SCHEMA": "SAARE_PROOF_BUNDLE_V10.0_ISO27037_DEI",
    "ATTESTATION_METADATA": {
      "BUNDLE_ID": "PB-2026-0829-7F82A1",
      "PARENT_HASH": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "CONTEXT_ID": "SAARE-RECON-VALID-2026-CORE-0521",
      "REGISTRATION_ANCHOR": "Safe Creative Record 2607076315021",
      "ENVIRONMENT": "CORPORATE_ISOLATED_SECURE_RAM",
      "CHAIN_OF_CUSTODY_STANDARD": "ISO/IEC 27037:2012 (DEFR / DES Framework)"
    },
    "FORENSIC_ROLES_ISO_27037": {
      "DEFR": {
        "ROLE_NAME": "Digital Evidence First Responder (Sensor Perimetral Runtime L7)",
        "SCENARIO_BINDING": "01_PREVENT_EL_ESCUDO",
        "ACTION": "RAM_VOLATILE_BUFFER_ISOLATION",
        "STATUS": "ACQUIRED_ZERO_DISK_SYS_MADVISE"
      },
      "DES": {
        "ROLE_NAME": "Digital Evidence Specialist (Consola Auditora GRC / Perito Judicial)",
        "SCENARIO_BINDING": "04_PROVE_LA_EVIDENCIA",
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
      "SECURITY_PROTOCOL_DIRECTIVE": "Activa el protocolo S.A.A.R.E. en Modo Seguridad. Despliega filtros perimetrales y de mitigación en tiempo real para contrarrestar vulnerabilidades lógicas.",
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
    "SIGNATURES_AND_TRUST": {
      "PRIMARY_SIGNATURE": { "ALGORITHM": "Ed25519", "DIGEST": CANONICAL_HASH },
      "TIME_STAMP_AUTHORITY": { "STANDARD": "RFC 3161", "TSA_RECORD": "QUALIFIED_TRUST_ANCHOR_EIDAS" }
    }
  };

  // Mapeo de las 5 Patas Comerciales con sus imágenes 101 a 105
  const deploymentModes = [
    {
      code: "IPaaS",
      title: "01. Plataformas de Automatización & Agentes IA",
      desc: "Integración middleware en flujos de trabajo (n8n, LangChain, Make, CrewAI). Intercepta variables de entrada ex-ante antes de invocar el modelo.",
      badge: "REVENUE SHARING / ADD-ON",
      color: "#06B6D4",
      icon: "🌐",
      image: "/101.jfif",
      deployInfo: "Dónde: Nodos de ejecución · Cuándo: Pre-invocación LLM · Cómo: Redirección baseURL.",
      codeSnippetKey: "nodejs"
    },
    {
      code: "EMBEDDED",
      title: "02. Fabricantes de Ciberseguridad & EDR/XDR",
      desc: "Sensor L7 nativo In-Process (.so / .dll) integrado en el agente de puesto de trabajo para evitar fugas de información en memoria RAM.",
      badge: "LICENCIA OEM / ARR SEAT",
      color: "#20C997",
      icon: "⚡",
      image: "/102.jfif",
      deployInfo: "Dónde: Endpoint cliente · Cuándo: En memoria volátil (<0.017 ms) · Cómo: C-ABI Hook.",
      codeSnippetKey: "cabi"
    },
    {
      code: "GSI",
      title: "03. Grandes Consultoras & Auditoría GRC",
      desc: "Consola multi-inquilino y generación de Proof Bundles sellados para justificación pericial, ISO 42001 e inspecciones de la AESIA.",
      badge: "CANAL ISV & ASIENTO AUDITOR",
      color: "#c084fc",
      icon: "⚖️",
      image: "/103.jfif",
      deployInfo: "Dónde: VPC / Consola SaaS · Cuándo: Auditoría continua · Cómo: Telemetría Ed25519.",
      codeSnippetKey: "python"
    },
    {
      code: "GATEWAY",
      title: "04. Infraestructura Cloud & API Gateways",
      desc: "Filtrado perimetral global en Edge PoPs como proxy inverso L7 con latencia P99 determinista < 1.16 ms y sellado de cabeceras.",
      badge: "PAY-AS-YOU-GO VOLUMEN",
      color: "#2F81F7",
      icon: "📦",
      image: "/104.jfif",
      deployInfo: "Dónde: 300+ Edge PoPs · Cuándo: En tránsito HTTP/S · Cómo: Header L7-SEAL Gate.",
      codeSnippetKey: "curl"
    },
    {
      code: "VERTICAL",
      title: "05. Software Vertical (LegalTech, Salud, FinTech)",
      desc: "Capa de seguridad embebida en aplicaciones de gestión de contratos, expedientes médicos y contabilidad para garantizar compliance.",
      badge: "TIER COMPLIANCE MODE (MRR)",
      color: "#EAB308",
      icon: "🔒",
      image: "/105.jfif",
      deployInfo: "Dónde: Backend transaccional · Cuándo: Al procesar expedientes · Cómo: SAARE SDK.",
      codeSnippetKey: "nodejs"
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
    nodejs: `import OpenAI from 'openai';\n\n// Redirección L7 hacia el interceptor forense SAARE (ISO 42001 / ISO 27037)\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': process.env.SAARE_LICENSE,\n    'X-SAARE-Scenario-ID': 'cumplimiento_corporativo_integral',\n    'X-SAARE-Auditor-Delegation': 'corp_tenant_auth_hash_89bc2',\n    'X-SAARE-Execution-Mode': 'IN_MEMORY_ENFORCE',\n    'X-SAARE-Active-Shield': '[SAARE_ACTIVE_SHIELD: ENFORCE]',\n    'X-SAARE-Proof-Bundle': 'REQUIRE_V10_ISO27037_FULL_ATTESTATION'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [\n    { role: 'system', content: 'Activa el protocolo S.A.A.R.E. en Modo Seguridad. Despliega filtros perimetrales y de mitigación en tiempo real para contrarrestar vulnerabilidades lógicas.' },\n    { role: 'user', content: 'Auditar titular DNI 48593021X con cuenta ES2114650100722030876293' }\n  ]\n});`,
    python: `from openai import OpenAI\nimport os\n\nclient = OpenAI(\n    api_key=os.environ.get("OPENAI_API_KEY"),\n    base_url="${API_BASE}/intercept",\n    default_headers={\n        "X-SAARE-License": os.environ.get("SAARE_LICENSE"),\n        "X-SAARE-Scenario-ID": "razonamiento_activo_l7",\n        "X-SAARE-Auditor-Delegation": "corp_tenant_auth_hash_89bc2",\n        "X-SAARE-Execution-Mode": "IN_MEMORY_ENFORCE",\n        "X-SAARE-Active-Shield": "[SAARE_ACTIVE_SHIELD: ENFORCE]",\n        "X-SAARE-Proof-Bundle": "REQUIRE_V10_ISO27037_FULL_ATTESTATION"\n    }\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[\n        {"role": "system", "content": "Activa el protocolo S.A.A.R.E. en Modo Seguridad. Despliega filtros perimetrales y de mitigación en tiempo real para contrarrestar vulnerabilidades lógicas."},\n        {"role": "user", "content": "Verificar atestado con firma RFC 3161 y testigo L7"}\n    ]\n)`,
    curl: `curl -X POST ${API_BASE}/intercept \\\n  -H "Content-Type: application/json" \\\n  -H "X-SAARE-License: \$SAARE_LICENSE" \\\n  -H "X-SAARE-Scenario-ID: razonamiento_activo_l7" \\\n  -H "X-SAARE-Active-Shield: [SAARE_ACTIVE_SHIELD: ENFORCE]" \\\n  -H "X-SAARE-Proof-Bundle: REQUIRE_V10_ISO27037_FULL_ATTESTATION" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [\n      {"role": "system", "content": "Activa el protocolo S.A.A.R.E. en Modo Seguridad. Despliega filtros perimetrales y de mitigación en tiempo real para contrarrestar vulnerabilidades lógicas."},\n      {"role": "user", "content": "Inferencia con testigo L7 del cerebro y telemetria de ahorro"}\n    ]\n  }'`,
    cabi: `/* SAARE Native C-ABI In-Process Sensor Hook (ISO 27037 DEI Runtime) */\n#include <saare_l7.h>\n\nint process_inference_buffer(const uint8_t* payload_ptr, size_t payload_len) {\n    saare_ctx_t* ctx = saare_init_context(getenv("SAARE_LICENSE"));\n    saare_verdict_t verdict = saare_scan_memory_buffer(ctx, payload_ptr, payload_len);\n    \n    if (verdict.state == SAARE_STATE_REJECTED || verdict.state == SAARE_STATE_INDETERMINATE) {\n        saare_purge_madvise((void*)payload_ptr, payload_len);\n        saare_emit_signed_rejection_proof(ctx, verdict.rejection_digest);\n        return -1;\n    }\n    return 0;\n}`
  };

  const handleDownloadSDK = async () => {
    try {
      setDownloadingZip(true);
      
      const response = await fetch('/saare-extension.zip');
      if (!response.ok) throw new Error("No se pudo cargar el paquete base del agente.");
      
      const zipArrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(zipArrayBuffer);
      
      const tTenant = sessionUser?.tenantName || "ORGANIZACION_AUDITORA";
      const tEmail = sessionUser?.email || "auditor@empresa.com";
      const tToken = sessionUser?.apiKey || sessionUser?.token || "sk_saare_live_session";
      
      const tokenizedManagedConfig = {
        "saare_tenant_domain": { "Value": tTenant },
        "saare_user_email": { "Value": tEmail },
        "saare_api_key": { "Value": tToken },
        "saare_license_type": { "Value": sessionUser?.licenseType || "ASIENTO_AUDITOR_ACTIVO" }
      };

      const tokenizedLocalConfig = {
        "tenantName": tTenant,
        "email": tEmail,
        "token": tToken,
        "configuredAt": new Date().toISOString()
      };

      zip.file("storage_managed.json", JSON.stringify(tokenizedManagedConfig, null, 2));
      zip.file("saare_config.json", JSON.stringify(tokenizedLocalConfig, null, 2));

      const customizedBlob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(customizedBlob);
      dl.download = `saare-agent-${tTenant.toLowerCase().replace(/[^a-z0-9]/g, '_')}-tokenized.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      URL.revokeObjectURL(dl.href);
    } catch (err) {
      alert("Error al compilar el agente tokenizado: " + err.message);
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

          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', fontWeight: '600', flexWrap: 'wrap' }}>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'overview' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'overview' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Plataforma
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios_saare'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#0284c7' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? 'rgba(2, 132, 199, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'scenarios_saare' ? '#38bdf8' : '#ffffff', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              ⚡ Escenarios SAARE
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('cases'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'cases' ? '#9333ea' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'cases' ? 'rgba(147, 51, 234, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'cases' ? '#c084fc' : '#94a3b8', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              🏛️ Casos de Uso & Negocio
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('architecture'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#38bdf8' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'architecture' ? 'rgba(56, 189, 248, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              🏛️ Arquitectura & Modelos ISV
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
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ej: Entidad Corporativa / Consultora" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginBottom: '6px' }}>CORREO CORPORATIVO</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="auditor@empresa.com" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#05070c', border: '1px solid #334155', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
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

      {/* VISTA PRINCIPAL */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1080px', margin: '30px auto 80px auto', padding: '0 20px' }}>

          {/* TAB 1: ESCENARIOS SAARE (1.jfif a 5.jfif) */}
          {activeNavTab === 'scenarios_saare' && (
            <div>
              <section style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '10px' }}>
                <h1 style={{ fontSize: '46px', fontWeight: '900', color: '#ffffff', margin: '0 0 14px 0', letterSpacing: '-0.5px' }}>
                  Cinco formas de proteger tu IA
                </h1>
                <p style={{ fontSize: '18px', color: '#94a3b8', margin: '0 0 4px 0', fontWeight: '400' }}>
                  No importa dónde uses inteligencia artificial.
                </p>
                <p style={{ fontSize: '18px', color: '#38bdf8', margin: 0, fontWeight: '600' }}>
                  Importa qué ocurre cuando entra en producción.
                </p>
              </section>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* 01. PREVENT — EL ESCUDO */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #1e3a8a55', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(2,132,199,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>01</div>
                    <img 
                      src="/1.jfif" 
                      alt="01. El Escudo - SAARE L7" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/saare-brand-header.jpg'; }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🛡️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>01. PREVENT — El Escudo (DEFR)</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#38bdf8', fontWeight: '700', margin: '0 0 10px 0' }}>
                      Protege la información que tus empleados llevan a la IA (Rol DEFR ISO 27037).
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE actúa como primer interviniente automatizado en memoria RAM, neutralizando la fuga de PII, secretos corporativos y datos médicos antes de salir al proveedor de IA.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12.5px', fontWeight: '600' }}>
                      <span>✔</span> Información sensible controlada bajo ISO 27037 Fase 1 & 2
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

                {/* 02. ENFORCE — EL GUARDIÁN */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #16a34a44', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(22,163,74,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>02</div>
                    <img 
                      src="/3.jfif" 
                      alt="02. Razonamiento Activo - SAARE L7" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/saare-brand-header.jpg'; }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '22px' }}>🧠</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>02. ENFORCE — Razonamiento Activo</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#34d399', fontWeight: '700', margin: '0 0 10px 0' }}>
                      Protocolo S.A.A.R.E. en Modo Seguridad & Testigo L7 CEREBRO.
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.55, margin: '0 0 14px 0', background: 'rgba(22, 163, 74, 0.08)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #16a34a' }}>
                      <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '4px', fontSize: '11.5px', fontFamily: 'monospace' }}>DIRECTIVA DE MITIGACIÓN LÓGICA:</strong>
                      "Activa el protocolo S.A.A.R.E. en Modo Seguridad. Despliega filtros perimetrales y de mitigación en tiempo real para contrarrestar vulnerabilidades lógicas, inyecciones adversarias y estampar el testigo 🧠 L7 CEREBRO en la inferencia."
                    </p>

                    <div style={{ background: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Ahorro de Pipeline por Inferencia</span>
                        <strong style={{ color: '#34d399', fontSize: '13.5px' }}>{pipelineSavings.percentReduction}% Carga Evitada</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#38bdf8', fontSize: '11.5px', fontFamily: 'monospace' }}>⚡ {pipelineSavings.latencyMs} ms RAM</span>
                        <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>{pipelineSavings.tokensSaved} tk ahorrados</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Así funciona</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sin SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → 🤖 → 🔓 <span style={{ color: '#ef4444', fontSize: '10px' }}>Vulnerabilidad lógica</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      <span style={{ color: '#34d399', fontWeight: 'bold' }}>Con SAARE</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#cbd5e1' }}>
                        👤 → <span style={{ color: '#34d399', fontWeight: 'bold' }}>[S] Modo Seguridad</span> → 🧠 L7
                      </div>
                    </div>
                    <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ width: '100%', padding: '9px', backgroundColor: '#0d9488', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', textAlign: 'center' }}>
                      Probar Modo Seguridad →
                    </button>
                  </div>
                </div>

                {/* 03. VERIFY — EL DETECTOR */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #f9731644', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(249,115,22,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>03</div>
                    <img 
                      src="/4.jfif" 
                      alt="03. El Detector - SAARE L7" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/saare-brand-header.jpg'; }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🔍</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>03. VERIFY — El Detector</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#fb923c', fontWeight: '700', margin: '0 0 10px 0' }}>
                      No conviertas una respuesta sin pruebas en un hecho.
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE comprueba mediante *Corpus Grounding* si una afirmación puede sostenerse antes de que se convierta en una decisión operativa.
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
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: detectorResult === 'SUCCESS' ? '#15803d' : '#1e293b', color: '#fff', fontSize: '11px' }}>✔ Conforme</span>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: detectorResult === 'WARNING' ? '#d97706' : '#1e293b', color: '#fff', fontSize: '11px' }}>⚠️ Duda</span>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: detectorResult === 'REJECTED' ? '#dc2626' : '#1e293b', color: '#fff', fontSize: '11px' }}>✕ Bloqueo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 04. PROVE — LA EVIDENCIA */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #9333ea44', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(147,51,234,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#9333ea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>04</div>
                    <img 
                      src="/2.jfif" 
                      alt="04. La Evidencia - SAARE L7" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/saare-brand-header.jpg'; }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>⚖️</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>04. PROVE — La Evidencia (DES)</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#c084fc', fontWeight: '700', margin: '0 0 10px 0' }}>
                      Demuestra qué ocurrió y por qué (Rol DES ISO 27037).
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE convierte cada ejecución relevante en evidencia verificable con sellos de tiempo cualificados RFC 3161 y anclaje registral independiente.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#cbd5e1' }}>
                      <span>🔏 Ed25519</span> • <span>⏱️ RFC 3161</span> • <span>🔗 Trazabilidad</span> • <span>📦 Proof Bundle</span>
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

                {/* 05. JUSTIFY — EL JUSTIFICADOR */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #eab30844', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', alignItems: 'center', boxShadow: '0 10px 30px rgba(234,179,8,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#05070c' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', width: '28px', height: '28px', borderRadius: '50%', background: '#ca8a04', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>05</div>
                    <img 
                      src="/5.jfif" 
                      alt="05. El Justificador - SAARE L7" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/saare-brand-header.jpg'; }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>€</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: 0 }}>05. JUSTIFY — El Justificador</h2>
                    </div>
                    <h3 style={{ fontSize: '15px', color: '#facc15', fontWeight: '700', margin: '0 0 10px 0' }}>
                      Cada euro. Cada factura. Cada decisión. Con evidencia.
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      SAARE crea una trazabilidad verificable durante la ejecución para facilitar la justificación posterior ante la IGAE y OLAF.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12.5px', fontWeight: '600' }}>
                      <span>✔</span> Justificaciones más fáciles. Cumplimiento sólido.
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Así funciona</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Marco de referencia:</div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['PRTR', 'NextGenEU', 'CDTI', 'ENISA', '2 CFR 200'].map((tag) => (
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

              {/* BANNERS INFORMATIVOS */}
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
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Explora la tecnología, los modelos de despliegue y el código SDK detrás de SAARE.</span>
                  </div>
                </div>
                <button onClick={() => setActiveNavTab('architecture')} style={{ padding: '10px 20px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  Ver Arquitectura & Modelos ISV →
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: CASOS DE NEGOCIO (AESIA, PERITAJES Y FONDOS PÚBLICOS) */}
          {activeNavTab === 'cases' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ color: '#c084fc', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                  // ENTERPRISE USE CASES & LEGAL ASSURANCE
                </span>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
                  Casos de Uso Corporativos & Valor Regulatorio
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14.5px', maxWidth: '780px', margin: '0 auto' }}>
                  Transforma la obligación de cumplimiento en una ventaja competitiva blindando la responsabilidad técnica y jurídica de tu entidad.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                
                {/* 1. AUDITORÍAS FORMALES */}
                <div style={{ background: '#05070c', border: '1px solid #1e3a8a', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>🛡️</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Auditorías Formales</h3>
                    </div>
                    <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      AESIA · EU AI ACT · ISO 42001
                    </span>
                    <p style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.55, marginTop: '14px' }}>
                      Acredita ante la <strong>AESIA (Agencia Española de Supervisión de IA)</strong> o comités de gobernanza que los modelos operan con <strong>trazabilidad ex-ante</strong> y sin fugas de datos regulados (PII, nóminas o historias clínicas).
                    </p>
                  </div>
                  <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '14px', marginTop: '16px', fontSize: '12px', color: '#34d399', fontWeight: 'bold' }}>
                    ✔ Evidencia continua en tiempo de ejecución (Runtime Evidence)
                  </div>
                </div>

                {/* 2. PERITAJES JUDICIALES */}
                <div style={{ background: '#05070c', border: '1px solid #9333ea', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>⚖️</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#c084fc', margin: 0 }}>Peritajes Judiciales</h3>
                    </div>
                    <span style={{ background: 'rgba(192, 132, 252, 0.1)', color: '#c084fc', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      ISO 27037 · VALIDEZ PROCESAL PLENA
                    </span>
                    <p style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.55, marginTop: '14px' }}>
                      Sirve como prueba documental y pericial con <strong>plena validez procesal</strong> en litigios sobre propiedad intelectual, revelación de secretos industriales o responsabilidad civil derivada de decisiones algorítmicas.
                    </p>
                  </div>
                  <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '14px', marginTop: '16px', fontSize: '12px', color: '#c084fc', fontWeight: 'bold' }}>
                    ✔ Firma asimétrica Ed25519 y sellos de tiempo RFC 3161 eIDAS
                  </div>
                </div>

                {/* 3. JUSTIFICACIÓN DE FONDOS PÚBLICOS */}
                <div style={{ background: '#05070c', border: '1px solid #ca8a04', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>🏛️</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#facc15', margin: 0 }}>Justificación de Fondos Públicos</h3>
                    </div>
                    <span style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      IGAE · OLAF · PRTR · 2 CFR 200
                    </span>
                    <p style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.55, marginTop: '14px' }}>
                      Demuestra ante la <strong>IGAE y la OLAF</strong> la trazabilidad de facturas, la <strong>ausencia de doble financiación</strong> y el cumplimiento de hitos técnicos y medioambientales (DNSH) en proyectos financiados con fondos <strong>NextGenerationEU, CDTI o PRTR</strong>.
                    </p>
                  </div>
                  <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '14px', marginTop: '16px', fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>
                    ✔ Bloqueo por Hash SHA-256 de facturas y memorias automatizadas
                  </div>
                </div>

              </div>

              <div style={{ textAlign: 'center', background: '#05070c', padding: '20px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: '0 0 14px 0' }}>
                  ¿Necesitas desplegar el asiento auditor para tu consultora o departamento pericial?
                </p>
                <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '12px 28px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: '800', fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>
                  Contratar Asiento Auditor (149 €/mes) ↗
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: ARQUITECTURA & MODELOS ISV CON IMÁGENES 101 A 105 */}
          {activeNavTab === 'architecture' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ color: '#38bdf8', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>
                  // ECOSYSTEM ARCHITECTURE & MONETIZATION
                </span>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '8px 0' }}>
                  Modelos de Despliegue & Código de Integración
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14.5px', maxWidth: '780px', margin: '0 auto' }}>
                  Selecciona la pata comercial de tu interés para ver su topología, modelo de ingresos y el snippet de integración correspondiente.
                </p>
              </div>

              {/* GRID DE LAS 5 PATAS COMERCIALES CON IMÁGENES 101-105 */}
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
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/saare-brand-header.jpg';
                            }}
                          />
                          <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(5,7,12,0.85)', padding: '3px 8px', borderRadius: '4px', border: `1px solid ${dep.color}`, color: dep.color, fontSize: '10px', fontWeight: 'bold' }}>
                            {dep.badge}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '16px' }}>{dep.icon}</span>
                          <h4 style={{ color: '#fff', margin: 0, fontSize: '14.5px', fontWeight: '800' }}>{dep.title}</h4>
                        </div>
                        
                        <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '0 0 12px 0', lineHeight: 1.45 }}>{dep.desc}</p>
                      </div>

                      <div style={{ borderTop: '1px dashed #1e293b', paddingTop: '10px', color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                        {dep.deployInfo}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CONSOLA DE CÓDIGO SDK VINCULADA */}
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                      Implementación Técnica (Capa 7 L7-Gate)
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Pilar seleccionado: <strong style={{ color: '#38bdf8' }}>{deploymentModes.find(d => d.code === selectedArchPillar)?.title}</strong>
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
                          padding: '6px 12px', 
                          borderRadius: '4px', 
                          fontSize: '11.5px', 
                          cursor: 'pointer', 
                          fontWeight: 'bold' 
                        }}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px', color: '#f1f5f9', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.55 }}>
                  {codeSnippets[activeCodeTab]}
                </pre>
              </div>

              {/* DIAGRAMA LÓGICO DE FLUJO */}
              <div style={{ marginTop: '28px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Diagrama de Flujo en Memoria Volátil (Zero-Disk Runtime)
                </div>
                <pre style={{ background: '#05070c', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', color: '#38bdf8', fontSize: '11.5px', fontFamily: 'monospace', overflowX: 'auto', margin: 0 }}>
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
            </div>
          )}

          {/* TAB 4: RISK & ROI */}
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

          {/* TAB 5: PROOF BUNDLE */}
          {activeNavTab === 'proof' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>Proof Bundle ISO 27037 / DEI</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={copyHashToClipboard} style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    {copiedHash ? '✔ Hash Copiado' : 'Copiar Hash'}
                  </button>
                  <button onClick={() => setShowDiploma(true)} style={{ background: '#1e293b', color: '#c084fc', border: '1px solid #9333ea', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    📜 Ver Acreditación Registral
                  </button>
                  <button onClick={copyBundleJson} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    {copiedBundle ? '✔ Copiado' : 'Copiar JSON'}
                  </button>
                </div>
              </div>
              <pre style={{ margin: 0, backgroundColor: '#05070c', border: '1px solid #1e293b', borderRadius: '8px', padding: '18px', color: '#34d399', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto' }}>
                {JSON.stringify(proofBundle, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 6: COMPLIANCE */}
          {activeNavTab === 'compliance' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>Marcos Normativos & Autoridades de Control</h2>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Evidencia fiduciaria para convocatorias y requerimientos de auditoría.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', background: '#05070c', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <button onClick={() => setActiveGrantTab('nextgen')} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: activeGrantTab === 'nextgen' ? '#0284c7' : 'transparent', color: activeGrantTab === 'nextgen' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    NextGenEU / PRTR
                  </button>
                  <button onClick={() => setActiveGrantTab('kit')} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: activeGrantTab === 'kit' ? '#0284c7' : 'transparent', color: activeGrantTab === 'kit' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    Kit Consulting
                  </button>
                  <button onClick={() => setActiveGrantTab('cdti')} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: activeGrantTab === 'cdti' ? '#0284c7' : 'transparent', color: activeGrantTab === 'cdti' ? '#fff' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    CDTI / ENISA
                  </button>
                </div>
              </div>

              <div style={{ background: '#05070c', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{currentGrant.tag}</span>
                <h3 style={{ fontSize: '18px', color: '#fff', margin: '4px 0 8px 0' }}>{currentGrant.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>{currentGrant.summary}</p>
              </div>

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

          {/* TAB 7: OVERVIEW */}
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
                <div style={{ marginTop: '4px' }}>Root Authority Registry: Safe Creative 2607076315021 / 2607076314949 · SAARE Digital Governance</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Verificador API</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>Consola GRC</a>
                <a href="mailto:enterprise.audit@saare.es" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contacto Corporativo</a>
              </div>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}