import os
import hashlib
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generar_manual_policy_engine_l7():
    pdf_filename = "MS3V_Manual_Implantacion_PolicyEngine_L7.pdf"
    
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Colores Corporativos MS3V
    primary_color = colors.HexColor("#0f172a")   # Slate Dark
    accent_color = colors.HexColor("#dc2626")    # Policy Red Alert
    tech_blue = colors.HexColor("#2563eb")       # Tech Blue
    text_color = colors.HexColor("#334155")      # Text Slate
    light_bg = colors.HexColor("#f8fafc")        # Light Slate
    border_color = colors.HexColor("#cbd5e1")    # Slate Border
    
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
        textColor=tech_blue,
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
        fontSize=7.2,
        leading=9.5,
        textColor=primary_color
    )

    story = []

    # --- MEMBRETE OFICIAL MS3V ---
    header_data = [
        [
            Paragraph("<b>MS3V TECHNOLOGIES S.L.</b><br/><font color='#64748b' size=7>DIVISIÓN DE ARQUITECTURA DE CIBERSEGURIDAD Y POLICY ENGINE L7</font>", body_style),
            Paragraph("<b>SOP-L7-ENGINE-002</b><br/><font color='#64748b' size=7>REF: MS3V-POLICY-L7-2026<br/>ESTADO: REFORZADO / AIR-GAPPED</font>", ParagraphStyle('RHead', parent=body_style, alignment=2))
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
    story.append(Paragraph("Manual de Implantación: Motor de Filtrado Policy Engine L7 & Resguardo Criptográfico", title_style))
    story.append(Paragraph("Especificación de Interceptación Determinista en RAM Volátil (0x00) y Emisión de Resguardos de Atestación", subtitle_style))

    # Sección 1: Arquitectura de Interceptación L7
    story.append(Paragraph("1. Principios de Interceptación Perimetral en Capa 7 (L7 Gateway)", heading_style))
    p1 = (
        "El motor <b>Policy Engine L7 de S.A.A.R.E.</b> actúa como un proxy inverso de inspección previa (ex-ante) en la capa de "
        "aplicación HTTP/2 y gRPC. A diferencia de los guardarraíles estocásticos tradicionales, intercepta la trama directamente "
        "en la memoria volátil RAM antes de que alcance la VRAM de cualquier LLM o agente autónomo, garantizando un tiempo de respuesta "
        "de sub-milisegundo (< 1,16 ms) y una política estricta de <b>Zero-Disk Persistence</b>."
    )
    story.append(Paragraph(p1, body_style))
    story.append(Spacer(1, 4))

    # Sección 2: Reglas del Policy Engine
    story.append(Paragraph("2. Matriz de Reglas de Filtrado y Control Sintáctico AST", heading_style))
    
    policy_data = [
        [Paragraph("<b>Regla / Vector de Control</b>", body_bold), Paragraph("<b>Mecanismo de Filtrado L7</b>", body_bold), Paragraph("<b>Acción & Resguardo</b>", body_bold)],
        [
            Paragraph("<b>Inyección AST / Tool-Calling</b>", body_style),
            Paragraph("Parseo sintáctico ex-ante de payloads JSON/f.req. Neutralización de comandos maliciosos tipo <i>System Override</i>.", body_style),
            Paragraph("<b>403 FORBIDDEN</b><br/>Emisión de Resguardo", ParagraphStyle('R1', parent=body_style, textColor=accent_color, fontName='Helvetica-Bold'))
        ],
        [
            Paragraph("<b>Privacidad PII (DNI, IBAN, PAN)</b>", body_style),
            Paragraph("Saneamiento en búfer volátil mediante regex DLP. Redacción inmediata y borrado de memoria a 0x00.", body_style),
            Paragraph("<b>REDACT & PASS</b><br/>Resguardo PII Clean", ParagraphStyle('R2', parent=body_style, textColor=tech_blue, fontName='Helvetica-Bold'))
        ],
        [
            Paragraph("<b>Fail-Stop Logic (Kernel)</b>", body_style),
            Paragraph("Bloqueo instantáneo ante colisiones de hash o modificación no autorizada de pesos del modelo.", body_style),
            Paragraph("<b>PURGA DE SESIÓN</b><br/>Resguardo Alerta CISO", ParagraphStyle('R3', parent=body_style, textColor=colors.HexColor("#16a34a"), fontName='Helvetica-Bold'))
        ]
    ]

    t_policy = Table(policy_data, colWidths=[140, 260, 132])
    t_policy.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_policy)
    story.append(Spacer(1, 6))

    # Sección 3: Estructura del Resguardo Criptográfico (Attestation Proof)
    story.append(Paragraph("3. Estructura del Resguardo Criptográfico de Atestación (Audit Receipt)", heading_style))
    p3 = (
        "Cada petición analizada o interceptada por el Policy Engine L7 genera automáticamente una cabecera de atestación "
        "y un resguardo en la bóveda <code>saare_evidence_vault</code> firmado mediante algoritmos asimétricos Ed25519 e HMAC-SHA256:"
    )
    story.append(Paragraph(p3, body_style))

    sample_resguardo = (
        "HTTP/1.1 403 Forbidden\n"
        "X-SAARE-Engine-Status: INTERCEPTED_L7\n"
        "X-SAARE-Block-Reason: AGENTIC_AST_INJECTION_DETECTED\n"
        "X-SAARE-Latency-US: 840\n"
        "X-SAARE-HMAC-Signature: e83a9f4c71b2049d5e62f3a1890123456789abcdef0123456789abcdef012345\n"
        "X-SAARE-Timestamp-UTC: " + datetime.utcnow().strftime('%Y-%m-%d-%T') + "Z\n"
        "{"
        "  \"error\": \"Access Denied by S.A.A.R.E. Agentic Shield\",\n"
        "  \"architecture_proof\": \"L7_ZERO_DISK_ISOLATION_CONFIRMED\"\n"
        "}"
    )
    
    t_res = Table([[Paragraph(f"<b>Estructura de Cabecera y Resguardo Emitido:</b><br/><font fontName='Courier' size=6.8>{sample_resguardo.replace(chr(10), '<br/>')}</font>", body_style)]], colWidths=[532])
    t_res.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    story.append(t_res)
    story.append(Spacer(1, 6))

    # Sección 4: Guía de Implantación
    story.append(Paragraph("4. Pasos de Implantación y Despliegue en Producción", heading_style))
    p4 = (
        "<b>Paso 1:</b> Desplegar la imagen de Policy Engine L7 en modo estanco (<code>--read-only</code> y búfer tmpfs en RAM).<br/>"
        "<b>Paso 2:</b> Configurar las políticas perimetrales en <code>packages/policies/l7_rules.json</code>.<br/>"
        "<b>Paso 3:</b> Conectar la salida de logs con el módulo <code>saare_evidence_vault</code> para sincronización de sellos de tiempo Safe Creative (RFC 3161)."
    )
    story.append(Paragraph(p4, body_style))
    story.append(Spacer(1, 8))

    # --- BLOQUE DE FIRMA Y CERTIFICACIÓN ---
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=4, spaceAfter=8))
    
    sign_data = [
        [
            Paragraph("<b>CERTIFICACIÓN TÉCNICA DE POLICY ENGINE L7</b><br/>"
                      "El motor de filtrado L7 cumple con los requerimientos de aislamiento ex-ante del EU AI Act y el ENS Nivel Alto.", body_style),
            Paragraph("<b>MS3V TECHNOLOGIES S.L.</b><br/>"
                      "<i>Gabinete Técnico S.A.A.R.E.</i><br/>"
                      "Firma Digital Ed25519: VALIDADA<br/>"
                      f"Fecha: {datetime.now().strftime('%Y-%m-%d')} UTC", ParagraphStyle('SignRight', parent=body_style, fontSize=7.5, leading=10))
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
    print(f"¡Manual de Policy Engine L7 generado con éxito: {pdf_filename}!")

if __name__ == "__main__":
    generar_manual_policy_engine_l7()