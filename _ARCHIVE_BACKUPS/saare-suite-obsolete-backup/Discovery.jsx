import React, { useState, useEffect } from 'react';

export default function Discovery() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'CISO / LÃ­der de Seguridad',
    env: 'AWS Cloud',
    useCase: 'Flujos AgÃ©nticos y MCP',
    complianceNeeds: ['EU AI Act']
  });

  // Bloquear scroll de pantalla cuando el modal estÃ¡ activo
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplianceToggle = (framework) => {
    setFormData(prev => ({
      ...prev,
      complianceNeeds: prev.complianceNeeds.includes(framework)
        ? prev.complianceNeeds.filter(f => f !== framework)
        : [...prev.complianceNeeds, framework]
    }));
  };

  const triggerPDFDownload = () => {
    const pdfUrl = '/docs/SAARE-Technical-Whitepaper-v14.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'SAARE-Technical-Whitepaper-v14.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
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
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISCOVERY_ASSESSMENT',
          company: formData.company.trim() || formData.name.trim(),
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          environment: formData.env,
          useCase: formData.useCase,
          complianceNeeds: formData.complianceNeeds.join(', ')
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.success || data.license || data.status === 'success')) {
        setSubmitted(true);
        triggerPDFDownload();
      } else {
        alert(`Error al procesar la solicitud: ${data.error || data.details || 'Verifique el correo introducido.'}`);
      }
    } catch (error) {
      console.error('Error enviando la solicitud:', error);
      alert('No se pudo conectar con el servidor backend.');
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
      
      {/* CAPA DE IMAGEN DE FONDO (GRC_BG.JPG) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url('/grc_bg.jpg')` }}
      />
      
      {/* MÃSCARA DE DEGRADADO PARA TRASLUCIDEZ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/30 via-[#050811]/60 to-[#050811]/85 pointer-events-none" />

      {/* Resplandor ambiental sobrio en oro */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C5A059]/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/40 inline-block backdrop-blur-md">
            ENTORNO DE EVALUACIÃ“N â€¢ DISCOVERY ASSESSMENT
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-[#C5A059] leading-tight drop-shadow-md">
            Audite la Postura de Seguridad de su IA
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto drop-shadow">
            Avance en un entorno local seguro (Sandbox) para auditar vulnerabilidades en tiempo de ejecuciÃ³n, prevenir fugas de datos confidenciales y verificar el cumplimiento regulatorio antes de un despliegue masivo.
          </p>
        </div>

        {/* BLOQUE INTRODUCTORIO DE ORIENTACIÃ“N: DÃ“NDE ESTÃ Y PROPÃ“SITO */}
        <div className="bg-[#0B0F19]/90 border border-[#C5A059]/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md max-w-4xl mx-auto space-y-4 shadow-xl text-left font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/15 px-3 py-1 rounded-md border border-[#C5A059]/40 font-bold">
              FASE DE EVALUACIÃ“N TÃ‰CNICA
            </span>
            <span className="font-mono text-xs text-slate-400 hidden sm:inline-block">
              Entorno de Pruebas Sandbox & Diagnostics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold font-mono text-[#C5A059] uppercase tracking-wider">
                Â¿DÃ³nde se encuentra?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                EstÃ¡ en el <strong className="text-white">Portal de Descubrimiento S.A.A.R.E.</strong>, la ruta de evaluaciÃ³n previa al despliegue en producciÃ³n diseÃ±ada para equipos de Ciberseguridad, Compliance y Arquitectura.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold font-mono text-[#C5A059] uppercase tracking-wider">
                Â¿CuÃ¡l es el propÃ³sito?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Auditar sin impacto en sus sistemas reales el comportamiento del trÃ¡fico hacia modelos de IA, medir la latencia del middleware y verificar el bloqueo de inyecciones y datos PII/PHI.
              </p>
            </div>
          </div>
        </div>

        {/* METODOLOGÃA Y PUNTOS A EVALUAR */}
        <div className="bg-[#0B0F19]/80 border border-[#C5A059]/40 p-6 sm:p-8 rounded-2xl space-y-6 max-w-4xl mx-auto backdrop-blur-md shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="font-mono text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              METODOLOGÃA DE EVALUACIÃ“N
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              Alcance del AnÃ¡lisis y Entregables TÃ©cnicos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#050811]/70 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-[#C5A059]">01. Perfilado de Riesgos</span>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                EvaluaciÃ³n de vulnerabilidades frente a inyecciones de prompt directas e indirectas mediante conjuntos de pruebas estandarizados.
              </p>
            </div>

            <div className="bg-[#050811]/70 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-white">02. Fugas de Datos (PII/PHI)</span>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                InspecciÃ³n ex-ante en memoria RAM para la detecciÃ³n de datos sensibles y enmascaramiento determinista antes del reenvÃ­o a la nube.
              </p>
            </div>

            <div className="bg-[#050811]/70 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-slate-400">03. Mapeo Shadow AI</span>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                IdentificaciÃ³n de endpoints no autorizados y llamadas directas no verificadas a proveedores de LLM dentro de la infraestructura.
              </p>
            </div>
          </div>

          {/* LISTA RESUMEN DE PUNTOS A EVALUAR */}
          <div className="pt-2 border-t border-slate-800/80">
            <h3 className="text-sm font-serif font-bold text-[#C5A059] mb-3">
              Capacidades de AuditorÃ­a del Entorno Discovery:
            </h3>
            <ul className="text-xs font-mono text-slate-300 space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <li className="flex items-center gap-2">
                <span className="text-[#C5A059] font-bold">âœ“</span> Aislamiento volÃ¡til Zero-Disk en memoria RAM
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#C5A059] font-bold">âœ“</span> MediciÃ³n de latencia L7 sub-milisegundo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#C5A059] font-bold">âœ“</span> Trazabilidad criptogrÃ¡fica Ed25519
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#C5A059] font-bold">âœ“</span> Control agÃ©ntico y guardarraÃ­les para MCP
              </li>
            </ul>
          </div>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-block bg-[#C5A059] hover:bg-white text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg hover:shadow-[#C5A059]/20 cursor-pointer font-mono"
            >
              Solicitar Acceso a Discovery
            </button>
          </div>
        </div>

      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#050811] border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
            <button
              onClick={closeModal}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
            >
              âœ•
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-2.5 py-1 rounded border border-[#C5A059]/30">
                    Solicitud de Acceso Discovery
                  </span>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white">
                  Solicitar Acceso a EvaluaciÃ³n Discovery
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Proporcione su contexto operativo para personalizar el entorno Sandbox y la evaluaciÃ³n del perfil de riesgo.
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
                        onChange={(e) => handleInputChange('name', e.target.value)}
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
                        onChange={(e) => handleInputChange('company', e.target.value)}
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
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Cargo / FunciÃ³n</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
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
                        onChange={(e) => handleInputChange('env', e.target.value)}
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
                        onChange={(e) => handleInputChange('useCase', e.target.value)}
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
                  {loading ? 'Procesando...' : 'Enviar Solicitud Discovery'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-[#C5A059]/10 border border-[#C5A059] rounded-full flex items-center justify-center mx-auto text-[#C5A059] font-bold text-2xl">
                  âœ“
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Acceso Discovery Confirmado</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Gracias, <span className="text-[#C5A059] font-bold">{formData.name}</span> ({formData.company}). Sus parÃ¡metros de evaluaciÃ³n han sido registrados. El paquete de documentaciÃ³n tÃ©cnica se ha iniciado automÃ¡ticamente.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={triggerPDFDownload}
                    className="text-xs text-[#C5A059] underline hover:text-white cursor-pointer font-mono"
                  >
                    Â¿No se descargÃ³ automÃ¡ticamente? Haga clic aquÃ­
                  </button>
                  <button
                    onClick={closeModal}
                    className="mt-2 bg-slate-800 text-slate-200 border border-slate-700 text-xs px-8 py-3 rounded-xl hover:text-white cursor-pointer font-mono uppercase tracking-wider"
                  >
                    Cerrar Ventana
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

