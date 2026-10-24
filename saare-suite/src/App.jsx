// saare-suite/src/App.jsx — Orquestador Principal de la Suite S.A.A.R.E. (SGP 1.0)
import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import Login from './Login';

// Componente Integrado: Política de Privacidad
function PrivacyPage({ onBack }) {
  return (
    <div style={{ padding: '40px 20px', color: '#f8fafc', background: '#030712', minHeight: '100vh', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold' }}>
        ← Volver al Inicio
      </button>
      <h1 style={{ color: '#38bdf8', fontSize: '1.8rem', marginBottom: '16px' }}>Política de Privacidad</h1>
      <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
        En S.A.A.R.E. Enterprise Core garantizamos la máxima protección de sus datos personales bajo el estricto cumplimiento del Reglamento General de Protección de Datos (RGPD / UE 2016/679) y la LOPDGDD 3/2018. La arquitectura de inspección de la plataforma opera bajo el principio de Zero-Disk Compute en memoria RAM local, evitando el almacenamiento permanente de contenidos de payload confidenciales.
      </p>
    </div>
  );
}

// Componente Integrado: Términos y Condiciones
function TermsPage({ onBack }) {
  return (
    <div style={{ padding: '40px 20px', color: '#f8fafc', background: '#030712', minHeight: '100vh', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold' }}>
        ← Volver al Inicio
      </button>
      <h1 style={{ color: '#38bdf8', fontSize: '1.8rem', marginBottom: '16px' }}>Términos y Condiciones de Servicio</h1>
      <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
        El acceso y uso de la Suite de Gobernanza GRC y Ciberresiliencia S.A.A.R.E. está sujeto a las cláusulas de licenciamiento corporativo acordadas. Todas las inspecciones ex-ante y evidencias forense se firman mediante criptografía inmutable Ed25519 acreditada contra Bóveda D1 y el Trust Anchor del nodo.
      </p>
    </div>
  );
}

// Componente Integrado: Política de Cookies
function CookiesPage({ onBack }) {
  return (
    <div style={{ padding: '40px 20px', color: '#f8fafc', background: '#030712', minHeight: '100vh', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold' }}>
        ← Volver al Inicio
      </button>
      <h1 style={{ color: '#38bdf8', fontSize: '1.8rem', marginBottom: '16px' }}>Política de Cookies</h1>
      <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
        Este sitio web utiliza exclusivamente cookies técnicas de sesión estrictamente necesarias y almacenamiento local (`localStorage`) para mantener el estado de autenticación y preferencia de Tenant/Rol del usuario. No se emplean cookies de seguimiento de terceros ni tecnologías de perfilado comercial.
      </p>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('LANDING'); // 'LANDING' | 'LOGIN' | 'PRIVACY' | 'TERMS' | 'COOKIES'
  const [selectedPlan, setSelectedPlan] = useState('DISCOVER_FREE');

  // Redirección directa a la Consola GRC (saare-console)
  const handleNavigateToConsole = (planKey = 'DISCOVER_FREE') => {
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    );
    
    const defaultConsoleUrl = isLocal 
      ? 'http://127.0.0.1:5173' 
      : (window.location.hostname.includes('pages.dev') 
          ? 'https://saare-console.pages.dev' 
          : 'https://console.saare.es');
          
    const consoleUrl = import.meta.env.VITE_CONSOLE_URL || defaultConsoleUrl;

    const planConfigMap = {
      'DISCOVER_FREE': { role: 'AUDITOR_GUEST', tenant: 'DEMO_ENTERPRISE' },
      'COMPLIANCE_249': { role: 'COMPLIANCE_OFFICER', tenant: 'ENTERPRISE_COMPLIANCE' },
      'PROFESSIONAL_649': { role: 'CISO_ADMIN', tenant: 'ENTERPRISE_PRO' },
      'ENTERPRISE_1500': { role: 'SUPER_ADMIN', tenant: 'ENTERPRISE_CORE' },
      'PRIVATE_CUSTOM': { role: 'SYSTEM_AUDITOR', tenant: 'ENTERPRISE_AIRGAP' }
    };

    const targetConfig = planConfigMap[planKey] || planConfigMap['DISCOVER_FREE'];

    const queryParams = new URLSearchParams({
      plan: planKey,
      tenant: targetConfig.tenant,
      role: targetConfig.role,
      status: 'ACTIVE',
      source: 'saare_suite'
    });

    localStorage.setItem('saare_user_plan', planKey);
    localStorage.setItem('saare_user_role', targetConfig.role);
    localStorage.setItem('saare_tenant_domain', targetConfig.tenant);

    window.location.href = `${consoleUrl.replace(/\/$/, '')}/?${queryParams.toString()}`;
  };

  const handleOpenLogin = (planKey = 'DISCOVER_FREE') => {
    setSelectedPlan(planKey);
    setCurrentView('LOGIN');
  };

  const handleOpenLegal = (viewName) => {
    if (['privacy', 'terms', 'cookies'].includes(viewName.toLowerCase())) {
      setCurrentView(viewName.toUpperCase());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('LANDING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      setSelectedPlan(planParam);
      handleOpenLogin(planParam);
    }
  }, []);

  if (currentView === 'LOGIN') {
    return (
      <Login
        initialPlan={selectedPlan}
        onLoginSuccess={() => handleNavigateToConsole(selectedPlan)}
        onBack={handleBackToLanding}
      />
    );
  }

  if (currentView === 'PRIVACY') {
    return <PrivacyPage onBack={handleBackToLanding} />;
  }

  if (currentView === 'TERMS') {
    return <TermsPage onBack={handleBackToLanding} />;
  }

  if (currentView === 'COOKIES') {
    return <CookiesPage onBack={handleBackToLanding} />;
  }

  return (
    <LandingPage 
      selectedPlan={selectedPlan}
      onNavigateToLogin={handleOpenLogin} 
      onSelectPlan={handleOpenLogin}
      onNavigateToConsole={handleNavigateToConsole}
      onNavigateToLegal={handleOpenLegal}
    />
  );
}