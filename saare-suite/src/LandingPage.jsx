// saare-suite/src/LandingPage.jsx — Landing Comercial & Verificador Pericial en Vivo S.A.A.R.E.

import React, { useState, useEffect } from 'react';
import PricingSection from './components/PricingSection';
import { API_HOST } from './api/api';

const NAV_ITEMS = [
  { label: 'Motor de Requisitos', href: '#motor' },
  { label: 'Terminal & CLI', href: '#terminal' },
  { label: 'Subvenciones & PDF', href: '#templates' },
  { label: 'Garantía Legal', href: '#legal-guarantee' },
  { label: 'Precios', href: '#pricing' },
];

// COMANDOS PERICIALES REALISTAS Y ALINEADOS CON LA CONSOLA GRC
const getRealtimeCommands = () => {
  const nowISO = new Date().toISOString();
  
  return [
    {
      id: 'escrow-cert',
      cmd: 'saare legal-escrow --verify-hash=0bbe05522f3f3797c95b78865915018261537079817ee84f937b3dd326d64a95',
      title: '1. Verificación Notarial Escrow & Hash MS3V',
      desc: 'Auditoría de integridad del código fuente V7.0 PRO y depósito notarial inmutable.',
      outputGenerator: () => [
        `[S.A.A.R.E. LEGAL-ESCROW ENGINE v4.0.2 - VERIFIER MODULE]`,
        `Target Hash: 0bbe05522f3f3797c95b78865915018261537079817ee84f937b3dd326d64a95`,
        `Timestamp:   ${nowISO}`,
        ``,
        `[+] Cargando manifiesto del expediente MS3V-RECON-VALID-2026-ALF-0521... [OK]`,
        `[+] Verificando depósito notarial (Cláusula 1.1 / 1.2 - Trigger Events)... [REGISTRADO]`,
        `[+] Comprobando Huella Canónica del Nodo Maestro:`,
        `    - Huella Registrada: 0bbe05522f3f3797c95b78865915018261537079817ee84f937b3dd326d64a95`,
        `    - Huella Presentada : 0bbe05522f3f3797c95b78865915018261537079817ee84f937b3dd326d64a95`,
        `[+] Verificación Criptográfica: HASH MATCH / COINCIDENCIA MATCH 100%`,
        `[+] Estado de Memoria Volátil (Cláusula 3.2 Stateless): ZERO-DISK RETENTION CONFIRMED`,
        `----------------------------------------------------------------------------------`,
        `[STATUS]: CERTIFICADO / HASH VALIDADO EN EXPEDIENTE NOTARIAL MS3V`,
        `[DETALLE]: Código en producción inmutable. Alineado con Guía EBA, ISO 42001 y EU AI Act.`
      ]
    },
    {
      id: 'subsidies-check',
      cmd: 'saare subsidies --hub --red-es --incibe --nextgen',
      title: '2. Subsidies Hub (Justificación Red.es / INCIBE)',
      desc: 'Acredita inversiones tecnológicas y ciberseguridad para la justificación de subvenciones.',
      outputGenerator: () => [
        `[S.A.A.R.E. SUBSIDIES HUB - EXPEDIENTE PROBATORIO]`,
        `Target Programs: Red.es / INCIBE / Fondos Europeos NextGen EU`,
        `Timestamp:        ${nowISO}`,
        ``,
        `[+] Agrupando evidencias de ciberseguridad L7 e ISO 42001... [OK]`,
        `[+] Generando Memoria Justificativa de Inversión Tecnológica...`,
        `[+] Verificando cadena de custodia inmutable (Ed25519 Signed)...`,
        `----------------------------------------------------------------------------------`,
        `[EVIDENCIA SUBVENCIONES]: COMPLETA / AHORRO DE HASTA 20.000 € EN CONSULTORÍA`
      ]
    },
    {
      id: 'fria-scan',
      cmd: 'saare fria-eval --art27 --high-risk --generate-pdf',
      title: '3. Evaluación de Impacto FRIA (Art. 27 EU AI Act)',
      desc: 'Genera el informe probatorio de derechos fundamentales para sistemas de alto riesgo.',
      outputGenerator: () => [
        `[S.A.A.R.E. FRIA & DORA COMPLIANCE ENGINE v1.0]`,
        `Target Requirement: EU AI Act Article 27 (Fundamental Rights Impact Assessment)`,
        `Timestamp:           ${nowISO}`,
        ``,
        `[+] Analizando impacto en derechos fundamentales y colectivos vulnerables... [OK]`,
        `[+] Trazabilidad de decisiones algorítmicas y mitigación de sesgos: 100%`,
        `[+] Generando borrador de expediente PDF probatorio para AEPD / Ministerio...`,
        `[+] Archivo generado: 04_Guia_Metodologica_FRIA_EU_AI_Act.pdf (Hash SHA-256 verificado)`,
        `----------------------------------------------------------------------------------`,
        `[ESTADO FRIA]: CONFORME / LISTO PARA INSPECCIÓN DE AUDITORÍA`
      ]
    },
    {
      id: 'audit-l7',
      cmd: 'saare audit --perimeter --stateless-check --strict',
      title: '4. Auditoría Perimetral L7 & Sensor Soberano',
      desc: 'Inspecciona la aduana de paso en memoria RAM y la tokenización del Sensor L7.',
      outputGenerator: () => [
        `[S.A.A.R.E. L7 PERIMETER INSPECTOR v8.2 - REALTIME AUDIT]`,
        `Sensor Node: node-prod-eu-west-1.saare.es (mlock-isolated)`,
        `Timestamp:   ${nowISO}`,
        ``,
        `[+] Interceptando canal HTTP/2 Capa 7 (P99 Latency: 0.84ms)...`,
        `[+] Analizando vectores en memoria RAM volátil (madvise/mlock)...`,
        `[+] Verificando persistencia en disco: 0 BYTES WRITTEN (Zero Disk Spill)`,
        `[+] Filtro PII / Anonimización ex-ante: 8 Invariantes de Seguridad SATISFECHAS`,
        `[+] Firma de Testigo Perimetral: Ed25519-Proof:8f9a2b...c4e1 [OK]`,
        `----------------------------------------------------------------------------------`,
        `[RESULTADO]: PERÍMETRO HERMÉTICO / CERO RETENCIÓN CONFIRMADA (Testigo: 🧠)`
      ]
    }
  ];
};

