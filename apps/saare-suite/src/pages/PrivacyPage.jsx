// saare-suite/src/pages/PrivacyPage.jsx
import React from 'react';

export default function PrivacyPage({ onBack }) {
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
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">Política de Privacidad y Protección de Datos</h1>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Tratamiento de Datos</h2>
              <p>El tratamiento de los datos facilitados a través de la plataforma se realiza conforme al RGPD y a la normativa de protección de datos aplicable.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Finalidad del Tratamiento</h2>
              <p>Atender solicitudes de acceso o evaluación, gestionar la cuenta de la organización y operar los controles de gobernanza y trazabilidad solicitados.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. Minimización y Seguridad</h2>
              <p>Las solicitudes se evalúan aplicando criterios de minimización de datos y medidas técnicas orientadas a proteger la información durante su procesamiento.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">4. Ejercicio de Derechos</h2>
              <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación u oposición a través de los canales oficiales disponibles en la plataforma.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}