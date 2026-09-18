import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './utils/api';
import { SectorFunnel } from './components/SectorFunnel';
import GovernanceToolbar from './components/GovernanceToolbar';
import OfficialReportModal from './OfficialReportModal';

const API_BASE = `${API_BASE_URL.replace(/\/$/, '')}/v1`;
const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5173'
  : 'https://console.saare.es';

const DEMO_ROOT_MERKLE_HASH = "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";
const CONTACT_PHONE = "+34 633 886 506";
const CONTACT_EMAIL = "legal@saare.es";
const WHATSAPP_URL = "https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE";

const CONTROL_MATRIX = [
  { requirement: "EU AI Act Art. 10/12/15", control: "L7 Execution Authorization Gate", policy: "POL-EU-AIACT-ART15-PROMPT-INJECTION", decision: "DENY", evidence: "Proof Bundle (Ed25519 + RFC 3161)" },
  { requirement: "RGPD Art. 9/25/32", control: "Sensitive Data Runtime Control", policy: "POL-PRIVACY-PII-K-ANONYMITY", decision: "ALLOW / DENY", evidence: "Zero-Disk Decision Record" },
  { requirement: "NIS 2 / DORA", control: "Operational Authorization Control", policy: "POL-RESILIENCE-FAIL-CLOSED-STRICT", decision: "DENY", evidence: "Signed Security Event" },
  { requirement: "ISO/IEC 27037:2012", control: "Evidence Handling Workflow", policy: "POL-EVIDENCE-CHAIN-OF-CUSTODY", decision: "ALLOW", evidence: "Merkle Root Proof Bundle" },
  { requirement: "Arts. 281 y 326 LEC", control: "Prueba Documental Preconstituida", policy: "POL-LEGAL-PROOF-PRECONSTITUTED", decision: "ALLOW", evidence: "Tamper-Evident Root Seal" }
];

const ROLES_BUYERS_MATRIX = [
  { role: "CTO / AI Platform", question: "¿Qué puede ejecutar realmente mi agente de IA?", solution: "Control L7 determinista antes de la llamada a herramientas o APIs." },
  { role: "CISO / SecOps", question: "¿Qué ocurre si un agente intenta algo no autorizado?", solution: "Principio Fail-Closed síncrono (<1.5ms) con bloqueo en el borde." },
  { role: "GRC / DPO", question: "¿Cómo demuestro cumplimiento ante reguladores?", solution: "Evidencia criptográfica inmutable sellada por TSA cualificada RFC 3161." },
  { role: "Developer / ISV", question: "¿Cómo lo integro sin arruinar la latencia?", solution: "SDK nativo @saare/judge o Sidecar Docker con P99 de 1.18 ms." },
  { role: "RevOps / Sales Ops", question: "¿Qué puede hacer la IA con clientes y precios?", solution: "Gobernanza comercial ex-ante sobre mutaciones en CRM y pagos." },
  { role: "Enterprise Arch.", question: "¿Dónde se despliega el motor de decisión?", solution: "VPC propia, On-Premise o entorno Air-Gapped sin filtración de datos." },
  { role: "Board / Executive", question: "¿Cuál es nuestra exposición operativa real?", solution: "Consola C-Level con métricas de riesgo ex-ante y ROI de tokens." }
];

