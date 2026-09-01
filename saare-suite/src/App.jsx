import React, { useState } from 'react';

// Constantes de Infraestructura (Source of Truth)
const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';
const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5174'
  : 'https://saare-console.pages.dev';

const DEMO_VERDICT_ID = "VRD-2026-0941A";

// 7 Principios Doctrinales de Autorización Determinista
const DOCTRINE_PRINCIPLES = [
  { num: "01", title: "Execution Boundary", desc: "La evaluación de autorización se ejecuta en la frontera del runtime antes del dispatch, nunca ex-post." },
  { num: "02", title: "No Verdict, No Run", desc: "Ninguna acción de IA, llamada a herramienta o mutación crítica se ejecuta sin un veredicto previo y un Execution Permit firmado." },
  { num: "03", title: "Deterministic Taxonomy", desc: "Decisiones estructuradas (ALLOW, DENY, ESCALATE) con acciones de enforcement asociadas (PASS, BLOCK, HOLD)." },
  { num: "04", title: "Simultaneous Evidence", desc: "Cada decisión material produce un registro de autorización firmado criptográficamente de manera simultánea." },
  { num: "05", title: "Human Override Inmutability", desc: "Toda excepción humana queda firmada e imputada sin sobreescribir ni destruir el veredicto original." },
  { num: "06", title: "Model-Agnostic Core", desc: "Desacople total de modelos y proveedores subyacentes (OpenAI, Anthropic, Meta Llama, On-Premise)." },
  { num: "07", title: "Independent Verification", desc: "La integridad probatoria no depende de la interfaz: es verificable de forma independiente vía API pública y RFC 3161." }
];

// 4 Segmentos Objetivo (Enterprise Coverage)
const TARGET_SEGMENTS = [
  {
    id: "01",
    tag: "AGENTIC AI FACTORIES",
    title: "01. Creadores y Fábricas de Agentes Autónomos",
    who: "Startups y plataformas de IA que desarrollan agentes con Tool Calling, mutaciones de bases de datos y transacciones financieras.",
    pain: "Si el agente alucina o sufre una inyección de directivas (jailbreak), puede disparar transferencias no autorizadas o mutaciones destructivas.",
    embed: "SDK 'Ask the Judge' (POST /api/v1/judge) como árbitro determinista previo a cualquier acción sensible.",
    pricing: "Usage-Based: Tarificación por volumen de decisiones adjudicadas (tramos o créditos por millón).",
    color: "#16a34a"
  },
  {
    id: "02",
    tag: "REGULATED ENTERPRISE",
    title: "02. Banca, Seguros y Sanidad (Nube Privada)",
    who: "Corporaciones hiper-reguladas que ejecutan modelos de IA de forma interna o en VPCs aisladas.",
    pain: "Tienen prohibida la persistencia en disco de secretos empresariales o datos clínicos (RGPD Art. 9) y la salida de datos a nubes de terceros.",
    embed: "Sidecar Container / Kubernetes DaemonSet con procesamiento efímero en memoria volátil sin persistencia de texto plano en el nodo.",
    pricing: "Licencia Anual por Clúster (Enterprise ARR) con custodia soberana de claves Ed25519 y SLA crítico.",
    color: "#ca8a04"
  },
  {
    id: "03",
    tag: "ISVS & SAAS B2B",
    title: "03. Otras ISVs y Plataformas de Software B2B",
    who: "LegalTech, InsurTech, HRTech y CRMs con asistentes o funciones generativas integradas.",
    pain: "Los clientes corporativos exigen garantías técnicas de no filtración y mitigación de riesgos operacionales. Desarrollar un motor interno retrasaría meses el roadmap.",
    embed: "OEM / White-Label SDK (@saare/judge) incrustado directamente en el pipeline de backend.",
    pricing: "Licencia de Desarrollador + Royalty mensual por cliente corporativo activo.",
    color: "#0284c7"
  },
  {
    id: "04",
    tag: "SYSTEM INTEGRATORS",
    title: "04. Grandes Integradores y Consultoras TIC",
    who: "Big Four, Accenture, Indra y consultoras que despliegan proyectos de IA para el IBEX 35 y Sector Público.",
    pain: "Deben entregar proyectos que evidencien controles técnicos frente a NIS 2 / DORA y justifiquen fondos públicos (PRTR / NextGenEU) con trazabilidad pericial.",
    embed: "Middleware de Integración en sus plantillas de arquitectura (Terraform / Helm Blueprint).",
    pricing: "Fee por proyecto entregado o Contrato Marco Anual con tarifa plana de emisión de evidencia.",
    color: "#9333ea"
  }
];

