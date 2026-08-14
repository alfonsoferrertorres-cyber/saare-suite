import React, { useState } from 'react';
import { verifyEvidenceReceipt } from '../services/evidenceVault';

export default function Verify() {
  const [jsonInput, setJsonInput] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    try {
      const parsedReceipt = JSON.parse(jsonInput);
      const res = await verifyEvidenceReceipt(parsedReceipt, publicKey);
      setResult(res);
    } catch (err) {
      setResult({ valid: false, reason: 'JSON malformado o inválido.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
        <h1 className="text-xl font-bold text-emerald-400 mb-2">SAARE Evidence Receipt Verifier</h1>
        <p className="text-xs text-slate-400 mb-6">Verificación matemática independiente mediante firmas Ed25519 (Offline).</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Recibo de Evidencia (JSON)</label>
            <textarea
              rows="8"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Pega aquí el contenido del archivo de evidencia..."
              className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Clave Pública del Runtime (Hex)</label>
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="Clave pública Ed25519..."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleVerify}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded text-sm transition-colors"
          >
            VERIFICAR RECIBO (OFFLINE)
          </button>

          {result && (
            <div className={`p-4 rounded border text-xs font-mono mt-4 ${result.valid ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300' : 'bg-rose-950/50 border-rose-500 text-rose-300'}`}>
              <div className="font-bold text-sm mb-1">{result.valid ? 'VERIFY ? (VÁLIDO)' : 'VERIFY ? (RECHAZADO)'}</div>
              <p>{result.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
