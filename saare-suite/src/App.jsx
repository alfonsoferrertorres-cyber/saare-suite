/* ==========================================================================
   S.A.A.R.E. SGP 1.0 · APLICACIÓN PRINCIPAL CON RUTAS & LANDING PAGE
   ========================================================================== */
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { saareCheckout, verifyMerkleHash, saareFetch } from "./api.js";
import Login from "./Login.jsx";

/* ==========================================================================
   CONSTANTES GLOBALES, REGISTROS CRIPTOGRÁFICOS Y CONFIGURACIÓN SGP 1.0
   ========================================================================== */
const DEMO_ROOT_MERKLE_HASH =
  "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";

const CONTACT_EMAIL = "legal@saare.es";
const CONTACT_PHONE = "+34 633 886 506";
const WHATSAPP_URL =
  "https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE%20SGP%201.0";

const METRIC_LABELS = {
  DEMO: { text: "DEMO", cls: "bg-slate-500/10 border-slate-500/40 text-slate-400" },
  BENCHMARK: { text: "BENCHMARK", cls: "bg-saare-accent/10 border-saare-accent/40 text-saare-accent" },
  REFERENCE: { text: "REFERENCE", cls: "bg-saare-seal/10 border-saare-seal/40 text-saare-seal" },
  LIVE: { text: "LIVE", cls: "bg-saare-allow/10 border-saare-allow/40 text-saare-allow" },
};

const DIMENSIONS = [
  ["DIM 01", "IDENTIDAD", "Quién solicita la acción. Verificación asimétrica de firmas Ed25519 del agente o token JWT del sistema originador."],
  ["DIM 02", "ACCIÓN", "Qué quiere ejecutar. Inspección L7 de comandos (READ, MUTATE_DATABASE, SEND_PAYMENT, DELETE, EXECUTE_CODE)."],
  ["DIM 03", "CONTEXTO", "En qué contexto ocurre. Evaluación de la variable temporal, IP de origen, geolocalización y aislamiento."],
  ["DIM 04", "RECURSO", "Sobre qué recurso. Validación del URI objetivo, tabla de base de datos, servicio financiero o endpoint API receptor."],
  ["DIM 05", "DATOS", "Qué datos intervienen. Inspección y sanitización in-RAM k-Anonymity para PII (DNI, NIF), PHI e IBANs en tránsito."],
  ["DIM 06", "RIESGO", "Qué nivel de riesgo presenta. Scoring determinista basado en impacto económico y vector de ataque."],
  ["DIM 07", "POLÍTICA", "Qué regla aplica. Verificación contra el motor de políticas firmado localmente y compilado a código nativo."],
];

const DECISION_PATH = [
  ["01", "INTENTO DE ACCIÓN", "El agente emite un comando contra un recurso protegido.", "INTERCEPTED"],
  ["02", "NORMALIZACIÓN", "NFKC, decodificación y tokenizado del payload en RAM.", "PARSED"],
  ["03", "EVALUACIÓN 7D", "Las siete dimensiones se resuelven contra la política firmada.", "EVALUATED"],
  ["04", "VEREDICTO", "ALLOW, DENY o REVIEW emitido por regla determinista.", "DENY"],
  ["05", "PERMISO", "Si procede, se emite un Permit Token de un solo uso y corto TTL.", "NOT_ISSUED"],
  ["06", "EVIDENCIA", "Digest sellado, firmado y anclado al árbol de Merkle.", "SEALED"],
];

const EVIDENCE_CHAIN = [
  ["DIGEST", "SHA-256", "Huella del veredicto y de su contexto mínimo. El contenido sensible nunca se persiste: solo su representación criptográfica."],
  ["MERKLE", "ÁRBOL DE MERKLE", "Los digests del periodo se agregan en una raíz única. Alterar un solo veredicto invalida la raíz publicada."],
  ["FIRMA", "Ed25519", "La raíz se firma con la clave privada del nodo (o del HSM del cliente en Enterprise). La clave pública es verificable por terceros."],
  ["TIEMPO", "RFC 3161 · eIDAS", "Una autoridad de sellado de tiempo cualificada fija el momento exacto de la firma. La evidencia gana valor procesal."],
];

const DEFENSE_VECTORS = [
  ["LLM01 · Prompt Injection", "Manipulación directa o indirecta del modelo para alterar su comportamiento.", "Separación estricta de roles a nivel sintáctico; AST de comandos permitidos.", "0,8 ms", "BENCHMARK"],
  ["LLM02 · Insecure Output Handling", "Salida del modelo consumida sin validación por sistemas posteriores.", "Validación de integridad dicotómica antes de la ejecución.", "1,4 ms", "BENCHMARK"],
  ["LLM06 · Sensitive Information Disclosure", "Exfiltración de PII, PHI o secretos a través del contexto.", "Sanitización k-anónima in-RAM; política de egreso de datos.", "1,2 ms", "BENCHMARK"],
  ["LLM08 · Excessive Agency", "El agente ejecuta acciones más allá de su mandato declared.", "Puerta de ejecución ex-ante; scope de acción por identidad firmada.", "0,4 ms", "BENCHMARK"],
  ["LLM10 · Unbounded Consumption", "Consumo ilimitado de tokens, cómputo o presupuesto.", "Context Slicing y umbrales deterministas por política.", "1,1 ms", "BENCHMARK"],
];

const INTEROP = [
  ["OPENAI", "GPT-4 · GPT-5 · o-series", "Intercepta las llamadas salientes hacia la API antes de que el prompt abandone su perímetro.", "PROXY / SDK"],
  ["ANTHROPIC", "Claude family", "Control de herramientas (tool-use) y de acciones autónomas sobre recursos corporativos.", "PROXY / SDK"],
  ["GOOGLE", "Gemini family", "Gobernanza del tráfico multimodal con la misma política declarativa.", "PROXY"],
  ["MODELOS LOCALES", "Llama · Mistral · DeepSeek", "Daemon local para inferencia privada: el control vive donde vive el modelo.", "DAEMON"],
];

const DEPLOYMENT = [
  ["VPC PRIVADA", "El nodo se despliega dentro de su nube virtual. Sus claves, sus políticas, su red.", "Business GRC / Enterprise"],
  ["PRIVATE CLOUD", "Clúster Kubernetes gestionado por su equipo con Helm chart firmado.", "Business GRC / Enterprise"],
  ["ON-PREMISE", "Servidor físico o virtual en su centro de datos. Systemd o servicio Windows.", "Enterprise / Legal Shield"],
  ["AIR-GAPPED", "Red aislada sin salida a Internet. Actualización de políticas por paquete firmado offline.", "Enterprise / Legal Shield"],
];