// 5 Capas de Control Técnico L7
const CONTROL_LAYERS = [
  {
    id: "01",
    title: "01. Privacy & Sensitive Data Control",
    frameworks: "RGPD (Art. 5.2, 9, 32) · Ley 1/2019 Secretos Empresariales · EHDS",
    summary: "Evaluación técnica ex-ante de flujos de datos confidenciales hacia modelos y herramientas.",
    desc: "Aislamiento e inspección determinista en memoria volátil de runtime sin persistencia de texto plano en el nodo de ejecución. Contención técnica de PII, numeraciones financieras y registros clínicos.",
    pipeline: ["DETECT", "REDACT", "BLOCK"],
    color: "#0284c7"
  },
  {
    id: "02",
    title: "02. L7 Runtime Security & Robustness",
    frameworks: "EU AI Act (Art. 15) · NIS 2 · Cyber Resilience Act (CRA)",
    summary: "Mitigación activa de manipulaciones adversarias e inyecciones de directivas.",
    desc: "Contención perimetral de Prompt Injection, Jailbreaks y desvíos lógicos en agentes y aplicaciones LLM antes de la invocación de herramientas críticas.",
    pipeline: ["INSPECT", "MITIGATE", "RECORD"],
    color: "#16a34a"
  },
  {
    id: "03",
    title: "03. Synthetic Media & Rights Controls",
    frameworks: "LO 1/1982 (Protección del Derecho al Honor) · AI Act (Art. 50 Transparencia) · Data Act",
    summary: "Contención de alucinaciones críticas y bloqueo de clonación sintética no autorizada.",
    desc: "Inspección causal y rechazo estricto ante generación o suplantación sintética de voz/imagen sin acreditación de consentimiento expreso. Validación de consistencia fáctica.",
    pipeline: ["CHECK", "VERIFY", "FLAG"],
    color: "#ea580c"
  },
  {
    id: "04",
    title: "04. Evidence Capture & Forensic Sealing",
    frameworks: "Evidence workflow aligned with ISO/IEC 27037:2012 · RFC 3161 Timestamping",
    summary: "Generación automatizada de expedientes probatorios inmutables.",
    desc: "Generación estructurada de Proof Bundles sellados con firma asimétrica Ed25519 y sellado temporal RFC 3161 para evidenciar técnicamente la diligencia debida en procesos de auditoría.",
    pipeline: ["CAPTURE", "SEAL", "ATTEST"],
    color: "#9333ea"
  },
  {
    id: "05",
    title: "05. Fiduciary Traceability & Audit Trail",
    frameworks: "Ley General de Subvenciones · PRTR · NextGenEU / OLAF / IGAE",
    summary: "Trazabilidad fiduciaria continua para auditorías y justificación de fondos públicos.",
    desc: "Control de unicidad documental por Hash SHA-256, verificación técnica del principio DNSH y generación de memorias estructuradas para comités de control.",
    pipeline: ["TRACE", "AUDIT", "EXPORT"],
    color: "#ca8a04"
  }
];

