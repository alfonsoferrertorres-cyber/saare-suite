import React from 'react';

export const GrcReportTemplate = ({ data, id }) => {
  return (
    <div id={id} className="p-6 bg-white text-black font-sans border rounded">
      <h1 className="text-xl font-bold mb-4">
        INFORME DE ANÁLISIS GAP Y MADUREZ GRC
      </h1>

      {/* 1. ALCANCE GENERAL */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">1. ALCANCE Y MADUREZ</h2>
        <p><strong>Entidad Evaluada:</strong> {data?.company_name || 'N/A'}</p>
        <p><strong>Fecha de Evaluación:</strong> {data?.evaluation_date || new Date().toLocaleDateString()}</p>
        <p><strong>Índice Global de Madurez:</strong> <span className="font-bold">{data?.overall_score || '0'}%</span></p>
      </section>

      {/* 2. MATRIZ DE CUMPLIMIENTO */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">2. MATRIZ DE CUMPLIMIENTO NORMATIVO</h2>
        <table className="w-full text-left text-sm border-collapse border">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 border">Normativa</th>
              <th className="p-2 border">% Cumplimiento</th>
              <th className="p-2 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">EU AI Act (Reglamento de IA)</td>
              <td className="p-2 border">{data?.ai_act_score || '0'}%</td>
              <td className="p-2 border">{data?.ai_act_status || 'En Revisión'}</td>
            </tr>
            <tr>
              <td className="p-2 border">Real Decreto 723/2026 (Algoritmos)</td>
              <td className="p-2 border">{data?.rd723_score || '0'}%</td>
              <td className="p-2 border">{data?.rd723_status || 'En Revisión'}</td>
            </tr>
            <tr>
              <td className="p-2 border">DORA / RGPD</td>
              <td className="p-2 border">{data?.dora_score || '0'}%</td>
              <td className="p-2 border">{data?.dora_status || 'Conforme'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 3. PLAN DE ACCIÓN Y BRECHAS (GAPS) */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">3. PLAN DE ACCIÓN Y BRECHAS DETECTADAS</h2>
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-gray-50 border">
            <p className="font-bold">Brecha 1: {data?.gap_1_description || 'Transparencia de criterios de asignación laboral'}</p>
            <p className="text-xs text-gray-700">Acción recomendada: {data?.gap_1_action || 'Generar anexo informativo para trabajadores (<30 días hábiles)'}</p>
          </div>
          <div className="p-2 bg-gray-50 border">
            <p className="font-bold">Brecha 2: {data?.gap_2_description || 'Actualización de evaluación FRIA para IA de alto riesgo'}</p>
            <p className="text-xs text-gray-700">Acción recomendada: {data?.gap_2_action || 'Completar registro de mitigación de sesgos y supervisores asignados'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};