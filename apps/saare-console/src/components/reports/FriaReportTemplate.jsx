import React from 'react';

export const FriaReportTemplate = ({ data, id }) => {
  return (
    <div id={id} className="p-6 bg-white text-black font-sans border rounded">
      <h1 className="text-xl font-bold mb-4">
        EVALUACIÓN DE IMPACTO FRIA (ART. 27 EU AI ACT)
      </h1>

      {/* 1. INFORMACIÓN DEL SISTEMA */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">1. INFORMACIÓN DEL SISTEMA</h2>
        <p><strong>Nombre del Caso de Uso:</strong> {data?.use_case_name || 'N/A'}</p>
        <p><strong>Departamento / Unidad:</strong> {data?.department || 'N/A'}</p>
        <p><strong>Fecha de Evaluación:</strong> {data?.created_at || new Date().toLocaleDateString()}</p>
        <p><strong>Evaluador / Consultor:</strong> {data?.author || 'N/A'}</p>
      </section>

      {/* 2. CLASIFICACIÓN Y SUPERVISIÓN */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">2. CLASIFICACIÓN Y SUPERVISIÓN</h2>
        <p><strong>Categoría de Riesgo (Anexo III):</strong> {data?.risk_category || 'N/A'}</p>
        <p><strong>Esquema de Supervisión Humana:</strong> {data?.human_oversight_type || 'N/A'}</p>
        <p><strong>Justificación de Operación:</strong> {data?.oversight_description || 'N/A'}</p>
      </section>

      {/* 3. EVALUACIÓN DE IMPACTO Y RIESGOS */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">3. EVALUACIÓN DE IMPACTO Y RIESGOS</h2>
        <p><strong>Impacto en Privacidad:</strong> {data?.impact_privacy || 'N/A'}</p>
        <p><strong>Riesgo de Sesgo / Discriminación:</strong> {data?.impact_bias || 'N/A'}</p>
        <p><strong>Derechos Afectados:</strong> {data?.affected_rights || 'N/A'}</p>
      </section>

      {/* 4. MEDIDAS DE MITIGACIÓN Y VERDICTO */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">4. MEDIDAS DE MITIGACIÓN Y VERDICTO</h2>
        <p><strong>Controles Implementados:</strong> {data?.mitigation_controls || 'N/A'}</p>
        <p><strong>Estado de Cumplimiento:</strong> {data?.compliance_status || 'N/A'}</p>
        <div className="mt-2 p-2 bg-gray-100 font-mono text-xs">
          <strong>Firma Digital:</strong> {data?.signature_hash || 'PENDIENTE'}
        </div>
      </section>
    </div>
  );
};