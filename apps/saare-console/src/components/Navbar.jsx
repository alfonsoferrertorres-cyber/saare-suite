// saare-console/src/components/Navbar.jsx
import React from 'react';

export default function Navbar({ 
  tenantId = "ENTERPRISE", 
  role = "CISO ADMIN (Nivel 4)", 
  nodeStatus = "ONLINE",
  onLogout 
}) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      padding: '12px 24px',
      background: '#0b0f19',
      borderBottom: '1px solid #1e293b',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Sección Izquierda: Branding y Estado de Capa L7 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img 
          src="/assets/logo-saare.svg" 
          alt="S.A.A.R.E. Logo" 
          style={{ height: '32px', width: 'auto' }}
          onError={(e) => {
            // Fallback visual por si el asset no está presente
            e.target.style.display = 'none';
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '900', color: '#ffffff', fontSize: '0.95rem', letterSpacing: '1px' }}>
            S.A.A.R.E. <span style={{ color: '#38bdf8' }}>{tenantId}</span>
          </span>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>
            INFRAESTRUCTURA PERIMETRAL L7 • ZERO TRUST
          </span>
        </div>

        {/* Badge de Estado del Nodo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          color: '#34d399',
          marginLeft: '12px'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span>PEP L7: {nodeStatus} (127.0.0.1:8080)</span>
        </div>
      </div>

      {/* Sección Derecha: Información del Rol / Sesión Activa */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#e2e8f0' }}>
            👑 {role}
          </div>
          <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '700' }}>
            MODO BLINDAJE ACTIVO (Δ = 0.00%)
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: '6px 12px',
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#f87171'}
            onMouseOut={(e) => e.target.style.color = '#94a3b8'}
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </nav>
  );
}