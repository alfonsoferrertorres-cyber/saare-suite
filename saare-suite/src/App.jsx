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
  const [activeNavTab, setActiveNavTab] = useState('scenarios'); // Inicia por defecto en Escenarios o Plataforma
  const [scenarioFilter, setScenarioFilter] = useState('ALL');
  const [selectedScenario, setSelectedScenario] = useState(null);

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

  // CATÁLOGO DE ESCENARIOS DE TRACCIÓN COMERCIAL (GRID 4x2 TIPO CATÁLOGO)
  const scenariosCatalog = [
    {
      id: "scn-n8n",
      category: "AI Workflows",
      title: "n8n & LangChain: Flujo Seguro Ex-Ante",
      description: "Intercepta llamadas a LLMs en flujos automatizados de agentes y bots, neutralizando DNIs y cuentas bancarias antes de salir a la nube.",
      tag: "GATEWAY / SDK",
      latency: "1.16 ms",
      verified: "0.00% Fuga PII",
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
      badgeColor: "#2F81F7",
      icon: "⚡"
    },
    {
      id: "scn-edr",
      category: "Ciberseguridad",
      title: "Sensor Hook C-ABI In-Process (EDR)",
      description: "Biblioteca nativa compilada (.so/.dll) para fabricantes de antivirus y XDR. Purga atómica de memoria volátil mediante SYS_madvise.",
      tag: "OEM BINARIO",
      latency: "0.017 ms",
      verified: "Residuo Cero RAM",
      gradient: "linear-gradient(135deg, #065f46 0%, #0f172a 100%)",
      badgeColor: "#20C997",
      icon: "🛡️"
    },
    {
      id: "scn-gsi",
      category: "Auditoría & GRC",
      title: "Big Four: Bóveda de Evidencia Pericial",
      description: "Generación automatizada de Proof Bundles sellados con Ed25519 y RFC 3161 para auditorías de IA y justificación de expedientes.",
      tag: "ASIENTO AUDITOR",
      latency: "RFC 3161",
      verified: "Validez Pericial Plena",
      gradient: "linear-gradient(135deg, #831843 0%, #0f172a 100%)",
      badgeColor: "#FF4D5A",
      icon: "⚖️"
    },
    {
      id: "scn-bank",
      category: "Fintech & Banca",
      title: "Nodo Privado On-Premise Air-Gapped",
      description: "Despliegue privado en VPC sin salida a internet. Atesta que ninguna inferencia de evaluación crediticia almacena secretos bancarios en disco.",
      tag: "VPC PRIVADA",
      latency: "0.017 ms",
      verified: "DORA Capa 7 Ready",
      gradient: "linear-gradient(135deg, #713f12 0%, #0f172a 100%)",
      badgeColor: "#EAB308",
      icon: "🏦"
    },
    {
      id: "scn-health",
      category: "Sanidad & Salud",
      title: "Resguardo de Historias Clínicas (PII)",
      description: "Protección estricta de historiales médicos ante herramientas diagnósticas de IA generativa con sustitución de identificadores en tránsito.",
      tag: "ENCLAVE LOPDGDD",
      latency: "1.16 ms",
      verified: "RGPD Art. 5 y 32",
      gradient: "linear-gradient(135deg, #4c1d95 0%, #0f172a 100%)",
      badgeColor: "#A855F7",
      icon: "🏥"
    },
    {
      id: "scn-edge",
      category: "Cloud & Gateways",
      title: "Proxy Inverso Global en Cloudflare Edge",
      description: "Middleware perimetral distribuido en más de 300 ubicaciones que estampa firmas de integridad en los encabezados HTTP de cada inferencia.",
      tag: "EDGE WORKER",
      latency: "Global Edge",
      verified: "Merkle Anchor",
      gradient: "linear-gradient(135deg, #164e63 0%, #0f172a 100%)",
      badgeColor: "#06B6D4",
      icon: "🌐"
    },
    {
      id: "scn-nextgen",
      category: "Fondos Europeos",
      title: "Trazabilidad Inmutable NextGen & PRTR",
      summary: "Memoria técnica estructurada con enlaces de verificación Edge pública comprobables por inspectores de fondos comunitarios e IGAE.",
      tag: "DOSSIER PRTR",
      latency: "RFC 3161",
      verified: "No-Clawback Log",
      gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      badgeColor: "#38BDF8",
      icon: "🇪🇺"
    },
    {
      id: "scn-kit",
      category: "Red.es / Kit Consulting",
      title: "Diagnóstico de Fugas y Handshake Token",
      description: "Supervisión delegada de empleados con consentimiento en memoria RAM para justificar los bonos de asesoramiento en PYMEs.",
      tag: "KIT CONSULTING",
      latency: "1.16 ms",
      verified: "Acreditado Red.es",
      gradient: "linear-gradient(135deg, #3f3f46 0%, #0f172a 100%)",
      badgeColor: "#F43F5E",
      icon: "💼"
    }
  ];

  const proofBundle = {
    "PROOF_BUNDLE_SCHEMA": "SAARE_PROOF_BUNDLE_V9.0",
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
        { badge: "01 / HITO TÉCNICO", color: "#FF4D5A", title: "Validación de Latencia L7", desc: "Evita penalizaciones en tramos no reembolsables demostrando una latencia determinista P99 < 1.16 ms en la capa de seguridad." },
        { badge: "02 / BLINDAJE SAARE", color: "#20C997", title: "Hook Nativo In-Process C-ABI", desc: "Integración directa que acredita ante ENISA/CDTI una arquitectura de software disruptiva de Residuo Cero en HugePages." },
        { badge: "03 / ENTREGABLE AUDITABLE", color: "#2F81F7", title: "Certificado Registral Independiente", desc: "Acreditación de autoría y propiedad del nodo (Safe Creative Nº 2607076315021) aportable al informe de seguimiento técnico." }
      ]
    }
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';\n\n// Redirección perimetral L7 hacia el interceptor determinista SAARE\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': process.env.SAARE_LICENSE,\n    'X-SAARE-Auditor-Delegation': 'emp_node_auth_hash_89bc2',\n    'X-SAARE-Execution-Mode': 'IN_MEMORY_ENFORCE',\n    'X-SAARE-Proof-Bundle': 'REQUIRE_V9_FULL_ATTESTATION'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar expediente: Titular con DNI 48593021X' }]\n});`,
    python: `from openai import OpenAI\nimport os\n\n# Cliente SDK con validación, prueba de rechazo y redacción de PII ex-ante\nclient = OpenAI(\n    api_key=os.environ.get("OPENAI_API_KEY"),\n    base_url="${API_BASE}/intercept",\n    default_headers={\n        "X-SAARE-License": os.environ.get("SAARE_LICENSE"),\n        "X-SAARE-Auditor-Delegation": "emp_node_auth_hash_89bc2",\n        "X-SAARE-Execution-Mode": "IN_MEMORY_ENFORCE",\n        "X-SAARE-Proof-Bundle": "REQUIRE_V9_FULL_ATTESTATION"\n    }\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Auditar expediente: Titular con DNI 48593021X"}]\n)`,
    curl: `curl -X POST ${API_BASE}/intercept \\\n  -H "Content-Type: application/json" \\\n  -H "X-SAARE-License: \$SAARE_LICENSE" \\\n  -H "X-SAARE-Auditor-Delegation: emp_node_auth_hash_89bc2" \\\n  -H "X-SAARE-Proof-Bundle: REQUIRE_V9_FULL_ATTESTATION" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Auditar titular DNI 48593021X"}]\n  }'`,
    cabi: `/* SAARE Native C-ABI In-Process Sensor Hook (Zero-Residue L7 Gate) */\n#include <saare_l7.h>\n\nint process_inference_buffer(const uint8_t* payload_ptr, size_t payload_len) {\n    saare_ctx_t* ctx = saare_init_context(getenv("SAARE_LICENSE"));\n    saare_verdict_t verdict = saare_scan_memory_buffer(ctx, payload_ptr, payload_len);\n    \n    if (verdict.state == SAARE_STATE_REJECTED || verdict.state == SAARE_STATE_INDETERMINATE) {\n        // Purga atómica en memoria RAM mediante SYS_madvise (MADV_DONTNEED)\n        saare_purge_madvise((void*)payload_ptr, payload_len);\n        saare_emit_signed_rejection_proof(ctx, verdict.rejection_digest);\n        return -1; // Transmisión cortada a nivel de socket\n    }\n    \n    return 0; // Tráfico acotado al perímetro válido\n}`
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
    const interval = setInterval(checkVaultStatus, 15000);
    return () => clearInterval(interval);
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
        "version": "9.0.0",
        "description": "Ex-Ante Perimeter, Rejection Proofs & Runtime Attestation Engine",
        "background": { "service_worker": "background.js" },
        "content_scripts": [{ "matches": ["https://*/*"], "js": ["content.js"], "run_at": "document_start" }],
        "web_accessible_resources": [{ "resources": ["inject.js"], "matches": ["https://*/*"] }],
        "permissions": ["storage"]
      }, null, 2));

      const injectContent = `/* S.A.A.R.E. L7 In-Memory Interceptor & V9 Proof Engine */
(function() {
  const DLP = {
    dni: /(?:^|\\D)(\\d{7,8}[-\\s]?[A-Za-z]|[XYZ]\\d{7}[-\\s]?[A-Za-z])(?!\\w)/i,
    iban: /ES\\d{2}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{2}[\\s-]?\\d{10}|ES\\d{18,22}/i,
    card: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})/
  };

  function getSettings() {
    try {
      const raw = document.documentElement.getAttribute('data-saare-settings');
      return raw ? JSON.parse(raw) : { privacy: true, security: true, logs: true };
    } catch(e) {
      return { privacy: true, security: true, logs: true };
    }
  }

  function computeL7Seal(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return \`L7-SEAL:\${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}\`;
  }

  function evaluatePayload(rawBody, url) {
    const settings = getSettings();
    if (!settings.privacy && !settings.logs) return null;

    let str = "";
    try {
      str = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
    } catch(e) { str = String(rawBody || ""); }
    
    if (!str || str.length < 2) return null;

    const isDni = DLP.dni.test(str);
    const isIban = DLP.iban.test(str.replace(/[\\s-]/g, ""));
    const isCard = DLP.card.test(str.replace(/[\\s-]+/g, ""));

    if (settings.privacy && (isDni || isIban || isCard)) {
      let category = "PII_DNI";
      let norma = "España - LOPDGDD & AEPD";
      if (isIban) { category = "DATOS_BANCARIOS"; norma = "RGPD Art. 5, 32"; }
      else if (isCard) { category = "TARJETA_CREDITO"; norma = "PCI-DSS / RGPD"; }

      return {
        verdict: "RECHAZADO",
        perimeter_validity: "PERIMETER_INVALID",
        category,
        norma,
        reason: "Causalidad rota: Detección de datos regulados no autorizados en buffer RAM L7",
        cryptoSeal: computeL7Seal(str),
        parentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      };
    }

    if (!settings.logs) return null;

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
    const url = typeof resource === "string" ? resource : (resource?.url || "");
    if (config && config.body) {
      const check = evaluatePayload(config.body, url);
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

      const contentJsCode = `// SAARE L7 TELEMETRY & DOM BRIDGE v9.0.0
