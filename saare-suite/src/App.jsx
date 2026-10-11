// saare-suite/src/App.jsx — Orquestador Principal de la Landing & Access Gate S.A.A.R.E. (SGP 1.0)
import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import Login from './Login';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedPlan, setSelectedPlan] = useState('DISCOVER_FREE');

  // Detectar si la URL incluye parámetros directos para abrir el Login/Register
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const viewParam = params.get('view');

    if (planParam) {
      setSelectedPlan(planParam);
    }

    if (viewParam === 'login' || viewParam === 'register' || planParam) {
      setCurrentView('login');
    }
  }, []);

  const handleNavigateToLogin = (plan = 'DISCOVER_FREE') => {
    setSelectedPlan(plan);
    setCurrentView('login');
  };

  const handleLoginSuccess = (authData) => {
    // URL por defecto de la Consola GRC en desarrollo local o producción
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const defaultConsoleUrl = isLocal ? 'http://localhost:5173' : 'https://console.saare.es';
    const consoleUrl = import.meta.env.VITE_CONSOLE_URL || defaultConsoleUrl;

    const activeToken = authData?.apiKey || authData?.token || localStorage.getItem('saare_token') || '';
    const userEmail = authData?.email || localStorage.getItem('saare_user_email') || '';
    const tenantName = authData?.tenantName || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';
    const userRole = authData?.role || localStorage.getItem('saare_user_role') || 'CISO_ADMIN';
    const finalPlan = authData?.plan || selectedPlan || 'DISCOVER_FREE';

    // Persistir estado local antes de redirigir
    if (activeToken) {
      localStorage.setItem('saare_token', activeToken);
      localStorage.setItem('saare_auth_token', activeToken);
    }
    if (userEmail) localStorage.setItem('saare_user_email', userEmail);
    if (tenantName) localStorage.setItem('saare_tenant_domain', tenantName);
    if (userRole) localStorage.setItem('saare_user_role', userRole);

    // Construir la URL de transferencia de sesión segura
    const queryParams = new URLSearchParams({
      token: activeToken,
      user: userEmail,
      tenant: tenantName,
      role: userRole,
      plan: finalPlan,
      status: 'ACTIVE'
    });

    window.location.href = `${consoleUrl.replace(/\/$/, '')}/?${queryParams.toString()}`;
  };

  if (currentView === 'login') {
    return (
      <Login 
        initialPlan={selectedPlan} 
        onBack={() => {
          setCurrentView('landing');
          // Limpiar parámetros de búsqueda al volver
          if (window.location.search) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <LandingPage onNavigateToLogin={handleNavigateToLogin} />
  );
}