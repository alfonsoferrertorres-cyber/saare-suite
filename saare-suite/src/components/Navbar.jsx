import React from 'react';
import { Shield, Download, LayoutDashboard, Cpu, CheckCircle } from 'lucide-react';
import { downloadGPOPolicy } from '../utils/api';

export default function Navbar({ onOpenConsole }) {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">S.A.A.R.E. <span className="text-blue-500 text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 border border-blue-800/60">v10.0</span></span>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase">Core PEP L7 v8.4 | MS3V</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={downloadGPOPolicy}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Despliegue GPO (.reg)</span>
          </button>

          <button 
            onClick={onOpenConsole}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/20 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Acceso Consola (Directo)</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
