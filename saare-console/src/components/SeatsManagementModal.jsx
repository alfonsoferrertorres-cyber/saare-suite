// src/components/SeatsManagementModal.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export default function SeatsManagementModal({ onClose }) {
  const [seatsData, setSeatsData] = useState({ maxSeats: 0, usedSeats: 0, users: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Formulario para invitar / asignar nuevo asiento
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('DPO_GRC_LEVEL_2');

  const loadSeats = async () => {
    setLoading(true);
    try {
      const data = await apiService.getExecutiveSeats();
      if (data && data.success) {
        setSeatsData(data);
      }
    } catch (err) {
      console.warn("Fallo cargando asientos, usando fallback local:", err);
      // Fallback visual en caso de modo offline
      setSeatsData({
        maxSeats: 10,
        usedSeats: 2,
        users: [
          { email: 'ceo@empresa.com', name: 'Director Ejecutivo', role: 'BOARD_EXECUTIVE_LEVEL_1', is_verified: 1, created_at: '2026-01-15' },
          { email: 'ciso@empresa.com', name: 'Oficial de Seguridad', role: 'CISO_ADMIN', is_verified: 1, created_at: '2026-02-01' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();
  }, []);

  const handleAssignSeat = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setSaving(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await apiService.assignExecutiveSeat(newEmail.trim(), newRole, newName.trim());
      if (res && res.success) {
        setMsg({ text: `Asiento asignado correctamente a ${newEmail}`, type: 'success' });
        setNewEmail('');
        setNewName('');
        await loadSeats();
      } else {
        setMsg({ text: res.error || 'No se pudo asignar el asiento.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Error de comunicación con el Control Plane.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'CISO_ADMIN':
        return <span style={{ background: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>👑 CISO ADMIN (NIVEL 4)</span>;
      case 'CISO_SECOPS_LEVEL_3':
        return <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>🛡️ SECOPS (NIVEL 3)</span>;
      case 'DPO_GRC_LEVEL_2':
        return <span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>⚖️ DPO GRC (NIVEL 2)</span>;
      case 'BOARD_EXECUTIVE_LEVEL_1':
      default:
        return <span style={{ background: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>📈 EXECUTIVE (NIVEL 1)</span>;
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '680px', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)', overflow: 'hidden' }}>
        
        {/* Cabecera del Modal */}
        <div style={{ padding: '20px 24px', background: '#020617', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#38bdf8', fontWeight: '900', letterSpacing: '0.5px' }}>
              👥 GESTIÓN DE ASIENTOS Y ROLES RBAC
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Distribución de licencias por rangos de acceso para el Nodo Organismo / Empresa
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* Indicador de Uso de Cuota */}
          <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Ocupación de la Licencia:</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f8fafc', marginTop: '2px' }}>
                {seatsData.usedSeats} / {seatsData.maxSeats} <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Asientos Utilizados</span>
              </div>
            </div>
            <div style={{ width: '140px', background: '#1e293b', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (seatsData.usedSeats / (seatsData.maxSeats || 1)) * 100)}%`, background: 'linear-gradient(90deg, #38bdf8, #059669)', height: '100%' }}></div>
            </div>
          </div>

          {/* Formulario para Asignar Asiento */}
          <form onSubmit={handleAssignSeat} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#f8fafc', fontWeight: '800' }}>➕ Asignar Nuevo Asiento a Operador</h3>
            
            {msg.text && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '12px', background: msg.type === 'success' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: msg.type === 'success' ? '#34d399' : '#f87171', border: `1px solid ${msg.type === 'success' ? '#059669' : '#ef4444'}` }}>
                {msg.text}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
                <input 
                  type="email" 
                  required 
                  placeholder="empleado@empresa.com"
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>NOMBRE / PUESTO</label>
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez (Auditor)"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>RANGO Y ROL RBAC</label>
              <select 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', boxSizing: 'border-box' }}>
                <option value="BOARD_EXECUTIVE_LEVEL_1">📈 BOARD EXECUTIVE (Nivel 1) — Métricas y Vistas de Dirección</option>
                <option value="DPO_GRC_LEVEL_2">⚖️ DPO GRC (Nivel 2) — Informes Legal, FRIA y Dossiers de Subvención</option>
                <option value="CISO_SECOPS_LEVEL_3">🛡️ CISO SECOPS (Nivel 3) — Reglas Custom, Webhooks y Resilience Lab</option>
                <option value="CISO_ADMIN">👑 CISO ADMIN (Nivel 4) — Control Total de la Infraestructura</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={saving || seatsData.usedSeats >= seatsData.maxSeats}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', opacity: seatsData.usedSeats >= seatsData.maxSeats ? 0.5 : 1 }}>
              {saving ? 'ASIGNANDO ASIENTO...' : 'Confirmar Asignación de Asiento ↗'}
            </button>
          </form>

          {/* Tabla de Empleados / Asientos Activos */}
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#f8fafc', fontWeight: '800' }}>📋 Asientos Asignados en el Nodo</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.8rem' }}>Cargando directorio de la organización...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#020617', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '8px 10px' }}>USUARIO</th>
                  <th style={{ padding: '8px 10px' }}>RANGO RBAC</th>
                  <th style={{ padding: '8px 10px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {seatsData.users.map((u, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{u.name || u.email}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px' }}>{getRoleBadge(u.role)}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ color: u.is_verified ? '#34d399' : '#fbbf24', fontSize: '0.7rem', fontWeight: '700' }}>
                        {u.is_verified ? '● Activo' : '○ Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        <div style={{ padding: '14px 24px', background: '#020617', borderTop: '1px solid #1e293b', textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}