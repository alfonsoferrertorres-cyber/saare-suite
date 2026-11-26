import React from 'react';

export default function ZeroCloudComparison() {
  const governanceAreas = [
    {
      code: 'Gobernanza de IA',
      articles: 'Control y supervisión',
      desc: 'Aplicación de políticas preventivas y trazabilidad sobre las interacciones con modelos de IA.'
    },
    {
      code: 'Privacidad',
      articles: 'Minimización de datos',
      desc: 'Detección y tratamiento de información sensible antes de su envío hacia los modelos.'
    },
    {
      code: 'Confidencialidad',
      articles: 'Protección de activos',
      desc: 'Control sobre la información corporativa y técnica compartida en los flujos operativos.'
    },
    {
      code: 'Integridad de Registros',
      articles: 'Evidencia verificable',
      desc: 'Generación de registros estructurados con sellado temporal y comprobación criptográfica.'
    }
  ];

  return (
    <div className="w-full my-16 text-white font-sans">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold">
          Auditoría Tradicional vs. Control Preventivo S.A.A.R.E.
        </h3>
        <p className="text-slate-400 mt-2 text-base max-w-2xl mx-auto">
          Comparativa técnica entre el registro posterior centralizado y la evaluación preventiva en el flujo.
        </p>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-2xl mb-12 bg-slate-950 shadow-2xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-mono text-xs">
              <th className="p-4 font-semibold">Criterio</th>
              <th className="p-4 font-semibold text-rose-400">Registro Posterior Convencional</th>
              <th className="p-4 font-semibold text-emerald-400">Control Preventivo S.A.A.R.E.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="p-4 font-semibold text-white">Momento de Evaluación</td>
              <td className="p-4 text-slate-400">Tras la operación o el incidente</td>
              <td className="p-4 text-emerald-300 font-semibold">Antes del envío al modelo</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Tratamiento de Datos</td>
              <td className="p-4 text-slate-400">Copia o almacenamiento centralizado</td>
              <td className="p-4 text-emerald-300 font-semibold">Evaluación en memoria sin persistencia innecesaria</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Independencia del Modelo</td>
              <td className="p-4 text-slate-400">Acoplada al proveedor o aplicación</td>
              <td className="p-4 text-emerald-300 font-semibold">Políticas separadas del modelo utilizado</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Reglas de Decisión</td>
              <td className="p-4 text-slate-400">Revisión manual o heurística tardía</td>
              <td className="p-4 text-emerald-300 font-semibold">Políticas configurables y deterministas</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold text-white">Integridad de Evidencias</td>
              <td className="p-4 text-slate-400">Registros planos sin verificación</td>
              <td className="p-4 text-emerald-300 font-semibold">Paquetes de evidencia verificables</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {governanceAreas.map((area, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all">
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider block uppercase">
              {area.articles}
            </span>
            <h4 className="text-base font-bold text-white mt-1 mb-2">
              {area.code}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {area.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}