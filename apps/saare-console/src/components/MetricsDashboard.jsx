import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const MetricsDashboard = () => {
  const { token, tenantId } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('https://api.saare.es/v1/metrics/tenants', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-saare-tenant': tenantId
          }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const currentTenantMetric = data.data.find(t => t.tenant_id === tenantId) || {
            total_prompts: 0,
            aprobados: 0,
            bloqueados_pii: 0
          };
          setMetrics(currentTenantMetric);
        }
      } catch (err) {
        console.error("[SAARE Console] Error cargando telemetría D1:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMetrics();
    }
  }, [token, tenantId]);

  if (loading) {
    return <div className="p-6 text-slate-400">Sincronizando telemetría de la Bóveda WORM (D1)...</div>;
  }

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-cyan-400">Panel de Gobernanza y KPIs Ex-Ante</h2>
        <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-cyan-300 font-mono">
          Tenant Activo: {tenantId}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow">
          <p className="text-sm text-slate-400 font-medium">Total Prompts Procesados</p>
          <p className="text-3xl font-extrabold text-white mt-2">{metrics?.total_prompts || 0}</p>
        </div>
        
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow">
          <p className="text-sm text-slate-400 font-medium">Prompts Aprobados (EX-ANTE)</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">{metrics?.aprobados || 0}</p>
        </div>
        
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow">
          <p className="text-sm text-slate-400 font-medium">Bloqueos de Seguridad / PII</p>
          <p className="text-3xl font-extrabold text-rose-400 mt-2">{metrics?.bloqueados_pii || 0}</p>
        </div>
      </div>
    </div>
  );
};