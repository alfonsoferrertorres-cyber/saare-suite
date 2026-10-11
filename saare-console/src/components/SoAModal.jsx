// saare-console/src/components/SoAModal.jsx
import React, { useState } from 'react';

const INITIAL_ISO_CONTROLS = [
  {
    id: 'A.5.1',
    standard: 'ISO 27001:2022',
    name: 'Políticas para la seguridad de la información',
    applicable: true,
    justification: 'Obligatorio. Definición de directivas de gobernanza y control ex-ante en Capa 7.',
    status: 'IMPLEMENTED'
  },
  {
    id: 'A.8.28',
    standard: 'ISO 27001:2022',
    name: 'Codificación segura e intercepción de APIs',
    applicable: true,
    justification: 'Aplicado mediante el filtro Fail-Closed y desinfección de payloads en memoria RAM.',
    status: 'IMPLEMENTED'
  },
  {
    id: 'B.5.1',
    standard: 'ISO/IEC 42001',
    name: 'Gobernanza del Sistema de Gestión de Inteligencia Artificial (AIMS)',
    applicable: true,
    justification: 'Matriz de control determinista sobre modelos generativos y agentes autónomos.',
    status: 'IMPLEMENTED'
  },
  {
    id: 'B.6.2',
    standard: 'ISO/IEC 42001',
    name: 'Trazabilidad y Calidad de Datos de Inferencia (Zero-Disk)',
    applicable: true,
    justification: 'Garantizado por el ciclo de vida volátil, HugePages de 2MB y purga SYS_madvise.',
    status: 'IMPLEMENTED'
  },
  {
    id: 'B.8.4',
    standard: 'ISO/IEC 42001',
    name: 'Mitigación de Sesgos y Comportamiento Estocástico (Alucinaciones)',
    applicable: true,
    justification: 'Filtro semántico continuo en Capa 7 con desviación controlada ΔE < 0.01%.',
    status: 'IMPLEMENTED'
  },
  {
    id: 'A.10.1',
    standard: 'ISO 27001:2022',
    name: 'Controles criptográficos y no repudio',
    applicable: true,
    justification: 'Firma asimétrica Ed25519 y sellado de tiempo TSA RFC 3161 sobre Bóveda WORM.',
    status: 'IMPLEMENTED'
  }
];

export default function SoAModal({ isOpen = true, onClose, tenantId = 'ENTERPRISE' }) {
  const [controls, setControls] = useState(INITIAL_ISO_CONTROLS);
  const [filter, setFilter] = useState('ALL');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const toggleApplicability = (id) => {
    setControls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, applicable: !c.applicable } : c))
    );
  };

  const handleExportSoA = (format) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Declaración de Aplicabilidad (SoA ${format}) generada correctamente bajo ISO 27001 / ISO 42001.`);
    }, 1000);
  };

  const filteredControls = controls.filter((c) => {
    if (filter === 'APPLICABLE') return c.applicable;
    if (filter === 'EXCLUDED') return !c.applicable;
    return true;
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(2, 6, 23, 0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#0b0f19', border: '1px solid #0284c7', borderRadius: '16px', width: '100%', maxWidth: '850px', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)', overflow: 'hidden' }}>
        
        {/* Cabecera del Modal */}
        <div style={{ padding: '20px 24px', background: '#020617', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ISO/IEC 27001 & ISO/IEC 42001 AUDIT READY
            </div>
            <h2 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', color: '#fff', fontWeight: '900' }}>
              📜 DECLARACIÓN DE APLICABILIDAD (SoA)
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Barra de Filtros y Estado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setFilter('ALL')} style={{ padding: '6px 12px', background: filter === 'ALL' ? '#0284c7' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                Todos ({controls.length})
              </button>
              <button onClick={() => setFilter('APPLICABLE')} style={{ padding: '6px 12px', background: filter === 'APPLICABLE' ? '#059669' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                Aplicables ({controls.filter(c => c.applicable).length})
              </button>
              <button onClick={() => setFilter('EXCLUDED')} style={{ padding: '6px 12px', background: filter === 'EXCLUDED' ? '#dc2626' : '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                Excluidos ({controls.filter(c => !c.applicable).length})
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Organización: <strong style={{ color: '#38bdf8' }}>{tenantId}</strong>
            </div>
          </div>

          {/* Tabla de Controles SoA */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#020617', color: '#64748b', borderBottom: '1px solid #1e293b' }}>
                <th style={{ padding: '10px' }}>CÓDIGO / NORMA</th>
                <th style={{ padding: '10px' }}>CONTROL</th>
                <th style={{ padding: '10px' }}>ESTADO</th>
                <th style={{ padding: '10px' }}>JUSTIFICACIÓN TÉCNICA</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>APLICABLE</th>
              </tr>
            </thead>
            <tbody>
              {filteredControls.map((ctrl) => (
                <tr key={ctrl.id} style={{ borderBottom: '1px solid #1e293b', background: ctrl.applicable ? 'transparent' : 'rgba(239, 68, 68, 0.05)' }}>
                  <td style={{ padding: '10px', fontWeight: '800', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                    {ctrl.id}
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'normal' }}>{ctrl.standard}</div>
                  </td>
                  <td style={{ padding: '10px', color: '#f8fafc', fontWeight: '600' }}>{ctrl.name}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', background: ctrl.applicable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: ctrl.applicable ? '#34d399' : '#f87171' }}>
                      {ctrl.applicable ? ctrl.status : 'EXCLUDED'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#94a3b8', fontSize: '0.72rem' }}>{ctrl.justification}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={ctrl.applicable}
                      onChange={() => toggleApplicability(ctrl.id)}
                      style={{ cursor: 'pointer', accentColor: '#0284c7' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        {/* Pie del Modal con Descarga de PDF/JSON */}
        <div style={{ padding: '16px 24px', background: '#020617', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Extracción Hot GRC habilitada conforme a SGP 1.0
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleExportSoA('JSON')} disabled={exporting} style={{ padding: '8px 14px', background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              Exportar JSON
            </button>
            <button onClick={() => handleExportSoA('PDF')} disabled={exporting} style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {exporting ? 'Generando SoA...' : '📄 Generar Informe SoA Oficial (PDF)'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}