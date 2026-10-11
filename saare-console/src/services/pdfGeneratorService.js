// saare-console/src/services/pdfGeneratorService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePdfFromElement = async (elementId, filename = 'documento.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[PDF_GENERATOR] Elemento #${elementId} no encontrado.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename.replace(/\.pdf$/, '')}.pdf`);
  } catch (err) {
    console.error('[PDF_GENERATOR] Error generando PDF, ejecutando fallback de impresión:', err);
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