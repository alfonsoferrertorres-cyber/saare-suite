import React from 'react';
import { Link } from 'react-router-dom';

export default function PlatformPage() {
  const planes = [
    {
      num: '01',
      title: 'PLANO DE DATOS',
      subtitle: 'Entorno de Ejecución S.A.A.R.E.',
      detail: 'Inspección de intercepción y memoria de Capa 7',
      tags: ['Rust', 'C-ABI Nativo', 'WebAssembly', 'Docker'],
      desc: 'Proxy integrado y entorno de ejecución SDK que actúa como un punto de aplicación de políticas (PEP) de Capa 7 determinista entre las aplicaciones/agentes y la infraestructura LLM. Evalúa las indicaciones y las respuestas en memoria volátil sin almacenamiento persistente de datos.',
      capabilities: [
        'Inspección residente en RAM (Referencia: Benchmark < 1,16 ms)',
        'Sanitización previa de datos sensibles (PII / PCI / PHI)',
        'Bloqueo activo de nivel 7 de inyecciones rápidas y jailbreaks',
        'Interruptor de circuito del agente MCP y conmutación por error multi-LLM'
      ],
      image: '/Gemini_Generated_Image_re94tdre94tdre94.png',
      alt: 'Esquema Arquitectura S.A.A.R.E. MS3V'
    },
    {
      num: '02',
      title: 'CAPA TRANSVERSAL',
      subtitle: 'Plano de Control S.A.A.R.E.',
      detail: 'Orquestación centralizada de políticas y control de licencias',
      tags: ['Control Plane', 'gRPC', 'TLS 1.3', 'LicenseGuard'],
      desc: 'Capa transversal encargada de la orquestación distribuida de políticas de seguridad. Sincroniza dinámicamente las reglas deterministas y el estado del licenciamiento hacia todos los agentes y gateways L7 desplegados en la organización.',
      capabilities: [
        'Distribución de reglas deterministas en tiempo real (< 1,2 ms)',
        'Gestión unificada de identidades, roles y permisos de acceso a LLMs',
        'Sincronización segura mediante canales cifrados TLS 1.3',
        'Verificación de licencias Zero-Disk con aislamiento por inquilino'
      ],
      image: '/ARQUITECTURA DE POLÍTICAS.jpg',
      alt: 'Plano de Control S.A.A.R.E.'
    },
    {
      num: '03',
      title: 'EVIDENCIA Y GOBERNANZA',
      subtitle: 'Garantía S.A.A.R.E.',
      detail: 'Paquetes de auditoría y registro de evidencia criptográfica',
      tags: ['Ed25519', 'HMAC-SHA256', 'EU AI Act', 'ISO 42001'],
      desc: 'Módulo de auditoría que transforma las decisiones operativas tomadas en tiempo de ejecución en pruebas criptográficas irrefutables. Sella electrónicamente cada transacción para comités de riesgos, CISOs y reguladores.',
      capabilities: [
        'Firmas criptográficas Ed25519 e inmutabilidad por transacción',
        'Generación automática de evidencias alineadas con EU AI Act y DORA',
        'Mapeo continuo de controles para cumplimiento ISO/IEC 42001',
        'Paneles de control ejecutivos para análisis de riesgos y métricas'
      ],
      image: '/EVIDENCIA Y GOBERNANZA.png',
      alt: 'Garantía S.A.A.R.E.'
    }
  ];

  const blocks = [
    {
      tag: '01 • RIESGO: TRÁFICO EXPOSICIÓN',
      title: 'Intercepción Ex-Ante',
      desc: 'Protege el perímetro impidiendo que empleados o agentes envíen datos confidenciales (PII, código, PHI) o ejecuten instrucciones destructivas en modelos de IA.'
    },
    {
      tag: '02 • SOLUCIÓN: ESCUDO EN RAM',
      title: 'Procesamiento Residente en RAM',
      highlight: true,
      desc: 'Procesa e inspecciona peticiones en memoria volátil. Anonimiza datos sensibles y bloquea jailbreaks con cero almacenamiento de cargas útiles en disco.'
    },
    {
      tag: '03 • RESULTADO: EVIDENCIA LEGAL',
      title: 'Recibos Ed25519',
      desc: 'Sella cada transacción aprobada con firmas Ed25519 y hashes HMAC-SHA256, generando recibos inmutables alineados con el EU AI Act e ISO 42001.'
    }
  ];

  return (
    <div className="bg-[#050811] text-white min-h-screen font-sans border-t border-slate-900 relative overflow-hidden">
      {/* Resplandor ambiental sobrio en oro */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C5A059]/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12 relative z-10">
        
        {/* ENCABEZADO PRINCIPAL REVISADO */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-[#C5A059] tracking-tight leading-tight">
            S.A.A.R.E.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed text-justify sm:text-center">
            S.A.A.R.E. integra en su lógica el método empírico-científico a través de su runtime <span className="text-[#C5A059] font-mono font-semibold">MS3V</span>. Este motor garantiza los pilares fundamentales de la ciberseguridad y el gobierno de la información mediante un tratamiento automatizado exento de intervención humana, estableciendo una traza de evidencia inmutable y unificando criterios frente a escenarios heterogéneos. A continuación, se detallan los componentes clave de cada una de sus capas para comprender la arquitectura base del Sistema:
          </p>
        </div>

        {/* LISTA VERTICAL CAPA POR CAPA */}
        <div className="space-y-10">
          {planes.map((p) => (
            <div key={p.num} className="bg-[#0B0F19] border border-[#C5A059]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <span className="text-[#C5A059] font-mono text-xs uppercase tracking-widest block mb-1">
                    {p.num} / {p.title}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white">
                    {p.subtitle}
                  </h2>
                  <p className="text-slate-400 text-xs font-mono mt-1">
                    {p.detail}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {p.tags.map((tag) => (
                    <span key={tag} className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {p.desc}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {p.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                        <span className="text-[#C5A059] font-bold">✓</span>
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#C5A059]/30 shadow-xl bg-slate-900">
                  <img 
                    src={p.image} 
                    alt={p.alt} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3 BLOQUES: RIESGO, SOLUCIÓN Y RESULTADO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-6">
          {blocks.map((b) => (
            <div 
              key={b.tag} 
              className={`bg-[#0B0F19] rounded-2xl p-6 space-y-3 ${
                b.highlight 
                  ? 'border border-[#C5A059]/40 shadow-xl shadow-[#C5A059]/5' 
                  : 'border border-slate-800 shadow-lg'
              }`}
            >
              <div className="text-[#C5A059] font-mono text-xs font-semibold uppercase tracking-wider border-b border-slate-800 pb-2">
                {b.tag}
              </div>
              <h3 className={`font-serif text-lg font-bold ${b.highlight ? 'text-[#C5A059]' : 'text-white'}`}>
                {b.title}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>

        {/* DÓNDE OPERA SAARE Y FLUJO DE DATOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-[#C5A059]">¿Dónde opera S.A.A.R.E.?</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Modelos de implementación empresarial agnósticos diseñados para entornos híbridos seguros.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-slate-200 text-center">
                AWS / Azure / GCP
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-slate-200 text-center">
                Pods Kubernetes / Docker
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-slate-200 text-center">
                Nube Privada Local
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg text-slate-200 text-center">
                Air-Gapped / Alta Seguridad
              </div>
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-[#C5A059]">¿Hacia dónde fluyen los datos?</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Clara separación entre el procesamiento del plano de datos volátiles y el almacenamiento de la telemetría del cliente.
            </p>

            <div className="space-y-3 pt-1 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <span className="font-bold text-slate-200">Inspección de la Carga Útil:</span>
                <span className="font-mono text-[#C5A059]">Memoria RAM volátil (Sin persistencia)</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <span className="font-bold text-slate-200">Auditoría y Telemetría:</span>
                <span className="font-mono text-slate-300">VPC del Inquilino / Endpoint Cliente</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <span className="font-bold text-slate-200">Sincronización del Plano de Control:</span>
                <span className="font-mono text-slate-300">Canal TLS 1.3 Cifrado</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN PRINCIPALES */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link 
            to="/discovery" 
            className="w-full sm:w-auto bg-[#C5A059] hover:bg-white text-black font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all text-center shadow-lg hover:shadow-[#C5A059]/20"
          >
            Iniciar el Programa de Descubrimiento
          </Link>

          <Link 
            to="/discovery?action=architecture-review" 
            className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border border-[#C5A059]/50 text-[#C5A059] font-bold text-sm px-8 py-3.5 rounded-xl transition-all text-center"
          >
            Solicitar Revisión de Arquitectura
          </Link>
        </div>

      </div>
    </div>
  );
}