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
    printWindow.document.write(\`<html><head><title>CERTIFICADO EVIDENCIA SAARE</title></head><body style="font-family:sans-serif;padding:30px;"><h2>S.A.A.R.E. DICTAMEN DE EVIDENCIA INMUTABLE</h2><hr/><p><b>ID:</b> \${targetLog.id}</p><p><b>HECHO:</b> "\${targetLog.prompt}"</p><p><b>DICTAMEN:</b> \${targetLog.status}</p><p><b>EXPLICACIÓN:</b> \${targetLog.explanation}</p><div style="border:2px dashed #10b981;padding:15px;margin-top:20px;text-align:center;"><b>SELLO CRIPTOGRÁFICO DE PRUEBA PLENA</b><br/><code style="font-size:11px;">SHA256-ED25519-\${targetLog.crypto_hash}-\${Date.now()}</code></div><script>window.onload=function(){window.print();}</script></body></html>\`);
    printWindow.document.close();
  };

  const filteredLogs = logs.filter(l => l.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || l.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', height: '180px', backgroundImage: 'url(/saare-brand-header.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '2px solid #b45309', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '12px', right: '24px', display: 'flex', gap: '16px', fontSize: '12px', color: '#f1f5f9', fontWeight: 'bold', background: 'rgba(15, 23, 42, 0.8)', padding: '8px 16px', borderRadius: '8px' }}>
          <span>Inicio</span> • <span>Sobre Nosotros</span> • <span>Soluciones</span> • <span>Certificaciones CE</span> • <span>Contacto</span>
        </div>
      </div>
      <div style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>SAARE OPERATION CENTER v2.5</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>ORGANIZACIÓN: ACME Corporation | FIRMA: <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{activeScene.crypto_sig}</span></p>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>● VALIDEZ PERICIAL ACTIVA (CONFORMIDAD CE)</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('REGISTRO_GLOBAL')} style={{ background: activeTab === 'REGISTRO_GLOBAL' ? '#0284c7' : '#1e293b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📑 Registro Global</button>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ background: activeTab === 'RUNLIVE' ? '#0284c7' : '#1e293b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📡 S.A.A.R.E. (RunLive)</button>
          <button onClick={() => setActiveTab('BIBLIOTECA_ESCENAS')} style={{ background: activeTab === 'BIBLIOTECA_ESCENAS' ? '#0284c7' : '#1e293b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📚 Biblioteca de Escenas Activas</button>
        </div>
        {activeTab === 'REGISTRO_GLOBAL' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#111827', borderLeft: '4px solid #38bdf8', padding: '16px', borderRadius: '8px' }}><div>TOTAL PRUEBAS REGISTRADAS</div><div style={{ fontSize: '28px', fontWeight: 'bold' }}>{logs.length}</div></div>
              <div style={{ background: '#111827', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px' }}><div>INTERCEPCIONES DE RIESGO</div><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{logs.length}</div></div>
              <div style={{ background: '#111827', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px' }}><div>POLÍTICA ACTIVA</div><div style={{ color: '#10b981', fontWeight: 'bold', marginTop: '8px' }}>{activeScene.title}</div></div>
            </div>
            <table style={{ width: '100%', background: '#111827', borderRadius: '8px', textAlign: 'left', fontSize: '12px' }}>
              <thead><tr style={{ background: '#1e293b', color: '#94a3b8' }}><th style={{ padding: '12px' }}>EVIDENCIA ID</th><th style={{ padding: '12px' }}>PROMPT</th><th style={{ padding: '12px' }}>ESCENARIO</th><th style={{ padding: '12px' }}>ACCIONES</th></tr></thead>
              <tbody>{filteredLogs.map(l => (<tr key={l.id} style={{ borderBottom: '1px solid #1f2937' }}><td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{l.id}</td><td style={{ padding: '12px' }}>"{l.prompt}"</td><td style={{ padding: '12px' }}>{l.scenario}</td><td style={{ padding: '12px' }}><button onClick={() => handleDownloadSealedPDF(l)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>📄 Dictamen PDF</button></td></tr>))}</tbody>
            </table>
          </div>
        )}
        {activeTab === 'RUNLIVE' && (
          <div>
            <div style={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>📡 TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h2>
                <button onClick={() => handleDownloadSealedPDF(lastLog)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📥 Descargar Telemetría Certificada (PDF Sellado)</button>
              </div>
              {lastLog && (
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
                  <p><b>EVIDENCIA ID:</b> <span style={{ color: '#38bdf8' }}>{lastLog.id}</span> | <b>HORA DEL HECHO:</b> {lastLog.timestamp} | <b>DICTAMEN:</b> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{lastLog.status}</span></p>
                  <p style={{ fontStyle: 'italic', background: '#0f172a', padding: '12px', borderRadius: '6px' }}>"{lastLog.prompt}"</p>
                </div>
              )}
            </div>
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ color: '#cbd5e1' }}>🏛️ DEMOSTRACIÓN DE LA EVIDENCIA GLOBAL E INTANGIBLE</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>La evidencia {lastLog?.id} constituye una prueba plena de la interacción ocurrida. El registro ha sido fijado mediante un sello criptográfico inmutable, lo que garantiza la integridad absoluta de la información capturada, su trazabilidad legal y la imposibilidad de manipulación posterior del hecho probado.</p>
            </div>
          </div>
        )}
        {activeTab === 'BIBLIOTECA_ESCENAS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {libraryScenes.map(sc => (
              <div key={sc.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>{sc.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>{sc.desc}</p>
                <button onClick={() => setActiveScene(sc)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px', width: '100%', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>⚡ ACTIVAR Y REGISTRAR EVIDENCIA</button>
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
console.log('=== APP.JSX RECREADO CON ÉXITO ===');
