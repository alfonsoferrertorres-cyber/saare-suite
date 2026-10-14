// saare-suite/src/LandingPage.jsx

import React, { useState, useEffect } from 'react';
import PricingSection from './components/PricingSection';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import ProofInspectorWidget from './ui/ProofInspectorWidget';
import ZeroCloudComparison from './components/ZeroCloudComparison';
import { API_HOST } from './api/api';

const NAV_ITEMS = [
  { label: 'Soluciones', href: '#solutions' },
  { label: 'Motor & CLI', href: '#terminal' },
  { label: 'Plantillas y Trámites', href: '#templates' },
  { label: 'Nosotros', href: '#about' },
  { label: 'Soporte', href: '#support' },
];

const FLASH_COMMANDS = [
  {
    id: 'audit-l7',
    cmd: 'saare audit --perimeter --stateless-check',
    title: 'Auditoría Perimetral L7',
    desc: 'Verifica la retención cero en memoria RAM y filtrado de PII.',
    output: [
      '[INIT] Conectando con Sensor L7 en localhost:8443...',
      '[CHECK] Inspección de inspección de carga útil en memoria RAM (Stateless Engine)...',
      '[RESULT] Disposición de datos: RETENCIÓN 0ms. Ninguna PII almacenada en disco.',
      '[PASS] 8 Invariantes de Seguridad activas y verificadas.',
      '--> Estado Perimetral: OPTIMIZADO & SEGURO (Latencia: 1.2ms)'
    ]
  },
  {
    id: 'gap-scan',
    cmd: 'saare gap-scan --framework=eu-ai-act --level=high-risk',
    title: 'Escáner Brechas EU AI Act',
    desc: 'Compara la arquitectura con el Artículo 10 y Anexo IV de la normativa europea.',
    output: [
      '[INIT] Evaluando topología de IA frente a marco EU AI Act (Alto Riesgo)...',
      '[ANALYSIS] Trazabilidad de Prompts: 100% | Control Humano: Habilitado | Logging: SHA-256',
      '[MISSING] Anexo IV: Requiere plantilla oficial "IT Risk Assessment" actualizada.',
      '[RECOMMENDATION] Generar Dossier Probatorio con plantilla S.A.A.R.E. #01.',
      '--> Nivel de Cobertura Normativa: 88% (Acción sugerida: Actualizar plantilla)'
    ]
  },
  {
    id: 'verify-proof',
    cmd: 'saare verify --proof=sample.saare-proof --strict',
    title: 'Verificación Criptográfica Open Proof',
    desc: 'Comprueba sellado temporal RFC 3161 y árbol Merkle sin depender de LLMs.',
    output: [
      '[INIT] Extrayendo paquete .saare-proof (Hash: 8f9a2b...c4e1)',
      '[STEP 1/3] Esquema de estructura JSON: VÁLIDO',
      '[STEP 2/3] Raíz de Árbol Merkle & Firma Ed25519: CORRECTA',
      '[STEP 3/3] Sello Temporal RFC 3161: VERIFICADO (Timestamp: 2026-10-14T07:12:00Z)',
      '--> Resultado Criptográfico: EVIDENCIA INALTERADA (Integridad 100%)'
    ]
  },
  {
    id: 'subsidy-check',
    cmd: 'saare subsidy-check --dossier --match-requirements',
    title: 'Chequeo Expediente Subvenciones',
    desc: 'Valida los entregables técnicos para Kit Digital e incentivos de I+D+i.',
    output: [
      '[INIT] Escaneando memorias técnicas y firmas de ejecución...',
      '[CHECK] Justificante de Adopción Tecnológica: OK',
      '[CHECK] Registro de Invariantes de Ciberseguridad: OK',
      '[CHECK] Requisitos de Subvención (Categoría Ciberseguridad/IA): COMPATIBLES',
      '--> Estado del Dossier: LISTO PARA REVISIÓN DE AUDITORÍA EXTERNA'
    ]
  }
];

