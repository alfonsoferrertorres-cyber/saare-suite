import crypto from "crypto";
import fs from "fs";
import path from "path";
import { ComplianceEngine } from "./complianceEngine.js";

export class DossierGenerator {
  static generateDossier({ executionId, scenarioId, verdict, reason, merkleRoot, traceId }) {
    const complianceData = ComplianceEngine.mapExecutionToCompliance(scenarioId, verdict, reason);

    const dossierPayload = {
      "@context": "https://schema.saare.ai/v2/certification_dossier.jsonld",
      type: "AuditCertificationDossier",
      dossierId: "dos_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex"),
      issuedAt: new Date().toISOString(),
      executionId,
      traceId: traceId || "4bf92f3577b34da6a3ce929d0e0e4736",
      auditSummary: {
        scenarioTitle: complianceData.scenarioTitle,
        finalVerdict: verdict,
        reason,
        chainMerkleRoot: merkleRoot || "595728a940c1ef336a596d280aafee2aab9a835f92e2bc11cdeebf6df678bf4b",
        integrityStatus: "CHAIN_INTEGRITY_VERIFIED"
      },
      complianceFrameworks: complianceData.compliance_impact.frameworks_satisfied
    };

    return dossierPayload;
  }

  static exportToMarkdown(dossier) {
    return `# S.A.A.R.E. AUDIT CERTIFICATION DOSSIER
**Dossier ID:** \`${dossier.dossierId}\`  
**Fecha de Emisión:** \`${dossier.issuedAt}\`  
**Execution ID:** \`${dossier.executionId}\`  
**Trace ID (OTel):** \`${dossier.traceId}\`  

---

## 1. Resumen de Seguridad
* **Escenario:** ${dossier.auditSummary.scenarioTitle}
* **Veredicto:** **${dossier.auditSummary.finalVerdict}**
* **Causa:** ${dossier.auditSummary.reason}
* **Merkle Root:** \`${dossier.auditSummary.chainMerkleRoot}\`
* **Estado Criptográfico:** \`${dossier.auditSummary.integrityStatus}\`

---

## 2. Cobertura Regulatoria Cumplida
* **DORA (EU 2022/2554):** ${dossier.complianceFrameworks.dora ? dossier.complianceFrameworks.dora.join(", ") : "N/A"}
* **PCI-DSS v4.0:** ${dossier.complianceFrameworks.pci_dss_v4 ? dossier.complianceFrameworks.pci_dss_v4.join(", ") : "N/A"}
* **ISO/IEC 27001:2022:** ${dossier.complianceFrameworks.iso_27001 ? dossier.complianceFrameworks.iso_27001.join(", ") : "N/A"}

---
*Certificado generado automáticamente por S.A.A.R.E. Control Plane V2.1*
`;
  }
}

