import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Info, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Inicio' },
    { path: '/store', label: 'Escenarios & Tienda' },
    { path: '/platform', label: 'Arquitectura' },
    { path: '/pricing', label: 'Precios & Tokens' },
    { path: '/trust', label: 'Acerca de' },
    { path: '/legal', label: 'Legal & Auditoría' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#030712]/95 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo Identidad */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5A059] via-[#dfba6f] to-[#997938] flex items-center justify-center font-black text-black font-mono shadow-md border border-[#C5A059]/40">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white leading-none">S.A.A.R.E.</span>
              <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">SUITE</span>
            </div>
            <span className="text-[8px] font-mono tracking-wider text-slate-400 uppercase hidden sm:block">AI Governance & L7 Gateway</span>
          </div>
        </Link>

        {/* Pestañas de Navegación Siempre Visibles */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#C5A059] text-black font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Botones de Estado y Acción */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-[10px] font-mono text-emerald-400 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>DUAL-VAULT ONLINE</span>
          </div>

          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff] text-[#00f0ff] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#00f0ff]/25 transition-all shadow-sm shadow-[#00f0ff]/10"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Más Información</span>
          </Link>
        </div>
      </div>
    </header>
  );
}