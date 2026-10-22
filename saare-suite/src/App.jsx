import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ConsolePreview from './components/ConsolePreview';

export default function App() {
  const [showConsoleModal, setShowConsoleModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar onOpenConsole={() => setShowConsoleModal(true)} />
      
      <main>
        <Hero onOpenConsole={() => setShowConsoleModal(true)} />
        <ConsolePreview />
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <p>S.A.A.R.E. v10.0 / Core PEP L7 v8.4 | Gabinete Técnico Comercial MS3V (NIF: 48553065L)</p>
        <p className="mt-1 text-[11px] text-slate-600">Expediente: MS3V-RECON-VALID-2026-ALF-0521 | Safe Creative: SC-REG-2026-1791667481 | RPI: RPI-2607076315021</p>
      </footer>

      {showConsoleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Consola de Gobernanza S.A.A.R.E. (Acceso Directo Sin Login)</span>
              <button 
                onClick={() => setShowConsoleModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </h3>
            <p className="text-xs text-slate-400">
              Al ser un despliegue agnóstico en Capa 7 (L7), la validación ocurre sobre la petición HTTP en tránsito. La consola se accede de forma directa sin requerir contraseñas de usuario final.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              <p className="text-emerald-400 font-bold">[OK] Estado del Plano de Control: OPERATIVO</p>
              <p className="mt-1">Punto de Intercepción: https://api.saare.es/v1/inspect</p>
              <p>Directiva GPO: /v1/deploy/gpo-policy</p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setShowConsoleModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Continuar a la Consola
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
