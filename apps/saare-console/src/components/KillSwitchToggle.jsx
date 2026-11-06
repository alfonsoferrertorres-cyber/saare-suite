import React, { useState, useEffect } from 'react';

export const KillSwitchToggle = ({ apiBaseUrl, authToken, tenantId, userRole }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // Cabeceras de autenticación L7
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    'x-saare-tenant': tenantId,
    'x-saare-role': userRole || 'CISO_ADMIN'
  };

  // Cargar estado inicial
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/v1/security/killswitch`, { headers })
      .then(res => res.json())
      .then(data => {
        setIsLocked(data.killswitchActive);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [apiBaseUrl]);

  // Ejecutar cambio de estado
  const handleToggle = async () => {
    setLoading(true);
    setShowConfirm(false);
    try {
      const targetState = !isLocked;
      const res = await fetch(`${apiBaseUrl}/api/v1/security/killswitch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ active: targetState })
      });
      const data = await res.json();
      if (res.ok) {
        setIsLocked(data.killswitchActive);
      } else {
        alert(`Error: ${data.message || data.error}`);
      }
    } catch (err) {
      alert("Error de conexión con el Control Plane.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#94a3b8' }}>Verificando circuito L7...</div>;

  return (
    <div style={{
      background: isLocked ? '#450a0a' : '#0f172a',
      border: `1px solid ${isLocked ? '#dc2626' : '#334155'}`,
      borderRadius: '12px',
      padding: '20px',
      color: '#fff',
      maxWidth: '480px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: isLocked ? '#fca5a5' : '#f8fafc' }}>
            🛡️ Corte de Emergencia L7 (Kill-Switch)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Estado: <strong style={{ color: isLocked ? '#ef4444' : '#22c55e' }}>
              {isLocked ? 'BLOQUEADO (LOCKDOWN)' : 'OPERATIVO'}
            </strong>
          </p>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          style={{
            background: isLocked ? '#22c55e' : '#dc2626',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {isLocked ? 'Restablecer Servicio' : 'ACTIVAR BLOQUEO'}
        </button>
      </div>

      {/* Modal de confirmación previa */}
      {showConfirm && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#1e293b',
          borderRadius: '8px',
          border: '1px solid #475569'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#f8fafc' }}>
            {isLocked 
              ? '¿Confirmas la reactivación del tráfico de inferencia y llamadas a proveedores LLM?' 
              : '⚠️ ¿Confirmas el bloqueo inmediato de todo el tráfico en la Capa 7?'}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleToggle}
              style={{
                background: isLocked ? '#16a34a' : '#b91c1c',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Sí, confirmar
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                background: '#475569',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};