const TELEMETRIA_SALE = [
  "Contadores numéricos de veredictos (ALLOW / DENY / REVIEW)",
  "Estado y versión de la política activa",
  "Digest criptográfico SHA-256 de los veredictos",
  "Identificador técnico del nodo desplegado",
  "Métricas de latencia de aplicación del motor",
];

const TELEMETRIA_NO_SALE = [
  "Prompts ni respuestas del modelo en texto claro",
  "Datos personales (PII / PHI) ni identificadores de usuario",
  "Secretos corporativos, claves de API ni credenciales",
  "Contenido de conversaciones ni documentos procesados",
  "Topología interna de su infraestructura",
];

const BUEN_USO = [
  ["HUMAN-IN-THE-LOOP", "El veredicto REVIEW deriva la acción a un operador humano. Ninguna decisión de alto impacto se automatiza sin vía de escalado."],
  ["GOBERNANZA VIVA", "Las políticas se versionan y firman. Cada cambio queda registrado con autoría y marca de tiempo: la gobernanza es auditable."],
  ["PROPÓSITO DECLARADO", "S.A.A.R.E. es infraestructura de contención y prueba. No es una herramienta de vigilancia de personas ni de perfilado de empleados."],
  ["TRANSPARENCIA RADICAL", "Todo dato mostrado declara su naturaleza (DEMO, BENCHMARK, REFERENCE, LIVE). Ningún ejemplo se presenta como promesa universal."],
];

const PARTNER_ENTREGABLES = [
  ["ENTREGABLE 01", "Informe de gobernanza de IA", "Documento técnico que acredita la implantación del plano de control, firmado y verificable."],
  ["ENTREGABLE 02", "Matriz de cumplimiento operativo", "Trazabilidad de obligaciones (EU AI Act, DORA, NIS 2, RGPD) a controles ejecutables con evidencia asociada."],
  ["ENTREGABLE 03", "Expediente de evidencia sellada", "Muestra de la cadena de custodia del cliente: raíz Merkle, firma Ed25519 y sello RFC 3161."],
];

const CATALOGO = [
  {
    id: "free-explorer",
    grupo: "VERIFICACIÓN",
    etiqueta: "FREE / EXPLORER",
    nombre: "Verificador Público (Trust Layer)",
    claim: "Verificación puntual de hashes y veredictos existentes.",
    precio: "0 €",
    sufijo: "/gratuito",
    unidad: "Acceso público ilimitado",
    comprador: "Auditores, examinadores y usuarios web",
    features: ["Verificación puntual de hashes", "Acceso directo al Public Trust Anchor"],
    cta: "USAR VERIFICADOR PÚBLICO ↗",
    actionType: "link",
    href: "#trust-anchor",
    featured: false,
  },
  {
    id: "developer-pro",
    grupo: "RUNTIME EDGE",
    etiqueta: "DEVELOPER / PRO",
    nombre: "SDK & Runtime Edge",
    claim: "Control L7 con Token Binding y límites de inferencia.",
    precio: "149 €",
    sufijo: "/mes + consumo",
    unidad: "Por nodo / SDK integrado",
    comprador: "Startups y desarrolladores de agentes IA",
    features: ["Sensor L7 y LabEngine SDK nativo", "Inyección de Token Binding X.509"],
    cta: "SUSCRIBIR DEVELOPER ↗",
    actionType: "checkout",
    stripePriceId: "price_saare_dev_pro_monthly",
    featured: false,
  },
  {
    id: "business-grc",
    grupo: "SAAS & GRC",
    etiqueta: "BUSINESS GRC",
    nombre: "Business GRC Console (Todo en Uno)",
    claim: "Generación automatizada de informes EU AI Act y blindaje.",
    precio: "290 €",
    sufijo: "/mes",
    unidad: "Por tenant / organización",
    comprador: "Pymes tecnológicas y empresas con LLMs internos",
    features: ["Acceso completo a SAARE Console (4 superficies RBAC)", "Generación automática de informes PDF EU AI Act"],
    cta: "SUSCRIBIR BUSINESS GRC ↗",
    actionType: "checkout",
    stripePriceId: "price_saare_business_grc_monthly",
    featured: true,
  },
  {
    id: "enterprise-shield",
    grupo: "ENTERPRISE",
    etiqueta: "ENTERPRISE / LEGAL SHIELD",
    nombre: "Enterprise / Legal Shield (Custom PKI)",
    claim: "Inmunidad pericial, PKI propia y acuerdos SLA.",
    precio: "3.500 €",
    sufijo: "/mes",
    unidad: "Por nodo Enterprise con HSM",
    comprador: "Corporaciones, aseguradoras y despachos jurídicos",
    features: ["Certificados de evidencia preconstituida", "Integración nativa con HSM / PKI corporativa propia"],
    cta: "SOLICITAR PROPUESTA ENTERPRISE ↗",
    actionType: "link",
    href: WHATSAPP_URL,
    featured: false,
  },
];

