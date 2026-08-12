import React, { useState } from 'react';

const LAYERS = [
  {
    id: 'data_plane',
    number: '01 / PLANO DE DATOS',
    title: 'Entorno de Ejecución S.A.A.R.E.',
    shortDesc: 'Intercepción L7 y aplicación de políticas en memoria.',
    activeTitle: 'Entorno de Ejecución S.A.A.R.E. (Plano de Datos)',
    subHeader: 'Inspección de intercepción y memoria de Capa 7',
    techs: [
      {
        name: 'Rust',
        desc: 'Core nativo en Rust enfocado en seguridad de memoria (Memory Safety) sin recolector de basura, garantizando latencias ultra-bajas (~140ms P99) en intercepción de microservicios.'
      },
      {
        name: 'C-ABI Nativo',
        desc: 'Interoperabilidad directa vía C-ABI para incrustar el motor de gobernanza directamente en arquitecturas legacy o binarios personalizados de alta frecuencia.'
      },
      {
        name: 'WebAssembly',
        desc: 'Sandboxing ligero mediante módulos Wasm/WASI para la ejecución de políticas dinámicas aisladas en nodos Edge con cero impacto en el host.'
      },
      {
        name: 'Docker',
        desc: 'Despliegue contenerizado mediante Sidecar o Ingress Proxy determinista para orquestación directa en clústeres Kubernetes y entornos Cloud Native.'
      }
    ]
  },
  {
    id: 'control_plane',
    number: '02 / CAPA TRANSVERSAL',
    title: 'Plano de Control',
    shortDesc: 'Orquestación centralizada de políticas y control de licencias.',
    activeTitle: 'Plano de Control y Gobernanza (Control Plane)',
    subHeader: 'Orquestación centralizada y control de licencias',
    techs: [
      {
        name: 'gRPC',
        desc: 'Canal de comunicación asíncrono y de alto rendimiento mediante HTTP/2 e interfaces Protocol Buffers para la distribución masiva de reglas de compliance.'
      },
      {
        name: 'eBPF',
        desc: 'Sondeo transparente a nivel de Kernel Linux para la trazabilidad completa del tráfico de sockets y validación de llamadas al sistema sin modificar código.'
      },
      {
        name: 'OpenTelemetry',
        desc: 'Exportación unificada de métricas, trazas y registros de auditoría hacia los sistemas SIEM/Observabilidad existentes (Datadog, Splunk, Prometheus).'
      },
      {
        name: 'Kubernetes',
        desc: 'Operador nativo (CRDs) para sincronizar automáticamente el estado deseado de cumplimiento y el ciclo de vida de los PEPs en múltiples clusters.'
      }
    ]
  },
  {
    id: 'evidence_vault',
    number: '03 / EVIDENCIA Y GOBERNANZA',
    title: 'Garantía S.A.A.R.E.',
    shortDesc: 'Paquetes de auditoría y registro de evidencia criptográfica.',
    activeTitle: 'Garantía y Bóveda de Evidencias (Evidence Vault)',
    subHeader: 'Trazas probatorias e inmutabilidad criptográfica',
    techs: [
      {
        name: 'Ed25519',
        desc: 'Firma digital de curva elíptica de alta velocidad que certifica el origen inmutable y el estado del payload antes de ser procesado por la IA.'
      },
      {
        name: 'SHA-256',
        desc: 'Generación de huellas digitales unívocas (Hashes) para garantizar la integridad absoluta de los paquetes de auditoría presentados ante reguladores.'
      },
      {
        name: 'JSON-LD',
        desc: 'Formato de datos enlazados estandarizado para la exportación de evidencias legibles e interoperables por sistemas de auditoría externos.'
      },
      {
        name: 'EU AI Act Header',
        desc: 'Inyección ex-ante del cabezal probatorio de cumplimiento que acompaña la petición durante toda la cadena de ejecución del LLM.'
      }
    ]
  }
];

export default function ArchitectureSection() {
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]);
  const [activeTech, setActiveTech] = useState(LAYERS[0].techs[0]);

  const handleLayerChange = (layer) => {
    setActiveLayer(layer);
    setActiveTech(layer.techs[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="text-center mb-10">
        <span className="font-mono text-[10px] tracking-widest text-[#C5A059] border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1 rounded-full uppercase">
          JERARQUÍA DE LA ARQUITECTURA CENTRAL
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-4">
          Arquitectura de Capas Unificadas
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Seleccione cualquier capa para inspeccionar las capacidades y especificaciones técnicas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {LAYERS.map((layer) => {
          const isActive = activeLayer.id === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer)}
              className={`text-left p-6 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900/90 border-[#C5A059] shadow-lg shadow-[#C5A059]/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-mono tracking-wider text-slate-400 block mb-2">
                {layer.number}
              </span>
              <h3 className="text-base font-bold text-white mb-2">{layer.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{layer.shortDesc}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider block mb-1">
              ESPECIFICACIÓN DE LA CAPA ACTIVA
            </span>
            <h3 className="text-xl font-bold text-white">{activeLayer.activeTitle}</h3>
            <p className="text-xs text-slate-400 mt-1">{activeLayer.subHeader}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeLayer.techs.map((tech) => {
              const isSelected = activeTech.name === tech.name;
              return (
                <button
                  key={tech.name}
                  onClick={() => setActiveTech(tech)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold shadow-sm shadow-[#00f0ff]/20'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {tech.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[60px]">
          <h4 className="text-xs font-mono text-[#00f0ff] mb-1">
            Tecnología Seleccionada: <span className="font-bold">{activeTech.name}</span>
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {activeTech.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
