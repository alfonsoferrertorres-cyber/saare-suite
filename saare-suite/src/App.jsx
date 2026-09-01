import React, { useState } from 'react';
import JSZip from 'jszip';

// Constantes de Infraestructura y Anclaje Registral
const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";
const STRIPE_LINK = import.meta.env.VITE_STRIPE_LINK || 'https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY';
const CONSOLE_URL = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5174'
  : 'https://saare-console.pages.dev';
const CANONICAL_HASH = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";
const VERIFY_URL = `${API_BASE}/verify/${CANONICAL_HASH}`;

// Principios Doctrinales del Motor
const DOCTRINE_PRINCIPLES = [
  { num: "01", title: "Execution Boundary", desc: "La gobernanza técnica se ejecuta en la frontera del runtime antes del dispatch, nunca ex-post." },
  { num: "02", title: "No Verdict, No Run", desc: "Ninguna acción de IA, llamada a API o mutación de datos se ejecuta sin un veredicto previo del Judge." },
  { num: "03", title: "Deterministic Taxonomy", desc: "Veredictos estructurados: ALLOW, REDACT, BLOCK, ESCALATE, QUARANTINE, REVIEW." },
  { num: "04", title: "Simultaneous Evidence", desc: "Cada decisión material genera un Proof Bundle firmado criptográficamente de manera simultánea[cite: 1]." },
  { num: "05", title: "Human Override Inmutability", desc: "Toda excepción humana queda firmada e imputada sin sobrescribir ni destruir el veredicto original[cite: 1]." },
  { num: "06", title: "Model-Agnostic Core", desc: "Desacople total de proveedores externos (OpenAI, Anthropic, Meta Llama o modelos locales)." },
  { num: "07", title: "Independent Verification", desc: "La validez probatoria no depende de la interfaz: es verificable vía API pública y RFC 3161[cite: 1]." }
];

// 4 Segmentos Objetivo (Modelos de Explotación ISV)
const TARGET_SEGMENTS = [
  {
    id: "01",
    tag: "ISVS & SAAS B2B",
    title: "Otras ISVs y Plataformas de Software B2B",
    who: "LegalTech, InsurTech, HRTech y CRMs con funciones de IA generativa.",
    pain: "Los clientes corporativos exigen garantías de no filtración (RGPD Art. 9) y cumplimiento del EU AI Act. Desarrollar un motor interno retrasaría meses el producto.",
    embed: "OEM / White-Label SDK (@saare/judge) incrustado directamente en el pipeline de backend[cite: 1].",
    pricing: "Licencia de desarrollador + Royalty mensual por cliente corporativo activo[cite: 1].",
    color: "#0284c7"
  },
  {
    id: "02",
    tag: "AGENTIC AI FACTORIES",
    title: "Creadores de Agentes Autónomos",
    who: "Startups de IA que desarrollan agentes con Tool Calling, mutaciones de bases de datos y transacciones.",
    pain: "Si el agente alucina o sufre una inyección de directivas (jailbreak), puede disparar pagos no autorizados o alterar registros críticos.",
    embed: "SDK 'Ask the Judge' (POST /api/v1/judge) como árbitro determinista previo a cualquier acción sensible[cite: 1].",
    pricing: "Metered API: Tarificación por tramos o créditos por cada millón de veredictos adjudicados[cite: 1].",
    color: "#16a34a"
  },
  {
    id: "03",
    tag: "SYSTEM INTEGRATORS",
    title: "Grandes Integradores y Consultoras TIC",
    who: "Big Four, Accenture, Indra y consultoras que despliegan proyectos para el IBEX 35 y Sector Público.",
    pain: "Necesitan acreditar diligencia debida, justificar fondos europeos (PRTR / NextGenEU) y cumplir NIS 2 / DORA con trazabilidad pericial.",
    embed: "Middleware de Integración en sus plantillas de arquitectura (Terraform / Helm Blueprint)[cite: 1].",
    pricing: "Fee por proyecto entregado o Contrato Marco Anual con tarifa plana de emisión forense[cite: 1].",
    color: "#9333ea"
  },
  {
    id: "04",
    tag: "REGULATED ENTERPRISE",
    title: "Banca, Seguros y Sanidad (Nube Privada)",
    who: "Corporaciones hiper-reguladas que ejecutan modelos de IA de forma interna o en VPCs aisladas.",
    pain: "Tienen prohibida la persistencia en disco de secretos empresariales o datos clínicos y la salida de datos a nubes externas.",
    embed: "Sidecar Container / Kubernetes DaemonSet con aislamiento estricto en memoria RAM (SYS_madvise)[cite: 1].",
    pricing: "Licencia Anual por Clúster (Enterprise ARR) con custodia soberana de claves Ed25519 y SLA crítico[cite: 1].",
    color: "#ca8a04"
  }
];

