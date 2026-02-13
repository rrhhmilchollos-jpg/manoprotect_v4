"""
ManoProtect - Professional Employment Contract Generator
Creates PDF employment contracts with company seal
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Circle, String, Line, Rect
from reportlab.graphics import renderPDF
from io import BytesIO
import os

# Colors
MANO_GREEN = HexColor('#10b981')
MANO_DARK = HexColor('#1f2937')
MANO_LIGHT = HexColor('#f0fdf4')

def create_company_seal():
    """Create ManoProtect official seal as a drawing"""
    d = Drawing(150, 150)
    
    # Outer circle
    d.add(Circle(75, 75, 70, strokeColor=MANO_GREEN, strokeWidth=3, fillColor=None))
    d.add(Circle(75, 75, 65, strokeColor=MANO_GREEN, strokeWidth=1, fillColor=None))
    
    # Inner circle
    d.add(Circle(75, 75, 45, strokeColor=MANO_GREEN, strokeWidth=2, fillColor=MANO_LIGHT))
    
    # Company name around the circle
    d.add(String(75, 130, "MANOPROTECT", fontSize=11, fontName='Helvetica-Bold', 
                 fillColor=MANO_GREEN, textAnchor='middle'))
    d.add(String(75, 15, "STARTBOOKING SL", fontSize=8, fontName='Helvetica', 
                 fillColor=MANO_DARK, textAnchor='middle'))
    
    # Shield icon in center (simplified)
    d.add(String(75, 80, "✓", fontSize=30, fontName='Helvetica-Bold', 
                 fillColor=MANO_GREEN, textAnchor='middle'))
    
    # CIF
    d.add(String(75, 55, "CIF: B19427723", fontSize=7, fontName='Helvetica', 
                 fillColor=MANO_DARK, textAnchor='middle'))
    
    return d

def create_contract_pdf(output_path):
    """Generate the employment contract PDF"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=MANO_DARK,
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=MANO_GREEN,
        alignment=TA_CENTER,
        spaceAfter=30,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=MANO_DARK,
        spaceBefore=15,
        spaceAfter=8,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=black,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
        leading=14
    )
    
    small_style = ParagraphStyle(
        'SmallText',
        parent=styles['Normal'],
        fontSize=8,
        textColor=HexColor('#6b7280'),
        alignment=TA_CENTER
    )
    
    # Build document content
    content = []
    
    # Header
    header_data = [
        [Paragraph("<b>MANOPROTECT</b>", ParagraphStyle('Header', fontSize=20, textColor=MANO_GREEN, fontName='Helvetica-Bold')),
         Paragraph("CONTRATO DE TRABAJO", ParagraphStyle('Header', fontSize=14, textColor=MANO_DARK, alignment=TA_RIGHT, fontName='Helvetica-Bold'))]
    ]
    header_table = Table(header_data, colWidths=[10*cm, 7*cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    content.append(header_table)
    
    content.append(Paragraph("STARTBOOKING SL - CIF: B19427723", small_style))
    content.append(Spacer(1, 0.5*cm))
    
    # Line separator
    content.append(Table([['']], colWidths=[17*cm], rowHeights=[2]))
    content[-1].setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), MANO_GREEN)]))
    content.append(Spacer(1, 0.5*cm))
    
    # Title
    content.append(Paragraph("CONTRATO DE TRABAJO INDEFINIDO", title_style))
    content.append(Paragraph("Conforme al Real Decreto Legislativo 2/2015 - Estatuto de los Trabajadores", subtitle_style))
    
    # Parties section
    content.append(Paragraph("REUNIDOS", heading_style))
    
    content.append(Paragraph("""
    <b>De una parte,</b> STARTBOOKING SL (en adelante "LA EMPRESA"), con CIF B19427723, 
    domicilio social en Alicante, España, y en su nombre y representación 
    D./Dña. _________________________________ en calidad de Director/a General, 
    con poderes suficientes para este acto.
    """, body_style))
    
    content.append(Paragraph("""
    <b>De otra parte,</b> D./Dña. _________________________________ (en adelante "EL/LA TRABAJADOR/A"), 
    mayor de edad, con DNI/NIE nº _________________, domiciliado/a en 
    _________________________________, código postal _______, provincia de _________________.
    """, body_style))
    
    content.append(Spacer(1, 0.3*cm))
    content.append(Paragraph("MANIFIESTAN", heading_style))
    
    content.append(Paragraph("""
    <b>I.</b> Que LA EMPRESA se dedica a la prestación de servicios de ciberseguridad y protección 
    digital bajo la marca comercial "ManoProtect", siendo necesaria la contratación de personal 
    cualificado para el desarrollo de su actividad.
    """, body_style))
    
    content.append(Paragraph("""
    <b>II.</b> Que EL/LA TRABAJADOR/A reúne las condiciones necesarias para cubrir el puesto de trabajo 
    ofertado, según su formación y experiencia profesional.
    """, body_style))
    
    content.append(Paragraph("""
    <b>III.</b> Que ambas partes, reconociéndose capacidad legal suficiente, acuerdan celebrar el presente 
    CONTRATO DE TRABAJO, que se regirá por las siguientes:
    """, body_style))
    
    content.append(Spacer(1, 0.3*cm))
    content.append(Paragraph("CLÁUSULAS", heading_style))
    
    # Clauses
    clauses = [
        ("<b>PRIMERA - Objeto del contrato</b>", 
         """EL/LA TRABAJADOR/A prestará sus servicios profesionales en el puesto de 
         _________________________________, dentro del departamento de _________________________________, 
         realizando las funciones propias de dicha categoría profesional conforme al Convenio Colectivo aplicable."""),
        
        ("<b>SEGUNDA - Duración</b>", 
         """El presente contrato tendrá carácter <b>INDEFINIDO</b>, comenzando a surtir efectos desde 
         el día ____ de ______________ de 20___. Se establece un período de prueba de _____ meses, 
         durante el cual cualquiera de las partes podrá dar por finalizada la relación laboral 
         sin necesidad de preaviso y sin derecho a indemnización."""),
        
        ("<b>TERCERA - Jornada laboral</b>", 
         """La jornada de trabajo será de _____ horas semanales, distribuidas de lunes a viernes. 
         El horario de trabajo será de ___:___ a ___:___ horas, con posibilidad de flexibilidad 
         horaria y trabajo en remoto según las políticas de la empresa."""),
        
        ("<b>CUARTA - Retribución</b>", 
         """EL/LA TRABAJADOR/A percibirá una retribución bruta anual de _____________ euros 
         (€_________), distribuida en _____ pagas (12 mensualidades + 2 pagas extras prorrateadas), 
         sujeta a las retenciones fiscales y de Seguridad Social correspondientes."""),
        
        ("<b>QUINTA - Vacaciones</b>", 
         """EL/LA TRABAJADOR/A tendrá derecho a disfrutar de 23 días laborables de vacaciones 
         anuales retribuidas, o la parte proporcional correspondiente al tiempo trabajado."""),
        
        ("<b>SEXTA - Confidencialidad</b>", 
         """EL/LA TRABAJADOR/A se compromete a mantener la más estricta confidencialidad sobre 
         toda la información, datos, procesos, clientes y know-how de LA EMPRESA, tanto durante 
         la vigencia del contrato como después de su extinción. El incumplimiento de esta cláusula 
         podrá dar lugar a las acciones legales correspondientes."""),
        
        ("<b>SÉPTIMA - Propiedad intelectual</b>", 
         """Todos los desarrollos, creaciones, invenciones y mejoras realizadas por EL/LA TRABAJADOR/A 
         durante la vigencia del contrato y relacionadas con la actividad de LA EMPRESA, serán 
         propiedad exclusiva de ésta."""),
        
        ("<b>OCTAVA - Protección de datos</b>", 
         """EL/LA TRABAJADOR/A autoriza a LA EMPRESA al tratamiento de sus datos personales 
         conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), 
         para fines laborales, administrativos y de gestión de recursos humanos."""),
        
        ("<b>NOVENA - Obligaciones del trabajador</b>", 
         """EL/LA TRABAJADOR/A se compromete a: cumplir las órdenes e instrucciones de LA EMPRESA, 
         observar las medidas de seguridad e higiene, contribuir a la mejora de la productividad, 
         y no realizar actividades que supongan competencia desleal."""),
        
        ("<b>DÉCIMA - Legislación aplicable</b>", 
         """El presente contrato se rige por el Real Decreto Legislativo 2/2015, de 23 de octubre, 
         por el que se aprueba el texto refundido de la Ley del Estatuto de los Trabajadores, 
         y demás normativa laboral vigente."""),
    ]
    
    for title, text in clauses:
        content.append(Paragraph(title, body_style))
        content.append(Paragraph(text, body_style))
        content.append(Spacer(1, 0.2*cm))
    
    content.append(Spacer(1, 0.5*cm))
    
    # Signatures section
    content.append(Paragraph("FIRMAS", heading_style))
    content.append(Paragraph("""
    Y para que conste y en prueba de conformidad, ambas partes firman el presente contrato 
    por duplicado y a un solo efecto, en el lugar y fecha indicados a continuación.
    """, body_style))
    
    content.append(Spacer(1, 0.3*cm))
    
    # Location and date
    content.append(Paragraph("En _________________________, a _____ de __________________ de 20___", body_style))
    
    content.append(Spacer(1, 1*cm))
    
    # Signature boxes
    sig_data = [
        [Paragraph("<b>Por LA EMPRESA</b><br/>STARTBOOKING SL", 
                   ParagraphStyle('Sig', fontSize=10, alignment=TA_CENTER)),
         Paragraph("<b>EL/LA TRABAJADOR/A</b>", 
                   ParagraphStyle('Sig', fontSize=10, alignment=TA_CENTER))],
        ['', ''],
        ['', ''],
        ['', ''],
        [Paragraph("Fdo.: _______________________<br/>Director/a General", 
                   ParagraphStyle('Sig', fontSize=9, alignment=TA_CENTER)),
         Paragraph("Fdo.: _______________________<br/>DNI/NIE: _______________", 
                   ParagraphStyle('Sig', fontSize=9, alignment=TA_CENTER))]
    ]
    
    sig_table = Table(sig_data, colWidths=[8.5*cm, 8.5*cm], rowHeights=[1*cm, 1.5*cm, 1.5*cm, 0.5*cm, 1*cm])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (0, -1), 1, HexColor('#e5e7eb')),
        ('BOX', (1, 0), (1, -1), 1, HexColor('#e5e7eb')),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    content.append(sig_table)
    
    content.append(Spacer(1, 1*cm))
    
    # Company seal area
    seal_text = ParagraphStyle('SealText', fontSize=8, alignment=TA_CENTER, textColor=HexColor('#9ca3af'))
    content.append(Paragraph("[SELLO DE LA EMPRESA]", seal_text))
    
    content.append(Spacer(1, 0.5*cm))
    
    # Footer
    footer_style = ParagraphStyle('Footer', fontSize=7, alignment=TA_CENTER, textColor=HexColor('#9ca3af'))
    content.append(Paragraph("─" * 80, footer_style))
    content.append(Paragraph("""
    STARTBOOKING SL (ManoProtect) | CIF: B19427723 | Alicante, España<br/>
    Este documento es confidencial y está protegido por la legislación vigente.<br/>
    Modelo de contrato v2.0 - Febrero 2026
    """, footer_style))
    
    # Build PDF
    doc.build(content)

