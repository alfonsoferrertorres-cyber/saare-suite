import React, { useState } from 'react';

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5174'
  : 'https://saare-console.pages.dev';

const DEMO_VERDICT_ID = "VRD-2026-0941A";

const DOCTRINE_PRINCIPLES = [
  { num: "01", title: "Execution Boundary", desc: "La evaluación de autorización se ejecuta en la frontera del runtime antes del dispatch, nunca ex-post." },
  { num: "02", title: "No Verdict, No Run", desc: "Ninguna acción de IA, llamada a herramienta o mutación crítica se ejecuta sin un veredicto previo y un Execution Permit firmado." },
  { num: "03", title: "Deterministic Taxonomy", desc: "Decisiones estructuradas (ALLOW, DENY, ESCALATE) con acciones de enforcement asociadas (PASS, BLOCK, HOLD)." },
  { num: "04", title: "Simultaneous Evidence", desc: "Cada decisión material produce un registro de autorización firmado criptográficamente de manera simultánea." },
  { num: "05", title: "Human Override Inmutability", desc: "Toda excepción humana queda firmada e imputada sin sobreescribir ni destruir el veredicto original." },
  { num: "06", title: "Model-Agnostic Core", desc: "Desacople total de modelos y proveedores subyacentes de inferencia." },
  { num: "07", title: "Independent Verification", desc: "La integridad probatoria no depende de la interfaz: es verificable de forma independiente vía API pública y RFC 3161." }
];

const TARGET_SEGMENTS = [
  {
    id: "01",
    tag: "AGENTIC AI & ORCHESTRATION",
    title: "01. Fábricas de Agentes y Orquestadores Autónomos",
    who: "Plataformas y desarrolladores que orquestan agentes autónomos con acceso a APIs, pagos y bases de datos.",
    pain: "Un agente inducido o alucinado ejecuta herramientas sensibles produciendo efectos reales no deseados.",
    embed: "SDK / Nodo HTTP 'Ask the Judge' (POST /api/v1/judge) como aduana determinista previa a la ejecución.",
    pricing: "Tarificación por volumen de decisiones adjudicadas.",
    color: "#16a34a"
  },
  {
    id: "02",
    tag: "REGULATED ENTERPRISE",
    title: "02. Banca, Seguros y Sanidad (Nube Privada)",
    who: "Corporaciones reguladas que ejecutan modelos de IA de forma interna o en VPCs soberanas.",
    pain: "Exigencia de no persistencia en disco de secretos o datos clínicos (RGPD Art. 9) y control perimetral estricto.",
    embed: "Sidecar Container / Kubernetes DaemonSet con procesamiento efímero en memoria volátil sin persistencia.",
    pricing: "Licencia Anual por Clúster con custodia de claves Ed25519.",
    color: "#ca8a04"
  },
  {
    id: "03",
    tag: "ISVS & SAAS B2B",
    title: "03. Otras ISVs y Plataformas de Software B2B",
    who: "Software empresarial con asistentes o funciones generativas integradas.",
    pain: "Los clientes corporativos exigen garantías técnicas de no filtración y mitigación de riesgos operacionales.",
    embed: "OEM / White-Label SDK (@saare/judge) incrustado directamente en el pipeline de backend.",
    pricing: "Licencia de Desarrollador + Royalty por cliente corporativo activo.",
    color: "#0284c7"
  },
  {
    id: "04",
    tag: "SYSTEM INTEGRATORS",
    title: "04. Grandes Integradores y Consultoras TIC",
    who: "Firmas que despliegan proyectos de IA para grandes corporaciones y Sector Público.",
    pain: "Deben justificar técnicamente controles frente a normativas aplicables y fondos públicos.",
    embed: "Middleware de Integración en plantillas de arquitectura de infraestructura.",
    pricing: "Tarifa por proyecto entregado o Acuerdo Marco Anual.",
    color: "#9333ea"
  }
];

const INTEGRATION_TIERS = [
  {
    id: "tier_dev",
    name: "DEVELOPER / PRO",
    price: "199 €",
    period: "al mes",
    desc: "Para creadores de agentes, flujos automatizados y herramientas de Tool Calling.",
    features: [
      "Hasta 100.000 veredictos / mes",
      "Acceso completo a SAARE Judge API",
      "Emisión de Execution Permits firmados",
      "Protección anti-replay (Validación JTI)",
      "Decision Store inmutable (30 días de retención)",
      "Soporte técnico por canal directo",
      "Extra: 0,0015 € por veredicto adicional"
    ],
    highlight: false,
    cta: "Integrar Nivel Developer",
    action: "lead_dev"
  },
  {
    id: "tier_business",
    name: "BUSINESS / SCALE",
    price: "890 €",
    period: "al mes",
    desc: "Para ISVs B2B, software corporativo y pipelines en producción crítica.",
    features: [
      "Hasta 1.000.000 veredictos / mes",
      "Compilador de políticas Policy-as-Code",
      "Filtros avanzados (DLP, Health Art. 9, Anti-Jailbreak)",
      "Exportación de Proof Bundles sellados (RFC 3161)",
      "Consola de supervisión CISO multi-usuario",
      "SLA de disponibilidad 99.9%",
      "Extra: 0,0008 € por veredicto adicional"
    ],
    highlight: true,
    cta: "Integrar Nivel Scale",
    action: "lead_scale"
  },
  {
    id: "tier_enterprise",
    name: "ENTERPRISE SOVEREIGN",
    price: "2.500 €",
    period: "al mes (anual)",
    desc: "Para infraestructuras críticas, banca, sanidad y sector público.",
    features: [
      "Veredictos ilimitados por clúster",
      "Despliegue On-Premise / Sidecar Container / K8s",
      "Zero-Disk Plaintext Persistence (Memoria Efímera)",
      "Custodia de claves asimétricas Ed25519 propias",
      "Dictámenes periciales alineados con ISO/IEC 27037",
      "Soporte 24/7 con arquitecto dedicado",
      "Auditoría técnica de conformidad regulatoria"
    ],
    highlight: false,
    cta: "Solicitar Despliegue Dedicado",
    action: "modal_enterprise"
  }
];

