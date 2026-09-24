// saare-suite/src/components/HashVerifierModal.jsx
import React, { useState } from 'react';

export default function HashVerifierModal({ isOpen, onClose }) {
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!hash.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`https://api.saare.es/verify/${hash.trim()}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      setResult({ success: res.ok, data });
    } catch (err) {
      setResult({ success: false, error: 'Error de conexión con la red de nodos.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6 max-w-xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            🛡️ Public Trust Anchor — Validador Notarial
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Hash SHA-256 o Evidence ID
            </label>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="Ej: 6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-sky-400 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando en Bóveda D1...' : 'Validar Inmutabilidad'}
          </button>
        </form>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            {result.success ? (
              <div className="space-y-2">
                <p className="text-emerald-400 font-bold">✅ EVIDENCIA VERIFICADA Y REGISTRADA</p>
                <p><span className="text-slate-500">Trust Anchor:</span> {result.data.trustAnchor}</p>
                <p><span className="text-slate-500">Estándar:</span> {result.data.standard}</p>
                <p><span className="text-slate-500">Timestamp:</span> {result.data.timestamp}</p>
              </div>
            ) : (
              <p className="text-rose-400">❌ {result.error || 'Hash no encontrado o alterado.'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}