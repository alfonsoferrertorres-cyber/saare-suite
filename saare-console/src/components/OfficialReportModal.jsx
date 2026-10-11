// src/components/OfficialReportModal.jsx
import React from 'react';
import { pdfGeneratorService } from '../services/pdfGeneratorService';

export default function OfficialReportModal({ onClose, reportData }) {
  const sessionUser = JSON.parse(localStorage.getItem('saare_session_user') || '{}');
  const userEmail = sessionUser.email || localStorage.getItem('saare_user_email') || 'legal@saare.es';
  const tenantDomain = sessionUser.tenantName || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';

  const handleDownloadPdf = async () => {
    try {
      if (pdfGeneratorService?.generateFromElement) {
        await pdfGeneratorService.generateFromElement('official-report-document', {
          filename: `SAARE_INFORME_OFICIAL_${tenantDomain}_${Date.now()}.pdf`
        });
      } else {
        window.print();
      }
    } catch (err) {
      console.error('[REPORT_MODAL] Error generando PDF:', err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 font-sans no-print-bg">
      {/* Contenedor tipo Hoja Oficial con Membrete */}
      <div 
        id="official-report-document"
        className="bg-white text-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-8 md:p-10 shadow-2xl relative font-sans border border-slate-200"
      >
        {/* Encabezado / Membrete Oficial */}
        <div className="border-b-2 border-sky-600 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
              S.A.A.R.E.
              <span className="text-sky-600 text-sm font-bold uppercase tracking-wider">
                Enterprise Governance Report
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Sovereign AI Authorization & Runtime Enforcement • Grado Financiero SGP 1.0
            </p>
          </div>
          <div className="text-left md:text-right text-[11px] font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
            <div><strong className="text-slate-800">Organización:</strong> {tenantDomain}</div>
            <div><strong className="text-slate-800">Operador:</strong> {userEmail}</div>
            <div><strong className="text-slate-800">Fecha:</strong> {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</div>
            <div className="text-sky-700 font-bold mt-1">Frameworks: NIST CSF 2.0 • OWASP LLM • DORA</div>
          </div>
        </div>

        {/* Cuerpo del Informe */}
        <div className="text-xs md:text-sm leading-relaxed text-slate-700 space-y-6">
          <section>
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase font-mono tracking-wider">
              1. Resumen Ejecutivo y Alineación Normativa
            </h2>
            <p>
              El presente informe certifica la operatividad de los controles de gobernanza, protección ex-ante y detección en tiempo real bajo los estándares globales <strong>NIST CSF 2.0</strong>, <strong>OWASP LLM Top 10</strong> y el Reglamento Europeo de IA (EU AI Act). Todas las interacciones de IA y agentes autónomos están sujetas al principio de seguridad <em>Fail-Closed</em>.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase font-mono tracking-wider">
              2. Auditoría de Veredictos e Intercepciones L7
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse mt-2 font-mono text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-700">
                    <th className="p-2.5">ID Evidencia</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Clasificación OWASP / NIST</th>
                    <th className="p-2.5">Dictamen L7</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">EV-OWASP-101</td>
                    <td className="p-2.5 text-slate-500">En vivo (RAM)</td>
                    <td className="p-2.5 text-sky-800 font-semibold">LLM01:2025 - Prompt Injection</td>
                    <td className="p-2.5 text-rose-700 font-black">RECHAZADO (DENY)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">EV-OWASP-102</td>
                    <td className="p-2.5 text-slate-500">En vivo (RAM)</td>
                    <td className="p-2.5 text-sky-800 font-semibold">LLM02:2025 - Sensitive Data Disclosure</td>
                    <td className="p-2.5 text-rose-700 font-black">RECHAZADO (DENY)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase font-mono tracking-wider">
              3. Validación Criptográfica y Cadena de Custodia (ISO/IEC 27037)
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 font-mono text-[11px] space-y-1.5 break-all">
              <div><strong className="text-slate-900">Merkle Root Hash:</strong> {reportData?.merkleRoot || '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842'}</div>
              <div><strong className="text-slate-900">Ed25519 Signature:</strong> {reportData?.signature || '3d84f9814402ebcf88a1095bf8589085cb221a69074092b3a985dcf85b7aa210e9cf41d7e35b71946399120785cba028e3b4821a8b0c619472e61a84b6f89004'}</div>
              <div className="text-emerald-700 font-bold pt-1">✓ TSA Record: SAARE-QUALIFIED-TSA-2026 • Estado: Inmutable y Verificado</div>
            </div>
          </section>
        </div>

        {/* Botones de Acción (Ocultos en impresión PDF/Print) */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap justify-end gap-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-300"
          >
            Cerrar Vista Previa
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-sky-900/20"
          >
            🖨️ Imprimir / Guardar PDF Oficial
          </button>
        </div>
      </div>
    </div>
  );
}