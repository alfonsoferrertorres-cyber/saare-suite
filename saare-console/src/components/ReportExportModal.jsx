import React, { useState, useEffect } from 'react';
import { FriaReportTemplate } from './reports/FriaReportTemplate';
import { VaultReportTemplate } from './reports/VaultReportTemplate';
import { GrcReportTemplate } from './reports/GrcReportTemplate';
import { fetchReportData } from '../services/apiService';
import { downloadPdfFromElement } from '../services/pdfGeneratorService';

export const ReportExportModal = ({ useCaseId, onClose }) => {
  const [activeTab, setActiveTab] = useState('fria');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchReportData(useCaseId);
        setReportData(data);
      } catch (err) {
        console.error("Error cargando datos de informes:", err);
      } finally {
        setLoading(false);
      }
    };
    if (useCaseId) loadData();
  }, [useCaseId]);

  const handleDownload = async () => {
    setDownloading(true);
    const elementId = `report-${activeTab}`;
    const filename = `Informe_${activeTab.toUpperCase()}_${useCaseId}`;
    await downloadPdfFromElement(elementId, filename);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Exportación de Informes de Cumplimiento</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        {/* Pestañas de selección */}
        <div className="flex gap-2 border-b mb-4">
          <button 
            className={`pb-2 px-4 ${activeTab === 'fria' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
            onClick={() => setActiveTab('fria')}
          >
            FRIA (Art. 27 + RD 723/2026)
          </button>
          <button 
            className={`pb-2 px-4 ${activeTab === 'vault' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
            onClick={() => setActiveTab('vault')}
          >
            Evidencia Bóveda
          </button>
          <button 
            className={`pb-2 px-4 ${activeTab === 'grc' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
            onClick={() => setActiveTab('grc')}
          >
            Análisis GAP GRC
          </button>
        </div>

        {/* Previsualización dinámica */}
        <div className="flex-1 overflow-y-auto border p-4 bg-gray-50 rounded mb-4">
          {loading ? (
            <p className="text-center py-8">Cargando evidencias...</p>
          ) : (
            <>
              {activeTab === 'fria' && <FriaReportTemplate id="report-fria" data={reportData?.fria} />}
              {activeTab === 'vault' && <VaultReportTemplate id="report-vault" data={reportData?.vault} />}
              {activeTab === 'grc' && <GrcReportTemplate id="report-grc" data={reportData?.grc} />}
            </>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
          <button 
            onClick={handleDownload} 
            disabled={loading || downloading}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {downloading ? 'Generando PDF...' : 'Descargar PDF Oficial'}
          </button>
        </div>
      </div>
    </div>
  );
};