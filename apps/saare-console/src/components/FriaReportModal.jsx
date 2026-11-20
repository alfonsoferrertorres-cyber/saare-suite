// saare-console/src/components/FriaReportModal.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import pdfGeneratorService, { generatePdfFromElement } from '../services/pdfGeneratorService';

export default function FriaReportModal({ onClose, onGenerate, friaData }) {
  const currentUser = api?.getCurrentUser?.() || {};
  const userEmail = currentUser.email || '';
  const tenantDomain = currentUser.tenantId || friaData?.tenantId || 'TENANT_NO_ESPECIFICADO';

  const [downloading, setDownloading] = useState(false);

  const [useCaseName, setUseCaseName] = useState('');
  const [department, setDepartment] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [highRiskCategory, setHighRiskCategory] = useState('Alto Riesgo (Art. 6 / Anexo III EU AI Act)');
  const [humanOversight, setHumanOversight] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmitWizard = (e) => {
    e.preventDefault();
    if (typeof onGenerate === 'function') {
      onGenerate({
        tenantId: tenantDomain,
        useCaseName: useCaseName.trim(),
        department: department.trim(),
        aiModel: aiModel.trim(),
        highRiskCategory,
        humanOversight: humanOversight.trim()
      });
    }
    if (typeof onClose === 'function') onClose();
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    const filename = `FRIA_${tenantDomain.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    try {
      if (pdfGeneratorService && typeof pdfGeneratorService.generateFromElement === 'function') {
        await pdfGeneratorService.generateFromElement('fria-report-document', { filename });
      } else if (typeof generatePdfFromElement === 'function') {
        await generatePdfFromElement('fria-report-document', filename);
      } else if (typeof window !== 'undefined') {
        window.print();
      }
    } catch (err) {
      console.error('[FRIA_MODAL] Error generando PDF:', err);
      if (typeof window !== 'undefined') window.print();
    } finally {
      setDownloading(false);
    }
  };

  const assessment = friaData || {
    systemName: useCaseName || 'No especificado',
    aiCategory: highRiskCategory,
    purpose: 'Evaluación de impacto en derechos fundamentales del sistema de IA.',
    affectedGroups: 'Colectivos definidos por el tenant desplegador.',
    humanOversightMode: humanOversight || 'No especificado',
    mitigationMeasures: 'Controles configurados para el tenant.',
    riskLevel: 'PENDIENTE DE EVALUACIÓN',
    merkleRoot: '',
    signature: ''
  };

  if (typeof onGenerate === 'function' && !friaData) {
    return (
      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '16px' }}
      >
        <div style={{ background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '24px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#38bdf8', fontWeight: '900' }}>
              FRIA WIZARD — EVALUACIÓN DE IMPACTO (ART. 27 EU AI ACT)
            </h2>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          <form onSubmit={handleSubmitWizard} style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>NOMBRE DEL SISTEMA / CASO DE USO IA:</label>
              <input type="text" required placeholder="Ej. Clasificador documental interno" value={useCaseName} onChange={(e) => setUseCaseName(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>DEPARTAMENTO / ÁREA:</label>
                <input type="text" required placeholder="Ej. Cumplimiento y Riesgos" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>MODELO / PROVEEDOR:</label>
                <input type="text" required placeholder="Especificar modelo o despliegue" value={aiModel} onChange={(e) => setAiModel(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>CLASIFICACIÓN DE RIESGO:</label>
              <select value={highRiskCategory} onChange={(e) => setHighRiskCategory(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#f59e0b', fontWeight: '800', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}>
                <option value="Alto Riesgo (Art. 6 / Anexo III EU AI Act)">Alto Riesgo (Art. 6 / Anexo III EU AI Act)</option>
                <option value="Riesgo Específico de Transparencia (Art. 50)">Riesgo Específico de Transparencia (Art. 50)</option>
                <option value="Riesgo Mínimo / Soporte Interno">Riesgo Mínimo / Soporte Interno</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>MODELO DE SUPERVISIÓN HUMANA:</label>
              <textarea rows={2} required placeholder="Describir controles y revisión humana" value={humanOversight} onChange={(e) => setHumanOversight(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.78rem', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} style={{ flex: '1', padding: '10px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>CANCELAR</button>
              <button type="submit" style={{ flex: '2', padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer' }}>GENERAR EXPEDIENTE FRIA</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && typeof onClose === 'function' && onClose()}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '16px' }}
    >
      <div
        id="fria-report-document"
        style={{ backgroundColor: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '896px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '32px', fontFamily: 'system-ui, -apple-system, sans-serif', border: '1px solid #e2e8f0' }}
      >
        <div style={{ borderBottom: '2px solid #059669', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#020617' }}>
              FRIA — EVALUACIÓN DE IMPACTO
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              Fundamental Rights Impact Assessment
            </p>
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.72rem', fontFamily: 'monospace', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: '1.5' }}>
            <div><strong style={{ color: '#1e293b' }}>Tenant:</strong> {tenantDomain}</div>
            <div><strong style={{ color: '#1e293b' }}>Evaluador:</strong> {userEmail || 'No especificado'}</div>
            <div><strong style={{ color: '#1e293b' }}>Fecha:</strong> {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', lineHeight: '1.6', color: '#334155', display: 'grid', gap: '16px' }}>
          <div><strong>Sistema de IA:</strong> {assessment.systemName}</div>
          <div><strong>Clasificación de Riesgo:</strong> {assessment.aiCategory}</div>
          <div><strong>Propósito Previsto:</strong> {assessment.purpose}</div>
          <div><strong>Colectivos Afectados:</strong> {assessment.affectedGroups}</div>
          <div><strong>Supervisión Humana:</strong> {assessment.humanOversightMode}</div>
          <div><strong>Medidas de Mitigación:</strong> {assessment.mitigationMeasures}</div>
          <div><strong>Dictamen:</strong> {assessment.riskLevel}</div>

          {(assessment.merkleRoot || assessment.signature) && (
            <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.68rem', wordBreak: 'break-all' }}>
              {assessment.merkleRoot ? <div>MERKLE_ROOT: {assessment.merkleRoot}</div> : null}
              {assessment.signature ? <div>ED25519_SIG: {assessment.signature}</div> : null}
            </div>
          )}
        </div>

        <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            Cerrar
          </button>
          <button type="button" onClick={handleDownloadPdf} disabled={downloading} style={{ padding: '8px 20px', backgroundColor: '#059669', color: '#ffffff', fontWeight: '800', fontSize: '0.75rem', borderRadius: '8px', border: 'none', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1 }}>
            {downloading ? 'Generando PDF...' : 'Exportar Informe FRIA (PDF)'}
          </button>
        </div>
      </div>
    </div>
  );
}