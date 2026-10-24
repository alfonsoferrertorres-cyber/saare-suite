// saare-console/src/Login.jsx — S.A.A.R.E. Access Gate (SGP 1.0 - Resilient Access)
import React, { useState } from 'react';
import { API_BASE_URL } from './utils/api';

export default function Login({ onLoginSuccess, onBack, selectedPlan = 'DISCOVER_FREE' }) {
  const [activeTab, setActiveTab] = useState('demo');

  const [email, setEmail] = useState(() => localStorage.getItem('saare_user_email') || '');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState(() => localStorage.getItem('saare_tenant_domain') || '');
  const [role, setRole] = useState('CISO_ADMIN');
  const [plan, setPlan] = useState(selectedPlan);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase() || 'demo.user@saare.es';
    const cleanTenant = tenant.trim().toUpperCase() || 'ENTERPRISE';

    try {
      const endpoint = activeTab === 'demo' ? '/trial' : '/auth/login';
      
      const payload = activeTab === 'demo'
        ? { email: cleanEmail, company: cleanTenant, planType: plan, agents: 5 }
        : { email: cleanEmail, password, tenant: cleanTenant, role, plan };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const userToken = data.token || data.accessToken || `sk_saare_live_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const userEmail = data.user?.email || data.email || cleanEmail;
        const userRole = data.user?.role || data.role || role;
        const userTenant = data.user?.tenantName || data.tenantName || cleanTenant;

        localStorage.setItem('saare_token', userToken);
        localStorage.setItem('saare_user_email', userEmail);
        localStorage.setItem('saare_user_role', userRole);
        localStorage.setItem('saare_tenant_domain', userTenant);

        onLoginSuccess({
          token: userToken,
          email: userEmail,
          role: userRole,
          tenantName: userTenant,
          plan: plan
        });
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        if (activeTab === 'demo') {
          const fallbackToken = `sk_saare_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          localStorage.setItem('saare_token', fallbackToken);
          localStorage.setItem('saare_user_email', cleanEmail);
          localStorage.setItem('saare_user_role', role);
          localStorage.setItem('saare_tenant_domain', cleanTenant);

          onLoginSuccess({
            token: fallbackToken,
            email: cleanEmail,
            role: role,
            tenantName: cleanTenant,
            plan: plan
          });
          return;
        }

        setErrorMsg(errorData.message || errorData.error || 'Error de autenticación. Verifique sus credenciales.');
      }
    } catch (err) {
      console.warn("[SAARE ACCESS GATE] Sin conexión con backend REST, ejecutando sesión local de demo:", err);
      
      if (activeTab === 'demo' || !password) {
        const offlineToken = `sk_saare_offline_${Date.now()}`;
        localStorage.setItem('saare_token', offlineToken);
        localStorage.setItem('saare_user_email', cleanEmail);
        localStorage.setItem('saare_user_role', role);
        localStorage.setItem('saare_tenant_domain', cleanTenant);

        onLoginSuccess({
          token: offlineToken,
          email: cleanEmail,
          role: role,
          tenantName: cleanTenant,
          plan: plan
        });
      } else {
        setErrorMsg('No se pudo establecer conexión con el Control Plane. Verifique la API.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '32px', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', background: '#0284c7', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>
            🛡️
          </div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#38bdf8', letterSpacing: '1px' }}>S.A.A.R.E. ACCESS GATE</h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Infraestructura Soberana de Autorización y Bóveda D1</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: '#020617', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }} 
            style={{ padding: '8px', border: 'none', borderRadius: '6px', background: activeTab === 'login' ? '#1e293b' : 'transparent', color: activeTab === 'login' ? '#fff' : '#64748b', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
            Iniciar Sesión
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('demo'); setErrorMsg(''); }} 
            style={{ padding: '8px', border: 'none', borderRadius: '6px', background: activeTab === 'demo' ? '#059669' : 'transparent', color: activeTab === 'demo' ? '#fff' : '#64748b', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
            Solicitar Demo
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '16px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>Correo Corporativo</label>
            <input 
              type="email" 
              required 
              placeholder="usuario@empresa.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>Organización / Tenant ID</label>
            <input 
              type="text" 
              required 
              placeholder="Ej. ENTERPRISE"
              value={tenant} 
              onChange={(e) => setTenant(e.target.value)} 
              style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>

          {activeTab === 'login' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>Contraseña</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>Rol Inicial RBAC</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '800', boxSizing: 'border-box', cursor: 'pointer' }}>
              <option value="CISO_ADMIN">👑 CISO ADMIN (Nivel 4)</option>
              <option value="CISO_SECOPS_LEVEL_3">🛡️ SECOPS (Nivel 3)</option>
              <option value="DPO_GRC_LEVEL_2">⚖️ DPO GRC (Nivel 2)</option>
              <option value="BOARD_EXECUTIVE_LEVEL_1">📈 EXECUTIVE (Nivel 1)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: activeTab === 'demo' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            {loading ? 'ACCEDIENDO AL ENTORNO...' : activeTab === 'demo' ? 'Iniciar Entorno de Demo ↗' : 'Acceder a la Consola ↗'}
          </button>
        </form>

        {onBack && (
          <button 
            type="button" 
            onClick={onBack} 
            style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}>
            ← Volver a la página principal
          </button>
        )}

      </div>
    </div>
  );
}