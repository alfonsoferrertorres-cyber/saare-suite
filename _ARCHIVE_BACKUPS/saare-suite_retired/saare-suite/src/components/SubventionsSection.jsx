import React from 'react';

export default function SubventionsSection({ onOpenGrant }) {
  return (
    <section id="servicios" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 space-y-8 scroll-mt-20">
      <div className="text-center space-y-2">
        <p className="text-xs font-mono text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Financie hasta el <strong className="text-[#C5A059]">100% de la implantación de S.A.A.R.E.</strong> con bonos públicos y genere de inmediato el expediente técnico.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold tracking-wider">RED.ES • NEXTGEN</span>
          <h3 className="text-base font-bold text-white">Kit Consulting (IA)</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">Bonos digitales de <strong>12.000€ a 24.000€</strong> para empresas de 10 a 249 empleados en Asesoramiento de IA y Compliance.</p>
          <div className="pt-2 text-[10px] font-mono text-emerald-400 font-bold">Cobertura: 100% Subvencionado</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold tracking-wider">MINISTERIO TRANSF. DIGITAL</span>
          <h3 className="text-base font-bold text-white">Kit Espacios de Datos</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">Ayudas directas de <strong>15.000€ a 50.000€</strong> para infraestructuras seguras de compartición y anonimización en IA abierta.</p>
          <div className="pt-2 text-[10px] font-mono text-emerald-400 font-bold">Subvención Directa a Fondo Perdido</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold tracking-wider">AGENCIA TRIBUTARIA (LIS)</span>
          <h3 className="text-base font-bold text-white">Deducción Fiscal I+D+i</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">Deducción directa de hasta el <strong>12% en cuota del Impuesto de Sociedades</strong> mediante memoria técnica de innovación.</p>
          <div className="pt-2 text-[10px] font-mono text-emerald-400 font-bold">Incentivo Fiscal Inmediato</div>
        </div>
      </div>
      <div className="bg-slate-900/80 border border-[#C5A059]/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">¿Desea tramitar la ayuda oficial para su empresa?</h4>
          <p className="text-xs text-slate-400">Descargue el expediente técnico oficial con el desglose de conceptos subvencionables.</p>
        </div>
        <button onClick={onOpenGrant} className="px-4 py-2.5 rounded-xl bg-[#dfba6f] text-black font-black font-mono text-xs uppercase tracking-wider hover:bg-[#C5A059] transition-all whitespace-nowrap">Autogenerar Memoria de Ayuda</button>
      </div>
    </section>
  );
}