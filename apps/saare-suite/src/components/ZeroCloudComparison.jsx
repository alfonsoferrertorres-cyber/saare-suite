import React from 'react';

export default function ZeroCloudComparison() {
  const trustBadges = [
    {
      code: "EU AI Act",
      articles: "Art. 12 & 27",
      desc: "Automated logging mechanisms, FRIA impact assessments, and ex-ante human oversight."
    },
    {
      code: "GDPR",
      articles: "Art. 5 & 25",
      desc: "Strict data minimization, privacy by design, and in-memory pseudonymization."
    },
    {
      code: "Trade Secrets",
      articles: "Directive (EU) 2016/943",
      desc: "Technical lineage logging, source code isolation, and documented asset protection."
    },
    {
      code: "Evidence Integrity",
      articles: "RFC 3161 & eIDAS",
      desc: "Qualified electronic time-stamping, Ed25519 binding, and non-repudiation ex-Art. 326 LEC."
    }
  ];

  return (
    <div className="w-full my-16 text-white font-sans">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold">
          Traditional SaaS Audit vs. S.A.A.R.E. Native Audit
        </h3>
        <p className="text-slate-400 mt-2 text-base max-w-2xl mx-auto">
          Technical comparison between centralized cloud logging and perimeter cryptographic auditing.
        </p>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-2xl mb-12 bg-slate-950 shadow-2xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-mono text-xs">
              <th className="p-4 font-semibold">Criterion</th>
              <th className="p-4 font-semibold text-rose-400">Traditional SaaS Audit</th>
              <th className="p-4 font-semibold text-emerald-400">S.A.A.R.E. Native Audit (SGP 1.0)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="p-4 font-semibold text-white">Analysis Location</td>
              <td className="p-4 text-slate-400">External Cloud Server</td>
              <td className="p-4 text-emerald-300 font-semibold">Local / In-Memory (LLM Perimeter)</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Data Residency Exposure</td>
              <td className="p-4 text-slate-400">High (Payload & PII Persistence)</td>
              <td className="p-4 text-emerald-300 font-semibold">Zero-Disk Volatile RAM Isolation (`mlock`)</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Infrastructure Model</td>
              <td className="p-4 text-slate-400">Per-Volume API Subscription</td>
              <td className="p-4 text-emerald-300 font-semibold">Local Control Plane Edge Execution</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Evaluation Logic</td>
              <td className="p-4 text-slate-400">Subjective / Ex-Post Logging</td>
              <td className="p-4 text-emerald-300 font-semibold">Deterministic Ex-Ante Mathematics</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Evidence Integrity</td>
              <td className="p-4 text-slate-400">Unsigned Flat Logs</td>
              <td className="p-4 text-emerald-300 font-semibold">Cryptographically Signed Packages (`.saare-proof`)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all">
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider block uppercase">
              {badge.articles}
            </span>
            <h4 className="text-base font-bold text-white mt-1 mb-2">
              {badge.code}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {badge.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}