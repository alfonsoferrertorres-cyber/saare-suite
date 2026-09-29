import React, { useState } from 'react';

// Componentes
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

// Primitiva UI
import { Badge } from './ui/Badge';

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedReportMode, setSelectedReportMode] = useState(null);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header */}
        <header className="space-y-4">
          <GovernanceToolbar onOpenReport={() => handleOpenReportStore()} />
        </header>

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
                      ? 'bg-slate-800 text-white border-blue-500 shadow-lg'
                      : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge variant={isActive ? 'accent' : 'default'}>
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Panel Principal */}
        <main className="space-y-8 min-h-[500px]">
          {activeTab === 'executive' && (
            <ExecutiveView 
              onNavigateToSubsidies={() => setActiveTab('subsidies')} 
              onOpenStore={(mode) => handleOpenReportStore(mode)}
            />
          )}

          {activeTab === 'public-audit' && (
            <div className="max-w-4xl mx-auto">
              <EvidenceVerify />
            </div>
          )}

          {activeTab === 'subsidies' && (
            <SubsidiesHub />
          )}

          {activeTab === 'enforcement' && (
            <EnforcementView />
          )}

          {activeTab === 'grc' && (
            <GrcAuditView />
          )}

          {activeTab === 'forensic' && (
            <ForensicView />
          )}

          {activeTab === 'resilience' && (
            <ResilienceLab />
          )}

          <div className="pt-8 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvidenceVerify />
            <DossierExporter onOpenStore={() => handleOpenReportStore()} />
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

      {isStoreOpen && (
        <OfficialReportModal 
          initialMode={selectedReportMode}
          onClose={() => setIsStoreOpen(false)} 
        />
      )}
    </div>
  );
}