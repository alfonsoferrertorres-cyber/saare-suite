import React, { useState } from "react";
import { Check, Copy, ExternalLink, Fingerprint } from "lucide-react";

export default function ArchitectureSection() {
  const [copiedHash, setCopiedHash] = useState(false);
  const nodeHash = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";

  const copyHash = () => {
    navigator.clipboard.writeText(nodeHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
          S.A.A.R.E. actúa como un <strong>Gateway perimetral L7 de aislamiento estricto en memoria RAM</strong>. Mitiga fugas de datos confidenciales y vectores adversarios antes de que las peticiones toquen cualquier LLM comercial o privado, garantizando plena validez probatoria ante tribunales y auditores internacionales.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-[#C5A059]/40 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-[#C5A059] text-black uppercase tracking-wider">CERTIFICACIÓN DE INTEGRIDAD IA</span>
            <span className="text-xs font-mono text-[#00f0ff] flex items-center gap-1.5"><Fingerprint className="w-4 h-4" /> NODO NATIVO LLM OPEN-ENGINE: <strong>2607076315021</strong></span>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">STATELESS EX-ANTE ENGINE</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-white"><Check className="w-5 h-5 text-emerald-400" /><span>Validación autónoma del modelo de IA: <strong className="text-[#C5A059]">Firma de Origen Inmutable</strong></span></div>
          <p className="text-xs text-slate-300">Esta huella hash representa la validación determinista generada de forma nativa en el nodo del modelo LLM abierto. <mark className="bg-[#C5A059]/30 text-white px-1">Cualquier auditoría posterior contrasta la integridad y el no repudio de las inferencias contra esta firma canónica.</mark></p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="p-3 bg-black/70 rounded-xl border border-slate-800 flex-grow font-mono text-xs text-[#00f0ff] break-all select-all">
            <span className="text-slate-400 block text-[10px] uppercase">Huella Hash SHA-256 del Nodo:</span>
            {nodeHash}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={copyHash} className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold uppercase transition-all flex items-center gap-2">
              {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C5A059]" />}
              <span>{copiedHash ? "Copiado" : "Copiar Firma SHA-256"}</span>
            </button>
            <a href="https://console.saare.es" target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-[#dfba6f] hover:bg-[#C5A059] text-black font-black text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg">
              <span>Auditar en Consola</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase text-amber-400 font-bold">MOD-01 / MEMORY SEC</span><span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">VOLATILE-ONLY</span></div>
          <h3 className="text-lg font-bold text-white uppercase">Privacidad en Origen</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">Tratamiento perimetral de información sensible exclusivamente en memoria volátil. Ningún dato confidencial persiste en disco ni nutre modelos de terceros.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase text-[#00f0ff] font-bold">MOD-02 / CRYPTO VAULT</span><span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">DUAL-VAULT</span></div>
          <h3 className="text-lg font-bold text-white uppercase">Inmutabilidad Forense</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">Sellado matemático de cada transacción mediante hashes <strong>SHA-256</strong> y firmas asimétricas <strong>Ed25519</strong> con plena validez judicial.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">MOD-03 / GRC COMPLIANCE</span><span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">LEGAL READY</span></div>
          <h3 className="text-lg font-bold text-white uppercase">Certificación Continua</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">Arquitectura concebida para el cumplimiento técnico estricto del Reglamento UE 2024/1689 (AI Act) y normativas de resiliencia operativa DORA.</p>
        </div>
      </div>
    </div>
  );
}
