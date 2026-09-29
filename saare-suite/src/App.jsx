import React, { useState, Component } from 'react';

// Intentos de importación con fallback defensivo
import GovernanceToolbar from './components/GovernanceToolbar';
import ExecutiveView from './components/ExecutiveView';
import SubsidiesHub from './components/SubsidiesHub';
import EnforcementView from './components/EnforcementView';
import GrcAuditView from './components/GrcAuditView';
import ForensicView from './components/ForensicView';
import ResilienceLab from './components/ResilienceLab';
import EvidenceVerify from './components/EvidenceVerify';
import DossierExporter from './components/DossierExporter';
import OfficialReportModal from './components/OfficialReportModal';

// Componente de protección Error Boundary para evitar pantallazo negro por excepciones
class SafeViewBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("S.A.A.R.E. View Fallback Captured:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-3">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-slate-200">Módulo Temporalmente No Disponible</h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            {this.state.error?.toString() || "No se pudo cargar la vista seleccionada."}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold rounded-lg border border-slate-700 transition-all"
          >
            Reintentar Carga
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Subcomponente Badge defensivo
function SafeBadge({ children, variant = 'default' }) {
  const styles = variant === 'accent' 
    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
    : 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${styles}`}>
      {children}
    </span>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedReportMode, setSelectedReportMode] = useState(null);
  
  // Estado para controlar la visibilidad del banner de Onboarding
  const [showWelcome, setShowWelcome] = useState(true);

  const navigationTabs = [
    { id: 'executive', label: 'Resumen Ejecutivo', badge: 'C-Level' },
    { id: 'public-audit', label: 'Auditoría Pública (Live)', badge: 'eIDAS RFC 3161' },
    { id: 'subsidies', label: 'Hub Subvenciones & Nodo', badge: 'Kit Consulting' },
    { id: 'enforcement', label: 'Inspector L7 Ex-Ante', badge: '< 1.16 ms' },
    { id: 'grc', label: 'Auditoría GRC', badge: 'ISO 42001' },
    { id: 'forensic', label: 'Traza Forense', badge: 'Ed25519' },
    { id: 'resilience', label: 'Resiliencia DORA', badge: 'NIS 2' },
  ];

  const handleOpenReportStore = (mode = null) => {
    setSelectedReportMode(mode);
    setIsStoreOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header */}
        <header className="space-y-4">
          <SafeViewBoundary>
            {typeof GovernanceToolbar === 'function' ? (
              <GovernanceToolbar onOpenReport={() => handleOpenReportStore()} />
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="font-bold text-blue-400">S.A.A.R.E. Governance Suite v8.1</span>
                <span className="text-xs text-slate-500 font-mono">Control Plane: Active</span>
              </div>
            )}
          </SafeViewBoundary>
        </header>

        {/* Banner de Bienvenida (Onboarding para perfiles de negocio) */}
        {showWelcome && (
          <div className="bg-slate-900 border border-blue-500/50 text-slate-200 px-5 py-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-blue-900/20">
            <div className="text-sm">
              <strong className="text-blue-400 text-base block mb-1">👋 Bienvenido a S.A.A.R.E. Suite</strong>
              Estás en la vista de Control de Mandos. Navega por las pestañas para explorar la auditoría técnica L7, la traza forense y las opciones de subvención para tu nodo.
            </div>
            <button 
              onClick={() => setShowWelcome(false)} 
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-colors whitespace-nowrap cursor-pointer border border-slate-700"
            >
              Entendido ✕
            </button>
          </div>
        )}

        {/* Navegación */}
        <nav className="border-b border-slate-800 pb-3 overflow-x-auto">
          <div className="flex space-x-3 min-w-max">
            {navigationTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    isActive
                      ? 'bg-slate-800 text-white border-blue-500 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <SafeBadge variant={isActive ? 'accent' : 'default'}>
                      {tab.badge}
                    </SafeBadge>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Panel Principal Protegido */}
        <main className="space-y-8 min-h-[500px]">
          <SafeViewBoundary>
            {activeTab === 'executive' && (
              typeof ExecutiveView === 'function' ? (
                <ExecutiveView 
                  onNavigateToSubsidies={() => setActiveTab('subsidies')} 
                  onOpenStore={(mode) => handleOpenReportStore(mode)}
                />
              ) : (
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <h2 className="text-xl font-bold text-slate-200">Vista Ejecutiva S.A.A.R.E.</h2>
                  <p className="text-sm text-slate-400 mt-2">Plataforma activa y lista para recibir telemetría L7.</p>
                </div>
              )
            )}

            {activeTab === 'public-audit' && (
              <div className="max-w-4xl mx-auto">
                {typeof EvidenceVerify === 'function' && <EvidenceVerify />}
              </div>
            )}

            {activeTab === 'subsidies' && (
              typeof SubsidiesHub === 'function' && <SubsidiesHub />
            )}

            {activeTab === 'enforcement' && (
              typeof EnforcementView === 'function' && <EnforcementView />
            )}

            {activeTab === 'grc' && (
              typeof GrcAuditView === 'function' && <GrcAuditView />
            )}

            {activeTab === 'forensic' && (
              typeof ForensicView === 'function' && <ForensicView />
            )}

            {activeTab === 'resilience' && (
              typeof ResilienceLab === 'function' && <ResilienceLab />
            )}
          </SafeViewBoundary>

          <div className="pt-8 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SafeViewBoundary>
              {typeof EvidenceVerify === 'function' && <EvidenceVerify />}
            </SafeViewBoundary>
            <SafeViewBoundary>
              {typeof DossierExporter === 'function' && (
                <DossierExporter onOpenStore={() => handleOpenReportStore()} />
              )}
            </SafeViewBoundary>
          </div>
        </main>

        {/* Footer */}
        <footer className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>MS3V S.A.A.R.E. SL — Portal Comercial & Landing L7</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>SGP 1.0 (eIDAS RFC 3161)</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">SAARE-MD-IPRES-2026</span>
          </div>
        </footer>

      </div>

      {isStoreOpen && typeof OfficialReportModal === 'function' && (
        <OfficialReportModal 
          initialMode={selectedReportMode}
          onClose={() => setIsStoreOpen(false)} 
        />
      )}
    </div>
  );
}