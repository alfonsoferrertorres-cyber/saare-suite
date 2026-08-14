import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('enterprise');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'CISO / Lider de Seguridad',
    env: 'AWS Cloud',
    useCase: 'Flujos AgÃ©nticos y MCP',
    complianceNeeds: ['EU AI Act']
  });

  const handleComplianceToggle = (framework) => {
    setFormData(prev => {
      const exists = prev.complianceNeeds.includes(framework);
      if (exists) {
        return { ...prev, complianceNeeds: prev.complianceNeeds.filter(f => f !== framework) };
      } else {
        return { ...prev, complianceNeeds: [...prev.complianceNeeds, framework] };
      }
    });
  };

  const triggerPDFDownload = () => {
    const link = document.createElement('a');
    link.href = '/docs/SAARE-Technical-Whitepaper-v14.pdf';
    link.download = 'SAARE-Technical-Whitepaper-v14.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerTrustReportDownload = () => {
    const link = document.createElement('a');
    link.href = '/docs/SAARE-Informe-Confianza-Verificacion-IA.pdf';
    link.download = 'SAARE-Informe-Confianza-Verificacion-IA.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openSpecificModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const sendAuditLog = async (promptText) => {
  try {
    const isSensitive = /tarjeta|secret_key|admin|password/i.test(promptText);
    await fetch('http://localhost:3001/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        usuario: 'USUARIO-WEB',
        decision: isSensitive ? 'RECHAZADO' : 'PERMITIDO'
      })
    });
  } catch (e) { console.error(e); }
};
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: modalType === 'oem' ? 'OEM_INTEGRATION' : 'ENTERPRISE_EVALUATION',
          company: formData.company || formData.name,
          email: formData.email,
          name: formData.name,
          role: formData.role,
          environment: formData.env,
          useCase: formData.useCase,
          complianceNeeds: formData.complianceNeeds.join(', ')
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setSubmitted(true);
        triggerPDFDownload();
      } else {
        alert(`Error al procesar la solicitud: ${data.error || 'Verifique el correo introducido.'}`);
      }
    } catch (error) {
      console.error('Error enviando la solicitud:', error);
      alert('No se pudo conectar con el servidor de licencias.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-4 sm:px-6 font-sans relative overflow-hidden border-t border-slate-900">
      
      {/* CAPA DE IMAGEN DE FONDO REALZADA (GRC_BG.JPG) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url('/grc_bg.jpg')` }}
      />
      
      {/* MÃSCARA MÃS LIGERA PARA PERMITIR TRASLUCIDEZ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/30 via-[#050811]/60 to-[#050811]/80 pointer-events-none" />

      {/* Resplandor ambiental sobrio en oro */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C5A059]/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/40 inline-block backdrop-blur-md">
            PLATAFORMA S.A.A.R.E. â€¢ MODELOS DE LICENCIAMIENTO
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-[#C5A059] leading-tight drop-shadow-md">
            Seleccione su Ruta de Despliegue
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed drop-shadow">
            Seleccione el modelo operativo que mejor se adapte a su fase de evaluaciÃ³n, producciÃ³n o integraciÃ³n OEM.
          </p>

          {/* BOTONES DE DESCARGA DE DOCUMENTACIÃ“N Y PAQUETE DE CONFIANZA */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={triggerTrustReportDownload}
              className="px-4 py-2 bg-[#0B0F19]/90 border border-[#C5A059]/60 hover:border-[#C5A059] text-[#C5A059] hover:text-white text-xs font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xl backdrop-blur-md"
            >
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Paquete de Confianza y VerificaciÃ³n (PDF)</span>
            </button>

            <a
              href="/docs/SAARE-Technical-Whitepaper-v14.pdf"
              download="SAARE-Technical-Whitepaper-v14.pdf"
              className="px-4 py-2 bg-[#0B0F19]/90 border border-slate-700 hover:border-[#C5A059] text-slate-200 hover:text-[#C5A059] text-xs font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xl backdrop-blur-md"
            >
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documento TÃ©cnico (PDF)</span>
            </a>
          </div>
        </div>

        {/* RESUMEN EXPLICATIVO DE OPCIONES Y PERFILES */}
        <div className="bg-[#0B0F19]/80 border border-[#C5A059]/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md max-w-5xl mx-auto space-y-4 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#C5A059] border-b border-slate-800 pb-3">
            Opciones de Puesta en Marcha y Perfiles Profesionales
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Esta secciÃ³n permite a organizaciones de cualquier escala estructurar la adopciÃ³n del Runtime de Gobernanza S.A.A.R.E. mediante dos opciones principales alineadas con su madurez tÃ©cnica:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#050811]/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-mono text-xs text-[#C5A059] font-bold uppercase tracking-wider block">
                01. Ruta de EvaluaciÃ³n (Discovery)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Para quiÃ©n es:</strong> CISOs, DPOs, LÃ­deres de Compliance, Auditores y Responsables de IA.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permite auditar en tiempo de ejecuciÃ³n las llamadas a LLMs en un entorno aislado (Sandbox) sin impacto en producciÃ³n, detectando fugas de PII, inyecciones de cÃ³digo y brechas normativas antes de la adquisiciÃ³n final.
              </p>
            </div>

            <div className="bg-[#050811]/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-mono text-xs text-[#C5A059] font-bold uppercase tracking-wider block">
                02. Ruta de ProducciÃ³n e IntegraciÃ³n (Enterprise & OEM)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Para quiÃ©n es:</strong> CTOs, Arquitectos Principales de Software, Equipos de DevOps y Fabricantes ISV/OEM.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                DiseÃ±ada para la activaciÃ³n inmediata del escudo de seguridad a nivel Cloud (Gateway Sidecar) o embebido como SDK nativo en productos de software de terceros con SLA de latencia asegurado.
              </p>
            </div>
          </div>
        </div>

        {/* CUADROS PRINCIPALES DE OPCIONES CON PASARELA DIRECTA DE STRIPE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* RUTA 01: EVALUAR */}
          <div className="border border-slate-800 bg-[#0B0F19]/75 backdrop-blur-md p-8 rounded-2xl flex flex-col justify-between hover:border-[#C5A059] hover:shadow-[0_0_30px_rgba(197,160,89,0.2)] transition-all duration-300">
            <div>
              <div className="mb-6 flex items-center justify-center gap-3">
                <div className="w-1/2 h-28 rounded-lg border border-slate-800 bg-white p-2 flex items-center justify-center overflow-hidden shadow-inner">
                  <img 
                    src="/Â¿Quieres evaluar SAARE.png" 
                    alt="Â¿Quieres evaluar SAARE?" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="w-1/2 h-28 rounded-lg border border-slate-800 bg-white p-2 flex items-center justify-center overflow-hidden shadow-inner">
                  <img 
                    src="/Â¿Quieres evaluar SAARE2.jpeg" 
                    alt="Â¿Quieres evaluar SAARE? 2" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-serif font-bold text-white mb-3 text-center">
                Â¿Quieres evaluar S.A.A.R.E.?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 text-center">
                Acceda al entorno de evaluaciÃ³n Discovery para auditar su estado de ejecuciÃ³n en tiempo real e identificar riesgos operativos.
              </p>
            </div>
            <Link
              to="/discovery"
              className="w-full text-center bg-[#C5A059]/20 hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059]/50 font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer block shadow-lg font-mono"
            >
              Comienza el Descubrimiento
            </Link>
          </div>

          {/* RUTA 02: PRODUCCIÃ“N CON ENLACES STRIPE DIRECTOS */}
          <div className="border border-[#C5A059]/60 bg-[#0B0F19]/75 backdrop-blur-md p-8 rounded-2xl flex flex-col justify-between relative shadow-[0_0_30px_rgba(197,160,89,0.15)] hover:shadow-[0_0_35px_rgba(197,160,89,0.25)] transition-all duration-300">
            <div>
              <div className="mb-6 flex items-center justify-center gap-3">
                <div className="w-1/2 h-28 rounded-lg border border-slate-800 bg-white p-2 flex items-center justify-center overflow-hidden shadow-inner">
                  <img 
                    src="/Â¿Desea implementar la plataforma.png" 
                    alt="Implementar Plataforma" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="w-1/2 h-28 rounded-lg border border-slate-800 bg-white p-2 flex items-center justify-center overflow-hidden shadow-inner">
                  <img 
                    src="/Â¿Desea implementar la plataforma2.jpeg" 
                    alt="Implementar Plataforma 2" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-serif font-bold text-white mb-3 text-center">
                Â¿Desea implementar la plataforma?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 text-center">
                Solicite una revisiÃ³n de la arquitectura tÃ©cnica o adquiera directamente una licencia de producciÃ³n para su configuraciÃ³n inmediata.
              </p>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <a
                href="https://buy.stripe.com/6oUeVd1vv19P3BV1JH8g001"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#C5A059] hover:bg-white text-black font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-[#C5A059]/20 cursor-pointer block font-mono"
              >
                Comprar Licencia Premium (490,00 â‚¬ / mes)
              </a>

              <a
                href="https://buy.stripe.com/fZu00j7TTbOtdcvgEB8g000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer block font-mono"
              >
                Comprar Licencia Base (180,00 â‚¬ / mes)
              </a>

              <button
                onClick={() => openSpecificModal('enterprise')}
                className="w-full text-center bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-bold text-[11px] py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer block font-sans"
              >
                Solicitar RevisiÃ³n de Arquitectura
              </button>
            </div>
          </div>

        </div>

        {/* TABLA DE MATRIZ DE LICENCIAMIENTO CON ENLACES DIRECTOS */}
        <div className="border border-[#C5A059]/50 rounded-2xl p-6 sm:p-10 shadow-[0_0_40px_rgba(197,160,89,0.2)] relative overflow-hidden bg-[#0B0F19]/60 backdrop-blur-md">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800/80 pb-6 mb-6 gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/15 px-3.5 py-1.5 rounded-md border border-[#C5A059]/40 inline-block mb-2 font-semibold">
                MATRIZ DE CAPACIDADES Y DESPLIEGUE
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-wide">
                Comparativa de Licenciamiento S.A.A.R.E.
              </h3>
            </div>
            <div className="font-mono text-xs text-slate-200 bg-[#050811]/80 px-4 py-2 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-md">
              SLA Garantizado &bull; Zero-Disk RAM
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-700/80 text-[#C5A059] uppercase tracking-wider text-xs sm:text-sm font-bold">
                  <th className="py-4 px-5 bg-[#050811]/50 backdrop-blur-md rounded-l-xl">CaracterÃ­stica</th>
                  <th className="py-4 px-5 text-center bg-[#050811]/30 backdrop-blur-md">Descubrimiento</th>
                  <th className="py-4 px-5 text-center bg-[#050811]/50 backdrop-blur-md text-white">Licencia Base</th>
                  <th className="py-4 px-5 text-center bg-[#050811]/30 backdrop-blur-md text-[#C5A059]">Licencia Premium</th>
                  <th className="py-4 px-5 text-center bg-[#050811]/50 backdrop-blur-md rounded-r-xl text-slate-200">OEM / ISV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm text-slate-200">
                <tr className="hover:bg-[#050811]/50 transition-colors backdrop-blur-sm">
                  <td className="py-4 px-5 font-bold text-white bg-[#050811]/40 text-sm">Objetivo</td>
                  <td className="py-4 px-5 text-center">Evaluar Postura / AuditorÃ­a</td>
                  <td className="py-4 px-5 text-center">Operaciones Base de ProducciÃ³n</td>
                  <td className="py-4 px-5 text-center font-bold text-white">ProducciÃ³n Avanzada & MCP</td>
                  <td className="py-4 px-5 text-center text-slate-300">Integrar / Revender en Software</td>
                </tr>

                <tr className="hover:bg-[#050811]/50 transition-colors backdrop-blur-sm">
                  <td className="py-4 px-5 font-bold text-white bg-[#050811]/40 text-sm">Despliegue</td>
                  <td className="py-4 px-5 text-center">Entorno Local Sandbox</td>
                  <td className="py-4 px-5 text-center">Sidecar / Proxy Cloud Gateway</td>
                  <td className="py-4 px-5 text-center font-bold text-white">On-Premise / Air-Gapped</td>
                  <td className="py-4 px-5 text-center text-slate-300">LibrerÃ­a SDK Embebida (DLL/SO)</td>
                </tr>

                <tr className="hover:bg-[#050811]/50 transition-colors backdrop-blur-sm">
                  <td className="py-4 px-5 font-bold text-white bg-[#050811]/40 text-sm">Latencia L7</td>
                  <td className="py-4 px-5 text-center text-slate-300 font-semibold">&lt; 5.0 ms</td>
                  <td className="py-4 px-5 text-center font-mono text-slate-200 font-extrabold text-sm">&lt; 1.16 ms</td>
                  <td className="py-4 px-5 text-center font-mono text-[#C5A059] font-extrabold text-sm">&lt; 0.82 ms</td>
                  <td className="py-4 px-5 text-center font-mono text-[#C5A059] font-extrabold text-sm">&lt; 0.42 ms</td>
                </tr>

                <tr className="bg-[#050811]/80 font-bold border-t-2 border-slate-700 backdrop-blur-md">
                  <td className="py-5 px-5 text-white uppercase font-mono text-xs sm:text-sm bg-[#050811]/50">AcciÃ³n Principal</td>
                  
                  <td className="py-5 px-4 text-center">
                    <Link 
                      to="/discovery" 
                      className="inline-block w-full py-2.5 px-3 bg-[#C5A059]/20 hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059]/60 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-md"
                    >
                      Iniciar Descubrimiento
                    </Link>
                  </td>

                  <td className="py-5 px-4 text-center">
                    <a 
                      href="https://buy.stripe.com/fZu00j7TTbOtdcvgEB8g000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                      Comprar (180â‚¬/mes)
                    </a>
                  </td>

                  <td className="py-5 px-4 text-center">
                    <a 
                      href="https://buy.stripe.com/6oUeVd1vv19P3BV1JH8g001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full py-2.5 px-3 bg-[#C5A059] hover:bg-white text-black font-extrabold rounded-lg text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C5A059]/20"
                    >
                      Comprar (490â‚¬/mes)
                    </a>
                  </td>

                  <td className="py-5 px-4 text-center">
                    <button 
                      onClick={() => openSpecificModal('oem')} 
                      className="inline-block w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      Contactar OEM
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 font-mono gap-2">
            <span>âœ¦ Todos los modelos incluyen aislamiento Zero-Disk en memoria RAM y firma criptogrÃ¡fica Ed25519.</span>
            <span className="text-[#C5A059] font-bold">Licenciamiento Oficial Protocolo S.A.A.R.E.</span>
          </div>
        </div>

        {/* SECCIÃ“N DETALLADA: DERECHOS Y CARACTERÃSTICAS INCLUIDAS POR LICENCIA */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Detalles y CaracterÃ­sticas Incluidas por Licencia
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Desglose de derechos de uso, capacidades tÃ©cnicas y niveles de soporte tÃ©cnico incluidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD LICENCIA BASE */}
            <div className="bg-[#0B0F19]/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-lg text-white">LICENCIA BASE</h3>
                  <span className="text-xs font-mono text-[#C5A059] font-bold">180,00 â‚¬ / mes</span>
                </div>
                <ul className="space-y-2.5 text-xs font-mono text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Despliegue como Sidecar Proxy Cloud Gateway.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Registro de auditorÃ­a de llamadas a LLM en RAM.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Controles bÃ¡sicos de mitigaciÃ³n de fugas de PII.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>SupervisiÃ³n bÃ¡sica de cumplimiento normativo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Soporte tÃ©cnico estÃ¡ndar vÃ­a ticket.</span>
                  </li>
                </ul>
              </div>
              <a
                href="https://buy.stripe.com/fZu00j7TTbOtdcvgEB8g000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all block font-mono mt-4"
              >
                Adquirir Licencia Base
              </a>
            </div>

            {/* CARD LICENCIA PREMIUM (DESTACADA) */}
            <div className="bg-[#0B0F19]/90 border border-[#C5A059] rounded-2xl p-6 backdrop-blur-md space-y-4 hover:shadow-[0_0_30px_rgba(197,160,89,0.2)] transition-all shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C5A059] text-black font-extrabold text-[10px] font-mono px-3 py-0.5 rounded-full uppercase tracking-wider">
                Recomendado Enterprise
              </div>
              <div className="space-y-3 pt-1">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#C5A059]">LICENCIA PREMIUM</h3>
                  <span className="text-xs font-mono text-white font-bold">490,00 â‚¬ / mes</span>
                </div>
                <ul className="space-y-2.5 text-xs font-mono text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span><strong>Todo lo incluido</strong> en la Licencia Base.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Motor de SanitizaciÃ³n MCP Integrado.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>SanitizaciÃ³n local avanzada de entradas (Sanitizer).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Acceso a API de informes de auditorÃ­a avanzados.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Soporte tÃ©cnico prioritario (SLA &lt; 4 horas).</span>
                  </li>
                </ul>
              </div>
              <a
                href="https://buy.stripe.com/6oUeVd1vv19P3BV1JH8g001"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#C5A059] hover:bg-white text-black font-extrabold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all block font-mono shadow-md shadow-[#C5A059]/20 mt-4"
              >
                Adquirir Licencia Premium
              </a>
            </div>

            {/* CARD OEM / ISV */}
            <div className="bg-[#0B0F19]/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-lg text-white">OEM / ISV</h3>
                  <span className="text-xs font-mono text-slate-400 font-bold">A Medida / Contactar</span>
                </div>
                <ul className="space-y-2.5 text-xs font-mono text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>LibrerÃ­a SDK Embebida para sanitizaciÃ³n local.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Aislamiento local completo en DLL/SO.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Derecho de co-branding y distribuciÃ³n comercial.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>IngenierÃ­a de integraciÃ³n dedicada.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C5A059] font-bold">âœ“</span>
                    <span>Acuerdos de licenciamiento OEM personalizados.</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openSpecificModal('oem')}
                className="w-full text-center bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all block font-mono cursor-pointer mt-4"
              >
                Solicitar Licencia OEM
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ADAPTIVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#050811] border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
            >
              âœ•
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-2.5 py-1 rounded border border-[#C5A059]/30">
                    {modalType === 'oem' ? 'Solicitud de Socio OEM / ISV' : 'RevisiÃ³n de Arquitectura Enterprise'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white">
                  {modalType === 'oem' ? 'Solicitar Modelo de IntegraciÃ³n OEM' : 'Solicitar EspecificaciÃ³n de Arquitectura'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Proporcione su contexto operativo para ayudar a nuestro equipo tÃ©cnico a adaptar la topologÃ­a de despliegue.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Nombre Completo *</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="Ej. Carlos Mendoza"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">OrganizaciÃ³n / Empresa *</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="Ej. SAARE Tech Inc."
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Correo Corporativo *</label>
                      <input
                        required
                        type="email"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="carlos@empresa.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Cargo / FunciÃ³n</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="CISO / Lider de Seguridad">CISO / LÃ­der de Seguridad</option>
                        <option value="CTO / Arquitecto Principal">CTO / Arquitecto Principal</option>
                        <option value="Gobernanza de IA">Gobernanza de IA</option>
                        <option value="LÃ­der ISV / Producto">LÃ­der ISV / Producto</option>
                        <option value="Compliance / DPO">Compliance / DPO</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Entorno de Despliegue</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
                        value={formData.env}
                        onChange={(e) => setFormData({ ...formData, env: e.target.value })}
                      >
                        <option value="AWS Cloud">AWS Cloud</option>
                        <option value="Microsoft Azure">Microsoft Azure</option>
                        <option value="Google Cloud Platform">Google Cloud Platform</option>
                        <option value="On-Premise / Air-Gapped">On-Premise / Air-Gapped</option>
                        <option value="SDK Embebido (OEM)">SDK Embebido (OEM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Carga de Trabajo Principal</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
                        value={formData.useCase}
                        onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                      >
                        <option value="Flujos AgÃ©nticos y MCP">Flujos AgÃ©nticos y MCP</option>
                        <option value="RAG Empresarial / Base de Conocimiento">RAG Empresarial</option>
                        <option value="Copilotos Externos">Copilotos Externos</option>
                        <option value="Pasarela Multi-LLM">Pasarela Multi-LLM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      Marcos Normativos Objetivo
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['EU AI Act', 'GDPR', 'DORA', 'ISO/IEC 42001'].map((fw) => {
                        const active = formData.complianceNeeds.includes(fw);
                        return (
                          <button
                            key={fw}
                            type="button"
                            onClick={() => handleComplianceToggle(fw)}
                            className={`px-2.5 py-1.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                              active
                                ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059] font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {active ? `âœ“ ${fw}` : `+ ${fw}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-[#C5A059] text-black font-extrabold text-xs py-3.5 rounded-lg uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50 cursor-pointer font-mono shadow-lg shadow-[#C5A059]/20"
                >
                  {loading ? 'Procesando...' : 'Enviar Solicitud de Arquitectura'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-[#C5A059]/10 border border-[#C5A059] rounded-full flex items-center justify-center mx-auto text-[#C5A059] font-bold text-2xl">
                  âœ“
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Solicitud Confirmada</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Gracias, <span className="text-[#C5A059] font-bold">{formData.name}</span> ({formData.company}). Sus parÃ¡metros tÃ©cnicos para <span className="text-[#C5A059] font-bold">{formData.env}</span> han sido registrados.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-4 bg-slate-800 text-slate-200 border border-slate-700 text-xs px-8 py-3 rounded-xl hover:text-white cursor-pointer font-mono uppercase tracking-wider"
                >
                  Cerrar Ventana
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

