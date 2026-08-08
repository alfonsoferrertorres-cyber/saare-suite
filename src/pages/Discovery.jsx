import React, { useState } from 'react';

export default function Discovery() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'CISO / Security Leader',
    env: 'AWS Cloud',
    useCase: 'Agentic Workflows & MCP',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'discovery',
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role,
          environment: formData.env,
          useCase: formData.useCase,
          complianceNeeds: formData.complianceNeeds
        })
      });

      if (response.ok) {
        setSubmitted(true);
        triggerPDFDownload();
      } else {
        alert('Error al procesar la solicitud.');
      }
    } catch (error) {
      console.error('Error enviando la solicitud:', error);
      alert('No se pudo conectar con el servidor backend en http://localhost:8080');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-4 py-1.5 rounded-full border border-[#00f0ff]/20 inline-block">
            Path 01 • Discovery Assessment
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Audit Your AI Security Posture
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Evaluate your current runtime vulnerability against prompt injection, data exfiltration, and unverified LLM API forwarding in a local sandbox environment.
          </p>
        </div>

        {/* ASSESSMENT SCOPE BOX */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-6 max-w-3xl mx-auto backdrop-blur-md">
          <div className="border-b border-slate-800 pb-4">
            <span className="font-mono text-[10px] text-[#C5A059] font-bold uppercase tracking-wider">Evaluation Methodology</span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">Assessment Scope & Deliverables</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#050811] border border-slate-800/80 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-[#00f0ff]">01. Profiling</span>
              <p className="text-xs text-slate-400 mt-2">Runtime prompt injection vulnerability profiling using standardized test suites.</p>
            </div>
            <div className="bg-[#050811] border border-slate-800/80 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-[#C5A059]">02. Leak Analysis</span>
              <p className="text-xs text-slate-400 mt-2">Outbound payload PII/PHI leak detection and unencrypted data flow inspection.</p>
            </div>
            <div className="bg-[#050811] border border-slate-800/80 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-purple-400">03. Mapping</span>
              <p className="text-xs text-slate-400 mt-2">Shadow AI API usage and unauthorized endpoint mapping across active tools.</p>
            </div>
          </div>

          {/* TRIGGER BUTTON TO OPEN FORM MODAL */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-block bg-[#00f0ff] hover:bg-[#38bdf8] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#00f0ff]/20 cursor-pointer"
            >
              Request Discovery Access
            </button>
          </div>
        </div>

      </div>

      {/* DISCOVERY FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#050811] border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
            >
              ✕
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-2.5 py-1 rounded border border-[#00f0ff]/30">
                    Discovery Access Request
                  </span>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white">
                  Request Discovery Access
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your operational context to tailor the sandbox environment and risk profile evaluation.
                </p>

                <div className="space-y-3 pt-2">
                  
                  {/* Row 1: Name and Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name *</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                        placeholder="e.g. Carlos Mendoza"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Organization / Company *</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                        placeholder="e.g. SAARE Tech Inc."
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email and Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Corporate Email *</label>
                      <input
                        required
                        type="email"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                        placeholder="carlos@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Role / Function</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff] cursor-pointer"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="CISO / Security Leader">CISO / Security Leader</option>
                        <option value="CTO / Chief Architect">CTO / Chief Architect</option>
                        <option value="DataSec / AI Governance">DataSec / AI Governance</option>
                        <option value="Product Owner / ISV Lead">Product Owner / ISV Lead</option>
                        <option value="Compliance / DPO">Compliance / DPO</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Deployment Target and Workload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Deployment Target</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff] cursor-pointer"
                        value={formData.env}
                        onChange={(e) => setFormData({ ...formData, env: e.target.value })}
                      >
                        <option value="AWS Cloud">AWS Cloud</option>
                        <option value="Microsoft Azure">Microsoft Azure</option>
                        <option value="Google Cloud Platform">Google Cloud Platform</option>
                        <option value="On-Premise / Air-Gapped">On-Premise / Air-Gapped</option>
                        <option value="Embedded SDK (OEM)">Embedded SDK (OEM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Primary AI Workload</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff] cursor-pointer"
                        value={formData.useCase}
                        onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                      >
                        <option value="Agentic Workflows & MCP">Agentic Workflows & MCP</option>
                        <option value="Enterprise RAG / Knowledge Base">Enterprise RAG / Knowledge Base</option>
                        <option value="External Customer Copilots">External Customer Copilots</option>
                        <option value="Multi-LLM Gateway / Router">Multi-LLM Gateway / Router</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-Select Compliance Frameworks */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      Target Compliance Frameworks
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
                                ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {active ? `✓ ${fw}` : `+ ${fw}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-[#00f0ff] text-black font-extrabold text-xs py-3.5 rounded-lg uppercase tracking-wider hover:bg-[#38bdf8] transition-all disabled:opacity-50 cursor-pointer font-mono shadow-lg shadow-[#00f0ff]/20"
                >
                  {loading ? 'Processing Request...' : 'Submit Discovery Request'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-[#00f0ff]/10 border border-[#00f0ff] rounded-full flex items-center justify-center mx-auto text-[#00f0ff] font-bold text-2xl">
                  ✓
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Discovery Access Confirmed</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Thank you, <span className="text-[#00f0ff] font-bold">{formData.name}</span> ({formData.company}). Your assessment parameters have been registered. The evaluation package download has initiated.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-4 bg-slate-800 text-slate-200 border border-slate-700 text-xs px-8 py-3 rounded-xl hover:text-white cursor-pointer font-mono uppercase tracking-wider"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}