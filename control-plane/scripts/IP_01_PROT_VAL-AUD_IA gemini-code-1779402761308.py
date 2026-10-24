from weasyprint import HTML

html_content = """
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    @page { size: A4; margin: 20mm; background-color: #fdfbf7; }
    body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #333; }
    h1 { color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
    h2 { color: #5d6d7e; margin-top: 25px; }
    .meta { font-style: italic; color: #7f8c8d; margin-bottom: 30px; }
    .content { white-space: pre-wrap; }
    .system-msg { color: #2980b9; font-weight: bold; margin-top: 15px; }
</style>
</head>
<body>
    <h1>Protocolo VAL-AUD: Historial de Desarrollo</h1>
    <p class="meta">Documentación técnica, estratégica y legal consolidada (Mayo 2026)</p>
    
    <div class="content">
        <h2>1. Génesis del Proyecto: Arquitectura VAL-AUD</h2>
        <p>Se ha definido un protocolo de auditoría algorítmica estructurado en 5 bloques críticos. Este sistema actúa como una "aduana" para modelos de IA, garantizando inmutabilidad y cumplimiento normativo. Se ha introducido el concepto de "Brecha" para identificar puntos de vulnerabilidad técnica.</p>

        <h2>2. Modelo de Negocio: Economía de Tokens</h2>
        <p>El sistema se monetiza mediante un modelo de "Peaje de Infraestructura" (Auditoría como Servicio - AaaS). Las empresas adquieren tokens que se consumen por cada certificación de integridad algorítmica realizada por el protocolo.</p>

        <h2>3. Blindaje y Protección Legal</h2>
        <p>Se ha establecido la hoja de ruta para la protección global:
        <ul>
            <li>Solicitud PCT (Tratado de Cooperación en materia de Patentes).</li>
            <li>Protección mediante Secreto Industrial para los algoritmos clave.</li>
            <li>Uso obligatorio de Acuerdos de Confidencialidad (NDA) antes de cualquier divulgación técnica.</li>
        </ul>
        </p>

        <h2>4. Hoja de Ruta Operativa en Alicante</h2>
        <p>El proyecto debe articularse a través de la OTRI de la Universidad de Alicante y los recursos del Distrito Digital. Se recomienda iniciar contactos institucionales para validar la tecnología bajo el marco de la Ley de IA de la UE.</p>
    </div>
</body>
</html>
"""

with open('Historial_Consolidado_VAL-AUD.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

HTML(filename='Historial_Consolidado_VAL-AUD.html').write_pdf('Historial_Consolidado_VAL-AUD.pdf')