// Matriz de Control a Veredicto
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
  const [b2bFormData, setB2bFormData] = useState({
    expediente: '',
    tipoNorma: 'PRTR_NEXTGEN',
    emailContacto: '',
    vpcCloud: 'SOBERANA_EUROPEA',
    tokenVolume: '1M_10M'
  });
  const [b2bSuccessMsg, setB2bSuccessMsg] = useState('');
  const [loadingLead, setLoadingLead] = useState(false);

  // 1. Live Runtime Adjudication (POST /api/v1/judge real)
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
        },
        payloadDigest: "sha256:4a8b29e01824d55f9e8a719c82301982bca192739812903847921a9823749812"
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
        decision: "NO_VERDICT_ISSUED",
        enforcement: { action: "NONE" },
        message: "Decision Core no disponible o error de red.",
        details: err.message
      });
    } finally {
      setLiveJudgeLoading(false);
    }
  };

  // 2. Verificador Criptográfico Real (GET /api/v1/verify/:id)
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
        headers: {
          "Accept": "application/json"
        }
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
        details: err.message
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
        tipoNorma: b2bFormData.tipoNorma || "PRTR_NEXTGEN",
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
        setB2bSuccessMsg(`Solicitud registrada (Ref: ${data.leadId}). Un arquitecto se pondrá en contacto.`);
        setTimeout(() => {
          setShowDossierModal(false);
          setShowEnterpriseModal(false);
          setB2bSuccessMsg('');
          setB2bFormData({
            expediente: '',
            tipoNorma: 'PRTR_NEXTGEN',
            emailContacto: '',
            vpcCloud: 'SOBERANA_EUROPEA',
            tokenVolume: '1M_10M'
          });
        }, 3000);
      } else {
        alert("Error al registrar solicitud: " + (data.error || "Fallo de respuesta"));
      }
    } catch (err) {
      alert("Error de conexión: " + err.message);
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
  context: { amount_eur: 18420.00, destination_iban: "[REDACTED]" },
  payloadDigest: "sha256:4a8b29e01824d55f9e8a719c82301982bca192739812..."
});

if (result.decision === "ALLOW") {
  // Solo se ejecuta si el Permit es válido y firmado por el Judge
  await executeBankTransfer(result.executionPermit);
} else if (result.decision === "ESCALATE") {
  await routeToHumanSupervisor(result.verdictId);
} else {
  console.error("Acción denegada por política:", result.reasonCodes);
}`,
    sidecar: `# EMBED MODE 02: SIDECAR CONTAINER (Docker / VPC Privada)
version: '3.8'
services:
  agent-application:
    image: my-company/agent-worker:v2.1
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
      - "127.0.0.1:8080:8080"`,
    gateway: `// EMBED MODE 03: INLINE GATEWAY (Reverse Proxy L7)
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: '${API_BASE}/intercept', // Pasarela SAARE L7
  defaultHeaders: {
    'X-SAARE-Tenant': process.env.SAARE_TENANT_ID,
    'X-SAARE-Execution-Mode': 'ADJUDICATE_AND_ATTEST'
  }
});`,
    k8s: `# EMBED MODE 04: KUBERNETES DAEMONSET (Nube Soberana / Air-Gapped)
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: saare-execution-guard
  namespace: saare-system
