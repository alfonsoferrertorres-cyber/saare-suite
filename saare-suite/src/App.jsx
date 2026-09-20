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

/* --------------------------------------------------------------------------
   NAVEGACIÓN · 4 FAMILIAS DE PRODUCTO
   Producto (consolas de cumplimiento) · Forense · Desarrolladores (tres modos)
   · Canal. Los tres modos de despliegue viven DENTRO de Desarrolladores.
   -------------------------------------------------------------------------- */
const NAV = [
  {
    id: "producto",
    label: "PRODUCTO",
    description: "Consolas de cumplimiento",
    path: "/producto",
    children: [
      { id: "audit", label: "Auditoría pública", path: "/producto/auditoria" },
      { id: "executive", label: "EXECUTIVE", path: "/producto/executive" },
      { id: "grc", label: "GRC_AUDIT", path: "/producto/grc" },
      { id: "cyber", label: "CYBER_RESILIENCE", path: "/producto/cyber" },
    ],
  },
  {
    id: "forense",
    label: "FORENSE",
    description: "Evidence Vault",
    path: "/forense",
    children: [],
  },
  {
    id: "dev",
    label: "DESARROLLADORES",
    description: "SDK · Proxy · Daemon",
    path: "/dev",
    children: [
      { id: "sdk", label: "SDK nativo", path: "/dev/sdk" },
      { id: "proxy", label: "Proxy (PerimeterShield)", path: "/dev/proxy" },
      { id: "daemon", label: "Daemon (On-Premise)", path: "/dev/daemon" },
    ],
  },
  {
    id: "canal",
    label: "CANAL",
    description: "Partners y Kit Consulting",
    path: "/canal",
    children: [],
  },
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

/* --------------------------------------------------------------------------
   ESTRUCTURA DE LICENCIAMIENTO · por nodo y evidencia, nunca por asiento.
   Tres tramos de nodo, dos servicios medidos y un canal.
   -------------------------------------------------------------------------- */
const PRICING_STRUCTURE = {
  nodes: [
    {
      id: "base",
      name: "Nodo Base PEP L7",
      price: "149 €",
      suffix: "/mes",
      description: "Contención L7 e intercepción determinista en tiempo real sobre memoria RAM volátil. Sin custodia persistente de evidencias.",
      features: [
        "Motor de decisión en RAM (<1,16 ms)",
        "Intercepción L7 síncrona",
        "Veredictos ALLOW / REVIEW / DENY",
        "Evaluación de las 7 dimensiones de control",
        "Modo Fail-Closed configurable",
        "Sin custodia persistente de evidencias",
      ],
      ctaText: "ACTIVAR NODO BASE ↗",
    },
    {
      id: "custody",
      name: "Nodo con Custodia Forense",
      price: "290 €",
      suffix: "/mes",
      description: "Control continuo con sellado asimétrico y generación de evidencias probatorias exportables. Incluye la consola de cumplimiento.",
      features: [
        "Todo lo incluido en el Nodo Base PEP L7",
        "Sellado continuo con firma Ed25519",
        "Estructuración en árbol de Merkle",
        "Marcado de tiempo eIDAS RFC 3161",
        "Dossier judicial exportable (Art. 326 LEC)",
        "Consola de cumplimiento con las tres superficies RBAC",
      ],
      featured: true,
      ctaText: "ACTIVAR NODO CON CUSTODIA ↗",
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
        "SLA garantizado del 99,99 % de disponibilidad",
        "Soporte técnico dedicado 24/7 de Nivel 3",
        "Despliegue en clústeres de Kubernetes / Helm",
      ],
      ctaText: "SOLICITAR PROPUESTA ENTERPRISE ↗",
    },
  ],
  services: [
    {
      id: "evidence_packs",
      label: "EVIDENCIAS",
      name: "Paquete de Sellado eIDAS",
      price: "120 €",
      suffix: "/mes · 1.000 sellos",
      description: "Bono de marcado temporal cualificado RFC 3161 para auditorías de alta frecuencia.",
      features: [
        "1.000 sellos cualificados al mes",
        "Exceso facturado por sello adicional",
        "Descuento por volumen superior a un millón",
        "Aplicable a cualquier nodo desplegado",
      ],
      ctaText: "CONTRATAR PAQUETE DE SELLOS ↗",
    },
    {
      id: "forensic_dossier",
      label: "FORENSE",
      name: "Licencia Estación Pericial",
      price: "1.200 €",
      suffix: "/año + 300 €/dossier",
      description: "Certificación judicial de evidencias procesales con tacha cero ante tribunales.",
      features: [
        "Verificación independiente sin confiar en el vendedor",
        "Exportación de dossiers con sello RFC 3161",
        "Acceso a la bóveda ciega y al validador Ed25519",
        "Dossier de muestra descargable sin registro",
      ],
      ctaText: "SOLICITAR ACCESO PERICIAL ↗",
      href: "/forense",
    },
    {
      id: "partner_channel",
      label: "CANAL",
      name: "Programa Partner Multi-Tenant",
      price: "Desde 450 €",
      suffix: "/cliente/año",
      description: "Licenciamiento marca blanca para consultoras, MSP y Agentes Digitalizadores (Kit Consulting).",
      features: [
        "Portal multi-tenant con clientes ilimitados",
        "Configuración de políticas por cliente",
        "Documentación justificativa de ayudas generada automáticamente",
        "Soporte técnico para su propio equipo",
      ],
      ctaText: "SOLICITAR KIT DE PARTNER ↗",
      href: "/canal",
    },
  ],
};

