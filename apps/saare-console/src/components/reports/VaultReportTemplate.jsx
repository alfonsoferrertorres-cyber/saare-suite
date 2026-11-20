import React from 'react';
import { useTenant } from '../context/TenantContext';

export const VaultReportTemplate = ({ data, id }) => {
  const { session, activeTenant } = useTenant() || {};

  const tenantDomain = data?.tenant_id || data?.tenantId || activeTenant || session?.tenantId || 'N/A';
  const userEmail = data?.operator_email || session?.email || 'N/A';

  return (
    <div id={id} className="p-6 bg-white text-black font-sans border rounded shadow-lg max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4 border-b-2 border-black pb-2">
        CERTIFICADO DE EVIDENCIA CRIPTOGRÁFICA DE BÓVEDA D1
      </h1>

      <section className="mb-4 text-xs font-mono">
        <h2 className="font-semibold text-sm border-b pb-1 mb-2">1. CABECERA DE CUSTODIA Y AUDITORÍA</h2>
        <p><strong>ID de Verificación:</strong> {data?.audit_id || 'N/A'}</p>
        <p><strong>Organización / Tenant:</strong> {tenantDomain}</p>
        <p><strong>Operador Custodio:</strong> {userEmail}</p>
        <p><strong>Nodo Auditor Autorizado:</strong> {data?.audit_node || 'N/A'}</p>
        <p><strong>Fecha y Hora (UTC):</strong> {data?.timestamp || new Date().toISOString()}</p>
        <p><strong>Estado Global:</strong> <span className="font-bold">{data?.audit_status || 'PENDIENTE'}</span></p>
      </section>

      <section className="mb-4 text-xs font-mono">
        <h2 className="font-semibold text-sm border-b pb-1 mb-2">2. INTEGRIDAD CRIPTOGRÁFICA</h2>
        <p><strong>Algoritmo de Firma:</strong> {data?.signature_algorithm || 'Ed25519 / SHA-256'}</p>
        <p><strong>Registros Auditados:</strong> {data?.total_records ?? '0'}</p>
        <div className="mt-2 p-2 bg-gray-100 font-mono text-[11px] break-all border rounded">
          <strong>Merkle Root:</strong><br />
          {data?.merkle_root || 'N/A'}
        </div>
      </section>

      <section className="mb-4 text-xs font-mono">
        <h2 className="font-semibold text-sm border-b pb-1 mb-2">3. CONFORMIDAD NORMATIVA</h2>
        <p><strong>ISO/IEC 27037:2012:</strong> {data?.iso_compliance || 'N/A'}</p>
        <p><strong>Reglamento DORA:</strong> {data?.dora_compliance || 'N/A'}</p>
        <p><strong>EU AI Act:</strong> {data?.aiact_compliance || 'N/A'}</p>
      </section>

      {data?.statement && (
        <div className="p-3 bg-gray-50 border-l-4 border-black text-xs italic font-mono">
          "{data.statement}"
        </div>
      )}
    </div>
  );
};

export default VaultReportTemplate;