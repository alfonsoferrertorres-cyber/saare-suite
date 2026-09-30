import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Login from './Login';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedPlan, setSelectedPlan] = useState('DISCOVER_FREE');

  const handleNavigateToLogin = (plan = 'DISCOVER_FREE') => {
    setSelectedPlan(plan);
    setCurrentView('login');
  };

  const handleLoginSuccess = (authData) => {
    const consoleUrl = import.meta.env.VITE_CONSOLE_URL || 'https://console.saare.es';
    const tokenParam = encodeURIComponent(authData?.token || '');
    const planParam = encodeURIComponent(selectedPlan || 'DISCOVER_FREE');
    
    if (authData?.token) {
      localStorage.setItem('saare_token', authData.token);
    }
    
    window.location.href = `${consoleUrl}/?token=${tokenParam}&plan=${planParam}`;
  };

  if (currentView === 'login') {
    return (
      <Login 
        selectedPlan={selectedPlan} 
        onBack={() => setCurrentView('landing')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <LandingPage onNavigateToLogin={handleNavigateToLogin} />
  );
}