// Las 5 Capas de Control Técnico L7
const CONTROL_LAYERS = [
  {
    id: "01",
    title: "01. Privacy & Sensitive Data Control",
    frameworks: "RGPD (Art. 5.2, 9, 32) · Ley 1/2019 Secretos · EHDS",
    summary: "Evaluación ex-ante de flujos de datos confidenciales hacia modelos externos.",
    desc: "Aislamiento e inspección determinista en memoria volátil (RAM) con purga atómica SYS_madvise[cite: 1]. Neutraliza la exposición de identidades, numeraciones bancarias y secretos corporativos sin persistencia en disco[cite: 1].",
    pipeline: ["DETECT", "REDACT", "BLOCK"],
    color: "#0284c7"
  },
  {
    id: "02",
    title: "02. L7 Runtime Security & Robustness",
    frameworks: "EU AI Act (Art. 15) · NIS 2 · Cyber Resilience Act (CRA)",
    summary: "Mitigación activa de manipulaciones adversarias e inyecciones de directivas.",
    desc: "Contención perimetral de Prompt Injection, Jailbreaks y desvíos lógicos en agentes y aplicaciones LLM antes de la ejecución del modelo.",
    pipeline: ["INSPECT", "MITIGATE", "RECORD"],
    color: "#16a34a"
  },
  {
    id: "03",
    title: "03. Veracity & Factuality Assurance",
    frameworks: "Ley Orgánica del Honor 2026 · AI Act (Art. 13) · Data Act",
    summary: "Contención de alucinaciones críticas y bloqueo de clonación sintética no consentida.",
    desc: "Inspección causal y rechazo estricto ante generación no autorizada de voz/imagen sintética. Validación de consistencia fáctica previa a la toma de decisiones.",
    pipeline: ["CHECK", "VERIFY", "FLAG"],
    color: "#ea580c"
  },
  {
    id: "04",
    title: "04. Evidence Capture & Forensic Sealing",
    frameworks: "Workflow aligned with ISO/IEC 27037:2012 · RFC 3161 Timestamping",
    summary: "Generación automatizada de expedientes probatorios inmutables.",
    desc: "Generación estructurada de Proof Bundles sellados con firma asimétrica Ed25519 y sellado temporal RFC 3161 para acreditar diligencia debida en procesos de auditoría[cite: 1].",
    pipeline: ["CAPTURE", "SEAL", "ATTEST"],
    color: "#9333ea"
  },
  {
    id: "05",
    title: "05. Fiduciary Traceability & Audit Trail",
    frameworks: "Ley General de Subvenciones · PRTR · NextGenEU / OLAF / IGAE",
    summary: "Trazabilidad fiduciaria continua para auditorías y justificación de fondos públicos.",
    desc: "Control de unicidad documental por Hash SHA-256, verificación del principio DNSH y memorias técnicas para comités de control[cite: 1].",
    pipeline: ["TRACE", "AUDIT", "EXPORT"],
    color: "#ca8a04"
  }
];

// Matriz de Cumplimiento Técnico
const CONTROL_MATRIX = [
  { framework: "EU AI Act (2024/1689)", risk: "Falta de gobernanza técnica y registros no auditables (Art. 12/15)", policy: "Runtime Policy Enforcement", control: "L7 Execution Gate & Witness", evidence: "Proof Bundle estructurado" },
  { framework: "RGPD & LOPDGDD", risk: "Fuga ex-ante de PII / Datos Sanitarios (Art. 9/32)", policy: "Zero-Disk RAM Isolation", control: "Purga SYS_madvise en memoria volátil", evidence: "Certificado de Redacción / Bloqueo" },
  { framework: "Ley Orgánica del Honor 2026", risk: "Clonación sintética no consentida (Deepfakes)", policy: "Non-Consensual Synthetic Identity Ban", control: "Filtro Causal de Identidad y Audio", evidence: "Registro de Intercepción Pericial" },
  { framework: "NIS 2 & CRA (2024/2847)", risk: "Vulnerabilidades en la cadena de inferencia TIC", policy: "In-Process Security by Design", control: "Mitigación determinista de Prompt Injection", evidence: "Log Inmutable de Telemetría" },
  { framework: "DORA & Data Act", risk: "Pérdida de control operacional en nubes externas", policy: "Cross-Border Data Safeguard", control: "Edge Reverse-Proxy con Header L7-SEAL", evidence: "Auditoría de Tránsito Criptográfica" },
  { framework: "ISO/IEC 27037:2012", risk: "Inadmisibilidad de logs por falta de cadena de custodia", policy: "Four-Phase Evidence Workflow", control: "Roles DEFR/DES & Firma Ed25519", evidence: "Proof Bundle con sellado RFC 3161" }
];