const CONTROL_MATRIX = [
  { requirement: "EU AI Act (2024/1689 Art. 12/15)", control: "L7 Execution Authorization Gate", policy: "Runtime Policy Enforcement", decision: "DENY", enforcement: "BLOCK", evidence: "Proof Bundle estructurado" },
  { requirement: "RGPD & LOPDGDD (Art. 9/32)", control: "Ephemeral Runtime Memory Processing", policy: "Zero-Disk Runtime Isolation", decision: "ALLOW", enforcement: "REDACT", evidence: "Certificado de Redacción / Bloqueo" },
  { requirement: "LO 1/1982 & AI Act (Art. 50)", control: "Filtro Causal de Identidad y Audio", policy: "Synthetic Media Rights Guard", decision: "DENY", enforcement: "BLOCK", evidence: "Registro de Intercepción Pericial" },
  { requirement: "NIS 2 & CRA (2024/2847)", control: "Mitigación determinista de Prompt Injection", policy: "In-Process Security by Design", decision: "DENY", enforcement: "ESCALATE", evidence: "Log Inmutable de Telemetría" },
  { requirement: "DORA (Reglamento UE 2022/2554)", control: "Edge Reverse-Proxy con Header L7-SEAL", policy: "Cross-Border Data Safeguard", decision: "ALLOW", enforcement: "PASS", evidence: "Auditoría de Tránsito Criptográfica" },
  { requirement: "ISO/IEC 27037:2012 (Workflow Aligned)", control: "Roles DEFR/DES & Firma Ed25519", policy: "Four-Phase Evidence Workflow", decision: "ALLOW", enforcement: "ATTEST", evidence: "Proof Bundle con sellado RFC 3161" }
];

