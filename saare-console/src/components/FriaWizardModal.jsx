import React, { useState } from 'react';

export default function FriaWizardModal({ isOpen, onClose, onGenerateReport, evidencesCount, tenantId }) {
  const [formData, setFormData] = useState({
    useCaseName: 'Asistente Corporativo de Consultoría / Atención',
    department: 'Operaciones & Atención al Cliente',
    aiModel: 'LLM Multi-Provider (OpenAI / Claude / Local)',
    highRiskCategory: 'Anexo III - Evaluación de Crédito y Empleo',
    humanOversight: 'SUPERVISION_HUMANA_CONTINUA',
    affectedGroups: 'Clientes finales y empleados corporativos'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerateReport(formData);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div style={{ background: '#0b0f19', border: '1px solid #0284c7', borderRadius: '12px', width: '90%', maxWidth: '600px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px rgba(0,0,0,0.7)' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '1.1rem', fontWeight: '900' }}>
          📋 EVALUADOR OFICIAL FRIA (Art. 27 EU AI Act)
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: '#94a3b8' }}>
          Complete la matriz de impacto para cruzar el contexto del negocio con los <strong>{evidencesCount} registros reales</strong> de la Bóveda.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '800', marginBottom: '4px' }}>Nombre del Proyecto / Caso de Uso IA:</label>
            <input 
              type="text" 
              value={formData.useCaseName} 
              onChange={e => setFormData({ ...formData, useCaseName: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '800', marginBottom: '4px' }}>Departamento:</label>
              <input 
                type="text" 
                value={formData.department} 
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '800', marginBottom: '4px' }}>Categoría de Alto Riesgo:</label>
              <select 
                value={formData.highRiskCategory} 
                onChange={e => setFormData({ ...formData, highRiskCategory: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}
              >
                <option value="Anexo III - Evaluación de Crédito y Empleo">Anexo III - Crédito / Recursos Humanos</option>
                <option value="Anexo III - Infraestructuras Críticas">Anexo III - Infraestructuras Críticas</option>
                <option value="Anexo III - Biometría y Acceso">Anexo III - Identificación Biométrica</option>
                <option value="General - Riesgo Limitado (Transparencia)">Riesgo Limitado / Transparencia</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '800', marginBottom: '4px' }}>Mecanismo de Supervisión Humana:</label>
            <select 
              value={formData.humanOversight} 
              onChange={e => setFormData({ ...formData, humanOversight: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: '#020617', border: '1px solid #1e293b', color: '#4ade80', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}
            >
              <option value="SUPERVISION_HUMANA_CONTINUA">Human-in-the-loop (Revisión humana previa)</option>
              <option value="SUPERVISION_EX_POST">Human-on-the-loop (Auditoría ex-post en Bóveda SAARE)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
              Cancelar
            </button>
            <button type="submit" style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              ⚡ Generar Expediente FRIA + Sello D1
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
