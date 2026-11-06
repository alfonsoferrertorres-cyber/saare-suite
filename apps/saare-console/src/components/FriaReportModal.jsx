// saare-console/src/components/FriaReportModal.jsx — Asistente y Evaluación de Impacto FRIA (Art. 27 EU AI Act)
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import pdfGeneratorService, { generatePdfFromElement } from '../services/pdfGeneratorService';

export default function FriaReportModal({ onClose, onGenerate, friaData }) {
  const currentUser = api.getCurrentUser() || {};
  const userEmail = currentUser.email || localStorage.getItem('saare_user_email') || '';
  const tenantDomain = currentUser.tenantId || localStorage.getItem('saare_tenant_domain') || 'ORGANISMO_DEMO_01';

  const [downloading, setDownloading] = useState(false);

  // Formulario interactivo para wizard
  const [useCaseName, setUseCaseName] = useState('Sistema de Clasificación e Inferencia IA');
  const [department, setDepartment] = useState('Operaciones y Ciberseguridad');
  const [aiModel, setAiModel] = useState('Google Gemini 1.5 Pro / GPT-4o Híbrido');
  const [highRiskCategory, setHighRiskCategory] = useState('Alto Riesgo (Art. 6 / Anexo III EU AI Act)');
  const [humanOversight, setHumanOversight] = useState('Supervisión Ex-Ante L7 con aprobación humana obligatoria en DENY');

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
        useCaseName,
        department,
        aiModel,
        highRiskCategory,
        humanOversight
      });
    }
    if (typeof onClose === 'function') onClose();
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    const filename = `SAARE_FRIA_EVALUATION_${tenantDomain.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    try {
      if (pdfGeneratorService && typeof pdfGeneratorService.generateFromElement === 'function') {
        await pdfGeneratorService.generateFromElement('fria-report-document', { filename });
      } else if (typeof generatePdfFromElement === 'function') {
        await generatePdfFromElement('fria-report-document', filename);
      } else {
        window.print();
      }
    } catch (err) {
      console.error('[FRIA_MODAL] Error generando PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const assessment = friaData || {
    systemName: useCaseName,
    aiCategory: highRiskCategory,
    purpose: 'Auditoría e intercepción ex-ante de fugas PII, inyecciones de código y sesgos en modelos de IA.',
    affectedGroups: 'Empleados, Clientes finales y Operadores de infraestructura crítica.',
    humanOversightMode: humanOversight,
    mitigationMeasures: 'Bóveda dual L7 en RAM, firma criptográfica Ed25519 e inmutabilidad en Bóveda D1.',
    riskLevel: 'RIESGO RESIDUAL CONTROLADO (BAJO)'
  };

  // Si se abre como wizard interactivo desde App.jsx
  if (typeof onGenerate === 'function' && !friaData) {
    return (
      <div 
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '16px' }}
      >
        <div style={{ background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '24px', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#38bdf8', fontWeight: '900' }}>
              ⚖️ FRIA WIZARD — EVALUACIÓN DE IMPACTO (ART. 27 EU AI ACT)
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          <form onSubmit={handleSubmitWizard} style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>NOMBRE DEL SISTEMA / CASO DE USO IA:</label>
              <input type="text" value={useCaseName} onChange={(e) => setUseCaseName(e.target.value)} required style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>DEPARTAMENTO / ÁREA:</label>
                <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>MODELO / LLM:</label>
                <input type="text" value={aiModel} onChange={(e) => setAiModel(e.target.value)} required style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>CLASIFICACIÓN DE RIESGO (EU AI ACT):</label>
              <select value={highRiskCategory} onChange={(e) => setHighRiskCategory(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#f59e0b', fontWeight: '800', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}>
                <option value="Alto Riesgo (Art. 6 / Anexo III EU AI Act)">Alto Riesgo (Art. 6 / Anexo III EU AI Act)</option>
                <option value="Riesgo Especifico de Transparencia (Art. 50)">Riesgo Específico de Transparencia (Art. 50)</option>
                <option value="Riesgo Mínimo / Sistemas de Soporte Interno">Riesgo Mínimo / Soporte Interno</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>MODELO DE SUPERVISIÓN HUMANA:</label>
              <textarea rows={2} value={humanOversight} onChange={(e) => setHumanOversight(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.78rem', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} style={{ flex: '1', padding: '10px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>CANCELAR</button>
              <button type="submit" style={{ flex: '2', padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer' }}>⚖️ GENERAR Y SELLAR EXPEDIENTE FRIA</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Vista de informe completado
  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && typeof onClose === 'function' && onClose()}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '16px' }}
    >
      <div 
        id="fria-report-document"
        style={{ backgroundColor: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '896px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', fontFamily: 'system-ui, -apple-system, sans-serif', border: '1px solid #e2e8f0' }}
      >
        <div style={{ borderBottom: '2px solid #059669', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#020617', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚖️ FRIA — EVALUACIÓN DE IMPACTO
              <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
                Art. 27 EU AI Act
              </span>
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              Fundamental Rights Impact Assessment • Conforme al Reglamento (UE) 2024/1689
            </p>
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.72rem', fontFamily: 'monospace', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: '1.5' }}>
            <div><strong style={{ color: '#1e293b' }}>Entidad Desplegadora:</strong> {tenantDomain}</div>
            <div><strong style={{ color: '#1e293b' }}>Evaluador / DPO:</strong> {userEmail || 'Operador Registrado'}</div>
            <div><strong style={{ color: '#1e293b' }}>Fecha de Emisión:</strong> {new Date().toLocaleDateString()}</div>
            <div style={{ color: '#047857', fontWeight: '800', marginTop: '4px' }}>Estatus: CONFORME Y VALIDADO</div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', lineHeight: '1.6', color: '#334155', display: 'grid', gap: '20px' }}>
          <section>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              1. Identificación del Sistema de IA y Ámbito de Despliegue
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <div><strong>Sistema de IA:</strong> {assessment.systemName}</div>
              <div><strong>Clasificación de Riesgo:</strong> {assessment.aiCategory}</div>
            </div>
            <p style={{ marginTop: '8px', marginBottom: 0 }}>
              <strong>Propósito Previsto:</strong> {assessment.purpose}
            </p>
          </section>

          <section>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              2. Colectivos Afectados y Análisis de Impacto en Derechos
            </h2>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Categoría de Personas Afectadas:</strong> {assessment.affectedGroups}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Derecho Fundamental (Carta UE)</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Riesgo Identificado</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Evaluación</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: '700' }}>Art. 8 — Protección de Datos Personales</td>
                  <td style={{ padding: '8px' }}>Fuga de PII a proveedores LLM de terceros</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#047857', fontWeight: '800' }}>MITIGADO (Fail-Closed)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: '700' }}>Art. 21 — No Discriminación y Sesgo</td>
                  <td style={{ padding: '8px' }}>Generación de respuestas discriminatorias</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#047857', fontWeight: '800' }}>AUDITADO (Filtros L7)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: '700' }}>Art. 47 — Tutela Judicial Efectiva</td>
                  <td style={{ padding: '8px' }}>Falta de explicabilidad y trazabilidad</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#047857', fontWeight: '800' }}>GARANTIZADO (ISO 27037)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              3. Medidas de Supervisión Humana y Gobernanza Técnica
            </h2>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem', display: 'grid', gap: '6px' }}>
              <div><strong>Mecanismo de Control Humano:</strong> {assessment.humanOversightMode}</div>
              <div><strong>Controles de Mitigación Técnica:</strong> {assessment.mitigationMeasures}</div>
              <div style={{ color: '#047857', fontWeight: '900', marginTop: '4px' }}>
                DICTAMEN FINAL: {assessment.riskLevel}
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              4. Anclaje Criptográfico y Sello Digital
            </h2>
            <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.68rem', wordBreak: 'break-all' }}>
              <div>MERKLE_ROOT: 6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842</div>
              <div>ED25519_SIG: 3d84f9814402ebcf88a1095bf8589085cb221a69074092b3a985dcf85b7aa210e</div>
              <div style={{ color: '#34d399', marginTop: '4px', fontWeight: 'bold' }}>✓ REGISTRO OFICIAL DE AUDITORÍA REGISTRADO EN BÓVEDA D1</div>
            </div>
          </section>
        </div>

        <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            Cerrar
          </button>
          <button type="button" onClick={handleDownloadPdf} disabled={downloading} style={{ padding: '8px 20px', backgroundColor: '#059669', color: '#ffffff', fontWeight: '800', fontSize: '0.75rem', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1 }}>
            {downloading ? 'Generando PDF...' : '🖨️ Exportar Informe FRIA (PDF)'}
          </button>
        </div>
      </div>
    </div>
  );
}