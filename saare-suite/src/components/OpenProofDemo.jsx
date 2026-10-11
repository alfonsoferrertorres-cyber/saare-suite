import React, { useState } from 'react';

const SAMPLE_PROOF = {
  protocol: "SGP-1.0",
  evidence_id: "EV-L7-89A1B2C3D4",
  proofBundle: {
    verdictId: "VRD-2026-89A1B2C3D4",
    payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    ed25519Signature: "ED25519_SIG_E3B0C44298FC1C14",
    merkleRoot: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    rfc3161Timestamp: "2026-09-30T05:00:00Z"
  }
};

export default function OpenProofDemo() {
  const [tampered, setTampered] = useState(false);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono text-xs text-slate-200">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
        <div>
          <h4 className="font-bold text-sm text-white font-sans">
            Open Proof: Demostración "Don't Trust, Verify"
          </h4>
          <p className="text-slate-400 font-sans text-xs mt-0.5">
            Comprueba la resiliencia criptográfica alterando un byte de la evidencia.
          </p>
        </div>
        <button
          onClick={() => setTampered(!tampered)}
          className={`px-3 py-1.5 rounded font-sans text-xs font-semibold transition-colors ${
            tampered
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
          }`}
        >
          {tampered ? 'Restaurar Evidencia Original' : 'Simular Alteración de Payload'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] block mb-2">// ESTADO DEL PAQUETE .saare-proof</span>
          <pre className="text-emerald-400 overflow-x-auto">
            {JSON.stringify(
              {
                ...SAMPLE_PROOF,
                proofBundle: {
                  ...SAMPLE_PROOF.proofBundle,
                  payloadHash: tampered
                    ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b99" // Hash alterado
                    : SAMPLE_PROOF.proofBundle.payloadHash
                }
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-slate-500 text-[10px] block mb-2">// RESULTADO DEL VERIFICADOR INDEPENDIENTE</span>
            <div className="space-y-2 font-sans mt-3">
              <div className="flex justify-between">
                <span>SHA-256 Digest:</span>
                <span className={tampered ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {tampered ? "FAIL (Mismatch)" : "PASSED ✓"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Merkle Inclusion:</span>
                <span className={tampered ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {tampered ? "FAIL (Invalid Root)" : "PASSED ✓"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ed25519 Signature:</span>
                <span className={tampered ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {tampered ? "INVALID" : "VERIFIED ✓"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>RFC 3161 Timestamp:</span>
                <span className="text-emerald-400">VALID ✓</span>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded text-center font-bold font-sans mt-4 border ${
            tampered
              ? 'bg-rose-950/60 text-rose-200 border-rose-800'
              : 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
          }`}>
            VEREDICTO: {tampered ? 'INVALID / EVIDENCIA MANIPULADA' : 'VERIFIED / INTEGRIDAD ÍNTEGRA'}
          </div>
        </div>
      </div>
    </div>
  );
}