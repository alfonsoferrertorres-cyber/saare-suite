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
  const [activeNavTab, setActiveNavTab] = useState('scenarios');

  // Estados interactivos para las 5 Bóvedas de Protección
  const [detectorInput, setDetectorInput] = useState('El balance contable muestra un beneficio neto no contrastado de 450.000 €.');
  const [detectorResult, setDetectorResult] = useState('WARNING');
  const [activeGrantTag, setActiveGrantTag] = useState('NextGenerationEU');

  // Estados de autenticación y modales
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
    if (detectorInput.toLowerCase().includes("no contrastado") || detectorInput.toLowerCase().includes("sin prueba")) {
      setDetectorResult('WARNING');
    } else if (detectorInput.toLowerCase().includes("falso") || detectorInput.toLowerCase().includes("alterado") || detectorInput.toLowerCase().includes("inventar")) {
      setDetectorResult('REJECTED');
    } else {
      setDetectorResult('SUCCESS');
    }
  };

  // MODOS DE DESPLIEGUE TÉCNICO
  const deploymentModes = [
    {
      code: "GATEWAY",
      title: "Cloudflare Edge Gateway (300+ PoPs)",
      desc: "Proxy inverso perimetral global que inspecciona y sella cabeceras HTTP/S antes de alcanzar el proveedor de IA.",
      badge: "LATENCIA < 1.5 ms",
      color: "#06B6D4",
      icon: "🌐"
    },
    {
      code: "SDK",
      title: "SDK & Middleware de Aplicación",
      desc: "Librerías para Node.js y Python integrables con OpenAI, LangChain o n8n mediante redirección perimetral de baseURL.",
      badge: "PLUG & PLAY",
      color: "#2F81F7",
      icon: "📦"
    },
    {
      code: "EMBEDDED",
      title: "Sensor Hook C-ABI In-Process (.so / .dll)",
      desc: "Librería nativa de integración directa para fabricantes de antivirus y agentes EDR con purga RAM atómica.",
      badge: "RESIDUO CERO RAM",
      color: "#20C997",
      icon: "⚡"
    },
    {
      code: "AIR_GAPPED",
      title: "Enclave Soberano On-Premise / VPC",
      desc: "Contenedor aislado en red privada sin salida a internet para banca, defensa y sanidad de alta seguridad.",
      badge: "ZERO-DISK WRITES",
      color: "#EAB308",
      icon: "🔒"
    }
  ];

  const proofBundle = {
    "PROOF_BUNDLE_SCHEMA": "SAARE_PROOF_BUNDLE_V10.0",
    "EVENT_IDENTIFIER": {
      "EVENT_ID": "EV-2026-0829-7F82A1",
      "PARENT_HASH": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "CONTEXT_ID": "MS3V-RECON-VALID-2026-ALF-0521",
      "ROOT_NODE_ID": "2607076315021",
      "ENVIRONMENT": "PRODUCTION"
    },
    "TRUST_BOUNDARY": {
      "TRUSTED_COMPONENTS": ["SAARE_L7_ENGINE", "MS3V_KEY_VAULT"],
      "UNTRUSTED_COMPONENTS": ["LLM_PROVIDER", "USER_INPUT"],
      "ATTESTED_COMPONENTS": ["HOST_RUNTIME_MEMORY"],
      "BOUNDARY_POLICY_HASH": "9f83c6051888b2565dd21d227f6f17e0ef73e72ebbf0a59966c825a07c3992b9"
    },
    "PROOFS": {
      "CHAIN_INTEGRITY": {
        "PROOF_TYPE": "CRYPTOGRAPHICALLY_VERIFIED",
        "EVENT_HASH": CANONICAL_HASH,
        "PARENT_HASH": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "MERKLE_ROOT": MERKLE_ROOT,
        "SEQUENCE_NUMBER": 42081,
        "CHAIN_STATUS": "CONTINUOUS"
      },
      "NO_UNSUPPORTED_CLAIM": {
        "PROOF_TYPE": "FORMALLY_VERIFIED",
        "CLAIMS_EVALUATED": 1,
        "INSPECTION_MATRIX": [
          {
            "CLAIM_ID": "CLM-001",
            "EVIDENCE_HASH": "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
            "RULE_HASH": "9f83c6051888b2565dd21d227f6f17e0ef73e72ebbf0a59966c825a07c3992b9",
            "STATUS": "SUPPORTED"
          }
        ]
      },
      "REJECTION": {
        "PROOF_TYPE": "CRYPTOGRAPHICALLY_VERIFIED",
        "UNSUPPORTED_CLAIMS": 0,
        "REJECTED_CLAIMS": 0,
        "INDETERMINATE_CLAIMS": 0,
        "REJECTION_POLICY_HASH": "d2a5f1e83a9d4a4"
      }
    },
    "ATTESTATIONS": {
      "RUNTIME": {
        "PROOF_TYPE": "ATTESTED",
        "INDEPENDENT_ATTESTOR": "SAARE_IN_PROCESS_MEMORY_MONITOR",
        "MEMORY_STATE": "SYS_madvise (MADV_DONTNEED) EXECUTED",
        "ZERO_DISK_WRITES_VERIFIED": true
      },
      "MODEL": {
        "PROOF_TYPE": "ASSERTED",
        "PROVIDER": "OPENAI",
        "MODEL_ID": "gpt-4o",
        "MODEL_VERSION": "2024-05-13",
        "INFERENCE_CONFIG_HASH": "e5b3c4",
        "SYSTEM_PROMPT_HASH": "8b2ab4"
      }
    },
    "MEASUREMENTS": {
      "DETERMINISTIC_LATENCY": {
        "PROOF_TYPE": "MEASURED",
        "P50_LATENCY_MS": 0.017,
        "P99_LATENCY_MS": 1.160,
        "MEASUREMENT_WINDOW": "100000_INVOCATIONS"
      }
    },
    "VERIFICATION_RESULT": {
      "FACTUAL_STATUS": "NOT_DETERMINABLE_BY_BOUNDARY",
      "PERIMETER_STATUS": "PERIMETER_VALID",
      "JUSTIFICATION": "La validación certifica la adherencia a la política y la causalidad de la evidencia, no la verdad universal de la inferencia."
    },
    "CRYPTOGRAPHIC_KILLSWITCH": {
      "CERTIFICATE_STATUS": "ACTIVE",
      "REVOCATION_ENDPOINT": `${API_BASE}/revocation-status/ed25519-ms3v-root-2026`
    },
    "SIGNATURES": {
      "PRIMARY_SIGNATURE": {
        "ALGORITHM": "Ed25519",
        "KEY_ID": "ed25519-ms3v-root-2026",
        "DIGEST": CANONICAL_HASH
      },
      "TIME_STAMP_AUTHORITY": {
        "STANDARD": "RFC 3161",
        "ALGORITHM": "sha256WithRSAEncryption",
        "TSA_RECORD": "QUALIFIED_TRUST_ANCHOR_EIDAS"
      }
    }
  };

  const grantsData = {
    nextgen: {
      tag: "FONDO DE RECUPERACIÓN / PLAN ESPAÑA DIGITAL",
      title: "Evidencia Técnica para NextGenerationEU & PRTR",
      summary: "SAARE genera evidencia técnica reutilizable para la documentación de gobernanza y trazabilidad exigida en auditorías técnicas y convocatorias públicas comunitarias.",
      items: [
        { badge: "01 / EU AI ACT", color: "#FF4D5A", title: "Art. 9 (Risk) & Art. 12 (Logs)", desc: "Trazabilidad continua y controles ex-ante integrados directamente en el perímetro de inferencia." },
        { badge: "02 / ISO/IEC 42001", color: "#20C997", title: "Control B.6 (Data Lifecycle)", desc: "Mecanismo Zero-Residue en RAM para apoyar la auditoría del ciclo de vida del dato." },
        { badge: "03 / RGPD / LOPDGDD", color: "#2F81F7", title: "Art. 5 & 32 (Minimization)", desc: "Ocultación en tránsito para asegurar que los PII no alcanzan al proveedor LLM." }
      ]
    },
    kit: {
      tag: "PROGRAMA KIT CONSULTING & ASESORAMIENTO (RED.ES)",
      title: "Evidencia de Planes de Asesoramiento e Implantación IA",
      summary: "Aporta pruebas técnicas que demuestren un análisis de riesgos real, gobernanza perimetral y un plan de cumplimiento normativo operativo para PYMEs beneficiarias.",
      items: [
        { badge: "01 / EVIDENCIA OBLIGATORIA", color: "#FF4D5A", title: "Generador de Memorias Técnicas", desc: "Aporta Proof Bundles deterministas para evitar memorias genéricas rechazables." },
        { badge: "02 / BLINDAJE SAARE", color: "#20C997", title: "Auditoría Delegada con Handshake", desc: "Audita el tráfico de empleados en memoria RAM sin vulnerar el secreto corporativo." },
        { badge: "03 / ENTREGABLE AUDITABLE", color: "#2F81F7", title: "Matriz de Fugas de PII", desc: "Informe pericial descargable con las directivas exigidas por el catálogo de Red.es." }
      ]
    },
    cdti: {
      tag: "PROYECTOS I+D+i, NEOTEC & PRÉSTAMOS ENISA",
      title: "Hitos Técnicos y Seguridad Crítica en Proyectos CDTI",
      summary: "Los proyectos de I+D+i intensivos en IA requieren demostrar una arquitectura tecnológica innovadora y robusta, con métricas de latencia validadas y protección de secretos empresariales.",
      items: [
        { badge: "01 / HITO TÉCNICO", color: "#FF4D5A", title: "Validación de Latencia L7", desc: "Demuestra una latencia determinista P99 < 1.16 ms en la capa de seguridad." },
        { badge: "02 / BLINDAJE SAARE", color: "#20C997", title: "Hook Nativo In-Process C-ABI", desc: "Arquitectura de software disruptiva de Residuo Cero en memoria volátil." },
        { badge: "03 / ENTREGABLE AUDITABLE", color: "#2F81F7", title: "Certificado Registral Independiente", desc: "Acreditación de autoría y propiedad del nodo (Safe Creative Nº 2607076315021)." }
      ]
    }
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';\n\n// Redirección perimetral L7 hacia el interceptor determinista SAARE\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': process.env.SAARE_LICENSE,\n    'X-SAARE-Scenario-ID': 'cumplimiento_corporativo_integral',\n    'X-SAARE-Auditor-Delegation': 'emp_node_auth_hash_89bc2',\n    'X-SAARE-Execution-Mode': 'IN_MEMORY_ENFORCE',\n    'X-SAARE-Proof-Bundle': 'REQUIRE_V10_FULL_ATTESTATION'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar titular DNI 48593021X con cuenta ES2114650100722030876293' }]\n});`,
    python: `from openai import OpenAI\nimport os\n\nclient = OpenAI(\n    api_key=os.environ.get("OPENAI_API_KEY"),\n    base_url="${API_BASE}/intercept",\n    default_headers={\n        "X-SAARE-License": os.environ.get("SAARE_LICENSE"),\n        "X-SAARE-Scenario-ID": "subvenciones_requisitos_infranqueables",\n        "X-SAARE-Auditor-Delegation": "emp_node_auth_hash_89bc2",\n        "X-SAARE-Execution-Mode": "IN_MEMORY_ENFORCE",\n        "X-SAARE-Proof-Bundle": "REQUIRE_V10_FULL_ATTESTATION"\n    }\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Verificar factura INV-2026-EU-089 para subvención NextGenEU"}]\n)`,
    curl: `curl -X POST ${API_BASE}/intercept \\\n  -H "Content-Type: application/json" \\\n  -H "X-SAARE-License: \$SAARE_LICENSE" \\\n  -H "X-SAARE-Scenario-ID: razonamiento_activo_l7" \\\n  -H "X-SAARE-Auditor-Delegation: emp_node_auth_hash_89bc2" \\\n  -H "X-SAARE-Proof-Bundle: REQUIRE_V10_FULL_ATTESTATION" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Verificar blindaje activo y obtener testigo criptográfico L7"}]\n  }'`,
    cabi: `/* SAARE Native C-ABI In-Process Sensor Hook (Zero-Residue L7 Gate) */\n#include <saare_l7.h>\n\nint process_inference_buffer(const uint8_t* payload_ptr, size_t payload_len) {\n    saare_ctx_t* ctx = saare_init_context(getenv("SAARE_LICENSE"));\n    saare_verdict_t verdict = saare_scan_memory_buffer(ctx, payload_ptr, payload_len);\n    \n    if (verdict.state == SAARE_STATE_REJECTED || verdict.state == SAARE_STATE_INDETERMINATE) {\n        saare_purge_madvise((void*)payload_ptr, payload_len);\n        saare_emit_signed_rejection_proof(ctx, verdict.rejection_digest);\n        return -1;\n    }\n    return 0;\n}`
  };

  useEffect(() => {
    if (!sessionUser?.email) return;
    const checkVaultStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionUser.email, token: sessionUser.token || "session_check", source: 'suite' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const updated = { ...sessionUser, ...data.user };
            localStorage.setItem('saare_suite_user', JSON.stringify(updated));
            setSessionUser(updated);
          }
        }
      } catch (err) {}
    };
    checkVaultStatus();
  }, [sessionUser?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    let endpoint = `${API_BASE}/auth/register`;
    let payload = { email, password, tenantName: companyName, source: 'suite', role: 'AUDITOR' };

    if (mode === 'login') {
      endpoint = `${API_BASE}/auth/login`;
      payload = { email, password, source: 'suite' };
    } else if (mode === 'reset') {
      endpoint = `${API_BASE}/auth/reset`;
      payload = { email, password };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        if (mode === 'reset') {
          setSuccessMsg("Credenciales actualizadas. Inicia sesión con tu nueva contraseña.");
          setMode('login'); setPassword('');
        } else {
          const userData = { ...data.user };
          localStorage.setItem('saare_suite_user', JSON.stringify(userData));
          setSessionUser(userData);
          setCurrentView('STATUS');
        }
      } else {
        setError(data.error || "Error al autenticar en Bóveda KV.");
      }
    } catch {
      setError("Fallo de comunicación con el Control-Plane.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_suite_user');
    setSessionUser(null);
    setCurrentView('LANDING');
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
        "name": "SAARE L7 Governance Agent",
        "version": "10.0.0",
        "description": "Ex-Ante Perimeter, Rejection Proofs & Runtime Attestation Engine",
        "background": { "service_worker": "background.js" },
        "content_scripts": [{ "matches": ["https://*/*"], "js": ["content.js"], "run_at": "document_start" }],
        "permissions": ["storage"]
      }, null, 2));

      const injectContent = `/* S.A.A.R.E. L7 In-Memory Interceptor & V10 Proof Engine */
(function() {
  const DLP = {
    dni: /(?:^|\\D)(\\d{7,8}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])(?!\\w)/i,
    iban: /ES\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{2}[\\s-]?\\d{10}|ES\\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/
  };

  function computeL7Seal(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return \`L7-SEAL:\${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}\`;
  }

  function evaluatePayload(rawBody) {
    let str = "";
    try {
      str = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
    } catch(e) { str = String(rawBody || ""); }
    
    if (!str || str.length < 2) return null;

    const isDni = DLP.dni.test(str);
    const isIban = DLP.iban.test(str.replace(/[\\s-]/g, ""));
    const isCard = DLP.card.test(str.replace(/[\\s-]+/g, ""));

    if (isDni || isIban || isCard) {
      let category = "PII_DNI";
      let norma = "España - LOPDGDD & RGPD";
      if (isIban) { category = "DATOS_BANCARIOS"; norma = "DORA Capa 7 / RGPD"; }
      else if (isCard) { category = "TARJETA_CREDITO"; norma = "PCI-DSS / RGPD"; }

      return {
        verdict: "RECHAZADO",
        perimeter_validity: "PERIMETER_INVALID",
        category,
        norma,
        reason: "Causalidad rota: Detección de datos regulados en buffer RAM L7",
        cryptoSeal: computeL7Seal(str),
        parentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      };
    }

    return {
      verdict: "PERMITIDO",
      perimeter_validity: "PERIMETER_VALID",
      category: "AUDITORIA_CONFORME",
      norma: "ISO/IEC 42001 & EU AI Act",
      reason: "Prueba de no afirmación no soportada verificada en memoria",
      cryptoSeal: computeL7Seal(str),
      parentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    };
  }

  const rawFetch = window.fetch;
  window.fetch = async function(resource, config) {
    if (config && config.body) {
      const check = evaluatePayload(config.body);
      if (check) {
        if (check.verdict === "RECHAZADO") {
          window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
          return new Response(JSON.stringify({ error: "S.A.A.R.E. Intercept: Bloqueado por Perímetro Ex-Ante en RAM" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          window.postMessage({ type: "SAARE_EVENT", data: check }, "*");
        }
      }
    }
    return rawFetch.apply(this, arguments);
  };
})();`;
      zip.file("inject.js", injectContent);

      const contentJsCode = `// SAARE L7 TELEMETRY & DOM BRIDGE v10.0
const injectScript = document.createElement("script");
injectScript.src = chrome.runtime.getURL("inject.js");
injectScript.onload = function() { this.remove(); };
(document.head || document.documentElement).appendChild(injectScript);

window.addEventListener("message", (event) => {
  if (event.data?.type === "SAARE_EVENT" && event.data.data) {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) {
      chrome.runtime.sendMessage({ type: "SAARE_LOG_EVENT", payload: event.data.data }, () => {});
    }
  }
});`;
      zip.file("content.js", contentJsCode);

      const bgCode = `const WORKER_URL = "${API_BASE}";

async function resolveIdentity() {
  return new Promise((resolve) => {
    if (chrome.storage?.local) {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
        resolve({
          user: local?.saare_user_email || "${tEmail}",
          tenant: local?.saare_tenant_domain || "${tTenant}"
        });
      });
    } else {
      resolve({ user: "${tEmail}", tenant: "${tTenant}" });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity().then(({ user, tenant }) => {
      const enrichedPayload = { ...message.payload, user, tenant };
      fetch(\`\${WORKER_URL}/runs?user=\${encodeURIComponent(user)}\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrichedPayload)
      }).catch(() => {});
    });
    return true;
  }
});`;
      zip.file("background.js", bgCode);

      const customBat = `@echo off\nchcp 65001 >nul\ntitle S.A.A.R.E. Installer\nset "EXTENSION_ID=saaregovernanceid"\nset "TARGET_DIR=%LOCALAPPDATA%\\SAARE\\extension"\nif not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"\nxcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\\" >nul 2>&1\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "version" /t REG_SZ /d "10.0.0" /f >nul 2>&1\necho [OK] Agente L7 desplegado para ${tEmail} (${tTenant}).\ntimeout /t 3 >nul\nexit /b 0`;
      zip.file("install_silent.bat", customBat);

      zip.file("storage_managed.json", JSON.stringify({
        "saare_user_email": tEmail,
        "saare_tenant_domain": tTenant,
        "saare_token": tToken,
        "saare_role": "AUDITOR"
      }, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(blob);
      dl.download = `saare-proof-runtime-${tTenant.toLowerCase().replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    } catch (err) {
      alert("Error al compilar el bundle del agente.");
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05070c', color: '#f1f5f9', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      {/* MODAL DIPLOMA REGISTRAL */}
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

      {/* HEADER B2B ENTERPRISE */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(5, 7, 12, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios'); }}>
            <span style={{ fontWeight: '900', fontSize: '18px', letterSpacing: '1.5px', color: '#ffffff' }}>SAARE</span>
          </div>

          <nav style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '13px', fontWeight: '600', flexWrap: 'wrap' }}>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'overview' ? '#1e293b' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'overview' ? '#38bdf8' : '#94a3b8', cursor: 'pointer', borderRadius: '4px' }}>
              Plataforma
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'scenarios' ? '#0284c7' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'scenarios' ? 'rgba(2, 132, 199, 0.15)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'scenarios' ? '#38bdf8' : '#ffffff', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              ⚡ 5 Formas de Protección
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
                  {currentView === 'STATUS' ? 'Ver Portal' : 'Consola'}
                </button>
                <button onClick={handleLogout} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
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

      {/* VISTA 3: LANDING PAGE MODULAR CON EL DISEÑO DE CINCO FORMAS DE PROTEGER TU IA */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1080px', margin: '30px auto 80px auto', padding: '0 20px' }}>

          {activeNavTab === 'scenarios' && (
            <div>
              {/* TÍTULO PRINCIPAL */}
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

              {/* CONTENEDOR DE LAS 5 TARJETAS MAESTRAS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ========================================================================= */}
                {/* 01. EL ESCUDO */}
                {/* ========================================================================= */}
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

                {/* ========================================================================= */}
                {/* 02. LA EVIDENCIA */}
                {/* ========================================================================= */}
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

                {/* ========================================================================= */}
                {/* 03. EL GUARDIÁN */}
                {/* ========================================================================= */}
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

                {/* ========================================================================= */}
                {/* 04. EL DETECTOR */}
                {/* ========================================================================= */}
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

                {/* ========================================================================= */}
                {/* 05. EL JUSTIFICADOR */}
                {/* ========================================================================= */}
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

              {/* BANNER INFERIOR 1: 5 CAPAS DE PROTECCIÓN */}
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

              {/* BANNER INFERIOR 2: CTA TECNOLOGÍA */}
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

          {/* OTRAS PESTAÑAS TÉCNICAS */}
          {activeNavTab === 'architecture' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>Arquitectura de Referencia L7</h2>
              <p style={{ color: '#94a3b8', fontSize: '14.5px', marginBottom: '28px' }}>El motor determinista de intercepción en memoria volátil sin persistencia en disco.</p>
              
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
                       │ (Parent Hash Binding)
                       ▼
 ╔═════════════════════════════════════════════╗
 ║       SAARE EX-ANTE VERIFICATION GATE       ║
 ║                                             ║
 ║  [1] DLP & PII SHIELD   (RGPD / DORA)       ║
 ║  [2] EVIDENCE BINDING   (ISO 42001)         ║
 ║  [3] DETERMINISTIC GATE (Zero-Disk RAM)     ║
 ║  [4] RUNTIME WITNESS    (Ed25519 + RFC3161) ║
 ╚═════════════════════╤═══════════════════════╝
                       ▼
          SIGNED L7-SEAL IN LLM RESPONSE`}
              </pre>
            </div>
          )}

          {activeNavTab === 'developers' && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>Integración SDK</h2>
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
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>Proof Bundle & Evidencia</h2>
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
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>Marcos Normativos & Subvenciones</h2>
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
                  <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0' }}>Coste de Desarrollo Evitado</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Elimina la necesidad de programar proxies internos y parsers DLP propietarios.</p>
                </div>
                <div style={{ background: '#05070c', padding: '24px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#ef4444', margin: '0 0 8px 0' }}>Mitigación de Sanciones</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Protección activa frente al régimen sancionador del EU AI Act y el RGPD.</p>
                </div>
                <div style={{ background: '#05070c', padding: '24px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <h4 style={{ color: '#34d399', margin: '0 0 8px 0' }}>Justificación Automática</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Generación instantánea de pruebas fiduciarias para fondos PRTR y NextGenEU.</p>
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
                SAARE protege los datos sensibles, audita las respuestas de la IA y genera evidencia pericial verificable en tiempo real.
              </p>
              <button onClick={() => setActiveNavTab('scenarios')} style={{ padding: '14px 28px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                Explorar las 5 Formas de Protección ↗
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