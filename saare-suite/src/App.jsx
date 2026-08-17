import React, { useState, useMemo } from 'react';
import HeroSection from './components/HeroSection';
import ArchitectureSection from './components/ArchitectureSection';
import SubventionsSection from './components/SubventionsSection';
import CalculatorSection from './components/CalculatorSection';
import Modals from './components/Modals';
import { Sparkles, Activity, ExternalLink, Layers } from 'lucide-react';

export default function App() {
  const [numEmpleados, setNumEmpleados] = useState(25);
  const [periodo, setPeriodo] = useState('anual_promo');
  const [isCheckout, setIsCheckout] = useState(false);
  const [isGrant, setIsGrant] = useState(false);
  const [form, setForm] = useState({ empresa: 'S.A.A.R.E. Master Custodian SL', cif: 'B-87654321', email: 'alfonsosb1@gmail.com' });

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const calculo = useMemo(() => {
    let t = numEmpleados <= 10 ? 12 : (numEmpleados > 50 ? 6 : 9);
    if (periodo === 'anual_promo') {
      const p = t * 0.5;
      return { mes: p.toFixed(2), total: (p * numEmpleados * 12).toFixed(2) };
    } else {
      return { mes: t.toFixed(2), total: (t * numEmpleados).toFixed(2) };
    }
  }, [numEmpleados, periodo]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-24 selection:bg-[#C5A059] selection:text-black scroll-smooth">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#030712]/95 backdrop-blur-md px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5A059] via-[#dfba6f] to-[#997938] flex items-center justify-center font-black text-black font-mono shadow-md border border-[#C5A059]/40">S</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight leading-none">S.A.A.R.E.</span>
                <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">ISV ENTERPRISE</span>
              </div>
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">AI GOVERNANCE & L7 SECURITY GATEWAY</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <button onClick={() => scrollTo('acerca')} className="hover:text-white transition-colors">Acerca de</button>
            <button onClick={() => scrollTo('sandbox')} className="hover:text-white transition-colors">Sandbox L7</button>
            <button onClick={() => scrollTo('servicios')} className="hover:text-white transition-colors">Servicios</button>
            <button onClick={() => scrollTo('calculadora')} className="hover:text-white transition-colors">Despliegue Instantáneo</button>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollTo('sandbox')} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white">
              <Layers className="w-3.5 h-3.5 text-[#C5A059]" /><span>Escenas</span>
            </button>
            <button onClick={() => setIsCheckout(true)} className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-black font-black font-mono text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-black" /><span>Oferta -50% Lanzamiento</span>
            </button>
            <a href="https://console.saare.es" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-xs font-bold uppercase hover:bg-emerald-900/60 transition-all">
              <Activity className="w-3.5 h-3.5 animate-pulse" /><span>Consola Operativa</span><ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="/downloads/saare-installer-v2.5.zip" 
              download 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>⚡</span> Descargar Extensión L7
            </a>
          </div>
        </div>
      </header>

      <HeroSection onOpenLicencias={() => setIsCheckout(true)} />
      <ArchitectureSection />
      <SubventionsSection onOpenGrant={() => setIsGrant(true)} />
      <CalculatorSection numEmpleados={numEmpleados} setNumEmpleados={setNumEmpleados} periodo={periodo} setPeriodo={setPeriodo} calculo={calculo} onOpenCheckout={() => setIsCheckout(true)} />
      <Modals isCheckout={isCheckout} setIsCheckout={setIsCheckout} isGrant={isGrant} setIsGrant={setIsGrant} numEmpleados={numEmpleados} calculo={calculo} form={form} setForm={setForm} />
    </div>
  );
}