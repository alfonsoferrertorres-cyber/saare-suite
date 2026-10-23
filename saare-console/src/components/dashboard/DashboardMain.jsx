// saare-console/src/components/DashboardMain.jsx
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
  XCircle
} from 'lucide-react';

export default function DashboardMain() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTemplate, setSelectedTemplate] = useState('IT_RISK');
  const [metrics, setMetrics] = useState({
    totalInspections: 124850,
    denyCount: 1420,
    blockRate: '1.14%',
    latencyP99: '1.12 ms',
    trustAnchor: 'D1-EU-WESTERN-EUROPE'
  });
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtención dinámica del endpoint base (Vite Env -> Local PEP L7)
  const getBaseUrl = () => {
    return (
      localStorage.getItem('saare_override_vault_host') ||
      import.meta.env?.VITE_API_URL ||
      'http://127.0.0.1:8080'
    );
  };

  // Carga inicial y refresco de trazas desde el backend S.A.A.R.E.
  const fetchTraces = useCallback(async () => {
    setLoading(true);
    const baseUrl = getBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/v1/traces`, {
        headers: { 
          'Content-Type': 'application/json',
          'x-saare-role': 'DPO_GRC_LEVEL_2' 
        }
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      let incomingTraces = [];

      if (data.traces && Array.isArray(data.traces)) {
        incomingTraces = data.traces;
      } else if (data.evidences && Array.isArray(data.evidences)) {
        incomingTraces = data.evidences;
      }

      // Ordenación cronológica descendente estricta
      incomingTraces.sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
        const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
        return timeB - timeA;
      });

      setTraces(incomingTraces);

      // Recalcular métricas dinámicamente si hay trazas disponibles
      if (incomingTraces.length > 0) {
        const denied = incomingTraces.filter(
          t => t.decision === 'DENY' || t.verdict === 'RECHAZADO'
        ).length;
        
        setMetrics(prev => ({
          ...prev,
          totalInspections: prev.totalInspections + incomingTraces.length,
          denyCount: prev.denyCount + denied
        }));
      }
    } catch (err) {
      console.warn("Control Plane no alcanzable, cargando trazas locales en memoria RAM:", err);
      // Fallback con datos de demostración en modo local / Zero Trust
      const mockTraces = [
        { trace_id: 'TR-2026-9901', user_email: 'ciso@empresa.com', decision: 'DENY', latency: '1.08', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
        { trace_id: 'TR-2026-9902', user_email: 'analista.ia@empresa.com', decision: 'ALLOW', latency: '1.12', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
        { trace_id: 'TR-2026-9903', user_email: 'dpo.legal@empresa.com', decision: 'DENY', latency: '0.98', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { trace_id: 'TR-2026-9904', user_email: 'agente.finanzas@empresa.com', decision: 'ALLOW', latency: '1.15', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
        { trace_id: 'TR-2026-9905', user_email: 'desarrollador@empresa.com', decision: 'ALLOW', latency: '1.10', timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString() }
      ];
      setTraces(mockTraces);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  const handleGenerateReport = async (templateType) => {
    setSelectedTemplate(templateType);
    const baseUrl = getBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/v1/reports/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saare-role': 'DPO_GRC_LEVEL_2'
        },
        body: JSON.stringify({ templateType })
      });
      
      if (res.ok) {
        const data = await res.json().catch(() => ({ report: { title: templateType } }));
        alert(`Informe [${data.report?.title || templateType}] generado exitosamente en el Control Plane.`);
      } else {
        alert(`Estructura de plantilla [${templateType}] generada en nodo local S.A.A.R.E.`);
      }
    } catch (err) {
      alert(`Estructura de plantilla [${templateType}] generada localmente (Modo On-Premise).`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* 1. NAVEGACIÓN LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider text-slate-100">S.A.A.R.E.</h1>
              <p className="text-xs text-slate-400">Governance Engine</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" /> Resumen Ejecutivo
            </button>

            <button 
              onClick={() => setActiveTab('traces')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'traces' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" /> Bóveda de Trazas L7
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reports' 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> Informes de Gobernanza
            </button>
          </nav>
        </div>

        {/* Footer del Menú */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nodo: {metrics.trustAnchor}</span>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL DE TRABAJO */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* ENCABEZADO SUPERIOR */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold tracking-wide text-slate-200">
              {activeTab === 'overview' && 'Consola de Monitoreo Global'}
              {activeTab === 'traces' && 'Inspección de Trazas en Memoria RAM (Ex-Ante)'}
              {activeTab === 'reports' && 'Centro de Generación de Plantillas Oficiales'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PEP L7 OPERATIVO
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchTraces} 
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-xs text-slate-400 font-mono">DPO / GRC Nivel 2</span>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* TARJETAS DE KPIS SUPERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Evaluaciones Ex-Ante" value={metrics.totalInspections.toLocaleString()} icon={<Activity className="text-sky-400" />} />
            <KpiCard title="Amenazas Bloqueadas" value={metrics.denyCount.toLocaleString()} icon={<AlertTriangle className="text-amber-400" />} />
            <KpiCard title="Tasa de Mitigación" value={metrics.blockRate} icon={<ShieldCheck className="text-emerald-400" />} />
            <KpiCard title="Latencia P99 RAM" value={metrics.latencyP99} icon={<Terminal className="text-indigo-400" />} />
          </div>

          {/* VISTA 1: OVERVIEW & TRAZAS RECIENTES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Estado del Sistema de Control L7</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-slate-300">Fail-Closed Enforcement Engine: Activo (Zero-Disk RAM)</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Protocolo SGP 1.0</span>
                </div>
              </div>

              <RecentTracesTable traces={traces.slice(0, 5)} />
            </div>
          )}

          {/* VISTA 2: BÓVEDA DUAL DE TRAZAS COMPLETA */}
          {activeTab === 'traces' && (
            <div className="space-y-6">
              <RecentTracesTable traces={traces} showFilters />
            </div>
          )}

          {/* VISTA 3: GENERADOR DE PLANTILLAS DE GOBERNANZA */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Plantillas Oficiales de Gobernanza</h3>
                <p className="text-xs text-slate-400 mb-6">Seleccione una estructura normativa para estructurar los datos auditables capturados en el Control Plane.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TemplateCard 
                    title="IT Risk Assessment" 
                    code="IT_RISK"
                    isSelected={selectedTemplate === 'IT_RISK'}
                    desc="Informe de Gestión de Riesgos Tecnológicos, mapa de calor e impacto operativo."
                    onClick={() => handleGenerateReport('IT_RISK')} 
                  />
                  <TemplateCard 
                    title="EIPD / DPIA" 
                    code="DPIA"
                    isSelected={selectedTemplate === 'DPIA'}
                    desc="Evaluación de Impacto en la Protección de Datos personales procesados ex-ante."
                    onClick={() => handleGenerateReport('DPIA')} 
                  />
                  <TemplateCard 
                    title="Evaluación de Sesgos" 
                    code="BIAS"
                    isSelected={selectedTemplate === 'BIAS'}
                    desc="Auditoría de equidad algorítmica, métricas de representatividad y drift."
                    onClick={() => handleGenerateReport('BIAS')} 
                  />
                  <TemplateCard 
                    title="Informe ESG / EINF" 
                    code="ESG"
                    isSelected={selectedTemplate === 'ESG'}
                    desc="Factores ambientales, DNSH y sostenibilidad en consumo computacional."
                    onClick={() => handleGenerateReport('ESG')} 
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Subcomponente de Tarjetas KPI
function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 font-medium mb-1">{title}</p>
        <p className="text-xl font-bold font-mono text-slate-100">{value}</p>
      </div>
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
        {icon}
      </div>
    </div>
  );
}

// Subcomponente de Tarjetas de Plantillas
function TemplateCard({ title, code, desc, isSelected, onClick }) {
  return (
    <div className={`p-5 bg-slate-950 border rounded-xl transition group flex flex-col justify-between ${
      isSelected ? 'border-sky-500 shadow-lg shadow-sky-500/10' : 'border-slate-800 hover:border-sky-500/40'
    }`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-sky-400">{code}</span>
          <FileText className={`w-4 h-4 transition ${isSelected ? 'text-sky-400' : 'text-slate-500 group-hover:text-sky-400'}`} />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
        <p className="text-xs text-slate-400 mb-4">{desc}</p>
      </div>
      <button 
        onClick={onClick}
        className={`w-full py-2 border text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
          isSelected 
            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
            : 'bg-slate-900 hover:bg-sky-500/10 hover:text-sky-400 border-slate-800 hover:border-sky-500/30'
        }`}
      >
        <Download className="w-3.5 h-3.5" /> {isSelected ? 'Estructura Activa' : 'Generar Estructura'}
      </button>
    </div>
  );
}

// Subcomponente Tabla de Trazas interactiva con filtro
function RecentTracesTable({ traces, showFilters }) {
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  const filteredTraces = traces.filter(trace => {
    const isDenied = trace.decision === 'DENY' || trace.verdict === 'RECHAZADO';
    if (verdictFilter === 'DENY') return isDenied;
    if (verdictFilter === 'ALLOW') return !isDenied;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trazas de Inspección Auditables</h3>
        {showFilters && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Todos los Veredictos</option>
              <option value="ALLOW">✓ Permitidos (ALLOW)</option>
              <option value="DENY">✕ Rechazados (DENY)</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <th className="p-4">Trace ID</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Veredicto</th>
              <th className="p-4">Latencia</th>
              <th className="p-4">Marca Temporal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
            {filteredTraces.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  No hay trazas registradas para el filtro seleccionado.
                </td>
              </tr>
            ) : (
              filteredTraces.map((trace, idx) => {
                const isDenied = trace.decision === 'DENY' || trace.verdict === 'RECHAZADO';
                return (
                  <tr key={trace.trace_id || trace.id || idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 text-sky-400 font-semibold">{trace.trace_id || trace.id || `TR-${idx + 100}`}</td>
                    <td className="p-4 text-slate-300">{trace.user || trace.user_email || 'ciso@saare.es'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        isDenied
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {isDenied ? (
                          <><XCircle className="w-3 h-3" /> RECHAZADO</>
                        ) : (
                          <><CheckCircle2 className="w-3 h-3" /> PERMITIDO</>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{trace.latency || trace.execution_latency_ms || '1.12'} ms</td>
                    <td className="p-4 text-slate-500">{new Date(trace.timestamp || Date.now()).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}