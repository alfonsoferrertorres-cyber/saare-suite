// governanceTemplatesEngine.js
import { SAARE_CONFIG } from '../config/saareState';

export function generateVirginizedGovernancePackage({
  tenantId = '',
  userEmail = '',
  userRole = '',
  evidences = [],
  customFilters = [],
  metrics = {}
} = {}) {
  const timestamp = new Date().toISOString();
  const safeEvidences = Array.isArray(evidences) ? evidences : [];
  const safeCustomFilters = Array.isArray(customFilters) ? customFilters : [];

  const deniedEvidences = safeEvidences.filter(
    (e) => e && (e.decision === 'DENY' || e.verdict === 'RECHAZADO' || e.verdict === 'REJECTED' || e.final_decision === 'DENY')
  );

  const sampleMerkle =
    safeEvidences[0]?.merkleRoot ||
    safeEvidences[0]?.merkle_root ||
    safeEvidences[0]?.proofBundle?.payloadHash ||
    '';

  const trustAnchor = SAARE_CONFIG?.TRUST_ANCHOR || '';
  const safeCreativeId = SAARE_CONFIG?.SAFE_CREATIVE_ID || '';
  const activeRulesCount = safeCustomFilters.length;

  return {
    metadata: {
      generator: 'S.A.A.R.E. Governance Engine',
      trustAnchor,
      safeCreativeId,
      tenantId,
      operatorEmail: userEmail,
      operatorRole: userRole,
      generatedAt: timestamp
    },
    itRiskAssessment: {
      title: 'INFORME DE GESTIÓN DE RIESGOS TECNOLÓGICOS Y RESILIENCIA OPERATIVA',
      framework: 'EU Regulation 2022/2554 (DORA) / ISO/IEC 27001:2022',
      executiveSummary: {
        totalAuditedPrompts: safeEvidences.length,
        threatsInterceptedExAnte: deniedEvidences.length,
        residualRiskLevel: metrics.residualRiskLevel || 'N/A'
      },
      riskHeatmap: []
    },
    dpiaAssessment: {
      title: 'EVALUACIÓN DE IMPACTO EN LA PROTECCIÓN DE DATOS (EIPD / DPIA)',
      framework: 'RGPD (Reglamento UE 2016/679) / LOPDGDD 3/2018',
      dataCycle: {
        origin: 'Entradas de texto e inferencias procesadas por usuarios autorizados',
        storage: 'Operación Volátil en RAM',
        transfers: 'Según configuración del tenant',
        destruction: 'Según política de retención del tenant'
      },
      proportionalityAnalysis: 'Evaluación sujeta a los parámetros y políticas configuradas por el tenant.',
      identifiedMitigations: {
        piiRedaction: 'Sanitización configurada por política del tenant',
        evidenceAnchoring: sampleMerkle,
        arcoRights: 'Gestionado según procedimientos del tenant'
      },
      dpoApproval: {
        status: 'PENDIENTE_REVISION',
        dpoRole: userRole,
        signatureTimestamp: timestamp
      }
    },
    aiBiasReport: {
      title: 'INFORME DE EVALUACIÓN Y MITIGACIÓN DE SESGOS',
      framework: 'EU Artificial Intelligence Act (Regulation UE 2024/1689)',
      modelInventory: {
        nodeType: 'PEP L7 Gateway',
        activePolicyRules: activeRulesCount,
        inspectedTraceCount: safeEvidences.length
      },
      representativenessMetrics: {
        disparateImpactRatio: metrics.disparateImpactRatio || 'N/A',
        stochasticDesviationDeltaE: metrics.stochasticDesviationDeltaE || 'N/A',
        biasAuditResult: metrics.biasAuditResult || 'N/A'
      },
      appliedMitigations: 'Según reglas activas del tenant.',
      humanInTheLoopClause: 'Sujeto a los protocolos de supervisión definidos por el tenant.'
    },
    einfEsgReport: {
      title: 'ESTADO DE INFORMACIÓN NO FINANCIERA (EINF) Y DECLARACIÓN DNSH',
      framework: 'Directiva CSRD (UE 2022/2464) / Marco DNSH',
      governanceDimension: {
        rbacSeatsStatus: 'Configurado por tenant',
        ethicalChannelIncidents: metrics.ethicalChannelIncidents ?? 0,
        auditTrailIntegrity: sampleMerkle ? 'REGISTRADO' : 'SIN_EVIDENCIA'
      },
      environmentalDimension: {
        dnshComplianceStatus: metrics.dnshComplianceStatus || 'N/A',
        gpuEnergySavingsPercentage: metrics.gpuEnergySavingsPercentage || 'N/A',
        ramComputeBytesWritten: metrics.ramComputeBytesWritten ?? 0,
        environmentalImpact: metrics.environmentalImpact || 'N/A'
      },
      socialDimension: {
        operatorAccessControl: 'Configurado por tenant',
        trainingHoursPerOperator: metrics.trainingHoursPerOperator ?? 0
      }
    }
  };
}

export default generateVirginizedGovernancePackage;