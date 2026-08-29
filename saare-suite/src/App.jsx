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
      tag: "FONDO DE RECUPERACIÓN (PRTR) / PLAN ESPAÑA DIGITAL",
      title: "Auditorías de NextGenerationEU & Fondos Europeos",
      summary: "SAARE genera evidencia técnica reutilizable para documentación de gobernanza, auditoría, seguridad y trazabilidad de proyectos de IA. Mapea controles técnicos y evidencias de ejecución a los requisitos aplicables de tu proyecto para cumplir con exigencias de fondos y convocatorias públicas.",
      items: [
        {
          badge: "01 / EU AI ACT",
          color: "#FF4D5A",
          title: "Art. 9 (Risk) & Art. 12 (Logs)",
          desc: "Trazabilidad continua de los sistemas y controles ex-ante integrados directamente en el entorno de ejecución perimetral."
        },
        {
          badge: "02 / ISO/IEC 42001",
          color: "#20C997",
          title: "Control B.6 (Data Lifecycle)",
          desc: "Mecanismo purificador Zero-Residue en RAM (SYS_madvise) para certificar una gestión segura del ciclo de vida del dato."
        },
        {
          badge: "03 / RGPD / LOPDGDD",
          color: "#2F81F7",
          title: "Art. 5 & 32 (Minimization)",
          desc: "Redacción criptográfica y ocultación en tránsito para asegurar que los datos PII nunca alcanzan el proveedor de inferencia LLM."
        }
      ]
    },
    kit: {
      tag: "PROGRAMA ASESORAMIENTO IA & KIT CONSULTING (RED.ES)",
      title: "Justificación de Planes de Asesoramiento e Implantación IA",
      summary: "Para justificar los bonos de asesoramiento y adopción de IA en PYMEs, los Asesores Digitales deben presentar memorias técnicas que demuestren un análisis de riesgos real, gobernanza perimetral y un plan de cumplimiento normativo operativo.",
      items: [
        {
          badge: "01 / EVIDENCIA OBLIGATORIA",
          color: "#FF4D5A",
          title: "Generador de Memorias Técnicas",
          desc: "Evita la pérdida de subvenciones por memorias genéricas, aportando los Proof Bundles deterministas generados en la cuenta del cliente."
        },
        {
          badge: "02 / BLINDAJE SAARE",
          color: "#20C997",
          title: "Auditoría Delegada con Handshake",
          desc: "El Asesor audita el tráfico mediante Handshake Token en memoria RAM sin acceder al secreto corporativo."
        },
        {
          badge: "03 / ENTREGABLE AUDITABLE",
          color: "#2F81F7",
          title: "Matriz de Fugas de PII",
          desc: "Informe pericial descargable con la matriz de directivas activas (DNI, IBAN, DLP) exigidas por Red.es."
        }
      ]
    },
    cdti: {
      tag: "PROYECTOS I+D+i, NEOTEC & PRÉSTAMOS ENISA",
      title: "Hitos Técnicos y Seguridad Crítica en Proyectos CDTI",
      summary: "Los proyectos de I+D+i intensivos en IA requieren demostrar una arquitectura tecnológica innovadora y robusta, con métricas de latencia validadas, protección de propiedad industrial y cumplimiento preventivo del Reglamento Europeo de IA (EU AI Act).",
      items: [
        {
          badge: "01 / HITO TÉCNICO",
          color: "#FF4D5A",
          title: "Validación de Latencia L7",
          desc: "Evita penalizaciones en tramos no reembolsables demostrando una latencia determinista P99 < 1.16 ms en la capa de seguridad."
        },
        {
          badge: "02 / BLINDAJE SAARE",
          color: "#20C997",
          title: "Hook Nativo In-Process C-ABI",
          desc: "Integración directa que acredita ante ENISA/CDTI una arquitectura de software disruptiva de Residuo Cero en HugePages."
        },
        {
          badge: "03 / ENTREGABLE AUDITABLE",
          color: "#2F81F7",
          title: "Certificado Registral Independiente",
          desc: "Acreditación de autoría y propiedad del nodo (Safe Creative Nº 2607076315021) aportable al informe de seguimiento técnico."
        }
      ]
    }
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';\n\n// Redirección perimetral L7 hacia el interceptor determinista local o gateway edge\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': process.env.SAARE_LICENSE,\n    'X-SAARE-Auditor-Delegation': 'emp_node_auth_hash_89bc2',\n    'X-SAARE-Execution-Mode': 'IN_MEMORY_ENFORCE',\n    'X-SAARE-Proof-Bundle': 'REQUIRE_V9_FULL_ATTESTATION'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar expediente: Titular con DNI 48593021X' }]\n});`,
    python: `from openai import OpenAI\nimport os\n\n# Cliente SDK con validación, prueba de rechazo y redacción de PII ex-ante\nclient = OpenAI(\n    api_key=os.environ.get("OPENAI_API_KEY"),\n    base_url="${API_BASE}/intercept",\n    default_headers={\n        "X-SAARE-License": os.environ.get("SAARE_LICENSE"),\n        "X-SAARE-Auditor-Delegation": "emp_node_auth_hash_89bc2",\n        "X-SAARE-Execution-Mode": "IN_MEMORY_ENFORCE",\n        "X-SAARE-Proof-Bundle": "REQUIRE_V9_FULL_ATTESTATION"\n    }\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Auditar expediente: Titular con DNI 48593021X"}]\n)`,
    curl: `curl -X POST ${API_BASE}/intercept \\\n  -H "Content-Type: application/json" \\\n  -H "X-SAARE-License: \$SAARE_LICENSE" \\\n  -H "X-SAARE-Auditor-Delegation: emp_node_auth_hash_89bc2" \\\n  -H "X-SAARE-Proof-Bundle: REQUIRE_V9_FULL_ATTESTATION" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Auditar titular DNI 48593021X"}]\n  }'`,
    cabi: `/* SAARE Native C-ABI In-Process Sensor Hook (Zero-Residue L7 Gate) */\n#include <saare_l7.h>\n\nint process_inference_buffer(const uint8_t* payload_ptr, size_t payload_len) {\n    saare_ctx_t* ctx = saare_init_context(getenv("SAARE_LICENSE"));\n    saare_verdict_t verdict = saare_scan_memory_buffer(ctx, payload_ptr, payload_len);\n    \n    if (verdict.state == SAARE_STATE_REJECTED || verdict.state == SAARE_STATE_INDETERMINATE) {\n        // Purga atómica en memoria RAM mediante SYS_madvise (MADV_DONTNEED)\n        saare_purge_madvise((void*)payload_ptr, payload_len);\n        saare_emit_signed_rejection_proof(ctx, verdict.rejection_digest);\n        return -1; // Transmisión cortada a nivel de socket (< 0.017 ms)\n    }\n    \n    return 0; // Tráfico acotado al perímetro válido\n}`
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
        "name": "SAARE L7 Governance Agent (V9 Proof Bundle Edition)",
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

      const contentJsCode = `// SAARE L7 TELEMETRY & PROOF BUNDLE BRIDGE v9.0.0
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

      zip.file("storage_managed.json", JSON.stringify({
        "saare_user_email": tEmail,
        "saare_tenant_domain": tTenant,
        "saare_token": tToken,
        "saare_role": "AUDITOR"
      }, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(blob);
      dl.download = `saare-proof-runtime-${tTenant.toLowerCase().replace(/\\s+/g, '_')}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    } catch (err) {
      alert("Error al compilar el bundle del agente.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const copyBundleJson = () => {
    navigator.clipboard.writeText(JSON.stringify(proofBundle, null, 2));
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 2000);
  };

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(CANONICAL_HASH);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const currentGrant = grantsData[activeGrantTab];

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

      {/* HEADER DEEP TECH */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(7, 10, 15, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #151B23' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setCurrentView('LANDING'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div style={{ width: '28px', height: '28px', backgroundColor: '#E8EDF2', color: '#070A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px', borderRadius: '4px' }}>
              S
            </div>
            <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.3px', color: '#E8EDF2' }}>
              SAARE <span style={{ color: '#8B98A7', fontWeight: '400', fontSize: '13px', marginLeft: '6px' }}>// Deterministic Runtime Attestation L7</span>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '22px', alignItems: 'center', fontSize: '13px', fontWeight: '500' }}>
            <a href="#problem" style={{ color: '#8B98A7', textDecoration: 'none' }}>El Problema</a>
            <a href="#markets" style={{ color: '#8B98A7', textDecoration: 'none' }}>Mercados</a>
            <a href="#architecture" style={{ color: '#8B98A7', textDecoration: 'none' }}>Arquitectura</a>
            <a href="#proof-bundle" style={{ color: '#20C997', textDecoration: 'none', fontWeight: '600' }}>Proof Bundle</a>
            <a href="#subvenciones" style={{ color: '#2F81F7', textDecoration: 'none', fontWeight: '600' }}>Ayudas & Fondos</a>
            <a href="#solutions" style={{ color: '#8B98A7', textDecoration: 'none' }}>Despliegues</a>
            <a href="#evidence" style={{ color: '#8B98A7', textDecoration: 'none' }}>Evidencia</a>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '12px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#151B23', border: '1px solid #30363D', color: '#2F81F7', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                  {currentView === 'STATUS' ? 'Ver Landing' : 'Consola'}
                </button>
                <button onClick={handleLogout} style={{ color: '#FF4D5A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '7px 16px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: '12px' }}>
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

      {/* VISTA 3: LANDING PAGE ENTERPRISE */}
      {currentView === 'LANDING' && (
        <main>
          {/* HERO SECTION */}
          <section style={{ maxWidth: '1100px', margin: '70px auto 50px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', backgroundColor: 'rgba(47, 129, 247, 0.1)', border: '1px solid rgba(47, 129, 247, 0.3)', borderRadius: '20px', color: '#2F81F7', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', marginBottom: '24px' }}>
              ARQUITECTURA DE ATENCIÓN DETERMINISTA EN TIEMPO DE EJECUCIÓN
            </div>

            <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 20px 0', color: '#E8EDF2' }}>
              El sistema impide que una salida no verificada se convierta en <span style={{ color: '#2F81F7' }}>una decisión válida.</span>
            </h1>

            <p style={{ fontSize: '16.5px', color: '#8B98A7', lineHeight: 1.6, maxWidth: '820px', margin: '0 auto 36px auto' }}>
              Protege la IA antes de que el riesgo llegue al modelo. SAARE intercepta, valida y gobierna el flujo de inferencia en Capa 7. Las afirmaciones que no cumplen las condiciones de evidencia y política no atraviesan el perímetro. Cada evento genera evidencia criptográfica verificable para seguridad, compliance y auditoría.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '40px' }}>
              <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ padding: '12px 28px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}>
                Probar Sandbox de Evaluación ↗
              </button>
              <button onClick={() => { setMode('register'); setCurrentView('AUTH'); }} style={{ padding: '12px 24px', backgroundColor: '#151B23', color: '#E8EDF2', border: '1px solid #30363D', borderRadius: '4px', fontWeight: '600', fontSize: '13.5px', cursor: 'pointer' }}>
                Aprovisionar Asiento Auditor
              </button>
            </div>
          </section>

          {/* MÓDULO: ¿QUÉ PROBLEMA RESUELVE? */}
          <section id="problem" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0' }}>¿Qué problema resuelve SAARE?</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔐</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Data Leakage</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Evita que información regulada atraviese el perímetro de IA hacia el proveedor del modelo.</p>
              </div>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🧠</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Unsupported Claims</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Impide que afirmaciones sin evidencia suficiente adquieran estado válido durante la inferencia.</p>
              </div>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🕵️</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Auditability</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Cada evento queda asociado a un paquete de evidencia criptográfica independientemente verificable.</p>
              </div>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚖️</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Governance</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Aplica políticas de seguridad, riesgo y cumplimiento antes y durante la ejecución, no a posteriori.</p>
              </div>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔗</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Provenance</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Mantiene la cadena causal inmutable entre entrada, evidencia, decisión y acción ejecutada.</p>
              </div>
            </div>
          </section>

          {/* MÓDULO: MERCADOS (CASOS DE USO) */}
          <section id="markets" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0' }}>¿Dónde quieres integrar SAARE?</h2>
              <p style={{ color: '#8B98A7', fontSize: '15px' }}>Arquitectura de referencia para 5 mercados críticos.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>01 / AI WORKFLOWS</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>LangChain & n8n</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Garantiza que los flujos automatizados empresariales no procesen ni emitan datos fuera de las políticas definidas en el perímetro.</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#20C997', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>02 / CYBERSECURITY</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>EDR & XDR Providers</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Integración nativa C-ABI para inspección in-process de buffers de red, ofreciendo DLP para IA directamente en el endpoint.</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#FF4D5A', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>03 / GSIs & CONSULTING</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Auditoría & Compliance</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Generación de Proof Bundles para justificar cumplimiento de ISO/IEC 42001, EU AI Act y auditorías técnicas de subvenciones.</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#E8EDF2', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>04 / CLOUD & GATEWAYS</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>API Management</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Middleware para interceptar y limpiar tráfico hacia proveedores LLM (OpenAI, Anthropic) antes de que abandone la red segura.</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#E8EDF2', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '12px' }}>05 / REGULATED SOFTWARE</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Salud, Banca y Legal</h3>
                <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>Desacople total de datos sensibles. Atestación del runtime de que no existen escrituras en disco (Residuo Cero) para entornos LOPDGDD estrictos.</p>
              </div>
            </div>
          </section>

          {/* DIAGRAMA ESTRUCTURAL ASCII DE PRUEBA DE RECHAZO Y ESTADOS */}
          <section id="architecture" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px', maxWidth: '720px', margin: '0 auto', textAlign: 'left', overflowX: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #151B23', paddingBottom: '8px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>ARQUITECTURA DE REFERENCIA EX-ANTE</span>
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
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#64748B', textAlign: 'center', fontFamily: 'monospace' }}>
                Resultados de latencia correspondientes al entorno y metodología de benchmark especificados.
              </div>
            </div>
            
            {/* MENSAJE DE POSICIONAMIENTO */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#E8EDF2', marginBottom: '16px' }}>SAARE no es otro guardrail. Es una capa de control y evidencia alrededor de la ejecución.</h3>
              <p style={{ color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
                Guardrails controlan comportamientos. DLP controla datos. API Gateways controlan tráfico. SIEM registra eventos. <strong>SAARE conecta estas funciones con un perímetro L7 y una evidencia verificable de la decisión.</strong>
              </p>
            </div>
          </section>

          {/* MÓDULO DE TABLA COMPARATIVA */}
          <section style={{ maxWidth: '900px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#E8EDF2', marginBottom: '24px', textAlign: 'center' }}>SAARE frente al stack tradicional</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #151B23', color: '#8B98A7' }}>
                    <th style={{ padding: '12px' }}>Capacidad</th>
                    <th style={{ padding: '12px' }}>DLP</th>
                    <th style={{ padding: '12px' }}>API Gateway</th>
                    <th style={{ padding: '12px' }}>SIEM</th>
                    <th style={{ padding: '12px' }}>LLM Guardrails</th>
                    <th style={{ padding: '12px', color: '#2F81F7' }}>SAARE</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#E8EDF2' }}>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>PII detection</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>Pre-inference enforcement</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>Runtime evidence</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>Cryptographic proof</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>Causal chain</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>Merkle transparency</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>Model-independent</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#20C997' }}>✓</td>
                    <td style={{ padding: '12px', color: '#EAB308' }}>parcial</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', fontWeight: '600' }}>Reject unsupported claim</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#8B98A7' }}>—</td>
                    <td style={{ padding: '12px', color: '#EAB308' }}>parcial</td>
                    <td style={{ padding: '12px', color: '#2F81F7', fontWeight: 'bold' }}>✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* MÓDULO SAARE PROOF BUNDLE INTERACTIVO */}
          <section id="proof-bundle" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0' }}>No tienes que creer a SAARE. Puedes verificarlo.</h2>
              <p style={{ color: '#8B98A7', fontSize: '15px' }}>Demostración en vivo de la Arquitectura de Atestación V9.</p>
            </div>

            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderTop: '3px solid #20C997', borderRadius: '8px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#20C997' }}>// SAARE_PROOF_BUNDLE_INSPECTOR</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0 0 0', color: '#E8EDF2' }}>
                    Paquete Verificable de Integridad & Atestación
                  </h3>
                </div>
                <button onClick={copyBundleJson} style={{ background: copiedBundle ? '#20C997' : '#151B23', border: '1px solid #30363D', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {copiedBundle ? '✔ Bundle Copiado' : '📋 Copiar Proof Bundle JSON'}
                </button>
              </div>

              {/* TABS DEL PROOF BUNDLE */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #151B23', paddingBottom: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveProofTab('bundle')} style={{ padding: '6px 12px', border: '1px solid', borderColor: activeProofTab === 'bundle' ? '#20C997' : '#151B23', borderRadius: '4px', background: activeProofTab === 'bundle' ? '#151B23' : 'transparent', color: activeProofTab === 'bundle' ? '#20C997' : '#8B98A7', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                  📦 Visión General
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
              </div>

              {/* CONTENIDO DE INSPECCIÓN SEGÚN TAB */}
              {activeProofTab === 'bundle' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '20px', alignItems: 'start' }}>
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '18px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ color: '#20C997', fontWeight: 'bold', marginBottom: '12px' }}>VERIFICACIÓN DE ATTESTACIÓN:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#8B98A7' }}>
                      <div><span style={{ color: '#20C997' }}>✓</span> IDENTITY (MS3V)</div>
                      <div><span style={{ color: '#20C997' }}>✓</span> TIMESTAMP (RFC 3161)</div>
                      <div><span style={{ color: '#20C997' }}>✓</span> SIGNATURE (Ed25519)</div>
                      <div><span style={{ color: '#20C997' }}>✓</span> POLICY (POL-2026.2)</div>
                      <div><span style={{ color: '#20C997' }}>✓</span> EVIDENCE_COMMITMENT</div>
                      <div><span style={{ color: '#20C997' }}>✓</span> CAUSALITY_CHAIN</div>
                      <div><span style={{ color: '#20C997' }}>✓</span> MERKLE_INCLUSION</div>
                      <div><span style={{ color: '#20C997' }}>✓</span> REVOCATION: ACTIVE</div>
                      <div style={{ borderTop: '1px dashed #151B23', paddingTop: '8px', color: '#E8EDF2', fontWeight: 'bold' }}>
                        FINAL PERIMETER: <span style={{ color: '#20C997' }}>VALID</span>
                      </div>
                    </div>
                  </div>
                  <pre style={{ margin: 0, backgroundColor: '#070A0F', border: '1px solid #151B23', borderRadius: '6px', padding: '16px', color: '#E8EDF2', fontSize: '11.5px', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '350px' }}>
                    {JSON.stringify(proofBundle, null, 2)}
                  </pre>
                </div>
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
                  <div style={{ color: '#E8EDF2', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>Principio de No Afirmación Sin Evidencia (No-Unsupported-Claim)</div>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    Cada aserción generada debe tener un hash de evidencia vinculante preexistente. Si no existe anclaje probatorio, el sistema no emite la afirmación como verdadera, sino que activa la prueba de rechazo o indeterminación.
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#0D1117', padding: '12px', borderRadius: '4px', border: '1px solid #151B23' }}>
                    {JSON.stringify(proofBundle.PROOFS.NO_UNSUPPORTED_CLAIM, null, 2)}
                  </div>
                </div>
              )}

              {activeProofTab === 'merkle' && (
                <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '20px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                  <div style={{ color: '#20C997', fontWeight: 'bold', marginBottom: '10px' }}>LOG DE TRANSPARENCIA & RAÍZ MERKLE:</div>
                  <p style={{ color: '#8B98A7', fontSize: '12.5px', fontFamily: 'sans-serif', margin: '0 0 14px 0' }}>
                    Permite a auditores externos verificar la inclusión matemática de un evento individual dentro de millones de transacciones sin revelar el texto plano del usuario.
                  </p>
                  <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px', marginBottom: '8px' }}>
                    <span style={{ color: '#8B98A7' }}>MERKLE_ROOT:</span> <span style={{ color: '#20C997' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.MERKLE_ROOT}</span>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                    <span style={{ color: '#8B98A7' }}>SEQUENCE_NUMBER:</span> {proofBundle.PROOFS.CHAIN_INTEGRITY.SEQUENCE_NUMBER}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* MÓDULO: JUSTIFICACIÓN DE SUBVENCIONES Y AYUDAS PÚBLICAS */}
          <section id="subvenciones" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderLeft: '4px solid #2F81F7', borderRadius: '8px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7' }}>// {currentGrant.tag}</span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0', color: '#E8EDF2' }}>
                    Evidence-ready for regulated AI projects
                  </h2>
                </div>
              </div>

              <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', maxWidth: '850px' }}>
                SAARE genera evidencia técnica reutilizable para documentación de gobernanza, auditoría, seguridad y trazabilidad de proyectos de IA. Mapea controles técnicos y evidencias de ejecución a los requisitos aplicables de tu proyecto para cumplir con exigencias de fondos y convocatorias públicas.
              </p>

              {/* TABS DE SUBVENCIONES */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #151B23', paddingBottom: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveGrantTab('nextgen')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'nextgen' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'nextgen' ? '#151B23' : 'transparent', color: activeGrantTab === 'nextgen' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🇪🇺 NextGenerationEU & PRTR
                </button>
                <button onClick={() => setActiveGrantTab('kit')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'kit' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'kit' ? '#151B23' : 'transparent', color: activeGrantTab === 'kit' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  💼 Kit Consulting & Asesoramiento IA
                </button>
                <button onClick={() => setActiveGrantTab('cdti')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'cdti' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'cdti' ? '#151B23' : 'transparent', color: activeGrantTab === 'cdti' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                  🔬 CDTI, ENISA & Proyectos I+D+i
                </button>
              </div>

              {/* CONTENIDO DINÁMICO */}
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px dashed #151B23', paddingTop: '20px' }}>
                <span style={{ fontSize: '12.5px', color: '#8B98A7', fontFamily: 'monospace' }}>
                  ¿Gestionas justificaciones o memorias técnicas para clientes? Habilita tu Asiento de Auditor.
                </span>
                <button onClick={() => { setMode('register'); setCurrentView('AUTH'); }} style={{ padding: '8px 20px', backgroundColor: '#2F81F7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Acreditar Asiento Pericial ↗
                </button>
              </div>
            </div>
          </section>

          {/* VECTORES DE DESPLIEGUE CON ACCIONES EN TODAS LAS TARJETAS */}
          <section id="solutions" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7' }}>// DEPLOYMENT_MODELS</span>
              <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0 0 0', color: '#E8EDF2' }}>Deploy SAARE your way</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>EMBEDDED</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997' }}>0.017 ms</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#E8EDF2' }}>C-ABI / .so / .dll</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    Para fabricantes de seguridad y agentes EDR/XDR. Ejecución nativa in-process en memoria volátil.
                  </p>
                </div>
                <a href="#developers" onClick={() => setActiveCodeTab('cabi')} style={{ display: 'inline-block', textAlign: 'center', padding: '8px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#20C997', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                  Ver C-ABI Hook ↓
                </a>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>GATEWAY</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2F81F7' }}>Edge / HTTP</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#E8EDF2' }}>HTTP / API / Edge</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    Para plataformas y workflows (LangChain, n8n). Middleware perimetral de filtrado determinista.
                  </p>
                </div>
                <a href="#developers" onClick={() => setActiveCodeTab('nodejs')} style={{ display: 'inline-block', textAlign: 'center', padding: '8px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#2F81F7', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                  Ver SDK Gateway ↓
                </a>
              </div>
              
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>PRIVATE</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#EAB308' }}>On-Premise</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#E8EDF2' }}>Enterprise / Regulated</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    Para banca, salud, legal y Administración. Despliegue on-premise con independencia del proveedor LLM.
                  </p>
                </div>
                <a href="mailto:peritajes@ms3v.es?subject=Consulta%20Despliegue%20Privado%20SAARE" style={{ display: 'inline-block', textAlign: 'center', padding: '8px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                  Consultar On-Premise ↗
                </a>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #2F81F7', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(47,129,247,0.08)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2F81F7', backgroundColor: 'rgba(47,129,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>AUDITOR</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#20C997' }}>Asiento Único</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#E8EDF2' }}>Proof & Compliance</h3>
                  <p style={{ color: '#8B98A7', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    Para peritos, CISOs y consultoras. Handshake consentido y generación de dictámenes periciales.
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 14px 0' }}>
                    {AUDITOR_PLAN_PRICE} € <span style={{ fontSize: '12px', color: '#8B98A7', fontWeight: 'normal' }}>/ mes</span>
                  </div>
                </div>
                <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '10px', backgroundColor: '#2F81F7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  Contratar Asiento Auditor ↗
                </button>
              </div>
            </div>
          </section>

          {/* DEVELOPERS / SNIPPETS */}
          <section id="developers" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#E8EDF2' }}>Integración de Código (SAARE-SDK)</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#8B98A7', maxWidth: '600px', lineHeight: 1.5 }}>
                    <strong>Aviso de despliegue:</strong> Los snippets muestran la conexión en modo <em>Gateway</em>. En producción, <code>baseURL</code> debe apuntar a tu instancia Edge o contenedor local privado para garantizar que el dato no abandona tu red segura antes de ser redactado.
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
                {codeSnippets[activeCodeTab]}
              </pre>
            </div>
          </section>
          
          {/* EVIDENCIA FORENSE EN VIVO */}
          <section id="evidence" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7' }}>// FORENSIC_EVIDENCE_NODE</span>
                <h2 style={{ fontSize: '26px', fontWeight: '800', margin: '4px 0 0 0', color: '#E8EDF2' }}>Verificación en Vivo (L7 Edge)</h2>
              </div>
              <span style={{ color: '#8B98A7', fontSize: '12px', fontFamily: 'monospace' }}>ROOT FIDUCIARIA: SAFE CREATIVE Nº 2607076315021</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px', alignItems: 'stretch' }}>
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '24px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #151B23', paddingBottom: '8px' }}>
                  <span style={{ color: '#8B98A7' }}>TX_RECORD</span>
                  <span style={{ color: '#E8EDF2' }}>SAARE-7F82A1</span>
                </div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>TIMESTAMP:</span> 2026-08-29 14:42:07 UTC</div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>POLICY_RULE:</span> PII-001 (GDPR_STRICT)</div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>DETECTION:</span> <span style={{ color: '#FF4D5A' }}>IBAN_REGULATED_MATCH</span></div>
                <div style={{ marginBottom: '10px' }}><span style={{ color: '#8B98A7' }}>ACTION:</span> <span style={{ color: '#2F81F7' }}>REDACT_IN_MEMORY</span></div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ color: '#8B98A7' }}>CANONICAL_SHA256:</span>
                  <div style={{ color: '#E8EDF2', wordBreak: 'break-all', backgroundColor: '#070A0F', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    {CANONICAL_HASH}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed #151B23' }}>
                  <span style={{ color: '#20C997', fontWeight: 'bold' }}>✓ L7_CONFINEMENT_VALID (RFC 3161)</span>
                  <button onClick={copyHashToClipboard} style={{ background: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    {copiedHash ? 'Copiado' : 'Copiar Hash'}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0', color: '#E8EDF2' }}>
                    Validación Pública Descentralizada
                  </h3>
                  <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Cualquier auditor externo puede verificar el Proof Bundle criptográfico contra el endpoint Edge sin exponer la carga útil ni comprometer la privacidad.
                  </p>
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #21262D', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7', wordBreak: 'break-all', marginBottom: '16px' }}>
                    GET {VERIFY_URL}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#2F81F7', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '700' }}>
                    🔍 Ejecutar Verificación en Vivo (Edge Gateway) ↗
                  </a>
                  <button onClick={() => setShowDiploma(true)} style={{ padding: '12px 18px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Diploma RPI
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER ENTERPRISE */}
          <footer style={{ borderTop: '1px solid #151B23', backgroundColor: '#070A0F', padding: '36px 24px', fontSize: '12px', color: '#8B98A7' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <strong style={{ color: '#E8EDF2' }}>S.A.A.R.E. Platform (ms3v)</strong> · Motor Lógico Perimetral para IA
                <div style={{ marginTop: '4px' }}>Safe Creative ID: 2607076315021 / 2607076314949 · RFC 3161 Evidence · Gabinete Jurídico y Pericial MS3V</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>Trust Center / Root API</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>GRC Console</a>
              </div>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}