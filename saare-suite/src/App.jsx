import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { saareFetch } from "./utils/api";

const DEMO_ROOT_MERKLE_HASH =
  "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842";

const CONTACT_EMAIL = "legal@saare.es";
const CONTACT_PHONE = "+34 633 886 506";
const WHATSAPP_URL =
  "https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE";

const NAV = [
  { id: "audit", label: "AUDITORÍA", description: "Motor público", path: "/" },
  { id: "compliance", label: "CUMPLIMIENTO", description: "Consola GRC", path: "/cumplimiento" },
  { id: "forensic", label: "FORENSE", description: "Evidence Vault", path: "/forense" },
  { id: "sales", label: "VENTAS", description: "Gobierno comercial", path: "/ventas" },
  { id: "sdk", label: "SDK", description: "LabEngine", path: "/sdk" },
  { id: "proxy", label: "PROXY", description: "PerimeterShield", path: "/proxy" },
  { id: "daemon", label: "DAEMON", description: "On-premise", path: "/daemon" },
];

const DIMENSIONS = [
  ["01", "IDENTIDAD", "Quién solicita la acción"],
  ["02", "ACCIÓN", "Qué quiere ejecutar"],
  ["03", "CONTEXTO", "En qué contexto ocurre"],
  ["04", "RECURSO", "Sobre qué recurso"],
  ["05", "DATOS", "Qué datos intervienen"],
  ["06", "RIESGO", "Qué nivel de riesgo presenta"],
  ["07", "POLÍTICA", "Qué regla de autorización aplica"],
];

const PRICING = {
  nodes: [
    {
      id: "base",
      name: "Nodo base",
      price: "149 €",
      suffix: "/mes",
      description: "Contención y veredicto en tiempo real.",
      features: [
        "Motor de decisión",
        "Intercepción L7",
        "ALLOW / REVIEW / DENY",
        "Sin custodia de evidencias",
      ],
    },
    {
      id: "custody",
      name: "Nodo con custodia",
      price: "290 €",
      suffix: "/mes",
      description: "Control con sellado continuo y evidencia exportable.",
      features: [
        "Todo lo incluido en Nodo base",
        "Sellado continuo",
        "Cadena Merkle",
        "Dossier exportable",
      ],
      featured: true,
    },
    {
      id: "enterprise",
      name: "Nodo Enterprise",
      price: "Desde 3.500 €",
      suffix: "/mes",
      description: "Despliegue soberano con requisitos Enterprise.",
      features: [
        "HSM / gestión de claves del cliente",
        "SLA Enterprise",
        "VPC / on-premise",
        "Entornos air-gapped",
      ],
    },
  ],
  services: [
    {
      id: "evidence",
      label: "EVIDENCIAS",
      name: "Evidencias",
      price: "Desde 120 €",
      suffix: "/mes",
      description: "Paquetes de 1.000 sellos.",
    },
    {
      id: "forensic",
      label: "FORENSE",
      name: "Dossier forense",
      price: "1.200 €",
      suffix: "/año + 300 €/dossier",
      description: "Licencia y emisión por expediente.",
    },
    {
      id: "partner",
      label: "CANAL",
      name: "Canal multi-tenant",
      price: "Desde 450 €",
      suffix: "/cliente/año",
      description: "Para partners que gestionan múltiples organizaciones.",
    },
  ],
};

const SEO = {
  home: {
    title: "S.A.A.R.E. | Control de ejecución para agentes de IA",
    description:
      "Infraestructura de autorización y control de ejecución para agentes autónomos de IA. Decide qué puede ejecutar cada agente antes de la acción.",
  },
  software: {
    title: "Control de ejecución para agentes de IA | S.A.A.R.E.",
    description:
      "Autoriza, revisa o bloquea acciones de agentes antes de que lleguen al sistema de destino.",
  },
  sales: {
    title: "Gobierno comercial de agentes de IA | S.A.A.R.E.",
    description:
      "Gobierna cambios de precios, CRM, pagos y acciones comerciales ejecutadas por agentes autónomos.",
  },
  grc: {
    title: "GRC y evidencia de decisiones de IA | S.A.A.R.E.",
    description:
      "Convierte decisiones de autorización en evidencia digital verificable y exportable para auditoría e investigación.",
  },
  developers: {
    title: "SDK y API de autorización para agentes de IA | S.A.A.R.E.",
    description:
      "Integra autorización ex-ante mediante SDK, REST, sidecar Docker/Kubernetes o intercepción L7.",
  },
  enterprise: {
    title: "Despliegue soberano para agentes de IA | S.A.A.R.E.",
    description:
      "Ejecuta el plano de decisión en VPC, infraestructura privada, on-premise, Kubernetes o entornos air-gapped.",
  },
  trial: {
    title: "Probar el control de ejecución | S.A.A.R.E.",
    description:
      "Solicita una evaluación del control de ejecución de agentes autónomos de IA.",
  },
};

function useSEO(page = "home") {
  useEffect(() => {
    const data = SEO[page] || SEO.home;
    document.title = data.title;

    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }
    description.setAttribute("content", data.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}${window.location.pathname}`);
  }, [page]);
}

function AppShell({ children }) {
  const location = useLocation();
  const active = location.pathname === "/"
    ? "audit"
    : NAV.find((item) => item.path !== "/" && location.pathname.startsWith(item.path))?.id || "home";

  return (
    <div className="min-h-screen bg-saare-bg text-saare-ink font-sans">
      <div className="border-b border-saare-line bg-saare-surface-2">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-2 text-center">
          <span className="font-mono text-[10px] sm:text-xs text-saare-ink-dim uppercase tracking-wider">
            S.A.A.R.E. SGP 1.0 · Infraestructura de autorización y control de ejecución para agentes de IA
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-saare-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="S.A.A.R.E. inicio">
              <span className="font-display font-bold text-2xl tracking-tight text-white">S.A.A.R.E.</span>
              <span className="hidden sm:inline-block font-mono text-[10px] font-bold text-saare-accent bg-saare-accent/10 border border-saare-accent/40 px-2 py-1 rounded">
                SGP 1.0
              </span>
            </Link>

            <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-5">
              {NAV.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group text-left ${
                    active === item.id ? "text-saare-accent" : "text-saare-ink-dim hover:text-white"
                  }`}
                >
                  <div className="font-mono text-[11px] font-bold tracking-wider">{item.label}</div>
                  <div className="text-[9px] uppercase text-saare-ink-faint group-hover:text-saare-ink-dim">
                    {item.description}
                  </div>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/trial"
                className="hidden sm:inline-flex min-h-11 items-center justify-center px-4 py-2 text-[11px] font-bold rounded border border-saare-line-hi text-white hover:bg-saare-surface-2 transition"
              >
                PROBAR EL CONTROL
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center px-4 py-2 text-[11px] font-bold rounded bg-saare-allow text-black hover:opacity-90 transition"
              >
                ENTERPRISE
              </a>
            </div>
          </div>

          <div className="lg:hidden mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            <div className="flex min-w-max gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-3 py-2 rounded border font-mono text-[10px] whitespace-nowrap ${
                    active === item.id
                      ? "border-saare-accent text-saare-accent bg-saare-accent/5"
                      : "border-saare-line text-saare-ink-dim"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/trial"
                className="px-3 py-2 rounded border border-saare-line-hi text-white font-mono text-[10px] whitespace-nowrap"
              >
                PRUEBA
              </Link>
            </div>
          </div>
        </div>
      </header>

      {children}
      <Footer />
    </div>
  );
}

