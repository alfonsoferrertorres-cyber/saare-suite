import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* 1. NAVEGACIÓN SUPERIOR */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20">
              S
            </span>
            <span className="font-bold text-lg tracking-wide text-slate-100">
              S.A.A.R.E. Suite
            </span>
          </div>
          <div>
            <a
              href="https://console.saare.es"
              className="px-5 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
            >
              Iniciar Sesion
            </a>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="max-w-4xl mx-auto px-6 py-24 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Plataforma alineada con EU AI Act & DORA</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Gobernanza y Cumplimiento IA <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            para Entornos Corporativos
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Protege tus datos, audita el uso de la Inteligencia Artificial y
          garantiza el cumplimiento normativo con una plataforma financiable al
          100% mediante fondos europeos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="https://console.saare.es"
            className="px-8 py-3.5 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/50 transition-all w-full sm:w-auto"
          >
            Acceder a la Consola
          </a>
          <a
            href="#precios"
            className="px-8 py-3.5 text-base font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition-all w-full sm:w-auto"
          >
            Ver Planes y Subvenciones
          </a>
        </div>
      </header>

      {/* 3. PROPUESTA DE VALOR */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100">
              Auditoria tecnica sin friccion comercial
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center text-xl font-bold text-blue-400 mb-6 border border-blue-500/30">
                SEC
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">
                Seguridad Ex-Ante
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Bloquea fugas de datos sensibles antes de que lleguen a los
                modelos de IA, operando en milisegundos.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-xl flex items-center justify-center text-xl font-bold text-emerald-400 mb-6 border border-emerald-500/30">
                GRC
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">
                Cumplimiento Legal
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Genera trazas forenses inmutables listas para auditorias de la
                normativa DORA, NIS2 y la Ley de IA de la UE.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center text-xl font-bold text-amber-400 mb-6 border border-amber-500/30">
                100%
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">
                Financiacion Total
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Nuestros nodos corporativos encajan perfectamente en los
                programas de ayudas de Kit Digital y Kit Consulting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN DE PRECIOS */}
      <section id="precios" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Estrategia de Nodos Corporativos
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Selecciona el despliegue que mejor se adapte a tu infraestructura y
            aprovecha las lineas de financiacion disponibles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Plan PYME */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col">
            <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-2">
              Kit Digital / Consulting
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">
              Nodo PYME
            </h3>
            <div className="text-4xl font-extrabold text-white mb-6">
              290 &#8364;{" "}
              <span className="text-lg font-normal text-slate-500">/mes</span>
            </div>
            <p className="text-slate-400 mb-8 flex-grow">
              Asientos ilimitados por CIF. Cubre ciberseguridad perimetral
              basica y FRIA Art. 27.
            </p>
            <a
              href="https://console.saare.es"
              className="text-center py-3 rounded-lg font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Solicitar Alta
            </a>
          </div>

          {/* Plan Enterprise */}
          <div className="bg-slate-800 border-2 border-blue-500 p-8 rounded-2xl flex flex-col relative shadow-2xl shadow-blue-900/20 transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Recomendado
            </div>
            <div className="text-xs font-bold text-blue-400 tracking-wider uppercase mb-2">
              DORA / NIS2 / Enterprise
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">
              Corporativo PKI
            </h3>
            <div className="text-4xl font-extrabold text-white mb-6">
              3.500 &#8364;{" "}
              <span className="text-lg font-normal text-slate-400">/mes</span>
            </div>
            <p className="text-slate-300 mb-8 flex-grow">
              Despliegue privado Air-Gapped, integracion HSM/PKI propia y firma
              Ed25519 con boveda D1 dedicada.
            </p>
            <a
              href="https://console.saare.es"
              className="text-center py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              Solicitar Despliegue
            </a>
          </div>

          {/* Plan Developer */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col">
            <div className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-2">
              Pro / Developer
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">SDK Edge</h3>
            <div className="text-4xl font-extrabold text-white mb-6">
              149 &#8364;{" "}
              <span className="text-lg font-normal text-slate-500">/mes</span>
            </div>
            <p className="text-slate-400 mb-8 flex-grow">
              Sensor L7 + LabEngine SDK con Token Binding X.509 para hasta 10
              endpoints de desarrollo.
            </p>
            <a
              href="https://console.saare.es"
              className="text-center py-3 rounded-lg font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Empezar a programar
            </a>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CON ENLACES LEGALES REALES */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
          <div>
            <p>2026 MS3V S.A.A.R.E. SL. Todos los derechos reservados.</p>
            <p className="mt-1 font-mono text-xs">
              Trust Anchor: SAARE-MD-IPRES-2026 | ISO 42001 Ready
            </p>
          </div>
          <div className="flex space-x-6 text-xs">
            <a
              href="/legal/aviso-legal.html"
              className="hover:text-slate-300 transition-colors"
            >
              Aviso Legal
            </a>
            <a
              href="mailto:contacto@saare.es"
              className="hover:text-slate-300 transition-colors"
            >
              Contacto Corporativo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