export default function App() {
  const [sessionUser, setSessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem('saare_suite_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('LANDING'); // LANDING | AUTH | STATUS
  const [mode, setMode] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [error, setError] = useState('');
  const [showDiploma, setShowDiploma] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('sdk');

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

  // Verificador Interactivo de Veredictos (SAARE VERDICT™)
  const [verifySearchId, setVerifySearchId] = useState("VRD-2026-0941A");
  const [activeVerdict, setActiveVerdict] = useState({
    verdictId: "VRD-2026-0941A",
    validityStatus: "VALID",
    evidenceId: "PB-1788223380902-A494A163",
    systemId: "Banking-AI-Assistant",
    actorId: "agent-742",
    actionId: "send_wire_transfer",
    modelId: "openai/gpt-4o",
    decision: "BLOCK",
    enforcement: "BLOCK_AND_PURGE_RAM",
    policyId: "POL-FIN-TREASURY-01",
    policyVersion: "4.2.1",
    riskLevel: "HIGH",
    rulesMatched: ["RULE_AMOUNT_EXCEEDS_AUTONOMOUS_LIMIT", "RULE_REQUIRE_DUAL_CONTROL"],
    reason: "El importe (€18,420.00) supera el umbral autónomo permitido sin doble factor.",
    timestamp: "2026-09-01 04:12:18.102 UTC",
    inputHash: "4a8b29e01824d55f9e8a719c82301982bca192739812903847921a9823749812",
    signature: "Ed25519 (Valid Integrity)[cite: 1]",
    tsa: "RFC 3161 Qualified TSA Token[cite: 1]",
    humanOverride: "NONE (Autonomous Adjudication)"
  });

  // Simulación del Live Runtime
  const [judgeStep, setJudgeStep] = useState(0);
  const [isRunningJudge, setIsRunningJudge] = useState(false);

  const runJudgeSimulation = () => {
    setIsRunningJudge(true);
    setJudgeStep(1);
    setTimeout(() => setJudgeStep(2), 500);
    setTimeout(() => setJudgeStep(3), 1000);
    setTimeout(() => setJudgeStep(4), 1500);
    setTimeout(() => {
      setJudgeStep(5);
      setIsRunningJudge(false);
    }, 2000);
  };

  const handleDownloadTokenizedAgent = async () => {
    try {
      setDownloadingZip(true);
      const response = await fetch('/saare-extension.zip');
      if (!response.ok) throw new Error("No se pudo obtener el paquete base del agente.");

      const zipArrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(zipArrayBuffer);

      const tTenant = sessionUser?.tenantName || "SAARE_ENTERPRISE_ORG";
      const tEmail = sessionUser?.email || "auditor@saare.es";
      const tToken = sessionUser?.apiKey || sessionUser?.token || "sk_live_sgp10_" + Math.random().toString(36).substring(2, 12);

      const tokenizedManagedConfig = {
        "saare_api_key": { "Value": tToken },
        "saare_tenant_domain": { "Value": tTenant },
        "saare_user_email": { "Value": tEmail },
        "saare_license_type": { "Value": "PLAN_TOKENIZADO_ENTERPRISE" },
        "governance_protocol": { "Value": "SGP_1.0" }
      };

      const runtimeConfig = {
        tenantName: tTenant,
        email: tEmail,
        apiKey: tToken,
        protocol: "SGP_1.0",
        enforcementMode: "ADJUDICATE_AND_ATTEST",
        provisionedAt: new Date().toISOString()
      };

      zip.file("storage_managed.json", JSON.stringify(tokenizedManagedConfig, null, 2));
      zip.file("saare_config.json", JSON.stringify(runtimeConfig, null, 2));

      const customizedBlob = await zip.generateAsync({ type: "blob" });
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(customizedBlob);
      dl.download = `saare-agente-tokenizado-${tTenant.toLowerCase().replace(/[^a-z0-9]/g, '_')}.zip`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      URL.revokeObjectURL(dl.href);
    } catch (err) {
      alert("Error al empaquetar agente: " + err.message);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleVerifyLookup = (e) => {
    e.preventDefault();
    const query = verifySearchId.trim().toLowerCase();
    
    if (query.includes("0941") || query.includes("wire") || query.includes("santander") || query.includes("ced48f")) {
      setActiveVerdict({
        verdictId: "VRD-2026-0941A",
        validityStatus: "VALID",
        evidenceId: "PB-1788223380902-A494A163",
        systemId: "Banking-AI-Assistant",
        actorId: "agent-742",
        actionId: "send_wire_transfer",
        modelId: "openai/gpt-4o",
        decision: "BLOCK",
        enforcement: "BLOCK_AND_PURGE_RAM",
        policyId: "POL-FIN-TREASURY-01 (PCI-DSS & High-Value Limits)",
        policyVersion: "4.2.1",
        riskLevel: "HIGH",
        rulesMatched: ["RULE_AMOUNT_EXCEEDS_AUTONOMOUS_LIMIT", "RULE_REQUIRE_DUAL_CONTROL"],
        reason: "El importe (€18,420.00) supera el umbral autónomo permitido sin doble factor.",
        timestamp: "2026-09-01 04:12:18.102 UTC",
        inputHash: "4a8b29e01824d55f9e8a719c82301982bca192739812903847921a9823749812",
        signature: "Ed25519 (Valid Integrity)[cite: 1]",
        tsa: "RFC 3161 Qualified TSA Token[cite: 1]",
        humanOverride: "NONE (Autonomous Adjudication)"
      });
    } else {
      setActiveVerdict({
        verdictId: "VRD-2026-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
        validityStatus: "VALID",
        evidenceId: "PB-2026-LIVE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        systemId: "Enterprise-Core-API",
        actorId: "crm-agent-01",
        actionId: "get_customer_profile",
        modelId: "anthropic/claude-3-5-sonnet",
        decision: "ALLOW",
        enforcement: "ALLOW_AND_ATTEST",
        policyId: "POL-CRM-LEAST-PRIV-03 [v1.4.0]",
        riskLevel: "LOW",
        rulesMatched: ["RULE_READ_ACTION_PERMITTED"],
        reason: "Inferencia validada bajo perfil de privilegios mínimos sin anomalías.",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + " UTC",
        inputHash: CANONICAL_HASH,
        signature: "Ed25519 (Valid Integrity)[cite: 1]",
        tsa: "RFC 3161 Timestamp Token[cite: 1]",
        humanOverride: "NONE"
      });
    }
  };

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = mode === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = mode === 'login'
      ? { email, password, source: 'suite' }
      : { email, password, tenantName: companyName, source: 'suite', role: 'AUDITOR' };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        const userData = { ...data.user };
        localStorage.setItem('saare_suite_user', JSON.stringify(userData));
        setSessionUser(userData);
        setCurrentView('STATUS');
      } else {
        setError(data.error || "No se pudo autenticar.");
      }
    } catch {
      setError("Error de comunicación con el servicio.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    if (currentView !== 'LANDING') {
      setCurrentView('LANDING');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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
        source: "saare-public-landing"
      };

      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === "SUCCESS") {
        setB2bSuccessMsg(`Solicitud de ${formType} registrada en el Decision Store (Ref: ${data.leadId}). Un arquitecto se pondrá en contacto.`);
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
      setLoading(false);
    }
  };

  const codeSnippets = {
    sdk: `// EMBED MODE 01: SAARE SDK (npm install @saare/governance-sdk)
import { SaareJudgeClient } from '@saare/governance-sdk';

const judge = new SaareJudgeClient({ apiKey: process.env.SAARE_API_KEY });

// El agente consulta al Governance Judge antes de ejecutar una acción sensible
const verdict = await judge.adjudicate({
  subject: "payment-agent-742",
  action: "send_wire_transfer",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00, destination_iban: "ES9121000418..." },
  payloadDigest: "sha256:4a8b29e01824d55f9e8a719c82301982bca192739812..."
});

if (verdict.decision === 'ALLOW') {
  await executeBankTransfer();
} else if (verdict.decision === 'ESCALATE') {
  await routeToHumanSupervisor(verdict.verdictId);
} else {
  console.error(\`Acción denegada por política: \${verdict.reasons.join(', ')}\`);
}`,
    sidecar: `# EMBED MODE 02: SIDECAR CONTAINER (Docker / Kubernetes VPC)
# docker-compose.yml
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
      - SAARE_ISOLATION_MODE=SYS_MADVISE_RAM_ONLY
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
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Procesar informe financiero' }]
});`,
    k8s: `# EMBED MODE 04: KUBERNETES DAEMONSET (Air-Gapped / Nube Soberana)
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
          value: "TRUE"
        - name: SAARE_P99_TARGET_MICROS
          value: "15"`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
      
      {/* MODAL 1: SOLICITUD DE DICTAMEN PERICIAL / FONDOS PRTR */}
      {showDossierModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowDossierModal(false)}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #9333ea', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>MODO 03 · PERICIAL & FONDOS</span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Solicitud de Dictamen Pericial / PRTR</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Generación de informe técnico con cadena de custodia (ISO/IEC 27037) y acreditación anti-doble financiación (NextGenEU/IGAE)[cite: 1].
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
                    <option value="AUDITORIA_RGPD_AI_ACT">Auditoría de Cumplimiento RGPD & AI Act</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>REFERENCIA DE EXPEDIENTE / PROYECTO</label>
                  <input type="text" required placeholder="Ej: EXP-PRTR-2026-09A o Ref. Litigio" value={b2bFormData.expediente} onChange={(e) => setB2bFormData({...b2bFormData, expediente: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: loading ? 'default' : 'pointer' }}>
                    {loading ? 'Transmitiendo...' : 'Tramitar Solicitud de Dictamen'}
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

      {/* MODAL 2: SOLICITUD DE TENANT AISLADO ENTERPRISE */}
      {showEnterpriseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3,7,18,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} onClick={() => setShowEnterpriseModal(false)}>
          <div style={{ maxWidth: '540px', width: '100%', background: '#111827', borderRadius: '16px', border: '1px solid #ca8a04', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
            <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>MODO 04 · GRANDES CUENTAS</span>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Despliegue de Tenant Aislado / Enterprise</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Aprovisionamiento en Nube Soberana Europea, VPC dedicada u On-Premise con purga en memoria volátil (SYS_madvise)[cite: 1].
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
                  <label style={{ fontSize: '11.5px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>VOLUMEN ESTIMADO DE TOKENS / ACCIONES</label>
                  <select value={b2bFormData.tokenVolume} onChange={(e) => setB2bFormData({...b2bFormData, tokenVolume: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }}>
                    <option value="1M_10M">1 a 10 Millones de Tokens / mes</option>
                    <option value="10M_100M">10 a 100 Millones de Tokens / mes</option>
                    <option value="OVER_100M">+100 Millones de Tokens / mes (SLA 99.99%)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#ca8a04', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '13px', cursor: loading ? 'default' : 'pointer' }}>
                    {loading ? 'Transmitiendo...' : 'Solicitar Propuesta de Despliegue'}
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

      {/* HEADER PRINCIPAL */}
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1f2937' }}>
        <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
            <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '2.5px', color: '#ffffff' }}>SAARE</span>
            <span style={{ color: '#0ea5e9', fontSize: '11px', borderLeft: '1px solid #374151', paddingLeft: '12px', fontWeight: '800', letterSpacing: '0.8px' }}>
              AI EXECUTION AUTHORIZATION LAYER
            </span>
          </div>

          <nav style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12.5px', fontWeight: '600' }}>
            <button onClick={() => scrollToSection('decision-layer')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700' }}>Governance Judge</button>
            <button onClick={() => scrollToSection('target-segments')} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700' }}>Sectores Target</button>
            <button onClick={() => scrollToSection('control-layers')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}>Capas de Control</button>
            <button onClick={() => scrollToSection('live-runtime')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}>Live Runtime</button>
            <button onClick={() => scrollToSection('evidence-verifier')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}>SAARE VERDICT™</button>
            <button onClick={() => scrollToSection('integration-modes')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}>Endpoints API</button>
            <button onClick={() => scrollToSection('modelos-explotacion')} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700' }}>Explotación B2B</button>
            <button onClick={() => scrollToSection('control-matrix')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}>Policy Matrix</button>

            <span style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
              ● EDGE &lt;0.017ms
            </span>

            {sessionUser ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '6px' }}>
                <button onClick={() => setCurrentView(currentView === 'STATUS' ? 'LANDING' : 'STATUS')} style={{ background: '#1f2937', border: '1px solid #374151', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11.5px' }}>
                  Mi Consola
                </button>
                <button onClick={() => { localStorage.removeItem('saare_suite_user'); setSessionUser(null); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px' }}>Salir</button>
              </div>
            ) : (
              <button onClick={() => { setMode('login'); setCurrentView('AUTH'); }} style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                Acceso Consola
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* VISTA: AUTENTICACIÓN */}
      {currentView === 'AUTH' && !sessionUser && (
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', padding: '32px', borderRadius: '12px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0ea5e9', marginBottom: '8px' }}>// CONTROL_PLANE_LOGIN</div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px', color: '#ffffff' }}>
              {mode === 'login' ? 'Acceso a Consola GRC' : 'Aprovisionar Cuenta Enterprise'}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>Supervisión de veredictos en tiempo real y descarga de Proof Bundles[cite: 1].</p>
            {error && <div style={{ color: '#ef4444', fontSize: '12.5px', marginBottom: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmitAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#9ca3af', marginBottom: '4px' }}>ORGANIZACIÓN</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Empresa o Despacho Auditor" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#9ca3af', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seguridad@empresa.com" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: '#9ca3af', marginBottom: '4px' }}>CONTRASEÑA</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '13px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}>
                {loading ? 'Verificando...' : (mode === 'login' ? 'Entrar a la Consola' : 'Comenzar Despliegue')}
              </button>
              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}>
                  {mode === 'login' ? '¿Necesitas aprovisionar nueva cuenta? Regístrate' : '¿Ya tienes credenciales? Iniciar sesión'}
                </span>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* VISTA: PANEL DE ESTADO Y DESCARGA TOKENIZADA */}
      {currentView === 'STATUS' && sessionUser && (
        <main style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                ● GOVERNANCE JUDGE ACTIVE (L7)
              </span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Decision Layer v10.0</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Consola de Decisiones y Veredictos</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>Organización: <strong>{sessionUser.tenantName || 'Tenant Activo'}</strong> · Cuenta: {sessionUser.email}</p>
            
            <div style={{ background: '#030712', border: '1px solid #0284c7', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
              <strong style={{ color: '#38bdf8', fontSize: '14px', display: 'block', marginBottom: '6px' }}>DESPLIEGUE DE NODO TOKENIZADO (SGP 1.0)</strong>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Descarga el agente perimetral con tu token corporativo embebido. Ejecuta <code>install_tokenized.bat</code> para aprovisionar el sensor con auto-inyección GPO sin autenticación manual.
              </p>
              <button 
                onClick={handleDownloadTokenizedAgent} 
                disabled={downloadingZip}
                style={{ padding: '10px 22px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: downloadingZip ? 'default' : 'pointer' }}
              >
                {downloadingZip ? 'Empaquetando Token...' : '⬇ Descargar Agente Tokenizado (.zip)'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ padding: '10px 20px', backgroundColor: '#1f2937', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', border: '1px solid #374151' }}>
                Abrir Consola de Control ↗
              </a>
              <button onClick={() => setShowDiploma(true)} style={{ padding: '10px 20px', backgroundColor: '#1f2937', color: '#c084fc', border: '1px solid #4b5563', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                Acreditación Registral Safe Creative 📜
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VISTA PRINCIPAL: LANDING PAGE COMERCIAL COMPLETA */}
      {currentView === 'LANDING' && (
        <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '40px 20px 100px 20px' }}>

          {/* 1. HERO SECTION */}
          <section id="hero" style={{ textAlign: 'center', margin: '30px 0 60px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '800', border: '1px solid rgba(14, 165, 233, 0.25)', marginBottom: '20px', letterSpacing: '0.5px' }}>
              AI EXECUTION AUTHORIZATION INFRASTRUCTURE
            </div>
            
            <h1 style={{ fontSize: '50px', fontWeight: '900', color: '#ffffff', margin: '0 0 16px 0', letterSpacing: '-1.5px', lineHeight: 1.15 }}>
              AI agents can act.<br />
              <span style={{ color: '#38bdf8' }}>SAARE decides what they're allowed to do.</span>
            </h1>
            
            <p style={{ fontSize: '18.5px', color: '#cbd5e1', maxWidth: '860px', margin: '0 auto 16px auto', lineHeight: 1.45, fontWeight: '600' }}>
              Arbitraje legal y técnico en memoria volátil (&lt;0.017 ms)[cite: 1]. Evalúe, autorice y bloquee cada Tool Call, transferencia bancaria o mutación de datos antes de que se ejecute en el mundo real.
            </p>

            <p style={{ fontSize: '14.5px', color: '#9ca3af', maxWidth: '780px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
              L7 Runtime Execution Boundary · Purga SYS_madvise · SAARE VERDICT™ · Evidencias Ed25519 & RFC 3161[cite: 1]
            </p>

            {/* PIPELINE SOLEMNE */}
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
              <button onClick={() => scrollToSection('live-runtime')} style={{ padding: '14px 30px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(2,132,199,0.35)' }}>
                Evaluar con el Governance Judge ↓
              </button>
              <button onClick={() => scrollToSection('target-segments')} style={{ padding: '14px 28px', backgroundColor: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                4 Sectores Target Embebidos
              </button>
            </div>
          </section>

          {/* 2. POSTURE SUMMARY */}
          <section style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '30px', marginBottom: '70px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>GLOBAL GOVERNANCE POSTURE</span>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>Estado Operativo de Control en Ejecución</h3>
              </div>
              <span style={{ color: '#34d399', fontSize: '11.5px', fontFamily: 'monospace', fontWeight: 'bold', background: 'rgba(52,211,153,0.1)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(52,211,153,0.25)' }}>
                ● DECISION STORE OPERACIONAL
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#030712', padding: '18px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ color: '#0ea5e9', fontSize: '11.5px', fontWeight: 'bold' }}>SYSTEMS GOVERNED</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '4px 0' }}>231 / 247</div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>93.5% Cobertura Activa</div>
              </div>
              <div style={{ background: '#030712', padding: '18px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ color: '#f59e0b', fontSize: '11.5px', fontWeight: 'bold' }}>VERDICTS ADJUDICATED</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '4px 0' }}>4,820,341</div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>13,842 Bloqueos · 2,109 Escalados</div>
              </div>
              <div style={{ background: '#030712', padding: '18px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ color: '#a855f7', fontSize: '11.5px', fontWeight: 'bold' }}>EVIDENCE GENERATED</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '4px 0' }}>4,803,221</div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>100% Sellado RFC 3161[cite: 1]</div>
              </div>
              <div style={{ background: '#030712', padding: '18px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ color: '#34d399', fontSize: '11.5px', fontWeight: 'bold' }}>HUMAN OVERRIDES</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '4px 0' }}>82 / 82 Attributed</div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>Encadenamiento Inmutable</div>
              </div>
            </div>
          </section>

          {/* 3. ARQUITECTURA DE ADJUDICACIÓN */}
          <section id="decision-layer" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>ARQUITECTURA DE ADJUDICACIÓN</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>The AI Governance Decision Layer</h2>
              <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                SAARE opera como un motor determinista de adjudicación de políticas técnicas. Evalúa el contexto, aplica reglas de negocio y produce un veredicto firmado vinculante para el flujo de ejecución[cite: 1].
              </p>
            </div>

            <div style={{ background: '#030712', border: '1px solid #1f2937', borderRadius: '12px', padding: '28px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ background: '#111827', border: '1px solid #374151', padding: '12px', borderRadius: '6px', color: '#f3f4f6', fontWeight: 'bold', fontSize: '13px' }}>
                ORGANIZATIONAL GOVERNANCE (CISO · DPO · Políticas Internas · Requisitos Normativos)
              </div>
              <div style={{ color: '#0ea5e9', margin: '8px 0', fontSize: '16px' }}>│ ▼ (Policy Definitions & Rules)</div>
              <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1.5px solid #0284c7', padding: '20px', borderRadius: '8px' }}>
                <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '15px', marginBottom: '6px' }}>
                  SAARE GOVERNANCE JUDGE (DETERMINISTIC ENGINE)[cite: 1]
                </div>
                <div style={{ fontSize: '11.5px', color: '#9ca3af', marginBottom: '12px' }}>
                  Context Evaluation · Identity · Action · Risk · Policy Version → SAARE VERDICT™[cite: 1]
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: '#e2e8f0', fontWeight: 'bold' }}>
                  <span style={{ background: '#064e3b', color: '#34d399', padding: '3px 8px', borderRadius: '4px' }}>ALLOW</span>
                  <span style={{ background: '#1e3a8a', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px' }}>REDACT</span>
                  <span style={{ background: '#7f1d1d', color: '#f87171', padding: '3px 8px', borderRadius: '4px' }}>BLOCK</span>
                  <span style={{ background: '#78350f', color: '#fde047', padding: '3px 8px', borderRadius: '4px' }}>ESCALATE</span>
                  <span style={{ background: '#374151', color: '#cbd5e1', padding: '3px 8px', borderRadius: '4px' }}>QUARANTINE</span>
                  <span style={{ background: '#581c87', color: '#c084fc', padding: '3px 8px', borderRadius: '4px' }}>REVIEW</span>
                </div>
              </div>
              <div style={{ color: '#0ea5e9', margin: '8px 0', fontSize: '16px' }}>│ ▼ (Governed Execution)</div>
              <div style={{ background: '#111827', border: '1px solid #374151', padding: '12px', borderRadius: '6px', color: '#34d399', fontWeight: 'bold', fontSize: '13px' }}>
                AI EXECUTION BOUNDARY & PROOF BUNDLE (Ed25519 Signature + RFC 3161 Timestamp)[cite: 1]
              </div>
            </div>
          </section>

          {/* 4. SECTORES TARGET EMBEBIDOS */}
          <section id="target-segments" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>ISV TO ISV · ARQUITECTURA DE EMBEBIDO[cite: 1]</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>4 Modelos de Empresa a las que Embeber el Motor</h2>
              <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '820px', margin: '0 auto', lineHeight: 1.6 }}>
                SAARE opera como un componente crítico de infraestructura (Middleware L7) listo para integrarse en código ajeno, pipelines de inferencia y clústeres privados[cite: 1].
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {TARGET_SEGMENTS.map((seg) => (
                <div key={seg.id} style={{ background: '#030712', border: `1px solid ${seg.color}66`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: seg.color, fontSize: '10.5px', fontWeight: '900', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{seg.tag}</span>
                    <h3 style={{ color: '#fff', fontSize: '17px', margin: '8px 0 10px 0', fontWeight: '800' }}>{seg.title}</h3>
                    
                    <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginBottom: '10px' }}>
                      <strong style={{ color: '#94a3b8' }}>Target:</strong> {seg.who}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#9ca3af', marginBottom: '12px', lineHeight: 1.5 }}>
                      <strong style={{ color: '#f87171' }}>Dolor Clave:</strong> {seg.pain}
                    </div>
                    <div style={{ background: '#0b0f19', border: '1px solid #1f2937', padding: '10px', borderRadius: '6px', fontSize: '11.5px', color: '#38bdf8', fontFamily: 'monospace', marginBottom: '14px' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Modo de Embebido:</span>
                      {seg.embed}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #1f2937', paddingTop: '12px', marginTop: '10px' }}>
                    <span style={{ color: '#64748b', fontSize: '10.5px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Métrica Comercial:</span>
                    <div style={{ color: '#34d399', fontSize: '12.5px', fontWeight: '700' }}>{seg.pricing}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. DOS MODOS DE INTEGRACIÓN TÉCNICA */}
          <section id="integration-modes" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>ESPECIFICACIÓN DE ENDPOINTS (SGP 1.0)</span>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '4px 0 0 0' }}>Integración de Infraestructura</h2>
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
                  Sidecar Container (Docker/VPC)
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
          </section>

          {/* 6. EVALUACIÓN EN RUNTIME (LIVE SIMULATOR) */}
          <section id="live-runtime" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>EVALUACIÓN EN RUNTIME</span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '4px 0 0 0' }}>Adjudicación de Veredicto en Vivo</h2>
              </div>
              <button 
                onClick={runJudgeSimulation} 
                disabled={isRunningJudge}
                style={{ padding: '10px 22px', backgroundColor: isRunningJudge ? '#374151' : '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: isRunningJudge ? 'default' : 'pointer' }}
              >
                {isRunningJudge ? 'Evaluando...' : '▶ Evaluar con Governance Judge'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: judgeStep >= 1 ? '#030712' : '#070a12', border: `1px solid ${judgeStep >= 1 ? '#0ea5e9' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 1</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>Context Intake</strong>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Who / What / Which AI</span>
              </div>
              <div style={{ background: judgeStep >= 2 ? '#030712' : '#070a12', border: `1px solid ${judgeStep >= 2 ? '#38bdf8' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 2</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>RAM Buffer L7</strong>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Aislamiento volátil (&lt;0.017 ms)[cite: 1]</span>
              </div>
              <div style={{ background: judgeStep >= 3 ? '#030712' : '#070a12', border: `1px solid ${judgeStep >= 3 ? '#f59e0b' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 3</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>Policy Match</strong>
                <span style={{ fontSize: '11px', color: '#f59e0b' }}>POL-FIN-TREASURY-01</span>
              </div>
              <div style={{ background: judgeStep >= 4 ? '#030712' : '#070a12', border: `1px solid ${judgeStep >= 4 ? '#ef4444' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 4</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>VERDICT: BLOCK</strong>
                <span style={{ fontSize: '11px', color: '#ef4444' }}>Purga atómica en RAM[cite: 1]</span>
              </div>
              <div style={{ background: judgeStep >= 5 ? '#030712' : '#070a12', border: `1px solid ${judgeStep >= 5 ? '#10b981' : '#1f2937'}`, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>PASO 5</div>
                <strong style={{ color: '#fff', fontSize: '13px', display: 'block', margin: '4px 0' }}>Evidence Ledger</strong>
                <span style={{ fontSize: '11px', color: '#34d399' }}>Proof Bundle sellado RFC 3161[cite: 1]</span>
              </div>
            </div>

            <div style={{ background: '#030712', border: '1px solid #1f2937', padding: '14px 18px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: judgeStep === 5 ? '#34d399' : '#9ca3af' }}>
                {judgeStep === 0 && "Estado: Esperando evento de IA para evaluación..."}
                {judgeStep === 1 && "Estado: Interceptando acción del agente en Capa 7..."}
                {judgeStep === 2 && "Estado: Búfer volátil reservado en RAM sin persistencia en disco..."}
                {judgeStep === 3 && "Estado: Evaluando contra catálogo de políticas corporativas..."}
                {judgeStep === 4 && "Estado: Política POL-FIN-TREASURY-01 positiva -> Veredicto: BLOCK emitido."}
                {judgeStep === 5 && "Estado: Veredicto consolidado. Proof Bundle emitido con firma Ed25519."}
              </span>
              <span style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: 'monospace' }}>JUDGE_LATENCY: 0.017 ms</span>
            </div>
          </section>

          {/* 7. DOCTRINA TÉCNICA */}
          <section style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>PRINCIPIOS ESTRUCTURALES</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>The AI-Native Audit Doctrine</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '750px', margin: '0 auto' }}>
                Siete postulados técnicos que delimitan cómo opera la infraestructura de gobernanza ejecutable:
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
          </section>

          {/* 8. SAARE VERDICT™ LEDGER */}
          <section id="evidence-verifier" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>DECISION RECORD</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 8px 0' }}>SAARE VERDICT™ Ledger</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '650px', margin: '0 auto' }}>
                El registro técnico y vinculante de cada decisión de política en la frontera de ejecución de IA:
              </p>
            </div>

            <form onSubmit={handleVerifyLookup} style={{ display: 'flex', gap: '10px', maxWidth: '650px', margin: '0 auto 28px auto', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                value={verifySearchId} 
                onChange={(e) => setVerifySearchId(e.target.value)} 
                placeholder="Introduce Verdict ID o SHA-256 Digest (ej: VRD-2026-0941A)" 
                style={{ flex: 1, minWidth: '280px', padding: '11px 14px', backgroundColor: '#030712', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} 
              />
              <button type="submit" style={{ padding: '11px 22px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                Consultar Veredicto
              </button>
            </form>

            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#030712', border: '1px solid #1f2937', borderRadius: '10px', padding: '24px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ color: '#f3f4f6', fontWeight: 'bold', fontSize: '13px' }}>SAARE VERDICT™ // ADJUDICATION CONTRACT</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: activeVerdict.validityStatus === 'VALID' ? '#34d399' : '#f59e0b', fontSize: '11px', background: '#111827', padding: '2px 6px', borderRadius: '4px' }}>
                    STATUS: {activeVerdict.validityStatus}
                  </span>
                  <span style={{ color: activeVerdict.decision === 'BLOCK' ? '#f87171' : '#34d399', fontWeight: 'bold', fontSize: '11px', background: activeVerdict.decision === 'BLOCK' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${activeVerdict.decision === 'BLOCK' ? '#ef4444' : '#34d399'}` }}>
                    DECISION: {activeVerdict.decision}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>VERDICT ID:</span>
                <span style={{ color: '#38bdf8' }}>{activeVerdict.verdictId}</span>

                <span style={{ color: '#6b7280' }}>SYSTEM & ACTOR:</span>
                <span style={{ color: '#f3f4f6' }}>{activeVerdict.systemId} ({activeVerdict.actorId}) → Action: {activeVerdict.actionId}</span>

                <span style={{ color: '#6b7280' }}>MODEL EVALUATED:</span>
                <span style={{ color: '#e5e7eb' }}>{activeVerdict.modelId}</span>

                <span style={{ color: '#6b7280' }}>POLICY APPLIED:</span>
                <span style={{ color: '#e5e7eb' }}>{activeVerdict.policyId} [v{activeVerdict.policyVersion}]</span>

                <span style={{ color: '#6b7280' }}>RULES MATCHED:</span>
                <span style={{ color: '#f59e0b' }}>{Array.isArray(activeVerdict.rulesMatched) ? activeVerdict.rulesMatched.join(" · ") : activeVerdict.rulesMatched}</span>

                <span style={{ color: '#6b7280' }}>RISK RATIONALE:</span>
                <span style={{ color: '#fb923c' }}>[{activeVerdict.riskLevel}] {activeVerdict.reason}</span>

                <span style={{ color: '#6b7280' }}>ENFORCEMENT:</span>
                <span style={{ color: '#f87171' }}>{activeVerdict.enforcement}</span>

                <span style={{ color: '#6b7280' }}>TIMESTAMP:</span>
                <span style={{ color: '#e5e7eb' }}>{activeVerdict.timestamp}</span>

                <span style={{ color: '#6b7280' }}>SIGNATURE (Ed25519):</span>
                <span style={{ color: '#34d399' }}>{activeVerdict.signature}</span>

                <span style={{ color: '#6b7280' }}>TIMESTAMP AUTH:</span>
                <span style={{ color: '#34d399' }}>{activeVerdict.tsa}</span>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid #1f2937', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>Evidence workflow aligned with ISO/IEC 27037:2012[cite: 1]</span>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
                  Verificar Integridad en API Pública ↗
                </a>
              </div>
            </div>
          </section>

          {/* 9. LAS 5 CAPAS DE CONTROL */}
          <section id="control-layers" style={{ marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>DOMINIOS TÉCNICOS</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', margin: '6px 0' }}>Cinco Capas de Control para IA Corporativa</h2>
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
                    <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700', marginBottom: '12px' }}>● DISPONIBLE EN RUNTIME</div>
                    <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px', backgroundColor: layer.color, color: layer.id === '05' ? '#000' : '#fff', borderRadius: '6px', fontWeight: '700', fontSize: '12px', textDecoration: 'none' }}>
                      Activar Capa {layer.id} →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10. MODELOS DE EXPLOTACIÓN B2B & PRECIOS */}
          <section id="modelos-explotacion" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>MONETIZACIÓN & MODELOS DE LICENCIA[cite: 1]</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0 10px 0' }}>Modelos de Explotación B2B</h2>
              <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
                Infraestructura modular adaptada a despachos de auditoría, desarrolladores de agentes autónomos y corporaciones reguladas.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              <div style={{ background: '#030712', border: '1px solid #0284c7', borderRadius: '10px', padding: '22px' }}>
                <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 'bold' }}>MODO 01 · SAAS AUDITOR</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>Licencia Asiento Runtime</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Suscripción por puesto para consultores GRC y DPOs. Acceso a consola, telemetría y Proof Bundles[cite: 1].
                </p>
                <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>149 € <span style={{ fontSize: '12px', color: '#9ca3af' }}>/ mes</span></div>
                <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '8px', background: '#0284c7', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                  Contratar Asiento →
                </a>
              </div>

              <div style={{ background: '#030712', border: '1px solid #16a34a', borderRadius: '10px', padding: '22px' }}>
                <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: 'bold' }}>MODO 02 · CONSUMO API</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>Judge API Metered</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Tarificación por volumen de veredictos para agentes autónomos y llamadas a herramientas (Tool Calling).
                </p>
                <div style={{ color: '#34d399', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>Pago por llamada / Tier</div>
                <button onClick={() => scrollToSection('integration-modes')} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #16a34a', color: '#34d399', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Ver Documentación API →
                </button>
              </div>

              <div style={{ background: '#030712', border: '1px solid #9333ea', borderRadius: '10px', padding: '22px' }}>
                <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 'bold' }}>MODO 03 · PERICIAL & FONDOS</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>Fee por Dossier / PRTR</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Emisión automatizada de dictámenes periciales ISO 27037 y memorias técnicas justificativas ante la IGAE y OLAF[cite: 1].
                </p>
                <div style={{ color: '#a855f7', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>Tarifa ad-hoc por expediente</div>
                <button onClick={() => setShowDossierModal(true)} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #9333ea', color: '#c084fc', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Solicitar Dictamen →
                </button>
              </div>

              <div style={{ background: '#030712', border: '1px solid #ca8a04', borderRadius: '10px', padding: '22px' }}>
                <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 'bold' }}>MODO 04 · GRANDES CUENTAS</span>
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '6px 0 8px 0', fontWeight: '800' }}>OEM & Tenant Aislado</h4>
                <p style={{ color: '#9ca3af', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Despliegue dedicado en Nube Soberana Europea o VPC propia con aislamiento en memoria RAM (SYS_madvise) para banca y salud[cite: 1].
                </p>
                <div style={{ color: '#f59e0b', fontWeight: '900', fontSize: '16px', marginBottom: '14px' }}>Licencia Enterprise ARR</div>
                <button onClick={() => setShowEnterpriseModal(true)} style={{ width: '100%', padding: '8px', background: '#111827', border: '1px solid #ca8a04', color: '#facc15', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Contactar Enterprise →
                </button>
              </div>
            </div>
          </section>

          {/* 11. POLICY MATRIX */}
          <section id="control-matrix" style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>POLICY COMPILER</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '6px 0' }}>Policy-to-Verdict Governance Matrix</h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>De la obligación regulatoria a la regla ejecutable en runtime.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                    <th style={{ padding: '12px 14px' }}>MARCO LEGAL</th>
                    <th style={{ padding: '12px 14px' }}>RIESGO EVALUADO</th>
                    <th style={{ padding: '12px 14px' }}>POLÍTICA SAARE</th>
                    <th style={{ padding: '12px 14px' }}>CONTROL ADJUDICADO</th>
                    <th style={{ padding: '12px 14px' }}>EVIDENCIA EMITIDA</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTROL_MATRIX.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '14px', color: '#38bdf8', fontWeight: 'bold' }}>{row.framework}</td>
                      <td style={{ padding: '14px', color: '#cbd5e1' }}>{row.risk}</td>
                      <td style={{ padding: '14px', color: '#9ca3af', fontFamily: 'monospace' }}>{row.policy}</td>
                      <td style={{ padding: '14px', color: '#34d399' }}>{row.control}</td>
                      <td style={{ padding: '14px', color: '#a855f7' }}>{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 12. PRICING & CALL TO ACTION */}
          <section id="pricing" style={{ backgroundColor: '#0b0f19', border: '1px solid #0284c7', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>DESPLIEGUE OPERATIVO</span>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '8px 0 10px 0' }}>
              AI Governance Decision Layer
            </h2>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#38bdf8', marginBottom: '12px' }}>
              Desde 149 € / mes
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14.5px', maxWidth: '640px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
              Para organizaciones que necesitan adjudicación de políticas en runtime, trazabilidad de acciones de agentes y expedientes de evidencia digital verificables[cite: 1].
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <a href={STRIPE_LINK} target="_blank" rel="noreferrer" style={{ padding: '14px 36px', backgroundColor: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(2,132,199,0.3)' }}>
                Aprovisionar Asiento Runtime (149 €/mes) ↗
              </a>
              <button onClick={() => setShowEnterpriseModal(true)} style={{ padding: '14px 28px', backgroundColor: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                Contactar Arquitectura Enterprise
              </button>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
              Suscripción sin permanencia · Anclaje Registral Oficial: Safe Creative Nº 2607076315021 / 2607076314949[cite: 1]
            </div>
          </section>

          {/* 13. FOOTER INSTITUCIONAL */}
          <footer style={{ borderTop: '1px solid #1f2937', paddingTop: '32px', fontSize: '12px', color: '#6b7280' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
              <div style={{ maxWidth: '620px' }}>
                <strong style={{ color: '#f3f4f6', fontSize: '13px' }}>SAARE — AI Execution Authorization Layer</strong>
                <p style={{ margin: '6px 0 0 0', color: '#9ca3af', lineHeight: 1.5 }}>
                  La capa de infraestructura que evalúa, adjudica y demuestra lo que ocurre durante la ejecución de sistemas de IA[cite: 1]. <br />
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>AI executes. SAARE judges. Evidence proves.</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '18px', fontSize: '12px' }}>
                <a href={VERIFY_URL} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Verificador API</a>
                <a href={CONSOLE_URL} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', textDecoration: 'none' }}>Consola GRC</a>
                <button onClick={() => setShowEnterpriseModal(true)} style={{ color: '#94a3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 0 }}>Contacto Enterprise</button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #111827', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <span>Acreditación Registral Safe Creative Nº 2607076315021 / 2607076314949[cite: 1]</span>
              <span>© 2026 SAARE Digital Governance</span>
            </div>
          </footer>

        </main>
      )}
    </div>
  );
}