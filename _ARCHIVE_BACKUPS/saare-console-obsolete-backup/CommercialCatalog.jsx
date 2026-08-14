import React, { useState, useEffect } from 'react';
import { COMMERCIAL_SCENARIOS } from '../data/commercialCatalog';
import { saveDeploymentPlan, getActiveDeploymentPlan } from '../services/scenarioRegistry';

export function CommercialCatalog() {
  const [tenantId, setTenantId] = useState('tenant-corp-acme');
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const current = getActiveDeploymentPlan(tenantId);
    setActivePlan(current);
  }, [tenantId]);

  const handleSelectScenario = async (scenario) => {
    setLoading(true);
    const saved = await saveDeploymentPlan(tenantId, scenario);
    setActivePlan(saved);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #10B981', borderRadius: '8px', background: '#0F141C', color: '#CBD5E1', margin: '20px 0' }}>
      <h3 style={{ color: '#10B981', marginTop: 0 }}>Catálogo Comercial & Escenarios de Gobernanza</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', color: '#94A3B8', marginRight: '10px' }}>ID Tenant Activo:</label>
        <input 
          type="text" 
          value={tenantId} 
          onChange={(e) => setTenantId(e.target.value)}
          style={{ background: '#050811', border: '1px solid #1E293B', color: '#00F0FF', padding: '6px 10px', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        {COMMERCIAL_SCENARIOS.map((scen) => {
          const isSelected = activePlan?.active_scenario === scen.id;
          return (
            <div 
              key={scen.id} 
              style={{ 
                border: `1px solid ${isSelected ? '#10B981' : '#1E293B'}`, 
                borderRadius: '6px', 
                padding: '15px', 
                background: isSelected ? '#064E3B' : '#050811',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '10px', background: '#C5A059', color: '#000', padding: '2px 6px', fontWeight: 'bold', borderRadius: '3px' }}>{scen.badge}</span>
                <h4 style={{ color: '#FFF', margin: '10px 0 5px 0' }}>{scen.name}</h4>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>{scen.description}</p>
                <div style={{ fontSize: '11px', color: '#00F0FF', margin: '8px 0' }}>?? {scen.impact}</div>
              </div>

              <button 
                onClick={() => handleSelectScenario(scen)} 
                disabled={loading || isSelected}
                style={{ 
                  background: isSelected ? '#10B981' : '#1E293B', 
                  color: '#FFF', 
                  border: 'none', 
                  padding: '8px', 
                  cursor: isSelected ? 'default' : 'pointer',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                {isSelected ? '? Escenario Activo' : 'Desplegar Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {activePlan && (
        <div style={{ background: '#050811', padding: '10px', borderRadius: '4px', border: '1px solid #10B981', fontSize: '12px' }}>
          <strong>Estado Persistido para {tenantId}:</strong> Escenario <span style={{ color: '#10B981' }}>{activePlan.scenario_name}</span> registrado a las {activePlan.updated_at}.
        </div>
      )}
    </div>
  );
}
