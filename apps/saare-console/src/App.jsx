// saare-console/src/App.jsx — Consola GRC S.A.A.R.E. v12.1 / SGP 1.0 (Despliegue Multicliente Enterprise & Conexión Bóveda D1)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GovernanceToolbar from './components/GovernanceToolbar';
import OfficialReportModal from './components/OfficialReportModal';
import { SubsidiesHub } from './components/SubsidiesHub';
import { ExecutiveView } from './components/ExecutiveView';
import SeatsManagementModal from './components/SeatsManagementModal';
import ReportExportModal from './components/ReportExportModal';
import FriaWizardModal from './components/FriaReportModal';
import { SAARE_CONFIG } from './config/saareState';
import { generatePdfFromElement } from './services/pdfGeneratorService';
import apiService from './services/apiService';
import cabeceraImg from './assets/cabecera.png';

// HELPER DE NORMALIZACIÓN DE ENDPOINTS
const getApiEndpoint = (path = '') => {
  const baseUrl = (SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es').trim().replace(/\/+$/, '');
  const cleanBase = baseUrl.replace(/\/api\/v1$/, '').replace(/\/api$/, '').replace(/\/v1$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// TAXONOMÍA CANÓNICA SGP 1.0
const SAARE_SEMANTIC_COMMANDS = {
  MODULE_5_BOOTSTRAP: SAARE_CONFIG?.MODULE_5?.BOOTSTRAP_COMMAND || "Iniciar_cumplimiento_exante_saare --route-vault=D1",
  WITNESS_TAG: SAARE_CONFIG?.MODULE_5?.WITNESS_TAG || "[MS3V-COMPLIANCE-L7-OK]",
  CMD_DASHBOARD: "S.A.A.R.E._Comando_Deploy_Dashboard_GRC",
  MODE_FORENSIC: "SAARE-MD-FOR",
  MODE_CORPORATE: "SAARE-MD-CORP",
  MODE_SECURITY: "SAARE-MD-SECU",
  MODE_VERDICT: "SAARE-MD-VERD",
  MODE_LEGAL: "SAARE-MD-LEGAL",
  MODE_IP: "SAARE-MD-IPRES",
  MODE_CUSTODY: "SAARE-MD-CUST",
  MODE_COMPLIANCE: "SAARE-MD-COMPLIANCE",
  MODE_FRIA: "SAARE-MD-FRIA"
};

const ROLE_RANKS = {
  "OPERATIONAL_AGENT_USER": 0,
  "BOARD_EXECUTIVE_LEVEL_1": 1,
  "DPO_GRC_LEVEL_2": 2,
  "CISO_SECOPS_LEVEL_3": 3,
  "CISO_ADMIN": 4
};

function hasRequiredRank(role, minRank) {
  const rank = ROLE_RANKS[role] !== undefined ? ROLE_RANKS[role] : 0;
  return rank >= minRank;
}

export default function App() {
  // Autenticado por defecto para simplificar el flujo inicial en despliegues
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(true);

  const queryParams = new URLSearchParams(window.location.search);
  const urlTenant = queryParams.get('tenant') ? queryParams.get('tenant').trim() : null;

  const [userEmail, setUserEmail] = useState(() => (localStorage.getItem('saare_user_email') || 'operador@saare.es').trim().toLowerCase());
  const [userPassword, setUserPassword] = useState('demo1234');
  
  // Estado Dinámico de Inquilino/Tenant Multicliente
  const [tenantId, setTenantId] = useState(() => (urlTenant || localStorage.getItem('saare_tenant_domain') || 'DEMO_ENTERPRISE').trim());
  const [userRole, setUserRole] = useState(() => localStorage.getItem('saare_user_role') || 'CISO_ADMIN');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('saare_auth_token') || '');

  // Lista de Inquilinos Disponibles para el Selector Multicliente
  const [availableTenants] = useState([
    { id: 'DEMO_ENTERPRISE', name: 'Demo Enterprise (Global)' },
    { id: 'ORGANISMO_DEMO_01', name: 'Organismo Demo 01' },
    { id: 'ORGANISMO_SALUD_ES', name: 'Servicio de Salud Regional' },
    { id: 'FINTECH_CORP_01', name: 'Fintech Banking Corp' }
  ]);

  const [viewMode, setViewMode] = useState('GRC_AUDIT');
  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [selectedJson, setSelectedJson] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [filter, setFilter] = useState('TODOS');
  const [vaultSource, setVaultSource] = useState('D1_DIRECT');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [isFetchingVault, setIsFetchingVault] = useState(false);

  const [auditTokenModal, setAuditTokenModal] = useState(false);
  const [showFriaModal, setShowFriaModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [selectedEvidenceForPdf, setSelectedEvidenceForPdf] = useState(null);
  const [customFilters, setCustomFilters] = useState([]);
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  
  const [testPrompt, setTestPrompt] = useState("Auditar cumplimiento normativo del titular.");
  const [testResult, setTestResult] = useState(null);
  const [auditedEvidenceId, setAuditedEvidenceId] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [showDeployDropdown, setShowDeployDropdown] = useState(false);
  const [directives, setDirectives] = useState([
    { id: 1, name: 'ISO/IEC 42001 - Sistema de Gestión de IA', active: true, standard: 'ISO/IEC 42001:2023', category: 'GOBERNANZA' },
    { id: 2, name: 'DORA - Resiliencia Operativa Digital', active: true, standard: 'EU Regulation 2022/2554', category: 'FINANCIERO' },
    { id: 3, name: 'EU AI Act - Prevención de Fugas PII', active: true, standard: 'Articles 10 & 15', category: 'PRIVACIDAD' },
    { id: 4, name: 'L7 Hook - Intercepción Ex-Ante en RAM', active: true, standard: 'Runtime Guardrail v1.0', category: 'CIBERSEGURIDAD' }
  ]);

  // Lista de evidencias sin datos de prueba precargados
  const [evidences, setEvidences] = useState([]);

  const triggerGovernance = useCallback((msg) => {
    setGovernanceStatus(msg);
    setTimeout(() => setGovernanceStatus(''), 4000);
  }, []);

  const mapEvidences = useCallback((remoteEvidences) => {
    const rawList = Array.isArray(remoteEvidences) ? remoteEvidences : (remoteEvidences?.evidences || [remoteEvidences]);
    if (!Array.isArray(rawList)) return [];

    return rawList
      .filter(item => item && typeof item === 'object')
      .map((item, idx) => {
        const isDeny = item.final_decision === 'DENY' || item.decision === 'DENY' || item.verdict === 'RECHAZADO';
        const promptVal = item.prompt || item.rawPrompt || item.input || '';
        return {
          id: item.trace_id || item.id || `EV-L7-${1000 + idx}`,
          time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          rawTimestamp: item.timestamp || new Date().toISOString(),
          cat: item.cat || (isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME'),
          sub: item.sub || 'ISO/IEC 42001 / EU AI Act',
          prompt: String(promptVal || '(Sin prompt)'),
          responseOutput: String(item.responseOutput || item.response || (isDeny ? '[BLOQUEADO EX-ANTE]' : '')),
          verdict: item.verdict || (isDeny ? 'RECHAZADO' : 'PERMITIDO'),
          decision: isDeny ? 'DENY' : 'ALLOW',
          anchored: 1,
          type: isDeny ? 'PRIVACIDAD' : 'WORKFLOWS',
          user: item.user || userEmail,
          tenant: item.tenant || tenantId,
          merkleRoot: item.merkle_root || item.merkleRoot || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991678526855",
          latency: item.latency || 0.84,
          rawJson: item
        };
      });
  }, [userEmail, tenantId]);

  // Conexión y consulta directa a la Bóveda D1 del cliente (con cabeceras multicliente)
  const fetchTelemetryDirectFromVault = useCallback(async (overrideTenant = null) => {
    const targetTenant = overrideTenant || tenantId;
    setIsFetchingVault(true);
    try {
      const traces = await apiService.getTelemetryTraces({ 
        tenant: targetTenant, 
        user: userEmail,
        token: authToken,
        role: userRole
      });

      if (traces && Array.isArray(traces)) {
        setEvidences(mapEvidences(traces));
        triggerGovernance(`Bóveda D1 [${targetTenant}] consultada (${traces.length} registros).`);
      } else {
        setEvidences([]);
        triggerGovernance(`Bóveda D1 [${targetTenant}] consultada: 0 registros.`);
      }
    } catch (e) {
      triggerGovernance(`⚠️ Error al conectar con la Bóveda D1 de [${targetTenant}].`);
    } finally {
      setIsFetchingVault(false);
    }
  }, [tenantId, userEmail, authToken, userRole, mapEvidences, triggerGovernance]);

  // Manejador del cambio de Inquilino/Tenant Multicliente
  const handleTenantChange = (newTenant) => {
    setTenantId(newTenant);
    localStorage.setItem('saare_tenant_domain', newTenant);
    fetchTelemetryDirectFromVault(newTenant);
  };

  useEffect(() => {
    const updateClock = () => setTimeStr(new Date().toTimeString().split(' ')[0]);
    updateClock();
    const intervalClock = setInterval(updateClock, 1000);
    fetchTelemetryDirectFromVault();

    return () => clearInterval(intervalClock);
  }, [fetchTelemetryDirectFromVault]);

  const handleDownloadEnterpriseGpoReg = () => {
    setShowDeployDropdown(false);
    const regContent = `Windows Registry Editor Version 5.00\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\SAARE\\L7]\n"EnableExAnteEnforcement"=dword:00000001\n"TenantId"="${tenantId}"\n"TrustAnchor"="${SAARE_CONFIG?.TRUST_ANCHOR || 'https://vault.saare.es'}"\n"ProxyGateway"="${getApiEndpoint('/v1/chat/completions')}"\n`;
    const blob = new Blob([regContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAARE_L7_${tenantId}.reg`;
    a.click();
    URL.revokeObjectURL(url);
    triggerGovernance("Plantilla GPO Registrada.");
  };

  const handleExecuteTestExAnte = async () => {
    if (!testPrompt.trim()) return;
    setIsEvaluating(true);
    const t0 = performance.now();

    try {
      const data = await apiService.interceptPrompt({ 
        prompt: testPrompt, 
        user: userEmail, 
        tenant: tenantId,
        token: authToken,
        role: userRole
      });
      const latencyMs = (performance.now() - t0).toFixed(2) + " ms";
      const isDeny = data?.decision === 'DENY' || data?.verdict === 'FAIL_CLOSED_BLOCKED';

      const evalResult = {
        verdict: isDeny ? "RECHAZADO / SANITIZADO EN RAM" : "PERMITIDO CONFORME",
        decision: isDeny ? "DENY" : "ALLOW",
        sanitizedPrompt: data?.sanitizedPrompt || testPrompt,
        latency: latencyMs,
        seal: data?.merkleRoot || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991678526855"
      };

      setTestResult(evalResult);
      triggerGovernance(`Inspección Ex-Ante completada (${evalResult.decision})`);
      fetchTelemetryDirectFromVault();
    } catch (err) {
      triggerGovernance("Error al evaluar prompt ex-ante.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const totalInspecciones = evidences.length;
  const totalDeny = evidences.filter(e => e.decision === 'DENY').length;
  const tasaBloqueo = totalInspecciones > 0 ? ((totalDeny / totalInspecciones) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {governanceStatus && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#059669', color: '#fff', padding: '10px 18px', borderRadius: '8px', zIndex: 10000, fontWeight: '800', fontSize: '0.8rem' }}>
          🔔 {governanceStatus}
        </div>
      )}

      {/* HEADER PRINCIPAL CON SELECTOR MULTICLIENTE */}
      <header style={{ width: '100%', background: '#0b0f19', borderBottom: '1px solid #1e293b', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1280px', padding: '0 16px', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '900', color: '#38bdf8', fontSize: '1rem', letterSpacing: '0.5px' }}>S.A.A.R.E. CONSOLE GRC</span>
            <span style={{ background: '#1e293b', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>SGP 1.0 Enterprise</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setViewMode('GRC_AUDIT')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'GRC_AUDIT' ? '#059669' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              🟩 GRC & AUDIT
            </button>
            <button onClick={() => setViewMode('EXECUTIVE')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'EXECUTIVE' ? '#0284c7' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              🟦 EXECUTIVE
            </button>
            <button onClick={handleDownloadEnterpriseGpoReg} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #10b981', background: '#064e3b', color: '#34d399', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              ⚙️ DESCARGAR GPO (.REG)
            </button>
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
        <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '24px', border: '1px solid #1e293b' }}>
          
          {/* MÉTRICAS SUPERIORES CON SELECTOR MULTICLIENTE INTERACTIVO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#020617', border: '1px solid #38bdf8', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>TENANT / ORGANISMO ACTIVO</div>
              <select 
                value={tenantId} 
                onChange={(e) => handleTenantChange(e.target.value)}
                style={{ width: '100%', marginTop: '6px', padding: '6px 8px', background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', fontWeight: '900', fontSize: '0.95rem', borderRadius: '6px', cursor: 'pointer' }}>
                {availableTenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                ))}
              </select>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>Conexión Directa Bóveda D1</div>
            </div>

            <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>INSPECCIONES CAPA 7</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f8fafc', marginTop: '2px' }}>{totalInspecciones}</div>
              <div style={{ fontSize: '0.68rem', color: '#34d399' }}>Tasa de Bloqueo: {tasaBloqueo}%</div>
            </div>

            <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>ESTADO DEL RUNTIME</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#34d399', marginTop: '4px' }}>● ACTIVO</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Hora Local: {timeStr}</div>
            </div>
          </div>

          {/* NAVEGACIÓN Y ACCIÓN DE CONEXIÓN A BÓVEDA D1 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setActiveTab('GLOBAL')} style={{ padding: '10px 16px', background: activeTab === 'GLOBAL' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                REGISTRO DE EVIDENCIAS REALES
              </button>
              <button onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '10px 16px', background: activeTab === 'RUNLIVE' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                ⚡ PROBADOR EN RAM
              </button>
            </div>

            {/* BOTÓN DE SINCRONIZACIÓN DIRECTA BÓVEDA D1 */}
            <button
              onClick={() => fetchTelemetryDirectFromVault()}
              disabled={isFetchingVault}
              style={{ padding: '6px 14px', marginBottom: '6px', background: '#0f172a', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
              {isFetchingVault ? "Consultando Bóveda..." : `🔄 Sincronizar Bóveda D1 (${tenantId})`}
            </button>
          </div>

          {/* TAB 1: REGISTRO DE EVIDENCIAS */}
          {activeTab === 'GLOBAL' && (
            <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '12px' }}>HORA</th>
                    <th style={{ padding: '12px' }}>EVIDENCIA ID</th>
                    <th style={{ padding: '12px' }}>PROMPT / PAYLOAD</th>
                    <th style={{ padding: '12px' }}>VEREDICTO</th>
                    <th style={{ padding: '12px' }}>MERKLE ROOT HASH</th>
                  </tr>
                </thead>
                <tbody>
                  {evidences.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        🛡️ Bóveda D1 del tenant <strong>{tenantId}</strong> conectada. Esperando eventos de telemetría L7 en tiempo real...
                      </td>
                    </tr>
                  ) : (
                    evidences.map((ev, idx) => (
                      <tr key={ev.id || idx} style={{ borderBottom: '1px solid #1e293b', background: idx % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                        <td style={{ padding: '12px', color: '#94a3b8' }}>{ev.time}</td>
                        <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{ev.id}</td>
                        <td style={{ padding: '12px', color: '#cbd5e1', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.prompt}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: '800', background: ev.decision === 'DENY' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: ev.decision === 'DENY' ? '#ef4444' : '#10b981', border: `1px solid ${ev.decision === 'DENY' ? '#ef4444' : '#10b981'}` }}>
                            {ev.decision === 'DENY' ? 'DENY (RECHAZADO)' : 'ALLOW (PERMITIDO)'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b', fontSize: '0.72rem' }}>{ev.merkleRoot.substring(0, 24)}...</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: PRUEBAS EN VIVO */}
          {activeTab === 'RUNLIVE' && (
            <div style={{ background: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '1rem', fontWeight: '800' }}>⚡ EVALUADOR PROMPT EX-ANTE EN RAM</h3>
              <textarea
                rows={3}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
              <button
                onClick={handleExecuteTestExAnte}
                disabled={isEvaluating}
                style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer' }}>
                {isEvaluating ? "PROCESANDO..." : `EJECUTAR RUNTIME EX-ANTE PARA [${tenantId}]`}
              </button>

              {testResult && (
                <div style={{ marginTop: '16px', background: '#0b0f19', border: `1px solid ${testResult.decision === 'DENY' ? '#ef4444' : '#10b981'}`, padding: '14px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '900', color: testResult.decision === 'DENY' ? '#f87171' : '#34d399' }}>VEREDICTO: {testResult.verdict}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px', fontFamily: 'monospace' }}>Payload Resultante: {testResult.sanitizedPrompt}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>Sello Merkle: {testResult.seal} | Latencia: {testResult.latency}</div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}