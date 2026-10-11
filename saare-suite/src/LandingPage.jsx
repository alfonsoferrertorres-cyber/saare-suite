// saare-suite/src/LandingPage.jsx

import React, { useMemo, useState } from 'react';
import PricingSection from './components/PricingSection';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import ProofInspectorWidget from './ui/ProofInspectorWidget';
import ZeroCloudComparison from './components/ZeroCloudComparison';
import { API_HOST } from './api/api';

const consolePreviewImg = '/cabecera.png';

const NAV_ITEMS = [
  { label: 'Plataforma', href: '#platform' },
  { label: 'Arquitectura', href: '#architecture' },
  { label: 'Integración', href: '#integrations' },
  { label: 'Open Proof', href: '#proof-inspector' },
  { label: 'Precios', href: '#pricing' },
];

const REGULATORY_ITEMS = [
  {
    framework: 'EU AI Act',
    eyebrow: 'Gobernanza de IA',
    description:
      'Controles orientados a registro de eventos, gestión del riesgo y supervisión humana cuando resulten aplicables.',
    mapping: 'Requirement → Control → Decision → Evidence',
  },
  {
    framework: 'RGPD',
    eyebrow: 'Protección de datos',
    description:
      'Capacidades orientadas a minimización, protección de datos y reducción de persistencia del payload según el despliegue.',
    mapping: 'Data Policy → Runtime Control → Evidence',
  },
  {
    framework: 'ISO/IEC 42001',
    eyebrow: 'AI Management System',
    description:
      'Políticas, riesgos, controles, responsabilidades y evidencias para operacionalizar un sistema de gestión de IA.',
    mapping: 'Policy → Risk → Control → Evidence',
  },
  {
    framework: 'ISO/IEC 27001',
    eyebrow: 'Information Security',
    description:
      'Controles de seguridad, gestión de acceso, trazabilidad y evidencia operacional.',
    mapping: 'Security Control → Runtime → Audit Evidence',
  },
  {
    framework: 'NIS2',
    eyebrow: 'Cybersecurity',
    description:
      'Capacidades de apoyo a la gestión del riesgo y resiliencia de ciberseguridad cuando el marco resulte aplicable.',
    mapping: 'Risk → Control → Incident Evidence',
  },
  {
    framework: 'DORA',
    eyebrow: 'ICT Resilience',
    description:
      'Capacidades orientadas a control, trazabilidad y resiliencia TIC para entidades dentro de su ámbito.',
    mapping: 'ICT Risk → Control → Evidence',
  },
];

const INTEGRATION_ITEMS = [
  {
    key: 'sdk',
    title: 'SDK',
    description:
      'Integra S.A.A.R.E. directamente en tu aplicación y convierte decisiones de gobernanza en controles ejecutables.',
    detail: 'Ideal para ISVs y AI-native SaaS.',
  },
  {
    key: 'gateway',
    title: 'API / LLM Gateway',
    description:
      'Coloca S.A.A.R.E. entre tu aplicación y tus proveedores de IA sin rehacer la lógica principal del producto.',
    detail: 'Ideal para gobierno centralizado.',
  },
  {
    key: 'sidecar',
    title: 'Kubernetes Sidecar',
    description:
      'Ejecuta el control junto a tus workloads para integrar políticas en arquitecturas cloud-native.',
    detail: 'Ideal para Platform Engineering.',
  },
  {
    key: 'mesh',
    title: 'Service Mesh',
    description:
      'Integra el perímetro de control en arquitecturas de tráfico y plataforma existentes.',
    detail: 'Ideal para entornos enterprise.',
  },
  {
    key: 'mcp',
    title: 'MCP Gateway',
    description:
      'Controla las interacciones entre agentes, herramientas y recursos mediante las dimensiones de SGP 1.0.',
    detail: 'Ideal para AI agents.',
  },
  {
    key: 'local',
    title: 'Local Runtime',
    description:
      'Ejecuta la capa de control cerca del workload para arquitecturas orientadas a soberanía y minimización de exposición.',
    detail: 'Ideal para entornos sensibles.',
  },
  {
    key: 'private',
    title: 'Private / On-Premise',
    description:
      'Despliega S.A.A.R.E. dentro de tu propia infraestructura con opciones dedicadas y aisladas.',
    detail: 'Ideal para regulated environments.',
  },
];

