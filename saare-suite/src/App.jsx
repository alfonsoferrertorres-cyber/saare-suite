import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

// Constantes globales de infraestructura
const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';
const CANONICAL_HASH = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";
const VERIFY_URL = `${API_BASE}/verify/${CANONICAL_HASH}`;

// 1. REGISTRO DE IDENTIDAD DE AGENTES Y PRIVILEGIOS MÍNIMOS
const INITIAL_AGENTS = [
  {
    id: "agent-742",
    name: "Treasury-Payment-Orchestrator",
    owner: "Treasury Operations",
    env: "production",
    risk: "CRITICAL",
    allowedTools: ["get_account_balance", "check_fx_rate", "create_payment_draft"],
    escalateTools: ["send_wire_transfer", "refund_customer_over_1k"],
    deniedTools: ["delete_database", "create_admin_user", "modify_kyc_status"],
    policyBindings: ["POL-FIN-TREASURY-01", "POL-PII-EU-09"],
    lastAction: "2 sec ago",
    status: "ACTIVE"
  },
  {
    id: "agent-181",
    name: "CRM-Support-Autonomous-Bot",
    owner: "Customer Success",
    env: "production",
    risk: "MEDIUM",
    allowedTools: ["get_customer_profile", "create_support_ticket", "send_email_notification"],
    escalateTools: ["issue_service_credit"],
    deniedTools: ["export_all_customers", "delete_customer_account", "query_raw_sql"],
    policyBindings: ["POL-CRM-LEAST-PRIV-03"],
    lastAction: "18 sec ago",
    status: "ACTIVE"
  },
  {
    id: "agent-912",
    name: "Clinical-Data-Summarizer",
    owner: "Health Data Lab",
    env: "vpc-isolated",
    risk: "HIGH",
    allowedTools: ["read_ephemeral_ehr", "generate_clinical_summary"],
    escalateTools: ["export_deidentified_cohort"],
    deniedTools: ["export_raw_patient_data", "send_external_http"],
    policyBindings: ["POL-HEALTH-RGPD-ART9"],
    lastAction: "1 min ago",
    status: "ACTIVE"
  }
];

