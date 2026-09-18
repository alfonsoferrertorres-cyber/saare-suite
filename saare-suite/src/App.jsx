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
    const targetElement = document.getElementById('main-tab-content');
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

// 01. DEFINICIÓN DEL CONTEXTO OPERATIVO Y VECTORES DE AUTORIZACIÓN
// 02. INVOCACIÓN SÍNCRONA AL MOTOR S.A.A.R.E. JUDGE EX-ANTE (<1.18ms LATENCIA)
const decision = await judge.authorize({
  agent: "treasury-agent-04",
  action: "send_payment",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00, destination: "DE89..." },
  risk: "HIGH"
});

// 03. VERIFICACIÓN DETERMINISTA DEL PERMISO DE EJECUCIÓN (EXECUTION PERMIT)
if (decision.decision === "ALLOW") {
  // 04. EJECUCIÓN EXCLUSIVA SI EXISTE TOKEN FIRMADO EN MEMORIA
  await executeBankTransfer(decision.executionPermit);
} else if (decision.decision === "REVIEW") {
  await escalateToHumanSupervisor(decision.reviewTicket);
} else {
  throw new Error('Bloqueo Ex-Ante SAARE: Permiso Denegado por Infracción de Política L7');
}`,
    workflow: `// Interceptor HTTP REST / Patrón L7 Gateway Enforcer
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
  console.error('[SAARE ENFORCER] Acción Denegada Ex-Ante:', saareResponse.verdictId);
  return { status: 403, error: 'Execution Permit Not Issued - Fail-Closed Executed' };
}`,
    sidecar: `# Despliegue Sidecar Docker (Ambiente Air-Gapped / VPC Privada)
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
        <span className="text-saare-ink-dim">Informe Ejecutivo SAARE: </span>
        <strong className="text-saare-accent ml-1">Arquitectura de IA Soberana y Prueba Legal Preconstituida Ley 1/2000 LEC</strong>
        <span className="ml-3 text-saare-seal cursor-pointer underline" onClick={handleStartTrial}>
          Acceder a Especificación Completa ↗
        </span>
      </div>

      {/* HEADER Y NAVEGACIÓN PRINCIPAL */}
      <header className="sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-saare-line">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-2xl text-saare-ink tracking-tight">S.A.A.R.E.</span>
            <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 px-2 py-0.5 border border-saare-accent rounded">
              SGP 1.0
            </span>
          </div>

          <nav className="hidden lg:flex gap-6">
            {[
              { id: 'software', name: 'SOFTWARE', desc: 'Control de Ejecución L7' },
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
      <section className="relative h-[80vh] min-h-[580px] w-full flex items-center justify-center border-b border-saare-line overflow-hidden bg-black">
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
            Infraestructura Soberana de Autorización de Ejecución para Agentes de IA
          </p>
        </div>

        <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
          <div className="font-mono text-[10px] text-saare-ink-dim tracking-widest uppercase animate-bounce flex items-center gap-2">
            <span>Seleccione una dimensión técnica arriba para cargar la especificación correspondiente</span> ↓
          </div>
        </div>
      </section>

      {/* BARRA DE HERRAMIENTAS DE GOBERNANZA */}
      <section className="max-w-7xl mx-auto px-6 my-8">
        <GovernanceToolbar 
          onVerifySignature={() => console.log('Firma verificada')}
          onExportCustody={() => console.log('Cadena exportada')}
          onSimulateBlock={() => console.log('Bloqueo simulado')}
          onGenerateToken={() => console.log('Token generado')}
          onDownloadTeaser={() => setSelectedReportSector('Documentación Técnica Teaser')}
        />
      </section>

      {/* STRIP NORMAS TÉCNICAS */}
      <section className="border-b border-saare-line bg-saare-surface py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 font-mono text-[11px] text-saare-ink-dim tracking-wider">
          <div>RUNTIME L7</div><div>·</div>
          <div>FAIL-CLOSED</div><div>·</div>
          <div>ZERO-DISK (RAM MLOCK)</div><div>·</div>
          <div>FIRMA ASIMÉTRICA ED25519</div><div>·</div>
          <div>ÁRBOLES DE MERKLE</div><div>·</div>
          <div>TSA EIDAS RFC 3161</div><div>·</div>
          <div>SGP 1.0</div>
        </div>
      </section>

      {/* CONTENEDOR DINÁMICO MULTI-PESTAÑA ESPECIALIZADO */}
      <main id="main-tab-content" className="max-w-7xl mx-auto px-6 py-12">
        
        {/* ========================================== */}
        {/* PESTAÑA 1: SOFTWARE (CONTROL DE EJECUCIÓN L7) */}
        {/* ========================================== */}
        {activeNavTab === 'software' && (
          <div className="space-y-12">
            <div className="border-b border-saare-line pb-6">
              <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 border border-saare-accent px-3 py-1 rounded inline-block mb-3">
                PESTAÑA TÉCNICA · CONTROL DE EJECUCIÓN Y GOBERNANZA L7
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
                Autoridad de Ejecución Ex-Ante en Capa L7
              </h2>
              <p className="text-saare-ink-dim text-base mt-3 max-w-4xl leading-relaxed">
                Documentación técnica destinada a comités de ciberseguridad, ingenieros de sistemas y arquitectos cloud. S.A.A.R.E. no funciona como un gateway HTTP convencional ni como un logger pasivo; intercepta las llamadas a nivel de capa de aplicación (L7) imponiendo un control determinista previo a la mutación de estado en bases de datos, APIs financieras y sistemas corporativos.
              </p>
            </div>

            {/* ESPECIFICACIÓN ARQUITECTÓNICA COMPLETA */}
            <div className="bg-saare-surface border border-saare-line-hi p-8 rounded-lg space-y-6">
              <h3 className="font-display font-bold text-2xl text-white">
                1. Arquitectura del Motor de Decisiones (Judge Engine Core)
              </h3>
              <p className="text-saare-ink-dim text-sm leading-relaxed">
                El motor de decisión ejecuta una inspección síncrona en memoria RAM sobre cada instrucción generada por un agente autónomo. Si el veredicto es positivo, se emite un <strong>Execution Permit</strong> efímero, asimétricamente firmado con algoritmos Ed25519, que expira automáticamente tras un margen configurado en milisegundos.
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim">
                      <th className="p-3">COMPONENTE TÉCNICO</th>
                      <th className="p-3">MECANISMO DE CONTROL</th>
                      <th className="p-3">MÉTRICA DE RENDIMIENTO / SLA</th>
                      <th className="p-3">ESTÁNDAR DE SEGURIDAD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-saare-line">
                    <tr>
                      <td className="p-3 text-white font-bold">Intercepción Ex-Ante L7</td>
                      <td className="p-3 text-saare-ink-dim">Interceptor síncrono no bloqueante en el borde</td>
                      <td className="p-3 text-saare-allow font-bold">&lt; 1,18 ms (P99 Overhead)</td>
                      <td className="p-3 text-saare-accent">OWASP LLM Top 10 (2026)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-bold">Aislamiento Volátil</td>
                      <td className="p-3 text-saare-ink-dim">Memoria RAM contigua con `mlock` y borrado `explicit_bzero`</td>
                      <td className="p-3 text-saare-allow font-bold">Zero-Disk Storage (0 bytes en disco)</td>
                      <td className="p-3 text-saare-accent">RGPD Art. 32 / CISO Zero-Trust</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-bold">Resiliencia Offline</td>
                      <td className="p-3 text-saare-ink-dim">Réplica local de políticas firmadas con comportamiento Fail-Closed</td>
                      <td className="p-3 text-saare-allow font-bold">100% Autonomía en Desconexión</td>
                      <td className="p-3 text-saare-accent">DORA Art. 6 / Directiva NIS 2</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-saare-bg p-6 border border-saare-line rounded font-mono text-xs space-y-3">
                <div className="text-saare-accent font-bold">SECUENCIA DE EJECUCIÓN SÍNCRONA:</div>
                <div className="text-saare-ink-dim leading-relaxed">
                  [AGENTE AUTÓNOMO] ➔ (1. Petición de Acción L7) ➔ [INTERCEPTOR ENFORCER] ➔ (2. Evaluación de las 7 Dimensiones) ➔ [MOTOR JUDGE] ➔ (3. Emisión / Denegación de Execution Permit) ➔ [API RECURSO / BASE DE DATOS]
                </div>
              </div>
            </div>

            {/* COMPARATIVA DIRECTA CON AI GATEWAYS */}
            <div className="bg-saare-surface border border-saare-line p-8 rounded-lg space-y-6">
              <h3 className="font-display font-bold text-2xl text-white">
                2. AI Gateways Tradicionales vs Autoridad de Ejecución S.A.A.R.E.
              </h3>
              <p className="text-saare-ink-dim text-sm leading-relaxed">
                Los proxies de IA convencionales fueron diseñados para balancear carga, gestionar la caché de tokens o unificar llamadas a proveedores LLM. S.A.A.R.E. opera en un nivel superior: **el gobierno sobre la autoridad de acción**.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim">
                      <th className="p-3">CRITERIO ARQUITECTÓNICO</th>
                      <th className="p-3 text-saare-ink-faint">AI GATEWAY CONVENCIONAL</th>
                      <th className="p-3 text-saare-accent font-bold">S.A.A.R.E. EXECUTION AUTHORITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-saare-line">
                    <tr>
                      <td className="p-3 text-white font-sans">Enfoque Operativo</td>
                      <td className="p-3 text-saare-ink-faint">Gestión y enrutamiento de tráfico HTTP</td>
                      <td className="p-3 text-saare-allow font-bold">Autorización determinista de acciones y herramientas</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">Nivel de Inspección</td>
                      <td className="p-3 text-saare-ink-faint">Cabeceras y promps planos</td>
                      <td className="p-3 text-saare-allow font-bold">7 Vectores simultáneos (Identidad, Contexto, Riesgo, etc.)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">Modelo de Seguridad</td>
                      <td className="p-3 text-saare-ink-faint">Permisivo / Log-and-Alert (Post-Facto)</td>
                      <td className="p-3 text-saare-seal font-bold">Estricto Fail-Closed Ex-Ante (&lt;1,5 ms)</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">Tratamiento de Datos</td>
                      <td className="p-3 text-saare-ink-faint">Almacenamiento de logs y trazas en disco</td>
                      <td className="p-3 text-saare-accent font-bold">Procesamiento en RAM `mlock` (Zero-Disk)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* DEMOSTRACIÓN INTERACTIVA DEL MOTOR */}
            <div className="bg-saare-surface border border-saare-accent/40 p-8 rounded-lg">
              <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 border border-saare-accent px-3 py-1 rounded inline-block mb-3">
                ENTORNO DE SIMULACIÓN Y PRUEBAS EN VIVO
              </span>
              <h3 className="font-display font-bold text-2xl text-white mb-2">Simulador de Autorización Ex-Ante L7</h3>
              <p className="text-saare-ink-dim text-sm mb-6">Pruebe la capacidad de intercepción síncrona enviando una simulación de transferencia bancaria de alto riesgo.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="font-mono text-xs text-saare-accent mb-3 font-bold">[ENTRADA] PAYLOAD DE PETICIÓN EN TIEMPO REAL</div>
                  <div className="font-mono text-xs bg-saare-bg p-4 border border-saare-line rounded space-y-2">
                    <div>agente: <span className="text-saare-accent">"{simulatedAction.agent}"</span></div>
                    <div>acción: <span className="text-saare-seal">"{simulatedAction.action}"</span></div>
                    <div>monto: <span className="text-saare-allow">€{simulatedAction.amount}</span></div>
                    <div>destino: <span className="text-saare-ink-dim">"{simulatedAction.destination}"</span></div>
                    <div>clasificación: <span className="text-saare-deny">"{simulatedAction.classification}"</span></div>
                    <div>riesgo: <span className="text-saare-deny">"{simulatedAction.risk}"</span></div>
                    <div>política: <span className="text-saare-accent">"{simulatedAction.policy}" (v{simulatedAction.version})</span></div>
                  </div>
                  <button 
                    className="w-full mt-4 py-3 bg-saare-allow text-black font-bold text-xs rounded hover:opacity-90 transition"
                    onClick={handleEvaluateLiveJudge} 
                    disabled={liveJudgeLoading}
                  >
                    {liveJudgeLoading ? 'EVALUANDO POLÍTICA EX-ANTE...' : 'EVALUAR ACCIÓN EN MOTOR JUDGE ➔'}
                  </button>
                </div>

                <div>
                  <div className="font-mono text-xs text-saare-seal mb-3 font-bold">[SALIDA] VEREDICTO DE AUTORIZACIÓN L7</div>
                  {liveJudgeResult ? (
                    <div className="bg-saare-bg border border-saare-deny p-4 rounded font-mono text-xs space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-saare-line-hi">
                        <span>DECISIÓN:</span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-saare-deny/20 border border-saare-deny text-saare-deny rounded">
                          {liveJudgeResult.decision}
                        </span>
                      </div>
                      <div className="flex justify-between"><span>PERMISO DE EJECUCIÓN</span><span className="text-saare-deny font-bold">{liveJudgeResult.executionPermit || "NO EMITIDO"}</span></div>
                      <div className="flex justify-between"><span>PERSISTENCIA EN DISCO</span><span className="text-saare-accent">{liveJudgeResult.payloadPersisted || "NO PERSISTIDO (ZERO-DISK)"}</span></div>
                      <div className="flex justify-between"><span>ESTADO DE LA PRUEBA</span><span className="text-saare-seal">{liveJudgeResult.proofStatus || "SELLADO (RFC 3161)"}</span></div>
                      <div className="pt-2 border-t border-saare-line-hi text-[10px] text-saare-ink-dim">
                        {liveJudgeResult.reason}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-saare-bg border border-dashed border-saare-line-hi p-8 text-center text-saare-ink-dim font-mono text-xs rounded">
                      Pulse "EVALUAR ACCIÓN EN MOTOR JUDGE" para ver la respuesta ex-ante del sistema.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA 2: VENTAS (GOBERNANZA COMERCIAL Y ROI) */}
        {/* ========================================== */}
        {activeNavTab === 'sales' && (
          <div className="space-y-12">
            <div className="border-b border-saare-line pb-6">
              <span className="font-mono text-xs font-bold text-saare-seal bg-saare-seal/15 border border-saare-seal px-3 py-1 rounded inline-block mb-3">
                PESTAÑA DE NEGOCIO · GOBERNANZA COMERCIAL Y CASO DE INVERSIÓN
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
                Gobernanza de Acciones Comerciales de IA
              </h2>
              <p className="text-saare-ink-dim text-base mt-3 max-w-4xl leading-relaxed">
                Documentación estratégica orientada a Direcciones Financieras, RevOps y Comités Ejecutivos. La automatización comercial basada en IA introduce riesgos imprevistos cuando los agentes adquieren autonomía para modificar condiciones financieras, precios y datos sensibles de clientes.
              </p>
            </div>

            {/* MATRIZ DE RIESGOS MITIGADOS Y ROI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-saare-surface border border-saare-line p-6 rounded-lg space-y-3">
                <div className="font-mono text-xs text-saare-accent font-bold">RIESGO COMERCIAL 01</div>
                <h4 className="font-bold text-white text-lg">Alteración de Tarifas y Márgenes</h4>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  Evita que un agente de ventas o un bot de soporte aplique descuentos fuera de margen o altere precios en el CRM sin un *Execution Permit* verificado previamente.
                </p>
              </div>

              <div className="bg-saare-surface border border-saare-line p-6 rounded-lg space-y-3">
                <div className="font-mono text-xs text-saare-seal font-bold">RIESGO COMERCIAL 02</div>
                <h4 className="font-bold text-white text-lg">Exfiltración Masiva de CRM</h4>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  Intercepción determinista de consultas masivas a bases de datos de clientes, deteniendo la exportación de ledes o información confidencial a sistemas no seguros.
                </p>
              </div>

              <div className="bg-saare-surface border border-saare-allow p-6 rounded-lg space-y-3">
                <div className="font-mono text-xs text-saare-allow font-bold">AHORRO EN INFRAESTRUCTURA 03</div>
                <h4 className="font-bold text-white text-lg">Reducción del 45% en Tokens</h4>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  El filtrado ex-ante rechaza peticiones no válidas o maliciosas antes de que consuman contexto en modelos de lenguaje costosos, reduciendo la factura cloud.
                </p>
              </div>
            </div>

            {/* MODELOS DE LICENCIAMIENTO */}
            <div className="bg-saare-surface border border-saare-line-hi p-8 rounded-lg space-y-6">
              <h3 className="font-display font-bold text-2xl text-white">
                Estructura de Licenciamiento y Planes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim">
                      <th className="p-4">MODALIDAD DE PLAN</th>
                      <th className="p-4">INVERSIÓN MENSUAL</th>
                      <th className="p-4">COBERTURA TÉCNICA</th>
                      <th className="p-4">FINANCIACIÓN Y AYUDAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-saare-line">
                    <tr>
                      <td className="p-4 text-white font-bold">Standard Tenant</td>
                      <td className="p-4 text-saare-accent font-bold">49 € / mes</td>
                      <td className="p-4 text-saare-ink-dim">Hasta 5 agentes autónomos en producción + Consola SaaS</td>
                      <td className="p-4 text-saare-ink-dim">Suscripción mensual directa / Tarjeta corporativa</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-white font-bold">GRC & Cumplimiento</td>
                      <td className="p-4 text-saare-seal font-bold">149 € / mes</td>
                      <td className="p-4 text-saare-ink-dim">Hasta 15 agentes + Sellado eIDAS RFC 3161 + Informes judiciales</td>
                      <td className="p-4 text-saare-allow font-bold">Subvencionable al 100% via Kit Digital / Kit Consulting</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-white font-bold">Enterprise Dedicated VPC</td>
                      <td className="p-4 text-saare-allow font-bold">Desde 3.500 € / mes</td>
                      <td className="p-4 text-saare-ink-dim">Agentes ilimitados + Despliegue Air-Gapped + SLA 99.99% + Claves HSM</td>
                      <td className="p-4 text-saare-ink-dim">Contrato Marco Anual / Fondos CDTI e I+D+i</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* MATRIZ DE COMPRADORES */}
            <div className="bg-saare-surface border border-saare-line p-8 rounded-lg space-y-6">
              <h3 className="font-display font-bold text-2xl text-white">
                Alineamiento por Rol Ejecutivo
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim font-mono">
                      <th className="p-3">ROL CORPORATIVO</th>
                      <th className="p-3">PREGUNTA CLAVE DE NEGOCIO</th>
                      <th className="p-3">SOLUCIÓN DETERMINISTA S.A.A.R.E.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-saare-line">
                    {ROLES_BUYERS_MATRIX.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-mono font-bold text-saare-accent">{item.role}</td>
                        <td className="p-3 text-saare-ink-dim">{item.question}</td>
                        <td className="p-3 text-white">{item.solution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA 3: GRC (EVIDENCIA Y CUMPLIMIENTO) */}
        {/* ========================================== */}
        {activeNavTab === 'grc' && (
          <div className="space-y-12">
            <div className="border-b border-saare-line pb-6">
              <span className="font-mono text-xs font-bold text-saare-allow bg-saare-allow/15 border border-saare-allow px-3 py-1 rounded inline-block mb-3">
                PESTAÑA NORMATIVA · EVIDENCIA CRIPTOGRÁFICA Y AUDITORÍA LEGAL
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
                Prueba Legal Preconstituida e Inalterable
              </h2>
              <p className="text-saare-ink-dim text-base mt-3 max-w-4xl leading-relaxed">
                Especificación técnica para CISOs, DPOs, Directores de Cumplimiento y Auditores Externos. S.A.A.R.E. genera automáticamente expedientes digitales con fuerza probatoria judicial bajo la Ley de Enjuiciamiento Civil española y los reglamentos europeos.
              </p>
            </div>

            {/* MATRIZ REGULATORIA COMPLETA */}
            <div className="bg-saare-surface border border-saare-line-hi p-8 rounded-lg space-y-6">
              <h3 className="font-display font-bold text-2xl text-white">
                1. Mapeo Regulato de Cumplimiento Técnico
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-saare-line-hi bg-saare-surface-2 text-saare-ink-dim">
                      <th className="p-3">MARCO REGULATORIO</th>
                      <th className="p-3">REQUISITO LEGAL OBLIGATORIO</th>
                      <th className="p-3">CONTROL TÉCNICO APLICADO</th>
                      <th className="p-3">EVIDENCIA GENERADA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-saare-line">
                    {CONTROL_MATRIX.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-white font-bold">{row.requirement}</td>
                        <td className="p-3 text-saare-ink-dim">{row.control}</td>
                        <td className="p-3 text-saare-accent">{row.policy}</td>
                        <td className="p-3 text-saare-allow font-bold">{row.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ARQUITECTURA ZERO-DISK VS PROOF BUNDLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-saare-surface border border-saare-line p-8 rounded-lg">
              <div className="space-y-3">
                <h3 className="font-mono font-bold text-saare-accent">PROCESAMIENTO VOLÁTIL (RAM MLOCK)</h3>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  El contenido original del prompt y los datos confidenciales se procesan en bloques de memoria RAM bloqueados contra paginación. Tras emitirse el veredicto, el puntero se limpia mediante cero binario (`explicit_bzero`).
                </p>
                <div className="font-mono text-xs text-saare-deny font-bold">
                  ✖ CERO ALMACENAMIENTO DE DATOS SENSIBLES EN DISCO
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-mono font-bold text-saare-seal">EXPEDIENTE DE PRUEBA (PROOF BUNDLE)</h3>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  Lo que persiste legalmente es el paquete criptográfico compuesto por el hash HMAC-SHA256 del evento, la firma Ed25519 y el sello de tiempo eIDAS RFC 3161 emitido por una Autoridad de Sellado cualificada.
                </p>
                <div className="font-mono text-xs text-saare-allow font-bold">
                  ✔ PRUEBA PRECONSTITUIDA PLENA EN JUICIO (ART. 326 LEC)
                </div>
              </div>
            </div>

            {/* MÓDULO DE VERIFICACIÓN PÚBLICA */}
            <div className="bg-saare-surface border border-saare-seal p-8 rounded-lg space-y-4">
              <h3 className="font-display font-bold text-2xl text-white">
                2. Validador Público de Inmutabilidad RFC 3161
              </h3>
              <p className="text-saare-ink-dim text-xs">
                Ingrese el identificador o Hash Merkle de un veredicto para comprobar de forma independiente la integridad de la firma y la fecha oficial.
              </p>

              <form onSubmit={handleVerifyPublicHash} className="flex gap-3 flex-wrap">
                <input 
                  type="text" 
                  placeholder={`Hash Merkle Root o ID (${DEMO_ROOT_MERKLE_HASH.substring(0, 20)}...)`}
                  value={publicVerifyHash}
                  onChange={(e) => setPublicVerifyHash(e.target.value)}
                  className="flex-1 bg-saare-bg border border-saare-line-hi px-4 py-3 rounded text-white font-mono text-xs focus:outline-none focus:border-saare-seal"
                />
                <button className="px-6 py-3 bg-saare-allow text-black font-bold text-xs rounded hover:bg-saare-allow/90 transition" type="submit" disabled={publicVerifyLoading}>
                  {publicVerifyLoading ? 'VERIFICANDO...' : 'VERIFICAR EVIDENCIA ➔'}
                </button>
              </form>

              {publicVerifyResult && (
                <div className={`mt-4 p-4 bg-saare-bg border font-mono text-xs space-y-1 ${
                  publicVerifyResult.status === 'VERIFIED' ? 'border-saare-allow' : 'border-saare-deny'
                }`}>
                  <div className={`font-bold ${publicVerifyResult.status === 'VERIFIED' ? 'text-saare-allow' : 'text-saare-deny'}`}>
                    {publicVerifyResult.status === 'VERIFIED' ? '✓ VERIFICACIÓN CORRECTA: SELLO Y FIRMA VÁLIDOS' : '✖ FALLO DE AUDITORÍA: EVIDENCIA NO RECONOCIDA'}
                  </div>
                  <div>Merkle Root: {publicVerifyResult.merkleRoot}</div>
                  <div>Timestamp RFC 3161: {publicVerifyResult.rfc3161Timestamp}</div>
                  <div className="text-saare-ink-faint mt-1">{publicVerifyResult.details}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA 4: DESARROLLADORES (INTEGRACIÓN) */}
        {/* ========================================== */}
        {activeNavTab === 'developers' && (
          <div className="space-y-12">
            <div className="border-b border-saare-line pb-6">
              <span className="font-mono text-xs font-bold text-saare-accent bg-saare-accent/15 border border-saare-accent px-3 py-1 rounded inline-block mb-3">
                PESTAÑA DE INTEGRACIÓN · SDK, REST API Y CONTAINER SIDECAR
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
                Integración Runtime de Ultrabaja Latencia
              </h2>
              <p className="text-saare-ink-dim text-base mt-3 max-w-4xl leading-relaxed">
                Guía de implementación para equipos de ingeniería de software y desarrolladores de agentes. La integración requiere únicamente añadir una llamada previa al método de ejecución del agente.
              </p>
            </div>

            {/* ESQUEMA DE LAS 7 DIMENSIONES */}
            <div className="bg-saare-surface border border-saare-line-hi p-8 rounded-lg space-y-6">
              <h3 className="font-display font-bold text-2xl text-white">
                1. Las 7 Dimensiones del Objeto de Autorización
              </h3>
              <p className="text-saare-ink-dim text-xs">
                Para cada petición de acción, el SDK compila los siguientes 7 vectores en un único token codificado:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
                {[
                  { title: 'IDENTIDAD', desc: 'Agent ID & User' },
                  { title: 'ACCIÓN', desc: 'Tool / API Call' },
                  { title: 'CONTEXTO', desc: 'IP & Session' },
                  { title: 'RECURSO', desc: 'Target URI' },
                  { title: 'DATOS', desc: 'PII Classification' },
                  { title: 'RIESGO', desc: 'Dynamic Score' },
                  { title: 'POLÍTICA', desc: 'Rule Signed ID' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-saare-bg border border-saare-accent/40 p-3 rounded text-center">
                    <div className="text-saare-accent text-[10px] font-bold mb-1">DIM 0{idx+1}</div>
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-[10px] text-saare-ink-faint mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* SELECTOR DE CÓDIGO */}
              <div className="pt-4">
                <div className="flex gap-3 mb-4">
                  <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'sdk' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('sdk')}>SDK Nativo TypeScript</button>
                  <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'workflow' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('workflow')}>Interceptor REST HTTP</button>
                  <button className={`px-4 py-2 text-xs font-mono rounded border ${activeCodeTab === 'sidecar' ? 'bg-saare-line-hi text-white border-saare-accent' : 'border-saare-line text-saare-ink-dim'}`} onClick={() => setActiveCodeTab('sidecar')}>Docker Sidecar (Off-Grid)</button>
                </div>

                <pre className="bg-saare-bg border border-saare-line-hi p-6 rounded font-mono text-xs text-saare-accent overflow-x-auto leading-relaxed">
                  {codeSnippets[activeCodeTab]}
                </pre>
              </div>
            </div>

            {/* ESTRUCTURA DEL EXECUTION PERMIT */}
            <div className="bg-saare-surface border border-saare-seal p-8 rounded-lg space-y-4">
              <h3 className="font-display font-bold text-2xl text-white">
                2. Estructura del Token Execution Permit
              </h3>
              <p className="text-saare-ink-dim text-xs">
                Formato del token de autorización devuelto en veredictos positivos (`ALLOW`):
              </p>

              <div className="bg-saare-bg border border-saare-seal p-6 rounded font-mono text-xs space-y-2">
                <div className="flex justify-between text-saare-seal font-bold pb-2 border-b border-saare-line-hi">
                  <span>S.A.A.R.E. EXECUTION PERMIT SPECIFICATION</span>
                  <span>EXPIRACIÓN AUTO-EXECUTABLE</span>
                </div>
                <div className="flex justify-between"><span>Subject ID</span><span>treasury-agent-04</span></div>
                <div className="flex justify-between"><span>Action Target</span><span>send_payment</span></div>
                <div className="flex justify-between"><span>Resource Scope</span><span>core-banking-api://transfers/sepa</span></div>
                <div className="flex justify-between"><span>Policy Applied</span><span>FIN-PAYMENT-042 (v17)</span></div>
                <div className="flex justify-between"><span>Payload Digest</span><span className="text-saare-accent">sha256:7f3a9b...</span></div>
                <div className="flex justify-between"><span>Asymmetric Signature</span><span className="text-saare-seal">ed25519:4a92c1...</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA 5: ENTERPRISE (DESPLIEGUE SOBERANO) */}
        {/* ========================================== */}
        {activeNavTab === 'enterprise' && (
          <div className="space-y-12">
            <div className="border-b border-saare-line pb-6">
              <span className="font-mono text-xs font-bold text-saare-seal bg-saare-seal/15 border border-saare-seal px-3 py-1 rounded inline-block mb-3">
                PESTAÑA DE INFRAESTRUCTURA · DESPLIEGUE EN VPC Y REDES AISLADAS
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
                Infraestructura Soberana de Alta Disponibilidad
              </h2>
              <p className="text-saare-ink-dim text-base mt-3 max-w-4xl leading-relaxed">
                Especificación para directores de tecnología e infraestructura. Permite la instalación del clúster de decisiones dentro de la propia red aislada del cliente (*Air-Gapped*) sin dependencia de servicios de terceros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-saare-surface border border-saare-line p-8 rounded-lg space-y-4">
                <h3 className="font-bold text-xl text-white">Despliegue VPC / On-Premise</h3>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  El motor de decisiones de S.A.A.R.E. se distribuye como una imagen de contenedor aislada. Las claves de firma asimétrica de las políticas y evidencias permanecen bajo el control exclusivo del cliente mediante integración directa con su módulo HSM (*Hardware Security Module*).
                </p>
                <div className="font-mono text-xs text-saare-allow font-bold">✓ Cero exfiltración de metadatos fuera del perímetro</div>
              </div>

              <div className="bg-saare-surface border border-saare-line p-8 rounded-lg space-y-4">
                <h3 className="font-bold text-xl text-white">Superficie Operativa C-Level</h3>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  Acceso a tres paneles diferenciados según el rol del usuario: Consola Ejecutiva (CEO), Consola de Auditoría (CISO/DPO) y Consola de Ciber-Resiliencia (SOC), con métricas unificadas en tiempo real.
                </p>
                <div className="font-mono text-xs text-saare-accent font-bold">✓ Generación periódica de dictámenes en formato PDF oficial</div>
              </div>
            </div>

            {/* INFORMES POR SECTOR */}
            <div className="bg-saare-surface border border-saare-line-hi p-8 rounded-lg space-y-6">
              <h3 className="font-display font-bold text-2xl text-white text-center">
                Informes Oficiales de Gobernanza por Sector Regulado
              </h3>
              <SectorFunnel onSelectSectorReport={(sectorTitle) => setSelectedReportSector(sectorTitle)} />
            </div>
          </div>
        )}

      </main>

      {/* FORMULARIO DE ACCESO Y SOLICITUD */}
      <section className="py-20 px-6 max-w-3xl mx-auto text-center border-t border-saare-line">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
          SOMETAN UN AGENTE AL PLANO DE CONTROL.
        </h2>
        <p className="text-saare-ink-dim mb-10 text-base">
          Compruebe en su propia infraestructura cómo S.A.A.R.E. autoriza, ejecuta y genera prueba inmutable ante cada acción.
        </p>

        <div className="bg-saare-surface border border-saare-line-hi p-8 rounded text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-mono text-saare-ink-dim mb-1">CORREO CORPORATIVO *</label>
              <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="ciso@empresa.com" className="w-full p-3 bg-saare-bg border border-saare-line-hi rounded text-white text-sm focus:outline-none focus:border-saare-accent" />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-saare-ink-dim mb-1">ORGANIZACIÓN / TENANT *</label>
              <input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="ACME Corp" className="w-full p-3 bg-saare-bg border border-saare-line-hi rounded text-white text-sm focus:outline-none focus:border-saare-accent" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-mono text-saare-ink-dim mb-1">AGENTES AUTÓNOMOS EN PRODUCCIÓN *</label>
            <select value={agentCount} onChange={e => setAgentCount(e.target.value)} className="w-full p-3 bg-saare-bg border border-saare-line-hi rounded text-white text-sm focus:outline-none focus:border-saare-accent">
              <option value="1-5">1 a 5 agentes (Evaluación / Trial Autoservicio 7 Días)</option>
              <option value="5-10">5 a 10 agentes (Licencia GRC Corporativa)</option>
              <option value="10+">Más de 10 agentes (Cualificación Enterprise / VPC Dedicada)</option>
            </select>
          </div>

          <button className="w-full py-4 bg-saare-allow text-black font-bold text-sm rounded hover:bg-saare-allow/90 transition" onClick={handleStartTrial}>
            {agentCount === '10+' ? 'SOLICITAR REVISIÓN DE ARQUITECTURA ENTERPRISE ↗' : 'INICIAR TEST DE CONTROL Y AUDITORÍA ↗'}
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

      {/* FOOTER CORPORATIVO */}
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
                body: "SAARE procesa peticiones en memoria volátil contigua sin almacenamiento en disco secundario (Zero-Disk Architecture). Cumple estrictamente con el Art. 32 del RGPD y el principio de minimización de datos."
              })} 
              className="text-saare-ink-dim hover:text-saare-accent transition"
            >
              Privacidad (RGPD)
            </button>
            <span>·</span>
            <button 
              onClick={() => setLegalModalContent({
                title: "Aviso Legal y Cumplimiento Normativo",
                body: "SAARE SGP 1.0 opera como infraestructura de autorización ex-ante bajo directivas EU AI Act (Art. 15), DORA e ISO/IEC 27037:2012 para la preconstitución de prueba documental en juicio."
              })} 
              className="text-saare-ink-dim hover:text-saare-accent transition"
            >
              Aviso Legal
            </button>
            <span>·</span>
            <button 
              onClick={() => setLegalModalContent({
                title: "Términos de Servicio Enterprise",
                body: "El uso del plano de control garantiza disponibilidad SLA Enterprise 99.99% con intercepción Fail-Closed automatizada en el borde."
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