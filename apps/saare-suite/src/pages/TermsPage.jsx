// saare-suite/src/pages/TermsPage.jsx
import React from 'react';

export default function TermsPage({ onBack }) {
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
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">Condiciones Generales de Uso y Licenciamiento</h1>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Objeto y Ámbito de Aplicación</h2>
              <p>Estas condiciones regulan el acceso y uso de la plataforma S.A.A.R.E. y sus funcionalidades de gobernanza, control preventivo y registro de evidencias para sistemas de inteligencia artificial.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Alcance del Servicio</h2>
              <p>Las capacidades, límites operativos y niveles de soporte dependen del plan o acuerdo de licenciamiento contratado por cada organización.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. Cumplimiento y Responsabilidad</h2>
              <p>S.A.A.R.E. aporta herramientas técnicas de apoyo a la gobernanza y la trazabilidad; la adecuación legal y operativa de cada entorno corresponde a la organización usuaria.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">4. Propiedad Intelectual</h2>
              <p>El software, la arquitectura, los componentes de interfaz y la documentación asociada quedan protegidos por la normativa de propiedad intelectual aplicable.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}