const FAQ_ITEMS = [
  {
    q: '¿S.A.A.R.E. sustituye mi plataforma GRC existente?',
    a:
      'No necesariamente. S.A.A.R.E. puede funcionar como una capa especializada de gobernanza operacional, control de runtime y evidencia para sistemas de IA, integrada con tu ecosistema GRC existente.',
  },
  {
    q: '¿Necesito modificar mis modelos de IA?',
    a:
      'La arquitectura está diseñada para ser independiente del proveedor de modelo y admite distintos puntos de integración, incluyendo SDK, gateway, sidecar y despliegues privados.',
  },
  {
    q: '¿S.A.A.R.E. es sólo una consola?',
    a:
      'No. La propuesta combina Compliance Console, MS3V Control Layer y Evidence Layer. La Console gestiona; el Control Layer ejecuta; la Evidence Layer registra y permite verificar.',
  },
  {
    q: '¿Puedo desplegar S.A.A.R.E. en infraestructura privada?',
    a:
      'Sí. Según el modelo contratado, la arquitectura puede desplegarse en cloud, private cloud, on-premise o entornos aislados.',
  },
  {
    q: '¿Qué marcos regulatorios soporta?',
    a:
      'La plataforma estructura controles diseñados para apoyar requisitos de gobernanza, seguridad y evidencia asociados a marcos como EU AI Act, RGPD, ISO/IEC 42001, ISO/IEC 27001, NIS2 y DORA cuando resulten aplicables. La conformidad final depende del contexto, alcance y configuración.',
  },
  {
    q: '¿Cómo funciona la verificación de evidencia?',
    a:
      'El Proof Inspector evalúa el paquete de evidencia mediante comprobaciones criptográficas independientes. El resultado de la verificación no depende de un LLM; un modelo puede utilizarse posteriormente para interpretar o explicar ese resultado.',
  },
];

const PROOF_STEPS = [
  {
    label: '01',
    title: 'Schema',
    description: 'Validación estructural del paquete .saare-proof.',
  },
  {
    label: '02',
    title: 'Digest',
    description: 'Comprobación del digest asociado a la evidencia.',
  },
  {
    label: '03',
    title: 'Merkle',
    description: 'Verificación de la estructura de prueba definida.',
  },
  {
    label: '04',
    title: 'Signature',
    description: 'Verificación de la firma digital.',
  },
  {
    label: '05',
    title: 'Timestamp',
    description: 'Comprobación del vínculo de sellado temporal.',
  },
];

const DEPLOYMENT_ITEMS = [
  {
    title: 'Cloud',
    description: 'Implantación rápida para equipos que priorizan velocidad operativa.',
  },
  {
    title: 'Private Cloud',
    description: 'Aislamiento y control de infraestructura dentro de tu entorno.',
  },
  {
    title: 'On-Premise',
    description: 'Ejecución en infraestructura bajo control de la organización.',
  },
  {
    title: 'Air-Gapped',
    description: 'Arquitecturas aisladas para requisitos estrictos de seguridad.',
  },
  {
    title: 'Sovereign',
    description: 'Arquitecturas orientadas a mayor control de infraestructura y datos.',
  },
];

