import React from 'react';

export default function PrivacyPage({ onBack }) {
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
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">Política de Privacidad y Protección de Datos</h1>
          
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Responsable del Tratamiento</h2>
              <p>Alfonso Ferrer Torres (NIF: 48553065L), con domicilio profesional en el marco del expediente MS3V-RECON-VALID-2026-ALF-0521.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Finalidad del Tratamiento</h2>
              <p>Gestión de expedientes de cumplimiento normativo, auditoría perimetral de modelos de inteligencia artificial y justificación de subvenciones públicas (Red.es, INCIBE, NextGen EU).</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. Base Jurídica y Minimización</h2>
              <p>Cumplimiento de obligaciones legales (Art. 326 LEC, Reglamento eIDAS 910/2014, EU AI Act y DORA). La plataforma aplica principios de minimización mediante procesamiento Stateless en memoria RAM sin persistencia indebida de datos sensibles.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}