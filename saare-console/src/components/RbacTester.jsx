import React, { useState } from 'react';
import { generateTestToken, getStoredToken, clearToken } from '../services/authService';

export function RbacTester() {
  const [activeToken, setActiveToken] = useState(getStoredToken());
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (role) => {
    const token = generateTestToken(role);
    setActiveToken(token);
    setApiResponse(null);
  };

  const handleClear = () => {
    clearToken();
    setActiveToken(null);
    setApiResponse(null);
  };

  const testApi = async () => {
    setLoading(true);
    setApiResponse(null);

    const headers = {};
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const res = await fetch('/api/engineer/config', { headers });
      const data = await res.json();
      setApiResponse({ status: res.status, data });
    } catch (err) {
      setApiResponse({ status: 'ERROR', data: { message: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #C5A059', borderRadius: '8px', background: '#0F141C', color: '#CBD5E1', margin: '20px 0' }}>
      <h3 style={{ color: '#C5A059', marginTop: 0 }}>Gestor de Permisos Edge & Verificador RBAC</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Token Activo:</strong> {activeToken ? <span style={{ color: '#00F0FF', wordBreak: 'break-all' }}>{activeToken.substring(0, 40)}...</span> : <span style={{ color: '#EF4444' }}>Sin Token (Anónimo)</span>}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button onClick={() => handleGenerate('engineer')} style={{ background: '#C5A059', border: 'none', padding: '8px 12px', cursor: 'pointer', fontWeight: 'bold' }}>Simular Rol: Engineer</button>
        <button onClick={() => handleGenerate('viewer')} style={{ background: '#3B82F6', border: 'none', color: '#FFF', padding: '8px 12px', cursor: 'pointer', fontWeight: 'bold' }}>Simular Rol: Viewer</button>
        <button onClick={handleClear} style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '8px 12px', cursor: 'pointer' }}>Limpiar Token</button>
        <button onClick={testApi} disabled={loading} style={{ background: '#10B981', border: 'none', color: '#FFF', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>Probár Endpoint Edge (/api/engineer/config)</button>
      </div>

      {apiResponse && (
        <pre style={{ background: '#050811', padding: '10px', borderRadius: '4px', border: `1px solid ${apiResponse.status === 200 ? '#10B981' : '#EF4444'}` }}>
          Status: {apiResponse.status}{'\n'}
          {JSON.stringify(apiResponse.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
