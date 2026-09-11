import React from 'react';

export default function CommercialCatalog({ onOpenEnterprise }) {
  const catalogItems = [
    {
      title: "SAARE L7 Sensor Node",
      badge: "Inspeción Ex-Ante",
      desc: "Extensión y proxy de intercepción para ChatGPT, Claude, Gemini y agentes autónomos. Bloqueo de PII y fugas antes de la llamada al LLM.",
      specs: ["Latencia < 30ms", "Fail-Closed nativo", "Manifest V3 Compliant"]
    },
    {
      title: "Bóveda KV & Verdict Core",
      badge: "Evidencia Criptográfica",
      desc: "Almacenamiento inmutable de trazas y decisiones con firma asimétrica Ed25519 y sellado de tiempo para cumplimiento normativo estricto.",
      specs: ["Hash SHA-256", "Cadena de Custodia ISO 27037", "Merkle Root Export"]
    },
    {
      title: "Sovereign Enterprise Suite",
      badge: "Grado Financiero",
      desc: "Despliegue aislado para corporaciones con soberanía de datos absoluta, integración con D1/KV corporativo y soporte DORA / EU AI Act.",
      specs: ["Air-gapped compatible", "IAM & MFA Enterprise", "SCA / 3D Secure Billing"]
    }
  ];

  return (
    <section style={{ padding: '60px 20px', background: '#030712', color: '#f8fafc', borderBottom: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px' }}>
            Catálogo de <span style={{ color: '#38bdf8' }}>Infraestructura Soberana</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '700px', margin: '0 auto' }}>
            Componentes modulares diseñados para gobernar, auditar y autorizar la ejecución de IA en entornos corporativos altamente regulados.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {catalogItems.map((item, idx) => (
            <div key={idx} style={{ background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)' }}>
              <div>
                <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800', marginBottom: '12px' }}>
                  {item.badge}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px', color: '#f8fafc' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '20px' }}>
                  {item.desc}
                </p>
              </div>

              <div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                  {item.specs.map((spec, sIdx) => (
                    <li key={sIdx} style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> {spec}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onOpenEnterprise}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Solicitar Arquitectura
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