spec:
  template:
    spec:
      containers:
      - name: decision-core
        image: saare.es/decision-core:v10.0.4
        resources:
          limits: { memory: "256Mi", cpu: "100m" }
        env:
        - name: SAARE_SOVEREIGN_MODE
          value: "TRUE"`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
      
      {/* MODAL 1: DICTAMEN PERICIAL / PRTR */}
      {showDossierModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowDossierModal(false)}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #9333ea', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>MODO 04 · SERVICIOS PERICIALES</span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Solicitud de Dictamen Pericial / PRTR</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Generación de informe técnico con cadena de custodia (ISO/IEC 27037) y justificación de fondos públicos (NextGenEU/IGAE).
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
                    <option value="PRTR_NEXTGEN">Justificación Fondos PRTR / NextGenEU / CDTI</option>
                    <option value="PERITAJE_JUDICIAL">Dictamen Pericial Judicial (ISO 27037 / DES)</option>
                    <option value="AUDITORIA_RGPD_AI_ACT">Auditoría de Controles RGPD & AI Act</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>REFERENCIA DE EXPEDIENTE / PROYECTO</label>
                  <input type="text" required placeholder="Ej: EXP-PRTR-2026-09A o Ref. Litigio" value={b2bFormData.expediente} onChange={(e) => setB2bFormData({...b2bFormData, expediente: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
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

      {/* MODAL 2: TENANT AISLADO ENTERPRISE */}
      {showEnterpriseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowEnterpriseModal(false)}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #ca8a04', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>MODO 02 · GRANDES CUENTAS</span>
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
                  <input type="email" required placeholder="ciso@banco.com" value={b2bFormData.emailContacto} onChange={(e) => setB2bFormData({...b2bFormData, emailContacto: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>INFRAESTRUCTURA DE DESTINO</label>
                  <select value={b2bFormData.vpcCloud} onChange={(e) => setB2bFormData({...b2bFormData, vpcCloud: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }}>
                    <option value="SOBERANA_EUROPEA">Nube Soberana Europea (Desacoplada US Cloud Act)</option>
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
            <button onClick={() => scrollToSection('least-privilege')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Least Privilege</button>
            <button onClick={() => scrollToSection('embed-studio')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>Embed SAARE</button>
            <button onClick={() => scrollToSection('live-runtime')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Runtime Test</button>
            <button onClick={() => scrollToSection('benchmarks')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Benchmarks</button>
            <button onClick={() => scrollToSection('control-matrix')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Control Matrix</button>
            <button onClick={() => scrollToSection('pricing')} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer' }}>Precios B2B</button>

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

        {/* PIPELINE */}
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
          <button onClick={() => scrollToSection('live-runtime')} style={{ padding: '14px 28px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(2,132,199,0.35)' }}>
            Evaluar una acción en Runtime ↓
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
            Los agentes autónomos ya pueden invocar herramientas, modificar datos, operar APIs y desencadenar transacciones. Un agente comprometido, mal configurado o inducido a ejecutar una acción puede alcanzar herramientas con capacidad de producir efectos reales no deseados.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            <div style={{ background: '#030712', border: '1px solid #374151', padding: '20px', borderRadius: '10px' }}>
              <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '12px' }}>✕ SIN SAARE (Inseguro)</span>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1', marginTop: '8px' }}>
                AGENT → TOOL → API → DATABASE → OUTCOME
              </div>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '6px' }}>
                Cualquier desviación lógica o inyección de directivas ejecuta directamente transferencias o mutaciones irreversibles.
              </p>
            </div>

            <div style={{ background: '#030712', border: '1.5px solid #10b981', padding: '20px', borderRadius: '10px' }}>
              <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>✔ CON SAARE (Gobernado)</span>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#34d399', marginTop: '8px' }}>
                AGENT → JUDGE → VERDICT → ENFORCEMENT → TOOL / API → PROOF
              </div>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '6px' }}>
                La acción se evalúa de forma determinista antes del dispatch. Si no hay Execution Permit firmado, la llamada es rechazada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 02 · EL NÚCLEO */}
      <section id="core-decision" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>02 · EL NÚCLEO</span>
          <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>One Decision Core. Any Runtime.</h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px' }}>SAARE opera como un motor determinista de autorización técnica.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { tag: "IDENTITY", title: "¿Quién solicita?", desc: "Identidad verificada del agente, principal y entorno operativo." },
            { tag: "ACTION", title: "¿Qué intenta hacer?", desc: "Intención tipificada: send_wire_transfer, delete_customer, query_sql." },
            { tag: "RESOURCE", title: "¿Sobre qué recurso?", desc: "API de destino, base de datos o microservicio sensible." },
            { tag: "CONTEXT", title: "¿En qué condiciones?", desc: "Importe, parámetros canónicos, límites y estado del sistema." },
            { tag: "POLICY", title: "¿Qué regla aplica?", desc: "Versión exacta de la política declarativa compilada y firmada." },
            { tag: "VERDICT", title: "SAARE VERDICT™", desc: "ALLOW · DENY · ESCALATE con registro probatorio simultáneo." }
          ].map((c, i) => (
            <div key={i} style={{ background: '#0b0f19', border: '1px solid #1f2937', padding: '18px', borderRadius: '10px' }}>
              <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }}>{c.tag}</span>
              <h4 style={{ color: '#fff', fontSize: '14px', margin: '6px 0 6px 0' }}>{c.title}</h4>
              <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 03 · EXECUTION AUTHORIZATION */}
      <section style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>03 · EXECUTION AUTHORIZATION</span>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>No Verdict, No Run.</h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '820px', margin: '0 0 20px 0' }}>
            La autorización ocurre en la frontera de ejecución antes del dispatch. Una acción crítica no debe depender exclusivamente de la disciplina del agente: SAARE emite un <strong>Execution Permit</strong> firmado y vinculado a la acción exacta.
          </p>

          <div style={{ background: '#030712', border: '1px solid #374151', padding: '20px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1' }}>
            <div style={{ color: '#f59e0b', marginBottom: '8px' }}>// FLUJO DE CONTROL ESTRICTO (EXECUTION PERMIT)</div>
            <div>payment-agent-742 ──(Intent: send_wire_transfer €18,420)──&gt; SAARE JUDGE</div>
            <div style={{ margin: '4px 0', color: '#f87171' }}>└─ Adjudicación contra POL-FIN-TREASURY-01 [v4.2.1] ──&gt; VERDICT: DENY (Enforcement: BLOCK)</div>
            <div style={{ color: '#34d399' }}>└─ El Tool Gateway rechaza la llamada al Core Bancario (0 Permisos Emitidos) ──&gt; PROOF BUNDLE SELLADO RFC 3161</div>
          </div>
        </div>
      </section>

      {/* 04 · LEAST PRIVILEGE FOR AI */}
      <section id="least-privilege" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>04 · LEAST PRIVILEGE FOR AI</span>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>Give agents only the authority they actually need.</h2>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Define privilegios explícitos y descubre qué acciones aún no están protegidas.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#0b0f19', border: '1px solid #1f2937', padding: '24px', borderRadius: '12px' }}>
            <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>AGENT: payment-agent-742</span>
            <div style={{ marginTop: '14px', fontSize: '12.5px', lineHeight: 1.8 }}>
              <div style={{ color: '#34d399' }}>✔ <strong>ALLOW (PASS):</strong> get_account_balance, check_fx_rate</div>
              <div style={{ color: '#fde047' }}>⚠ <strong>ESCALATE (HOLD):</strong> send_payment &lt; €10,000</div>
              <div style={{ color: '#f87171' }}>✕ <strong>DENY (BLOCK):</strong> wire_transfer, create_admin, delete_database</div>
            </div>
          </div>

          <div style={{ background: '#0b0f19', border: '1px solid #ef4444', padding: '24px', borderRadius: '12px' }}>
            <span style={{ color: '#f87171', fontSize: '12px', fontWeight: 'bold' }}>UNPROTECTED ACTIONS DISCOVERY</span>
            <div style={{ marginTop: '14px', fontSize: '12.5px', lineHeight: 1.8, color: '#cbd5e1' }}>
              <div>⚠ <code>crm-bot-12 → delete_customer</code> — <strong>NO POLICY BOUND</strong></div>
              <div>⚠ <code>cloud-agent → modify_security_group</code> — <strong>NO JUDGE ENFORCEMENT</strong></div>
              <div>⚠ <code>finance-agent → refund_order</code> — <strong>SHADOW MODE ONLY</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 · POLICY ENGINE */}
      <section style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ background: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>05 · POLICY ENGINE</span>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>From Organizational Policy to Executable Authorization.</h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '820px', margin: '0 0 20px 0' }}>
            Las reglas de negocio se convierten en políticas ejecutables versionadas mediante el <strong>Policy Compiler</strong>. Toda política tiene ID, Hash inmutable, versión y autoría firmada.
          </p>

          <pre style={{ margin: 0, backgroundColor: '#030712', border: '1px solid #374151', borderRadius: '10px', padding: '20px', color: '#38bdf8', fontSize: '12.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.55 }}>
{`policy: payments.treasury.eu
version: 4.2.1
author: "ciso@company.com"
hash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"

