// saare-suite/src/LandingPage.jsx — Landing Comercial & GRC Enterprise S.A.A.R.E. v10.5.4
import React, { useState, useEffect } from 'react';
import PricingSection from './components/PricingSection';
import { API_HOST } from './api/api';

const NAV_ITEMS = [
  { label: 'Arquitectura', href: '#motor' },
  { label: 'Diferenciación', href: '#diferenciacion' },
  { label: 'Integración Proxy', href: '#integracion' },
  { label: 'Biblioteca de Evidencias', href: '#templates' },
  { label: 'Licenciamiento', href: '#pricing' },
];

export default function LandingPage({ onNavigateToLogin, onSelectPlan, onNavigateToLegal }) {
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  const [evaluationForm, setEvaluationForm] = useState({
    workEmail: '',
    company: '',
    role: 'CISO',
    aiSystems: '1-5',
    requirement: '',
    privacyAccepted: false,
  });

  const [formStatus, setFormStatus] = useState('IDLE');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    if (localStorage.getItem('saare_cookies_consent')) {
      setCookiesAccepted(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('saare_cookies_consent', 'true');
    setCookiesAccepted(true);
  };

  const handleDownloadPdf = (pdfFileName) => {
    const baseUrl = String(API_HOST || '').replace(/\/+$/, '');
    const pdfUrl = `${baseUrl}/api/v1/report/pdf?file=${encodeURIComponent(pdfFileName)}`;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const updateEvaluationField = (field, value) => {
    setEvaluationForm((current) => ({ ...current, [field]: value }));
  };

  const handleEvaluationSubmit = async (event) => {
    event.preventDefault();
    if (!evaluationForm.workEmail.trim() || !evaluationForm.company.trim() || !evaluationForm.privacyAccepted) return;

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
      setFormMessage('Solicitud recibida correctamente. Nuestro equipo técnico se pondrá en contacto para programar la evaluación ex ante.');
    } catch (error) {
      setFormStatus('ERROR');
      setFormMessage(error?.message || 'No se pudo conectar con el servidor.');
    }
  };

  // ACCESO DIRECTO SIN FRICCIÓN HACIA LA CONSOLA
  const handleAction = (plan = 'DISCOVER_FREE') => {
    if (typeof onSelectPlan === 'function') {
      onSelectPlan(plan);
    } else if (typeof onNavigateToLogin === 'function') {
      onNavigateToLogin(plan);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased selection:bg-[#38BDDB] selection:text-slate-950">
      
      {/* NAVEGACIÓN PRINCIPAL */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#030712]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-1.5 shadow-md transition-transform group-hover:scale-105">
              <img 
                src="/favicon.ico" 
                alt="S.A.A.R.E. Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="text-sm font-extrabold tracking-[0.16em] text-white">S.A.A.R.E.</div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Infraestructura de Gobernanza Ex Ante</div>
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
              onClick={() => handleAction('DISCOVER_FREE')}
              className="rounded-lg px-4 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white cursor-pointer"
            >
              Acceso Consola
            </button>
            <a
              href="#evaluation"
              className="inline-flex items-center rounded-lg bg-[#38BDDB] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400"
            >
              Solicitar Auditoría Ex Ante
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO — PRIMERA PANTALLA */}
        <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0B132B] via-[#050B18] to-[#030712] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                GOBERNANZA EX ANTE · SOBERANÍA TECNOLÓGICA · EVIDENCIA VERIFICABLE
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Controla la IA antes de que tus <span className="text-[#38BDDB]">datos salgan</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
                S.A.A.R.E. es una infraestructura de gobernanza y control preventivo para sistemas de inteligencia artificial. Intercepta y evalúa las solicitudes antes de su envío a los modelos, aplica políticas de seguridad y genera evidencias técnicas verificables de las operaciones.
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Un único plano de control para tus sistemas de IA. Independiente del modelo. Bajo tus políticas.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#evaluation"
                  className="rounded-xl bg-[#38BDDB] px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition-all hover:bg-cyan-400 inline-block text-center"
                >
                  Solicitar auditoría ex ante
                </a>
                <a
                  href="#integracion"
                  className="rounded-xl border border-cyan-500/40 bg-slate-900/80 px-7 py-3.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-slate-800 inline-block text-center"
                >
                  Ver Guía de Integración
                </a>
              </div>
              <p className="mt-4 text-[11px] text-slate-500 font-mono">
                Compatible con arquitecturas basadas en LLM externos y modelos desplegados en entornos propios, según la configuración de integración.
              </p>
            </div>

            {/* MONITOR / DIAGRAMA DE FLUJO TÉCNICO */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A101E] p-6 shadow-2xl font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Flujo Preventivo Perimetral L7</span>
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[10px] font-bold text-cyan-400">CONTROL ACTIVO</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">01. Solicitud Entrante:</span>
                    <span className="font-bold text-slate-200">Captura en Origen</span>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">02. PEP L7 (Saneamiento):</span>
                    <span className="font-bold text-cyan-400">Filtro Ex Ante (RAM 0x00)</span>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">03. Proveedor LLM / Modelo:</span>
                    <span className="font-bold text-purple-400">Inferencia Segura</span>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">04. Bóveda Dual / Trazas:</span>
                    <span className="font-bold text-emerald-400">Evidencia Criptográfica</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 01. EL PROBLEMA */}
        <section className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">01. EL PROBLEMA</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">La gobernanza no debería empezar después del incidente</h2>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Cuando una organización utiliza modelos de IA, necesita controlar qué información se comparte, qué políticas se aplican y cómo se demuestra lo ocurrido. La revisión documental por sí sola no impide que una solicitud contenga información sensible. Y un registro de actividad no equivale necesariamente a una evidencia íntegra y verificable. S.A.A.R.E. sitúa el control en el punto crítico: antes de que la información salga hacia el proveedor de IA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Exposición de información',
                  desc: 'Detección y tratamiento de datos sensibles antes del envío al modelo.',
                },
                {
                  title: 'Pérdida de control',
                  desc: 'Aplicación centralizada de políticas sobre los flujos de interacción con la IA.',
                },
                {
                  title: 'Trazabilidad insuficiente',
                  desc: 'Generación de registros y evidencias estructuradas para facilitar la revisión técnica.',
                },
                {
                  title: 'Dependencia tecnológica',
                  desc: 'Separación entre las políticas de gobernanza y el modelo de IA utilizado.',
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6 flex flex-col justify-between">
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02. LA ARQUITECTURA */}
        <section id="motor" className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">02. LA ARQUITECTURA</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Tres capas. Un mismo principio: control antes de ejecución.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 relative">
                <div className="absolute top-6 right-6 font-mono text-xl font-black text-cyan-500/40">01</div>
                <h3 className="text-lg font-bold text-white mb-3">PEP L7 · Control preventivo</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Evalúa las solicitudes en el perímetro antes de su envío al modelo de IA. Incluye capacidades de análisis orientadas a la prevención de fugas de datos, detección de información personal y secretos, protección frente a instrucciones maliciosas y aplicación de políticas de control.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 relative">
                <div className="absolute top-6 right-6 font-mono text-xl font-black text-cyan-500/40">02</div>
                <h3 className="text-lg font-bold text-white mb-3">Desacople semántico · Soberanía de políticas</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Las reglas de negocio y las políticas de validación se gestionan independientemente del proveedor de LLM, dentro de los límites de la arquitectura desplegada. Esto permite diseñar una estrategia de gobernanza que no dependa exclusivamente de un único modelo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 relative">
                <div className="absolute top-6 right-6 font-mono text-xl font-black text-cyan-500/40">03</div>
                <h3 className="text-lg font-bold text-white mb-3">Bóveda Dual · Evidencia verificable</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Genera trazas consolidadas y mecanismos de verificación de integridad mediante técnicas criptográficas, incluyendo firmas digitales y estructuras de tipo Merkle. Facilita la auditoría técnica y la investigación de incidentes sin conservación indiscriminada de prompts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 03. DIFERENCIACIÓN */}
        <section id="diferenciacion" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">03. DIFERENCIACIÓN</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">No es geospatial o documentación. Es control técnico de los flujos de IA.</h2>
              <p className="text-slate-400 mt-3 text-sm">La diferencia está en dónde se aplica el control y cómo se demuestra.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300 font-mono">
                    <th className="py-4 px-6 uppercase tracking-wider">Capacidad</th>
                    <th className="py-4 px-6 uppercase tracking-wider">Qué aporta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-400">
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-4 px-6 font-bold text-white">Filtrado ex ante</td>
                    <td className="py-4 px-6">Evalúa la información antes de su envío al LLM.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-4 px-6 font-bold text-white">Protección de datos</td>
                    <td className="py-4 px-6">Aplica controles para detectar y tratar información sensible.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-4 px-6 font-bold text-white">Políticas independientes del modelo</td>
                    <td className="py-4 px-6">Separa la gobernanza de la elección del proveedor de IA.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-4 px-6 font-bold text-white">Evidencias criptográficas</td>
                    <td className="py-4 px-6">Permite verificar la integridad de los registros generados.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-4 px-6 font-bold text-white">Arquitectura de auditoría</td>
                    <td className="py-4 px-6">Facilita la revisión de eventos y la investigación técnica.</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-4 px-6 font-bold text-white">Licenciamiento escalable</td>
                    <td className="py-4 px-6">Adapta la capacidad a pymes, integradores y organizaciones corporativas.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 04. GUÍA DE INTEGRACIÓN RÁPIDA (PROXY AGNÓSTICO) */}
        <section id="integracion" className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">04. GUÍA DE INTEGRACIÓN RÁPIDA</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Conecte su aplicación al Proxy de Gobernanza L7</h2>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Para enrutar sus peticiones de IA a través de la capa de cumplimiento ex-ante de S.A.A.R.E., solo necesita actualizar el destino de sus llamadas API o configurar su variable de entorno.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Opción A: Archivo .env */}
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white">Opción A: Cambiar la URL Base (.env)</h3>
                    <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[10px] font-bold text-cyan-400 font-mono">RECOMENDADO</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Si utiliza librerías estándar compatibles con OpenAI u otros proveedores, simplemente redirija la URL base del servicio en su configuración:
                  </p>
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-cyan-300 mb-4">
                    OPENAI_BASE_URL=https://api.saare.es/v1/proxy/llm
                  </div>
                  <p className="text-xs text-slate-400 mb-2 font-semibold">Cabeceras requeridas en la petición:</p>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-mono list-disc list-inside">
                    <li><span className="text-slate-400">Authorization:</span> Bearer sk_saare_live_su_token</li>
                    <li><span className="text-slate-400">x-saare-tenant:</span> NOMBRE_DE_SU_EMPRESA</li>
                    <li><span className="text-slate-400">x-saare-provider:</span> OPENAI (o GEMINI, ANTHROPIC, etc.)</li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                  Su código funcionará de inmediato pasando por la capa de seguridad sin modificaciones adicionales.
                </div>
              </div>

              {/* Opción B: Código Estándar */}
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white">Opción B: Llamada HTTP Directa</h3>
                    <span className="rounded bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 text-[10px] font-bold text-purple-400 font-mono">FETCH / AXIOS</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Ejemplo de integración mediante código estándar en su backend para auditar y sanear prompts antes de la inferencia:
                  </p>
                  <pre className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`const res = await fetch("https://api.saare.es/v1/proxy/llm", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk_saare_live_...",
    "x-saare-tenant": "ORGANISMO_DEMO_01",
    "x-saare-provider": "OPENAI"
  },
  body: JSON.stringify({
    model: "gpt-4o",
    prompt: "Auditoría de flujo corporativo ex ante"
  })
});`}
                  </pre>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                  Devuelve el veredicto ex ante, traza firmada en la Bóveda D1 y respuesta saneada en RAM.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05. GOBERNANZA Y CUMPLIMIENTO */}
        <section id="legal-guarantee" className="border-b border-slate-800/80 py-20 bg-[#030712]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">05. GOBERNANZA Y CUMPLIMIENTO</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Prepara tus procesos de IA para una supervisión demostrable</h2>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                S.A.A.R.E. está diseñado para apoyar la implantación de controles técnicos y procesos de gobernanza relacionados con:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <h3 className="text-sm font-bold text-white mb-2">Reglamento Europeo de IA (AI Act)</h3>
                <p className="text-xs text-slate-400">Apoyo técnico para sistemas de IA de alto riesgo y transparencia.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <h3 className="text-sm font-bold text-white mb-2">RGPD & Privacidad</h3>
                <p className="text-xs text-slate-400">Mitigación de riesgos en el tratamiento de datos personales en flujos LLM.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <h3 className="text-sm font-bold text-white mb-2">ISO/IEC 42001</h3>
                <p className="text-xs text-slate-400">Sistemas de gestión de inteligencia artificial y control operativo.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <h3 className="text-sm font-bold text-white mb-2">DORA & PCI DSS</h3>
                <p className="text-xs text-slate-400">Controles de seguridad relevantes para entornos financieros y críticos.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6 md:col-span-2">
                <h3 className="text-sm font-bold text-white mb-2">Gestión de Evidencias Digitales</h3>
                <p className="text-xs text-slate-400">Identificación, preservación y verificación de registros orientados a auditoría.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-xs text-amber-200/80 leading-relaxed font-mono">
              <p className="font-bold mb-1">Nota de responsabilidad legal y regulatoria:</p>
              La aplicabilidad de cada requisito depende del uso de la IA, la actividad de la organización, el contexto normativo y la configuración implantada. S.A.A.R.E. proporciona capacidades técnicas de apoyo a la gobernanza. La contratación de la plataforma no constituye por sí misma una certificación ni garantiza automáticamente el cumplimiento normativo.
            </div>

            <div className="mt-8 text-center">
              <a
                href="#evaluation"
                className="inline-flex items-center rounded-xl bg-slate-900 border border-cyan-500/40 px-6 py-3 text-xs font-bold text-cyan-300 hover:bg-slate-800 transition-all"
              >
                Solicitar una evaluación técnica
              </a>
            </div>
          </div>
        </section>

        {/* 06. LICENCIAMIENTO */}
        <section id="pricing" className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">06. LICENCIAMIENTO</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Empieza con el alcance que necesitas. Escala cuando tu operación lo requiera.</h2>
              <p className="text-slate-400 mt-3 text-sm">Precios en euros, IVA no incluido. Ahorra un 20% en modalidad anual (Sandbox permanente gratuito).</p>
            </div>
            
            <PricingSection onSelectPlan={handleAction} />
          </div>
        </section>

        {/* 07. PARA QUIÉN ES S.A.A.R.E. */}
        <section className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">07. PARA QUIÉN ES S.A.A.R.E.</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Una infraestructura para organizaciones que necesitan gobernar la IA de forma operativa.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8">
                <h3 className="text-base font-bold text-white mb-3">Empresas B2B y SaaS</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Controla los flujos de información y establece políticas para las interacciones con modelos de IA.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8">
                <h3 className="text-base font-bold text-white mb-3">Integradores y Consultoras</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Incorpora una capa de gobernanza a las soluciones de IA que implantas para tus clientes.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8">
                <h3 className="text-base font-bold text-white mb-3">Equipos de Seguridad y GRC</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Añade controles preventivos y mecanismos de trazabilidad a tu arquitectura de seguridad.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8">
                <h3 className="text-base font-bold text-white mb-3">Organizaciones Corporativas</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Evalúa despliegues dedicados, integración con sistemas existentes y necesidades específicas de auditoría.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 08. VALIDACIÓN TÉCNICA */}
        <section className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">08. VALIDACIÓN TÉCNICA</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Las capacidades deben poder demostrarse</h2>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                La confianza en una infraestructura de gobernanza no debería depender únicamente de declaraciones comerciales. Por eso, la evaluación técnica de S.A.A.R.E. puede centrarse en aspectos empíricos y verificables.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                'Pruebas de filtrado antes del envío al proveedor',
                'Verificación de las políticas efectivamente aplicadas',
                'Ensayos de tratamiento de información sensible',
                'Verificación criptográfica de registros y firmas',
                'Evaluación de los mecanismos de sellado temporal',
                'Pruebas de persistencia, retención y eliminación de datos',
                'Medición de latencia bajo una carga de trabajo definida',
              ].map((testItem, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-[#0A101E] p-5 flex items-start gap-3">
                  <span className="text-cyan-400 font-mono text-sm">✓</span>
                  <span className="text-xs text-slate-300 leading-relaxed">{testItem}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleDownloadPdf('04_ET_MS3V_Prueba_Reina_2026.pdf')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-cyan-500/40 px-7 py-3.5 text-sm font-semibold text-cyan-300 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>📥</span> Descargar Dossier Técnico de Pruebas Periciales
              </button>
            </div>
          </div>
        </section>

        {/* 09. LLAMADA FINAL A LA ACCIÓN */}
        <section id="evaluation" className="py-20 bg-slate-950">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-3xl border border-slate-800 bg-[#0A101E] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">09. EVALUACIÓN EX ANTE</span>
                <h2 className="text-3xl font-black text-white mt-2">Antes de confiar en un modelo, establece cómo se gobierna</h2>
                <p className="text-sm text-slate-400 mt-3">
                  Evalúa cómo S.A.A.R.E. puede incorporarse a tu arquitectura de IA, qué controles necesita tu organización y qué evidencias requiere tu proceso de auditoría.
                </p>
              </div>

              {formStatus === 'SUCCESS' ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-300">
                  <h3 className="font-bold text-lg">Solicitud registrada correctamente</h3>
                  <p className="text-xs mt-2">{formMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Correo Electrónico Corporativo *</label>
                      <input
                        type="email"
                        required
                        value={evaluationForm.workEmail}
                        onChange={(e) => updateEvaluationField('workEmail', e.target.value)}
                        placeholder="ciso@empresa.es"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Organización *</label>
                      <input
                        type="text"
                        required
                        value={evaluationForm.company}
                        onChange={(e) => updateEvaluationField('company', e.target.value)}
                        placeholder="Nombre de la entidad"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Responsabilidad Profesional</label>
                      <select
                        value={evaluationForm.role}
                        onChange={(e) => updateEvaluationField('role', e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        <option value="CISO">CISO / Dirección de Seguridad</option>
                        <option value="CTO">CTO / Dirección Tecnológica</option>
                        <option value="Compliance">Compliance / Responsable GRC</option>
                        <option value="DPO">DPO / Privacidad de Datos</option>
                        <option value="Consultant">Auditor / Consultor Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sistemas de IA Desplegados</label>
                      <select
                        value={evaluationForm.aiSystems}
                        onChange={(e) => updateEvaluationField('aiSystems', e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        <option value="1-5">1 – 5 sistemas</option>
                        <option value="6-20">6 – 20 sistemas</option>
                        <option value="20+">Más de 20 sistemas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Requisito Específico o Caso de Uso</label>
                    <textarea
                      rows={3}
                      value={evaluationForm.requirement}
                      onChange={(e) => updateEvaluationField('requirement', e.target.value)}
                      placeholder="Describa brevemente su arquitectura o necesidades de gobernanza ex ante..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      required
                      id="privacyAccepted"
                      checked={evaluationForm.privacyAccepted}
                      onChange={(e) => updateEvaluationField('privacyAccepted', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <label htmlFor="privacyAccepted" className="text-xs text-slate-400 leading-relaxed">
                      He leído y acepto la{' '}
                      <button 
                        type="button" 
                        onClick={() => onNavigateToLegal && onNavigateToLegal('privacy')} 
                        className="text-cyan-400 underline cursor-pointer hover:text-cyan-300"
                      >
                        Política de Privacidad
                      </button>
                      . Responsable: S.A.A.R.E. Technologies S.L. (Expediente Marco MS3V-RECON-VALID-2026). Finalidad: Gestión de solicitudes de evaluación de gobernanza ex ante.
                    </label>
                  </div>

                  {formStatus === 'ERROR' && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">{formMessage}</div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={formStatus === 'SUBMITTING' || !evaluationForm.privacyAccepted}
                      className="flex-1 rounded-xl bg-[#38BDDB] px-6 py-4 text-xs font-bold text-slate-950 shadow-lg transition-all hover:bg-cyan-400 disabled:opacity-50 cursor-pointer"
                    >
                      {formStatus === 'SUBMITTING' ? 'Procesando Solicitud...' : 'Solicitar auditoría ex ante'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('DISCOVER_FREE')}
                      className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-6 py-4 text-xs font-bold text-white hover:bg-slate-800 transition-all text-center cursor-pointer"
                    >
                      O comenzar con Sandbox gratuito
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* PIE DE PÁGINA */}
      <footer id="support" className="border-t border-slate-800/80 bg-slate-950 px-6 py-14">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-200">S.A.A.R.E. Technologies S.L. — Expediente MS3V-RECON-VALID-2026</p>
            <p className="text-[11px] text-slate-500">Infraestructura Tecnológica Global | RPI: RPI-2026-SAARE-0914X</p>
            <p className="text-[11px] text-slate-500 mt-2">Gobernanza ex ante. Soberanía tecnológica. Evidencia verificable.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-xs">
            <button type="button" onClick={() => onNavigateToLegal && onNavigateToLegal('terms')} className="hover:text-cyan-400 transition-colors cursor-pointer">Aviso Legal</button>
            <button type="button" onClick={() => onNavigateToLegal && onNavigateToLegal('privacy')} className="hover:text-cyan-400 transition-colors cursor-pointer">Privacidad</button>
            <button type="button" onClick={() => onNavigateToLegal && onNavigateToLegal('cookies')} className="hover:text-cyan-400 transition-colors cursor-pointer">Cookies</button>
          </div>
        </div>
      </footer>

      {/* BANNER DE COOKIES */}
      {!cookiesAccepted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#0A101E]/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 leading-relaxed text-center sm:text-left">
              <span className="font-bold text-white">Uso de Cookies Técnicas:</span> Este sitio utiliza exclusivamente cookies técnicas esenciales para garantizar la navegación y la gestión de sesión.{' '}
              <button onClick={() => onNavigateToLegal && onNavigateToLegal('cookies')} className="text-cyan-400 underline ml-1 cursor-pointer">Más información</button>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleAcceptCookies}
                className="rounded-lg bg-[#38BDDB] px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition-all hover:bg-cyan-400 cursor-pointer"
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}