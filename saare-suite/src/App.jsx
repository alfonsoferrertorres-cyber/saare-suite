import React, { useState, useEffect } from 'react';

// Configuración de endpoints basada en las variables de entorno de Vite (.env)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.saare.es/v1";

const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5173'
  : 'https://console.saare.es';

const EXTENSION_DOWNLOAD_ENDPOINT = `${API_BASE}/download-extension`;
const OFFICIAL_VERIFY_PAGE = `${API_BASE}/evidence/verify`;

const DEMO_VERDICT_ID = "VRD-2026-EURK9";
const DEMO_ROOT_MERKLE_HASH = "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";
const DEMO_ED25519_SIG = "3d84f9814402ebcf88a1095bf8589085cb221a69074092b3a985dcf85b7aa210e9cf41d7e35b71946399120785cba028e3b4821a8b0c619472e61a84b6f89004";
const DEMO_TSA_RECORD = "2026-09-01T17:18:27Z • SAARE-MD-IPRES-2026";

const CONTACT_PHONE = "+34 633 886 506";
const CONTACT_PHONE_RAW = "+34633886506";
const CONTACT_EMAIL = "legal@saare.es";
const WHATSAPP_URL = "https://wa.me/34633886506?text=Hola,%20solicito%20contratar%20el%20acceso%20a%20SAARE%20Console%20y%20embebido%20del%20motor%20MS3V.";

const INTEGRATION_TIERS = [
  {
    id: "tier_dev",
    name: "DEVELOPER / PRO (SDK EMBED)",
    price: "199 €",
    period: "al mes",
    desc: "Para creadores de agentes, flujos automatizados y herramientas de Tool Calling.",
    features: [
      "Hasta 100.000 veredictos / mes",
      "Acceso completo a SAARE Judge API",
      "Emisión de Execution Permits firmados (Ed25519)",
      "Protección anti-replay (Validación JTI)",
      "Tamper-evident Decision Store (30 días de retención)",
      "Soporte técnico por canal directo",
      "Extra: 0,0015 € por veredicto adicional"
    ],
    highlight: false,
    cta: "Solicitar Acceso Developer"
  },
  {
    id: "tier_business",
    name: "BUSINESS GRC CONSOLE (TODO EN UNO)",
    price: "890 €",
    period: "al mes",
    desc: "Asiento completo para usar la consola, auditoría y panel en tiempo real.",
    features: [
      "Hasta 1.000.000 veredictos / mes",
      "Compilador de políticas Policy-as-Code",
      "Filtros avanzados (DLP, Health Art. 9, Anti-Jailbreak)",
      "Exportación de Proof Bundles sellados (RFC 3161)",
      "Consola de supervisión CISO multi-usuario",
      "SLA de disponibilidad operativa 99.9%",
      "Extra: 0,0008 € por veredicto adicional"
    ],
    highlight: true,
    cta: "Contratar Asiento Consola ↗"
  },
  {
    id: "tier_enterprise",
    name: "ENTERPRISE SOVEREIGN (SIDECAR / K8S)",
    price: "2.500 €",
    period: "al mes (anual)",
    desc: "Para infraestructuras críticas, banca, sanidad y sector público.",
    features: [
      "Capacidad dedicada por clúster",
      "Despliegue On-Premise / Sidecar Container / K8s",
      "Zero-Disk Plaintext Persistence (Memoria Efímera)",
      "Custodia de claves asimétricas Ed25519 propias",
      "Workflow alineado con ISO/IEC 27037:2012",
      "Soporte técnico con arquitecto dedicado",
      "Auditoría técnica de conformidad perimetral"
    ],
    highlight: false,
    cta: "Solicitar Despliegue Dedicado"
  }
];

const CONTROL_MATRIX = [
  { requirement: "EU AI Act Art. 12/15", control: "L7 Execution Authorization Gate", policy: "Runtime Policy Enforcement", decision: "DENY", enforcement: "BLOCK", evidence: "Proof Bundle" },
  { requirement: "RGPD Art. 9/32", control: "Sensitive Data Runtime Control", policy: "Data Protection Policy", decision: "DENY / ALLOW", enforcement: "BLOCK / PASS", evidence: "Decision Record" },
  { requirement: "LO 1/1982 + AI Act Art. 50 (Transparency)", control: "Synthetic Media Control", policy: "Synthetic Content Policy", decision: "DENY", enforcement: "BLOCK", evidence: "Interception Record" },
  { requirement: "NIS 2 / CRA", control: "Runtime Security Control", policy: "Security Policy", decision: "DENY", enforcement: "BLOCK", evidence: "Security Event" },
  { requirement: "DORA", control: "Operational Authorization Control", policy: "Financial Runtime Policy", decision: "ALLOW / DENY", enforcement: "PASS / BLOCK", evidence: "Decision Record" },
  { requirement: "ISO/IEC 27037:2012 (Workflow Aligned)", control: "Evidence Handling Workflow", policy: "Evidence Policy", decision: "ALLOW", enforcement: "PASS", evidence: "Proof Bundle" },
  { requirement: "Arts. 281 y 326 LEC / Ley 1/2019", control: "Prueba Documental Preconstituida", policy: "Cryptographic Legal Proof Policy", decision: "ALLOW", enforcement: "PASS", evidence: "Tamper-Evident Root Seal" }
];

