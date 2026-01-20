"""
Generador de Contratos Bancarios PDF - ManoBank
Genera contratos profesionales estilo BBVA para apertura de cuentas
"""
import io
import os
from datetime import datetime, timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT


def generate_account_contract(customer_data: dict, account_data: dict, employee_data: dict = None) -> bytes:
    """
    Genera contrato de apertura de cuenta bancaria en PDF
    
    Args:
        customer_data: Datos del cliente (nombre, dni, dirección, etc.)
        account_data: Datos de la cuenta (tipo, IBAN, etc.)
        employee_data: Datos del empleado que procesa (opcional)
    
    Returns:
        bytes: PDF en formato bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='Title_Custom',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=20,
        alignment=TA_CENTER
    ))
    
    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceBefore=15,
        spaceAfter=10
    ))
    
    styles.add(ParagraphStyle(
        name='Body_Justified',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
        leading=14
    ))
    
    styles.add(ParagraphStyle(
        name='Small',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_JUSTIFY
    ))
    
    styles.add(ParagraphStyle(
        name='Header_Right',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_RIGHT,
        textColor=colors.grey
    ))
    
    elements = []
    
    # Header
    contract_number = f"CONT-{datetime.now().strftime('%Y%m%d')}-{account_data.get('id', 'XXXXX')[-5:].upper()}"
    today = datetime.now().strftime('%d de %B de %Y')
    
    elements.append(Paragraph(f"Contrato Nº: {contract_number}", styles['Header_Right']))
    elements.append(Paragraph(f"Fecha: {today}", styles['Header_Right']))
    elements.append(Spacer(1, 1*cm))
    
    # Logo and Title
    elements.append(Paragraph("🏦 MANOBANK", styles['Title_Custom']))
    elements.append(Paragraph("CONTRATO DE APERTURA DE CUENTA BANCARIA", styles['Title_Custom']))
    elements.append(Spacer(1, 0.5*cm))
    
    # Partes del contrato
    elements.append(Paragraph("PARTES INTERVINIENTES", styles['Subtitle']))
    
    bank_info = """
    <b>PRIMERA PARTE - LA ENTIDAD BANCARIA:</b><br/>
    MANOBANK, S.A., entidad de crédito inscrita en el Registro de Entidades de Crédito del Banco de España 
    con el número XXXX, con domicilio social en Madrid, España, CIF: B-XXXXXXXX, 
    representada en este acto por el empleado autorizado que firma al pie del presente documento.
    """
    elements.append(Paragraph(bank_info, styles['Body_Justified']))
    elements.append(Spacer(1, 0.3*cm))
    
    customer_info = f"""
    <b>SEGUNDA PARTE - EL CLIENTE:</b><br/>
    <b>Nombre completo:</b> {customer_data.get('customer_name', 'N/A')}<br/>
    <b>DNI/NIE:</b> {customer_data.get('customer_dni', 'N/A')}<br/>
    <b>Fecha de nacimiento:</b> {customer_data.get('date_of_birth', 'N/A')}<br/>
    <b>Nacionalidad:</b> {customer_data.get('nationality', 'Española')}<br/>
    <b>Domicilio:</b> {customer_data.get('address_street', 'N/A')}<br/>
    <b>Código Postal:</b> {customer_data.get('address_postal_code', 'N/A')} 
    <b>Ciudad:</b> {customer_data.get('address_city', 'N/A')}<br/>
    <b>Provincia:</b> {customer_data.get('address_province', 'N/A')} 
    <b>País:</b> {customer_data.get('address_country', 'España')}<br/>
    <b>Teléfono:</b> {customer_data.get('customer_phone', 'N/A')}<br/>
    <b>Email:</b> {customer_data.get('customer_email', 'N/A')}<br/>
    <b>Ocupación:</b> {customer_data.get('occupation', 'N/A')}
    """
    elements.append(Paragraph(customer_info, styles['Body_Justified']))
    elements.append(Spacer(1, 0.5*cm))
    
    # Datos de la cuenta
    elements.append(Paragraph("DATOS DE LA CUENTA", styles['Subtitle']))
    
    account_types = {
        'corriente': 'Cuenta Corriente',
        'ahorro': 'Cuenta de Ahorro',
        'nomina': 'Cuenta Nómina',
        'empresa': 'Cuenta Empresa',
        'joven': 'Cuenta Joven'
    }
    
    account_info = f"""
    <b>Tipo de cuenta:</b> {account_types.get(account_data.get('account_type', 'corriente'), 'Cuenta Corriente')}<br/>
    <b>IBAN:</b> {account_data.get('iban', 'Pendiente de asignación')}<br/>
    <b>Moneda:</b> EUR (Euro)<br/>
    <b>Depósito inicial:</b> {account_data.get('initial_deposit', 0):.2f} €
    """
    elements.append(Paragraph(account_info, styles['Body_Justified']))
    elements.append(Spacer(1, 0.5*cm))
    
    # Cláusulas del contrato
    elements.append(Paragraph("CLÁUSULAS DEL CONTRATO", styles['Subtitle']))
    
    clausulas = [
        ("<b>PRIMERA - OBJETO DEL CONTRATO:</b>", 
         "El presente contrato tiene por objeto regular la apertura y funcionamiento de una cuenta bancaria "
         "a nombre del CLIENTE en MANOBANK, así como los servicios asociados a la misma."),
        
        ("<b>SEGUNDA - OPERACIONES PERMITIDAS:</b>",
         "El CLIENTE podrá realizar las siguientes operaciones: ingresos en efectivo y mediante transferencia, "
         "disposiciones en efectivo, transferencias nacionales e internacionales, domiciliación de recibos, "
         "pagos con tarjeta de débito/crédito asociada, y consulta de saldos y movimientos."),
        
        ("<b>TERCERA - TITULARIDAD:</b>",
         "La cuenta se abre a nombre del CLIENTE como titular único. El CLIENTE podrá autorizar a terceras "
         "personas para operar en la cuenta mediante el procedimiento establecido por MANOBANK."),
        
        ("<b>CUARTA - COMISIONES Y GASTOS:</b>",
         "Las comisiones aplicables serán las vigentes en el momento de la operación según el folleto de tarifas "
         "de MANOBANK, disponible en la web y oficinas. MANOBANK se reserva el derecho de modificar las tarifas "
         "previa comunicación al CLIENTE con dos meses de antelación."),
        
        ("<b>QUINTA - INTERESES:</b>",
         "La cuenta devengará intereses según las condiciones vigentes. El tipo de interés nominal anual (TIN) "
         "y la tasa anual equivalente (TAE) serán comunicados al CLIENTE en el documento de condiciones particulares."),
        
        ("<b>SEXTA - EXTRACTOS Y COMUNICACIONES:</b>",
         "MANOBANK remitirá al CLIENTE extractos mensuales de cuenta por medios electrónicos o en papel según "
         "preferencia del CLIENTE. Las comunicaciones se realizarán a la dirección de email o postal indicada."),
        
        ("<b>SÉPTIMA - PROTECCIÓN DE DATOS:</b>",
         "Los datos personales del CLIENTE serán tratados conforme al Reglamento General de Protección de Datos (RGPD) "
         "y la Ley Orgánica de Protección de Datos. El CLIENTE puede ejercer sus derechos ARCO dirigiéndose a "
         "protecciondatos@manobank.es"),
        
        ("<b>OCTAVA - PREVENCIÓN DEL BLANQUEO DE CAPITALES:</b>",
         "El CLIENTE declara que los fondos depositados tienen origen lícito y se compromete a facilitar la "
         "documentación que MANOBANK pueda requerir en cumplimiento de la normativa de prevención del blanqueo "
         "de capitales y financiación del terrorismo."),
        
        ("<b>NOVENA - DURACIÓN Y RESOLUCIÓN:</b>",
         "El presente contrato se celebra por tiempo indefinido. Cualquiera de las partes podrá resolverlo "
         "mediante comunicación escrita con un preaviso de dos meses. A la resolución, el CLIENTE deberá "
         "retirar el saldo existente o indicar cuenta destino para transferencia."),
        
        ("<b>DÉCIMA - JURISDICCIÓN:</b>",
         "Para cualquier controversia derivada del presente contrato, las partes se someten a los Juzgados "
         "y Tribunales del domicilio del CLIENTE, sin perjuicio del derecho de este a acudir al Servicio de "
         "Reclamaciones del Banco de España.")
    ]
    
    for titulo, texto in clausulas:
        elements.append(Paragraph(titulo, styles['Body_Justified']))
        elements.append(Paragraph(texto, styles['Body_Justified']))
        elements.append(Spacer(1, 0.2*cm))
    
    elements.append(PageBreak())
    
    # Página de firmas
    elements.append(Paragraph("DECLARACIONES Y FIRMAS", styles['Subtitle']))
    
    declaracion = """
    El CLIENTE declara:<br/>
    • Que ha leído y comprende todas las cláusulas del presente contrato.<br/>
    • Que los datos proporcionados son veraces y se compromete a comunicar cualquier modificación.<br/>
    • Que ha recibido copia del documento de tarifas y condiciones.<br/>
    • Que autoriza a MANOBANK a verificar la información proporcionada.<br/>
    • Que acepta la recepción de comunicaciones por medios electrónicos.
    """
    elements.append(Paragraph(declaracion, styles['Body_Justified']))
    elements.append(Spacer(1, 1*cm))
    
    # Tabla de firmas
    firma_data = [
        ['EL CLIENTE', 'POR MANOBANK'],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        [f"Fdo: {customer_data.get('customer_name', '_________________')}", 
         f"Fdo: {employee_data.get('name', '_________________') if employee_data else '_________________'}"],
        [f"DNI: {customer_data.get('customer_dni', '_________________')}", 
         f"Cargo: {employee_data.get('role', 'Empleado') if employee_data else '_________________'}"],
    ]
    
    firma_table = Table(firma_data, colWidths=[8*cm, 8*cm])
    firma_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('LINEBELOW', (0, 4), (0, 4), 1, colors.black),
        ('LINEBELOW', (1, 4), (1, 4), 1, colors.black),
    ]))
    
    elements.append(firma_table)
    elements.append(Spacer(1, 1*cm))
    
    # Fecha y lugar
    elements.append(Paragraph(
        f"En Madrid, a {today}",
        ParagraphStyle('Center', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)
    ))
    elements.append(Spacer(1, 1*cm))
    
    # Pie de página legal
    legal_footer = """
    <font size="8" color="grey">
    MANOBANK, S.A. - Entidad inscrita en el Registro de Entidades de Crédito del Banco de España.<br/>
    Adherida al Fondo de Garantía de Depósitos de Entidades de Crédito.<br/>
    Servicio de Atención al Cliente: atencion@manobank.es | Tel: 900 XXX XXX<br/>
    Este documento es una copia del contrato original que queda en poder de MANOBANK.
    </font>
    """
    elements.append(Paragraph(legal_footer, styles['Small']))
    
    # Build PDF
    doc.build(elements)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


def generate_card_contract(customer_data: dict, card_data: dict) -> bytes:
    """Genera contrato de tarjeta de débito/crédito"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Title_Custom', parent=styles['Heading1'], fontSize=18, textColor=colors.HexColor('#1e3a8a'), spaceAfter=20, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name='Subtitle', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#1e40af'), spaceBefore=15, spaceAfter=10))
    styles.add(ParagraphStyle(name='Body_Justified', parent=styles['Normal'], fontSize=10, alignment=TA_JUSTIFY, spaceAfter=8, leading=14))
    
    elements = []
    
    today = datetime.now().strftime('%d de %B de %Y')
    
    elements.append(Paragraph("🏦 MANOBANK", styles['Title_Custom']))
    elements.append(Paragraph("CONTRATO DE TARJETA BANCARIA", styles['Title_Custom']))
    elements.append(Spacer(1, 0.5*cm))
    
    card_types = {'debito': 'Tarjeta de Débito', 'credito': 'Tarjeta de Crédito', 'platinum': 'Tarjeta Platinum', 'black': 'Tarjeta Black'}
    
    card_info = f"""
    <b>DATOS DE LA TARJETA:</b><br/>
    <b>Tipo:</b> {card_types.get(card_data.get('card_type', 'debito'), 'Tarjeta de Débito')}<br/>
    <b>Titular:</b> {customer_data.get('name', 'N/A')}<br/>
    <b>Número:</b> {card_data.get('card_number_masked', '**** **** **** ****')}<br/>
    <b>Fecha de caducidad:</b> {card_data.get('expiry_date', 'MM/AA')}<br/>
    <b>Límite de crédito:</b> {card_data.get('credit_limit', 0):.2f} € (si aplica)
    """
    elements.append(Paragraph(card_info, styles['Body_Justified']))
    elements.append(Spacer(1, 1*cm))
    
    elements.append(Paragraph(f"En Madrid, a {today}", ParagraphStyle('Center', parent=styles['Normal'], alignment=TA_CENTER)))
    
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
