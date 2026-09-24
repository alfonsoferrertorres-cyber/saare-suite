import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      id: 'auditoria-publica',
      title: 'AUDITORÍA PÚBLICA',
      subtitle: 'VERIFICACIÓN DE SELLOS & EVIDENCIAS',
      path: '/',
      highlight: true
    },
    {
      id: 'forense',
      title: 'FORENSE',
      subtitle: 'EVIDENCE VAULT',
      path: '/forense'
    },
    {
      id: 'cumplimiento',
      title: 'CUMPLIMIENTO L7',
      subtitle: 'BOARD · GRC · CISO',
      path: '/producto/cumplimiento'
    },
    {
      id: 'desarrolladores',
      title: 'DESARROLLADORES',
      subtitle: 'SDK · PROXY · DAEMON',
      path: '/dev'
    },
    {
      id: 'canal',
      title: 'CANAL',
      subtitle: 'PARTNERS Y KIT CONSULTING',
      path: '/ventas'
    }
  ];

  return (
    <header className="w-full bg-[#030712] border-b border-gray-800 text-white px-6 py-3">
      {/* Barra superior con logo e indicadores */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-extrabold tracking-wider text-white">
            S.A.A.R.E. <span className="text-xs bg-blue-900/60 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">SGP 1.0</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded border border-gray-700 bg-gray-900/50">
            ACCESO SOC ↗
          </Link>
          <a href="https://wa.me/34633886506?text=Solicito%20propuesta%20Enterprise%20SAARE%20SGP%201.0" target="_blank" rel="noreferrer" className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 px-3 py-1.5 rounded">
            ENTERPRISE ↗
          </a>
        </div>
      </div>

      {/* Menú principal reorganizado */}
      <nav className="flex items-center gap-6 border-t border-gray-800/60 pt-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`group flex flex-col text-left transition-all ${
                isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span className={`text-xs font-black tracking-wide ${isActive ? 'text-emerald-400' : 'text-gray-200 group-hover:text-white'}`}>
                {item.title}
              </span>
              <span className="text-[9px] font-mono text-gray-400 group-hover:text-gray-300 uppercase tracking-tighter">
                {item.subtitle}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};