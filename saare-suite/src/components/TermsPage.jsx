// saare-suite/src/pages/TermsPage.jsx
import React from 'react';

export default function TermsPage({ onBack }) {
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
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">Condiciones Generales de Contratación y Licenciamiento</h1>
          
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Objeto y Ámbito de Aplicación</h2>
              <p>Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma corporativa y de gobernanza S.A.A.R.E. (la "Suite"), operada bajo el expediente marco MS3V-RECON-VALID-2026-ALF-0521 por Alfonso Ferrer Torres (NIF: 48553065L).</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Depósito Notarial Escrow</h2>
              <p>El código fuente y los binarios de producción de la Suite se encuentran depositados ante Notario Colegiado bajo la Cláusula de Depósito Escrow. En caso de cese de actividad o incumplimiento de niveles de servicio (SLA), los licenciatarios disponen del derecho automático de liberación para uso interno perpetuo.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. Arquitectura Stateless (Cero Retención en Disco)</h2>
              <p>De conformidad con el Reglamento RGPD (UE 2016/679) y el EU AI Act, la Suite opera exclusivamente en memoria volátil RAM mediante aislamiento mlock_ephemeral, garantizando la destrucción instantánea (0x00) de cualquier dato de carácter personal o token PII tras la emisión de la respuesta.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">4. Propiedad Intelectual</h2>
              <p>Todos los derechos de propiedad intelectual, algoritmos de canalización L7 y esquemas de prueba verificable se encuentran inscritos bajo el registro RPI-2026-SAARE-0914X, Safe Creative SC-REG-2026-1791667481 y el estándar B2B MS3V-SGP1.0-SOFTWARE-2026.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}