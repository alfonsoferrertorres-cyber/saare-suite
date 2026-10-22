// saare-suite/src/LandingPage.jsx — Landing Comercial & GRC Enterprise S.A.A.R.E. v10.5.2

import React, { useState, useEffect } from 'react';
import PricingSection from './components/PricingSection';
import { API_HOST } from './api/api';

const NAV_ITEMS = [
  { label: 'Arquitectura L7', href: '#motor' },
  { label: 'Biblioteca de Evidencias', href: '#templates' },
  { label: 'Garantías Normativas', href: '#legal-guarantee' },
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
      setFormMessage('Solicitud recibida correctamente. Nuestro equipo de GRC se pondrá en contacto para programar la evaluación perimetral ex-ante.');
    } catch (error) {
      setFormStatus('ERROR');
      setFormMessage(error?.message || 'No se pudo conectar con el servidor.');
    }
  };

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
            {/* LOGO DE LA EMPRESA (Referencia segura al recurso público) */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-1.5 shadow-md transition-transform group-hover:scale-105">
              <img 
                src="/favicon.ico" 
                alt="S.A.A.R.E. Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-none">
              <div className="text-sm font-extrabold tracking-[0.16em] text-white">S.A.A.R.E.</div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Gobernanza Ex-Ante & Soberanía LLM</div>
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
              className="rounded-lg px-4 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white"
            >
              Acceso Consola
            </button>
            <a
              href="#evaluation"
              className="inline-flex items-center rounded-lg bg-[#38BDDB] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400"
            >
              Solicitar Evaluación GRC
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO ESTRATÉGICO */}
        <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0B132B] via-[#050B18] to-[#030712] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                🛡️ Expediente Técnico MS3V-RECON-VALID-2026-ALF-0521
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                Gobernanza Ex-Ante y Cadena de Custodia Criptográfica para <span className="text-[#38BDDB]">IA Enterprise</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
                Supere la auditoría reactiva tradicional. S.A.A.R.E. intercepta, sanea información confidencial en memoria volátil epímera y certifica cada interacción algorítmica con plena validez probatoria (eIDAS / RFC 3161) antes de la salida perimetral.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#evaluation"
                  className="rounded-xl bg-[#38BDDB] px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition-all hover:bg-cyan-400 inline-block text-center"
                >
                  Solicitar Evaluación GRC
                </a>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf('04_ET_MS3V_Prueba_Reina_2026.pdf')}
                  className="rounded-xl border border-cyan-500/40 bg-slate-900/80 px-7 py-3.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-slate-800 inline-block text-center"
                >
                  📄 Dossier Técnico de Arquitectura L7
                </button>
              </div>
            </div>

            {/* MONITOR DE INTERCEPTACIÓN EN TIEMPO REAL */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A101E] p-6 shadow-2xl font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Ecosistema Perimetral Capa 7</span>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-400">PERÍMETRO BLINDADO</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Interceptación Ex-Ante (RAM):</span>
                    <span className="font-bold text-cyan-400">Latencia P99 ≤ 1.12 ms</span>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Saneamiento 7D de PII y Secreción:</span>
                    <span className="font-bold text-emerald-400">Sanitize (0x00) Ephemeral</span>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Firma Criptográfica:</span>
                    <span className="font-bold text-purple-400">Ed25519 / Merkle Tree</span>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Trazabilidad en Bóveda D1:</span>
                    <span className="font-bold text-emerald-400">Inmutable RFC 8785</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 PILARES DE EXCELENCIA OPERATIVA */}
        <section id="motor" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Solidez Técnica y Seguridad Jurídica</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Pilares de Gobernanza Algorítmica</h2>
              <p className="text-slate-400 mt-3 text-sm">Garantías diseñadas para resistir auditorías forenses exigentes y cumplir con la legislación europea.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Inviolabilidad y Cadena de Custodia',
                  text: 'Cada solicitud, payload o respuesta algorítmica recibe un sello matemático inalterable en origen. Cualquier intento de alteración posterior invalida de forma inmediata la firma de integridad.',
                },
                {
                  step: '02',
                  title: 'Saneamiento Preventivo Ex-Ante',
                  text: 'Eliminación y enmascaramiento automático de datos personales (PII), credenciales y secretos comerciales en memoria volátil epímera antes de enviar la petición a proveedores LLM.',
                },
                {
                  step: '03',
                  title: 'Verificación Autónoma e Independiente',
                  text: 'Auditores, tribunales y reguladores pueden certificar la autenticidad del expediente probatorio en milisegundos ejecutando verificadores de código abierto (Art. 326 LEC).',
                },
              ].map((card) => (
                <div key={card.step} className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 relative hover:border-cyan-500/30 transition-all">
                  <div className="absolute top-6 right-6 font-mono text-2xl font-black text-slate-800">{card.step}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALOR ESTRATÉGICO C-LEVEL */}
        <section className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Propuesta de Valor Corporativa</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">¿Por qué los Comités de Dirección eligen S.A.A.R.E.?</h2>
              <p className="text-slate-400 mt-3 text-sm">Protección integral y ventaja competitiva para CISOs, DPOs y Departamentos Jurídicos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Mitigación de Riesgos en Tiempo Real',
                  desc: 'A diferencia de los controles a posteriori, S.A.A.R.E. evalúa y blinda cada interacción algorítmica en tiempo real, bloqueando desviaciones y accesos no autorizados antes de que tengan impacto.',
                },
                {
                  title: 'Escudo Normativo (EU AI Act & DORA)',
                  desc: 'Alineamiento nativo con las directrices de Inteligencia Artificial de la UE y DORA. Generación automática de diligencia debida con expedientes probatorios inalterables.',
                },
                {
                  title: 'Despliegue Zero-Touch mediante GPO Enterprise',
                  desc: 'Inyección transparente en el perímetro corporativo sin necesidad de modificar el código de sus aplicaciones ni instalar agentes pesados en los dispositivos.',
                },
                {
                  title: 'Gobernanza LLM Agnóstica y Multi-Cloud',
                  desc: 'Compatibilidad nativa con los principales proveedores de modelos (Google Gemini, OpenAI, Anthropic, DeepSeek) e infraestructura privada On-Premise.',
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-[#0A101E] p-8 hover:border-slate-700 transition-all">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BIBLIOTECA DOCUMENTAL Y DE EVIDENCIAS */}
        <section id="templates" className="border-b border-slate-800/80 py-20 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Verificabilidad y Transparencia</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Biblioteca Documental y Expedientes Periciales</h2>
              <p className="text-slate-400 mt-3 text-sm">
                Acceda a la documentación técnica, dictámenes periciales y manuales de integración para su validación por parte del CISO y el área legal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  code: 'EVIDENCIA 01',
                  name: 'Dossier Técnico de Arquitectura L7 y Validación Latencia',
                  desc: 'Documentación de arquitectura sobre interceptación perimetral Capa 7 y rendimiento sub-milisegundo.',
                  pdfFile: '04_ET_MS3V_Prueba_Reina_2026.pdf',
                },
                {
                  code: 'EVIDENCIA 02',
                  name: 'Certificado de Ingesta Cero y Soberanía Perimetral',
                  desc: 'Atestación de procesamiento en memoria volátil y protección contra la exfiltración no autorizada de datos.',
                  pdfFile: '02_Certificado_de_Ingesta_Cero_e_Integridad_Perimetral - S.A.A.R.E__signed.pdf',
                },
                {
                  code: 'EVIDENCIA 03',
                  name: 'Dictamen Pericial de Cadena de Custodia',
                  desc: 'Especificación probatoria sobre trazabilidad y custodia de evidencias conforme a estándares judiciales.',
                  pdfFile: '01_Manual_Dictamen_Pericial_Cadena_Custodia_MS3V.pdf',
                },
                {
                  code: 'EVIDENCIA 04',
                  name: 'Guía Metodológica de Evaluación de Impacto (EU AI Act)',
                  desc: 'Marco operativo para el cumplimiento del artículo 27 de la Ley de IA de la Unión Europea.',
                  pdfFile: '04_Guia_Metodologica_FRIA_EU_AI_Act.pdf',
                },
                {
                  code: 'EVIDENCIA 05',
                  name: 'Manual de Integración API L7 y SOC/SIEM Corporate',
                  desc: 'Guía de interconexión con sistemas SIEM corporativos y centralización de eventos de seguridad.',
                  pdfFile: '03_Manual_Integracion_API_L7_SIEM.pdf',
                },
                {
                  code: 'EVIDENCIA 06',
                  name: 'Memoria de Alineamiento Normativo y Especificación GRC',
                  desc: 'Resumen ejecutivo para comités de cumplimiento y marcos de licencias gubernamentales.',
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
                        className="rounded-md bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                      >
                        <span>📥</span> Descargar Documento
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{tmpl.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{tmpl.desc}</p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">Documento Oficial: {tmpl.pdfFile}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GARANTÍAS Y MARCO NORMATIVO */}
        <section id="legal-guarantee" className="border-b border-slate-800/80 py-20 bg-[#060A17]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Respaldo Institucional</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Garantías Técnicas y Regulatorias</h2>
              <p className="text-slate-400 mt-3 text-sm">Arquitectura alineada con las exigencias del marco legal europeo y auditorías corporativas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">MARCO NORMATIVO</div>
                <h3 className="text-base font-bold text-white mb-3">EU AI Act & ISO 42001</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generación automatizada de evidencias probatorias y registros de cumplimiento para entornos de alto riesgo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">SOBERANÍA ABSOLUTA</div>
                <h3 className="text-base font-bold text-white mb-3">Infraestructura Air-Gapped</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Operación sin dependencias externas ni transferencia indebida de telemetría fuera del límite corporativo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0A101E] p-6">
                <div className="text-cyan-400 font-mono text-xs font-bold mb-2">RESPALDO CRIPTOGRÁFICO</div>
                <h3 className="text-base font-bold text-white mb-3">Atestación Ed25519</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Firma digital inmutable que certifica la autenticidad e integridad de cada transacción auditada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LICENCIAMIENTO */}
        <section id="pricing" className="border-b border-slate-800/80 py-20 bg-[#030712]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Modelos de Adopción</span>
              <h2 className="text-3xl font-black text-white sm:text-4xl mt-3">Planes de Licenciamiento Corporativo</h2>
              <p className="text-slate-400 mt-3 text-sm">Seleccione la modalidad de despliegue que responda al volumen y nivel de exigencia de su organización.</p>
            </div>
            <PricingSection onSelectPlan={handleAction} />
          </div>
        </section>

        {/* SOLICITUD DE EVALUACIÓN GRC */}
        <section id="evaluation" className="py-20 bg-slate-950">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-3xl border border-slate-800 bg-[#0A101E] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#38BDDB]">Programa de Evaluación GRC</span>
                <h2 className="text-3xl font-black text-white mt-2">Solicite una Evaluación Ex-Ante</h2>
                <p className="text-sm text-slate-400 mt-3">Verifique el rendimiento de la interceptación perimetral y el saneamiento en tiempo real dentro de su organización.</p>
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
                      placeholder="Describa brevemente si requiere integración con SIEM, política GPO o despliegue On-Premise..."
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
                      He leído y acepto la <span onClick={() => onNavigateToLegal && onNavigateToLegal('privacy')} className="text-cyan-400 underline cursor-pointer">Política de Privacidad</span>. 
                      Responsable del tratamiento: Alfonso Ferrer Torres (NIF: 48553065L). Finalidad: Atención de solicitudes de evaluación de gobernanza ex-ante.
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
                    {formStatus === 'SUBMITTING' ? 'Procesando Solicitud...' : 'Enviar Solicitud de Evaluación'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* PIE DE PÁGINA REGULATORIO */}
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

      {/* BANNER DE COOKIES TÉCNICAS */}
      {!cookiesAccepted && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#0A101E]/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 leading-relaxed text-center sm:text-left">
              <span className="font-bold text-white">Uso de Cookies Técnicas:</span> Este portal utiliza exclusivamente cookies técnicas esenciales para posibilitar la navegación y la gestión de la sesión. 
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