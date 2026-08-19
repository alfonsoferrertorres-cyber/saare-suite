import React, { useState } from 'react';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [activeCodeTab, setActiveCodeTab] = useState('python');
  const [activeConsoleTab, setActiveConsoleTab] = useState('threats');
  
  // Estado para la calculadora (Conservado)
  const [seats, setSeats] = useState(1);
  const [billingCycle, setBillingCycle] = useState('annual');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const rootNodeHash = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";

  const handleCopyHash = () => {
    navigator.clipboard.writeText(rootNodeHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handleDownloadProof = () => {
    const verificationData = {
      standard: "ISO/IEC 42001:2023 & DORA Framework",
      root_node_hash: rootNodeHash,
      signature_algorithm: "Ed25519 / HMAC-SHA256",
      registration_id: "Safe Creative 2607076315021",
      legal_authority: "Gabinete Jurídico Técnico MS3V",
      latency_ram: "1.16 ms",
      retention_policy: "Stateless - 0 bytes persistidos",
      timestamp: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(verificationData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SAARE_AUDIT_PROOF.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Cálculos de la pasarela original
  const pricePerSeat = billingCycle === 'annual' ? 6 : 12;
  const totalPrice = seats * pricePerSeat * (billingCycle === 'annual' ? 12 : 1);

  const codeSnippets = {
    python: `import openai\n\nclient = openai.OpenAI(\n    base_url="https://saare-api.alfonsoferrertorres.workers.dev/v1",\n    api_key="tu_api_key_de_openai",\n    default_headers={"X-SAARE-License": "SAARE-ENTERPRISE-2026"}\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Analizar balance financiero confidencial"}]\n)\n# Inspección Stateless en RAM (< 2ms) con firma Ed25519 inmutable`,
    node: `import OpenAI from "openai";\n\nconst openai = new OpenAI({\n  baseURL: "https://saare-api.alfonsoferrertorres.workers.dev/v1",\n  apiKey: process.env.OPENAI_API_KEY,\n  defaultHeaders: { "X-SAARE-License": "SAARE-ENTERPRISE-2026" }\n});\n\nconst res = await openai.chat.completions.create({\n  model: "gpt-4o",\n  messages: [{ role: "user", content: "Auditoría de contratos RGPD" }]\n});`,
    curl: `curl https://saare-api.alfonsoferrertorres.workers.dev/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer $OPENAI_API_KEY" \\\n  -H "X-SAARE-License: SAARE-ENTERPRISE-2026" \\\n  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Consulta con datos confidenciales"}]}'`
  };

  const providers = [
    { id: 'openai', name: 'OpenAI', models: 'GPT-4o, o1-preview', icon: '🟢', latency: '1.14 ms' },
    { id: 'anthropic', name: 'Anthropic Claude', models: 'Claude 3.5 Sonnet', icon: '🟣', latency: '1.18 ms' },
    { id: 'azure', name: 'Azure OpenAI', models: 'Private Instances', icon: '🔵', latency: '1.12 ms' },
    { id: 'gemini', name: 'Google Gemini', models: 'Gemini 1.5 Pro', icon: '🔷', latency: '1.16 ms' },
    { id: 'deepseek', name: 'DeepSeek', models: 'DeepSeek-V2', icon: '🐳', latency: '1.15 ms' },
    { id: 'local', name: 'Modelos Locales', models: 'Ollama, vLLM', icon: '⚡', latency: '0.84 ms' }
  ];

  const faqs = [
    { q: "¿Qué significa exactamente '1 empleado protegido' en el licenciamiento?", a: "Corresponde a 1 identidad corporativa con la extensión o proxy L7 activo. Incluye volumen ilimitado de peticiones/tokens, inspección en RAM en tiempo real y generación de evidencia forense sin sobrecostes por uso." },
    { q: "¿Dónde se almacenan los datos de mis empleados?", a: "En ningún sitio. S.A.A.R.E. opera de forma 100% Stateless en RAM volátil. El texto original se purga inmediatamente. Únicamente se almacena el hash criptográfico del incidente en tu Evidence Vault aislada." },
    { q: "¿Cómo se instala en una organización de más de 500 puestos?", a: "Mediante directiva GPO de Directorio Activo, Microsoft Intune o Registry (.reg). El despliegue es desatendido, toma menos de 5 minutos y no requiere intervención individual." },
    { q: "¿Afecta a la velocidad de respuesta de ChatGPT o de nuestras APIs?", a: "No. La latencia media de inspección en memoria RAM es de 1.16 milisegundos, totalmente imperceptible para el usuario humano." }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xl">S</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white">S.A.A.R.E.</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono font-bold">ISV ENTERPRISE</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">AI GOVERNANCE & L7 SECURITY GATEWAY</span>
            </div>
          </a>
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-300">
            <a href="#arquitectura" className="hover:text-cyan-400">Arquitectura L7</a>
            <a href="#certificacion" className="hover:text-cyan-400">Certificación</a>
            <a href="#multi-llm" className="hover:text-cyan-400">Multi-LLM</a>
            <a href="#normativas" className="hover:text-cyan-400">Normativas</a>
            <a href="#pricing" className="hover:text-cyan-400">Licencias</a>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <a href="https://saare-grc-dashboard.streamlit.app/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-bold">📊 GRC Streamlit</a>
            <a href="https://console.saare.es" className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20">🛡️ LOGIN CONSOLE</a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-6 text-center border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span> AI GOVERNANCE & L7 SECURITY GATEWAY
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Protege tus datos antes <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">de que lleguen al LLM.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-300 mb-10">
            Inspecciona, anonimiza y genera evidencia forense inmutable de cada interacción con IA, desde el perímetro de tu infraestructura. Sin almacenar datos en reposo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a href="https://saare-grc-dashboard.streamlit.app/" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg">📊 VER AUDITORÍA GRC EN STREAMLIT</a>
            <button onClick={() => setModalOpen(true)} className="bg-slate-900 border border-slate-700 text-slate-300 font-semibold px-6 py-3.5 rounded-xl text-sm">📜 VER FICHA FORENSE</button>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">⚡ RAM: <strong className="text-cyan-400">1.16 ms</strong></span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">🔒 Firma: <strong className="text-emerald-400">Ed25519 + SHA-256</strong></span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">📜 RPI: <strong className="text-amber-400">2607076315021</strong></span>
          </div>
        </div>
      </section>

      {/* ARQUITECTURA L7 */}
      <section id="arquitectura" className="py-20 px-6 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest block mb-2">ZERO TRUST PARA INTELIGENCIA ARTIFICIAL</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Arquitectura L7 y Flujo Ex-Ante</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Ciclo de Vida Stateless</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li><strong className="text-cyan-400">1. RAM Volátil (< 2ms):</strong> Evaluación en buffers efímeros. Redacción determinista de PII y bloqueo de Jailbreaks.</li>
                <li><strong className="text-emerald-400">2. Residuo Cero:</strong> 0 bytes de texto original almacenados en bases de datos intermedias.</li>
              </ul>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Evidencia Forense Inmutable</h3>
              <p className="text-sm text-slate-300 mb-4">Cada evento genera un sello criptográfico que acredita la custodia ante reguladores, operando bajo estándar ISO/IEC 42001.</p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <span className="text-slate-500 block mb-1">HASH SHA-256 (NODO RAÍZ):</span>
                <code className="text-cyan-300 break-all">{rootNodeHash}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICACIÓN */}
      <section id="certificacion" className="py-20 px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto rounded-3xl bg-slate-950 border border-slate-800 p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase rounded-md">DICTAMEN PERICIAL</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Certificación de Integridad y No Repudio Procesal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono mb-6">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><span className="text-slate-500 block">AUTORIDAD</span><span className="text-slate-200">Gabinete MS3V</span></div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><span className="text-slate-500 block">REGISTRO RPI</span><span className="text-slate-200">Safe Creative 2607076315021</span></div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><span className="text-slate-500 block">ALGORITMO</span><span className="text-emerald-400">Ed25519 + HMAC</span></div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><span className="text-slate-500 block">RETENCIÓN</span><span className="text-cyan-400">Stateless (Residuo 0)</span></div>
          </div>
          <button onClick={handleDownloadProof} className="bg-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs tracking-wide">📥 DESCARGAR PRUEBA JSON</button>
        </div>
      </section>

      {/* MULTI-LLM */}
      <section id="multi-llm" className="py-20 px-6 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4">Un Único Gateway. Cualquier Proveedor de IA.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {providers.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[10px] font-mono text-slate-400">RAM: {p.latency}</span>
                </div>
                <h4 className="text-base font-bold text-white">{p.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{p.models}</p>
              </div>
            ))}
          </div>
          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800">
            <div className="flex gap-2 mb-4">
              {['python', 'node', 'curl'].map((lang) => (
                <button key={lang} onClick={() => setActiveCodeTab(lang)} className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold uppercase ${activeCodeTab === lang ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {lang}
                </button>
              ))}
            </div>
            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* NORMATIVAS */}
      <section id="normativas" className="py-20 px-6 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-10">Alineación Normativa Global</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
              <h4 className="font-bold text-white mb-2">🇪🇺 EU AI ACT & ISO/IEC 42001</h4>
              <p className="text-xs text-slate-400">Trazabilidad ex-ante, mitigación de riesgos sistémicos y generación de registros de eventos inmutables para auditoría GPAI.</p>
            </div>
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
              <h4 className="font-bold text-white mb-2">⚖️ REGLAMENTO DORA & RGPD (Art. 5/9)</h4>
              <p className="text-xs text-slate-400">Minimización radical de datos (Residuo Cero) y blindaje de incidentes TIC aplicable a entidades financieras y sanitarias.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CALCULADORA STRIPE ORIGINAL CONSERVADA EXACTAMENTE SEGÚN INDICACIÓN */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-20 px-6 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest block mb-2">GOBERNANZA COMPLETA • TODOS LOS ESCENARIOS INCLUIDOS</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Calculadora y Despliegue de Asientos</h2>
            <p className="text-slate-400 text-sm">Ajuste el número exacto de empleados con la ruleta. Disfrute del 50% de descuento directo en el plan anual.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800">
            {/* Lado Izquierdo: Ruleta y Planes */}
            <div className="space-y-6">
              <div>
                <label className="text-cyan-400 font-bold text-xs uppercase tracking-wider block mb-4">👤 ASIENTOS A CONTRATAR</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="250" value={seats} 
                    onChange={(e) => setSeats(parseInt(e.target.value, 10))} 
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg font-bold text-white whitespace-nowrap">
                    {seats} asiento{seats !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div onClick={() => setBillingCycle('annual')} className={`p-4 rounded-xl border cursor-pointer transition-all ${billingCycle === 'annual' ? 'bg-cyan-950/30 border-cyan-500' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-sm">Plan Anual Lanzamiento</span>
                    <span className="text-cyan-400 font-bold text-sm">6.00 €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-400 font-mono">Ahorro del 50% el primer año</span>
                    <span className="text-[10px] text-slate-500">/ empleado / mes</span>
                  </div>
                </div>

                <div onClick={() => setBillingCycle('monthly')} className={`p-4 rounded-xl border cursor-pointer transition-all ${billingCycle === 'monthly' ? 'bg-cyan-950/30 border-cyan-500' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-sm">Plan Mensual Regular</span>
                    <span className="text-cyan-400 font-bold text-sm">12.00 €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono">Sin permanencia</span>
                    <span className="text-[10px] text-slate-500">/ empleado / mes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Derecho: Total a Facturar y Botón */}
            <div className="bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col justify-center text-center">
              <span className="text-slate-400 text-xs font-bold tracking-widest block mb-2">TOTAL A FACTURAR:</span>
              <div className="text-5xl font-extrabold text-white mb-2">
                {totalPrice.toLocaleString('es-ES')}.00 € <span className="text-lg text-slate-500 font-normal">+ IVA</span>
              </div>
              
              <span className="text-xs text-slate-400 mb-8 block">
                Facturación {billingCycle === 'annual' ? `Anual (${(seats * 72).toLocaleString('es-ES')}.00 € / asiento / año)` : 'Mensual'}
              </span>
              
              <a 
                href="https://buy.stripe.com/cNiaEX2zz2dTegz2NL8g004" 
                target="_blank" rel="noopener noreferrer" 
                className="w-full inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-4 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
              >
                EXPEDIR {seats} TOKEN{seats !== 1 ? 'S' : ''} (PLAN {billingCycle === 'annual' ? 'ANUAL -50%' : 'MENSUAL'}) ↗
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* ========================================================================= */}

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-10">Resolución de Dudas Técnicas</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <button onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)} className="w-full p-6 text-left flex justify-between focus:outline-none">
                  <h3 className="font-bold text-white text-sm">{faq.q}</h3>
                  <span className="text-cyan-400 font-mono text-xs">{openFaqIndex === idx ? '▲' : '▼'}</span>
                </button>
                {openFaqIndex === idx && <div className="px-6 pb-6 text-sm text-slate-300">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL FORENSE Y BOTÓN FLOTANTE */}
      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> EVIDENCIA FORENSE
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white mb-4">Certificado Forense</h3>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono mb-4 text-cyan-300 break-all">
              {rootNodeHash}
            </div>
            <button onClick={handleDownloadProof} className="w-full bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase">Descargar Prueba JSON</button>
          </div>
        </div>
      )}

    </div>
  );
}
