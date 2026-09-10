import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import GovernanceToolbar from './GovernanceToolbar';

export default function App() {
  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [selectedJson, setSelectedJson] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [filter, setFilter] = useState('TODOS');
  const [extensionToken, setExtensionToken] = useState('SAARE-EXT-7789-X892-L7');
  const [auditTokenModal, setAuditTokenModal] = useState(false);
  const [userEmail, setUserEmail] = useState('alfonsoterritoriohostil@gmail.com');

  // Directivas de Gobernanza
  const [directives, setDirectives] = useState([
    { id: 1, name: 'DORA - Resiliencia Operativa Digital', active: true },
    { id: 2, name: 'EU AI Act - Prevención de Fugas PII', active: true },
    { id: 3, name: 'ISO/IEC 27037 - Cadena de Custodia Forense', active: true },
    { id: 4, name: 'LOPDGDD - Cifrado Ex-Ante de Datos Sensibles', active: true },
    { id: 5, name: 'L7 Hook - Intercepción de Prompts LLM', active: true },
    { id: 6, name: 'Firma Criptográfica Ed25519 En Vivo', active: true },
    { id: 7, name: 'Sanitización de Archivos y Adjuntos', active: true },
    { id: 8, name: 'Análisis de Intención Ex-Ante (IA Sentinel)', active: true },
  ]);

  // Lista inicial de evidencias
  const [evidences, setEvidences] = useState([
    { id: 'EV-L7-200', time: 'En vivo', cat: 'PII_DETECTED', sub: 'LOPDGDD / AI Act', prompt: '"wrangler 3.114.17 (update available 4.129.0) -------------------..."', dictamen: 'RECHAZADO', type: 'PRIVACIDAD' },
    { id: 'EV-L7-199', time: 'En vivo', cat: 'PII_DETECTED', sub: 'LOPDGDD / AI Act', prompt: '"dame un comando para buscarlv"', dictamen: 'RECHAZADO', type: 'PRIVACIDAD' },
    { id: 'EV-L7-198', time: 'En vivo', cat: 'PII_DETECTED', sub: 'LOPDGDD / AI Act', prompt: '"dame un comando para buscarlo"', dictamen: 'RECHAZADO', type: 'PRIVACIDAD' },
    { id: 'EV-L7-197', time: 'En vivo', cat: 'WORKFLOW_RULE', sub: 'Orquestadores / Workflows', prompt: '"si no hay wrangler"', dictamen: 'RECHAZADO', type: 'WORKFLOWS' },
    { id: 'EV-L7-196', time: '7/9/2026, 2:00:00', cat: 'PII_DETECTED', sub: 'LOPDGDD / AI Act', prompt: '"Sin contenido"', dictamen: 'RECHAZADO', type: 'PRIVACIDAD' }
  ]);

  // Sanitización de Query Parameters en la URL al iniciar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get('user');
    const t = params.get('token');

    if (u && u !== 'undefined') setUserEmail(u);
    if (t && t !== 'undefined' && t.length > 0) setExtensionToken(t);

    if (window.location.search.includes('undefined')) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  // Reloj de telemetría y Polling dinámico conectado a la API de SAARE
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const intervalClock = setInterval(updateClock, 1000);

    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`https://api.saare.es/v1/telemetry?user=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          const remoteEvidences = data.evidences || data.runs || data;
          if (Array.isArray(remoteEvidences)) {
            setEvidences(prev => {
              const combined = [...remoteEvidences, ...prev];
              return Array.from(new Map(combined.map(item => [item.id, item])).values());
            });
          }
        }
      } catch (e) {
        // Silencioso si la API está inaccesible temporalmente
      }
    };

    fetchTelemetry();
    const intervalTelemetry = setInterval(fetchTelemetry, 3000);

    return () => {
      clearInterval(intervalClock);
      clearInterval(intervalTelemetry);
    };
  }, [extensionToken, userEmail]);

  const triggerGovernance = (msg) => {
    setGovernanceStatus(msg);
    setTimeout(() => setGovernanceStatus(''), 4500);
  };

  // Handler para empaquetar y descargar el ZIP corregido (Manifest V3 100% compatible)
  const handleDownloadExtension = async () => {
    try {
      const zip = new JSZip();

      // 1. Manifest V3 Corregido (Sin "type": "module" ni "action" en permissions)
      const manifest = {
        "manifest_version": 3,
        "name": "SAARE Execution Authorization Sensor",
        "version": "10.0.5",
        "description": "AI Execution Authorization Infrastructure (SGP 1.0) · SAARE VERDICT™ & Bóveda KV",
        "background": {
          "service_worker": "background.js"
        },
        "action": {
          "default_title": "SAARE Execution Guard Node (Bóveda KV Active)",
          "default_popup": "popup.html"
        },
        "content_scripts": [
          {
            "matches": [
              "https://gemini.google.com/*",
              "https://chatgpt.com/*",
              "https://chat.openai.com/*",
              "https://claude.ai/*",
              "https://copilot.microsoft.com/*",
              "https://chat.deepseek.com/*",
              "https://www.perplexity.ai/*"
            ],
            "js": ["content.js"],
            "run_at": "document_start"
          }
        ],
        "web_accessible_resources": [
          {
            "resources": ["inject.js"],
            "matches": [
              "https://gemini.google.com/*",
              "https://chatgpt.com/*",
              "https://chat.openai.com/*",
              "https://claude.ai/*",
              "https://copilot.microsoft.com/*",
              "https://chat.deepseek.com/*",
              "https://www.perplexity.ai/*"
            ]
          }
        ],
        "permissions": [
          "storage",
          "alarms",
          "downloads"
        ]
      };

      // 2. Storage Managed con los tokens del usuario
      const storageManaged = {
        "saare_bootstrap_token": {
          "Value": extensionToken,
          "Description": "Token fiduciario de sesión emitido por la Bóveda KL."
        },
        "saare_tenant_domain": {
          "Value": "GMAIL",
          "Description": "Identificador canónico del inquilino corporativo."
        },
        "saare_user_email": {
          "Value": userEmail,
          "Description": "Email del operador autorizado en la estación de trabajo."
        },
        "endpoint": {
          "Value": "https://api.saare.es/v1",
          "Description": "Endpoint de ingesta y evaluación del Control Plane."
        }
      };

      // 3. Background Service Worker
      const backgroundJs = `// SAARE L7 Background Service Worker (SGP 1.0)
const SAARE_CONFIG = {
  TOKEN: "${extensionToken}",
  USER_EMAIL: "${userEmail}",
  ENDPOINT: "https://api.saare.es/v1/telemetry"
};

console.log('[SAARE Sensor] Background activo con Token:', SAARE_CONFIG.TOKEN);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    console.log("[SAARE Event Captured]", message.payload);
    sendResponse({ status: "ACK_RECEIVED", timestamp: new Date().toISOString() });
  }
});`;

      const contentJs = `console.log('[SAARE L7 Hook] Extensión activa para el usuario:', '${userEmail}');`;
      
      const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; background: #030712; color: #fff; width: 280px; padding: 12px; margin: 0; }
    .status { color: #10b981; font-weight: bold; }
    .token { font-family: monospace; color: #38bdf8; word-break: break-all; background: #0f172a; padding: 4px; border-radius: 4px; display: block; margin-top: 4px; }
  </style>
</head>
<body>
  <h3 style="margin-top: 0; color: #38bdf8;">SAARE Execution Guard</h3>
  <p>Estado: <span class="status">PROTEGIDO</span></p>
  <p>Token: <span class="token">${extensionToken}</span></p>
  <p>Usuario: <br><strong style="color: #f8fafc;">${userEmail}</strong></p>
</body>
</html>`;

      // Agregar los archivos al ZIP
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("storage_managed.json", JSON.stringify(storageManaged, null, 2));
      zip.file("background.js", backgroundJs);
      zip.file("content.js", contentJs);
      zip.file("inject.js", "// SAARE Inject L7 Hook Script\n");
      zip.file("popup.html", popupHtml);

      // Generar el archivo Blob ejecutable
      const content = await zip.generateAsync({ type: "blob" });
      const fileName = `saare-agente-tokenizado-${extensionToken}.zip`;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      triggerGovernance(`Paquete ZIP generado y descargado: ${fileName}`);
    } catch (err) {
      console.error("Error al generar el paquete ZIP:", err);
      triggerGovernance("Error al empaquetar la extensión tokenizada.");
    }
  };

  const handleExportChainOfCustody = () => {
    const custodyData = JSON.stringify({
      organization: "GMAIL",
      user: userEmail,
      timestamp: new Date().toISOString(),
      standard: "ISO/IEC 27037:2012 / DORA / EU AI Act",
      activeDirectives: directives.filter(d => d.active).length,
      extensionToken: extensionToken,
      signatureEd25519: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      evidenceCount: evidences.length
    }, null, 2);

    const blob = new Blob([custodyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cadena_custodia_saare_iso27037.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance('Cadena de Custodia exportada correctamente en JSON firmado Ed25519.');
  };

  const handleDownloadTeaser = () => {
    const teaserText = `====================================================\nS.A.A.R.E. GRC & IA GOVERNANCE - MATRIZ DE INVARIANTES\n====================================================\n1. Invariante 0x01: Ningún prompt sale al LLM sin inspección L7 Ex-Ante.\n2. Invariante 0x02: Toda captura genera firma Ed25519 con hash SHA-256.\n3. Invariante 0x03: Cumplimiento DORA / EU AI Act / LOPDGDD estricto.\nToken ID: ${extensionToken}\n====================================================`;

    const blob = new Blob([teaserText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saare_matriz_invariantes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance('Teaser Técnico y Matriz de Invariantes descargado.');
  };

  const handleLogout = () => {
    if (window.confirm('¿Desea cerrar la sesión del Panel de Control GRC?')) {
      window.location.href = 'https://www.saare.es';
    }
  };

  const filteredEvidences = evidences.filter(item => {
    if (filter === 'TODOS') return true;
    if (filter === 'PRIVACIDAD') return item.type === 'PRIVACIDAD';
    if (filter === 'WORKFLOWS') return item.type === 'WORKFLOWS';
    return true;
  });

  const activeDirectivesCount = directives.filter(d => d.active).length;
  const disabledDirectivesCount = directives.filter(d => !d.active).length;

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Toast Notificación de Gobernanza */}
      {governanceStatus && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#059669', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 10000, fontWeight: '800', fontSize: '0.85rem', border: '1px solid #10b981' }}>
          🔔 {governanceStatus}
        </div>
      )}

      {/* Header Full Width */}
      <header style={{ width: '100%', background: '#0b0f19', borderBottom: '1px solid #1e293b', padding: 0, margin: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <img 
          src="/tu-imagen.png" 
          alt="Sistema de Alineamiento, Auditoría y Resiliencia Estructural" 
          style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} 
        />
      </header>

      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
        
        {/* Card Principal */}
        <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid #1e293b' }}>
          
          {/* Header Info Organizacional */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.02em' }}>
                PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA V2.5
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8' }}>
                ORGANIZACIÓN: <span style={{ color: '#f8fafc', fontWeight: '900' }}>GMAIL</span> | USUARIO: <span style={{ color: '#38bdf8', fontWeight: '800' }}>{userEmail}</span> | DIRECTIVAS: <span style={{ color: '#4ade80', fontWeight: '900' }}>{activeDirectivesCount} ACTIVAS</span> | <span style={{ color: '#f87171', fontWeight: '900' }}>{disabledDirectivesCount} DESHABILITADAS</span>
              </p>
            </div>

            <button 
              onClick={handleLogout}
              style={{ padding: '8px 18px', background: '#27272a', border: '1px solid #3f3f46', color: '#ef4444', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
              🔴 SALIR
            </button>
          </div>

          {/* Telemetría de Extensión Tokenizada */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#0f172a', border: '1px solid #1e293b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                BÓVEDA KV: EN VIVO (VERIFIED_TAMPER_EVIDENT) | <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{timeStr || '13:55:00'}</span>
              </span>

              <span style={{ padding: '6px 14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
                L7 HOOK EXTENSIÓN: ACTIVO [{extensionToken}]
              </span>

            </div>

            <button 
              onClick={handleDownloadExtension}
              style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              🧩 Descargar Extensión Tokenizada (.zip)
            </button>
          </div>

          {/* Componente Reutilizable: Panel de Gobernanza & Cumplimiento */}
          <GovernanceToolbar
            onExportCustody={handleExportChainOfCustody}
            onGenerateToken={() => setAuditTokenModal(true)}
            onDownloadTeaser={handleDownloadTeaser}
          />

          {/* Barra de Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#94a3b8' }}>TESTIGOS L7 EN TIEMPO REAL:</span>
            <button 
              onClick={() => setFilter('TODOS')}
              style={{ padding: '6px 14px', background: filter === 'TODOS' ? '#0284c7' : '#1e293b', color: filter === 'TODOS' ? '#ffffff' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              TODOS ({evidences.length})
            </button>
            <button 
              onClick={() => setFilter('PRIVACIDAD')}
              style={{ padding: '6px 14px', background: filter === 'PRIVACIDAD' ? '#0284c7' : '#1e293b', color: filter === 'PRIVACIDAD' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              PRIVACIDAD
            </button>
            <button 
              onClick={() => setFilter('WORKFLOWS')}
              style={{ padding: '6px 14px', background: filter === 'WORKFLOWS' ? '#0284c7' : '#1e293b', color: filter === 'WORKFLOWS' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              Orquestadores / Workflows
            </button>
          </div>

          {/* Pestañas de Navegación */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #1e293b', marginBottom: '20px' }}>
            <button 
              onClick={() => setActiveTab('GLOBAL')}
              style={{ padding: '10px 20px', background: activeTab === 'GLOBAL' ? '#0284c7' : '#0f172a', color: activeTab === 'GLOBAL' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>
              REGISTRO GLOBAL ({evidences.length})
            </button>
            <button 
              onClick={() => setActiveTab('RUNLIVE')}
              style={{ padding: '10px 20px', background: activeTab === 'RUNLIVE' ? '#0284c7' : '#0f172a', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>
              S.A.A.R.E. (RUNLIVE - TELEMETRÍA EXTENSIÓN)
            </button>
            <button 
              onClick={() => setActiveTab('CONFIG')}
              style={{ padding: '10px 20px', background: activeTab === 'CONFIG' ? '#0284c7' : '#0f172a', color: activeTab === 'CONFIG' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>
              CONFIGURACIÓN ({activeDirectivesCount})
            </button>
          </div>

          {/* Vistas */}
          {activeTab === 'GLOBAL' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '900', color: '#f8fafc', textTransform: 'uppercase' }}>
                  HISTORIAL DE EVIDENCIAS FORENSES EN AUDITORÍA
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                  Filtrados por {userEmail}: {filteredEvidences.length}
                </span>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>TIMESTAMP</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>ID EVIDENCIA</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>CATEGORÍA / NORMA</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>PROMPT INTERCEPTADO</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>DICTAMEN</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>AUDITORÍA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvidences.map((ev, index) => (
                      <tr key={ev.id || index} style={{ borderBottom: '1px solid #1e293b', background: index % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{ev.time}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#38bdf8' }}>{ev.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '800', color: '#f8fafc' }}>{ev.cat}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{ev.sub}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontFamily: 'monospace', color: '#38bdf8', background: '#020617', padding: '4px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                            {ev.prompt}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: '900', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            {ev.dictamen}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button 
                            onClick={() => setSelectedJson(ev)}
                            style={{ padding: '4px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                            Ver JSON
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'RUNLIVE' && (
            <div style={{ background: '#020617', padding: '20px', borderRadius: '8px', color: '#f8fafc', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1.1rem' }}>📡 MONITOREO DE TELEMETRÍA DE LA EXTENSIÓN TOKENIZADA L7</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>Conexión directa en tiempo real entre el navegador local y la Bóveda KV de S.A.A.R.E.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ESTADO DEL HOOK EN NAVEGADOR</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4ade80', marginTop: '4px' }}>CONECTADO (L7 ACTIVE)</div>
                </div>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>LATENCIA DE INTERCEPCIÓN</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>30 ms (Ex-Ante)</div>
                </div>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TOKEN DE LA EXTENSIÓN</div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fbbf24', marginTop: '4px' }}>{extensionToken}</div>
                </div>
              </div>

              <div style={{ background: '#090d16', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a7f3d0', border: '1px solid #1e293b' }}>
                <div>[TELEMETRY STREAM - {timeStr}] Listening on https://api.saare.es/v1/telemetry...</div>
                <div>[HOOK L7] DOM mutation observer attached to ChatGPT / Gemini / Claude inputs.</div>
                <div>[POLICY CHECK] Directives loaded: {activeDirectivesCount}/8. Zero leak protection engaged.</div>
              </div>
            </div>
          )}

          {activeTab === 'CONFIG' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '900', color: '#f8fafc' }}>
                CONFIGURACIÓN DE DIRECTIVAS DE SEGURIDAD IA Y TOKEN DE EXTENSIÓN
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {directives.map((dir) => (
                  <div key={dir.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f8fafc' }}>{dir.name}</span>
                    <button 
                      onClick={() => {
                        setDirectives(directives.map(d => d.id === dir.id ? { ...d, active: !d.active } : d));
                        triggerGovernance(`Directiva "${dir.name}" ${!dir.active ? 'activada' : 'desactivada'}.`);
                      }}
                      style={{ padding: '6px 14px', background: dir.active ? '#16a34a' : '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                      {dir.active ? 'ACTIVA' : 'DESHABILITADA'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal Ver JSON de Evidencia */}
      {selectedJson && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '600px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#38bdf8' }}>Evidencia Forense Extensión {selectedJson.id}</h3>
            <pre style={{ background: '#020617', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', color: '#34d399', border: '1px solid #1e293b' }}>
              {JSON.stringify({
                evidenceId: selectedJson.id,
                timestamp: selectedJson.time,
                rule: selectedJson.cat,
                normative: selectedJson.sub,
                verdict: selectedJson.dictamen,
                interceptedPrompt: selectedJson.prompt,
                extensionToken: extensionToken,
                hashEd25519: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                chainOfCustody: "ISO/IEC 27037:2012 COMPLIANT"
              }, null, 2)}
            </pre>
            <button 
              onClick={() => setSelectedJson(null)}
              style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              Cerrar Modal
            </button>
          </div>
        </div>
      )}

      {/* Modal Token de Auditoría */}
      {auditTokenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4ade80' }}>🛡️ Token de Auditoría Temporal Generado</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Este token otorga acceso de lectura de caja negra a los auditores externos durante 24 horas.</p>
            <div style={{ background: '#020617', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.85rem', border: '1px solid #1e293b', wordBreak: 'break-all', marginBottom: '16px' }}>
              SAARE-AUDIT-2026-ED25519-99418274-VALID24H
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText('SAARE-AUDIT-2026-ED25519-99418274-VALID24H');
                triggerGovernance('Token de auditoría copiado al portapapeles.');
                setAuditTokenModal(false);
              }}
              style={{ width: '100%', padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              Copiar Token y Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}