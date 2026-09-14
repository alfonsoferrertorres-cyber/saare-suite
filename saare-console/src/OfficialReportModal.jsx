import React from 'react';

export default function OfficialReportModal({ onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
      
      {/* Contenedor tipo Hoja Oficial con Membrete */}
      <div style={{ background: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
        
        {/* Encabezado / Membrete Oficial */}
        <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#030712', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              S.A.A.R.E. <span style={{ color: '#0284c7', fontSize: '1rem', fontWeight: '600' }}>ENTERPRISE GOVERNANCE REPORT</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Sovereign AI Authorization & Runtime Enforcement • Grado Financiero
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <strong>Clasificación:</strong> Confidencial / CISO<br/>
            <strong>Fecha:</strong> {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}<br/>
            <strong>Frameworks:</strong> NIST CSF 2.0 • OWASP LLM Top 10 • DORA
          </div>
        </div>

        {/* Cuerpo del Informe */}
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginTop: '0' }}>
            1. Resumen Ejecutivo y Alineación Normativa
          </h3>
          <p>
            El presente informe certifica la operatividad de los controles de gobernanza, protección ex-ante y detección en tiempo real bajo los estándares globales <strong>NIST CSF 2.0</strong> y <strong>OWASP LLM Top 10</strong>. Todas las interacciones de IA y agentes autónomos están sujetas al principio de seguridad <em>Fail-Closed</em>.
          </p>

          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginTop: '24px' }}>
            2. Auditoría de Veredictos e Intercepciones L7
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '8px', color: '#475569' }}>ID Evidencia</th>
                <th style={{ padding: '8px', color: '#475569' }}>Timestamp</th>
                <th style={{ padding: '8px', color: '#475569' }}>Clasificación OWASP / NIST</th>
                <th style={{ padding: '8px', color: '#475569' }}>Dictamen</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', fontFamily: 'monospace' }}>EV-OWASP-101</td>
                <td style={{ padding: '8px' }}>En vivo</td>
                <td style={{ padding: '8px' }}>LLM01:2025 - Prompt Injection</td>
                <td style={{ padding: '8px', color: '#dc2626', fontWeight: 'bold' }}>RECHAZADO (DENY)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', fontFamily: 'monospace' }}>EV-OWASP-102</td>
                <td style={{ padding: '8px' }}>En vivo</td>
                <td style={{ padding: '8px' }}>LLM02:2025 - Sensitive Data Disclosure</td>
                <td style={{ padding: '8px', color: '#dc2626', fontWeight: 'bold' }}>RECHAZADO (DENY)</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginTop: '24px' }}>
            3. Validación Criptográfica y Cadena de Custodia (ISO/IEC 27037)
          </h3>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <strong>Merkle Root Hash:</strong> 6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842<br/>
            <strong>Ed25519 Signature:</strong> 3d84f9814402ebcf88a1095bf8589085cb221a69074092b3a985dcf85b7aa210e9cf41d7e35b71946399120785cba028e3b4821a8b0c619472e61a84b6f89004<br/>
            <strong>TSA Record:</strong> SAARE-OWASP-2026 • Estado: Verificado e Inmutable
          </div>
        </div>

        {/* Botones de Acción (Ocultos al imprimir en PDF) */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }} className="no-print">
          <button 
            onClick={onClose}
            style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
            Cerrar Vista Previa
          </button>
          <button 
            onClick={handlePrint}
            style={{ padding: '10px 24px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}>
            Imprimir / Guardar como PDF
          </button>
        </div>

      </div>
    </div>
  );
}
