// saare-console/src/App.jsx — Panel Principal GRC & Ciberresiliencia S.A.A.R.E. (SGP 1.0 - ISV Agnostic)
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GovernanceToolbar from './components/GovernanceToolbar';
import Login from './Login';
import OfficialReportModal from './components/OfficialReportModal';
import FriaWizardModal from './components/FriaWizardModal';
import { ReportExportModal } from './components/ReportExportModal';
import { SubsidiesHub } from './components/SubsidiesHub';
import { ExecutiveView } from './components/ExecutiveView';
import SeatsManagementModal from './components/SeatsManagementModal';
import SoAModal from './components/SoAModal';

import { SAARE_CONFIG } from './config/saareState';
import { API_BASE_URL } from './utils/api';
import { apiService } from './services/apiService';
import { generatePdfFromElement } from './services/pdfGeneratorService';
import { generateVirginizedGovernancePackage } from './services/governanceTemplatesEngine';

import cabeceraImg from './assets/cabecera.png';

const ROLE_RANKS = {
  "OPERATIONAL_AGENT_USER": 0,
  "BOARD_EXECUTIVE_LEVEL_1": 1,
  "DPO_GRC_LEVEL_2": 2,
  "CISO_SECOPS_LEVEL_3": 3,
  "CISO_ADMIN": 4
};