export default function LandingPage({ onNavigateToLogin }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCmd, setActiveCmd] = useState(FLASH_COMMANDS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [termLogs, setTermLogs] = useState([]);

  const [evaluationForm, setEvaluationForm] = useState({
    workEmail: '',
    company: '',
    role: 'CTO',
    aiSystems: '1-5',
    requirement: '',
  });

  const [formStatus, setFormStatus] = useState('IDLE');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    runCommand(FLASH_COMMANDS[0]);
  }, []);

  const runCommand = (cmdObj) => {
    setActiveCmd(cmdObj);
    setIsExecuting(true);
    setTermLogs([`$ ${cmdObj.cmd}`, 'Ejecutando diagnóstico...']);

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < cmdObj.output.length) {
        const nextLine = cmdObj.output[currentStep];
        setTermLogs((prev) => [...prev, nextLine]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 300);
  };

  const handlePlanSelection = (planId) => {
    let mappedPlan = 'DISCOVER_FREE';
    if (planId === 'compliance') mappedPlan = 'TRIAL_COMPLIANCE_7D';
    if (planId === 'professional' || planId === 'enterprise') mappedPlan = 'TRIAL_PRO_7D';
    if (typeof onNavigateToLogin === 'function') {
      onNavigateToLogin(mappedPlan);
    }
  };

  const updateEvaluationField = (field, value) => {
    setEvaluationForm((current) => ({ ...current, [field]: value }));
  };

  const handleEvaluationSubmit = async (event) => {
    event.preventDefault();
    if (!evaluationForm.workEmail.trim() || !evaluationForm.company.trim()) return;

    setFormStatus('SUBMITTING');
    setFormMessage('');

    const baseUrl = String(API_HOST || '').replace(/\/+$/, '');
    const requestId = `eval-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      const response = await fetch(`${baseUrl}/api/v1/evaluation`, {
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

      if (!response.ok) throw new Error('No se pudo enviar la solicitud de evaluación.');

      setFormStatus('SUCCESS');
      setFormMessage('Solicitud recibida. Nuestro equipo revisará la información proporcionada.');
    } catch (error) {
      setFormStatus('ERROR');
      setFormMessage(error?.message || 'No se pudo conectar con el Control Plane.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-[#38BDDB] selection:text-slate-950">
      
      {/* =========================================================
          NAVEGACIÓN PRINCIPAL
      ========================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#030712]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3" aria-label="S.A.A.R.E. Suite">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-base font-black tracking-tighter text-slate-950 shadow-md">
              S
            </div>
            <div className="leading-none">
              <div className="text-sm font-extrabold tracking-[0.16em] text-white">S.A.A.R.E.</div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Suite & GRC</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-cyan-400">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigateToLogin && onNavigateToLogin('DISCOVER_FREE')}
              className="rounded-lg px-4 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white"
            >
              Iniciar sesión
            </button>
            <a
              href="#evaluation"
              className="inline-flex items-center rounded-lg bg-[#38BDDB] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400"
            >
              Quiero saber más
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* =========================================================
            HERO — TU PLATAFORMA DE GOBERNANZA SIN LETRA PEQUEÑA
        ========================================================== */}
        <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0B132B] to-[#030712] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Plataforma de Gobernanza e IA Con Todo Incluido
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Tu plataforma de gobernanza <span className="text-[#38BDDB]">sin letra pequeña</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
                Gestiona de forma eficiente los requisitos normativos, plantillas oficiales y evidencias técnicas que solicitas en tus desarrollos e implantaciones de Inteligencia Artificial.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#evaluation"
                  className="rounded-xl bg-[#38BDDB] px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition-all hover:bg-cyan-400"
                >
                  Quiero saber más
                </a>
                <a
                  href="#templates"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-7 py-3.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800"
                >
                  Explorar Plantillas Oficiales
                </a>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A101E] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Panel de Control de Requisitos</span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Estado: Controlado</span>
                </div>
                <div className="space-y-3">
                  {['IT Risk Assessment (ISO 42001)', 'EIPD / DPIA (RGPD Art. 35)', 'Bias Evaluation (EU AI Act)', 'ESG / EINF (Sostenibilidad)'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-xl bg-slate-900 p-3.5 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span className="text-xs font-bold text-slate-200">{item}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Validado OK</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            S.A.A.R.E. FLASH COMMANDS / TERMINAL INTERACTIVO
        ========================================================== */}
        <section id="terminal" className="border-b border-slate-800/80 py-20 bg-[#040814]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Pruebas Flash & Diagnósticos en Vivo</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">S.A.A.R.E. Quick CLI & Terminal</h2>
              <p className="text-slate-400 mt-3 text-sm">Prueba el motor de gobernanza ejecutando comandos de auditoría en tiempo real directamente desde tu navegador.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Botones de Comandos */}
              <div className="lg:col-span-5 space-y-3">
                {FLASH_COMMANDS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => runCommand(c)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      activeCmd.id === c.id
                        ? 'border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{c.title}</span>
                      <span className="text-[9px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">CLI</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{c.desc}</p>
                    <div className="font-mono text-[10px] text-slate-500 truncate bg-slate-950 p-2 rounded border border-slate-800/50">
                      $ {c.cmd}
                    </div>
                  </button>
                ))}
              </div>

              {/* Terminal Output */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#02050E] overflow-hidden shadow-2xl font-mono">
                <div className="flex items-center justify-between bg-slate-900/80 px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <span className="text-xs text-slate-400 ml-2">saare-cli v1.0 — interactive console</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest">{isExecuting ? 'EJECUTANDO...' : 'LISTO'}</span>
                </div>

                <div className="p-6 h-[320px] overflow-y-auto space-y-2 text-xs">
                  {termLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`${
                        log.startsWith('$')
                          ? 'text-cyan-400 font-bold'
                          : log.includes('PASS') || log.includes('OPTIMIZADO') || log.includes('CORRECTA') || log.includes('VERIFICADO') || log.includes('100%')
                          ? 'text-emerald-400'
                          : log.includes('MISSING') || log.includes('RECOMMENDATION')
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {isExecuting && (
                    <div className="inline-block h-3 w-2 bg-cyan-400 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MOTOR DE GESTIÓN DE REQUISITOS
        ========================================================== */}
        <section id="motor" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">El secreto está en nuestro corazón</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">¿Cómo ayudamos a las empresas a ser más eficientes?</h2>
              <p className="text-slate-400 mt-3 text-sm">Usando nuestro motor inteligente de gestión de requisitos normativos y documentales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Establecemos los requisitos',
                  text: 'Junto con un consultor especializado se definen las plantillas y evidencias normativas necesarias a solicitar a tus equipos y proveedores.',
                },
                {
                  step: '02',
                  title: 'Nuestro motor hace su magia',
                  text: 'Nuestra herramienta solicita y recopila de manera automática la documentación requerida para cada proyecto de IA.',
                },
                {
                  step: '03',
                  title: 'Todos tus documentos validados',
                  text: 'Nos encargamos de estructurar, revisar y ordenar cada evidencia con sellado criptográfico y trazabilidad total.',
                },
              ].map((card) => (
                <div key={card.step} className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 relative">
                  <div className="absolute top-6 right-6 font-mono text-2xl font-black text-slate-800">{card.step}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            CENTRO DE TRÁMITES Y PLANTILLAS OFICIALES
        ========================================================== */}
        <section id="templates" className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Plantillas de Gobernanza S.A.A.R.E.</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Cuatro perspectivas. Un flujo documental coherente.</h2>
              <p className="text-slate-400 mt-3 text-sm">Herramientas especializadas para preparar auditorías, cumplir con la normativa y justificar expedientes de subvención.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  code: 'PLANTILLA 01',
                  name: 'IT Risk Assessment',
                  scope: 'ISO/IEC 42001 & DORA',
                  desc: 'Estructura la evaluación de riesgos, activos, dependencias y medidas técnicas para sistemas de IA y su infraestructura crítica.',
                  forWho: 'CTO, CIO, CISO y consultoras tecnológicas.',
                },
                {
                  code: 'PLANTILLA 02',
                  name: 'EIPD / DPIA',
                  scope: 'RGPD Art. 35 y 36',
                  desc: 'Organiza la información sobre finalidad, categorías de datos, flujos en memoria RAM y análisis de proporcionalidad para tratamientos de alto riesgo.',
                  forWho: 'DPO, responsables de privacidad y equipos jurídicos.',
                },
                {
                  code: 'PLANTILLA 03',
                  name: 'Bias Evaluation',
                  scope: 'EU AI Act (Art. 10)',
                  desc: 'Define métricas de equidad, calidad de datos de entrenamiento, poblaciones evaluadas y análisis de desviaciones en modelos LLM.',
                  forWho: 'Equipos de IA, datos y responsables de producto.',
                },
                {
                  code: 'PLANTILLA 04',
                  name: 'ESG / EINF',
                  scope: 'Sostenibilidad Corporativa',
                  desc: 'Estructura indicadores de gobernanza, impacto ético, trazabilidad de datos y aspectos energéticos para informes no financieros.',
                  forWho: 'Dirección, responsables ESG y finanzas.',
                },
              ].map((tmpl) => (
                <div key={tmpl.code} className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#38BDDB]">{tmpl.code}</span>
                      <span className="rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] font-mono text-slate-400">{tmpl.scope}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{tmpl.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{tmpl.desc}</p>
                  </div>
                  <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-500 font-mono">
                    Dirigido a: <span className="text-slate-300">{tmpl.forWho}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            ARQUITECTURA Y SGP 1.0
        ========================================================== */}
        <section id="solutions" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">SGP 1.0 & MS3V Engine</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Gobernanza conectada con el sistema real</h2>
              <p className="text-slate-400 mt-3 text-sm">El sensor perimetral L7 y el control plane garantizan una ejecución segura e independiente.</p>
            </div>
            <ArchitectureDiagram />
          </div>
        </section>

        {/* =========================================================
            OPEN PROOF & INSPECTOR
        ========================================================== */}
        <section className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Open Proof Independent Verification</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">No te quedes en una declaración. Comprueba la prueba.</h2>
              <p className="text-slate-400 mt-3 text-sm">Verifica la integridad de los paquetes de evidencia mediante criptografía avanzada.</p>
            </div>
            <ProofInspectorWidget />
          </div>
        </section>

        {/* =========================================================
            PRECIOS Y PLANES
        ========================================================== */}
        <section id="pricing" className="border-b border-slate-800/80 py-20 bg-[#030712]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Tarifas y Modelos</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Planes adaptados a tu organización</h2>
              <p className="text-slate-400 mt-3 text-sm">Empieza a gobernar tus sistemas de IA con transparencia y sin letra pequeña.</p>
            </div>
            <PricingSection onSelectPlan={handlePlanSelection} />
          </div>
        </section>

        {/* =========================================================
            FORMULARIO DE EVALUACIÓN
        ========================================================== */}
        <section id="evaluation" className="py-20 bg-slate-950">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-3xl border border-slate-800 bg-[#0A101E] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Comienza Hoy</span>
                <h2 className="text-3xl font-black text-white mt-2">Solicita una evaluación de arquitectura</h2>
                <p className="text-sm text-slate-400 mt-3">Descubre cómo S.A.A.R.E. puede automatizar la gestión de tus requisitos y plantillas de gobernanza.</p>
              </div>

              {formStatus === 'SUCCESS' ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-300">
                  <h3 className="font-bold text-lg">¡Solicitud enviada con éxito!</h3>
                  <p className="text-xs mt-2">{formMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email Profesional *</label>
                      <input
                        type="email"
                        required
                        value={evaluationForm.workEmail}
                        onChange={(e) => updateEvaluationField('workEmail', e.target.value)}
                        placeholder="tu@empresa.es"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Empresa *</label>
                      <input
                        type="text"
                        required
                        value={evaluationForm.company}
                        onChange={(e) => updateEvaluationField('company', e.target.value)}
                        placeholder="Nombre de la empresa"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === 'SUBMITTING'}
                    className="w-full rounded-xl bg-[#38BDDB] px-6 py-4 text-xs font-bold text-slate-950 shadow-lg transition-all hover:bg-cyan-400"
                  >
                    {formStatus === 'SUBMITTING' ? 'Enviando...' : 'Solicitar Evaluación y Demostración'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          PIE DE PÁGINA
      ========================================================== */}
      <footer id="support" className="border-t border-slate-800/80 bg-slate-950 px-6 py-14">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-600 font-mono">
          <span>© 2026 S.A.A.R.E. Todos los derechos reservados.</span>
          <div className="flex gap-4 mt-3 sm:mt-0">
            <span>Seguridad</span>
            <span>Aviso legal</span>
            <span>Privacidad</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}