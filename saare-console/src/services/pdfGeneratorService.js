// saare-console/src/services/pdfGeneratorService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Genera y descarga un archivo PDF a partir del contenido de un elemento HTML del DOM.
 * 
 * @param {string} elementId - ID del elemento DOM a capturar.
 * @param {string} filename - Nombre del archivo PDF de salida.
 * @returns {Promise<void>}
 */
export const generatePdfFromElement = async (elementId, filename = 'documento.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PDF_GENERATOR] Elemento #${elementId} no encontrado.`);
    return;
  }

  try {
    // Configuración optimizada para html2canvas (evita recortes al hacer scroll)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Dimensiones estándar A4 en mm (210 x 297)
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Agregar páginas suplementarias solo si queda contenido significativo (evita páginas en blanco finales)
    while (heightLeft > 1) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
  } catch (err) {
    console.error('[PDF_GENERATOR] Error generando PDF, invocando fallback de impresión del navegador:', err);
    window.print();
  }
};

export const pdfGeneratorService = {
  generateFromElement: async (elementId, options = {}) => {
    const filename = options.filename || 'INFORME_OFICIAL_SAARE.pdf';
    return await generatePdfFromElement(elementId, filename);
  }
};

export default pdfGeneratorService;