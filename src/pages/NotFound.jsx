import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050811] text-white flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <span className="font-mono text-xs text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-3 py-1 rounded border border-[#C5A059]/30">
          Error 404 • Page Not Found
        </span>
        <h1 className="text-4xl font-serif font-bold text-white">Resource Unavailable</h1>
        <p className="text-xs text-slate-400 font-mono">
          The requested endpoint or path is not mapped within SAARE Platform UI framework.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#C5A059] text-black font-extrabold text-xs px-6 py-3 rounded-lg uppercase tracking-wider font-mono hover:bg-[#d6b16a] transition-all"
        >
          Return to Platform Core
        </Link>
      </div>
    </div>
  );
}