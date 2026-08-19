import React, { useState } from 'react';
import { 
  ShieldCheck, HardDrive, Cloud, FileCheck, CheckCircle2, 
  Terminal, Lock, RefreshCw, Layers, ExternalLink, Download, Folder
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'eu_ai_act_es',
    name: 'EU AI Act  EspaÃ±a',
    category: 'Cumplimiento Normativo',
    desc: 'AnonimizaciÃ³n DNI/IBAN/NIF ex-ante, auditorÃ­a AESIA y firma criptogrÃ¡fica Ed25519.',
    badge: 'MÃ¡xima Seguridad',
    rules: ['DLP EspaÃ±a (DNI, IBAN, NIF)', 'Trazabilidad AlgorÃ­tmica', 'Control de Sesgo', 'Firma Ed25519']
  },
  {
    id: 'banking_dora',
    name: 'Banca & Finanzas DORA',
    category: 'PerÃ­metro Financiero',
    desc: 'ProtecciÃ³n PCI-DSS, detecciÃ³n de tarjetas y cifrado de transacciones L7.',
    badge: 'DORA / PCI-DSS',
    rules: ['DLP Financiero', 'Mapeo Shadow AI', 'Vault VolÃ¡til RAM']
  },
  {
    id: 'mcp_agent_shield',
    name: 'Agentes AutÃ³nomos & MCP',
    category: 'Cortacircuito AgÃ©ntico',
    desc: 'GuardarraÃ­les para llamadas a herramientas y prevenciÃ³n de bucles infinitos.',
    badge: 'Control AgÃ©ntico',
    rules: ['LÃ­mite de bucles MCP', 'InspecciÃ³n de Payloads', 'Firma de llamadas']
  }
];

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState('eu_ai_act_es');
  const [airGapped, setAirGapped] = useState(false);
  const [logs] = useState([
    { id: 'REC-8801', time: '06:32:01', event: 'ValidaciÃ³n de Prompt', result: 'Aprobado', hash: 'e2f5...89a1', synced: true },
    { id: 'REC-8802', time: '06:33:14', event: 'DNI Detectado (Filtro ES)', result: 'Anonimizado en RAM', hash: 'a4b1...32f0', synced: true },
    { id: 'REC-8803', time: '06:34:02', event: 'Registro Inmutable Dual-Vault', result: 'Firmado Local + Cloud', hash: 'c9d8...11e4', synced: true }
  ]);

  const currentScenarioObj = SCENARIOS.find(s => s.id === activeScenario);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera del Centro de Mando */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                RUNTIME ACTIVO
              </span>
              <span className="text-xs font-mono text-slate-400">Node: saare-edge-eu-west</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Centro de Mando <span className="text-[#C5A059]">&amp; Registro Dual-Vault</span>
            </h1>
          </div>

          {/* Interruptor Modo Aislamiento / Air-Gapped */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <span className="text-xs font-mono text-slate-300">Modo Aislamiento Estricto (Air-Gapped):</span>
            <button
              onClick={() => setAirGapped(!airGapped)}
              className={airGapped ? "px-3 py-1 rounded-md text-xs font-bold transition-all bg-amber-500 text-black" : "px-3 py-1 rounded-md text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:text-white"}
            >
              {airGapped ? 'ACTIVADO (Solo Local)' : 'DESACTIVADO (Dual-Vault)'}
            </button>
          </div>
        </div>

        {/* Panel Principal: SelecciÃ³n de Escenarios */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono text-[#C5A059] uppercase tracking-wider">
            1. Escenario de ProtecciÃ³n Activo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIOS.map((sc) => {
              const isActive = activeScenario === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setActiveScenario(sc.id)}
                  className={isActive ? "p-5 rounded-2xl border cursor-pointer transition-all bg-slate-900 border-[#C5A059] shadow-lg shadow-[#C5A059]/10" : "p-5 rounded-2xl border cursor-pointer transition-all bg-slate-900/40 border-slate-800/80 hover:border-slate-700"}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/20">
                      {sc.badge}
                    </span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />}
                  </div>
                  <h3 className="font-bold text-white text-base">{sc.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.desc}</p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {sc.rules.map((r, i) => (
                      <span key={i} className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                         {r}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Almacenamiento Dual-Vault */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">2. Arquitectura de Almacenamiento Dual-Vault</h2>
              <p className="text-xs text-slate-400">GarantÃ­a de inmutabilidad y soberanÃ­a de datos sincrÃ³nica.</p>
            </div>
            <span className="text-xs font-mono text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-lg border border-[#C5A059]/30">
              Escenario Actual: {currentScenarioObj?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Almacenamiento Local */}
            <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Almacenamiento Local (PC / Servidor)</h3>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  SIEMPRE ACTIVO
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <p className="text-slate-400 text-[11px]">Ruta local de evidencias:</p>
                <p className="text-emerald-400 font-bold break-all">C:\.saare\evidence_vault\</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Los recibos JSON con firma Ed25519 se guardan directamente en el disco duro del cliente sin requerir red.
              </p>
            </div>

            {/* Almacenamiento Cloud Sincronizado */}
            <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-[#00f0ff]" />
                  <h3 className="font-bold text-sm text-white">Respaldo Cloud (Vault S.A.A.R.E.)</h3>
                </div>
                <span className={airGapped ? "text-[10px] font-mono px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20" : "text-[10px] font-mono px-2 py-0.5 rounded border bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/20"}>
                  {airGapped ? 'DESACTIVADO (AIR-GAPPED)' : 'SINCRONIZADO'}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <p className="text-slate-400 text-[11px]">Destino de respaldo inmutable:</p>
                <p className="text-[#00f0ff] font-bold break-all">
                  {airGapped ? 'ConexiÃ³n pausada por polÃ­tica' : 'https://vault.saare.es/tenant/01-es'}
                </p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ãšnicamente se sincronizan recibos con hashes sin contenido sensible para permitir auditorÃ­as remotas.
              </p>
            </div>

          </div>

          {/* Tabla de Registro de Evidencias */}
          <div className="pt-2">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Registro de Actividad y Evidencias CriptogrÃ¡ficas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="pb-2">ID Recibo</th>
                    <th className="pb-2">Hora</th>
                    <th className="pb-2">Evento / IntercepciÃ³n</th>
                    <th className="pb-2">Veredicto</th>
                    <th className="pb-2">Hash Ed25519</th>
                    <th className="pb-2">Estado Dual-Vault</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-[#C5A059]">{log.id}</td>
                      <td className="py-2.5 text-slate-400">{log.time}</td>
                      <td className="py-2.5">{log.event}</td>
                      <td className="py-2.5">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                          {log.result}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">{log.hash}</td>
                      <td className="py-2.5">
                        <span className="text-[10px] text-slate-300">
                           Local {(!airGapped && log.synced) ? '+ Cloud ' : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

