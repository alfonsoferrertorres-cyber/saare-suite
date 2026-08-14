import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('saare_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('saare_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('saare_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-[#050811]/95 border-t border-slate-800 backdrop-blur-md text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <p className="font-bold text-white">Gestión de Privacidad y Cookies</p>
          <p className="text-slate-400 max-w-3xl">
            Utilizamos cookies técnicas y analíticas para optimizar el rendimiento de la plataforma y garantizar la seguridad del tráfico. Puedes gestionar tus preferencias o aceptarlas para continuar navegando.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-lg text-slate-300 font-mono transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 bg-[#C5A059] hover:bg-[#d6b16a] text-black font-bold font-mono rounded-lg transition-all shadow-md shadow-[#C5A059]/20"
          >
            Aceptar Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
