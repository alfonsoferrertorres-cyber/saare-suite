import React, { useState, useEffect } from 'react';
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

  // Simulación / Conexión con Telemetría SSE y API del Control Plane
  useEffect(() => {
    // Carga inicial de métricas y trazas desde el backend S.A.A.R.E.
    fetchTraces();
  }, []);

  const fetchTraces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/runs', {
        headers: { 'x-saare-role': 'DPO_GRC_LEVEL_2' }
      });
      const data = await res.json();
      if (data.evidences) {
        setTraces(data.evidences);
      }
    } catch (err) {
      console.error("Error cargando trazas del Control Plane:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (templateType) => {
    try {
      const res = await fetch('/api/v1/reports/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-saare-role': 'DPO_GRC_LEVEL_2'
        },
        body: JSON.stringify({ templateType })
      });
      const data = await res.json();
      alert(`Informe ${data.report.title} generado exitosamente en el Control Plane.`);
    } catch (err) {
      alert("Error al solicitar la plantilla de gobernanza.");
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
          
          {/* TARJETAS DE KPIS SUPERIORES (Visibles en Overview y Traces) */}
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
                    desc="Informe de Gestión de Riesgos Tecnológicos, mapa de calor e impacto operativo."
                    onClick={() => handleGenerateReport('IT_RISK')} 
                  />
                  <TemplateCard 
                    title="EIPD / DPIA" 
                    code="DPIA"
                    desc="Evaluación de Impacto en la Protección de Datos personales procesados ex-ante."
                    onClick={() => handleGenerateReport('DPIA')} 
                  />
                  <TemplateCard 
                    title="Evaluación de Sesgos" 
                    code="BIAS"
                    desc="Auditoría de equidad algorítmica, métricas de representatividad y drift."
                    onClick={() => handleGenerateReport('BIAS')} 
                  />
                  <TemplateCard 
                    title="Informe ESG / EINF" 
                    code="ESG"
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
function TemplateCard({ title, code, desc, onClick }) {
  return (
    <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-sky-500/40 transition group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-sky-400">{code}</span>
          <FileText className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
        <p className="text-xs text-slate-400 mb-4">{desc}</p>
      </div>
      <button 
        onClick={onClick}
        className="w-full py-2 bg-slate-900 hover:bg-sky-500/10 hover:text-sky-400 border border-slate-800 hover:border-sky-500/30 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2"
      >
        <Download className="w-3.5 h-3.5" /> Generar Estructura
      </button>
    </div>
  );
}

// Subcomponente Tabla de Trazas
function RecentTracesTable({ traces, showFilters }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trazas de Inspección Auditables</h3>
        {showFilters && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-slate-200">
              <Filter className="w-3.5 h-3.5" /> Filtrar por Veredicto
            </button>
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
            {traces.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  No hay trazas registradas en el período actual.
                </td>
              </tr>
            ) : (
              traces.map((trace, idx) => (
                <tr key={trace.trace_id || idx} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 text-sky-400 font-semibold">{trace.trace_id || trace.id}</td>
                  <td className="p-4 text-slate-300">{trace.user}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      trace.decision === 'DENY' || trace.verdict === 'RECHAZADO'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {trace.decision === 'DENY' || trace.verdict === 'RECHAZADO' ? (
                        <><XCircle className="w-3 h-3" /> RECHAZADO</>
                      ) : (
                        <><CheckCircle2 className="w-3 h-3" /> PERMITIDO</>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{trace.latency || '1.12'} ms</td>
                  <td className="p-4 text-slate-500">{new Date(trace.timestamp || Date.now()).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}