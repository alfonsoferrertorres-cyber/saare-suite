import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdfFromElement = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento con ID ${elementId} no encontrado.`);
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = 210; // Ancho A4 en mm
  const pageHeight = 297; // Alto A4 en mm
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

  // Elimina duplicados de extensión si el nombre ya incluye ".pdf"
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  pdf.save(cleanFileName);
};

// Alias para resolver la importación en ReportExportModal.jsx
export const downloadPdfFromElement = generatePdfFromElement;