import React from 'react';

export default function Trust() {
  const triggerTrustReportDownload = () => {
    const pdfUrl = '/docs/SAARE-Informe-Confianza-Verificacion-IA.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'SAARE-Informe-Confianza-Verificacion-IA.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-4 sm:px-6 font-sans relative overflow-hidden border-t border-slate-900">
      
      {/* CAPA DE IMAGEN DE FONDO REALZADA (GRC_BG.JPG) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url('/grc_bg.jpg')` }}
      />
      
      {/* MÁSCARA DE DEGRADADO CORPORATIVA PARA TRASLUCIDEZ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/30 via-[#050811]/60 to-[#050811]/85 pointer-events-none" />

      {/* Resplandor ambiental sobrio en oro */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C5A059]/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/40 inline-block backdrop-blur-md">
            CENTRO DE CONFIANZA Y POSTURA DE CIBERSEGURIDAD
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-[#C5A059] leading-tight drop-shadow-md">
            Controles de Seguridad y Cumplimiento Normativo
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto drop-shadow">
            La plataforma S.A.A.R.E. se ha diseñado bajo principios de aislamiento estricto de procesos, mínimo privilegio y verificación criptográfica matemática determinista.
          </p>
        </div>

        {/* MATRIZ DE CONTROLES */}
        <div className="bg-[#0B0F19]/80 border border-[#C5A059]/40 p-6 sm:p-8 rounded-2xl space-y-6 max-w-3xl mx-auto backdrop-blur-md shadow-2xl">
          <div className="border-b border-slate-800 pb-3">
            <span className="font-mono text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              GARANTÍAS DE SEGURIDAD EN TIEMPO DE EJECUCIÓN
            </span>
            <p className="text-xs text-slate-200 leading-relaxed mt-2">
              Todos los algoritmos de inspección se ejecutan exclusivamente en memoria volátil (RAM) con persistencia cero no autorizada en almacenamiento en disco.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="border border-slate-800 bg-[#050811]/70 p-4 rounded-xl space-y-1">
              <span className="text-[#C5A059] font-bold block mb-1">Clave Pública de Verificación</span>
              <span className="text-slate-300 text-[11px] font-sans">
                Firmas criptográficas asimétricas Ed25519 (RFC 8032) e integridad mediante HMAC-SHA256.
              </span>
            </div>
            <div className="border border-slate-800 bg-[#050811]/70 p-4 rounded-xl space-y-1">
              <span className="text-white font-bold block mb-1">Permisos de Proceso y Acceso</span>
              <span className="text-slate-300 text-[11px] font-sans">
                Aislamiento POSIX de socket restringido a permisos 0600 con ejecución in-process sin elevación de privilegios.
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-serif font-bold text-[#C5A059] mb-2">
              Coincidencia con Estándares Internacionales:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-300 text-center">
              <div className="bg-[#050811] p-2 rounded border border-slate-800">EU AI Act</div>
              <div className="bg-[#050811] p-2 rounded border border-slate-800">DORA</div>
              <div className="bg-[#050811] p-2 rounded border border-slate-800">GDPR (Art. 25)</div>
              <div className="bg-[#050811] p-2 rounded border border-slate-800">ISO/IEC 42001</div>
            </div>
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL: DISPARO DE DESCARGA DIRECTA DEL PAQUETE */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={triggerTrustReportDownload}
            className="inline-flex items-center gap-3 bg-[#C5A059] hover:bg-white text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg hover:shadow-[#C5A059]/20 cursor-pointer font-mono"
          >
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Descargar Paquete de Confianza y Verificación (PDF)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
