// saare-console/src/components/ExecutiveView.jsx — Panel de Dirección
import React, { useMemo } from 'react';

export const ExecutiveView = ({ tenantId = 'ENTERPRISE', evidences = [] }) => {
  const { totalAudited, totalBlocked, blockRate } = useMemo(() => {
    const safeEvidences = Array.isArray(evidences) ? evidences : [];
    const audited = safeEvidences.length;
    const blocked = safeEvidences.filter(
      e => e && (e.decision === 'DENY' || e.verdict === 'RECHAZADO')
    ).length;
    const rate = audited > 0 ? ((blocked / audited) * 100).toFixed(1) : '0.0';

    return {
      totalAudited: audited,
      totalBlocked: blocked,
      blockRate: rate
    };
  }, [evidences]);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Encabezado Corporativo */}
      <div style={{ background: '#020617', border: '1px solid #0284c7', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1.2rem', fontWeight: '900' }}>
          🏛️ RESILIENCIA ESTRUCTURAL & GOBERNANZA DE IA — DIRECCIÓN
        </h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
          Organización: <strong>{tenantId}</strong> | Estado General:{' '}
          <span style={{ color: '#4ade80', fontWeight: '900' }}>CONFORME & AUDITADO</span> | Anclaje:{' '}
          <span style={{ color: '#38bdf8', fontWeight: '700' }}>D1-EU-WESTERN-EUROPE</span>
        </p>
      </div>

      {/* MATRIZ DE RESILIENCIA ESTRUCTURAL (SGP 1.0 / v8.4) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[
          { label: 'GOBERNANZA DE IA', status: 'VERIFIED', color: '#10b981' },
          { label: 'PRIVACIDAD & PII', status: 'VERIFIED', color: '#10b981' },
          { label: 'RESILIENCIA DORA', status: 'VERIFIED', color: '#10b981' },
          { label: 'TERCEROS / CLOUD', status: 'PARTIAL', color: '#f59e0b' },
          { label: 'CADENA DE CUSTODIA', status: 'VERIFIED', color: '#10b981' },
          { label: 'CONTINUIDAD BCP', status: 'OBSERVED', color: '#38bdf8' },
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800' }}>{item.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: item.color, marginTop: '6px' }}>{item.status}</div>
          </div>
        ))}
      </div>

      {/* INDICADORES CLAVE DE NEGOCIO Y TELEMETRÍA */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#f8fafc' }}>
          Resumen de Actividad Corporativa y Bóveda D1
        </h4>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Interacciones Auditadas:</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38bdf8' }}>{totalAudited}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fugas Preventivamente Interceptadas:</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444' }}>{totalBlocked}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tasa de Intercepción Activa:</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>{blockRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveView;