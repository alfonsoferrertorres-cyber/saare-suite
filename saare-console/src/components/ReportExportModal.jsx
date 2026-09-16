// saare-console/src/components/ReportExportModal.jsx

import React, { useState, useEffect } from 'react';
import { generatePdfFromElement } from '../services/pdfGeneratorService';
import { fetchReportData } from '../services/apiService';
import { GrcReportTemplate } from './reports/GrcReportTemplate';
import { VaultReportTemplate } from './reports/VaultReportTemplate';
import { FriaReportTemplate } from './reports/FriaReportTemplate';

export const ReportExportModal = ({ isOpen, onClose, useCaseId = 'UC-2026-001', reportType = 'GRC' }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const containerId = `report-render-target-${reportType.toLowerCase()}`;

  useEffect(() => {
    if (isOpen && useCaseId) {
      setLoading(true);
      fetchReportData(useCaseId)
        .then((data) => {
          setReportData(data);
        })
        .catch((err) => {
          console.error('[SAARE Modal] Error cargando datos de reporte:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, useCaseId]);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const fileName = `SAARE_Informe_${reportType}_${useCaseId}_2026.pdf`;
      await generatePdfFromElement(containerId, fileName);
      onClose();
    } catch (error) {
      console.error('[SAARE Modal] Error generando exportación PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-900">
            Vista Previa de Exportación GRC/Forense ({reportType})
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Contenedor de renderizado oculto visualmente pero activo en el DOM para html2canvas */}
        <div className="mb-6 overflow-x-auto border p-2 bg-gray-50">
          {reportType === 'GRC' && (
            <GrcReportTemplate data={reportData?.grc} id={containerId} />
          )}
          {reportType === 'VAULT' && (
            <VaultReportTemplate data={reportData?.vault} id={containerId} />
          )}
          {reportType === 'FRIA' && (
            <FriaReportTemplate data={reportData?.fria} id={containerId} />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            {loading ? 'Procesando PDF...' : 'Descargar PDF Oficial'}
          </button>
        </div>
      </div>
    </div>
  );
};