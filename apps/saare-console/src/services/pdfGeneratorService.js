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
  if (typeof document === 'undefined' || !elementId) {
    console.error('[PDF_GENERATOR] Entorno DOM no disponible o elementId inválido.');
    return false;
  }

  const opts = typeof options === 'string' ? { filename: options } : (options || {});
  const rawFilename = String(opts.filename || 'INFORME_OFICIAL_SAARE').trim();
  const cleanFilename = rawFilename.endsWith('.pdf') ? rawFilename : `${rawFilename}.pdf`;
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`[PDF_GENERATOR] Elemento #${elementId} no encontrado en el DOM.`);
    return false;
  }

  try {
    const targetScale = Math.min(Number(opts.scale) || 2, 2.5);
    const imageFormat = opts.imageFormat || 'PNG';
    const mimeType = imageFormat.toUpperCase() === 'JPEG' ? 'image/jpeg' : 'image/png';
    const jpegQuality = typeof opts.quality === 'number' ? opts.quality : 0.95;

    const canvas = await html2canvas(element, {
      scale: targetScale,
      useCORS: true,
      logging: false,
      backgroundColor: opts.backgroundColor || '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.position = 'relative';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
          clonedElement.style.right = 'auto';
          clonedElement.style.bottom = 'auto';
          clonedElement.style.maxHeight = 'none';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          clonedElement.style.transform = 'none';
        }
      }
    });

    if (!canvas.width || !canvas.height) {
      throw new Error('Dimensiones de canvas vacías al capturar el elemento.');
    }

    const imgData =
      mimeType === 'image/jpeg'
        ? canvas.toDataURL(mimeType, jpegQuality)
        : canvas.toDataURL(mimeType);

    const pdf = new jsPDF(opts.orientation || 'p', 'mm', opts.format || 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, imageFormat.toUpperCase(), 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfPageHeight;

    while (heightLeft > 2) {
      position -= pdfPageHeight;
      pdf.addPage();
      pdf.addImage(imgData, imageFormat.toUpperCase(), 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;
    }

    pdf.save(cleanFilename);
    return true;
  } catch (err) {
    console.error('[PDF_GENERATOR] Error al generar el PDF mediante canvas:', err);
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
        return true;
      }
      return false;
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