import React from 'react';

export default function Header() {
  return (
    <header style={{ 
      height: '60px', 
      background: '#0d0e17', 
      borderBottom: '1px solid #1a1d2d', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 24px', 
      color: '#fff',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>SAARE SUITE</span>
        <span style={{ color: '#4a5568' }}>|</span>
        <span style={{ fontSize: '12px', color: '#a0aec0' }}>ISV EVALUATION PACK</span>
      </div>
      <div style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', border: '1px solid #00f0ff' }}>
        STATUS: RUNTIME ACTIVE (:3001)
      </div>
    </header>
  );
}

