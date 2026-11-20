// saare-console/src/components/MetricsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SAARE_CONFIG } from '../config/saareState';

export const MetricsDashboard = ({ tenantId: propTenantId }) => {
  const { token, tenantId: authTenantId } = useAuth();
  const activeTenantId = propTenantId || authTenantId || '';

  const [metrics, setMetrics] = useState({
    total_prompts: 0,
    aprobados: 0,
    bloqueados_pii: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMetrics = async () => {
      if (!activeTenantId) {
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const rawBase =
          SAARE_CONFIG?.API_BASE_URL ||
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
          (typeof window !== 'undefined' && window.location?.origin) ||
          '';

        const baseUrl = String(rawBase)
          .trim()
          .replace(/\/+$/, '')
          .replace(/\/api\/v1$/i, '')
          .replace(/\/api$/i, '')
          .replace(/\/v1$/i, '');

        const headers = {
          'x-saare-tenant': activeTenantId
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}/v1/metrics/tenants`, { headers });
        const data = await response.json();

        if (!cancelled && data?.success && Array.isArray(data.data)) {
          const currentTenantMetric = data.data.find((t) => t.tenant_id === activeTenantId) || {
            total_prompts: 0,
            aprobados: 0,
            bloqueados_pii: 0
          };
          setMetrics(currentTenantMetric);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[SAARE Console] Error cargando telemetría:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMetrics();
    return () => {
      cancelled = true;
    };
  }, [token, activeTenantId]);

  if (loading) {
    return <div className="p-6 text-slate-400">Sincronizando telemetría del tenant...</div>;
  }

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-cyan-400">Panel de Gobernanza y KPIs Ex-Ante</h2>
        <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-cyan-300 font-mono">
          Tenant Activo: {activeTenantId || 'No definido'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow">
          <p className="text-sm text-slate-400 font-medium">Total Prompts Procesados</p>
          <p className="text-3xl font-extrabold text-white mt-2">{metrics?.total_prompts ?? 0}</p>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow">
          <p className="text-sm text-slate-400 font-medium">Prompts Aprobados (EX-ANTE)</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">{metrics?.aprobados ?? 0}</p>
        </div>

        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow">
          <p className="text-sm text-slate-400 font-medium">Bloqueos de Seguridad / PII</p>
          <p className="text-3xl font-extrabold text-rose-400 mt-2">{metrics?.bloqueados_pii ?? 0}</p>
        </div>
      </div>
    </div>
  );
};