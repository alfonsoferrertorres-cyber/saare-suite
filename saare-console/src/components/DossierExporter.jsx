// saare-console/src/components/DossierExporter.jsx
import React, { useState } from 'react';
import { saareFetch } from '../utils/api';

export default function DossierExporter({ tenantId }) {
  const [exporting, setExporting] = useState(false);

  const triggerExport = async () => {
    setExporting(true);
    try {
      const res = await saareFetch('/subsidies/export-package', {
        method: 'POST',
        body: JSON.stringify({
          tenantId,
          grantType: 'EU_AI_ACT_ART27_DUE_DILIGENCE',
          complianceCode: `DILIGENCE-EU-${Date.now()}`
        })
      });

      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert(data.message || 'Dossier generado correctamente. Notificación enviada al webhook.');
      }
    } catch (e) {
      alert(`Error exportando el Proof Bundle normativo: ${e.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={triggerExport}
      disabled={exporting}
      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm shadow-lg transition-all"
    >
      {exporting ? '📦 Generando Bundle eIDAS...' : '📥 Descargar Expediente UE (1-Clic)'}
    </button>
  );
}