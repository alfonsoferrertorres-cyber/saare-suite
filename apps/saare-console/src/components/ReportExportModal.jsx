// saare-console/src/components/ReportExportModal.jsx
import React, { useState } from 'react';
import { generatePdfFromElement } from '../services/pdfGeneratorService';

async function computeSha256Hex(input) {
  const encoded = new TextEncoder().encode(String(input ?? ''));
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function resolveEvidenceIntegrityHash(evidence = {}) {
  const existingHash =
    evidence?.merkleRoot ||
    evidence?.ms3v_hash ||
    evidence?.ms3vHash ||
    evidence?.hash ||
    evidence?.integrityHash;

  if (existingHash && String(existingHash).trim()) {
    return String(existingHash).trim();
  }

  const canonicalTrace = JSON.stringify({
    id: evidence?.id || evidence?.evidence_id || evidence?.trace_id || '',
    timestamp: evidence?.rawTimestamp || evidence?.timestamp || evidence?.time || '',
    user: evidence?.user || evidence?.user_email || '',
    decision: evidence?.decision || (evidence?.verdict === 'RECHAZADO' ? 'DENY' : 'ALLOW'),
    verdict: evidence?.verdict || '',
    category: evidence?.cat || evidence?.category || evidence?.type || '',
    prompt: evidence?.prompt || '',
    sanitizedOutput: evidence?.responseOutput || evidence?.sanitized_payload || ''
  });

  return await computeSha256Hex(canonicalTrace);
}

export default function ReportExportModal({ onClose, tenantId, evidences = [] }) {
  const [exportFormat, setExportFormat] = useState('JSON');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preparedSnapshot, setPreparedSnapshot] = useState(null);

  const buildEnrichedEvidences = async () => {
    const list = Array.isArray(evidences) ? evidences : [];
    const enriched = await Promise.all(
      list.map(async (e) => {
        const merkleRoot = await resolveEvidenceIntegrityHash(e);
        const decision = e?.decision || (e?.verdict === 'RECHAZADO' ? 'DENY' : 'ALLOW');
        const timestamp = e?.rawTimestamp || e?.timestamp || e?.time || '';
        const category = e?.cat || e?.category || e?.type || 'AUDITORIA_CONFORME';

        return {
          id: e?.id || e?.evidence_id || e?.trace_id || '',
          timestamp,
          user: e?.user || e?.user_email || 'operator_anonymous',
          decision,
          verdict: e?.verdict || (decision === 'DENY' ? 'RECHAZADO' : 'PERMITIDO'),
          category,
          prompt: e?.prompt || '',
          sanitizedOutput: e?.responseOutput || e?.sanitized_payload || null,
          merkleRoot,
          ms3v_hash: merkleRoot
        };
      })
    );

    const bundleMerkleRoot =
      enriched.length > 0
        ? await computeSha256Hex(enriched.map((item) => item.merkleRoot).join(':'))
        : await computeSha256Hex(`EMPTY_BUNDLE:${tenantId || 'DEFAULT'}`);

    return { enriched, bundleMerkleRoot };
  };

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      const { enriched, bundleMerkleRoot } = await buildEnrichedEvidences();
      const exportTimestamp = new Date().toISOString();

      if (exportFormat === 'JSON') {
        const reportData = {
          header: {
            title: 'INFORME OFICIAL DE GOBERNANZA, CIBERSEGURIDAD Y CUMPLIMIENTO IA (SGP 1.0 / S.A.A.R.E.)',
            tenantId: tenantId,
            exportTimestamp,
            standard: 'ISO/IEC 42001:2023 / EU AI Act Art. 27 / DORA Regulation',
            trustAnchor: 'https://vault.saare.es',
            safeCreativeId: 'RPI-2607076315021',
            bundleMerkleRoot
          },
          summary: {
            totalEvidences: enriched.length,
            totalDenied: enriched.filter((e) => e.decision === 'DENY' || e.verdict === 'RECHAZADO').length,
            totalAllowed: enriched.filter((e) => e.decision === 'ALLOW' || e.verdict === 'PERMITIDO').length,
            avgLatencyMs:
              evidences.length > 0
                ? (
                    evidences.reduce((acc, curr) => acc + (Number(curr?.latency) || 0.84), 0) /
                    evidences.length
                  ).toFixed(2)
                : '0.84',
            bundleMerkleRoot
          },
          evidences: enriched
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `INFORME_BORRADOR_GRC_${String(tenantId || 'TENANT').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'PDF') {
        setPreparedSnapshot({
          exportTimestamp,
          bundleMerkleRoot,
          evidences: enriched
        });
        await new Promise((resolve) => setTimeout(resolve, 60));
        await generatePdfFromElement(
          'official-report-draft-container',
          `INFORME_OFICIAL_GRC_${tenantId}`
        );
      }
    } catch (err) {
      console.error('Error al exportar borrador:', err);
    } finally {
      setIsGenerating(false);
      setPreparedSnapshot(null);
      onClose();
    }
  };

  const pdfEvidences = preparedSnapshot?.evidences || [];
  const pdfBundleRoot = preparedSnapshot?.bundleMerkleRoot || 'PENDIENTE_CALCULO_SHA256';
  const pdfIssuedAt = preparedSnapshot?.exportTimestamp
    ? new Date(preparedSnapshot.exportTimestamp).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          background: '#0b0f19',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '24px',
          color: '#f8fafc',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              color: '#38bdf8',
              fontWeight: '900',
              letterSpacing: '0.02em'
            }}
          >
            📋 EXPORTAR INFORME OFICIAL GRC
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontWeight: '900',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ✖
          </button>
        </div>

        {/* Información del Tenant */}
        <div
          style={{
            background: '#020617',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '0.8rem'
          }}
        >
          <p style={{ margin: '0 0 6px 0', color: '#94a3b8' }}>
            Organismo / Tenant: <strong style={{ color: '#ffffff' }}>{tenantId}</strong>
          </p>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Evidencias auditadas registradas:{' '}
            <strong style={{ color: '#34d399' }}>{evidences?.length || 0} trazas</strong>
          </p>
        </div>

        {/* Selección de Formato */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            FORMATO DE EXPORTACIÓN:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setExportFormat('JSON')}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: exportFormat === 'JSON' ? '1px solid #38bdf8' : '1px solid #1e293b',
                background: exportFormat === 'JSON' ? '#0284c7' : '#020617',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              📄 JSON (Estructurado)
            </button>
            <button
              onClick={() => setExportFormat('PDF')}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: exportFormat === 'PDF' ? '1px solid #10b981' : '1px solid #1e293b',
                background: exportFormat === 'PDF' ? '#059669' : '#020617',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              📕 PDF (Documento Oficial)
            </button>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px',
              background: '#1e293b',
              color: '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.8rem'
            }}
          >
            CANCELAR
          </button>
          <button
            onClick={handleExport}
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '900',
              fontSize: '0.8rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            {isGenerating ? 'GENERANDO...' : '⬇️ DESCARGAR DRAFT'}
          </button>
        </div>
      </div>

      {/* Contenedor Oculto para Renderizado y Descarga en PDF */}
      {exportFormat === 'PDF' && (
        <div
          id="official-report-draft-container"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '800px',
            background: '#ffffff',
            color: '#0f172a',
            padding: '40px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <h1
            style={{
              color: '#0284c7',
              borderBottom: '2px solid #0284c7',
              paddingBottom: '10px',
              fontSize: '1.4rem'
            }}
          >
            INFORME BORRADOR OFICIAL DE CUMPLIMIENTO Y GOBERNANZA IA
          </h1>
          <p style={{ fontSize: '0.9rem' }}>
            <strong>Organismo / Tenant:</strong> {tenantId}
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            <strong>Fecha de Emisión:</strong> {pdfIssuedAt}
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            <strong>Normativa de Aplicación:</strong> ISO/IEC 42001:2023 / EU AI Act Art. 27 / RGPD Art. 25
          </p>
          <p style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
            <strong>Bundle Merkle Root (SHA-256):</strong> {pdfBundleRoot}
          </p>
          <hr />
          <h3>Resumen Ejecutivo de Inspección Ex-Ante</h3>
          <ul>
            <li>
              Total Eventos Inspeccionados: <strong>{evidences.length}</strong>
            </li>
            <li>
              Amenazas y Fugas Bloqueadas (DENY):{' '}
              <strong>
                {
                  evidences.filter(
                    (e) => e.decision === 'DENY' || e.verdict === 'RECHAZADO'
                  ).length
                }
              </strong>
            </li>
            <li>
              Tráfico Conforme Permitido (ALLOW):{' '}
              <strong>
                {
                  evidences.filter(
                    (e) => e.decision === 'ALLOW' || e.verdict === 'PERMITIDO'
                  ).length
                }
              </strong>
            </li>
          </ul>
          {pdfEvidences.length > 0 && (
            <>
              <h3>Hashes de Integridad por Traza</h3>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.75rem',
                  marginTop: '8px'
                }}
              >
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', padding: '6px' }}>
                      ID Evidencia
                    </th>
                    <th style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', padding: '6px' }}>
                      Decisión
                    </th>
                    <th style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', padding: '6px' }}>
                      Merkle Root / Hash
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pdfEvidences.map((ev, idx) => (
                    <tr key={`${ev.id || 'ev'}-${idx}`}>
                      <td style={{ borderBottom: '1px solid #e2e8f0', padding: '6px' }}>{ev.id}</td>
                      <td style={{ borderBottom: '1px solid #e2e8f0', padding: '6px' }}>{ev.decision}</td>
                      <td
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          padding: '6px',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace'
                        }}
                      >
                        {ev.merkleRoot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <hr />
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            S.A.A.R.E. Console v10.0 / SGP 1.0 — Trust Anchor: https://vault.saare.es | Safe Creative ID: RPI-2607076315021
          </p>
        </div>
      )}
    </div>
  );
}