const VISTAS_CONSOLA = [
  {
    id: "executive",
    badge: "VISTA BOARD / EXECUTIVE",
    titular: "Gobernanza cuantitativa y blindaje de responsabilidad",
    pregunta: "¿Qué riesgo está asumiendo el negocio?",
    rol: "BOARD_EXECUTIVE_LEVEL_1",
    metricas: [
      ["RIESGO ACUMULADO EX-ANTE", "0,02 %", "DEMO"],
      ["TOKENS INTERCEPTADOS / MES", "142.800 €", "DEMO"],
      ["AGENTES EN PRODUCCIÓN", "37 trazados", "DEMO"],
      ["EXPOSICIÓN BAJO DORA", "MITIGADA", "DEMO"],
    ],
    matriz: [
      ["EU AI Act art. 14", "Supervisión humana efectiva", "Cambio de política en vivo sin reiniciar sistemas", "Registro de cambio firmado"],
      ["EU AI Act art. 15", "Precisión y robustez del sistema", "Contención fail-closed y tolerancia estructural", "Veredicto firmado con latencia"],
      ["DORA art. 5", "Gobernanza y responsabilidad", "Políticas locales firmadas sin dependencia de red", "Registro de autonomía de nodo"],
      ["DORA art. 9", "Protección de incidentes TIC", "Intercepción ex-ante contra vectores L7", "Registro de intercepción sellado"],
      ["NIS 2 art. 20", "Responsabilidad de alta dirección", "Telemetría determinista sin contenido ni PII", "Contadores anónimos firmados"],
    ],
  },
  {
    id: "grc",
    badge: "VISTA GRC / PRIVACIDAD",
    titular: "La prueba llegó antes que el litigio",
    pregunta: "¿Qué controles puedo demostrar?",
    rol: "DPO_GRC_LEVEL_2",
    metricas: [
      ["ENMASCARAMIENTO PII", "DNI · IBAN · PHI", "REFERENCE"],
      ["CLASIFICACIÓN AI ACT", "Inaceptable · Alto · Limitado", "REFERENCE"],
      ["RGPD ART. 32", "Arquitectura Zero-Disk", "REFERENCE"],
      ["REGISTRO EIPD", "Inmutable y firmado", "REFERENCE"],
    ],
    matriz: [
      ["EU AI Act art. 10", "Gobernanza de datos", "Generalización y seudonimización ex-ante", "Registro de política aplicada"],
      ["EU AI Act art. 12", "Registro automático de eventos", "Registro en memoria sin violar minimización", "Huella criptográfica"],
      ["RGPD art. 5", "Minimización de datos", "Zeroización tras la firma, sin persistencia", "Digest HMAC-SHA256"],
      ["RGPD art. 32", "Seguridad del tratamiento", "Sanitización en RAM y arquitectura Zero-Disk", "Registro de no exfiltración"],
      ["ISO/IEC 27037", "Evidencia digital", "Cadena de Merkle y firma asimétrica", "Dossier forense offline"],
      ["Arts. 281 y 326 LEC", "Prueba documental", "Sellado cualificado y cadena de custodia", "Expediente para revisión pericial"],
    ],
  },
  {
    id: "cyber",
    badge: "VISTA CISO / RESILIENCIA",
    titular: "Ve cada intercepción mientras ocurre",
    pregunta: "¿Qué está bloqueando el motor ahora?",
    rol: "CISO_SECOPS_LEVEL_3",
    metricas: [
      ["PROMPT INJECTION L7", "Intercepción en tiempo real", "REFERENCE"],
      ["SHADOW AI", "Descubrimiento automático", "REFERENCE"],
      ["ESTADO FAIL-CLOSED", "100 % activo", "REFERENCE"],
      ["LATENCIA DE APLICACIÓN", "1,18 ms", "BENCHMARK"],
    ],
    matriz: [
      ["LLM01 · Prompt Injection", "Manipulación directa del modelo", "Separación estricta de roles sintácticos", "0,8 ms · BENCHMARK"],
      ["LLM02 · Insecure Output", "Salida no validada hacia sistemas", "Validación de integridad dicotómica", "1,4 ms · BENCHMARK"],
      ["LLM06 · Sensitive Info", "Exfiltración de datos sensibles", "Sanitización k-anónima in-RAM", "1,2 ms · BENCHMARK"],
      ["LLM08 · Excessive Agency", "Acciones fuera de política", "Puerta de ejecución ex-ante", "0,4 ms · BENCHMARK"],
      ["LLM10 · Unbounded Consumption", "Consumo ilimitado de recursos", "Context Slicing y umbral determinista", "1,1 ms · BENCHMARK"],
    ],
  },
  {
    id: "forense",
    badge: "VISTA FORENSE / PERICIAL",
    titular: "Verifique la evidencia sin confiar en nosotros",
    pregunta: "¿Puedo verificar la evidencia independientemente?",
    rol: "FORENSIC_EXTERNAL_LEVEL_4",
    metricas: [
      ["CADENA DE CUSTODIA", "Digest · Merkle · Ed25519 · RFC 3161", "REFERENCE"],
      ["VERIFICACIÓN", "Independiente, offline, por CLI", "REFERENCE"],
      ["BÓVEDA", "Ciega: sin acceso al contenido", "REFERENCE"],
      ["VALOR PROCESAL", "Arts. 281 / 326 LEC", "REFERENCE"],
    ],
    matriz: [
      ["Art. 326 LEC", "Documentos privados", "Dossier firmado y sellado con marca cualificada", "Expediente exportable verificable"],
      ["Art. 299 LEC", "Prueba pericial", "Verificación independiente por tercero cualificado", "Informe pericial sobre cadena"],
      ["ISO/IEC 27037", "Evidencia digital", "Identificación, recolección y preservación selladas", "Cadena de custodia documentada"],
      ["eIDAS (Reg. 910/2014)", "Sello cualificado", "Marcado RFC 3161 por autoridad reconocida", "Token de tiempo offline"],
    ],
  },
];

/* ==========================================================================
   COMPONENTES UI AUXILIARES
   ========================================================================== */
function DataLabel({ type }) {
  const conf = METRIC_LABELS[type] || METRIC_LABELS.DEMO;
  return (
    <span className={`inline-block font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border tracking-widest ${conf.cls}`}>
      {conf.text}
    </span>
  );
}

function MetricCard({ label, value, tag = "DEMO" }) {
  return (
    <div className="bg-saare-surface border border-saare-line p-4 rounded-lg font-mono">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] text-saare-ink-faint uppercase tracking-widest">{label}</span>
        <DataLabel type={tag} />
      </div>
      <div className="text-saare-ink font-bold text-base mt-2">{value}</div>
    </div>
  );
}

function PageHeader({ badge, title, description }) {
  return (
    <div className="border-b border-saare-line bg-saare-surface/60 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <span className="font-mono text-xs font-bold text-saare-accent uppercase tracking-widest bg-saare-accent/10 border border-saare-accent/30 px-3 py-1 rounded">
          {badge}
        </span>
        <h2 className="font-bold text-3xl sm:text-5xl text-saare-ink mt-4 tracking-tight leading-tight font-display">{title}</h2>
        <p className="mt-4 text-saare-ink-dim text-sm sm:text-base max-w-4xl leading-relaxed font-sans">{description}</p>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title, lead }) {
  return (
    <div className="mb-8">
      {kicker && <span className="font-mono text-[11px] font-bold text-saare-accent uppercase tracking-widest">{kicker}</span>}
      <h2 className="text-2xl sm:text-4xl font-bold text-saare-ink mt-2 font-display tracking-tight">{title}</h2>
      {lead && <p className="text-xs sm:text-sm text-saare-ink-dim mt-3 font-mono leading-relaxed max-w-3xl">{lead}</p>}
    </div>
  );
}

function CodePanel({ code, title = "INTEGRACIÓN TÉCNICA · CÓDIGO NATIVO" }) {
  return (
    <div className="bg-saare-surface-2 border border-saare-line rounded-lg overflow-hidden shadow-xl">
      <div className="bg-saare-surface border-b border-saare-line px-4 py-2 font-mono text-[10px] text-saare-accent font-bold tracking-widest">{title}</div>
      <pre className="p-4 text-[11px] font-mono text-saare-allow overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b border-saare-line/70 pb-2 text-[11px] font-mono">
      <span className="text-saare-ink-faint min-w-0">{label}</span>
      <span className="text-saare-ink text-right break-words min-w-0">{value}</span>
    </div>
  );
}

