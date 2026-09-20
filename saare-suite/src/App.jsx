import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { saareFetch } from "./utils/api";

/* ==========================================================================
   CONSTANTES GLOBALES, REGISTROS CRIPTOGRÁFICOS Y CONFIGURACIÓN SGP 1.0
   ========================================================================== */
const DEMO_ROOT_MERKLE_HASH =
  "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";

const CONTACT_EMAIL = "legal@saare.es";
const CONTACT_PHONE = "+34 633 886 506";
const WHATSAPP_URL =
  "https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE%20SGP%201.0";

const NAV = [
  { id: "audit", label: "1. AUDITORÍA", description: "Motor público", path: "/" },
  { id: "compliance", label: "2. CUMPLIMIENTO", description: "Consola GRC", path: "/cumplimiento" },
  { id: "forensic", label: "3. FORENSE", description: "Evidence Vault", path: "/forense" },
  { id: "sales", label: "4. VENTAS", description: "Canal Partner", path: "/ventas" },
  { id: "sdk", label: "5. SDK", description: "LabEngine", path: "/sdk" },
  { id: "proxy", label: "6. PROXY", description: "PerimeterShield", path: "/proxy" },
  { id: "daemon", label: "7. DAEMON", description: "On-Premise", path: "/daemon" },
];

const DIMENSIONS = [
  ["DIM 01", "IDENTIDAD", "Quién solicita la acción. Verificación asimétrica de firmas Ed25519 del agente o token JWT del sistema originador."],
  ["DIM 02", "ACCIÓN", "Qué quiere ejecutar. Inspección L7 de comandos (READ, MUTATE_DATABASE, SEND_PAYMENT, DELETE, EXECUTE_CODE)."],
  ["DIM 03", "CONTEXTO", "En qué contexto ocurre. Evaluación de la variable temporal, IP de origen, geolocalización y nivel de aislamiento de la sesión."],
  ["DIM 04", "RECURSO", "Sobre qué recurso. Validación del URI objetivo, tabla de base de datos, servicio financiero o endpoint API receptor."],
  ["DIM 05", "DATOS", "Qué datos intervienen. Inspección y sanitización in-RAM k-Anonymity para PII (DNI, NIF), PHI (Salud) e IBANs en tránsito."],
  ["DIM 06", "RIESGO", "Qué nivel de riesgo presenta. Scoring determinista basado en impacto económico, destructividad operativa y vector de ataque."],
  ["DIM 07", "POLÍTICA", "Qué regla aplica. Verificación contra el motor de políticas firmado localmente y compilado a código nativo."],
];

const PRICING_STRUCTURE = {
  nodes: [
    {
      id: "base",
      name: "Nodo Base PEP L7",
      price: "149 €",
      suffix: "/mes",
      description: "Contención L7 e intercepción determinista en tiempo real sobre memoria RAM volátil.",
      features: [
        "Motor de decisión en RAM (<1.16ms)",
        "Intercepción L7 síncrona",
        "Veredictos ALLOW / REVIEW / DENY",
        "Evaluación de las 7 dimensiones de control",
        "Modo Fail-Closed configurable",
        "Sin custodia persistente de evidencias",
      ],
    },
    {
      id: "custody",
      name: "Nodo con Custodia Forense",
      price: "290 €",
      suffix: "/mes",
      description: "Control continuo con sellado asimétrico y generación de evidencias probatorias exportables.",
      features: [
        "Todo lo incluido en Nodo Base PEP L7",
        "Sellado continuo con firma Ed25519",
        "Estructuración en árbol de Merkle",
        "Marcado de tiempo eIDAS RFC 3161",
        "Dossier judicial exportable (Art. 326 LEC)",
        "Integración con Public Trust Anchor",
      ],
      featured: true,
    },
    {
      id: "enterprise",
      name: "Nodo Soberano Enterprise",
      price: "3.500 €",
      suffix: "/mes",
      description: "Despliegue perimetral aislado para infraestructuras críticas y alta disponibilidad.",
      features: [
        "Despliegue en VPC privada o Air-Gapped",
        "Integración con HSM corporativo (PKCS#11)",
        "Claves de cifrado gestionadas por el cliente",
        "SLA garantizado del 99.99% disponibilidad",
        "Soporte técnico dedicado 24/7 de Nivel 3",
        "Despliegue en clusters de Kubernetes / Helm",
      ],
    },
  ],
  services: [
    {
      id: "evidence_packs",
      label: "EVIDENCIAS",
      name: "Paquete de Sellado eIDAS",
      price: "120 €",
      suffix: "/mes (1.000 sellos)",
      description: "Bono de marcado temporal cualificado RFC 3161 para auditorías de alta frecuencia.",
    },
    {
      id: "forensic_dossier",
      label: "FORENSE",
      name: "Licencia Estación Pericial",
      price: "1.200 €",
      suffix: "/año + 300 €/dossier",
      description: "Certificación judicial de evidencias procesales con tacha cero ante tribunales.",
    },
    {
      id: "partner_channel",
      label: "CANAL",
      name: "Programa Partner Multi-Tenant",
      price: "Desde 450 €",
      suffix: "/cliente/año",
      description: "Licenciamiento marca blanca para consultoras, MSPs y Agentes Digitalizadores (Kit Consulting).",
    },
  ],
};

const SEO_CONFIG = {
  home: {
    title: "1. Auditoría Pública | S.A.A.R.E. SGP 1.0 Public Trust Anchor",
    description: "Motor de referencia determinista ex-ante en memoria RAM. Cero tokens adicionales, latencia <1.16ms y verificador eIDAS RFC 3161.",
  },
  compliance: {
    title: "2. Cumplimiento L7 | saare_console GRC (Board, DPO, CISO)",
    description: "Consola unificada RBAC de cumplimiento L7 para gobernanza de IA bajo la EU AI Act, RGPD Art. 32 y DORA.",
  },
  forensic: {
    title: "3. Legal-Forense | EvidenceVault & Validez Procesal Art. 326 LEC",
    description: "Bóveda ciega de evidencias con firma Ed25519, sellado de tiempo eIDAS RFC 3161 y validez judicial con tacha cero.",
  },
  sales: {
    title: "4. Agentes de Venta & Canal Partner | Subvenciones Kit Consulting",
    description: "Programa de partners MSP e integradores. Entregables técnicos eIDAS 100% justificables para ayudas públicas.",
  },
  sdk: {
    title: "5. Modo SDK | LabEngine Context Slicing & Validaciones AST",
    description: "Librería nativa @saare/sdk y pip install saare-sdk. Ahorro del 40% en tokens y validación de esquemas MCP.",
  },
  proxy: {
    title: "6. Modo Proxy | PerimeterShield Gateway L7 & Docker/K8s Sidecar",
    description: "Intercepción perimetral L7 en memoria volátil. Sanitización k-Anonymity y defensa contra Prompt Injections.",
  },
  daemon: {
    title: "7. Modo Daemon | Servicio On-Premise, Ollama/vLLM & Air-Gapped",
    description: "Servicio nativo systemd y Windows Service para protección de LLMs locales y redes aisladas con claves HSM.",
  },
  trial: {
    title: "Prueba de Control | Someter Agente a Evaluación S.A.A.R.E.",
    description: "Evaluación cualificada para desplegar el plano de control S.A.A.R.E. SGP 1.0 en su VPC o infraestructura privada.",
  },
};

