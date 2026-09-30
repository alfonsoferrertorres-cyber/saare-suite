import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ASSETS OFICIALES DE S.A.A.R.E. EN BASE64 / RUTAS PÚBLICAS
const LOGO_SAARE_URL = '/assets/logo_saare.png';
const SAFE_CREATIVE_SEAL_URL = '/assets/2602275368731.info-finger-150.default.png';

/**
 * Carga una imagen de forma asíncrona para incrustación en canvas/PDF.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Genera y descarga un dossier/certificado en PDF a partir de un elemento del DOM.
 * Soporta paginación automática para documentos extensos.
 */
export async function generatePdfFromElement(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`No se encontró el elemento con ID "${elementId}" en el DOM.`);
  }

  // Renderizar canvas de alta resolución (scale: 2)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#0b0f19' // Fondo por defecto de la Consola S.A.A.R.E.
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgWidth = 210; // Ancho A4 en mm
  const pageHeight = 297; // Alto A4 en mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  // Primera página
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Paginación automática si el contenido supera una página A4
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`}`);
}

/**
 * Genera reportes forenses y certificados de evidencia criptográfica ISO/IEC 27037.
 */
export async function generatePdfReport(data: Record<string, unknown>, reportTitle: string): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // FONDO OSCURO CORPORATIVO
  pdf.setFillColor(11, 15, 25); // #0b0f19
  pdf.rect(0, 0, 210, 297, 'F');

  // CABECERA: LOGO S.A.A.R.E.
  try {
    const logoImg = await loadImage(LOGO_SAARE_URL);
    pdf.addImage(logoImg, 'PNG', 14, 12, 16, 16);
  } catch (e) {
    console.warn("Logo no disponible para inserción directa en PDF:", e);
  }

  // TITULAR Y SUBTÍTULO
  pdf.setTextColor(56, 189, 248); // #38bdf8
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('S.A.A.R.E. GOVERNANCE CORE', 34, 18);

  pdf.setTextColor(148, 163, 184); // #94a3b8
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('EVIDENCIA FORENSE CRIPTOGRÁFICA Y CONTROL EX-ANTE L7', 34, 24);

  // LÍNEA SEPARADORA
  pdf.setDrawColor(30, 41, 59); // #1e293b
  pdf.setLineWidth(0.5);
  pdf.line(14, 32, 196, 32);

  // TÍTULO DEL REPORTE
  pdf.setTextColor(248, 250, 252);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(reportTitle.toUpperCase(), 14, 42);

  // CUERPO: EVIDENCIAS EN FORMATO CLAVE - VALOR
  let yPosition = 52;
  pdf.setFontSize(8);

  const entries = Object.entries(data);
  entries.forEach(([key, value]) => {
    if (yPosition > 250) {
      pdf.addPage();
      pdf.setFillColor(11, 15, 25);
      pdf.rect(0, 0, 210, 297, 'F');
      yPosition = 20;
    }

    // Caja para la clave
    pdf.setFillColor(2, 6, 23); // #020617
    pdf.rect(14, yPosition - 4, 182, 8, 'F');
    pdf.setDrawColor(30, 41, 59);
    pdf.rect(14, yPosition - 4, 182, 8, 'S');

    pdf.setTextColor(56, 189, 248);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(key).toUpperCase(), 18, yPosition + 1);

    const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    pdf.setTextColor(226, 232, 240);
    pdf.setFont('helvetica', 'normal');
    
    // Truncar si excede el ancho de la página
    const truncatedVal = valStr.length > 85 ? `${valStr.substring(0, 82)}...` : valStr;
    pdf.text(truncatedVal, 80, yPosition + 1);

    yPosition += 11;
  });

  // PIE DE PÁGINA: SELLO SAFE CREATIVE Y TRUST ANCHOR
  try {
    const sealImg = await loadImage(SAFE_CREATIVE_SEAL_URL);
    pdf.addImage(sealImg, 'PNG', 14, 268, 24, 16);
  } catch (e) {
    console.warn("Sello de custodia no disponible:", e);
  }

  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139); // #64748b
  pdf.text('Anclaje de Confianza: SAARE-MD-IPRES-2026 | Bóveda Dual L7 Ex-Ante', 42, 274);
  pdf.text(`Fecha de Emisión: ${new Date().toISOString()} UTC | Norma: ISO/IEC 27037:2012`, 42, 278);

  const safeFileName = reportTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  pdf.save(`${safeFileName}.pdf`);
}

// Exportación unificada de compatibilidad
export const pdfGeneratorService = {
  generatePdfFromElement,
  generatePdfReport
};

export default pdfGeneratorService;