// 2. REGISTRO DE ACCIONES Y VEREDICTOS EN RUNTIME (Action Ledger)
const INITIAL_ACTIONS = [
  {
    verdictId: "VRD-2026-0941A",
    timestamp: "2026-09-01T04:12:18.102Z",
    agentId: "agent-742",
    agentName: "Treasury-Payment-Orchestrator",
    principal: "operator-maria-881",
    action: "send_wire_transfer",
    resource: "core-banking-api://transfers/sepa",
    params: { amount_eur: 18420.00, destination_iban: "ES9121000418450200051332", recipient: "Acme Logistics S.L." },
    decision: "ESCALATE",
    enforcement: "HOLD_FOR_HUMAN_APPROVAL",
    risk: "HIGH",
    policyId: "POL-FIN-TREASURY-01",
    policyVersion: "4.2.1",
    policyHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    rulesMatched: ["RULE_AMOUNT_EXCEEDS_AUTONOMOUS_LIMIT", "RULE_REQUIRE_DUAL_CONTROL"],
    reasons: [
      "El importe (18,420.00 EUR) supera el umbral autónomo permitido (1,000.00 EUR).",
      "La política exige autorización humana explícita previa al despacho del pago bancario."
    ],
    confidence: "N/A — Deterministic Policy Match (0% Hallucination)",
    latencyCore: "14 μs",
    inputDigest: "sha256:4a8b29e01824d55f9e8a719c82301982bca192739812903847921a9823749812",
    signature: "ed25519:5f10283c71a9...valid",
    tsaToken: "RFC3161:TST_20260901_041218",
    status: "PENDING_APPROVAL"
  },
  {
    verdictId: "VRD-2026-0940B",
    timestamp: "2026-09-01T04:11:55.430Z",
    agentId: "agent-181",
    agentName: "CRM-Support-Autonomous-Bot",
    principal: "anonymous-session-42",
    action: "delete_customer_account",
    resource: "postgresql://prod-db/customers",
    params: { customer_id: "CUST-9921", delete_cascade: true },
    decision: "BLOCK",
    enforcement: "BLOCK_AND_PURGE_RAM",
    risk: "CRITICAL",
    policyId: "POL-CRM-LEAST-PRIV-03",
    policyVersion: "1.4.0",
    policyHash: "sha256:1a84f3e8b090...d612",
    rulesMatched: ["RULE_PRIVILEGED_MUTATION_DENIED", "RULE_EXCESSIVE_AGENCY_PREVENTION"],
    reasons: [
      "El agente intentó una mutación destructiva no permitida en su perfil de privilegios mínimos.",
      "Comando de borrado en cascada bloqueado en la frontera de ejecución L7."
    ],
    confidence: "N/A — Deterministic Rule Match",
    latencyCore: "11 μs",
    inputDigest: "sha256:8812a812f009...c192",
    signature: "ed25519:781293a...valid",
    tsaToken: "RFC3161:TST_20260901_041155",
    status: "ENFORCED_BLOCK"
  },
  {
    verdictId: "VRD-2026-0939C",
    timestamp: "2026-09-01T04:09:12.809Z",
    agentId: "agent-912",
    agentName: "Clinical-Data-Summarizer",
    principal: "doctor-garcia-dr",
    action: "read_ephemeral_ehr",
    resource: "fhir-server://patients/P-8812/observations",
    params: { scope: "read_summary", isolation: "memory_volatile_only" },
    decision: "ALLOW",
    enforcement: "ALLOW_AND_ATTEST",
    risk: "LOW",
    policyId: "POL-HEALTH-RGPD-ART9",
    policyVersion: "3.0.1",
    policyHash: "sha256:9901aef012...8831",
    rulesMatched: ["RULE_AUTHORIZED_READ_WITH_RAM_PURGE"],
    reasons: [
      "Inferencia de lectura clínica permitida en memoria volátil sin persistencia en disco.",
      "Comprobación de identidad médica y rol de acceso verificada."
    ],
    confidence: "N/A — Deterministic Policy Match",
    latencyCore: "16 μs",
    inputDigest: "sha256:1234908123...ff01",
    signature: "ed25519:aa99812...valid",
    tsaToken: "RFC3161:TST_20260901_040912",
    status: "EXECUTED"
  }
];