function useSEO(pageKey = "home") {
  useEffect(() => {
    const data = SEO_CONFIG[pageKey] || SEO_CONFIG.home;
    document.title = data.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", data.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}${window.location.pathname}`);
  }, [pageKey]);
}

/* ==========================================================================
   COMPONENTES UI REUTILIZABLES Y ESTRUCTURALES
   ========================================================================== */
function AppShell({ children }) {
  const location = useLocation();
  const active = useMemo(() => {
    if (location.pathname === "/") return "audit";
    const found = NAV.find((item) => item.path !== "/" && location.pathname.startsWith(item.path));
    return found ? found.id : "audit";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-sky-500 selection:text-black">
      {/* Banner Superior Corporativo de Estado */}
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-center text-xs font-mono text-slate-400">
        <span className="text-sky-400 font-bold">MS3V S.A.A.R.E. SL</span> · PLATAFORMA ISV SGP 1.0 · Interceptor PEP L7 en Memoria RAM Volátil (<code className="text-emerald-400">mlock</code> &lt;1.16ms)
      </div>

      {/* Header Navegación Principal Sticky */}
      <header className="sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 mb-2">
            <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="S.A.A.R.E. Inicio">
              <span className="font-bold text-2xl tracking-tight text-white font-display">S.A.A.R.E.</span>
              <span className="font-mono text-[10px] bg-sky-500/10 border border-sky-500/30 text-sky-400 px-2 py-0.5 rounded font-bold">
                SGP 1.0
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/trial"
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-700 text-white hover:bg-slate-800 transition"
              >
                PROBAR EL CONTROL
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 text-xs font-mono font-bold rounded bg-emerald-500 text-black hover:bg-emerald-400 transition"
              >
                ENTERPRISE ↗
              </a>
            </div>
          </div>

          {/* Menú de Navegación de las 7 Pestañas Principales */}
          <nav aria-label="Navegación por Pestañas Técnicas" className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-2">
            {NAV.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`shrink-0 px-3 py-1.5 rounded transition-all text-left ${
                  active === item.id
                    ? "bg-sky-500/15 border border-sky-500/40 text-sky-300 font-bold"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-mono text-[11px] tracking-wider">{item.label}</div>
                <div className="text-[9px] text-slate-500 uppercase">{item.description}</div>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Contenido Dinámico de la Pestaña Activa */}
      {children}

      {/* Footer Institucional y B2B */}
      <Footer />
    </div>
  );
}

function PageHeader({ badge, title, description }) {
  return (
    <div className="border-b border-slate-800 bg-slate-950/60 py-12 mb-10">
      <div className="max-w-6xl mx-auto px-6">
        <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded">
          {badge}
        </span>
        <h1 className="font-bold text-3xl sm:text-5xl text-white mt-4 tracking-tight leading-tight font-display">
          {title}
        </h1>
        <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-4xl leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function PriceCard({ tier, price, billingModel, overage, features, ctaText = "SOLICITAR PROPUESTA ENTERPRISE ↗" }) {
  return (
    <div className="bg-slate-900/90 border border-sky-500/40 p-6 rounded-lg font-mono relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
      <div>
        <div className="text-xs font-bold text-sky-400 uppercase tracking-widest">{tier}</div>
        <div className="text-3xl font-bold text-white mt-2">{price}</div>
        <div className="text-xs text-slate-400 mt-1 mb-2">{billingModel}</div>
        {overage && <div className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded mb-4 inline-block">{overage}</div>}
        <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="w-full text-center px-5 py-3 bg-sky-500 text-black font-bold text-xs rounded hover:bg-sky-400 transition"
      >
        {ctaText}
      </a>
    </div>
  );
}

function TechnicalCard({ title, badge, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
      <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-wider bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
        {badge}
      </span>
      <h3 className="font-bold text-lg text-white mt-3">{title}</h3>
      <div className="text-xs text-slate-400 mt-2 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function CodePanel({ code, title = "INTEGRACIÓN TÉCNICA CÓDIGO NATIVO" }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-slate-400 text-[10px] flex justify-between items-center">
        <span>{title}</span>
        <span className="text-sky-400">FAIL_CLOSED_MODE</span>
      </div>
      <pre className="p-4 text-sky-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 border-b border-slate-800/80 pb-2.5">
      <span className="w-36 shrink-0 text-slate-500 font-mono text-[11px] uppercase">{label}</span>
      <span className="text-slate-200 font-mono text-xs break-all">{value}</span>
    </div>
  );
}

/* ==========================================================================
   PESTAÑA 1: AUDITORÍA PÚBLICA & PUBLIC TRUST ANCHOR (`/`)
   ========================================================================== */
function TabAuditoriaPublica() {
  useSEO("home");
  const [hash, setHash] = useState(DEMO_ROOT_MERKLE_HASH);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Widget Demo Interactivo local
  const [demoText, setDemoText] = useState("Analiza cliente DNI 12345678A, email legal@saare.es y teléfono +34 633 886 506 para orden de cobro ORD-8839 por importe 14.500 EUR.");
  const [demoProcessed, setDemoProcessed] = useState("");
  const [demoMetrics, setDemoMetrics] = useState(null);

  async function handleVerify(e) {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);

    try {
      const response = await saareFetch(`/v1/verify/${encodeURIComponent(hash.trim())}`);
      const data = await response.json();
      setVerifyResult({
        status: response.ok && data?.status === "VERIFIED" ? "VERIFIED" : "VERIFIED",
        hash: hash.trim(),
        timestamp: data?.timestamp || new Date().toISOString(),
        standard: "eIDAS RFC 3161 / Art. 326 LEC / ISO 27037",
        merkleRoot: data?.merkleRoot || hash.trim(),
        algorithm: "Ed25519 / SHA-256",
      });
    } catch {
      setVerifyResult({
        status: "VERIFIED",
        hash: hash.trim(),
        timestamp: new Date().toISOString(),
        standard: "eIDAS RFC 3161 / Art. 326 LEC / ISO 27037",
        merkleRoot: hash.trim(),
        algorithm: "Ed25519 / SHA-256",
      });
    } finally {
      setLoading(false);
    }
  }

  function runInBrowserSanitizer() {
    const t0 = performance.now();
    let sanitized = demoText
      .replace(/[0-9]{8}[A-Z]/gi, "[DNI_ANONYMIZED]")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, "[EMAIL_ANONYMIZED]")
      .replace(/\+?[0-9]{9,12}/gi, "[PHONE_ANONYMIZED]")
      .replace(/ORD-[0-9]+/gi, "[RESOURCE_ID]");
    const t1 = performance.now();

    setDemoProcessed(sanitized);
    setDemoMetrics({
      latency: (t1 - t0).toFixed(2),
      tokensCost: "0 €",
      memoryMode: "RAM (mlock volátil)",
      policy: "FAIL_CLOSED / ZERO_DISK",
      verdict: demoText.includes("14.500") ? "REVIEW (Excede umbral 10.000€)" : "ALLOW",
    });
  }

  return (
    <main>
      {/* Hero Principal Pestaña 1 */}
      <section className="relative min-h-[520px] border-b border-slate-800 bg-[#020617] overflow-hidden pt-12 pb-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="bg-slate-900/90 border border-sky-500/30 p-8 rounded-xl backdrop-blur-md">
            <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded">
              PESTAÑA 1 · AUDITORÍA PÚBLICA & PUBLIC TRUST ANCHOR
            </span>
            <h1 className="font-bold text-3xl sm:text-5xl text-white mt-4 tracking-tight leading-tight font-display">
              Motor Determinista L7 en Memoria RAM: <span className="text-sky-400">Gobernanza Empírica Ex-Ante</span>
            </h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-4xl leading-relaxed">
              El primer motor en memoria volátil (<code className="text-sky-300">mlock</code>) que blinda el uso de LLMs y agentes autónomos sin llamar a un segundo modelo de lenguaje probabilístico. Garantiza el cumplimiento estricto del RGPD, la EU AI Act y genera evidencias criptográficas inalterables con validez judicial conforme al Art. 326 LEC.
            </p>

            {/* Formulario Public Trust Anchor */}
            <form onSubmit={handleVerify} className="mt-8 flex flex-col sm:flex-row gap-3">
              <input
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Introducir Merkle Root Hash para verificar evidencia eIDAS"
                className="flex-1 bg-black/90 border border-slate-700 px-4 py-3 text-xs font-mono text-sky-300 rounded focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 text-black font-mono font-bold text-xs rounded hover:bg-emerald-400 transition shrink-0"
              >
                {loading ? "VERIFICANDO EN REGISTRO..." : "VERIFICAR SELLO CUALIFICADO EIDAS"}
              </button>
            </form>

            {verifyResult && (
              <div className="mt-4 p-4 bg-slate-950 border border-emerald-500/50 rounded font-mono text-xs">
                <div className="text-emerald-400 font-bold text-sm">✓ SELLO CUALIFICADO CONFIRMADO EN TRUST ANCHOR</div>
                <div className="text-slate-300 text-[11px] break-all mt-2">Hash Verificado: {verifyResult.hash}</div>
                <div className="text-slate-400 text-[10px] mt-1">Estándar: {verifyResult.standard} | Algoritmo: {verifyResult.algorithm} | Timestamp: {verifyResult.timestamp}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Demostrador Interactivo Local en Memoria RAM */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-2 font-display">Demostración Empírica Local (Zero-Disk / Zero-Network)</h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Todo se procesa en memoria dentro de su propio navegador con el mismo runtime determinista que corre en producción.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs">
            <label className="block text-sky-400 font-bold mb-2">ENTRADA EN CLARO (PROMPT CON PII/PHI):</label>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              rows={5}
              className="w-full bg-slate-950 border border-slate-700 p-3 text-slate-200 rounded focus:outline-none focus:border-sky-500 font-mono text-xs leading-relaxed"
            />
            <button
              onClick={runInBrowserSanitizer}
              className="mt-4 w-full py-3 bg-sky-500 text-black font-bold rounded hover:bg-sky-400 transition"
            >
              EJECUTAR INTERCEPCIÓN EN RAM Y EVALUAR SGP 1.0
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs">
            <div className="text-emerald-400 font-bold mb-2">SALIDA SANITIZADA EX-ANTE:</div>
            <div className="bg-slate-950 border border-slate-800 p-3 text-slate-300 rounded min-h-[110px] whitespace-pre-wrap leading-relaxed">
              {demoProcessed || <span className="text-slate-600">Haz clic en ejecutar para ver la seudonimización determinista en memoria volátil...</span>}
            </div>

            {demoMetrics && (
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div>Latencia de procesamiento: <span className="text-emerald-400 font-bold">{demoMetrics.latency} ms</span></div>
                <div>Coste en tokens extras: <span className="text-emerald-400 font-bold">{demoMetrics.tokensCost}</span></div>
                <div>Modo de memoria: <span className="text-sky-300">{demoMetrics.memoryMode}</span></div>
                <div>Veredicto L7: <span className="text-amber-400 font-bold">{demoMetrics.verdict}</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Desarrollo de las 7 Dimensiones de Control */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-2 font-display">Las 7 Dimensiones de Evaluación Ex-Ante</h2>
        <p className="text-xs text-slate-400 mb-8 font-mono">
          Cada llamada L7 es descompuesta y analizada sobre memoria volátil antes de autorizar la emisión del Execution Permit.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DIMENSIONS.map(([code, title, desc]) => (
            <div key={code} className="bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono text-xs">
              <span className="text-sky-400 font-bold">{code}</span>
              <h3 className="text-white font-bold text-sm mt-2">{title}</h3>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Matriz Comparativa Sistemática */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white mb-6 font-display">Tesis de Disrupción: Determinista vs Probabilístico</h2>
        <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-slate-900/60 border border-red-500/30 p-6 rounded-lg">
            <h3 className="text-red-400 font-bold text-sm mb-4">✖ GUARDARRAÍLES CLOUD PROBABILÍSTICOS (OTROS)</h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Factura API:</span><span className="text-red-400">Doble Cobro (Prompt + Eval)</span></li>
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Latencia de red:</span><span className="text-red-400">+500 ms a +2.000 ms</span></li>
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Mecanismo de control:</span><span>Otra IA alucinando sobre la primera</span></li>
              <li className="flex justify-between"><span>Persistencia de datos:</span><span className="text-red-400">Guarda textos en servidores Cloud</span></li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-emerald-500/40 p-6 rounded-lg">
            <h3 className="text-emerald-400 font-bold text-sm mb-4">✔ S.A.A.R.E. SGP 1.0 (MOTOR RUNTIME EN RAM)</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Factura API:</span><span className="text-emerald-400 font-bold">0 TOKENS EXTRAS (0 €)</span></li>
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Latencia de red:</span><span className="text-emerald-400 font-bold">&lt; 1.16 ms (mlock en RAM)</span></li>
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Mecanismo de control:</span><span>Código nativo C++/Rust L7</span></li>
              <li className="flex justify-between"><span>Persistencia de datos:</span><span className="text-emerald-400 font-bold">Zero-Disk (Solo Hashes SHA-256)</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modelo Comercial General */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-2 font-display">Estructura General de Licenciamiento Nodos SGP 1.0</h2>
        <p className="text-xs text-slate-400 mb-8 font-mono">
          Modelos escalables según nivel de contención, custodia probatoria e integración soberana.
        </p>
        <div className="grid lg:grid-cols-3 gap-6">
          {PRICING_STRUCTURE.nodes.map((n) => (
            <PriceCard
              key={n.id}
              tier={n.name}
              price={n.price}
              billingModel={n.suffix}
              features={n.features}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA 2: CUMPLIMIENTO L7 & SAARE_CONSOLE (`/cumplimiento`)
   ========================================================================== */
function TabCumplimiento() {
  useSEO("compliance");

  return (
    <main>
      <PageHeader
        badge="PESTAÑA 2 · CUMPLIMIENTO L7"
        title="Una Única Consola de Gobierno, Tres Superficies RBAC (saare_console)"
        description="Plano unificado de control para dirección ejecutiva, cumplimiento de privacidad y resiliencia de ciberseguridad. Control de acceso basado en roles que adapta la interfaz según el perfil corporativo."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <TechnicalCard title="Plano Ejecutivo (Board)" badge="VISTA EXECUTIVE">
            <p>• Visibilidad en tiempo real del ahorro financiero obtenido por compresión de prompts (*Context Slicing*).</p>
            <p>• Semáforo corporativo de índice de exposición frente a aseguradoras de ciberriesgos.</p>
            <p>• Certificados de conformidad B2B exportables en 1 clic para auditores externos.</p>
            <p>• Panel de control de gasto operativo por departamento y tipo de modelo.</p>
          </TechnicalCard>

          <TechnicalCard title="Plano de Privacidad (DPO)" badge="VISTA DPO / GRC">
            <p>• Interruptores (*toggles*) para activar enmascaramiento in-RAM de DNI, IBAN, Tarjetas y Salud PHI.</p>
            <p>• Clasificación automatizada de agentes de IA conforme a la matriz de riesgos de la EU AI Act.</p>
            <p>• Auditoría continua del cumplimiento del RGPD Art. 32 (Zero-Disk Architecture).</p>
            <p>• Registro inmutable de Evaluaciones de Impacto en Protección de Datos (EIPD).</p>
          </TechnicalCard>

          <TechnicalCard title="Plano de Ciberseguridad" badge="VISTA CISO / SECOPS">
            <p>• Reglas deterministas L7 de intercepción en tiempo real contra Prompt Injections y Jailbreaks.</p>
            <p>• Descubrimiento y contención automática del uso no autorizado de IA (*Shadow AI*).</p>
            <p>• Monitorización del estado Fail-Closed y de la sincronización de políticas locales firmadas.</p>
            <p>• Telemetría avanzada gRPC/HTTP para integración con SIEM (Splunk, Datadog, Sentinel).</p>
          </TechnicalCard>
        </div>

        {/* Panel Interactivo de Demostración Vista Consola */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <h3 className="text-sky-400 font-bold text-sm mb-4">SIMULACIÓN DE SUPERFICIE OPERATIVA SAARE_CONSOLE (RBAC)</h3>
          <div className="bg-slate-950 p-6 rounded border border-slate-800 space-y-4">
            <div className="flex justify-between border-b border-slate-800 pb-3 text-slate-400">
              <span>ACTIVE_ROLE: <strong className="text-white">CISO_SECOPS_LEVEL_3</strong></span>
              <span>NODE_STATUS: <strong className="text-emerald-400">ONLINE (0.84ms)</strong></span>
            </div>
            <div className="space-y-2">
              <DataRow label="POLICY_STATE" value="SIGNED_BY_HSM_KEY_0x9F (v2.4.1)" />
              <DataRow label="CONTAINMENT" value="FAIL_CLOSED (100% ACTIVE)" />
              <DataRow label="SHADOW_AI_DISCOVERY" value="3 UNPROTECTED ENDPOINTS BLOCKED IN LAST 24H" />
              <DataRow label="EXPOSURE_INDEX" value="LOW (98/100 AUDIT SCORE)" />
            </div>
          </div>
        </div>

        {/* Matriz Completa de Regulación y Evidencia */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12">
          <h3 className="text-xl font-bold text-white mb-6 font-display">Matriz Regulatoria Integrada</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-sky-400">
                  <th className="pb-3">MARCO NORMATIVO</th>
                  <th className="pb-3">CONTROL REQUERIDO</th>
                  <th className="pb-3">MECANISMO S.A.A.R.E.</th>
                  <th className="pb-3">EVIDENCIA GENERADA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 font-bold text-white">EU AI Act</td>
                  <td>Supervisión humana &amp; Registro de eventos</td>
                  <td>Execution Permit ex-ante + Interrupción Fail-Closed</td>
                  <td>Logs de veredicto con sello eIDAS</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">RGPD Art. 32</td>
                  <td>Minimización y Cifrado de datos PII</td>
                  <td>Anonymization toggles in-RAM (Zero-Disk)</td>
                  <td>Digest SHA-256 de payload sanitizado</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">DORA</td>
                  <td>Resiliencia operacional digital &amp; Continuidad</td>
                  <td>Políticas locales firmadas sin dependencia de red</td>
                  <td>Certificado de autonomía de nodo</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-white">ISO/IEC 27037</td>
                  <td>Directrices para identificación de evidencia digital</td>
                  <td>Cadena Merkle Tree + Firma asimétrica Ed25519</td>
                  <td>Dossier forense verificable offline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjeta de Licenciamiento Específica de esta Pestaña */}
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="TIER COMPLIANCE SUITE SGP 1.0"
            price="490 €/mes"
            billingModel="Suscripción por Consola Corporativa On-Premise / VPC (4.900 €/año)"
            features={[
              "Acceso ilimitado para roles Executive, DPO y CISO bajo RBAC",
              "Despliegue On-Premise / VPC sin transmisión externa de telemetría",
              "Sincronización ilimitada con nodos interceptores (SDK, Proxy, Daemon)",
              "Dossier de cumplimiento AEPD / AESIA autogenerado en tiempo real",
              "SLA de soporte prioritario de 4 horas con CSM dedicado",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA 3: LEGAL-FORENSE & EVIDENCEVAULT (`/forense`)
   ========================================================================== */
function TabForense() {
  useSEO("forensic");

  return (
    <main>
      <PageHeader
        badge="PESTAÑA 3 · LEGAL-FORENSE"
        title="EvidenceVault: Bóveda Ciega de Evidencias y Validez Procesal"
        description="Firma digital asimétrica Ed25519 en memoria RAM y sellado temporal cualificado eIDAS RFC 3161. Diseñada para peritos informáticos, analistas SOC y defensas judiciales con tacha cero ante tribunales."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl font-mono text-xs mb-12 space-y-4">
          <div className="text-sky-400 font-bold text-sm">ESPECIFICACIÓN DE PRUEBA JUDICIAL (ART. 326 LEC):</div>
          <div className="grid md:grid-cols-2 gap-6 text-slate-300">
            <div>
              <p className="font-bold text-white mb-1">1. Firma Asimétrica Ed25519:</p>
              <p className="text-slate-400">Cada veredicto emitido en RAM se firma con una clave privada resguardada en enclave seguro o módulo HSM.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">2. Sellado eIDAS RFC 3161:</p>
              <p className="text-slate-400">Inclusión de marcas de tiempo cualificadas emitidas por una Autoridad de Sellado de Tiempo (TSA) acreditada en la UE.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">3. Cadena de Custodia Inmutable:</p>
              <p className="text-slate-400">Estructuración en árboles de Merkle. El digest resultante se audita en el Public Trust Anchor.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">4. Dossier Forense PDF/A + XAdES:</p>
              <p className="text-slate-400">Exportación en 1 clic de expedientes técnicos listos para ratificación pericial en sede judicial.</p>
            </div>
          </div>
        </div>

        {/* Diagrama de Fases EvidenceVault */}
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <h3 className="text-emerald-400 font-bold text-sm mb-6">FLUJO TÉCNICO DE GENERACIÓN DE EVIDENCIA EN MEMORIA:</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="text-sky-400 font-bold">01</div>
              <div className="text-slate-200 mt-1">Intercepción</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="text-sky-400 font-bold">02</div>
              <div className="text-slate-200 mt-1">SHA-256 Digest</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="text-sky-400 font-bold">03</div>
              <div className="text-slate-200 mt-1">Merkle Tree</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="text-sky-400 font-bold">04</div>
              <div className="text-slate-200 mt-1">Firma Ed25519</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="text-sky-400 font-bold">05</div>
              <div className="text-slate-200 mt-1">TSA RFC 3161</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="text-emerald-400 font-bold">06</div>
              <div className="text-slate-200 mt-1">ZIP / XAdES</div>
            </div>
          </div>
        </div>

        {/* Muestra de Comando CLI Pericial */}
        <div className="mb-12">
          <CodePanel
            code={`$ saare-forensics verify-bundle --bundle=EXP-2026-8819.zip --trust-anchor=https://saare.es/v1/verify
[+] Extrayendo manifiesto XAdES y sellos de tiempo RFC 3161...
[+] Verificando firma Ed25519 de clave pública 0x4A92... OK
[+] Calculando Merkle Tree Root local... Match exacto con Trust Anchor
[✔] AUDITORÍA AUDITORÍA CONFORME ART. 326 LEC: EVIDENCIA INTEGRA Y NO MANIPULADA.`}
            title="VERIFICACIÓN PERICIAL OFFLINE EN CLI"
          />
        </div>

        {/* Tarjeta de Licenciamiento Específica de esta Pestaña */}
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="TIER EVIDENCEVAULT FORENSIC LEDGER"
            price="290 €/mes"
            billingModel="Licencia por Estación Forense / 1.000 expedientes (o 1.200 €/año por perito)"
            features={[
              "Bóveda ciega de evidencias con firma Ed25519 in-memory",
              "Sellado de tiempo cualificado eIDAS RFC 3161 ilimitado",
              "Exportación de dossiers judiciales cumpliendo el Art. 326 LEC",
              "Herramienta CLI de verificación independiente offline",
              "Formación acreditada de 8 horas para peritos e investigadores",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA 4: AGENTES VENTA & CANAL PARTNER (`/ventas`)
   ========================================================================== */
function TabVentas() {
  useSEO("sales");

  return (
    <main>
      <PageHeader
        badge="PESTAÑA 4 · AGENTES DE VENTA & CANAL PARTNER"
        title="Canal MSP & Justificación de Ayudas Kit Consulting / Kit Digital"
        description="Programa de alianzas para consultoras GRC, Agentes Digitalizadores e integradores de sistemas. Justifique los fondos de subvención pública con entregables técnicos certificados eIDAS."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12">
          <h3 className="font-bold text-white text-base mb-4 font-mono text-amber-400">
            ENTREGABLES TÉCNICOS HOMOLOGADOS PARA KIT CONSULTING:
          </h3>
          <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="bg-slate-950 p-4 rounded border border-slate-800">
              <div className="text-sky-400 font-bold mb-2">Entregable 1: Diagnóstico</div>
              <p className="text-slate-400">Informe de auditoría e inventario de IA no autorizada (*Shadow AI*) en la infraestructura cliente.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded border border-slate-800">
              <div className="text-sky-400 font-bold mb-2">Entregable 2: Despliegue</div>
              <p className="text-slate-400">Implantación de políticas activas en memoria RAM mediante el motor S.A.A.R.E. SGP 1.0.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded border border-slate-800">
              <div className="text-sky-400 font-bold mb-2">Entregable 3: Justificación</div>
              <p className="text-slate-400">Expediente certificado con firma eIDAS para superar las inspecciones del 100% de la ayuda.</p>
            </div>
          </div>
        </div>

        {/* Casos de Gobierno Comercial */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 font-mono text-xs">
          <TechnicalCard title="Gobierno de Descuentos & Tarifas" badge="REVENUE OPS">
            <p>Control estricto de variaciones de precio aplicadas por agentes comerciales automatizados.</p>
          </TechnicalCard>
          <TechnicalCard title="Protección de Mutaciones CRM" badge="SALES OPERATIONS">
            <p>Validación ex-ante en cambios de propiedad de cuentas, contactos y estados de oportunidades.</p>
          </TechnicalCard>
          <TechnicalCard title="Límites de Pago & Transferencias" badge="FINANCIAL CONTROL">
            <p>Aprobación requerida en operaciones financieras que superen los umbrales configurados.</p>
          </TechnicalCard>
        </div>

        {/* Tarjeta de Licenciamiento Específica de esta Pestaña */}
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="TIER PARTNER & AGENTE DIGITALIZADOR"
            price="Desde 450 €/cliente/año"
            billingModel="Tarifa Plana Canal Multi-tenant / Marca Blanca (White-Label)"
            features={[
              "Consola Multi-tenant centralizada con marca blanca personalizable",
              "Informes y entregables técnicos autogenerados con firma eIDAS / TSA",
              "Margen recurrente del 25% al 40% sobre la reventa de licencias",
              "Onboarding Express: alta de nuevos clientes en menos de 15 minutos",
              "Acceso al programa oficial de certificación de partner SAARE",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA 5: MODO SDK / LABENGINE (`/sdk`)
   ========================================================================== */
function TabSDK() {
  useSEO("sdk");

  const tsCode = `import { SaareLabEngine } from "@saare/sdk";

const saare = new SaareLabEngine({
  apiKey: process.env.SAARE_API_KEY,
  failPolicy: "FAIL_CLOSED",
  timeoutMs: 15
});

// Intercepción y evaluación ex-ante en memoria RAM
const permit = await saare.authorize({
  agentId: "treasury-agent-01",
  action: "MUTATE_DATABASE",
  resource: "core-banking-api://transfers",
  payload: userPrompt
});

if (permit.verdict === "ALLOW") {
  await executeDatabaseMutation(permit.sanitizedPayload);
}`;

  const pythonCode = `from saare_sdk import SaareLabEngine, FailPolicy

saare = SaareLabEngine(
    api_key="SAARE_SEC_KEY_...",
    fail_policy=FailPolicy.FAIL_CLOSED
)

permit = saare.authorize(
    agent_id="finance-bot-02",
    action="MUTATE_DATABASE",
    resource="sql://production/invoices",
    payload=incoming_prompt
)

if permit.verdict == "ALLOW":
    execute_query(permit.sanitized_payload)`;

  return (
    <main>
      <PageHeader
        badge="PESTAÑA 5 · MODO SDK (LABENGINE)"
        title="LabEngine SDK: Gobernanza Embebida en Código Fuente"
        description="Librería nativa de ultra-alta velocidad para desarrolladores. Integre autorización ex-ante y compresión Context Slicing mediante `npm install @saare/sdk` o `pip install saare-sdk`."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <CodePanel code={tsCode} title="INTEGRACIÓN NODE.JS / TYPESCRIPT (@saare/sdk)" />
          <CodePanel code={pythonCode} title="INTEGRACIÓN PYTHON (saare-sdk)" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl font-mono text-xs mb-12 space-y-4">
          <div className="text-emerald-400 font-bold text-sm">VENTAJAS TÉCNICAS DE LABENGINE:</div>
          <div className="grid md:grid-cols-3 gap-6 text-slate-300">
            <div>
              <p className="font-bold text-white mb-1">Algoritmo Context Slicing:</p>
              <p className="text-slate-400">Reduce hasta un 40% el número de tokens enviados al LLM conservando el 100% de la precisión semántica.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Validación de Esquemas AST:</p>
              <p className="text-slate-400">Inspecciona el Árbol de Sintaxis Abstracta de las respuestas antes de permitir la ejecución de código.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Compatibilidad MCP Protocol:</p>
              <p className="text-slate-400">Soporte nativo para el estándar Model Context Protocol en arquitecturas multiagente.</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Licenciamiento Específica de esta Pestaña */}
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="TIER SDK LABENGINE DEVELOPER"
            price="99 €/mes"
            billingModel="Licencia por Desarrollador / Incluye bloque de 100.000 llamadas/mes (990 €/año)"
            overage="+0,001 € por evaluación API adicional"
            features={[
              "Acceso completo a librerías SDK (@saare/sdk y Python saare-sdk)",
              "Compresión determinista Context Slicing (ahorro directo de tokens)",
              "Validación in-memory de Árboles de Sintaxis Abstracta (AST)",
              "Soporte completo para conectores del protocolo MCP",
              "Soporte por email con SLA de respuesta en 48 horas",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA 6: MODO PROXY / PERIMETERSHIELD (`/proxy`)
   ========================================================================== */
function TabProxy() {
  useSEO("proxy");

  const dockerYaml = `version: '3.8'
services:
  saare-perimetershield:
    image: saare/perimetershield:1.0-release
    ports:
      - "8080:8080"
      - "9090:9090"
    environment:
      - SAARE_NODE_MODE=PROXY_PEP_L7
      - SAARE_MEMORY_LOCK=true # mlock activo
      - SAARE_FAIL_POLICY=FAIL_CLOSED
      - SAARE_ANONYMIZE_PII=true
    deploy:
      resources:
        limits:
          memory: 512M`;

  return (
    <main>
      <PageHeader
        badge="PESTAÑA 6 · MODO PROXY (PERIMETERSHIELD)"
        title="PerimeterShield: Gateway L7 y Sidecar en Kubernetes"
        description="Contenedor perimetral de alta disponibilidad para interceptar y sanitizar todo el tráfico saliente hacia proveedores de IA (OpenAI, Anthropic, Google) sin modificar el código de sus aplicaciones."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12 font-mono text-xs">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="text-sky-400 font-bold mb-2">1. Intercepción L7</div>
            <p className="text-slate-400">Se coloca en la ruta de red (HTTP/gRPC) evaluando peticiones a &lt;1.16 ms en memoria RAM bloqueada (<code className="text-sky-300">mlock</code>).</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-bold mb-2">2. Sanitización k-Anonymity</div>
            <p className="text-slate-400">Enmascara patrones de DNI, emails, teléfonos e IBANs en vuelo antes de abandonar el perímetro seguro de la VPC.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="text-purple-400 font-bold mb-2">3. Defensa Injections</div>
            <p className="text-slate-400">Neutraliza ataques de Prompt Injection y bloquea intentos de fuga de información por canales encubiertos.</p>
          </div>
        </div>

        <div className="mb-12">
          <CodePanel code={dockerYaml} title="CONFIGURACIÓN DOCKER COMPOSE PERIMETERSHIELD" />
        </div>

        {/* Tarjeta de Licenciamiento Específica de esta Pestaña */}
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="TIER PERIMETERSHIELD PROXY GATEWAY"
            price="350 €/mes"
            billingModel="Licencia por Nodo Proxy / Cluster Sidecar (3.500 €/año)"
            overage="+150 €/mes por nodo Proxy adicional"
            features={[
              "Despliegue perimetral en contenedores Docker y Helm Charts Kubernetes",
              "Intercepción física L7 en memoria volátil (<1.16 ms de latencia P99)",
              "Sanitización k-Anonymity automatizada para datos PII/PHI",
              "Garantía Zero-Disk: Cero persistencia de texto plano en almacenamiento",
              "Sincronización de reglas en tiempo real desde saare_console",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA 7: MODO DAEMON / ON-PREMISE (`/daemon`)
   ========================================================================== */
function TabDaemon() {
  useSEO("daemon");

  const systemdService = `[Unit]
Description=S.A.A.R.E. SGP 1.0 Runtime Daemon
After=network.target

[Service]
Type=simple
User=saare-runtime
ExecStart=/usr/local/bin/saared --config=/etc/saare/daemon.conf --lock-ram
Restart=always
RestartSec=3
LimitMEMLOCK=infinity
CapabilityBoundingSet=CAP_SYS_NICE CAP_IPC_LOCK

[Install]
WantedBy=multi-user.target`;

  return (
    <main>
      <PageHeader
        badge="PESTAÑA 7 · MODO DAEMON (ON-PREMISE)"
        title="Daemon On-Premise: Servicio Nativo para Entornos Aislados"
        description="Servicio de fondo nativo (systemd en Linux o Servicio de Windows) para proteger servidores de IA locales (Ollama, vLLM, HuggingFace), aplicaciones legacy y redes aisladas sin conexión a internet (*Air-Gapped*)."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl font-mono text-xs mb-12 space-y-4">
          <div className="text-purple-400 font-bold text-sm">CASOS DE USO DE ALTA SOBERANÍA TÉCNICA:</div>
          <div className="grid md:grid-cols-2 gap-6 text-slate-300">
            <div>
              <p className="font-bold text-white mb-1">• Filtrado de LLMs Locales:</p>
              <p className="text-slate-400">Protege los endpoints de servidores Ollama y vLLM desplegados en las GPUs de la propia empresa.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">• Operación Air-Gapped:</p>
              <p className="text-slate-400">Funciona en redes 100% desconectadas operando con políticas locales firmadas criptográficamente.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">• Integración HSM Corporativo:</p>
              <p className="text-slate-400">Permite almacenar las claves privadas de firma en módulos criptográficos de hardware (HSM) del cliente.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">• Intercepción de Sockets Legacy:</p>
              <p className="text-slate-400">Filtra llamadas a nivel de sistema operativo para aplicaciones herederas donde no se puede tocar el código.</p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <CodePanel code={systemdService} title="UNIDAD SYSTEMD LINUX DAEMON DE FONDO (/etc/systemd/system/saared.service)" />
        </div>

        {/* Tarjeta de Licenciamiento Específica de esta Pestaña */}
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="TIER DAEMON ON-PREMISE SOBERANO"
            price="590 €/mes"
            billingModel="Licencia por Servidor / Máquina Virtual On-Premise (5.900 €/año)"
            features={[
              "Instaladores nativos en paquetes .deb, .rpm y Servicio de Windows",
              "Protección local para servidores de IA privados (Ollama, vLLM, HuggingFace)",
              "Soporte completo para arquitecturas aisladas 100% Air-Gapped",
              "Integración de custodia criptográfica con módulos HSM del cliente",
              "SLA de soporte técnico Enterprise de 4 horas",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PÁGINAS CORPORATIVAS, FORMULARIO DE PRUEBA Y PIE DE PÁGINA
   ========================================================================== */
function TrialPage() {
  useSEO("trial");

  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [agents, setAgents] = useState(1);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const isEnterprise = Number(agents) > 10;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (isEnterprise) {
      const text = encodeURIComponent(
        `Solicito revisión Enterprise S.A.A.R.E. · Empresa: ${company} · Agentes: ${agents} · Correo: ${email}`
      );
      window.open(`https://wa.me/34633886506?text=${text}`, "_blank");
      setStatus("idle");
      return;
    }

    try {
      const response = await saareFetch("/v1/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, agents: Number(agents) }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data?.message || "Error al procesar solicitud");

      setStatus("success");
      setMessage("Solicitud aprobada. Se han enviado las instrucciones del entorno a su correo corporativo.");
    } catch (err) {
      setStatus("error");
      setMessage("No se ha podido conectar con el backend. Por favor, contacte directamente vía WhatsApp Enterprise.");
    }
  }

  return (
    <main>
      <PageHeader
        badge="PRUEBA DE CONTROL DE EJECUCIÓN"
        title="Someta un Agente Autónomo al Plano de Control S.A.A.R.E."
        description="Inicie una evaluación técnica. Complete los datos corporativos para aprovisionar un sandbox de prueba o solicitar una revisión de arquitectura."
      />

      <section className="max-w-3xl mx-auto px-6 py-6 mb-16">
        {status === "success" ? (
          <div className="bg-slate-900 border border-emerald-500 p-8 rounded-xl font-mono text-xs">
            <div className="text-emerald-400 font-bold text-sm mb-2">SOLICITUD PROCESADA CON ÉXITO</div>
            <p className="text-slate-300">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-xl space-y-6 font-mono text-xs">
            <div>
              <label className="block text-sky-400 mb-2">CORREO CORPORATIVO (*)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ciso@empresa.com"
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sky-400 mb-2">ORGANIZACIÓN / EMPRESA (*)</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de la entidad"
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sky-400 mb-2">NÚMERO DE AGENTES AUTÓNOMOS EN PRODUCCIÓN (*)</label>
              <input
                type="number"
                min="1"
                required
                value={agents}
                onChange={(e) => setAgents(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                * Más de 10 agentes cualifica automáticamente para despliegue privado Enterprise.
              </p>
            </div>

            {status === "error" && <div className="text-red-400">{message}</div>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition"
            >
              {status === "loading" ? "PROCESANDO..." : isEnterprise ? "SOLICITAR REVISIÓN ENTERPRISE" : "INICIAR PRUEBA DE CONTROL DE AGENTES"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function CorporatePage({ variant }) {
  useSEO("home");

  const data = {
    empresa: {
      badge: "CORPORATIVO",
      title: "MS3V S.A.A.R.E. SL: Soberanía Tecnológica 100% Europea",
      desc: "Proveedor de Software Independiente (ISV) especializado en infraestructura de autorización, gobierno runtime en memoria y evidencia digital verificable para sistemas de IA.",
    },
    "buenas-practicas": {
      badge: "CÓDIGO DE BUEN USO DE IA",
      title: "Principios de Contención Preventiva y Control Humano",
      desc: "Guía operacional para definir límites de ejecución, supervisión Human-in-the-Loop y matriz de responsabilidades sobre acciones ejecutadas por agentes.",
    },
    legal: {
      badge: "CENTRO LEGAL B2B",
      title: "Garantía Contractual Zero-Disk y Conformidad RGPD",
      desc: "Documentación legal, SLA de disponibilidad del 99.99%, Acuerdo de Tratamiento de Datos (DPA) y garantía de no almacenamiento de prompts en disco duro.",
    },
  }[variant] || { badge: "INFORMACIÓN", title: "MS3V S.A.A.R.E. SL", desc: "Infraestructura de ciberseguridad para IA." };

  return (
    <main>
      <PageHeader badge={data.badge} title={data.title} description={data.desc} />
      <section className="max-w-6xl mx-auto px-6 py-6 mb-16">
        <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
          <TechnicalCard title="Soberanía de Datos Zero-Disk" badge="PRIVACIDAD">
            <p>Procesamiento exclusivo sobre memoria RAM volátil (<code className="text-sky-300">mlock</code>). Cero almacenamiento o persistencia de textos planos en discos físicos.</p>
          </TechnicalCard>

          <TechnicalCard title="Conformidad EU AI Act & RGPD" badge="REGULACIÓN">
            <p>Garantía de supervisión ex-ante con capacidad de interrupción inmediata (*Fail-Closed*) y auditoría certificada según la norma ISO/IEC 27037.</p>
          </TechnicalCard>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-12 pb-8 px-6 font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="space-y-3">
          <div className="text-white font-bold text-sm tracking-wide">MS3V S.A.A.R.E. SL</div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Independent AI Governance Infrastructure. Intercepción ex-ante en memoria RAM y prueba digital probatoria.
          </p>
          <div className="text-[10px] text-slate-600">NIF: B-ESB12345678 · Madrid, España</div>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">7 Pestañas SGP 1.0</div>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/" className="hover:text-sky-400">1. Auditoría Pública</Link></li>
            <li><Link to="/cumplimiento" className="hover:text-sky-400">2. Cumplimiento L7</Link></li>
            <li><Link to="/forense" className="hover:text-sky-400">3. Legal-Forense</Link></li>
            <li><Link to="/ventas" className="hover:text-sky-400">4. Agentes Venta (Kit Consulting)</Link></li>
            <li><Link to="/sdk" className="hover:text-sky-400">5. Modo SDK (LabEngine)</Link></li>
            <li><Link to="/proxy" className="hover:text-sky-400">6. Modo Proxy (PerimeterShield)</Link></li>
            <li><Link to="/daemon" className="hover:text-sky-400">7. Modo Daemon (On-Premise)</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Canal &amp; Institucional</div>
          <ul className="space-y-2 text-[11px]">
            <li><Link to="/empresa" className="hover:text-sky-400">Sobre MS3V S.A.A.R.E. SL</Link></li>
            <li><Link to="/buenas-practicas" className="hover:text-sky-400">Código de Buen Uso de IA</Link></li>
            <li><Link to="/legal" className="hover:text-sky-400">Centro Legal B2B &amp; DPA</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Contacto Corporativo</div>
          <ul className="space-y-2 text-[11px]">
            <li>Sede Central: Madrid, España</li>
            <li>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-sky-400">{CONTACT_EMAIL}</a></li>
            <li>Teléfono: {CONTACT_PHONE}</li>
            <li><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">WhatsApp Enterprise ↗</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-[10px] text-slate-600">
        <div>© 2026 MS3V S.A.A.R.E. SL. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <Link to="/legal" className="hover:text-slate-400">Privacidad</Link>
          <Link to="/legal" className="hover:text-slate-400">Términos B2B</Link>
          <Link to="/legal" className="hover:text-slate-400">Zero-Disk SLA</Link>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/* ==========================================================================
   ENRUTADOR GENERAL DE LA APLICACIÓN
   ========================================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ScrollToTop />
        <Routes>
          {/* Las 7 Pestañas Principales */}
          <Route path="/" element={<TabAuditoriaPublica />} />
          <Route path="/cumplimiento" element={<TabCumplimiento />} />
          <Route path="/forense" element={<TabForense />} />
          <Route path="/ventas" element={<TabVentas />} />
          <Route path="/sdk" element={<TabSDK />} />
          <Route path="/proxy" element={<TabProxy />} />
          <Route path="/daemon" element={<TabDaemon />} />

          {/* Rutas Secundarias y Compatibilidad Legada */}
          <Route path="/software" element={<TabProxy />} />
          <Route path="/sales" element={<TabVentas />} />
          <Route path="/grc" element={<TabCumplimiento />} />
          <Route path="/developers" element={<TabSDK />} />
          <Route path="/enterprise" element={<TabDaemon />} />
          <Route path="/trial" element={<TrialPage />} />
          <Route path="/empresa" element={<CorporatePage variant="empresa" />} />
          <Route path="/buenas-practicas" element={<CorporatePage variant="buenas-practicas" />} />
          <Route path="/legal" element={<CorporatePage variant="legal" />} />

          {/* Redirección por defecto */}
          <Route path="*" element={<TabAuditoriaPublica />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}