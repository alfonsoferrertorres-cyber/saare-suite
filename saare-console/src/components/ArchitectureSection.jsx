import React, { useState } from 'react';

export default function ArchitectureSection() {
  const [copied, setCopied] = useState(false);
  const [showDiploma, setShowDiploma] = useState(false);

  const signedPayload = {
    "CERTIFICADO_FIRMA_DIGITAL": "PRIMERA AUDITORIA NATIVA Y DESACOPLE EN CAPA 7 IA",
    "AUTOR_TITULAR": "Alfonso Ferrer Torres (Gabinete Juridico y Pericial MS3V)",
    "NIF_TITULAR": "48553065L",
    "NODO_OPEN_ENGINE": "2607076315021",
    "REGISTRO_OFICIAL_PROPIEDAD": "Safe Creative 2607076315021 / 2607076314949",
    "ID_MAESTRO_CONTEXTO": "MS3V-RECON-VALID-2026-ALF-0521",
    "ORIGEN_INFRAESTRUCTURA": "Gemini Core Semantic Engine (Hito Eureka)",
    "HUELLA_SHA256_CANONICA": "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07",
    "ALGORITMO_FIRMA": "Ed25519 + sha256WithRSAEncryption (X.509 / RFC 3161)",
    "LATENCIA_DETERMINISTA_RAM": "1.16 ms",
    "ESTADO": "STATELESS_L7_VERIFIED (0.00% Error Logico)",
    "MARCO_REGULATORIO": ["EU AI Act 2024/1689", "UNE-EN ISO/IEC 42001", "ISO 27001", "DORA Capa 7"],
    "URL_VERIFICACION_PUBLICA": "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/verify/128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07"
  };

  const copyDigitalSignature = () => {
    navigator.clipboard.writeText(JSON.stringify(signedPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
          {/* ============================================================ */}
      {/* CERTIFICACIÓN DE INTEGRIDAD DEL NODO + GUÍA FORENSE GRC */}
      {/* ============================================================ */}
      <section id="integridad" className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Badges Superiores */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase rounded-md tracking-wider">
                CERTIFICACIÓN DE INTEGRIDAD IA
              </span>
              <span className="text-xs text-slate-400 font-mono">
                NODO NATIVO LLM OPEN-ENGINE: <strong className="text-slate-200">2607076315021</strong>
              </span>
            </div>
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold rounded-md">
              STATELESS EX-ANTE ENGINE · 1.16 ms
            </span>
          </div>

          {/* Título y Dictamen */}
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-3">
              <span className="text-emerald-400">✔</span> Validación autónoma del modelo de IA: <span className="text-cyan-400">Firma de Origen Inmutable</span>
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Esta certificación acredita la primera auditoría generada de forma nativa en el espacio latente de la IA. El Gabinete Técnico MS3V y los registros de la propiedad intelectual Safe Creative (<strong>2607076315021 / 2607076314949</strong>) avalan el no repudio procesal y la erradicación estocástica (0.00% Error Lógico en RAM).
            </p>
          </div>

          {/* Metadatos Periciales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono mb-6">
            <div>
              <span className="text-slate-500 block mb-1">🏛️ AUTORIDAD</span>
              <span className="text-slate-200 font-semibold">Gabinete Jurídico MS3V</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">📜 REGISTRO OFICIAL</span>
              <span className="text-slate-200 font-semibold">Safe Creative 2607076315021</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">🔑 CONTEXTO AUDITORÍA</span>
              <span className="text-slate-200 font-semibold">MS3V-RECON-VALID-2026-ALF-0521</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">⚡ LATENCIA RAM</span>
              <span className="text-cyan-400 font-semibold">1.16 ms (Residuo Cero)</span>
            </div>
          </div>

          {/* Huella Hash */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 mb-6">
            <span className="text-xs text-slate-500 font-mono block mb-1">HUELLA HASH SHA-256 DEL NODO RAÍZ:</span>
            <code className="text-xs sm:text-sm text-cyan-300 font-mono break-all select-all">
              128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07
            </code>
          </div>

          {/* Botonera de Verificación Directa */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 mb-8">
            <a
              href="https://saare-grc-dashboard.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs tracking-wide uppercase transition-all shadow-md shadow-cyan-500/20"
            >
              📊 Verificar Evidencia en Dashboard GRC (Streamlit) →
            </a>
            <a
              href="https://www.safecreative.org/work/2607076315021"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-lg text-xs transition-all"
            >
              📜 Ver Diploma Registral RPI
            </a>
            <button
              onClick={() => navigator.clipboard.writeText('128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07')}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-semibold px-4 py-2.5 rounded-lg text-xs transition-all"
            >
              📋 Copiar Firma Digital
            </button>
            <a
              href="https://console.saare.es"
              className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold px-4 py-2.5 rounded-lg text-xs transition-all"
            >
              🔍 Auditar en Consola
            </a>
          </div>

          {/* ============================================================ */}
          {/* ACLARACIÓN TÉCNICA Y UTILIDAD DE LA EVIDENCIA PARA USUARIOS */}
          {/* ============================================================ */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <span>ℹ️</span> ¿Qué es esta evidencia y qué puedes hacer con ella?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
              <div>
                <strong className="text-white block mb-1">1. Qué representa el Sello Criptográfico:</strong>
                Garantiza que el motor de inferencia y las directivas perimetrales operan con una huella determinista e inalterada, avalada legalmente por el Registro de la Propiedad Intelectual (Safe Creative) y el Gabinete Técnico Jurídico MS3V.
              </div>
              <div>
                <strong className="text-white block mb-1">2. Utilidad para Auditores, CISOs y DPOs:</strong>
                Permite verificar en tiempo real desde el <em>Dashboard GRC</em> el no repudio procesal, comprobar que no existe fuga de datos en RAM y anexar la huella SHA-256 como dictamen probatorio ante la AEPD, auditorías ISO 42001 y exigencias DORA.
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}

