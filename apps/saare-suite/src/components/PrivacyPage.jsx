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
              <p>El tratamiento de los datos facilitados a través de la plataforma y de los formularios de contacto o evaluación se realiza conforme al Reglamento General de Protección de Datos (RGPD) y la normativa vigente aplicable.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Finalidad</h2>
              <p>Gestionar el acceso a la plataforma, atender solicitudes de evaluación o soporte técnico y operar los controles de gobernanza solicitados por cada organización.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. Minimización y Seguridad</h2>
              <p>La evaluación de solicitudes se orienta a la minimización del tratamiento y a la protección de la información durante los flujos de interacción con sistemas de inteligencia artificial.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">4. Ejercicio de Derechos</h2>
              <p>Puede solicitar el acceso, rectificación, supresión, limitación u oposición respecto a sus datos personales a través de los canales oficiales indicados en la plataforma.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}