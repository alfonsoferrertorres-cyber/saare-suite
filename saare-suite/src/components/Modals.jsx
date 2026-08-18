import React from 'react';
import { X, Download } from 'lucide-react';

export default function Modals({ isCheckout, setIsCheckout, isGrant, setIsGrant, numEmpleados, calculo, form, setForm }) {
  const downloadExpediente = () => {
    const link = document.createElement('a');
    link.href = '/docs/SAARE-Technical-Whitepaper-v14.pdf';
    link.download = 'SAARE-Expediente-Tecnico-Kit-Consulting.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsGrant(false);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const qty = numEmpleados || 1;
    const email = form?.email || '';
    const cif = form?.cif || '';
    const empresa = form?.empresa || '';
    window.location.href = `https://buy.stripe.com/TU_ENLACE_STRIPE?quantity=${encodeURIComponent(qty)}&client_reference_id=${encodeURIComponent(cif || empresa)}&prefilled_email=${encodeURIComponent(email)}`;
  };

  return (
    <>
      {isCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-mono">Adquirir {numEmpleados} Tokens Corporativos</h3>
              <button type="button" onClick={() => setIsCheckout(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Empresa / Razón Social"
                  value={form?.empresa || ''}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="CIF / NIF"
                  value={form?.cif || ''}
                  onChange={(e) => setForm({ ...form, cif: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                />
              </div>
              <input
                type="email"
                required
                placeholder="auditor@empresa.com"
                value={form?.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#C5A059] text-black font-black font-mono text-xs uppercase tracking-wider hover:bg-[#dfba6f] transition-all shadow-lg cursor-pointer"
              >
                Confirmar Pedido • {calculo?.total || 72} €
              </button>
            </form>
          </div>
        </div>
      )}

      {isGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-mono">Memoria Técnica Kit Consulting</h3>
              <button type="button" onClick={() => setIsGrant(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Expediente preconfigurado bajo la categoría de Asesoramiento en IA (AESIA / ISO 42001) para justificación del 100% del bono digital.
            </p>
            <button
              type="button"
              onClick={downloadExpediente}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Expediente Oficial (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