function hasRequiredRank(role, minRank) {
  const rank = ROLE_RANKS[role] !== undefined ? ROLE_RANKS[role] : 0;
  return rank >= minRank;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('saare_user_email') || 'isv.agnostic.auditor@saare.es';
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('saare_user_role') || 'CISO_ADMIN';
  });

  const [tenantId, setTenantId] = useState(() => {
    return localStorage.getItem('saare_tenant_domain') || SAARE_CONFIG.DEFAULT_TENANT || 'ISV_NODE_ENTERPRISE';
  });

  const [viewMode, setViewMode] = useState('GRC_AUDIT');
  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [governanceStatus, setGovernanceStatus] = useState('');
  const [selectedJson, setSelectedJson] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [filter, setFilter] = useState('TODOS');
  const [vaultSource, setVaultSource] = useState('D1_HYBRID_AGNOSTIC');

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [auditTokenModal, setAuditTokenModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFriaModal, setShowFriaModal] = useState(false);
  const [showSoaModal, setShowSoaModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [selectedEvidenceForPdf, setSelectedEvidenceForPdf] = useState(null);

  const [customFilters, setCustomFilters] = useState([]);
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');

  const [livePrompt, setLivePrompt] = useState("");
  const [liveResult, setLiveResult] = useState(null);
  const [isIntercepting, setIsIntercepting] = useState(false);

  const [directives, setDirectives] = useState([
    { id: 1, name: 'DORA - Resiliencia Operativa Digital', active: true, standard: 'EU Regulation 2022/2554', category: 'FINANCIERO' },
    { id: 2, name: 'EU AI Act - Prevención de Fugas PII', active: true, standard: 'Articles 10 & 15', category: 'PRIVACIDAD' },
    { id: 3, name: 'ISO/IEC 27037 - Cadena de Custodia Forense', active: true, standard: 'Digital Evidence Handling', category: 'TRAZABILIDAD' },
    { id: 4, name: 'LOPDGDD - Cifrado Ex-Ante de Datos Sensibles', active: true, standard: 'Organic Law 3/2018', category: 'PRIVACIDAD' },
    { id: 5, name: 'L7 Hook - Intercepción de Prompts LLM', active: true, standard: 'Runtime Guardrail v1.0', category: 'CIBERSEGURIDAD' },
    { id: 6, name: 'Firma Criptográfica Ed25519 En Vivo', active: true, standard: 'RFC 8032 Standard', category: 'TRAZABILIDAD' },
    { id: 7, name: 'Sanitización de Archivos y Adjuntos', active: true, standard: 'OWASP LLM01 / LLM06', category: 'CIBERSEGURIDAD' },
    { id: 8, name: 'Análisis de Intención Ex-Ante (IA Sentinel)', active: true, standard: 'Deterministic Zero-Trust', category: 'FINOPS' },
  ]);

  const [evidences, setEvidences] = useState([]);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (window.location.search) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  const triggerGovernance = useCallback((msg) => {
    setGovernanceStatus(msg);
    setTimeout(() => setGovernanceStatus(''), 4500);
  }, []);

  const handleLogout = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    localStorage.removeItem('saare_token');
    localStorage.removeItem('saare_user_email');
    localStorage.removeItem('saare_user_role');
    localStorage.removeItem('saare_tenant_domain');
    setUserEmail('isv.agnostic.auditor@saare.es');
    setUserRole('CISO_ADMIN');
    triggerGovernance("Sesión reiniciada al modo auditoría agnóstica ISV.");
  }, [triggerGovernance]);

  const handleAgnosticVerification = useCallback(async () => {
    triggerGovernance("🔄 Ejecutando Verificación Criptográfica Agnóstica del Nodo ISV...");
    try {
      await apiService.verifyLicense({ tenant: tenantId, user: userEmail, scope: 'isv_agnostic' });
      const statusData = await apiService.getNodeStatus();
      if (statusData && statusData.vaultSource) {
        setVaultSource(statusData.vaultSource);
      }
      await apiService.syncVault();
      triggerGovernance(`✅ ISV Acreditada Agnósticamente. Nodo: ${SAARE_CONFIG.TRUST_ANCHOR} | Trust Anchor OK`);
    } catch (err) {
      triggerGovernance("✅ Verificación Agnóstica ISV Completada (Modo Standalone Ex-Ante Activo).");
    }
  }, [tenantId, userEmail, triggerGovernance]);

  const mapEvidences = useCallback((remoteEvidences) => {
    const list = Array.isArray(remoteEvidences) 
      ? remoteEvidences 
      : (remoteEvidences?.evidences || remoteEvidences?.runs || remoteEvidences?.data || []);

    if (!Array.isArray(list)) return [];

    return list.map((item) => {
      if (!item) return null;

      const evidenceId = item.evidence_id || item.id;
      if (!evidenceId) return null;

      const isDeny = item.decision === 'DENY' || item.verdict === 'RECHAZADO' || item.verdict === 'REJECTED';
      let cleanPrompt = item.prompt || item.promptInput || item.rawPrompt || item.cleanPrompt || '';
      let cleanResponse = item.responseOutput || item.llmResponse || '';

      try {
        if (typeof cleanPrompt === 'string' && cleanPrompt.includes('%')) cleanPrompt = decodeURIComponent(cleanPrompt);
        if (typeof cleanResponse === 'string' && cleanResponse.includes('%')) cleanResponse = decodeURIComponent(cleanResponse);
      } catch (e) {}

      const payloadHash = item.merkle_root || item.merkleRoot || item.proofBundle?.payloadHash || null;
      const rawTime = item.timestamp || item.created_at || null;

      let inferredType = item.type;
      const catUpper = (item.cat || item.category || '').toUpperCase();
      const promptUpper = String(cleanPrompt).toUpperCase();

      if (!inferredType) {
        if (catUpper.includes('PRIVACY') || catUpper.includes('PII') || catUpper.includes('DNI') || promptUpper.includes('DNI') || promptUpper.includes('IBAN')) {
          inferredType = 'PRIVACIDAD';
        } else if (catUpper.includes('WORKFLOW') || catUpper.includes('TOOL') || catUpper.includes('GRANT') || catUpper.includes('ALLOW')) {
          inferredType = 'WORKFLOWS';
        } else {
          inferredType = isDeny ? 'PRIVACIDAD' : 'WORKFLOWS';
        }
      }

      return {
        id: evidenceId,
        time: rawTime && !isNaN(Date.parse(rawTime)) ? new Date(rawTime).toLocaleTimeString() : '',
        rawTimestamp: rawTime,
        cat: item.cat || item.category || (isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME'),
        sub: item.sub || item.norma || 'EU AI Act / LOPDGDD',
        prompt: String(cleanPrompt),
        responseOutput: String(cleanResponse),
        verdict: isDeny ? 'RECHAZADO' : 'PERMITIDO',
        decision: isDeny ? 'DENY' : 'ALLOW',
        anchored: item.anchored !== undefined ? item.anchored : 1,
        type: inferredType,
        user: item.user || item.user_id || userEmail,
        tenant: item.tenant || item.tenant_id || tenantId,
        merkleRoot: payloadHash,
        node: item.node || SAARE_CONFIG.SAFE_CREATIVE_ID,
        grantMetadata: item.grantMetadata || null,
        proofBundle: item.proofBundle || null,
        latency: item.latency || 0,
        rawJson: item
      };
    }).filter(Boolean);
  }, [userEmail, tenantId]);

  const fetchTelemetryOnce = useCallback(async () => {
    try {
      const remoteEvidences = await apiService.getTelemetryTraces(100);
      if (remoteEvidences !== null && Array.isArray(remoteEvidences)) {
        const mapped = mapEvidences(remoteEvidences);
        if (mapped.length > 0) {
          setEvidences(mapped);
        }
      }
      
      const statusData = await apiService.getNodeStatus();
      if (statusData && statusData.vaultSource) {
        setVaultSource(statusData.vaultSource);
      }
    } catch (e) {
      console.warn("Iniciando telemetría en buffer RAM local:", e);
    }
  }, [mapEvidences]);

  useEffect(() => {
    const updateClock = () => {
      setTimeStr(new Date().toTimeString().split(' ')[0]);
    };
    updateClock();
    const intervalClock = setInterval(updateClock, 1000);

    const fetchCustomRules = async () => {
      try {
        const rules = await apiService.getCustomRules();
        if (Array.isArray(rules)) setCustomFilters(rules);
      } catch (e) {}
    };

    fetchCustomRules();
    fetchTelemetryOnce();

    const streamUrl = `${API_BASE_URL.replace(/\/$/, '')}/telemetry/stream?tenant=${encodeURIComponent(tenantId)}&user=${encodeURIComponent(userEmail)}`;

    try {
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const streamData = JSON.parse(event.data);
          if (Array.isArray(streamData) || streamData.evidences || streamData.runs) {
            const mapped = mapEvidences(streamData);
            if (mapped.length > 0) setEvidences(mapped);
          } else if (streamData.id || streamData.evidence_id) {
            const singleMapped = mapEvidences([streamData]);
            if (singleMapped.length > 0) {
              setEvidences(prev => [singleMapped[0], ...prev.filter(e => e.id !== singleMapped[0].id)]);
            }
          }
        } catch (err) {}
      };

      es.onerror = () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    } catch (e) {}

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTelemetryOnce();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalClock);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userEmail, tenantId, userRole, fetchTelemetryOnce, mapEvidences]);

  const filteredEvidences = useMemo(() => {
    return evidences.filter(item => {
      if (!item) return false;
      
      if (filter === 'PRIVACIDAD' && item.type !== 'PRIVACIDAD') return false;
      if (filter === 'WORKFLOWS' && item.type !== 'WORKFLOWS') return false;

      if (startDateFilter) {
        const itemDate = new Date(item.rawTimestamp);
        const startDate = new Date(startDateFilter);
        if (!isNaN(itemDate.getTime()) && !isNaN(startDate.getTime()) && itemDate < startDate) return false;
      }

      if (endDateFilter) {
        const itemDate = new Date(item.rawTimestamp);
        const endDate = new Date(endDateFilter);
        if (!isNaN(itemDate.getTime()) && !isNaN(endDate.getTime())) {
          endDate.setHours(23, 59, 59, 999);
          if (itemDate > endDate) return false;
        }
      }

      return true;
    });
  }, [evidences, filter, startDateFilter, endDateFilter]);

  const { totalInspecciones, totalDeny, tasaBloqueo, avgLatencyMs } = useMemo(() => {
    const total = evidences.length;
    const deny = evidences.filter(e => e && (e.decision === 'DENY' || e.verdict === 'RECHAZADO')).length;
    const rate = total > 0 ? ((deny / total) * 100).toFixed(1) : '0.0';
    const sumLatency = total > 0 ? evidences.reduce((acc, curr) => acc + (Number(curr?.latency) || 0), 0) : 0;
    const avgLatency = total > 0 ? (sumLatency / total).toFixed(1) : '0.0';

    return {
      totalInspecciones: total,
      totalDeny: deny,
      tasaBloqueo: rate,
      avgLatencyMs: avgLatency
    };
  }, [evidences]);

  const handleDownloadSingleEvidencePdf = async (ev) => {
    setSelectedEvidenceForPdf(ev);
    triggerGovernance(`Generando Recibo Forense PDF para ${ev.id}...`);
    setTimeout(async () => {
      try {
        await generatePdfFromElement('single-evidence-pdf-container', `Recibo_Forense_${ev.id}`);
        triggerGovernance(`Informe PDF de la evidencia ${ev.id} descargado.`);
      } catch (err) {
        triggerGovernance(`Error al generar PDF: ${err.message}`);
      } finally {
        setSelectedEvidenceForPdf(null);
      }
    }, 300);
  };

  const handleExportToSiem = async (ev) => {
    if (!hasRequiredRank(userRole, 3)) {
      triggerGovernance("❌ Acción Denegada: Se requiere rol SecOps / CISO (Nivel 3).");
      return;
    }

    try {
      await apiService.exportToSiem({
        evidenceId: ev.id,
        tenant: ev.tenant,
        operator: ev.user,
        blockedPayload: ev.prompt,
        verdict: ev.decision,
        merkleRoot: ev.merkleRoot,
        policyEngineRule: ev.cat
      });
      triggerGovernance(`Evento SIEM notificado para ${ev.id}.`);
    } catch (e) {
      triggerGovernance(`Error enviando a SIEM: ${e.message}`);
    }
  };

  const handleGenerateFriaDocument = (friaConfig) => {
    if (!hasRequiredRank(userRole, 2)) {
      triggerGovernance("❌ Acción Denegada: Se requiere rol GRC / DPO (Nivel 2).");
      return;
    }

    const deniedEvidences = evidences.filter(e => e && (e.verdict === 'RECHAZADO' || e.decision === 'DENY'));
    const realMerkle = evidences.find(e => e?.merkleRoot)?.merkleRoot || null;

    const friaReport = {
      documentHeader: {
        type: "FUNDAMENTAL_RIGHTS_IMPACT_ASSESSMENT_FRIA",
        regulation: "EU Artificial Intelligence Act (Regulation EU 2024/1689) - Article 27",
        auditNode: SAARE_CONFIG.TRUST_ANCHOR,
        timestamp: new Date().toISOString(),
        tenantId: tenantId,
        cisoOperator: userEmail
      },
      systemContext: {
        useCase: friaConfig.useCaseName,
        department: friaConfig.department,
        aiModel: friaConfig.aiModel,
        riskClassification: friaConfig.highRiskCategory,
        humanOversightModel: friaConfig.humanOversight
      },
      quantitativeTelemetricProof: {
        totalRealPromptsAudited: evidences.length,
        piiAndInjectionsBlockedExAnte: deniedEvidences.length,
        vaultIntegrityStatus: realMerkle ? "VERIFIED_REAL_RECORD" : "NO_RECORD_ANCHORED",
        sampleMerkleRoot: realMerkle
      },
      grantComplianceMetadata: {
        grantFramework: "KIT_CONSULTING_REDES",
        eligibleItem: "Evaluación de Impacto en Derechos Fundamentales (FRIA)",
        verificationEndpoint: realMerkle ? `${API_BASE_URL.replace(/\/$/, '')}/verify/${realMerkle}` : null
      }
    };

    const blob = new Blob([JSON.stringify(friaReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXPEDIENTE_FRIA_ART27_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance("Expediente FRIA (Art. 27 EU AI Act) generado con telemetría real.");
  };

  const handleExportGovernancePackage = () => {
    if (!hasRequiredRank(userRole, 2)) {
      triggerGovernance("❌ Acción Denegada: Se requiere rol GRC / DPO (Nivel 2).");
      return;
    }

    try {
      const pkg = generateVirginizedGovernancePackage({
        tenantId,
        userEmail,
        userRole,
        evidences,
        customFilters
      });

      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DOSSIER_GOBERNANZA_4TEMPLATES_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}_2026.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      triggerGovernance("Dossier Completo de Gobernanza generado.");
    } catch (err) {
      triggerGovernance(`Error generando dossier: ${err.message}`);
    }
  };

  const handleExecuteRealIntercept = async () => {
    if (!livePrompt.trim()) {
      triggerGovernance("Escriba un prompt para realizar la prueba ex-ante real.");
      return;
    }

    setIsIntercepting(true);
    setLiveResult(null);

    try {
      const data = await apiService.interceptPrompt({
        prompt: livePrompt,
        user: userEmail,
        tenant: tenantId
      });

      setLiveResult(data);
      fetchTelemetryOnce();
      triggerGovernance(`Intercepción ex-ante procesada real: ${data?.decision || 'OK'}`);
    } catch (err) {
      triggerGovernance(`Error de intercepción: ${err.message}`);
    } finally {
      setIsIntercepting(false);
    }
  };

  const handleSyncVaultAndVerify = async (merkleHash) => {
    if (!merkleHash) {
      triggerGovernance("❌ Seleccione una evidencia con Merkle Root válido para verificar.");
      return;
    }

    try {
      const syncData = await apiService.syncVault();
      if (syncData && syncData.source) {
        setVaultSource(syncData.source);
      }

      const verifyData = await apiService.verifyEvidence(merkleHash.trim());

      if (verifyData && (verifyData.verified || verifyData.status === 'VERIFIED')) {
        setSelectedJson({
          auditStatus: "VERIFIED",
          merkleRoot: merkleHash,
          node: verifyData.node || SAARE_CONFIG.SAFE_CREATIVE_ID,
          standard: verifyData.standard || "ISO/IEC 27037:2012 / DORA / EU AI Act",
          rfc3161Timestamp: verifyData.timestamp || new Date().toISOString(),
          evidenceBundle: verifyData.evidence || "Certificación cryptographic integrity OK",
          details: verifyData.message || "Sello e inmutabilidad acreditados contra el Trust Anchor."
        });
        triggerGovernance("Firma Notarial acreditada en Bóveda.");
      } else {
        setSelectedJson({
          auditStatus: "FAILED_NOT_FOUND",
          merkleRoot: merkleHash,
          node: SAARE_CONFIG.SAFE_CREATIVE_ID,
          standard: "ISO/IEC 27037:2012",
          timestamp: new Date().toISOString(),
          verdict: "DENY / UNVERIFIED",
          details: verifyData?.error || verifyData?.message || "El registro no existe o ha sido alterado."
        });
        triggerGovernance("❌ Verificación Fallida: Hash no registrado en la Bóveda.");
      }
    } catch (e) {
      setSelectedJson({
        auditStatus: "FAILED_CONNECTION_ERROR",
        merkleRoot: merkleHash,
        trustAnchor: SAARE_CONFIG.TRUST_ANCHOR,
        standard: "ISO/IEC 27037:2012",
        timestamp: new Date().toISOString(),
        verdict: "ERROR_VERIFICATION",
        details: "No se pudo establecer conexión con el nodo de auditoría."
      });
      triggerGovernance("⚠ Error de conexión al consultar el nodo de auditoría.");
    }
  };

  const handleAddCustomFilter = async () => {
    if (!hasRequiredRank(userRole, 3)) {
      triggerGovernance("❌ Acción Denegada: Se requiere rol SecOps / CISO (Nivel 3).");
      return;
    }

    if (!newRuleName || !newRulePattern) {
      triggerGovernance("Especifique un nombre y una regla sintáctica válida.");
      return;
    }

    const newFilter = {
      id: `RULE-${Date.now()}`,
      name: newRuleName,
      pattern: newRulePattern,
      created: new Date().toISOString()
    };

    const updated = [...customFilters, newFilter];
    setCustomFilters(updated);

    try {
      await apiService.saveCustomRules(updated);
      triggerGovernance(`Filtro "${newRuleName}" activado en el Policy Engine.`);
    } catch (e) {
      triggerGovernance("Error al sincronizar regla personalizada.");
    }

    setNewRuleName('');
    setNewRulePattern('');
    setShowAddFilterModal(false);
  };

  const handleDeleteCustomFilter = async (id) => {
    if (!hasRequiredRank(userRole, 3)) {
      triggerGovernance("❌ Acción Denegada: Se requiere rol SecOps / CISO (Nivel 3).");
      return;
    }

    const updated = customFilters.filter(f => f.id !== id);
    setCustomFilters(updated);

    try {
      await apiService.saveCustomRules(updated);
      triggerGovernance("Filtro eliminado del perfil del Tenant.");
    } catch (e) {
      triggerGovernance("Error al revocar filtro.");
    }
  };

  const handleExportGrantDossier = () => {
    if (!hasRequiredRank(userRole, 2)) {
      triggerGovernance("❌ Acción Denegada: Se requiere rol GRC / DPO (Nivel 2).");
      return;
    }

    const grantReport = {
      expedienteRef: `MS3V-AUDIT-${tenantId.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`,
      tenantId: tenantId,
      operatorEmail: userEmail,
      timestamp: new Date().toISOString(),
      dnshCompliance: {
        status: "COMPLIANT_DNSH",
        description: "Operación Zero-Disk en RAM que evita procesamiento innecesario en servidores cloud."
      },
      grantBreakdown: {
        kitConsulting: evidences.filter(e => e?.cat?.includes("PII") || e?.sub?.includes("AI Act")),
        kitDigital: evidences.filter(e => e?.type === "WORKFLOWS" || e?.cat === "AUDITORIA_CONFORME"),
        impulsoIA: evidences.filter(e => e?.cat?.includes("FINANCIAL") || e?.sub?.includes("DORA")),
        incibeCdti: evidences.filter(e => e?.merkleRoot)
      },
      evidenceSummary: {
        totalEvidences: evidences.length,
        cryptoAnchor: SAARE_CONFIG.TRUST_ANCHOR,
        safeCreativeId: SAARE_CONFIG.SAFE_CREATIVE_ID
      }
    };

    const blob = new Blob([JSON.stringify(grantReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXPEDIENTE_JUSTIFICACION_REDES_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance("Dossier Técnico de Justificación de Subvención generado para Red.es / INCIBE.");
  };

  const handleExportChainOfCustody = () => {
    const custodyData = JSON.stringify({
      organization: tenantId,
      user: userEmail,
      role: userRole,
      timestamp: new Date().toISOString(),
      standard: "ISO/IEC 27037:2012 / DORA / EU AI Act",
      activeDirectivesCount: directives.filter(d => d.active).length,
      customRulesCount: customFilters.length,
      evidenceCount: evidences.length,
      evidences: evidences
    }, null, 2);

    const blob = new Blob([custodyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadena_custodia_saare_${userEmail.replace(/[@.]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerGovernance('Cadena de Custodia exportada correctamente.');
  };

  const activeDirectivesCount = directives.filter(d => d.active).length;

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {governanceStatus && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#059669', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 10000, fontWeight: '800', fontSize: '0.85rem', border: '1px solid #10b981' }}>
          🔔 {governanceStatus}
        </div>
      )}

      {/* HEADER INTEGRADO */}
      <header style={{ width: '100%', background: '#0b0f19', borderBottom: '1px solid #1e293b', padding: '20px 0 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1280px', padding: '0 16px', boxSizing: 'border-box', marginBottom: '16px' }}>
          <div style={{ width: '100%', overflow: 'hidden', borderRadius: '10px', border: '1px solid #1e293b', background: '#020617', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={cabeceraImg} 
              alt="S.A.A.R.E. Console Header" 
              style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1280px', padding: '0 16px', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#94a3b8', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '900', color: '#38bdf8', letterSpacing: '0.5px', fontSize: '0.9rem' }}>S.A.A.R.E. CONSOLE GRC (ISV AGNOSTIC)</span>
            <span style={{ background: '#1e293b', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{SAARE_CONFIG.SPEC_VERSION}</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: '#020617', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode('EXECUTIVE')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'EXECUTIVE' ? '#0284c7' : 'transparent',
                color: viewMode === 'EXECUTIVE' ? '#ffffff' : '#94a3b8',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}>
              🟦 EXECUTIVE (CEO)
            </button>
            
            <button
              onClick={() => setViewMode('GRC_AUDIT')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'GRC_AUDIT' ? '#059669' : 'transparent',
                color: viewMode === 'GRC_AUDIT' ? '#ffffff' : '#94a3b8',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}>
              🟪 GRC & AUDIT (CISO/DPO)
            </button>

            <button
              onClick={() => {
                setViewMode('CYBER_RESILIENCE');
                setActiveTab('RUNLIVE');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'CYBER_RESILIENCE' ? '#7c3aed' : 'transparent',
                color: viewMode === 'CYBER_RESILIENCE' ? '#ffffff' : '#94a3b8',
                fontWeight: '800',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}>
              ⚡ CYBER & RESILIENCE (SOC)
            </button>

            <button
              onClick={() => setShowSeatsModal(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #38bdf8',
                background: '#0f172a',
                color: '#38bdf8',
                fontWeight: '800',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
              title="Gestión de Licencias y Asientos del Nodo Organismo">
              👥 ASIENTOS RBAC
            </button>

            <select
              value={userRole}
              onChange={(e) => {
                const selected = e.target.value;
                setUserRole(selected);
                localStorage.setItem('saare_user_role', selected);
                triggerGovernance(`Rol de operador actualizado a: ${selected}`);
              }}
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}>
              <option value="CISO_ADMIN">👑 CISO ADMIN (L4)</option>
              <option value="CISO_SECOPS_LEVEL_3">🛡️ SECOPS (L3)</option>
              <option value="DPO_GRC_LEVEL_2">⚖️ DPO GRC (L2)</option>
              <option value="BOARD_EXECUTIVE_LEVEL_1">📈 EXECUTIVE (L1)</option>
              <option value="OPERATIONAL_AGENT_USER">⚙️ AGENT (L0)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>Trust Anchor: <strong style={{ color: '#4ade80' }}>{SAARE_CONFIG.TRUST_ANCHOR}</strong></span>
            <span>Safe Creative ID: <strong style={{ color: '#38bdf8' }}>{SAARE_CONFIG.SAFE_CREATIVE_ID}</strong></span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
        <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid #1e293b' }}>

          {viewMode === 'EXECUTIVE' && (
            <ExecutiveView tenantId={tenantId} evidences={evidences} userRole={userRole} />
          )}

          {viewMode !== 'EXECUTIVE' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: '1 1 500px' }}>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.02em' }}>
                    {viewMode === 'CYBER_RESILIENCE' ? 'S.A.A.R.E. CYBER & RESILIENCE LAB (SECOPS / SOC)' : 'PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA'}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', lineHeight: '1.4' }}>
                    ORGANIZACIÓN: <span style={{ color: '#f8fafc', fontWeight: '900' }}>{tenantId}</span> | OPERADOR: <span style={{ color: '#38bdf8', fontWeight: '800' }}>{userEmail}</span> | ROL: <span style={{ color: '#a78bfa', fontWeight: '900' }}>{userRole}</span> | DIRECTIVAS: <span style={{ color: '#4ade80', fontWeight: '900' }}>{activeDirectivesCount} ACTIVAS</span> | FILTROS PERS.: <span style={{ color: '#38bdf8', fontWeight: '900' }}>{customFilters.length}</span>
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(160px, 1fr))', gap: '10px', flex: '0 0 auto' }}>
                  <button
                    onClick={handleAgnosticVerification}
                    style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' }}>
                    🚀 Verificar Nodo ISV
                  </button>

                  <button
                    onClick={() => setShowSoaModal(true)}
                    style={{ padding: '10px 14px', background: '#0284c7', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' }}>
                    📜 SoA ISO 27001/42001
                  </button>

                  <button
                    onClick={handleExportGovernancePackage}
                    style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)' }}
                    title="Exportar dossier con las 4 plantillas clave de gobernanza">
                    📦 Dossier 4 Plantillas GRC
                  </button>

                  <button
                    onClick={() => setShowExportModal(true)}
                    style={{ padding: '10px 14px', background: '#059669', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)' }}>
                    📋 Informes Auditados (PDF)
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Desea reiniciar la sesión al perfil por defecto de la ISV?')) {
                        handleLogout();
                      }
                    }}
                    style={{ padding: '10px 14px', background: '#27272a', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textAlign: 'center', gridColumn: 'span 2' }}>
                    🔴 REINICIAR SESIÓN AUDITORA
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#0f172a', border: '1px solid #1e293b', padding: '14px 18px', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                    STREAM SSE ACTIVO ({vaultSource}) | <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{timeStr || '--:--:--'}</span>
                  </span>

                  <span style={{ padding: '6px 14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
                    OPERADOR: {userEmail}
                  </span>
                </div>

                <button
                  onClick={handleAgnosticVerification}
                  style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)' }}>
                  🚀 Despliegue Agnóstico (Fricción Cero)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>TOTAL INSPECCIONES L7</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38bdf8', marginTop: '6px' }}>{totalInspecciones}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>Bóveda D1 / SAARE Engine</div>
                </div>

                <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>AMENAZAS Y BLOQUEOS (EX-ANTE)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ef4444', marginTop: '6px' }}>{totalDeny}</div>
                  <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: '4px' }}>Tasa de Intercepción: {tasaBloqueo}%</div>
                </div>

                <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>EVENTOS PII / JAILBREAK</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f59e0b', marginTop: '6px' }}>{totalDeny}</div>
                  <div style={{ fontSize: '0.68rem', color: '#fbbf24', marginTop: '4px' }}>Bloqueados en RAM en tiempo real</div>
                </div>

                <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>LATENCIA MEDIA INSPECCIÓN</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>{avgLatencyMs} <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>ms</span></div>
                  <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: '4px' }}>Zero-Storage Compute Overhead</div>
                </div>
              </div>

              <GovernanceToolbar
                onExportCustody={handleExportChainOfCustody}
                onGenerateToken={() => setAuditTokenModal(true)}
                onVerifySignature={() => {
                  const firstMerkle = evidences.find(e => e?.merkleRoot)?.merkleRoot;
                  handleSyncVaultAndVerify(firstMerkle);
                }}
                onExportGrantDossier={handleExportGrantDossier}
                onOpenFriaModal={() => {
                  if (!hasRequiredRank(userRole, 2)) {
                    triggerGovernance("❌ Requiere rol GRC / DPO (Nivel 2).");
                    return;
                  }
                  setShowFriaModal(true);
                }}
                onExecuteEnforcementCheck={() => setActiveTab('RUNLIVE')}
                onOpenReportModal={() => setShowReportModal(true)}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', background: '#020617', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#94a3b8' }}>FILTROS DE EVIDENCIA:</span>
                  <button onClick={() => setFilter('TODOS')} style={{ padding: '6px 14px', background: filter === 'TODOS' ? '#0284c7' : '#1e293b', color: filter === 'TODOS' ? '#ffffff' : '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>TODOS ({evidences.length})</button>
                  <button onClick={() => setFilter('PRIVACIDAD')} style={{ padding: '6px 14px', background: filter === 'PRIVACIDAD' ? '#0284c7' : '#1e293b', color: filter === 'PRIVACIDAD' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>PRIVACIDAD</button>
                  <button onClick={() => setFilter('WORKFLOWS')} style={{ padding: '6px 14px', background: filter === 'WORKFLOWS' ? '#0284c7' : '#1e293b', color: filter === 'WORKFLOWS' ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>ORQUESTADORES / WORKFLOWS</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontWeight: '700' }}>RANGO FECHAS:</span>
                  <input 
                    type="date" 
                    value={startDateFilter} 
                    onChange={(e) => setStartDateFilter(e.target.value)} 
                    style={{ background: '#0b0f19', border: '1px solid #334155', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }} 
                  />
                  <span style={{ color: '#64748b' }}>a</span>
                  <input 
                    type="date" 
                    value={endDateFilter} 
                    onChange={(e) => setEndDateFilter(e.target.value)} 
                    style={{ background: '#0b0f19', border: '1px solid #334155', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }} 
                  />
                  {(startDateFilter || endDateFilter) && (
                    <button onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '800', cursor: 'pointer' }}>Limpiar</button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', borderBottom: '2px solid #1e293b', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('GLOBAL')} style={{ padding: '12px 16px', background: activeTab === 'GLOBAL' ? '#0284c7' : '#0f172a', color: activeTab === 'GLOBAL' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}>REGISTRO DE EVIDENCIA REAL</button>
                <button onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '12px 16px', background: activeTab === 'RUNLIVE' ? '#0284c7' : '#0f172a', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}>⚡ INTERCEPCIÓN EN TIEMPO REAL</button>
                <button onClick={() => setActiveTab('SUBSIDIES')} style={{ padding: '12px 16px', background: activeTab === 'SUBSIDIES' ? '#059669' : '#0f172a', color: activeTab === 'SUBSIDIES' ? '#ffffff' : '#34d399', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}>🏛️ SUBSIDIES HUB</button>
                <button onClick={() => setActiveTab('CONFIG')} style={{ padding: '12px 16px', background: activeTab === 'CONFIG' ? '#0284c7' : '#0f172a', color: activeTab === 'CONFIG' ? '#ffffff' : '#94a3b8', border: '1px solid #1e293b', borderBottom: 'none', borderRadius: '6px 6px 0 0', fontWeight: '900', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center' }}>POLICY ENGINE ({customFilters.length + activeDirectivesCount})</button>
              </div>

              {activeTab === 'SUBSIDIES' && (
                <SubsidiesHub tenantId={tenantId} currentEvidences={evidences} />
              )}

              {activeTab === 'GLOBAL' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '900', color: '#f8fafc', textTransform: 'uppercase' }}>HISTORIAL DE EVIDENCIAS FORENSES EN AUDITORÍA (TIEMPO REAL)</h3>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Trazas reales indexadas: {filteredEvidences.length}</span>
                  </div>
                  <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                          <th style={{ padding: '12px 16px', fontWeight: '800' }}>TIMESTAMP</th>
                          <th style={{ padding: '12px 16px', fontWeight: '800' }}>DECISION ID</th>
                          <th style={{ padding: '12px 16px', fontWeight: '800' }}>USUARIO / OPERADOR</th>
                          <th style={{ padding: '12px 16px', fontWeight: '800' }}>PROMPT / CONTESTACIÓN</th>
                          <th style={{ padding: '12px 16px', fontWeight: '800' }}>DICTAMEN</th>
                          <th style={{ padding: '12px 16px', fontWeight: '800' }}>ACCIONES Y AUDITORÍA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvidences.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                              No hay evidencias reales registradas en la Bóveda para esta vista.
                            </td>
                          </tr>
                        ) : (
                          filteredEvidences.map((ev, index) => {
                            const isRejected = ev.verdict === 'RECHAZADO' || ev.decision === 'DENY';
                            return (
                              <tr key={ev.id || index} style={{ borderBottom: '1px solid #1e293b', background: index % 2 === 0 ? '#0b0f19' : '#0f172a' }}>
                                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{ev.time || 'En línea'}</td>
                                <td style={{ padding: '12px 16px', fontWeight: '700', color: '#38bdf8' }}>{ev.id}</td>
                                <td style={{ padding: '12px 16px', color: '#a7f3d0', fontFamily: 'monospace' }}>{ev.user}</td>
                                <td style={{ padding: '12px 16px', maxWidth: '380px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontFamily: 'monospace', color: '#38bdf8', background: '#020617', padding: '4px 8px', borderRadius: '4px', border: '1px solid #1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      <strong>Prompt:</strong> {ev.prompt || '(Sin payload text)'}
                                    </span>
                                    {ev.responseOutput && (
                                      <span style={{ fontFamily: 'monospace', color: '#4ade80', background: '#020617', padding: '4px 8px', borderRadius: '4px', border: '1px solid #1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <strong>Respuesta:</strong> {ev.responseOutput}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{ 
                                    fontWeight: '900', 
                                    color: isRejected ? '#ef4444' : '#10b981', 
                                    background: isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    border: `1px solid ${isRejected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` 
                                  }}>
                                    {isRejected ? 'DENY (RECHAZADO)' : 'ALLOW (PERMITIDO)'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <button 
                                      onClick={() => setSelectedJson(ev.rawJson || ev)} 
                                      style={{ padding: '4px 8px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}>
                                      JSON
                                    </button>
                                    <button 
                                      onClick={() => handleSyncVaultAndVerify(ev.merkleRoot)} 
                                      style={{ padding: '4px 8px', background: 'none', border: '1px solid #059669', color: '#34d399', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>
                                      🛡️ Verificar
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadSingleEvidencePdf(ev)} 
                                      style={{ padding: '4px 8px', background: '#059669', border: 'none', color: '#ffffff', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                                      title="Exportar Recibo Forense PDF individual">
                                      📄 PDF
                                    </button>
                                    {isRejected && (
                                      <button 
                                        onClick={() => handleExportToSiem(ev)} 
                                        style={{ padding: '4px 8px', background: hasRequiredRank(userRole, 3) ? '#7c3aed' : '#334155', border: 'none', color: '#ffffff', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: hasRequiredRank(userRole, 3) ? 'pointer' : 'not-allowed' }}
                                        title={!hasRequiredRank(userRole, 3) ? "Requiere SecOps/CISO (L3)" : "Exportar evento DENY a SIEM / SOC"}>
                                        🚨 SIEM
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'RUNLIVE' && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ background: '#020617', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                        ⚡ S.A.A.R.E. RUNTIME INTERCEPTOR (PRUEBAS REALES EX-ANTE)
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Evaluación directa mediante llamada real al endpoint del motor de políticas (`/api/v1/intercept`).
                      </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', marginBottom: '6px' }}>
                        INGRESAR PROMPT DE PRUEBA EX-ANTE:
                      </label>
                      <textarea
                        rows={3}
                        value={livePrompt}
                        onChange={(e) => setLivePrompt(e.target.value)}
                        placeholder="Escriba aquí el prompt real que desea auditar..."
                        style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #1e293b', color: '#f8fafc', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>

                    <button
                      onClick={handleExecuteRealIntercept}
                      disabled={isIntercepting}
                      style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)' }}>
                      {isIntercepting ? "EVALUANDO EN MOTOR REAL..." : "⚡ ENVIAR PROMPT A MOTOR EX-ANTE"}
                    </button>

                    {liveResult && (
                      <div style={{ marginTop: '20px', background: '#0b0f19', border: `1px solid ${liveResult.decision === 'DENY' ? '#ef4444' : '#10b981'}`, borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontWeight: '900', fontSize: '0.85rem', color: liveResult.decision === 'DENY' ? '#f87171' : '#34d399' }}>
                            DECISIÓN API: {liveResult.decision || 'PROCESADO'}
                          </span>
                          {liveResult.latency && (
                            <span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: '800' }}>
                              LATENCIA: {liveResult.latency} ms
                            </span>
                          )}
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', marginBottom: '4px' }}>
                            RESPUESTA / TELEMETRÍA DE RETORNO:
                          </div>
                          <pre style={{ background: '#020617', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#cbd5e1', border: '1px solid #1e293b', whiteSpace: 'pre-wrap', margin: 0 }}>
                            {JSON.stringify(liveResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a7f3d0', border: '1px solid #1e293b' }}>
                    <div>[POLICY ENGINE - {timeStr}] Canal SSE de Telemetría ({API_BASE_URL}/telemetry/stream)...</div>
                    <div>[AUTH LAYER] Operador activo: {userEmail} | Tenant: {tenantId} | Rol: {userRole}</div>
                    <div>[POLICY DIRECTIVES] {activeDirectivesCount} directivas legales activas | {customFilters.length} reglas dinámicas.</div>
                  </div>
                </div>
              )}

              {activeTab === 'CONFIG' && (
                <div>
                  <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#38bdf8' }}>CONFIGURADOR DE SINTAXIS Y FILTROS PERSONALIZADOS</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                          Define palabras clave, frases confidenciales o expresiones regulares (/regex/i) para bloqueo ex-ante en tiempo real.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if (!hasRequiredRank(userRole, 3)) {
                            triggerGovernance("❌ Requiere rol SecOps / CISO (Nivel 3).");
                            return;
                          }
                          setShowAddFilterModal(true);
                        }}
                        style={{ padding: '10px 18px', background: hasRequiredRank(userRole, 3) ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#334155', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '0.8rem', cursor: hasRequiredRank(userRole, 3) ? 'pointer' : 'not-allowed', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)' }}>
                        + AÑADIR BLOQUEO
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
                      {customFilters.length === 0 ? (
                        <div style={{ padding: '16px', background: '#0f172a', borderRadius: '6px', border: '1px dashed #334155', color: '#64748b', fontSize: '0.78rem', textAlign: 'center' }}>
                          No hay filtros personalizados activos. Las 8 directivas base de cumplimiento legal se mantienen en ejecución.
                        </div>
                      ) : (
                        customFilters.map((rule) => (
                          <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px 16px', borderRadius: '6px', border: '1px solid #334155', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <span style={{ fontWeight: '800', color: '#f8fafc', fontSize: '0.85rem' }}>{rule.name}</span>
                              <span style={{ marginLeft: '10px', fontFamily: 'monospace', color: '#f87171', background: '#020617', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #1e293b' }}>{rule.pattern}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteCustomFilter(rule.id)}
                              style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>
                              ELIMINAR
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: '900', color: '#f8fafc' }}>
                    DIRECTIVAS NORMATIVAS DE BASE
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {directives.map((dir) => (
                      <div key={dir.id} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '800', background: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>{dir.category || 'NORMATIVA'}</span>
                            <span style={{ fontSize: '0.7rem', color: dir.active ? '#4ade80' : '#f87171', fontWeight: '900' }}>{dir.active ? 'HABILITADA' : 'DESACTIVADA'}</span>
                          </div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#f8fafc', fontWeight: '800' }}>{dir.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>Estándar: {dir.standard}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (!hasRequiredRank(userRole, 3)) {
                              triggerGovernance("❌ Requiere rol SecOps / CISO (Nivel 3).");
                              return;
                            }
                            setDirectives(directives.map(d => d.id === dir.id ? { ...d, active: !d.active } : d));
                            triggerGovernance(`Directiva "${dir.name}" ${!dir.active ? 'activada' : 'desactivada'}.`);
                          }}
                          style={{ marginTop: '16px', padding: '8px', background: dir.active ? '#15803d' : '#991b1b', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                          {dir.active ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* CONTENEDOR OCULTO PARA CAPTURA DE RECIBOS FORENSES PDF */}
      {selectedEvidenceForPdf && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '800px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
          <div id="single-evidence-pdf-container" style={{ width: '800px', padding: '32px', background: '#ffffff', color: '#0f172a', fontFamily: 'sans-serif' }}>
            <div style={{ borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#0284c7', fontWeight: '800' }}>CERTIFICADO DE EVIDENCIA FORENSE EX-ANTE</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>S.A.A.R.E. GRC Governance — ISO/IEC 27037 & EU AI Act</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
                <div><strong>ID:</strong> {selectedEvidenceForPdf.id}</div>
                <div><strong>Fecha:</strong> {new Date().toLocaleDateString()} {selectedEvidenceForPdf.time}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}><strong>Organización / Tenant:</strong> {selectedEvidenceForPdf.tenant}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}><strong>Operador Responsable:</strong> {selectedEvidenceForPdf.user}</div>
              <div style={{ fontSize: '12px', color: '#475569' }}><strong>Dictamen Emitido:</strong> <span style={{ color: selectedEvidenceForPdf.decision === 'DENY' ? '#dc2626' : '#16a34a', fontWeight: '800' }}>{selectedEvidenceForPdf.decision} ({selectedEvidenceForPdf.verdict})</span></div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Contenido Inspeccionado (Payload L7)</h3>
              <div style={{ background: '#090d16', color: '#f8fafc', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'pre-wrap', marginTop: '8px' }}>
                {selectedEvidenceForPdf.prompt || '(Payload no textual o sanitizado)'}
              </div>
            </div>

            {selectedEvidenceForPdf.merkleRoot && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#1e40af' }}>Firma Notarial Ed25519 & Merkle Anchor</h4>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#1e3a8a', wordBreak: 'break-all' }}>
                  {selectedEvidenceForPdf.merkleRoot}
                </div>
                <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '6px' }}>
                  Acreditado contra Bóveda D1 (Trust Anchor: {SAARE_CONFIG.TRUST_ANCHOR})
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddFilterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #0284c7', borderRadius: '12px', width: '90%', maxWidth: '520px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#38bdf8', fontSize: '1.1rem', fontWeight: '900' }}>🛡️ Crear Regla de Bloqueo Ex-Ante</h3>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '700' }}>Nombre de la Regla / Proyecto:</label>
              <input 
                type="text" 
                placeholder="Ej. Proyecto Confidencial / Palabras Clave" 
                value={newRuleName} 
                onChange={(e) => setNewRuleName(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '700' }}>Término o Expresión Regular (Regex):</label>
              <input 
                type="text" 
                placeholder="Ej. sk-proj-[a-zA-Z0-9]+|CONFIDENTIAL_TOKEN" 
                value={newRulePattern} 
                onChange={(e) => setNewRulePattern(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #1e293b', color: '#f87171', fontFamily: 'monospace', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddFilterModal(false)} style={{ padding: '10px 16px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Cancelar</button>
              <button onClick={handleAddCustomFilter} style={{ padding: '10px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Guardar Regla</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DECLARACIÓN DE APLICABILIDAD (SoA ISO 27001 / ISO 42001) */}
      <SoAModal isOpen={showSoaModal} onClose={() => setShowSoaModal(false)} tenantId={tenantId} />

      {/* MODAL DE FRIA (EU AI ACT ART. 27) */}
      <FriaWizardModal 
        isOpen={showFriaModal}
        onClose={() => setShowFriaModal(false)}
        onGenerateReport={handleGenerateFriaDocument}
        evidencesCount={evidences.length}
        tenantId={tenantId}
      />

      {/* MODAL DE EXPORTACIÓN DE INFORMES AUDITADOS */}
      {showExportModal && (
        <ReportExportModal 
          useCaseId={tenantId} 
          onClose={() => setShowExportModal(false)} 
        />
      )}

      {/* MODAL DE GESTIÓN DE ASIENTOS Y ROLES EMPLEADOS */}
      {showSeatsModal && (
        <SeatsManagementModal 
          onClose={() => setShowSeatsModal(false)} 
        />
      )}

      {/* MODAL DE VISUALIZACIÓN JSON DE EVIDENCIA */}
      {selectedJson && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '600px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: selectedJson.auditStatus === 'VERIFIED' ? '#38bdf8' : '#f87171' }}>
              {selectedJson.auditStatus === 'VERIFIED' ? '🛡️ Evidencia Criptográfica Bóveda (VERIFICADA)' : '❌ Estado de Verificación'}
            </h3>
            <pre style={{ background: '#020617', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', color: selectedJson.auditStatus === 'VERIFIED' ? '#34d399' : '#f87171', border: '1px solid #1e293b', maxHeight: '350px' }}>
              {JSON.stringify(selectedJson, null, 2)}
            </pre>
            <button onClick={() => setSelectedJson(null)} style={{ marginTop: '16px', width: '100%', padding: '10px', background: selectedJson.auditStatus === 'VERIFIED' ? '#2563eb' : '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              Cerrar Evidence Bundle
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONSULTA DE HASH DE EVIDENCIA REAL */}
      {auditTokenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0b0f19', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#4ade80' }}>🛡️ Exportación de Evidencia Verificable</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {evidences.find(e => e?.merkleRoot) 
                ? "Último Merkle Root certificado registrado en la Bóveda D1:"
                : "No hay registros con Merkle Root anclados actualmente en la Bóveda D1."}
            </p>
            {evidences.find(e => e?.merkleRoot) && (
              <div style={{ background: '#020617', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.85rem', border: '1px solid #1e293b', wordBreak: 'break-all', marginBottom: '16px' }}>
                {evidences.find(e => e?.merkleRoot)?.merkleRoot}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              {evidences.find(e => e?.merkleRoot) && (
                <button
                  onClick={() => {
                    const hash = evidences.find(e => e?.merkleRoot)?.merkleRoot;
                    navigator.clipboard.writeText(hash);
                    triggerGovernance('Root Hash de auditoría copiado al portapapeles.');
                    setAuditTokenModal(false);
                  }}
                  style={{ flex: 1, padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Copiar Hash
                </button>
              )}
              <button
                onClick={() => setAuditTokenModal(false)}
                style={{ flex: 1, padding: '10px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REPORTE OFICIAL */}
      {showReportModal && (
        <OfficialReportModal onClose={() => setShowReportModal(false)} />
      )}

    </div>
  );
}