import React, { useState } from 'react';

export default function ForensicVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);

  const verificationData = {
    standard: "ISO/IEC 42001 & DORA Framework",
    root_node_hash: "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07",
    signature_algorithm: "Ed25519 / HMAC-SHA256",
    registration_id: "Safe Creative 2607076315021 / 2607076314949",
    legal_authority: "Gabinete Jurídico Técnico MS3V",
    audit_context: "MS3V-RECON-VALID-2026-ALF-0521",
    latency_ram: "1.16 ms",
    retention_policy: "Stateless - 0 bytes persistidos",
    timestamp: new Date().toISOString()
  };

  const handleDownloadProof = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(verificationData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SAARE_AUDIT_PROOF_${verificationData.registration_id.split(' ')[2]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      {/* BOTÓN FLOTANTE PERICIAL EN ESQUINA INFERIOR DERECHA */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all hover:scale-105"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>VERIFICAR EVIDENCIA FORENSE</span>
        </button>
      </div>

      {/* MODAL EMERGENTE DE FICHA TÉCNICA */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white font-sans">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="text-lg font-bold text-white">Certificado de Verificación Forense</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Metadatos en Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono mb-6">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">REGISTRO OFICIAL RPI</span>
                <span className="text-cyan-400 font-semibold">{verificationData.registration_id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">AUTORIDAD DICTAMINADORA</span>
                <span className="text-slate-200 font-semibold">{verificationData.legal_authority}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">FIRMA CRIPTOGRÁFICA</span>
                <span className="text-emerald-400 font-semibold">{verificationData.signature_algorithm}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">ESTÁNDAR DE AUDITORÍA</span>
                <span className="text-slate-200 font-semibold">{verificationData.standard}</span>
              </div>
            </div>

            {/* Huella SHA-256 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6 font-mono text-xs">
              <span className="text-slate-500 block mb-1">HUELLA HASH INMUTABLE DEL NODO:</span>
              <code className="text-cyan-300 break-all select-all block">
                {verificationData.root_node_hash}
              </code>
            </div>

            {/* Botones de acción dentro del modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleDownloadProof}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                📥 Descargar Evidencia JSON
              </button>
              <a
                href="https://saare-grc-dashboard.streamlit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-semibold px-5 py-2.5 rounded-xl text-xs uppercase transition-all"
              >
                Auditar en Streamlit ➔
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
