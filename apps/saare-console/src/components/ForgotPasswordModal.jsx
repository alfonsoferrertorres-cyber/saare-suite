// saare-console/src/components/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // Step 1: Pedir Email | Step 2: Pedir OTP y Nueva Clave
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  // Enviar correo con OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', isError: false });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      setMsg({ text: data.message, isError: false });
      setStep(2);
    } catch (err) {
      setMsg({ text: "Error de conexión con el servidor de autenticación.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Restablecer clave con OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', isError: false });

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setMsg({ text: "¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.", isError: false });
        setTimeout(() => onClose(), 2000);
      } else {
        setMsg({ text: data.error || "Error al verificar código.", isError: true });
      }
    } catch (err) {
      setMsg({ text: "Error en la verificación de credenciales.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '28px', color: '#fff' }}>
        
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#38bdf8', fontWeight: '900' }}>
          🔑 Recuperación de Credenciales S.A.A.R.E.
        </h2>

        {msg.text && (
          <div style={{ padding: '10px', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '16px', background: msg.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: msg.isError ? '#f87171' : '#34d399', border: `1px solid ${msg.isError ? '#ef4444' : '#10b981'}` }}>
            {msg.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Introduce tu correo corporativo. Se enviará un código de verificación de 6 dígitos válido durante 15 minutos.
            </p>
            <input 
              type="email" 
              required 
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
              {loading ? 'ENVIANDO CÓDIGO...' : 'Enviar Código de Verificación ↗'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>CÓDIGO DE VERIFICACIÓN (OTP)</label>
              <input 
                type="text" 
                required 
                maxLength={6}
                placeholder="Ej. 870433"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', color: '#38bdf8', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>NUEVA CONTRASEÑA</label>
              <input 
                type="password" 
                required 
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
              {loading ? 'ACTUALIZANDO...' : 'Restablecer Contraseña ↗'}
            </button>
          </form>
        )}

        <button 
          onClick={onClose}
          style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}>
          Cancelar / Volver
        </button>

      </div>
    </div>
  );
}