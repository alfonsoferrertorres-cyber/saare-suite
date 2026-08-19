import React from 'react';

export default function Navbar({ onOpenConsole, onOpenExtension }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(9, 13, 22, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#d97706', color: '#000', fontWeight: '900', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>S</div>
          <div>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              S.A.A.R.E. <span style={{ fontSize: '9px', background: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #334155' }}>ISV ENTERPRISE</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>AI GOVERNANCE & L7 SECURITY GATEWAY</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '18px', alignItems: 'center', fontSize: '12.5px', fontWeight: '600' }}>
          <a href="#acerca" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Acerca de</a>
          <a href="#sandbox" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Sandbox L7</a>
          <a href="#servicios" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Servicios</a>
          <a href="#escenas" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Escenas</a>
          <a href="#financiacion" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Financiación</a>
          <a href="#despliegue" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Despliegue</a>
        </nav>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' }}>OFERTA -50%</span>
          <button onClick={onOpenConsole} style={{ background: '#059669', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            LOGIN CONSOLE ↗
          </button>
          <button onClick={() => window.open('/saare_extension.zip', '_blank')} style={{ background: '#0284c7', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ⚡ EXTENSIÓN L7
          </button>
        </div>
      </div>
    </header>
  );
}
