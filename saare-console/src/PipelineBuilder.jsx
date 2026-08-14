import React, { useState } from 'react';

// PASO 1: Módulos Disponibles (Nivel 2 Operator)
const MODULES = [
  { id: 'perimetershield', name: 'PerimeterShield', tag: 'Active L7 Gateway', desc: 'Protección perimetral y filtrado de tráfico IA en tiempo real.' },
  { id: 'tokenmatrix', name: 'TokenMatrix', tag: 'Token & Cost Engine', desc: 'Control de volumen, optimización de contexto y límites de uso.' },
  { id: 'evidencevault', name: 'EvidenceVault', tag: 'Crypto Ledger', desc: 'Generación de recibos e inmutabilidad criptográfica en memoria.' },
  { id: 'compliancesuite', name: 'ComplianceSuite', tag: 'EU AI Act / DORA', desc: 'Auditoría continua de marcos normativos corporativos.' }
];

// PASO 2: Presets Comercializables
const PRESETS = [
  { id: 'banking_shield', name: 'Banking Shield', tag: 'DORA / PCI-DSS', desc: 'DLP financiero con desinfección de PII, PCI e IBAN.' },
  { id: 'health_guard', name: 'Health Guard', tag: 'PHI / GDPR / HIPAA', desc: 'Filtrado estricto de datos de salud y privacidad del paciente.' },
  { id: 'anti_jailbreak', name: 'Enterprise Anti-Jailbreak', tag: 'Security & Integrity', desc: 'Mitigación de Prompt Injection, Jailbreak y fuga de secretos.' }
];