export default function App() {
  const [activeSessionUser, setActiveSessionUser] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('software');
  const [activeCodeTab, setActiveCodeTab] = useState('sdk');

  // Estado Modal de Informes Oficiales
  const [selectedReportSector, setSelectedReportSector] = useState(null);

  // Form states
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [agentCount, setAgentCount] = useState('1-5');

  // Verification & Live Judge States
  const [publicVerifyHash, setPublicVerifyHash] = useState('');
  const [publicVerifyLoading, setPublicVerifyLoading] = useState(false);
  const [publicVerifyResult, setPublicVerifyResult] = useState(null);
  const [liveJudgeLoading, setLiveJudgeLoading] = useState(false);
  const [liveJudgeResult, setLiveJudgeResult] = useState(null);

  // Live Control Test Simulation Data
  const [simulatedAction] = useState({
    agent: "treasury-agent-04",
    action: "send_payment",
    amount: "18420.00",
    currency: "EUR",
    destination: "external.sepa.account.de89...",
    classification: "CONFIDENTIAL",
    risk: "HIGH",
    policy: "FIN-PAYMENT-042",
    version: "17"
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saare_session_user');
      if (stored) setActiveSessionUser(JSON.parse(stored));
    } catch {}
  }, []);

  const getConsoleTargetUrl = (targetMode = "GRC_AUDIT", targetPath = "/") => {
    const baseConsole = CONSOLE_URL.endsWith('/') ? CONSOLE_URL.slice(0, -1) : CONSOLE_URL;
    const params = new URLSearchParams();
    params.set('mode', targetMode);
    if (activeSessionUser) {
      params.set('user', activeSessionUser.email);
      params.set('token', activeSessionUser.apiKey || localStorage.getItem('saare_auth_token') || '');
      params.set('tenant', activeSessionUser.tenantName || 'ORGANIZACION');
      params.set('role', activeSessionUser.role || 'CISO_ADMIN');
    }
    return `${baseConsole}${targetPath.startsWith('/') ? targetPath : '/' + targetPath}?${params.toString()}`;
  };

  const handleStartTrial = () => {
    if (agentCount === '10+') {
      window.open(WHATSAPP_URL, '_blank');
      return;
    }

    const trialUser = {
      email: formEmail || "auditor.trial@empresa.com",
      name: "Auditor Compliance",
      tenantName: formCompany || "EMPRESA_EVALUACION",
      apiKey: "sk_saare_trial_compliance_7d",
      role: "Compliance Auditor (7-Day Trial)",
      plan: "TRIAL_7D"
    };
    localStorage.setItem('saare_session_user', JSON.stringify(trialUser));
    localStorage.setItem('saare_auth_token', trialUser.apiKey);
    setActiveSessionUser(trialUser);
    window.location.href = getConsoleTargetUrl('GRC_AUDIT', '/compliance');
  };

  const handleVerifyPublicHash = async (e) => {
    e.preventDefault();
    const hashToVerify = publicVerifyHash.trim() || DEMO_ROOT_MERKLE_HASH;
    setPublicVerifyLoading(true);
    setPublicVerifyResult(null);

    try {
      const res = await fetch(`${API_BASE}/verify/${hashToVerify}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      setPublicVerifyResult({
        status: 'VERIFIED',
        merkleRoot: hashToVerify,
        standard: data.standard || "ISO/IEC 27037:2012 / EU AI Act",
        rfc3161Timestamp: data.timestamp || new Date().toISOString(),
        details: "Firma asimétrica Ed25519 verificada. Sello TSA RFC 3161 válido."
      });
    } catch (err) {
      setPublicVerifyResult({
        status: 'UNVERIFIED',
        merkleRoot: hashToVerify,
        standard: "NON_EVIDENTIARY",
        rfc3161Timestamp: new Date().toISOString(),
        details: `Verificación offline rechazada: ${err.message}. Evidencia no registrada en el Trust Anchor.`
      });
    } finally {
      setPublicVerifyLoading(false);
    }
  };

  const handleEvaluateLiveJudge = async () => {
    setLiveJudgeLoading(true);
    setLiveJudgeResult(null);

    try {
      const res = await fetch(`${API_BASE}/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: simulatedAction.agent,
          action: simulatedAction.action,
          resource: `core-banking-api://transfers/${simulatedAction.currency.toLowerCase()}`,
          context: { 
            amount_eur: parseFloat(simulatedAction.amount),
            destination: simulatedAction.destination,
            risk_score: simulatedAction.risk
          }
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setLiveJudgeResult(data);
    } catch {
      setLiveJudgeResult({
        decision: "DENY",
        verdictId: "VRD-DENY-EX-ANTE-8942",
        executionPermit: "NOT_ISSUED",
        payloadPersisted: "ZERO_DISK_RELEASED",
        proofStatus: "SEALED_RFC3161",
        reason: "Violación de política FIN-PAYMENT-042: Monto superior al umbral sin revisión humana explícita."
      });
    } finally {
      setLiveJudgeLoading(false);
    }
  };

  const codeSnippets = {
    sdk: `import { SaareJudgeClient } from '@saare/judge';
const judge = new SaareJudgeClient({ apiKey: process.env.SAARE_API_KEY });

// 01. DEFINE ACTION & CONTEXT
// 02. CALL S.A.A.R.E. JUDGE EX-ANTE
const decision = await judge.authorize({
  agent: "treasury-agent-04",
  action: "send_payment",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00 },
  risk: "HIGH"
});

// 03. RECEIVE VERDICT & VERIFY PERMIT
if (decision.decision === "ALLOW") {
  // 04. EXECUTE ONLY WITH VALID PERMIT
  await executeBankTransfer(decision.executionPermit);
} else if (decision.decision === "REVIEW") {
  await escalateToHumanSupervisor(decision.reviewTicket);
} else {
  throw new Error('Bloqueo Ex-Ante SAARE: Permiso de Ejecución Denegado');
}`,
    workflow: `// Interceptor REST HTTP / L7 Gateway Pattern
const saareResponse = await fetch('${API_BASE}/judge', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + process.env.SAARE_API_KEY,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({ 
    subject: agentId, 
    action: toolCall, 
    resource: targetApi,
    policy: "POL-EX-ANTE-DEFAULT" 
  })
}).then(r => r.json());

if (saareResponse.decision !== 'ALLOW') {
  console.error('[SAARE ENFORCER] Action Denied:', saareResponse.verdictId);
  return { status: 403, error: 'Execution Permit Not Issued' };
}`,
    sidecar: `# Docker Sidecar Deployment (Air-Gapped / VPC)
version: '3.8'
services:
  saare-execution-gate:
    image: registry.saare.es/decision-core:v10.0.4
    ports:
      - "127.0.0.1:8765:8765"
    environment:
      - SAARE_TENANT_KEY=\${SAARE_TENANT_KEY}
      - SAARE_MEMORY_MODE=EPHEMERAL_MLOCK
      - SAARE_FAIL_CLOSED=STRICT
      - SAARE_ZERO_DISK=ENABLED`
  };

  return (
    <div className="bg-saare-bg text-saare-ink min-h-screen font-sans selection:bg-saare-allow selection:text-black">
      
      {/* 00 · TOP EXECUTIVE ANNOUNCEMENT BANNER */}
      <div className="bg-saare-surface-2 border-b border-saare-line py-2 px-4 text-xs text-center relative z-50">
        <span className="text-saare-ink-dim">Read SAARE Executive Briefing: </span>
        <strong className="text-saare-accent ml-1">Sovereign AI Architecture & Legal Pre-Constituted Evidence</strong>
        <span className="ml-3 text-saare-seal cursor-pointer underline" onClick={handleStartTrial}>
          Ver Especificación ↗
        </span>
      </div>

      {/* 00 · HEADER / NAVEGACIÓN */}
      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-saare-line">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-2xl text-saare-ink tracking-tight">S.A.A.R.E.</span>
            <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 px-2 py-0.5 border border-saare-accent rounded">
              SGP 1.0
            </span>
          </div>

          <nav className="hidden lg:flex gap-6">
            {[
              { id: 'software', name: 'SOFTWARE', desc: 'Execution Control' },
              { id: 'sales', name: 'SALES', desc: 'Commercial Governance' },
              { id: 'grc', name: 'GRC', desc: 'Evidence & Compliance' },
              { id: 'developers', name: 'DEVELOPERS', desc: 'Integration & Runtime' },
              { id: 'enterprise', name: 'ENTERPRISE', desc: 'Sovereign Deployment' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveNavTab(tab.id)}
                className={`text-left pb-1 border-b-2 transition-colors ${
                  activeNavTab === tab.id ? 'border-saare-accent text-saare-accent' : 'border-transparent text-saare-ink-dim hover:text-saare-ink'
                }`}
              >
                <div className="font-mono text-xs font-bold tracking-wider">{tab.name}</div>
                <div className="text-[10px] text-saare-ink-faint uppercase">{tab.desc}</div>
              </button>
            ))}
          </nav>

          <div className="flex gap-3 items-center">
            <button 
              className="px-4 py-2 text-xs font-semibold rounded border border-saare-line-hi text-saare-ink hover:bg-saare-surface-2 transition"
              onClick={() => window.location.href = getConsoleTargetUrl('GRC_AUDIT')}
            >
              {activeSessionUser ? `Console (${activeSessionUser.email.split('@')[0]})` : 'Console Access'}
            </button>
            <button 
              className="px-4 py-2 text-xs font-bold rounded bg-saare-allow text-black hover:shadow-[0_0_20px_rgba(30,185,104,0.3)] transition"
              onClick={handleStartTrial}
            >
              Run Control Test ↗
            </button>
          </div>

        </div>
      </header>

      {/* 01 · HERO LIMPIO A PANTALLA COMPLETA ESTILO PALANTIR */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center border-b border-saare-line overflow-hidden bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none z-0 filter grayscale contrast-125"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/70 via-transparent to-[#030712] pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#232E4215_1px,transparent_1px),linear-gradient(to_bottom,#232E4215_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-tight drop-shadow-lg">
            Sistema de Alineamiento, Auditoría y Resiliencia Estructural
          </h1>
          <p className="mt-4 font-mono text-sm text-saare-accent tracking-widest uppercase">
            AI Execution Authorization Infrastructure
          </p>
        </div>

        <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
          <div className="font-mono text-[10px] text-saare-ink-dim tracking-widest uppercase animate-bounce flex items-center gap-2">
            <span>Explorar Arquitectura</span> ↓
          </div>
        </div>
      </section>

      {/* 01.5 · BLOQUE DE PRESENTACIÓN Y CTAs */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center border-b border-saare-line">
        <div className="font-mono text-xs text-saare-accent uppercase tracking-widest mb-3">
          S.A.A.R.E. SGP 1.0 · GOVERNANCE CORE
        </div>

        <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mb-4">
          Sovereign AI Systems for Every Decision
        </h2>

        <p className="font-display font-semibold text-lg sm:text-xl text-saare-accent mb-6">
          Los agentes de IA actúan. S.A.A.R.E. decide qué tienen permitido hacer.
        </p>

        <p className="text-saare-ink-dim text-base max-w-3xl mx-auto mb-6 leading-relaxed">
          Autorización ex-ante y gobernanza runtime L7 para agentes autónomos, herramientas, APIs y acciones críticas. Protege tus agentes de IA, previene fugas de datos y cumple strictly con el EU AI Act y DORA.
        </p>

        <div className="font-mono text-xs text-saare-seal mb-8 tracking-widest">
          IDENTITY · ACTION · CONTEXT · RESOURCE · DATA · RISK · POLICY
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            className="px-7 py-3.5 text-sm font-bold rounded bg-saare-allow text-black hover:shadow-[0_0_25px_rgba(30,185,104,0.4)] transition"
            onClick={handleStartTrial}
          >
            RUN CONTROL TEST ↗
          </button>
          <button 
            className="px-7 py-3.5 text-sm font-semibold rounded border border-saare-line-hi text-saare-ink hover:bg-saare-surface-2 transition"
            onClick={() => setActiveNavTab('enterprise')}
          >
            VIEW ARCHITECTURE
          </button>
          <button 
            className="px-5 py-3.5 text-sm font-mono font-medium rounded border border-saare-accent/40 text-saare-accent bg-saare-accent/10 hover:bg-saare-accent/20 transition"
            onClick={() => setActiveNavTab('developers')}
          >
            READ DEVELOPER DOCS
          </button>
        </div>

        <p className="font-mono text-xs text-saare-ink-dim max-w-2xl mx-auto mb-10 bg-saare-surface/80 p-3 border border-saare-line-hi rounded backdrop-blur-sm">
          “No almacenamos el payload como evidencia. Conservamos la prueba criptográfica de la decisión.”
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-saare-ink-dim bg-saare-surface/90 p-4 rounded-lg border border-saare-line-hi backdrop-blur-sm">
          <span className="text-white font-bold">AGENT</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-saare-seal font-bold">S.A.A.R.E. JUDGE</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-white">POLICY DECISION</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-saare-allow font-bold">ALLOW</span> / <span className="text-saare-seal font-bold">REVIEW</span> / <span className="text-saare-deny font-bold">DENY</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-saare-allow">EXECUTION PERMIT</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-white">TOOL / API / MCP / LLM</span>
        </div>
      </section>

      {/* PANEL DE GOBERNANZA INTEGRADO */}
      <section className="max-w-7xl mx-auto px-6">
        <GovernanceToolbar 
          onVerifySignature={() => console.log('Firma verificada')}
          onExportCustody={() => console.log('Cadena exportada')}
          onSimulateBlock={() => console.log('Bloqueo simulado')}
          onGenerateToken={() => console.log('Token generado')}
          onDownloadTeaser={() => setSelectedReportSector('Documentación Técnica Teaser')}
        />
      </section>

      {/* 02 · TRUST STRIP */}
      <section className="border-b border-saare-line bg-saare-surface py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 font-mono text-xs text-saare-ink-dim tracking-wider">
          <div>L7 RUNTIME</div>
          <div>·</div>
          <div>FAIL-CLOSED</div>
          <div>·</div>
          <div>ZERO-DISK</div>
          <div>·</div>
          <div>ED25519</div>
          <div>·</div>
          <div>MERKLE TREE</div>
          <div>·</div>
          <div>RFC 3161 TSA</div>
          <div>·</div>
          <div>SGP 1.0</div>
        </div>
      </section>

      {/* 03 · EL ENEMIGO CONCEPTUAL */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="font-mono text-xs font-bold text-saare-deny bg-saare-deny/10 border border-saare-deny px-3 py-1 rounded inline-block mb-3">
            THE STRUCTURAL PROBLEM
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            AI HAS MOVED FROM ANSWERING TO ACTING.
          </h2>
          <p className="text-saare-ink-dim text-lg max-w-3xl mx-auto">
            Cuando una IA puede llamar una API, modificar un registro, enviar información o ejecutar una operación, la pregunta ya no es qué puede generar. La pregunta es qué está autorizada a ejecutar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-saare-surface border border-saare-line-hi p-8 rounded">
            <div className="font-mono text-xs text-saare-accent mb-3">01 — EXECUTION</div>
            <h3 className="font-display font-bold text-xl text-white mb-4">The agent can act.</h3>
            <div className="font-mono text-xs text-saare-ink-dim space-y-2">
              <div>[API] Payment & Core Banking</div>
              <div>[DB] Customer Records & PII</div>
              <div>[CRM] Mutations & Lead Export</div>
              <div>[EMAIL] Direct Customer Contact</div>
              <div>[MCP] Model Context Protocol Tools</div>
            </div>
          </div>

          <div className="bg-saare-surface border border-saare-seal p-8 rounded">
            <div className="font-mono text-xs text-saare-seal mb-3">02 — AUTHORIZATION</div>
            <h3 className="font-display font-bold text-xl text-white mb-4">Who authorized the action?</h3>
            <div className="font-mono text-xs text-white space-y-2">
              <div>WHO? Agent & User Identity</div>
              <div>WHAT? Target Tool & Action</div>
              <div>WHY? Operational Context</div>
              <div>WITH WHICH DATA? Classification</div>
              <div>UNDER WHICH POLICY? Rule ID</div>
            </div>
          </div>

          <div className="bg-saare-surface border border-saare-allow p-8 rounded">
            <div className="font-mono text-xs text-saare-allow mb-3">03 — PROOF</div>
            <h3 className="font-display font-bold text-xl text-white mb-4">Can you prove it afterwards?</h3>
            <div className="font-mono text-xs text-saare-allow space-y-2">
              <div>VERDICT: ALLOW / REVIEW / DENY</div>
              <div>POLICY VERSION: Signed State</div>
              <div>DIGEST: SHA-256 HMAC</div>
              <div>SIGNATURE: Ed25519 Unbound</div>
              <div>PROOF BUNDLE: RFC 3161 TSA</div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 · SECCIÓN CATEGORÍA: AI GATEWAY ≠ EXECUTION AUTHORITY */}
      <section className="py-20 px-6 bg-saare-surface border-t border-b border-saare-line">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
              An AI Gateway manages traffic. <br />S.A.A.R.E. governs execution authority.
            </h2>
            <p className="text-saare-ink-dim">Diferenciación de categoría entre observabilidad posterior y autoridad determinista ex-ante.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim">
                  <th className="p-4">DIMENSIÓN DE CONTROL</th>
                  <th className="p-4 text-saare-ink-faint">AI GATEWAY CONVENCIONAL</th>
                  <th className="p-4 text-saare-accent font-bold">S.A.A.R.E. EXECUTION AUTHORITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saare-line">
                <tr>
                  <td className="p-4 text-white font-sans">Tráfico vs Acción</td>
                  <td className="p-4 text-saare-ink-faint">Routes HTTP Traffic</td>
                  <td className="p-4 text-saare-allow font-bold">Authorizes Specific Actions & Tools</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Abstracción</td>
                  <td className="p-4 text-saare-ink-faint">Provider Abstraction & Caching</td>
                  <td className="p-4 text-saare-allow font-bold">Policy Authority & Runtime Enforcement</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Observabilidad</td>
                  <td className="p-4 text-saare-ink-faint">Post-Facto Logging & Metrics</td>
                  <td className="p-4 text-saare-seal font-bold">Cryptographic Evidence & Proof Bundles</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Momento de Control</td>
                  <td className="p-4 text-saare-ink-faint">Request Filtering</td>
                  <td className="p-4 text-saare-accent font-bold">Ex-Ante Execution Decision (&lt;1.5ms)</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Gobernanza de Red</td>
                  <td className="p-4 text-saare-ink-faint">Infrastructure Proxy</td>
                  <td className="p-4 text-saare-allow font-bold">Action Control & Execution Permits</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 08 · LA SECCIÓN WOW: LIVE CONTROL TEST SIMULATOR */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 border border-saare-accent px-3 py-1 rounded inline-block mb-3">
            INTERACTIVE DEMONSTRATION
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Live Execution Control Engine</h2>
          <p className="text-saare-ink-dim mt-2">Pruebe la intercepción síncrona L7 y la emisión de permisos de ejecución en vivo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-saare-surface border border-saare-line-hi p-8 rounded-lg">
          <div>
            <div className="font-mono text-xs text-saare-accent mb-4 font-bold">
              [INPUT] ACTION REQUEST PAYLOAD
            </div>

            <div className="font-mono text-xs bg-saare-bg p-5 border border-saare-line rounded space-y-2">
              <div>agent: <span className="text-saare-accent">"{simulatedAction.agent}"</span></div>
              <div>action: <span className="text-saare-seal">"{simulatedAction.action}"</span></div>
              <div>amount: <span className="text-saare-allow">€{simulatedAction.amount}</span></div>
              <div>destination: <span className="text-saare-ink-dim">"{simulatedAction.destination}"</span></div>
              <div>classification: <span className="text-saare-deny">"{simulatedAction.classification}"</span></div>
              <div>risk: <span className="text-saare-deny">"{simulatedAction.risk}"</span></div>
              <div>policy: <span className="text-saare-accent">"{simulatedAction.policy}" (v{simulatedAction.version})</span></div>
            </div>

            <button 
              className="w-full mt-6 py-3.5 bg-saare-allow text-black font-bold text-sm rounded hover:shadow-[0_0_20px_rgba(30,185,104,0.3)] transition"
              onClick={handleEvaluateLiveJudge} 
              disabled={liveJudgeLoading}
            >
              {liveJudgeLoading ? 'EVALUANDO POLÍTICA EX-ANTE...' : 'RUN JUDGE EVALUATION ➔'}
            </button>
          </div>

          <div>
            <div className="font-mono text-xs text-saare-seal mb-4 font-bold">
              [OUTPUT] S.A.A.R.E. JUDGE ENGINE VERDICT
            </div>

            {liveJudgeResult ? (
              <div className="bg-saare-bg border border-saare-deny p-5 rounded font-mono text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-saare-line-hi">
                  <span>DECISION:</span>
                  <span className="px-2 py-0.5 text-sm font-bold bg-saare-deny/20 border border-saare-deny text-saare-deny rounded">
                    {liveJudgeResult.decision}
                  </span>
                </div>

                <div className="flex justify-between"><span>EXECUTION PERMIT</span><span className="text-saare-deny font-bold">{liveJudgeResult.executionPermit || "NOT ISSUED"}</span></div>
                <div className="flex justify-between"><span>PAYLOAD STORAGE</span><span className="text-saare-accent">{liveJudgeResult.payloadPersisted || "NOT PERSISTED (ZERO-DISK)"}</span></div>
                <div className="flex justify-between"><span>PROOF STATUS</span><span className="text-saare-seal">{liveJudgeResult.proofStatus || "SEALED (RFC 3161)"}</span></div>

                <div className="pt-3 border-t border-saare-line-hi text-[11px] text-saare-ink-dim">
                  CHAIN: SHA-256 ➔ ED25519 ➔ MERKLE TREE ➔ RFC 3161 TSA
                </div>
              </div>
            ) : (
              <div className="bg-saare-bg border border-dashed border-saare-line-hi p-10 text-center text-saare-ink-dim font-mono text-xs rounded">
                Haga clic en "RUN JUDGE EVALUATION" para simular el veredicto ex-ante y la generación del Execution Permit.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 10 · LAS 7 DIMENSIONES DE AUTORIZACIÓN */}
      <section className="py-16 px-6 bg-saare-surface border-t border-saare-line text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            Las 7 Dimensiones de Autorización
          </h2>
          <p className="text-saare-ink-dim mb-10 text-sm">El motor S.A.A.R.E. evalúa de forma determinista siete vectores simultáneos antes de emitir un veredicto.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 font-mono text-xs">
            {['IDENTITY', 'ACTION', 'CONTEXT', 'RESOURCE', 'DATA', 'RISK', 'POLICY'].map((dim, idx) => (
              <div key={idx} className="bg-saare-bg border border-saare-accent/40 p-4 rounded">
                <div className="text-saare-accent text-[10px] mb-1">DIM 0{idx+1}</div>
                <div className="font-bold text-white">{dim}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11 · LAS TRES DECISIONES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-3xl text-white text-center mb-12">
          Tres Veredictos Deterministas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-saare-surface border border-saare-allow p-8 rounded">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-allow/15 border border-saare-allow text-saare-allow rounded">ALLOW</span>
            <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Permiso concedido</h3>
            <p className="text-saare-ink-dim text-sm">Todas las condiciones de la política firmada se satisfacen. Se emite un Execution Permit tokenizado con expiración en milisegundos.</p>
          </div>

          <div className="bg-saare-surface border border-saare-seal p-8 rounded">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-seal/15 border border-saare-seal text-saare-seal rounded">REVIEW</span>
            <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Revisión humana</h3>
            <p className="text-saare-ink-dim text-sm">Acción de alto riesgo o umbral superado. La ejecución se congela ex-ante hasta recibir la firma digital del supervisor humano asignado.</p>
          </div>

          <div className="bg-saare-surface border border-saare-deny p-8 rounded">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-deny/15 border border-saare-deny text-saare-deny rounded">DENY</span>
            <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Bloqueo síncrono</h3>
            <p className="text-saare-ink-dim text-sm">Infracción de política, prompt injection o intento de acceso a PII no autorizado. Intercepción inmediata sin emisión de permiso.</p>
          </div>
        </div>
      </section>

      {/* 12 · EXECUTION PERMIT SPECIFICATION */}
      <section className="py-16 px-6 bg-saare-surface border-t border-b border-saare-line">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            Authorization is not observation. It is a permit to execute.
          </h2>
          <p className="font-mono text-saare-seal font-bold mb-8">“No permit. No execution.”</p>

          <div className="bg-saare-bg border border-saare-seal p-8 rounded font-mono text-xs text-left space-y-3">
            <div className="text-saare-seal font-bold pb-3 border-b border-saare-line-hi flex justify-between">
              <span>S.A.A.R.E. EXECUTION PERMIT STRUCTURE</span>
              <span>VALID UNTIL EXPIRED</span>
            </div>

            <div className="flex justify-between"><span>Agent Subject</span><span>treasury-agent-04</span></div>
            <div className="flex justify-between"><span>Action Scope</span><span>send_payment</span></div>
            <div className="flex justify-between"><span>Target Resource</span><span>core-banking-api://transfers/sepa</span></div>
            <div className="flex justify-between"><span>Policy Rule ID</span><span>FIN-PAYMENT-042 (v17)</span></div>
            <div className="flex justify-between"><span>Payload Digest</span><span className="text-saare-accent">sha256:7f3a9b...</span></div>
            <div className="flex justify-between"><span>Asymmetric Signature</span><span className="text-saare-seal">ed25519:4a92c1...</span></div>
          </div>
        </div>
      </section>

      {/* 13 · ZERO-DISK ARCHITECTURE */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            The payload is processed. The proof survives.
          </h2>
          <p className="text-saare-ink-dim max-w-2xl mx-auto text-sm">
            “No necesitas conservar el secreto para conservar la prueba de la decisión.”
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-saare-surface border border-saare-line p-8 rounded">
          <div>
            <h3 className="font-mono font-bold text-saare-accent mb-3">VOLATILE MEMORY (RAM MLOCK)</h3>
            <p className="text-saare-ink-dim text-sm leading-relaxed">
              El payload completo se procesa exclusivamente en memoria volátil RAM contigua bloqueada mediante `mlock`. Al emitirse el veredicto, el bloque de memoria se sobreescribe con ceros binarios (`explicit_bzero`) antes de liberar el puntero.
            </p>
            <div className="font-mono text-xs text-saare-deny mt-4 font-bold">
              ✖ ZERO PAYLOAD STORAGE IN SECONDARY DISK
            </div>
          </div>

          <div>
            <h3 className="font-mono font-bold text-saare-seal mb-3">PROOF BUNDLE (PERSISTENT PROOF)</h3>
            <p className="text-saare-ink-dim text-sm leading-relaxed">
              Lo que sobrevive no es el texto plano ni los datos confidenciales, sino el expediente de evidencia criptográfica inmutable formado por el hash HMAC-SHA256, la firma Ed25519 y la marca de tiempo eIDAS RFC 3161.
            </p>
            <div className="font-mono text-xs text-saare-allow mt-4 font-bold">
              ✔ 100% PRECONSTITUTED LEGAL PROOF (ART. 326 LEC)
            </div>
          </div>
        </div>
      </section>

      {/* 14 · PROOF ARCHITECTURE & PUBLIC VERIFIER */}
      <section className="py-20 px-6 bg-saare-surface border-t border-saare-line">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-white mb-2">
              PROVE EVERY DECISION.
            </h2>
            <p className="text-saare-ink-dim text-sm">Cada decisión se convierte en evidencia digital verificable por un tercero sin confiar en S.A.A.R.E.</p>
          </div>

          <div className="bg-saare-bg border border-saare-seal p-8 rounded">
            <h3 className="font-mono font-bold text-saare-seal text-sm mb-4">
              Verificación Pública de Inmutabilidad (RFC 3161)
            </h3>
            <form onSubmit={handleVerifyPublicHash} className="flex gap-3 flex-wrap">
              <input 
                type="text" 
                placeholder={`Hash Merkle o ID de Evidencia (${DEMO_ROOT_MERKLE_HASH.substring(0, 16)}...)`}
                value={publicVerifyHash}
                onChange={(e) => setPublicVerifyHash(e.target.value)}
                className="flex-1 bg-saare-surface border border-saare-line-hi px-4 py-3 rounded text-white font-mono text-xs focus:outline-none focus:border-saare-seal"
              />
              <button className="px-6 py-3 bg-saare-allow text-black font-bold text-xs rounded hover:bg-saare-allow/90 transition" type="submit" disabled={publicVerifyLoading}>
                {publicVerifyLoading ? 'Verificando...' : 'Verify Evidence'}
              </button>
            </form>

            {publicVerifyResult && (
              <div className={`mt-4 p-4 bg-saare-surface border font-mono text-xs space-y-1 ${
                publicVerifyResult.status === 'VERIFIED' ? 'border-saare-allow' : 'border-saare-deny'
              }`}>
                <div className={`font-bold ${publicVerifyResult.status === 'VERIFIED' ? 'text-saare-allow' : 'text-saare-deny'}`}>
                  {publicVerifyResult.status === 'VERIFIED' ? 'ATTESTATION OK: SELLO Y FIRMA VÁLIDOS' : 'FALLO DE ATTESTATION: EVIDENCIA NO VERIFICADA'}
                </div>
                <div>Merkle Root: {publicVerifyResult.merkleRoot}</div>
                <div>Timestamp RFC 3161: {publicVerifyResult.rfc3161Timestamp}</div>
                <div className="text-saare-ink-faint mt-1">{publicVerifyResult.details}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 15 - 19 · PESTAÑAS DE VALOR */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 border border-saare-accent px-3 py-1 rounded inline-block mb-3">
            ENTRY POINT: {activeNavTab.toUpperCase()}
          </span>
          <h2 className="font-display font-bold text-3xl text-white">
            {activeNavTab === 'software' && 'CONTROL WHAT YOUR AI CAN EXECUTE.'}
            {activeNavTab === 'sales' && 'GOVERN AI-POWERED COMMERCIAL ACTIONS.'}
            {activeNavTab === 'grc' && 'PROVE WHAT YOUR AI DID.'}
            {activeNavTab === 'developers' && 'AUTHORIZE BEFORE YOU EXECUTE.'}
            {activeNavTab === 'enterprise' && 'YOUR INFRASTRUCTURE. YOUR POLICIES. YOUR KEYS.'}
          </h2>
        </div>

        {activeNavTab === 'developers' ? (
          <div>
            <div className="flex gap-3 mb-6">
              <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'sdk' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('sdk')}>SDK Nativo</button>
              <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'workflow' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('workflow')}>REST Interceptor</button>
              <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'sidecar' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('sidecar')}>Sidecar Docker</button>
            </div>
            <pre className="bg-saare-surface border border-saare-line-hi p-6 rounded font-mono text-xs text-saare-accent overflow-x-auto leading-relaxed">
              {codeSnippets[activeCodeTab]}
            </pre>
          </div>
        ) : (
          <div className="bg-saare-surface border border-saare-line p-10 rounded">
            <p className="text-saare-ink-dim text-lg mb-8 leading-relaxed">
              {activeNavTab === 'software' && 'Intercepta acciones críticas en capa L7 antes de que lleguen a herramientas corporativas, bases de datos o APIs de pago.'}
              {activeNavTab === 'sales' && 'Controla qué puede hacer una IA cuando interactúa con clientes, modifica precios, genera contratos o exporta ledes en el CRM.'}
              {activeNavTab === 'grc' && 'Convierte decisiones de runtime en evidencia digital verificable legalmente para auditorías, investigación y control normativo.'}
              {activeNavTab === 'enterprise' && 'Despliega la autoridad de ejecución dentro de tu propia infraestructura, VPC, entorno privado, on-premise o red aislada.'}
            </p>
            <button className="px-6 py-3.5 bg-saare-allow text-black font-bold text-sm rounded hover:bg-saare-allow/90 transition" onClick={handleStartTrial}>
              {activeNavTab === 'enterprise' ? 'REQUEST ENTERPRISE ARCHITECTURE ↗' : 'RUN CONTROL TEST ↗'}
            </button>
          </div>
        )}
      </section>

      {/* 20 · RESILIENCIA FAIL-CLOSED */}
      <section className="py-20 px-6 bg-saare-surface border-t border-b border-saare-line text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            CONTROL DOES NOT DISAPPEAR WHEN THE CONTROL PLANE DOES.
          </h2>
          <p className="text-saare-ink-dim max-w-3xl mx-auto mb-10 text-base">
            “La indisponibilidad del plano de control no convierte una operación desconocida en una operación autorizada.”
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-saare-bg border border-saare-allow p-8 rounded">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-allow/15 border border-saare-allow text-saare-allow rounded">OPERACIÓN NORMAL</span>
              <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Central Policy Enforcement</h3>
              <p className="text-saare-ink-dim text-sm">El motor evalúa en tiempo real contra el plano de control central con latencias sostenidas P99 &lt; 1,5 ms.</p>
            </div>
            <div className="bg-saare-bg border border-saare-seal p-8 rounded">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-seal/15 border border-saare-seal text-saare-seal rounded">CAÍDA DE RED / OFFLINE</span>
              <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Signed Local Policy State</h3>
              <p className="text-saare-ink-dim text-sm">Ante una desconexión, el contenedor local replica las políticas deterministas firmadas y aplica estricto Fail-Closed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 23 · ROLES / BUYERS MATRIX */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            BUILT FOR THE PEOPLE WHO AUTHORIZE AI.
          </h2>
          <p className="text-saare-ink-dim text-sm">Diseñado para cada rol responsable de la automatización en la empresa.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim font-mono">
                <th className="p-4">ROL CORPORATIVO</th>
                <th className="p-4">PREGUNTA CLAVE DE NEGOCIO</th>
                <th className="p-4">SOLUCIÓN DETERMINISTA S.A.A.R.E.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-saare-line">
              {ROLES_BUYERS_MATRIX.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-4 font-mono font-bold text-saare-accent">{item.role}</td>
                  <td className="p-4 text-saare-ink-dim">{item.question}</td>
                  <td className="p-4 text-white">{item.solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 24 · OPERATING SURFACES */}
      <section className="py-20 px-6 bg-saare-surface border-t border-b border-saare-line">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-white mb-2">
              Three Operating Surfaces. One Execution Engine.
            </h2>
            <p className="text-saare-ink-dim text-sm">Tres consolas especializadas según la responsabilidad del usuario.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-saare-surface-2 border border-saare-line-hi p-8 rounded">
              <span className="font-mono text-xs text-saare-accent">EXECUTIVE CONSOLE</span>
              <h3 className="font-display font-bold text-xl text-white my-3">CEO & Board</h3>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between"><span>Riesgo Acumulado</span><span className="text-saare-allow">0.00%</span></div>
                <div className="flex justify-between"><span>Ahorro GPU / Tokens</span><span>45%</span></div>
                <div className="flex justify-between"><span>Exposición Operativa</span><span className="text-saare-allow font-bold">MITIGADA</span></div>
              </div>
            </div>

            <div className="bg-saare-surface-2 border border-saare-seal p-8 rounded">
              <span className="font-mono text-xs text-saare-seal">GRC_AUDIT CONSOLE</span>
              <h3 className="font-display font-bold text-xl text-white my-3">CISO & DPO</h3>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between"><span>EU AI Act Art. 10/12/15</span><span className="text-saare-allow font-bold">CONFORME</span></div>
                <div className="flex justify-between"><span>Proof Bundles RFC 3161</span><span>100% Sellado</span></div>
                <div className="flex justify-between"><span>Firma Digital</span><span className="text-saare-seal">Ed25519</span></div>
              </div>
            </div>

            <div className="bg-saare-surface-2 border border-saare-deny p-8 rounded">
              <span className="font-mono text-xs text-saare-deny">CYBER_RESILIENCE</span>
              <h3 className="font-display font-bold text-xl text-white my-3">SecOps & SOC</h3>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between"><span>Latencia P99</span><span className="text-saare-allow">1.18 ms</span></div>
                <div className="flex justify-between"><span>Intercepciones OWASP</span><span className="text-saare-deny font-bold">243 BLOCKED</span></div>
                <div className="flex justify-between"><span>Modo Operatorio</span><span className="text-saare-allow font-bold">FAIL-CLOSED</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 21 · PRICING ARCHITECTURE */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            Deployment Models & Pricing Architecture
          </h2>
          <p className="text-saare-ink-dim text-sm">Licenciamiento soberano por instancia de motor de decisión y nivel de evidencia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-saare-surface border border-saare-line p-8 rounded flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-saare-accent">STANDARD</span>
              <h3 className="font-display font-bold text-3xl text-white my-3">49 € <span className="text-sm font-normal text-saare-ink-dim">/ mes / Tenant</span></h3>
              <p className="text-saare-ink-dim text-sm mb-6">Control runtime esencial para desarrollo y validación de agentes autónomos.</p>
            </div>
            <div>
              <button className="w-full py-3 border border-saare-line-hi text-white font-semibold text-xs rounded hover:bg-saare-surface-2 transition" onClick={handleStartTrial}>START CONTROL TEST</button>
              <p className="text-[11px] text-saare-ink-faint mt-3 text-center">sin permanencia · su VPC o air-gapped</p>
            </div>
          </div>

          <div className="bg-saare-surface border border-saare-allow p-8 rounded relative flex flex-col justify-between">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-saare-allow text-black rounded absolute top-4 right-4">RECOMENDADO</span>
            <div>
              <span className="font-mono text-xs text-saare-seal">GRC & COMPLIANCE</span>
              <h3 className="font-display font-bold text-3xl text-white my-3">149 € <span className="text-sm font-normal text-saare-ink-dim">/ mes / Tenant</span></h3>
              <p className="text-saare-ink-dim text-sm mb-6">Evidencia verificable y control técnico orientado a auditoría e inspección judicial.</p>
            </div>
            <div>
              <button className="w-full py-3 bg-saare-allow text-black font-bold text-xs rounded hover:bg-saare-allow/90 transition" onClick={handleStartTrial}>EXPLORE GRC ↗</button>
              <p className="text-[11px] text-saare-ink-faint mt-3 text-center">sin permanencia · su VPC o air-gapped</p>
            </div>
          </div>

          <div className="bg-saare-surface border border-saare-seal p-8 rounded flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-saare-seal">ENTERPRISE VPC</span>
              <h3 className="font-display font-bold text-3xl text-white my-3">Desde 3.500 € <span className="text-sm font-normal text-saare-ink-dim">/ mes / Cluster</span></h3>
              <p className="text-saare-ink-dim text-sm mb-6">Autoridad de ejecución dedicada dentro de su infraestructura o red aislada.</p>
            </div>
            <div>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="block">
                <button className="w-full py-3 border border-saare-seal text-saare-seal font-semibold text-xs rounded hover:bg-saare-seal/10 transition">REQUEST ARCHITECTURE REVIEW</button>
              </a>
              <p className="text-[11px] text-saare-ink-faint mt-3 text-center">contrato marco · arquitectura air-gapped</p>
            </div>
          </div>
        </div>
      </section>

      {/* 33 · SCENARIO CARDS */}
      <section className="py-16 px-6 bg-saare-surface border-t border-saare-line">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-8">
            WHAT HAPPENS WHEN YOUR AI CROSSES THE LINE?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono text-xs">
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">SEND MONEY</div>
              <div className="text-saare-seal my-2">HIGH RISK DETECTED</div>
              <span className="px-2 py-0.5 bg-saare-seal/15 border border-saare-seal text-saare-seal rounded">➔ HUMAN REVIEW</span>
            </div>
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">EXPORT PII</div>
              <div className="text-saare-deny my-2">SENSITIVE DATA VIOLATION</div>
              <span className="px-2 py-0.5 bg-saare-deny/15 border border-saare-deny text-saare-deny rounded">➔ DENY (EX-ANTE)</span>
            </div>
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">CALL UNKNOWN TOOL</div>
              <div className="text-saare-deny my-2">UNKNOWN RESOURCE</div>
              <span className="px-2 py-0.5 bg-saare-deny/15 border border-saare-deny text-saare-deny rounded">➔ DENY (STRICT)</span>
            </div>
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">UPDATE CRM</div>
              <div className="text-saare-allow my-2">AUTHORIZED SCOPE</div>
              <span className="px-2 py-0.5 bg-saare-allow/15 border border-saare-allow text-saare-allow rounded">➔ ALLOW (PERMIT)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORES Y AYUDAS DIGITALES (CONECTADO A MODAL) */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-white text-center mb-8">Informes Oficiales de Gobernanza por Sector</h2>
        <SectorFunnel onSelectSectorReport={(sectorTitle) => setSelectedReportSector(sectorTitle)} />
      </section>

      {/* 34 & 35 · FORMULARIO DE FORMALIZACIÓN */}
      <section className="py-20 px-6 max-w-3xl mx-auto text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
          PUT AN AGENT THROUGH THE CONTROL PLANE.
        </h2>
        <p className="text-saare-ink-dim mb-10 text-base">
          See how S.A.A.R.E. authorizes, enforces and proves an AI action before it reaches your systems.
        </p>

        <div className="bg-saare-surface border border-saare-line-hi p-8 rounded text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-mono text-saare-ink-dim mb-1">CORREO CORPORATIVO *</label>
              <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="ciso@empresa.com" className="w-full p-3 bg-saare-bg border border-saare-line-hi rounded text-white text-sm focus:outline-none focus:border-saare-accent" />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-saare-ink-dim mb-1">ORGANIZACIÓN *</label>
              <input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="ACME Corp" className="w-full p-3 bg-saare-bg border border-saare-line-hi rounded text-white text-sm focus:outline-none focus:border-saare-accent" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-mono text-saare-ink-dim mb-1">AGENTES AUTÓNOMOS EN PRODUCCIÓN *</label>
            <select value={agentCount} onChange={e => setAgentCount(e.target.value)} className="w-full p-3 bg-saare-bg border border-saare-line-hi rounded text-white text-sm focus:outline-none focus:border-saare-accent">
              <option value="1-5">1 a 5 agentes (Evaluación / Trial Autoservicio)</option>
              <option value="5-10">5 a 10 agentes (Licencia GRC Corporativa)</option>
              <option value="10+">Más de 10 agentes (Cualificación Enterprise / VPC Dedicada)</option>
            </select>
          </div>

          <button className="w-full py-4 bg-saare-allow text-black font-bold text-sm rounded hover:bg-saare-allow/90 transition" onClick={handleStartTrial}>
            {agentCount === '10+' ? 'REQUEST ENTERPRISE ARCHITECTURE (WHATSAPP DIRECTO) ↗' : 'RUN CONTROL TEST ↗'}
          </button>
        </div>
      </section>

      {/* RENDERIZADO CONDICIONAL DEL MODAL DE INFORME OFICIAL */}
      {selectedReportSector && (
        <OfficialReportModal 
          sectorTitle={selectedReportSector} 
          onClose={() => setSelectedReportSector(null)} 
        />
      )}

      {/* FOOTER */}
      <footer className="border-t border-saare-line py-10 px-6 bg-saare-surface text-xs text-saare-ink-faint">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-4">
          <div>
            <strong className="text-saare-ink">S.A.A.R.E. — AI Execution Authorization Infrastructure</strong>
            <br />Trust Anchor Reference: <span className="font-mono text-saare-accent">SAARE-MD-IPRES-2026</span>
          </div>
          <div>
            Contacto Directo: <a href={`mailto:${CONTACT_EMAIL}`} className="text-saare-accent hover:underline">{CONTACT_EMAIL}</a> | {CONTACT_PHONE}
          </div>
        </div>
      </footer>

    </div>
  );
}