function Home() {
  useSEO("home");

  const [verifyHash, setVerifyHash] = useState(DEMO_ROOT_MERKLE_HASH);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  async function verifyEvidence(event) {
    event.preventDefault();
    const hash = verifyHash.trim();
    if (!hash) return;

    setVerifyLoading(true);
    setVerifyResult(null);

    try {
      const response = await saareFetch(`/v1/verify/${encodeURIComponent(hash)}`);
      const data = await response.json();

      if (!response.ok || data?.status !== "VERIFIED") {
        setVerifyResult({
          status: "UNVERIFIED",
          hash,
          message: data?.message || "La evidencia no ha podido verificarse con el trust anchor disponible.",
        });
        return;
      }

      setVerifyResult({
        status: "VERIFIED",
        hash,
        timestamp: data.timestamp || null,
        standard: data.standard || "RFC 3161",
        merkleRoot: data.merkleRoot || hash,
        algorithm: data.algorithm || "Ed25519 / SHA-256",
      });
    } catch (error) {
      setVerifyResult({
        status: "UNVERIFIED",
        hash,
        message: "El servicio de verificación no está disponible. No se presenta esta evidencia como verificada.",
      });
    } finally {
      setVerifyLoading(false);
    }
  }

  function runDemoJudge() {
    setDemoLoading(true);
    setDemoResult(null);
    window.setTimeout(() => {
      setDemoResult({
        mode: "DEMO",
        verdict: "DENY",
        agentId: "treasury-agent-04",
        action: "send_payment",
        resource: "core-banking-api://transfers",
        policy: "FIN-PAYMENT-042 / v17",
        reason: "La acción excede el umbral de autorización configurado.",
      });
      setDemoLoading(false);
    }, 450);
  }

  return (
    <main>
      <section className="relative overflow-hidden border-b border-saare-line bg-[#020617]">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#23304418_1px,transparent_1px),linear-gradient(to_bottom,#23304418_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <SectionLabel>AI EXECUTION AUTHORIZATION</SectionLabel>
              <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-[4.6rem] leading-[0.98] tracking-tight text-white mt-4 max-w-4xl">
                Sus agentes de IA actúan. <span className="text-saare-accent">S.A.A.R.E. decide antes.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-saare-ink-dim">
                Infraestructura de autorización y control de ejecución para agentes autónomos: cada acción se evalúa ex-ante antes de llegar al sistema que puede ejecutarla.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  to="/trial"
                  className="inline-flex min-h-12 justify-center items-center px-6 py-4 bg-saare-allow text-black font-bold text-xs rounded hover:opacity-90 transition"
                >
                  BLOQUEAR UN AGENTE EN 60 SEGUNDOS
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 justify-center items-center px-6 py-4 border border-saare-line-hi text-white font-bold text-xs rounded hover:bg-saare-surface transition"
                >
                  SOLICITAR PROPUESTA ENTERPRISE
                </a>
              </div>
              <div className="mt-4 font-mono text-[10px] text-saare-ink-faint">
                sin coste · sin permanencia · su VPC o entorno air-gapped
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <VerdictPanel />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Marcos y mecanismos" className="border-b border-saare-line bg-saare-surface">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["MARCO", "EU AI ACT"],
              ["MARCO", "DORA"],
              ["SELLADO", "RFC 3161"],
              ["FIRMA", "Ed25519"],
            ].map(([kind, value]) => (
              <a
                key={value}
                href="#evidence"
                className="bg-saare-bg border border-saare-line rounded p-3 font-mono text-[10px] tracking-wider text-center hover:border-saare-accent transition"
              >
                <span className="text-saare-accent mr-2">[{kind}]</span>
                {value}
              </a>
            ))}
          </div>
        </div>
      </section>

      <Section id="problema" label="01 · EL PROBLEMA" title="El riesgo no es lo que el agente sabe. Es lo que puede ejecutar.">
        <div className="grid md:grid-cols-3 gap-5">
          <ProblemCard number="01" title="Autonomía" text="Un agente puede pasar de generar una recomendación a ejecutar una acción sobre un sistema real." />
          <ProblemCard number="02" title="Mutación" text="El riesgo aparece cuando la acción modifica dinero, datos, permisos, registros o sistemas corporativos." />
          <ProblemCard number="03" title="Control" text="La autorización debe producirse antes de la mutación y debe ser explícita, auditable y revocable." />
        </div>
      </Section>

      <section className="border-y border-saare-line bg-saare-surface">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24">
          <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center">
            <div>
              <SectionLabel>02 · PRUEBA SIN INFRAESTRUCTURA</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4">
                Prueba el control antes de desplegarlo.
              </h2>
              <p className="mt-5 text-saare-ink-dim leading-relaxed max-w-xl">
                La demostración local permite ver la mecánica del veredicto sin inventar credenciales, sin registrar secretos en el navegador y sin presentar una simulación como evidencia real.
              </p>
              <button
                type="button"
                onClick={runDemoJudge}
                disabled={demoLoading}
                className="inline-flex min-h-12 mt-7 px-6 py-3 bg-saare-allow text-black font-bold text-xs rounded disabled:opacity-60"
              >
                {demoLoading ? "EVALUANDO…" : "EJECUTAR DEMO DE CONTROL"}
              </button>
            </div>

            <div className="bg-saare-bg border border-saare-line-hi rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-saare-line font-mono text-[10px]">
                <span className="text-saare-ink-dim">$ saare judge --simulate</span>
                <span className="text-saare-seal">MODO DEMO</span>
              </div>
              <div className="p-6 font-mono text-xs">
                <DemoTerminal result={demoResult} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="decision" label="03 · CÓMO DECIDE" title="Siete dimensiones antes de cada acción." description="La decisión se construye con contexto, política y riesgo. El sistema responde con un estado operativo explícito.">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DIMENSIONS.map(([number, title, description]) => (
            <div key={number} className="bg-saare-surface border border-saare-line p-4 rounded">
              <div className="font-mono text-[10px] text-saare-accent">DIM {number}</div>
              <div className="font-bold text-white text-sm mt-3">{title}</div>
              <div className="text-[10px] text-saare-ink-faint mt-2 leading-relaxed">{description}</div>
            </div>
          ))}
        </div>
      </Section>

      <section className="border-y border-saare-line bg-saare-surface" id="architecture">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24">
          <SectionLabel>04 · FLUJO DE EJECUCIÓN</SectionLabel>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4 max-w-4xl">
            Si no existe permiso, no existe ejecución.
          </h2>
          <div className="grid md:grid-cols-5 gap-3 mt-12">
            {["AGENTE", "INTERCEPTOR L7", "MOTOR DE DECISIÓN", "EXECUTION PERMIT", "RECURSO"].map((item, index) => (
              <div key={item} className="relative">
                <div className="h-full bg-saare-bg border border-saare-line p-5 rounded">
                  <div className="font-mono text-[10px] text-saare-accent">0{index + 1}</div>
                  <div className="font-bold text-white mt-3">{item}</div>
                </div>
                {index < 4 ? <div className="hidden md:block absolute right-[-9px] top-1/2 text-saare-accent">→</div> : null}
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-8">
            <VerdictCard label="ALLOW" description="Se emite un permiso de ejecución." tone="allow" />
            <VerdictCard label="REVIEW" description="La acción requiere intervención humana." tone="review" />
            <VerdictCard label="DENY" description="La acción no obtiene permiso." tone="deny" />
          </div>
        </div>
      </section>

      <Section id="payload" label="05 · PAYLOAD Y DECISIÓN" title="La política decide sobre la acción, no sobre una opinión del modelo.">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <CodePanel />
          <div className="bg-saare-surface border border-saare-line rounded-lg p-6">
            <div className="font-mono text-[10px] text-saare-accent">EXECUTION PERMIT</div>
            <div className="mt-5 space-y-3 font-mono text-xs">
              <DataRow label="AGENT" value="treasury-agent-04" />
              <DataRow label="ACTION" value="send_payment" />
              <DataRow label="RESOURCE" value="core-banking-api://transfers" />
              <DataRow label="POLICY" value="FIN-PAYMENT-042 / v17" />
              <DataRow label="SCOPE" value="SEPA / ≤ 10.000 EUR" />
              <DataRow label="EXPIRATION" value="2026-09-20T22:31:00Z" />
              <DataRow label="PAYLOAD DIGEST" value="sha256:7f3a9b…" />
              <DataRow label="SIGNATURE" value="ed25519:4a92c1…" />
            </div>
          </div>
        </div>
      </Section>

      <section className="border-y border-saare-line bg-saare-surface">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24">
          <SectionLabel>06 · CONTENCIÓN</SectionLabel>
          <div className="grid lg:grid-cols-3 gap-5">
            <InfoCard title="Síncrono en L7" text="La evaluación ocurre en el punto de ejecución antes de que el recurso reciba la operación." />
            <InfoCard title="Fail-Closed" text="La política define el comportamiento seguro cuando el plano remoto no está disponible." />
            <InfoCard title="Estado de política firmado" text="El nodo puede trabajar con estado local firmado para mantener capacidad de decisión y continuidad." />
          </div>
        </div>
      </section>

      <Section id="consolas" label="07 · TRES CONSOLAS" title="Un mismo nodo. Tres superficies operativas.">
        <div className="grid lg:grid-cols-3 gap-5">
          <ConsoleSurface title="EXECUTIVE" audience="Dirección / Consejo" accent="EXECUTIVE" items={["Riesgo operativo", "Visibilidad de exposición", "Continuidad", "Impacto económico"]} />
          <ConsoleSurface title="GRC_AUDIT" audience="CISO / DPO / Auditoría" accent="GRC" items={["Matriz de controles", "Trazabilidad", "Evidence Vault", "Exportación"]} />
          <ConsoleSurface title="CYBER_RESILIENCE" audience="SOC / SecOps" accent="CYBER" items={["Intercepción L7", "Reglas deterministas", "Shadow AI", "Fail-Closed"]} />
        </div>
      </Section>

      <section className="border-y border-saare-line bg-saare-surface" id="evidence">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24">
          <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-start">
            <div>
              <SectionLabel>08 · FORENSE</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4">
                Evidencia digital verificable, no una captura de pantalla.
              </h2>
              <p className="mt-5 text-saare-ink-dim leading-relaxed">
                La custodia puede asociar cada decisión a un digest, una estructura Merkle, una firma Ed25519 y un sellado temporal RFC 3161, según la configuración contratada y el despliegue del cliente.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 mt-7 items-center px-6 py-3 border border-saare-line-hi text-white font-bold text-xs rounded"
              >
                SOLICITAR DOSSIER FORENSE
              </a>
            </div>
            <EvidenceChain />
          </div>
        </div>
      </section>

      <Section id="matrix" label="09 · MATRIZ DE CONTROL" title="Relaciona cada control con la evidencia que realmente produce.">
        <div className="overflow-x-auto border border-saare-line rounded-lg">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead className="bg-saare-surface">
              <tr className="border-b border-saare-line">
                <th className="p-4 font-mono text-[10px] text-saare-ink-dim">MARCO</th>
                <th className="p-4 font-mono text-[10px] text-saare-ink-dim">CONTROL RELACIONADO</th>
                <th className="p-4 font-mono text-[10px] text-saare-ink-dim">MECANISMO</th>
                <th className="p-4 font-mono text-[10px] text-saare-ink-dim">EVIDENCIA</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["EU AI Act", "Gestión y trazabilidad de sistemas", "Política + decisión", "Registro de veredictos / control de acceso"],
                ["DORA", "Resiliencia y continuidad", "Fail-Closed + estado local firmado", "Estado de nodo y políticas"],
                ["RGPD", "Seguridad y minimización", "Procesamiento en perímetro definido", "Digest / metadatos / evidencia de control"],
                ["RFC 3161", "Sellado temporal", "TSA + cadena de evidencia", "Timestamp verificable"],
              ].map(([framework, control, mechanism, evidence]) => (
                <tr key={framework} className="border-b border-saare-line last:border-0">
                  <td className="p-4 text-white font-mono">{framework}</td>
                  <td className="p-4 text-saare-ink-dim">{control}</td>
                  <td className="p-4 text-saare-ink-dim">{mechanism}</td>
                  <td className="p-4 text-saare-ink-dim">{evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-saare-ink-faint">
          La relación con un marco regulatorio no constituye por sí misma certificación ni garantía de cumplimiento. La aplicabilidad depende del alcance, configuración y controles del cliente.
        </p>
      </Section>

      <Section id="verificador" label="10 · PUBLIC TRUST ANCHOR" title="Verifica una evidencia con el estado real del sistema.">
        <form onSubmit={verifyEvidence} className="max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={verifyHash}
              onChange={(event) => setVerifyHash(event.target.value)}
              placeholder="Merkle Root o identificador"
              aria-label="Merkle Root o identificador"
              className="flex-1 min-h-12 bg-saare-bg border border-saare-line-hi px-4 py-3 rounded text-white font-mono text-xs focus:outline-none focus:border-saare-seal"
              disabled={verifyLoading}
            />
            <button
              type="submit"
              disabled={verifyLoading}
              className="min-h-12 px-6 bg-saare-allow text-black font-bold text-xs rounded disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verifyLoading ? "VERIFICANDO…" : "VERIFICAR EVIDENCIA"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <VerificationResult result={verifyResult} />
        </div>
      </Section>

      <section className="border-y border-saare-line bg-saare-surface">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <SectionLabel>11 · CONTINUIDAD</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4">
                La caída de una dependencia no debe convertirse en permiso implícito.
              </h2>
              <p className="mt-5 text-saare-ink-dim leading-relaxed">
                Fail-Closed, políticas firmadas y despliegues privados permiten mantener el control cuando la conectividad externa falla o cuando la organización exige aislamiento.
              </p>
            </div>
            <div className="bg-saare-bg border border-saare-line rounded-lg p-6 font-mono text-xs">
              <div className="text-saare-accent mb-5">OFFLINE / FAIL-CLOSED</div>
              <DataRow label="POLICY STATE" value="SIGNED / LOCAL" />
              <DataRow label="NETWORK" value="DISCONNECTED" />
              <DataRow label="DECISION" value="LOCAL POLICY" />
              <DataRow label="UNKNOWN ACTION" value="REVIEW / DENY" />
              <DataRow label="PAYLOAD PERSISTENCE" value="NODE-CONFIG DEPENDENT" />
            </div>
          </div>
        </div>
      </section>

      <Section id="integracion" label="12 · INTEGRACIÓN" title="Cuatro vías de integración. Un mismo plano de autorización.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <IntegrationCard title="SDK NATIVO" code="@saare/judge" text="Para desarrolladores que invocan la autorización desde el código de la aplicación." />
          <IntegrationCard title="REST INTERCEPTOR" code="/v1/judge · /v1/intercept" text="Para orquestadores de agentes y arquitecturas que ya trabajan con HTTP." />
          <IntegrationCard title="SIDECAR" code="Docker / Kubernetes" text="Para desplegar el punto de decisión dentro de la VPC o en una arquitectura air-gapped." />
          <IntegrationCard title="SENSOR L7" code="Extension / Gateway" text="Para intercepción perimetral cuando no es viable modificar la aplicación existente." />
        </div>
      </Section>

      <section className="border-y border-saare-line bg-saare-surface" id="pricing">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24">
          <SectionLabel>13 · MODELO COMERCIAL</SectionLabel>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4">
            Cuatro familias de ingreso. No cinco productos desconectados.
          </h2>
          <p className="mt-5 max-w-3xl text-saare-ink-dim">
            El nodo es la unidad de control. La custodia, la evidencia forense y el canal multi-tenant amplían el mismo sistema.
          </p>

          <div className="grid lg:grid-cols-3 gap-5 mt-12">
            {PRICING.nodes.map((plan) => (
              <PriceCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-5">
            {PRICING.services.map((service) => (
              <ServicePriceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-8 text-center font-mono text-[10px] text-saare-ink-faint">
            sin coste de alta · sin permanencia · su VPC o entorno air-gapped
          </div>
        </div>
      </section>

      <section className="border-b border-saare-line" id="enterprise-fit">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
            <div>
              <SectionLabel>14 · SECTORES Y CANAL</SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4">
                El punto de control se adapta al perímetro del cliente.
              </h2>
              <p className="mt-5 text-saare-ink-dim leading-relaxed">
                Banca, seguros, salud, industria, energía, administración y SaaS pueden aplicar políticas distintas sobre los mismos siete ejes de autorización.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {["BANCA", "SEGUROS", "SALUD", "INDUSTRIA", "ENERGÍA", "SaaS B2B"].map((sector) => (
                  <div key={sector} className="bg-saare-surface border border-saare-line rounded p-4 font-mono text-[10px] text-saare-ink-dim">
                    {sector}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-saare-surface border border-saare-line rounded-lg p-7">
              <div className="font-mono text-[10px] text-saare-seal">CANAL MULTI-TENANT</div>
              <h3 className="font-display font-bold text-2xl text-white mt-4">Un partner. Múltiples organizaciones.</h3>
              <p className="mt-4 text-sm leading-relaxed text-saare-ink-dim">
                Panel centralizado para partners, consultoras e integradores que gestionan varios clientes y necesitan separar políticas, evidencia y consumo por tenant.
              </p>
              <div className="mt-6 space-y-3">
                <Row label="MODELO" value="Multi-tenant" />
                <Row label="PRECIO" value="Desde 450 €/cliente/año" />
                <Row label="USO" value="Partners e integradores" />
                <Row label="FINANCIACIÓN" value="Sujeta a convocatoria y elegibilidad" />
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 mt-7 items-center px-6 py-3 bg-saare-allow text-black font-bold text-xs rounded"
              >
                HABLAR CON CANAL
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-saare-line bg-[#020617]" id="trial-inline">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-20 lg:py-28">
          <div className="text-center">
            <SectionLabel>15 · CUALIFICACIÓN</SectionLabel>
            <h2 className="font-display font-bold text-4xl sm:text-6xl text-white mt-5">
              Someta un agente al plano de control.
            </h2>
            <p className="mt-6 text-saare-ink-dim max-w-2xl mx-auto">
              El formulario sólo pide lo necesario para definir el alcance inicial: correo corporativo, organización y número de agentes autónomos en producción.
            </p>
          </div>

          <TrialForm />
        </div>
      </section>
    </main>
  );
}

function SoftwarePage() {
  useSEO("software");
  return (
    <PageLayout label="SOFTWARE · CONTROL DE EJECUCIÓN" title="Autoriza la acción antes de que llegue al sistema." description="S.A.A.R.E. intercepta la operación en el punto de ejecución y aplica una política antes de permitir que el agente modifique un recurso.">
      <ArchitectureFlow />
      <div className="grid md:grid-cols-3 gap-5 mt-12">
        <InfoCard title="Identidad" text="Cada decisión parte de una identidad de agente y del contexto de autorización correspondiente." />
        <InfoCard title="Política" text="La acción se evalúa contra una regla concreta y versionada." />
        <InfoCard title="Permiso" text="Cuando corresponde, se emite un Execution Permit con alcance y expiración." />
      </div>
    </PageLayout>
  );
}

function SalesPage() {
  useSEO("sales");
  return (
    <PageLayout label="VENTAS · GOBIERNO COMERCIAL" title="Controla lo que los agentes pueden cambiar." description="Gobierna acciones comerciales de agentes sobre CRM, precios, descuentos, pagos y otros sistemas corporativos.">
      <div className="grid md:grid-cols-3 gap-5">
        <InfoCard title="Precios" text="Define qué cambios de precio puede ejecutar un agente y bajo qué condiciones." />
        <InfoCard title="CRM" text="Aplica políticas antes de mutaciones sobre datos comerciales." />
        <InfoCard title="Pagos" text="Controla acciones financieras que requieren autorización adicional." />
      </div>
      <section className="mt-20">
        <SectionTitle>Gobierno comercial ex-ante</SectionTitle>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <ConsoleSurface title="PRICING" audience="Pricing / Revenue Ops" accent="SALES" items={["Descuentos", "Cambios de tarifa", "Umbrales", "Review"]} />
          <ConsoleSurface title="CRM" audience="Ventas / Operaciones" accent="SALES" items={["Mutaciones", "Campos sensibles", "Scope", "Audit"]} />
          <ConsoleSurface title="PAYMENTS" audience="Finanzas" accent="SALES" items={["Importes", "Beneficiarios", "Aprobación", "Deny"]} />
        </div>
      </section>
    </PageLayout>
  );
}

function GRCPage() {
  useSEO("grc");
  return (
    <PageLayout label="GRC · AUDITORÍA Y EVIDENCIA" title="De la decisión a una evidencia verificable." description="Relaciona el veredicto, el digest, la cadena Merkle, la firma y el sellado temporal con una política concreta.">
      <EvidenceChain />
      <section className="mt-16">
        <SectionTitle>Matriz de control y evidencia</SectionTitle>
        <div className="mt-8">
          <ConsoleSurface title="GRC_AUDIT" audience="CISO / DPO / Auditoría" accent="GRC" items={["Matriz de controles", "Trazabilidad", "Evidence Vault", "Exportación"]} />
        </div>
      </section>
    </PageLayout>
  );
}

function DevelopersPage() {
  useSEO("developers");
  return (
    <PageLayout label="DESARROLLADORES · SDK Y API" title="Integra autorización en el lugar donde ocurre la acción." description="Usa SDK nativo, REST, sidecar o intercepción L7 sin depender de una segunda llamada a un modelo para decidir.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <IntegrationCard title="SDK NATIVO" code="@saare/judge" text="Autorización desde el código fuente." />
        <IntegrationCard title="REST" code="/v1/judge" text="Integra agentes y orquestadores vía HTTP." />
        <IntegrationCard title="SIDECAR" code="Docker / K8s" text="Despliegue dentro del perímetro del cliente." />
        <IntegrationCard title="L7" code="Gateway / Sensor" text="Control perimetral para legacy y tráfico corporativo." />
      </div>
      <div className="mt-10"><CodePanel /></div>
    </PageLayout>
  );
}

function ForensicPage() {
  useSEO("grc");
  return (
    <PageLayout
      label="FORENSE · EVIDENCE VAULT"
      title="Cada decisión importante puede convertirse en evidencia verificable."
      description="Aísla la custodia forense de la decisión runtime y construye paquetes verificables con digest, Merkle, firma Ed25519 y sellado temporal RFC 3161 según la configuración desplegada."
    >
      <EvidenceChain />
      <div className="grid md:grid-cols-3 gap-5 mt-12">
        <InfoCard title="Blind Vault" text="Custodia separada del nodo de decisión para conservar el material de evidencia según la arquitectura del cliente." />
        <InfoCard title="Verificación independiente" text="Permite comprobar una cadena de evidencia sin depender de la interfaz operativa diaria." />
        <InfoCard title="Exportación" text="Genera paquetes documentales verificables para auditoría, investigación y revisión técnica." />
      </div>
    </PageLayout>
  );
}

function ProxyPage() {
  useSEO("software");
  return (
    <PageLayout
      label="PROXY · PERIMETERSHIELD"
      title="Control L7 antes de que el tráfico llegue al exterior."
      description="Gateway o sidecar para interceptar las llamadas de agentes y servicios de IA en el perímetro de la VPC, Kubernetes o red privada."
    >
      <ArchitectureFlow />
      <div className="grid md:grid-cols-3 gap-5 mt-12">
        <InfoCard title="Intercepción L7" text="Coloca el control en la ruta de ejecución, antes de alcanzar el recurso protegido." />
        <InfoCard title="Política" text="Evalúa identidad, acción, contexto, recurso, datos, riesgo y política antes de permitir la operación." />
        <InfoCard title="Fail-Closed" text="Define el comportamiento cuando el plano de decisión o la sincronización de políticas no están disponibles." />
      </div>
      <div className="mt-10">
        <IntegrationCard title="DEPLOY" code="Docker / Kubernetes" text="Despliegue en VPC privada, sidecar o gateway perimetral." />
      </div>
    </PageLayout>
  );
}

function DaemonPage() {
  useSEO("enterprise");
  return (
    <PageLayout
      label="DAEMON · ON-PREMISE / AIR-GAPPED"
      title="El plano de decisión también puede vivir en la infraestructura local."
      description="Servicio local para proteger LLMs privados, aplicaciones legacy y entornos aislados donde el despliegue externo no es una opción."
    >
      <div className="grid md:grid-cols-2 gap-5">
        <InfoCard title="LLMs locales" text="Protege servicios internos de IA desplegados sobre la infraestructura del cliente." />
        <InfoCard title="Legacy" text="Intercepción local para aplicaciones donde no resulta viable modificar el código fuente." />
        <InfoCard title="Air-gapped" text="Opera con políticas locales firmadas en redes sin conectividad externa, según el modelo de despliegue." />
        <InfoCard title="Claves del cliente" text="Integra la gestión criptográfica con los mecanismos definidos por la organización." />
      </div>
      <section className="mt-16">
        <SectionTitle>Arquitectura soberana</SectionTitle>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <ConsoleSurface title="DECISION NODE" audience="Runtime" accent="CYBER" items={["Policy", "Verdict", "Permit", "Fail-Closed"]} />
          <ConsoleSurface title="CONTROL-PLANE" audience="Operación" accent="GRC" items={["Licencia", "Políticas", "Contadores", "Estado"]} />
          <ConsoleSurface title="LOCAL INFRA" audience="Cliente" accent="EXECUTIVE" items={["VPC", "On-prem", "HSM", "Air-gapped"]} />
        </div>
      </section>
    </PageLayout>
  );
}

function EnterprisePage() {
  useSEO("enterprise");
  return (
    <PageLayout label="EMPRESA · DESPLIEGUE SOBERANO" title="El plano de decisión bajo su control." description="Despliega S.A.A.R.E. en VPC, infraestructura privada, on-premise, Kubernetes o entornos air-gapped.">
      <div className="grid md:grid-cols-2 gap-5">
        <InfoCard title="VPC privada" text="Ejecute el nodo de decisión dentro del perímetro de infraestructura de su organización." />
        <InfoCard title="On-premise" text="Mantenga el plano de control bajo gestión interna." />
        <InfoCard title="Air-gapped" text="Use políticas locales firmadas cuando no existe conectividad externa." />
        <InfoCard title="HSM / claves del cliente" text="Integre la custodia criptográfica con la infraestructura de claves definida por la organización." />
      </div>
      <section className="mt-16">
        <SectionTitle>Tres superficies operativas</SectionTitle>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <ConsoleSurface title="EXECUTIVE" audience="Dirección / Consejo" accent="EXECUTIVE" items={["Riesgo", "ROI", "Continuidad", "Visibilidad"]} />
          <ConsoleSurface title="GRC_AUDIT" audience="CISO / DPO" accent="GRC" items={["Controles", "Evidencia", "Auditoría", "Export"]} />
          <ConsoleSurface title="CYBER_RESILIENCE" audience="SOC / SecOps" accent="CYBER" items={["L7", "Shadow AI", "Fail-Closed", "Policy"]} />
        </div>
      </section>
      <div className="mt-12">
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center px-6 py-4 bg-saare-allow text-black font-bold text-xs rounded">
          SOLICITAR REVISIÓN DE ARQUITECTURA
        </a>
      </div>
    </PageLayout>
  );
}

function TrialPage() {
  useSEO("trial");
  return (
    <PageLayout label="PRUEBA DE CONTROL" title="Someta un agente al plano de control." description="Inicie una evaluación con una cualificación mínima. La sesión y cualquier secreto real deben generarse en backend.">
      <TrialForm />
    </PageLayout>
  );
}

function TrialForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [agents, setAgents] = useState(1);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const enterprise = Number(agents) > 10;

  const invalidFreeMail = useMemo(() => {
    const value = email.trim().toLowerCase();
    if (!value || !value.includes("@")) return false;
    const domain = value.split("@")[1];
    return ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"].includes(domain);
  }, [email]);

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (invalidFreeMail) {
      setStatus("error");
      setMessage("Usa un correo corporativo para esta evaluación.");
      return;
    }

    if (!email.trim() || !company.trim() || Number(agents) < 1) {
      setStatus("error");
      setMessage("Completa los tres campos requeridos.");
      return;
    }

    if (enterprise) {
      const text = encodeURIComponent(
        `Solicito revisión Enterprise S.A.A.R.E. · Organización: ${company.trim()} · Agentes en producción: ${agents} · Correo: ${email.trim()}`
      );
      window.open(`https://wa.me/34633886506?text=${text}`, "_blank", "noopener,noreferrer");
      setStatus("idle");
      return;
    }

    try {
      const response = await saareFetch("/v1/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          organization: company.trim(),
          agentsInProduction: Number(agents),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      setStatus("success");
      setMessage(data?.message || "Solicitud recibida. El entorno se prepara desde backend.");
    } catch (error) {
      setStatus("error");
      setMessage("No se ha podido registrar la solicitud desde el backend. No se ha creado ninguna credencial en el navegador.");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto bg-saare-surface border border-saare-allow rounded-lg p-8">
        <div className="font-mono text-xs text-saare-allow font-bold">SOLICITUD RECIBIDA</div>
        <h3 className="font-display text-2xl font-bold text-white mt-4">El siguiente paso ocurre en backend.</h3>
        <p className="mt-4 text-saare-ink-dim text-sm leading-relaxed">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-3xl mx-auto bg-saare-surface border border-saare-line-hi rounded-lg p-6 sm:p-8">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="CORREO CORPORATIVO" type="email" value={email} onChange={setEmail} placeholder="ciso@empresa.com" required />
        <FormField label="ORGANIZACIÓN" value={company} onChange={setCompany} placeholder="Empresa" required />
      </div>

      <div className="mt-5">
        <label className="block font-mono text-[10px] text-saare-ink-dim mb-2" htmlFor="agents">
          AGENTES AUTÓNOMOS EN PRODUCCIÓN
        </label>
        <input
          id="agents"
          type="number"
          min="1"
          step="1"
          value={agents}
          onChange={(event) => setAgents(event.target.value)}
          className="w-full bg-saare-bg border border-saare-line-hi px-4 py-3 rounded text-white text-sm focus:outline-none focus:border-saare-accent"
          required
        />
        <div className="mt-2 font-mono text-[10px] text-saare-ink-faint">
          Más de 10 agentes → cualificación Enterprise.
        </div>
      </div>

      {message ? (
        <div className={`mt-5 text-xs font-mono ${status === "error" ? "text-saare-deny" : "text-saare-ink-dim"}`}>
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full min-h-12 mt-6 py-4 bg-saare-allow text-black font-bold text-xs rounded disabled:opacity-60"
      >
        {status === "loading" ? "PROCESANDO…" : enterprise ? "SOLICITAR DESPLIEGUE ENTERPRISE" : "INICIAR PRUEBA DE CONTROL"}
      </button>

      <div className="mt-4 text-center font-mono text-[10px] text-saare-ink-faint">
        sin coste · sin permanencia · su VPC o entorno air-gapped
      </div>
    </form>
  );
}

function PageLayout({ label, title, description, children }) {
  return (
    <main>
      <section className="border-b border-saare-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-28">
          <SectionLabel>{label}</SectionLabel>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-white tracking-tight leading-tight mt-5 max-w-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base sm:text-lg text-saare-ink-dim leading-relaxed">
            {description}
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-20">{children}</div>
    </main>
  );
}

function Section({ id, label, title, description, children }) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-5 sm:px-6 py-20 lg:py-24 scroll-mt-28">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mt-4 max-w-5xl">{title}</h2>
      {description ? <p className="mt-5 max-w-3xl text-saare-ink-dim leading-relaxed">{description}</p> : null}
      <div className="mt-12">{children}</div>
    </section>
  );
}

function SectionLabel({ children }) {
  return <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-saare-accent uppercase">{children}</div>;
}

function SectionTitle({ children }) {
  return <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">{children}</h2>;
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 border-b border-saare-line pb-3">
      <span className="font-mono text-[10px] text-saare-ink-faint">{label}</span>
      <span className="font-mono text-xs text-white text-right">{value}</span>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 border-b border-saare-line pb-3">
      <span className="w-36 shrink-0 text-saare-ink-faint">{label}</span>
      <span className="text-white break-all">{value}</span>
    </div>
  );
}

function VerdictPanel() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-saare-deny/5 blur-3xl pointer-events-none" />
      <div className="relative bg-[#020617] border border-saare-seal/50 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-saare-line">
          <span className="font-mono text-[10px] text-saare-ink-dim">S.A.A.R.E. / DECISION NODE</span>
          <span className="font-mono text-[10px] text-saare-seal">DEMO / DATA RENDERED</span>
        </div>
        <div className="p-5 sm:p-6 font-mono">
          <div className="flex items-center justify-between mb-7">
            <span className="text-[10px] text-saare-ink-dim">VEREDICTO</span>
            <span className="px-4 py-2 border border-saare-deny bg-saare-deny/10 text-saare-deny font-bold text-sm rounded">DENY</span>
          </div>
          <div className="space-y-3 text-xs">
            <DataRow label="AGENT" value="treasury-agent-04" />
            <DataRow label="ACTION" value="send_payment" />
            <DataRow label="RESOURCE" value="core-banking-api://transfers" />
            <DataRow label="POLICY" value="FIN-PAYMENT-042 / v17" />
            <DataRow label="RISK" value="HIGH" />
            <DataRow label="PERMIT" value="NOT_ISSUED" />
          </div>
          <div className="mt-7 pt-5 border-t border-saare-line">
            <div className="text-[9px] text-saare-ink-faint mb-2">PAYLOAD DIGEST</div>
            <div className="text-[10px] text-saare-accent break-all">sha256:7f3a9b4f1c…</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="L7" value="SYNC" />
            <Metric label="POLICY STATE" value="SIGNED" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-saare-surface border border-saare-line rounded p-3">
      <div className="font-mono text-[9px] text-saare-ink-faint">{label}</div>
      <div className="font-mono text-xs text-white mt-1">{value}</div>
    </div>
  );
}

function DemoTerminal({ result }) {
  if (!result) {
    return (
      <div className="space-y-3 text-saare-ink-dim">
        <div>agent: <span className="text-white">treasury-agent-04</span></div>
        <div>action: <span className="text-white">send_payment</span></div>
        <div>risk: <span className="text-saare-deny">HIGH</span></div>
        <div className="mt-5 pt-5 border-t border-saare-line">Haz clic para ejecutar una decisión simulada.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-saare-ink-faint">source: <span className="text-saare-seal">{result.mode}</span></div>
      <DataRow label="AGENT" value={result.agentId} />
      <DataRow label="ACTION" value={result.action} />
      <DataRow label="RESOURCE" value={result.resource} />
      <DataRow label="POLICY" value={result.policy} />
      <div className="pt-4 mt-2 border-t border-saare-line">
        <span className="text-saare-ink-faint">VERDICT</span>
        <span className="ml-3 text-saare-deny font-bold">{result.verdict}</span>
      </div>
      <div className="text-saare-ink-dim pt-2">{result.reason}</div>
    </div>
  );
}

function ProblemCard({ number, title, text }) {
  return (
    <div className="bg-saare-surface border border-saare-line p-6 rounded-lg">
      <div className="font-mono text-[10px] text-saare-accent">{number}</div>
      <h3 className="font-bold text-white text-lg mt-5">{title}</h3>
      <p className="mt-3 text-sm text-saare-ink-dim leading-relaxed">{text}</p>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="bg-saare-surface border border-saare-line p-7 rounded-lg">
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="mt-3 text-sm text-saare-ink-dim leading-relaxed">{text}</p>
    </div>
  );
}

function VerdictCard({ label, description, tone }) {
  const styles = {
    allow: "text-saare-allow border-saare-allow/30",
    review: "text-saare-seal border-saare-seal/30",
    deny: "text-saare-deny border-saare-deny/30",
  };
  return (
    <div className={`border bg-saare-bg p-5 rounded ${styles[tone] || styles.deny}`}>
      <div className="font-mono text-sm font-bold">{label}</div>
      <div className="mt-2 text-xs text-saare-ink-dim">{description}</div>
    </div>
  );
}

function ArchitectureFlow() {
  return (
    <div className="grid md:grid-cols-5 gap-3">
      {[
        ["01", "AGENTE"],
        ["02", "L7"],
        ["03", "POLÍTICA"],
        ["04", "VEREDICTO"],
        ["05", "RECURSO"],
      ].map(([number, title]) => (
        <div key={number} className="bg-saare-surface border border-saare-line p-6 rounded">
          <div className="font-mono text-[10px] text-saare-accent">{number}</div>
          <div className="font-bold text-white mt-4">{title}</div>
        </div>
      ))}
    </div>
  );
}

function CodePanel() {
  const code = `import { SaareJudge } from "@saare/judge";

const saare = new SaareJudge({
  failPolicy: "FAIL_CLOSED"
});

const permit = await saare.authorize({
  agentId: "treasury-agent-01",
  action: "MUTATE_DATABASE",
  resource: "core-banking-api://transfers"
});

if (permit.verdict === "ALLOW") {
  await executeAction(permit);
}`;

  return (
    <pre className="bg-[#020617] border border-saare-line rounded-lg p-6 overflow-x-auto text-xs leading-relaxed font-mono text-saare-ink-dim">
      <code>{code}</code>
    </pre>
  );
}

function ConsoleSurface({ title, audience, accent, items }) {
  return (
    <div className="bg-saare-surface border border-saare-line rounded-lg p-6">
      <div className="font-mono text-[10px] text-saare-accent">CONTROL SURFACE · {accent}</div>
      <h3 className="font-display font-bold text-2xl text-white mt-4">{title}</h3>
      <p className="text-xs text-saare-ink-dim mt-2">{audience}</p>
      <div className="mt-6 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 bg-saare-bg border border-saare-line rounded px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-saare-accent" />
            <span className="text-xs text-white">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceChain() {
  const stages = [
    "VEREDICTO",
    "SHA-256 DIGEST",
    "MERKLE TREE",
    "ED25519 SIGNATURE",
    "RFC 3161 TIMESTAMP",
    "EVIDENCIA EXPORTABLE",
  ];

  return (
    <div className="space-y-2">
      {stages.map((item, index) => (
        <div key={item} className="flex items-center gap-4 bg-saare-bg border border-saare-line p-4 rounded">
          <span className="font-mono text-[10px] text-saare-seal">0{index + 1}</span>
          <span className="font-mono text-xs text-white">{item}</span>
          {index < stages.length - 1 ? <span className="ml-auto text-saare-ink-faint">↓</span> : <span className="ml-auto text-saare-allow">READY</span>}
        </div>
      ))}
    </div>
  );
}

function VerificationResult({ result }) {
  if (!result) {
    return (
      <div className="bg-saare-surface border border-saare-line rounded-lg p-6 font-mono text-xs text-saare-ink-faint">
        Introduce un Merkle Root o un identificador para consultar el estado real de la evidencia.
      </div>
    );
  }

  const verified = result.status === "VERIFIED";
  return (
    <div className={`bg-saare-surface border rounded-lg p-6 ${verified ? "border-saare-allow" : "border-saare-deny"}`}>
      <div className={`font-mono text-xs font-bold ${verified ? "text-saare-allow" : "text-saare-deny"}`}>
        {result.status}
      </div>
      <div className="mt-4 space-y-3 font-mono text-xs">
        <DataRow label="HASH" value={result.hash} />
        {verified ? <DataRow label="MERKLE ROOT" value={result.merkleRoot} /> : null}
        {verified ? <DataRow label="TIMESTAMP" value={result.timestamp || "No informado por el servicio"} /> : null}
        {verified ? <DataRow label="STANDARD" value={result.standard} /> : null}
        {verified ? <DataRow label="ALGORITHM" value={result.algorithm} /> : null}
      </div>
      {!verified ? <div className="mt-4 text-xs text-saare-deny">{result.message}</div> : null}
    </div>
  );
}

function IntegrationCard({ title, code, text }) {
  return (
    <div className="bg-saare-surface border border-saare-line p-6 rounded-lg hover:border-saare-accent transition">
      <div className="font-mono text-[10px] text-saare-accent">{title}</div>
      <div className="font-mono text-sm text-white mt-4 break-all">{code}</div>
      <p className="text-xs text-saare-ink-dim mt-3 leading-relaxed">{text}</p>
    </div>
  );
}

function PriceCard({ plan }) {
  return (
    <div className={`relative bg-saare-bg border rounded-lg p-7 ${plan.featured ? "border-saare-accent" : "border-saare-line"}`}>
      {plan.featured ? (
        <div className="absolute top-0 right-0 px-3 py-1 bg-saare-accent text-black font-mono text-[9px] font-bold rounded-bl">
          CUSTODIA
        </div>
      ) : null}
      <div className="font-mono text-xs text-saare-accent">NODO</div>
      <h3 className="text-xl font-bold text-white mt-3">{plan.name}</h3>
      <div className="mt-6">
        <span className="text-3xl font-bold text-white">{plan.price}</span>
        <span className="text-saare-ink-faint text-xs ml-2">{plan.suffix}</span>
      </div>
      <p className="text-sm text-saare-ink-dim mt-4">{plan.description}</p>
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="text-xs text-saare-ink-dim">
            <span className="text-saare-allow mr-2">✓</span>{feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ServicePriceCard({ service }) {
  return (
    <div className="bg-saare-bg border border-saare-line p-6 rounded-lg">
      <div className="font-mono text-[10px] text-saare-seal">{service.label}</div>
      <h3 className="font-bold text-white mt-3">{service.name}</h3>
      <div className="mt-4 text-xl font-bold text-white">{service.price}</div>
      <div className="text-[10px] text-saare-ink-faint">{service.suffix}</div>
      <p className="mt-4 text-xs text-saare-ink-dim">{service.description}</p>
    </div>
  );
}

function FormField({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block font-mono text-[10px] text-saare-ink-dim mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-saare-bg border border-saare-line-hi px-4 py-3 rounded text-white text-sm focus:outline-none focus:border-saare-accent"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-saare-line bg-saare-surface">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="font-display font-bold text-xl text-white">S.A.A.R.E.</div>
            <p className="mt-4 max-w-md text-xs text-saare-ink-dim leading-relaxed">
              Infraestructura de autorización y control de ejecución para agentes autónomos de IA.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] text-saare-ink-faint">PRODUCTO</div>
            <div className="mt-4 space-y-2">
              {NAV.map((item) => (
                <Link key={item.id} to={item.path} className="block text-xs text-saare-ink-dim hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-saare-ink-faint">CORPORATIVO</div>
            <div className="mt-4 space-y-2">
              <Link to="/empresa" className="block text-xs text-saare-ink-dim hover:text-white">Sobre nosotros</Link>
              <Link to="/buenas-practicas" className="block text-xs text-saare-ink-dim hover:text-white">Buenas prácticas de IA</Link>
              <Link to="/legal" className="block text-xs text-saare-ink-dim hover:text-white">Centro legal B2B</Link>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-saare-ink-faint">CONTACTO</div>
            <div className="mt-4 space-y-2 text-xs">
              <a href={`mailto:${CONTACT_EMAIL}`} className="block text-saare-ink-dim hover:text-saare-accent">{CONTACT_EMAIL}</a>
              <div className="text-saare-ink-dim">{CONTACT_PHONE}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-saare-line mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3">
          <div className="font-mono text-[10px] text-saare-ink-faint">© {new Date().getFullYear()} S.A.A.R.E. · SGP 1.0</div>
          <div className="font-mono text-[10px] text-saare-ink-faint">Evidencia digital verificable · control ex-ante · despliegue soberano</div>
        </div>
      </div>
    </footer>
  );
}

function CorporatePage({ variant }) {
  const pages = {
    empresa: {
      label: "EMPRESA",
      title: "MS3V S.A.A.R.E. SL",
      description: "Proveedor de software independiente centrado en infraestructura de autorización, gobierno runtime y evidencia digital verificable para sistemas de IA.",
    },
    "buenas-practicas": {
      label: "BUENAS PRÁCTICAS DE IA",
      title: "Contención preventiva y supervisión humana.",
      description: "Principios operativos para definir permisos, umbrales de revisión y responsabilidades sobre acciones ejecutadas por agentes.",
    },
    legal: {
      label: "CENTRO LEGAL B2B",
      title: "Documentación contractual y de privacidad.",
      description: "Espacio para políticas, DPA, SLA, seguridad, tratamiento de datos y documentación contractual aplicable al despliegue del cliente.",
    },
  };

  const page = pages[variant] || pages.empresa;
  useSEO("home");

  return (
    <PageLayout label={page.label} title={page.title} description={page.description}>
      <div className="grid md:grid-cols-2 gap-5">
        <InfoCard title="Soberanía de datos" text="El alcance de procesamiento y persistencia debe definirse según el despliegue y la configuración contractual." />
        <InfoCard title="Soberanía de políticas" text="Las reglas y versiones de política forman parte del plano de control del cliente." />
        <InfoCard title="Soberanía criptográfica" text="La gestión de claves puede integrarse con la infraestructura criptográfica definida por la organización." />
        <InfoCard title="Revisión contractual" text="Los compromisos de disponibilidad, tratamiento y evidencia deben reflejarse en documentación contractual específica." />
      </div>
    </PageLayout>
  );
}

function ScrollHandler() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <AppShell>
      <ScrollHandler />
      <Routes>
        {/* 7 pestañas principales */}
        <Route path="/" element={<Home />} />
        <Route path="/cumplimiento" element={<GRCPage />} />
        <Route path="/forense" element={<ForensicPage />} />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/sdk" element={<DevelopersPage />} />
        <Route path="/proxy" element={<ProxyPage />} />
        <Route path="/daemon" element={<DaemonPage />} />

        {/* Rutas legadas / SEO compatibles */}
        <Route path="/software" element={<ProxyPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/grc" element={<GRCPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/enterprise" element={<DaemonPage />} />
        <Route path="/trial" element={<TrialPage />} />
        <Route path="/empresa" element={<CorporatePage variant="empresa" />} />
        <Route path="/buenas-practicas" element={<CorporatePage variant="buenas-practicas" />} />
        <Route path="/legal" element={<CorporatePage variant="legal" />} />
        <Route path="/architecture" element={<ProxyPage />} />
        <Route path="/security" element={<DaemonPage />} />
        <Route path="/evidence" element={<ForensicPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
