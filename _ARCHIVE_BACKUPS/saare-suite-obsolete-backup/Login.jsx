import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const sendAuditLog = async (promptText) => {
  try {
    const isSensitive = /tarjeta|secret_key|admin|password/i.test(promptText);
    await fetch('http://localhost:3001/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        usuario: 'USUARIO-WEB',
        decision: isSensitive ? 'RECHAZADO' : 'PERMITIDO'
      })
    });
  } catch (e) { console.error(e); }
};
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor introduce tu correo profesional y contraseÃ±a.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Credenciales no vÃ¡lidas.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-white flex items-center justify-center px-4 sm:px-6 relative overflow-hidden border-t border-slate-900 font-sans">
      
      {/* CAPA DE IMAGEN DE FONDO REALZADA (GRC_BG.JPG) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url('/grc_bg.jpg')` }}
      />
      
      {/* MÃSCARA MÃS LIGERA PARA PERMITIR TRASLUCIDEZ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/40 via-[#050811]/70 to-[#050811]/90 pointer-events-none" />

      {/* Resplandor ambiental sobrio en oro */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#C5A059]/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full bg-[#0B0F19]/85 border border-[#C5A059]/40 rounded-2xl p-8 backdrop-blur-md relative z-10 shadow-2xl space-y-6">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-2">
          <Link to="/" className="font-serif text-2xl font-black text-white inline-block tracking-tight">
            SAARE <span className="text-[#C5A059]">PLATFORM</span>
          </Link>
          <p className="text-xs font-mono text-slate-300">Acceso a Consola Enterprise & Governance</p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs p-3 rounded-xl font-mono text-center">
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1.5">Correo Corporativo</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ciso@empresa.com"
              className="w-full bg-[#050811]/90 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:border-[#C5A059] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5">ContraseÃ±a</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              className="w-full bg-[#050811]/90 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:border-[#C5A059] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#C5A059] hover:bg-white text-black font-extrabold p-3.5 rounded-xl font-mono uppercase tracking-wider transition-all shadow-lg shadow-[#C5A059]/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? 'Autenticando...' : 'Iniciar SesiÃ³n'}
          </button>
        </form>

        {/* PIE Y ENLACE A DISCOVERY */}
        <div className="text-center text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/80">
          Â¿No tienes cuenta?{' '}
          <Link to="/discovery" className="text-[#C5A059] hover:underline font-bold">
            Solicitar Discovery
          </Link>
        </div>

      </div>
    </div>
  );
}

