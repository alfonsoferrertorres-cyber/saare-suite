// apps/saare-console/src/components/HeaderTenantSelector.jsx
import React from 'react';
import { useTenant } from '../context/TenantContext';

export const HeaderTenantSelector = ({ availableTenants = [] }) => {
  const { activeTenant, updateTenant } = useTenant();

  const normalizedTenants = Array.isArray(availableTenants) ? availableTenants : [];
  const hasActiveOption = normalizedTenants.some((t) => t.id === activeTenant);
  const options = !hasActiveOption && activeTenant
    ? [{ id: activeTenant, name: activeTenant }, ...normalizedTenants]
    : normalizedTenants;

  return (
    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
        Tenant / Organismo Activo
      </span>
      <select
        value={activeTenant || ''}
        onChange={(e) => updateTenant(e.target.value)}
        disabled={options.length === 0}
        className="bg-transparent text-emerald-400 font-semibold mt-1 focus:outline-none cursor-pointer disabled:opacity-60"
      >
        {options.length === 0 ? (
          <option value="" className="bg-slate-900 text-slate-400">
            Sin tenants asignados
          </option>
        ) : (
          options.map((t) => (
            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
              {t.name ? `${t.name} (${t.id})` : t.id}
            </option>
          ))
        )}
      </select>
    </div>
  );
};