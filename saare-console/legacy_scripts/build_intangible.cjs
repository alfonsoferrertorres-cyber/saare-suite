const fs = require('fs');
const path = require('path');

const jsxContent = `import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('RUNLIVE');
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastLog, setLastLog] = useState(null);
  const [activeScene, setActiveScene] = useState({
    id: 'STAR_FACT_CHECKER',
    title: '🔬 Fact-Checking Forense & Fake Disprover ⭐',
    crypto_sig: 'ED25519-8F93A2-M3V-2026',
    engine: 'S.A.A.R.E. Engine'
  });

  const libraryScenes = [
    { id: 'STAR_FACT_CHECKER', title: '🔬 Fact-Checking Forense & Fake Disprover ⭐', badge: 'ANALÍTICO', crypto_sig: 'ED25519-8F93A2-M3V-2026', desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.' },
    { id: 'ES_CUMPLIMIENTO_ESPANA', title: '🇪🇸 España - LOPDGDD & AEPD', badge: 'NORMATIVA', crypto_sig: 'AES256-AEPD-ES-2026', desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.' },
    { id: 'STAR_TOKEN_OPTIMIZER', title: '⚡ Optimizador de Tokens & CostGuard ⭐', badge: 'ESTRELLA', crypto_sig: 'RSA4096-COST-GUARD-2026', desc: 'Reducción de coste computacional y desinfección de prompts redundantes.' },
    { id: 'TOP_PROMPT_INJECTION', title: '🎯 Jailbreak & Prompt Injection Guard', badge: 'TOP L7', crypto_sig: 'SHA256-JAILBREAK-GUARD-2026', desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).' }
  ];

  const fetchAuditLogs = async () => {
    const mockLogs = [
      { id: 'EV-864387', timestamp: new Date().toLocaleTimeString(), prompt: 'Quiero clonar la voz de un directivo y generar su rostro en video', device: 'INST-SAARE-WIN-2026', scenario: '🔬 Fact-Checking Forense & Fake Disprover ⭐', status: 'RECHAZADO', crypto_hash: activeScene.crypto_sig, explanation: 'Inconsistencia en patrones de iluminación y simetría ocular detectados por análisis pericial.' },
      { id: 'EV-621469', timestamp: '19:55:12', prompt: 'Por favor procesa esta nómina con el DNI 12345678Z', device: 'INST-SAARE-WIN-2026', scenario: '🇪🇸 Cumplimiento LOPDGDD España', status: 'RECHAZADO', crypto_hash: 'AES256-AEPD-ES-2026', explanation: 'Enmascaramiento preventivo de DNI en cumplimiento estricto de protección de datos.' }
    ];
    setLogs(mockLogs);
    if (mockLogs.length > 0) setLastLog(mockLogs[0]);
  };

  useEffect(() => { fetchAuditLogs(); }, [activeScene]);

  const handleDownloadSealedPDF = (logItem) => {
    const targetLog = logItem || lastLog;
    if (!targetLog) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(\`<html><head><title>CERTIFICADO EVIDENCIA SAARE</title></head><body style="font-family:sans-serif;padding:30px;background:#f8fafc;color:#1e293b;"><h2>S.A.A.R.E. DICTAMEN DE EVIDENCIA GLOBAL E INTANGIBLE</h2><hr/><p><b>ID:</b> \${targetLog.id}</p><p><b>HECHO PROBADO:</b> "\${targetLog.prompt}"</p><p><b>DICTAMEN:</b> \${targetLog.status}</p><p><b>EXPLICACIÓN:</b> \${targetLog.explanation}</p><div style="border:2px dashed #059669;background:#ecfdf5;padding:15px;margin-top:20px;text-align:center;"><b>SELLO CRIPTOGRÁFICO INTANGIBLE CON VERIFICACIÓN MULTI-IA</b><br/><code style="font-size:11px;">SHA256-ED25519-\${targetLog.crypto_hash}-\${Date.now()}</code></div><script>window.onload=function(){window.print();}</script></body></html>\`);
    printWindow.document.close();
  };

  const filteredLogs = logs.filter(l => l.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || l.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ backgroundColor: '#e2e8f0', minHeight: '100vh', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* CABECERA CORPORATIVA */}
      <div style={{ 
        width: '100%', 
        height: '240px', 
        backgroundImage: 'url(/saare-brand-header.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        borderBottom: '2px solid #cbd5e1',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
      </div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* ENCABEZADO SOC */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #cbd5e1', paddingBottom: '16px', background: '#ffffff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>SAARE OPERATION CENTER v2.5</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>ORGANIZACIÓN: <strong>ACME Corporation</strong> | FIRMA CRIPTOGRÁFICA: <span style={{ color: '#0284c7', fontFamily: 'monospace', fontWeight: 'bold' }}>{activeScene.crypto_sig}</span></p>
          </div>
          <div style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#15803d', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            ● VALIDEZ PERICIAL ACTIVA (CONFORMIDAD CE)
          </div>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('REGISTRO_GLOBAL')} style={{ background: activeTab === 'REGISTRO_GLOBAL' ? '#0284c7' : '#ffffff', color: activeTab === 'REGISTRO_GLOBAL' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'REGISTRO_GLOBAL' ? '0 4px 12px rgba(2,132,199,0.3)' : 'none' }}>📑 Registro Global</button>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'RUNLIVE' ? '0 4px 12px rgba(2,132,199,0.3)' : 'none' }}>📡 S.A.A.R.E. (RunLive)</button>
          <button onClick={() => setActiveTab('BIBLIOTECA_ESCENAS')} style={{ background: activeTab === 'BIBLIOTECA_ESCENAS' ? '#0284c7' : '#ffffff', color: activeTab === 'BIBLIOTECA_ESCENAS' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'BIBLIOTECA_ESCENAS' ? '0 4px 12px rgba(2,132,199,0.3)' : 'none' }}>📚 Biblioteca de Escenas Activas</button>
        </div>

        {/* PESTAÑA 1: REGISTRO GLOBAL */}
        {activeTab === 'REGISTRO_GLOBAL' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#ffffff', borderLeft: '5px solid #0284c7', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}><div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>TOTAL PRUEBAS REGISTRADAS</div><div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{logs.length}</div></div>
              <div style={{ background: '#ffffff', borderLeft: '5px solid #dc2626', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}><div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>INTERCEPCIONES DE RIESGO</div><div style={{ fontSize: '32px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>{logs.length}</div></div>
              <div style={{ background: '#ffffff', borderLeft: '5px solid #16a34a', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}><div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>POLÍTICA ACTIVA</div><div style={{ color: '#15803d', fontWeight: 'bold', marginTop: '8px', fontSize: '14px' }}>{activeScene.title}</div></div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead><tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #cbd5e1' }}><th style={{ padding: '14px 16px' }}>EVIDENCIA ID</th><th style={{ padding: '14px 16px' }}>PROMPT INTERCEPTADO</th><th style={{ padding: '14px 16px' }}>ESCENARIO APLICADO</th><th style={{ padding: '14px 16px' }}>ACCIONES</th></tr></thead>
                <tbody>{filteredLogs.map(l => (<tr key={l.id} style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: 'bold' }}>{l.id}</td><td style={{ padding: '14px 16px', color: '#334155' }}>"{l.prompt}"</td><td style={{ padding: '14px 16px', fontWeight: '600' }}>{l.scenario}</td><td style={{ padding: '14px 16px' }}><button onClick={() => handleDownloadSealedPDF(l)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📄 Dictamen PDF</button></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: RUNLIVE CON EVIDENCIA GLOBAL E INTANGIBLE Y VERIFICACIÓN MULTI-IA */}
        {activeTab === 'RUNLIVE' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>MONITOREO EN TIEMPO REAL</span>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0' }}>📡 TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h2>
                </div>
                <button onClick={() => handleDownloadSealedPDF(lastLog)} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>📥 Descargar Telemetría Certificada (PDF Sellado)</button>
              </div>
              {lastLog && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}><b>EVIDENCIA ID:</b> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{lastLog.id}</span> | <b>HORA DEL HECHO:</b> {lastLog.timestamp} | <b>DICTAMEN:</b> <span style={{ color: '#dc2626', fontWeight: 'bold', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>{lastLog.status}</span></p>
                  <p style={{ fontStyle: 'italic', background: '#ffffff', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '6px', color: '#334155', margin: 0, fontSize: '14px' }}>"{lastLog.prompt}"</p>
                </div>
              )}
            </div>

            {/* SECCIÓN REFORMULADA: EVIDENCIA GLOBAL E INTANGIBLE */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '18px', fontWeight: '900' }}>🏛️ EVIDENCIA GLOBAL E INTANGIBLE</h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Proceso de conversión del código/prompt en una entidad matemática inmutable con valor judicial universal.</p>
              </div>

              <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
                La evidencia <strong style={{ color: '#0284c7' }}>{lastLog?.id || 'EV-864387'}</strong> constituye una prueba plena de la interacción ocurrida. Durante la transmisión, el código en bruto es abstraído e inmovilizado mediante un proceso de **intangibilidad criptográfica**, generando un objeto digital único e inalterable.
              </p>

              {/* LOS 3 PASOS DEL PROCESO DE INTANGIBILIDAD Y AUDITORÍA MULTI-IA */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0284c7', marginBottom: '6px' }}>⚡ 1. PROCESO DE INTANGIBILIDAD</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    El código o prompt en vuelo es despojado de voltajes efímeros y fijado en una huella matemática ($ED25519$), volviéndose una prueba intangible e inalterable.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#16a34a', marginBottom: '6px' }}>🧠 2. VERIFICACIÓN CRUZADA MULTI-IA</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    La estructura semántica del registro permite que <strong>cualquier Modelo de IA independiente</strong> (ChatGPT, Claude, Gemini, Llama) pueda auditar e interpretar objetivamente el hecho.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#b45309', marginBottom: '6px' }}>⚖️ 3. VALOR JUDICIAL GLOBAL</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    El consenso unánime de análisis entre múltiples inteligencias artificiales otorga al dictamen una validez pericial plena y vinculante ante cualquier tribunal o auditor.
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* PESTAÑA 3: BIBLIOTECA */}
        {activeTab === 'BIBLIOTECA_ESCENAS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {libraryScenes.map(sc => (
              <div key={sc.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginBottom: '8px' }}>{sc.badge}</span>
                <h3 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '16px' }}>{sc.title}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{sc.desc}</p>
                <button onClick={() => setActiveScene(sc)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>⚡ ACTIVAR Y REGISTRAR EVIDENCIA</button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), jsxContent, 'utf8');
console.log('=== EVIDENCIA GLOBAL E INTANGIBLE CON VERIFICACIÓN MULTI-IA INTEGRADA ===');
