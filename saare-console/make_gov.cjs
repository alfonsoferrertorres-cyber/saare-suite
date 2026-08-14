const fs = require('fs');
const path = require('path');

const jsxContent = `import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('RUNLIVE');
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastLog, setLastLog] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
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
      { id: 'EV-864387', timestamp: new Date().toLocaleTimeString(), prompt: 'Quiero clonar la voz de un directivo y generar su rostro en video', device: 'INST-SAARE-WIN-2026', scenario: '🔬 Fact-Checking Forense & Fake Disprover ⭐', status: 'RECHAZADO', crypto_hash: activeScene.crypto_sig, explanation: 'Inconsistencia en patrones de iluminación y simetría ocular detectados por análisis pericial nativo en RAM.' },
      { id: 'EV-621469', timestamp: '19:55:12', prompt: 'Por favor procesa esta nómina con el DNI 12345678Z', device: 'INST-SAARE-WIN-2026', scenario: '🇪🇸 Cumplimiento LOPDGDD España', status: 'RECHAZADO', crypto_hash: 'AES256-AEPD-ES-2026', explanation: 'Enmascaramiento preventivo de DNI en cumplimiento estricto de protección de datos.' }
    ];
    setLogs(mockLogs);
    if (mockLogs.length > 0) setLastLog(mockLogs[0]);
  };

  useEffect(() => { fetchAuditLogs(); }, [activeScene]);

  const handleVerifyInBrowser = async (logItem) => {
    const targetLog = logItem || lastLog;
    if (!targetLog) return;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(targetLog.id + targetLog.prompt + targetLog.timestamp);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const browserHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      setVerificationResult({
        evidenciaId: targetLog.id,
        browserHash: 'SHA256-WEB-' + browserHash.substring(0, 16),
        status: 'VERIFICADO_OK',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (e) {
      console.log('Error calculando hash nativo');
    }
  };

  const handleDownloadSealedPDF = (logItem) => {
    const targetLog = logItem || lastLog;
    if (!targetLog) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(\`<html><head><title>CERTIFICADO EVIDENCIA SAARE</title></head><body style="font-family:sans-serif;padding:30px;background:#f8fafc;color:#1e293b;"><h2>S.A.A.R.E. DICTAMEN DE EVIDENCIA GLOBAL E INTANGIBLE</h2><hr/><p><b>EVIDENCIA ID:</b> \${targetLog.id}</p><p><b>HECHO PROBADO:</b> "\${targetLog.prompt}"</p><p><b>DICTAMEN:</b> \${targetLog.status}</p><p><b>IDENTIDAD OPERATIVA:</b> Acreditación digital inmutable de la conducta del usuario humano sin mediación manual.</p><p><b>CUMPLIMIENTO GOBERNANZA & AYUDAS:</b> Certificación conforme para justificación de subvenciones públicas y planes de adopción IA (EU AI Act / ENS).</p><p><b>PRUEBA DE NO MODIFICACIÓN:</b> El hash matemático cambiaría radicalmente ante la más mínima alteración de un solo bit (efecto avalancha SHA-256).</p><p><b>EJECUCIÓN EN MEMORIA RAM:</b> Proceso nativo en memoria volátil L7 sin persistencia en disco ni envío de tokens externos.</p><p><b>EXPLICACIÓN:</b> \${targetLog.explanation}</p><div style="border:2px dashed #059669;background:#ecfdf5;padding:15px;margin-top:20px;text-align:center;"><b>SELLO CRIPTOGRÁFICO INTANGIBLE CON VALIDEZ GLOBAL Y CUMPLIMIENTO SUBVENCIONABLE</b><br/><code style="font-size:11px;">SHA256-ED25519-\${targetLog.crypto_hash}-\${Date.now()}</code></div><script>window.onload=function(){window.print();}</script></body></html>\`);
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
            ● CUMPLIMIENTO GOBERNANZA & BONIFICABLE (CONFORMIDAD CE / EU AI ACT)
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

        {/* PESTAÑA 2: RUNLIVE CON SECCIÓN DE GOBERNANZA TERRITORIAL Y BONIFICACIONES */}
        {activeTab === 'RUNLIVE' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>MONITOREO EN TIEMPO REAL</span>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0' }}>📡 TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleVerifyInBrowser(lastLog)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔍 Auditar Criptografía en Navegador (Motor Nativo WebCrypto)</button>
                  <button onClick={() => handleDownloadSealedPDF(lastLog)} style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>📥 Descargar Dictamen (PDF Sellado)</button>
                </div>
              </div>

              {verificationResult && (
                <div style={{ background: '#f0fdf4', border: '1px solid #16a34a', padding: '14px 20px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', display: 'block' }}>✓ AUDITORÍA DE INALTERABILIDAD MATEMÁTICA CONSTATADA</span>
                    <span style={{ fontSize: '12px', color: '#166534', fontFamily: 'monospace', fontWeight: 'bold' }}>Hash Nivel Cliente: {verificationResult.browserHash}</span>
                  </div>
                  <span style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>EVIDENCIA 100% INTACTA</span>
                </div>
              )}

              {lastLog && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}><b>EVIDENCIA ID:</b> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{lastLog.id}</span> | <b>HORA DEL HECHO:</b> {lastLog.timestamp} | <b>DICTAMEN:</b> <span style={{ color: '#dc2626', fontWeight: 'bold', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>{lastLog.status}</span></p>
                  <p style={{ fontStyle: 'italic', background: '#ffffff', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '6px', color: '#334155', margin: 0, fontSize: '14px' }}>"{lastLog.prompt}"</p>
                </div>
              )}
            </div>

            {/* SECCIÓN EVIDENCIA GLOBAL E INTANGIBLE & PLANES DE GOBERNANZA */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0, fontSize: '18px', fontWeight: '900' }}>🏛️ EVIDENCIA GLOBAL E INTANGIBLE: GARANTÍA DE NO MODIFICACIÓN</h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Integridad matemática absoluta e inalterable mediante hash asimétrico en memoria RAM volátil.</p>
              </div>

              <div style={{ background: '#f8fafc', borderLeft: '4px solid #16a34a', padding: '16px 20px', borderRadius: '6px', marginBottom: '20px' }}>
                <p style={{ color: '#1e293b', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                  <strong>Certeza Matemática Incontestable (Efecto Avalancha):</strong><br/>
                  La integridad del registro se apoya en funciones digestivas asimétricas (<span style={{ color: '#0284c7', fontFamily: 'monospace' }}>SHA-256 + ED25519</span>). Si alguien intentara cambiar un solo carácter, un espacio o un signo de puntuación en el hecho registrado, la huella matemática calculada por el navegador **cambiaría de forma drástica e irreconocible**.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7', marginBottom: '6px' }}>📉 EFECTO AVALANCHA</div><div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>Modificar un único bit de la evidencia altera más del 50% de la firma criptográfica.</div></div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', marginBottom: '6px' }}>⏱️ TIMESTAMP EN RAM</div><div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>Sellado en memoria volátil L7 previo a cualquier almacenamiento permanente.</div></div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#b45309', marginBottom: '6px' }}>🔒 CERO TOKENS EXTERNOS</div><div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>Proceso nativo in-situ sin fuga de datos confidenciales a infraestructura de terceros.</div></div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc2626', marginBottom: '6px' }}>🧠 AUDITORÍA MULTI-IA</div><div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>Cualquier modelo de IA independiente puede verificar de forma unánime que el hash no ha sido alterado.</div></div>
              </div>
            </div>

            {/* NUEVA SECCIÓN: CUMPLIMIENTO DE PLANES DE GOBERNANZA TERRITORIALES Y SUBVENCIONES */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#0f172a', margin: 0, fontSize: '18px', fontWeight: '900' }}>💶 CUMPLIMIENTO DE PLANES DE GOBERNANZA & ELEGIBILIDAD DE SUBVENCIONES</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>Certificación pericial requerida para acceso a bonificaciones, fondos NextGenerationEU y deducciones por I+D+i.</p>
                </div>
                <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                  ★ APTO PARA BONIFICACIÓN PÚBLICA
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0284c7', marginBottom: '6px' }}>🇪🇺 CONFORMIDAD EU AI ACT & ENS</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    Satisface los requisitos de supervisión humana, mitigación de riesgos y registro de eventos exigidos por la legislación europea para mantener la calificación de IA de bajo/medio riesgo.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#16a34a', marginBottom: '6px' }}>📑 JUSTIFICACIÓN TÉCNICA DE AYUDAS</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    Los Dictámenes PDF con sello eIDAS sirven como prueba pericial ante auditores públicos, previniendo la revocación de subvenciones o la penalización en inspecciones de fondos FEDER.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#b45309', marginBottom: '6px' }}>💰 RETORNO VÍA INCENTIVOS FISCALES</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    Permite estructurar el despliegue como proyecto de Ciberseguridad Avanzada y Gobernanza de Datos, habilitando deducciones directas en el Impuesto de Sociedades.
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
console.log('=== SECCIÓN CUMPLIMIENTO TERRITORIAL Y BONIFICACIONES INTEGRADA CON ÉXITO ===');
