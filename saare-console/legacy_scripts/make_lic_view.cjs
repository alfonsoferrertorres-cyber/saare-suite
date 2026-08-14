const fs = require('fs');
const path = require('path');

const jsxContent = `import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('BIBLIOTECA_ESCENAS');
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastLog, setLastLog] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  
  const [tenantLicense, setTenantLicense] = useState({
    tenantId: 'ACME-CORP-ES-2026',
    organization: 'ACME Corporation S.A.',
    planType: 'ENTERPRISE SOVEREIGN (MASTER PASS)',
    activeLicensesCount: 4,
    totalFlotaCount: 22,
    status: 'CONTRATO VIGENTE'
  });

  const [activeScene, setActiveScene] = useState({
    id: 'TOP_PROMPT_INJECTION',
    title: '🎯 Jailbreak & Prompt Injection Guard',
    crypto_sig: 'SHA256-JAILBREAK-GUARD-2026'
  });

  const libraryScenes = [
    { 
      id: 'STAR_FACT_CHECKER', 
      title: '🔬 Fact-Checking Forense & Fake Disprover ⭐', 
      badge: 'ANALÍTICO', 
      crypto_sig: 'ED25519-8F93A2-M3V-2026', 
      desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.',
      licensed: true,
      licenseType: 'Enterprise Add-On'
    },
    { 
      id: 'ES_CUMPLIMIENTO_ESPANA', 
      title: '🇪🇸 España - LOPDGDD & AEPD', 
      badge: 'NORMATIVA', 
      crypto_sig: 'AES256-AEPD-ES-2026', 
      desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.',
      licensed: true,
      licenseType: 'Core Territorial'
    },
    { 
      id: 'STAR_TOKEN_OPTIMIZER', 
      title: '⚡ Optimizador de Tokens & CostGuard ⭐', 
      badge: 'ESTRELLA', 
      crypto_sig: 'RSA4096-COST-GUARD-2026', 
      desc: 'Reducción de coste computacional y desinfección de prompts redundantes.',
      licensed: true,
      licenseType: 'Performance Core'
    },
    { 
      id: 'TOP_PROMPT_INJECTION', 
      title: '🎯 Jailbreak & Prompt Injection Guard', 
      badge: 'TOP L7', 
      crypto_sig: 'SHA256-JAILBREAK-GUARD-2026', 
      desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).',
      licensed: true,
      licenseType: 'Security Pro'
    }
  ];

  const fetchAuditLogs = async () => {
    const mockLogs = [
      { id: 'EV-864387', timestamp: new Date().toLocaleTimeString(), promptSummary: 'Quiero clonar la voz de un directivo y generar su rostro en video', verdict: 'RECHAZADO', scenarioApplied: activeScene.title, cryptoSeal: activeScene.crypto_sig }
    ];
    setLogs(mockLogs);
    if (mockLogs.length > 0) setLastLog(mockLogs[0]);
  };

  useEffect(() => { fetchAuditLogs(); }, [activeScene]);

  const handleDownloadSealedPDF = (logItem) => {
    const targetLog = logItem || lastLog;
    if (!targetLog) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(\`<html><head><title>CERTIFICADO EVIDENCIA SAARE</title></head><body style="font-family:sans-serif;padding:30px;background:#f8fafc;color:#1e293b;"><h2>S.A.A.R.E. DICTAMEN DE EVIDENCIA GLOBAL E INTANGIBLE</h2><hr/><p><b>EVIDENCIA ID:</b> \${targetLog.id}</p><p><b>HECHO PROBADO:</b> "\${targetLog.promptSummary}"</p><p><b>DICTAMEN:</b> \${targetLog.verdict}</p><p><b>LICENCIA VINCULADA:</b> \${tenantLicense.planType}</p><div style="border:2px dashed #059669;background:#ecfdf5;padding:15px;margin-top:20px;text-align:center;"><b>SELLO CRIPTOGRÁFICO INTANGIBLE CON VALIDEZ GLOBAL</b><br/><code style="font-size:11px;">SHA256-ED25519-\${targetLog.cryptoSeal}-\${Date.now()}</code></div><script>window.onload=function(){window.print();}</script></body></html>\`);
    printWindow.document.close();
  };

  return (
    <div style={{ backgroundColor: '#e2e8f0', minHeight: '100vh', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* CABECERA CORPORATIVA */}
      <div style={{ 
        width: '100%', 
        height: '220px', 
        backgroundImage: 'url(/saare-brand-header.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        borderBottom: '2px solid #cbd5e1',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
      </div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* ENCABEZADO SOC */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#ffffff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #cbd5e1' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>SAARE OPERATION CENTER v2.5</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>ORGANIZACIÓN: <strong>ACME Corporation</strong> | FIRMA CRIPTOGRÁFICA ACTIVA: <span style={{ color: '#0284c7', fontFamily: 'monospace', fontWeight: 'bold' }}>{activeScene.crypto_sig}</span></p>
          </div>
          <div style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#15803d', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            ● CUMPLIMIENTO GOBERNANZA & BONIFICABLE (CONFORMIDAD CE / EU AI ACT)
          </div>
        </div>

        {/* NUEVO PANEL PROFESIONAL DE VISIBILIDAD DE LICENCIAS */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(2, 132, 199, 0.2)', border: '1px solid #0284c7', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold', display: 'block' }}>ESTADO DE CONTRATO</span>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#ffffff' }}>🔑 {tenantLicense.planType}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block' }}>COBERTURA DE LICENCIAS ACTIVAS EN DISPOSITIVO</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8' }}>{tenantLicense.activeLicensesCount} Escenarios Licenciados & Desplegados <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>(de {tenantLicense.totalFlotaCount} en la Suite)</span></span>
            </div>
          </div>
          <a href="http://localhost:5174" target="_blank" rel="noreferrer" style={{ background: '#0284c7', color: '#ffffff', textDecoration: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(2,132,199,0.4)' }}>
            🏪 Gestionar Flota de Licencias en Marketplace Suite (:5174) ➔
          </a>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('REGISTRO_GLOBAL')} style={{ background: activeTab === 'REGISTRO_GLOBAL' ? '#0284c7' : '#ffffff', color: activeTab === 'REGISTRO_GLOBAL' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'REGISTRO_GLOBAL' ? '0 4px 12px rgba(2,132,199,0.3)' : 'none' }}>📑 Registro Global</button>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'RUNLIVE' ? '0 4px 12px rgba(2,132,199,0.3)' : 'none' }}>📡 S.A.A.R.E. (RunLive)</button>
          <button onClick={() => setActiveTab('BIBLIOTECA_ESCENAS')} style={{ background: activeTab === 'BIBLIOTECA_ESCENAS' ? '#0284c7' : '#ffffff', color: activeTab === 'BIBLIOTECA_ESCENAS' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'BIBLIOTECA_ESCENAS' ? '0 4px 12px rgba(2,132,199,0.3)' : 'none' }}>📚 Biblioteca de Escenas & Licencias Activas ({libraryScenes.length})</button>
        </div>

        {/* PESTAÑA 3: BIBLIOTECA CON INDICADORES CLAROS DE LICENCIA */}
        {activeTab === 'BIBLIOTECA_ESCENAS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {libraryScenes.map(sc => {
              const isActiveInRuntime = activeScene.id === sc.id;
              return (
                <div key={sc.id} style={{ background: '#ffffff', border: isActiveInRuntime ? '2px solid #16a34a' : '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative' }}>
                  
                  {/* BADGES SUPERIORES DE LICENCIA Y EJECUCIÓN */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{sc.badge}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        ✓ LICENCIA HABILITADA ({sc.licenseType})
                      </span>
                      {isActiveInRuntime && (
                        <span style={{ background: '#16a34a', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                          ● ACTIVO EN RUNTIME L7
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '16px' }}>{sc.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{sc.desc}</p>
                  
                  <button onClick={() => { setActiveScene(sc); setActiveTab('RUNLIVE'); }} style={{ background: isActiveInRuntime ? '#16a34a' : '#0284c7', color: '#fff', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                    {isActiveInRuntime ? '✓ ESCENARIO EN EJECUCIÓN EN MEMORIA RAM' : '⚡ CONMUTAR Y REGISTRAR EVIDENCIA'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* PESTAÑA 2: RUNLIVE TELEMETRÍA EN VIVO */}
        {activeTab === 'RUNLIVE' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>MONITOREO EN TIEMPO REAL</span>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0' }}>📡 TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleDownloadSealedPDF(lastLog)} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>📥 Descargar Dictamen (PDF Sellado)</button>
                </div>
              </div>

              {lastLog && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}><b>EVIDENCIA ID:</b> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{lastLog.id}</span> | <b>HORA DEL HECHO:</b> {lastLog.timestamp} | <b>DICTAMEN:</b> <span style={{ color: '#dc2626', fontWeight: 'bold', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>{lastLog.verdict}</span></p>
                  <p style={{ fontStyle: 'italic', background: '#ffffff', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '6px', color: '#334155', margin: 0, fontSize: '14px' }}>"{lastLog.promptSummary}"</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), jsxContent, 'utf8');
console.log('=== VISTA DE LICENCIAMIENTO CLARA Y PROFESIONAL INTEGRADA ===');