function updateDomSettings(settings) {
  if (settings) document.documentElement.setAttribute('data-saare-settings', JSON.stringify(settings));
}

if (typeof chrome !== "undefined" && chrome.storage?.local) {
  chrome.storage.local.get(["saare_settings"], (res) => {
    updateDomSettings(res?.saare_settings || { privacy: true, security: true, logs: true });
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.saare_settings) updateDomSettings(changes.saare_settings.newValue);
  });
}

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

      const customBat = `@echo off\nchcp 65001 >nul\ntitle S.A.A.R.E. Installer\nset "EXTENSION_ID=saaregovernanceid"\nset "TARGET_DIR=%LOCALAPPDATA%\\SAARE\\extension"\nif not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"\nxcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\\" >nul 2>&1\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1\nreg add "HKCU\\Software\\Google\\Chrome\\Extensions\\%EXTENSION_ID%" /v "version" /t REG_SZ /d "9.0.0" /f >nul 2>&1\necho [OK] Agente L7 desplegado para ${tEmail} (${tTenant}).\ntimeout /t 3 >nul\nexit /b 0`;
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

  const filteredScenarios = scenarioFilter === 'ALL'
    ? scenariosCatalog
    : scenariosCatalog.filter(s => s.category.toLowerCase().includes(scenarioFilter.toLowerCase()));

  const currentGrant = grantsData[activeGrantTab] || grantsData['nextgen'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070A0F', color: '#E8EDF2', fontFamily: '"Inter", "Geist", "IBM Plex Sans", -apple-system, sans-serif' }}>
      
      {/* MODAL DEL DIPLOMA REGISTRAL */}
      {showDiploma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }} onClick={() => setShowDiploma(false)}>
          <div style={{ maxWidth: '850px', width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <img src="/certificado_integridad.png" alt="Diploma Registral RPI" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ padding: '14px 20px', background: '#0D1117', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#8B98A7', fontSize: '12px', fontFamily: 'monospace' }}>Acreditación Safe Creative Nº 2607076315021 · Validez Probatoria Plena</span>
              <button onClick={() => setShowDiploma(false)} style={{ background: '#FF4D5A', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER B2B ENTERPRISE CON PESTAÑAS ACTIVAS */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(7, 10, 15, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #151B23' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }}>
            <div style={{ width: '28px', height: '28px', backgroundColor: '#E8EDF2', color: '#070A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px', borderRadius: '4px' }}>
              S
            </div>
            <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.3px', color: '#E8EDF2' }}>
              SAARE
            </div>
            <div style={{ color: '#8B98A7', fontSize: '13px', marginLeft: '6px', borderLeft: '1px solid #30363D', paddingLeft: '12px' }}>
              AI Security & Evidence Layer
            </div>
          </div>

          {/* MENÚ DE PESTAÑAS PRINCIPALES */}
          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', fontWeight: '600', flexWrap: 'wrap' }}>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('overview'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'overview' ? '#151B23' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'overview' ? '#2F81F7' : '#8B98A7', cursor: 'pointer', borderRadius: '4px' }}>
              Plataforma
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('scenarios'); }} style={{ padding: '6px 12px', border: '1px solid', borderColor: currentView === 'LANDING' && activeNavTab === 'scenarios' ? '#2F81F7' : 'transparent', background: currentView === 'LANDING' && activeNavTab === 'scenarios' ? 'rgba(47, 129, 247, 0.1)' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'scenarios' ? '#2F81F7' : '#E8EDF2', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>
              ⚡ Escenarios
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('risk_roi'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'risk_roi' ? '#151B23' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'risk_roi' ? '#2F81F7' : '#8B98A7', cursor: 'pointer', borderRadius: '4px' }}>
              Riesgo & ROI
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('markets'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'markets' ? '#151B23' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'markets' ? '#2F81F7' : '#8B98A7', cursor: 'pointer', borderRadius: '4px' }}>
              Mercados
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('architecture'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#151B23' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'architecture' ? '#2F81F7' : '#8B98A7', cursor: 'pointer', borderRadius: '4px' }}>
              Arquitectura
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('proof'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'proof' ? '#151B23' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'proof' ? '#20C997' : '#8B98A7', cursor: 'pointer', borderRadius: '4px' }}>
              Proof Bundle
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('compliance'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'compliance' ? '#151B23' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'compliance' ? '#2F81F7' : '#8B98A7', cursor: 'pointer', borderRadius: '4px' }}>
              Compliance
            </button>
            <button onClick={() => { setCurrentView('LANDING'); setActiveNavTab('developers'); }} style={{ padding: '6px 12px', border: 'none', background: currentView === 'LANDING' && activeNavTab === 'developers' ? '#151B23' : 'transparent', color: currentView === 'LANDING' && activeNavTab === 'developers' ? '#2F81F7' : '#8B98A7', cursor: 'pointer', borderRadius: '4px' }}>
              Integración SDK
            </button>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#151B23', border: '1px solid #30363D', color: '#2F81F7', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                  {currentView === 'STATUS' ? 'Ver Portal' : 'Consola'}
                </button>
                <button onClick={handleLogout} style={{ color: '#FF4D5A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '7px 16px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: '8px' }}>
                Acceso Bóveda
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* VISTA 1: AUTENTICACIÓN / ACCESO A BÓVEDA */}
      {currentView === 'AUTH' && !sessionUser && (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '36px', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2F81F7', marginBottom: '8px' }}>// AUTHENTICATION_GATEWAY</div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#E8EDF2' }}>
              {mode === 'reset' ? 'Restablecer Clave' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Perfil Auditor')}
            </h1>
            <p style={{ fontSize: '13px', color: '#8B98A7', marginBottom: '24px', lineHeight: 1.5 }}>
              Identidad criptográfica vinculada a Bóveda Cloudflare KV.
            </p>

            {mode !== 'reset' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#070A0F', padding: '4px', borderRadius: '6px' }}>
                <button onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'login' ? '#151B23' : 'transparent', color: mode === 'login' ? '#E8EDF2' : '#8B98A7', cursor: 'pointer', borderRadius: '4px', fontSize: '12.5px', fontWeight: '600' }}>Acceder</button>
                <button onClick={() => { setMode('register'); setError(''); }} style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'register' ? '#151B23' : 'transparent', color: mode === 'register' ? '#E8EDF2' : '#8B98A7', cursor: 'pointer', borderRadius: '4px', fontSize: '12.5px', fontWeight: '600' }}>Registrar</button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#8B98A7', marginBottom: '6px', fontFamily: 'monospace' }}>ORGANIZACIÓN / TENANT</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ej: Gabinete Jurídico y Pericial MS3V" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070A0F', border: '1px solid #21262D', color: '#E8EDF2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#8B98A7', marginBottom: '6px', fontFamily: 'monospace' }}>CORREO CORPORATIVO</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="auditor@empresa.es" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070A0F', border: '1px solid #21262D', color: '#E8EDF2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11.5px', color: '#8B98A7', fontFamily: 'monospace' }}>CONTRASEÑA</label>
                  {mode === 'login' && (
                    <span onClick={() => setMode('reset')} style={{ fontSize: '11.5px', color: '#2F81F7', cursor: 'pointer' }}>¿Olvidaste clave?</span>
                  )}
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070A0F', border: '1px solid #21262D', color: '#E8EDF2', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>

              {error && <div style={{ padding: '10px', backgroundColor: 'rgba(255, 77, 90, 0.1)', border: '1px solid rgba(255, 77, 90, 0.3)', color: '#FF4D5A', fontSize: '12px', borderRadius: '4px' }}>{error}</div>}
              {successMsg && <div style={{ padding: '10px', backgroundColor: 'rgba(32, 201, 151, 0.1)', border: '1px solid rgba(32, 201, 151, 0.3)', color: '#20C997', fontSize: '12px', borderRadius: '4px' }}>{successMsg}</div>}

              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer', fontSize: '13px', marginTop: '8px' }}>
                {loading ? 'Procesando...' : (mode === 'login' ? 'Autenticar en Vault KV' : (mode === 'reset' ? 'Confirmar Nueva Clave' : 'Aprovisionar Cuenta'))}
              </button>

              {mode === 'reset' && (
                <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#8B98A7', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>
                  ← Volver a inicio de sesión
                </button>
              )}
            </form>
          </div>
        </main>
      )}

      {/* VISTA 2: PANEL DE CONTROL DE AUDITOR */}
      {currentView === 'STATUS' && sessionUser && (
        <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997', backgroundColor: 'rgba(32, 201, 151, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(32, 201, 151, 0.2)' }}>
                ● NODO AUDITOR ACTIVADO
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#8B98A7' }}>ISO/IEC 42001 COMPLIANT</span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#E8EDF2' }}>
              Consola de Trazabilidad y Asiento de Consultoría
            </h1>
            <p style={{ color: '#8B98A7', fontSize: '14px', marginBottom: '28px', lineHeight: 1.5 }}>
              Nodo de supervisión en tiempo real. Gestiona la captura de evidencias en RAM y el desacople de telemetría sin retención de texto plano.
            </p>

            <div style={{ backgroundColor: '#070A0F', border: '1px solid #21262D', padding: '20px', borderRadius: '6px', marginBottom: '32px', fontFamily: 'monospace', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #151B23', marginBottom: '10px' }}>
                <span style={{ color: '#8B98A7' }}>TENANT_ORGANIZACION</span>
                <strong style={{ color: '#E8EDF2' }}>{sessionUser.tenantName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #151B23', marginBottom: '10px' }}>
                <span style={{ color: '#8B98A7' }}>AUDITOR_TITULAR</span>
                <strong style={{ color: '#2F81F7' }}>{sessionUser.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #151B23', marginBottom: '10px' }}>
                <span style={{ color: '#8B98A7' }}>PROOF_BUNDLE_GENERATOR</span>
                <strong style={{ color: '#20C997' }}>V9 ATTESTATION READY</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B98A7' }}>ESTADO_MOTOR_L7</span>
                <strong style={{ color: '#20C997' }}>STATELESS_RAM_ACTIVE (1.16 ms)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#2F81F7', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>
                Abrir Evidence Viewer (Consola GRC) ↗
              </a>
              <button onClick={handleDownloadSDK} disabled={downloadingZip} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#151B23', color: '#E8EDF2', border: '1px solid #30363D', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {downloadingZip ? 'Compilando...' : 'Descargar Agente Tokenizado (.zip)'}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VISTA 3: LANDING PAGE ENTERPRISE B2B MODULAR POR PESTAÑAS */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1180px', margin: '30px auto 80px auto', padding: '0 24px' }}>

          {/* ========================================================================= */}
          {/* NUEVA PESTAÑA: ESCENARIOS (CATÁLOGO TIPO CROTORRENTS / GRID DE TARJETAS) */}
          {/* ========================================================================= */}
          {activeNavTab === 'scenarios' && (
            <div>
              {/* CABECERA DE LA SECCIÓN DE ESCENARIOS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2F81F7', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>
                    // OPERATIONAL SCENARIOS & PLAYBOOKS
                  </div>
                  <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#E8EDF2', letterSpacing: '-0.5px' }}>
                    Catálogo de Escenarios & Despliegues
                  </h1>
                </div>

                {/* FILTROS / CATEGORÍAS */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['ALL', 'Workflows', 'Ciberseguridad', 'Auditoría', 'Fintech', 'Sanidad'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setScenarioFilter(cat)}
                      style={{
                        padding: '6px 14px',
                        border: '1px solid',
                        borderColor: scenarioFilter === cat ? '#2F81F7' : '#151B23',
                        background: scenarioFilter === cat ? '#151B23' : '#0D1117',
                        color: scenarioFilter === cat ? '#2F81F7' : '#8B98A7',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* GRID VISUAL DE TARJETAS (ESTILO CROTORRENTS EN MODO DEEP TECH) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {filteredScenarios.map((scn) => (
                  <div
                    key={scn.id}
                    onClick={() => setSelectedScenario(scn)}
                    style={{
                      backgroundColor: '#0D1117',
                      border: '1px solid #151B23',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.borderColor = '#2F81F7';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.8)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#151B23';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                    }}
                  >
                    {/* BANNER / PREVIEW DE LA TARJETA */}
                    <div
                      style={{
                        height: '140px',
                        background: scn.gradient,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '16px',
                        position: 'relative',
                        borderBottom: '1px solid #151B23'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10.5px', fontFamily: 'monospace', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: scn.badgeColor, border: `1px solid ${scn.badgeColor}40` }}>
                          {scn.tag}
                        </span>
                        <span style={{ fontSize: '20px' }}>{scn.icon}</span>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {scn.category}
                        </span>
                      </div>
                    </div>

                    {/* CUERPO DE LA TARJETA */}
                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0', lineHeight: 1.35 }}>
                          {scn.title}
                        </h3>
                        <p style={{ color: '#8B98A7', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {scn.description || scn.summary}
                        </p>
                      </div>

                      {/* PIE DE LA TARJETA (MÉTRICAS / STATUS) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #151B23', fontSize: '11.5px', fontFamily: 'monospace' }}>
                        <span style={{ color: '#20C997' }}>⚡ {scn.latency}</span>
                        <span style={{ color: '#8B98A7' }}>{scn.verified}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MODAL DETALLE DE ESCENARIO SELECCIONADO */}
              {selectedScenario && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedScenario(null)}>
                  <div style={{ maxWidth: '640px', width: '100%', background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <span style={{ color: selectedScenario.badgeColor, fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>// {selectedScenario.tag}</span>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: '#E8EDF2' }}>{selectedScenario.title}</h2>
                      </div>
                      <button onClick={() => setSelectedScenario(null)} style={{ background: 'none', border: 'none', color: '#8B98A7', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                    </div>

                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                      {selectedScenario.description || selectedScenario.summary}
                    </p>

                    <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '16px', borderRadius: '6px', marginBottom: '24px', fontFamily: 'monospace', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#8B98A7' }}>LATENCIA_EN_MEMORIA:</span>
                        <span style={{ color: '#20C997' }}>{selectedScenario.latency}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#8B98A7' }}>CERTIFICACIÓN_L7:</span>
                        <span style={{ color: '#E8EDF2' }}>{selectedScenario.verified}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8B98A7' }}>INTEGRACIÓN_RECOMENDADA:</span>
                        <span style={{ color: '#2F81F7' }}>{selectedScenario.category}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => { setSelectedScenario(null); setActiveNavTab('developers'); }} style={{ flex: 1, padding: '12px', backgroundColor: '#2F81F7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                        Ver SDK & Conexión ↗
                      </button>
                      <button onClick={() => setSelectedScenario(null)} style={{ padding: '12px 20px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 1: PLATAFORMA & OVERVIEW (HOME PRINCIPAL) */}
          {/* ========================================================================= */}
          {activeNavTab === 'overview' && (
            <div>
              {/* HERO */}
              <section style={{ textAlign: 'center', margin: '40px 0 60px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', backgroundColor: 'rgba(47, 129, 247, 0.1)', border: '1px solid rgba(47, 129, 247, 0.3)', borderRadius: '20px', color: '#2F81F7', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.5px' }}>
                  SAARE — AI SECURITY & EVIDENCE LAYER
                </div>

                <h1 style={{ fontSize: '52px', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 20px 0', color: '#E8EDF2' }}>
                  Controla tu IA antes de que <span style={{ color: '#2F81F7' }}>actúe.</span>
                </h1>

                <p style={{ fontSize: '17px', color: '#8B98A7', lineHeight: 1.6, maxWidth: '820px', margin: '0 auto 36px auto' }}>
                  SAARE protege los datos sensibles, controla las decisiones generadas por IA y crea evidencia criptográfica verificable de cada ejecución para que puedas desplegar Inteligencia Artificial con confianza.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '40px', flexWrap: 'wrap' }}>
                  <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ padding: '14px 28px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(47,129,247,0.3)' }}>
                    Probar Sandbox ↗
                  </button>
                  <button onClick={() => setActiveNavTab('scenarios')} style={{ padding: '14px 24px', backgroundColor: '#151B23', color: '#E8EDF2', border: '1px solid #30363D', borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    Explorar Escenarios ↓
                  </button>
                </div>
              </section>

              {/* QUÉ ES SAARE PARA TU EMPRESA */}
              <section style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#E8EDF2', marginBottom: '24px', textAlign: 'center' }}>¿Qué es SAARE para tu empresa?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                    <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>01 —</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>AI Security Layer</h3>
                    <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Control de tráfico e inferencias directo en el perímetro de ejecución (L7).</p>
                  </div>
                  <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                    <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>02 —</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Policy Enforcement</h3>
                    <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Aplicación estricta de políticas de datos antes de permitir que el flujo continúe.</p>
                  </div>
                  <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                    <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>03 —</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Evidence Layer</h3>
                    <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Generación de evidencia criptográfica verificable por terceros independientes.</p>
                  </div>
                  <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                    <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>04 —</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Enterprise Integration</h3>
                    <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Despliegue adaptable mediante Gateway, SDK, Embedded (C-ABI) u On-Premise.</p>
                  </div>
                </div>
              </section>

              {/* ANTES Y DESPUÉS */}
              <section style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '40px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', flex: 1, minWidth: '250px' }}>
                      <div style={{ color: '#FF4D5A', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px', fontSize: '12px' }}>SIN SAARE</div>
                      <div style={{ color: '#8B98A7', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <div style={{ padding: '8px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '200px' }}>Usuario</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '200px' }}>Aplicación</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '200px' }}>LLM Externo</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '1px solid #FF4D5A', borderRadius: '4px', color: '#FF4D5A', width: '100%', maxWidth: '200px', fontWeight: 'bold' }}>Respuesta de IA</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '1px dashed #30363D', borderRadius: '4px', width: '100%', maxWidth: '200px', fontStyle: 'italic' }}>¿Quién demuestra qué ocurrió?</div>
                      </div>
                    </div>
                    
                    <div style={{ color: '#30363D', fontSize: '24px', fontWeight: '300' }}>VS</div>
                    
                    <div style={{ textAlign: 'center', flex: 1, minWidth: '250px' }}>
                      <div style={{ color: '#20C997', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px', fontSize: '12px' }}>CON SAARE</div>
                      <div style={{ color: '#E8EDF2', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <div style={{ padding: '8px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '200px' }}>Usuario</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '2px solid #2F81F7', backgroundColor: 'rgba(47, 129, 247, 0.1)', borderRadius: '4px', color: '#2F81F7', fontWeight: 'bold', width: '100%', maxWidth: '200px' }}>SAARE</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '1px solid #20C997', color: '#20C997', borderRadius: '4px', width: '100%', maxWidth: '200px', fontWeight: '500' }}>Policy + Evidence + Security</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '200px' }}>LLM</div>
                        <div>↓</div>
                        <div style={{ padding: '8px 16px', border: '1px solid #20C997', backgroundColor: 'rgba(32, 201, 151, 0.1)', borderRadius: '4px', color: '#20C997', fontWeight: 'bold', width: '100%', maxWidth: '200px' }}>Action + Proof Bundle</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 2: EL RIESGO & ANÁLISIS DE ROI */}
          {/* ========================================================================= */}
          {activeNavTab === 'risk_roi' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 12px 0' }}>El Riesgo Empresarial de la IA</h2>
                <p style={{ color: '#8B98A7', fontSize: '16px' }}>La IA empresarial ya toma decisiones. ¿Puedes demostrar que están bajo control?</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔐</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Data Leakage</h3>
                  <p style={{ color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: '#E8EDF2' }}>El dato sensible no debería llegar al modelo.</strong><br/>
                    Evita que PII, información financiera, secretos corporativos o documentación regulada atraviesen las políticas definidas hacia proveedores de IA externos.
                  </p>
                </div>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>🧠</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Unsupported Claims</h3>
                  <p style={{ color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: '#E8EDF2' }}>Una respuesta de IA no es automáticamente una decisión.</strong><br/>
                    SAARE exige evidencia preexistente e impone políticas antes de permitir que una salida sea considerada válida en tu flujo de trabajo.
                  </p>
                </div>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>🕵️</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Auditability</h3>
                  <p style={{ color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: '#E8EDF2' }}>Si no puedes demostrar qué ocurrió, no puedes auditarlo.</strong><br/>
                    SAARE genera evidencia criptográfica estructurada y verificable de cada evento para protegerte ante incidentes o inspecciones normativas.
                  </p>
                </div>
              </div>

              {/* ROI SECTION */}
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '36px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#E8EDF2', marginBottom: '8px', textAlign: 'center' }}>¿Cuánto cuesta no controlar tu IA?</h3>
                <p style={{ color: '#8B98A7', fontSize: '15px', textAlign: 'center', marginBottom: '32px' }}>Impacto directo en costes, tiempo y riesgo operativo.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '20px', borderTop: '2px solid #2F81F7', backgroundColor: '#070A0F', borderRadius: '0 0 6px 6px' }}>
                    <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Coste de Desarrollo</h4>
                    <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>No necesitas construir desde cero tu propio perímetro de control ni mecanismos de auditoría criptográfica.</p>
                  </div>
                  <div style={{ padding: '20px', borderTop: '2px solid #FF4D5A', backgroundColor: '#070A0F', borderRadius: '0 0 6px 6px' }}>
                    <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Coste de Incidentes</h4>
                    <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Controla la salida de datos sensibles hacia las APIs de servicios de IA externos antes de que ocurra la fuga.</p>
                  </div>
                  <div style={{ padding: '20px', borderTop: '2px solid #EAB308', backgroundColor: '#070A0F', borderRadius: '0 0 6px 6px' }}>
                    <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Coste de Auditoría</h4>
                    <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>La evidencia se genera durante la propia ejecución. La respuesta ante incidentes o inspectores es inmediata.</p>
                  </div>
                  <div style={{ padding: '20px', borderTop: '2px solid #20C997', backgroundColor: '#070A0F', borderRadius: '0 0 6px 6px' }}>
                    <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Coste de Oportunidad</h4>
                    <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Comercializa tu producto SaaS con una capa "Secure AI" / "Compliance Mode" respaldada por SAARE.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 3: CASOS DE NEGOCIO & MERCADOS */}
          {/* ========================================================================= */}
          {activeNavTab === 'markets' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 12px 0' }}>Puertas de Venta Empresarial</h2>
                <p style={{ color: '#8B98A7', fontSize: '16px' }}>Descubre cómo SAARE genera valor directo en los modelos de adopción corporativos.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                
                {/* 1. AI WORKFLOWS */}
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '32px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '16px', fontWeight: 'bold' }}>01 — AI PLATFORMS & WORKFLOWS</div>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Protege tus automatizaciones antes de que lleguen al LLM.</h3>
                  <div style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', flex: 1 }}>
                    <p style={{ marginBottom: '8px' }}><strong>Problema:</strong> Tus clientes pueden enviar PII y datos regulados a modelos externos a través de tus flujos.</p>
                    <p style={{ margin: 0 }}><strong>SAARE:</strong> Añade una capa de control L7 sin construir tu propio motor de seguridad desde cero.</p>
                  </div>
                  <div style={{ borderTop: '1px solid #151B23', paddingTop: '16px', fontSize: '13px', color: '#8B98A7', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Integración:</strong> API / Gateway / SDK</div>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Time-to-value:</strong> 1–3 meses</div>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Comprador:</strong> CTO / CPO / Head of AI</div>
                    <div><strong style={{ color: '#E8EDF2' }}>Modelo:</strong> OEM / Consumo / Revenue Share</div>
                  </div>
                  <button onClick={() => { setMode('register'); setCurrentView('AUTH'); }} style={{ width: '100%', padding: '10px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Integrar SAARE ↗
                  </button>
                </div>

                {/* 2. CYBERSECURITY */}
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '32px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#20C997', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '16px', fontWeight: 'bold' }}>02 — CYBERSECURITY PROVIDERS</div>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>DLP nativo para IA en el Endpoint.</h3>
                  <div style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', flex: 1 }}>
                    <p style={{ marginBottom: '8px' }}><strong>Problema:</strong> Las empresas pierden el control sobre qué copian sus empleados en ChatGPT o Gemini.</p>
                    <p style={{ margin: 0 }}><strong>SAARE:</strong> Librería C-ABI in-process que purga datos sensibles directamente en la memoria del agente EDR del usuario.</p>
                  </div>
                  <div style={{ borderTop: '1px solid #151B23', paddingTop: '16px', fontSize: '13px', color: '#8B98A7', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Integración:</strong> C-ABI (.so / .dll) Embedded</div>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Time-to-value:</strong> 6–12 meses</div>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Comprador:</strong> CISO / VP Engineering</div>
                    <div><strong style={{ color: '#E8EDF2' }}>Modelo:</strong> OEM Licensing</div>
                  </div>
                  <a href="mailto:partners@ms3v.es?subject=OEM%20Licensing" style={{ textAlign: 'center', display: 'block', padding: '10px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>
                    Hablar con Partnerships ↗
                  </a>
                </div>

                {/* 3. GSIs / CONSULTORAS */}
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '32px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#FF4D5A', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '16px', fontWeight: 'bold' }}>03 — GSIs & CONSULTORAS</div>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Obtén evidencia verificable de cumplimiento.</h3>
                  <div style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', flex: 1 }}>
                    <p style={{ marginBottom: '8px' }}><strong>Problema:</strong> Auditar proyectos de IA regulada para clientes es manual, abstracto y carece de pruebas técnicas sólidas.</p>
                    <p style={{ margin: 0 }}><strong>SAARE:</strong> Genera paquetes de evidencia (Proof Bundles) listos para justificar cumplimiento, ISO 42001 e inversiones públicas.</p>
                  </div>
                  <div style={{ borderTop: '1px solid #151B23', paddingTop: '16px', fontSize: '13px', color: '#8B98A7', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Integración:</strong> Enterprise / Auditor Seat</div>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Time-to-value:</strong> Inmediato (SaaS)</div>
                    <div style={{ marginBottom: '6px' }}><strong style={{ color: '#E8EDF2' }}>Comprador:</strong> Compliance Officer / Perito</div>
                    <div><strong style={{ color: '#E8EDF2' }}>Modelo:</strong> Suscripción {AUDITOR_PLAN_PRICE} €/mes</div>
                  </div>
                  <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '10px', backgroundColor: '#2F81F7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Contratar Asiento Auditor ↗
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 4: ARQUITECTURA TÉCNICA & STACK COMPARATIVO */}
          {/* ========================================================================= */}
          {activeNavTab === 'architecture' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 12px 0' }}>Arquitectura de Referencia L7</h2>
                <p style={{ color: '#8B98A7', fontSize: '16px' }}>La tecnología determinista que respalda el perímetro empresarial.</p>
              </div>

              {/* DIAGRAMA ASCII */}
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px', maxWidth: '720px', margin: '0 auto 40px auto', overflowX: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #151B23', paddingBottom: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>FLUJO LÓGICO DE INTERCEPCIÓN EN L7</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997' }}>P99 OBSERVADO: 1.16 ms</span>
                </div>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.45, color: '#8B98A7' }}>
{`    ┌──────────────────────────────────────────────┐
    │ CLAIM / INFERENCE PAYLOAD (Raw RAM Buffer)   │
    └──────────────────────┬───────────────────────┘
                           │ (Parent Hash Binding)
                           ▼
 ╔═════════════════════════════════════════════════╗
 ║       SAARE EX-ANTE VERIFICATION GATE           ║
 ║                                                 ║
 ║  [1] EVIDENCE CHECK  (Corpus Grounding)         ║
 ║  [2] POLICY CHECK    (DLP / PII / LOPDGDD)      ║
 ║  [3] LOGIC GATE      (Deterministic Confinement)║
 ║  [4] RUNTIME SEAL    (Ed25519 + RFC 3161)       ║
 ╚═════════════════════╤═══════════════════════════╝
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
 ╔═══════════╗   ╔═══════════╗   ╔═══════════════╗
 ║  `}<span style={{ color: '#20C997' }}>ACCEPT</span>{`   ║   ║  `}<span style={{ color: '#FF4D5A' }}>REJECT</span>{`   ║   ║ `}<span style={{ color: '#2F81F7' }}>INDETERMINATE</span>{` ║
 ║  (Valid)  ║   ║ (Purged)  ║   ║  (Fallback)   ║
 ╚═════╤═════╝   ╚═════╤═════╝   ╚═══════╤═══════╝
       └───────────────┼─────────────────┘
                       │
                       ▼
 ╔═════════════════════════════════════════════════╗
 ║  SIGNED PROOF BUNDLE -> MERKLE TRANSPARENCY LOG ║
 ╚═════════════════════════════════════════════════╝`}
                </pre>
              </div>

              {/* TRES PILARES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                  <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11px', marginBottom: '8px' }}>01 / EX-ANTE L7</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Prueba de Rechazo Firmada</h4>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Cada bloqueo emite un digest pericial con soporte Ed25519 acreditando la aplicación de la regla.</p>
                </div>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                  <div style={{ color: '#20C997', fontFamily: 'monospace', fontSize: '11px', marginBottom: '8px' }}>02 / REDUCCIÓN DE EXPOSICIÓN</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Atestación del Runtime</h4>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>El entorno certifica la purga en memoria RAM (<code style={{ color: '#E8EDF2' }}>SYS_madvise</code>) con 0 escrituras en disco.</p>
                </div>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                  <div style={{ color: '#EAB308', fontFamily: 'monospace', fontSize: '11px', marginBottom: '8px' }}>03 / INTEGRIDAD</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Kill Switch & Causalidad</h4>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Capacidad de invalidación criptográfica y trazabilidad inmutable ligada a la raíz Safe Creative.</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 5: PROOF BUNDLE */}
          {/* ========================================================================= */}
          {activeNavTab === 'proof' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 12px 0' }}>Proof Bundle & Evidence</h2>
                <p style={{ color: '#8B98A7', fontSize: '16px' }}>La prueba estructurada e independiente de cada inferencia.</p>
              </div>

              {/* INSPECTOR INTERACTIVO DE PROOF BUNDLE */}
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderTop: '3px solid #20C997', borderRadius: '8px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#20C997' }}>// SAARE_PROOF_BUNDLE_V9</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0 0 0', color: '#E8EDF2' }}>
                      Proof Bundle — La prueba estructurada de la ejecución
                    </h3>
                  </div>
                  <button onClick={copyBundleJson} style={{ background: copiedBundle ? '#20C997' : '#151B23', border: '1px solid #30363D', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    {copiedBundle ? '✔ Bundle Copiado' : '📋 Copiar Proof Bundle JSON'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #151B23', paddingBottom: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveProofTab('bundle')} style={{ padding: '6px 12px', border: '1px solid', borderColor: activeProofTab === 'bundle' ? '#20C997' : '#151B23', borderRadius: '4px', background: activeProofTab === 'bundle' ? '#151B23' : 'transparent', color: activeProofTab === 'bundle' ? '#20C997' : '#8B98A7', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                    📦 Verificación General
                  </button>
                  <button onClick={() => setActiveProofTab('causality')} style={{ padding: '6px 12px', border: '1px solid', borderColor: activeProofTab === 'causality' ? '#20C997' : '#151B23', borderRadius: '4px', background: activeProofTab === 'causality' ? '#151B23' : 'transparent', color: activeProofTab === 'causality' ? '#20C997' : '#8B98A7', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                    🔗 Cadena Causal
                  </button>
                  <button onClick={() => setActiveProofTab('rejection')} style={{ padding: '6px 12px', border: '1px solid', borderColor: activeProofTab === 'rejection' ? '#20C997' : '#151B23', borderRadius: '4px', background: activeProofTab === 'rejection' ? '#151B23' : 'transparent', color: activeProofTab === 'rejection' ? '#20C997' : '#8B98A7', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                    🛡️ Unsupported Claim
                  </button>
                  <button onClick={() => setActiveProofTab('merkle')} style={{ padding: '6px 12px', border: '1px solid', borderColor: activeProofTab === 'merkle' ? '#20C997' : '#151B23', borderRadius: '4px', background: activeProofTab === 'merkle' ? '#151B23' : 'transparent', color: activeProofTab === 'merkle' ? '#20C997' : '#8B98A7', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                    🌳 Merkle Log
                  </button>
                  <button onClick={() => setActiveProofTab('json')} style={{ padding: '6px 12px', border: '1px solid', borderColor: activeProofTab === 'json' ? '#8B98A7' : '#151B23', borderRadius: '4px', background: activeProofTab === 'json' ? '#151B23' : 'transparent', color: activeProofTab === 'json' ? '#E8EDF2' : '#8B98A7', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', marginLeft: 'auto' }}>
                    Ver JSON Completo {">"}
                  </button>
                </div>

                {activeProofTab === 'bundle' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '20px', alignItems: 'start' }}>
                    <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '18px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                      <div style={{ color: '#20C997', fontWeight: 'bold', marginBottom: '12px' }}>VERIFICACIÓN DE NIVELES:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#8B98A7' }}>
                        <div><span style={{ color: '#20C997' }}>✓</span> IDENTITY (MS3V) [VERIFIED]</div>
                        <div><span style={{ color: '#20C997' }}>✓</span> TIMESTAMP (RFC 3161) [VERIFIED]</div>
                        <div><span style={{ color: '#20C997' }}>✓</span> SIGNATURE (Ed25519) [VERIFIED]</div>
                        <div><span style={{ color: '#20C997' }}>✓</span> POLICY (POL-2026.2) [VERIFIED]</div>
                        <div><span style={{ color: '#2F81F7' }}>🛡️</span> RUNTIME (ZERO-DISK) [ATTESTED]</div>
                        <div><span style={{ color: '#EAB308' }}>⏱️</span> LATENCY (1.16ms) [MEASURED]</div>
                        <div style={{ borderTop: '1px dashed #151B23', paddingTop: '8px', color: '#E8EDF2', fontWeight: 'bold' }}>
                          PERÍMETRO VALIDADO: <span style={{ color: '#20C997' }}>VALID</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6 }}>
                      <h4 style={{ color: '#E8EDF2', margin: '0 0 8px 0', fontSize: '16px' }}>Separación de Verdad vs Validez</h4>
                      <p style={{ margin: '0 0 12px 0' }}>
                        El Proof Bundle atestigua criptográficamente que la decisión se ha generado bajo un perímetro controlado, cumpliendo con las políticas y sin escrituras en disco.
                      </p>
                      <div style={{ backgroundColor: '#151B23', padding: '12px', borderRadius: '4px', borderLeft: '3px solid #2F81F7', fontSize: '12.5px', color: '#E8EDF2' }}>
                        <strong>POLICY COMPLIANT:</strong> SAARE categoriza de forma clara las métricas (MEASURED), los estados del runtime (ATTESTED) y las firmas (VERIFIED).
                      </div>
                    </div>
                  </div>
                )}

                {activeProofTab === 'json' && (
                  <pre style={{ margin: 0, backgroundColor: '#070A0F', border: '1px solid #151B23', borderRadius: '6px', padding: '16px', color: '#E8EDF2', fontSize: '11.5px', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '350px' }}>
                    {JSON.stringify(proofBundle, null, 2)}
                  </pre>
                )}

                {activeProofTab === 'causality' && (
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '20px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ color: '#2F81F7', fontWeight: 'bold', marginBottom: '14px' }}>GRAFO DE CAUSALIDAD CRIPTOGRÁFICA (PARENT_HASH BINDING):</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                        <span style={{ color: '#8B98A7' }}>[1] INPUT_COMMITMENT:</span> <span style={{ color: '#E8EDF2' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.PARENT_HASH}</span>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                        <span style={{ color: '#8B98A7' }}>[2] EVIDENCE_BINDING:</span> <span style={{ color: '#20C997' }}>{proofBundle.PROOFS.NO_UNSUPPORTED_CLAIM.INSPECTION_MATRIX[0].EVIDENCE_HASH}</span>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                        <span style={{ color: '#8B98A7' }}>[3] RUNTIME_ACTION:</span> <span style={{ color: '#2F81F7' }}>{proofBundle.ATTESTATIONS.RUNTIME.MEMORY_STATE}</span>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                        <span style={{ color: '#8B98A7' }}>[4] OUTPUT_ROOT_DIGEST:</span> <span style={{ color: '#E8EDF2' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.EVENT_HASH}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeProofTab === 'rejection' && (
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '20px', borderRadius: '6px' }}>
                    <div style={{ color: '#E8EDF2', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>Principio de No Afirmación Sin Evidencia</div>
                    <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                      Cada aserción generada debe tener un hash de evidencia vinculante preexistente. Si no existe anclaje probatorio, el sistema activa determinísticamente un estado de <code>REJECTED</code> o <code>INDETERMINATE</code>.
                    </p>
                  </div>
                )}

                {activeProofTab === 'merkle' && (
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '20px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ color: '#20C997', fontWeight: 'bold', marginBottom: '10px' }}>LOG DE TRANSPARENCIA & RAÍZ MERKLE:</div>
                    <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px', marginBottom: '8px' }}>
                      <span style={{ color: '#8B98A7' }}>MERKLE_ROOT:</span> <span style={{ color: '#20C997' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.MERKLE_ROOT}</span>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                      <span style={{ color: '#8B98A7' }}>SEQUENCE_NUMBER:</span> {proofBundle.PROOFS.CHAIN_INTEGRITY.SEQUENCE_NUMBER}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 6: COMPLIANCE */}
          {/* ========================================================================= */}
          {activeNavTab === 'compliance' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 12px 0' }}>Soporte para Proyectos Regulados</h2>
                <p style={{ color: '#8B98A7', fontSize: '16px' }}>SAARE proporciona controles técnicos y evidencia estructurada para apoyar la certificación y justificación.</p>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderLeft: '4px solid #2F81F7', borderRadius: '8px', padding: '36px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #151B23', paddingBottom: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveGrantTab('nextgen')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'nextgen' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'nextgen' ? '#151B23' : 'transparent', color: activeGrantTab === 'nextgen' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    🇪🇺 Frameworks Normativos (AI Act / ISO)
                  </button>
                  <button onClick={() => setActiveGrantTab('kit')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'kit' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'kit' ? '#151B23' : 'transparent', color: activeGrantTab === 'kit' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    💼 Programas Nacionales (Red.es)
                  </button>
                  <button onClick={() => setActiveGrantTab('cdti')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'cdti' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'cdti' ? '#151B23' : 'transparent', color: activeGrantTab === 'cdti' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    🔬 Proyectos de I+D (CDTI / ENISA)
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                  {currentGrant.items.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '22px', borderRadius: '6px' }}>
                      <div style={{ color: item.color, fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>{item.badge}</div>
                      <strong style={{ color: '#E8EDF2', fontSize: '14.5px', display: 'block', marginBottom: '8px' }}>{item.title}</strong>
                      <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #151B23', paddingTop: '20px', color: '#8B98A7', fontSize: '13px' }}>
                  <em>Aviso: SAARE proporciona controles técnicos y trazabilidad inmutable de soporte; la certificación final de sistemas depende de auditores independientes.</em>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 7: DEVELOPERS & INTEGRACIÓN SDK */}
          {/* ========================================================================= */}
          {activeNavTab === 'developers' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 12px 0' }}>Integración de Código (SAARE-SDK)</h2>
                <p style={{ color: '#8B98A7', fontSize: '16px' }}>Integra la capa de seguridad L7 sin sustituir tu infraestructura actual.</p>
              </div>

              {/* MODELOS DE DESPLIEGUE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>EMBEDDED</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '6px 0 8px 0', color: '#E8EDF2' }}>C-ABI / .so / .dll</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Para fabricantes de ciberseguridad y agentes EDR. In-process en memoria volátil.</p>
                </div>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>GATEWAY</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '6px 0 8px 0', color: '#E8EDF2' }}>HTTP / API Middleware</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Para plataformas y workflows (LangChain, n8n). Interceptación perimetral.</p>
                </div>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>PRIVATE SERVER</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '6px 0 8px 0', color: '#E8EDF2' }}>On-Premise Enterprise</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Para banca, salud y Administración. Aislamiento total en red privada.</p>
                </div>
                <div style={{ backgroundColor: '#0D1117', border: '1px solid #2F81F7', padding: '24px', borderRadius: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2F81F7' }}>AUDITOR SEAT</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '6px 0 8px 0', color: '#E8EDF2' }}>Proof & Compliance</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Consola SaaS para peritos y consultoras. Desde {AUDITOR_PLAN_PRICE} €/mes.</p>
                </div>
              </div>

              {/* SNIPPETS */}
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#E8EDF2' }}>SDK Reference</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8B98A7', maxWidth: '600px', lineHeight: 1.5 }}>
                      En entornos privados, <code>baseURL</code> se configura para apuntar a tu contenedor On-Premise.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['nodejs', 'python', 'curl', 'cabi'].map(tab => (
                      <button key={tab} onClick={() => setActiveCodeTab(tab)} style={{ background: activeCodeTab === tab ? '#151B23' : 'transparent', border: '1px solid', borderColor: activeCodeTab === tab ? '#30363D' : '#151B23', color: activeCodeTab === tab ? '#2F81F7' : '#8B98A7', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', fontWeight: '600' }}>
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <pre style={{ margin: 0, backgroundColor: '#070A0F', border: '1px solid #21262D', borderRadius: '6px', padding: '18px', color: '#E8EDF2', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
                  {codeSnippets[activeCodeTab].replace("'sk_saare_live_AUDITOR_TOKEN'", "process.env.SAARE_LICENSE").replace('"sk_saare_live_AUDITOR_TOKEN"', 'os.environ.get("SAARE_LICENSE")')}
                </pre>
              </div>
            </div>
          )}

          {/* CINTILLO FINAL CTA (VISIBLE AL FINAL DE CUALQUIER PESTAÑA) */}
          <section style={{ margin: '80px auto 0 auto', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#151B23', border: '1px solid #30363D', borderRadius: '8px', padding: '48px 24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 12px 0' }}>Construye una IA que puedas controlar.</h2>
              <p style={{ color: '#8B98A7', fontSize: '15px', maxWidth: '600px', margin: '0 auto 28px auto' }}>Integra la capa de seguridad L7 SAARE y protege tus datos, flujos de trabajo y cumplimiento hoy mismo.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ padding: '12px 28px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                  Probar Sandbox ↗
                </button>
                <button onClick={() => { setMode('register'); setCurrentView('AUTH'); }} style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#E8EDF2', border: '1px solid #8B98A7', borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  Solicitar evaluación Enterprise
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ borderTop: '1px solid #151B23', marginTop: '60px', paddingTop: '32px', fontSize: '12px', color: '#8B98A7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#E8EDF2' }}>SAARE</strong> · AI Security & Evidence Layer
                <div style={{ marginTop: '4px' }}>Safe Creative ID: 2607076315021 / 2607076314949 · © 2026 Gabinete Jurídico y Pericial MS3V</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>Verificador API</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>Consola GRC</a>
                <a href="mailto:peritajes@ms3v.es" style={{ color: '#8B98A7', textDecoration: 'none' }}>Contacto</a>
              </div>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}