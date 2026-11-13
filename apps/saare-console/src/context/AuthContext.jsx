import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('saare_token') || null);
  const [tenantId, setTenantId] = useState(localStorage.getItem('saare_tenant') || 'ORGANISMO_DEMO_01');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('saare_token', token);
    } else {
      localStorage.removeItem('saare_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('saare_tenant', tenantId);
  }, [tenantId]);

  const login = async (email, password, selectedTenant) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.saare.es/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenant: selectedTenant })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setTenantId(data.user.tenantId || selectedTenant);
        return { success: true };
      } else {
        throw new Error(data.error || 'Error en autenticación de custodio');
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('saare_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, tenantId, setTenantId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);