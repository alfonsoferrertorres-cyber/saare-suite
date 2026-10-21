// saare-suite/src/LandingPage.jsx — Landing Comercial & GRC para S.A.A.R.E.

import React, { useState, useEffect } from 'react';
import PricingSection from './components/PricingSection';
import { API_HOST } from './api/api';

const NAV_ITEMS = [
  { label: 'Prueba Reina (L7)', href: '#motor' },
  { label: 'Biblioteca Forense', href: '#templates' },
  { label: 'Garantías y Cumplimiento', href: '#legal-guarantee' },
  { label: 'Licenciamiento', href: '#pricing' },
];

export default function LandingPage({ onNavigateToLogin, onNavigateToLegal }) {
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
    window.open(pdfUrl, '_blank');
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
      setFormMessage('Solicitud recibida correctamente. Su perfil ha sido priorizado para emisión de credenciales Ed25519 y auditoría ex-ante.');
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
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Gobernanza Ex-Ante & C++20 SOC</div>
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
              Acceso Consola
            </button>
            <a
              href="#evaluation"
              className="inline-flex items-center rounded-lg bg-[#38BDDB] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400"
            >
              Solicitar Auditoría Ex-Ante
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO COMERCIAL DE MÁXIMA TRACCIÓN */}
        <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0B132B] to-[#030712] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                ⚡ Expediente MS3V-RECON-VALID-2026-ALF-0521
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Gobernanza Ex-Ante y Cadena de Custodia para <span className="text-[#38BDDB]">Entornos de IA</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
                Frente a las auditorías reactivas anuales, S.A.A.R.E. blinda, audita y sella cada interacción de negocio en tiempo real. Admisible ante justicia forense (RFC 3161 / ISO 27037).
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#evaluation"
                  className="rounded-xl bg-[#38BDDB] px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition-all hover:bg-cyan-400 inline-block text-center"
                >
                  Solicitar Auditoría Ex-Ante
                </a>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf('04_ET_MS3V_Prueba_Reina_2026.pdf')}
                  className="rounded-xl border border-cyan-500/40 bg-slate-900 px-7 py-3.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-slate-800 inline-block text-center"
                >
                  📥 Descargar Informe L7 (Prueba Reina)
                </button>
              </div>
            </div>

            {/* PIPELINE FORENSE ACTIVO */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A101E] p-6 shadow-2xl font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Pipeline Forense v4.0.2</span>
                  <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">SISTEMA ACTIVADO</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Inbound Data Stream:</span>
                    <span className="font-bold text-emerald-400">[PASS 100%]</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">L7 Shield (Saneamiento RAM 0x00):</span>
                    <span className="font-bold text-cyan-400">Activo (&lt; 0.85 ms)</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Control SHA-256 / Ed25519:</span>
                    <span className="font-bold text-purple-400">RFC 8785 Compliant</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Retención en Disco:</span>
                    <span className="font-bold text-emerald-400">Zero-Disk (0.00%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 PILARES DE MÁXIMA FRICCIÓN CORPORATIVA */}
        <section id="motor" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Rigurosidad Judicial y Técnica</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">3 Pilares de Máxima Fricción Corporativa</h2>
              <p className="text-slate-400 mt-3 text-sm">Garantías diseñadas para soportar escrutinio perjudicial y cumplir de forma nativa con los marcos regulatorios europeos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Inmutabilidad de Origen (SHA-256)',
                  text: 'Cada prompt, lead o respuesta de IA recibe una huella matemática instantánea inalterable. Cualquier alteración posterior rompe el hash de forma inmediata y detectable.',
                },
                {
                  step: '02',
                  title: 'Cumplimiento Estricto (RGPD & EU AI Act)',
                  text: 'Limpieza de memoria volátil ex-ante (0x00) para garantizar Cero Fugas de Datos Personales (PII) tras el sellado de la cadena de custodia.',
                },
                {
                  step: '03',
                  title: 'Verificación Desintermediada',
                  text: 'Cualquier auditor, tribunal o cliente puede validar la integridad del expediente en milisegundos mediante un script libre de ejecución local (Node.js, Python, PowerShell).',
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

        {/* VALOR ESTRATÉGICO / C-LEVEL */}
        <section className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Ventajas Competitivas C-Level</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">¿Por qué los líderes eligen S.A.A.R.E.?</h2>
              <p className="text-slate-400 mt-3 text-sm">Argumentos comerciales y de seguridad jurídica concebidos para comités de dirección y DPOs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Gobernanza Ex-Ante en Tiempo Real',
                  desc: 'Mientras que la auditoría tradicional revisa logs de forma reactiva una vez al año, S.A.A.R.E. blinda y sella cada interacción de negocio al vuelo, permitiendo mitigación inmediata.',
                },
                {
                  title: 'Escudo Anti-Sanciones (-7% Global Fine Guard)',
                  desc: 'Protección robusta frente a la Ley de IA de la UE y DORA. Entrega automática de diligencia debida mediante expedientes matemáticamente incuestionables.',
                },
                {
                  title: 'Confianza de Grado Bancario',
                  desc: 'Permite a agencias y empresas posicionarse con un argumento comercial único: leads y procesos certificados bajo estándares de seguridad jurídica forense.',
                },
                {
                  title: 'Desintermediación de Auditorías',
                  desc: 'Cualquier auditor verifica la autenticidad en milisegundos ejecutando scripts locales libres, eliminando costes y fricciones técnicas.',
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BIBLIOTECA DOCUMENTAL Y FORENSE */}
        <section id="templates" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Verificabilidad Pública</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Biblioteca Documental y Pruebas Periciales</h2>
              <p className="text-slate-400 mt-3 text-sm">
                Descargue los informes técnicos, dictámenes de cadena de custodia y especificaciones periciales para validación directa por su CISO y departamento legal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  code: 'EVIDENCIA 01',
                  name: 'Informe Técnico: Prueba Reina y Traza L7',
                  desc: 'Validación empírica del motor C++20, interceptación de Tool-Calling AST y latencia sub-milisegundo.',
                  pdfFile: '04_ET_MS3V_Prueba_Reina_2026.pdf',
                },
                {
                  code: 'EVIDENCIA 02',
                  name: 'Certificado de Ingesta Cero y Soberanía',
                  desc: 'Garantía perimetral de procesamiento en memoria volátil sin exposición de datos a pasarelas externas.',
                  pdfFile: '02_Certificado_de_Ingesta_Cero_e_Integridad_Perimetral - S.A.A.R.E__signed.pdf',
                },
                {
                  code: 'EVIDENCIA 03',
                  name: 'Dictamen Pericial de Cadena de Custodia',
                  desc: 'Especificaciones técnicas sobre la gestión de registros y la seguridad documental ante auditorías.',
                  pdfFile: '01_Manual_Dictamen_Pericial_Cadena_Custodia_MS3V.pdf',
                },
                {
                  code: 'EVIDENCIA 04',
                  name: 'Guía Metodológica de Evaluación de Impacto (EU AI Act)',
                  desc: 'Orientaciones prácticas para el cumplimiento del artículo 27 y mitigación de riesgos algorítmicos.',
                  pdfFile: '04_Guia_Metodologica_FRIA_EU_AI_Act.pdf',
                },
                {
                  code: 'EVIDENCIA 05',
                  name: 'Manual de Integración API L7 y SIEM/SOC',
                  desc: 'Detalles de acoplamiento local y pautas de integración con herramientas corporativas de seguridad.',
                  pdfFile: '03_Manual_Integracion_API_L7_SIEM.pdf',
                },
                {
                  code: 'EVIDENCIA 06',
                  name: 'Plan Maestro de Ventas y Estrategia OEM',
                  desc: 'Documento ejecutivo de alineamiento estratégico, modelos de licenciamiento y hoja de ruta tecnológica.',
                  pdfFile: 'S.A.A.R.E. v7.0 & Motor MS3V - Plan Maestro de Ventas.pdf',
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
                        <span>📥</span> Descargar PDF
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{tmpl.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{tmpl.desc}</p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">Archivo oficial: {tmpl.pdfFile}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GARANTÍA Y MARCO DE SEGURIDAD */}
        <section id="legal-guarantee" className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Tranquilidad para Dirección</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Garantías Técnicas y Jurídicas</h2>
              <p className="text-slate-400 mt-3 text-sm">Diseñado bajo los estándares más estrictos exigidos por auditores internacionales y comités de cumplimiento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">CUMPLIMIENTO NORMATIVO</div>
                <h3 className="text-base font-bold text-white mb-3">EU AI Act & ISO 42001</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generación automatizada de evidencias probatorias listas para auditorías de sistemas de inteligencia artificial de alto riesgo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">SOBERANÍA ABSOLUTA</div>
                <h3 className="text-base font-bold text-white mb-3">Infraestructura Air-Gapped</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Operación completamente autónoma sin dependencias de servicios externos ni fugas de telemetría fuera del perímetro corporativo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">RESPALDO Criptográfico</div>
                <h3 className="text-base font-bold text-white mb-3">Atestación Ed25519</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cada evento y registro de auditoría cuenta con firma criptográfica inmutable que garantiza la integridad absoluta de los datos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRECIOS */}
        <section id="pricing" className="border-b border-slate-800/80 py-20 bg-[#030712]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Licenciamiento Comercial</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Planes adaptados a su organización</h2>
              <p className="text-slate-400 mt-3 text-sm">Elija el modelo de despliegue perimetral que mejor se adapte a sus volúmenes operativos.</p>
            </div>
            <PricingSection onSelectPlan={() => onNavigateToLogin && onNavigateToLogin('DISCOVER_FREE')} />
          </div>
        </section>

        {/* FORMULARIO DE EVALUACIÓN / PILOT PROGRAM */}
        <section id="evaluation" className="py-20 bg-slate-950">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-3xl border border-slate-800 bg-[#0A101E] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Acceso Prioritario</span>
                <h2 className="text-3xl font-black text-white mt-2">Solicite una Auditoría Ex-Ante</h2>
                <p className="text-sm text-slate-400 mt-3">Compruebe el rendimiento del motor C++20 y la intercepción L7 directamente en su entorno corporativo.</p>
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
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Correo Electrónico Profesional *</label>
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
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Empresa *</label>
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
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rol Profesional</label>
                      <select
                        value={evaluationForm.role}
                        onChange={(e) => updateEvaluationField('role', e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        <option value="CISO">CISO / Seguridad</option>
                        <option value="CTO">CTO / Dirección Técnica</option>
                        <option value="Compliance">Compliance / GRC</option>
                        <option value="DPO">DPO / Privacidad</option>
                        <option value="Consultant">Consultor / Auditor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sistemas de IA en Uso</label>
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
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Requisito Técnico o Caso de Uso</label>
                    <textarea
                      rows={3}
                      value={evaluationForm.requirement}
                      onChange={(e) => updateEvaluationField('requirement', e.target.value)}
                      placeholder="Indique si requiere validación de Tool-Calling AST o despliegue On-Premise..."
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
                      Acepto la <span onClick={() => onNavigateToLegal && onNavigateToLegal('privacy')} className="text-cyan-400 underline cursor-pointer">Política de Privacidad</span>. 
                      Responsable: Alfonso Ferrer Torres (NIF: 48553065L). Finalidad: Gestión de solicitudes de evaluación técnica GRC.
                    </label>
                  </div>

                  {formStatus === 'ERROR' && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">{formMessage}</div>
                  )}

                  <button
                    type="submit"
                    disabled={formStatus === 'SUBMITTING' || !evaluationForm.privacyAccepted}
                    className="w-full rounded-xl bg-[#38BDDB] px-6 py-4 text-xs font-bold text-slate-950 shadow-lg transition-all hover:bg-cyan-400 disabled:opacity-50"
                  >
                    {formStatus === 'SUBMITTING' ? 'Procesando Solicitud...' : 'Solicitar Auditoría Ex-Ante'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* PIE DE PÁGINA (LSSI-CE ART. 10) */}
      <footer id="support" className="border-t border-slate-800/80 bg-slate-950 px-6 py-14">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-200">S.A.A.R.E. SL — Expediente MS3V-RECON-VALID-2026-ALF-0521</p>
            <p className="text-[11px] text-slate-500">Titular: Alfonso Ferrer Torres (NIF: 48553065L) | RPI: RPI-2026-SAARE-0914X</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-xs">
            <button type="button" onClick={() => onNavigateToLegal && onNavigateToLegal('terms')} className="hover:text-cyan-400 transition-colors">Aviso Legal</button>
            <button type="button" onClick={() => onNavigateToLegal && onNavigateToLegal('privacy')} className="hover:text-cyan-400 transition-colors">Privacidad</button>
            <button type="button" onClick={() => onNavigateToLegal && onNavigateToLegal('cookies')} className="hover:text-cyan-400 transition-colors">Cookies</button>
          </div>
        </div>
      </footer>

      {/* BANNER DE COOKIES */}
      {!cookiesAccepted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#0A101E]/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 leading-relaxed text-center sm:text-left">
              <span className="font-bold text-white">Uso de Cookies Técnicas:</span> Este sitio web utiliza exclusivamente cookies técnicas esenciales para garantizar el funcionamiento del sitio. 
              <button onClick={() => onNavigateToLegal && onNavigateToLegal('cookies')} className="text-cyan-400 underline ml-1">Más información</button>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleAcceptCookies}
                className="rounded-lg bg-[#38BDDB] px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg transition-all hover:bg-cyan-400"
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