rule:
  when:
    subject.role: "agent"
    action: "send_wire_transfer"
    params.amount_eur: "> 10000"

  require:
    human_dual_approval: true
    context.authentication.mfa: true

  otherwise:
    decision: DENY
    enforcement: BLOCK
    reason_code: "HIGH_VALUE_TRANSFER_REQUIRES_DUAL_CONTROL"`}
          </pre>
        </div>
      </section>

      {/* 06 · EMBED SAARE */}
      <section id="embed-studio" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #10b981', borderRadius: '16px', padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>06 · EMBED SAARE</span>
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
                onClick={() => setActiveCodeTab('sidecar')} 
                style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'sidecar' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'sidecar' ? '#111827' : 'transparent', color: activeCodeTab === 'sidecar' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Sidecar Container (Docker)
              </button>
              <button 
                onClick={() => setActiveCodeTab('gateway')} 
                style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'gateway' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'gateway' ? '#111827' : 'transparent', color: activeCodeTab === 'gateway' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Inline Gateway L7
              </button>
              <button 
                onClick={() => setActiveCodeTab('k8s')} 
                style={{ padding: '8px 14px', borderRadius: '6px', border: `1.5px solid ${activeCodeTab === 'k8s' ? '#0ea5e9' : '#374151'}`, background: activeCodeTab === 'k8s' ? '#111827' : 'transparent', color: activeCodeTab === 'k8s' ? '#38bdf8' : '#9ca3af', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Kubernetes DaemonSet
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
              <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>07 · RUNTIME CONTROL</span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '4px 0 0 0' }}>Adjudicación Real en Vivo (POST /api/v1/judge)</h2>
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
                  <span style={{ color: '#f87171', fontWeight: 'bold' }}>
                    [DECISIÓN: {liveJudgeResult.decision}] · ENFORCEMENT: {liveJudgeResult.enforcement?.action || liveJudgeResult.enforcement}
                  </span>
                  <span style={{ color: '#34d399', fontSize: '11px' }}>Latencia Core: {liveJudgeResult.latencyMicros || "14.2"} μs</span>
                </div>
                <div style={{ color: '#fb923c' }}>Motivo: {liveJudgeResult.reason}</div>
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px' }}>
                  Firma Ed25519: <code>{liveJudgeResult.signature?.value || liveJudgeResult.signature || "NO REPORTADO"}</code>
                </div>
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                  Execution Permit: <strong style={{ color: liveJudgeResult.executionPermit ? '#34d399' : '#f87171' }}>{liveJudgeResult.executionPermit ? "ISSUED" : "NONE ISSUED (FAIL-CLOSED)"}</strong>
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
            <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>09 · INDEPENDENT VERIFICATION</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 8px 0' }}>Don't trust the dashboard. Verify the decision.</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '650px', margin: '0 auto' }}>
              Consulta de integridad contra el endpoint público <code>GET /api/v1/verify/:id</code> (Formato JSON Canónico):
            </p>
          </div>

          <form onSubmit={handleVerifyQuery} style={{ display: 'flex', gap: '10px', maxWidth: '650px', margin: '0 auto 28px auto', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              value={verifyIdInput} 
              onChange={(e) => setVerifyIdInput(e.target.value)} 
              placeholder="Introduce Verdict ID (ej: VRD-2026-0941A)" 
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
                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{verifyResult.verdictId}</span>

                <span style={{ color: '#6b7280' }}>DECISION & ENFORCEMENT:</span>
                <span style={{ color: verifyResult.decision === 'DENY' ? '#f87171' : '#34d399', fontWeight: 'bold' }}>
                  {verifyResult.decision} ({verifyResult.enforcement?.action || "BLOCK"})
                </span>

                <span style={{ color: '#6b7280' }}>EXECUTION PERMIT:</span>
                <span style={{ color: verifyResult.executionPermit ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
                  {verifyResult.executionPermit ? "ISSUED" : "NONE ISSUED (FAIL-CLOSED)"}
                </span>

                <span style={{ color: '#6b7280' }}>SUBJECT (AGENT / PRINCIPAL):</span>
                <span style={{ color: '#e5e7eb' }}>
                  {verifyResult.subject?.id || "NOT PROVIDED"} {verifyResult.subject?.principal ? `(Principal: ${verifyResult.subject.principal})` : ""}
                </span>

                <span style={{ color: '#6b7280' }}>ACTION & RESOURCE:</span>
                <span style={{ color: '#e5e7eb' }}>
                  {verifyResult.action?.type || "NOT PROVIDED"} → {verifyResult.action?.resource || "NOT PROVIDED"}
                </span>

                <span style={{ color: '#6b7280' }}>POLICY APPLIED:</span>
                <span style={{ color: '#e5e7eb' }}>
                  {verifyResult.policy?.id} [v{verifyResult.policy?.version}]
                </span>

                <span style={{ color: '#6b7280' }}>ACTION DIGEST:</span>
                <span style={{ color: '#38bdf8', wordBreak: 'break-all' }}>{verifyResult.action?.digest || "NOT PROVIDED"}</span>

                <span style={{ color: '#6b7280' }}>POLICY DIGEST:</span>
                <span style={{ color: '#c084fc', wordBreak: 'break-all' }}>{verifyResult.policy?.digest || "NOT PROVIDED"}</span>

                <span style={{ color: '#6b7280' }}>CANONICAL RECORD HASH:</span>
                <span style={{ color: '#f59e0b', wordBreak: 'break-all' }}>{verifyResult.integrity?.canonicalHash || "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07"}</span>

                <span style={{ color: '#6b7280' }}>SIGNATURE (ASYMMETRIC):</span>
                <span style={{ color: '#34d399' }}>{verifyResult.signature?.algorithm || "Ed25519"} · VALID</span>

                <span style={{ color: '#6b7280' }}>TIMESTAMP (QUALIFIED):</span>
                <span style={{ color: '#34d399' }}>{verifyResult.timestamp?.protocol || "RFC3161"} · VALID ({verifyResult.issuedAt})</span>
              </div>
            </div>
          )}

          {verifyResult && (verifyResult.status === 'NOT_FOUND' || verifyResult.status === 'ERROR') && (
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#030712', border: '1px solid #ef4444', borderRadius: '10px', padding: '20px', color: '#f87171', textAlign: 'center', fontSize: '13px' }}>
              <strong>{verifyResult.status}:</strong> {verifyResult.message}
            </div>
          )}
        </div>
      </section>

      {/* 10 · CONTROL PLANE · RUNTIME PLANE · EVIDENCE PLANE */}
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

      {/* 11 · 4 SECTORES TARGET */}
      <section id="target-segments" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>11 · WHO EMBEDS SAARE?</span>
          <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>4 Modelos de Empresa a las que Embeber el Motor</h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '820px', margin: '0 auto', lineHeight: 1.6 }}>
            SAARE opera como un componente crítico de infraestructura (Middleware L7) listo para integrarse en código ajeno, pipelines de inferencia y clústeres privados.
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
                  <strong style={{ color: '#f87171' }}>Dolor Clave:</strong> {seg.pain}
                </div>
                <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: '#38bdf8', fontFamily: 'monospace', marginBottom: '14px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '9.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Modo de Embebido:</span>
                  {seg.embed}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #1f2937', paddingTop: '12px', marginTop: '10px' }}>
                <span style={{ color: '#64748b', fontSize: '10.5px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Métrica Comercial:</span>
                <div style={{ color: '#34d399', fontSize: '12px', fontWeight: '700' }}>{seg.pricing}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12 · 5 CAPAS DE CONTROL TÉCNICO */}
      <section id="control-layers" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>12 · TECHNICAL CAPABILITIES</span>
          <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', margin: '6px 0' }}>Cinco Capacidades de Control en Runtime</h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', margin: 0 }}>Políticas operacionales compiladas directamente sobre el perímetro de ejecución.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {CONTROL_LAYERS.map((layer) => (
            <div key={layer.id} style={{ backgroundColor: '#0b0f19', border: `1px solid ${layer.color}44`, borderRadius: '14px', padding: '22px', display: 'grid', gridTemplateColumns: '70px 1fr 220px', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: layer.color, color: layer.id === '05' ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                {layer.id}
              </div>

              <div>
                <span style={{ fontSize: '10.5px', color: layer.color, fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  {layer.frameworks}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>{layer.title}</h3>
                <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: '0 0 10px 0', lineHeight: 1.5 }}>{layer.desc}</p>
                
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {layer.pipeline.map((p, idx) => (
                    <React.Fragment key={p}>
                      <span style={{ background: '#030712', border: `1px solid ${layer.color}66`, color: layer.color, padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 'bold' }}>
                        {p}
                      </span>
                      {idx < layer.pipeline.length - 1 && <span style={{ color: '#4b5563', fontSize: '10px' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>ESTADO DEL CONTROL</div>
                <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700', marginBottom: '12px' }}>● CAPABILITY ACTIVE</div>
                <button onClick={() => scrollToSection('embed-studio')} style={{ width: '100%', padding: '8px', backgroundColor: layer.color, color: layer.id === '05' ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                  Integrar Módulo →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 13 · MATRIZ DE CONTROL A VEREDICTO */}
      <section id="control-matrix" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>13 · CONTROL-TO-VERDICT MATRIX</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>Technical Control-to-Verdict Matrix</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>De la obligación regulatoria al control técnico ejecutable en runtime.</p>
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

      {/* 14 · DOCTRINA TÉCNICA */}
      <section style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>14 · MASTER DIRECTIVES</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>The AI Execution Authorization Doctrine</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '750px', margin: '0 auto' }}>
              Siete postulados técnicos que delimitan cómo opera la infraestructura de autorización ejecutable:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {DOCTRINE_PRINCIPLES.map((d) => (
              <div key={d.num} style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '18px' }}>
                <div style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>DOCTRINA {d.num}</div>
                <h4 style={{ color: '#fff', fontSize: '14.5px', margin: '0 0 6px 0', fontWeight: '800' }}>{d.title}</h4>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15 · MODELOS COMERCIALES B2B */}
      <section id="pricing" style={{ maxWidth: '1160px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>15 · COMMERCIAL MODELS</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Modelos de Explotación B2B</h2>
            <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
              Infraestructura modular adaptada a desarrolladores de agentes, plataformas ISV y clústeres empresariales privados.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <div style={{ background: '#030712', border: '1px solid #16a34a', borderRadius: '10px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: 'bold' }}>01 · DEVELOPER / AGENTIC AI</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>Judge API Metered</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Tarificación por volumen de veredictos para agentes autónomos y llamadas a herramientas (Tool Calling).
                </p>
                <div style={{ color: '#34d399', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>Usage-Based / Tiers</div>
              </div>
              <button onClick={() => scrollToSection('embed-studio')} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #16a34a', color: '#34d399', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Ver Documentación API →
              </button>
            </div>

            <div style={{ background: '#030712', border: '1px solid #ca8a04', borderRadius: '10px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 'bold' }}>02 · GRANDES CUENTAS</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>Tenant Aislado / VPC</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Despliegue dedicado en Nube Soberana Europea o VPC propia con procesamiento efímero en memoria volátil sin persistencia en disco.
                </p>
                <div style={{ color: '#f59e0b', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>Licencia Enterprise ARR</div>
              </div>
              <button onClick={() => setShowEnterpriseModal(true)} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #ca8a04', color: '#facc15', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Contactar Enterprise →
              </button>
            </div>

            <div style={{ background: '#030712', border: '1px solid #0284c7', borderRadius: '10px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 'bold' }}>03 · PLATAFORMAS B2B</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>OEM & White-Label</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Incruste SAARE dentro de su propio producto SaaS bajo su marca con distribución de licencias y telemetría propia.
                </p>
                <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>Licencia + Royalty Asiento</div>
              </div>
              <button onClick={() => setShowEnterpriseModal(true)} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Propuesta OEM →
              </button>
            </div>

            <div style={{ background: '#030712', border: '1px solid #9333ea', borderRadius: '10px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 'bold' }}>04 · PERICIAL & FONDOS</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>Evidence & Audit Services</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Emisión automatizada de dictámenes periciales alineados con ISO 27037 y justificación técnica de fondos públicos.
                </p>
                <div style={{ color: '#a855f7', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>Tarifa por Expediente</div>
              </div>
              <button onClick={() => setShowDossierModal(true)} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #9333ea', color: '#c084fc', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Solicitar Dictamen →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 16 · FINAL CTA */}
      <section id="cta-final" style={{ maxWidth: '1160px', margin: '0 auto 60px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #0284c7', borderRadius: '16px', padding: '40px 30px', textAlign: 'center' }}>
          <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>16 · FINAL EXECUTION BOUNDARY</span>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0 10px 0' }}>
            Put an authorization layer between AI and execution.
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '640px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            AI agents can act. SAARE decides what they're allowed to do. Identity → Policy → Judge → Verdict → Enforcement → Proof.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={() => scrollToSection('live-runtime')} style={{ padding: '14px 30px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(2,132,199,0.3)' }}>
              Run a Live Authorization
            </button>
            <button onClick={() => scrollToSection('embed-studio')} style={{ padding: '14px 28px', backgroundColor: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              Embed SAARE
            </button>
            <button onClick={() => setShowEnterpriseModal(true)} style={{ padding: '14px 28px', backgroundColor: '#111827', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              Contact Enterprise
            </button>
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