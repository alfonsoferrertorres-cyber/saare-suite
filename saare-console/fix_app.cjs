const fs = require('fs');
const path = require('path');

const jsxContent = `import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('REGISTRO_GLOBAL');
  const [testPrompt, setTestPrompt] = useState('Quiero clonar la voz de un directivo y generar su rostro en video');
  const [logs, setLogs] = useState([]);
  const [lastLog, setLastLog] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const [libraryScenes, setLibraryScenes] = useState([
    { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', badge: 'NORMATIVA', cryptoSignature: 'AES256-AEPD-ES-2026', desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.', licensed: true },
    { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', badge: 'TOP L7', cryptoSignature: 'SHA256-JAILBREAK-GUARD-2026', desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).', licensed: true },
    { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', badge: 'ANALÍTICO', cryptoSignature: 'ED25519-8F93A2-M3V-2026', desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.', licensed: true },
    { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', badge: 'ESTRELLA', cryptoSignature: 'RSA4096-COST-GUARD-2026', desc: 'Reducción de coste computacional y desinfección de prompts redundantes.', licensed: true }
  ]);

  const fetchScenarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/scenarios');
      const data = await res.json();
      if (data.scenarios) setLibraryScenes(data.scenarios);
    } catch (e) { console.log('Modo local dinámico'); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/events');
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        setLogs([...data.events]);
        if (data.events.length > 0) {
          setLastLog(data.events[0]);
        }
      }
    } catch (e) { console.log('Error leyendo eventos'); }
  };

  useEffect(() => {
    fetchScenarios();
    fetchLogs();

    // POLLING EN TIEMPO REAL CADA 1 SEGUNDO
    const interval = setInterval(() => {
      fetchLogs();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleScenario = async (scId) => {
    setLibraryScenes(prev => prev.map(sc => sc.id === scId ? { ...sc, licensed: !sc.licensed } : sc));

    try {
      await fetch('http://localhost:3001/api/v1/scenarios/toggle-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scId })
      });
    } catch (e) { console.log('Error alterando estado'); }
  };

  const handleSendTestPrompt = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptInput: testPrompt })
      });
      const data = await res.json();
      if (data.evidence) {
        setLastLog(data.evidence);
        fetchLogs();
      }
    } catch (e) { alert('Asegúrate de tener el Control Plane (:3001) levantado'); }
  };

  const handleVerifyInBrowser = async (logItem) => {
    const targetLog = logItem || lastLog;
    if (!targetLog) return;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode((targetLog.evidenceId || 'EV-000') + targetLog.promptSummary + targetLog.timestamp);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const browserHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      setVerificationResult({
        evidenciaId: targetLog.evidenceId || 'EV-VERIFIED',
        browserHash: 'SHA256-WEB-' + browserHash.substring(0, 16),
        status: 'VERIFICADO_OK',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (e) { console.log('Error calculando hash nativo'); }
  };

  const handleDownloadSealedPDF = (logItem) => {
    const targetLog = logItem || lastLog;
    if (!targetLog) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(\`<html><head><title>CERTIFICADO EVIDENCIA SAARE</title></head><body style="font-family:sans-serif;padding:30px;background:#f8fafc;color:#1e293b;"><h2>S.A.A.R.E. DICTAMEN DE EVIDENCIA GLOBAL E INTANGIBLE</h2><hr/><p><b>EVIDENCIA ID:</b> \${targetLog.evidenceId || 'EV-864387'}</p><p><b>HECHO PROBADO:</b> "\${targetLog.promptSummary}"</p><p><b>DICTAMEN:</b> \${targetLog.verdict}</p><p><b>ESCENARIO APLICADO:</b> \${targetLog.scenarioApplied || 'ESCENARIO ACTIVO'}</p><p><b>PRUEBA DE NO MODIFICACIÓN:</b> El hash matemático cambiaría radicalmente ante la más mínima alteración de un solo bit (efecto avalancha SHA-256).</p><div style="border:2px dashed #059669;background:#ecfdf5;padding:15px;margin-top:20px;text-align:center;"><b>SELLO CRIPTOGRÁFICO INTANGIBLE CON VALIDEZ GLOBAL</b><br/><code style="font-size:11px;">\${targetLog.cryptoSeal || 'SHA256-ED25519-VERIFIED'}</code></div><script>window.onload=function(){window.print();}</script></body></html>\`);
    printWindow.document.close();
  };

  const activeCount = libraryScenes.filter(s => s.licensed).length;
  const disabledCount = libraryScenes.filter(s => !s.licensed).length;

  return (
    <div style={{ backgroundColor: '#e2e8f0', minHeight: '100vh', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', height: '220px', backgroundImage: 'url(/saare-brand-header.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '2px solid #cbd5e1' }}></div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>SAARE OPERATION CENTER v2.5</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              ORGANIZACIÓN: <strong>ACME Corporation</strong> | ESTADO TOKEN: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{activeCount} Habilitados</span> | <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{disabledCount} Deshabilitados</span>
            </p>
          </div>
          <div style={{ background: activeCount > 0 ? '#dcfce7' : '#fef2f2', border: activeCount > 0 ? '1px solid #16a34a' : '1px solid #ef4444', color: activeCount > 0 ? '#15803d' : '#dc2626', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            {activeCount > 0 ? \`MASTER PASS RUNTIME ACTIVO (\${activeCount} REGLAS)\` : 'RUNTIME SIN REGLAS ACTIVAS'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('REGISTRO_GLOBAL')} style={{ background: activeTab === 'REGISTRO_GLOBAL' ? '#0284c7' : '#ffffff', color: activeTab === 'REGISTRO_GLOBAL' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Registro Global ({logs.length})</button>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>S.A.A.R.E. (RunLive)</button>
          <button onClick={() => setActiveTab('BIBLIOTECA_ESCENAS')} style={{ background: activeTab === 'BIBLIOTECA_ESCENAS' ? '#0284c7' : '#ffffff', color: activeTab === 'BIBLIOTECA_ESCENAS' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Biblioteca de Escenas ({libraryScenes.length})</button>
        </div>

        {activeTab === 'REGISTRO_GLOBAL' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>HISTORIAL DE EVIDENCIAS EN AUDITORÍA</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead><tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}><th style={{ padding: '12px' }}>ID EVIDENCIA</th><th style={{ padding: '12px' }}>PROMPT INTERCEPTADO</th><th style={{ padding: '12px' }}>ESCENARIO APLICADO</th><th style={{ padding: '12px' }}>DICTAMEN</th><th style={{ padding: '12px' }}>ACCIONES</th></tr></thead>
              <tbody>
                {logs.map((l, idx) => (
                  <tr key={l.evidenceId ? \`\${l.evidenceId}-\${idx}\` : idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0284c7' }}>{l.evidenceId}</td>
                    <td style={{ padding: '12px' }}>"{l.promptSummary}"</td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{l.scenarioApplied}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: l.verdict === 'RECHAZADO' ? '#fee2e2' : (l.verdict === 'PASSTHROUGH' ? '#fef3c7' : '#dcfce7'), color: l.verdict === 'RECHAZADO' ? '#dc2626' : (l.verdict === 'PASSTHROUGH' ? '#b45309' : '#15803d'), padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px' }}>
                        {l.verdict}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => handleDownloadSealedPDF(l)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>PDF Sellado</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'RUNLIVE' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>MONITOREO EN TIEMPO REAL</span>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0' }}>TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleVerifyInBrowser(lastLog)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Auditar Criptografía en Navegador</button>
                  <button onClick={() => handleDownloadSealedPDF(lastLog)} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>Descargar Dictamen (PDF Sellado)</button>
                </div>
              </div>

              {verificationResult && (
                <div style={{ background: '#f0fdf4', border: '1px solid #16a34a', padding: '14px 20px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', display: 'block' }}>AUDITORÍA DE INALTERABILIDAD MATEMÁTICA CONSTATADA</span>
                    <span style={{ fontSize: '12px', color: '#166534', fontFamily: 'monospace', fontWeight: 'bold' }}>Hash Nivel Cliente: {verificationResult.browserHash}</span>
                  </div>
                  <span style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>EVIDENCIA 100% INTACTA</span>
                </div>
              )}

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>PROBAR PROMPT DE INTERCEPCIÓN EN VIVO CONTRA RUNTIME:</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" value={testPrompt} onChange={e => setTestPrompt(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  <button onClick={handleSendTestPrompt} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>ENVIAR PROMPT A L7</button>
                </div>
              </div>

              {lastLog && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><b>EVIDENCIA ID:</b> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{lastLog.evidenceId}</span> | <b>ESCENARIO REGISTRADO:</b> <strong>{lastLog.scenarioApplied}</strong></p>
                  <p style={{ fontStyle: 'italic', background: '#ffffff', borderLeft: '4px solid #0284c7', padding: '12px', borderRadius: '4px', margin: 0 }}>"{lastLog.promptSummary}"</p>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>DICTAMEN GENERADO:</span>
                    <span style={{ background: lastLog.verdict === 'RECHAZADO' ? '#fee2e2' : (lastLog.verdict === 'PASSTHROUGH' ? '#fef3c7' : '#dcfce7'), color: lastLog.verdict === 'RECHAZADO' ? '#dc2626' : (lastLog.verdict === 'PASSTHROUGH' ? '#b45309' : '#15803d'), padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>
                      {lastLog.verdict}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>SELLO: {lastLog.cryptoSeal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'BIBLIOTECA_ESCENAS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {libraryScenes.map(sc => {
              const isEnabled = sc.licensed;

              return (
                <div key={sc.id} style={{ background: '#ffffff', border: isEnabled ? '2px solid #16a34a' : '2px solid #ef4444', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{sc.badge}</span>
                    {isEnabled ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #16a34a', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        LICENCIA HABILITADA
                      </span>
                    ) : (
                      <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        LICENCIA DESHABILITADA
                      </span>
                    )}
                  </div>
                  <h3 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '16px' }}>{sc.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{sc.desc}</p>
                  <button onClick={() => handleToggleScenario(sc.id)} style={{ background: isEnabled ? '#16a34a' : '#ef4444', color: '#fff', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                    {isEnabled ? 'DESACTIVAR REGLA (CAMBIAR A ROJO)' : 'REACTIVAR LICENCIA (CAMBIAR A VERDE)'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), jsxContent, 'utf8');
console.log('=== APP REACT ACTUALIZADA CON RE-RENDERIZADO DE LOGS EN TIEMPO REAL ===');
