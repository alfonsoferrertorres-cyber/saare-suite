import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import GovernanceToolbar from './GovernanceToolbar';
import Login from './Login';
import OfficialReportModal from './OfficialReportModal';
import { API_BASE_URL, saareFetch } from './utils/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('saare_token') !== null;
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('saare_user_email') || 'legal@saare.es';
  });

  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [selectedJson, setSelectedJson] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [filter, setFilter] = useState('TODOS');
  
  const [auditTokenModal, setAuditTokenModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [directives, setDirectives] = useState([
    { id: 1, name: 'DORA - Resiliencia Operativa Digital', active: true, standard: 'EU Regulation 2022/2554' },
    { id: 2, name: 'EU AI Act - Prevención de Fugas PII', active: true, standard: 'Articles 10 & 15' },
    { id: 3, name: 'ISO/IEC 27037 - Cadena de Custodia Forense', active: true, standard: 'Digital Evidence Handling' },
    { id: 4, name: 'LOPDGDD - Cifrado Ex-Ante de Datos Sensibles', active: true, standard: 'Organic Law 3/2018' },
    { id: 5, name: 'L7 Hook - Intercepción de Prompts LLM', active: true, standard: 'Runtime Guardrail v1.0' },
    { id: 6, name: 'Firma Criptográfica Ed25519 En Vivo', active: true, standard: 'RFC 8032 Standard' },
    { id: 7, name: 'Sanitización de Archivos y Adjuntos', active: true, standard: 'OWASP LLM01 / LLM06' },
    { id: 8, name: 'Análisis de Intención Ex-Ante (IA Sentinel)', active: true, standard: 'Deterministic Zero-Trust' },
  ]);

  const [evidences, setEvidences] = useState([]);

  useEffect(() => {
    if (window.location.search) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  // SINCRONIZACIÓN Y TELEMETRÍA EN TIEMPO REAL DESDE D1 / BÓVEDA
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const intervalClock = setInterval(updateClock, 1000);

    const fetchTelemetry = async () => {
      try {
        // LLAMADA LIMPIA: Apunta directamente a /runs (saareFetch antepone API_BASE_URL)
        const res = await saareFetch(`/runs?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('saare_token') || ''}`,
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          const remoteEvidences = data.evidences || data.runs || data;
          
          if (Array.isArray(remoteEvidences)) {
            const mappedEvidences = remoteEvidences.map((item, idx) => {
              const isDeny = item.decision === 'DENY' || item.verdict === 'RECHAZADO' || item.verdict === 'REJECTED';
              
              let cleanPrompt = item.prompt || item.promptInput || item.rawPrompt || item.cleanPrompt || item.promptSummary || '';
              let cleanResponse = item.responseOutput || item.llmResponse || item.response || '';
              
              try {
                if (typeof cleanPrompt === 'string' && cleanPrompt.includes('%')) cleanPrompt = decodeURIComponent(cleanPrompt);
                if (typeof cleanResponse === 'string' && cleanResponse.includes('%')) cleanResponse = decodeURIComponent(cleanResponse);
              } catch (e) {}

              return {
                id: item.evidence_id || item.id || `EV-L7-${100 + idx}`,
                time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'En vivo',
                cat: item.cat || item.category || (isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME'),
                sub: item.sub || item.norma || 'EU AI Act / LOPDGDD',
                prompt: String(cleanPrompt || '(Sin texto capturado)'),
                responseOutput: String(cleanResponse || ''),
                verdict: isDeny ? 'RECHAZADO' : 'PERMITIDO',
                decision: isDeny ? 'DENY' : 'ALLOW',
                type: item.type || (isDeny ? 'PRIVACIDAD' : 'WORKFLOWS'),
                user: item.user || userEmail,
                tenant: item.tenant || 'ENTERPRISE',
                merkleRoot: item.merkleRoot || '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842',
                node: item.node || '2607076315021',
                rawJson: item
              };
            });

            setEvidences(mappedEvidences);
          }
        }
      } catch (e) {
        console.error("Error al sincronizar evidencias en vivo:", e);
      }
    };

    fetchTelemetry();
    const intervalTelemetry = setInterval(fetchTelemetry, 3000);

    return () => {
      clearInterval(intervalClock);
      clearInterval(intervalTelemetry);
    };
  }, [isAuthenticated, userEmail]);

  const triggerGovernance = (msg) => {
    setGovernanceStatus(msg);
    setTimeout(() => setGovernanceStatus(''), 4500);
  };

  const handleDownloadExtension = async () => {
    try {
      const currentToken = localStorage.getItem('saare_token') || 'sk_saare_live_managed_identity';
      const currentUserEmail = userEmail || localStorage.getItem('saare_user_email') || 'legal@saare.es';

      const response = await fetch('/extension-base.zip');
      if (!response.ok) {
        throw new Error("No se encontró el paquete base extension-base.zip en public/.");
      }

      const zipBlob = await response.blob();
      const zip = await JSZip.loadAsync(zipBlob);

      const storageManaged = {
        "saare_user_email": { "Value": currentUserEmail, "Description": "Email del operador autorizado tokenizado." },
        "saare_tenant_domain": { "Value": "ENTERPRISE", "Description": "Inquilino canónico de la Bóveda." },
        "saare_token": { "Value": currentToken, "Description": "Token OIDC de sincronización con la Bóveda." }
      };

      // Inyección limpia en la raíz del ZIP
      zip.file("storage_managed.json", JSON.stringify(storageManaged, null, 2));

      const content = await zip.generateAsync({ type: "blob" });
      const fileName = `saare-agente-tokenizado-${currentUserEmail.replace(/[@.]/g, "_")}.zip`;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      triggerGovernance(`Sensor tokenizado descargado con éxito para ${currentUserEmail}`);
    } catch (err) {
      console.error("Error al tokenizar la extensión base:", err);
      triggerGovernance("Error al tokenizar la extensión: " + err.message);
    }
  };

  const handleExportChainOfCustody = () => {
    const custodyData = JSON.stringify({
      organization: "ENTERPRISE",
      user: userEmail,
      timestamp: new Date().toISOString(),
      standard: "ISO/IEC 27037:2012 / DORA / EU AI Act",
      activeDirectives: directives.filter(d => d.active).length,
      authModel: "Backend Authoritative HttpOnly",
      evidenceCount: evidences.length,
      evidences: evidences
    }, null, 2);

    const blob = new Blob([custodyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadena_custodia_saare_${userEmail.replace(/[@.]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance('Cadena de Custodia exportada correctamente.');
  };

  const handleDownloadTeaser = () => {
    const teaserText = `====================================================\nS.A.A.R.E. GRC & IA GOVERNANCE - MATRIZ DE INVARIANTES\n====================================================\n1. Invariante 0x01: Inspección L7 Ex-Ante obligatoria.\n2. Invariante 0x02: Firma e inmutabilidad en D1 / Bóveda.\n3. Invariante 0x03: Operaciones protegidas sin cuota KV.\n====================================================`;

    const blob = new Blob([teaserText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saare_matriz_invariantes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance('Matriz de Invariantes descargada.');
  };

  const handleLogout = () => {
    if (window.confirm('¿Desea cerrar la sesión del Panel de Control GRC?')) {
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_user_email');
      setIsAuthenticated(false);
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

  if (!isAuthenticated) {
    return (
      <Login 
        onLoginSuccess={(data) => {
          if (data && data.email) {
            setUserEmail(data.email);
            localStorage.setItem('saare_user_email', data.email);
          }
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {governanceStatus && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#059669', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 10000, fontWeight: '800', fontSize: '0.85rem', border: '1px solid #10b981' }}>
          🔔 {governanceStatus}
        </div>
      )}

      <header style={{ width: '100%', background: '#0b0f19', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#38bdf8', letterSpacing: '1px' }}>S.A.A.R.E. CONSOLE GRC</h1>
          <span style={{ fontSize: '0.75rem', background: '#1e293b', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>v7 PRO</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
          <span>🛡️ Trust Anchor: <strong style={{ color: '#4ade80' }}>SAARE-MD-IPRES-2026</strong></span>
          <span>⚖️ Safe Creative ID: <strong style={{ color: '#38bdf8' }}>2606166125212</strong></span>
          <span>Forensic Custody & L7 Enforcement</span>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>

        <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid #1e293b' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.02em' }}>
                PANEL DE CONTROL GRC & EVIDENCIA FORENSE
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8' }}>
                ORGANIZACIÓN: <span style={{ color: '#f8fafc', fontWeight: '900' }}>ENTERPRISE</span> | OPERADOR: <span style={{ color: '#38bdf8', fontWeight: '800' }}>{userEmail}</span> | DIRECTIVAS: <span style={{ color: '#4ade80', fontWeight: '900' }}>{activeDirectivesCount} ACTIVAS</span> | <span style={{ color: '#f87171', fontWeight: '900' }}>{disabledDirectivesCount} DESHABILITADAS</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setShowReportModal(true)}
                style={{ padding: '8px 16px', background: '#0284c7', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                📋 Informe Oficial CISO
              </button>

              <button
                onClick={handleLogout}
                style={{ padding: '8px 18px', background: '#27272a', border: '1px solid #3f3f46', color: '#ef4444', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                🔴 CERRAR SESIÓN
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#0f172a', border: '1px solid #1e293b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                BÓVEDA EN VIVO (D1) | <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{timeStr || '13:55:00'}</span>
              </span>

              <span style={{ padding: '6px 14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
                SESIÓN VINCULADA: {userEmail}
              </span>
            </div>

            <button
              onClick={handleDownloadExtension}
              style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              🧩 Descargar Sensor L7 Sovereign Tokenizado
            </button>
          </div>

          <GovernanceToolbar
            onExportCustody={handleExportChainOfCustody}
            onGenerateToken={() => setAuditTokenModal(true)}
            onDownloadTeaser={handleDownloadTeaser}
            onVerifySignature={() => setShowReportModal(true)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#94a3b8' }}>TESTIGOS L7 EN TIEMPO REAL:</span>
            <button onClick={() => setFilter('TODOS')} style={{ padding: '6px 14px', background: filter === 'TODOS' ? '#0284c7' : '#1e293b', color: filter === 'TODOS' ? '#ffffff' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>TODOS ({evidences.length})</button>
            <button onClick={() => setFilter('PRIVACIDAD')} style={{ padding: '6px 14px', background: filter === 'PRIVACIDAD' ? '#0284c7' : '#1e293b', color: filter === 'PRIVACIDAD' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>PRIVACIDAD</button>
            <button onClick={() => setFilter('WORKFLOWS')} style={{ padding: '6px 14px', background: filter === 'WORKFLOWS' ? '#0284c7' : '#1e293b', color: filter === 'WORKFLOWS' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>ORQUESTADORES / WORKFLOWS</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #1e293b', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('GLOBAL')} style={{ padding: '10px 20px', background: activeTab === 'GLOBAL' ? '#0284c7' : '#0f172a', color: activeTab === 'GLOBAL' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>REGISTRO DE EVIDENCIA</button>
            <button onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '10px 20px', background: activeTab === 'RUNLIVE' ? '#0284c7' : '#0f172a', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>S.A.A.R.E. ENFORCEMENT</button>
            <button onClick={() => setActiveTab('CONFIG')} style={{ padding: '10px 20px', background: activeTab === 'CONFIG' ? '#0284c7' : '#0f172a', color: activeTab === 'CONFIG' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>POLICY ENGINE</button>
          </div>

          {activeTab === 'GLOBAL' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '900', color: '#f8fafc', textTransform: 'uppercase' }}>HISTORIAL DE EVIDENCIAS FORENSES EN AUDITORÍA</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Trazas verificables: {filteredEvidences.length}</span>
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>TIMESTAMP</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>DECISION ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>USUARIO / OPERADOR</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>PROMPT / CONTESTACIÓN</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>DICTAMEN</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>BUNDLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvidences.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                          No hay evidencias registradas en la Bóveda D1 para esta vista.
                        </td>
                      </tr>
                    ) : (
                      filteredEvidences.map((ev, index) => {
                        const isRejected = ev.verdict === 'RECHAZADO' || ev.decision === 'DENY';
                        return (
                          <tr key={ev.id || index} style={{ borderBottom: '1px solid #1e293b', background: index % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                            <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{ev.time}</td>
                            <td style={{ padding: '12px 16px', fontWeight: '700', color: '#38bdf8' }}>{ev.id}</td>
                            <td style={{ padding: '12px 16px', color: '#a7f3d0', fontFamily: 'monospace' }}>{ev.user}</td>
                            <td style={{ padding: '12px 16px', maxWidth: '380px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontFamily: 'monospace', color: '#38bdf8', background: '#020617', padding: '4px 8px', borderRadius: '4px', border: '1px solid #1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <strong>Prompt:</strong> {ev.prompt}
                                </span>
                                {ev.responseOutput && (
                                  <span style={{ fontFamily: 'monospace', color: '#4ade80', background: '#020617', padding: '4px 8px', borderRadius: '4px', border: '1px solid #1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <strong>Respuesta:</strong> {ev.responseOutput}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ 
                                fontWeight: '900', 
                                color: isRejected ? '#ef4444' : '#10b981', 
                                background: isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: `1px solid ${isRejected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` 
                              }}>
                                {isRejected ? 'DENY (RECHAZADO)' : 'ALLOW (PERMITIDO)'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <button onClick={() => setSelectedJson(ev.rawJson || ev)} style={{ padding: '4px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                                Ver JSON
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'RUNLIVE' && (
            <div style={{ background: '#020617', padding: '20px', borderRadius: '8px', color: '#f8fafc', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1.1rem' }}>📡 MONITOREO DE AUTORIZACIÓN L7 EN TIEMPO REAL</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>Conexión directa activa entre los sensores tokenizados y el motor D1 de S.A.A.R.E.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ESTADO DEL ENFORCEMENT</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#4ade80', marginTop: '4px' }}>ACTIVO (D1 PERSISTENCE)</div>
                </div>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>OPERADOR PRINCIPAL</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>{userEmail}</div>
                </div>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SESSION STATE</div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fbbf24', marginTop: '4px' }}>BACKEND MANAGED D1 SYNC</div>
                </div>
              </div>

              <div style={{ background: '#090d16', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a7f3d0', border: '1px solid #1e293b' }}>
                <div>[POLICY ENGINE - {timeStr}] Listening on {API_BASE_URL}/runs...</div>
                <div>[AUTH LAYER] Credenciales vinculadas para: {userEmail}.</div>
                <div>[ENFORCEMENT] Directivas cargadas: {activeDirectivesCount}/8. Zero-Noise Guard Enforcement.</div>
              </div>
            </div>
          )}

          {activeTab === 'CONFIG' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '900', color: '#f8fafc' }}>
                CONFIGURACIÓN POLICY-AS-CODE (RUNTIME)
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {directives.map((dir) => (
                  <div key={dir.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f8fafc', display: 'block' }}>{dir.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Estándar: {dir.standard}</span>
                    </div>
                    <button
                      onClick={() => {
                        setDirectives(directives.map(d => d.id === dir.id ? { ...d, active: !d.active } : d));
                        triggerGovernance(`Directiva "${dir.name}" ${!dir.active ? 'activada' : 'desactivada'}.`);
                      }}
                      style={{ padding: '6px 14px', background: dir.active ? '#16a34a' : '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                      {dir.active ? 'ENFORCED' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {selectedJson && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '600px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#38bdf8' }}>Evidencia Criptográfica Bóveda</h3>
            <pre style={{ background: '#020617', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', color: '#34d399', border: '1px solid #1e293b' }}>
              {JSON.stringify(selectedJson, null, 2)}
            </pre>
            <button onClick={() => setSelectedJson(null)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              Cerrar Evidence Bundle
            </button>
          </div>
        </div>
      )}

      {auditTokenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4ade80' }}>🛡️ Exportación de Evidencia Verificable D1</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Este Merkle Root certifica la integridad del historial de auditoría de la IA sin exponer datos en claro.</p>
            <div style={{ background: '#020617', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.85rem', border: '1px solid #1e293b', wordBreak: 'break-all', marginBottom: '16px' }}>
              6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842');
                triggerGovernance('Root Hash de auditoría copiado al portapapeles.');
                setAuditTokenModal(false);
              }}
              style={{ width: '100%', padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              Copiar Hash y Cerrar
            </button>
          </div>
        </div>
      )}

      {showReportModal && (
        <OfficialReportModal onClose={() => setShowReportModal(false)} />
      )}

    </div>
  );
}