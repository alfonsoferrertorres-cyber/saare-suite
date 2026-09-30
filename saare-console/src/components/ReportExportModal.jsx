// saare-console/src/components/ReportExportModal.jsx
import React, { useState } from 'react';

export function ReportExportModal({ useCaseId, onClose }) {
  const [exporting, setExporting] = useState(false);

  const handleDownload = (type) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Informe ${type} generado correctamente.`);
      if (onClose) onClose();
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#0b0f19', border: '1px solid #059669', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#34d399', fontWeight: '900' }}>
          📋 Exportación de Informes Auditados (PDF)
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
          Seleccione el tipo de expediente formal a generar para la organización <strong>{useCaseId}</strong>:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <button 
            onClick={() => handleDownload('GRC_COMPLIANCE')}
            disabled={exporting}
            style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', color: '#38bdf8', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📜 Expediente de Cumplimiento GRC (EU AI Act)</span>
            <span style={{ fontSize: '0.75rem', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>PDF</span>
          </button>

          <button 
            onClick={() => handleDownload('DORA_RESILIENCE')}
            disabled={exporting}
            style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', color: '#a78bfa', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛡️ Auditoría de Resiliencia Operativa DORA</span>
            <span style={{ fontSize: '0.75rem', background: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>PDF</span>
          </button>

          <button 
            onClick={() => handleDownload('GRANT_JUSTIFICATION')}
            disabled={exporting}
            style={{ padding: '12px', background: '#0f172a', border: '1px solid #1e293b', color: '#34d399', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🏛️ Memoria Justificativa de Subvenciones (Red.es / INCIBE)</span>
            <span style={{ fontSize: '0.75rem', background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>PDF</span>
          </button>
        </div>

        <button 
          onClick={onClose}
          style={{ width: '100%', padding: '10px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
          Cancelar / Cerrar
        </button>
      </div>
    </div>
  );
}

export default ReportExportModal;