  // Model B: Builder State
  const [builderStep, setBuilderStep] = useState(1);
  const [selectedModule, setSelectedModule] = useState(MODULES_DATA[0]);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS_DATA.perimeter[0]);
  const [configState, setConfigState] = useState({
    PIIDetection: true,
    PCIDetection: true,
    IBANDetection: true,
    PromptInjection: true,
    EvidenceGeneration: true,
    actionOnDetection: 'BLOCK',
    retention: 'Client Infrastructure'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);

  // --- HANDLERS ---
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              S
            </div>
            <span className="font-mono text-lg font-bold tracking-wider text-slate-100">SAARE<span className="text-cyan-400">.CONSOLE</span></span>
          </div>

          {/* Estado Global (Level 1: Business) */}
          <div className="hidden md:flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">RUNTIME ACTIVE</span>
          </div>
        </div>

        {/* Level 1 Key Indicators */}
        <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">ENGINE:</span>
            <span className="text-slate-200">v4.8-core</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">PROTECTION:</span>
            <span className="text-emerald-400">100% ENFORCED</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">EVIDENCE:</span>
            <span className="text-cyan-400">VALIDATED (Ed25519)</span>
          </div>
        </div>

        {/* Controls & Layer Selector */}
        <div className="flex items-center space-x-4">
          {/* Depth Level Switcher */}
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex text-xs font-mono">
            <button 
              onClick={() => setUserRoleLevel('business')}
              className={`px-2.5 py-1 rounded ${userRoleLevel === 'business' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Business
            </button>
            <button 
              onClick={() => setUserRoleLevel('operator')}
              className={`px-2.5 py-1 rounded ${userRoleLevel === 'operator' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Operator
            </button>
            <button 
              onClick={() => setUserRoleLevel('engineer')}
              className={`px-2.5 py-1 rounded ${userRoleLevel === 'engineer' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Engineer
            </button>
          </div>

          <button 
            onClick={() => setShowTechnicalTrace(!showTechnicalTrace)}
            className={`p-2 rounded-lg border transition ${showTechnicalTrace ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
            title="Toggle Technical Trace"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* NAVEGACIÓN LATERAL */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1">
            <div className="text-[10px] font-mono font-semibold text-slate-500 tracking-wider px-3 mb-2 uppercase">Operación</div>
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button 
              onClick={() => setActiveTab('builder')} 
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'builder' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <GitMerge className="w-4 h-4" />
              <span>Pipeline Builder</span>
            </button>

            <div className="text-[10px] font-mono font-semibold text-slate-500 tracking-wider px-3 pt-4 mb-2 uppercase">Gobernanza</div>
            
            {[
              { id: 'modules', label: 'Modules', icon: Layers },
              { id: 'presets', label: 'Presets', icon: Sliders },
              { id: 'policies', label: 'Policies', icon: ShieldCheck },
              { id: 'evidence', label: 'Evidence Vault', icon: Database },
              { id: 'integrations', label: 'Integrations', icon: Server }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => {}} 
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition opacity-80"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Status Panel Footer */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs space-y-2">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>LATENCY (P95)</span>
              <span className="text-emerald-400">4.2 ms</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>INTERCEPTIONS</span>
              <span className="text-slate-200">12,842</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-3/4"></div>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col justify-between">
          <div>
            {activeTab === 'overview' && <OverviewDashboard userRoleLevel={userRoleLevel} onOpenBuilder={() => setActiveTab('builder')} />}
            {activeTab === 'builder' && (
              <PipelineBuilder 
                step={builderStep}
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                setStep={setBuilderStep}
                selectedModule={selectedModule}
                setSelectedModule={setSelectedModule}
                selectedPreset={selectedPreset}
                setSelectedPreset={setSelectedPreset}
                configState={configState}
                setConfigState={setConfigState}
                onDeploy={runDeployment}
                isDeploying={isDeploying}
                deployStep={deployStep}
              />
            )}
          </div>

          {/* VISTA SECUNDARIA: TECHNICAL TRACE */}
          {showTechnicalTrace && (
            <div className="mt-8 border border-cyan-500/30 bg-slate-900/90 rounded-xl p-4 font-mono text-xs text-slate-300 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>TECHNICAL TRACE (ENGINEER LEVEL)</span>
                </div>
                <button onClick={() => setShowTechnicalTrace(false)} className="text-slate-500 hover:text-slate-300">✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500 block">SEMANTIC MODE</span>
                  <span className="text-amber-400 font-semibold">{selectedModule.techMode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RUNTIME CORE</span>
                  <span className="text-slate-200">v4.8.2-GA (x86_64)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CRYPTO RECEIPT</span>
                  <span className="text-emerald-400">Ed25519 Verified</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TRACE ID</span>
                  <span className="text-slate-400">SAARE-89F2A10B4</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// MODELO A: OPERATION CENTER (DASHBOARD PRINCIPAL)
// ============================================================================
function OverviewDashboard({ userRoleLevel, onOpenBuilder }) {
  return (
    <div className="space-y-6">
      
      {/* Header local */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Operation Center</h1>
          <p className="text-sm text-slate-400">Monitoreo determinista de gobernanza, intercepciones y evidencia criptográfica.</p>
        </div>
        <button 
          onClick={onOpenBuilder}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition flex items-center space-x-2 text-sm shadow-lg shadow-cyan-500/10"
        >
          <GitMerge className="w-4 h-4" />
          <span>Configure New Pipeline</span>
        </button>
      </div>

      {/* TARJETAS DE ESTADO PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Runtime Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">RUNTIME ENGINE</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">Framework V4</div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between"><span>Core Runtime:</span><span className="text-slate-200">v4.8.2</span></div>
            <div className="flex justify-between"><span>Policy Engine:</span><span className="text-emerald-400">Deterministic</span></div>
          </div>
        </div>

        {/* Protection Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">PROTECTION</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold">ENFORCING</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">12,842 <span className="text-xs font-normal text-slate-400">Interceptions</span></div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between"><span>Blocked Threats:</span><span className="text-rose-400">921</span></div>
            <div className="flex justify-between"><span>Under Review:</span><span className="text-amber-400">143</span></div>
          </div>
        </div>

        {/* Evidence Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">EVIDENCE VAULT</span>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold">100% VALIDATED</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">12,842 <span className="text-xs font-normal text-slate-400">Receipts</span></div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between"><span>Verified Signatures:</span><span className="text-cyan-400">12,842</span></div>
            <div className="flex justify-between"><span>Integrity:</span><span className="text-emerald-400">Ed25519 Immutable</span></div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">PERFORMANCE</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">850 RPS</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center pt-1">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">P50</div>
              <div className="text-sm font-bold text-slate-200">1.2ms</div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">P95</div>
              <div className="text-sm font-bold text-emerald-400">4.2ms</div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">P99</div>
              <div className="text-sm font-bold text-cyan-400">8.9ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE PIPELINE VISUALIZATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-200">Active Pipeline: Enterprise AI Protection</h2>
            <p className="text-xs text-slate-400">Visualización en tiempo real del flujo de ejecución y veredicto.</p>
          </div>
          <span className="text-xs font-mono bg-cyan-950 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-full">
            Pipeline ID: pipe-prod-01
          </span>
        </div>

        {/* Dynamic Topology Map */}
        <div className="py-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] px-4">
            
            {/* Input Node */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-16 rounded-lg bg-slate-950 border border-slate-700 flex flex-col items-center justify-center text-xs font-mono text-slate-300">
                <span className="text-[10px] text-slate-500">SOURCE</span>
                <span className="font-bold text-slate-100">INPUT</span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-600" />

            {/* PerimeterShield Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-16 rounded-lg bg-slate-950 border border-cyan-500/50 flex flex-col items-center justify-center text-xs font-mono relative shadow-lg shadow-cyan-500/5">
                <span className="absolute -top-2 bg-cyan-500 text-slate-950 text-[9px] font-bold px-1.5 rounded">MODULE</span>
                <span className="font-bold text-cyan-300">PerimeterShield</span>
                <span className="text-[10px] text-slate-400">Banking Shield</span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-600" />

            {/* TokenMatrix Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-16 rounded-lg bg-slate-950 border border-cyan-500/50 flex flex-col items-center justify-center text-xs font-mono relative">
                <span className="absolute -top-2 bg-cyan-500 text-slate-950 text-[9px] font-bold px-1.5 rounded">MODULE</span>
                <span className="font-bold text-cyan-300">TokenMatrix</span>
                <span className="text-[10px] text-slate-400">Rate Throttle</span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-600" />

            {/* Verdict Node */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-16 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex flex-col items-center justify-center text-xs font-mono">
                <span className="text-[10px] text-emerald-400 font-bold">VERDICT</span>
                <span className="font-bold text-emerald-300">VALID</span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-600" />

            {/* LLM Engine Node */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-16 rounded-lg bg-slate-950 border border-slate-700 flex flex-col items-center justify-center text-xs font-mono text-slate-300">
                <span className="text-[10px] text-slate-500">TARGET</span>
                <span className="font-bold text-slate-100">LLM MODEL</span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-600" />

            {/* EvidenceVault Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-16 rounded-lg bg-slate-950 border border-purple-500/50 flex flex-col items-center justify-center text-xs font-mono relative">
                <span className="absolute -top-2 bg-purple-500 text-slate-950 text-[9px] font-bold px-1.5 rounded">LEDGER</span>
                <span className="font-bold text-purple-300">EvidenceVault</span>
                <span className="text-[10px] text-slate-400">Ed25519 Signed</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODELO B: MODULE & PIPELINE BUILDER (PASO A PASO)
// ============================================================================
function PipelineBuilder({ 
  step, onNext, onPrev, setStep,
  selectedModule, setSelectedModule,
  selectedPreset, setSelectedPreset,
  configState, setConfigState,
  onDeploy, isDeploying, deployStep
}) {

  const stepsList = [
    'Select Module', 'Select Preset', 'Configuration', 
    'Pipeline Builder', 'Validation', 'Deploy'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header del Builder */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Module & Pipeline Builder</h1>
        <p className="text-sm text-slate-400">Configura, combina y despliega infraestructura de gobernanza determinista.</p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {stepsList.map((stLabel, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <button
              key={stLabel}
              onClick={() => stepNum < step && setStep(stepNum)}
              disabled={stepNum > step}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition ${
                isActive 
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300' 
                  : isDone 
                  ? 'border-emerald-500/40 bg-slate-900/80 text-emerald-400' 
                  : 'border-slate-800 bg-slate-900/20 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-mono font-bold">PASO 0{stepNum}</span>
              <span className="text-xs font-medium truncate">{stLabel}</span>
            </button>
          );
        })}
      </div>

      {/* BODY DE CADA PASO */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[400px] flex flex-col justify-between">
        
        {/* PASO 1: SELECT MODULE */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200">Paso 1: Selecciona un Módulo S.A.A.R.E.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULES_DATA.map((mod) => (
                <div 
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedModule.id === mod.id 
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-100">{mod.name}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{mod.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{mod.desc}</p>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>Engine Mode: Intercept</span>
                    <span className={`font-bold ${selectedModule.id === mod.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                      {selectedModule.id === mod.id ? 'SELECTED' : 'SELECT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: SELECT PRESET */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Paso 2: Selecciona un Preset para {selectedModule.name}</h2>
              <p className="text-xs text-slate-400">Los presets cargan reglas de gobernanza preconfiguradas para casos de uso específicos.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(PRESETS_DATA[selectedModule.id] || PRESETS_DATA.perimeter).map((pst) => (
                <div 
                  key={pst.id}
                  onClick={() => setSelectedPreset(pst)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedPreset.id === pst.id 
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/5' 
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm mb-1">{pst.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{pst.desc}</p>
                  </div>
                  <div className="space-y-1">
                    {pst.toggles.map((t) => (
                      <div key={t} className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: CONFIGURATION */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Paso 3: Configuración de Parámetros</h2>
              <p className="text-xs text-slate-400">Ajusta únicamente las variables operativas humanas. Sin código ni JSON.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              
              {/* Controls */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Reglas Activas</h3>
                {selectedPreset.toggles.map((toggleKey) => (
                  <div key={toggleKey} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-xs font-medium text-slate-200">{toggleKey}</span>
                    <button 
                      onClick={() => setConfigState(s => ({ ...s, [toggleKey]: !s[toggleKey] }))}
                      className={`w-10 h-5 rounded-full transition relative ${configState[toggleKey] !== false ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-slate-950 absolute top-0.75 transition ${configState[toggleKey] !== false ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Behavior Settings */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Acción y Evidencia</h3>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block">Action on Detection</label>
                  <select 
                    value={configState.actionOnDetection}
                    onChange={(e) => setConfigState({ ...configState, actionOnDetection: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="BLOCK">BLOCK (Strict Enforce)</option>
                    <option value="FLAG">FLAG & SANITIZE</option>
                    <option value="AUDIT">AUDIT ONLY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block">Evidence Retention</label>
                  <select 
                    value={configState.retention}
                    onChange={(e) => setConfigState({ ...configState, retention: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded p-2 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Client Infrastructure">Client Infrastructure (On-Prem / Private VPC)</option>
                    <option value="Encrypted Vault">Encrypted SAARE Vault</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PASO 4: PIPELINE BUILDER */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Paso 4: Ensamblado Visual del Pipeline</h2>
              <p className="text-xs text-slate-400">Verifica la composición e integración de los nodos en la secuencia de intercepción.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Node Input */}
              <div className="w-full md:w-32 bg-slate-900 border border-slate-800 p-3 rounded-lg text-center font-mono">
                <div className="text-[10px] text-slate-500">INGRESS</div>
                <div className="text-xs font-bold text-slate-200">API Gateway</div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

              {/* Node Module (Active) */}
              <div className="w-full md:w-48 bg-slate-900 border border-cyan-500/80 p-3 rounded-lg text-center font-mono shadow-lg shadow-cyan-500/10">
                <div className="text-[10px] text-cyan-400 font-bold">CONFIGURED MODULE</div>
                <div className="text-xs font-bold text-slate-100">{selectedModule.name}</div>
                <div className="text-[9px] text-slate-400 mt-1">{selectedPreset.name}</div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

              {/* Node Target */}
              <div className="w-full md:w-32 bg-slate-900 border border-slate-800 p-3 rounded-lg text-center font-mono">
                <div className="text-[10px] text-slate-500">TARGET</div>
                <div className="text-xs font-bold text-slate-200">LLM Engine</div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

              {/* Node Evidence */}
              <div className="w-full md:w-40 bg-slate-900 border border-purple-500/50 p-3 rounded-lg text-center font-mono">
                <div className="text-[10px] text-purple-400">EVIDENCE</div>
                <div className="text-xs font-bold text-slate-200">EvidenceVault</div>
              </div>

            </div>
          </div>
        )}

        {/* PASO 5: VALIDATION */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Paso 5: Chequeo de Pre-despliegue</h2>
              <p className="text-xs text-slate-400">Verificación determinista de compatibilidad y firma de políticas.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
              {[
                'Framework loaded',
                'Runtime available',
                'Module installed',
                'Preset valid',
                'Configuration valid',
                'Dependencies available',
                'Policy consistency verified',
                'Evidence engine available',
                'Integration endpoint available'
              ].map((chk) => (
                <div key={chk} className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{chk}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-center font-mono font-bold text-emerald-400 text-sm">
              SYSTEM READY FOR DEPLOYMENT
            </div>
          </div>
        )}

        {/* PASO 6: DEPLOY */}
        {step === 6 && (
          <div className="space-y-6 text-center py-8">
            {!isDeploying && deployStep === 0 && (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 flex items-center justify-center mx-auto">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <h2 className="text-xl font-bold text-slate-100">¿Activar Pipeline en Producción?</h2>
                <p className="text-xs text-slate-400">
                  La política será compilada y aplicada dinámicamente sobre el Runtime sin interrupción del servicio.
                </p>
                <button 
                  onClick={onDeploy}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 text-sm"
                >
                  DEPLOY PIPELINE
                </button>
              </div>
            )}

            {isDeploying && (
              <div className="space-y-4 max-w-xs mx-auto font-mono text-xs">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <div className="space-y-1 text-slate-300">
                  <p className={deployStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}>✓ INITIALIZING</p>
                  <p className={deployStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}>✓ LOADING POLICY</p>
                  <p className={deployStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}>✓ STARTING MODULES</p>
                  <p className={deployStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}>✓ VERIFYING CONFIGURATION</p>
                  <p className={deployStep >= 5 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>● RUNTIME ACTIVE</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTROLES DE NAVEGACIÓN DE PASOS */}
        {step < 6 && (
          <div className="flex justify-between items-center pt-6 border-t border-slate-800">
            <button 
              onClick={onPrev}
              disabled={step === 1}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                step === 1 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'text-slate-400 hover:text-slate-200 bg-slate-800'
              }`}
            >
              Anterior
            </button>
            <button 
              onClick={onNext}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}