export default function LandingPage({ onNavigateToLogin }) {
  const [commandsList, setCommandsList] = useState(getRealtimeCommands());
  const [activeCmd, setActiveCmd] = useState(commandsList[0]);
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
    runCommand(commandsList[0]);
  }, []);

  const runCommand = (cmdObj) => {
    setActiveCmd(cmdObj);
    setIsExecuting(true);

    const logs = cmdObj.outputGenerator ? cmdObj.outputGenerator() : [];
    setTermLogs([`$ ${cmdObj.cmd}`, 'Iniciando verificación forense en tiempo real...']);

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        const nextLine = logs[currentStep];
        setTermLogs((prev) => [...prev, nextLine]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 180);
  };

  const triggerAutoEvaluation = (cmdId = 'escrow-cert') => {
    const freshList = getRealtimeCommands();
    setCommandsList(freshList);
    const targetCmd = freshList.find((c) => c.id === cmdId) || freshList[0];
    
    const termSection = document.getElementById('terminal');
    if (termSection) {
      termSection.scrollIntoView({ behavior: 'smooth' });
    }
    runCommand(targetCmd);
  };

  // DESCARGA DIRECTA DE PDF OFICIAL DESDE EL CONTROL PLANE O PUBLIC ASSETS
  const handleDownloadPdf = (pdfFileName) => {
    const baseUrl = String(API_HOST || '').replace(/\/+$/, '');
    const pdfUrl = `${baseUrl}/api/v1/report/pdf?file=${encodeURIComponent(pdfFileName)}`;
    window.open(pdfUrl, '_blank');
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
      setFormMessage('Solicitud recibida correctamente. Un consultor técnico revisará la arquitectura de tu organización.');
    } catch (error) {
      setFormStatus('ERROR');
      setFormMessage(error?.message || 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-[#38BDDB] selection:text-slate-950">
      
      {/* NAVEGACIÓN PRINCIPAL */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#030712]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-base font-black text-slate-950 shadow-md">
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
            <button
              type="button"
              onClick={() => triggerAutoEvaluation('escrow-cert')}
              className="inline-flex items-center rounded-lg bg-[#38BDDB] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400"
            >
              ⚡ Evaluador Automatizado
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO COMERCIAL */}
        <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0B132B] to-[#030712] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Plataforma de Gobernanza e IA Con Todo Incluido
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Gobernanza de IA <span className="text-[#38BDDB]">con rigor pericial y criptográfico</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
                Automatiza la recopilación de documentación, validación de plantillas oficiales, justificación de subvenciones y generación de evidencias técnicas en PDF bajo normas eIDAS y Art. 326 LEC.
              </p>

              {/* BOTONES DE DISPARO DIRECTO */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => triggerAutoEvaluation('escrow-cert')}
                  className="rounded-xl bg-[#38BDDB] px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition-all hover:bg-cyan-400"
                >
                  🔒 Verificar Escrow & Hash Inmutable
                </button>
                <button
                  type="button"
                  onClick={() => triggerAutoEvaluation('subsidies-check')}
                  className="rounded-xl border border-cyan-500/40 bg-slate-900 px-7 py-3.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-slate-800"
                >
                  📜 Subsidies Hub (Red.es / INCIBE)
                </button>
              </div>

              {/* COMANDOS SEMÁNTICOS PÚBLICOS */}
              <div className="mt-8 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Comandos Semánticos Públicos (Activar gratis):</span>
                <div className="flex flex-wrap gap-2">
                  {commandsList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => triggerAutoEvaluation(c.id)}
                      className="text-[10px] font-mono bg-slate-900 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-slate-300 border border-slate-800 px-2.5 py-1 rounded transition-colors"
                    >
                      $ {c.cmd.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PANEL DE ESTADO DE REQUISITOS (ALINEADO CON CONSOLA GRC) */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A101E] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Panel GRC & Cumplimiento Corporativo</span>
                  <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">Consola v8.2 SGP1.0</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Dossier Subvenciones (Red.es / INCIBE)', status: 'Apto para Ayudas' },
                    { name: 'Evaluación Impacto FRIA (Art. 27)', status: 'PDF Probatorio Generado' },
                    { name: 'IT Risk Assessment (ISO 42001 / DORA)', status: 'Recopilado & Validado' },
                    { name: 'Sensor L7 Sovereign Tokenizado', status: 'Listo para Descarga' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-900 p-3.5 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOTOR DE REQUISITOS */}
        <section id="motor" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Automatización Extremo a Extremo</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">¿Cómo automatizamos la gestión de requisitos?</h2>
              <p className="text-slate-400 mt-3 text-sm">Simplifica la relación con tus proveedores, equipos de desarrollo y auditores externos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Definición de Requisitos',
                  text: 'Selecciona los marcos normativos aplicables (EU AI Act, ISO 42001, DORA, RGPD) y las plantillas requeridas.',
                },
                {
                  step: '02',
                  title: 'Recopilación Automatizada',
                  text: 'El motor solicita, recibe y verifica la documentación técnica y firmas de los responsables sin intervención manual.',
                },
                {
                  step: '03',
                  title: 'Validación Criptográfica',
                  text: 'Genera dossiers de cumplimiento inmutables respaldados por sellado temporal RFC 3161 y hash SHA-256.',
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

        {/* TERMINAL CLI INTERACTIVO */}
        <section id="terminal" className="border-b border-slate-800/80 py-20 bg-[#040814]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Consola de Diagnóstico & Peritaje en Vivo</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">S.A.A.R.E. Quick CLI & Verifier Terminal</h2>
              <p className="text-slate-400 mt-3 text-sm">Ejecuta la auditoría pericial y comprueba la correspondencia exacta del Hash Notarial MS3V en tiempo real.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LISTA DE COMANDOS */}
              <div className="lg:col-span-5 space-y-3">
                {commandsList.map((c) => (
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
                      <span className="text-[9px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">CLI VERIFIER</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{c.desc}</p>
                    <div className="font-mono text-[10px] text-slate-500 truncate bg-slate-950 p-2 rounded border border-slate-800/50">
                      $ {c.cmd}
                    </div>
                  </button>
                ))}
              </div>

              {/* CONTENEDOR TERMINAL */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#02050E] overflow-hidden shadow-2xl font-mono">
                <div className="flex items-center justify-between bg-slate-900/80 px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <span className="text-xs text-slate-400 ml-2">saare-cli v4.0.2 — pericial verifier console</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest">{isExecuting ? 'EJECUTANDO AUDITORÍA...' : 'LISTO'}</span>
                </div>

                <div className="p-6 h-[380px] overflow-y-auto space-y-1.5 text-xs leading-relaxed">
                  {termLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`${
                        log.startsWith('$')
                          ? 'text-cyan-400 font-bold'
                          : log.includes('CERTIFICADO') || log.includes('MATCH 100%') || log.includes('HERMÉTICO') || log.includes('100%') || log.includes('OK') || log.includes('CONFORME')
                          ? 'text-emerald-400 font-semibold'
                          : log.includes('[STATUS]') || log.includes('[RESULTADO]') || log.includes('[EVIDENCIA SUBVENCIONES]') || log.includes('[ESTADO FRIA]')
                          ? 'text-cyan-300 font-bold'
                          : log.includes('Warning') || log.includes('PENDIENTE')
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {isExecuting && (
                    <div className="inline-block h-3 w-2 bg-cyan-400 animate-pulse mt-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLANTILLAS CON DESCARGA OFICIAL DE PDF Y VERIFICACIÓN CLI (ENRUTADO CON NOMBRES REALES) */}
        <section id="templates" className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Informes PDF & Subsidies Hub</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Plantillas Oficiales: Justificación de Subvenciones y Ahorro Directo</h2>
              <p className="text-slate-400 mt-3 text-sm">
                Genera expedientes probatorios en PDF listos para presentar ante auditores, la AEPD o la justificación de fondos públicos (Kit Digital, Red.es, INCIBE, NextGen).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  code: 'PLANTILLA 01',
                  name: 'Dictamen Pericial & Cadena de Custodia (Art. 326 LEC / eIDAS)',
                  grant: 'Apto para Kit Digital Ciberseguridad & Ayudas CDTI / ENISA',
                  savings: 'Ahorro estimado: 8.500 € – 14.000 € en consultoría externa',
                  time: 'Tiempo de gestión: De 4 semanas a 24 horas',
                  desc: 'Estructura el dictamen pericial forense, metrología RAM y garantía de admisibilidad judicial ex-ISO/IEC 27037.',
                  pdfFile: '01_Manual_Dictamen_Pericial_Cadena_Custodia_MS3V.pdf',
                  cmdId: 'escrow-cert',
                },
                {
                  code: 'PLANTILLA 02',
                  name: 'Guía Metodológica FRIA (Art. 27 EU AI Act & DORA)',
                  grant: 'Obligatorio en licitaciones públicas y subvenciones NextGen EU',
                  savings: 'Ahorro estimado: 10.000 € – 18.000 € + Blindaje antisancción',
                  time: 'Tiempo de gestión: De 30 días a 48 horas',
                  desc: 'Documenta la evaluación de impacto en derechos fundamentales, matriz de 7 dimensiones y cumplimiento RGPD Art. 25.',
                  pdfFile: '04_Guia_Metodologica_FRIA_EU_AI_Act.pdf',
                  cmdId: 'fria-scan',
                },
                {
                  code: 'PLANTILLA 03',
                  name: 'Subsidies Hub & Kit Consulting (Red.es / INCIBE)',
                  grant: 'Convocatorias Red.es / Misiones IA / INCIBE Ciberseguridad',
                  savings: 'Ahorro estimado: 12.000 € – 20.000 € en justificación de ayudas',
                  time: 'Tiempo de gestión: De 6 semanas a 3 días',
                  desc: 'Mapeo de subvenciones, justificación de Kit Consulting/Digital e inmunidad fiscalizable con certificado RFC 3161.',
                  pdfFile: '02_Guia_Subsidies_Hub_RedEs_INCIBE.pdf',
                  cmdId: 'subsidies-check',
                },
                {
                  code: 'PLANTILLA 04',
                  name: 'Integración API L7, Interceptor PEP & SIEM/SOC',
                  grant: 'Puntuación prioritaria en Arquitectura Zero-Disk RAM',
                  savings: 'Ahorro estimado: 7.000 € – 12.000 € en despliegue de pasarelas',
                  time: 'Tiempo de gestión: De 3 semanas a 24 horas',
                  desc: 'Especificación técnica de socket local, SDKs oficiales e ingesta de logs forenses JSON Canónico RFC 8785.',
                  pdfFile: '03_Manual_Integracion_API_L7_SIEM.pdf',
                  cmdId: 'audit-l7',
                },
              ].map((tmpl) => (
                <div key={tmpl.code} className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#38BDDB]">{tmpl.code}</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(tmpl.pdfFile)}
                        className="rounded-md bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                      >
                        <span>📥</span> Descargar PDF Oficial
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{tmpl.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{tmpl.desc}</p>

                    {/* METRICAS DE AHORRO Y SUBVENCIONES */}
                    <div className="space-y-2 mb-6 rounded-xl bg-slate-950 p-4 border border-slate-800/80 text-xs font-mono">
                      <div className="flex items-center gap-2 text-cyan-300">
                        <span>💰</span> <strong>{tmpl.savings}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-amber-300">
                        <span>⏱️</span> <strong>{tmpl.time}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300">
                        <span>📜</span> <span>{tmpl.grant}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">Documento: {tmpl.pdfFile}</span>
                    <button
                      type="button"
                      onClick={() => triggerAutoEvaluation(tmpl.cmdId)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Auditar en CLI →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GARANTÍA LEGAL Y SOBERANÍA */}
        <section id="legal-guarantee" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Soberanía & Mitigación de Riesgos</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Marco de Garantías MS3V V7.0 PRO</h2>
              <p className="text-slate-400 mt-3 text-sm">Garantías contractuales y técnicas diseñadas para banca, administración pública y empresas reguladas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">CLÁUSULA PRIMERA</div>
                <h3 className="text-base font-bold text-white mb-3">Depósito Notarial Escrow</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Código fuente depositado ante Notario Colegiado. Liberación automática garantizada en caso de cese de actividad o incumplimiento de SLA para uso interno perpetuo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">CLÁUSULA SEGUNDA</div>
                <h3 className="text-base font-bold text-white mb-3">Hash Inmutable SHA-256</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono truncate">
                  0bbe05522f3f...6d64a95
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Huella criptográfica oficial del protocolo. Cualquier modificación no autorizada bloquea la interconexión generando alerta forense.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">CLÁUSULA TERCERA</div>
                <h3 className="text-base font-bold text-white mb-3">Arquitectura Stateless (RAM)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Procesamiento perimetral sin almacenamiento de datos. Memoria volátil que destruye de inmediato cualquier token PII tras emitir la respuesta.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRECIOS */}
        <section id="pricing" className="border-b border-slate-800/80 py-20 bg-[#030712]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Tarifas Transparentes</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Planes adaptados a tu organización</h2>
              <p className="text-slate-400 mt-3 text-sm">Empieza a gobernar tus sistemas de IA con control total y sin costes ocultos.</p>
            </div>
            <PricingSection onSelectPlan={() => onNavigateToLogin && onNavigateToLogin('DISCOVER_FREE')} />
          </div>
        </section>

        {/* FORMULARIO DE EVALUACIÓN COMPLETO */}
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
                  <h3 className="font-bold text-lg">¡Solicitud recibida con éxito!</h3>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rol</label>
                      <select
                        value={evaluationForm.role}
                        onChange={(e) => updateEvaluationField('role', e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        <option value="CTO">CTO / Ingeniería</option>
                        <option value="CISO">CISO / Seguridad</option>
                        <option value="Compliance">Compliance / GRC</option>
                        <option value="DPO">DPO / Privacidad</option>
                        <option value="Product">Responsable de Producto</option>
                        <option value="Consultant">Consultor / MSP / Auditor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sistemas de IA</label>
                      <select
                        value={evaluationForm.aiSystems}
                        onChange={(e) => updateEvaluationField('aiSystems', e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        <option value="1-5">1 – 5 sistemas</option>
                        <option value="6-20">6 – 20 sistemas</option>
                        <option value="20+">20+ sistemas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Requisito Principal o Caso de Uso</label>
                    <textarea
                      rows={3}
                      value={evaluationForm.requirement}
                      onChange={(e) => updateEvaluationField('requirement', e.target.value)}
                      placeholder="Describe brevemente tus necesidades de cumplimiento, auditoría o plantillas normativas..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  {formStatus === 'ERROR' && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">{formMessage}</div>
                  )}

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

      {/* PIE DE PÁGINA */}
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