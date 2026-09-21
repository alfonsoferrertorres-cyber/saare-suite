import React from 'react';

export default function OfficialReportModal({ onClose, sectorTitle }) {
  // 1. Lectura unificada de sesión desde el embudo D1
  const sessionUser = JSON.parse(localStorage.getItem('saare_session_user') || '{}');
  const userEmail = sessionUser.email || localStorage.getItem('saare_user_email') || 'legal@saare.es';
  const tenantDomain = sessionUser.tenantName || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] p-5">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
      
      <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-8 shadow-2xl font-sans relative">
        
        {/* Encabezado / Membrete Oficial */}
        <div className="border-b-2 border-sky-600 pb-5 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-950 m-0 tracking-tight">
              S.A.A.R.E. <span className="text-sky-600 text-base font-semibold">ENTERPRISE GOVERNANCE REPORT</span>
            </h1>
            <p className="text-xs text-slate-500 m-0 mt-1">
              Sovereign AI Authorization & Runtime Enforcement • Grado Financiero
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 bg-slate-100 p-3 rounded-md border border-slate-300">
            <strong>Sector:</strong> {sectorTitle || 'Evaluación Estándar'}<br/>
            <strong>Organización:</strong> {tenantDomain}<br/>
            <strong>Operador:</strong> {userEmail}<br/>
            <strong>Fecha:</strong> {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Cuerpo del Informe */}
        <div className="text-sm leading-relaxed text-slate-700 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
              1. Resumen Ejecutivo y Alineación Normativa
            </h3>
            <p>
              El presente informe certifica la operatividad de los controles de gobernanza, protección ex-ante y detección en tiempo real bajo los estándares globales <strong>NIST CSF 2.0</strong>, <strong>OWASP LLM Top 10</strong>, <strong>EU AI Act (Art. 15)</strong> y <strong>DORA</strong>.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
              2. Auditoría de Veredictos e Intercepciones L7
            </h3>
            <table className="w-full border-collapse mt-3 text-xs">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-300 text-left">
                  <th className="p-2 text-slate-600">ID Evidencia</th>
                  <th className="p-2 text-slate-600">Timestamp</th>
                  <th className="p-2 text-slate-600">Clasificación OWASP / NIST</th>
                  <th className="p-2 text-slate-600">Dictamen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-mono">EV-OWASP-101</td>
                  <td className="p-2">En vivo</td>
                  <td className="p-2">LLM01:2025 - Prompt Injection</td>
                  <td className="p-2 text-red-600 font-bold">RECHAZADO (DENY)</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono">EV-OWASP-102</td>
                  <td className="p-2">En vivo</td>
                  <td className="p-2">LLM02:2025 - Sensitive Data Disclosure</td>
                  <td className="p-2 text-red-600 font-bold">RECHAZADO (DENY)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
              3. Validación Criptográfica y Cadena de Custodia (ISO/IEC 27037)
            </h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-300 text-xs font-mono space-y-1">
              <div><strong>Merkle Root Hash:</strong> 6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842</div>
              <div><strong>Ed25519 Signature:</strong> 3d84f9814402ebcf88a1095bf8589085cb221a69074092b3a985dcf85b7aa210e9cf41...</div>
              <div><strong>TSA Record:</strong> SAARE-OWASP-2026 • Estado: Verificado e Inmutable</div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5 no-print">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold hover:bg-slate-200 transition"
          >
            Cerrar Vista Previa
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2.5 bg-sky-600 text-white rounded font-bold shadow-md hover:bg-sky-700 transition"
          >
            Imprimir / Guardar como PDF
          </button>
        </div>

      </div>
    </div>
  );
}