// saare-console/src/components/VaultRouterButton.jsx
import React, { useState, useEffect } from 'react';
import { API_HOST } from '../api/api'; // O la ruta correspondiente de API_HOST

export default function VaultRouterButton({ onVaultTargetChange }) {
  const [currentVaultHost, setCurrentVaultHost] = useState(() => {
    return localStorage.getItem('saare_override_vault_host') || API_HOST || 'https://api.saare.es';
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [customHost, setCustomHost] = useState('');

  const PRESET_VAULTS = [
    { label: '🌐 Bóveda Producción (D1 Cloudflare)', url: 'https://api.saare.es' },
    { label: '⚙️ Bóveda Worker Directo (control-plane)', url: 'https://control-plane.alfonsoferrertorres.workers.dev' },
    { label: '💻 Bóveda Local Dev (D1 Emulator)', url: 'http://127.0.0.1:3001' }
  ];

  const handleSelectVault = (targetUrl) => {
    localStorage.setItem('saare_override_vault_host', targetUrl);
    setCurrentVaultHost(targetUrl);
    setIsOpen(false);
    
    if (typeof onVaultTargetChange === 'function') {
      onVaultTargetChange(targetUrl);
    }
    window.location.reload(); // Recarga para aplicar la nueva ruta globalmente
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:border-cyan-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>BÓVEDA: {currentVaultHost.replace('https://', '').replace('http://', '')}</span>
        <span className="text-[10px]">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl z-50 text-slate-200">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-2 border-b border-slate-800 pb-1">
            Enrutamiento Dinámico de Bóveda D1
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
                }`}>
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
                placeholder="https://mi-boveda.es"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => customHost && handleSelectVault(customHost)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2 py-1 rounded text-xs">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}