export default function LandingPage({ onNavigateToLogin }) {
  const [openFaq, setOpenFaq] = useState(null);

  const [evaluationForm, setEvaluationForm] = useState({
    workEmail: '',
    company: '',
    role: 'CTO',
    aiSystems: '1-5',
    requirement: '',
  });

  const [formStatus, setFormStatus] = useState('IDLE');
  const [formMessage, setFormMessage] = useState('');

  const evaluationEndpoint = useMemo(
    () => '/api/v1/evaluation',
    []
  );

  const handlePlanSelection = (planId) => {
    let mappedPlan = 'DISCOVER_FREE';

    if (planId === 'compliance') {
      mappedPlan = 'TRIAL_COMPLIANCE_7D';
    }

    if (planId === 'professional') {
      mappedPlan = 'TRIAL_PRO_7D';
    }

    if (planId === 'enterprise' || planId === 'private') {
      mappedPlan = 'TRIAL_PRO_7D';
    }

    if (typeof onNavigateToLogin === 'function') {
      onNavigateToLogin(mappedPlan);
    }
  };

  const updateEvaluationField = (field, value) => {
    setEvaluationForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEvaluationSubmit = async (event) => {
    event.preventDefault();

    if (
      !evaluationForm.workEmail.trim() ||
      !evaluationForm.company.trim()
    ) {
      return;
    }

    setFormStatus('SUBMITTING');
    setFormMessage('');

    const baseUrl = String(API_HOST || '').replace(/\/+$/, '');
    const requestId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `eval-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      const response = await fetch(`${baseUrl}${evaluationEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          workEmail: evaluationForm.workEmail.trim().toLowerCase(),
          company: evaluationForm.company.trim(),
          role: evaluationForm.role,
          aiSystems: evaluationForm.aiSystems,
          requirement: evaluationForm.requirement.trim(),
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data = {};

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = {};
        }
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            'No se pudo enviar la solicitud de evaluación.'
        );
      }

      setFormStatus('SUCCESS');
      setFormMessage(
        data?.message ||
          'Solicitud recibida. Nuestro equipo de ingeniería revisará la información proporcionada.'
      );
    } catch (error) {
      setFormStatus('ERROR');
      setFormMessage(
        error?.message ||
          'No se pudo conectar con el Control Plane.'
      );
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* =========================================================
          NAVIGATION
      ========================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label="S.A.A.R.E. Suite"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-base font-black tracking-tighter text-slate-950">
              S
            </div>

            <div className="leading-none">
              <div className="text-sm font-bold tracking-[0.16em] text-white">
                S.A.A.R.E.
              </div>
              <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.24em] text-slate-500">
                Suite
              </div>
            </div>
          </a>

          <nav
            className="hidden lg:flex items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-cyan-400"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() =>
                onNavigateToLogin &&
                onNavigateToLogin('DISCOVER_FREE')
              }
              className="hidden sm:inline-flex rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-300 transition-colors hover:text-white"
            >
              Acceder
            </button>

            <a
              href="#evaluation"
              className="inline-flex items-center rounded-lg bg-cyan-500 px-4 py-2.5 text-[11px] font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all hover:bg-cyan-400"
            >
              Evaluar arquitectura
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* =========================================================
            HERO — 3 SECOND RULE
        ========================================================== */}
        <section className="relative overflow-hidden border-b border-slate-800/60">
          <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_60%)]" />

          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-20 sm:pb-20 sm:pt-28">
            <div className="mx-auto max-w-5xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                AI Compliance Infrastructure for ISVs
              </div>

              <h1 className="mx-auto max-w-5xl text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl md:text-7xl md:leading-[0.96]">
                Turn AI governance into
                <span className="block text-cyan-400">
                  executable controls.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                S.A.A.R.E. conecta políticas, controles de runtime y
                evidencia verificable a lo largo del ciclo de vida del
                software de IA.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#evaluation"
                  className="w-full rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/10 transition-all hover:bg-cyan-400 sm:w-auto"
                >
                  Solicitar evaluación de arquitectura
                </a>

                <a
                  href="#proof-inspector"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-7 py-3.5 text-sm font-semibold text-slate-100 transition-all hover:border-slate-600 hover:bg-slate-800 sm:w-auto"
                >
                  Verificar una prueba
                </a>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                <span>Governance</span>
                <span>Runtime Control</span>
                <span>Evidence</span>
              </div>
            </div>

            {/* HERO DEMO */}
            <div className="mx-auto mt-14 max-w-6xl">
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-cyan-950/20">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">
                    S.A.A.R.E. Architecture & Runtime Governance
                  </span>

                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400">
                    MS3V Control Layer
                  </span>
                </div>

                <div className="aspect-video bg-slate-950">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    className="h-full w-full object-cover"
                  >
                    <source src="/hero.mp4" type="video/mp4" />
                    Tu navegador no soporta el reproductor de vídeo HTML5.
                  </video>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/80 px-4 py-3 text-[10px] font-mono text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Policy → Control → Runtime → Evidence
                  </span>

                  <span className="text-cyan-400">
                    Measured benchmarks documented separately
                  </span>
                </div>
              </div>
            </div>

            {/* TRUST STRIP */}
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 sm:grid-cols-3">
              {[
                ['Compliance Console', 'Governance & operations'],
                ['MS3V Control Layer', 'Runtime enforcement'],
                ['Evidence Layer', 'Traceability & verification'],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="bg-slate-950/90 px-5 py-4 text-center"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                    {title}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    {description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            PROBLEM
        ========================================================== */}
        <section
          id="platform"
          className="scroll-mt-24 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Market Reality
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                AI software is shipping faster than governance.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                La gobernanza necesita acompañar al producto en desarrollo,
                despliegue, ejecución y auditoría.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  n: '01',
                  title: 'More AI Systems',
                  text:
                    'LLMs, agentes y funciones autónomas pasan a formar parte de productos y procesos críticos.',
                },
                {
                  n: '02',
                  title: 'More Governance',
                  text:
                    'Aumentan las políticas internas, requisitos de clientes y marcos regulatorios que deben operacionalizarse.',
                },
                {
                  n: '03',
                  title: 'More Evidence',
                  text:
                    'Los compradores enterprise y los auditores necesitan demostrar cómo se autorizan y ejecutan las decisiones.',
                },
              ].map((item) => (
                <article
                  key={item.n}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-7"
                >
                  <div className="mb-4 font-mono text-[11px] font-bold tracking-[0.14em] text-cyan-400">
                    {item.n} / GOVERNANCE
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-3xl text-center">
              <p className="text-lg font-medium text-slate-300">
                Governance does not stay in a document.
                <span className="text-white">
                  {' '}
                  It reaches the runtime.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            GOVERNANCE MODEL
        ========================================================== */}
        <section className="border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Governance Operating Model
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                De la política a la evidencia.
              </h2>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="mx-auto flex min-w-[920px] items-stretch justify-center gap-2">
                {[
                  ['01', 'POLICY'],
                  ['02', 'RISK'],
                  ['03', 'CONTROL'],
                  ['04', 'RUNTIME'],
                  ['05', 'DECISION'],
                  ['06', 'EVIDENCE'],
                  ['07', 'AUDIT'],
                ].map(([number, label], index, array) => (
                  <React.Fragment key={label}>
                    <div className="w-28 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-5 text-center">
                      <div className="font-mono text-[9px] text-slate-500">
                        {number}
                      </div>
                      <div className="mt-2 text-[10px] font-black tracking-[0.12em] text-white">
                        {label}
                      </div>
                    </div>

                    {index < array.length - 1 && (
                      <div className="flex items-center text-slate-600">
                        →
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-slate-400">
              La propuesta de S.A.A.R.E. es mantener una correspondencia
              operativa entre gobierno, decisión técnica y evidencia
              verificable.
            </p>
          </div>
        </section>

        {/* =========================================================
            ARCHITECTURE
        ========================================================== */}
        <section
          id="architecture"
          className="scroll-mt-24 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mb-10 text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                SGP 1.0 Runtime Architecture
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Un punto operativo entre política y runtime.
              </h2>

              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-400">
                El modelo SGP 1.0 organiza las decisiones de control en el
                perímetro definido y las relaciona con evidencia.
              </p>
            </div>

            <ArchitectureDiagram />
          </div>
        </section>

        {/* =========================================================
            EMBED MS3V
        ========================================================== */}
        <section
          id="integrations"
          className="scroll-mt-24 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Embed MS3V
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Un motor de control.
                <span className="block text-cyan-400">
                  Múltiples arquitecturas de despliegue.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Integra S.A.A.R.E. donde ya corre tu software de IA, según
                las necesidades de tu arquitectura.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {INTEGRATION_ITEMS.map((item) => (
                <article
                  key={item.key}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-cyan-500/30"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-400">
                      MS3V
                    </span>

                    <span className="text-[9px] font-mono uppercase text-slate-600">
                      {item.key}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>

                  <div className="mt-5 border-t border-slate-800 pt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    {item.detail}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                AI provider agnostic
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  'OpenAI',
                  'Azure OpenAI',
                  'Anthropic',
                  'Gemini',
                  'Llama',
                  'DeepSeek',
                  'Private Models',
                ].map((provider) => (
                  <span
                    key={provider}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"
                  >
                    {provider}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            REGULATORY MAPPING
        ========================================================== */}
        <section className="border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Regulatory Mapping
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                De requisitos de gobernanza a controles ejecutables.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                S.A.A.R.E. organiza controles y evidencia alrededor de
                marcos normativos y de gestión aplicables al contexto de
                cada organización.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {REGULATORY_ITEMS.map((item) => (
                <article
                  key={item.framework}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
                >
                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-400">
                    {item.eyebrow}
                  </div>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    {item.framework}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>

                  <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">
                    {item.mapping}
                  </div>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-center text-xs leading-6 text-slate-400">
                S.A.A.R.E. proporciona capacidades técnicas de apoyo a la
                gobernanza, control, trazabilidad y evidencia. La
                aplicabilidad concreta de cada marco y la conformidad
                final dependen de la organización, sistema, jurisdicción,
                alcance y configuración.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            OPEN PROOF
        ========================================================== */}
        <section
          id="proof-inspector"
          className="scroll-mt-24 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Independent Verification
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Don&apos;t trust the dashboard.
                <span className="block text-cyan-400">
                  Verify the proof.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                El Proof Inspector evalúa paquetes de evidencia mediante
                comprobaciones criptográficas independientes.
              </p>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-5">
              {PROOF_STEPS.map((step) => (
                <div
                  key={step.label}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
                >
                  <div className="font-mono text-[9px] text-cyan-400">
                    {step.label}
                  </div>

                  <div className="mt-2 text-sm font-bold text-white">
                    {step.title}
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <ProofInspectorWidget />

            <div className="mx-auto mt-10 max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">
                Zero dependency on LLM for cryptographic verification
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Un modelo de IA puede interpretar un resultado de
                verificación, pero no sustituye la comprobación
                criptográfica.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONSOLE PREVIEW
        ========================================================== */}
        <section
          id="console-preview"
          className="scroll-mt-24 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                S.A.A.R.E. Console
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                La capa operativa para gobernar tu entorno de IA.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Suite explica y convierte. Console opera y audita.
                Ambas utilizan los mismos contratos y capacidades del
                Control Plane.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-cyan-950/30">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />

                  <span className="ml-3 text-[10px] font-mono text-slate-500">
                    console.saare.es
                  </span>
                </div>

                <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-slate-500">
                  Governance / Risk / Evidence
                </span>
              </div>

              <div className="bg-slate-950">
                <img
                  src={consolePreviewImg}
                  onError={(event) => {
                    if (
                      event.currentTarget.src.endsWith('/cabecera.png')
                    ) {
                      event.currentTarget.src =
                        '/saare-console-preview.png';
                    }
                  }}
                  alt="Vista previa de S.A.A.R.E. Console"
                  className="h-auto max-h-[650px] w-full object-contain"
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 bg-slate-950/90 px-5 py-5 md:flex-row">
                <div>
                  <div className="text-sm font-bold text-white">
                    Governance · Security · Audit
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    La operación privada vive en S.A.A.R.E. Console.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onNavigateToLogin &&
                    onNavigateToLogin('DISCOVER_FREE')
                  }
                  className="rounded-xl bg-cyan-500 px-5 py-3 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-400"
                >
                  Acceder a la Console ↗
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            COMPLIANCE AS CODE
        ========================================================== */}
        <section className="border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Compliance as Code
                </p>

                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  El cumplimiento evoluciona con tu código.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                  Las políticas, controles y esquemas de evidencia pueden
                  evolucionar junto al software para mantener una
                  correspondencia trazable entre versión, ejecución y
                  evidencia.
                </p>

                <div className="mt-7 flex flex-wrap gap-2 font-mono text-[10px]">
                  {[
                    '/apps',
                    '/packages',
                    '/policies',
                    '/controls',
                    '/evidence',
                  ].map((item, index) => (
                    <span
                      key={item}
                      className={`rounded-lg border px-3 py-2 ${
                        index >= 2
                          ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                  Traceability chain
                </div>

                <div className="space-y-3">
                  {[
                    ['01', 'CODE', 'Versioned source'],
                    ['02', 'POLICY', 'Declarative rules'],
                    ['03', 'CONTROL', 'Executable logic'],
                    ['04', 'RUNTIME', 'Operational decision'],
                    ['05', 'EVIDENCE', 'Verifiable proof'],
                  ].map(([number, title, detail]) => (
                    <div
                      key={number}
                      className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                    >
                      <div className="font-mono text-[9px] text-cyan-400">
                        {number}
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] font-bold tracking-[0.1em] text-white">
                          {title}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500">
                          {detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONSULTANT / MSP
        ========================================================== */}
        <section className="border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Partner / Consultant
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Entrega proyectos de gobernanza de IA de forma repetible.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Una capa de trabajo para consultoras, MSP, MSSP e
                integradores que necesitan evaluar, implantar, documentar
                y entregar proyectos de AI Governance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
              {[
                ['01', 'ASSESS'],
                ['02', 'MAP'],
                ['03', 'IMPLEMENT'],
                ['04', 'EVIDENCE'],
                ['05', 'REPORT'],
              ].map(([number, title]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center"
                >
                  <div className="font-mono text-[9px] text-cyan-400">
                    {number}
                  </div>

                  <div className="mt-2 text-xs font-black tracking-[0.14em] text-white">
                    {title}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  title: 'Multi-tenant',
                  text: 'Gestión separada de clientes y proyectos.',
                },
                {
                  title: 'Templates',
                  text: 'Matrices, políticas y controles reutilizables.',
                },
                {
                  title: 'Reporting',
                  text: 'Evidencia y entregables estructurados.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                >
                  <div className="text-sm font-bold text-white">
                    {item.title}
                  </div>

                  <div className="mt-2 text-xs leading-6 text-slate-500">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="#evaluation"
                className="inline-flex rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-5 py-3 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-500/10"
              >
                Solicitar información para Partners
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================
            DEPLOYMENT
        ========================================================== */}
        <section
          id="zerocloud"
          className="scroll-mt-24 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Deployment
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                La política es la misma.
                <span className="block text-cyan-400">
                  El perímetro puede cambiar.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {DEPLOYMENT_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
                >
                  <h3 className="text-sm font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <ZeroCloudComparison />
            </div>
          </div>
        </section>

        {/* =========================================================
            TECHNICAL RIGOR
        ========================================================== */}
        <section className="border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Technical Rigor
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ingeniería al servicio del resultado empresarial.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  title: 'Stateless Runtime',
                  subtitle: 'Volatile-memory processing',
                  description:
                    'Arquitectura orientada a minimizar la persistencia innecesaria del payload y mantener el procesamiento sensible en el perímetro definido.',
                },
                {
                  title: 'Cryptographic Evidence',
                  subtitle: 'SHA-256 · Ed25519 · Merkle · RFC 3161',
                  description:
                    'Mecanismos para asociar evidencia a integridad, firma y sellado temporal verificables según la implementación desplegada.',
                },
                {
                  title: 'Deterministic Controls',
                  subtitle: 'Explicit policy logic',
                  description:
                    'Decisiones de política basadas en reglas explícitas y versionadas, reduciendo la dependencia de una decisión probabilística del modelo.',
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-7"
                >
                  <h3 className="text-base font-bold text-white">
                    {item.title}
                  </h3>

                  <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-400">
                    {item.subtitle}
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Performance evidence
              </div>

              <div className="mt-3 text-sm text-slate-300">
                Los benchmarks deben publicarse junto con su metodología,
                entorno, hardware, dataset y percentiles.
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRICING
        ========================================================== */}
        <section
          id="pricing"
          className="scroll-mt-24 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Pricing
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Empieza pequeño. Escala con tu entorno de IA.
              </h2>

              <p className="mt-4 text-sm text-slate-400">
                Precios sin IVA. Límites e integraciones aplican según el
                plan contratado.
              </p>
            </div>

            <PricingSection onSelectPlan={handlePlanSelection} />
          </div>
        </section>

        {/* =========================================================
            FAQ
        ========================================================== */}
        <section className="border-b border-slate-800/60">
          <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
            <div className="mb-12 text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Common Questions
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Preguntas frecuentes
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={item.q}
                    className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                    >
                      <span className="text-sm font-semibold text-white">
                        {item.q}
                      </span>

                      <span className="shrink-0 font-mono text-lg text-cyan-400">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-800/70 px-6 pb-5 pt-4 text-sm leading-7 text-slate-400">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            EVALUATION CTA
        ========================================================== */}
        <section
          id="evaluation"
          className="scroll-mt-24"
        >
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-950/20 sm:p-12">
              <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl" />

              <div className="relative">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Architecture Evaluation
                  </p>

                  <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    See how S.A.A.R.E. would govern your AI stack.
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    Revisamos dónde corre tu IA, dónde debería ejecutarse
                    el control y qué evidencia necesitas conservar.
                  </p>
                </div>

                {formStatus === 'SUCCESS' ? (
                  <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
                    <div className="text-2xl text-emerald-400">✓</div>

                    <h3 className="mt-3 text-lg font-bold text-white">
                      Solicitud recibida
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-emerald-200/80">
                      {formMessage}
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleEvaluationSubmit}
                    className="mx-auto mt-10 max-w-2xl space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="evaluation-email"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                        >
                          Work Email *
                        </label>

                        <input
                          id="evaluation-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={evaluationForm.workEmail}
                          onChange={(event) =>
                            updateEvaluationField(
                              'workEmail',
                              event.target.value
                            )
                          }
                          placeholder="cto@company.com"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="evaluation-company"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                        >
                          Company *
                        </label>

                        <input
                          id="evaluation-company"
                          type="text"
                          required
                          autoComplete="organization"
                          value={evaluationForm.company}
                          onChange={(event) =>
                            updateEvaluationField(
                              'company',
                              event.target.value
                            )
                          }
                          placeholder="Company / ISV"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="evaluation-role"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                        >
                          Role
                        </label>

                        <select
                          id="evaluation-role"
                          value={evaluationForm.role}
                          onChange={(event) =>
                            updateEvaluationField(
                              'role',
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                        >
                          <option value="CTO">
                            CTO / VP Engineering
                          </option>
                          <option value="CISO">
                            CISO / Security Director
                          </option>
                          <option value="Compliance">
                            Head of Compliance / GRC
                          </option>
                          <option value="DPO">
                            DPO / Privacy
                          </option>
                          <option value="Product">
                            Product Lead
                          </option>
                          <option value="Consultant">
                            Consultant / MSP / MSSP
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="evaluation-ai-systems"
                          className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                        >
                          AI Systems
                        </label>

                        <select
                          id="evaluation-ai-systems"
                          value={evaluationForm.aiSystems}
                          onChange={(event) =>
                            updateEvaluationField(
                              'aiSystems',
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                        >
                          <option value="1-5">1 – 5 systems</option>
                          <option value="6-20">6 – 20 systems</option>
                          <option value="20+">20+ systems</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="evaluation-requirement"
                        className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                      >
                        Primary Requirement
                      </label>

                      <textarea
                        id="evaluation-requirement"
                        rows={4}
                        value={evaluationForm.requirement}
                        onChange={(event) =>
                          updateEvaluationField(
                            'requirement',
                            event.target.value
                          )
                        }
                        placeholder="Runtime controls, AI governance, customer security questionnaires, EU AI Act, private deployment..."
                        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-700 focus:border-cyan-500"
                      />
                    </div>

                    {formStatus === 'ERROR' && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300"
                      >
                        {formMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formStatus === 'SUBMITTING'}
                      className="w-full rounded-xl bg-cyan-500 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {formStatus === 'SUBMITTING'
                        ? 'Enviando solicitud…'
                        : 'Solicitar evaluación de arquitectura ↗'}
                    </button>

                    <p className="text-center text-[10px] leading-5 text-slate-600">
                      La información se utiliza para preparar la evaluación
                      solicitada. Consulta la política de privacidad de
                      S.A.A.R.E. para más información.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-bold tracking-[0.14em] text-white">
              S.A.A.R.E.
            </div>

            <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-600">
              AI Compliance Infrastructure
            </div>

            <p className="mt-4 max-w-md text-xs leading-6 text-slate-500">
              Diseñado para apoyar la gobernanza operacional, la
              preservación, integridad y verificación de evidencia
              electrónica.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-[10px] font-mono uppercase tracking-[0.12em] text-slate-600">
            <a
              href="#platform"
              className="transition-colors hover:text-slate-300"
            >
              Platform
            </a>

            <a
              href="#architecture"
              className="transition-colors hover:text-slate-300"
            >
              Architecture
            </a>

            <a
              href="#proof-inspector"
              className="transition-colors hover:text-slate-300"
            >
              Open Proof
            </a>

            <a
              href="#pricing"
              className="transition-colors hover:text-slate-300"
            >
              Pricing
            </a>

            <a
              href="#evaluation"
              className="transition-colors hover:text-slate-300"
            >
              Evaluation
            </a>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-slate-900 pt-6 text-[9px] font-mono uppercase tracking-[0.12em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 S.A.A.R.E. All rights reserved.</span>

          <span>
            Governance · Runtime Control · Evidence
          </span>
        </div>
      </footer>
    </div>
  );
}