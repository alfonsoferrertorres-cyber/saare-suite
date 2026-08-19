import React, { useState } from 'react';

export default function ServicesAndGrants() {
  const [seats, setSeats] = useState(25);
  const [isAnnual, setIsAnnual] = useState(true);
  const pricePerSeat = isAnnual ? 4.50 : 9.00;
  const totalFactura = (seats * pricePerSeat * (isAnnual ? 12 : 1)).toFixed(2);

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 20px' }}>
      
      {/* 3 MÓDULOS DE ARQUITECTURA */}
      <section id="servicios" style={{ margin: '50px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>ARQUITECTURA MODULAR SAARE L7</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Tres capas estancas de blindaje para el cumplimiento estricto del EU AI Act 2024/1689</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>MOD-01 / MEMORY SEC</span>
              <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>VOLATILE-ONLY</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 10px 0' }}>Privacidad en Origen</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Tratamiento síncrono en memoria RAM mediante HugePages de 2MB. Purga forzada con <code style={{ color: '#38bdf8' }}>SYS_madvise</code> para residuo cero en disco.
            </p>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 'bold' }}>MOD-02 / CRYPTO VAULT</span>
              <span style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>DUAL-VAULT</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 10px 0' }}>Inmutabilidad Forense</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Sellado matemático de cada transacción mediante hashes SHA-256 y firmas asimétricas Ed25519 con plena validez judicial ante tribunales de la UE.
            </p>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 'bold' }}>MOD-03 / GRC COMPLIANCE</span>
              <span style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>LEGAL READY</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 10px 0' }}>Certificación Continua</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Compilación automatizada de la Declaración de Aplicabilidad (SoA) para normas UNE-EN ISO/IEC 42001, ISO 27001 y normativas DORA en menos de 120s.
            </p>
          </div>
        </div>
      </section>

      {/* FINANCIACIÓN PÚBLICA */}
      <section id="financiacion" style={{ margin: '50px 0', background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>FONDOS EUROPEOS NEXTGENERATIONEU</span>
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '6px 0' }}>Financie hasta el 100% de la implantación con Bonos Públicos</h2>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Genere de inmediato el expediente técnico para tramitar la subvención oficial</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>RED.ES • NEXTGEN</div>
            <h4 style={{ color: '#38bdf8', fontSize: '16px', margin: '4px 0 10px 0' }}>Kit Consulting (IA)</h4>
            <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: '0 0 12px 0' }}>Bonos digitales de 12.000€ a 24.000€ para empresas de 10 a 249 empleados en Asesoramiento de IA.</p>
            <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>Cobertura: 100% Subvencionado</span>
          </div>

          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>MINISTERIO TRANSF. DIGITAL</div>
            <h4 style={{ color: '#38bdf8', fontSize: '16px', margin: '4px 0 10px 0' }}>Kit Espacios de Datos</h4>
            <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: '0 0 12px 0' }}>Ayudas directas de 15.000€ a 50.000€ para anonimización e infraestructuras seguras.</p>
            <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>Subvención a Fondo Perdido</span>
          </div>

          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>AGENCIA TRIBUTARIA (LIS)</div>
            <h4 style={{ color: '#38bdf8', fontSize: '16px', margin: '4px 0 10px 0' }}>Deducción Fiscal I+D+i</h4>
            <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: '0 0 12px 0' }}>Deducción directa de hasta el 12% en cuota del Impuesto de Sociedades mediante memoria técnica.</p>
            <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '12px' }}>Incentivo Fiscal Inmediato</span>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE ASIENTOS */}
      <section id="calculadora" style={{ margin: '50px 0', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>GOBERNANZA COMPLETA • TODOS LOS ESCENARIOS</span>
          <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: '800', margin: '6px 0' }}>Calculadora y Despliegue de Asientos</h2>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0 }}>Ajuste el número de empleados y active el plan corporativo</p>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Asientos a Contratar: <span style={{ color: '#38bdf8', fontSize: '20px' }}>{seats} empleados</span>
            </label>
            <input type="range" min="5" max="250" step="5" value={seats} onChange={(e) => setSeats(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
          </div>

          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '10px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>PRECIO EMPLEADO</div>
              <div style={{ color: '#10b981', fontSize: '22px', fontWeight: 'bold' }}>{pricePerSeat.toFixed(2)} €/mes</div>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>Ahorro del 50% anual</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: '#1e293b' }}></div>
            <div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>TOTAL FACTURA</div>
              <div style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>{totalFactura} €</div>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>{isAnnual ? 'Facturación Anual' : 'Facturación Mensual'}</div>
            </div>
          </div>

          <button onClick={() => window.open('https://buy.stripe.com/test_00gbJb6tD0vG0mYfYY', '_blank')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>
            EXPEDIR {seats} TOKENS CON DESCUENTO (-50%) ↗
          </button>
        </div>
      </section>

    </div>
  );
}
