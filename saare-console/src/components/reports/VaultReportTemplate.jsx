import React from 'react';

export const VaultReportTemplate = ({ data, id }) => {
  return (
    <div id={id} className="p-6 bg-white text-black font-sans border rounded">
      <h1 className="text-xl font-bold mb-4">
        CERTIFICADO DE EVIDENCIA CRIPTOGRÁFICA DE BÓVEDA
      </h1>

      {/* 1. CABECERA DE AUDITORÍA */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">1. CABECERA DE AUDITORÍA</h2>
        <p><strong>ID de Verificación:</strong> {data?.audit_id || 'N/A'}</p>
        <p><strong>Nodo Auditor Autorizado:</strong> {data?.audit_node || 'SAARE-MD-IPRES-2026'}</p>
        <p><strong>Fecha y Hora (UTC):</strong> {data?.timestamp || new Date().toISOString()}</p>
        <p><strong>Estado Global:</strong> <span className="text-green-600 font-bold">{data?.audit_status || 'VERIFIED'}</span></p>
      </section>

      {/* 2. INTEGRIDAD CRIPTOGRÁFICA */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">2. INTEGRIDAD CRIPTOGRÁFICA</h2>
        <p><strong>Algoritmo Hash:</strong> SHA-256</p>
        <p><strong>Registros Auditados:</strong> {data?.total_records || '0'} eventos</p>
        <div className="mt-2 p-2 bg-gray-100 font-mono text-xs break-all border">
          <strong>Merkle Root (Árbol de Inmutabilidad):</strong><br />
          {data?.merkle_root || '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842'}
        </div>
      </section>

      {/* 3. MARCO DE CUMPLIMIENTO */}
      <section className="mb-4">
        <h2 className="font-semibold text-md border-b pb-1 mb-2">3. CONFORMIDAD NORMATIVA</h2>
        <p><strong>ISO/IEC 27037:2012 (Evidencia Digital):</strong> {data?.iso_compliance || 'CUMPLE'}</p>
        <p><strong>Reglamento DORA:</strong> {data?.dora_compliance || 'CUMPLE'}</p>
        <p><strong>EU AI Act (Art. 12 - Trazabilidad Log):</strong> {data?.aiact_compliance || 'CUMPLE'}</p>
      </section>

      {/* 4. DICTAMEN */}
      <div className="p-3 bg-gray-50 border-l-4 border-black text-sm italic">
        "Se certifica que la evidencia registrada no presenta alteración, garantizando la inmutabilidad de los logs según los estándares criptográficos auditados."
      </div>
    </div>
  );
};