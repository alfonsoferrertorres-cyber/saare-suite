import React, { useState } from 'react';
import { Users, Check, Copy, Terminal } from 'lucide-react';

export default function CalculatorSection({ numEmpleados, setNumEmpleados, periodo, setPeriodo, calculo, onOpenCheckout }) {
  const [tab, setTab] = useState('nodejs');
  const [copied, setCopied] = useState(false);
  const demoKey = 'sk_saare_live_2607076315021';

  const getSnippet = () => {
    if (tab === 'nodejs') return `import OpenAI from 'openai';\n\nconst client = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n  baseURL: 'https://saare-api.alfonsoferrertorres.workers.dev/api/v1/intercept',\n  defaultHeaders: { 'X-SAARE-License': '${demoKey}', 'X-SAARE-Suite': 'ALL_SCENARIOS_ACTIVE' }\n});\n\nconst res = await client.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Auditar crédito: Titular con DNI' }]\n});`;
    if (tab === 'python') return `from openai import OpenAI\n\nclient = OpenAI(base_url='https://saare-api.alfonsoferrertorres.workers.dev/api/v1/intercept', default_headers={'X-SAARE-License': '${demoKey}', 'X-SAARE-Suite': 'ALL_SCENARIOS_ACTIVE'})\nres = client.chat.completions.create(model='gpt-4o', messages=[{'role': 'user', 'content': 'Auditar crédito: Titular con DNI'}])`;
    return `curl -X POST https://saare-api.alfonsoferrertorres.workers.dev/api/v1/intercept -H 'Content-Type: application/json' -H 'X-SAARE-License: ${demoKey}' -d '{"prompt": "Auditar crédito: Titular con DNI", "modelTarget": "gpt-4o"}'`;
  };

  return (
    <section id="calculadora" className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 space-y-8 scroll-mt-20">
      <div className="text-center space-y-2">
        <span className="text-[9px] font-mono uppercase px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 font-bold">GOBERNANZA COMPLETA • TODOS LOS ESCENARIOS INCLUIDOS</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Calculadora y Despliegue de Asientos</h2>
        <p className="text-xs text-slate-400 max-w-2xl mx-auto">Ajuste el número exacto de empleados con la ruleta. Disfrute del <strong className="text-white">50% de descuento directo</strong> en el plan anual.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-2"><Users className="w-4 h-4 text-[#C5A059]" /> Asientos a Contratar</label>
              <span className="text-base font-black font-mono text-[#C5A059] bg-slate-900 px-3 py-1 rounded-lg border border-[#C5A059]/40">{numEmpleados} asientos</span>
            </div>
            <input type="range" min="1" max="100" value={numEmpleados} onChange={(e) => setNumEmpleados(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C5A059]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => setPeriodo('anual_promo')} className={`p-3 rounded-xl border cursor-pointer font-mono transition-all ${periodo === 'anual_promo' ? 'bg-[#C5A059]/10 border-[#C5A059] text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="text-[11px] font-bold text-white">Plan Anual Lanzamiento</div>
              <div className="text-[10px] text-amber-400 font-bold mt-0.5">{calculo.mes} € / empleado / mes</div>
              <div className="text-[9px] text-emerald-400 mt-1">Ahorro del 50% el primer año</div>
            </div>
            <div onClick={() => setPeriodo('mensual')} className={`p-3 rounded-xl border cursor-pointer font-mono transition-all ${periodo === 'mensual' ? 'bg-[#C5A059]/10 border-[#C5A059] text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="text-[11px] font-bold text-white">Plan Mensual Regular</div>
              <div className="text-[10px] text-slate-400 mt-0.5">9.00 € / empleado / mes</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-slate-400">Total a facturar:</span>
            <span className="text-2xl font-black font-mono text-[#C5A059]">{calculo.total} €</span>
          </div>
          <button onClick={onOpenCheckout} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#dfba6f] to-[#C5A059] text-black font-black text-xs uppercase tracking-wider font-mono shadow-xl hover:scale-[1.02] transition-all">Expedir {numEmpleados} Tokens con Descuento (-50%)</button>
        </div>
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[420px] shadow-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-[#00f0ff] uppercase font-bold flex items-center gap-2"><Terminal className="w-4 h-4" /> Integración Determinista L7</span>
              <div className="flex gap-1.5">
                {['nodejs', 'python', 'curl'].map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase transition-all ${tab === t ? 'bg-[#C5A059] text-black font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>{t}</button>
                ))}
              </div>
            </div>
            <pre className="select-all font-mono text-xs text-[#00f0ff] leading-relaxed whitespace-pre overflow-x-auto p-2">{getSnippet()}</pre>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(getSnippet()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 hover:border-[#00f0ff] font-mono text-xs uppercase font-bold transition-all flex items-center justify-center gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#00f0ff]" />}
            <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Snippet'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}