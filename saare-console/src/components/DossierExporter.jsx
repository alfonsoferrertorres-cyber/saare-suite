import React, { useState } from 'react';

export default function DossierExporter({ tenantId, token }) {
  const [exporting, setExporting] = useState(false);

  const triggerExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('https://api.saare.es/api/v1/subsidies/export-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-saare-tenant': tenantId
        },
        body: JSON.stringify({
          tenantId,
          grantType: 'EU_AI_ACT_ART27_DUE_DILIGENCE',
          complianceCode: `DILIGENCE-EU-${Date.now()}`
        })
      });

      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert('Dossier generado correctamente. Notificación enviada al webhook.');
      }
    } catch (e) {
      alert('Error exportando el Proof Bundle normativo.');
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