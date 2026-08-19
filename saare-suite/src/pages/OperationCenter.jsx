import React, { useState } from 'react';
import { 
  Activity, GitMerge, Layers, Sliders, ShieldCheck, Database, Server, 
  Terminal, CheckCircle2, RefreshCw, Play, ArrowRight, ChevronRight 
} from 'lucide-react';

const MODULES_DATA = [
  { id: 'perimeter', name: 'PerimeterShield', type: 'L7 Proxy', desc: 'Protección de datos sensibles (PII, PCI, IBAN) e inspección de payloads.', techMode: 'Deterministic RAM Enforcement' },
  { id: 'rate', name: 'TokenMatrix', type: 'Throttle Engine', desc: 'Control de tasa de consumo por token y prevención de abusos.', techMode: 'Token Bucket / Sliding Window' },
  { id: 'evidence', name: 'EvidenceVault', type: 'Ledger Engine', desc: 'Registro inmutable de evidencias con firmas criptográficas Ed25519.', techMode: 'Cryptographic Ed25519 Signed' }
];

const PRESETS_DATA = {
  perimeter: [
    { id: 'p1', name: 'Banking Shield', desc: 'Máxima rigidez para entornos bancarios y financieros.', toggles: ['PIIDetection', 'PCIDetection', 'IBANDetection'] },
    { id: 'p2', name: 'Enterprise AI Guard', desc: 'Protección enfocada en LLMs y prevención de Prompt Injections.', toggles: ['PromptInjection', 'EvidenceGeneration'] }
  ]
};

export default function OperationCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRoleLevel, setUserRoleLevel] = useState('business');
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [selectedModule, setSelectedModule] = useState(MODULES_DATA[0]);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS_DATA.perimeter[0]);
  const [configState, setConfigState] = useState({
    PIIDetection: true, PCIDetection: true, IBANDetection: true,
    PromptInjection: true, EvidenceGeneration: true, actionOnDetection: 'BLOCK', retention: 'Client Infrastructure'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);

  const handleNextStep = () => setBuilderStep((prev) => Math.min(prev + 1, 6));
  const handlePrevStep = () => setBuilderStep((prev) => Math.max(prev - 1, 1));

  const runDeployment = () => {
    setIsDeploying(true);
    setDeployStep(0);
    const steps = ['INITIALIZING', 'LOADING POLICY', 'STARTING MODULES', 'VERIFYING CONFIGURATION', 'RUNTIME ACTIVE'];
    steps.forEach((_, index) => {
      setTimeout(() => {
        setDeployStep(index + 1);
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsDeploying(false);
            setActiveTab('overview');
          }, 1200);
        }
      }, (index + 1) * 800);
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-cyan-500/20">S</div>
            <span className="font-mono text-lg font-bold tracking-wider text-slate-100">SAARE<span className="text-cyan-400">.CONSOLE</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">RUNTIME ACTIVE</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-400 font-mono">
          <div><span className="text-slate-500">ENGINE:</span> <span className="text-slate-200">v4.8-core</span></div>
          <div><span className="text-slate-500">PROTECTION:</span> <span className="text-emerald-400">100% ENFORCED</span></div>
          <div><span className="text-slate-500">EVIDENCE:</span> <span className="text-cyan-400">VALIDATED (Ed25519)</span></div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs font-mono">
            {['business', 'operator', 'engineer'].map((lvl) => (
              <button key={lvl} onClick={() => setUserRoleLevel(lvl)} className={`px-2.5 py-1 rounded capitalize ${userRoleLevel === lvl ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                {lvl}
              </button>
            ))}
          </div>
          <button onClick={() => setShowTechnicalTrace(!showTechnicalTrace)} className={`p-2 rounded-lg border transition ${showTechnicalTrace ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BODY CON SIDEBAR DE NAVEGACIÓN */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1">
            <div className="text-[10px] font-mono font-semibold text-slate-500 tracking-wider px-3 mb-2 uppercase">Operación</div>
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
              <Activity className="w-4 h-4" /><span>Overview</span>
            </button>
            <button onClick={() => setActiveTab('builder')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'builder' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
              <GitMerge className="w-4 h-4" /><span>Pipeline Builder</span>
            </button>

            <div className="text-[10px] font-mono font-semibold text-slate-500 tracking-wider px-3 pt-4 mb-2 uppercase">Gobernanza</div>
            {[
              { id: 'modules', label: 'Modules', icon: Layers },
              { id: 'presets', label: 'Presets', icon: Sliders },
              { id: 'policies', label: 'Policies', icon: ShieldCheck },
              { id: 'evidence', label: 'Evidence Vault', icon: Database },
              { id: 'integrations', label: 'Integrations', icon: Server }
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
                <item.icon className="w-4 h-4" /><span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Operation Center</h1>
                  <p className="text-sm text-slate-400">Monitoreo determinista de gobernanza, intercepciones y evidencia criptográfica.</p>
                </div>
                <button onClick={() => setActiveTab('builder')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center space-x-2 shadow-lg shadow-cyan-500/10">
                  <GitMerge className="w-4 h-4" /><span>Configure New Pipeline</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 block mb-1">INTERCEPCIONES L7</span>
                  <span className="text-2xl font-bold text-slate-100">12,842</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 block mb-1">LATENCIA P50</span>
                  <span className="text-2xl font-bold text-emerald-400">0.18 ms</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 block mb-1">LATENCIA P95</span>
                  <span className="text-2xl font-bold text-emerald-400">0.56 ms</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 block mb-1">LATENCIA P99</span>
                  <span className="text-2xl font-bold text-cyan-400">0.96 ms</span>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="text-xl font-bold capitalize text-slate-100 mb-2">{activeTab} Section</h2>
              <p className="text-xs text-slate-400 font-mono">[SYSTEM OK] Módulo activo en el runtime determinista.</p>
            </div>
          )}

          {showTechnicalTrace && (
            <div className="mt-8 border border-cyan-500/30 bg-slate-900/90 rounded-xl p-4 font-mono text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-cyan-400 font-bold">TECHNICAL TRACE (ENGINEER LEVEL)</span>
                <button onClick={() => setShowTechnicalTrace(false)}>?</button>
              </div>
              <p>TRACE ID: SAARE-89F2A10B4 | CRYPTO RECEIPT: Ed25519 Verified</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
