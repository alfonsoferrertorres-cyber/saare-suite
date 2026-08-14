const fs = require('fs');
const path = require('path');

const suiteContent = `import React, { useState } from 'react';

export default function App() {
  const [billingCycle, setBillingCycle] = useState('ANNUAL'); // 'MONTHLY' | 'ANNUAL'
  const [usersCount, setUsersCount] = useState(25);
  const [activeTab, setActiveTab] = useState('MARKETPLACE');
  const [trialClaimed, setTrialClaimed] = useState(false);

  const discountMultiplier = billingCycle === 'ANNUAL' ? 0.7 : 1.0;

  const scenarios = [
    {
      id: 'ES_CUMPLIMIENTO_ESPANA',
      title: 'España - LOPDGDD & AEPD',
      badge: 'NORMATIVA OBLIGATORIA',
      pricePerUser: 12,
      cryptoSignature: 'AES256-AEPD-ES-2026',
      desc: 'Anonimización L7 en tiempo real de DNI, NIE, IBAN, nominas y exp. judiciales. Bloqueo automático eIDAS.'
    },
    {
      id: 'TOP_PROMPT_INJECTION',
      title: 'Jailbreak & Prompt Injection Guard',
      badge: 'SEGURIDAD L7',
      pricePerUser: 15,
      cryptoSignature: 'SHA256-JAILBREAK-GUARD-2026',
      desc: 'Detección proactiva de inyecciones de código, bypass de reglas (DAN mode) y manipulación de rol.'
    },
    {
      id: 'STAR_FACT_CHECKER',
      title: 'Fact-Checking Forense & Fake Disprover',
      badge: 'ANALÍTICO & FORENSE',
      pricePerUser: 18,
      cryptoSignature: 'ED25519-8F93A2-M3V-2026',
      desc: 'Análisis de artefactos en capturas, desensamblaje de deepfakes y verificación de firmas sintéticas.'
    },
    {
      id: 'STAR_TOKEN_OPTIMIZER',
      title: 'Optimizador de Tokens & CostGuard',
      badge: 'FINOPS & AHORRO',
      pricePerUser: 8,
      cryptoSignature: 'RSA4096-COST-GUARD-2026',
      desc: 'Reducción de coste computacional de hasta un 45% en payloads redundantes y desinfección de prompts.'
    }
  ];

  // Calculadora B2B de costes y ahorro estimado
  const baseMonthlyPrice = scenarios.reduce((acc, curr) => acc + curr.pricePerUser, 0) * usersCount * discountMultiplier;
  const estimatedTokenSavings = Math.round(usersCount * 42.5); // Ahorro proyectado en cuotas LLM
  const estimatedRiskAvoided = usersCount * 1200; // Sanciones/fugas evitadas estimadas

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* HEADER ENTERPRISE */}
      <div style={{ borderBottom: '1px solid #334155', background: '#1e293b', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #3b82f6)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>S</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>S.A.A.R.E. SUITE MARKETPLACE</h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>PLATAFORMA B2B DE GESTIÓN DE LICENCIAS & RUNTIME SOVEREIGNTY</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Organización: <strong style={{ color: '#38bdf8' }}>ACME Corp (Enterprise)</strong></span>
            <button style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
              Portal del Cliente
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>

        {/* HERO TIPO GOOGLE CLOUD: TRIAL DE PRUEBA GRATUITO */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #3b82f6', borderRadius: '16px', padding: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(59,130,246,0.15)' }}>
          <div>
            <span style={{ background: '#1e3a8a', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              🎁 PROGRAMA ENTERPRISE ONBOARDING
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '12px 0 8px 0', color: '#ffffff' }}>
              Prueba S.A.A.R.E. L7 Runtime Gratis durante 14 Días
            </h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', maxWidth: '650px' }}>
              Evalúa la intercepción de PII, inyecciones de código y ahorro en tokens en situaciones reales con <strong>1.000 Prompts Auditados sin coste</strong>. Sin compromisos ni tarjeta de crédito.
            </p>
          </div>
          <div>
            {trialClaimed ? (
              <div style={{ background: '#14532d', border: '1px solid #22c55e', color: '#4ade80', padding: '16px 24px', borderRadius: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                ✓ TOKEN EVALUACIÓN ACTIVADO<br/>
                <span style={{ fontSize: '11px', color: '#86efac' }}>Vínculo: SAARE-TRIAL-2026-ACTIVE</span>
              </div>
            ) : (
              <button onClick={() => setTrialClaimed(true)} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', border: 'none', padding: '16px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
                Obtener Token de Prueba (0 €)
              </button>
            )}
          </div>
        </div>

        {/* CALCULADORA DE COSTES & SIMULADOR B2B */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#38bdf8' }}>📊 Calculadora B2B & Previsión de Ahorro FinOps</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold' }}>
                Número de Empleados / Licencias IA: <span style={{ color: '#38bdf8', fontSize: '16px' }}>{usersCount} usuarios</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="500" 
                step="5" 
                value={usersCount} 
                onChange={e => setUsersCount(Number(e.target.value))} 
                style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
              />

              <div style={{ marginTop: '20px', display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
                <button 
                  onClick={() => setBillingCycle('MONTHLY')} 
                  style={{ flex: 1, background: billingCycle === 'MONTHLY' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                  Facturación Mensual
                </button>
                <button 
                  onClick={() => setBillingCycle('ANNUAL')} 
                  style={{ flex: 1, background: billingCycle === 'ANNUAL' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                  Plan Anual (-30% Dto.)
                </button>
              </div>
            </div>

            {/* CUADROS DE IMPACTO ECONÓMICO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #334155', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>COSTE ESTIMADO MENSUAL</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff' }}>{Math.round(baseMonthlyPrice)} € <span style={{ fontSize: '11px', color: '#64748b' }}>/mes</span></span>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #16a34a', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#4ade80', display: 'block', marginBottom: '4px' }}>AHORRO EN TOKENS (CostGuard)</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80' }}>~{estimatedTokenSavings} € <span style={{ fontSize: '11px', color: '#86efac' }}>/mes</span></span>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #0284c7', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', display: 'block', marginBottom: '4px' }}>RIESGO DE SANCIÓN EVITADO</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#38bdf8' }}>~{estimatedRiskAvoided.toLocaleString()} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* CATÁLOGO DE ESCENARIOS COMERCIALES */}
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: '#ffffff' }}>
          Escenarios de Protección Disponible (Paquetes B2B)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {scenarios.map(sc => {
            const calculatedPrice = Math.round(sc.pricePerUser * discountMultiplier);

            return (
              <div key={sc.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#1e3a8a', color: '#93c5fd', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{sc.badge}</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>{calculatedPrice} € <span style={{ fontSize: '11px', color: '#94a3b8' }}>/usuario/mes</span></span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#f8fafc' }}>{sc.title}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{sc.desc}</p>
                </div>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>SIG: {sc.cryptoSignature}</span>
                  <button style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    Suscribir Escenario
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), suiteContent, 'utf8');
console.log('=== SAARE SUITE ACTUALIZADA CON LÓGICAS COMERCIALES GOOGLE CLOUD ===');
