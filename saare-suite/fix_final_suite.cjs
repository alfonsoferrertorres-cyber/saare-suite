const fs = require('fs');
const path = require('path');

const suiteContent = `import React, { useState } from 'react';

export default function App() {
  const [billingCycle, setBillingCycle] = useState('ANNUAL');
  const [usersCount, setUsersCount] = useState(25);
  const [trialClaimed, setTrialClaimed] = useState(false);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [companyVat, setCompanyVat] = useState('B12345678');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const discountMultiplier = billingCycle === 'ANNUAL' ? 0.7 : 1.0;

  // PRECIOS AGRESIVOS PARA ROMPER EL MERCADO (AUDITORÍA ILIMITADA LOCAL)
  const scenarios = [
    {
      id: 'ES_CUMPLIMIENTO_ESPANA',
      title: 'España - LOPDGDD & AEPD',
      badge: 'NORMATIVA OBLIGATORIA',
      pricePerUser: 6,
      cryptoSignature: 'AES256-AEPD-ES-2026',
      desc: 'Anonimización L7 ilimitada de DNI, NIE, IBAN, nóminas y exp. judiciales. Bloqueo automático eIDAS.'
    },
    {
      id: 'TOP_PROMPT_INJECTION',
      title: 'Jailbreak & Prompt Injection Guard',
      badge: 'SEGURIDAD L7',
      pricePerUser: 8,
      cryptoSignature: 'SHA256-JAILBREAK-GUARD-2026',
      desc: 'Detección proactiva ilimitada de inyecciones de código, bypass de reglas (DAN mode) y manipulación de rol.'
    },
    {
      id: 'STAR_FACT_CHECKER',
      title: 'Fact-Checking Forense & Fake Disprover',
      badge: 'ANALÍTICO & FORENSE',
      pricePerUser: 9,
      cryptoSignature: 'ED25519-8F93A2-M3V-2026',
      desc: 'Análisis ilimitado de archivos adjuntos (PDFs), artefactos en capturas y desensamblaje de deepfakes.'
    },
    {
      id: 'STAR_TOKEN_OPTIMIZER',
      title: 'Optimizador de Tokens & CostGuard',
      badge: 'FINOPS & AHORRO GUARANTEED',
      pricePerUser: 4,
      cryptoSignature: 'RSA4096-COST-GUARD-2026',
      desc: 'Reducción directa de coste en cuotas LLM. Auditoría ilimitada y optimización automática de payloads.'
    }
  ];

  const baseMonthlyPrice = scenarios.reduce((acc, curr) => acc + curr.pricePerUser, 0) * usersCount * discountMultiplier;
  const estimatedTokenSavings = Math.round(usersCount * 28.5);
  const estimatedRiskAvoided = usersCount * 1200;

  const handleOpenCheckout = (scenario) => {
    setSelectedScenario(scenario);
    setCheckoutSuccess(false);
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setIsCheckoutOpen(false);
      setCheckoutSuccess(false);
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: '#e2e8f0', minHeight: '100vh', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* HEADER IDÉNTICO A SAARE CONSOLE */}
      <div style={{ width: '100%', height: '220px', backgroundImage: 'url(/saare-brand-header.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '2px solid #cbd5e1' }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px' }}>

        {/* BARRA SUPERIOR DE ESTADO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>S.A.A.R.E. SUITE MARKETPLACE</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              ORGANIZACIÓN: <strong>ACME Corporation</strong> | MODELO: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Tarifa Plana Ilimitada L7</span> | ESTADO TOKEN: <span style={{ color: '#0284c7', fontWeight: 'bold' }}>Enterprise Active</span>
            </p>
          </div>
          <button style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
            Portal de Suscripciones B2B
          </button>
        </div>

        {/* HERO GANCHO DISRUPTIVO (300 € / ILIMITADO) */}
        <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '12px', padding: '28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(2,132,199,0.08)' }}>
          <div>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              🚀 PROGRAMA ENTERPRISE DISRUPTIVO
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '10px 0 6px 0', color: '#0f172a' }}>
              Protección L7 Ilimitada y 300 € en Créditos de Auditoría (0 €)
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', maxWidth: '700px' }}>
              Sin límites mensuales de uso ni cobro por token. Intercepción local en RAM con coste marginal cero. Evalúa en tiempo real con <strong>14 días de prueba ilimitada</strong> sin compromiso.
            </p>
          </div>
          <div>
            {trialClaimed ? (
              <div style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#15803d', padding: '14px 20px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '13px' }}>
                ✓ TOKEN EVALUACIÓN ACTIVADO<br/>
                <span style={{ fontSize: '10px', color: '#166534', fontFamily: 'monospace' }}>SAARE-TRIAL-UNLIMITED-2026</span>
              </div>
            ) : (
              <button onClick={() => setTrialClaimed(true)} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                Obtener Licencia de Prueba (0 €)
              </button>
            )}
          </div>
        </div>

        {/* CALCULADORA DE PRECIOS AGRESIVOS & FINOPS */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>📊 Calculadora FinOps & Previsión de Tarifa Plana B2B</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 'bold' }}>
                Usuarios / Empleados a Proteger: <span style={{ color: '#0284c7', fontSize: '15px' }}>{usersCount} licencias</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="500" 
                step="5" 
                value={usersCount} 
                onChange={e => setUsersCount(Number(e.target.value))} 
                style={{ width: '100%', cursor: 'pointer', accentColor: '#0284c7' }}
              />

              <div style={{ marginTop: '16px', display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <button 
                  onClick={() => setBillingCycle('MONTHLY')} 
                  style={{ flex: 1, background: billingCycle === 'MONTHLY' ? '#0284c7' : 'transparent', color: billingCycle === 'MONTHLY' ? '#fff' : '#475569', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                  Pago Mensual
                </button>
                <button 
                  onClick={() => setBillingCycle('ANNUAL')} 
                  style={{ flex: 1, background: billingCycle === 'ANNUAL' ? '#16a34a' : 'transparent', color: billingCycle === 'ANNUAL' ? '#fff' : '#475569', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                  Plan Anual (-30% Dto.)
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>TARIFA PLANA ILIMITADA</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{Math.round(baseMonthlyPrice)} € <span style={{ fontSize: '11px', color: '#64748b' }}>/mes</span></span>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #16a34a', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#15803d', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>AHORRO ESTIMADO LLM</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a' }}>~{estimatedTokenSavings} € <span style={{ fontSize: '11px', color: '#15803d' }}>/mes</span></span>
              </div>
              <div style={{ background: '#f0f9ff', border: '1px solid #0284c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#0369a1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>MULTA AEPD EVITADA</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7' }}>~{estimatedRiskAvoided.toLocaleString()} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* CATÁLOGO DE ESCENARIOS EN FONDO BLANCO INSTITUCIONAL */}
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
          Escenarios de Protección Disponible (Paquetes B2B)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {scenarios.map(sc => {
            const calculatedPrice = (sc.pricePerUser * discountMultiplier).toFixed(2);

            return (
              <div key={sc.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{sc.badge}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7' }}>{calculatedPrice} € <span style={{ fontSize: '11px', color: '#64748b' }}>/usuario/mes</span></span>
                      <span style={{ display: 'block', fontSize: '10px', color: '#16a34a', fontWeight: 'bold' }}>Prompts Auditados: Ilimitados</span>
                    </div>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a' }}>{sc.title}</h4>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{sc.desc}</p>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}>SIG: {sc.cryptoSignature}</span>
                  <button onClick={() => handleOpenCheckout(sc)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    Suscribir Escenario
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL CHECKOUT ENTERPRISE B2B */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            {checkoutSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🎉</span>
                <h3 style={{ fontSize: '22px', color: '#16a34a', margin: '0 0 8px 0' }}>¡Suscripción Activada con Éxito!</h3>
                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '16px' }}>
                  El Token del Escenario <strong>{selectedScenario?.title}</strong> ha sido vinculado al Control Plane de ACME Corp.
                </p>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px dashed #16a34a', fontSize: '11px', fontFamily: 'monospace', color: '#15803d' }}>
                  TOKEN_HASH: SAARE-ENT-{Date.now()}-UNLIMITED
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>💳 Pasarela B2B: {selectedScenario?.title}</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'transparent', color: '#64748b', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                    <span>Licencias Incluidas:</span>
                    <strong>{usersCount} usuarios ({billingCycle === 'ANNUAL' ? 'Plan Anual Dto. -30%' : 'Mensual'})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                    <span>Prompts e Inspección L7:</span>
                    <strong style={{ color: '#16a34a' }}>AUDITORÍA ILIMITADA (0 € extra)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: '#0284c7', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span>TOTAL FACTURABLE:</span>
                    <span>{(selectedScenario?.pricePerUser * usersCount * discountMultiplier).toFixed(2)} € / mes</span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>MÉTODO DE PAGO EMPRESARIAL:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <button onClick={() => setPaymentMethod('CARD')} style={{ background: paymentMethod === 'CARD' ? '#0284c7' : '#f1f5f9', border: paymentMethod === 'CARD' ? '2px solid #0284c7' : '1px solid #cbd5e1', color: paymentMethod === 'CARD' ? '#fff' : '#475569', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                      💳 Tarjeta
                    </button>
                    <button onClick={() => setPaymentMethod('SEPA')} style={{ background: paymentMethod === 'SEPA' ? '#0284c7' : '#f1f5f9', border: paymentMethod === 'SEPA' ? '2px solid #0284c7' : '1px solid #cbd5e1', color: paymentMethod === 'SEPA' ? '#fff' : '#475569', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                      🏛️ SEPA Direct
                    </button>
                    <button onClick={() => setPaymentMethod('INVOICE')} style={{ background: paymentMethod === 'INVOICE' ? '#0284c7' : '#f1f5f9', border: paymentMethod === 'INVOICE' ? '2px solid #0284c7' : '1px solid #cbd5e1', color: paymentMethod === 'INVOICE' ? '#fff' : '#475569', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                      📄 Factura (PO)
                    </button>
                  </div>
                </div>

                {paymentMethod === 'CARD' && (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
                    <input type="text" placeholder="Número de Tarjeta (4242 •••• •••• 4242)" style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="MM/YY" style={{ width: '50%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                      <input type="text" placeholder="CVC" style={{ width: '50%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                {paymentMethod === 'SEPA' && (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>IBAN DE ADEUDO DIRECTO SEPA:</label>
                    <input type="text" placeholder="ES91 2100 0418 4502 0005 1387" style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                )}

                {paymentMethod === 'INVOICE' && (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>CIF / NIF EMPRESA:</label>
                    <input type="text" value={companyVat} onChange={e => setCompanyVat(e.target.value)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                )}

                <button onClick={handleProcessPayment} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '14px', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                  PAGAR Y ACTIVAR LICENCIA ENTERPRISE
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), suiteContent, 'utf8');
console.log('=== SAARE SUITE FINALIZADA CON ESTÉICA CONSISTENTE Y PASARELA DE PAGO ===');
