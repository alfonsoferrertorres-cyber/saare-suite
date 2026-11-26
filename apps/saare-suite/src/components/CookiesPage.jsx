// saare-suite/src/pages/CookiesPage.jsx
import React from 'react';

export default function CookiesPage({ onBack }) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-xs font-mono text-[#38BDDB] hover:underline flex items-center gap-2 cursor-pointer"
        >
          ← Volver a la Landing Principal
        </button>

        <div className="border border-slate-800 bg-[#0A101E] p-8 sm:p-12 rounded-2xl shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">Política de Cookies</h1>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Cookies Técnicas</h2>
              <p>Este sitio utiliza exclusivamente cookies técnicas y mecanismos de almacenamiento local necesarios para el funcionamiento del servicio, la gestión de sesión y el mantenimiento de las preferencias básicas.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Ausencia de Cookies Publicitarias</h2>
              <p>No se emplean cookies de publicidad comportamental ni rastreadores de terceros con fines comerciales.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}