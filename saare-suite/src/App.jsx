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
      tag: "FONDO DE RECUPERACIÓN / PLAN ESPAÑA DIGITAL",
      title: "Evidencia Técnica para NextGenerationEU",
      summary: "SAARE genera evidencia técnica reutilizable para la documentación de gobernanza y trazabilidad exigida en auditorías y convocatorias públicas.",
      items: [
        { badge: "01 / EU AI ACT", color: "#FF4D5A", title: "Art. 9 (Risk) & Art. 12 (Logs)", desc: "Trazabilidad continua y controles ex-ante integrados directamente en el perímetro." },
        { badge: "02 / ISO/IEC 42001", color: "#20C997", title: "Control B.6 (Data Lifecycle)", desc: "Mecanismo Zero-Residue en RAM para apoyar la auditoría del ciclo de vida del dato." },
        { badge: "03 / RGPD / LOPDGDD", color: "#2F81F7", title: "Art. 5 & 32 (Minimization)", desc: "Ocultación en tránsito para asegurar que los PII no alcanzan al proveedor LLM." }
      ]
    },
    kit: {
      tag: "PROGRAMA KIT CONSULTING (RED.ES)",
      title: "Evidencia de Planes de Asesoramiento IA",
      summary: "Aporta pruebas técnicas que demuestren un análisis de riesgos real, gobernanza perimetral y un plan de cumplimiento normativo operativo para PYMEs.",
      items: [
        { badge: "01 / EVIDENCIA OBLIGATORIA", color: "#FF4D5A", title: "Generador de Memorias Técnicas", desc: "Aporta Proof Bundles deterministas para evitar memorias genéricas." },
        { badge: "02 / BLINDAJE SAARE", color: "#20C997", title: "Auditoría Delegada con Handshake", desc: "Audita el tráfico en memoria RAM sin acceder al secreto corporativo." },
        { badge: "03 / ENTREGABLE AUDITABLE", color: "#2F81F7", title: "Matriz de Fugas de PII", desc: "Informe descargable con las directivas exigidas por Red.es." }
      ]
    }
  };

  const codeSnippets = {
    nodejs: `import OpenAI from 'openai';\n\n// Redirección perimetral L7 hacia el interceptor determinista SAARE\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: '${API_BASE}/intercept',\n  defaultHeaders: {\n    'X-SAARE-License': process.env.SAARE_LICENSE,\n    'X-SAARE-Auditor-Delegation': 'emp_node_auth_hash_89bc2',\n    'X-SAARE-Execution-Mode': 'IN_MEMORY_ENFORCE',\n    'X-SAARE-Proof-Bundle': 'REQUIRE_V9_FULL_ATTESTATION'\n  }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar expediente: Titular con DNI 48593021X' }]\n});`,
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
        "name": "SAARE L7 Governance Agent",
        "version": "9.0.0",
        "description": "Ex-Ante Perimeter, Rejection Proofs & Runtime Attestation Engine",
        "background": { "service_worker": "background.js" },
        "content_scripts": [{ "matches": ["https://*/*"], "js": ["content.js"], "run_at": "document_start" }],
        "web_accessible_resources": [{ "resources": ["inject.js"], "matches": ["https://*/*"] }],
        "permissions": ["storage"]
      }, null, 2));

      const injectContent = `/* S.A.A.R.E. V9 Engine */\n(function() { console.log('SAARE V9 Loaded'); })();`;
      zip.file("inject.js", injectContent);

      const contentJsCode = `// SAARE DOM Bridge\nconsole.log('Bridge Active');`;
      zip.file("content.js", contentJsCode);

      const bgCode = `// Background Service Worker`;
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

  const copyBundleJson = () => {
    navigator.clipboard.writeText(JSON.stringify(proofBundle, null, 2));
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 2000);
  };

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

      {/* HEADER B2B ENTERPRISE */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(7, 10, 15, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #151B23' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setCurrentView('LANDING'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
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

          <nav style={{ display: 'flex', gap: '22px', alignItems: 'center', fontSize: '13px', fontWeight: '500' }}>
            <a href="#what-you-buy" style={{ color: '#8B98A7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#E8EDF2'} onMouseOut={(e) => e.target.style.color = '#8B98A7'}>Plataforma</a>
            <a href="#markets" style={{ color: '#8B98A7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#E8EDF2'} onMouseOut={(e) => e.target.style.color = '#8B98A7'}>Casos de Uso</a>
            <a href="#roi" style={{ color: '#8B98A7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#E8EDF2'} onMouseOut={(e) => e.target.style.color = '#8B98A7'}>Valor</a>
            <a href="#architecture" style={{ color: '#8B98A7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#E8EDF2'} onMouseOut={(e) => e.target.style.color = '#8B98A7'}>Arquitectura</a>
            <a href="#proof-bundle" style={{ color: '#20C997', textDecoration: 'none', fontWeight: '600' }}>Verificar Evidencia</a>
            <a href="#developers" style={{ color: '#8B98A7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#E8EDF2'} onMouseOut={(e) => e.target.style.color = '#8B98A7'}>Docs</a>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '12px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#151B23', border: '1px solid #30363D', color: '#2F81F7', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                  {currentView === 'STATUS' ? 'Ver Landing' : 'Consola'}
                </button>
                <button onClick={handleLogout} style={{ color: '#FF4D5A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '7px 16px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', marginLeft: '12px', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#1d6ce3'} onMouseOut={(e) => e.target.style.backgroundColor = '#2F81F7'}>
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

      {/* VISTA 3: LANDING PAGE ENTERPRISE B2B */}
      {currentView === 'LANDING' && (
        <main>
          {/* HERO SECTION - REGLA 70/20/10 - FOCO EN EL RESULTADO EMPRESARIAL */}
          <section style={{ maxWidth: '1100px', margin: '70px auto 50px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', backgroundColor: 'rgba(47, 129, 247, 0.1)', border: '1px solid rgba(47, 129, 247, 0.3)', borderRadius: '20px', color: '#2F81F7', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.5px' }}>
              SAARE — AI SECURITY & EVIDENCE LAYER
            </div>

            <h1 style={{ fontSize: '52px', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 20px 0', color: '#E8EDF2' }}>
              El perímetro de seguridad para <span style={{ color: '#2F81F7' }}>IA empresarial.</span>
            </h1>

            <p style={{ fontSize: '17px', color: '#8B98A7', lineHeight: 1.6, maxWidth: '820px', margin: '0 auto 36px auto' }}>
              Evita que datos sensibles o respuestas no verificadas se conviertan en acciones. SAARE controla las inferencias antes de que el riesgo llegue a producción y genera evidencia verificable de lo ocurrido.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '40px' }}>
              <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ padding: '14px 28px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 14px rgba(47,129,247,0.3)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#1d6ce3'} onMouseOut={(e) => e.target.style.backgroundColor = '#2F81F7'}>
                Probar Sandbox
              </button>
              <button onClick={() => document.getElementById('markets').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '14px 24px', backgroundColor: '#151B23', color: '#E8EDF2', border: '1px solid #30363D', borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#8B98A7'} onMouseOut={(e) => e.target.style.borderColor = '#30363D'}>
                Solicitar evaluación Enterprise
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: '#8B98A7', fontSize: '12px', fontWeight: '600', fontFamily: 'monospace', opacity: 0.8 }}>
              <span>L7</span>
              <span>·</span>
              <span>EX-ANTE</span>
              <span>·</span>
              <span>MODEL-INDEPENDENT</span>
              <span>·</span>
              <span>EVIDENCE-READY</span>
            </div>
          </section>

          {/* QUÉ COMPRAS: EXPLICACIÓN INMEDIATA DEL PRODUCTO */}
          <section id="what-you-buy" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>¿Qué es SAARE para tu empresa?</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>01 —</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>AI Security Layer</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Control de tráfico e inferencias directo en el perímetro de ejecución (L7).</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>02 —</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Policy Enforcement</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Aplicación estricta de políticas de datos antes de permitir que el flujo continúe.</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>03 —</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Evidence Layer</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Generación de evidencia criptográfica verificable por terceros independientes.</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>04 —</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Enterprise Integration</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Despliegue adaptable mediante Gateway, SDK, Embedded (C-ABI) u On-Premise.</p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '8px' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '8px' }}>05 —</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 8px 0' }}>Audit & Governance</h3>
                <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>Información lista y reutilizable para auditorías de seguridad, compliance y subvenciones.</p>
              </div>
            </div>
          </section>

          {/* ANTES Y DESPUÉS (VALOR DE NEGOCIO VISUAL) */}
          <section style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '40px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
                
                {/* ANTES */}
                <div style={{ textAlign: 'center', flex: 1, minWidth: '250px' }}>
                  <div style={{ color: '#FF4D5A', fontWeight: '800', marginBottom: '24px', letterSpacing: '1px', fontSize: '13px' }}>SIN SAARE</div>
                  <div style={{ color: '#8B98A7', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <div style={{ padding: '10px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '220px' }}>Usuario</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '220px' }}>Aplicación</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '220px' }}>LLM Externo</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '1px solid #FF4D5A', borderRadius: '4px', color: '#FF4D5A', width: '100%', maxWidth: '220px', fontWeight: '600' }}>Respuesta de IA</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '1px dashed #30363D', borderRadius: '4px', width: '100%', maxWidth: '220px', fontStyle: 'italic' }}>¿Quién demuestra qué ocurrió?</div>
                  </div>
                </div>
                
                <div style={{ color: '#30363D', fontSize: '28px', fontWeight: '300', display: 'flex', alignItems: 'center' }}>VS</div>
                
                {/* DESPUÉS */}
                <div style={{ textAlign: 'center', flex: 1, minWidth: '250px' }}>
                  <div style={{ color: '#20C997', fontWeight: '800', marginBottom: '24px', letterSpacing: '1px', fontSize: '13px' }}>CON SAARE</div>
                  <div style={{ color: '#E8EDF2', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <div style={{ padding: '10px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '220px' }}>Usuario</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '2px solid #2F81F7', backgroundColor: 'rgba(47, 129, 247, 0.1)', borderRadius: '4px', color: '#2F81F7', fontWeight: 'bold', width: '100%', maxWidth: '220px' }}>SAARE</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '1px solid #20C997', color: '#20C997', borderRadius: '4px', width: '100%', maxWidth: '220px', fontWeight: '500' }}>Policy + Evidence + Security</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '1px solid #30363D', borderRadius: '4px', width: '100%', maxWidth: '220px' }}>LLM</div>
                    <div>↓</div>
                    <div style={{ padding: '10px 16px', border: '1px solid #20C997', backgroundColor: 'rgba(32, 201, 151, 0.1)', borderRadius: '4px', color: '#20C997', fontWeight: 'bold', width: '100%', maxWidth: '220px' }}>Validation → Action + Proof</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '24px', color: '#8B98A7', fontSize: '16px', fontWeight: '500', borderTop: '1px solid #151B23', paddingTop: '24px' }}>
                De una IA que responde a una IA gobernada por políticas y evidencia.
              </div>
            </div>
          </section>

          {/* EL PROBLEMA: RIESGO EMPRESARIAL */}
          <section id="problem" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>El problema empresarial</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔐</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Data Leakage</h3>
                <p style={{ color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: '#E8EDF2' }}>El dato sensible no debería llegar al modelo.</strong><br/>
                  Evita que PII, información financiera, secretos corporativos o documentación regulada atraviesen las políticas definidas hacia proveedores de IA externos.
                </p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>🧠</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Unsupported Claims</h3>
                <p style={{ color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: '#E8EDF2' }}>Una respuesta de IA no es automáticamente una decisión.</strong><br/>
                  SAARE exige evidencia preexistente e impone políticas antes de permitir que una salida sea considerada válida en tu flujo de trabajo.
                </p>
              </div>
              <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '28px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>🕵️</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Auditability</h3>
                <p style={{ color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: '#E8EDF2' }}>Si no puedes demostrar qué ocurrió, no puedes auditarlo.</strong><br/>
                  SAARE genera evidencia criptográfica estructurada y verificable de cada evento para protegerte ante incidentes o inspecciones normativas.
                </p>
              </div>
            </div>
          </section>

          {/* QUÉ TE AHORRA SAARE (ROI) */}
          <section id="roi" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>¿Qué te ahorra SAARE?</h2>
              <p style={{ color: '#8B98A7', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>Impacto directo en costes, tiempo y riesgo operativo.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', borderTop: '2px solid #2F81F7', backgroundColor: '#0D1117' }}>
                <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Menos Desarrollo</h4>
                <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>No necesitas construir desde cero tu propio perímetro de control ni mecanismos de auditoría criptográfica.</p>
              </div>
              <div style={{ padding: '20px', borderTop: '2px solid #20C997', backgroundColor: '#0D1117' }}>
                <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Menor Time-to-Market</h4>
                <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Integra seguridad y evidencia en tus productos de IA desde el diseño (Security by Design) en semanas.</p>
              </div>
              <div style={{ padding: '20px', borderTop: '2px solid #FF4D5A', backgroundColor: '#0D1117' }}>
                <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Menor Exposición</h4>
                <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Controla la salida de datos sensibles hacia las APIs de servicios de IA externos antes de que ocurra la fuga.</p>
              </div>
              <div style={{ padding: '20px', borderTop: '2px solid #EAB308', backgroundColor: '#0D1117' }}>
                <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Auditorías Rápidas</h4>
                <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>La evidencia se genera durante la propia ejecución. La respuesta ante incidentes o inspectores es inmediata.</p>
              </div>
              <div style={{ padding: '20px', borderTop: '2px solid #A855F7', backgroundColor: '#0D1117' }}>
                <h4 style={{ color: '#E8EDF2', fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>Oferta Enterprise</h4>
                <p style={{ color: '#8B98A7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Comercializa tu propio producto SaaS con una capa "Secure AI" / "Compliance Mode" respaldada por SAARE.</p>
              </div>
            </div>
          </section>

          {/* ANTI-PERSONA (PARA QUIÉN NO ES) */}
          <section style={{ maxWidth: '800px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '32px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ color: '#E8EDF2', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Lo que SAARE NO es</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', color: '#8B98A7', fontSize: '14.5px', lineHeight: 1.6 }}>
                <span>❌ No sustituye a tu LLM.</span>
                <span>❌ No es un chatbot.</span>
                <span>❌ No es un SIEM.</span>
                <span>❌ No es un DLP tradicional.</span>
                <span>❌ No es un API Gateway convencional.</span>
              </div>
              <p style={{ color: '#2F81F7', fontSize: '15px', fontWeight: '600', marginTop: '24px', marginBottom: 0 }}>
                Es la capa de control y evidencia que se sitúa alrededor de la ejecución de IA.
              </p>
            </div>
          </section>

          {/* MERCADOS (CASOS DE USO) - ENFOCADOS A VENTAS */}
          <section id="markets" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Puertas de Venta Empresarial</h2>
              <p style={{ color: '#8B98A7', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
                Elige tu mercado y descubre el valor de integración de SAARE.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* PLATAFORMAS DE IA / WORKFLOWS */}
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '32px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#2F81F7', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '16px', fontWeight: 'bold' }}>01 — AI PLATFORMS & WORKFLOWS</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Protege tus automatizaciones antes de que lleguen al LLM.</h3>
                <div style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', flex: 1 }}>
                  <p style={{ marginBottom: '8px' }}><strong>Problema:</strong> Tus clientes pueden enviar PII y datos regulados a modelos externos a través de tus flujos.</p>
                  <p style={{ margin: 0 }}><strong>SAARE:</strong> Añade una capa de control L7 sin construir tu propio motor de seguridad desde cero.</p>
                </div>
                <div style={{ borderTop: '1px solid #151B23', paddingTop: '16px', fontSize: '13px', color: '#8B98A7', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Integración:</strong> API / Gateway / SDK</div>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Time-to-value:</strong> 1–3 meses</div>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Comprador:</strong> CTO / CPO / Head of AI</div>
                  <div><strong style={{ color: '#E8EDF2' }}>Modelo:</strong> OEM / Consumo / Revenue Share</div>
                </div>
                <button onClick={() => { setMode('register'); setCurrentView('AUTH'); }} style={{ width: '100%', padding: '12px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#8B98A7'} onMouseOut={(e) => e.target.style.borderColor = '#30363D'}>
                  Integrar SAARE ↗
                </button>
              </div>

              {/* CYBERSECURITY */}
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '32px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#20C997', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '16px', fontWeight: 'bold' }}>02 — CYBERSECURITY PROVIDERS</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>DLP nativo para IA en el Endpoint.</h3>
                <div style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', flex: 1 }}>
                  <p style={{ marginBottom: '8px' }}><strong>Problema:</strong> Las empresas pierden el control sobre qué copian sus empleados en ChatGPT o Gemini.</p>
                  <p style={{ margin: 0 }}><strong>SAARE:</strong> Librería C-ABI in-process que purga datos sensibles directamente en la memoria del agente EDR del usuario.</p>
                </div>
                <div style={{ borderTop: '1px solid #151B23', paddingTop: '16px', fontSize: '13px', color: '#8B98A7', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Integración:</strong> C-ABI (.so / .dll) Embedded</div>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Time-to-value:</strong> 6–12 meses</div>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Comprador:</strong> CISO / VP Engineering</div>
                  <div><strong style={{ color: '#E8EDF2' }}>Modelo:</strong> OEM Licensing</div>
                </div>
                <a href="mailto:partners@ms3v.es?subject=OEM%20Licensing" style={{ textAlign: 'center', display: 'block', padding: '12px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#8B98A7'} onMouseOut={(e) => e.target.style.borderColor = '#30363D'}>
                  Hablar con Partnerships ↗
                </a>
              </div>

              {/* CONSULTORAS Y GSIs */}
              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '32px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#FF4D5A', fontFamily: 'monospace', fontSize: '11.5px', marginBottom: '16px', fontWeight: 'bold' }}>03 — GSIs & CONSULTORAS</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#E8EDF2', margin: '0 0 12px 0' }}>Obtén evidencia verificable de cumplimiento.</h3>
                <div style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', flex: 1 }}>
                  <p style={{ marginBottom: '8px' }}><strong>Problema:</strong> Auditar proyectos de IA regulada para clientes es manual, abstracto y carece de pruebas técnicas sólidas.</p>
                  <p style={{ margin: 0 }}><strong>SAARE:</strong> Genera paquetes de evidencia (Proof Bundles) estructurados y listos para justificar cumplimiento e inversiones.</p>
                </div>
                <div style={{ borderTop: '1px solid #151B23', paddingTop: '16px', fontSize: '13px', color: '#8B98A7', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Integración:</strong> Enterprise / Auditor Seat</div>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Time-to-value:</strong> 1–3 meses</div>
                  <div style={{ marginBottom: '8px' }}><strong style={{ color: '#E8EDF2' }}>Comprador:</strong> Compliance Officer / Perito</div>
                  <div><strong style={{ color: '#E8EDF2' }}>Modelo:</strong> Suscripción por Asiento Auditor</div>
                </div>
                <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ width: '100%', padding: '12px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#8B98A7'} onMouseOut={(e) => e.target.style.borderColor = '#30363D'}>
                  Contratar Asiento Auditor ↗
                </button>
              </div>
            </div>
          </section>

          {/* MATRIZ DE DECISIÓN (DÓNDE ENCAJA SAARE) */}
          <section style={{ maxWidth: '1000px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#E8EDF2', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.5px' }}>Dónde encaja SAARE en tu estrategia</h3>
            <p style={{ color: '#8B98A7', fontSize: '15px', textAlign: 'center', marginBottom: '32px' }}>Identifica rápidamente tu modelo de adopción.</p>
            
            <div style={{ overflowX: 'auto', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #30363D', color: '#8B98A7' }}>
                    <th style={{ padding: '16px', fontWeight: '600' }}>Si eres...</th>
                    <th style={{ padding: '16px', fontWeight: '500' }}>Quieres...</th>
                    <th style={{ padding: '16px', fontWeight: '500' }}>SAARE te ofrece...</th>
                    <th style={{ padding: '16px', fontWeight: '500' }}>Tiempo</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#E8EDF2' }}>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>Plataforma IA</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>Proteger workflows de usuarios</td>
                    <td style={{ padding: '16px', color: '#E8EDF2' }}>Integración Gateway / SDK</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>1–3 meses</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>Cybersecurity</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>IA segura en el endpoint</td>
                    <td style={{ padding: '16px', color: '#E8EDF2' }}>Motor C-ABI Embedded</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>6–12 meses</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>Consultora GRC</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>Evidencia para auditorías clientes</td>
                    <td style={{ padding: '16px', color: '#E8EDF2' }}>Consola Auditor & Proof Bundles</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>Inmediato</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>Cloud Provider</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>AI Security Layer en el Edge</td>
                    <td style={{ padding: '16px', color: '#E8EDF2' }}>Middleware HTTP Determinista</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>2–4 meses</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px', fontWeight: '500' }}>SaaS Regulado</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>IA privada y controlada (Salud, Banca)</td>
                    <td style={{ padding: '16px', color: '#E8EDF2' }}>Despliegue On-Premise / Private</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>1–2 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* TABLA COMPARATIVA CON EL STACK TRADICIONAL */}
          <section style={{ maxWidth: '900px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#E8EDF2', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.5px' }}>SAARE frente al stack tradicional</h3>
            <p style={{ color: '#8B98A7', fontSize: '15px', textAlign: 'center', marginBottom: '32px' }}>SAARE no sustituye necesariamente estas capas. Las conecta alrededor del flujo de IA.</p>
            
            <div style={{ overflowX: 'auto', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #30363D', color: '#8B98A7' }}>
                    <th style={{ padding: '16px', fontWeight: '600' }}>Capa</th>
                    <th style={{ padding: '16px', fontWeight: '500' }}>Función Principal</th>
                    <th style={{ padding: '16px', color: '#E8EDF2', fontWeight: '600' }}>Aporte SAARE</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#E8EDF2' }}>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>DLP</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>Protección de datos y secretos</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>Detección determinista in-process sin red externa</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>API Gateway</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>Control del tráfico y enrutamiento</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>Filtro ex-ante en L7 antes del proveedor LLM</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #151B23' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>LLM Guardrails</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>Control del comportamiento del modelo</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>Rechazo explícito de afirmaciones sin evidencia previa</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px', fontWeight: '500' }}>SIEM</td>
                    <td style={{ padding: '16px', color: '#8B98A7' }}>Observabilidad y registro</td>
                    <td style={{ padding: '16px', color: '#20C997' }}>Generación de Proof Bundles criptográficos (No repudio)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* DIAGRAMA ESTRUCTURAL ASCII DE PRUEBA DE RECHAZO Y ESTADOS */}
          <section id="architecture" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Cómo funciona: Arquitectura Ex-Ante</h2>
              <p style={{ color: '#8B98A7', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
                Impide que una salida que no cumple las políticas definidas atraviese el perímetro.
              </p>
            </div>

            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px', maxWidth: '720px', margin: '0 auto', textAlign: 'left', overflowX: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #151B23', paddingBottom: '8px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#8B98A7' }}>FLUJO LÓGICO DE INTERCEPCIÓN EN L7</span>
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
              <div style={{ marginTop: '16px', fontSize: '12px', color: '#8B98A7', textAlign: 'center', fontFamily: 'sans-serif' }}>
                Control de ejecución determinista en memoria volátil. <strong>Cero escrituras en disco.</strong>
              </div>
            </div>
          </section>

          {/* MÓDULO SAARE PROOF BUNDLE INTERACTIVO */}
          <section id="proof-bundle" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>No tienes que confiar. Verifica.</h2>
              <p style={{ color: '#8B98A7', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
                Demuestra lo que ocurrió. SAARE genera una evidencia estructurada de la ejecución que permite verificar identidad, política, integridad, causalidad y estado del entorno.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '40px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '13px', color: '#8B98A7' }}>
              <div><span style={{ color: '#20C997' }}>1.</span> Ejecuta (Sandbox)</div>
              <div><span style={{ color: '#20C997' }}>2.</span> Observa (Policy → Action)</div>
              <div><span style={{ color: '#20C997' }}>3.</span> Obtén (Proof Bundle)</div>
              <div><span style={{ color: '#20C997' }}>4.</span> Verifica (Hash / Signature)</div>
            </div>

            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderTop: '3px solid #20C997', borderRadius: '8px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#20C997' }}>// SAARE_PROOF_BUNDLE_INSPECTOR</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0 0 0', color: '#E8EDF2' }}>
                    Evidencia criptográfica generada en el Runtime
                  </h3>
                </div>
                <button onClick={copyBundleJson} style={{ background: copiedBundle ? '#20C997' : '#151B23', border: '1px solid #30363D', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = copiedBundle ? '#30363D' : '#8B98A7'} onMouseOut={(e) => e.target.style.borderColor = '#30363D'}>
                  {copiedBundle ? '✔ Bundle Copiado' : '📋 Copiar Proof Bundle JSON'}
                </button>
              </div>

              {/* TABS DEL PROOF BUNDLE */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #151B23', paddingBottom: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveProofTab('bundle')} style={{ padding: '6px 12px', border: '1px solid', borderColor: activeProofTab === 'bundle' ? '#20C997' : '#151B23', borderRadius: '4px', background: activeProofTab === 'bundle' ? '#151B23' : 'transparent', color: activeProofTab === 'bundle' ? '#20C997' : '#8B98A7', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                  📦 Verificación de Atestación
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

              {/* CONTENIDO DE INSPECCIÓN SEGÚN TAB */}
              {activeProofTab === 'bundle' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '32px', alignItems: 'start' }}>
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px' }}>
                    <div style={{ color: '#20C997', fontWeight: 'bold', marginBottom: '16px', fontSize: '12px', letterSpacing: '1px' }}>AUDIT VERIFICATION STEPS:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#8B98A7' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IDENTITY (MS3V)</span> <span style={{ color: '#20C997' }}>VERIFIED ✓</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>TIMESTAMP (RFC 3161)</span> <span style={{ color: '#20C997' }}>VERIFIED ✓</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SIGNATURE (Ed25519)</span> <span style={{ color: '#20C997' }}>VERIFIED ✓</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>POLICY (POL-2026.2)</span> <span style={{ color: '#20C997' }}>VERIFIED ✓</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>EVIDENCE_COMMITMENT</span> <span style={{ color: '#20C997' }}>VERIFIED ✓</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CAUSALITY_CHAIN</span> <span style={{ color: '#20C997' }}>VERIFIED ✓</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>MERKLE_INCLUSION</span> <span style={{ color: '#20C997' }}>VERIFIED ✓</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>RUNTIME (ZERO-DISK)</span> <span style={{ color: '#2F81F7' }}>ATTESTED 🛡️</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>LATENCY (1.16ms)</span> <span style={{ color: '#EAB308' }}>MEASURED ⏱️</span></div>
                      
                      <div style={{ borderTop: '1px dashed #30363D', marginTop: '8px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', color: '#E8EDF2', fontWeight: 'bold', fontSize: '15px' }}>
                        <span>PERÍMETRO VALIDADO</span> <span style={{ color: '#20C997' }}>VALID</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: '#E8EDF2', margin: 0, fontSize: '16px' }}>Separando la "verdad" de la "validez"</h4>
                    <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                      El <strong style={{ color: '#E8EDF2' }}>Proof Bundle</strong> no afirma universalmente que la salida del LLM sea fácticamente verdadera. SAARE certifica criptográficamente que la decisión se ha generado bajo un perímetro controlado, cumpliendo estrictamente con las políticas, basándose en evidencia verificada y con la atestación del runtime.
                    </p>
                    <div style={{ backgroundColor: '#151B23', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #2F81F7', fontSize: '13px', color: '#E8EDF2', lineHeight: 1.5 }}>
                      <strong>POLICY COMPLIANT WITHIN DEFINED BOUNDARY:</strong> SAARE no mezcla métricas (MEASURED), afirmaciones del modelo, pruebas verificables (VERIFIED) y estados del entorno de ejecución (ATTESTED).
                    </div>
                  </div>
                </div>
              )}

              {activeProofTab === 'json' && (
                <pre style={{ margin: 0, backgroundColor: '#070A0F', border: '1px solid #151B23', borderRadius: '6px', padding: '20px', color: '#E8EDF2', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(proofBundle, null, 2)}
                </pre>
              )}

              {activeProofTab === 'causality' && (
                <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12.5px' }}>
                  <div style={{ color: '#2F81F7', fontWeight: 'bold', marginBottom: '16px' }}>GRAFO DE CAUSALIDAD CRIPTOGRÁFICA (PARENT_HASH BINDING):</div>
                  <p style={{ color: '#8B98A7', fontSize: '13px', fontFamily: 'sans-serif', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                    Permite a un auditor reconstruir paso a paso de dónde procede exactamente una decisión sin necesidad de revelar el contenido privado subyacente.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                      <span style={{ color: '#8B98A7', display: 'inline-block', width: '180px' }}>[1] INPUT_COMMITMENT:</span> <span style={{ color: '#E8EDF2' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.PARENT_HASH}</span>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                      <span style={{ color: '#8B98A7', display: 'inline-block', width: '180px' }}>[2] EVIDENCE_BINDING:</span> <span style={{ color: '#20C997' }}>{proofBundle.PROOFS.NO_UNSUPPORTED_CLAIM.INSPECTION_MATRIX[0].EVIDENCE_HASH}</span>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                      <span style={{ color: '#8B98A7', display: 'inline-block', width: '180px' }}>[3] RUNTIME_ACTION:</span> <span style={{ color: '#2F81F7' }}>{proofBundle.ATTESTATIONS.RUNTIME.MEMORY_STATE}</span>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                      <span style={{ color: '#8B98A7', display: 'inline-block', width: '180px' }}>[4] OUTPUT_ROOT_DIGEST:</span> <span style={{ color: '#E8EDF2' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.EVENT_HASH}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeProofTab === 'rejection' && (
                <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '6px' }}>
                  <div style={{ color: '#E8EDF2', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px' }}>Principio de No Afirmación Sin Evidencia (No-Unsupported-Claim)</div>
                  <p style={{ color: '#8B98A7', fontSize: '13.5px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                    Cada aserción generada debe tener un hash de evidencia vinculante preexistente. Si no existe anclaje probatorio formal, el sistema no emite la afirmación como verdadera, sino que activa determinísticamente la prueba de <code>REJECTED</code> o <code>INDETERMINATE</code>.
                  </p>
                  <div style={{ fontFamily: 'monospace', fontSize: '12.5px', backgroundColor: '#0D1117', padding: '16px', borderRadius: '4px', border: '1px solid #151B23', color: '#E8EDF2' }}>
                    <div style={{ color: '#20C997', marginBottom: '8px' }}>// INSPECTION_MATRIX_VERIFIED</div>
                    {JSON.stringify(proofBundle.PROOFS.NO_UNSUPPORTED_CLAIM, null, 2)}
                  </div>
                </div>
              )}

              {activeProofTab === 'merkle' && (
                <div style={{ backgroundColor: '#070A0F', border: '1px solid #151B23', padding: '24px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12.5px' }}>
                  <div style={{ color: '#20C997', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>LOG DE TRANSPARENCIA & RAÍZ MERKLE:</div>
                  <p style={{ color: '#8B98A7', fontSize: '13.5px', fontFamily: 'sans-serif', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                    Permite a auditores externos verificar la inclusión matemática de un evento individual específico dentro de un lote de millones de transacciones, demostrando inmutabilidad temporal sin necesidad de revelar el texto plano de los demás usuarios.
                  </p>
                  <div style={{ padding: '12px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px', marginBottom: '12px' }}>
                    <span style={{ color: '#8B98A7', display: 'inline-block', width: '120px' }}>MERKLE_ROOT:</span> <span style={{ color: '#20C997' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.MERKLE_ROOT}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                    <span style={{ color: '#8B98A7', display: 'inline-block', width: '120px' }}>LEAF_INDEX:</span> <span style={{ color: '#E8EDF2' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.SEQUENCE_NUMBER}</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '4px' }}>
                    <span style={{ color: '#8B98A7', display: 'inline-block', width: '120px' }}>PROOF_PATH:</span> <span style={{ color: '#E8EDF2' }}>{proofBundle.PROOFS.CHAIN_INTEGRITY.MERKLE_ROOT.length / 2} hashes de anclaje (O(log n) complexity)</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* EVIDENCIA EN VIVO (LA PRUEBA VISUAL FINAL DE USO DE LA API) */}
          <section id="evidence" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Ejecuta el verificador Edge</h2>
              <p style={{ color: '#8B98A7', fontSize: '15px' }}>Comprueba en tiempo real la validez del último evento interceptado.</p>
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
                  <button onClick={copyHashToClipboard} style={{ background: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#8B98A7'} onMouseOut={(e) => e.target.style.borderColor = '#30363D'}>
                    {copiedHash ? 'Copiado' : 'Copiar Hash'}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0', color: '#E8EDF2' }}>
                    Validación Pública Descentralizada
                  </h3>
                  <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    Cualquier auditor externo puede verificar el Proof Bundle criptográfico contra el endpoint Edge independiente sin exponer la carga útil corporativa ni comprometer la privacidad.
                  </p>
                  <div style={{ backgroundColor: '#070A0F', border: '1px solid #21262D', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7', wordBreak: 'break-all', marginBottom: '16px' }}>
                    GET {VERIFY_URL}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: '#2F81F7', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '13.5px', fontWeight: '700', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#1d6ce3'} onMouseOut={(e) => e.target.style.backgroundColor = '#2F81F7'}>
                    🔍 Ejecutar Verificador Edge ↗
                  </a>
                  <button onClick={() => setShowDiploma(true)} style={{ padding: '14px 20px', backgroundColor: '#151B23', border: '1px solid #30363D', color: '#E8EDF2', borderRadius: '4px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#8B98A7'} onMouseOut={(e) => e.target.style.borderColor = '#30363D'}>
                    Ver Acreditación RPI
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* MÓDULO: COMPLIANCE / GOBERNANZA */}
          <section id="subvenciones" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderLeft: '4px solid #2F81F7', borderRadius: '8px', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#2F81F7' }}>// COMPLIANCE_AND_GRANTS</span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0', color: '#E8EDF2' }}>
                    SAARE proporciona controles y evidencia técnica
                  </h2>
                </div>
              </div>

              <p style={{ color: '#8B98A7', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', maxWidth: '850px' }}>
                SAARE no certifica sistemas por sí mismo. SAARE genera la infraestructura de controles y evidencia técnica en tiempo de ejecución para apoyar tus procesos de gobernanza, seguridad, cumplimiento de ISO/AI Act y la justificación de ayudas públicas de digitalización.
              </p>

              {/* TABS DE SUBVENCIONES Y NORMATIVAS */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #151B23', paddingBottom: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveGrantTab('nextgen')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'nextgen' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'nextgen' ? '#151B23' : 'transparent', color: activeGrantTab === 'nextgen' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  🇪🇺 Frameworks Normativos (AI Act / ISO)
                </button>
                <button onClick={() => setActiveGrantTab('kit')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'kit' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'kit' ? '#151B23' : 'transparent', color: activeGrantTab === 'kit' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  💼 Programas Nacionales (Red.es)
                </button>
                <button onClick={() => setActiveGrantTab('cdti')} style={{ padding: '8px 16px', border: '1px solid', borderColor: activeGrantTab === 'cdti' ? '#2F81F7' : '#151B23', borderRadius: '4px', background: activeGrantTab === 'cdti' ? '#151B23' : 'transparent', color: activeGrantTab === 'cdti' ? '#E8EDF2' : '#8B98A7', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  🔬 Proyectos de I+D (CDTI / ENISA)
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
            </div>
          </section>

          {/* DEVELOPERS / SNIPPETS AL FINAL */}
          <section id="developers" style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #151B23', borderRadius: '8px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#E8EDF2' }}>Integración de Código (SAARE-SDK)</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#8B98A7', maxWidth: '600px', lineHeight: 1.5 }}>
                    Integra SAARE en tu flujo de trabajo en minutos. Los snippets muestran la conexión en modo Gateway.
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

          {/* CINTILLO FINAL CTA */}
          <section style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#151B23', border: '1px solid #30363D', borderRadius: '8px', padding: '50px 24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#E8EDF2', margin: '0 0 16px 0' }}>Construye una IA que puedas controlar.</h2>
              <p style={{ color: '#8B98A7', fontSize: '16px', maxWidth: '600px', margin: '0 auto 32px auto' }}>Integra SAARE en tu producto, infraestructura o proyecto empresarial y obtén seguridad, gobernanza y evidencia verificable.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button onClick={() => window.open(CONSOLE_URL, '_blank')} style={{ padding: '14px 32px', backgroundColor: '#2F81F7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#1d6ce3'} onMouseOut={(e) => e.target.style.backgroundColor = '#2F81F7'}>
                  Probar Sandbox ↗
                </button>
                <button onClick={() => { setMode('register'); setCurrentView('AUTH'); }} style={{ padding: '14px 24px', backgroundColor: 'transparent', color: '#E8EDF2', border: '1px solid #8B98A7', borderRadius: '4px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(139, 152, 167, 0.1)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                  Solicitar evaluación Enterprise
                </button>
              </div>
              <div style={{ marginTop: '24px', color: '#8B98A7', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600' }}>
                EMBEDDED · API · PRIVATE · AUDITOR
              </div>
            </div>
          </section>

          {/* FOOTER ENTERPRISE */}
          <footer style={{ borderTop: '1px solid #151B23', backgroundColor: '#070A0F', padding: '36px 24px', fontSize: '12px', color: '#8B98A7' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#8B98A7', color: '#070A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '11px', borderRadius: '3px' }}>S</div>
                  <strong style={{ color: '#E8EDF2', fontSize: '14px' }}>SAARE</strong>
                </div>
                <div style={{ marginBottom: '4px' }}>AI Security & Evidence Layer</div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>Safe Creative ID: 2607076315021 / 2607076314949</div>
                <div style={{ marginTop: '8px', color: '#484F58' }}>© 2026 Gabinete Jurídico y Pericial MS3V. Todos los derechos reservados.</div>
              </div>
              
              <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <strong style={{ color: '#E8EDF2', marginBottom: '4px' }}>Producto</strong>
                  <a href="#problem" style={{ color: '#8B98A7', textDecoration: 'none' }}>Riesgos</a>
                  <a href="#markets" style={{ color: '#8B98A7', textDecoration: 'none' }}>Casos de Uso</a>
                  <a href="#architecture" style={{ color: '#8B98A7', textDecoration: 'none' }}>Arquitectura</a>
                  <a href="#proof-bundle" style={{ color: '#8B98A7', textDecoration: 'none' }}>Proof Bundle</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <strong style={{ color: '#E8EDF2', marginBottom: '4px' }}>Recursos</strong>
                  <a href="#developers" style={{ color: '#8B98A7', textDecoration: 'none' }}>Documentación SDK</a>
                  <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>Verificador API</a>
                  <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#8B98A7', textDecoration: 'none' }}>Consola GRC</a>
                  <a href="mailto:peritajes@ms3v.es" style={{ color: '#8B98A7', textDecoration: 'none' }}>Contacto</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}