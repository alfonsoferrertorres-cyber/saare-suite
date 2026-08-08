import React from 'react';

export default function Sidebar() {
  return (
    <aside style={{ 
      width: '220px', 
      background: '#0d0e17', 
      borderRight: '1px solid #1a1d2d', 
      padding: '20px 15px', 
      color: '#fff',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontSize: '11px', color: '#4a5568', marginBottom: '15px', fontWeight: 'bold' }}>GOVERNANCE</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
        <div style={{ color: '#00f0ff', background: 'rgba(0, 240, 255, 0.1)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #00f0ff' }}>
          🌐 3D Cyberwarfare
        </div>
        <div style={{ color: '#718096', padding: '8px 12px', cursor: 'pointer' }}>🛡️ PerimeterShield</div>
        <div style={{ color: '#718096', padding: '8px 12px', cursor: 'pointer' }}>🔒 EvidenceVault</div>
        <div style={{ color: '#718096', padding: '8px 12px', cursor: 'pointer' }}>📋 Audit Trail</div>
      </nav>
    </aside>
  );
}