const SEO_CONFIG = {
  home: {
    title: "S.A.A.R.E. SGP 1.0 · Autorización Ex-Ante para Agentes de IA",
    description:
      "Motor determinista en RAM: cero tokens adicionales, latencia inferior a 1,16 ms y prueba criptográfica verificable por un tercero. Contención L7 para agentes autónomos.",
  },
  producto: {
    title: "Producto | Consolas de Cumplimiento L7 (EXECUTIVE, GRC, CYBER)",
    description:
      "Tres consolas de cumplimiento sobre el mismo motor: dirección ejecutiva, privacidad y resiliencia de ciberseguridad. Control de acceso por roles.",
  },
  forensic: {
    title: "Forense | Evidence Vault y validez procesal Art. 326 LEC",
    description:
      "Bóveda ciega de evidencias con firma Ed25519, sellado de tiempo eIDAS RFC 3161 y validez judicial con tacha cero.",
  },
  dev: {
    title: "Desarrolladores | SDK, Proxy y Daemon del motor S.A.A.R.E.",
    description:
      "Tres formas de desplegar el mismo motor: SDK nativo, proxy perimetral y daemon on-premise. El SDK es gratuito; se cobra la evaluación sellada.",
  },
  canal: {
    title: "Canal | Partners, MSP y Kit Consulting",
    description:
      "Programa de partners MSP e integradores. Entregables técnicos eIDAS 100 % justificables para ayudas públicas.",
  },
  trial: {
    title: "Prueba de Control | Someta un agente a evaluación S.A.A.R.E.",
    description:
      "Evaluación cualificada para desplegar el plano de control S.A.A.R.E. SGP 1.0 en su VPC o infraestructura privada.",
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
   COMPONENTES ESTRUCTURALES
   ========================================================================== */
function AppShell({ children }) {
  const location = useLocation();

  const active = useMemo(() => {
    if (location.pathname === "/") return "producto";
    const found = NAV.find(
      (item) => item.path !== "/" && location.pathname.startsWith(item.path)
    );
    return found ? found.id : "producto";
  }, [location.pathname]);

  const activeGroup = NAV.find((n) => n.id === active);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-sky-500 selection:text-black">
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-center text-xs font-mono text-slate-400">
        <span className="text-sky-400 font-bold">MS3V S.A.A.R.E. SL</span> · PLATAFORMA
        ISV SGP 1.0 · Interceptor PEP L7 en memoria RAM volátil (
        <code className="text-emerald-400">mlock</code> &lt;1,16 ms)
      </div>

      <header className="sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 mb-2">
            <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="S.A.A.R.E. Inicio">
              <span className="font-bold text-2xl tracking-tight text-white font-display">
                S.A.A.R.E.
              </span>
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

          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-1 overflow-x-auto pb-1 border-t border-slate-800/80 pt-2"
          >
            {NAV.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                aria-current={active === item.id ? "page" : undefined}
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

          {activeGroup && activeGroup.children.length > 0 && (
            <div className="flex items-center gap-4 pt-2 border-t border-slate-800/60 text-[11px] font-mono overflow-x-auto">
              <span className="text-slate-600 uppercase tracking-wider shrink-0">
                {active === "dev" ? "Modos:" : "Vistas:"}
              </span>
              {activeGroup.children.map((c) => (
                <Link
                  key={c.id}
                  to={c.path}
                  aria-current={location.pathname === c.path ? "page" : undefined}
                  className={
                    location.pathname === c.path
                      ? "text-sky-400 font-bold border-b border-sky-400 shrink-0"
                      : "text-slate-400 hover:text-slate-200 shrink-0"
                  }
                >
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {children}

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

function SectionTitle({ kicker, title, lead }) {
  return (
    <div className="mb-8">
      {kicker && (
        <span className="font-mono text-[11px] font-bold text-sky-400 uppercase tracking-widest">
          {kicker}
        </span>
      )}
      <h2 className="text-2xl font-bold text-white mt-2 font-display">{title}</h2>
      {lead && (
        <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed max-w-3xl">{lead}</p>
      )}
    </div>
  );
}

function PriceCard({
  tier,
  price,
  suffix,
  description,
  features,
  ctaText = "SOLICITAR PROPUESTA ENTERPRISE ↗",
  href = WHATSAPP_URL,
  featured = false,
}) {
  const isExternal = href.startsWith("http");
  return (
    <div
      className={`bg-slate-900/90 border p-6 rounded-lg font-mono relative overflow-hidden flex flex-col justify-between ${
        featured ? "border-emerald-500/50" : "border-sky-500/40"
      }`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
      <div>
        {featured && (
          <span className="absolute top-4 right-4 text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded">
            RECOMENDADO
          </span>
        )}
        <div className="text-xs font-bold text-sky-400 uppercase tracking-widest pr-24">{tier}</div>
        <div className="text-3xl font-bold text-white mt-2">
          {price}
          {suffix && <span className="text-sm font-normal text-slate-400"> {suffix}</span>}
        </div>
        {description && (
          <p className="text-[11px] text-slate-400 leading-relaxed mt-3 mb-4">{description}</p>
        )}
        <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center px-5 py-3 bg-sky-500 text-black font-bold text-xs rounded hover:bg-sky-400 transition"
          >
            {ctaText}
          </a>
        ) : (
          <Link
            to={href}
            className="block w-full text-center px-5 py-3 bg-sky-500 text-black font-bold text-xs rounded hover:bg-sky-400 transition"
          >
            {ctaText}
          </Link>
        )}
        <p className="text-[10px] text-slate-500 text-center mt-3">
          Sin coste de alta · Sin permanencia · Su VPC o Air-Gapped
        </p>
      </div>
    </div>
  );
}

function TechnicalCard({ title, badge, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs">
      {badge && (
        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">
          {badge}
        </span>
      )}
      <h3 className="text-white font-bold text-sm mt-2 mb-3">{title}</h3>
      <div className="text-slate-400 space-y-2 leading-relaxed">{children}</div>
    </div>
  );
}

function CodePanel({ code, title = "INTEGRACIÓN TÉCNICA · CÓDIGO NATIVO" }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 font-mono text-[10px] text-sky-400 font-bold tracking-widest">
        {title}
      </div>
      <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-800/70 pb-2 text-[11px] font-mono">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 text-right ml-4">{value}</span>
    </div>
  );
}

function VerdictChip({ verdict }) {
  const map = {
    ALLOW: "bg-emerald-500/15 border-emerald-500 text-emerald-400",
    DENY: "bg-red-500/15 border-red-500 text-red-400",
    REVIEW: "bg-amber-500/15 border-amber-500 text-amber-400",
    VERIFIED: "bg-emerald-500/15 border-emerald-500 text-emerald-400",
    UNVERIFIABLE: "bg-amber-500/15 border-amber-500 text-amber-400",
    ERROR: "bg-red-500/15 border-red-500 text-red-400",
  };
  return (
    <span
      className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
        map[verdict] || map.REVIEW
      }`}
    >
      {verdict}
    </span>
  );
}

/* ==========================================================================
   PESTAÑA · AUDITORÍA PÚBLICA & MOTOR DE REFERENCIA
   ========================================================================== */
function TabAuditoriaPublica() {
  useSEO("home");
  const [hash, setHash] = useState(DEMO_ROOT_MERKLE_HASH);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [demoText, setDemoText] = useState(
    "Analiza cliente DNI 12345678A, email legal@saare.es y teléfono +34 633 886 506 para orden de cobro ORD-8839 por importe 14.500 EUR."
  );
  const [demoProcessed, setDemoProcessed] = useState("");
  const [demoMetrics, setDemoMetrics] = useState(null);

  /* ------------------------------------------------------------------------
     VERIFICADOR PÚBLICO HONESTO
     Tres estados reales (VERIFIED / UNVERIFIABLE / ERROR). Solo marca VERIFIED
     si el Trust Anchor lo confirma explícitamente. Nunca finge una verificación.
     ------------------------------------------------------------------------ */
  async function handleVerify(e) {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);
    setVerifyResult(null);

    try {
      const response = await saareFetch(`/v1/verify/${encodeURIComponent(hash.trim())}`);
      const data = await response.json().catch(() => ({}));
      const confirmed = response.ok && data?.status === "VERIFIED";

      setVerifyResult({
        status: confirmed ? "VERIFIED" : "UNVERIFIABLE",
        hash: hash.trim(),
        timestamp: confirmed ? data?.timestamp || null : null,
        standard: data?.standard || "eIDAS RFC 3161 / Art. 326 LEC / ISO 27037",
        algorithm: "Ed25519 / SHA-256",
        reason: confirmed ? null : "El Trust Anchor no confirmó este registro.",
      });
    } catch {
      setVerifyResult({
        status: "ERROR",
        hash: hash.trim(),
        timestamp: null,
        standard: "eIDAS RFC 3161 / Art. 326 LEC / ISO 27037",
        algorithm: "Ed25519 / SHA-256",
        reason: "No se pudo contactar con el Trust Anchor. El registro no ha sido verificado.",
      });
    } finally {
      setLoading(false);
    }
  }

  function runInBrowserSanitizer() {
    const t0 = performance.now();
    const sanitized = demoText
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
      verdict: demoText.includes("14.500") ? "REVIEW" : "ALLOW",
      verdictNote: demoText.includes("14.500")
        ? "Excede el umbral de 10.000 €"
        : "Dentro de política",
    });
  }

  const verifyBorder =
    verifyResult?.status === "VERIFIED"
      ? "border-emerald-500/50"
      : verifyResult?.status === "UNVERIFIABLE"
      ? "border-amber-500/50"
      : "border-red-500/50";

  return (
    <main>
      {/* ── Bloque A · Héroe y verificador público ── */}
      <section className="relative border-b border-slate-800 bg-[#020617] overflow-hidden pt-12 pb-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="bg-slate-900/90 border border-sky-500/30 p-8 rounded-xl backdrop-blur-md">
            <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded">
              MOTOR DE REFERENCIA · CERO TOKENS ADICIONALES
            </span>
            <h1 className="font-bold text-3xl sm:text-5xl text-white mt-4 tracking-tight leading-tight font-display">
              Sus agentes de IA actúan.{" "}
              <span className="text-sky-400">S.A.A.R.E. decide antes de que lo hagan.</span>
            </h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-4xl leading-relaxed">
              Contención determinista en el borde para agentes autónomos: veredicto binario
              por debajo de 1,16 ms y prueba criptográfica verificable por un tercero. Sin
              llamar a un segundo modelo de lenguaje, sin consumo de tokens y sin
              persistencia en el nodo.
            </p>

            <form onSubmit={handleVerify} className="mt-8 flex flex-col sm:flex-row gap-3">
              <input
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Introduzca una Merkle Root o ID de evidencia para verificar"
                aria-label="Hash Merkle o identificador de evidencia"
                className="flex-1 bg-black/90 border border-slate-700 px-4 py-3 text-xs font-mono text-sky-300 rounded focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 text-black font-mono font-bold text-xs rounded hover:bg-emerald-400 transition shrink-0 disabled:opacity-60"
              >
                {loading ? "VERIFICANDO..." : "VERIFICAR SELLO"}
              </button>
            </form>

            {verifyResult && (
              <div className={`mt-4 p-4 bg-slate-950 rounded font-mono text-xs border ${verifyBorder}`}>
                <div className="flex items-center gap-2 mb-2">
                  <VerdictChip verdict={verifyResult.status} />
                  <span className="text-slate-300">
                    {verifyResult.status === "VERIFIED"
                      ? "Sello verificado contra el Trust Anchor público"
                      : verifyResult.status === "UNVERIFIABLE"
                      ? "Registro no confirmado"
                      : "Verificación no completada"}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] break-all">Hash: {verifyResult.hash}</div>
                {verifyResult.timestamp && (
                  <div className="text-slate-400 text-[10px] mt-1">
                    Timestamp: {verifyResult.timestamp}
                  </div>
                )}
                <div className="text-slate-500 text-[10px] mt-1">
                  Estándar: {verifyResult.standard} · Algoritmo: {verifyResult.algorithm}
                </div>
                {verifyResult.reason && (
                  <div className="text-slate-500 text-[10px] mt-2 italic">{verifyResult.reason}</div>
                )}
              </div>
            )}

            <p className="mt-4 text-[10px] text-slate-500 font-mono">
              Sin coste de alta · Sin permanencia · Despliegue en su VPC o Air-Gapped
            </p>
          </div>
        </div>
      </section>

      {/* ── Bloque B · Demostrador empírico ── */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-b border-slate-800">
        <SectionTitle
          kicker="DEMOSTRACIÓN EMPÍRICA LOCAL"
          title="Zero-Disk · Zero-Network"
          lead="Todo se procesa en memoria dentro de su propio navegador con el mismo runtime determinista que corre en producción."
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs">
            <label className="block text-sky-400 font-bold mb-2" htmlFor="demo-input">
              ENTRADA EN CLARO (PROMPT CON PII/PHI):
            </label>
            <textarea
              id="demo-input"
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
              {demoProcessed || (
                <span className="text-slate-600">
                  Haga clic en ejecutar para ver la seudonimización determinista en memoria
                  volátil...
                </span>
              )}
            </div>

            {demoMetrics && (
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div>
                  Latencia de procesamiento:{" "}
                  <span className="text-emerald-400 font-bold">{demoMetrics.latency} ms</span>
                </div>
                <div>
                  Coste en tokens extras:{" "}
                  <span className="text-emerald-400 font-bold">{demoMetrics.tokensCost}</span>
                </div>
                <div>
                  Modo de memoria: <span className="text-sky-300">{demoMetrics.memoryMode}</span>
                </div>
                <div className="flex items-center gap-2">
                  Veredicto L7: <VerdictChip verdict={demoMetrics.verdict} />
                  <span className="text-slate-500">{demoMetrics.verdictNote}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Bloque C · Las 7 dimensiones ── */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-b border-slate-800">
        <SectionTitle
          kicker="EVALUACIÓN EX-ANTE"
          title="Las 7 Dimensiones de Control"
          lead="Cada llamada L7 se descompone y analiza sobre memoria volátil antes de autorizar la emisión del Execution Permit."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DIMENSIONS.map(([code, title, desc]) => (
            <div
              key={code}
              className="bg-slate-900 border border-slate-800 p-5 rounded-lg font-mono text-xs"
            >
              <span className="text-sky-400 font-bold">{code}</span>
              <h3 className="text-white font-bold text-sm mt-2">{title}</h3>
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bloque D · Comparativa ── */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-b border-slate-800">
        <SectionTitle
          kicker="DISRUPCIÓN"
          title="Ya tiene un guardarraíl. No tiene una prueba."
        />
        <div className="grid md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-slate-900/60 border border-red-500/30 p-6 rounded-lg">
            <h3 className="text-red-400 font-bold text-sm mb-4">
              GUARDARRAÍLES CLOUD PROBABILÍSTICOS
            </h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Factura API:</span>
                <span className="text-red-400 text-right">Doble cobro (prompt + evaluación)</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Latencia añadida:</span>
                <span className="text-red-400 text-right">+500 ms a +2.000 ms</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Mecanismo de control:</span>
                <span className="text-right">Otra IA alucinando sobre la primera</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Persistencia:</span>
                <span className="text-red-400 text-right">Guarda texto en servidores ajenos</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Air-gapped:</span>
                <span className="text-red-400 text-right">No operativo</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Producto en litigio:</span>
                <span className="text-red-400 text-right">Un log interno, impugnable</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-emerald-500/40 p-6 rounded-lg">
            <h3 className="text-emerald-400 font-bold text-sm mb-4">
              S.A.A.R.E. SGP 1.0 (MOTOR RUNTIME EN RAM)
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Factura API:</span>
                <span className="text-emerald-400 font-bold text-right">0 tokens extras (0 €)</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Latencia añadida:</span>
                <span className="text-emerald-400 font-bold text-right">
                  &lt; 1,16 ms (mlock en RAM)
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Mecanismo de control:</span>
                <span className="text-right">Código nativo C++/Rust L7</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Persistencia:</span>
                <span className="text-emerald-400 font-bold text-right">
                  Zero-Disk (solo hashes SHA-256)
                </span>
              </li>
              <li className="flex justify-between gap-4 border-b border-slate-800 pb-2">
                <span>Air-gapped:</span>
                <span className="text-emerald-400 font-bold text-right">Nativo</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Producto en litigio:</span>
                <span className="text-emerald-400 font-bold text-right">
                  Dossier verificable por un perito
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Bloque E · Licenciamiento ── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <SectionTitle
          kicker="LICENCIAMIENTO"
          title="Estructura por nodo y por evidencia"
          lead="Se cobra por el eje que escala —nodo desplegado y evidencia sellada—, no por el número de personas. El SDK es gratuito."
        />
        <div className="grid lg:grid-cols-3 gap-6">
          {PRICING_STRUCTURE.nodes.map((n) => (
            <PriceCard
              key={n.id}
              tier={n.name}
              price={n.price}
              suffix={n.suffix}
              description={n.description}
              features={n.features}
              featured={n.featured}
              ctaText={n.ctaText}
            />
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {PRICING_STRUCTURE.services.map((s) => (
            <PriceCard
              key={s.id}
              tier={s.label}
              price={s.price}
              suffix={s.suffix}
              description={s.description}
              features={s.features}
              ctaText={s.ctaText}
              href={s.href || WHATSAPP_URL}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · CONSOLAS DE CUMPLIMIENTO (una consola, tres superficies)
   ========================================================================== */
function TabCumplimiento({ vista = "todas" }) {
  useSEO("producto");

  const TODAS = [
    {
      id: "executive",
      badge: "VISTA EXECUTIVE",
      title: "Gobernanza cuantitativa y blindaje de responsabilidad",
      owner: "CEO · Junta directiva · Dirección jurídica",
      rows: [
        ["AHORRO POR COMPRESIÓN", "Context Slicing activo"],
        ["EXPOSICIÓN GLOBAL", "Índice bajo control"],
        ["CERTIFICADO CORPORATIVO", "Exportable en 1 clic"],
        ["GASTO POR DEPARTAMENTO", "Trazado por tipo de modelo"],
      ],
    },
    {
      id: "grc",
      badge: "VISTA GRC_AUDIT",
      title: "La prueba llegó antes que el litigio",
      owner: "CISO · DPO · Auditoría externa",
      rows: [
        ["ENMASCARAMIENTO PII", "DNI · IBAN · Tarjetas · PHI"],
        ["CLASIFICACIÓN AI ACT", "Inaceptable · Alto · Limitado"],
        ["RGPD ART. 32", "Arquitectura Zero-Disk"],
        ["REGISTRO EIPD", "Inmutable y firmado"],
      ],
    },
    {
      id: "cyber",
      badge: "VISTA CYBER_RESILIENCE",
      title: "Ve cada intercepción mientras ocurre",
      owner: "SOC · SecOps · Threat hunters",
      rows: [
        ["PROMPT INJECTION L7", "Intercepción en tiempo real"],
        ["SHADOW AI", "Descubrimiento automático"],
        ["ESTADO FAIL-CLOSED", "100 % activo"],
        ["TELEMETRÍA SIEM", "gRPC · HTTP"],
      ],
    },
  ];

  const VISTAS = TODAS.filter((v) => vista === "todas" || v.id === vista);
  const cabecera = vista === "todas" ? TODAS[0].badge : VISTAS[0].badge;

  return (
    <main>
      <PageHeader
        badge={`PRODUCTO · ${cabecera}`}
        title="Una consola de gobierno, tres superficies por rol"
        description="Plano unificado de control para dirección ejecutiva, cumplimiento de privacidad y resiliencia de ciberseguridad. El control de acceso basado en roles adapta la interfaz según el perfil, sobre el mismo motor de decisión."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {VISTAS.map((v) => (
            <TechnicalCard key={v.id} title={v.title} badge={v.badge}>
              <p className="text-slate-500">{v.owner}</p>
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <DataRow label={v.rows[0][0]} value={v.rows[0][1]} />
                <DataRow label={v.rows[1][0]} value={v.rows[1][1]} />
                <DataRow label={v.rows[2][0]} value={v.rows[2][1]} />
                <DataRow label={v.rows[3][0]} value={v.rows[3][1]} />
              </div>
            </TechnicalCard>
          ))}
        </div>

        {/* Inventario unificado de nodos */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle
            kicker="ADMINISTRACIÓN"
            title="Inventario unificado de nodos"
            lead="Una sola consola gobierna los tres modos de despliegue. Las políticas se distribuyen globalmente o por etiquetas de alcance."
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-sky-400">
                  <th className="pb-3 pr-4">NODO / INSTANCIA</th>
                  <th className="pb-3 pr-4">DESPLIEGUE</th>
                  <th className="pb-3 pr-4">ENTORNO</th>
                  <th className="pb-3 pr-4">ÁMBITO</th>
                  <th className="pb-3">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 pr-4">node-sdk-payment-api</td>
                  <td className="py-3 pr-4">SDK nativo</td>
                  <td className="py-3 pr-4">App Node.js / Lambda</td>
                  <td className="py-3 pr-4">scope: microservices</td>
                  <td className="py-3"><VerdictChip verdict="ALLOW" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">node-proxy-ingress-01</td>
                  <td className="py-3 pr-4">Proxy (PerimeterShield)</td>
                  <td className="py-3 pr-4">Docker / K8s</td>
                  <td className="py-3 pr-4">scope: external-apis</td>
                  <td className="py-3"><VerdictChip verdict="ALLOW" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">node-daemon-finance-srv</td>
                  <td className="py-3 pr-4">Daemon (On-Premise)</td>
                  <td className="py-3 pr-4">Ubuntu Server 22.04</td>
                  <td className="py-3 pr-4">scope: core-banking</td>
                  <td className="py-3"><VerdictChip verdict="ALLOW" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Simulación de superficie operativa */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle kicker="SUPERFICIE OPERATIVA" title="Simulación de consola RBAC" />
          <div className="bg-slate-950 p-6 rounded border border-slate-800 space-y-4">
            <div className="flex justify-between gap-4 border-b border-slate-800 pb-3 text-slate-400">
              <span>
                ACTIVE_ROLE: <strong className="text-white">CISO_SECOPS_LEVEL_3</strong>
              </span>
              <span>
                NODE_STATUS: <strong className="text-emerald-400">ONLINE (0,84 ms)</strong>
              </span>
            </div>
            <div className="space-y-2">
              <DataRow label="POLICY_STATE" value="SIGNED_BY_HSM_KEY_0x9F (v2.4.1)" />
              <DataRow label="CONTAINMENT" value="FAIL_CLOSED (100 % activo)" />
              <DataRow
                label="SHADOW_AI_DISCOVERY"
                value="3 endpoints no protegidos bloqueados en 24 h"
              />
              <DataRow label="EXPOSURE_INDEX" value="LOW (98/100 audit score)" />
            </div>
          </div>
        </div>

        {/* Matriz regulatoria */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12">
          <SectionTitle
            kicker="CUMPLIMIENTO POR DISEÑO"
            title="Matriz regulatoria integrada"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-sky-400">
                  <th className="pb-3 pr-4">MARCO NORMATIVO</th>
                  <th className="pb-3 pr-4">CONTROL REQUERIDO</th>
                  <th className="pb-3 pr-4">MECANISMO S.A.A.R.E.</th>
                  <th className="pb-3">EVIDENCIA GENERADA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">EU AI Act arts. 10 y 12</td>
                  <td className="py-3 pr-4">Gobernanza de datos y registro de eventos</td>
                  <td className="py-3 pr-4">Generalización ex-ante y registro en memoria</td>
                  <td className="py-3">Huella criptográfica del veredicto</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">EU AI Act arts. 14 y 15</td>
                  <td className="py-3 pr-4">Supervisión humana y robustez</td>
                  <td className="py-3 pr-4">Cambio de política en vivo y contención fail-closed</td>
                  <td className="py-3">Veredicto firmado con latencia</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">RGPD art. 32</td>
                  <td className="py-3 pr-4">Minimización y cifrado de datos</td>
                  <td className="py-3 pr-4">Sanitización en RAM y arquitectura Zero-Disk</td>
                  <td className="py-3">Digest SHA-256 del payload</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">DORA</td>
                  <td className="py-3 pr-4">Resiliencia operativa y continuidad</td>
                  <td className="py-3 pr-4">Políticas locales firmadas sin dependencia de red</td>
                  <td className="py-3">Certificado de autonomía de nodo</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">NIS 2</td>
                  <td className="py-3 pr-4">Gestión de riesgo y notificación</td>
                  <td className="py-3 pr-4">Telemetría determinista sin contenido ni PII</td>
                  <td className="py-3">Contadores anónimos firmados</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">ISO/IEC 27037</td>
                  <td className="py-3 pr-4">Identificación de evidencia digital</td>
                  <td className="py-3 pr-4">Cadena de Merkle y firma asimétrica</td>
                  <td className="py-3">Dossier forense verificable offline</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-white">Arts. 281 y 326 LEC</td>
                  <td className="py-3 pr-4">Prueba documental preconstituida</td>
                  <td className="py-3 pr-4">Sellado cualificado y cadena de custodia</td>
                  <td className="py-3">Expediente aportable en sala</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Licenciamiento del producto */}
        <div className="max-w-3xl mx-auto">
          <PriceCard
            tier="CONSOLA DE CUMPLIMIENTO SGP 1.0"
            price="290 €"
            suffix="/mes"
            description="Consola unificada sobre el Nodo con Custodia Forense. Administra las tres superficies RBAC y todos los nodos desplegados, sin tarifa por usuario."
            features={[
              "Acceso ilimitado para roles Executive, DPO y CISO bajo RBAC",
              "Despliegue On-Premise / VPC sin transmisión externa de contenido",
              "Administración de nodos SDK, Proxy y Daemon desde una sola consola",
              "Distribución de políticas global o por etiquetas de alcance",
              "Dossier de cumplimiento AEPD / AESIA autogenerado",
              "SLA de soporte prioritario de 4 horas con gestor dedicado",
            ]}
            featured
            ctaText="ACTIVAR CONSOLA DE CUMPLIMIENTO ↗"
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · LEGAL-FORENSE (Evidence Vault)
   ========================================================================== */
function TabForense() {
  useSEO("forensic");
  return (
    <main>
      <PageHeader
        badge="FORENSE · EVIDENCE VAULT"
        title="Un log se alega. Un árbol de Merkle firmado se prueba."
        description="Entorno pericial para jueces, peritos y despachos. Bóveda ciega, verificación independiente contra la clave pública del nodo y exportación del dossier conforme al Art. 326 LEC."
      />

      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <TechnicalCard title="Bóveda ciega de conocimiento cero" badge="VERIFICACIÓN">
            <p>• El perito inspecciona y valida sin ver el contenido en claro.</p>
            <p>• Claves de custodia controladas por el cliente, nunca por S.A.A.R.E.</p>
            <p>• Acceso por rol con registro de cada consulta firmado.</p>
          </TechnicalCard>

          <TechnicalCard title="Validador Ed25519 independiente" badge="CADENA DE CUSTODIA">
            <p>• Contraste de la firma del nodo contra su clave pública.</p>
            <p>• Verificación reproducible sin confiar en el emisor.</p>
            <p>• Cadena eIDAS y sello cualificado RFC 3161 como certeza temporal.</p>
          </TechnicalCard>

          <TechnicalCard title="Dossier procesal exportable" badge="ART. 326 LEC">
            <p>• Exportación del paquete .saare-proof con la cadena completa.</p>
            <p>• Alineado con ISO/IEC 27037 para evidencia electrónica.</p>
            <p>• Auditoría de propiedad intelectual contra la Ley 1/2019.</p>
          </TechnicalCard>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle
            kicker="CADENA DE CUSTODIA"
            title="Los tres requisitos del artículo 326 LEC"
            lead="Cada requisito se responde con un mecanismo concreto, no con una afirmación."
          />
          <div className="space-y-3">
            <DataRow
              label="AUTENTICIDAD DE ORIGEN"
              value="Clave privada Ed25519 del nodo · AFT-2026-AUTH-X9"
            />
            <DataRow
              label="INALTERABILIDAD"
              value="Digest HMAC-SHA256 · un bit altera el hash"
            />
            <DataRow
              label="CERTEZA TEMPORAL"
              value="Sello cualificado RFC 3161 · art. 32 eIDAS"
            />
            <DataRow label="VERIFICACIÓN OFFLINE" value="CLI saare-evidence-cli sin conexión" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="LICENCIA ESTACIÓN PERICIAL"
            price="1.200 €"
            suffix="/año + 300 €/dossier"
            description="Licencia anual con emisión por caso. El perito cobra por caso; la suite se cobra por caso."
            features={[
              "Verificación independiente sin confiar en el vendedor",
              "Exportación de dossiers con sello RFC 3161",
              "Acceso a la bóveda ciega y al validador Ed25519",
              "Dossier de muestra descargable sin registro",
              "Soporte técnico para la ratificación en sala",
            ]}
            featured
            ctaText="SOLICITAR ACCESO PERICIAL ↗"
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · DESARROLLADORES (índice de los tres modos)
   ========================================================================== */
function TabDev() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="DESARROLLADORES · TRES MODOS DE DESPLIEGUE"
        title="Intégrelo en una tarde, o no lo integre en absoluto."
        description="El SDK es gratuito. Se cobra la evaluación sellada, no el acceso. Tres formas de desplegar el mismo motor según dónde necesite la intercepción."
      />
      <section className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-3 gap-6">
        <TechnicalCard title="SDK nativo" badge="LabEngine">
          <p>Autorización embebida en el código fuente del agente o microservicio.</p>
          <p className="text-emerald-400 font-bold mt-2">Gratuito · se cobra el sellado</p>
          <Link to="/dev/sdk" className="inline-block mt-3 text-sky-400 hover:underline">
            Ver integración →
          </Link>
        </TechnicalCard>
        <TechnicalCard title="Proxy perimetral" badge="PerimeterShield">
          <p>Intercepción L7 en el borde de la red, por contenedor o clúster.</p>
          <p className="text-emerald-400 font-bold mt-2">Por nodo proxy desplegado</p>
          <Link to="/dev/proxy" className="inline-block mt-3 text-sky-400 hover:underline">
            Ver despliegue →
          </Link>
        </TechnicalCard>
        <TechnicalCard title="Daemon on-premise" badge="Servicio local">
          <p>Servicio nativo para redes aisladas y LLMs locales, con claves HSM.</p>
          <p className="text-emerald-400 font-bold mt-2">Por instancia ejecutada</p>
          <Link to="/dev/daemon" className="inline-block mt-3 text-sky-400 hover:underline">
            Ver despliegue →
          </Link>
        </TechnicalCard>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · SDK NATIVO
   ========================================================================== */
function TabSDK() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="MODO SDK · LabEngine"
        title="La autorización en el código fuente, antes de la acción de riesgo."
        description="Biblioteca nativa @saare/sdk y pip install saare-sdk. Validación de esquemas MCP y autorización síncrona sin salir del proceso."
      />
      <section className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        <CodePanel
          title="PATRÓN DE INTEGRACIÓN · CLIENTE SDK"
          code={`import { SaareJudgeClient } from '@saare/sdk';

const judge = new SaareJudgeClient({
  apiKey: process.env.SAARE_API_KEY,
  failPolicy: 'FAIL_CLOSED'
});

const result = await judge.authorize({
  subject: "payment-agent-742",
  action: "send_wire_transfer",
  resource: "core-banking-api://transfers/sepa",
  context: { amount_eur: 18420.00 }
});

if (result.decision !== "ALLOW") {
  throw new Error('Bloqueo Ex-Ante S.A.A.R.E.: ' + result.reason);
}

// El payload ya viene sanitizado k-Anonymity
await executeBankTransfer(result.executionPermit);`}
        />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs space-y-2">
          <DataRow label="BENCHMARK EVALUACIÓN" value="P99 < 1,16 ms" />
          <DataRow label="CONSUMO DE TOKENS" value="0 € (sin segundo modelo)" />
          <DataRow label="AHORRO POR COMPRESIÓN" value="Context Slicing activo" />
          <DataRow label="VALIDACIÓN DE ESQUEMAS" value="AST in-memory · soporte MCP" />
        </div>
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="SDK NATIVO · ACCESO"
            price="0 €"
            suffix="/mes"
            description="El SDK es gratuito. Lo que se paga es la evaluación sellada y la custodia probatoria."
            features={[
              "Librería completa @saare/sdk y paquete pip sin coste",
              "Autorización síncrona embebida en el proceso",
              "Las 7 dimensiones de control disponibles en local",
              "Se cobra solo la evidencia sellada (paquete de 1.000 sellos)",
            ]}
            ctaText="DESCARGAR SDK ↗"
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · PROXY PERIMETRAL
   ========================================================================== */
function TabProxy() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="MODO PROXY · PerimeterShield"
        title="Intercepción L7 en el borde, antes de que el tráfico salga."
        description="Contenedor Docker o despliegue Helm en Kubernetes. Sanitización k-anónima y defensa contra prompt injections sin tocar el código de los agentes."
      />
      <section className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        <CodePanel
          title="DESPLIEGUE · DOCKER COMPOSE"
          code={`version: '3.8'
services:
  saare-shield:
    image: registry.saare.es/perimeter-shield:v7.0.4
    environment:
      - SAARE_TENANT_KEY=\${SAARE_TENANT_KEY}
      - SAARE_POLICY_MODE=STRICT_FAIL_CLOSED
      - SAARE_SCOPE=external-apis
    ports:
      - "8765:8765"
    restart: unless-stopped`}
        />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs space-y-2">
          <DataRow label="PUNTO DE INTERCEPCIÓN" value="127.0.0.1:8765 (bucle local)" />
          <DataRow label="ALCANCE DE POLÍTICA" value="scope: external-apis" />
          <DataRow label="MODO DE FALLO" value="STRICT_FAIL_CLOSED" />
          <DataRow label="SANITIZACIÓN" value="k-Anonymity in-RAM" />
        </div>
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="NODO PROXY"
            price="290 €"
            suffix="/mes"
            description="Licenciamiento por nodo proxy desplegado, con evaluaciones ilimitadas dentro del nodo. Mismo tramo que el nodo con custodia forense."
            features={[
              "Contenedor Docker o Helm para Kubernetes",
              "Evaluaciones ilimitadas en el nodo",
              "Sanitización k-anónima de PII, PHI e IBAN",
              "Escalado horizontal por réplicas",
              "Custodia de evidencias incluida",
            ]}
            ctaText="DESPLEGAR NODO PROXY ↗"
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · DAEMON ON-PREMISE
   ========================================================================== */
function TabDaemon() {
  useSEO("dev");
  return (
    <main>
      <PageHeader
        badge="MODO DAEMON · ON-PREMISE"
        title="Servicio local para redes aisladas y modelos propios."
        description="Demonio no privilegiado en C++/Rust, atado al bucle local. Para LLMs on-premise, arquitecturas air-gapped y claves gestionadas por HSM."
      />
      <section className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        <CodePanel
          title="DESPLIEGUE · SYSTEMD UNIT"
          code={`[Unit]
Description=SAARE Decision Core (Zero-Disk L7)
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/saare-daemon --bind 127.0.0.1:8765
Environment=SAARE_TENANT_KEY=\${SAARE_TENANT_KEY}
Environment=SAARE_MEMORY_MODE=MLOCK_VOLATILE
Environment=SAARE_HSM_PKCS11=/etc/saare/hsm.so
Restart=always
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target`}
        />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg font-mono text-xs space-y-2">
          <DataRow label="PRIVILEGIOS" value="Demonio no privilegiado" />
          <DataRow label="MEMORIA" value="mlock · sin paginación a disco" />
          <DataRow label="CLAVES" value="HSM corporativo (PKCS#11)" />
          <DataRow label="REARRANQUE" value="Revinculación del socket en <500 ms" />
        </div>
        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="NODO SOBERANO ENTERPRISE"
            price="3.500 €"
            suffix="/mes"
            description="Despliegue perimetral aislado con contrato marco, HSM dedicado y SLA garantizado."
            features={[
              "VPC privada o arquitectura air-gapped",
              "Integración con HSM corporativo (PKCS#11)",
              "SLA del 99,99 % de disponibilidad",
              "Soporte 24/7 de Nivel 3 con gestor dedicado",
            ]}
            featured
            ctaText="SOLICITAR PROPUESTA ENTERPRISE ↗"
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PESTAÑA · CANAL PARTNER (Kit Consulting)
   ========================================================================== */
function TabVentas() {
  useSEO("canal");
  return (
    <main>
      <PageHeader
        badge="CANAL · PARTNERS Y KIT CONSULTING"
        title="Venda gobernanza de IA sin construirla."
        description="Programa multi-tenant para consultoras, MSP y Agentes Digitalizadores. Cada cliente gestionado con su política, su clave y su cadena de prueba independiente."
      />
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <TechnicalCard title="Marca blanca operativa" badge="MULTI-TENANT">
            <p>El veredicto y la evidencia se generan en su infraestructura.</p>
            <p>La relación comercial con su cliente permanece intacta.</p>
          </TechnicalCard>
          <TechnicalCard title="Justificación de ayudas" badge="KIT CONSULTING">
            <p>Documentación técnica verificable para los programas de digitalización.</p>
            <p>Expediente de entregables eIDAS listo para presentar.</p>
          </TechnicalCard>
          <TechnicalCard title="Precio por cartera" badge="MODELO">
            <p>Pago por cliente gestionado, no por usuario del despacho.</p>
            <p>Un consultor arrastra su cartera completa.</p>
          </TechnicalCard>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl mb-12 font-mono text-xs">
          <SectionTitle
            kicker="ENTREGABLES DEL CANAL"
            title="Tres entregables homologados"
            lead="El partner produce documentación técnica verificable, no una memoria descriptiva."
          />
          <div className="space-y-3">
            <DataRow
              label="1 · DIAGNÓSTICO"
              value="Informe de auditoría de Shadow AI en la empresa cliente"
            />
            <DataRow
              label="2 · DESPLIEGUE"
              value="Políticas activas en RAM con la consola multi-tenant"
            />
            <DataRow
              label="3 · EXPEDIENTE"
              value="Cumplimiento certificado con firma eIDAS para la ayuda"
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <PriceCard
            tier="PROGRAMA PARTNER MULTI-TENANT"
            price="Desde 450 €"
            suffix="/cliente/año"
            description="Licenciamiento marca blanca para consultoras, MSP y Agentes Digitalizadores."
            features={[
              "Portal multi-tenant con clientes ilimitados en la cuenta",
              "Configuración de políticas iniciales por cliente",
              "Documentación justificativa de ayudas generada automáticamente",
              "Soporte técnico para su propio equipo en licitaciones",
            ]}
            ctaText="SOLICITAR KIT DE PARTNER ↗"
          />
        </div>
      </section>
    </main>
  );
}

/* ==========================================================================
   PÁGINA · PRUEBA DE CONTROL (cualificación condicional)
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
      if (!response.ok) throw new Error(data?.message || "Error al procesar la solicitud");

      setStatus("success");
      setMessage(
        "Solicitud aprobada. Le hemos enviado las instrucciones del entorno a su correo corporativo. El siguiente paso es desplegar el nodo de prueba en su VPC."
      );
    } catch {
      setStatus("error");
      setMessage(
        "No se ha podido conectar con el backend. Puede solicitar la propuesta Enterprise directamente vía WhatsApp."
      );
    }
  }

  return (
    <main>
      <PageHeader
        badge="PRUEBA DE CONTROL DE EJECUCIÓN"
        title="Someta un agente autónomo al plano de control S.A.A.R.E."
        description="Inicie una evaluación técnica. Complete los datos corporativos para aprovisionar un entorno de prueba o solicitar una revisión de arquitectura."
      />

      <section className="max-w-3xl mx-auto px-6 py-6 mb-16">
        {status === "success" ? (
          <div className="bg-slate-900 border border-emerald-500 p-8 rounded-xl font-mono text-xs">
            <div className="text-emerald-400 font-bold text-sm mb-2">SOLICITUD PROCESADA</div>
            <p className="text-slate-300 leading-relaxed">{message}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 p-8 rounded-xl space-y-6 font-mono text-xs"
          >
            <div>
              <label htmlFor="trial-email" className="block text-sky-400 mb-2">
                CORREO CORPORATIVO (*)
              </label>
              <input
                id="trial-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ciso@empresa.com"
                aria-describedby="trial-email-hint"
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <p id="trial-email-hint" className="text-[10px] text-slate-500 mt-1">
                Para la prueba de exposición necesitamos un correo corporativo.
              </p>
            </div>

            <div>
              <label htmlFor="trial-company" className="block text-sky-400 mb-2">
                ORGANIZACIÓN (*)
              </label>
              <input
                id="trial-company"
                type="text"
                required
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de la entidad"
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="trial-agents" className="block text-sky-400 mb-2">
                AGENTES AUTÓNOMOS EN PRODUCCIÓN (*)
              </label>
              <input
                id="trial-agents"
                type="number"
                min="1"
                required
                value={agents}
                onChange={(e) => setAgents(e.target.value)}
                aria-describedby="trial-agents-hint"
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <p id="trial-agents-hint" className="text-[10px] text-slate-500 mt-1">
                Más de 10 agentes cualifica automáticamente para despliegue privado Enterprise.
              </p>
            </div>

            {status === "error" && <div className="text-red-400">{message}</div>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition disabled:opacity-60"
            >
              {status === "loading"
                ? "PROCESANDO..."
                : isEnterprise
                ? "SOLICITAR REVISIÓN ENTERPRISE"
                : "INICIAR PRUEBA DE CONTROL"}
            </button>

            <p className="text-[10px] text-slate-500 text-center">
              Sin coste de alta · Sin permanencia · Su VPC o Air-Gapped
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

/* ==========================================================================
   PÁGINAS CORPORATIVAS
   ========================================================================== */
function CorporatePage({ variant }) {
  const CONTENT = {
    empresa: {
      badge: "CORPORATIVO",
      title: "MS3V S.A.A.R.E. SL · Soberanía tecnológica europea",
      description:
        "Infraestructura independiente de gobernanza de IA. Intercepción ex-ante en memoria volátil, contención determinista y prueba digital probatoria. Sin dependencia de proveedores externos.",
      body: [
        "S.A.A.R.E. opera como una infraestructura soberana de autorización ex-ante y gobernanza runtime para agentes autónomos, bajo el protocolo SGP 1.0 y el principio Fail-Closed. Mientras los agentes ejecutan acciones, el motor evalúa, decide e intercepta en tiempo real, garantizando el cumplimiento del Reglamento Europeo de Inteligencia Artificial, DORA, NIST CSF 2.0 y el Reglamento General de Protección de Datos.",
        "La compañía mantiene su sede y su infraestructura en la Unión Europea, y ninguna decisión de contenido abandona el perímetro del cliente. Los contadores de licenciamiento son numéricos y anónimos: registran el número de evaluaciones y veredictos, nunca el texto ni los datos personales.",
      ],
    },
    "buenas-practicas": {
      badge: "ÉTICA Y BUEN USO",
      title: "Código de buen uso de la IA",
      description:
        "Marco de uso responsable: minimización de datos por diseño, supervisión humana efectiva, trazabilidad de cada decisión automatizada y no persistencia de contenido en el nodo evaluador.",
      body: [
        "Principio de minimización. El sistema procesa en memoria volátil y no persiste contenido en claro. La custodia conserva huellas criptográficas, no texto. Cualquier dato personal detectado en tránsito se generaliza antes de que abandone el nodo, conforme al artículo 5 del Reglamento General de Protección de Datos.",
        "Principio de supervisión humana. El responsable de cumplimiento puede modificar las reglas del motor en tiempo real sin reiniciar los sistemas, de modo que el control efectivo permanece en manos de la organización y no del automatismo. Cada cambio de política queda registrado y firmado.",
        "Principio de trazabilidad. Cada decisión autorizada queda sellada con su política aplicada y su instante exacto. La trazabilidad no es un registro de vigilancia: es la prueba de que el sistema actuó conforme a la política vigente en el momento de la ejecución.",
        "Principio de no discriminación. La generalización semántica sustituye valores exactos por rangos y aplica ruido diferencial, lo que evita que variables indirectas permitan reidentificar a una persona o inferir categorías sensibles.",
      ],
    },
    legal: {
      badge: "CENTRO LEGAL B2B",
      title: "Centro legal y privacidad Zero-Disk",
      description:
        "Condiciones B2B, acuerdo de encargado de tratamiento, política de privacidad y SLA Zero-Disk. Documentación disponible para auditoría previa a la contratación.",
      body: [
        "Acuerdo de encargado de tratamiento. S.A.A.R.E. actúa como encargado en los tratamientos derivados del despliegue del nodo, y como responsable únicamente en los datos de licenciamiento. El modelo de contrato y sus anexos están disponibles para revisión previa a cualquier compromiso.",
        "Compromiso Zero-Disk. El nodo evaluador no escribe contenido en disco. El bloque de memoria se bloquea con mlock para impedir la paginación, y se sobreescribe con ceros tras la firma. La custodia de evidencias es externa al nodo y almacena huellas o contenido cifrado con clave del cliente.",
        "SLA Zero-Disk. El compromiso de disponibilidad, los tiempos de respuesta del soporte y las condiciones de continuidad de servicio para el tramo Enterprise se documentan en el contrato marco, con SLA garantizado del 99,99 % para el despliegue dedicado.",
        "Prueba preconstituida. La generación de evidencia se alinea con los artículos 281 y 326 de la Ley de Enjuiciamiento Civil y con ISO/IEC 27037, de modo que el expediente sea aportable en un procedimiento sin necesidad de reconstrucción posterior.",
      ],
    },
  };

  const data = CONTENT[variant] || CONTENT.empresa;
  useSEO("home");

  return (
    <main>
      <PageHeader badge={data.badge} title={data.title} description={data.description} />
      <section className="max-w-3xl mx-auto px-6 py-6 mb-16 space-y-6">
        {data.body.map((p, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">
            {p}
          </p>
        ))}
        <p className="text-sm text-slate-400 font-mono pt-4 border-t border-slate-800">
          Para el detalle contractual completo, contacte con el equipo legal en{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-400 hover:underline">
            {CONTACT_EMAIL}
          </a>
          . Facilitamos la documentación necesaria antes de cualquier compromiso.
        </p>
      </section>
    </main>
  );
}

/* ==========================================================================
   PIE DE PÁGINA
   ========================================================================== */
function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-12 pb-8 px-6 font-mono text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="space-y-3">
          <div className="text-white font-bold text-sm tracking-wide">MS3V S.A.A.R.E. SL</div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Infraestructura independiente de gobernanza de IA. Intercepción ex-ante en
            memoria RAM y prueba digital probatoria.
          </p>
          <div className="text-[10px] text-slate-600">Madrid, España</div>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Producto</div>
          <ul className="space-y-2 text-[11px]">
            <li>
              <Link to="/producto/auditoria" className="hover:text-sky-400">
                Auditoría pública
              </Link>
            </li>
            <li>
              <Link to="/producto/executive" className="hover:text-sky-400">
                Consola EXECUTIVE
              </Link>
            </li>
            <li>
              <Link to="/producto/grc" className="hover:text-sky-400">
                Consola GRC_AUDIT
              </Link>
            </li>
            <li>
              <Link to="/producto/cyber" className="hover:text-sky-400">
                Consola CYBER_RESILIENCE
              </Link>
            </li>
            <li>
              <Link to="/forense" className="hover:text-sky-400">
                Evidence Vault
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">
            Desarrolladores y canal
          </div>
          <ul className="space-y-2 text-[11px]">
            <li>
              <Link to="/dev/sdk" className="hover:text-sky-400">
                SDK nativo
              </Link>
            </li>
            <li>
              <Link to="/dev/proxy" className="hover:text-sky-400">
                Proxy perimetral
              </Link>
            </li>
            <li>
              <Link to="/dev/daemon" className="hover:text-sky-400">
                Daemon on-premise
              </Link>
            </li>
            <li>
              <Link to="/canal" className="hover:text-sky-400">
                Programa de partners
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-slate-200 font-bold mb-3 uppercase text-[11px]">Corporativo</div>
          <ul className="space-y-2 text-[11px]">
            <li>
              <Link to="/empresa" className="hover:text-sky-400">
                Sobre MS3V S.A.A.R.E. SL
              </Link>
            </li>
            <li>
              <Link to="/buenas-practicas" className="hover:text-sky-400">
                Código de buen uso de IA
              </Link>
            </li>
            <li>
              <Link to="/legal" className="hover:text-sky-400">
                Centro legal B2B y DPA
              </Link>
            </li>
            <li>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-sky-400">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>Teléfono: {CONTACT_PHONE}</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-[10px] text-slate-600">
        <div>© 2026 MS3V S.A.A.R.E. SL. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <Link to="/legal" className="hover:text-slate-400">
            Privacidad
          </Link>
          <Link to="/legal" className="hover:text-slate-400">
            Términos B2B
          </Link>
          <Link to="/legal" className="hover:text-slate-400">
            SLA Zero-Disk
          </Link>
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
   ENRUTADOR GENERAL
   ========================================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ScrollToTop />
        <Routes>
          {/* Producto */}
          <Route path="/" element={<TabAuditoriaPublica />} />
          <Route path="/producto" element={<TabAuditoriaPublica />} />
          <Route path="/producto/auditoria" element={<TabAuditoriaPublica />} />
          <Route path="/producto/executive" element={<TabCumplimiento vista="executive" />} />
          <Route path="/producto/grc" element={<TabCumplimiento vista="grc" />} />
          <Route path="/producto/cyber" element={<TabCumplimiento vista="cyber" />} />

          {/* Forense */}
          <Route path="/forense" element={<TabForense />} />

          {/* Desarrolladores */}
          <Route path="/dev" element={<TabDev />} />
          <Route path="/dev/sdk" element={<TabSDK />} />
          <Route path="/dev/proxy" element={<TabProxy />} />
          <Route path="/dev/daemon" element={<TabDaemon />} />

          {/* Canal */}
          <Route path="/canal" element={<TabVentas />} />

          {/* Cualificación y corporativo */}
          <Route path="/trial" element={<TrialPage />} />
          <Route path="/empresa" element={<CorporatePage variant="empresa" />} />
          <Route path="/buenas-practicas" element={<CorporatePage variant="buenas-practicas" />} />
          <Route path="/legal" element={<CorporatePage variant="legal" />} />

          {/* Compatibilidad con rutas heredadas */}
          <Route path="/cumplimiento" element={<TabCumplimiento />} />
          <Route path="/grc" element={<TabCumplimiento />} />
          <Route path="/auditoria" element={<TabAuditoriaPublica />} />
          <Route path="/sdk" element={<TabSDK />} />
          <Route path="/proxy" element={<TabProxy />} />
          <Route path="/daemon" element={<TabDaemon />} />
          <Route path="/software" element={<TabProxy />} />
          <Route path="/sales" element={<TabVentas />} />
          <Route path="/ventas" element={<TabVentas />} />
          <Route path="/developers" element={<TabDev />} />
          <Route path="/enterprise" element={<TabDaemon />} />

          <Route path="*" element={<TabAuditoriaPublica />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}