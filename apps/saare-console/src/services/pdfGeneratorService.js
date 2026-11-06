// saare-console/src/services/pdfGeneratorService.js — Servicio de Generación de Informes PDF S.A.A.R.E. (v10.0 / SGP 1.0)
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Genera y descarga un archivo PDF a partir del contenido de un elemento HTML del DOM.
 * Incluye soporte para renderizado fuera de pantalla (off-screen render) y captura de múltiples páginas.
 * 
 * @param {string} elementId - ID del elemento DOM a capturar.
 * @param {string|object} options - Nombre del archivo de salida o bien un objeto de configuración.
 * @returns {Promise<boolean>}
 */
export const generatePdfFromElement = async (elementId, options = {}) => {
  const opts = typeof options === 'string' ? { filename: options } : options;
  const filename = opts.filename || 'INFORME_OFICIAL_SAARE.pdf';
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`[PDF_GENERATOR] Elemento #${elementId} no encontrado en el DOM.`);
    return false;
  }

  try {
    // Configuración optimizada para html2canvas (soporta elementos con posicionamiento off-screen)
    const canvas = await html2canvas(element, {
      scale: opts.scale || 2,
      useCORS: true,
      logging: false,
      backgroundColor: opts.backgroundColor || '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Reposiciona el elemento si está oculto fuera de pantalla para asegurar renderizado completo
          clonedElement.style.position = 'relative';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          clonedElement.style.transform = 'none';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF(opts.orientation || 'p', 'mm', opts.format || 'a4');
    
    // Obtención dinámica de dimensiones de página según formato seleccionado (A4 por defecto)
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
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
    return true;
  } catch (err) {
    console.error('[PDF_GENERATOR] Error al generar el PDF mediante canvas:', err);
    try {
      window.print();
      return true;
    } catch (e) {
      console.error('[PDF_GENERATOR] Fallback de impresión no disponible:', e);
      return false;
    }
  }
};

export const pdfGeneratorService = {
  generateFromElement: async (elementId, options = {}) => {
    return await generatePdfFromElement(elementId, options);
  }
};

export default pdfGeneratorService;