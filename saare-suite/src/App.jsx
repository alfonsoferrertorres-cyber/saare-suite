// saare-suite/src/App.jsx — Orquestador Principal de la Landing S.A.A.R.E. (SGP 1.0 / v10.5.2)
import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';

export default function App() {
  const [selectedPlan, setSelectedPlan] = useState('DISCOVER_FREE');

  // Redirección e integración directa con la Consola GRC (saare-console)
  const handleSelectPlan = (planKey = 'DISCOVER_FREE') => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Resolución dinámica de la URL de la Consola GRC segun el entorno
    const defaultConsoleUrl = isLocal 
      ? 'http://localhost:5173' 
      : (window.location.hostname.includes('pages.dev') 
          ? 'https://saare-console.pages.dev' 
          : 'https://console.saare.es');
          
    const consoleUrl = import.meta.env.VITE_CONSOLE_URL || defaultConsoleUrl;

    // Mapeo de rangos y permisos según el producto o plan seleccionado
    const planConfigMap = {
      'DISCOVER_FREE': { role: 'AUDITOR_GUEST', tenant: 'DEMO_ENTERPRISE' },
      'ENTERPRISE_PRO': { role: 'CISO_ADMIN', tenant: 'ENTERPRISE' },
      'GOVERNANCE_CUSTOM': { role: 'SUPER_ADMIN', tenant: 'ENTERPRISE_GOV' }
    };

    const targetConfig = planConfigMap[planKey] || planConfigMap['DISCOVER_FREE'];

    // Construcción de la sesión para transferencia directa a saare-console
    const queryParams = new URLSearchParams({
      plan: planKey,
      tenant: targetConfig.tenant,
      role: targetConfig.role,
      status: 'ACTIVE',
      source: 'saare_suite'
    });

    // Guardar preferencia local para consistencia
    localStorage.setItem('saare_user_plan', planKey);
    localStorage.setItem('saare_user_role', targetConfig.role);
    localStorage.setItem('saare_tenant_domain', targetConfig.tenant);

    // Redirección inmediata a saare-console
    window.location.href = `${consoleUrl.replace(/\/$/, '')}/?${queryParams.toString()}`;
  };

  // Auto-transferencia si la URL de la suite contiene el parámetro ?plan=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      setSelectedPlan(planParam);
      handleSelectPlan(planParam);
    }
  }, []);

  return (
    <LandingPage 
      selectedPlan={selectedPlan}
      onNavigateToLogin={handleSelectPlan} 
      onSelectPlan={handleSelectPlan}
      onNavigateToConsole={handleSelectPlan}
    />
  );
}