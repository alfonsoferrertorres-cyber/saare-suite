// saare-console/src/components/VaultRouterButton.jsx
import React, { useState } from 'react';
import { API_HOST } from '../utils/api'; // Alineado con la ruta utilitaria estandarizada

export default function VaultRouterButton({ onVaultTargetChange }) {
  // Resolución dinámica de la URL por defecto (Vite env -> localStorage -> API_HOST -> Local L7)
  const getDefaultHost = () => {
    return (
      localStorage.getItem('saare_override_vault_host') ||
      import.meta.env?.VITE_API_URL ||
      API_HOST ||
      'http://127.0.0.1:8080'
    );
  };

  const [currentVaultHost, setCurrentVaultHost] = useState(getDefaultHost);
  const [isOpen, setIsOpen] = useState(false);
  const [customHost, setCustomHost] = useState('');

  // Presets actualizados incluyendo el nodo nativo On-Premise / Zero Trust (Puerto 8080)
  const PRESET_VAULTS = [
    { label: '🛡️ Nodo Local L7 (Zero Trust - 8080)', url: 'http://127.0.0.1:8080' },
    { label: '🌐 Bóveda Producción (D1 Cloudflare)', url: 'https://api.saare.es' },
    { label: '⚙️ Bóveda Worker Directo (control-plane)', url: 'https://control-plane.alfonsoferrertorres.workers.dev' },
    { label: '💻 Bóveda Dev Emulator (D1 Local)', url: 'http://127.0.0.1:3001' }
  ];

  const handleSelectVault = (targetUrl) => {
    // Normalizar URL eliminando barras diagonales al final
    const cleanUrl = targetUrl.trim().replace(/\/+$/, '');
    
    localStorage.setItem('saare_override_vault_host', cleanUrl);
    setCurrentVaultHost(cleanUrl);
    setIsOpen(false);
    
    if (typeof onVaultTargetChange === 'function') {
      onVaultTargetChange(cleanUrl);
    }
    
    // Recarga la aplicación para forzar el cambio de endpoint en todos los servicios HTTP
    window.location.reload();
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:border-cyan-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>BÓVEDA: {currentVaultHost.replace(/^https?:\/\//, '')}</span>
        <span className="text-[10px]">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl z-50 text-slate-200">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-2 border-b border-slate-800 pb-1">
            Enrutamiento Dinámico de Bóveda D1 / PEP L7
          </div>

          <div className="space-y-1.5 mb-3">
            {PRESET_VAULTS.map((vault) => (
              <button
                key={vault.url}
                onClick={() => handleSelectVault(vault.url)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
                  currentVaultHost === vault.url
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {vault.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-[9px] font-mono uppercase text-slate-400 mb-1">
              Ruta Personalizada / Custom Origin
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="http://127.0.0.1:8080"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => customHost && handleSelectVault(customHost)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2 py-1 rounded text-xs"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}