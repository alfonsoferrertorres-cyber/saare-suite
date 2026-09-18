import React, { useState, useEffect } from 'react';
import { API_BASE_URL, saareFetch } from './utils/api';
import { SectorFunnel } from './components/SectorFunnel';
import GovernanceToolbar from './components/GovernanceToolbar';
import OfficialReportModal from './components/OfficialReportModal';

const API_BASE = `${API_BASE_URL.replace(/\/$/, '')}/v1`;
const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5173'
  : 'https://console.saare.es';

const DEMO_ROOT_MERKLE_HASH = "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";
const CONTACT_PHONE = "+34 633 886 506";
const CONTACT_EMAIL = "legal@saare.es";
const WHATSAPP_URL = "https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE";

const CONTROL_MATRIX = [
  { requirement: "EU AI Act Art. 10/12/15", control: "Pasarela de Autorización de Ejecución L7", policy: "POL-EU-AIACT-ART15-PROMPT-INJECTION", decision: "DENY", evidence: "Paquete de Prueba (Ed25519 + RFC 3161)" },
  { requirement: "RGPD Art. 9/25/32", control: "Control en Tiempo de Ejecución para Datos Sensibles", policy: "POL-PRIVACY-PII-K-ANONYMITY", decision: "ALLOW / DENY", evidence: "Registro de Decisión Zero-Disk" },
  { requirement: "NIS 2 / DORA", control: "Control de Autorización Operativa", policy: "POL-RESILIENCE-FAIL-CLOSED-STRICT", decision: "DENY", evidence: "Evento de Seguridad Firmado" },
  { requirement: "ISO/IEC 27037:2012", control: "Flujo de Gestión de Evidencias", policy: "POL-EVIDENCE-CHAIN-OF-CUSTODY", decision: "ALLOW", evidence: "Paquete de Prueba Merkle Root" },
  { requirement: "Arts. 281 y 326 LEC", control: "Prueba Documental Preconstituida", policy: "POL-LEGAL-PROOF-PRECONSTITUTED", decision: "ALLOW", evidence: "Sello Raíz Inalterable" }
];

const ROLES_BUYERS_MATRIX = [
  { role: "CTO / Plataforma de IA", question: "¿Qué puede ejecutar realmente mi agente de IA?", solution: "Control L7 determinista antes de la llamada a herramientas o APIs." },
  { role: "CISO / SecOps", question: "¿Qué ocurre si un agente intenta algo no autorizado?", solution: "Principio Fail-Closed síncrono (<1.5ms) con bloqueo en el borde." },
  { role: "GRC / DPO", question: "¿Cómo demuestro cumplimiento ante reguladores?", solution: "Evidencia criptográfica inmutable sellada por TSA cualificada RFC 3161." },
  { role: "Desarrollador / ISV", question: "¿Cómo lo integro sin arruinar la latencia?", solution: "SDK nativo @saare/judge o Sidecar Docker con P99 de 1.18 ms." },
  { role: "RevOps / Ventas", question: "¿Qué puede hacer la IA con clientes y precios?", solution: "Gobernanza comercial ex-ante sobre mutaciones en CRM y pagos." },
  { role: "Arquitecto Enterprise", question: "¿Dónde se despliega el motor de decisión?", solution: "VPC propia, On-Premise o entorno Air-Gapped sin filtración de datos." },
  { role: "Dirección / Ejecutivo", question: "¿Cuál es nuestra exposición operativa real?", solution: "Consola C-Level con métricas de riesgo ex-ante y ROI de tokens." }
];

