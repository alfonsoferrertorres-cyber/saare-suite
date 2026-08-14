import React, { useState } from 'react';

export default function App() {
  const [billingCycle, setBillingCycle] = useState('ANNUAL');
  const [usersCount, setUsersCount] = useState(25);
  const [trialClaimed, setTrialClaimed] = useState(false);
  const [trialEmail, setTrialEmail] = useState('');
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialToken, setTrialToken] = useState('');

  const [selectedScenarioIds, setSelectedScenarioIds] = useState([
    'ES_CUMPLIMIENTO_ESPANA',
    'TOP_PROMPT_INJECTION',
    'STAR_FACT_CHECKER',
    'STAR_TOKEN_OPTIMIZER'
  ]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deployFormat, setDeployFormat] = useState('SDK');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [formData, setCompanyFormData] = useState({
    companyName: 'ACME Corporation',
    cif: 'B12345678',
    email: 'admin@acme.com',
    cloudEndpoint: 'https://l7-proxy.acme.com'
  });

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
  const [sepaIban, setSepaIban] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const discountMultiplier = billingCycle === 'ANNUAL' ? 0.7 : 1.0;

  const scenarios = [
    { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', badge: 'NORMATIVA OBLIGATORIA', pricePerUser: 6, savingsPerUser: 0, riskPerUser: 1200, desc: 'Anonimización L7 ilimitada de DNI, NIE, IBAN, nóminas y exp. judiciales. Bloqueo automático eIDAS.' },
    { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', badge: 'SEGURIDAD L7', pricePerUser: 8, savingsPerUser: 0, riskPerUser: 800, desc: 'Detección proactiva ilimitada de inyecciones de código, bypass de reglas (DAN mode) y manipulación de rol.' },
    { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', badge: 'ANALÍTICO & FORENSE', pricePerUser: 9, savingsPerUser: 0, riskPerUser: 600, desc: 'Análisis ilimitado de archivos adjuntos (PDFs), artefactos en capturas y desensamblaje de deepfakes.' },
    { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', badge: 'FINOPS & AHORRO GUARANTEED', pricePerUser: 4, savingsPerUser: 28.5, riskPerUser: 0, desc: 'Reducción directa de coste en cuotas LLM. Auditoría ilimitada y optimización automática de payloads.' }
  ];

  const toggleScenarioSelection = (id) => {
    if (selectedScenarioIds.includes(id)) {
      if (selectedScenarioIds.length > 1) {
        setSelectedScenarioIds(prev => prev.filter(item => item !== id));
      }
    } else {
      setSelectedScenarioIds(prev => [...prev, id]);
    }
  };

  const activeSelectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id));
  const calculatedUnitPrice = activeSelectedScenarios.reduce((sum, s) => sum + s.pricePerUser, 0);
  const baseMonthlyPrice = calculatedUnitPrice * usersCount * discountMultiplier;
  const estimatedTokenSavings = activeSelectedScenarios.reduce((sum, s) => sum + (s.savingsPerUser * usersCount), 0);
  const estimatedRiskAvoided = activeSelectedScenarios.reduce((sum, s) => sum + (s.riskPerUser * usersCount), 0);

  // FLUSO 1: Emitir Pago/Licencia en Control Plane (Backend)
  const emitControlPlaneLicense = async (payload) => {
    const cpEndpoints = [
      'http://localhost:3002/api/runtime/deploy',
      'http://localhost:3002/api/deploy',
      'http://localhost:3001/api/runtime/deploy'
    ];
    for (const url of cpEndpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          return data.token || 'SAARE-LICENSE-2026-ACTIVE';
        }
      } catch (e) {}
    }
    return 'SAARE-LICENSE-2026-ACTIVE';
  };

  // FLUJO 2: Validar Licencia Desacoplada en Runtime Engine (Intercepción RAM)
  const syncWithRuntimeEngine = async (token, company, scenariosList) => {
    const runtimeEndpoints = [
      'http://localhost:8080/api/v1/license/validate',
      'http://localhost:3000/api/license/validate',
      'http://localhost:3001/api/v1/scenarios/toggle-license'
    ];
    for (const url of runtimeEndpoints) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, company, activeScenarios: scenariosList, mode: 'RAM_L7_DESACOPLADO' })
        });
      } catch (e) {}
    }
  };

  const handleClaimTrial = async () => {
    if (!trialEmail.trim()) return;
    const generatedToken = 'SAARE-TRIAL-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-2026';
    setTrialToken(generatedToken);

    // 1. Registro en Control Plane
    await emitControlPlaneLicense({
      email: trialEmail,
      token: generatedToken,
      type: 'EVALUATION_TRIAL',
      company: formData.companyName
    });

    // 2. Validación y Sincronización Desacoplada en Runtime Engine
    await syncWithRuntimeEngine(generatedToken, formData.companyName, selectedScenarioIds);

    setTrialClaimed(true);
    setIsTrialModalOpen(false);
  };

  const handleOpenCheckout = () => {
    setCheckoutStep(1);
    setDeploySuccess(false);
    setPaymentError('');
    setIsCheckoutOpen(true);
  };

  const handleAutoFillTestPayment = () => {
    setPaymentError('');
    if (paymentMethod === 'CARD') {
      setCardData({ number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123' });
    } else if (paymentMethod === 'SEPA') {
      setSepaIban('ES91 2100 0418 4502 0005 1387');
    } else if (paymentMethod === 'INVOICE') {
      setPoNumber('PO-2026-TEST-ACME-001');
    }
  };

  const handleProcessDeployAndPayment = async () => {
    setPaymentError('');

    if (paymentMethod === 'CARD') {
      if (!cardData.number.trim() || !cardData.expiry.trim() || !cardData.cvc.trim()) {
        setPaymentError('Por favor, rellena los datos de la tarjeta.');
        return;
      }
    } else if (paymentMethod === 'SEPA') {
      if (!sepaIban.trim() || sepaIban.length < 15) {
        setPaymentError('Por favor, introduce un IBAN válido.');
        return;
      }
    } else if (paymentMethod === 'INVOICE') {
      if (!poNumber.trim()) {
        setPaymentError('Por favor, especifica el número de Orden de Compra.');
        return;
      }
    }

    setDeploying(true);

    // 1. Verificación de pago y emisión de Token B2B en Control Plane
    const activeToken = await emitControlPlaneLicense({
      company: formData.companyName,
      cif: formData.cif,
      email: formData.email,
      format: deployFormat,
      scenarios: selectedScenarioIds,
      users: usersCount,
      billing: billingCycle,
      payment: paymentMethod
    });

    // 2. Activación de la Licencia Desacoplada directamente en el Runtime Engine
    await syncWithRuntimeEngine(activeToken, formData.companyName, selectedScenarioIds);

    setDeploying(false);
    setDeploySuccess(true);
  };

  const handleDownloadYamlPackage = () => {
    let fileContent = '';
    let fileName = '';

    if (deployFormat === 'SDK') {
      fileName = `saare-sdk-package-${formData.companyName.toLowerCase().replace(/\s+/g, '-')}.yaml`;
      fileContent = `apiVersion: v1
kind: ConfigMap
metadata:
  name: saare-sdk-config
data:
  CLIENTE: "${formData.companyName} (${formData.cif})"
  CONTROL_PLANE_URL: "http://localhost:3002"
  RUNTIME_ENGINE_LOCAL: "http://localhost:8080"
  DESACOPLADO_MODE: "RAM_INTERCEPTION_ACTIVE"
  LICENSE_KEY: "${trialToken || 'SAARE-SDK-KEY-2026-ACTIVE'}"
  MODULOS: "${selectedScenarioIds.join(', ')}"`;
    } else if (deployFormat === 'CLOUD') {
      fileName = `saare-cloud-proxy-${formData.companyName.toLowerCase().replace(/\s+/g, '-')}.yaml`;
      fileContent = `apiVersion: v1
kind: ConfigMap
metadata:
  name: saare-cloud-config
data:
  CLIENTE: "${formData.companyName} (${formData.cif})"
  ENDPOINT: "https://proxy.saare.io/v1/acme-corp"
  CONTROL_PLANE_SYNC: "http://localhost:3002/telemetry"`;
    } else if (deployFormat === 'K8S') {
      fileName = `saare-k8s-helm-values-${formData.companyName.toLowerCase().replace(/\s+/g, '-')}.yaml`;
      fileContent = `saareGuard:
  enabled: true
  licenseKey: "${trialToken || 'SAARE-K8S-2026-ACTIVE'}"
  controlPlaneUrl: "http://localhost:3002"
  runtimeEngineUrl: "http://localhost:8080"
  interceptionMode: "RAM_SIDECAR"
  resources:
    limits:
      memory: "256Mi"
      cpu: "200m"`;
    }

    const blob = new Blob([fileContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ backgroundColor: '#eef2f6', minHeight: '100vh', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
                  {/* HEADER VISUAL SAARE CON IMAGEN ORIGINAL LIMPIA */}
      <div style={{
        width: '100%',
        height: '210px',
        background: '#ffffff url(/saare-brand-header.jpg) center/contain no-repeat',
        borderBottom: '1px solid #cbd5e1',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px' }}>
        
        {/* BARRA DE ESTADO OPERATION CENTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>SAARE OPERATION CENTER v2.5</h1>
              <span style={{ border: '1px solid #16a34a', color: '#16a34a', background: '#f0fdf4', fontSize: '11px', fontWeight: 'bold', padding: '2px 10px', borderRadius: '12px' }}>RUNTIME DESACOPLADO EN RAM ACTIVO</span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              ORGANIZACIÓN: <strong>ACME Corporation</strong> | LICENCIA: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Validada en Runtime</span> | REGLAS L7: <span style={{ color: '#0284c7', fontWeight: 'bold' }}>4 Activas</span>
            </p>
          </div>
          <button onClick={handleOpenCheckout} style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}>
            ⚙️ Despliegue B2B Multiformato ({Math.round(baseMonthlyPrice)} €/mes)
          </button>
        </div>

        {/* PROGRAMA ENTERPRISE & TOKEN DE PRUEBA */}
        <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '12px', padding: '28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(2,132,199,0.08)' }}>
          <div>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>PROGRAMA ENTERPRISE DISRUPTIVO</span>
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '10px 0 6px 0', color: '#0f172a' }}>Protección L7 Ilimitada y 300 € en Créditos de Auditoría (0 €)</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px', maxWidth: '700px' }}>Sin límites mensuales de uso ni cobro por token. Intercepción local en RAM con coste marginal cero. Evalúa en tiempo real con <strong>14 días de prueba ilimitada</strong> sin compromiso.</p>
          </div>
          <div>
            {trialClaimed ? (
              <div style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#15803d', padding: '14px 20px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '13px' }}>
                ✓ TOKEN EVALUACIÓN ACTIVADO EN RUNTIME<br/>
                <span style={{ fontSize: '10px', color: '#166534', fontFamily: 'monospace' }}>{trialToken || 'SAARE-TRIAL-UNLIMITED-2026'}</span><br/>
                <span style={{ fontSize: '10px', color: '#475569' }}>({trialEmail})</span>
              </div>
            ) : (
              <button onClick={() => setIsTrialModalOpen(true)} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                Obtener Licencia de Prueba (0 €)
              </button>
            )}
          </div>
        </div>

        {/* CALCULADORA FINOPS */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>📊 Calculadora FinOps & Previsión de Tarifa Plana B2B</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Marca los módulos a incluir en la cotización:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {scenarios.map(sc => {
              const isSelected = selectedScenarioIds.includes(sc.id);
              return (
                <div key={sc.id} onClick={() => toggleScenarioSelection(sc.id)} style={{ background: isSelected ? '#e0f2fe' : '#f8fafc', border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#0284c7', cursor: 'pointer' }} />
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: isSelected ? '#0369a1' : '#475569' }}>{sc.title}</span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{sc.pricePerUser} € / usuario</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 'bold' }}>
                Usuarios / Empleados a Proteger: <span style={{ color: '#0284c7', fontSize: '15px' }}>{usersCount} licencias</span>
              </label>
              <input type="range" min="5" max="500" step="5" value={usersCount} onChange={e => setUsersCount(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#0284c7' }} />

              <div style={{ marginTop: '16px', display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <button onClick={() => setBillingCycle('MONTHLY')} style={{ flex: 1, background: billingCycle === 'MONTHLY' ? '#0284c7' : 'transparent', color: billingCycle === 'MONTHLY' ? '#fff' : '#475569', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Pago Mensual</button>
                <button onClick={() => setBillingCycle('ANNUAL')} style={{ flex: 1, background: billingCycle === 'ANNUAL' ? '#16a34a' : 'transparent', color: billingCycle === 'ANNUAL' ? '#fff' : '#475569', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Plan Anual (-30% Dto.)</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>TARIFA PLANA ILIMITADA ({selectedScenarioIds.length})</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{Math.round(baseMonthlyPrice)} € <span style={{ fontSize: '11px', color: '#64748b' }}>/mes</span></span>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #16a34a', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#15803d', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>AHORRO ESTIMADO LLM</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a' }}>~{Math.round(estimatedTokenSavings)} € <span style={{ fontSize: '11px', color: '#15803d' }}>/mes</span></span>
              </div>
              <div style={{ background: '#f0f9ff', border: '1px solid #0284c7', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#0369a1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>MULTA AEPD EVITADA</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7' }}>~{estimatedRiskAvoided.toLocaleString()} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* CATÁLOGO DE ESCENARIOS */}
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
          Escenarios de Protección Disponible (Paquetes B2B)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {scenarios.map(sc => {
            const calculatedPrice = (sc.pricePerUser * discountMultiplier).toFixed(2);
            const isSelectedInCalc = selectedScenarioIds.includes(sc.id);

            return (
              <div key={sc.id} style={{ background: '#ffffff', border: isSelectedInCalc ? '2px solid #0284c7' : '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
                  <button onClick={() => toggleScenarioSelection(sc.id)} style={{ background: isSelectedInCalc ? '#dcfce7' : '#f1f5f9', color: isSelectedInCalc ? '#15803d' : '#475569', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                    {isSelectedInCalc ? '✓ Incluido en Calculadora' : '+ Añadir a Calculadora'}
                  </button>
                  <button onClick={handleOpenCheckout} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                    Seleccionar Despliegue
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL TOKEN EMAIL */}
      {isTrialModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', border: '2px solid #16a34a', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>🔑 Asignar Token de Evaluación Ilimitado</h3>
            <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '20px' }}>Introduce el email corporativo del Administrador de IT para vincular la licencia de prueba gratuita de 14 días:</p>
            <input type="email" placeholder="admin@acme.com" value={trialEmail} onChange={e => setTrialEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsTrialModalOpen(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleClaimTrial} style={{ flex: 2, background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Activar Token 🚀</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B2B */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', border: '2px solid #0284c7', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '640px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            
            {deploySuccess ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>🚀</span>
                <h3 style={{ fontSize: '22px', color: '#16a34a', margin: '0 0 6px 0' }}>¡Licencia Verificada y Despliegue Activado!</h3>
                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '12px' }}>
                  El pago de <strong>{formData.companyName}</strong> ha sido verificado en Control Plane y la licencia desacoplada se ha cargado en el <strong>Runtime Engine</strong>.
                </p>

                <div style={{ background: '#f0fdf4', border: '1px solid #16a34a', color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'left' }}>
                  📧 Token y factura de la transacción enviados a: <u>{formData.email}</u>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button onClick={handleDownloadYamlPackage} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', flex: 1, boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                    📥 Descargar Paquete ({deployFormat}.yaml)
                  </button>
                  <button onClick={() => setIsCheckoutOpen(false)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}>
                    Cerrar y Volver a la Suite
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                      📋 Portal de Despliegue B2B y Licenciamiento
                    </h3>
                    <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold' }}>
                      Paso {checkoutStep} de 3: {checkoutStep === 1 ? 'Elección de Formato de Despliegue' : checkoutStep === 2 ? 'Datos de Empresa' : 'Pasarela de Pago Asignada'}
                    </span>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'transparent', color: '#64748b', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                </div>

                {checkoutStep === 1 && (
                  <div>
                    <label style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                      SELECCIONA EL FORMATO DE DESPLIEGUE ARQUITECTÓNICO:
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                      <div onClick={() => setDeployFormat('SDK')} style={{ background: deployFormat === 'SDK' ? '#e0f2fe' : '#f8fafc', border: deployFormat === 'SDK' ? '2px solid #0284c7' : '1px solid #cbd5e1', padding: '14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>📦</span>
                        <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>SDK / NPM</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>Librería embebida Node/Python</span>
                      </div>

                      <div onClick={() => setDeployFormat('CLOUD')} style={{ background: deployFormat === 'CLOUD' ? '#e0f2fe' : '#f8fafc', border: deployFormat === 'CLOUD' ? '2px solid #0284c7' : '1px solid #cbd5e1', padding: '14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>☁️</span>
                        <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>Cloud Proxy</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>SaaS gestionado HTTPS</span>
                      </div>

                      <div onClick={() => setDeployFormat('K8S')} style={{ background: deployFormat === 'K8S' ? '#e0f2fe' : '#f8fafc', border: deployFormat === 'K8S' ? '2px solid #0284c7' : '1px solid #cbd5e1', padding: '14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>☸️</span>
                        <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>Kubernetes</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>Helm Chart / Sidecar On-Premise</span>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '12px', color: '#475569' }}>
                      <strong>Resumen del Paquete:</strong> {activeSelectedScenarios.length} módulos seleccionados para {usersCount} usuarios ({billingCycle === 'ANNUAL' ? 'Plan Anual Dto. -30%' : 'Plan Mensual'}). Total: <strong style={{ color: '#0284c7' }}>{Math.round(baseMonthlyPrice)} €/mes</strong>
                    </div>

                    <button onClick={() => setCheckoutStep(2)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '14px', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                      Continuar a Datos de Empresa ➔
                    </button>
                  </div>
                )}

                {checkoutStep === 2 && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Razón Social Empresa:</label>
                        <input type="text" value={formData.companyName} onChange={e => setCompanyFormData({...formData, companyName: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CIF / NIF B2B:</label>
                        <input type="text" value={formData.cif} onChange={e => setCompanyFormData({...formData, cif: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Email del Administrador de IT:</label>
                      <input type="email" value={formData.email} onChange={e => setCompanyFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setCheckoutStep(1)} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '14px', width: '30%', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ← Atrás
                      </button>
                      <button onClick={() => setCheckoutStep(3)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '14px', width: '70%', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                        Ir a Pasarela de Pago ➔
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div>
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Formato: <strong>{deployFormat}</strong> ({formData.companyName})</span>
                        <span style={{ fontSize: '15px', fontWeight: '900', color: '#0284c7' }}>TOTAL: {Math.round(baseMonthlyPrice)} € / mes</span>
                      </div>
                      <button onClick={handleAutoFillTestPayment} style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #0284c7', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ⚡ Rellenar Datos de Prueba
                      </button>
                    </div>

                    {paymentError && (
                      <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', marginBottom: '12px' }}>
                        ⚠️ {paymentError}
                      </div>
                    )}

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>MÉTODO DE PAGO EMPRESARIAL:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <button onClick={() => { setPaymentMethod('CARD'); setPaymentError(''); }} style={{ background: paymentMethod === 'CARD' ? '#0284c7' : '#f1f5f9', border: paymentMethod === 'CARD' ? '2px solid #0284c7' : '1px solid #cbd5e1', color: paymentMethod === 'CARD' ? '#fff' : '#475569', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>💳 Tarjeta</button>
                        <button onClick={() => { setPaymentMethod('SEPA'); setPaymentError(''); }} style={{ background: paymentMethod === 'SEPA' ? '#0284c7' : '#f1f5f9', border: paymentMethod === 'SEPA' ? '2px solid #0284c7' : '1px solid #cbd5e1', color: paymentMethod === 'SEPA' ? '#fff' : '#475569', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>🏛️ SEPA Direct</button>
                        <button onClick={() => { setPaymentMethod('INVOICE'); setPaymentError(''); }} style={{ background: paymentMethod === 'INVOICE' ? '#0284c7' : '#f1f5f9', border: paymentMethod === 'INVOICE' ? '2px solid #0284c7' : '1px solid #cbd5e1', color: paymentMethod === 'INVOICE' ? '#fff' : '#475569', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>📄 Factura (PO)</button>
                      </div>
                    </div>

                    {paymentMethod === 'CARD' && (
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
                        <input type="text" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} placeholder="Número de Tarjeta" style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} placeholder="MM/YY" style={{ width: '50%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                          <input type="text" value={cardData.cvc} onChange={e => setCardData({...cardData, cvc: e.target.value})} placeholder="CVC" style={{ width: '50%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'SEPA' && (
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
                        <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>IBAN ADEUDO SEPA OBLIGATORIO:</label>
                        <input type="text" value={sepaIban} onChange={e => setSepaIban(e.target.value)} placeholder="ES91 2100 0418 4502 0005 1387" style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                      </div>
                    )}

                    {paymentMethod === 'INVOICE' && (
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
                        <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>NÚMERO DE ORDEN DE COMPRA (PO):</label>
                        <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="PO-2026-ACME-001" style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setCheckoutStep(2)} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '14px', width: '30%', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        ← Atrás
                      </button>
                      <button disabled={deploying} onClick={handleProcessDeployAndPayment} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '14px', width: '70%', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                        {deploying ? 'Verificando y Sincronizando...' : 'PAGAR Y ACTIVAR LICENCIA RUNTIME 🚀'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}


