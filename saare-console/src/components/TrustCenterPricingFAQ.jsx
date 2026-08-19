import React, { useState } from 'react';

export default function TrustCenterPricingFAQ() {
  const [seats, setSeats] = useState(25);
  const [billingCycle, setBillingCycle] = useState('annual'); // 'annual' o 'monthly'

  // Precios: 6€/mes (facturado anual = 72€/año/puesto) | 12€/mes (facturado mensual)
  const pricePerSeat = billingCycle === 'annual' ? 6 : 12;
  const totalPrice = seats * pricePerSeat * (billingCycle === 'annual' ? 12 : 1);

  const trustCenterItems = [
    { name: "EU AI Act & ISO 42001", status: "Certificado", desc: "Trazabilidad técnica ex-ante y debida diligencia algorítmica." },
    { name: "Reglamento RGPD (Art. 5 y 9)", status: "Residuo Cero", desc: "0 segundos de persistencia de prompts. Tratamiento stateless en RAM." },
    { name: "Regulación DORA / PCI-DSS", status: "Auditable", desc: "Custodia de evidencias forenses inmutables y no repudio procesal." },
    { name: "Criptografía Asimétrica", status: "Ed25519 + SHA256", desc: "Claves de firma aisladas y bóveda Evidence Vault particionada." },
    { name: "Despliegue Forzado GPO", status: "Active Directory", desc: "Inmune a desinstalación por parte del usuario final o actualizaciones." },
    { name: "SLA Corporativo", status: "99.99% Edge", desc: "Enrutamiento perimetral global Cloudflare con latencia < 2 ms." }
  ];

  const faqs = [
    {
      q: "¿Qué significa exactamente '1 empleado protegido' en el licenciamiento?",
      a: "Corresponde a 1 identidad corporativa con la extensión o proxy L7 activo. Incluye volumen ilimitado de peticiones/tokens, inspección en RAM en tiempo real y generación de evidencia forense sin sobrecostes por uso."
    },
    {
      q: "¿Dónde se almacenan los datos de mis empleados?",
      a: "En ningún sitio. S.A.A.R.E. opera de forma 100% Stateless en RAM volátil. El texto original del prompt se purga inmediatamente tras la evaluación de políticas. Únicamente se almacena el hash criptográfico del incidente en tu Evidence Vault aislada."
    },
    {
      q: "¿Cómo se instala en una organización de más de 500 puestos?",
      a: "Mediante directiva GPO de Directorio Activo, Microsoft Intune o Registry (.reg). El despliegue es desatendido, toma menos de 5 minutos y no requiere intervención individual por parte de los empleados."
    },
    {
      q: "¿Afecta a la velocidad de respuesta de ChatGPT o de nuestras APIs?",
      a: "No. La latencia media de inspección en memoria RAM es de 1.16 milisegundos, totalmente imperceptible para el usuario humano y compatible con flujos de inferencia en tiempo real."
    }
  ];

  return (
    <div className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-24">

        {/* ============================================================ */}
        {/* 01. TRUST CENTER (CENTRO DE CONFIANZA & GRC) */}
        {/* ============================================================ */}
        <section id="trust-center">
          <div className="text-center mb-14">
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
              GARANTÍA INSTITUCIONAL & LEGAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              S.A.A.R.E. Trust Center
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Transparencia técnica absoluta sobre nuestra arquitectura de seguridad, cifrado y cumplimiento normativo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustCenterItems.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-semibold">
                    {item.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 02. PRICING TRANSPARENTE & CALCULADORA */}
        {/* ============================================================ */}
        <section id="pricing" className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-2xl">
          <div className="text-center mb-10">
            <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
              MODELO DE LICENCIAMIENTO ENTERPRISE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Calculadora de Protección Perimetral
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm">
              Sin límites de tokens. Sin costes ocultos. Licenciamiento por identidad corporativa protegida.
            </p>
          </div>

          {/* Toggle Mensual / Anual */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'annual' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pago Anual (6 €/mes/puesto) · 50% Ahorro
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pago Mensual (12 €/mes/puesto)
              </button>
            </div>
          </div>

          {/* Slider Interactivo */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-400">Puestos / Empleados a proteger:</span>
              <span className="text-cyan-400 font-bold text-base">{seats} {seats === 1 ? 'puesto' : 'puestos'}</span>
            </div>
            <input
              type="range"
              min="1"
              max="250"
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>1 puesto</span>
              <span>50 puestos</span>
              <span>100 puestos</span>
              <span>250+ puestos</span>
            </div>
          </div>

          {/* Resumen de Propuesta */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center mb-6">
            <span className="text-xs font-mono text-slate-400 block mb-1">Inversión Total Estimada:</span>
            <div className="text-4xl font-extrabold text-white mb-1">
              {totalPrice.toLocaleString('es-ES')} €
              <span className="text-xs text-slate-400 font-normal"> / {billingCycle === 'annual' ? 'año' : 'mes'}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 block mb-6">
              Incluye tokens ilimitados + Despliegue GPO + Evidence Vault
            </span>
            <a
              href="https://buy.stripe.com/cNiaEX2zz2dTegz2NL8g004"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20"
            >
              CONTRATAR AHORA CON STRIPE →
            </a>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 03. PREGUNTAS FRECUENTES ENTERPRISE (FAQ) */}
        {/* ============================================================ */}
        <section id="faq">
          <div className="text-center mb-12">
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
              RESOLUCIÓN DE DUDAS TÉCNICAS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Preguntas Frecuentes para Directores de TI y CISOs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-start gap-2">
                  <span className="text-cyan-400 font-mono">Q.</span> {faq.q}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 04. CTA FINAL DE CONVERSIÓN */}
        {/* ============================================================ */}
        <section className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Tu IA ya está funcionando. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                Ahora haz que sea gobernable.
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
              Activa la protección L7 en tu infraestructura. Sin tarjeta, sin modificar modelos y con informe de auditoría forense incluido.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://saare-grc-dashboard.streamlit.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-xl shadow-cyan-500/20"
              >
                PROBAR SANDBOX L7 (7 DÍAS GRATIS)
              </a>
              <a
                href="https://console.saare.es"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-8 py-4 rounded-xl text-sm transition-all"
              >
                ACCESO CONSOLA ENTERPRISE
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