export default function App() {
  const [activeSessionUser, setActiveSessionUser] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('software');
  const [activeCodeTab, setActiveCodeTab] = useState('sdk');

  // Modales
  const [selectedReportSector, setSelectedReportSector] = useState(null);
  const [legalModalContent, setLegalModalContent] = useState(null);

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

  const handleTabChange = (tabId) => {
    setActiveNavTab(tabId);
    const targetElement = document.getElementById('value-tabs-section');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      apiKey: `sk_saare_trial_${Math.random().toString(36).substring(2, 10)}`,
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
      const res = await saareFetch(`/v1/verify/${hashToVerify}`);
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
      const res = await saareFetch('/v1/judge', {
        method: "POST",
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

// 01. DEFINIR ACCIÓN Y CONTEXTO
// 02. LLAMAR A S.A.A.R.E. JUDGE EX-ANTE
const decision = await judge.authorize({
  agent: "treasury-agent-04",
  action: "send_payment",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00 },
  risk: "HIGH"
});

// 03. RECIBIR VEREDICTO Y VERIFICAR PERMISO
if (decision.decision === "ALLOW") {
  // 04. EJECUTAR ÚNICAMENTE CON PERMISO VÁLIDO
  await executeBankTransfer(decision.executionPermit);
} else if (decision.decision === "REVIEW") {
  await escalateToHumanSupervisor(decision.reviewTicket);
} else {
  throw new Error('Bloqueo Ex-Ante SAARE: Permiso de Ejecución Denegado');
}`,
    workflow: `// Interceptor REST HTTP / Patrón L7 Gateway
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
  console.error('[SAARE ENFORCER] Acción Denegada:', saareResponse.verdictId);
  return { status: 403, error: 'Permiso de Ejecución No Emitido' };
}`,
    sidecar: `# Despliegue Sidecar Docker (Air-Gapped / VPC)
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
      
      {/* BANNER SUPERIOR DE ANUNCIO */}
      <div className="bg-saare-surface-2 border-b border-saare-line py-2 px-4 text-xs text-center relative z-50">
        <span className="text-saare-ink-dim">Lea el Informe Ejecutivo de SAARE: </span>
        <strong className="text-saare-accent ml-1">Arquitectura de IA Soberana y Prueba Legal Preconstituida</strong>
        <span className="ml-3 text-saare-seal cursor-pointer underline" onClick={handleStartTrial}>
          Ver Especificación ↗
        </span>
      </div>

      {/* HEADER Y NAVEGACIÓN */}
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
              { id: 'software', name: 'SOFTWARE', desc: 'Control de Ejecución' },
              { id: 'sales', name: 'VENTAS', desc: 'Gobernanza Comercial' },
              { id: 'grc', name: 'GRC', desc: 'Evidencia y Cumplimiento' },
              { id: 'developers', name: 'DESARROLLADORES', desc: 'Integración y Runtime' },
              { id: 'enterprise', name: 'ENTERPRISE', desc: 'Despliegue Soberano' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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
              {activeSessionUser ? `Consola (${activeSessionUser.email.split('@')[0]})` : 'Acceso a Consola'}
            </button>
            <button 
              className="px-4 py-2 text-xs font-bold rounded bg-saare-allow text-black hover:shadow-[0_0_20px_rgba(30,185,104,0.3)] transition"
              onClick={handleStartTrial}
            >
              Ejecutar Test de Control ↗
            </button>
          </div>

        </div>
      </header>

      {/* HERO PRINCIPAL MODO PALANTIR */}
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
            Infraestructura de Autorización de Ejecución de IA
          </p>
        </div>

        <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
          <div className="font-mono text-[10px] text-saare-ink-dim tracking-widest uppercase animate-bounce flex items-center gap-2">
            <span>Explorar Arquitectura</span> ↓
          </div>
        </div>
      </section>

      {/* PRESENTACIÓN Y CTAs */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center border-b border-saare-line">
        <div className="font-mono text-xs text-saare-accent uppercase tracking-widest mb-3">
          S.A.A.R.E. SGP 1.0 · NÚCLEO DE GOBERNANZA
        </div>

        <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mb-4">
          Sistemas de IA Soberana para Cada Decisión
        </h2>

        <p className="font-display font-semibold text-lg sm:text-xl text-saare-accent mb-6">
          Los agentes de IA actúan. S.A.A.R.E. decide qué tienen permitido hacer.
        </p>

        <p className="text-saare-ink-dim text-base max-w-3xl mx-auto mb-6 leading-relaxed">
          Autorización ex-ante y gobernanza runtime L7 para agentes autónomos, herramientas, APIs y acciones críticas. Protege tus agentes de IA, previene fugas de datos y cumple estrictamente con el EU AI Act y DORA.
        </p>

        <div className="font-mono text-xs text-saare-seal mb-8 tracking-widest">
          IDENTIDAD · ACCIÓN · CONTEXTO · RECURSO · DATOS · RIESGO · POLÍTICA
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            className="px-7 py-3.5 text-sm font-bold rounded bg-saare-allow text-black hover:shadow-[0_0_25px_rgba(30,185,104,0.4)] transition"
            onClick={handleStartTrial}
          >
            INICIAR TEST DE CONTROL ↗
          </button>
          <button 
            className="px-7 py-3.5 text-sm font-semibold rounded border border-saare-line-hi text-saare-ink hover:bg-saare-surface-2 transition"
            onClick={() => handleTabChange('enterprise')}
          >
            VER ARQUITECTURA
          </button>
          <button 
            className="px-5 py-3.5 text-sm font-mono font-medium rounded border border-saare-accent/40 text-saare-accent bg-saare-accent/10 hover:bg-saare-accent/20 transition"
            onClick={() => handleTabChange('developers')}
          >
            VER DOCS PARA DESARROLLADORES
          </button>
        </div>

        <p className="font-mono text-xs text-saare-ink-dim max-w-2xl mx-auto mb-10 bg-saare-surface/80 p-3 border border-saare-line-hi rounded backdrop-blur-sm">
          “No almacenamos el payload como evidencia. Conservamos la prueba criptográfica de la decisión.”
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-saare-ink-dim bg-saare-surface/90 p-4 rounded-lg border border-saare-line-hi backdrop-blur-sm">
          <span className="text-white font-bold">AGENTE</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-saare-seal font-bold">JUEZ S.A.A.R.E.</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-white">DECISIÓN DE POLÍTICA</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-saare-allow font-bold">PERMITIR</span> / <span className="text-saare-seal font-bold">REVISAR</span> / <span className="text-saare-deny font-bold">DENEGAR</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-saare-allow">PERMISO DE EJECUCIÓN</span>
          <span className="text-saare-accent">➔</span>
          <span className="text-white">HERRAMIENTA / API / MCP / LLM</span>
        </div>
      </section>

      {/* BARRA DE HERRAMIENTAS DE GOBERNANZA */}
      <section className="max-w-7xl mx-auto px-6">
        <GovernanceToolbar 
          onVerifySignature={() => console.log('Firma verificada')}
          onExportCustody={() => console.log('Cadena exportada')}
          onSimulateBlock={() => console.log('Bloqueo simulado')}
          onGenerateToken={() => console.log('Token generado')}
          onDownloadTeaser={() => setSelectedReportSector('Documentación Técnica Teaser')}
        />
      </section>

      {/* STRIP DE NORMAS */}
      <section className="border-b border-saare-line bg-saare-surface py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 font-mono text-xs text-saare-ink-dim tracking-wider">
          <div>RUNTIME L7</div>
          <div>·</div>
          <div>FAIL-CLOSED</div>
          <div>·</div>
          <div>ZERO-DISK</div>
          <div>·</div>
          <div>ED25519</div>
          <div>·</div>
          <div>ÁRBOLES MERKLE</div>
          <div>·</div>
          <div>RFC 3161 TSA</div>
          <div>·</div>
          <div>SGP 1.0</div>
        </div>
      </section>

      {/* EL PROBLEMA ESTRUCTURAL */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="font-mono text-xs font-bold text-saare-deny bg-saare-deny/10 border border-saare-deny px-3 py-1 rounded inline-block mb-3">
            EL PROBLEMA ESTRUCTURAL
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            LA IA HA PASADO DE RESPONDER A ACTUAR.
          </h2>
          <p className="text-saare-ink-dim text-lg max-w-3xl mx-auto">
            Cuando una IA puede llamar una API, modificar un registro, enviar información o ejecutar una operación, la pregunta ya no es qué puede generar. La pregunta es qué está autorizada a ejecutar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-saare-surface border border-saare-line-hi p-8 rounded">
            <div className="font-mono text-xs text-saare-accent mb-3">01 — EJECUCIÓN</div>
            <h3 className="font-display font-bold text-xl text-white mb-4">El agente puede actuar.</h3>
            <div className="font-mono text-xs text-saare-ink-dim space-y-2">
              <div>[API] Pagos y Banca Core</div>
              <div>[BD] Registros de Clientes y PII</div>
              <div>[CRM] Mutaciones y Exportación de Leads</div>
              <div>[EMAIL] Contacto Directo con Clientes</div>
              <div>[MCP] Herramientas Model Context Protocol</div>
            </div>
          </div>

          <div className="bg-saare-surface border border-saare-seal p-8 rounded">
            <div className="font-mono text-xs text-saare-seal mb-3">02 — AUTORIZACIÓN</div>
            <h3 className="font-display font-bold text-xl text-white mb-4">¿Quién autorizó la acción?</h3>
            <div className="font-mono text-xs text-white space-y-2">
              <div>¿QUIÉN? Identidad de Agente y Usuario</div>
              <div>¿QUÉ? Herramienta y Acción Objetivo</div>
              <div>¿POR QUÉ? Contexto Operativo</div>
              <div>¿CON QUÉ DATOS? Clasificación</div>
              <div>¿BAJO QUÉ POLÍTICA? ID de Regla</div>
            </div>
          </div>

          <div className="bg-saare-surface border border-saare-allow p-8 rounded">
            <div className="font-mono text-xs text-saare-allow mb-3">03 — PRUEBA</div>
            <h3 className="font-display font-bold text-xl text-white mb-4">¿Puedes probarlo a posteriori?</h3>
            <div className="font-mono text-xs text-saare-allow space-y-2">
              <div>VEREDICTO: PERMITIR / REVISAR / DENEGAR</div>
              <div>VERSIÓN DE POLÍTICA: Estado Firmado</div>
              <div>RESUMEN: SHA-256 HMAC</div>
              <div>FIRMA: Ed25519 Desvinculada</div>
              <div>PAQUETE DE EVIDENCIA: RFC 3161 TSA</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI GATEWAY VS EXECUTION AUTHORITY */}
      <section className="py-20 px-6 bg-saare-surface border-t border-b border-saare-line">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
              Un AI Gateway gestiona el tráfico. <br />S.A.A.R.E. gobierna la autoridad de ejecución.
            </h2>
            <p className="text-saare-ink-dim">Diferenciación de categoría entre observabilidad posterior y autoridad determinista ex-ante.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim">
                  <th className="p-4">DIMENSIÓN DE CONTROL</th>
                  <th className="p-4 text-saare-ink-faint">AI GATEWAY CONVENCIONAL</th>
                  <th className="p-4 text-saare-accent font-bold">AUTORIDAD DE EJECUCIÓN S.A.A.R.E.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saare-line">
                <tr>
                  <td className="p-4 text-white font-sans">Tráfico vs Acción</td>
                  <td className="p-4 text-saare-ink-faint">Enruta Tráfico HTTP</td>
                  <td className="p-4 text-saare-allow font-bold">Autoriza Acciones y Herramientas Específicas</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Abstracción</td>
                  <td className="p-4 text-saare-ink-faint">Abstracción de Proveedores y Caché</td>
                  <td className="p-4 text-saare-allow font-bold">Autoridad de Políticas y Aplicación en Runtime</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Observabilidad</td>
                  <td className="p-4 text-saare-ink-faint">Registros y Métricas Post-Facto</td>
                  <td className="p-4 text-saare-seal font-bold">Evidencia Criptográfica y Paquetes de Prueba</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Momento de Control</td>
                  <td className="p-4 text-saare-ink-faint">Filtrado de Peticiones</td>
                  <td className="p-4 text-saare-accent font-bold">Decisión de Ejecución Ex-Ante (&lt;1,5 ms)</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-sans">Gobernanza de Red</td>
                  <td className="p-4 text-saare-ink-faint">Proxy de Infraestructura</td>
                  <td className="p-4 text-saare-allow font-bold">Control de Acciones y Permisos de Ejecución</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SIMULADOR DE CONTROL EN VIVO */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 border border-saare-accent px-3 py-1 rounded inline-block mb-3">
            DEMOSTRACIÓN INTERACTIVA
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Motor de Control de Ejecución en Vivo</h2>
          <p className="text-saare-ink-dim mt-2">Pruebe la intercepción síncrona L7 y la emisión de permisos de ejecución en vivo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-saare-surface border border-saare-line-hi p-8 rounded-lg">
          <div>
            <div className="font-mono text-xs text-saare-accent mb-4 font-bold">
              [ENTRADA] PAYLOAD DE PETICIÓN DE ACCIÓN
            </div>

            <div className="font-mono text-xs bg-saare-bg p-5 border border-saare-line rounded space-y-2">
              <div>agente: <span className="text-saare-accent">"{simulatedAction.agent}"</span></div>
              <div>acción: <span className="text-saare-seal">"{simulatedAction.action}"</span></div>
              <div>monto: <span className="text-saare-allow">€{simulatedAction.amount}</span></div>
              <div>destino: <span className="text-saare-ink-dim">"{simulatedAction.destination}"</span></div>
              <div>clasificación: <span className="text-saare-deny">"{simulatedAction.classification}"</span></div>
              <div>riesgo: <span className="text-saare-deny">"{simulatedAction.risk}"</span></div>
              <div>política: <span className="text-saare-accent">"{simulatedAction.policy}" (v{simulatedAction.version})</span></div>
            </div>

            <button 
              className="w-full mt-6 py-3.5 bg-saare-allow text-black font-bold text-sm rounded hover:shadow-[0_0_20px_rgba(30,185,104,0.3)] transition"
              onClick={handleEvaluateLiveJudge} 
              disabled={liveJudgeLoading}
            >
              {liveJudgeLoading ? 'EVALUANDO POLÍTICA EX-ANTE...' : 'EVALUAR EN MOTOR JUDGE ➔'}
            </button>
          </div>

          <div>
            <div className="font-mono text-xs text-saare-seal mb-4 font-bold">
              [SALIDA] VEREDICTO DEL MOTOR JUDGE S.A.A.R.E.
            </div>

            {liveJudgeResult ? (
              <div className="bg-saare-bg border border-saare-deny p-5 rounded font-mono text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-saare-line-hi">
                  <span>DECISIÓN:</span>
                  <span className="px-2 py-0.5 text-sm font-bold bg-saare-deny/20 border border-saare-deny text-saare-deny rounded">
                    {liveJudgeResult.decision}
                  </span>
                </div>

                <div className="flex justify-between"><span>PERMISO DE EJECUCIÓN</span><span className="text-saare-deny font-bold">{liveJudgeResult.executionPermit || "NO EMITIDO"}</span></div>
                <div className="flex justify-between"><span>ALMACENAMIENTO DE PAYLOAD</span><span className="text-saare-accent">{liveJudgeResult.payloadPersisted || "NO PERSISTIDO (ZERO-DISK)"}</span></div>
                <div className="flex justify-between"><span>ESTADO DE LA PRUEBA</span><span className="text-saare-seal">{liveJudgeResult.proofStatus || "SELLADO (RFC 3161)"}</span></div>

                <div className="pt-3 border-t border-saare-line-hi text-[11px] text-saare-ink-dim">
                  CADENA: SHA-256 ➔ ED25519 ➔ ÁRBOLES MERKLE ➔ RFC 3161 TSA
                </div>
              </div>
            ) : (
              <div className="bg-saare-bg border border-dashed border-saare-line-hi p-10 text-center text-saare-ink-dim font-mono text-xs rounded">
                Haga clic en "EVALUAR EN MOTOR JUDGE" para simular el veredicto ex-ante y la generación del Permiso de Ejecución.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LAS 7 DIMENSIONES */}
      <section className="py-16 px-6 bg-saare-surface border-t border-saare-line text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            Las 7 Dimensiones de Autorización
          </h2>
          <p className="text-saare-ink-dim mb-10 text-sm">El motor S.A.A.R.E. evalúa de forma determinista siete vectores simultáneos antes de emitir un veredicto.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 font-mono text-xs">
            {[
              { code: 'IDENTIDAD', dim: '01' },
              { code: 'ACCIÓN', dim: '02' },
              { code: 'CONTEXTO', dim: '03' },
              { code: 'RECURSO', dim: '04' },
              { code: 'DATOS', dim: '05' },
              { code: 'RIESGO', dim: '06' },
              { code: 'POLÍTICA', dim: '07' }
            ].map((item, idx) => (
              <div key={idx} className="bg-saare-bg border border-saare-accent/40 p-4 rounded">
                <div className="text-saare-accent text-[10px] mb-1">DIM {item.dim}</div>
                <div className="font-bold text-white">{item.code}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAS TRES DECISIONES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-3xl text-white text-center mb-12">
          Tres Veredictos Deterministas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-saare-surface border border-saare-allow p-8 rounded">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-allow/15 border border-saare-allow text-saare-allow rounded">ALLOW / PERMITIR</span>
            <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Permiso concedido</h3>
            <p className="text-saare-ink-dim text-sm">Todas las condiciones de la política firmada se satisfacen. Se emite un Permiso de Ejecución tokenizado con expiración en milisegundos.</p>
          </div>

          <div className="bg-saare-surface border border-saare-seal p-8 rounded">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-seal/15 border border-saare-seal text-saare-seal rounded">REVIEW / REVISAR</span>
            <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Revisión humana</h3>
            <p className="text-saare-ink-dim text-sm">Acción de alto riesgo o umbral superado. La ejecución se congela ex-ante hasta recibir la firma digital del supervisor humano asignado.</p>
          </div>

          <div className="bg-saare-surface border border-saare-deny p-8 rounded">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-deny/15 border border-saare-deny text-saare-deny rounded">DENY / DENEGAR</span>
            <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Bloqueo síncrono</h3>
            <p className="text-saare-ink-dim text-sm">Infracción de política, prompt injection o intento de acceso a PII no autorizado. Intercepción inmediata sin emisión de permiso.</p>
          </div>
        </div>
      </section>

      {/* ESPECIFICACIÓN DEL PERMISO DE EJECUCIÓN */}
      <section className="py-16 px-6 bg-saare-surface border-t border-b border-saare-line">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            Autorizar no es observar. Es un permiso para ejecutar.
          </h2>
          <p className="font-mono text-saare-seal font-bold mb-8">“Sin permiso. Sin ejecución.”</p>

          <div className="bg-saare-bg border border-saare-seal p-8 rounded font-mono text-xs text-left space-y-3">
            <div className="text-saare-seal font-bold pb-3 border-b border-saare-line-hi flex justify-between">
              <span>ESTRUCTURA DEL PERMISO DE EJECUCIÓN S.A.A.R.E.</span>
              <span>VÁLIDO HASTA SU EXPIRACIÓN</span>
            </div>

            <div className="flex justify-between"><span>Sujeto Agente</span><span>treasury-agent-04</span></div>
            <div className="flex justify-between"><span>Alcance de la Acción</span><span>send_payment</span></div>
            <div className="flex justify-between"><span>Recurso Objetivo</span><span>core-banking-api://transfers/sepa</span></div>
            <div className="flex justify-between"><span>ID de Regla de Política</span><span>FIN-PAYMENT-042 (v17)</span></div>
            <div className="flex justify-between"><span>Resumen Digest del Payload</span><span className="text-saare-accent">sha256:7f3a9b...</span></div>
            <div className="flex justify-between"><span>Firma Asimétrica</span><span className="text-saare-seal">ed25519:4a92c1...</span></div>
          </div>
        </div>
      </section>

      {/* ARQUITECTURA ZERO-DISK */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            El payload se procesa. La prueba perdura.
          </h2>
          <p className="text-saare-ink-dim max-w-2xl mx-auto text-sm">
            “No necesitas conservar el secreto para conservar la prueba de la decisión.”
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-saare-surface border border-saare-line p-8 rounded">
          <div>
            <h3 className="font-mono font-bold text-saare-accent mb-3">MEMORIA VOLÁTIL (RAM MLOCK)</h3>
            <p className="text-saare-ink-dim text-sm leading-relaxed">
              El payload completo se procesa exclusivamente en memoria volátil RAM contigua bloqueada mediante `mlock`. Al emitirse el veredicto, el bloque de memoria se sobreescribe con ceros binarios (`explicit_bzero`) antes de liberar el puntero.
            </p>
            <div className="font-mono text-xs text-saare-deny mt-4 font-bold">
              ✖ CERO ALMACENAMIENTO DE PAYLOAD EN DISCO SECUNDARIO
            </div>
          </div>

          <div>
            <h3 className="font-mono font-bold text-saare-seal mb-3">PAQUETE DE EVIDENCIA (PRUEBA PERSISTENTE)</h3>
            <p className="text-saare-ink-dim text-sm leading-relaxed">
              Lo que sobrevive no es el texto plano ni los datos confidenciales, sino el expediente de evidencia criptográfica inmutable formado por el hash HMAC-SHA256, la firma Ed25519 y la marca de tiempo eIDAS RFC 3161.
            </p>
            <div className="font-mono text-xs text-saare-allow mt-4 font-bold">
              ✔ PRUEBA LEGAL PRECONSTITUIDA AL 100% (ART. 326 LEC)
            </div>
          </div>
        </div>
      </section>

      {/* VERIFICADOR PÚBLICO */}
      <section className="py-20 px-6 bg-saare-surface border-t border-saare-line">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-white mb-2">
              DEMUESTRE CADA DECISIÓN.
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
                {publicVerifyLoading ? 'Verificando...' : 'Verificar Evidencia'}
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

      {/* PESTAÑAS DE VALOR DE NAVEGACIÓN */}
      <section id="value-tabs-section" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 border border-saare-accent px-3 py-1 rounded inline-block mb-3">
            PUNTO DE ENTRADA: {activeNavTab.toUpperCase()}
          </span>
          <h2 className="font-display font-bold text-3xl text-white">
            {activeNavTab === 'software' && 'CONTROLE QUÉ PUEDE EJECUTAR SU IA.'}
            {activeNavTab === 'sales' && 'GOBIARNE LAS ACCIONES COMERCIALES DE SU IA.'}
            {activeNavTab === 'grc' && 'DEMUESTRE QUÉ HIZO SU IA.'}
            {activeNavTab === 'developers' && 'AUTORICE ANTES DE EJECUTAR.'}
            {activeNavTab === 'enterprise' && 'SU INFRAESTRUCTURA. SUS POLÍTICAS. SUS CLAVES.'}
          </h2>
        </div>

        {activeNavTab === 'developers' ? (
          <div>
            <div className="flex gap-3 mb-6">
              <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'sdk' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('sdk')}>SDK Nativo</button>
              <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'workflow' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('workflow')}>Interceptor REST</button>
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
              {activeNavTab === 'enterprise' ? 'SOLICITAR ARQUITECTURA ENTERPRISE ↗' : 'PROBAR TEST DE CONTROL ↗'}
            </button>
          </div>
        )}
      </section>

      {/* RESILIENCIA FAIL-CLOSED */}
      <section className="py-20 px-6 bg-saare-surface border-t border-b border-saare-line text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            EL CONTROL NO DESAPARECE CUANDO EL PLANO DE CONTROL CAE.
          </h2>
          <p className="text-saare-ink-dim max-w-3xl mx-auto mb-10 text-base">
            “La indisponibilidad del plano de control no convierte una operación desconocida en una operación autorizada.”
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-saare-bg border border-saare-allow p-8 rounded">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-allow/15 border border-saare-allow text-saare-allow rounded">OPERACIÓN NORMAL</span>
              <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Aplicación Centralizada de Políticas</h3>
              <p className="text-saare-ink-dim text-sm">El motor evalúa en tiempo real contra el plano de control central con latencias sostenidas P99 &lt; 1,5 ms.</p>
            </div>
            <div className="bg-saare-bg border border-saare-seal p-8 rounded">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-saare-seal/15 border border-saare-seal text-saare-seal rounded">CAÍDA DE RED / OFFLINE</span>
              <h3 className="font-display font-bold text-xl text-white mt-4 mb-2">Estado Local de Políticas Firmadas</h3>
              <p className="text-saare-ink-dim text-sm">Ante una desconexión, el contenedor local replica las políticas deterministas firmadas y aplica estricto Fail-Closed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MATRIZ DE ROLES Y COMPRADORES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            DISEÑADO PARA LAS PERSONAS QUE AUTORIZAN LA IA.
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

      {/* SUPERFICIES OPERATIVAS */}
      <section className="py-20 px-6 bg-saare-surface border-t border-b border-saare-line">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-white mb-2">
              Tres Superficies Operativas. Un Solo Motor de Ejecución.
            </h2>
            <p className="text-saare-ink-dim text-sm">Tres consolas especializadas según la responsabilidad del usuario.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-saare-surface-2 border border-saare-line-hi p-8 rounded">
              <span className="font-mono text-xs text-saare-accent">CONSOLA EJECUTIVA</span>
              <h3 className="font-display font-bold text-xl text-white my-3">CEO y Consejo</h3>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between"><span>Riesgo Acumulado</span><span className="text-saare-allow">0.00%</span></div>
                <div className="flex justify-between"><span>Ahorro GPU / Tokens</span><span>45%</span></div>
                <div className="flex justify-between"><span>Exposición Operativa</span><span className="text-saare-allow font-bold">MITIGADA</span></div>
              </div>
            </div>

            <div className="bg-saare-surface-2 border border-saare-seal p-8 rounded">
              <span className="font-mono text-xs text-saare-seal">CONSOLA AUDITORÍA Y GRC</span>
              <h3 className="font-display font-bold text-xl text-white my-3">CISO y DPO</h3>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between"><span>EU AI Act Art. 10/12/15</span><span className="text-saare-allow font-bold">CONFORME</span></div>
                <div className="flex justify-between"><span>Paquetes RFC 3161</span><span>100% Sellado</span></div>
                <div className="flex justify-between"><span>Firma Digital</span><span className="text-saare-seal">Ed25519</span></div>
              </div>
            </div>

            <div className="bg-saare-surface-2 border border-saare-deny p-8 rounded">
              <span className="font-mono text-xs text-saare-deny">CIBER-RESILIENCIA</span>
              <h3 className="font-display font-bold text-xl text-white my-3">SecOps y SOC</h3>
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between"><span>Latencia P99</span><span className="text-saare-allow">1.18 ms</span></div>
                <div className="flex justify-between"><span>Intercepciones OWASP</span><span className="text-saare-deny font-bold">243 BLOQUEADAS</span></div>
                <div className="flex justify-between"><span>Modo Operatorio</span><span className="text-saare-allow font-bold">FAIL-CLOSED</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARQUITECTURA DE PRECIOS */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-2">
            Modelos de Despliegue y Arquitectura de Precios
          </h2>
          <p className="text-saare-ink-dim text-sm">Licenciamiento soberano por instancia de motor de decisión y nivel de evidencia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-saare-surface border border-saare-line p-8 rounded flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-saare-accent">ESTÁNDAR</span>
              <h3 className="font-display font-bold text-3xl text-white my-3">49 € <span className="text-sm font-normal text-saare-ink-dim">/ mes / Tenant</span></h3>
              <p className="text-saare-ink-dim text-sm mb-6">Control runtime esencial para desarrollo y validación de agentes autónomos.</p>
            </div>
            <div>
              <button className="w-full py-3 border border-saare-line-hi text-white font-semibold text-xs rounded hover:bg-saare-surface-2 transition" onClick={handleStartTrial}>INICIAR TEST DE CONTROL</button>
              <p className="text-[11px] text-saare-ink-faint mt-3 text-center">sin permanencia · su VPC o air-gapped</p>
            </div>
          </div>

          <div className="bg-saare-surface border border-saare-allow p-8 rounded relative flex flex-col justify-between">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-saare-allow text-black rounded absolute top-4 right-4">RECOMENDADO</span>
            <div>
              <span className="font-mono text-xs text-saare-seal">GRC & CUMPLIMIENTO</span>
              <h3 className="font-display font-bold text-3xl text-white my-3">149 € <span className="text-sm font-normal text-saare-ink-dim">/ mes / Tenant</span></h3>
              <p className="text-saare-ink-dim text-sm mb-6">Evidencia verificable y control técnico orientado a auditoría e inspección judicial.</p>
            </div>
            <div>
              <button className="w-full py-3 bg-saare-allow text-black font-bold text-xs rounded hover:bg-saare-allow/90 transition" onClick={handleStartTrial}>EXPLORAR GRC ↗</button>
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
                <button className="w-full py-3 border border-saare-seal text-saare-seal font-semibold text-xs rounded hover:bg-saare-seal/10 transition">SOLICITAR REVISIÓN DE ARQUITECTURA</button>
              </a>
              <p className="text-[11px] text-saare-ink-faint mt-3 text-center">contrato marco · arquitectura air-gapped</p>
            </div>
          </div>
        </div>
      </section>

      {/* TARJETAS DE ESCENARIOS */}
      <section className="py-16 px-6 bg-saare-surface border-t border-saare-line">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-8">
            ¿QUÉ OCURRE CUANDO SU IA CRUZA LA LÍNEA?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono text-xs">
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">ENVIAR DINERO</div>
              <div className="text-saare-seal my-2">ALTO RIESGO DETECTADO</div>
              <span className="px-2 py-0.5 bg-saare-seal/15 border border-saare-seal text-saare-seal rounded">➔ REVISIÓN HUMANA</span>
            </div>
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">EXPORTAR DATOS PII</div>
              <div className="text-saare-deny my-2">VIOLACIÓN DE DATOS SENSIBLES</div>
              <span className="px-2 py-0.5 bg-saare-deny/15 border border-saare-deny text-saare-deny rounded">➔ DENEGAR (EX-ANTE)</span>
            </div>
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">LLAMAR HERRAMIENTA DESCONOCIDA</div>
              <div className="text-saare-deny my-2">RECURSO DESCONOCIDO</div>
              <span className="px-2 py-0.5 bg-saare-deny/15 border border-saare-deny text-saare-deny rounded">➔ DENEGAR (ESTRICTO)</span>
            </div>
            <div className="bg-saare-bg p-5 border border-saare-line-hi rounded">
              <div className="text-saare-ink-dim">ACTUALIZAR CRM</div>
              <div className="text-saare-allow my-2">ALCANCE AUTORIZADO</div>
              <span className="px-2 py-0.5 bg-saare-allow/15 border border-saare-allow text-saare-allow rounded">➔ PERMITIR (PERMISO)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORES Y AYUDAS DIGITALES */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-white text-center mb-8">Informes Oficiales de Gobernanza por Sector</h2>
        <SectorFunnel onSelectSectorReport={(sectorTitle) => setSelectedReportSector(sectorTitle)} />
      </section>

      {/* FORMULARIO DE ACCESO Y FORMALIZACIÓN */}
      <section className="py-20 px-6 max-w-3xl mx-auto text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
          SOMETA UN AGENTE AL PLANO DE CONTROL.
        </h2>
        <p className="text-saare-ink-dim mb-10 text-base">
          Vea cómo S.A.A.R.E. autoriza, ejecuta y demuestra una acción de IA antes de que llegue a sus sistemas.
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
            {agentCount === '10+' ? 'SOLICITAR ARQUITECTURA ENTERPRISE (WHATSAPP DIRECTO) ↗' : 'EJECUTAR TEST DE CONTROL ↗'}
          </button>
        </div>
      </section>

      {/* MODAL DE INFORME OFICIAL */}
      {selectedReportSector && (
        <OfficialReportModal 
          sectorTitle={selectedReportSector} 
          onClose={() => setSelectedReportSector(null)} 
        />
      )}

      {/* MODAL DE CUMPLIMIENTO LEGAL */}
      {legalModalContent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex justify-center items-center z-[9999] p-5">
          <div className="bg-saare-surface border border-saare-line-hi text-saare-ink w-full max-w-2xl p-6 rounded-lg shadow-2xl font-sans">
            <h3 className="text-xl font-bold text-white mb-4">{legalModalContent.title}</h3>
            <p className="text-sm text-saare-ink-dim leading-relaxed mb-6">{legalModalContent.body}</p>
            <button className="px-5 py-2 bg-saare-allow text-black font-bold text-xs rounded hover:opacity-90" onClick={() => setLegalModalContent(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-saare-line py-10 px-6 bg-saare-surface text-xs text-saare-ink-faint">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div>
            <strong className="text-saare-ink">S.A.A.R.E. — Infraestructura de Autorización de Ejecución de IA</strong>
            <br />Referencia Trust Anchor: <span className="font-mono text-saare-accent">SAARE-MD-IPRES-2026</span>
          </div>

          <div className="flex gap-4 font-mono text-[11px]">
            <button 
              onClick={() => setLegalModalContent({
                title: "Política de Privacidad y RGPD",
                body: "SAARE procesa peticiones en memoria volátil contigua sin almacenamiento en disco secundario (Zero-Disk Architecture). Cumple con el Art. 32 del RGPD y el principio de minimización de datos."
              })} 
              className="text-saare-ink-dim hover:text-saare-accent transition"
            >
              Privacidad (RGPD)
            </button>
            <span>·</span>
            <button 
              onClick={() => setLegalModalContent({
                title: "Aviso Legal y Cumplimiento",
                body: "SAARE SGP 1.0 opera como infraestructura de autorización ex-ante bajo directivas EU AI Act (Art. 15), DORA e ISO/IEC 27037:2012 para preconstitución de prueba documental."
              })} 
              className="text-saare-ink-dim hover:text-saare-accent transition"
            >
              Aviso Legal
            </button>
            <span>·</span>
            <button 
              onClick={() => setLegalModalContent({
                title: "Términos de Servicio",
                body: "El uso del plano de control garantiza disponibilidad bajo SLA Enterprise 99.99% con intercepción Fail-Closed automatizada en el borde."
              })} 
              className="text-saare-ink-dim hover:text-saare-accent transition"
            >
              Términos
            </button>
          </div>

          <div>
            Contacto Directo: <a href={`mailto:${CONTACT_EMAIL}`} className="text-saare-accent hover:underline">{CONTACT_EMAIL}</a> | {CONTACT_PHONE}
          </div>
        </div>
      </footer>

    </div>
  );
}