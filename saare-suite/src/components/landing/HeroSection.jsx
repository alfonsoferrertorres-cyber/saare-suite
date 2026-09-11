import React from 'react';

export default function HeroSection({ onOpenSandbox, onViewArchitecture, onOpenEnterprise }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 20px 60px', background: '#030712', color: '#f8fafc', textAlign: 'center', borderBottom: '1px solid #1e293b' }}>
      
      {/* Elementos de diseño perimetral de fondo */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1000px', height: '400px', background: 'radial-gradient(circle, rgba(2,132,199,0.08) 0%, rgba(3,7,18,0) 70%]', pointerEvents: 'none', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Badges de Vanguardia */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.05em' }}>
            MODEL AGNOSTIC
          </span>
          <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.05em' }}>
            SOVEREIGN DEPLOYMENT
          </span>
          <span style={{ padding: '6px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #d97706', color: '#fbbf24', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.05em' }}>
            CRYPTOGRAPHIC EVIDENCE
          </span>
        </div>

        {/* Título Principal */}
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.03em' }}>
          La capa de autorización para la <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IA empresarial</span>
        </h1>

        {/* Subtítulo de Posicionamiento */}
        <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: '#94a3b8', lineHeight: '1.6', marginBottom: '32px', maxWidth: '760px', marginInline: 'auto' }}>
          SAARE intercepta decisiones de agentes, LLM y herramientas, aplica políticas en tiempo real y genera evidencia verificable antes de que una acción afecte a tus datos o sistemas.
        </p>

        {/* Frase Diferencial de Mercado */}
        <div style={{ background: '#0b0f19', border: '1px solid #1e293b', borderLeft: '4px solid #38bdf8', padding: '14px 20px', borderRadius: '6px', maxWidth: '640px', margin: '0 auto 36px', textAlign: 'left', fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'monospace' }}>
          <span style={{ color: '#94a3b8' }}># Security axiom:</span><br/>
          &quot;Security products inspect AI. SAARE decides whether AI is authorized to execute.&quot;
        </div>

        {/* CTAs Principales */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={onOpenSandbox}
            style={{ padding: '12px 24px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(2,132,199,0.4)', transition: 'transform 0.2s' }}>
            Probar Sandbox Técnico
          </button>
          <button 
            onClick={onViewArchitecture}
            style={{ padding: '12px 24px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}>
            Ver Arquitectura L7
          </button>
          <button 
            onClick={onOpenEnterprise}
            style={{ padding: '12px 24px', background: 'transparent', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}>
            Enterprise & Soberanía
          </button>
        </div>

      </div>
    </section>
  );
}