function VerdictChip({ verdict }) {
  const map = {
    ALLOW: "bg-saare-allow/15 border-saare-allow text-saare-allow",
    DENY: "bg-saare-deny/15 border-saare-deny text-saare-deny",
    REVIEW: "bg-saare-seal/15 border-saare-seal text-saare-seal",
    VERIFIED: "bg-saare-allow/15 border-saare-allow text-saare-allow",
    UNVERIFIABLE: "bg-saare-deny/15 border-saare-deny text-saare-deny",
  };
  return (
    <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${map[verdict] || map.REVIEW}`}>
      {verdict}
    </span>
  );
}

function DataTable({ headers, rows, renderLast }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[720px] text-left font-mono text-xs border-collapse">
        <thead>
          <tr className="border-b border-saare-line text-saare-accent">
            {headers.map((h, i) => (
              <th key={i} className={`pb-3 pr-4 align-bottom ${i === 0 ? "whitespace-nowrap" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-saare-line text-saare-ink-dim">
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td key={ci} className={`py-3 pr-4 align-top leading-relaxed ${ci === 0 ? "font-bold text-saare-ink whitespace-nowrap" : ""}`}>
                  {ci === r.length - 1 && renderLast ? renderLast(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==========================================================================
   LANDING PAGE CONTINUA
   ========================================================================== */
function LandingPage() {
  const [hash, setHash] = useState(DEMO_ROOT_MERKLE_HASH);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [trialForm, setTrialForm] = useState({ nombre: "", empresa: "", email: "", modo: "proxy", mensaje: "" });

  async function handleVerify(e) {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoadingVerify(true);
    const result = await verifyMerkleHash(hash.trim());
    setVerifyResult(result);
    setLoadingVerify(false);
  }

  async function handleTrialSubmit(e) {
    e.preventDefault();
    try {
      await saareFetch('/v1/trial/submit', { method: 'POST', body: trialForm });
    } catch {
      // Continuación limpia independientemente del estado offline/demo
    }
    setFormSent(true);
  }

  return (
    <div className="min-h-screen bg-saare-bg text-saare-ink font-sans selection:bg-saare-accent selection:text-black">
      {/* BANNER SUPERIOR DE NAVEGACIÓN Y ACCESO CONSOLA */}
      <div className="border-b border-saare-line bg-saare-surface px-4 py-2 text-center text-[10px] sm:text-xs font-mono text-saare-ink-faint flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <span className="text-saare-accent font-bold">S.A.A.R.E. SGP 1.0</span>
          <span className="mx-2 hidden sm:inline">·</span>
          <span className="hidden sm:inline">Infraestructura de autorización ex-ante y gobernanza runtime L7</span>
        </div>
        <Link to="/login" className="text-saare-accent font-bold hover:underline bg-saare-accent/10 border border-saare-accent/30 px-2.5 py-1 rounded">
          ACCEDER A CONSOLA ↗
        </Link>
      </div>

      <main>
        {/* 01 · HERO + DECISION TRACE */}
        <section className="relative overflow-hidden border-b border-saare-line bg-saare-bg">
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#232E4222_1px,transparent_1px),linear-gradient(to_bottom,#232E4222_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
            <div className="grid xl:grid-cols-[1.1fr_.9fr] gap-12 items-center">
              <div>
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-saare-accent bg-saare-accent/10 border border-saare-accent/30 px-3 py-1 rounded">
                  GOBERNANZA EJECUTABLE & BLINDAJE EU AI ACT
                </span>

                <h1 className="font-display font-bold text-4xl sm:text-6xl text-saare-ink tracking-tight leading-[1.02] mt-6">
                  Sus agentes de IA actúan.<br />
                  <span className="text-saare-accent">S.A.A.R.E. decide antes.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base sm:text-lg text-saare-ink-dim leading-relaxed font-sans">
                  Convierte las políticas de uso de IA en una decisión ejecutable
                  antes de que la acción alcance el sistema, garantizando cumplimiento legal y defensa corporativa.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a href="#trial" className="px-6 py-3.5 rounded bg-saare-accent text-black font-mono text-xs font-bold hover:bg-saare-accent/80 transition">
                    SOMETER UN AGENTE ↗
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="px-6 py-3.5 rounded border border-saare-line-hi text-saare-ink font-mono text-xs font-bold hover:bg-saare-surface transition">
                    SOLICITAR ARQUITECTURA ENTERPRISE ↗
                  </a>
                </div>

                <div className="mt-8 flex items-center gap-6 font-mono text-[10px] text-saare-ink-faint">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-saare-allow"></span> ALLOW / DENY</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-saare-accent"></span> EX-ANTE</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-saare-seal"></span> FAIL-CLOSED</span>
                </div>
              </div>

              <div className="bg-saare-surface border border-saare-line rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between border-b border-saare-line px-4 py-2.5 bg-saare-surface-2">
                  <span className="font-mono text-[10px] tracking-widest text-saare-ink-dim">S.A.A.R.E. / DECISION TRACE</span>
                  <DataLabel type="REFERENCE" />
                </div>
                <div className="p-6 font-mono text-xs space-y-3">
                  <DataRow label="AGENT" value="treasury-agent-04" />
                  <DataRow label="ACTION" value="SEND_PAYMENT" />
                  <DataRow label="RESOURCE" value="core-banking-api://transfers" />
                  <DataRow label="POLICY" value="FIN-PAYMENT-042 (v17)" />
                  <DataRow label="RISK" value="HIGH · OUTBOUND" />
                  <div className="pt-3 flex items-center justify-between border-t border-saare-line">
                    <span className="text-saare-ink-faint">VERDICT</span>
                    <VerdictChip verdict="DENY" />
                  </div>
                  <div className="text-[9px] text-saare-ink-faint pt-2 border-t border-saare-line/40 break-all">
                    MERKLE ROOT: {DEMO_ROOT_MERKLE_HASH}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 · PUBLIC TRUST ANCHOR */}
        <section id="trust-anchor" className="border-b border-saare-line bg-black py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[.85fr_1.15fr] gap-8 items-center">
              <div>
                <span className="font-mono text-[10px] font-bold text-saare-seal uppercase tracking-[0.2em]">FREE / EXPLORER (TRUST LAYER)</span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-saare-ink mt-2">No confíe en nosotros. Verifique.</h2>
                <p className="mt-3 text-xs text-saare-ink-dim leading-relaxed font-mono">
                  La consulta y verificación de veredictos unitarios (Trust Layer) es pública y gratuita.
                  Valide cualquier hash SHA-256 o identificador VRD- para comprobar la fehaciencia erga omnes de la evidencia.
                </p>
              </div>
              <div>
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    placeholder="Merkle Root o ID de evidencia (VRD-...)"
                    className="flex-1 bg-saare-surface border border-saare-line px-4 py-3 text-xs font-mono text-saare-ink rounded focus:outline-none focus:border-saare-seal"
                  />
                  <button type="submit" disabled={loadingVerify} className="px-5 py-3 rounded bg-saare-seal text-black font-mono text-xs font-bold hover:bg-saare-seal/80 transition cursor-pointer">
                    {loadingVerify ? 'CONSULTANDO...' : 'VERIFICAR'}
                  </button>
                </form>
                {verifyResult && (
                  <div className="mt-3 rounded border p-4 bg-saare-surface font-mono border-saare-allow/50">
                    <div className="flex items-center gap-2">
                      <VerdictChip verdict={verifyResult.status} />
                      <span className="text-xs text-saare-ink">Registro confirmado en el Trust Anchor</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <DataRow label="ALGORITHM" value={verifyResult.algorithm} />
                      <DataRow label="TIMESTAMP" value={verifyResult.standard} />
                      <DataRow label="EVIDENCE" value="MERKLE ROOT" />
                    </div>
                    <div className="mt-2 text-[10px] text-saare-ink-faint break-all">{verifyResult.hash}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 03 · CUMPLIMIENTO NORMATIVO EIDAS */}
        <section className="border-b border-saare-line bg-saare-surface py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="CUMPLIMIENTO NORMATIVO EUROPEO"
              title="Sellado eIDAS RFC 3161 por Delegación"
              lead="Garantía jurídica plena sin los costes ni la fricción de operar como QTSP primario. S.A.A.R.E. ancla los árboles de Merkle mediante autoridades de certificación cualificadas de la Unión Europea."
            />
            <div className="grid lg:grid-cols-2 gap-8 mt-10">
              <div className="bg-saare-surface-2 border border-saare-line p-6 rounded-xl font-mono text-xs space-y-4">
                <div className="text-saare-accent font-bold uppercase tracking-widest text-[10px]">ARQUITECTURA DE CONFIANZA EIDAS</div>
                <h3 className="text-saare-ink font-bold text-sm">Heredando la validez jurídica europea</h3>
                <p className="text-saare-ink-dim leading-relaxed text-[11px]">
                  En lugar de someter a la organización a costosas auditorías de hardware HSM primario (ETSI EN 319 401), S.A.A.R.E. empaqueta el Root Merkle Bound local y solicita un Time-Stamp Token (TST) a un Prestador Cualificado de Servicios de Confianza (QTSP) homologado.
                </p>
                <div className="space-y-2 pt-2 border-t border-saare-line">
                  <DataRow label="ESTÁNDAR" value="RFC 3161 · eIDAS Reg. 910/2014" />
                  <DataRow label="VALOR PROCESAL" value="Arts. 281 y 326 LEC (España / UE)" />
                  <DataRow label="COSTE OPERATIVO" value="Optimizado por delegación de API" />
                </div>
              </div>
              <CodePanel
                title="ESTRUCTURA DEL SELLO EIDAS (REFERENCE JSON)"
                code={`{
  "expediente": "IA-2026-VAL-AUD-8842-XF",
  "qtsp_provider": "Autoridad Cualificada UE (RFC 3161)",
  "root_merkle_bound": "c1b681097685b75ef8e965aebd...",
  "time_stamp_token": "TST-901842-EU-SECURE",
  "legal_status": "PRESUNCIÓN DE INTEGRIDAD Y NO REPUDIO",
  "conformity": [
    "eIDAS (Reg. 910/2014)",
    "EU AI Act Art. 12/15",
    "LEC Art. 326"
  ]
}`}
              />
            </div>
          </div>
        </section>

        {/* 04 · DE PAPEL A ENFORCEMENT */}
        <section className="border-b border-saare-line bg-saare-bg py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="DE PAPEL A ENFORCEMENT"
              title="Tu política de IA no debería ser solo un documento. Debería poder ejecutarse."
              lead="Un Plan de Uso de IA en papel no detiene una fuga ni evita multas del EU AI Act. La misma política, compilada a regla versionada, sí."
            />
            <div className="grid lg:grid-cols-2 gap-8 mt-10">
              <div className="bg-saare-surface border border-saare-line rounded-xl p-6">
                <div className="font-mono text-[10px] font-bold text-saare-deny tracking-widest mb-6">ANTES · GOBIERNO DOCUMENTAL</div>
                <div className="space-y-4 font-mono text-xs">
                  {[
                    ["POLÍTICA DE USO DE IA", "Documento aprobado por dirección"],
                    ["PDF", "Distribuido por correo interno"],
                    ["FORMACIÓN", "Sesión anual de concienciación"],
                    ["CONFIANZA EN EL USUARIO", "Sin control técnico efectivo"],
                  ].map(([t, d], i, arr) => (
                    <div key={t}>
                      <div className="bg-saare-surface-2 border border-saare-line p-4 rounded-lg">
                        <div className="text-saare-ink font-bold">{t}</div>
                        <div className="text-[10px] text-saare-ink-faint mt-1">{d}</div>
                      </div>
                      {i < arr.length - 1 && <div className="text-center text-saare-ink-faint py-1">↓</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-saare-surface border border-saare-allow/30 rounded-xl p-6">
                <div className="font-mono text-[10px] font-bold text-saare-allow tracking-widest mb-6">CON S.A.A.R.E. · GOBIERNO EJECUTABLE</div>
                <div className="space-y-4 font-mono text-xs">
                  {[
                    ["POLÍTICA", "La misma decisión de gobierno"],
                    ["REGLA VERSIONADA", "Compilada a nativo y firmada"],
                    ["DECISIÓN EX-ANTE", "Antes de que la acción ocurra"],
                    ["ALLOW / DENY", "Veredicto binario en el punto de acción"],
                    ["EVIDENCIA", "Digest sellado, firmado y anclado"],
                  ].map(([t, d], i, arr) => (
                    <div key={t}>
                      <div className="bg-saare-surface-2 border border-saare-allow/20 p-4 rounded-lg">
                        <div className="text-saare-ink font-bold">{t}</div>
                        <div className="text-[10px] text-saare-ink-faint mt-1">{d}</div>
                      </div>
                      {i < arr.length - 1 && <div className="text-center text-saare-allow/60 py-1">↓</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05 · SIETE DIMENSIONES */}
        <section className="border-b border-saare-line bg-saare-surface py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="MODELO DE EVALUACIÓN"
              title="Siete dimensiones resueltas antes de cada acción"
              lead="Cada intento de acción se descompone en siete preguntas. Si alguna dimensión falla contra la política firmada, el veredicto es DENY y no hay ejecución."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10">
              {DIMENSIONS.map(([dim, title, desc]) => (
                <div key={dim} className="bg-saare-surface-2 border border-saare-line p-5 rounded-lg font-mono">
                  <div className="text-[10px] text-saare-accent font-bold">{dim}</div>
                  <div className="text-saare-ink font-bold text-sm mt-2">{title}</div>
                  <div className="text-[11px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 06 · DECISION PATH */}
        <section className="border-b border-saare-line bg-saare-bg py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="DECISION PATH"
              title="Action → Verdict → Permit"
              lead="El recorrido completo de una acción dentro del plano de control. Todo ocurre en memoria volátil del nodo; solo el digest del resultado abandona el proceso."
            />
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mt-10 font-mono">
              {DECISION_PATH.map(([num, title, desc, state]) => (
                <div key={num} className="bg-saare-surface border border-saare-line p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-saare-accent font-bold">{num}</span>
                    <span className="text-[8px] text-saare-ink-faint font-bold">{state}</span>
                  </div>
                  <div className="text-saare-ink font-bold text-xs mt-2">{title}</div>
                  <div className="text-[10px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 07 · CADENA DE CUSTODIA (EVIDENCE CHAIN) */}
        <section className="border-b border-saare-line bg-saare-surface py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <SectionTitle
                  kicker="EVIDENCE CHAIN"
                  title="Digest → Merkle → Ed25519 → RFC 3161"
                  lead="Cada veredicto puede convertirse en una prueba verificable por un tercero, sin necesidad de confiar en S.A.A.R.E. ni en su infraestructura."
                />
                <div className="space-y-3 font-mono text-xs">
                  {EVIDENCE_CHAIN.map(([tag, name, desc]) => (
                    <div key={tag} className="bg-saare-surface-2 border border-saare-line p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-saare-accent bg-saare-accent/10 border border-saare-accent/30 px-2 py-0.5 rounded">{tag}</span>
                        <span className="text-saare-ink font-bold">{name}</span>
                      </div>
                      <p className="text-[11px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-saare-surface-2 border border-saare-line rounded-xl p-6 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-saare-line pb-3">
                  <span className="text-saare-accent font-bold">EVIDENCE VAULT · CADENA DE CUSTODIA</span>
                  <VerdictChip verdict="VERIFIED" />
                </div>
                <DataRow label="DIGEST" value="SHA-256 · e3b0c44298fc1c14…" />
                <DataRow label="MERKLE ROOT" value="6f1b3986…c7f1a842" />
                <DataRow label="SIGNATURE" value="Ed25519 · HSM_KEY_0x9F" />
                <DataRow label="TIMESTAMP" value="RFC 3161 · eIDAS cualificado" />
                <div className="pt-3 border-t border-saare-line text-[10px] text-saare-ink-faint leading-relaxed">
                  Bóveda ciega: sin persistencia de payloads sensibles en disco. Trazabilidad completa con presunción legal de integridad.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 08 · TRES MODOS DE EJECUCIÓN (SDK, PROXY, DAEMON) */}
        <section className="border-b border-saare-line bg-saare-bg py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="DESARROLLADORES & INFRAESTRUCTURA"
              title="Tres modos de ejecución. Un mismo motor."
              lead="La lógica de decisión es idéntica en los tres; cambia únicamente el punto de intercepción según su arquitectura."
            />

            <div className="grid lg:grid-cols-3 gap-8 mt-10">
              <div className="bg-saare-surface border border-saare-line p-6 rounded-xl space-y-4">
                <span className="text-[10px] font-bold text-saare-allow font-mono uppercase">LABENGINE · MODO SDK</span>
                <h3 className="text-saare-ink font-bold text-xl">El control vive dentro de la aplicación</h3>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  Paquete nativo que envuelve las llamadas del agente y consulta al motor en memoria compartida. Sin salida de red: la autorización ocurre in-process.
                </p>
                <CodePanel
                  title="PYTHON (REFERENCE)"
                  code={`from saare import LabEngine

engine = LabEngine(node_key='HSM', policy='POL-01')
@engine.guard(action='SEND_PAYMENT')
def pay(amount, iban):
    return api.transfer(amount, iban)`}
                />
              </div>

              <div className="bg-saare-surface border border-saare-line p-6 rounded-xl space-y-4">
                <span className="text-[10px] font-bold text-saare-allow font-mono uppercase">PERIMETERSHIELD · MODO PROXY</span>
                <h3 className="text-saare-ink font-bold text-xl">El control vive en el tráfico</h3>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  Pasarela L7 que intercepta cada petición hacia proveedores de IA o APIs internas antes de que salga del perímetro. Docker, Helm o Sidecar.
                </p>
                <CodePanel
                  title="HELM / K8S (REFERENCE)"
                  code={`helm install perimetershield saare/charts \\
  --set node.keyRef=hsm://pkcs11/key-0x9f \\
  --set policy.bundle=FIN-PAYMENT-042:v17 \\
  --set failClosed=true`}
                />
              </div>

              <div className="bg-saare-surface border border-saare-line p-6 rounded-xl space-y-4">
                <span className="text-[10px] font-bold text-saare-allow font-mono uppercase">LOCAL NODE · MODO DAEMON</span>
                <h3 className="text-saare-ink font-bold text-xl">El control vive en su servidor</h3>
                <p className="text-saare-ink-dim text-xs leading-relaxed">
                  Servicio local para redes aisladas y modelos propios. Systemd o servicio Windows, con claves en HSM del cliente y actualización offline.
                </p>
                <CodePanel
                  title="SYSTEMD (REFERENCE)"
                  code={`saare-cli verify saare-node-1.0.sgp
sudo dpkg -i saare-node-1.0.sgp
sudo systemctl enable --now saare-node`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 09 · DEFENSA ACTIVA (OWASP) */}
        <section className="border-b border-saare-line bg-saare-surface py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="DEFENSA ACTIVA"
              title="Injection, PII, Shadow AI, Fail-Closed"
              lead="Contención determinista de los vectores críticos del OWASP LLM Top 10, con la latencia medida en banco de pruebas de cada intercepción."
            />
            <div className="bg-saare-surface-2 border border-saare-line rounded-xl p-6 mt-8">
              <DataTable
                headers={["VECTOR OWASP", "MECANISMO DE EXPLOTACIÓN", "MITIGACIÓN DETERMINISTA", "LATENCIA", "ETIQUETA"]}
                rows={DEFENSE_VECTORS}
                renderLast={(cell) => <DataLabel type={cell} />}
              />
            </div>
          </div>
        </section>

        {/* 10 · INTEROPERABILIDAD Y DESPLIEGUE SOBERANO */}
        <section className="border-b border-saare-line bg-saare-bg py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="INTEROPERABILIDAD Y DESPLIEGUE"
              title="Agnóstico al modelo. Soberano en la infraestructura."
              lead="La política se escribe una vez y se aplica igual sobre cualquier modelo, en la nube o en su propio centro de datos."
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 font-mono text-xs">
              {INTEROP.map(([name, family, desc, mode]) => (
                <div key={name} className="bg-saare-surface border border-saare-line p-5 rounded-lg">
                  <div className="text-saare-ink font-bold text-sm">{name}</div>
                  <div className="text-[10px] text-saare-accent mt-1">{family}</div>
                  <p className="text-[11px] text-saare-ink-dim mt-3 leading-relaxed">{desc}</p>
                  <div className="text-[9px] text-saare-ink-faint mt-3 font-bold">{mode}</div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 font-mono text-xs">
              {DEPLOYMENT.map(([name, desc, tramo]) => (
                <div key={name} className="bg-saare-surface border border-saare-line p-5 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="text-saare-ink font-bold text-sm">{name}</div>
                    <p className="text-[11px] text-saare-ink-dim mt-3 leading-relaxed">{desc}</p>
                  </div>
                  <div className="text-[9px] text-saare-allow font-bold mt-4">{tramo}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11 · CONSOLA MULTI-VISTA (SAARE_CONSOLE) */}
        <section id="saare-console" className="border-b border-saare-line bg-saare-surface py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="saare_console"
              title="Una sola consola para cuatro lecturas del mismo sistema"
              lead="Mismo motor. Mismas decisiones. Misma evidencia. Distinta interpretación según el rol de acceso RBAC."
            />
            <div className="space-y-12 mt-10">
              {VISTAS_CONSOLA.map((v) => (
                <div key={v.id} className="bg-saare-surface-2 border border-saare-line rounded-xl p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-saare-line">
                    <div>
                      <span className="font-mono text-xs text-saare-accent font-bold uppercase">{v.badge}</span>
                      <h3 className="text-xl font-bold text-saare-ink mt-1">{v.titular}</h3>
                    </div>
                    <div className="font-mono text-right text-xs">
                      <div className="text-saare-ink-dim">{v.pregunta}</div>
                      <div className="text-saare-ink-faint text-[10px] mt-1">Rol: {v.rol}</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {v.metricas.map(([label, value, tag]) => (
                      <MetricCard key={label} label={label} value={value} tag={tag} />
                    ))}
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xs font-mono font-bold text-saare-accent uppercase tracking-widest mb-3">MATRIZ DE CUMPLIMIENTO / VECTORES</h4>
                    <DataTable
                      headers={["MARCO / VECTOR", "CONTROL / REQUISITO", "MITIGACIÓN S.A.A.R.E.", "EVIDENCIA / LATENCIA"]}
                      rows={v.matriz}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12 · MODELO DE MONETIZACIÓN & CATALOGO (STRIPE CHECKOUT) */}
        <section id="licencias" className="border-b border-saare-line bg-saare-bg py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="MODELO DE MONETIZACIÓN SAAS & GRC"
              title="Los 4 Niveles de Gobierno y Cumplimiento S.A.A.R.E."
              lead="Desde la verificación pública gratuita hasta la inmunidad pericial Enterprise con PKI propia y blindaje frente al EU AI Act."
            />
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              {CATALOGO.map((item) => (
                <div
                  key={item.id}
                  className={`bg-saare-surface border p-6 rounded-lg font-mono relative flex flex-col justify-between ${
                    item.featured ? "border-saare-allow/50" : "border-saare-accent/40"
                  }`}
                >
                  <div>
                    {item.featured && (
                      <span className="absolute top-4 right-4 text-[9px] font-bold bg-saare-allow/15 border border-saare-allow/40 text-saare-allow px-2 py-0.5 rounded">
                        RECOMENDADO
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-saare-ink-faint uppercase tracking-widest">{item.grupo}</span>
                    <div className="text-xs font-bold text-saare-accent uppercase tracking-widest mt-1">{item.etiqueta}</div>
                    <h3 className="text-saare-ink font-bold text-base mt-2">{item.nombre}</h3>
                    <p className="text-[11px] text-saare-ink-dim leading-relaxed mt-2">{item.claim}</p>
                    <div className="text-2xl font-bold text-saare-ink mt-4">
                      {item.precio}
                      <span className="text-xs font-normal text-saare-ink-faint"> {item.sufijo}</span>
                    </div>
                    <p className="text-[10px] text-saare-ink-faint mt-1">{item.unidad}</p>
                    
                    <ul className="mt-6 space-y-2 text-[11px] border-t border-saare-line pt-4 text-saare-ink-dim">
                      {item.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2">
                          <span className="text-saare-allow">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.actionType === "checkout" ? (
                    <button
                      onClick={() => saareCheckout(item.stripePriceId)}
                      className="block w-full text-center px-5 py-3 mt-8 bg-saare-accent text-black font-bold text-xs rounded hover:bg-saare-accent/80 transition cursor-pointer"
                    >
                      {item.cta}
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : "_self"}
                      rel="noreferrer"
                      className="block w-full text-center px-5 py-3 mt-8 bg-saare-accent text-black font-bold text-xs rounded hover:bg-saare-accent/80 transition"
                    >
                      {item.cta}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 13 · PROGRAMA PARTNERS */}
        <section className="border-b border-saare-line bg-saare-surface py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="CANAL PARTNER"
              title="Venda gobernanza de IA sin construirla."
              lead="S.A.A.R.E. es la solución técnica. El programa Partner es el canal. Licenciamiento marca blanca para consultoras, MSPs y agentes digitalizadores."
            />
            <div className="grid md:grid-cols-3 gap-4 mt-8 font-mono text-xs">
              {PARTNER_ENTREGABLES.map(([num, title, desc]) => (
                <div key={num} className="bg-saare-surface-2 border border-saare-line p-5 rounded-lg">
                  <div className="text-[10px] text-saare-accent font-bold">{num}</div>
                  <div className="text-saare-ink font-bold text-sm mt-2">{title}</div>
                  <p className="text-[11px] text-saare-ink-dim mt-2 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 14 · FORMULARIO TRIAL / SOMETER AGENTE */}
        <section id="trial" className="border-b border-saare-line bg-saare-bg py-20">
          <div className="max-w-4xl mx-auto px-6">
            <PageHeader
              badge="PRUEBA DE CONTROL"
              title="Someta un agente a control"
              description="Evaluación cualificada: desplegamos un nodo de demostración sobre uno de sus agentes y le entregamos el decision trace y la evidencia sellada del ejercicio."
            />
            <div className="mt-8">
              {formSent ? (
                <div className="bg-saare-surface border border-saare-allow/40 rounded-xl p-10 text-center font-mono">
                  <VerdictChip verdict="VERIFIED" />
                  <h2 className="text-saare-ink font-bold text-xl mt-4">Solicitud registrada</h2>
                  <p className="text-saare-ink-dim text-sm mt-3 max-w-md mx-auto leading-relaxed">
                    Un arquitecto de soluciones le contactará en un plazo máximo de 48 h laborables
                    para definir el alcance del ejercicio de control.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTrialSubmit} className="bg-saare-surface border border-saare-line rounded-xl p-8 font-mono text-xs space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">NOMBRE Y CARGO</label>
                      <input required value={trialForm.nombre} onChange={(e) => setTrialForm({ ...trialForm, nombre: e.target.value })}
                        className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent" placeholder="Nombre · CISO / CTO / DPO" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">ORGANIZACIÓN</label>
                      <input required value={trialForm.empresa} onChange={(e) => setTrialForm({ ...trialForm, empresa: e.target.value })}
                        className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent" placeholder="Empresa o entidad" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">EMAIL CORPORATIVO</label>
                    <input required type="email" value={trialForm.email} onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                      className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent" placeholder="nombre@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">MODO DE EJECUCIÓN A EVALUAR</label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        ["sdk", "SDK · LabEngine", "Dentro de la aplicación"],
                        ["proxy", "PROXY · PerimeterShield", "En el tráfico de red"],
                        ["daemon", "DAEMON · Local Node", "En el servidor / air-gapped"],
                      ].map(([val, title, desc]) => (
                        <button type="button" key={val} onClick={() => setTrialForm({ ...trialForm, modo: val })}
                          className={`text-left p-4 rounded-lg border transition ${trialForm.modo === val ? "border-saare-accent/60 bg-saare-accent/10" : "border-saare-line bg-saare-surface-2 hover:border-saare-line-hi"}`}>
                          <div className="text-saare-ink font-bold">{title}</div>
                          <div className="text-[10px] text-saare-ink-faint mt-1">{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-saare-ink-faint tracking-widest mb-2">CONTEXTO DEL AGENTE (OPCIONAL)</label>
                    <textarea rows={4} value={trialForm.mensaje} onChange={(e) => setTrialForm({ ...trialForm, mensaje: e.target.value })}
                      className="w-full bg-saare-surface-2 border border-saare-line px-4 py-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent resize-none"
                      placeholder="Qué hace el agente, a qué sistemas accede y qué política quiere hacer ejecutable." />
                  </div>
                  <button type="submit" className="w-full py-4 bg-saare-allow text-black font-bold rounded hover:bg-saare-allow/80 transition cursor-pointer">
                    SOMETER UN AGENTE ↗
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 15 · BUEN USO & TELEMETRÍA */}
        <section className="border-b border-saare-line bg-saare-surface py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionTitle
              kicker="SEGURIDAD Y BUEN USO"
              title="Contención de máquinas. No vigilancia de personas."
              lead="S.A.A.R.E. es infraestructura de autorización y prueba sobre acciones de agentes de IA."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 font-mono text-xs">
              {BUEN_USO.map(([title, desc]) => (
                <div key={title} className="bg-saare-surface-2 border border-saare-line p-5 rounded-lg">
                  <div className="text-saare-ink font-bold text-xs">{title}</div>
                  <p className="text-[11px] text-saare-ink-dim mt-3 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-12 font-mono text-xs">
              <div className="bg-saare-surface-2/80 border border-saare-allow/30 p-6 rounded-xl">
                <div className="text-saare-allow font-bold mb-4">✓ SALE DEL NODO (TELEMETRÍA MÍNIMA)</div>
                <ul className="space-y-2 text-saare-ink-dim">
                  {TELEMETRIA_SALE.map((t) => (
                    <li key={t} className="flex items-center gap-2"><span className="text-saare-allow">›</span> {t}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-saare-surface-2/80 border border-saare-deny/30 p-6 rounded-xl">
                <div className="text-saare-deny font-bold mb-4">× NO SALE DEL NODO (NUNCA PERSISTIDO)</div>
                <ul className="space-y-2 text-saare-ink-faint">
                  {TELEMETRIA_NO_SALE.map((t) => (
                    <li key={t} className="flex items-center gap-2"><span className="text-saare-deny">›</span> {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 16 · INFORMACIÓN CORPORATIVA & FOOTER */}
        <footer className="bg-saare-surface pt-16 pb-12 px-6 font-mono text-xs text-saare-ink-dim">
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-saare-line">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-saare-ink font-display">S.A.A.R.E.</span>
                <span className="text-[9px] bg-saare-accent/10 border border-saare-accent/30 text-saare-accent px-2 py-0.5 rounded font-bold">SGP 1.0</span>
              </div>
              <p className="text-[10px] text-saare-ink-faint mt-3 leading-relaxed">
                MS3V S.A.A.R.E. SL · Infraestructura española de autorización ex-ante y gobernanza runtime L7 para Inteligencia Artificial.
              </p>
            </div>
            <div>
              <div className="text-[10px] text-saare-ink-faint tracking-widest font-bold">CONTACTO</div>
              <div className="mt-3 space-y-2 text-[11px]">
                <div>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-saare-ink hover:underline">{CONTACT_EMAIL}</a></div>
                <div>Teléfono: <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="text-saare-ink hover:underline">{CONTACT_PHONE}</a></div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-saare-ink-faint tracking-widest font-bold">ACCESO ENTERPRISE</div>
              <div className="mt-3 text-[11px]">
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-saare-allow font-bold hover:underline">
                  Solicitar Propuesta por WhatsApp ↗
                </a>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-saare-ink-faint tracking-widest font-bold">MARCO LEGAL</div>
              <div className="mt-3 text-[10px] text-saare-ink-faint leading-relaxed">
                Procesamiento en memoria volátil Zero-Disk. Cumplimiento con RGPD, eIDAS, DORA y EU AI Act.
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto text-center text-[10px] text-saare-ink-faint mt-8">
            © 2026 MS3V S.A.A.R.E. SL. Todos los derechos reservados.
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ==========================================================================
   ENRUTADOR GENERAL DE LA APLICACIÓN
   ========================================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}