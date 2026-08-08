import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('enterprise'); // 'enterprise' or 'oem'
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Enhanced dynamic form state
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

  const openSpecificModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: modalType,
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
        triggerPDFDownload(); // Automated PDF download upon successful lead submission
      } else {
        alert('Error processing request. Please check server logs.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Could not connect to backend server at http://localhost:8080');
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
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/30 inline-block">
            SAARE Platform • Licensing & Acquisition Models
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Choose Your Deployment Path
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Select the operational model best suited for your assessment, production, or OEM integration phase.
          </p>

          {/* DOCUMENT DOWNLOAD BUTTONS */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <a
              href="/docs/SAARE-Technical-Whitepaper-v14.pdf"
              download="SAARE-Technical-Whitepaper-v14.pdf"
              className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-[#00f0ff] text-slate-200 hover:text-[#00f0ff] text-xs font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <svg className="w-4 h-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Technical Whitepaper (PDF)</span>
            </a>

            <a
              href="/docs/SAARE-Technical-Whitepaper-v16.pdf"
              download="SAARE-Technical-Whitepaper-v16.pdf"
              className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-[#C5A059] text-slate-200 hover:text-[#C5A059] text-xs font-mono rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Verification Spec V16 (PDF)</span>
            </a>
          </div>
        </div>

        {/* PRIMARY PATHS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* EVALUATE */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl flex flex-col justify-between hover:border-[#00f0ff]/50 transition-all">
            <div>
              <span className="text-[10px] font-mono text-[#00f0ff] font-bold tracking-widest uppercase bg-[#00f0ff]/10 px-3 py-1 rounded border border-[#00f0ff]/20">
                PATH 01 • EVALUATION
              </span>
              <h3 className="text-2xl font-serif font-bold text-white mt-4 mb-2">Want to evaluate SAARE?</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Access the Discovery Assessment environment to audit your runtime posture and identify operational risks.
              </p>
            </div>
            <Link
              to="/discovery"
              className="w-full text-center bg-slate-800 hover:bg-slate-700 text-[#00f0ff] border border-[#00f0ff]/40 font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
            >
              Start Discovery
            </Link>
          </div>

          {/* DEPLOY */}
          <div className="border border-[#C5A059]/60 bg-[#C5A059]/5 p-8 rounded-2xl flex flex-col justify-between relative shadow-[0_0_25px_rgba(197,160,89,0.08)]">
            <div>
              <span className="text-[10px] font-mono text-[#C5A059] font-bold tracking-widest uppercase bg-[#C5A059]/10 px-3 py-1 rounded border border-[#C5A059]/30">
                PATH 02 • PRODUCTION
              </span>
              <h3 className="text-2xl font-serif font-bold text-white mt-4 mb-2">Want to deploy the platform?</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Request a technical architecture review to define an Enterprise licensing model or OEM connector tailored to your infrastructure.
              </p>
            </div>
            <button
              onClick={() => openSpecificModal('enterprise')}
              className="w-full text-center bg-[#C5A059] hover:bg-[#d6b16a] text-black font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-[#C5A059]/20 cursor-pointer"
            >
              Request Architecture
            </button>
          </div>

        </div>

        {/* DEPLOYMENT MATRIX */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-[#00f0ff]">Discovery</th>
                <th className="py-3 px-4 text-slate-200">Professional</th>
                <th className="py-3 px-4 text-[#C5A059]">Enterprise</th>
                <th className="py-3 px-4 text-purple-400">OEM / ISV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Objective</td>
                <td className="py-3 px-4">Evaluate</td>
                <td className="py-3 px-4">Prototype / PoC</td>
                <td className="py-3 px-4">Production Ops</td>
                <td className="py-3 px-4">Integrate / Resell</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Deployment</td>
                <td className="py-3 px-4">Local Sandbox</td>
                <td className="py-3 px-4">Cloud / PoC</td>
                <td className="py-3 px-4">On-Prem / Air-Gapped</td>
                <td className="py-3 px-4">Embedded SDK</td>
              </tr>
              <tr className="bg-slate-900/60 font-bold">
                <td className="py-3 px-4 text-white">Primary Action</td>
                <td className="py-3 px-4">
                  <Link to="/discovery" className="text-[#00f0ff] underline">Start Discovery</Link>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => openSpecificModal('enterprise')} className="text-slate-200 underline cursor-pointer">Contact Sales</button>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => openSpecificModal('enterprise')} className="text-[#C5A059] underline cursor-pointer">Request Arch.</button>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => openSpecificModal('oem')} className="text-purple-400 underline cursor-pointer">Talk to OEM</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* ENHANCED ADAPTIVE MODAL */}
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
                  <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-2.5 py-1 rounded border border-[#C5A059]/30">
                    {modalType === 'oem' ? 'OEM / ISV Partner Request' : 'Enterprise Architecture Review'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white">
                  {modalType === 'oem' ? 'Request OEM Integration Blueprint' : 'Request Architecture Specification'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your operational context to help our engineering team tailor the deployment topology and technical review.
                </p>

                <div className="space-y-3 pt-2">
                  
                  {/* Row 1: Name and Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name *</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        placeholder="carlos@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Role / Function</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
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
                                ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059] font-bold'
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
                  className="w-full mt-4 bg-[#C5A059] text-black font-extrabold text-xs py-3.5 rounded-lg uppercase tracking-wider hover:bg-[#d6b16a] transition-all disabled:opacity-50 cursor-pointer font-mono shadow-lg shadow-[#C5A059]/20"
                >
                  {loading ? 'Processing Request...' : 'Submit Architecture Request'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-[#00f0ff]/10 border border-[#00f0ff] rounded-full flex items-center justify-center mx-auto text-[#00f0ff] font-bold text-2xl">
                  ✓
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Architecture Request Confirmed</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Thank you, <span className="text-[#C5A059] font-bold">{formData.name}</span> ({formData.company}). Your technical parameters for <span className="text-[#00f0ff] font-bold">{formData.env}</span> have been registered. The technical documentation package download has initiated.
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