def add_seal_to_pdf(input_path, output_path):
    """Add company seal watermark to the PDF"""
    from reportlab.pdfgen import canvas
    from PyPDF2 import PdfReader, PdfWriter
    
    # Create seal overlay
    seal_buffer = BytesIO()
    c = canvas.Canvas(seal_buffer, pagesize=A4)
    
    # Draw seal
    seal = create_company_seal()
    renderPDF.draw(seal, c, 400, 100)  # Position at bottom right
    
    c.save()
    seal_buffer.seek(0)
    
    # Merge with original
    try:
        from PyPDF2 import PdfReader, PdfWriter
        
        original = PdfReader(input_path)
        seal_pdf = PdfReader(seal_buffer)
        writer = PdfWriter()
        
        for i, page in enumerate(original.pages):
            if i == len(original.pages) - 1:  # Last page
                page.merge_page(seal_pdf.pages[0])
            writer.add_page(page)
        
        with open(output_path, 'wb') as f:
            writer.write(f)
    except ImportError:
        # If PyPDF2 not available, just copy original
        import shutil
        shutil.copy(input_path, output_path)

if __name__ == "__main__":
    output_dir = "/app/frontend/public/contratos"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate contract PDF
    contract_path = os.path.join(output_dir, "Contrato_Trabajo_ManoProtect.pdf")
    create_contract_pdf(contract_path)
    print(f"✅ Contrato generado: {contract_path}")
    
    # Try to add seal (if PyPDF2 available)
    try:
        import PyPDF2
        final_path = os.path.join(output_dir, "Contrato_Trabajo_ManoProtect_Sellado.pdf")
        add_seal_to_pdf(contract_path, final_path)
        print(f"✅ Contrato con sello: {final_path}")
    except ImportError:
        print("⚠️ PyPDF2 no disponible, usando contrato sin sello adicional")
        final_path = contract_path
    
    print("✅ Proceso completado")
