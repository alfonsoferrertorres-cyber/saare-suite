import React, { useState } from 'react';

export default function EnterpriseNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Arquitectura L7", href: "#arquitectura-l7" },
    { name: "Certificación", href: "#integridad" },
    { name: "Multi-LLM", href: "#multi-llm" },
    { name: "Consola", href: "#consola-real" },
    { name: "Normativas", href: "#compliance-normativas" },
    { name: "FAQ", href: "#faq-enterprise" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO & ISV BADGE */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-cyan-500/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">S.A.A.R.E.</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono font-bold">
                  ISV ENTERPRISE
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                AI GOVERNANCE & L7 GATEWAY
              </span>
            </div>
          </a>
        </div>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-300">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="hover:text-cyan-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* BOTONES DE ACCIÓN DIRECTA */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://saare-grc-dashboard.streamlit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>📊</span> GRC Streamlit
          </a>
          <a
            href="https://console.saare.es"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-sans text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            🛡️ LOGIN CONSOLE
          </a>
        </div>

        {/* BOTÓN MÓVIL */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-6 py-6 space-y-4 font-mono text-xs">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-cyan-400 py-1"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <a
              href="https://saare-grc-dashboard.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 text-center font-bold"
            >
              📊 GRC Streamlit
            </a>
            <a
              href="https://console.saare.es"
              className="w-full py-2.5 rounded-lg bg-cyan-500 text-slate-950 text-center font-bold"
            >
              🛡️ LOGIN CONSOLE
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

