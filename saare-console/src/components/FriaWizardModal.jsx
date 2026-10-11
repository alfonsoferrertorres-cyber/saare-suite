// src/components/FriaWizardModal.jsx
import React, { useState } from 'react';

export default function FriaWizardModal({ isOpen = true, onClose, onSave, onGenerateReport, tenantId }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    useCaseName: 'Agente Financiero - Tesorería',
    department: 'Dirección Operativa y Tesorería',
    aiModel: 'S.A.A.R.E. L7 Sovereign Agent Engine',
    purpose: 'Automatización de pagos y transferencias a proveedores',
    highRiskCategory: 'ALTO_RIESGO',
    affectedGroups: 'Clientes, Proveedores, Empleados',
    humanOversight: 'HUMAN_IN_THE_LOOP',
    mitigationControls: ['Intercepción L7 Ex-Ante', 'Sanitización de PII', 'Firma Criptográfica Ed25519']
  });

  if (!isOpen) return null;

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    const finalReport = {
      ...formData,
      completedAt: new Date().toISOString(),
      friaId: `FRIA-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      normativeSpec: 'EU AI Act Art. 27 / SGP 1.0',
      tenantId: tenantId || 'ENTERPRISE'
    };

    const callback = onGenerateReport || onSave;
    if (typeof callback === 'function') {
      callback(finalReport);
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Cabecera del Wizard */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              EU AI ACT ART. 27 · FRIA ASSISTANT
            </span>
            <h3 className="text-xl font-extrabold text-white">
              Evaluación de Impacto en Derechos Fundamentales
            </h3>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full">
            Paso {step} de 3
          </span>
        </div>

        {/* Paso 1: Identificación del Sistema */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                Nombre del Sistema / Agente de IA
              </label>
              <input
                type="text"
                value={formData.useCaseName}
                onChange={(e) => setFormData({ ...formData, useCaseName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                Departamento y Modelo Base
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Departamento"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <input
                  type="text"
                  placeholder="Modelo IA"
                  value={formData.aiModel}
                  onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                Finalidad Prevista y Contexto Operativo
              </label>
              <textarea
                rows={2}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Paso 2: Clasificación de Riesgo y Colectivos Afectados */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                Categoría de Riesgo (EU AI Act Anexo III)
              </label>
              <select
                value={formData.highRiskCategory}
                onChange={(e) => setFormData({ ...formData, highRiskCategory: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="ALTO_RIESGO">Alto Riesgo (Anexo III - Infraestructuras / Servicios Esenciales)</option>
                <option value="RIESGO_LIMITADO">Riesgo Limitado (Transparencia / Chatbots)</option>
                <option value="RIESGO_MINIMO">Riesgo Mínimo / Nulo</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                Colectivos de Personas Afectadas
              </label>
              <input
                type="text"
                value={formData.affectedGroups}
                onChange={(e) => setFormData({ ...formData, affectedGroups: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Paso 3: Mecanismos de Supervisión y Mitigación */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                Modelo de Supervisión Humana
              </label>
              <select
                value={formData.humanOversight}
                onChange={(e) => setFormData({ ...formData, humanOversight: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="HUMAN_IN_THE_LOOP">Human-in-the-Loop (Autorización humana previa)</option>
                <option value="HUMAN_ON_THE_LOOP">Human-on-the-Loop (Monitoreo ex-post y circuit breaker)</option>
                <option value="HUMAN_IN_COMMAND">Human-in-Command (Control estructural de capacidad)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">
                CONTROLES MITIGANTES S.A.A.R.E. L7 VINCULADOS:
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 font-mono text-[11px]">
                {formData.mitigationControls.map((ctrl, i) => (
                  <li key={i}>{ctrl}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Botones de Navegación del Modal */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={step === 1 ? onClose : prevStep}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              ✓ Finalizar y Vincular a Bóveda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}