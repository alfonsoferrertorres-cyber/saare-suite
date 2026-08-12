import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="mb-8 px-2 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wider text-white">SAARE CONSOLE</h1>
          <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            RUNNER ACTIVE
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          Operaciones
        </div>

        <nav className="space-y-1">
          <Link
            to="/operation-center"
            className={w-full px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-between }
          >
            <span>S.A.A.R.E.</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">(LIVE)</span>
          </Link>

          <Link
            to="/pipeline-builder"
            className={w-full block px-3 py-2 rounded text-sm font-medium transition-colors }
          >
            ESCENARIOS
          </Link>

          <Link
            to="/technical-trace"
            className={w-full block px-3 py-2 rounded text-sm font-medium transition-colors }
          >
            TECHNICAL TRACE / Registro Global
          </Link>
        </nav>
      </div>

      <div className="text-xs text-slate-500 px-2 border-t border-slate-800 pt-4">
        <p>Máxima Protección Configurada</p>
        <p className="text-[10px] text-slate-600 mt-1">Core Runtime Engine v7.2</p>
      </div>
    </aside>
  );
}