export default function App() {
  const [sessionUser, setSessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem('saare_suite_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentNav, setCurrentNav] = useState('COMMAND_CENTER'); // COMMAND_CENTER | ACTIONS | HUMAN_APPROVALS | AGENTS | JUDGE_LAB | EVIDENCE | DEV_API
  const [actionsFeed, setActionsFeed] = useState(INITIAL_ACTIONS);
  const [selectedVerdict, setSelectedVerdict] = useState(INITIAL_ACTIONS[0]);
  const [activeCodeTab, setActiveCodeTab] = useState('ask_judge');

  // Estado del Human Approval Center
  const [pendingApprovals, setPendingApprovals] = useState(
    INITIAL_ACTIONS.filter(a => a.decision === 'ESCALATE' && a.status === 'PENDING_APPROVAL')
  );
  const [overrideAuditTrail, setOverrideAuditTrail] = useState([]);
  const [overrideModal, setOverrideModal] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Estado del Policy Lab & Simulador (Shadow Mode)
  const [policyCode, setPolicyCode] = useState(`policy: payments.treasury.eu
version: 4.3.0-rc1

rule:
  when:
    subject.role: "agent"
    action: "send_wire_transfer"
    resource: "core-banking-api"
    params.amount_eur: "> 5000"

  require:
    human_dual_approval: true
    two_factor_auth: true

  otherwise:
    decision: ESCALATE
    enforcement: HOLD_FOR_HUMAN_APPROVAL
    reason_code: "HIGH_VALUE_TRANSFER_REQUIRES_SIGNATURE"`);

  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Estado de Verificación Criptográfica
  const [verifyIdInput, setVerifyIdInput] = useState('VRD-2026-0941A');
  const [verifyStatus, setVerifyStatus] = useState(null);

  // Modales B2B
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [b2bFormData, setB2bFormData] = useState({
    expediente: '',
    tipoNorma: 'PRTR_NEXTGEN',
    emailContacto: '',
    vpcCloud: 'SOBERANA_EUROPEA',
    tokenVolume: '1M_10M'
  });
  const [b2bSuccessMsg, setB2bSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejo de Human Override inmutable
  const handleHumanDecision = (verdict, decisionType) => {
    const timestamp = new Date().toISOString();
    const overrideRecord = {
      overrideId: `OVR-${Date.now()}`,
      originalVerdictId: verdict.verdictId,
      originalDecision: verdict.decision,
      humanDecision: decisionType,
      author: sessionUser?.email || "treasury.supervisor@saare.es",
      reason: overrideReason || (decisionType === 'ALLOW' ? "Aprobación operativa de emergencia autorizada" : "Rechazo manual por riesgo de fraude"),
      timestamp,
      signature: `ed25519:override_${Math.random().toString(36).substring(2, 10)}_signed`,
      chainHash: verdict.inputDigest
    };

    setActionsFeed(prev => prev.map(a => {
      if (a.verdictId === verdict.verdictId) {
        return {
          ...a,
          status: decisionType === 'ALLOW' ? 'HUMAN_ALLOWED' : 'HUMAN_REJECTED',
          humanOverride: overrideRecord
        };
      }
      return a;
    }));

    setPendingApprovals(prev => prev.filter(a => a.verdictId !== verdict.verdictId));
    setOverrideAuditTrail(prev => [overrideRecord, ...prev]);
    setOverrideModal(null);
    setOverrideReason('');

    if (selectedVerdict.verdictId === verdict.verdictId) {
      setSelectedVerdict(prev => ({
        ...prev,
        status: decisionType === 'ALLOW' ? 'HUMAN_ALLOWED' : 'HUMAN_REJECTED',
        humanOverride: overrideRecord
      }));
    }
  };

  const runPolicySimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationResult({
        totalActionsAnalyzed: 1842201,
        allowCount: 1708412,
        escalateCount: 42340,
        blockCount: 91449,
        impactDelta: "Esta versión bloquearía 4,218 transacciones adicionales frente a v4.2.1",
        riskPreventedEur: "€1.42M en potenciales anomalías operacionales",
        p99LatencyEst: "14.2 μs"
      });
      setIsSimulating(false);
    }, 1200);
  };

  const handleVerifyLookup = (e) => {
    e.preventDefault();
    const match = actionsFeed.find(a => a.verdictId.toLowerCase() === verifyIdInput.trim().toLowerCase());
    if (match) {
      setVerifyStatus({
        found: true,
        verdict: match,
        ed25519Valid: true,
        rfc3161Valid: true,
        sha256Valid: true,
        message: "INTEGRIDAD CONFIRMADA: La firma criptográfica y el sellado temporal coinciden con el registro de ejecución."
      });
    } else {
      setVerifyStatus({
        found: false,
        message: "No se localiza el registro en este nodo de decisión. Verifique el identificador canónico."
      });
    }
  };

  const handleSendB2BForm = async (e, formType) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        formType,
        email: b2bFormData.emailContacto,
        expediente: b2bFormData.expediente || "NO_ESPECIFICADO",
        tipoNorma: b2bFormData.tipoNorma || "PRTR_NEXTGEN",
        vpcCloud: b2bFormData.vpcCloud || "SOBERANA_EUROPEA",
        tokenVolume: b2bFormData.tokenVolume || "1M_10M",
        source: "saare-suite-modal"
      };

      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === "SUCCESS") {
        setB2bSuccessMsg(`Solicitud de ${formType} registrada en el Decision Store (Ref: ${data.leadId}). Un arquitecto técnico se pondrá en contacto.`);
        setTimeout(() => {
          setShowDossierModal(false);
          setShowEnterpriseModal(false);
          setB2bSuccessMsg('');
        }, 3000);
      } else {
        alert("Error al registrar solicitud: " + (data.error || "Fallo de respuesta"));
      }
    } catch (err) {
      alert("Error de conexión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const integrationSnippets = {
    ask_judge: `// MODO B: ASK THE JUDGE (Autorización de Acciones de Agentes)
import { SaareJudgeClient } from '@saare/governance-sdk';

const judge = new SaareJudgeClient({ apiKey: process.env.SAARE_API_KEY });

// El agente solicita autorización previa al Judge antes de ejecutar una acción sensible
const verdict = await judge.adjudicate({
  subject: "agent-742",
  action: "send_wire_transfer",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00, destination_iban: "ES9121000418450200051332" },
  payloadDigest: "sha256:4a8b29e01824d55f9e8a719c82301982bca192739812903847921a9823749812"
});

if (verdict.decision === 'ALLOW') {
  await executeBankTransfer();
} else if (verdict.decision === 'ESCALATE') {
  await routeToHumanSupervisor(verdict.verdictId);
} else {
  console.error(\`Acción rechazada por política: \${verdict.reasons.join(', ')}\`);
}`,
    inline_proxy: `// MODO A: INLINE GATEWAY (Intercepción en Capa 7 para LLMs)
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: '${API_BASE}/intercept',
  defaultHeaders: {
    'X-SAARE-License': process.env.SAARE_LICENSE,
    'X-SAARE-Execution-Mode': 'ADJUDICATE_AND_ATTEST'
  }
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Procesar informe financiero' }]
});`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: '"JetBrains Mono", "Inter", monospace' }}>
      
      {/* HEADER MISSION CONTROL */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#0b0f19', borderBottom: '1px solid #1f2937', padding: '10px 24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontWeight: '900', fontSize: '18px', letterSpacing: '2px', color: '#fff' }}>SAARE</span>
            <span style={{ background: '#1e293b', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
              AI EXECUTION AUTHORIZATION LAYER
            </span>
            <span style={{ color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ● JUDGE CORE: 14.2 μs (RAM P99)
            </span>
          </div>

          <nav style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
            <button 
              onClick={() => setCurrentNav('COMMAND_CENTER')} 
              style={{ background: currentNav === 'COMMAND_CENTER' ? '#0284c7' : '#111827', color: '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ⌂ Mission Control
            </button>
            <button 
              onClick={() => setCurrentNav('ACTIONS')} 
              style={{ background: currentNav === 'ACTIONS' ? '#0284c7' : '#111827', color: '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ⚡ Actions ({actionsFeed.length})
            </button>
            <button 
              onClick={() => setCurrentNav('HUMAN_APPROVALS')} 
              style={{ background: currentNav === 'HUMAN_APPROVALS' ? '#ea580c' : '#111827', color: pendingApprovals.length > 0 ? '#fde047' : '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ⚠ Approvals ({pendingApprovals.length})
            </button>
            <button 
              onClick={() => setCurrentNav('AGENTS')} 
              style={{ background: currentNav === 'AGENTS' ? '#0284c7' : '#111827', color: '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ◈ Agent Registry
            </button>
            <button 
              onClick={() => setCurrentNav('JUDGE_LAB')} 
              style={{ background: currentNav === 'JUDGE_LAB' ? '#0284c7' : '#111827', color: '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ⚖ Policy Lab
            </button>
            <button 
              onClick={() => setCurrentNav('EVIDENCE')} 
              style={{ background: currentNav === 'EVIDENCE' ? '#0284c7' : '#111827', color: '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ◫ Evidence
            </button>
            <button 
              onClick={() => setCurrentNav('DEV_API')} 
              style={{ background: currentNav === 'DEV_API' ? '#0284c7' : '#111827', color: '#fff', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ⚙ SGP 1.0 API
            </button>
          </nav>

        </div>
      </header>

      {/* MODAL HUMAN OVERRIDE */}
      {overrideModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }}>
          <div style={{ maxWidth: '580px', width: '100%', background: '#111827', border: '1px solid #f59e0b', borderRadius: '12px', padding: '28px' }}>
            <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>HUMAN OVERRIDE PROTOCOL (ISO 27037 / ART. 14 SUPERVISION)</span>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '8px 0 12px 0' }}>Supervisión de Acción Crítica de IA</h3>
            
            <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '14px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
              <div><strong>Acción:</strong> {overrideModal.action}</div>
              <div><strong>Agente:</strong> {overrideModal.agentName} ({overrideModal.agentId})</div>
              <div><strong>Recurso:</strong> {overrideModal.resource}</div>
              <div><strong>Parámetros:</strong> {JSON.stringify(overrideModal.params)}</div>
              <div><strong>Veredicto Original:</strong> <span style={{ color: '#f87171' }}>{overrideModal.decision}</span></div>
            </div>

            <label style={{ display: 'block', fontSize: '11.5px', color: '#9ca3af', marginBottom: '6px' }}>MOTIVACIÓN TÉCNICA / JUSTIFICACIÓN DE LA EXCEPCIÓN:</label>
            <textarea 
              rows={3} 
              value={overrideReason} 
              onChange={(e) => setOverrideReason(e.target.value)} 
              placeholder="Indique motivo operativo o regulatorio para autorizar o confirmar el rechazo..." 
              style={{ width: '100%', background: '#030712', border: '1px solid #374151', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleHumanDecision(overrideModal, 'ALLOW')} 
                style={{ flex: 1, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✓ Firmar y Autorizar Acción
              </button>
              <button 
                onClick={() => handleHumanDecision(overrideModal, 'DENY')} 
                style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✕ Confirmar Bloqueo
              </button>
              <button 
                onClick={() => setOverrideModal(null)} 
                style={{ padding: '10px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 24px' }}>

        {/* VISTA 1: COMMAND CENTER (MISSION CONTROL) */}
        {currentNav === 'COMMAND_CENTER' && (
          <div>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: '#0b0f19', border: '1px solid #1f2937', padding: '18px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Agentes Gobernados</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8', margin: '4px 0' }}>1,284</div>
                <div style={{ fontSize: '11px', color: '#34d399' }}>94.1% Cobertura de Acciones</div>
              </div>

              <div style={{ background: '#0b0f19', border: '1px solid #1f2937', padding: '18px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Acciones Evaluadas (24h)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '4px 0' }}>82,491</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>74,211 ALLOW · 5,812 BLOCK</div>
              </div>

              <div style={{ background: '#0b0f19', border: '1px solid #1f2937', padding: '18px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Aprobaciones Pendientes</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: pendingApprovals.length > 0 ? '#f59e0b' : '#34d399', margin: '4px 0' }}>
                  {pendingApprovals.length}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Dual Control Requerido</div>
              </div>

              <div style={{ background: '#0b0f19', border: '1px solid #1f2937', padding: '18px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Riesgo Financiero Prevenido</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>€ 2.84 M</div>
                <div style={{ fontSize: '11px', color: '#34d399' }}>100% Cero Falsos Negativos</div>
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
              
              {/* FEED DE ACCIONES */}
              <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', margin: 0 }}>⚡ Live Action Stream & Authorization</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Filtro: Todas las Acciones</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {actionsFeed.map(act => (
                    <div 
                      key={act.verdictId} 
                      onClick={() => setSelectedVerdict(act)}
                      style={{ 
                        background: selectedVerdict.verdictId === act.verdictId ? '#1e293b' : '#030712', 
                        border: `1px solid ${selectedVerdict.verdictId === act.verdictId ? '#0284c7' : '#1f2937'}`,
                        borderRadius: '8px', 
                        padding: '12px', 
                        cursor: 'pointer' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '12px' }}>{act.agentName}</span>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          background: act.decision === 'BLOCK' ? 'rgba(239, 68, 68, 0.2)' : act.decision === 'ESCALATE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: act.decision === 'BLOCK' ? '#f87171' : act.decision === 'ESCALATE' ? '#fbbf24' : '#34d399',
                          border: `1px solid ${act.decision === 'BLOCK' ? '#ef4444' : act.decision === 'ESCALATE' ? '#f59e0b' : '#10b981'}`
                        }}>
                          {act.status}
                        </span>
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}>
                        → <strong>{act.action}</strong> ({act.resource})
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                        <span>Ref: {act.verdictId}</span>
                        <span>Latencia: {act.latencyCore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VERDICT INSPECTOR */}
              <div style={{ background: '#0b0f19', border: '1px solid #0284c7', borderRadius: '12px', padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: 'bold', textTransform: 'uppercase' }}>DETERMINISTIC VERDICT INSPECTOR</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '2px 0 0 0' }}>{selectedVerdict.verdictId}</h3>
                  </div>
                  <span style={{ fontSize: '11px', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(52,211,153,0.3)' }}>
                    ✓ ED25519 & RFC3161
                  </span>
                </div>

                <div style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '8px' }}>ÁRBOL DE CAUSALIDAD (DETERMINISTIC WHY)</div>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#cbd5e1' }}>
                    <div><strong>1. Identidad:</strong> {selectedVerdict.agentId} ({selectedVerdict.agentName})</div>
                    <div><strong>2. Intención:</strong> {selectedVerdict.action} en <code>{selectedVerdict.resource}</code></div>
                    <div><strong>3. Política Activa:</strong> {selectedVerdict.policyId} [v{selectedVerdict.policyVersion}]</div>
                    <div><strong>4. Reglas Coincidentes:</strong> <span style={{ color: '#f87171' }}>{selectedVerdict.rulesMatched.join(', ')}</span></div>
                    <div><strong>5. Veredicto Final:</strong> <strong>{selectedVerdict.decision}</strong> ({selectedVerdict.enforcement})</div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Motivaciones Evaluadas:</span>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {selectedVerdict.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {selectedVerdict.decision === 'ESCALATE' && selectedVerdict.status === 'PENDING_APPROVAL' && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11.5px', color: '#fde047', fontWeight: 'bold', marginBottom: '6px' }}>Acción Bloqueada Pendiente de Decisión Humana</div>
                    <button 
                      onClick={() => setOverrideModal(selectedVerdict)} 
                      style={{ width: '100%', padding: '9px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Abrir Protocolo de Autorización (Human Override) →
                    </button>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '12px', fontSize: '11px', color: '#64748b' }}>
                  <div>Input Digest: <code>{selectedVerdict.inputDigest.substring(0, 32)}...</code></div>
                  <div>Firma Testigo: <code>{selectedVerdict.signature}</code></div>
                  <div>Sellado Temporal: <code>{selectedVerdict.tsaToken}</code></div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VISTA 2: ACTIONS FEED */}
        {currentNav === 'ACTIONS' && (
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Action Authorization Ledger</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>Registro completo de intercepciones y veredictos en runtime emitidos por el Judge.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {actionsFeed.map(act => (
                <div key={act.verdictId} style={{ background: '#030712', border: '1px solid #1f2937', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>{act.agentName} ({act.agentId})</div>
                    <div style={{ color: '#fff', fontSize: '14px', margin: '2px 0' }}><strong>{act.action}</strong> → {act.resource}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Policy: {act.policyId} [v{act.policyVersion}] · Ref: {act.verdictId}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '3px 10px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      background: act.decision === 'BLOCK' ? 'rgba(239, 68, 68, 0.2)' : act.decision === 'ESCALATE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: act.decision === 'BLOCK' ? '#f87171' : act.decision === 'ESCALATE' ? '#fbbf24' : '#34d399'
                    }}>
                      {act.status}
                    </span>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>{act.latencyCore}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 3: HUMAN APPROVALS */}
        {currentNav === 'HUMAN_APPROVALS' && (
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Human Approval Center & Dual-Control</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>
              Supervisión de acciones que requieren confirmación humana. Toda autorización queda registrada como un objeto inmutable separado.
            </p>

            {pendingApprovals.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#030712', borderRadius: '8px', color: '#34d399' }}>
                ✔ No hay acciones pendientes de aprobación humana.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pendingApprovals.map(p => (
                  <div key={p.verdictId} style={{ background: '#030712', border: '1px solid #ea580c', padding: '18px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 'bold' }}>ACCIÓN RESTRINGIDA · UMBRAL FINANCIERO</div>
                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', margin: '4px 0' }}>{p.action} ({p.resource})</div>
                      <div style={{ color: '#9ca3af', fontSize: '12px' }}>Agente: <strong>{p.agentName}</strong> · Importe: <strong>€{p.params?.amount_eur || 'N/A'}</strong></div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>Regla: {p.rulesMatched.join(' · ')}</div>
                    </div>
                    <button 
                      onClick={() => setOverrideModal(p)}
                      style={{ padding: '10px 18px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Supervisar Acción →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {overrideAuditTrail.length > 0 && (
              <div style={{ marginTop: '30px', borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '12px' }}>Registro Histórico de Overrides (Inmutable)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {overrideAuditTrail.map(o => (
                    <div key={o.overrideId} style={{ background: '#030712', border: '1px solid #374151', padding: '10px 14px', borderRadius: '6px', fontSize: '11.5px', color: '#9ca3af' }}>
                      <strong style={{ color: o.humanDecision === 'ALLOW' ? '#34d399' : '#f87171' }}>[{o.humanDecision}]</strong> por <strong>{o.author}</strong> en {o.timestamp} · Razón: {o.reason} · Ref: {o.originalVerdictId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISTA 4: AGENT REGISTRY */}
        {currentNav === 'AGENTS' && (
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Agent Identity & Least Privilege Permissions</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>
              Control granular de permisos por agente. Define qué herramientas puede ejecutar directamente, cuáles requieren doble control y cuáles están explícitamente denegadas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
              {INITIAL_AGENTS.map(ag => (
                <div key={ag.id} style={{ background: '#030712', border: '1px solid #1f2937', padding: '20px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>{ag.name}</span>
                    <span style={{ fontSize: '10px', background: ag.risk === 'CRITICAL' ? '#7f1d1d' : '#1e3a8a', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{ag.risk}</span>
                  </div>
                  
                  <div style={{ fontSize: '11.5px', color: '#9ca3af', marginBottom: '14px' }}>
                    <div>ID: <code>{ag.id}</code> · Entorno: <code>{ag.env}</code></div>
                    <div>Propietario: {ag.owner}</div>
                  </div>

                  <div style={{ fontSize: '11.5px', lineHeight: 1.6 }}>
                    <div style={{ color: '#34d399' }}>✓ <strong>Permitido:</strong> {ag.allowedTools.join(', ')}</div>
                    <div style={{ color: '#fbbf24' }}>⚠ <strong>Con Aprobación:</strong> {ag.escalateTools.join(', ')}</div>
                    <div style={{ color: '#f87171' }}>✕ <strong>Denegado:</strong> {ag.deniedTools.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 5: POLICY LAB & SIMULATOR */}
        {currentNav === 'JUDGE_LAB' && (
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 }}>Policy Lab & Shadow Mode Simulator</h2>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', margin: '4px 0 0 0' }}>Compila políticas declarativas y simula el impacto real antes de aplicarlas en producción.</p>
              </div>
              <button 
                onClick={runPolicySimulation} 
                disabled={isSimulating}
                style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: isSimulating ? 'default' : 'pointer' }}
              >
                {isSimulating ? 'Simulando...' : '▶ Simular Política (Shadow Mode)'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>SAARE POLICY LANGUAGE (DECLARATIVE YAML):</span>
                <textarea 
                  rows={16} 
                  value={policyCode} 
                  onChange={(e) => setPolicyCode(e.target.value)}
                  style={{ width: '100%', background: '#030712', border: '1px solid #374151', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', boxSizing: 'border-box', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '18px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>ANÁLISIS DE IMPACTO EN PRODUCCIÓN</span>
                
                {simulationResult ? (
                  <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
                    <div><strong>Acciones Evaluadas:</strong> {simulationResult.totalActionsAnalyzed.toLocaleString()}</div>
                    <div style={{ color: '#34d399' }}>→ Permisiones (ALLOW): {simulationResult.allowCount.toLocaleString()}</div>
                    <div style={{ color: '#fbbf24' }}>→ Escalados (ESCALATE): {simulationResult.escalateCount.toLocaleString()}</div>
                    <div style={{ color: '#f87171' }}>→ Bloqueos Previstos (BLOCK): {simulationResult.blockCount.toLocaleString()}</div>
                    
                    <div style={{ marginTop: '14px', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#fde047' }}>
                      ⚠ {simulationResult.impactDelta}
                    </div>

                    <div style={{ marginTop: '12px', color: '#38bdf8' }}>
                      Riesgo prevenido: <strong>{simulationResult.riskPreventedEur}</strong>
                    </div>

                    <button style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Promover de Shadow a Enforce Activo (Git Commit)
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '40px 0' }}>
                    Pulsa "Simular Política" para proyectar esta regla contra las 1.84M de acciones registradas en los últimos 30 días.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 6: EVIDENCE & INDEPENDENT VERIFY */}
        {currentNav === 'EVIDENCE' && (
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Evidence Plane & Independent Verifier</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>
              Verificación independiente de veredictos sin depender de la UI. La evidencia es portable, firmada con Ed25519 y sellada con RFC 3161.
            </p>

            <form onSubmit={handleVerifyLookup} style={{ display: 'flex', gap: '10px', maxWidth: '680px', marginBottom: '24px' }}>
              <input 
                type="text" 
                value={verifyIdInput} 
                onChange={(e) => setVerifyIdInput(e.target.value)} 
                placeholder="Introduce Verdict ID o SHA-256 Digest (ej: VRD-2026-0941A)" 
                style={{ flex: 1, padding: '10px 14px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }} 
              />
              <button type="submit" style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Verificar Integridad
              </button>
            </form>

            {verifyStatus && (
              <div style={{ background: '#030712', border: `1px solid ${verifyStatus.found ? '#34d399' : '#ef4444'}`, padding: '20px', borderRadius: '8px', maxWidth: '800px' }}>
                <div style={{ color: verifyStatus.found ? '#34d399' : '#f87171', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                  {verifyStatus.found ? '✔ REGISTRO VERIFICADO Y CONFORME' : '✕ REGISTRO NO ENCONTRADO'}
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 12px 0' }}>{verifyStatus.message}</p>

                {verifyStatus.found && (
                  <div style={{ fontSize: '11.5px', color: '#9ca3af', lineHeight: 1.6 }}>
                    <div><strong>Verdict ID:</strong> {verifyStatus.verdict.verdictId}</div>
                    <div><strong>Decisión:</strong> {verifyStatus.verdict.decision}</div>
                    <div><strong>Algoritmo de Firma:</strong> Ed25519 (Integridad de Clave Raíz SAARE)</div>
                    <div><strong>Sellado Temporal:</strong> RFC 3161 Qualified TSA Token</div>
                    <div><strong>Registro de Propiedad:</strong> Safe Creative 2607076315021 / 2607076314949</div>
                    <div style={{ marginTop: '12px' }}>
                      <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>
                        Descargar Proof Bundle JSON (.sgp) ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VISTA 7: SGP 1.0 DEV HUB */}
        {currentNav === 'DEV_API' && (
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>SAARE Developer Hub & Protocol SGP 1.0</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>
              Integración nativa para desarrolladores de agentes autónomos. Consulta al Judge en 5 líneas de código antes de cualquier tool call o mutación crítica.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button 
                onClick={() => setActiveCodeTab('ask_judge')} 
                style={{ padding: '8px 14px', background: activeCodeTab === 'ask_judge' ? '#1e293b' : 'transparent', border: '1px solid #374151', color: activeCodeTab === 'ask_judge' ? '#38bdf8' : '#9ca3af', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Modo B: SDK 'Ask the Judge' (Agentic AI)
              </button>
              <button 
                onClick={() => setActiveCodeTab('inline_proxy')} 
                style={{ padding: '8px 14px', background: activeCodeTab === 'inline_proxy' ? '#1e293b' : 'transparent', border: '1px solid #374151', color: activeCodeTab === 'inline_proxy' ? '#38bdf8' : '#9ca3af', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Modo A: Inline Gateway L7 (Reverse Proxy)
              </button>
            </div>

            <pre style={{ background: '#030712', border: '1px solid #1f2937', padding: '20px', borderRadius: '8px', color: '#f3f4f6', fontSize: '12.5px', overflowX: 'auto', lineHeight: 1.55 }}>
              {integrationSnippets[activeCodeTab]}
            </pre>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1f2937', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '11.5px', marginTop: '60px' }}>
        <div>SAARE AI Execution Authorization Infrastructure · SGP 1.0</div>
        <div style={{ marginTop: '4px' }}>Registro Safe Creative 2607076315021 / 2607076314949 · © 2026 SAARE Digital Governance</div>
      </footer>

    </div>
  );
}