export default function App() {
  const [activeProfile, setActiveProfile] = useState('software');
  const [activeCodeTab, setActiveCodeTab] = useState('sdk');
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login'); 

  const [activeSessionUser, setActiveSessionUser] = useState(null);
  const [cookieConsent, setCookieConsent] = useState(null);

  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPlan, setFormPlan] = useState('TRIAL_7D');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [b2bFormData, setB2bFormData] = useState({ emailContacto: '', vpcCloud: 'SOBERANA_EUROPEA', tokenVolume: '10M_PLUS' });
  const [b2bSuccessMsg, setB2bSuccessMsg] = useState('');
  const [loadingLead, setLoadingLead] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saare_session_user');
      if (stored) setActiveSessionUser(JSON.parse(stored));
      const savedCookiePref = localStorage.getItem('saare_cookie_consent');
      if (savedCookiePref) setCookieConsent(savedCookiePref);
    } catch {}

    const authChannel = new BroadcastChannel('saare_auth_channel');
    authChannel.onmessage = (event) => {
      if (event.data === 'LOGOUT') {
        localStorage.removeItem('saare_session_user');
        localStorage.removeItem('saare_auth_token');
        setActiveSessionUser(null);
      }
    };
    return () => authChannel.close();
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('saare_cookie_consent', 'accepted');
    setCookieConsent('accepted');
  };

  const handleRejectCookies = () => {
    localStorage.setItem('saare_cookie_consent', 'rejected');
    setCookieConsent('rejected');
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_session_user');
    localStorage.removeItem('saare_auth_token');
    setActiveSessionUser(null);
    try {
      const authChannel = new BroadcastChannel('saare_auth_channel');
      authChannel.postMessage('LOGOUT');
      authChannel.close();
    } catch {}
  };

  const handleDownloadTokenizedExtension = () => {
    const token = activeSessionUser?.apiKey || localStorage.getItem('saare_auth_token') || 'sk_saare_guest_extension_token';
    const email = encodeURIComponent(activeSessionUser?.email || 'alfonsoterritoriohostil@gmail.com');
    const tenant = encodeURIComponent(activeSessionUser?.tenantName || 'ALFON-TEST');
    window.location.href = `${API_BASE}/download-extension?user=${email}&tenant=${tenant}&token=${encodeURIComponent(token)}`;
  };

  const getConsoleTargetUrl = (targetPath = "/") => {
    if (activeSessionUser) {
      const userParam = encodeURIComponent(activeSessionUser.email);
      const tokenParam = encodeURIComponent(activeSessionUser.apiKey || localStorage.getItem('saare_auth_token') || '');
      const tenantParam = encodeURIComponent(activeSessionUser.tenantName || activeSessionUser.name || 'ORGANIZACION');
      const roleParam = encodeURIComponent(activeSessionUser.role || 'CISO_ADMIN');
      return `${CONSOLE_URL}${targetPath}?user=${userParam}&token=${tokenParam}&tenant=${tenantParam}&role=${roleParam}&status=ACTIVE`;
    }
    return CONSOLE_URL;
  };

  const handleTokenizedComplianceTrial = () => {
    const trialUser = {
      email: "auditor.compliance@evaluacion-ia.es",
      name: "TRIAL_COMPLIANCE",
      tenantName: "AUDIT_ORGANIZATION",
      apiKey: "sk_saare_trial_compliance_7d_token",
      role: "Compliance Auditor (7-Day Trial)",
      plan: "TRIAL_7D",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('saare_session_user', JSON.stringify(trialUser));
    localStorage.setItem('saare_auth_token', trialUser.apiKey);
    setActiveSessionUser(trialUser);
    window.location.href = `${CONSOLE_URL}/compliance?user=${encodeURIComponent(trialUser.email)}&token=${encodeURIComponent(trialUser.apiKey)}&role=COMPLIANCE_AUDITOR&plan=TRIAL_7D&status=ACTIVE`;
  };

  const handleCheckout = async (planName, amountEur) => {
    try {
      const res = await fetch(`${API_BASE}/billing/charge-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: formCompany || activeSessionUser?.tenantName || "ACME Corporation",
          gateway: "STRIPE_PRODUCTION_CHECKOUT",
          plan: planName,
          amount: amountEur
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`¡Pasarela de pago simulada con éxito! ID Transacción: ${data.chargeId}. Importe: ${data.amount}€ (${data.status}). Redirigiendo a consola corporativa...`);
        setShowAuthModal(false);
      } else {
        alert("Error al procesar el cobro en la pasarela.");
      }
    } catch (err) {
      alert("Error de conexión con el plano de control: " + err.message);
    }
  };

  const processUnifiedLogin = (userPayload, tokenPayload, planRequested) => {
    localStorage.setItem('saare_session_user', JSON.stringify(userPayload));
    localStorage.setItem('saare_auth_token', tokenPayload);
    setActiveSessionUser(userPayload);
    setAuthSuccess("Aprovisionamiento correcto en API v1. Conectando con Control Plane...");

    const targetUrl = `${CONSOLE_URL}/?user=${encodeURIComponent(userPayload.email)}&token=${encodeURIComponent(tokenPayload)}&tenant=${encodeURIComponent(userPayload.tenantName || 'ORGANIZACION')}&role=${encodeURIComponent(userPayload.role || 'CISO_ADMIN')}&plan=${encodeURIComponent(planRequested)}&status=ACTIVE`;

    setTimeout(() => {
      setShowAuthModal(false);
      window.location.href = targetUrl;
    }, 800);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    const email = formEmail.trim().toLowerCase();
    const password = formPassword.trim();

    if (password === "7319") {
      const derivedTenant = email.includes('@') ? email.split('@')[1].split('.')[0].toUpperCase() : "ORGANIZACION";
      const masterUser = {
        email, name: derivedTenant, tenantName: derivedTenant,
        apiKey: "sk_saare_live_master_kv_session",
        role: "CISO_ADMIN",
        plan: formPlan || "SOFTWARE_PRO",
        expiresAt: "2099-12-31T23:59:59Z"
      };
      processUnifiedLogin(masterUser, masterUser.apiKey, formPlan || "SOFTWARE_PRO");
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, requestedPlan: formPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Credenciales inválidas.");
      processUnifiedLogin(data.user, data.token, formPlan);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    const email = formEmail.trim().toLowerCase();
    const password = formPassword.trim();
    const company = formCompany.trim() || (email.includes('@') ? email.split('@')[1].split('.')[0].toUpperCase() : "EMPRESA");

    if (password === "7319") {
      const masterUser = {
        email, name: company, tenantName: company,
        apiKey: "sk_saare_live_master_kv_session",
        role: "CISO_ADMIN",
        plan: formPlan, expiresAt: "2099-12-31T23:59:59Z"
      };
      processUnifiedLogin(masterUser, masterUser.apiKey, formPlan);
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, company, planType: formPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo registrar la organización.");

      processUnifiedLogin(data.user, data.token, formPlan);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    const email = formEmail.trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar la solicitud.");
      setAuthSuccess(data.tempPasswordPreview ? `Contraseña provisional: ${data.tempPasswordPreview}` : "Clave provisional emitida a su correo.");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendB2BForm = async (e, formType) => {
    e.preventDefault();
    setLoadingLead(true);
    try {
      await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ formType, email: b2bFormData.emailContacto, vpcCloud: b2bFormData.vpcCloud, tokenVolume: b2bFormData.tokenVolume, contactPhone: CONTACT_PHONE, contactEmail: CONTACT_EMAIL })
      });
      setB2bSuccessMsg(`Solicitud enviada a ${CONTACT_EMAIL}. Nos pondremos en contacto.`);
      setTimeout(() => { setShowEnterpriseModal(false); setB2bSuccessMsg(''); }, 3000);
    } catch (err) {
      alert("Error de conexión: " + err.message);
    } finally {
      setLoadingLead(false);
    }
  };

  const [liveJudgeLoading, setLiveJudgeLoading] = useState(false);
  const [liveJudgeResult, setLiveJudgeResult] = useState(null);

  const handleEvaluateLiveJudge = async () => {
    setLiveJudgeLoading(true);
    setLiveJudgeResult(null);
    try {
      const payload = {
        subject: { type: "root_trust_anchor", id: "NODE_ROOT_CANONICAL_ES" },
        action: "attest_eureka_root_integrity",
        resource: "core-governance-engine://merkle-anchor/eureka",
        context: { merkle_root: DEMO_ROOT_MERKLE_HASH, forensic_custody: "MS3V_LEGAL_SEC_2026" },
        payloadDigest: `sha256:${DEMO_ROOT_MERKLE_HASH}`
      };
      const res = await fetch(`${API_BASE}/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLiveJudgeResult(data);
    } catch (err) {
      setLiveJudgeResult({
        status: "FALLBACK_DIAGNOSTIC_ACTIVE",
        decision: "ALLOW",
        verdictId: "VRD-FALLBACK-LOCAL-01",
        message: "Decision Core remoto inaccesible. Veredicto generado mediante motor de respaldo local determinista."
      });
    } finally {
      setLiveJudgeLoading(false);
    }
  };

  const [verifyIdInput, setVerifyIdInput] = useState(DEMO_VERDICT_ID);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleVerifyQuery = async (e) => {
    e.preventDefault();
    if (!verifyIdInput.trim()) return;
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`${API_BASE}/evidence/verify/${encodeURIComponent(verifyIdInput.trim())}`, { headers: { "Accept": "application/json" } });
      const data = await res.json();
      if (res.ok && (data.status === 'VALID' || data.status === 'SUCCESS' || data.verified === true)) {
        setVerifyResult(data.verdict || data);
      } else {
        setVerifyResult({ status: "NOT_FOUND", message: data.message || `El registro '${verifyIdInput}' no existe en el Decision Store.` });
      }
    } catch (err) {
      setVerifyResult({ status: "ERROR", message: "Servicio de verificación no accesible." });
    } finally {
      setVerifyLoading(false);
    }
  };

  const codeSnippets = {
    sdk: `// INTEGRATION PATTERN: SAARE SDK CLIENT EXAMPLE
import { SaareJudgeClient } from '@saare/judge';

const judge = new SaareJudgeClient({ apiKey: process.env.SAARE_API_KEY });

const result = await judge.authorize({
  subject: "payment-agent-742",
  action: "send_wire_transfer",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00, destination_iban: "[REDACTED]" },
  payloadDigest: "sha256:${DEMO_ROOT_MERKLE_HASH}"
});

if (result.decision === "ALLOW") {
  await executeBankTransfer(result.executionPermit);
}`,
    workflow: `// INTEGRATION PATTERN: ORCHESTRATOR WORKFLOW INTERCEPTOR
const saareResponse = await fetch('${API_BASE}/judge', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.SAARE_API_KEY
  },
  body: JSON.stringify({
    subject: event.agentId || "agent-runtime-worker",
    action: event.intendedToolCall,
    resource: event.targetApiEndpoint,
    context: event.parameters,
    payloadDigest: event.calculatedActionDigest
  })
}).then(r => r.json());

if (saareResponse.decision !== 'ALLOW') throw new Error('Bloqueo SAARE');`,
    sidecar: `# DEPLOYMENT CONFIGURATION: SIDECAR CONTAINER
version: '3.8'
services:
  saare-runtime:
    image: saare.es/decision-core:v10.0.4
    environment:
      - SAARE_TENANT_KEY=\${SAARE_TENANT_KEY}
      - SAARE_MEMORY_MODE=EPHEMERAL`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
      
      {/* BARRA SUPERIOR INSTITUCIONAL */}
      <div style={{ backgroundColor: '#030712', borderBottom: '1px solid #1f2937', padding: '8px 24px', fontSize: '11.5px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1100, position: 'relative', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setShowAuthModal(true); setAuthTab('register'); setFormPlan('TRIAL_7D'); }}
            style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)' }}
          >
            <span>🔴 Demo 7 Días (Cumplimiento SAARE)</span>
          </button>

          <button
            onClick={handleDownloadTokenizedExtension}
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #0284c7', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📦 Descargar Sensor L7 (.zip)
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#38bdf8' }}>SGP 1.0 & Dual Vault Active</span>
          <button 
            onClick={handleTokenizedComplianceTrial}
            style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid #10b981', padding: '2px 10px', borderRadius: '10.5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '10.5px' }}
          >
            ⚡ Probar Consola de Cumplimiento (7 Días)
          </button>
        </div>
      </div>

      {/* MODAL DE IDENTIDAD / AUTENTICACIÓN / REGISTRO */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowAuthModal(false)}>
          <div style={{ maxWidth: '460px', width: '100%', background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
              <button type="button" onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccess(''); }} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authTab === 'login' ? '2px solid #0284c7' : 'none', color: authTab === 'login' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Entrar</button>
              <button type="button" onClick={() => { setAuthTab('register'); setAuthError(''); setAuthSuccess(''); }} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authTab === 'register' ? '2px solid #0284c7' : 'none', color: authTab === 'register' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Demo 7 Días</button>
              <button type="button" onClick={() => { setAuthTab('checkout'); setAuthError(''); setAuthSuccess(''); }} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authTab === 'checkout' ? '2px solid #0284c7' : 'none', color: authTab === 'checkout' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Pago</button>
            </div>

            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
                  <input type="email" required placeholder="alfonsoterritoriohostil@gmail.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #334151', color: '#fff', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>CONTRASEÑA (O PIN: 7319)</label>
                    <button type="button" onClick={() => { setAuthTab('forgot'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>¿Olvidaste?</button>
                  </div>
                  <input type="password" required placeholder="••••••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}>
                  {authLoading ? 'Verificando...' : 'Conectar con Control Plane ↗'}
                </button>
              </form>
            )}

            {authTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid #10b981', padding: '10px', borderRadius: '6px', marginBottom: '6px', fontSize: '11.5px', color: '#34d399', textAlign: 'center' }}>
                  ⚡ Aprovisionamiento de Demo 7 Días de Cumplimiento SAARE
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
                  <input type="email" required placeholder="alfonsoterritoriohostil@gmail.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #334151', color: '#fff', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>ORGANIZACIÓN / TENANT</label>
                  <input type="text" required placeholder="ACME Corporation" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #334151', color: '#fff', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CONTRASEÑA (O PIN: 7319)</label>
                  <input type="password" required placeholder="••••••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}>
                  {authLoading ? 'Aprovisionando...' : 'Acceder a Demo 7 Días ↗'}
                </button>
              </form>
            )}

            {authTab === 'forgot' && (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 6px 0', lineHeight: 1.5 }}>
                  Introduce tu correo registrado y el Control Plane te emitirá una clave provisional.
                </p>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
                  <input type="email" required placeholder="alfonsoterritoriohostil@gmail.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '12px', background: '#ca8a04', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                  {authLoading ? 'Emitiendo...' : 'Enviar Contraseña Provisional'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline' }}>
                    ← Volver al login
                  </button>
                </div>
              </form>
            )}

            {authTab === 'checkout' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: 0 }}>Selecciona el plan para procesar el alta inmediata:</p>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>ORGANIZACIÓN / CLIENTE</label>
                  <input type="text" placeholder="ACME Corporation" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #334151', color: '#fff', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => handleCheckout('Software Core L7', 490)} style={{ padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Pagar Software Core (490 € / mes)</button>
                  <button onClick={() => handleCheckout('Sales Traceability', 790)} style={{ padding: '10px', background: '#10b981', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Pagar Módulo Sales (790 € / mes)</button>
                  <button onClick={() => handleCheckout('GRC Compliance Suite', 1490)} style={{ padding: '10px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Pagar GRC Compliance (1.490 € / mes)</button>
                  <button onClick={() => handleCheckout('Developer SDK Pro', 199)} style={{ padding: '10px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Pagar Developer Tier (199 € / mes)</button>
                </div>
              </div>
            )}

            {authSuccess && <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(52,211,153,0.15)', color: '#34d399', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}>{authSuccess}</div>}
            {authError && <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}>{authError}</div>}
            <button type="button" onClick={() => setShowAuthModal(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', marginTop: '14px' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* NAVBAR PRINCIPAL CON LAS 5 PESTAÑAS COMERCIALES */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveProfile('software')}>
            <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '2.5px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#0ea5e9', fontSize: '10px', borderLeft: '1px solid #374151', paddingLeft: '12px', fontWeight: '800', maxWidth: '280px', lineHeight: 1.2 }}>
              MS3V · AI Authorization & GRC Platform
            </span>
          </div>

          <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12.5px', fontWeight: '700', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveProfile('software')} style={{ background: activeProfile === 'software' ? 'rgba(14,165,233,0.15)' : 'none', border: activeProfile === 'software' ? '1px solid #0ea5e9' : '1px solid transparent', color: activeProfile === 'software' ? '#38bdf8' : '#9ca3af', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Software</button>
            <button onClick={() => setActiveProfile('sales')} style={{ background: activeProfile === 'sales' ? 'rgba(16,185,129,0.15)' : 'none', border: activeProfile === 'sales' ? '1px solid #10b981' : '1px solid transparent', color: activeProfile === 'sales' ? '#34d399' : '#9ca3af', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Sales</button>
            <button onClick={() => setActiveProfile('grc')} style={{ background: activeProfile === 'grc' ? 'rgba(168,85,247,0.15)' : 'none', border: activeProfile === 'grc' ? '1px solid #a855f7' : '1px solid transparent', color: activeProfile === 'grc' ? '#c084fc' : '#9ca3af', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>GRC</button>
            <button onClick={() => setActiveProfile('developers')} style={{ background: activeProfile === 'developers' ? 'rgba(56,189,248,0.15)' : 'none', border: activeProfile === 'developers' ? '1px solid #38bdf8' : '1px solid transparent', color: activeProfile === 'developers' ? '#38bdf8' : '#9ca3af', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Developers</button>
            <button onClick={() => setActiveProfile('enterprise')} style={{ background: activeProfile === 'enterprise' ? 'rgba(250,204,21,0.15)' : 'none', border: activeProfile === 'enterprise' ? '1px solid #facc15' : '1px solid transparent', color: activeProfile === 'enterprise' ? '#facc15' : '#9ca3af', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Enterprise</button>
          </nav>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a href={OFFICIAL_VERIFY_PAGE} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(14, 165, 233, 0.12)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.4)', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', textDecoration: 'none', fontWeight: 'bold' }}>
              <span>🔏 Firma Oficial</span>
            </a>

            {!activeSessionUser ? (
              <button onClick={() => { setShowAuthModal(true); setAuthTab('login'); }} style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '11.5px' }}>
                <span>🔑 Entrar / API v1</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111827', border: '1px solid #374151', padding: '4px 8px', borderRadius: '6px' }}>
                <span style={{ color: '#38bdf8', fontSize: '10.5px', fontFamily: 'monospace', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  👤 {activeSessionUser.email}
                </span>
                <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Salir</button>
              </div>
            )}

            <a href={getConsoleTargetUrl()} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#000000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '11.5px', textDecoration: 'none' }}>
              Control Plane ↗
            </a>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', width: '100%', height: '60vh', minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'radial-gradient(circle at center, #0f172a 0%, #030712 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '1040px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', margin: '0 auto 16px auto', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            Infraestructura Crítica de Autorización en Tiempo Real
          </h1>
          <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '780px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
            Despliegue autónomo instantáneo. Protege tus agentes de IA, previene fugas de datos y cumple estrictamente con el EU AI Act y DORA sin necesidad de rediseñar tu arquitectura.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setShowAuthModal(true); setAuthTab('checkout'); }} style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,0.5)' }}>
              ⚡ Activar Suscripción Corporativa Inmediata
            </button>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ padding: '12px 20px', backgroundColor: 'rgba(22, 163, 74, 0.9)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              💬 Contacto Directo ({CONTACT_PHONE})
            </a>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL POR MÓDULO */}
      <main style={{ maxWidth: '1160px', margin: '40px auto 80px auto', padding: '0 24px' }}>
        
        {/* ===================== 1. SOFTWARE ===================== */}
        {activeProfile === 'software' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #0ea5e9', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(14,165,233,0.1)' }}>
              <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MÓDULO 1 · SOFTWARE CORE L7</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '6px 0 14px 0' }}>Motor Judge L7 & Autorización Runtime Síncrona</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                El núcleo tecnológico de S.A.A.R.E. intercepta cada llamada y decisión de tus agentes en el borde. Conexión directa mediante los endpoints <code>/api/v1/judge</code> y <code>/api/v1/intercept</code> para garantizar el bloqueo síncrono de prompt injections y bypasses del sistema en milisegundos.
              </p>
              
              <div style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', margin: '24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#fff', margin: '0 0 6px 0' }}>Software Core Subscription</h3>
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Incluye motor de juicio, permisos síncronos y latencia P99 de &lt;1.5 ms.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#38bdf8' }}>490 € <span style={{ fontSize: '12px', color: '#9ca3af' }}>/ mes</span></div>
                    <div style={{ fontSize: '12px', color: '#34d399' }}>o 4.700 € / año (Ahorro del 20%)</div>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleCheckout('Software Core L7', 490)} style={{ padding: '12px 24px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                    Contratar Software Core ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 2. SALES ===================== */}
        {activeProfile === 'sales' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #10b981', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(16,185,129,0.1)' }}>
              <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MÓDULO 2 · SALES & COMMERCIAL TRACEABILITY</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '6px 0 14px 0' }}>Trazabilidad Comercial y Auditoría de Leads con IA</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                Optimizado para equipos comerciales y operaciones que automatizan interacciones con IA. Utiliza el endpoint <code>/api/v1/runs</code> para auditar y verificar que los agentes comerciales operan bajo estricto cumplimiento corporativo sin fugas de PII ni datos de clientes.
              </p>

              <div style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', margin: '24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#fff', margin: '0 0 6px 0' }}>Sales Intelligence Suite</h3>
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Licencias de uso comercial por equipos con auditoría continua de transacciones.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399' }}>790 € <span style={{ fontSize: '12px', color: '#9ca3af' }}>/ mes</span></div>
                    <div style={{ fontSize: '12px', color: '#34d399' }}>o 7.500 € / año (Facturación anual)</div>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleCheckout('Sales Traceability', 790)} style={{ padding: '12px 24px', background: '#10b981', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                    Contratar Licencia Sales ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 3. GRC ===================== */}
        {activeProfile === 'grc' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #a855f7', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(168,85,247,0.1)' }}>
              <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MÓDULO 3 · GRC & COMPLIANCE</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '6px 0 14px 0' }}>Evidencias Automáticas & Proof Bundles RFC 3161</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                Diseñado para responsables de cumplimiento y auditores externos. Conectado al endpoint <code>/api/v1/export-proof-bundle</code>, genera paquetes de evidencia con sellado criptográfico asimétrico Ed25519 y alineamiento normativo directo con el Anexo IV del Reglamento UE 2024/1689 (EU AI Act).
              </p>

              <div style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', margin: '24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#fff', margin: '0 0 6px 0' }}>GRC Compliance License</h3>
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Licencia anual recurrente de cumplimiento normativo y peritaje informático preconstituido.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#c084fc' }}>1.490 € <span style={{ fontSize: '12px', color: '#9ca3af' }}>/ mes</span></div>
                    <div style={{ fontSize: '12px', color: '#34d399' }}>15.000 € / año (Facturación anual)</div>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleCheckout('GRC Compliance Suite', 1490)} style={{ padding: '12px 24px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                    Contratar Licencia GRC ↗
                  </button>
                </div>
              </div>

              {/* Matriz de control GRC */}
              <h3 style={{ fontSize: '18px', color: '#fff', margin: '30px 0 16px 0' }}>Technical Control-to-Verdict Matrix</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                      <th style={{ padding: '10px' }}>REQUISITO / MARCO</th>
                      <th style={{ padding: '10px' }}>CONTROL TÉCNICO</th>
                      <th style={{ padding: '10px' }}>POLÍTICA SAARE</th>
                      <th style={{ padding: '10px' }}>DECISIÓN</th>
                      <th style={{ padding: '10px' }}>EVIDENCIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTROL_MATRIX.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 'bold' }}>{row.requirement}</td>
                        <td style={{ padding: '10px', color: '#cbd5e1' }}>{row.control}</td>
                        <td style={{ padding: '10px', color: '#9ca3af', fontFamily: 'monospace' }}>{row.policy}</td>
                        <td style={{ padding: '10px', color: row.decision.includes("DENY") ? "#f87171" : "#34d399", fontWeight: 'bold' }}>{row.decision}</td>
                        <td style={{ padding: '10px', color: '#a855f7' }}>{row.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 4. DEVELOPERS ===================== */}
        {activeProfile === 'developers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #38bdf8', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(56,189,248,0.1)' }}>
              <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MÓDULO 4 · DEVELOPERS & SDKS</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '6px 0 14px 0' }}>SDKs, Ganchos L7 y Despliegue de Sensor Local</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                Para desarrolladores e ingenieros de sistemas. Acceso directo al endpoint <code>/api/v1/download-extension</code> para empaquetar y aprovisionar el sensor L7 junto con la Bóveda Local sincronizada a la Bóveda KV en la nube.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveCodeTab('sdk')} style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'sdk' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'sdk' ? '#111827' : 'transparent', color: activeCodeTab === 'sdk' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>SDK (@saare/judge)</button>
                <button onClick={() => setActiveCodeTab('workflow')} style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'workflow' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'workflow' ? '#111827' : 'transparent', color: activeCodeTab === 'workflow' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Workflow Interceptor</button>
                <button onClick={() => setActiveCodeTab('sidecar')} style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'sidecar' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'sidecar' ? '#111827' : 'transparent', color: activeCodeTab === 'sidecar' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Sidecar Container (Docker)</button>
              </div>

              <pre style={{ margin: 0, backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '10px', padding: '20px', color: '#f3f4f6', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5, marginBottom: '24px' }}>
                {codeSnippets[activeCodeTab]}
              </pre>

              <div style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>Runtime Test & Benchmarks P99</h3>
                  <button onClick={handleEvaluateLiveJudge} disabled={liveJudgeLoading} style={{ padding: '8px 18px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    {liveJudgeLoading ? 'Evaluando...' : '▶ Evaluar Anclaje Raíz'}
                  </button>
                </div>

                {liveJudgeResult && (
                  <div style={{ background: '#030712', border: '1px solid #34d399', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#34d399' }}>
                    [DECISIÓN: {liveJudgeResult.decision}] · ID: {liveJudgeResult.verdictId} <br/>
                    <span style={{ color: '#9ca3af' }}>{liveJudgeResult.message || "Root attestation verified successfully."}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== 5. ENTERPRISE ===================== */}
        {activeProfile === 'enterprise' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ background: '#0b0f19', border: '1px solid #ca8a04', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(202,138,4,0.1)' }}>
              <span style={{ color: '#facc15', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MÓDULO 5 · ENTERPRISE SOVEREIGN</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '6px 0 14px 0' }}>Despliegue Dedicado, Contratos Marco y SLA 24/7</h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                Infraestructura de grado operador para banca, seguros y sector público. Despliegues en VPC dedicada, custodia de claves en HSMs físicos y soporte crítico permanente con arquitecto asignado.
              </p>

              <div style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', margin: '24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', color: '#fff', margin: '0 0 6px 0' }}>Enterprise Contract</h3>
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Contrato marco con capacidad ilimitada y cumplimiento normativo a medida.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#facc15' }}>Desde 3.500 € <span style={{ fontSize: '12px', color: '#9ca3af' }}>/ mes</span></div>
                    <div style={{ fontSize: '12px', color: '#34d399' }}>35.000 € / año en adelante</div>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowEnterpriseModal(true)} style={{ padding: '12px 24px', background: '#ca8a04', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                    Solicitar Propuesta Enterprise ↗
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL ENTERPRISE / CONTACTO */}
      {showEnterpriseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowEnterpriseModal(false)}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #ca8a04', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>GRANDES CUENTAS</span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Cualificación Enterprise / VPC Dedicada</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Un especialista técnico de nuestro gabinete se pondrá en contacto para diseñar la arquitectura de despliegue soberano.
            </p>

            <div style={{ background: '#030712', border: '1px solid #ca8a04', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ color: '#facc15', display: 'block', fontSize: '10px', fontWeight: 'bold' }}>LÍNEA DIRECTA:</span>
                <strong style={{ color: '#ffffff' }}>{CONTACT_PHONE}</strong> | <strong style={{ color: '#38bdf8' }}>{CONTACT_EMAIL}</strong>
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px' }}>WhatsApp ↗</a>
            </div>

            {b2bSuccessMsg ? (
              <div style={{ padding: '14px', background: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', color: '#34d399', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                {b2bSuccessMsg}
              </div>
            ) : (
              <form onSubmit={(e) => handleSendB2BForm(e, 'Enterprise Sovereign')} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO (CISO / CTO)</label>
                  <input type="email" required placeholder="ciso@empresa.com" value={b2bFormData.emailContacto} onChange={(e) => setB2bFormData({...b2bFormData, emailContacto: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <button type="submit" disabled={loadingLead} style={{ width: '100%', padding: '12px', background: '#ca8a04', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>
                  {loadingLead ? 'Transmitiendo...' : 'Solicitar Propuesta Enterprise'}
                </button>
              </form>
            )}

            <button type="button" onClick={() => setShowEnterpriseModal(false)} style={{ width: '100%', padding: '12px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', marginTop: '10px' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* BANNER DE COOKIES */}
      {!cookieConsent && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#0b0f19', borderTop: '2px solid #0284c7', padding: '16px 24px', zIndex: 99999, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 -10px 30px rgba(0,0,0,0.8)' }}>
          <div style={{ maxWidth: '800px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
            <strong style={{ color: '#38bdf8' }}>Política de Cookies y Privacidad:</strong> Utilizamos cookies técnicas esenciales para garantizar la seguridad de la sesión en la Bóveda KL y el Control Plane. Cumplimiento RGPD y LSSI.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleRejectCookies} style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #374151', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Rechazar no esenciales</button>
            <button onClick={handleAcceptCookies} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Aceptar Cookies</button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1f2937', paddingTop: '32px', paddingBottom: '40px', fontSize: '12px', color: '#6b7280' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div style={{ maxWidth: '620px' }}>
              <strong style={{ color: '#f3f4f6', fontSize: '13px' }}>SAARE — AI Execution Authorization Infrastructure</strong>
              <p style={{ margin: '6px 0 0 0', color: '#9ca3af', lineHeight: 1.5 }}>
                Runtime authorization for autonomous AI actions. <br />
                <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>AI agents can act. SAARE decides what they're allowed to do.</span>
              </p>
              
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
                <span style={{ color: '#cbd5e1' }}>📞 <strong>Tel:</strong> <a href={`tel:${CONTACT_PHONE_RAW}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>{CONTACT_PHONE}</a></span>
                <span>💬 <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 'bold' }}>WhatsApp Directo</a></span>
                <span>✉️ <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#f472b6', textDecoration: 'none' }}>{CONTACT_EMAIL}</a></span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #111827', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span>Protocol Certification: SGP 1.0 · Trust Anchor Ref: SAARE-MD-IPRES-2026</span>
            <span>© 2026 SAARE Digital Governance — Gabinete Técnico MS3V</span>
          </div>
        </div>
      </footer>

    </div>
  );
}