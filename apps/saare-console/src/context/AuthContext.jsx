// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAARE_CONFIG } from '../config/saareState';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('saare_token') || null);
  const [tenantId, setTenantId] = useState(() => localStorage.getItem('saare_tenant') || SAARE_CONFIG.DEFAULT_TENANT || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('saare_token', token);
    } else {
      localStorage.removeItem('saare_token');
    }
  }, [token]);

  useEffect(() => {
    if (tenantId) {
      localStorage.setItem('saare_tenant', tenantId);
    } else {
      localStorage.removeItem('saare_tenant');
    }
  }, [tenantId]);

  const login = async (email, password, selectedTenant) => {
    setLoading(true);
    try {
      const baseUrl = String(SAARE_CONFIG.API_BASE_URL || 'https://api.saare.es/api/v1').replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenant: selectedTenant })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setTenantId(data.user?.tenantId || selectedTenant || '');
        return { success: true };
      }
      throw new Error(data.error || 'Error en autenticación');
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