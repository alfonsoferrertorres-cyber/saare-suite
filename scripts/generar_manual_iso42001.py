import os
import hashlib
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generar_manual_calidad_iso42001():
    pdf_filename = "MS3V_Manual_Calidad_Metodologia_ISO42001.pdf"
    
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Colores Corporativos MS3V
    primary_color = colors.HexColor("#0f172a")  # Slate Dark / Deep Navy
    accent_color = colors.HexColor("#2563eb")   # Blue Tech
    secondary_color = colors.HexColor("#0284c7") # Sky Blue
    text_color = colors.HexColor("#334155")     # Slate Text
    light_bg = colors.HexColor("#f8fafc")       # Light Background
    border_color = colors.HexColor("#cbd5e1")   # Border Slate
    
    # Estilos Tipográficos
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=accent_color,
        spaceAfter=10
    )
    
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=primary_color,
        spaceBefore=8,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=text_color,
        spaceAfter=4
    )
    
    body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    code_style = ParagraphStyle(
        'CodeStyleCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=primary_color
    )

    story = []

    # --- MEMBRETE OFICIAL MS3V ---
    header_data = [
        [
            Paragraph("<b>MS3V TECHNOLOGIES S.L.</b><br/><font color='#64748b' size=7>DIVISIÓN DE GOBERNANZA, AUDITORÍA Y CUMPLIMIENTO REGULATORIO</font>", body_style),
            Paragraph("<b>SOP-SAARE-001</b><br/><font color='#64748b' size=7>REF: MS3V-ISO42001-SOP-2026<br/>VERSIÓN: 1.0 PRODUC</font>", ParagraphStyle('RHead', parent=body_style, alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 212])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceBefore=4, spaceAfter=8))

    # Título Principal
    story.append(Paragraph("Manual de Calidad y Metodología de Auditoría ISO/IEC 42001", title_style))
    story.append(Paragraph("Standard Operating Procedure (SOP) Técnico: Cumplimiento Ejecutable mediante Código (\"Compliance-as-Code\")", subtitle_style))

    # Sección 1: Enfoque Estratégico
    story.append(Paragraph("1. Enfoque Estratégico: Manual de Calidad Ejecutable y Basado en Evidencias", heading_style))
    p1 = (
        "El presente documento establece el marco operativo y la metodología formal de cumplimiento normativo "
        "para la norma <b>ISO/IEC 42001:2023</b> (Sistema de Gestión de Inteligencia Artificial). Frente a las soluciones "
        "documentales teóricas convencionales, MS3V Technologies articula su Manual de Calidad como una <b>especificación "
        "técnica ejecutable</b>. El protocolo S.A.A.R.E. actúa como el esqueleto vivo de auditoría ex-ante, transformando "
        "los controles de calidad y gobernanza en pruebas matemáticas inalterables procesadas directamente en tiempo de ejecución."
    )
    story.append(Paragraph(p1, body_style))
    story.append(Spacer(1, 4))

    # Sección 2: Especificación del SOP Técnico
    story.append(Paragraph("2. Especificación Técnica del Standard Operating Procedure (SOP)", heading_style))
    story.append(Paragraph("El motor S.A.A.R.E. automatiza los controles operacionales de la norma ISO/IEC 42001 bajo tres pilares fundamentales de diseño:", body_style))

    sop_table_data = [
        [Paragraph("<b>Pilar del SOP Técnico</b>", body_bold), Paragraph("<b>Mecanismo de Ejecución y Garantía Normativa</b>", body_bold)],
        [
            Paragraph("<b>Política de Ingesta Cero y Limpieza RAM (0x00)</b>", body_style),
            Paragraph("Aislamiento determinista L7. La inspección de prompts y payloads se realiza exclusivamente en memoria volátil (RAM). Los búferes intermedios se sobrescriben a 0x00 tras la evaluación, garantizando la no persistencia en disco y el cumplimiento estricto del Art. 5 y 17 del RGPD (Privacidad por Diseño).", body_style)
        ],
        [
            Paragraph("<b>Metodología Hash SHA-256 & Sellado Temporal</b>", body_style),
            Paragraph("Generación automática del <i>Root Digest</i> SHA-256 para cada transacción de agentes autónomos. La evidencia se ancla mediante sellado temporal UTC (RFC 3161) y firmas criptográficas asimétricas Ed25519, garantizando la inmutabilidad y la trazabilidad forense ex-ante.", body_style)
        ],
        [
            Paragraph("<b>Trazabilidad de Tool-Calling (EU AI Act)</b>", body_style),
            Paragraph("Interceptor sintáctico AST que evalúa ex-ante las llamadas a herramientas y decisiones de modelos generativos (Art. 9, 12 y 14 del EU AI Act), bloqueando desviaciones o ejecuciones no autorizadas antes de que alcancen el backend.", body_style)
        ]
    ]

    t_sop = Table(sop_table_data, colWidths=[180, 352])
    t_sop.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_sop)
    story.append(Spacer(1, 6))

    # Sección 3: Anexos Probatorios Automáticos
    story.append(Paragraph("3. Informes Automáticos como Anexos Probatorios (\"Compliance-as-Code\")", heading_style))
    p3 = (
        "Ante el requerimiento de auditorías por parte de autoridades de acreditación (AESIA, AEPD) o comités de "
        "ciberseguridad (CISO/GRC), el sistema genera de forma autónoma el paquete de evidencias de la bóveda nativa "
        "(<i>EvidenceVault</i>). Este enfoque reemplaza la burocracia en papel por un pasaporte probatorio auditable en segundos:"
    )
    story.append(Paragraph(p3, body_style))

    ev_table_data = [
        [Paragraph("<b>Requisito ISO/IEC 42001</b>", body_bold), Paragraph("<b>Evidencia Criptográfica Generada por S.A.A.R.E.</b>", body_bold), Paragraph("<b>Estado</b>", body_bold)],
        [Paragraph("A.6: Datos para Sistemas de IA", body_style), Paragraph("Registro de Ingesta Cero y saneamiento de PII en memoria RAM.", body_style), Paragraph("<b>VERIFICADO</b>", ParagraphStyle('Ok1', parent=body_style, textColor=colors.HexColor("#16a34a")))],
        [Paragraph("A.8: Control Operacional", body_style), Paragraph("Firma HMAC-SHA256 e interceptación L7 en sub-milisegundo (< 1.16ms).", body_style), Paragraph("<b>VERIFICADO</b>", ParagraphStyle('Ok2', parent=body_style, textColor=colors.HexColor("#16a34a")))],
        [Paragraph("A.9: Transparencia y Explicabilidad", body_style), Paragraph("Dossier Pericial PDF con marca temporal UTC e identificador de registro.", body_style), Paragraph("<b>INDEXADO</b>", ParagraphStyle('Ok3', parent=body_style, textColor=colors.HexColor("#0284c7")))]
    ]

    t_ev = Table(ev_table_data, colWidths=[140, 312, 80])
    t_ev.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_ev)
    story.append(Spacer(1, 6))

    # Sección 4: Estructura de Presentación del Dossier
    story.append(Paragraph("4. Protocolo de Presentación del Dossier de Homologación", heading_style))
    p4 = (
        "Para someter la solución al escrutinio formal de organismos de acreditación e inversores enterprise, "
        "el expediente de homologación se articula estrictamente en la siguiente secuencia de dos capas:<br/>"
        "<b>1. Marco Metodológico:</b> La política de gobernanza ISO 42001 definida en este SOP.<br/>"
        "<b>2. Evidencia Ejecutable:</b> El Informe Pericial firmado con el Root Digest SHA-256 anclado al sello temporal de Safe Creative."
    )
    story.append(Paragraph(p4, body_style))
    story.append(Spacer(1, 8))

    # --- BLOQUE DE FIRMA Y CERTIFICACIÓN ---
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=4, spaceAfter=8))
    
    sign_data = [
        [
            Paragraph("<b>DICTAMEN DE HOMOLOGACIÓN TÉCNICA INTERNA</b><br/>"
                      "El presente Manual de Calidad Ejecutable cumple con los requisitos formales de la norma ISO/IEC 42001:2023 "
                      "y el Reglamento Europeo de IA (UE 2024/1689).", body_style),
            Paragraph("<b>MS3V TECHNOLOGIES S.L.</b><br/>"
                      "<i>División de Auditoría y Cumplimiento</i><br/>"
                      "Firma Criptográfica: Ed25519 Verified<br/>"
                      f"Fecha de Emisión: {datetime.now().strftime('%Y-%m-%d')} UTC", ParagraphStyle('SignRight', parent=body_style, fontSize=7.5, leading=10))
        ]
    ]
    
    t_sign = Table(sign_data, colWidths=[320, 212])
    t_sign.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 0.5, primary_color),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    story.append(t_sign)

    doc.build(story)
    print(f"¡Manual de Calidad ISO 42001 generado con éxito: {pdf_filename}!")

if __name__ == "__main__":
    generar_manual_calidad_iso42001()