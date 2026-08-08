import React from 'react';
import { Link } from 'react-router-dom';

export default function Trust() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/30 inline-block">
            Trust Center & Security Posture
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Security & Compliance Controls
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            SAARE Platform is designed following strict process isolation, minimal privilege, and mathematical cryptographic verification principles.
          </p>
        </div>

        {/* CONTROLS MATRIX */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl space-y-6 max-w-3xl mx-auto backdrop-blur-md">
          <p className="text-xs text-slate-300 leading-relaxed">
            All inspection algorithms execute in volatile memory with zero unauthorized payload persistence to disk storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="border border-slate-800 bg-[#050811] p-4 rounded-xl">
              <span className="text-[#C5A059] font-bold block mb-1">Public Verification Key</span>
              <span className="text-slate-400 text-[11px]">Ed25519 Cryptographic Signatures (RFC 8032)</span>
            </div>
            <div className="border border-slate-800 bg-[#050811] p-4 rounded-xl">
              <span className="text-[#00f0ff] font-bold block mb-1">Process Permissions</span>
              <span className="text-slate-400 text-[11px]">POSIX Domain Socket Restricted to 0600</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/pricing"
            className="inline-block bg-[#C5A059] hover:bg-[#d6b16a] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#C5A059]/20"
          >
            Download Trust & Verification Package
          </Link>
        </div>

      </div>
    </div>
  );
}