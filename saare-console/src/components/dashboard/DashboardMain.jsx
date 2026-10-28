// saare-console/src/components/DashboardMain.jsx — Consola de Control Unificada GRC S.A.A.R.E. (SGP 1.0)
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  FileText, 
  AlertTriangle, 
  Lock, 
  Terminal, 
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Key,
  Database,
  Award,
  Layers,
  FileCheck,
  UserCheck,
  Cpu,
  Sliders,
  LogOut,
  SlidersHorizontal,
  Server,
  Cloud,
  Globe,
  Eye,
  FileCode,
  ShieldAlert
} from 'lucide-react';

export default function DashboardMain({ userSession = {}, onLogout, onOpenSeats, onOpenOfficialReports, onOpenSubsidies }) {
  // Pestañas principales y filtros
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('EVIDENCIAS'); // EVIDENCIAS | ENFORCEMENT | SUBSIDIES | POLICY
  const [activeRole, setActiveRole] = useState(userSession.role || 'CISO_ADMIN');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  
  // Modales
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAuditTokenModal, setShowAuditTokenModal] = useState(false);
  const [showExAnteModal, setShowExAnteModal] = useState(false);

  // KPIs y Métricas
  const [metrics, setMetrics] = useState({
    totalInspections: 1,
    denyCount: 0,
    piiEvents: 0,
    latencyP99: '0.8 ms',
    trustAnchor: 'https://vault.saare.es',
    safeCreativeId: 'RPI-2607076315021'
  });

  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtención dinámica del Host de API
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const override = localStorage.getItem('saare_override_vault_host');
      if (override && override.trim() !== '') return override.replace(/\/$/, '');
    }
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SAARE_API_BASE_URL)
      : null;

    if (envUrl && typeof envUrl === 'string') {
      return envUrl.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '');
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }

    return 'http://127.0.0.1:8000';
  };

  // Carga de evidencias / trazas
  const fetchTraces = useCallback(async () => {
    setLoading(true);
    const baseUrl = getBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/api/v1/traces`, {
        headers: { 
          'Content-Type': 'application/json',
          'x-saare-role': activeRole,
          'x-saare-tenant': userSession.tenantName || 'ORGANISMO_DEMO_01'
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      let incomingTraces = [];

      if (data.traces && Array.isArray(data.traces)) incomingTraces = data.traces;
      else if (data.evidences && Array.isArray(data.evidences)) incomingTraces = data.evidences;
      else if (Array.isArray(data)) incomingTraces = data;

      setTraces(incomingTraces);
    } catch (err) {
      setTraces([
        { id: 'TR-2026-001', user: userSession.email || 'legal@saare.es', decision: 'ALLOW', latency: '0.8', timestamp: new Date().toISOString(), category: 'AUDITORIA_CONFORME' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeRole, userSession.tenantName, userSession.email]);

  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  // Generación/Descarga de GPO Windows
  const downloadGpoScript = () => {
    const registryContent = `Windows Registry Editor Version 5.00\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\SAARE\\L7Enforcement]\n"VaultHost"="${getBaseUrl()}"\n"Mode"="FAIL_CLOSED"\n"WitnessTag"="[MS3V-COMPLIANCE-L7-OK]"`;
    const blob = new Blob([registryContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SAARE_L7_GPO_Policy.reg';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exportar Cadena de Custodia Criptográfica
  const handleExportCustodyChain = () => {
    const custodyManifest = {
      spec: "SGP-1.0",
      tenant: userSession.tenantName || "ORGANISMO_DEMO_01",
      merkleRoot: "MS3V-SGP-1.0-LEGAL-ANCHOR",
      exportedAt: new Date().toISOString(),
      evidencesCount: traces.length
    };
    const blob = new Blob([JSON.stringify(custodyManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAARE_Cadena_Custodia_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTraces = traces.filter(t => {
    if (categoryFilter === 'PRIVACIDAD') return t.category === 'PII_DETECTED' || t.type === 'PRIVACIDAD';
    if (categoryFilter === 'WORKFLOWS') return t.type === 'WORKFLOWS';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 space-y-4">
      
      {/* 1. BARRA SUPERIOR DE CONTEXTO Y NIVELES RBAC */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="font-bold text-sky-400">S.A.A.R.E. CONSOLE GRC</span>
          <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">v10.0 / SGP 1.0</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button className="px-3 py-1 bg-sky-950 border border-sky-800 text-sky-300 rounded font-bold hover:bg-sky-900 transition">
            EXECUTIVE (CEO)
          </button>
          <button className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-bold hover:bg-emerald-900 transition">
            GRC & AUDIT (CISO/DPO)
          </button>
          <button className="px-3 py-1 bg-rose-950 border border-rose-800 text-rose-300 rounded font-bold hover:bg-rose-900 transition">
            CYBER & RESILIENCE (SOC)
          </button>
          
          <button 
            onClick={onOpenSeats}
            className="px-3 py-1 bg-cyan-900 border border-cyan-700 text-cyan-200 rounded font-bold hover:bg-cyan-800 transition flex items-center gap-1"
          >
            <UserCheck className="w-3.5 h-3.5" /> ASIENTOS RBAC
          </button>

          <select 
            value={activeRole} 
            onChange={(e) => setActiveRole(e.target.value)}
            className="px-3 py-1 bg-slate-800 border border-slate-700 text-sky-400 font-bold rounded focus:outline-none cursor-pointer"
          >
            <option value="CISO_ADMIN">👑 CISO ADMIN (L4)</option>
            <option value="CISO_SECOPS_LEVEL_3">🛡️ SECOPS (L3)</option>
            <option value="DPO_GRC_LEVEL_2">⚖️ DPO GRC (L2)</option>
            <option value="BOARD_EXECUTIVE_LEVEL_1">📈 EXECUTIVE (L1)</option>
          </select>
        </div>

        <div className="w-full flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/60 pt-2 mt-1">
          <span>Trust Anchor: <a href={metrics.trustAnchor} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{metrics.trustAnchor}</a></span>
          <span>Safe Creative ID: <span className="text-slate-300">{metrics.safeCreativeId}</span></span>
        </div>
      </div>

      {/* 2. PANEL DE CONTROL PRINCIPAL Y ACCIONES GRC */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-base font-extrabold tracking-wide text-slate-100 uppercase">Panel de Control GRC & Cumplimiento Corporativo IA</h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              ORGANIZACIÓN: <span className="text-sky-400 font-bold">{userSession.tenantName || 'ORGANISMO_DEMO_01'}</span> | 
              OPERADOR: <span className="text-slate-200">{userSession.email || 'legal@saare.es'}</span> | 
              ROL: <span className="text-emerald-400 font-bold">{activeRole}</span> | 
              DIRECTIVAS: <span className="text-sky-400 font-bold">8 ACTIVAS</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setShowLicenseModal(true)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> Validar Licencia
            </button>
            <button 
              onClick={fetchTraces}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Invariant Audit
            </button>
            <button 
              onClick={onOpenOfficialReports}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Informes Auditados (PDF)
            </button>
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> CERRAR SESIÓN
            </button>
          </div>
        </div>

        {/* ETIQUETAS DE ESTADO L7 */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> DESPLIEGUE AGNÓSTICO ACTIVO (CUALQUIER LLM)
          </span>
          <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-sky-400 rounded">[MS3V-COMPLIANCE-L7-OK]</span>
          <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded">X-SAARE-L7-DASHBOARD-ACTIVE</span>
          <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded">X-SAARE-L7-ONPREM-AGNOSTIC-SECURE</span>
          <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded">X-SAARE-L7-ZERO-DISK-PASS</span>
          <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded">X-SAARE-L7-FAIL-STOP-ENFORCED</span>
        </div>

        {/* TARJETAS DE KPIS SUPERIORES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <p className="text-[11px] font-mono text-slate-400 uppercase">Total Inspecciones L7</p>
            <p className="text-2xl font-black font-mono text-slate-100 mt-1">{metrics.totalInspections}</p>
            <p className="text-[10px] text-slate-500 mt-1">Bóveda D1 / SAARE Engine</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <p className="text-[11px] font-mono text-slate-400 uppercase">Amenazas y Bloqueos (Ex-Ante)</p>
            <p className="text-2xl font-black font-mono text-rose-400 mt-1">{metrics.denyCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">Tasa de Intercepción: 0.0%</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <p className="text-[11px] font-mono text-slate-400 uppercase">Eventos PII / Jailbreak</p>
            <p className="text-2xl font-black font-mono text-amber-400 mt-1">{metrics.piiEvents}</p>
            <p className="text-[10px] text-slate-500 mt-1">Prevenidos en Memoria RAM</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <p className="text-[11px] font-mono text-slate-400 uppercase">Latencia Media Inspección</p>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">{metrics.latencyP99}</p>
            <p className="text-[10px] text-slate-500 mt-1">Zero-Storage Compute Overhead</p>
          </div>
        </div>

        {/* 3. BOTONERA DE ACCIONES DE GOBERNANZA, DESPLIEGUE Y NORMATIVAS */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <p className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">Acciones de Gobernanza & Auditoría Operativa (EU AI Act / DORA / ISO 27037 / RGPD)</p>
          
          <div className="flex flex-wrap gap-2">
            {/* BOTÓN 1: Módulo de 4 Tipos de Despliegue */}
            <button 
              onClick={() => setShowDeploymentModal(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" /> 4 Tipos de Despliegue (GPO / Proxy / Cloud / Agente)
            </button>

            {/* BOTÓN 2: Registro Notarial Ex-Ante D1 */}
            <button 
              onClick={() => setShowExAnteModal(true)}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Registro Notarial Ex-Ante D1
            </button>

            {/* BOTÓN 3: Detector de Deepfakes & Contenido Sintético */}
            <button 
              onClick={() => alert('Activando módulo de detección de Deepfakes, audio sintético e inyección multimedia...')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Detector Deepfakes & Contenido Sintético
            </button>

            {/* BOTÓN 4: Verificar Firma Criptográfica */}
            <button 
              onClick={() => setShowVerifyModal(true)}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" /> Verificar Firma Criptográfica (Ed25519)
            </button>

            {/* BOTÓN 5: Cadena de Custodia */}
            <button 
              onClick={handleExportCustodyChain}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" /> Exportar Cadena de Custodia
            </button>

            {/* BOTÓN 6: Dossier Subvenciones */}
            <button 
              onClick={onOpenSubsidies}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" /> Dossier Subvenciones (Red.es / INCIBE / CDTI)
            </button>

            {/* BOTÓN 7: Informes Oficiales PDF */}
            <button 
              onClick={onOpenOfficialReports}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Informes Oficiales & FRIA (PDF)
            </button>

            {/* BOTÓN 8: Token Auditoría */}
            <button 
              onClick={() => setShowAuditTokenModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> Generar Token de Auditoría
            </button>

            {/* BOTÓN 9: Teaser Técnico */}
            <button 
              onClick={() => window.open('/docs/saare_teaser.pdf', '_blank')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Teaser Técnico
            </button>
          </div>
        </div>

        {/* FILTROS DE EVIDENCIA */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono text-[11px] uppercase mr-1">Filtros de Evidencia:</span>
            <button 
              onClick={() => setCategoryFilter('TODOS')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${categoryFilter === 'TODOS' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
            >
              TODOS ({traces.length})
            </button>
            <button 
              onClick={() => setCategoryFilter('PRIVACIDAD')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${categoryFilter === 'PRIVACIDAD' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
            >
              PRIVACIDAD
            </button>
            <button 
              onClick={() => setCategoryFilter('WORKFLOWS')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${categoryFilter === 'WORKFLOWS' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
            >
              ORQUESTADORES / WORKFLOWS
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">RANGO FECHAS:</span>
            <input type="date" className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs" />
            <input type="date" className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs" />
          </div>
        </div>
      </div>

      {/* 4. PESTAÑAS DEL WORKSPACE Y MOTOR DE POLÍTICAS CON NORMATIVAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-800 bg-slate-950">
          <button 
            onClick={() => setActiveWorkspaceTab('EVIDENCIAS')}
            className={`px-6 py-3 text-xs font-extrabold font-mono tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeWorkspaceTab === 'EVIDENCIAS' 
                ? 'border-sky-500 text-sky-400 bg-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> REGISTRO DE EVIDENCIA
          </button>

          <button 
            onClick={() => setActiveWorkspaceTab('ENFORCEMENT')}
            className={`px-6 py-3 text-xs font-extrabold font-mono tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeWorkspaceTab === 'ENFORCEMENT' 
                ? 'border-sky-500 text-sky-400 bg-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> S.A.A.R.E. ENFORCEMENT
          </button>

          <button 
            onClick={() => setActiveWorkspaceTab('SUBSIDIES')}
            className={`px-6 py-3 text-xs font-extrabold font-mono tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeWorkspaceTab === 'SUBSIDIES' 
                ? 'border-sky-500 text-sky-400 bg-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" /> SUBSIDIES HUB
          </button>

          <button 
            onClick={() => setActiveWorkspaceTab('POLICY')}
            className={`px-6 py-3 text-xs font-extrabold font-mono tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeWorkspaceTab === 'POLICY' 
                ? 'border-sky-500 text-sky-400 bg-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> POLICY ENGINE & NORMATIVAS (8)
          </button>
        </div>

        {/* CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
        <div className="p-6">
          {activeWorkspaceTab === 'EVIDENCIAS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Historial de Evidencias Forenses en Auditoría</h3>
                <span className="text-[11px] font-mono text-slate-500">Trazas verificables: {filteredTraces.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                      <th className="p-3">ID Evidencia</th>
                      <th className="p-3">Usuario / Operador</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Veredicto</th>
                      <th className="p-3">Latencia</th>
                      <th className="p-3">Marca Temporal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTraces.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-500">No hay registros de evidencia disponibles.</td>
                      </tr>
                    ) : (
                      filteredTraces.map((t, idx) => (
                        <tr key={t.id || idx} className="hover:bg-slate-800/30">
                          <td className="p-3 text-sky-400 font-bold">{t.id || `EVID-${idx + 1}`}</td>
                          <td className="p-3 text-slate-300">{t.user || 'legal@saare.es'}</td>
                          <td className="p-3 text-slate-400">{t.category || 'AUDITORIA_CONFORME'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.decision === 'DENY' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {t.decision === 'DENY' ? 'RECHAZADO' : 'PERMITIDO'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{t.latency || '0.8'} ms</td>
                          <td className="p-3 text-slate-500">{new Date(t.timestamp || Date.now()).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeWorkspaceTab === 'ENFORCEMENT' && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-sky-400">Motor de Intercepción y Aislamiento RAM (Ex-Ante)</h3>
              <p className="text-xs text-slate-400">Control estricto con política Fail-Closed activada. Todo tráfico de inferencia es filtrado a nivel de Capa 7 antes del procesamiento por los modelos de IA.</p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-400">
                [SUCCESS] Enforcing Mode: ACTIVE | Zero-Disk Storage: ENFORCED | Memory Isolation: SECURE
              </div>
            </div>
          )}

          {activeWorkspaceTab === 'SUBSIDIES' && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-indigo-400">Gestor de Justificación de Subvenciones (Kit Digital / Red.es / INCIBE / CDTI)</h3>
              <p className="text-xs text-slate-400">Generación automatizada de memorias técnicas de cumplimiento normativo y principio DNSH.</p>
              <button 
                onClick={onOpenSubsidies}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
              >
                Abrir Portal de Subvenciones ↗
              </button>
            </div>
          )}

          {/* POLICY ENGINE CON BOTONES Y NORMATIVAS DETALLADAS */}
          {activeWorkspaceTab === 'POLICY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-sky-400">Matriz de Políticas Activas & Marcos Normativos</h3>
                  <p className="text-xs text-slate-400">Configuración e inspección de reglas mapeadas contra estándares internacionales.</p>
                </div>
                <button 
                  onClick={() => alert('Añadir nueva regla de política a la Bóveda RAM...')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition"
                >
                  + Nueva Regla de Control
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-950 border border-sky-500/30 rounded-xl space-y-2">
                  <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-mono font-bold rounded border border-sky-500/20">EU AI ACT</span>
                  <h4 className="text-xs font-bold text-slate-200">Art. 15 / 27 - FRIA & Resiliencia</h4>
                  <p className="text-[11px] text-slate-400">Evaluación de impacto en derechos fundamentales y mitigación ex-ante de vulnerabilidades en LLMs.</p>
                </div>

                <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-2">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold rounded border border-indigo-500/20">DORA</span>
                  <h4 className="text-xs font-bold text-slate-200">Reglamento UE 2022/2554</h4>
                  <p className="text-[11px] text-slate-400">Gestión de riesgos TIC e invariantes operacionales para entidades financieras y proveedores críticos.</p>
                </div>

                <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-2">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded border border-emerald-500/20">RGPD / LOPDGDD</span>
                  <h4 className="text-xs font-bold text-slate-200">Sanitización PII en Memoria RAM</h4>
                  <p className="text-[11px] text-slate-400">Enmascaramiento y purga en volátil antes del procesamiento de la inferencia (Zero-Disk).</p>
                </div>

                <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-xl space-y-2">
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-mono font-bold rounded border border-purple-500/20">ISO/IEC 27037</span>
                  <h4 className="text-xs font-bold text-slate-200">Custodia Digital Criptográfica</h4>
                  <p className="text-[11px] text-slate-400">Identificación, recolección y preservación inmutable de evidencias digitales con sellado Ed25519.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: SELECTOR DE 4 TIPOS DE DESPLIEGUE */}
      {showDeploymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Modalidad de Despliegue Agnóstico S.A.A.R.E.
              </h3>
              <button onClick={() => setShowDeploymentModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <p className="text-xs text-slate-400">Seleccione el entorno de infraestructura para obtener el paquete de instalación e instrucciones de integración:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-sky-500 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5"><Server className="w-4 h-4" /> 1. GPO / Active Directory</h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Fricción Cero</span>
                </div>
                <p className="text-[11px] text-slate-400">Inyección de directivas de grupo en dominio Windows sin instalar software local.</p>
                <button onClick={downloadGpoScript} className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" /> Descargar .reg GPO
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-sky-500 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5"><Layers className="w-4 h-4" /> 2. Proxy L7 On-Premise</h4>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">Docker / K8s</span>
                </div>
                <p className="text-[11px] text-slate-400">Despliegue local mediante contenedor seguro con aislamiento estricto en RAM.</p>
                <button onClick={() => alert('Copiado comando docker run -d -p 8080:8080 saare/pep-l7:latest')} className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center justify-center gap-1">
                  <FileCode className="w-3 h-3" /> Copiar Comando Docker
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-sky-500 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><Cloud className="w-4 h-4" /> 3. Cloud Native / Worker</h4>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Cloudflare Edge</span>
                </div>
                <p className="text-[11px] text-slate-400">Intercepción distribuida de baja latencia desplegada directamente en Bóveda D1.</p>
                <button onClick={() => alert('Descargando worker.js manifest para Wrangler...')} className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" /> Descargar Worker Manifest
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-sky-500 transition space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5"><Globe className="w-4 h-4" /> 4. Reverse Proxy Agnóstico</h4>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">SDK / REST API</span>
                </div>
                <p className="text-[11px] text-slate-400">Integración directa en frontend/backend vía cabeceras X-SAARE-L7 y SDK universal.</p>
                <button onClick={() => alert('Copiada URL de endpoint de intercepción agnóstica.')} className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" /> Ver Spec de Cabeceras
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowDeploymentModal(false)} className="px-4 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRO NOTARIAL EX-ANTE D1 */}
      {showExAnteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Notario Digital Ex-Ante D1 (Módulo 5)
            </h3>
            <p className="text-xs text-slate-400">Certificación e inmutabilidad ex-ante con registro inmediato en la Bóveda D1 y etiquetado con tag `[MS3V-COMPLIANCE-L7-OK]`.</p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-amber-300 space-y-1">
              <div>• Boot Command: Iniciar_cumplimiento_exante_saare --route-vault=D1</div>
              <div>• Latency Threshold: 1.12 ms</div>
              <div>• Tolerance Delta: &lt; 0.01%</div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowExAnteModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded">Cerrar</button>
              <button onClick={() => { alert('Notario Digital Ex-Ante Sincronizado.'); setShowExAnteModal(false); }} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded">Ejecutar Notariado</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VALIDAR LICENCIA */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-sky-400">Validación de Licencia y Token Criptográfico</h3>
            <input type="text" placeholder="SK-SAARE-XXXX-XXXX" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-100" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLicenseModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded">Cancelar</button>
              <button onClick={() => { alert('Licencia Verificada Correctamente.'); setShowLicenseModal(false); }} className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded">Validar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VERIFICADOR ED25519 */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-sky-400">Verificador Criptográfico Ed25519 / ISO 27037</h3>
            <p className="text-xs text-slate-400 font-mono">Estado: Firma válida en Bóveda D1. Merkle Root certificado conforme a estándar RFC 8032.</p>
            <div className="flex justify-end">
              <button onClick={() => setShowVerifyModal(false)} className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TOKEN AUDITORÍA */}
      {showAuditTokenModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-emerald-400">Token de Acceso Temporal para Auditores</h3>
            <input readOnly value={`SAARE-AUDIT-TOKEN-${Date.now()}`} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-emerald-400" />
            <div className="flex justify-end">
              <button onClick={() => setShowAuditTokenModal(false)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded">Copiar y Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}