// saare-console/src/components/ExecutiveView.jsx
import React, { useMemo } from 'react';
import { api } from '../utils/api';

export const ExecutiveView = ({ tenantId, evidences = [], userRole, regionAnchor = '' }) => {
  const currentUser = api?.getCurrentUser?.() || {};
  const activeTenant = tenantId || currentUser.tenantId || 'No definido';
  const activeRole = userRole || currentUser.role || 'BOARD_EXECUTIVE_LEVEL_1';

  const { totalAudited, totalBlocked, blockRate } = useMemo(() => {
    const safeEvidences = Array.isArray(evidences) ? evidences : [];
    const audited = safeEvidences.length;
    const blocked = safeEvidences.filter(
      (e) => e && (e.decision === 'DENY' || e.verdict === 'RECHAZADO' || e.final_decision === 'DENY')
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
      <div style={{ background: '#020617', border: '1px solid #0284c7', padding: '24px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.02em' }}>
          RESILIENCIA ESTRUCTURAL &amp; GOBERNANZA DE IA — DIRECCIÓN
        </h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
          Organización: <strong style={{ color: '#f8fafc' }}>{activeTenant}</strong> | Rol:{' '}
          <strong style={{ color: '#a78bfa' }}>{activeRole}</strong>
          {regionAnchor ? (
            <>
              {' '}
              | Región: <span style={{ color: '#38bdf8', fontWeight: '700' }}>{regionAnchor}</span>
            </>
          ) : null}
        </p>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '20px', borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: '800' }}>
          Resumen de Actividad del Tenant
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