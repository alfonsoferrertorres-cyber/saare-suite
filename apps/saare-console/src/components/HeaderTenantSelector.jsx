// apps/saare-console/src/components/HeaderTenantSelector.jsx
import React from 'react';
import { useTenant } from '../context/TenantContext';

export const HeaderTenantSelector = ({ availableTenants = [] }) => {
  const { activeTenant, updateTenant } = useTenant();

  return (
    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col">
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
        Tenant / Organismo Activo
      </span>
      <select
        value={activeTenant}
        onChange={(e) => updateTenant(e.target.value)}
        className="bg-transparent text-emerald-400 font-semibold mt-1 focus:outline-none cursor-pointer"
      >
        {availableTenants.length > 0 ? (
          availableTenants.map((t) => (
            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
              {t.name} ({t.id})
            </option>
          ))
        ) : (
          <>
            <option value="DEMO_ENTERPRISE" className="bg-slate-900 text-white">DEMO_ENTERPRISE</option>
            <option value="ORGANISMO_SALUD_ES" className="bg-slate-900 text-white">ORGANISMO_SALUD_ES</option>
            <option value="FINTECH_CORP_01" className="bg-slate-900 text-white">FINTECH_CORP_01</option>
          </>
        )}
      </select>
    </div>
  );
};