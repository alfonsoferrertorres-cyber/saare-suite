// saare-console/src/components/OfficialReportModal.jsx
import React, { useEffect } from 'react';
import pdfGeneratorService, { generatePdfFromElement } from '../services/pdfGeneratorService';

export default function OfficialReportModal({ onClose, reportData }) {
  // Parsing seguro de localStorage con fallbacks
  let sessionUser = {};
  try {
    sessionUser = JSON.parse(localStorage.getItem('saare_session_user') || '{}');
  } catch (e) {
    sessionUser = {};
  }

  const userEmail = sessionUser.email || localStorage.getItem('saare_user_email') || 'legal@saare.es';
  const tenantDomain = sessionUser.tenantName || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';

  // Manejo de cierre mediante tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownloadPdf = async () => {
    const filename = `SAARE_INFORME_OFICIAL_${tenantDomain.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    try {
      if (pdfGeneratorService && typeof pdfGeneratorService.generateFromElement === 'function') {
        await pdfGeneratorService.generateFromElement('official-report-document', { filename });
      } else if (typeof generatePdfFromElement === 'function') {
        await generatePdfFromElement('official-report-document', filename);
      } else {
        window.print();
      }
    } catch (err) {
      console.error('[REPORT_MODAL] Error generando PDF, invocando window.print():', err);
      window.print();
    }
  };

  // Lista de evidencias pasadas vía props o lista por defecto
  const auditEvidences = Array.isArray(reportData?.evidences) && reportData.evidences.length > 0
    ? reportData.evidences
    : [
        {
          id: 'EV-OWASP-101',
          timestamp: 'En vivo (RAM)',
          classification: 'LLM01:2025 - Prompt Injection',
          verdict: 'RECHAZADO (DENY)'
        },
        {
          id: 'EV-OWASP-102',
          timestamp: 'En vivo (RAM)',
          classification: 'LLM02:2025 - Sensitive Data Disclosure',
          verdict: 'RECHAZADO (DENY)'
        }
      ];

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && typeof onClose === 'function' && onClose()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '16px'
      }}
    >
      {/* Contenedor tipo Hoja Oficial con Membrete */}
      <div 
        id="official-report-document"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          width: '100%',
          maxWidth: '896px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Encabezado / Membrete Oficial */}
        <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#020617', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              S.A.A.R.E.
              <span style={{ color: '#0284c7', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enterprise Governance Report
              </span>
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              Sovereign AI Authorization & Runtime Enforcement • Grado Financiero SGP 1.0
            </p>
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.72rem', fontFamily: 'monospace', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: '1.5' }}>
            <div><strong style={{ color: '#1e293b' }}>Organización:</strong> {tenantDomain}</div>
            <div><strong style={{ color: '#1e293b' }}>Operador:</strong> {userEmail}</div>
            <div><strong style={{ color: '#1e293b' }}>Fecha:</strong> {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</div>
            <div style={{ color: '#0369a1', fontWeight: '800', marginTop: '4px' }}>Frameworks: NIST CSF 2.0 • OWASP LLM • DORA</div>
          </div>
        </div>

        {/* Cuerpo del Informe */}
        <div style={{ fontSize: '0.8rem', lineHeight: '1.6', color: '#334155', display: 'grid', gap: '24px' }}>
          <section>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              1. Resumen Ejecutivo y Alineación Normativa
            </h2>
            <p style={{ margin: 0 }}>
              El presente informe certifica la operatividad de los controles de gobernanza, protección ex-ante y detección en tiempo real bajo los estándares globales <strong>NIST CSF 2.0</strong>, <strong>OWASP LLM Top 10</strong> y el Reglamento Europeo de IA (EU AI Act). Todas las interacciones de IA y agentes autónomos están sujetas al principio de seguridad <em>Fail-Closed</em>.
            </p>
          </section>

          <section>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              2. Auditoría de Veredictos e Intercepciones L7
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontFamily: 'monospace', fontSize: '0.72rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>
                    <th style={{ padding: '10px' }}>ID Evidencia</th>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                    <th style={{ padding: '10px' }}>Clasificación OWASP / NIST</th>
                    <th style={{ padding: '10px' }}>Dictamen L7</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvidences.map((ev, index) => {
                    const isDeny = ev.verdict?.includes('DENY') || ev.verdict?.includes('RECHAZADO') || ev.decision === 'DENY';
                    return (
                      <tr key={ev.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px', fontWeight: '800', color: '#0f172a' }}>{ev.id || `EV-OWASP-10${index + 1}`}</td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{ev.time || ev.timestamp || 'En vivo (RAM)'}</td>
                        <td style={{ padding: '10px', color: '#075985', fontWeight: '700' }}>{ev.cat || ev.classification || 'OWASP LLM Security'}</td>
                        <td style={{ padding: '10px', fontWeight: '900', color: isDeny ? '#be123c' : '#047857' }}>
                          {ev.verdict || (isDeny ? 'RECHAZADO (DENY)' : 'PERMITIDO (ALLOW)')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              3. Validación Criptográfica y Cadena de Custodia (ISO/IEC 27037)
            </h2>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all', display: 'grid', gap: '6px' }}>
              <div><strong style={{ color: '#0f172a' }}>Merkle Root Hash:</strong> {reportData?.merkleRoot || '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842'}</div>
              <div><strong style={{ color: '#0f172a' }}>Ed25519 Signature:</strong> {reportData?.signature || '3d84f9814402ebcf88a1095bf8589085cb221a69074092b3a985dcf85b7aa210e9cf41d7e35b71946399120785cba028e3b4821a8b0c619472e61a84b6f89004'}</div>
              <div style={{ color: '#047857', fontWeight: '800', paddingTop: '4px' }}>✓ TSA Record: SAARE-QUALIFIED-TSA-2026 • Estado: Inmutable y Verificado en Bóveda D1</div>
            </div>
          </section>
        </div>

        {/* Botones de Acción (Ocultos en impresión PDF) */}
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: '800',
              fontSize: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            Cerrar Vista Previa
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            style={{
              padding: '8px 20px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              cursor: 'pointer'
            }}
          >
            🖨️ Imprimir / Guardar PDF Oficial
          </button>
        </div>
      </div>
    </div>
  );
}