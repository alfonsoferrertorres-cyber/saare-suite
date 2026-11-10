// apps/saare-console/src/context/TenantContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('saare_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTenant, setActiveTenant] = useState(session?.tenantId || 'DEMO_ENTERPRISE');

  const updateTenant = (tenantId) => {
    setActiveTenant(tenantId);
    if (session) {
      const updated = { ...session, tenantId };
      setSession(updated);
      localStorage.setItem('saare_session', JSON.stringify(updated));
    }
  };

  return (
    <TenantContext.Provider value={{ session, setSession, activeTenant, updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);