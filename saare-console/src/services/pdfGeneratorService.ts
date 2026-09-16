// saare-console/src/services/pdfGeneratorService.ts

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera y descarga un informe PDF a partir de un elemento HTML del DOM.
 * Integrado para soportes forenses S.A.A.R.E. y exportaciones GRC.
 */
export const generatePdfFromElement = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[SAARE PDF Engine] Elemento con ID "${elementId}" no encontrado.`);
    return;
  }

  // Captura en alta definición (Scale 2) garantizando fondo blanco en contenedores
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = 210;
  const pageHeight = 297;

  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  // Primera página
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
  heightLeft -= pageHeight;

  // Paginación continua alineada
  while (heightLeft > 0) {
    position -= pageHeight; // Desplazamiento vertical constante
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  pdf.save(cleanFileName);
};

// Alias para mantener compatibilidad con componentes React (.jsx / .tsx)
export const downloadPdfFromElement = generatePdfFromElement;