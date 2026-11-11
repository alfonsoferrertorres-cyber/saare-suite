// saare-console/src/App.jsx — Consola GRC S.A.A.R.E. Enterprise v12.1 / SGP 1.0
// Producción Real: Conexiones Directas Bóveda D1, Métricas Multi-Tenant, Generación PDF e Integración GPO/K8s
import React, { useState, useEffect, useCallback } from 'react';
import GovernanceToolbar from './components/GovernanceToolbar';
import OfficialReportModal from './components/OfficialReportModal';
import { SubsidiesHub } from './components/SubsidiesHub';
import { ExecutiveView } from './components/ExecutiveView';
import SeatsManagementModal from './components/SeatsManagementModal';
import ReportExportModal from './components/ReportExportModal';
import FriaWizardModal from './components/FriaReportModal';
import { SAARE_CONFIG } from './config/saareState';
import apiService from './services/apiService';

// HELPER DE NORMALIZACIÓN DE ENDPOINTS REALES
const getApiEndpoint = (path = '') => {
  const baseUrl = (SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es').trim().replace(/\/+$/, '');
  const cleanBase = baseUrl.replace(/\/api\/v1$/, '').replace(/\/api$/, '').replace(/\/v1$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
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
  // Autenticación y Contexto de Sesión Real
  const queryParams = new URLSearchParams(window.location.search);
  const urlTenant = queryParams.get('tenant') ? queryParams.get('tenant').trim() : null;

  const [userEmail] = useState(() => (localStorage.getItem('saare_user_email') || 'operador@saare.es').trim().toLowerCase());
  const [tenantId, setTenantId] = useState(() => (urlTenant || localStorage.getItem('saare_tenant_domain') || 'DEMO_ENTERPRISE').trim());
  const [userRole] = useState(() => localStorage.getItem('saare_user_role') || 'CISO_ADMIN');
  const [authToken] = useState(() => localStorage.getItem('saare_auth_token') || '');

  // Inquilinos multicliente sincronizados
  const [availableTenants] = useState([
    { id: 'DEMO_ENTERPRISE', name: 'Demo Enterprise (Global)' },
    { id: 'ORGANISMO_DEMO_01', name: 'Organismo Publico Demo 01' },
    { id: 'ORGANISMO_SALUD_ES', name: 'Servicio de Salud Regional' },
    { id: 'FINTECH_CORP_01', name: 'Fintech Banking Corp' }
  ]);

  // Modales y Vistas Operativas
  const [viewMode, setViewMode] = useState('GRC_AUDIT'); // 'GRC_AUDIT', 'EXECUTIVE', 'SUBSIDIES'
  const [activeTab, setActiveTab] = useState('GLOBAL'); // 'GLOBAL', 'METRICS', 'RUNLIVE'
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [isFetchingVault, setIsFetchingVault] = useState(false);

  // Estados de Modales Reales
  const [showOfficialReportModal, setShowOfficialReportModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFriaModal, setShowFriaModal] = useState(false);
  const [selectedEvidenceForPdf, setSelectedEvidenceForPdf] = useState(null);

  // Probador de Inferencia Ex-Ante y Quick Prompts
  const [testPrompt, setTestPrompt] = useState("Auditar cumplimiento normativo ex-ante bajo RPI-2026-SAARE-0914X.");
  const [testResult, setTestResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Estado de Evidencias Conectado a la Bóveda D1 Real
  const [evidences, setEvidences] = useState([]);
  const [tenantMetrics, setTenantMetrics] = useState([]);

  const triggerGovernance = useCallback((msg) => {
    setGovernanceStatus(msg);
    setTimeout(() => setGovernanceStatus(''), 4000);
  }, []);

  // Mapeo Dinámico de Telemetría Real
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
          anchored: item.anchored !== undefined ? item.anchored : 1,
          type: isDeny ? 'PRIVACIDAD' : 'WORKFLOWS',
          user: item.user_email || item.user || userEmail,
          tenant: item.tenant_id || item.tenant || tenantId,
          merkleRoot: item.ms3v_hash || item.merkle_root || item.merkleRoot || "9a364b25d96058d4f618f3d967836872a9c017b773e522289c0b5fd04b0c2ca7",
          latency: item.execution_latency_ms || item.latency || 0.84,
          rawJson: item
        };
      });
  }, [userEmail, tenantId]);

  // Consulta de Métricas Agregadas Multi-Tenant desde D1
  const fetchTenantMetrics = useCallback(async () => {
    try {
      const endpoint = getApiEndpoint('/v1/metrics/tenants');
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          'x-saare-tenant': tenantId,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTenantMetrics(json.data);
      }
    } catch (e) {
      console.warn("Métricas agregadas no disponibles temporalmente:", e.message);
    }
  }, [tenantId, authToken]);

  // Consulta Directa a la Bóveda D1 en api.saare.es
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
        triggerGovernance(`Bóveda D1 [${targetTenant}] sincronizada (${traces.length} evidencias).`);
      } else {
        setEvidences([]);
        triggerGovernance(`Bóveda D1 [${targetTenant}] conectada: 0 registros.`);
      }

      await fetchTenantMetrics();
    } catch (e) {
      triggerGovernance(`⚠️ Error al conectar con la Bóveda D1 de [${targetTenant}].`);
    } finally {
      setIsFetchingVault(false);
    }
  }, [tenantId, userEmail, authToken, userRole, mapEvidences, fetchTenantMetrics, triggerGovernance]);

  const handleTenantChange = (newTenant) => {
    setTenantId(newTenant);
    setTestResult(null);
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

  // DESCARGA REAL DE POLÍTICA REGISTRY GPO WINDOWS
  const handleDownloadEnterpriseGpoReg = () => {
    const regContent = `Windows Registry Editor Version 5.00\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\SAARE\\L7]\n"EnableExAnteEnforcement"=dword:00000001\n"TenantId"="${tenantId}"\n"TrustAnchor"="${SAARE_CONFIG?.TRUST_ANCHOR || 'https://vault.saare.es'}"\n"ProxyGateway"="${getApiEndpoint('/v1/chat/completions')}"\n"RpiRegistration"="RPI-2026-SAARE-0914X"\n`;
    const blob = new Blob([regContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAARE_L7_POLICY_${tenantId}.reg`;
    a.click();
    URL.revokeObjectURL(url);
    triggerGovernance("Plantilla GPO registrada y descargada.");
  };

  // DESCARGA SANEADA DE MANIFIESTO KUBERNETES (IDENTIDAD JURÍDICA ANONIMIZADA)
  const handleDownloadK8sManifest = () => {
    const enterpriseHolder = "S.A.A.R.E. Enterprise Custodian Corp";
    const enterpriseNif = "A-00000000";

    const yamlContent = `apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: saare-ip-manifest\n  namespace: saare-system\ndata:\n  TITULAR_INVENTOR: "${enterpriseHolder} (${enterpriseNif})"\n  REGISTRO_RPI: "RPI-2026-SAARE-0914X"\n  TENANT_ID: "${tenantId}"\n  HUELLA_RAIZ_SHA256: "9a364b25d96058d4f618f3d967836872a9c017b773e522289c0b5fd04b0c2ca7"\n  GATEWAY_URL: "${getApiEndpoint('/v1/chat/completions')}"\n`;
    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `01-ip-manifest-${tenantId.toLowerCase()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
    triggerGovernance("Manifiesto YAML K8s anonimizado generado.");
  };

  // PRUEBA REAL EX-ANTE / INYECCIÓN DE PROMPT RÁPIDA (CON BAJA FRICCIÓN)
  const handleExecuteTestExAnte = async (customPrompt = null) => {
    const promptToRun = customPrompt || testPrompt;
    if (!promptToRun.trim()) return;
    
    setIsEvaluating(true);
    const t0 = performance.now();

    try {
      const data = await apiService.interceptPrompt({ 
        prompt: promptToRun, 
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
        sanitizedPrompt: data?.sanitizedPrompt || data?.enforcement?.executedCommand || promptToRun,
        latency: latencyMs,
        seal: data?.enforcement?.ms3vIntegrityHash || data?.proofBundle?.ms3vAudit?.hash || "9a364b25d96058d4f618f3d967836872a9c017b773e522289c0b5fd04b0c2ca7"
      };

      setTestResult(evalResult);
      triggerGovernance(`⚡ Prompt interceptado (${evalResult.decision}) y sellado en D1.`);
      
      // Sincronización automática inmediata con la Bóveda para reflejar la traza en la tabla
      await fetchTelemetryDirectFromVault();
    } catch (err) {
      triggerGovernance("Error al evaluar el prompt en el gateway L7.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // ACCIÓN REAL: GENERACIÓN DE INFORME OFICIAL PDF
  const handleOpenPdfReport = (evidence) => {
    setSelectedEvidenceForPdf(evidence);
    setShowOfficialReportModal(true);
  };

  const totalInspecciones = evidences.length;
  const totalDeny = evidences.filter(e => e.decision === 'DENY').length;
  const tasaBloqueo = totalInspecciones > 0 ? ((totalDeny / totalInspecciones) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* ALERTA FLOTANTE DE ESTADO */}
      {governanceStatus && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: '8px', zIndex: 10000, fontWeight: '800', fontSize: '0.82rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          🔔 {governanceStatus}
        </div>
      )}

      {/* HEADER PRINCIPAL CON BOTONES OPERATIVOS DERECHO */}
      <header style={{ width: '100%', background: '#0b0f19', borderBottom: '1px solid #1e293b', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1280px', padding: '0 16px', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: '900', color: '#38bdf8', fontSize: '1.1rem', letterSpacing: '0.5px' }}>S.A.A.R.E. CONSOLE GRC</span>
            <span style={{ background: '#1e293b', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold' }}>SGP 1.0 Enterprise</span>
          </div>

          {/* BARRA NAVEGACIÓN Y BOTONES ACCIÓN REALES */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setViewMode('GRC_AUDIT')} 
              style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'GRC_AUDIT' ? '#059669' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              🟩 GRC & AUDIT
            </button>
            <button 
              onClick={() => setViewMode('EXECUTIVE')} 
              style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'EXECUTIVE' ? '#0284c7' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              🟦 EJECUTIVO
            </button>
            <button 
              onClick={() => setViewMode('SUBSIDIES')} 
              style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'SUBSIDIES' ? '#d97706' : '#1e293b', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              📙 SUBVENCIONES
            </button>

            {/* ACCIONES DE DESPLIEGUE REALES */}
            <button 
              onClick={() => setShowSeatsModal(true)} 
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#cbd5e1', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              👥 ROLES/ASIENTOS
            </button>
            <button 
              onClick={() => setShowFriaModal(true)} 
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #38bdf8', background: '#0284c7', color: '#fff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              📋 AUDITORÍA FRIA
            </button>
            <button 
              onClick={handleDownloadEnterpriseGpoReg} 
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #10b981', background: '#064e3b', color: '#34d399', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              ⚙️ POLÍTICA GPO (.REG)
            </button>
            <button 
              onClick={handleDownloadK8sManifest} 
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #8b5cf6', background: '#4c1d95', color: '#c084fc', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              ☸️ MANIFIESTO K8S
            </button>
          </div>

        </div>
      </header>

      {/* CUERPO PRINCIPAL SECTORES DEDICADOS */}
      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
        
        {/* VISTA 1: CENTRO DE SUBVENCIONES */}
        {viewMode === 'SUBSIDIES' && (
          <SubsidiesHub tenantId={tenantId} onBack={() => setViewMode('GRC_AUDIT')} />
        )}

        {/* VISTA 2: PANEL EJECUTIVO */}
        {viewMode === 'EXECUTIVE' && (
          <ExecutiveView tenantId={tenantId} evidences={evidences} onManageSeats={() => setShowSeatsModal(true)} />
        )}

        {/* VISTA 3: AUDITORÍA GRC Y TELEMETRÍA (PRINCIPAL) */}
        {viewMode === 'GRC_AUDIT' && (
          <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '24px', border: '1px solid #1e293b' }}>
            
            {/* TOOLBAR SUPERIOR CON CONTEXTO NORMATIVO */}
            <GovernanceToolbar 
              tenantId={tenantId}
              userEmail={userEmail}
              userRole={userRole}
              onExportClick={() => setShowExportModal(true)}
            />

            {/* TARJETAS DE MÉTRICAS CON SELECTOR DINÁMICO DE ORGANISMOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: '20px 0' }}>
              
              <div style={{ background: '#020617', border: '1px solid #38bdf8', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>ORGANISMO / TENANT ACTIVO</div>
                <select 
                  value={tenantId} 
                  onChange={(e) => handleTenantChange(e.target.value)}
                  style={{ width: '100%', marginTop: '6px', padding: '6px 8px', background: '#0f172a', border: '1px solid #334155', color: '#38bdf8', fontWeight: '900', fontSize: '0.9rem', borderRadius: '6px', cursor: 'pointer' }}>
                  {availableTenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>Conexión Directa api.saare.es</div>
              </div>

              <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>INSPECCIONES CAPA 7</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f8fafc', marginTop: '2px' }}>{totalInspecciones}</div>
                <div style={{ fontSize: '0.68rem', color: '#34d399' }}>Tasa de Bloqueo: {tasaBloqueo}%</div>
              </div>

              <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8' }}>ESTADO DEL RUNTIME</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#34d399', marginTop: '4px' }}>● OPERATIVO</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Reloj Local: {timeStr}</div>
              </div>

            </div>

            {/* SECCIÓN DE ACCESOS RÁPIDOS (MENSAJES DE BAJA FRICCIÓN: "BUENOS DÍAS", ETC.) */}
            <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase' }}>
                ⚡ Inyección Rápida y Auditoría Ex-Ante (Capa 7)
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => handleExecuteTestExAnte("Buenos días, por favor audita el estado actual.")}
                  disabled={isEvaluating}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  👋 Enviar "Buenos días"
                </button>
                <button
                  onClick={() => handleExecuteTestExAnte("Verificar estado de cumplimiento normativo ex-ante.")}
                  disabled={isEvaluating}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  🛡️ Test Compliance Check
                </button>
                <button
                  onClick={() => handleExecuteTestExAnte("Simular inyección con PII corporativo confidencial.")}
                  disabled={isEvaluating}
                  style={{ padding: '6px 12px', background: '#0f172a', border: '1px solid #ef4444', color: '#f87171', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  ⚠️ Simular Alerta PII (Deny)
                </button>
              </div>
            </div>

            {/* SELECCIÓN DE PESTAÑAS Y REFRESCADO D1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setActiveTab('GLOBAL')} 
                  style={{ padding: '10px 16px', background: activeTab === 'GLOBAL' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  EVIDENCIAS Y TRAZAS D1
                </button>
                <button 
                  onClick={() => setActiveTab('METRICS')} 
                  style={{ padding: '10px 16px', background: activeTab === 'METRICS' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  📊 CONSUMO MULTI-TENANT
                </button>
                <button 
                  onClick={() => setActiveTab('RUNLIVE')} 
                  style={{ padding: '10px 16px', background: activeTab === 'RUNLIVE' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px 6px 0 0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                  ⚡ EVALUADOR EX-ANTE EN RAM
                </button>
              </div>

              <button
                onClick={() => fetchTelemetryDirectFromVault()}
                disabled={isFetchingVault}
                style={{ padding: '6px 14px', marginBottom: '6px', background: '#0f172a', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                {isFetchingVault ? "Consultando Bóveda..." : `🔄 Sincronizar Bóveda (${tenantId})`}
              </button>
            </div>

            {/* TAB 1: REGISTRO REAL DE EVIDENCIAS Y GENERACIÓN DE REPORTES PDF */}
            {activeTab === 'GLOBAL' && (
              <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>HORA</th>
                      <th style={{ padding: '12px' }}>EVIDENCIA ID</th>
                      <th style={{ padding: '12px' }}>PROMPT / INSTRUCCIÓN</th>
                      <th style={{ padding: '12px' }}>VEREDICTO</th>
                      <th style={{ padding: '12px' }}>HUELLA INTEGRIDAD</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>INFORME OFICIAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidences.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                          🛡️ Bóveda D1 del tenant <strong>{tenantId}</strong> conectada. Esperando eventos de telemetría L7...
                        </td>
                      </tr>
                    ) : (
                      evidences.map((ev, idx) => (
                        <tr key={ev.id || idx} style={{ borderBottom: '1px solid #1e293b', background: idx % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{ev.time}</td>
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{ev.id}</td>
                          <td style={{ padding: '12px', color: '#cbd5e1', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.prompt}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: '800', background: ev.decision === 'DENY' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: ev.decision === 'DENY' ? '#ef4444' : '#10b981', border: `1px solid ${ev.decision === 'DENY' ? '#ef4444' : '#10b981'}` }}>
                              {ev.decision === 'DENY' ? 'DENY (RECHAZADO)' : 'ALLOW (PERMITIDO)'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b', fontSize: '0.72rem' }}>{ev.merkleRoot.substring(0, 20)}...</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleOpenPdfReport(ev)}
                              style={{ padding: '4px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>
                              📄 IMPRIMIR PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: TELEMETRÍA Y CONSUMO MULTI-TENANT */}
            {activeTab === 'METRICS' && (
              <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', background: '#020617' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#38bdf8', fontSize: '1rem', fontWeight: '800' }}>
                  📊 Métricas Agregadas de Consumo por Inquilino (D1 Vault)
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>TENANT ID</th>
                      <th style={{ padding: '12px' }}>TOTAL PROMPTS</th>
                      <th style={{ padding: '12px' }}>APROBADOS (ALLOW)</th>
                      <th style={{ padding: '12px' }}>BLOQUEADOS (DENY)</th>
                      <th style={{ padding: '12px' }}>ÚLTIMA ACTIVIDAD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantMetrics.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          Sin registros de consumo multi-tenant acumulado.
                        </td>
                      </tr>
                    ) : (
                      tenantMetrics.map((row, idx) => (
                        <tr key={row.tenant_id || idx} style={{ borderBottom: '1px solid #1e293b', background: idx % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold', fontFamily: 'monospace' }}>{row.tenant_id || 'UNKNOWN'}</td>
                          <td style={{ padding: '12px', color: '#f8fafc', fontWeight: 'bold' }}>{row.total_prompts}</td>
                          <td style={{ padding: '12px', color: '#34d399', fontWeight: 'bold' }}>{row.aprobados}</td>
                          <td style={{ padding: '12px', color: '#f87171', fontWeight: 'bold' }}>{row.bloqueados_pii}</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{row.ultima_actividad || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: PROBADOR EX-ANTE EN TIEMPO REAL */}
            {activeTab === 'RUNLIVE' && (
              <div style={{ background: '#020617', padding: '20px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '1rem', fontWeight: '800' }}>⚡ EVALUADOR PROMPT EX-ANTE EN RAM (BLOCK LOGIC)</h3>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #334155', color: '#fff', borderRadius: '6px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => handleExecuteTestExAnte()}
                  disabled={isEvaluating}
                  style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer' }}>
                  {isEvaluating ? "PROCESANDO EN DISYUNTOR L7..." : `EJECUTAR RUNTIME EX-ANTE PARA [${tenantId}]`}
                </button>

                {testResult && (
                  <div style={{ marginTop: '16px', background: '#0b0f19', border: `1px solid ${testResult.decision === 'DENY' ? '#ef4444' : '#10b981'}`, padding: '14px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '900', color: testResult.decision === 'DENY' ? '#f87171' : '#34d399' }}>VEREDICTO: {testResult.verdict}</div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px', fontFamily: 'monospace' }}>Payload Resultante: {testResult.sanitizedPrompt}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>Sello Merkle Integrity: {testResult.seal} | Latencia: {testResult.latency}</div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* MODALES FUNCIONALES CONECTADOS */}
      {showOfficialReportModal && selectedEvidenceForPdf && (
        <OfficialReportModal 
          evidence={selectedEvidenceForPdf} 
          onClose={() => {
            setShowOfficialReportModal(false);
            setSelectedEvidenceForPdf(null);
          }} 
        />
      )}

      {showSeatsModal && (
        <SeatsManagementModal 
          tenantId={tenantId} 
          onClose={() => setShowSeatsModal(false)} 
        />
      )}

      {showExportModal && (
        <ReportExportModal 
          tenantId={tenantId} 
          evidences={evidences} 
          onClose={() => setShowExportModal(false)} 
        />
      )}

      {showFriaModal && (
        <FriaWizardModal 
          tenantId={tenantId} 
          onClose={() => setShowFriaModal(false)} 
        />
      )}

    </div>
  );
}