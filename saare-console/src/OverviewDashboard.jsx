
// Helper Licencias SAARE
const handleScenarioClickHelper = (id, fn) => {
  const free = ['blindaje', 'security', 'governance', 'S.A.A.R.E. (LIVE)'];
  if (free.some(m => String(id).toLowerCase().includes(m))) {
    if (typeof fn === 'function') fn(id);
  } else {
    const u = 'https://www.saare.es/checkout?scenario=' + id;
    if (window.__TAURI__) {
      import('@tauri-apps/api/shell').then(({ open }) => open(u)).catch(() => window.open(u, '_blank'));
    } else {
      window.open(u, '_blank');
    }
  }
};
import React, { useState } from 'react';
import { 
  ShieldCheck, Activity, Cpu, Database, Layers, GitMerge, FileText, 
  Settings, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ChevronRight, 
  Terminal, Play, RefreshCw, Lock, Server, Sparkles, ExternalLink, Sliders
} from 'lucide-react';

// --- MOCK DATA ---
const MODULES_DATA = [
  { id: 'perimeter', name: 'PerimeterShield', type: 'Active L7 Gateway', desc: 'Protección perimetral de tráfico IA e intercepción en tiempo real.', techMode: 'SAARE-MD-SECU' },
  { id: 'token', name: 'TokenMatrix', type: 'Token Rate & Anomaly Engine', desc: 'Análisis semántico y control de volumen por token.', techMode: 'SAARE-MD-TOKN' },
  { id: 'evidence', name: 'EvidenceVault', type: 'Cryptographic Ledger', desc: 'Registro inmutable de decisiones y recibos criptográficos.', techMode: 'SAARE-MD-EVNT' },
  { id: 'compliance', name: 'ComplianceSuite', type: 'Regulatory Auditor', desc: 'Evaluación continua contra Marcos DORA, EU AI Act y HIPAA.', techMode: 'SAARE-MD-COMP' }
];

const PRESETS_DATA = {
  perimeter: [
    { id: 'p_banking', name: 'Banking Shield', desc: 'DLP Financiero, DORA & PCI-DSS compliance.', toggles: ['PII Detection', 'PCI Detection', 'IBAN Detection', 'Prompt Injection'] },
    { id: 'p_health', name: 'Health Guard', desc: 'Protección de datos de salud PHI / GDPR / HIPAA.', toggles: ['PHI Masking', 'Medical Record Isolation', 'GDPR Audit Trail'] },
    { id: 'p_jailbreak', name: 'Enterprise Anti-Jailbreak', desc: 'Mitigación de Prompt Injection y Secret Leakage.', toggles: ['System Prompt Protection', 'Secret Leakage Filter', 'Direct Injection Block'] }
  ],
  token: [
    { id: 't_fairness', name: 'Fair-Use Throttle', desc: 'Rate limiting adaptativo por usuario/tenant.', toggles: ['Burst Control', 'Anomalous Spike Drop'] }
  ],
  evidence: [
    { id: 'e_full', name: 'Zero-Trust Audit', desc: 'Firma Ed25519 para el 100% de transacciones.', toggles: ['Real-time Ed25519 Signing', 'Hardware Vault Sync'] }
  ],
  compliance: [
    { id: 'c_eu', name: 'EU AI Act Enforcement', desc: 'Monitoreo de sesgo y trazabilidad algorítmica.', toggles: ['Risk Classification', 'Bias Audit'] }
  ]
};

export default function SAAREConsole() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('S.A.A.R.E. (LIVE)'); // 'S.A.A.R.E. (LIVE)' (Model A) or 'builder' (Model B)
  const [userRoleLevel, setUserRoleLevel] = useState('operator'); // 'business' | 'operator' | 'engineer'
  const [showTechnicalTrace, setShowTechnicalTrace] = useState(false);
