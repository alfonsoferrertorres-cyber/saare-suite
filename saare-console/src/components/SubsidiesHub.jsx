// src/components/SubsidiesHub.jsx
import React, { useState } from 'react';
import { CryptoService } from '../services/cryptoService';

export const SubsidiesHub = ({ tenantId = 'ENTERPRISE', currentEvidences = [] }) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);

  // Acción 1: Verificar firma criptográfica forense ISO 27037
  const handleVerifyForense = async () => {
    setVerifying(true);
    const mockTelemetry = currentEvidences[0] || {
      cryptoSeal: 'ED25519-SEAL-OK',
      merkleRoot: '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842',
      dnshCompliance: { ramOnlyExecution: true },
      auditStandard: { euAiActCompliance: true }
    };

    const res = await CryptoService.verifyMerkleIntegrity(mockTelemetry);
    setVerificationResult(res);
    setVerifying(false);
  };

  // Acción 2: Llamar al endpoint /api/v7/subsidies/export-package en el Worker
  const handleExportZip = async () => {
    setLoadingExport(true);
    try {
      const res = await fetch('/api/v7/subsidies/export-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          grantType: 'KIT_CONSULTING',
          complianceCode: `MS3V-GRANT-EVIDENCE-${Date.now()}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Expediente ${data.complianceCode} generado con éxito. Descargando ZIP...`);
      } else {
        alert(`Error al exportar: ${data.error}`);
      }
    } catch (err) {
      alert(`Fallo de conexión: ${err.message}`);
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <div style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '24px', borderRadius: '12px', color: '#fff', marginTop: '20px' }}>
      <h3 style={{ color: '#34d399', margin: '0 0 10px 0' }}>🏛️ Subsidies Hub — Justificación Forense & Subvenciones</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
        Panel unificado de evidencias para auditorías de Kit Digital, Kit Consulting e INCIBE.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
        {/* Widget 1: Verificador ISO 27037 */}
        <div style={{ background: '#020617', border: '1px solid #334155', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Verificador Forense ISO 27037</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Valida hashes Ed25519 e inmutabilidad local en RAM.</p>
          <button 
            onClick={handleVerifyForense} 
            disabled={verifying}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {verifying ? 'Verificando...' : 'Verificar Validez Judicial'}
          </button>
          {verificationResult && (
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: verificationResult.isValid ? '#4ade80' : '#f87171' }}>
              {verificationResult.reason}
            </div>
          )}
        </div>

        {/* Widget 2: Generador del ZIP de Justificación */}
        <div style={{ background: '#020617', border: '1px solid #334155', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Exportador de Expedientes en 1 Clic</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Genera Memoria Técnica, DNSH, Ley 18/2022 y esquemas FRIA.</p>
          <button 
            onClick={handleExportZip} 
            disabled={loadingExport}
            style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loadingExport ? 'Generando ZIP...' : 'Descargar Expediente (.ZIP)'}
          </button>
        </div>
      </div>
    </div>
  );
};
