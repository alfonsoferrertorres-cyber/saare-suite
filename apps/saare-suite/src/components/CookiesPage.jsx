// saare-suite/src/pages/CookiesPage.jsx
import React from 'react';

export default function CookiesPage({ onBack }) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack} 
          className="mb-8 text-xs font-mono text-[#38BDDB] hover:underline flex items-center gap-2"
        >
          ← Volver a la Landing Principal
        </button>
        
        <div className="border border-slate-800 bg-[#0A101E] p-8 sm:p-12 rounded-2xl shadow-xl">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-2">Expediente: MS3V-RECON-VALID-2026-ALF-0521</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">Política de Cookies</h1>
          
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Uso de Cookies Técnicas</h2>
              <p>La plataforma S.A.A.R.E. utiliza exclusivamente cookies técnicas y de almacenamiento local estrictamente necesarias para la autenticación y mantenimiento de la sesión segura del usuario en la consola GRC.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Ausencia de Rastreo Publicitario</h2>
              <p>Cumpliendo con los estándares de soberanía y privacidad europea, la Suite no incorpora cookies publicitarias, trackers de redes sociales ni sistemas de perfiles comerciales de terceros.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}