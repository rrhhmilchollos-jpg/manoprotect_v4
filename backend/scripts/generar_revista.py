"""
Generador de Revista Comercial ManoProtect - 8 páginas PDF profesional
Para imprimir y entregar a comerciales como catálogo de ventas
"""
from fpdf import FPDF
import os

class RevistaManoProtect(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.set_auto_page_break(auto=False)
        
    def _color(self, hex_color):
        h = hex_color.lstrip('#')
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
    
    def rounded_rect(self, x, y, w, h, r, style='D', color=None):
        if color:
            self.set_fill_color(*self._color(color))
        self.rect(x, y, w, h, 'F' if style == 'F' else 'D')

    # ==========================================
    # PAGINA 1 - PORTADA
    # ==========================================
    def pagina_portada(self):
        self.add_page()
        # Fondo oscuro
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        
        # Franja verde decorativa superior
        self.set_fill_color(*self._color('#10b981'))
        self.rect(0, 0, 210, 5, 'F')
        
        # Logo area
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(30, 40, 150, 60, 'F')
        self.set_fill_color(*self._color('#10b981'))
        self.rect(85, 48, 40, 40, 'F')
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(255, 255, 255)
        self.set_xy(85, 52)
        self.cell(40, 30, 'MP', 0, 0, 'C')
        
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(255, 255, 255)
        self.set_xy(30, 90)
        self.cell(150, 10, 'MANOPROTECT', 0, 0, 'C')
        
        # Titulo principal
        self.set_font('Helvetica', 'B', 36)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(20, 130)
        self.cell(170, 15, 'SEGURIDAD', 0, 0, 'C')
        self.set_xy(20, 148)
        self.cell(170, 15, 'INTELIGENTE', 0, 0, 'C')
        
        self.set_font('Helvetica', '', 16)
        self.set_text_color(*self._color('#94a3b8'))
        self.set_xy(20, 175)
        self.cell(170, 8, 'Para tu Hogar y Negocio', 0, 0, 'C')
        
        # Separador
        self.set_fill_color(*self._color('#10b981'))
        self.rect(80, 192, 50, 1, 'F')
        
        # Subtitulo
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(255, 255, 255)
        self.set_xy(20, 205)
        self.cell(170, 8, 'CATALOGO COMERCIAL 2025-2026', 0, 0, 'C')
        
        self.set_font('Helvetica', '', 11)
        self.set_text_color(*self._color('#64748b'))
        self.set_xy(20, 218)
        self.cell(170, 6, 'Alarmas | Camaras | Sensores | Cerraduras Inteligentes', 0, 0, 'C')
        self.set_xy(20, 226)
        self.cell(170, 6, 'Central Receptora de Alarmas 24/7', 0, 0, 'C')
        
        # Datos contacto en portada
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(25, 250, 160, 30, 'F')
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(25, 253)
        self.cell(160, 5, 'www.manoprotect.com', 0, 0, 'C')
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*self._color('#94a3b8'))
        self.set_xy(25, 260)
        self.cell(160, 5, 'info@manoprotect.com  |  soporte@manoprotect.com', 0, 0, 'C')
        self.set_xy(25, 267)
        self.cell(160, 5, 'Atencion 24h  |  Instalacion profesional en toda Espana', 0, 0, 'C')

    # ==========================================
    # PAGINA 2 - QUIENES SOMOS
    # ==========================================
    def pagina_quienes_somos(self):
        self.add_page()
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*self._color('#10b981'))
        self.rect(0, 0, 210, 3, 'F')
        
        # Header
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(15, 15)
        self.cell(0, 10, 'QUIENES SOMOS', 0, 0)
        self.set_fill_color(*self._color('#10b981'))
        self.rect(15, 28, 40, 2, 'F')
        
        # Texto principal
        self.set_font('Helvetica', '', 11)
        self.set_text_color(*self._color('#e2e8f0'))
        y = 38
        textos = [
            "ManoProtect es una empresa espanola lider en soluciones de seguridad",
            "inteligente para hogares y negocios. Combinamos tecnologia de ultima",
            "generacion con un servicio humano excepcional.",
            "",
            "Nuestra Central Receptora de Alarmas (CRA) opera las 24 horas del",
            "dia, los 365 dias del ano, con operadores certificados que velan",
            "por la seguridad de miles de familias en toda Espana.",
        ]
        for t in textos:
            self.set_xy(15, y)
            self.cell(180, 6, t, 0, 0)
            y += 6
        
        # Bloques de valores
        y = 90
        valores = [
            ("TECNOLOGIA AVANZADA", "Sistemas con IA, deteccion inteligente, camaras 4K con vision nocturna y paneles de ultima generacion."),
            ("RESPUESTA INMEDIATA", "CRA 24/7 con tiempo de respuesta inferior a 30 segundos. Conexion directa con policia y emergencias."),
            ("INSTALACION PROFESIONAL", "Equipo de instaladores certificados. Instalacion incluida en todos nuestros packs."),
            ("PRECIO JUSTO", "Hasta un 40% mas economico que la competencia. Sin permanencia ni cuotas ocultas."),
        ]
        
        for titulo, desc in valores:
            self.set_fill_color(*self._color('#1e293b'))
            self.rect(15, y, 180, 28, 'F')
            self.set_fill_color(*self._color('#10b981'))
            self.rect(15, y, 3, 28, 'F')
            
            self.set_font('Helvetica', 'B', 11)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(22, y + 3)
            self.cell(170, 6, titulo, 0, 0)
            
            self.set_font('Helvetica', '', 9)
            self.set_text_color(*self._color('#94a3b8'))
            self.set_xy(22, y + 11)
            self.cell(170, 5, desc[:85], 0, 0)
            if len(desc) > 85:
                self.set_xy(22, y + 17)
                self.cell(170, 5, desc[85:], 0, 0)
            y += 35
        
        # Cifras
        y = 238
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(15, y, 180, 40, 'F')
        
        cifras = [("5.000+", "Familias\nprotegidas"), ("24/7", "CRA\nOperativa"), ("< 30s", "Tiempo\nrespuesta"), ("100%", "Instalacion\nincluida")]
        x = 20
        for num, label in cifras:
            self.set_font('Helvetica', 'B', 20)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(x, y + 5)
            self.cell(40, 10, num, 0, 0, 'C')
            self.set_font('Helvetica', '', 8)
            self.set_text_color(*self._color('#94a3b8'))
            lines = label.split('\n')
            for i, l in enumerate(lines):
                self.set_xy(x, y + 18 + i*5)
                self.cell(40, 5, l, 0, 0, 'C')
            x += 44

    # ==========================================
    # PAGINA 3 - PACK HOGAR
    # ==========================================
    def pagina_pack_hogar(self):
        self.add_page()
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*self._color('#10b981'))
        self.rect(0, 0, 210, 3, 'F')
        
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(15, 15)
        self.cell(0, 10, 'PACK HOGAR ESENCIAL', 0, 0)
        self.set_fill_color(*self._color('#10b981'))
        self.rect(15, 28, 50, 2, 'F')
        
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self._color('#94a3b8'))
        self.set_xy(15, 33)
        self.cell(180, 6, 'Todo lo que necesitas para proteger tu hogar con la mejor tecnologia', 0, 0)
        
        # Productos del pack
        y = 48
        productos = [
            ("1x Panel Central ManoProtect", "Cerebro del sistema. Conexion 4G/WiFi, bateria de emergencia, sirena integrada 95dB.", "199,99"),
            ("2x Sensor PIR Movimiento", "Deteccion avanzada con inmunidad a mascotas hasta 25kg. Cobertura 12m.", "29,99 c/u"),
            ("2x Sensor Puerta/Ventana", "Detector magnetico ultraslim. Instalacion sin cables. Bateria 3 anos.", "19,99 c/u"),
            ("1x Teclado Panel Alarma", "Teclado tactil retroiluminado con lector de tags NFC. Armar/Desarmar.", "49,99"),
            ("1x Sirena Interior 110dB", "Sirena adicional de alta potencia. Disuasion maxima ante intrusion.", "39,99"),
            ("1x Mando a Distancia", "Control remoto compacto. Armar, desarmar y boton SOS.", "14,99"),
        ]
        
        for nombre, desc, precio in productos:
            self.set_fill_color(*self._color('#1e293b'))
            self.rect(15, y, 180, 24, 'F')
            
            # Icono check verde
            self.set_fill_color(*self._color('#10b981'))
            self.rect(18, y + 4, 16, 16, 'F')
            self.set_font('Helvetica', 'B', 14)
            self.set_text_color(255, 255, 255)
            self.set_xy(18, y + 5)
            self.cell(16, 14, '>', 0, 0, 'C')
            
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(255, 255, 255)
            self.set_xy(38, y + 3)
            self.cell(120, 6, nombre, 0, 0)
            
            self.set_font('Helvetica', '', 8)
            self.set_text_color(*self._color('#94a3b8'))
            self.set_xy(38, y + 11)
            self.cell(120, 5, desc[:90], 0, 0)
            if len(desc) > 90:
                self.set_xy(38, y + 16)
                self.cell(120, 5, desc[90:], 0, 0)
            
            self.set_font('Helvetica', 'B', 11)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(160, y + 6)
            self.cell(32, 8, precio + ' EUR', 0, 0, 'R')
            
            y += 28
        
        # Precio total pack
        y += 5
        self.set_fill_color(*self._color('#10b981'))
        self.rect(15, y, 180, 35, 'F')
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(255, 255, 255)
        self.set_xy(20, y + 3)
        self.cell(100, 8, 'PACK HOGAR ESENCIAL COMPLETO', 0, 0)
        
        self.set_font('Helvetica', '', 9)
        self.set_xy(20, y + 13)
        self.cell(100, 5, 'Instalacion incluida + CRA 24/7 + App movil', 0, 0)
        
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*self._color('#0f172a'))
        self.set_xy(20, y + 21)
        self.cell(50, 5, 'PVP: 499,99 EUR', 0, 0)
        
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(255, 255, 255)
        self.set_xy(120, y + 4)
        self.cell(70, 25, '29,99 EUR/mes', 0, 0, 'R')

    # ==========================================
    # PAGINA 4 - PACK PREMIUM + CAMERAS
    # ==========================================
    def pagina_pack_premium(self):
        self.add_page()
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*self._color('#f59e0b'))
        self.rect(0, 0, 210, 3, 'F')
        
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(*self._color('#f59e0b'))
        self.set_xy(15, 15)
        self.cell(0, 10, 'PACK PREMIUM + CAMARAS', 0, 0)
        self.set_fill_color(*self._color('#f59e0b'))
        self.rect(15, 28, 55, 2, 'F')
        
        # Badge recomendado
        self.set_fill_color(*self._color('#f59e0b'))
        self.rect(140, 12, 55, 14, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(*self._color('#0f172a'))
        self.set_xy(140, 14)
        self.cell(55, 10, 'MAS VENDIDO', 0, 0, 'C')
        
        y = 38
        productos = [
            ("Todo el Pack Hogar Esencial", "Panel + 2 PIR + 2 Puerta + Teclado + Sirena + Mando", "Incluido"),
            ("2x Camara IP Interior HD", "1080p, vision nocturna 10m, audio bidireccional, deteccion IA.", "89,99 c/u"),
            ("1x Camara IP Exterior 4K", "4K Ultra HD, IP67, vision nocturna color 30m, deteccion personas.", "149,99"),
            ("1x Detector de Humo", "Sensor fotoelectrico, alarma 85dB, bateria 10 anos.", "24,99"),
        ]
        
        for nombre, desc, precio in productos:
            self.set_fill_color(*self._color('#1e293b'))
            self.rect(15, y, 180, 24, 'F')
            
            self.set_fill_color(*self._color('#f59e0b'))
            self.rect(18, y + 4, 16, 16, 'F')
            self.set_font('Helvetica', 'B', 14)
            self.set_text_color(*self._color('#0f172a'))
            self.set_xy(18, y + 5)
            self.cell(16, 14, '>', 0, 0, 'C')
            
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(255, 255, 255)
            self.set_xy(38, y + 3)
            self.cell(120, 6, nombre, 0, 0)
            
            self.set_font('Helvetica', '', 8)
            self.set_text_color(*self._color('#94a3b8'))
            self.set_xy(38, y + 11)
            self.cell(120, 5, desc[:90], 0, 0)
            
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self._color('#f59e0b'))
            self.set_xy(160, y + 6)
            self.cell(32, 8, precio + (' EUR' if 'nclu' not in precio else ''), 0, 0, 'R')
            
            y += 28
        
        # Precio
        y += 5
        self.set_fill_color(*self._color('#f59e0b'))
        self.rect(15, y, 180, 35, 'F')
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*self._color('#0f172a'))
        self.set_xy(20, y + 3)
        self.cell(100, 8, 'PACK PREMIUM COMPLETO', 0, 0)
        self.set_font('Helvetica', '', 9)
        self.set_xy(20, y + 13)
        self.cell(100, 5, 'Todo incluido + Videovigilancia IA + App movil', 0, 0)
        self.set_font('Helvetica', 'B', 10)
        self.set_xy(20, y + 21)
        self.cell(50, 5, 'PVP: 899,99 EUR', 0, 0)
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(255, 255, 255)
        self.set_xy(120, y + 4)
        self.cell(70, 25, '44,99 EUR/mes', 0, 0, 'R')
        
        # Comparativa con competencia
        y += 50
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*self._color('#f59e0b'))
        self.set_xy(15, y)
        self.cell(180, 8, 'COMPARA Y AHORRA', 0, 0, 'C')
        
        y += 15
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(15, y, 180, 50, 'F')
        
        headers = ['', 'ManoProtect', 'Competencia']
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(15, y + 2)
        self.cell(60, 7, headers[0], 0, 0, 'L')
        self.cell(60, 7, headers[1], 0, 0, 'C')
        self.set_text_color(*self._color('#ef4444'))
        self.cell(60, 7, headers[2], 0, 0, 'C')
        
        rows = [
            ('Cuota mensual', '29,99 - 44,99 EUR', '39,99 - 59,99 EUR'),
            ('Instalacion', 'INCLUIDA', '99 - 149 EUR'),
            ('Permanencia', 'SIN permanencia', '24 meses'),
            ('Camaras incluidas', 'SI (Pack Premium)', 'Coste extra'),
            ('App movil', 'GRATIS', 'Con cuota adicional'),
        ]
        
        self.set_font('Helvetica', '', 8)
        ry = y + 12
        for label, mp, comp in rows:
            self.set_text_color(*self._color('#e2e8f0'))
            self.set_xy(18, ry)
            self.cell(56, 7, label, 0, 0)
            self.set_text_color(*self._color('#10b981'))
            self.cell(60, 7, mp, 0, 0, 'C')
            self.set_text_color(*self._color('#94a3b8'))
            self.cell(60, 7, comp, 0, 0, 'C')
            ry += 7.5

    # ==========================================
    # PAGINA 5 - SENTINEL LOCK + PRODUCTOS PREMIUM
    # ==========================================
    def pagina_sentinel_lock(self):
        self.add_page()
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*self._color('#8b5cf6'))
        self.rect(0, 0, 210, 3, 'F')
        
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(*self._color('#8b5cf6'))
        self.set_xy(15, 15)
        self.cell(0, 10, 'SENTINEL LOCK PRO', 0, 0)
        self.set_fill_color(*self._color('#8b5cf6'))
        self.rect(15, 28, 45, 2, 'F')
        
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*self._color('#e2e8f0'))
        self.set_xy(15, 35)
        self.cell(180, 6, 'La cerradura inteligente mas avanzada del mercado', 0, 0)
        
        # Producto grande
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(15, 48, 180, 90, 'F')
        self.set_fill_color(*self._color('#8b5cf6'))
        self.rect(15, 48, 3, 90, 'F')
        
        specs = [
            "Apertura: Huella dactilar, codigo PIN, NFC, llave, App movil",
            "Capacidad: Hasta 100 huellas + 50 codigos PIN",
            "Seguridad: Grado 3 certificado. Anti-bumping, anti-ganzua",
            "Conectividad: WiFi + Bluetooth. Integrada con alarma ManoProtect",
            "Bateria: 12 meses de autonomia. Alerta de bateria baja",
            "Registro: Historial completo de aperturas en la app",
            "Alerta: Notificacion instantanea si se detecta manipulacion",
            "Material: Acero inoxidable + aleacion de zinc. IP54",
        ]
        
        self.set_font('Helvetica', '', 9)
        y = 55
        for spec in specs:
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(22, y)
            self.cell(5, 5, '>', 0, 0)
            self.set_text_color(*self._color('#e2e8f0'))
            self.set_xy(28, y)
            self.cell(160, 5, spec, 0, 0)
            y += 9.5
        
        # Precio
        self.set_fill_color(*self._color('#8b5cf6'))
        self.rect(120, 120, 72, 14, 'F')
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(255, 255, 255)
        self.set_xy(120, 121)
        self.cell(72, 12, '299,99 EUR', 0, 0, 'C')
        
        # Otros productos premium
        y = 150
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(15, y)
        self.cell(180, 8, 'PRODUCTOS ADICIONALES', 0, 0)
        
        y += 15
        extras = [
            ("Camara IP Interior HD", "1080p, vision nocturna, audio bidireccional, IA", "89,99 EUR"),
            ("Camara IP Exterior 4K", "Ultra HD, IP67, vision nocturna color, IA", "149,99 EUR"),
            ("Sensor PIR Movimiento", "Inmunidad mascotas, cobertura 12m", "29,99 EUR"),
            ("Sensor Puerta/Ventana", "Magnetico ultraslim, bateria 3 anos", "19,99 EUR"),
            ("Detector de Humo", "Fotoelectrico, 85dB, bateria 10 anos", "24,99 EUR"),
            ("Sirena Interior 110dB", "Alta potencia, disuasion maxima", "39,99 EUR"),
            ("Teclado Panel Alarma", "Tactil, NFC, retroiluminado", "49,99 EUR"),
            ("Mando a Distancia", "Compacto, boton SOS integrado", "14,99 EUR"),
        ]
        
        for nombre, desc, precio in extras:
            self.set_fill_color(*self._color('#1e293b'))
            self.rect(15, y, 180, 14, 'F')
            self.set_font('Helvetica', 'B', 9)
            self.set_text_color(255, 255, 255)
            self.set_xy(18, y + 1)
            self.cell(85, 6, nombre, 0, 0)
            self.set_font('Helvetica', '', 7)
            self.set_text_color(*self._color('#94a3b8'))
            self.set_xy(18, y + 7)
            self.cell(85, 5, desc, 0, 0)
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(145, y + 2)
            self.cell(48, 10, precio, 0, 0, 'R')
            y += 16

    # ==========================================
    # PAGINA 6 - APP MOVIL + CRA
    # ==========================================
    def pagina_app_cra(self):
        self.add_page()
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*self._color('#10b981'))
        self.rect(0, 0, 210, 3, 'F')
        
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(15, 15)
        self.cell(0, 10, 'APP MOVIL + CRA 24/7', 0, 0)
        self.set_fill_color(*self._color('#10b981'))
        self.rect(15, 28, 50, 2, 'F')
        
        # App ManoConnect
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(15, 38, 85, 110, 'F')
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(20, 42)
        self.cell(75, 8, 'ManoConnect', 0, 0)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*self._color('#94a3b8'))
        self.set_xy(20, 51)
        self.cell(75, 5, 'Tu seguridad en la palma de tu mano', 0, 0)
        
        app_features = [
            "Armar/Desarmar desde el movil",
            "Ver camaras en tiempo real",
            "Boton SOS de emergencia",
            "Historial de eventos",
            "Notificaciones instantaneas",
            "Control de usuarios familiares",
            "Geolocalizacion familiar",
            "Chat con soporte 24/7",
        ]
        y = 62
        for f in app_features:
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(22, y)
            self.cell(4, 5, '>', 0, 0)
            self.set_text_color(*self._color('#e2e8f0'))
            self.set_font('Helvetica', '', 8)
            self.set_xy(27, y)
            self.cell(70, 5, f, 0, 0)
            y += 8
        
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(20, 132)
        self.cell(75, 5, 'Disponible en Play Store', 0, 0)
        
        # CRA
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(110, 38, 85, 110, 'F')
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*self._color('#f59e0b'))
        self.set_xy(115, 42)
        self.cell(75, 8, 'CRA 24/7', 0, 0)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*self._color('#94a3b8'))
        self.set_xy(115, 51)
        self.cell(75, 5, 'Central Receptora de Alarmas', 0, 0)
        
        cra_features = [
            "Operadores certificados 24h",
            "Verificacion por video en vivo",
            "Conexion policia/bomberos",
            "Protocolo anti-inhibicion",
            "Doble via de comunicacion",
            "Custodia de llaves opcional",
            "Acuda autorizado incluido",
            "Informes mensuales de estado",
        ]
        y = 62
        for f in cra_features:
            self.set_text_color(*self._color('#f59e0b'))
            self.set_xy(117, y)
            self.cell(4, 5, '>', 0, 0)
            self.set_text_color(*self._color('#e2e8f0'))
            self.set_font('Helvetica', '', 8)
            self.set_xy(122, y)
            self.cell(70, 5, f, 0, 0)
            y += 8
        
        # Proceso de instalacion
        y = 160
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(15, y)
        self.cell(180, 8, 'PROCESO DE INSTALACION', 0, 0, 'C')
        
        y += 15
        pasos = [
            ("1", "CONTACTO", "Llama o solicita presupuesto online"),
            ("2", "ESTUDIO", "Visita gratuita de un tecnico"),
            ("3", "INSTALACION", "Montaje profesional en 2-3 horas"),
            ("4", "ACTIVACION", "Alta en CRA + configuracion app"),
        ]
        
        x = 15
        for num, titulo, desc in pasos:
            self.set_fill_color(*self._color('#1e293b'))
            self.rect(x, y, 43, 55, 'F')
            
            self.set_fill_color(*self._color('#10b981'))
            self.rect(x + 14, y + 5, 16, 16, 'F')
            self.set_font('Helvetica', 'B', 14)
            self.set_text_color(255, 255, 255)
            self.set_xy(x + 14, y + 6)
            self.cell(16, 14, num, 0, 0, 'C')
            
            self.set_font('Helvetica', 'B', 8)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(x, y + 25)
            self.cell(43, 5, titulo, 0, 0, 'C')
            
            self.set_font('Helvetica', '', 7)
            self.set_text_color(*self._color('#94a3b8'))
            self.set_xy(x + 2, y + 33)
            self.cell(39, 5, desc[:25], 0, 0, 'C')
            if len(desc) > 25:
                self.set_xy(x + 2, y + 38)
                self.cell(39, 5, desc[25:], 0, 0, 'C')
            
            x += 46

    # ==========================================
    # PAGINA 7 - NEGOCIOS
    # ==========================================
    def pagina_negocios(self):
        self.add_page()
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*self._color('#3b82f6'))
        self.rect(0, 0, 210, 3, 'F')
        
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(*self._color('#3b82f6'))
        self.set_xy(15, 15)
        self.cell(0, 10, 'SEGURIDAD PARA NEGOCIOS', 0, 0)
        self.set_fill_color(*self._color('#3b82f6'))
        self.rect(15, 28, 55, 2, 'F')
        
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*self._color('#94a3b8'))
        self.set_xy(15, 33)
        self.cell(180, 6, 'Soluciones profesionales para comercios, oficinas e industria', 0, 0)
        
        y = 48
        soluciones = [
            ("COMERCIOS Y TIENDAS", [
                "Sistema anti-intrusion perimetral",
                "Camaras IP con deteccion de personas IA",
                "Control de aforo en tiempo real",
                "Boton de panico silencioso",
                "Verificacion por video CRA 24/7",
            ], "Desde 39,99 EUR/mes"),
            ("OFICINAS Y COWORKING", [
                "Control de acceso por tarjeta/huella",
                "Sentinel Lock en accesos principales",
                "Camaras en zonas comunes",
                "Deteccion de incendio y humo",
                "Integracion con sistemas existentes",
            ], "Desde 49,99 EUR/mes"),
            ("NAVES E INDUSTRIA", [
                "Videovigilancia exterior perimetral 4K",
                "Deteccion de intrusos con IA",
                "Barreras infrarrojas de largo alcance",
                "Central de incendios certificada",
                "Ronda virtual por camaras CRA",
            ], "Desde 79,99 EUR/mes"),
        ]
        
        for titulo, features, precio in soluciones:
            self.set_fill_color(*self._color('#1e293b'))
            self.rect(15, y, 180, 65, 'F')
            self.set_fill_color(*self._color('#3b82f6'))
            self.rect(15, y, 3, 65, 'F')
            
            self.set_font('Helvetica', 'B', 12)
            self.set_text_color(*self._color('#3b82f6'))
            self.set_xy(22, y + 3)
            self.cell(120, 7, titulo, 0, 0)
            
            self.set_font('Helvetica', 'B', 11)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(145, y + 3)
            self.cell(47, 7, precio, 0, 0, 'R')
            
            fy = y + 14
            for f in features:
                self.set_font('Helvetica', '', 8)
                self.set_text_color(*self._color('#3b82f6'))
                self.set_xy(25, fy)
                self.cell(4, 5, '>', 0, 0)
                self.set_text_color(*self._color('#e2e8f0'))
                self.set_xy(31, fy)
                self.cell(150, 5, f, 0, 0)
                fy += 9
            
            y += 72

    # ==========================================
    # PAGINA 8 - CONTACTO + CTA
    # ==========================================
    def pagina_contacto(self):
        self.add_page()
        self.set_fill_color(*self._color('#0f172a'))
        self.rect(0, 0, 210, 297, 'F')
        self.set_fill_color(*self._color('#10b981'))
        self.rect(0, 0, 210, 3, 'F')
        
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(*self._color('#10b981'))
        self.set_xy(15, 20)
        self.cell(180, 12, 'PROTEGE LO QUE', 0, 0, 'C')
        self.set_xy(15, 35)
        self.cell(180, 12, 'MAS IMPORTA', 0, 0, 'C')
        
        self.set_fill_color(*self._color('#10b981'))
        self.rect(80, 52, 50, 2, 'F')
        
        self.set_font('Helvetica', '', 11)
        self.set_text_color(*self._color('#94a3b8'))
        self.set_xy(15, 60)
        self.cell(180, 7, 'Solicita tu estudio de seguridad gratuito', 0, 0, 'C')
        self.set_xy(15, 68)
        self.cell(180, 7, 'Un tecnico visitara tu hogar o negocio sin compromiso', 0, 0, 'C')
        
        # Contacto principal
        self.set_fill_color(*self._color('#1e293b'))
        self.rect(25, 85, 160, 100, 'F')
        self.set_fill_color(*self._color('#10b981'))
        self.rect(25, 85, 160, 3, 'F')
        
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(255, 255, 255)
        self.set_xy(25, 95)
        self.cell(160, 8, 'CONTACTA CON NOSOTROS', 0, 0, 'C')
        
        contactos = [
            ("Web:", "www.manoprotect.com"),
            ("Email:", "info@manoprotect.com"),
            ("Soporte:", "soporte@manoprotect.com"),
            ("Atencion:", "24 horas, 365 dias al ano"),
            ("Cobertura:", "Toda Espana peninsular e islas"),
        ]
        
        y = 112
        for label, valor in contactos:
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(40, y)
            self.cell(40, 7, label, 0, 0)
            self.set_font('Helvetica', '', 10)
            self.set_text_color(*self._color('#e2e8f0'))
            self.set_xy(80, y)
            self.cell(100, 7, valor, 0, 0)
            y += 12
        
        # CTA
        y = 200
        self.set_fill_color(*self._color('#10b981'))
        self.rect(35, y, 140, 30, 'F')
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(255, 255, 255)
        self.set_xy(35, y + 5)
        self.cell(140, 10, 'SOLICITA TU PRESUPUESTO', 0, 0, 'C')
        self.set_font('Helvetica', '', 9)
        self.set_xy(35, y + 17)
        self.cell(140, 7, 'www.manoprotect.com/presupuesto', 0, 0, 'C')
        
        # Garantias
        y = 245
        garantias = [
            "Sin permanencia - Cancela cuando quieras",
            "Instalacion profesional incluida",
            "Garantia de 2 anos en todos los equipos",
            "Soporte tecnico 24/7 incluido",
        ]
        for g in garantias:
            self.set_font('Helvetica', '', 9)
            self.set_text_color(*self._color('#10b981'))
            self.set_xy(35, y)
            self.cell(5, 5, '>', 0, 0)
            self.set_text_color(*self._color('#e2e8f0'))
            self.set_xy(42, y)
            self.cell(140, 5, g, 0, 0)
            y += 8
        
        # Footer
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*self._color('#475569'))
        self.set_xy(15, 282)
        self.cell(180, 4, 'ManoProtect - Seguridad Inteligente para tu Hogar y Negocio', 0, 0, 'C')
        self.set_xy(15, 287)
        self.cell(180, 4, 'Catalogo Comercial 2025-2026. Precios IVA incluido. Sujeto a disponibilidad.', 0, 0, 'C')

    def generar(self, output_path):
        self.pagina_portada()
        self.pagina_quienes_somos()
        self.pagina_pack_hogar()
        self.pagina_pack_premium()
        self.pagina_sentinel_lock()
        self.pagina_app_cra()
        self.pagina_negocios()
        self.pagina_contacto()
        self.output(output_path)
        return output_path


if __name__ == "__main__":
    revista = RevistaManoProtect()
    path = revista.generar("/app/backend/uploads/downloads/ManoProtect_Catalogo_Comercial_2025.pdf")
    print(f"Revista generada: {path}")
