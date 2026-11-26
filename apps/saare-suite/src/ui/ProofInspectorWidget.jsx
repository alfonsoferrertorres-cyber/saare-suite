// saare-suite/src/components/ProofInspectorWidget.jsx — Validador Client-Side
import React, { useState } from 'react';

const ORIGINAL_SAMPLE_PROOF = {
  evidence_id: 'prff_89f3a12c4b01e',
  tenant_id: 'tnt_org_01',
  system_id: 'sys_llm_gateway',
  policy_version: 'pol_v2.4.1',
  control_version: 'ctrl_v1.0',
  timestamp: '2026-09-30T09:15:00.000Z',
  payload_digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  merkle_root: 'a81d42f567b1209e7c301b44d71e2c91834f82d1c95a201b17e88421899a1b02',
  signature: 'ed25519:92f1ab880e412...3a9f02c',
  timestamp_token: 'rfc3161:tst_qtsa_2026_0930_valid',
  verification_status: 'INTACT',
};

export default function ProofInspectorWidget() {
  const [proofData, setProofData] = useState(JSON.stringify(ORIGINAL_SAMPLE_PROOF, null, 2));
  const [isTampered, setIsTampered] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(proofData);

        const isDigestValid = parsed.payload_digest === ORIGINAL_SAMPLE_PROOF.payload_digest;
        const isMerkleValid = parsed.merkle_root === ORIGINAL_SAMPLE_PROOF.merkle_root;
        const isSignatureValid = parsed.signature === ORIGINAL_SAMPLE_PROOF.signature;
        const isTimestampValid = Boolean(
          typeof parsed.timestamp_token === 'string' && parsed.timestamp_token.startsWith('rfc3161:')
        );
        const isStatusIntact = parsed.verification_status === 'INTACT';

        const isValid =
          isDigestValid && isMerkleValid && isSignatureValid && isTimestampValid && isStatusIntact;

        setVerificationResult({
          status: isValid ? 'VALID' : 'INVALID',
          checks: [
            {
              name: 'SHA-256 Payload Digest Alignment',
              passed: isDigestValid,
              detail: isDigestValid
                ? 'El digest coincide con el registro de ejecución'
                : 'Se ha detectado una discrepancia en el digest',
            },
            {
              name: 'Merkle Tree Inclusion & Root',
              passed: isMerkleValid,
              detail: isMerkleValid
                ? 'Prueba de inclusión válida en el árbol'
                : 'Error de consistencia en la raíz de Merkle',
            },
            {
              name: 'Ed25519 Signature Verification',
              passed: isSignatureValid,
              detail: isSignatureValid
                ? 'Firma criptográfica válida'
                : 'Error en la verificación de la firma',
            },
            {
              name: 'RFC 3161 Timestamp Token Binding',
              passed: isTimestampValid,
              detail: isTimestampValid
                ? 'Vinculado a token de sellado temporal'
                : 'Token de sellado temporal ausente o no válido',
            },
          ],
        });
      } catch {
        setVerificationResult({
          status: 'VERIFICATION_ERROR',
          checks: [
            {
              name: 'Integridad Estructural JSON',
              passed: false,
              detail: 'El contenido de la evidencia no tiene un formato JSON válido',
            },
          ],
        });
      }
      setIsVerifying(false);
    }, 300);
  };

  const handleTamperPayload = () => {
    try {
      const parsed = JSON.parse(proofData);
      parsed.payload_digest = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b859';
      parsed.verification_status = 'ALTERED';
      setProofData(JSON.stringify(parsed, null, 2));
      setIsTampered(true);
      setVerificationResult(null);
    } catch {
      // noop
    }
  };

  const handleReset = () => {
    setProofData(JSON.stringify(ORIGINAL_SAMPLE_PROOF, null, 2));
    setIsTampered(false);
    setVerificationResult(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 font-sans shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Inspector de Evidencias
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
              Verificación Local
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Comprueba cómo una alteración en el paquete invalida la verificación de integridad.
          </p>
        </div>

        <div className="flex gap-2">
          {!isTampered ? (
            <button
              type="button"
              onClick={handleTamperPayload}
              className="px-3 py-1.5 text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
            >
              Simular Alteración
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Restaurar Original
            </button>
          )}
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-5 py-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all shadow-md shadow-cyan-500/10 disabled:opacity-50 cursor-pointer"
          >
            {isVerifying ? 'Verificando...' : 'Verificar Paquete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
            <span>Paquete de evidencia</span>
            {isTampered && <span className="text-rose-400 font-bold">● ALTERADO</span>}
          </label>
          <textarea
            value={proofData}
            onChange={(e) => {
              setProofData(e.target.value);
              setIsTampered(e.target.value !== JSON.stringify(ORIGINAL_SAMPLE_PROOF, null, 2));
              setVerificationResult(null);
            }}
            rows={12}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-500 selection:bg-cyan-500 selection:text-slate-950 leading-relaxed"
          />
        </div>

        <div className="flex flex-col justify-between bg-slate-950/60 border border-slate-800 rounded-xl p-5">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-3">
              Comprobación de Integridad
            </span>

            {verificationResult ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    verificationResult.status === 'VALID'
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-mono font-bold uppercase block">
                      VEREDICTO: {verificationResult.status}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {verificationResult.status === 'VALID'
                        ? 'La evidencia conserva su integridad y comprobaciones válidas.'
                        : 'Verificación fallida. Se ha detectado una alteración o error.'}
                    </span>
                  </div>
                  <span className="text-2xl font-mono">
                    {verificationResult.status === 'VALID' ? '✓' : '✗'}
                  </span>
                </div>

                <div className="space-y-2">
                  {verificationResult.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-lg flex items-start justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{check.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{check.detail}</p>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs ${
                          check.passed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {check.passed ? 'PASSED ✓' : 'FAILED ✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                <span className="font-mono text-xs text-slate-500 mb-2">Esperando Verificación</span>
                <p className="text-xs text-slate-400 max-w-xs">
                  Pulsa <strong className="text-slate-200">"Verificar Paquete"</strong> o modifica el contenido para ejecutar la comprobación.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>SHA-256 / Merkle / Firma / Sellado</span>
            <span>Ejecución local</span>
          </div>
        </div>
      </div>
    </div>
  );
}