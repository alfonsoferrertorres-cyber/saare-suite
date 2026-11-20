// TenantContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAARE_CONFIG } from '../config/saareState';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('saare_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTenant, setActiveTenant] = useState(
    () => session?.tenantId || localStorage.getItem('saare_tenant') || SAARE_CONFIG.DEFAULT_TENANT || ''
  );

  useEffect(() => {
    if (activeTenant) {
      localStorage.setItem('saare_tenant', activeTenant);
    }
  }, [activeTenant]);

  const updateTenant = (newTenantId) => {
    setActiveTenant(newTenantId);
    if (session) {
      const updated = { ...session, tenantId: newTenantId };
      setSession(updated);
      try {
        localStorage.setItem('saare_session', JSON.stringify(updated));
      } catch {
        // Ignorar errores de almacenamiento
      }
    }
  };

  return (
    <TenantContext.Provider value={{ session, setSession, activeTenant, updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);