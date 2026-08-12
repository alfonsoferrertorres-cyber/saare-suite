import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('saare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de verificación de sesión activa al cargar la app
    if (token) {
      setUser({ email: 'ciso@enterprise.com', role: 'admin', org: 'Enterprise Corp' });
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    // Sustituir por llamada fetch a tu API: POST https://api.saare.es/v1/auth/login
    if (email && password) {
      const mockToken = 'jwt_saare_demo_token_sec_2026';
      const mockUser = { email, role: 'CISO', org: 'Enterprise Org' };
      
      localStorage.setItem('saare_token', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    }
    return { success: false, error: 'Credenciales inválidas' };
  };

  const logout = () => {
    localStorage.removeItem('saare_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);