import React, { useState } from 'react';

// Importación de los componentes principales de saare-suite
import GovernanceToolbar from './components/GovernanceToolbar';
import ExecutiveView from './components/ExecutiveView';
import SubsidiesHub from './components/SubsidiesHub';
import EnforcementView from './components/EnforcementView';
import GrcAuditView from './components/GrcAuditView';
import ForensicView from './components/ForensicView';
import ResilienceLab from './components/ResilienceLab';
import EvidenceVerify from './components/EvidenceVerify';
import DossierExporter from './components/DossierExporter';

// Módulos de Auditoría Pública y Venta Pay-Per-Report
import PublicAuditPortal from './components/PublicAuditPortal';
import ReportStoreModal from './components/ReportStoreModal';

// Primitiva de UI
import { Badge } from './ui/Badge';

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedReportMode, setSelectedReportMode] = useState(null);

  // Pestañas de navegación del Portal Comercial y Auditoría Pública S.A.A.R.E.
  const navigationTabs = [
    { id: 'executive', label: 'Resumen Ejecutivo', badge: 'C-Level' },
    { id: 'public-audit', label: 'Auditoría Pública (Live)', badge: 'verify.saare.es', variant: 'allow' },
    { id: 'subsidies', label: 'Hub Subvenciones & Nodo', badge: 'Kit Consulting', variant: 'seal' },
    { id: 'enforcement', label: 'Inspector L7 Ex-Ante', badge: '< 1.16 ms', variant: 'allow' },
    { id: 'grc', label: 'Auditoría GRC', badge: 'ISO 42001' },
    { id: 'forensic', label: 'Traza Forense', badge: 'Ed25519' },
    { id: 'resilience', label: 'Resiliencia DORA', badge: 'NIS 2' },
  ];

  // Abrir tienda en un modo de informe específico (SAARE-MD-*)
  const handleOpenReportStore = (mode = null) => {
    setSelectedReportMode(mode);
    setIsStoreOpen(true);
  };

  return (
    <div className="min-h-screen bg-saare-bg text-saare-ink font-sans selection:bg-saare-accent selection:text-saare-bg antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 1. Header & Barra de Gobernanza SGP 1.0 */}
        <header className="space-y-4">
          <GovernanceToolbar onOpenReport={() => handleOpenReportStore()} />
        </header>

        {/* 2. Navegación por Módulos y Modos Operativos */}
        <nav className="border-b border-saare-line pb-3 overflow-x-auto">
          <div className="flex space-x-3 min-w-max">
            {navigationTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
                    isActive
                      ? 'bg-saare-surface-2 text-saare-ink border-saare-line-hi shadow-lg ring-1 ring-saare-accent/20'
                      : 'bg-saare-surface/50 text-saare-ink-dim border-saare-line hover:text-saare-ink hover:bg-saare-surface'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge variant={isActive ? (tab.variant || 'accent') : 'default'}>
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 3. Vistas Interactivas */}
        <main className="space-y-8 min-h-[500px]">
          {activeTab === 'executive' && (
            <ExecutiveView 
              onNavigateToSubsidies={() => setActiveTab('subsidies')} 
              onOpenStore={(mode) => handleOpenReportStore(mode)}
            />
          )}

          {activeTab === 'public-audit' && (
            <PublicAuditPortal />
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

          {/* 4. Verificación Criptográfica (Trust Layer con Manual v4) y Exportación de Dossier */}
          <div className="pt-8 border-t border-saare-line grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvidenceVerify />
            <DossierExporter onOpenStore={() => handleOpenReportStore()} />
          </div>
        </main>

        {/* 5. Pie de Página */}
        <footer className="pt-6 border-t border-saare-line flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-saare-ink-faint gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-saare-allow inline-block animate-pulse" />
            <span>MS3V S.A.A.R.E. SL (NIF B-ESB12345678) — Portal Comercial & Landing L7</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>SGP 1.0 (eIDAS RFC 3161)</span>
            <span>•</span>
            <span className="text-saare-seal font-semibold">SAARE-MD-IPRES-2026</span>
          </div>
        </footer>

      </div>

      {/* 6. Modal Pay-Per-Report (Informes Oficiales y Subvenciones) */}
      {isStoreOpen && (
        <ReportStoreModal 
          initialMode={selectedReportMode}
          onClose={() => setIsStoreOpen(false)} 
        />
      )}
    </div>
  );
}