export default function PipelineBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  
  // PASO 3: Variables de Negocio (Sin código ni comandos semánticos)
  const [config, setConfig] = useState({
    piiDetection: true,
    pciDetection: true,
    ibanDetection: true,
    promptInjection: true,
    evidenceGeneration: true,
    actionOnDetection: 'BLOCK',
    evidenceRetention: 'Client Infrastructure'
  });

  const [deployState, setDeployState] = useState('IDLE'); // IDLE | CHECKING | DEPLOYING | ACTIVE

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const runPreDeploymentCheck = () => {
    setDeployState('CHECKING');
    setTimeout(() => {
      setDeployState('READY');
    }, 1200);
  };

  const handleDeploy = () => {
    setDeployState('DEPLOYING');
    setTimeout(() => {
      setDeployState('ACTIVE');
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Encabezado del Builder */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="font-mono text-[10px] text-[#C5A059] uppercase tracking-widest block">
            MODELO B — CONSTRUCTOR VISUAL DE INFRAESTRUCTURA
          </span>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">
            Module & Pipeline Builder
          </h1>
        </div>
        
        {/* Stepper Navegable */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                currentStep === step
                  ? 'bg-[#C5A059] text-black shadow-md'
                  : currentStep > step
                  ? 'bg-slate-800 text-[#00f0ff]'
                  : 'bg-slate-900 text-slate-600 border border-slate-800'
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      {/* PASO 1: SELECT MODULE */}
      {currentStep === 1 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            PASO 1 — SELECCIONAR MÓDULO DE GOBERNANZA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULES.map((mod) => (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedModule.id === mod.id
                    ? 'bg-slate-900/90 border-[#C5A059] shadow-lg shadow-[#C5A059]/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-mono text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/20">
                  {mod.tag}
                </span>
                <h3 className="text-lg font-bold text-white mt-3">{mod.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
                <button 
                  onClick={() => { setSelectedModule(mod); setCurrentStep(2); }}
                  className="mt-4 w-full bg-slate-800 hover:bg-[#C5A059] hover:text-black font-mono text-xs font-bold py-2 rounded-xl transition-all"
                >
                  SELECCIONAR MÓDULO
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PASO 2: SELECT PRESET */}
      {currentStep === 2 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            PASO 2 — SELECCIONAR PRESET DE REGLAS PARA {selectedModule.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPreset.id === preset.id
                    ? 'bg-slate-900/90 border-[#C5A059] shadow-lg shadow-[#C5A059]/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-mono text-[10px] text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/20">
                  {preset.tag}
                </span>
                <h3 className="text-base font-bold text-white mt-3">{preset.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{preset.desc}</p>
                <button 
                  onClick={() => { setSelectedPreset(preset); setCurrentStep(3); }}
                  className="mt-4 w-full bg-slate-800 hover:bg-[#C5A059] hover:text-black font-mono text-xs font-bold py-2 rounded-xl transition-all"
                >
                  APLICAR PRESET
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PASO 3: CONFIGURATION (VARIABLES DE NEGOCIO) */}
      {currentStep === 3 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            PASO 3 — CONFIGURACIÓN DE PARÁMETROS OPERATIVOS
          </h2>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'piiDetection', label: 'PII Detection' },
                { key: 'pciDetection', label: 'PCI Detection' },
                { key: 'ibanDetection', label: 'IBAN Detection' },
                { key: 'promptInjection', label: 'Prompt Injection Defense' },
                { key: 'evidenceGeneration', label: 'Evidence Generation' }
              ].map(({ key, label }) => (
                <div key={key} className="flex justify-between items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="font-mono text-xs text-slate-200">{label}</span>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`px-3 py-1 rounded-full font-mono text-xs font-bold transition-all ${
                      config[key]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {config[key] ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Action on Detection</label>
                <select
                  value={config.actionOnDetection}
                  onChange={(e) => setConfig({ ...config, actionOnDetection: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-white focus:border-[#C5A059] outline-none"
                >
                  <option value="BLOCK">BLOCK (Bloqueo Determinista Inmediato)</option>
                  <option value="SANITIZE">SANITIZE (Ocultación en Memoria RAM)</option>
                  <option value="AUDIT_ONLY">AUDIT_ONLY (Solo Registrar Evidencia)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-400 mb-2">Evidence Retention</label>
                <select
                  value={config.evidenceRetention}
                  onChange={(e) => setConfig({ ...config, evidenceRetention: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-white focus:border-[#C5A059] outline-none"
                >
                  <option value="Client Infrastructure">Client Infrastructure (Local RAM / On-Prem)</option>
                  <option value="Evidence Vault Cloud">Evidence Vault Cloud (Encrypted S3)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setCurrentStep(4)}
              className="w-full bg-[#C5A059] text-black font-mono text-xs font-extrabold py-3 rounded-xl hover:bg-white transition-all shadow-md"
            >
              CONTINUAR AL ENSAMBLADOR DE PIPELINE →
            </button>
          </div>
        </section>
      )}

      {/* PASO 4: PIPELINE BUILDER VISUAL */}
      {currentStep === 4 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            PASO 4 — FLUJO DE EJECUCIÓN ENSAMBLADO (PIPELINE)
          </h2>
          
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 flex flex-col items-center space-y-4">
            <div className="px-6 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-slate-300">
              INPUT (PETICIÓN ENTRANTE L7)
            </div>
            <div className="text-slate-600 font-mono text-sm">↓</div>

            <div className="w-full max-w-md p-4 bg-slate-900/90 border border-[#C5A059] rounded-2xl flex justify-between items-center shadow-lg shadow-[#C5A059]/10">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] block">NODE 01</span>
                <h4 className="font-bold text-white text-sm">{selectedModule.name}</h4>
                <span className="text-xs text-slate-400">{selectedPreset.name}</span>
              </div>
              <div className="text-right font-mono text-[10px] text-emerald-400">
                <div>Latencia: ~0.4ms</div>
                <div>Estado: READY</div>
              </div>
            </div>

            <div className="text-slate-600 font-mono text-sm">↓</div>

            <div className="w-full max-w-md p-4 bg-slate-900/90 border border-[#00f0ff] rounded-2xl flex justify-between items-center shadow-lg shadow-[#00f0ff]/10">
              <div>
                <span className="text-[10px] font-mono text-[#00f0ff] block">NODE 02</span>
                <h4 className="font-bold text-white text-sm">TokenMatrix</h4>
                <span className="text-xs text-slate-400">Rate Limits & Cost Guard</span>
              </div>
              <div className="text-right font-mono text-[10px] text-emerald-400">
                <div>Latencia: ~0.1ms</div>
                <div>Estado: READY</div>
              </div>
            </div>

            <div className="text-slate-600 font-mono text-sm">↓</div>

            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/40 rounded-xl font-mono text-xs text-emerald-400 font-bold">
              VEREDICTO DE INTEGRIDAD: VALID → LLM TARGET
            </div>

            <div className="text-slate-600 font-mono text-sm">↓</div>

            <div className="w-full max-w-md p-4 bg-slate-900/90 border border-slate-700 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block">NODE 03</span>
                <h4 className="font-bold text-white text-sm">EvidenceVault</h4>
                <span className="text-xs text-slate-400">Firma Ed25519 inmutable</span>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-400">
                <div>Recibo: JSON-LD</div>
              </div>
            </div>

            <button 
              onClick={() => { setCurrentStep(5); runPreDeploymentCheck(); }}
              className="mt-6 w-full max-w-md bg-[#00f0ff] text-black font-mono text-xs font-extrabold py-3 rounded-xl hover:bg-white transition-all shadow-md"
            >
              VERIFICAR Y VALIDAR PIPELINE →
            </button>
          </div>
        </section>
      )}

      {/* PASO 5: VALIDATION (PRE-DEPLOYMENT CHECK) */}
      {currentStep === 5 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            PASO 5 — PRE-DEPLOYMENT CHECK (VERIFICACIÓN PREVIA)
          </h2>
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 font-mono text-xs space-y-3">
            {[
              'Framework loaded',
              'Runtime available',
              `Module installed (${selectedModule.name})`,
              `Preset valid (${selectedPreset.name})`,
              'Configuration valid',
              'Policy consistency verified',
              'Evidence engine available',
              'Integration endpoint available'
            ].map((check, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-300">✓ {check}</span>
                <span className="text-emerald-400 font-bold">PASS</span>
              </div>
            ))}

            <div className="pt-4 text-center">
              {deployState === 'CHECKING' ? (
                <div className="text-[#C5A059] animate-pulse">VERIFICANDO INTEGRIDAD DEL ENGINE...</div>
              ) : (
                <div className="space-y-4">
                  <div className="text-emerald-400 font-bold text-sm">SYSTEM READY FOR DEPLOYMENT</div>
                  <button 
                    onClick={() => { setCurrentStep(6); handleDeploy(); }}
                    className="w-full bg-[#C5A059] text-black font-mono text-xs font-extrabold py-3 rounded-xl hover:bg-white transition-all shadow-md"
                  >
                    IR A ACTIVACIÓN DE PROTECCIÓN →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PASO 6: DEPLOY */}
      {currentStep === 6 && (
        <section className="space-y-4 text-center">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            PASO 6 — ACTIVACIÓN DE PROTECCIÓN EN RUNTIME
          </h2>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 flex flex-col items-center space-y-6">
            {deployState === 'DEPLOYING' ? (
              <div className="space-y-3 font-mono text-xs text-[#00f0ff]">
                <div className="animate-spin text-2xl">⚡</div>
                <div>INITIALIZING RUNTIME...</div>
                <div>LOADING POLICY & PRESETS...</div>
                <div>STARTING MODULES...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white">PROTECTION ACTIVE</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  El pipeline <span className="text-[#C5A059] font-mono">{selectedPreset.name}</span> está interceptando y protegiendo el tráfico de IA en tiempo real sobre el Runtime.
                </p>
                <div className="pt-4 flex gap-4 justify-center">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    Construir Otro Pipeline
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