export default function App() {
  const [activeCodeTab, setActiveCodeTab] = useState('sdk');
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  const [b2bFormData, setB2bFormData] = useState({
    expediente: '',
    tipoNorma: 'REGULATORIO_GENERAL',
    emailContacto: '',
    vpcCloud: 'SOBERANA_EUROPEA',
    tokenVolume: '1M_10M'
  });
  const [b2bSuccessMsg, setB2bSuccessMsg] = useState('');
  const [loadingLead, setLoadingLead] = useState(false);

  const [liveJudgeLoading, setLiveJudgeLoading] = useState(false);
  const [liveJudgeResult, setLiveJudgeResult] = useState(null);

  const handleEvaluateLiveJudge = async () => {
    setLiveJudgeLoading(true);
    setLiveJudgeResult(null);
    try {
      const payload = {
        subject: "payment-agent-742",
        action: "send_wire_transfer",
        resource: "core-banking-api://transfers/sepa",
        context: {
          amount_eur: 18420.00,
          destination_iban: "[REDACTED]",
          currency: "EUR"
        }
      };

      const res = await fetch(`${API_BASE}/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Fallo en el Decision Core`);
      }

      const data = await res.json();
      setLiveJudgeResult(data);
    } catch (err) {
      setLiveJudgeResult({
        status: "ERROR",
        message: "Decision Core no disponible.",
        details: err instanceof Error ? err.message : String(err)
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
      const res = await fetch(`${API_BASE}/verify/${encodeURIComponent(verifyIdInput.trim())}`, {
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.status === 'VALID') {
        setVerifyResult(data);
      } else {
        setVerifyResult({
          status: "NOT_FOUND",
          message: data.message || `El registro '${verifyIdInput}' no existe en el Decision Store.`
        });
      }
    } catch (err) {
      setVerifyResult({
        status: "ERROR",
        message: "Servicio de verificación no accesible.",
        details: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendB2BForm = async (e, formType) => {
    e.preventDefault();
    setLoadingLead(true);
    try {
      const payload = {
        formType,
        email: b2bFormData.emailContacto,
        expediente: b2bFormData.expediente || "NO_ESPECIFICADO",
        tipoNorma: b2bFormData.tipoNorma || "REGULATORIO_GENERAL",
        vpcCloud: b2bFormData.vpcCloud || "SOBERANA_EUROPEA",
        tokenVolume: b2bFormData.tokenVolume || "1M_10M",
        source: "saare-public-landing"
      };

      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === "SUCCESS") {
        setB2bSuccessMsg(`Solicitud registrada (Ref: ${data.leadId}). Un arquitecto de SAARE se pondrá en contacto.`);
        setTimeout(() => {
          setShowDossierModal(false);
          setShowEnterpriseModal(false);
          setSelectedTier(null);
          setB2bSuccessMsg('');
          setB2bFormData({
            expediente: '',
            tipoNorma: 'REGULATORIO_GENERAL',
            emailContacto: '',
            vpcCloud: 'SOBERANA_EUROPEA',
            tokenVolume: '1M_10M'
          });
        }, 3000);
      } else {
        alert("Error al registrar solicitud: " + (data.error || "Fallo de respuesta"));
      }
    } catch (err) {
      alert("Error de conexión: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingLead(false);
    }
  };

  const codeSnippets = {
    sdk: `// EMBED MODE 01: SAARE SDK (@saare/judge)
import { SaareJudgeClient } from '@saare/judge';

const judge = new SaareJudgeClient({ apiKey: process.env.SAARE_API_KEY });

// El SDK solicita autorización determinista antes del dispatch de la herramienta
const result = await judge.authorize({
  subject: "payment-agent-742",
  action: "send_wire_transfer",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00, destination_iban: "[REDACTED]" }
});

if (result.decision === "ALLOW") {
  // Solo se ejecuta si el Permit es válido y firmado por el Judge
  await executeBankTransfer(result.executionPermit);
} else if (result.decision === "ESCALATE") {
  await routeToHumanSupervisor(result.verdictId);
} else {
  console.error("Acción denegada por política:", result.reasonCodes);
}`,
    workflow: `// EMBED MODE 02: ORCHESTRATOR WORKFLOW INTERCEPTOR
// Inserte este bloque en un nodo de ejecución previo a cualquier Tool Call sensible:
const saareResponse = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/judge', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SAARE-Client-ID': process.env.SAARE_API_KEY
  },
  body: JSON.stringify({
    subject: event.agentId || "agent-runtime-worker",
    action: event.intendedToolCall,
    resource: event.targetApiEndpoint,
    context: event.parameters
  })
}).then(r => r.json());

// Fail-Closed: Solo proseguir si SAARE emitió Execution Permit
if (saareResponse.decision !== 'ALLOW' || !saareResponse.executionPermit) {
  throw new Error(\`Bloqueo de Seguridad SAARE [\${saareResponse.decision}]: \${saareResponse.reason}\`);
}

return { executionPermit: saareResponse.executionPermit };`,
    sidecar: `# EMBED MODE 03: SIDECAR CONTAINER (Docker / VPC Privada)
version: '3.8'
services:
  agent-application:
    image: company/agent-worker:v2.1
    environment:
      - SAARE_RUNTIME_HOST=http://saare-runtime:8080
      - SAARE_FAILOVER_STRATEGY=FAIL_CLOSED
    depends_on:
      - saare-runtime

  saare-runtime:
    image: saare.es/decision-core:v10.0.4
    environment:
      - SAARE_TENANT_KEY=\${SAARE_TENANT_KEY}
      - SAARE_POLICY_SET=PAYMENTS-EU-4.2.1
      - SAARE_MEMORY_MODE=EPHEMERAL
    ports:
      - "127.0.0.1:8080:8080"`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
      
      {/* MODAL SOLICITUD DE PLAN / TIER */}
      {selectedTier && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedTier(null)}>
          <div style={{ maxWidth: '500px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #0284c7', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>PLAN: {selectedTier.name} ({selectedTier.price} {selectedTier.period})</span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Aprovisionar Claves de Acceso API</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Introduce el correo de tu equipo técnico para generar tu Tenant ID y habilitar la cuota correspondiente.
            </p>
            {b2bSuccessMsg ? (
              <div style={{ padding: '16px', background: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', color: '#34d399', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                {b2bSuccessMsg}
              </div>
            ) : (
              <form onSubmit={(e) => handleSendB2BForm(e, `Integración Plan ${selectedTier.name}`)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO / RESPONSABLE TÉCNICO</label>
                  <input type="email" required placeholder="responsable@empresa.com" value={b2bFormData.emailContacto} onChange={(e) => setB2bFormData({...b2bFormData, emailContacto: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ENTORNO / ARQUITECTURA DE ORIGEN</label>
                  <select value={b2bFormData.vpcCloud} onChange={(e) => setB2bFormData({...b2bFormData, vpcCloud: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }}>
                    <option value="ORCHESTRATOR_FLOWS">Flujos de Orquestación y Automatización</option>
                    <option value="AGENTIC_SDK">SDK de Inferencia / Framework de Agentes</option>
                    <option value="CUSTOM_API">API Propia / Backend Corporativo</option>
                    <option value="VPC_K8S">Clúster Kubernetes Privado</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" disabled={loadingLead} style={{ flex: 1, padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: loadingLead ? 'default' : 'pointer' }}>
                    {loadingLead ? 'Aprovisionando...' : 'Confirmar y Recibir Credenciales'}
                  </button>
                  <button type="button" onClick={() => setSelectedTier(null)} style={{ padding: '12px 18px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL DICTAMEN PERICIAL */}
      {showDossierModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowDossierModal(false)}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #9333ea', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>SERVICIOS PERICIALES</span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Solicitud de Dictamen Pericial / Auditoría</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Generación de informe técnico con cadena de custodia (ISO/IEC 27037) y trazabilidad forense.
            </p>
            {b2bSuccessMsg ? (
              <div style={{ padding: '16px', background: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', color: '#34d399', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                {b2bSuccessMsg}
              </div>
            ) : (
              <form onSubmit={(e) => handleSendB2BForm(e, 'Dictamen Pericial')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
                  <input type="email" required placeholder="auditor@empresa.com" value={b2bFormData.emailContacto} onChange={(e) => setB2bFormData({...b2bFormData, emailContacto: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>TIPO DE EXPEDIENTE</label>
                  <select value={b2bFormData.tipoNorma} onChange={(e) => setB2bFormData({...b2bFormData, tipoNorma: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }}>
                    <option value="REGULATORIO_GENERAL">Auditoría de Conformidad Regulatoria (AI Act / RGPD)</option>
                    <option value="PERITAJE_JUDICIAL">Dictamen Pericial Judicial (ISO/IEC 27037 / DES)</option>
                    <option value="AUDITORIA_TRAZABILIDAD">Auditoría de Trazabilidad y Seguridad en Ejecución</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>REFERENCIA DE EXPEDIENTE / PROYECTO</label>
                  <input type="text" required placeholder="Ej: EXP-AUDIT-2026-01" value={b2bFormData.expediente} onChange={(e) => setB2bFormData({...b2bFormData, expediente: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" disabled={loadingLead} style={{ flex: 1, padding: '12px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: loadingLead ? 'default' : 'pointer' }}>
                    {loadingLead ? 'Transmitiendo...' : 'Tramitar Solicitud de Dictamen'}
                  </button>
                  <button type="button" onClick={() => setShowDossierModal(false)} style={{ padding: '12px 18px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL TENANT AISLADO ENTERPRISE */}
      {showEnterpriseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowEnterpriseModal(false)}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #ca8a04', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>GRANDES CUENTAS</span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Despliegue de Tenant Aislado / Enterprise</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Aprovisionamiento en Nube Soberana Europea, VPC dedicada u On-Premise con procesamiento efímero en memoria volátil sin persistencia de texto plano en el nodo.
            </p>
            {b2bSuccessMsg ? (
              <div style={{ padding: '16px', background: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', color: '#34d399', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                {b2bSuccessMsg}
              </div>
            ) : (
              <form onSubmit={(e) => handleSendB2BForm(e, 'Tenant Aislado Enterprise')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO (CISO / CTO / DPO)</label>
                  <input type="email" required placeholder="ciso@empresa.com" value={b2bFormData.emailContacto} onChange={(e) => setB2bFormData({...b2bFormData, emailContacto: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>INFRAESTRUCTURA DE DESTINO</label>
                  <select value={b2bFormData.vpcCloud} onChange={(e) => setB2bFormData({...b2bFormData, vpcCloud: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }}>
                    <option value="SOBERANA_EUROPEA">Nube Soberana Europea</option>
                    <option value="VPC_CLIENTE">VPC Dedicada (AWS / Azure / GCP del Cliente)</option>
                    <option value="ON_PREMISE">Despliegue On-Premise / Air-Gapped</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>VOLUMEN ESTIMADO DE ACCIONES / MES</label>
                  <select value={b2bFormData.tokenVolume} onChange={(e) => setB2bFormData({...b2bFormData, tokenVolume: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }}>
                    <option value="1M_10M">1 a 10 Millones de Acciones / mes</option>
                    <option value="10M_100M">10 a 100 Millones de Acciones / mes</option>
                    <option value="OVER_100M">+100 Millones de Acciones / mes (SLA 99.99%)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" disabled={loadingLead} style={{ flex: 1, padding: '12px', background: '#ca8a04', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '13px', cursor: loadingLead ? 'default' : 'pointer' }}>
                    {loadingLead ? 'Transmitiendo...' : 'Solicitar Propuesta de Despliegue'}
                  </button>
                  <button type="button" onClick={() => setShowEnterpriseModal(false)} style={{ padding: '12px 18px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(3, 7, 18, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
            <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '2.5px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#0ea5e9', fontSize: '11px', borderLeft: '1px solid #374151', paddingLeft: '12px', fontWeight: '800', letterSpacing: '0.8px' }}>
              AI EXECUTION AUTHORIZATION INFRASTRUCTURE
            </span>
          </div>

          <nav style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12.5px', fontWeight: '600' }}>
            <button onClick={() => scrollToSection('problem')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>El Problema</button>
            <button onClick={() => scrollToSection('core-decision')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>El Núcleo</button>
            <button onClick={() => scrollToSection('embed-studio')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>Embed SAARE</button>
            <button onClick={() => scrollToSection('pricing')} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontWeight: 'bold' }}>Planes de Integración</button>
            <button onClick={() => scrollToSection('live-runtime')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Runtime Test</button>
            <button onClick={() => scrollToSection('control-matrix')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Matriz de Control</button>

            <span style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
              ● EDGE RUNTIME ACTIVE
            </span>

            <a 
              href={CONSOLE_URL} 
              target="_blank" 
              rel="noreferrer"
              style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', textDecoration: 'none' }}
            >
              SAARE Control Plane ↗
            </a>
          </nav>
        </div>
      </header>

      {/* SECCIÓN HERO */}
      <section id="hero" style={{ maxWidth: '1040px', margin: '60px auto 80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(14, 165, 233, 0.25)', marginBottom: '24px' }}>
          AI EXECUTION AUTHORIZATION INFRASTRUCTURE
        </div>
        
        <h1 style={{ fontSize: '52px', fontWeight: '900', color: '#ffffff', margin: '0 0 20px 0', letterSpacing: '-1.5px', lineHeight: 1.15 }}>
          AI agents can act.<br />
          <span style={{ color: '#38bdf8' }}>SAARE decides what they're allowed to do.</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '820px', margin: '0 auto 16px auto', lineHeight: 1.5, fontWeight: '500' }}>
          Autoriza, bloquea o escala acciones ejecutables de agentes de IA antes de que alcancen una API, herramienta, transferencia o mutación crítica en la base de datos.
        </p>

        <p style={{ fontSize: '13.5px', color: '#9ca3af', maxWidth: '780px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
          Runtime Authorization · Deterministic Policy Enforcement · Cryptographically Verifiable Decision Records
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#0b0f19', border: '1px solid #1f2937', padding: '10px 24px', borderRadius: '30px', marginBottom: '36px', fontSize: '11.5px', fontFamily: 'monospace', color: '#cbd5e1', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>AGENT</span>
          <span>→</span>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>JUDGE</span>
          <span>→</span>
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>VERDICT</span>
          <span>→</span>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>ENFORCEMENT</span>
          <span>→</span>
          <span style={{ color: '#a855f7', fontWeight: 'bold' }}>EVIDENCE</span>
          <span>→</span>
          <span style={{ color: '#34d399', fontWeight: 'bold' }}>VERIFY</span>
        </div>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => scrollToSection('pricing')} style={{ padding: '14px 28px', backgroundColor: '#10b981', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
            Ver Planes de Integración ↓
          </button>
          <button onClick={() => scrollToSection('embed-studio')} style={{ padding: '14px 28px', backgroundColor: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            Embeber SAARE en tu Stack
          </button>
        </div>
      </section>

      {/* 01 · EL PROBLEMA */}
      <section id="problem" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>01 · EL PROBLEMA</span>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 12px 0' }}>
            AI can decide. Your infrastructure must decide what AI is allowed to execute.
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '840px', margin: '0 0 24px 0' }}>
            Un agente comprometido, mal configurado o inducido a ejecutar una acción puede alcanzar herramientas con capacidad de producir efectos reales no deseados. SAARE introduce una decisión de autorización independiente antes del dispatch.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            <div style={{ background: '#030712', border: '1px solid #374151', padding: '20px', borderRadius: '10px' }}>
              <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '12px' }}>✕ SIN SAARE (Inseguro)</span>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1', marginTop: '8px' }}>
                AGENT / WORKFLOW → TOOL → API → DATABASE → OUTCOME
              </div>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '6px' }}>
                Cualquier desviación lógica o inyección de directivas ejecuta directamente transferencias o mutaciones irreversibles.
              </p>
            </div>

            <div style={{ background: '#030712', border: '1.5px solid #10b981', padding: '20px', borderRadius: '10px' }}>
              <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>✔ CON SAARE (Gobernado)</span>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#34d399', marginTop: '8px' }}>
                AGENT / WORKFLOW → JUDGE → VERDICT → ENFORCEMENT → TOOL / API → PROOF
              </div>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '6px' }}>
                La acción se evalúa de forma determinista antes del dispatch. Si no hay Execution Permit firmado, la llamada es rechazada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PLANES DE INTEGRACIÓN TÉCNICA */}
      <section id="pricing" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>PLANES DE INTEGRACIÓN Y LICENCIAMIENTO</span>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Capacidad y Aprovisionamiento para Producción</h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '700px', margin: '0 auto' }}>
            Despliega la infraestructura de autorización en tu propio stack con claves de acceso dedicadas.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
          {INTEGRATION_TIERS.map((tier) => (
            <div 
              key={tier.id} 
              style={{ 
                background: '#0b0f19', 
                border: tier.highlight ? '2px solid #0284c7' : '1px solid #1f2937', 
                borderRadius: '16px', 
                padding: '32px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: tier.highlight ? '0 10px 30px rgba(2,132,199,0.2)' : 'none'
              }}
            >
              {tier.highlight && (
                <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0284c7', color: '#fff', fontSize: '10.5px', fontWeight: '900', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
                  RECOMENDADO PARA ISVS
                </span>
              )}

              <div>
                <span style={{ color: '#38bdf8', fontSize: '11.5px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{tier.name}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '14px 0 8px 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff' }}>{tier.price}</span>
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>{tier.period}</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  {tier.desc}
                </p>

                <div style={{ borderTop: '1px solid #1f2937', paddingTop: '20px', marginBottom: '24px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#cbd5e1' }}>
                    {tier.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#34d399', fontWeight: 'bold' }}>✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  if (tier.action === 'modal_enterprise') {
                    setShowEnterpriseModal(true);
                  } else {
                    setSelectedTier(tier);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: tier.highlight ? '#0284c7' : '#1e293b',
                  color: '#ffffff',
                  border: tier.highlight ? 'none' : '1px solid #374151',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 06 · EMBED SAARE */}
      <section id="embed-studio" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #10b981', borderRadius: '16px', padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>EMBEDDING MODES</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>Same Judge. Same Verdict. Any Runtime.</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setActiveCodeTab('sdk')} 
                style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'sdk' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'sdk' ? '#111827' : 'transparent', color: activeCodeTab === 'sdk' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                SDK (@saare/judge)
              </button>
              <button 
                onClick={() => setActiveCodeTab('workflow')} 
                style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'workflow' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'workflow' ? '#111827' : 'transparent', color: activeCodeTab === 'workflow' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Workflow Interceptor
              </button>
              <button 
                onClick={() => setActiveCodeTab('sidecar')} 
                style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'sidecar' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'sidecar' ? '#111827' : 'transparent', color: activeCodeTab === 'sidecar' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Sidecar Container (Docker)
              </button>
            </div>
          </div>

          <pre style={{ margin: 0, backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '10px', padding: '20px', color: '#f3f4f6', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.55 }}>
            {codeSnippets[activeCodeTab]}
          </pre>
        </div>
      </section>

      {/* 07 · RUNTIME CONTROL & LIVE EVALUATION */}
      <section id="live-runtime" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>RUNTIME TEST</span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '4px 0 0 0' }}>Adjudicación en Vivo (POST /api/v1/judge)</h2>
            </div>
            <button 
              onClick={handleEvaluateLiveJudge} 
              disabled={liveJudgeLoading}
              style={{ padding: '10px 22px', backgroundColor: liveJudgeLoading ? '#374151' : '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: liveJudgeLoading ? 'default' : 'pointer' }}
            >
              {liveJudgeLoading ? 'Consultando al Judge...' : '▶ Evaluar Acción de Agente'}
            </button>
          </div>

          <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '20px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '12.5px' }}>
            <div style={{ color: '#6b7280', marginBottom: '8px' }}>// ENTRADA: Acción sensible de agente enviada al Decision Core</div>
            <div style={{ color: '#e5e7eb' }}>
              agent-742 solicita: <code>send_wire_transfer</code> de <strong>€18,420.00 EUR</strong> a IBAN <code>[REDACTED]</code>
            </div>

            {liveJudgeResult && liveJudgeResult.verdictId && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #1f2937', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: liveJudgeResult.decision === 'DENY' ? '#f87171' : '#34d399', fontWeight: 'bold' }}>
                    [DECISIÓN: {liveJudgeResult.decision}] · ENFORCEMENT: {liveJudgeResult.enforcement?.action ?? "—"}
                  </span>
                  <span style={{ color: '#34d399', fontSize: '11px' }}>
                    Latencia Core: {liveJudgeResult.latencyMicros != null ? `${liveJudgeResult.latencyMicros} μs` : "not reported"}
                  </span>
                </div>
                <div style={{ color: '#fb923c' }}>Motivo: {liveJudgeResult.reason ?? "—"}</div>
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px' }}>
                  Firma Ed25519: <code>{liveJudgeResult.signature?.value ?? "—"}</code>
                </div>
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                  Execution Permit: <strong style={{ color: liveJudgeResult.executionPermit ? '#34d399' : '#f87171' }}>
                    {liveJudgeResult.executionPermit ? "ISSUED" : "NONE ISSUED (FAIL-CLOSED)"}
                  </strong>
                </div>
              </div>
            )}

            {liveJudgeResult && liveJudgeResult.status === "ERROR" && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #ef4444', paddingTop: '14px', color: '#f87171' }}>
                <strong>RUNTIME ERROR:</strong> {liveJudgeResult.message}
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Detalles: {liveJudgeResult.details}</div>
              </div>
            )}

            {!liveJudgeResult && (
              <div style={{ marginTop: '14px', color: '#64748b' }}>
                Pulsa el botón superior para enviar la petición real al endpoint de evaluación determinista.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 08 · BENCHMARKS DE RENDIMIENTO */}
      <section id="benchmarks" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>08 · LATENCY BENCHMARK</span>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>Especificación Científica de Rendimiento</h2>
            <p style={{ color: '#9ca3af', fontSize: '13.5px', margin: '4px 0 0 0' }}>Métricas desagregadas según el componente de la arquitectura.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '20px', borderRadius: '8px' }}>
              <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 'bold' }}>DECISION CORE (RAM IN-PROCESS)</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '8px 0 4px 0' }}>14.2 μs <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'normal' }}>(P99)</span></div>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Evaluación determinista de políticas en memoria volátil de proceso.</p>
            </div>

            <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '20px', borderRadius: '8px' }}>
              <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>END-TO-END HTTP API / EDGE</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '8px 0 4px 0' }}>1.16 ms <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'normal' }}>(P99)</span></div>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Tránsito de red completo TLS + autenticación + adjudicación en Cloudflare Workers.</p>
            </div>

            <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '20px', borderRadius: '8px' }}>
              <span style={{ color: '#c084fc', fontSize: '12px', fontWeight: 'bold' }}>EVIDENCE & ASYNC SEALING</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '8px 0 4px 0' }}>RFC 3161 <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'normal' }}>(Asíncrono)</span></div>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Sellado temporal criptográfico persistido en Evidence Store sin penalizar la respuesta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 09 · PROOF & INDEPENDENT VERIFIER */}
      <section id="evidence-verifier" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>INDEPENDENT VERIFICATION</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 8px 0' }}>Don't trust the dashboard. Verify the decision.</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '650px', margin: '0 auto' }}>
              Consulta de integridad contra el endpoint público <code>GET /api/v1/verify/:verdictId</code>:
            </p>
          </div>

          <form onSubmit={handleVerifyQuery} style={{ display: 'flex', gap: '10px', maxWidth: '650px', margin: '0 auto 28px auto', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              value={verifyIdInput} 
              onChange={(e) => setVerifyIdInput(e.target.value)} 
              placeholder="Introduce Verdict ID" 
              style={{ flex: 1, minWidth: '280px', padding: '11px 14px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} 
            />
            <button type="submit" disabled={verifyLoading} style={{ padding: '11px 22px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              {verifyLoading ? 'Verificando...' : 'Verificar Registro ↗'}
            </button>
          </form>

          {verifyResult && verifyResult.status === 'VALID' && (
            <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: '#030712', border: '1.5px solid #10b981', borderRadius: '12px', padding: '28px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '14px', marginBottom: '18px' }}>
                <span style={{ color: '#f3f4f6', fontWeight: 'bold', fontSize: '13px' }}>SAARE VERDICT™ // CRYPTOGRAPHICALLY VERIFIED RECORD</span>
                <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '11px', background: 'rgba(52,211,153,0.1)', padding: '3px 10px', borderRadius: '4px', border: '1px solid #10b981' }}>
                  STATUS: VALID
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '10px', fontSize: '12px', lineHeight: 1.6 }}>
                <span style={{ color: '#6b7280' }}>VERDICT ID:</span>
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{verifyResult.verdictId ?? "—"}</span>

                <span style={{ color: '#6b7280' }}>DECISION & ENFORCEMENT:</span>
                <span style={{ color: verifyResult.decision === 'DENY' ? '#f87171' : '#34d399', fontWeight: 'bold' }}>
                  {verifyResult.decision ?? "—"} ({verifyResult.enforcement?.action ?? "—"})
                </span>

                <span style={{ color: '#6b7280' }}>EXECUTION PERMIT:</span>
                <span style={{ color: verifyResult.executionPermit ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
                  {verifyResult.executionPermit ? "ISSUED (ACTION BOUND)" : "NONE ISSUED (FAIL-CLOSED)"}
                </span>

                <span style={{ color: '#6b7280' }}>SUBJECT:</span>
                <span style={{ color: '#e5e7eb' }}>{verifyResult.subject?.id ?? "—"}</span>

                <span style={{ color: '#6b7280' }}>ACTION & RESOURCE:</span>
                <span style={{ color: '#e5e7eb' }}>{verifyResult.action?.type ?? "—"} → {verifyResult.action?.resource ?? "—"}</span>

                <span style={{ color: '#6b7280' }}>POLICY APPLIED:</span>
                <span style={{ color: '#e5e7eb' }}>{verifyResult.policy?.id ? `${verifyResult.policy.id} [v${verifyResult.policy.version ?? "1.0.0"}]` : "—"}</span>

                <span style={{ color: '#6b7280' }}>SIGNATURE (ASYMMETRIC):</span>
                <span style={{ color: '#34d399' }}>{verifyResult.signature?.algorithm ?? "Ed25519"} · VALID</span>

                <span style={{ color: '#6b7280' }}>TIMESTAMP (QUALIFIED):</span>
                <span style={{ color: '#34d399' }}>{verifyResult.timestamp?.protocol ?? "RFC3161"} · VALID ({verifyResult.issuedAt ?? "—"})</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 10 · THREE-PLANE ARCHITECTURE */}
      <section style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>10 · THREE-PLANE ARCHITECTURE</span>
          <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', margin: '6px 0' }}>One Architecture. Three Separated Planes.</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#0b0f19', border: '1px solid #0284c7', padding: '24px', borderRadius: '12px' }}>
            <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>CONTROL PLANE</span>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '8px 0 0 0', lineHeight: 1.5 }}>
              Gestión de agentes, identidades, permisos, compilación de políticas (Policy-as-Code) y administración de despliegues.
            </p>
          </div>
          <div style={{ background: '#0b0f19', border: '1px solid #10b981', padding: '24px', borderRadius: '12px' }}>
            <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 'bold' }}>RUNTIME PLANE</span>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '8px 0 0 0', lineHeight: 1.5 }}>
              Intercepción de contexto, motor Judge determinista, emisión de Execution Permit y procesamiento efímero en memoria.
            </p>
          </div>
          <div style={{ background: '#0b0f19', border: '1px solid #9333ea', padding: '24px', borderRadius: '12px' }}>
            <span style={{ color: '#c084fc', fontSize: '12px', fontWeight: 'bold' }}>EVIDENCE PLANE</span>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '8px 0 0 0', lineHeight: 1.5 }}>
              Persistencia inmutable de veredictos, Proof Bundles sellados con RFC 3161 y verificación independiente sin depender de la UI.
            </p>
          </div>
        </div>
      </section>

      {/* 11 · TARGET SEGMENTS */}
      <section id="target-segments" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MODELOS DE INTEGRACIÓN</span>
          <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>4 Modelos de Integración de Infraestructura</h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '820px', margin: '0 auto', lineHeight: 1.6 }}>
            SAARE opera como un componente crítico de infraestructura (Middleware L7) listo para integrarse en código de agentes, pipelines de inferencia y clústeres privados.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {TARGET_SEGMENTS.map((seg) => (
            <div key={seg.id} style={{ background: '#0b0f19', border: `1px solid ${seg.color}66`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: seg.color, fontSize: '10.5px', fontWeight: '900', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{seg.tag}</span>
                <h3 style={{ color: '#fff', fontSize: '16.5px', margin: '8px 0 10px 0', fontWeight: '800' }}>{seg.title}</h3>
                
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '10px' }}>
                  <strong style={{ color: '#94a3b8' }}>Target:</strong> {seg.who}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px', lineHeight: 1.5 }}>
                  <strong style={{ color: '#f87171' }}>Riesgo Mitigado:</strong> {seg.pain}
                </div>
                <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: '#38bdf8', fontFamily: 'monospace', marginBottom: '14px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '9.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Modo de Integración:</span>
                  {seg.embed}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #1f2937', paddingTop: '12px', marginTop: '10px' }}>
                <span style={{ color: '#64748b', fontSize: '10.5px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Métrica de Licenciamiento:</span>
                <div style={{ color: '#34d399', fontSize: '12px', fontWeight: '700' }}>{seg.pricing}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12 · MATRIZ DE CONTROL A VEREDICTO */}
      <section id="control-matrix" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>12 · CONTROL-TO-VERDICT MATRIX</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>Technical Control-to-Verdict Matrix</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Technical controls mapped to applicable regulatory requirements.</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                  <th style={{ padding: '12px 14px' }}>REQUISITO / MARCO</th>
                  <th style={{ padding: '12px 14px' }}>CONTROL TÉCNICO</th>
                  <th style={{ padding: '12px 14px' }}>POLÍTICA SAARE</th>
                  <th style={{ padding: '12px 14px' }}>DECISIÓN</th>
                  <th style={{ padding: '12px 14px' }}>ENFORCEMENT</th>
                  <th style={{ padding: '12px 14px' }}>EVIDENCIA</th>
                </tr>
              </thead>
              <tbody>
                {CONTROL_MATRIX.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '14px', color: '#38bdf8', fontWeight: 'bold' }}>{row.requirement}</td>
                    <td style={{ padding: '14px', color: '#cbd5e1' }}>{row.control}</td>
                    <td style={{ padding: '14px', color: '#9ca3af', fontFamily: 'monospace' }}>{row.policy}</td>
                    <td style={{ padding: '14px', color: row.decision.includes("DENY") ? "#f87171" : "#34d399", fontWeight: 'bold' }}>{row.decision}</td>
                    <td style={{ padding: '14px', color: '#f59e0b', fontWeight: 'bold' }}>{row.enforcement}</td>
                    <td style={{ padding: '14px', color: '#a855f7' }}>{row.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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
            </div>
            <div style={{ display: 'flex', gap: '18px', fontSize: '12px' }}>
              <a href={`${API_BASE}/verify/VRD-2026-0941A`} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Verificador API</a>
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>SAARE Control Plane</a>
              <button onClick={() => setShowEnterpriseModal(true)} style={{ color: '#94a3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 }}>Contacto Enterprise</button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #111827', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span>Intellectual Property Registration: Safe Creative 2607076315021 / 2607076314949</span>
            <span>© 2026 SAARE Digital Governance</span>
          </div>
        </div>
      </footer>

    </div>
  );
}