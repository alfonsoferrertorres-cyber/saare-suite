// saare-console/src/services/pdfGeneratorService.js — Servicio de Generación de Informes PDF S.A.A.R.E. (v10.0 / SGP 1.0)
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Genera y descarga un archivo PDF a partir del contenido de un elemento HTML del DOM.
 * Incluye soporte para renderizado fuera de pantalla (off-screen render) y captura de múltiples páginas.
 * 
 * @param {string} elementId - ID del elemento DOM a capturar.
 * @param {string|object} options - Nombre del archivo de salida o bien un objeto de configuración.
 * @returns {Promise<void>}
 */
export const generatePdfFromElement = async (elementId, options = {}) => {
  const filename = typeof options === 'string' ? options : (options.filename || 'documento.pdf');
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`[PDF_GENERATOR] Elemento #${elementId} no encontrado en el DOM.`);
    return;
  }

  try {
    // Configuración optimizada para html2canvas (soporta elementos con posicionamiento off-screen)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Si el elemento está oculto fuera de pantalla (left: -9999px), se reposiciona en el documento clonado para capturarlo adecuadamente
          clonedElement.style.position = 'relative';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Dimensiones estándar A4 en mm (210 x 297)
    const pdfWidth = 210;
    const pdfPageHeight = 297;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar primera página
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfPageHeight;

    // Agregar páginas suplementarias con desplazamiento relativo exacto
    while (heightLeft > 2) {
      position -= pdfPageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
  } catch (err) {
    console.error('[PDF_GENERATOR] Error al generar el PDF mediante canvas:', err);
    try {
      window.print();
    } catch (e) {
      console.error('[PDF_GENERATOR] Fallback de impresión no disponible:', e);
    }
  }
};

export const pdfGeneratorService = {
  generateFromElement: async (elementId, options = {}) => {
    const filename = typeof options === 'string' ? options : (options.filename || 'INFORME_OFICIAL_SAARE.pdf');
    return await generatePdfFromElement(elementId, filename);
  }
};

export default pdfGeneratorService;