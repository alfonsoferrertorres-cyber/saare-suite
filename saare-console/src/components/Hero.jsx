import React from 'react';

export default function Hero({ onOpenTrial }) {
  return (
    <section style={{ 
      position: 'relative', 
      minHeight: '480px', 
      padding: '70px 20px', 
      backgroundImage: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.15) 0%, rgba(9, 13, 22, 0.95) 75%), url("/neural_bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', marginBottom: '20px' }}>
          🛡️ SOBERANÍA DIGITAL E INFERENCIA CONFIABLE (ISO 42001 & DORA)
        </div>
        <h1 style={{ color: '#f8fafc', fontSize: '42px', fontWeight: '900', lineHeight: 1.15, margin: '0 0 16px 0', letterSpacing: '-1px' }}>
          Gobernanza Técnica e Inmutabilidad Forense L7
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, margin: '0 auto 28px auto', maxWidth: '760px' }}>
          Middleware perimetral para el blindaje determinista de modelos de lenguaje en memoria RAM volátil. Erradicación absoluta de fugas PII, inmunidad contra Prompt Injections y trazabilidad probatoria RFC 3161 con 0.00% de error lógico.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={onOpenTrial} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 25px rgba(239, 68, 68, 0.35)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ PROBAR SANDBOX L7 (7 DÍAS GRATIS)
          </button>
          <a href="#acerca" style={{ background: '#1e293b', border: '1px solid #475569', color: '#f1f5f9', padding: '14px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            🏛️ Ver Dictamen y Registros Safe Creative
          </a>
        </div>
      </div>
    </section>
  );
}
