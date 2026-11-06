// saare-console/src/components/ExecutiveView.jsx — Panel de Dirección (SGP 1.0 / V12.1)
import React, { useMemo } from 'react';
import { api } from '../utils/api';

export const ExecutiveView = ({ tenantId, evidences = [], userRole }) => {
  const currentUser = api.getCurrentUser() || {};
  const activeTenant = tenantId || currentUser.tenantId || 'ORGANISMO_DEMO_01';
  const activeRole = userRole || currentUser.role || 'BOARD_EXECUTIVE_LEVEL_1';

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
      <div style={{ background: '#020617', border: '1px solid #0284c7', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.15)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.02em' }}>
          🏛️ RESILIENCIA ESTRUCTURAL & GOBERNANZA DE IA — DIRECCIÓN
        </h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
          Organización: <strong style={{ color: '#f8fafc' }}>{activeTenant}</strong> | Rol: <strong style={{ color: '#a78bfa' }}>{activeRole}</strong> | Estado General:{' '}
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
        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: '800' }}>
          Resumen de Actividad Corporativa y Bóveda D1
        </h4>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>Interacciones Auditadas:</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#38bdf8', marginTop: '4px' }}>{totalAudited}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>Fugas Preventivamente Interceptadas:</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444', marginTop: '4px' }}>{totalBlocked}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>Tasa de Intercepción Activa:</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{blockRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveView;