import React, { useState } from 'react';
import JSZip from 'jszip';
import { MerkleProofEngine } from '../services/proofEngine';

export default function DossierExporter({ telemetryTraces }) {
  const [exporting, setExporting] = useState(false);

  const handleExportDossierPackage = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const engine = new MerkleProofEngine();

      for (const trace of telemetryTraces || []) {
        await engine.addLeaf(trace);
      }

      const dossier = await engine.generateProofDossier('ENTERPRISE-TENANT');

      // Estructura del paquete pericial en ZIP
      zip.file('merkle_proof_dossier.json', JSON.stringify(dossier, null, 2));
      zip.file('telemetry_traces_raw.json', JSON.stringify(telemetryTraces || [], null, 2));
      zip.file('AUDIT_CERTIFICATE.txt', `S.A.A.R.E. SGP 1.0 AUDIT CERTIFICATE\nGenerated: ${new Date().toISOString()}\nMerkle Root: ${dossier.merkleRoot}\nStatus: INMUTABLE`);

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `DOSSIER_PERICIAL_SGP10_${Date.now()}.zip`;
      link.click();
    } catch (err) {
      console.error('[DOSSIER_EXPORTER] Error empaquetando expediente:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportDossierPackage}
      disabled={exporting}
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-xl font-mono text-xs font-bold transition-all shadow-sm"
    >
      {exporting ? 'Empaquetando ZIP...' : '📦 Exportar Dossier Criptográfico (.ZIP)'}
    </button>
  );
}