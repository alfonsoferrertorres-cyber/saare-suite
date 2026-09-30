import React, { useState } from 'react';

export default function PricingSection({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showFullComparison, setShowFullComparison] = useState(false);

  const isAnnual = billingCycle === 'annual';

  const plans = [
    {
      id: 'DISCOVER_FREE',
      name: 'Discover',
      badge: 'Evaluation',
      priceMonthly: 0,
      priceAnnual: 0,
      period: 'forever',
      target: 'Developers & Initial Evaluation',
      capacity: '1 AI System · 2 Users',
      limit: '100 proofs / month',
      highlightFeature: 'Basic GRC Console & Initial Report',
      cta: 'Start Free',
      ctaStyle: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
      featured: false
    },
    {
      id: 'COMPLIANCE_249',
      name: 'Compliance',
      badge: 'Governance',
      priceMonthly: 249,
      priceAnnual: 199,
      period: '€ / mo + VAT',
      target: 'Growing SaaS Products',
      capacity: '3 AI Systems · 5 Users',
      limit: '1,000 proofs / month',
      highlightFeature: 'Automated GRC, Evidence Vault & ISO 42001',
      cta: 'Start Compliance',
      ctaStyle: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600',
      featured: false
    },
    {
      id: 'PROFESSIONAL_649',
      name: 'Professional',
      badge: 'Recommended for ISVs',
      priceMonthly: 649,
      priceAnnual: 519,
      period: '€ / mo + VAT',
      target: 'B2B Software Enterprises',
      capacity: '10 AI Systems · 15 Users',
      limit: '5,000 proofs / month',
      highlightFeature: 'Advanced Governance + S.A.A.R.E. L7 Control Layer',
      cta: 'Request Professional',
      ctaStyle: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25',
      featured: true
    },
    {
      id: 'ENTERPRISE_1500',
      name: 'Enterprise',
      badge: 'Scale Governance',
      priceMonthly: 1500,
      priceAnnual: 1200,
      period: '€ / mo + VAT (from)',
      target: 'Multi-Product Organizations',
      capacity: '50 AI Systems · 50+ Users',
      limit: 'Dedicated Node & Custom Limits',
      highlightFeature: 'SIEM/GRC Integration, CMK & Priority SLA',
      cta: 'Contact Enterprise',
      ctaStyle: 'bg-blue-600 hover:bg-blue-500 text-white font-bold',
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 mb-4 font-mono">
            Transparent Licensing Structure (SGP 1.0)
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Secure your AI systems. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Scale your governance without friction.
            </span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            Executable compliance infrastructure for AI products. Prices excluding VAT.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                !isAnnual ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}>
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                isAnnual ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
              }`}>
              Annual Billing
              <span className="px-2 py-0.5 text-[10px] bg-emerald-400 text-slate-950 font-extrabold rounded-full uppercase">
                -20% Off
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-12">
          {plans.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.featured
                    ? 'bg-slate-900 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/15 lg:-translate-y-2'
                    : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
                }`}>
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 mb-4 min-h-[32px] flex items-center">
                    {plan.target}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-extrabold text-white">
                        {typeof price === 'number' ? `${price} €` : price}
                      </span>
                      <span className="text-xs text-slate-400">{plan.period}</span>
                    </div>
                    {isAnnual && typeof price === 'number' && price > 0 && (
                      <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                        Billed annually ({price * 12} €/year)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 border-b border-slate-800 pb-6 mb-6">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Capacity</span>
                      <strong className="text-white">{plan.capacity}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Trace Limit</span>
                      <span className="text-slate-300">{plan.limit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Key Capability</span>
                      <span className="text-cyan-400 font-medium">{plan.highlightFeature}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPlan && onSelectPlan(plan.id)}
                  className={`w-full py-3 text-xs font-bold rounded-xl transition-all text-center ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 mb-2 font-mono">
              Sovereign & Air-Gapped Infrastructure
            </div>
            <h3 className="text-2xl font-bold text-white">S.A.A.R.E. Private</h3>
            <p className="text-xs text-cyan-400 font-mono mb-2">Custom Deployment Architecture</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              On-Premise, isolated VPC, or Sovereign Cloud installation. Designed for financial entities, public sector, and critical infrastructure requiring Customer-Managed Keys (CMK) and HSM modules.
            </p>
          </div>
          <button
            onClick={() => onSelectPlan && onSelectPlan('PRIVATE_CUSTOM')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 shrink-0 transition-colors">
            Design Private Deployment
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowFullComparison(!showFullComparison)}
            className="px-6 py-2.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 rounded-xl transition-all">
            {showFullComparison ? 'Hide Specifications Matrix ▲' : 'Show Full Specifications Matrix ▼'}
          </button>

          {showFullComparison && (
            <div className="mt-8 overflow-x-auto bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs">
              <table className="w-full text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-200 font-mono">
                    <th className="p-4">Capability / Module</th>
                    <th className="p-4">Discover</th>
                    <th className="p-4">Compliance</th>
                    <th className="p-4 text-cyan-400">Professional</th>
                    <th className="p-4">Enterprise</th>
                    <th className="p-4">Private</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Managed AI Systems</td>
                    <td className="p-4">1</td>
                    <td className="p-4">3</td>
                    <td className="p-4 text-cyan-400 font-bold">10</td>
                    <td className="p-4">50</td>
                    <td className="p-4">Custom</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Console Users</td>
                    <td className="p-4">2</td>
                    <td className="p-4">5</td>
                    <td className="p-4 text-cyan-400 font-bold">15</td>
                    <td className="p-4">50+</td>
                    <td className="p-4">Custom</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Monthly Evidence Logging</td>
                    <td className="p-4">100</td>
                    <td className="p-4">1,000</td>
                    <td className="p-4 text-cyan-400 font-bold">5,000</td>
                    <td className="p-4">Custom</td>
                    <td className="p-4">Custom</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Evidence Vault (SHA-256)</td>
                    <td className="p-4 text-slate-600">Basic</td>
                    <td className="p-4 text-emerald-400">✓</td>
                    <td className="p-4 text-emerald-400 font-bold">✓ (Advanced)</td>
                    <td className="p-4 text-emerald-400">✓</td>
                    <td className="p-4 text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">S.A.A.R.E. Control Layer (L7 Interception)</td>
                    <td className="p-4 text-slate-600">—</td>
                    <td className="p-4 text-slate-600">—</td>
                    <td className="p-4 text-emerald-400 font-bold">✓</td>
                    <td className="p-4 text-emerald-400 font-bold">✓</td>
                    <td className="p-4 text-emerald-400 font-bold">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}