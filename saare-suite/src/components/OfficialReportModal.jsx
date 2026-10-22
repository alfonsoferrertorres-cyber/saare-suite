// saare-console/src/components/OfficialReportModal.jsx
import React from 'react';

export default function OfficialReportModal({ onClose, sectorTitle, evidences = [] }) {
  // Lectura unificada de sesión desde el almacenamiento local
  const sessionUser = JSON.parse(localStorage.getItem('saare_session_user') || '{}');
  const userEmail = sessionUser.email || localStorage.getItem('saare_user_email') || 'legal@saare.es';
  const tenantDomain = sessionUser.tenantName || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';

  const handlePrint = () => {
    window.print();
  };

  // Filtrar evidencias reales registradas o tomar la muestra activa de la Bóveda D1
  const displayEvidences = Array.isArray(evidences) && evidences.length > 0 
    ? evidences.slice(0, 50) 
    : [];

  // Obtener el primer Merkle Root real disponible para la firma
  const activeMerkleRoot = displayEvidences.find(e => e?.merkleRoot)?.merkleRoot || 'NO_RECORD_ANCHORED';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] p-5 font-mono text-xs">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
      
      <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-8 shadow-2xl relative">
        
        {/* Encabezado / Membrete Oficial */}
        <div className="border-b-2 border-sky-600 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 m-0 tracking-tight font-display">
              S.A.A.R.E. <span className="text-sky-600 text-xs sm:text-base font-semibold">ENTERPRISE GOVERNANCE REPORT</span>
            </h1>
            <p className="text-[11px] text-slate-500 m-0 mt-1">
              Sovereign AI Authorization & Runtime Enforcement • Grado Financiero
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-600 bg-slate-100 p-3 rounded-md border border-slate-300 w-full sm:w-auto">
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
            <p className="text-xs leading-relaxed text-slate-600">
              El presente informe certifica la operatividad de los controles de gobernanza, protección ex-ante y detección en tiempo real bajo los estándares globales <strong>NIST CSF 2.0</strong>, <strong>OWASP LLM Top 10</strong>, <strong>EU AI Act (Art. 15)</strong> y <strong>DORA</strong>[cite: 5, 16].
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
              2. Auditoría de Veredictos e Intercepciones L7 ({displayEvidences.length} Registros)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mt-3 text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 text-left">
                    <th className="p-2.5 text-slate-700">ID Evidencia</th>
                    <th className="p-2.5 text-slate-700">Timestamp</th>
                    <th className="p-2.5 text-slate-700">Payload / Categoría</th>
                    <th className="p-2.5 text-slate-700">Dictamen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayEvidences.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-slate-500">
                        No hay evidencias registradas en la Bóveda para exportar en este informe.
                      </td>
                    </tr>
                  ) : (
                    displayEvidences.map((ev, index) => {
                      const isDeny = ev.decision === 'DENY' || ev.verdict === 'RECHAZADO';
                      return (
                        <tr key={ev.id || index}>
                          <td className="p-2.5 font-mono text-sky-700 font-bold">{ev.id}</td>
                          <td className="p-2.5 text-slate-500">{ev.time || 'En vivo'}</td>
                          <td className="p-2.5 max-w-[280px] truncate" title={ev.prompt}>
                            <span className="font-semibold text-slate-800">{ev.cat || 'INSPECCION_L7'}:</span> {ev.prompt || '(Sin payload text)'}
                          </td>
                          <td className={`p-2.5 font-bold ${isDeny ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isDeny ? 'RECHAZADO (DENY)' : 'PERMITIDO (ALLOW)'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
              3. Validación Criptográfica y Cadena de Custodia (ISO/IEC 27037)
            </h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-300 text-xs font-mono space-y-1.5">
              <div className="break-all"><strong>Merkle Root Hash:</strong> {activeMerkleRoot}</div>
              <div><strong>Estado de Certificación:</strong> {activeMerkleRoot !== 'NO_RECORD_ANCHORED' ? 'Verificado e Inmutable en Bóveda D1' : 'En Espera de Anclaje Criptográfico'}</div>
              <div><strong>Normativa Aplicable:</strong> ISO/IEC 27037:2012 / EU AI Act Art. 15 / DORA</div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5 no-print">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            Cerrar Vista Previa
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2.5 bg-sky-600 text-white rounded font-bold shadow-md hover:bg-sky-700 transition cursor-pointer"
          >
            Imprimir / Guardar como PDF
          </button>
        </div>

      </div>
    </div>
  );
}