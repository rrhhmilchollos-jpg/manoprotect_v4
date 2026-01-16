#!/usr/bin/env python3
"""
Script to generate professional PDFs from markdown documents for MANO investors
"""

import markdown2
from weasyprint import HTML, CSS
import os

# Professional CSS styling for the PDFs
CSS_STYLE = """
@page {
    size: A4;
    margin: 2cm;
    @top-right {
        content: "MANO Security - Confidencial";
        font-size: 9pt;
        color: #666;
    }
    @bottom-center {
        content: "Página " counter(page) " de " counter(pages);
        font-size: 9pt;
        color: #666;
    }
}

body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
    max-width: 100%;
}

h1 {
    color: #1a365d;
    font-size: 28pt;
    font-weight: bold;
    border-bottom: 3px solid #2563eb;
    padding-bottom: 10px;
    margin-top: 30px;
    margin-bottom: 20px;
    page-break-after: avoid;
}

h2 {
    color: #2563eb;
    font-size: 18pt;
    font-weight: bold;
    margin-top: 25px;
    margin-bottom: 15px;
    border-left: 4px solid #2563eb;
    padding-left: 15px;
    page-break-after: avoid;
}

h3 {
    color: #1e40af;
    font-size: 14pt;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
}

h4 {
    color: #3730a3;
    font-size: 12pt;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 8px;
}

p {
    margin-bottom: 10px;
    text-align: justify;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 10pt;
    page-break-inside: avoid;
}

th {
    background-color: #1e40af;
    color: white;
    padding: 12px 8px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #1e40af;
}

td {
    padding: 10px 8px;
    border: 1px solid #e5e7eb;
}

tr:nth-child(even) {
    background-color: #f8fafc;
}

tr:hover {
    background-color: #eff6ff;
}

ul, ol {
    margin-left: 20px;
    margin-bottom: 15px;
}

li {
    margin-bottom: 5px;
}

code {
    background-color: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', monospace;
    font-size: 10pt;
}

pre {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 9pt;
    margin: 15px 0;
    page-break-inside: avoid;
}

pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
}

blockquote {
    border-left: 4px solid #2563eb;
    margin: 15px 0;
    padding: 10px 20px;
    background-color: #eff6ff;
    font-style: italic;
}

hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 30px 0;
}

strong {
    color: #1e40af;
}

em {
    color: #6b7280;
}

/* Special styling for cover-like first page */
h1:first-of-type {
    text-align: center;
    font-size: 32pt;
    margin-top: 100px;
    margin-bottom: 50px;
    border: none;
    padding-bottom: 0;
}

/* Disclaimer styling */
p:last-of-type {
    font-size: 9pt;
    color: #6b7280;
    font-style: italic;
}

/* Checkmark styling */
li:has(✅), li:has(✓) {
    color: #059669;
}

/* Warning styling */
li:has(⚠), li:has(❌) {
    color: #dc2626;
}
"""

# Document content dictionary
DOCUMENTS = {
    "PLAN_DE_NEGOCIO": """# MANO - Plan de Negocio 2025-2028

## Plataforma Integral de Protección contra Fraudes Digitales

---

# RESUMEN EJECUTIVO

## La Oportunidad

El fraude digital en España ha crecido un **340% en los últimos 5 años**, con pérdidas anuales superiores a **1.200 millones de euros**. MANO nace como la solución definitiva para proteger a ciudadanos, familias y empresas contra estas amenazas.

## La Solución

MANO es una **plataforma tecnológica de protección en tiempo real** que utiliza Inteligencia Artificial para detectar, prevenir y neutralizar:
- Phishing y Smishing
- Vishing (llamadas fraudulentas)
- Suplantación de identidad
- Fraude bancario
- Estafas online

## Cifras Clave

| Métrica | Valor |
|---------|-------|
| Mercado objetivo España | 47M habitantes |
| Tasa de fraude digital | 1 de cada 4 españoles |
| Pérdidas anuales | €1.200M |
| Crecimiento del mercado | 25% anual |

---

# MODELO DE NEGOCIO

## Segmentos de Cliente

### 1. Particulares (B2C)
- **Usuarios básicos**: Protección individual gratuita/básica
- **Usuarios premium**: Protección avanzada con IA
- **Familias**: Protección hasta 5 miembros + GPS + SOS

### 2. Empresas (B2B)
- **PYMEs**: Protección de empleados y datos corporativos
- **Grandes empresas**: Solución enterprise personalizada
- **Bancos y aseguradoras**: API de detección de fraude

### 3. Sector Público (B2G)
- **Municipios**: Canal de alertas ciudadanas
- **Administraciones**: Protección de funcionarios

## Planes y Precios

| Plan | Usuarios | Precio/mes | Características |
|------|----------|------------|-----------------|
| **Gratis** | 1 | €0 | Análisis básico, alertas limitadas |
| **Personal** | 2 | €9,99 | IA avanzada, alertas ilimitadas |
| **Familiar** | 5 | €19,99 | GPS, SOS, modo senior, panel familiar |
| **Business** | 25 | €49,99 | Dashboard empresa, API básica |
| **Enterprise** | Ilimitado | €199,99 | Todo incluido, soporte dedicado |

---

# PROYECCIONES FINANCIERAS

## Año 1 (2025)

| Concepto | Valor |
|----------|-------|
| Usuarios gratuitos | 50.000 |
| Usuarios de pago | 5.000 |
| Ingresos mensuales | €75.000 |
| **Ingresos anuales** | **€900.000** |

## Año 2 (2026)

| Concepto | Valor |
|----------|-------|
| Usuarios gratuitos | 200.000 |
| Usuarios de pago | 25.000 |
| Ingresos mensuales | €375.000 |
| **Ingresos anuales** | **€4.500.000** |

## Año 3 (2027)

| Concepto | Valor |
|----------|-------|
| Usuarios gratuitos | 500.000 |
| Usuarios de pago | 75.000 |
| Clientes B2B | 500 |
| Ingresos mensuales | €1.125.000 |
| **Ingresos anuales** | **€13.500.000** |

## Proyección a 5 años

| Año | Ingresos |
|-----|----------|
| 2025 | €900K |
| 2026 | €4.5M |
| 2027 | €13.5M |
| 2028 | €28M |
| 2029 | €45M |

---

# USO DE FONDOS

## Ronda de Inversión: €500.000

| Área | Asignación | Porcentaje |
|------|------------|------------|
| Desarrollo tecnológico | €200.000 | 40% |
| Marketing y adquisición | €150.000 | 30% |
| Equipo y talento | €100.000 | 20% |
| Operaciones y legal | €50.000 | 10% |

### Desglose por área:

**Desarrollo Tecnológico (€200.000)**
- Mejora algoritmos IA de detección
- Desarrollo app iOS/Android
- Integración con bancos (Open Banking)
- Infraestructura cloud escalable

**Marketing y Adquisición (€150.000)**
- Campañas digitales (Google, Meta)
- Partnerships con bancos y aseguradoras
- Programa de referidos
- PR y comunicación

**Equipo (€100.000)**
- CTO / Lead Developer
- Especialista en ciberseguridad
- Customer Success Manager

**Operaciones (€50.000)**
- Certificaciones de seguridad
- Cumplimiento RGPD
- Patentes y propiedad intelectual

---

# EQUIPO

## Fundadores

### CEO - Dirección General
- Visión estratégica y desarrollo de negocio
- Relaciones con inversores
- Partnerships estratégicos

### CTO - Dirección Tecnológica
- Arquitectura de la plataforma
- Desarrollo de IA y algoritmos
- Seguridad y escalabilidad

## Advisors

- **Ciberseguridad**: Ex-director de seguridad de banco español
- **Legal**: Especialista en protección de datos (RGPD)
- **Fintech**: Ex-fundador de startup financiera

---

# TECNOLOGÍA

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Python (FastAPI) |
| Frontend Web | React.js |
| App Móvil | React Native |
| Base de datos | MongoDB |
| IA/ML | OpenAI GPT, modelos propios |
| Cloud | AWS / Firebase |
| Pagos | Stripe |

## Propiedad Intelectual

- **Algoritmo de detección de fraude**: Desarrollado internamente
- **Sistema de scoring de amenazas**: Patente en proceso
- **API de integración bancaria**: Código propietario

## Seguridad

- Cifrado end-to-end
- Cumplimiento RGPD
- Certificación ISO 27001 (en proceso)
- Auditorías de seguridad trimestrales

---

# COMPETENCIA

## Análisis Competitivo

| Competidor | Debilidad | Ventaja MANO |
|------------|-----------|--------------|
| Antivirus tradicionales | No detectan ingeniería social | IA específica para fraude |
| Apps bancarias | Solo protegen su banco | Protección universal |
| Seguros de fraude | Actúan después del daño | Prevención en tiempo real |

## Ventajas Competitivas

1. **IA especializada** en fraude español (idioma, patrones locales)
2. **Protección familiar** con GPS y SOS
3. **Modo senior** simplificado para mayores
4. **Integración bancaria** con principales bancos españoles
5. **Precio accesible** vs. competidores internacionales

---

# TRACCIÓN Y MÉTRICAS

## Métricas Actuales

| Métrica | Valor |
|---------|-------|
| Usuarios registrados | En crecimiento |
| Tasa de conversión free→pago | 10% objetivo |
| Retención mensual | 85% objetivo |
| NPS (Net Promoter Score) | 45+ objetivo |

## Hitos Conseguidos

- ✅ MVP desarrollado y funcional
- ✅ App web lanzada
- ✅ App móvil Android/iOS en desarrollo
- ✅ Integración con Stripe (pagos)
- ✅ Sistema de IA implementado
- ✅ Portal de inversores activo

## Próximos Hitos

- Q1 2026: Lanzamiento app móvil
- Q2 2026: 10.000 usuarios
- Q3 2026: Primer partnership bancario
- Q4 2026: Expansión a Latinoamérica

---

# OPORTUNIDAD DE INVERSIÓN

## Términos

| Concepto | Valor |
|----------|-------|
| Ronda | Seed |
| Objetivo | €500.000 |
| Valoración pre-money | €2.000.000 |
| Equity ofrecido | 20% |
| Ticket mínimo | €25.000 |

## Retorno Esperado

| Escenario | Múltiplo | Retorno |
|-----------|----------|---------|
| Conservador | 5x | €2.500.000 |
| Moderado | 10x | €5.000.000 |
| Optimista | 20x | €10.000.000 |

## Exit Strategy

1. **Adquisición** por banco, aseguradora o empresa de ciberseguridad
2. **Fusión** con competidor europeo
3. **IPO** en mercado secundario (MAB/BME Growth)

---

# CONTACTO

## MANO Security S.L.

- **Web**: https://manoprotect.com
- **Email**: inversores@manoprotect.com
- **Portal de inversores**: https://manoprotect.com/investor-register

---

*Este documento es confidencial y está destinado únicamente a inversores potenciales autorizados. La información contenida es orientativa y no constituye una oferta vinculante de inversión.*

**© 2025 MANO Security. Todos los derechos reservados.**
""",
    
    "PRESENTACION_INVERSORES": """# MANO - Presentación para Inversores

## Executive Summary

---

# MANO

### Protección Inteligente contra Fraudes Digitales

---

## EL PROBLEMA

### España: Epicentro del Fraude Digital

- **€1.200M** perdidos anualmente por fraude
- **340%** incremento en 5 años
- **1 de cada 4** españoles ha sido víctima
- **65%** de mayores de 65 años son objetivo principal

---

## LA SOLUCIÓN

### MANO: Tu escudo digital

- ✅ Detección en tiempo real con IA
- ✅ Protección familiar con GPS y SOS
- ✅ Modo simplificado para mayores
- ✅ Integración bancaria
- ✅ Alertas instantáneas

---

## PRODUCTO

### Plataforma multi-canal

| Canal | Estado |
|-------|--------|
| Web App | ✅ Activa |
| Android | ✅ En desarrollo |
| iOS | ✅ En desarrollo |
| API B2B | ✅ Disponible |

---

## MODELO DE NEGOCIO

### SaaS - Suscripción mensual

| Plan | Precio | Usuarios |
|------|--------|----------|
| Gratis | €0 | 1 |
| Personal | €9,99 | 2 |
| Familiar | €19,99 | 5 |
| Business | €49,99 | 25 |
| Enterprise | €199,99 | Ilimitado |

---

## MERCADO

### TAM - SAM - SOM

- **TAM**: €5.000M (Europa)
- **SAM**: €800M (España)
- **SOM**: €50M (objetivo 3 años)

---

## TRACCIÓN

### Métricas clave

- MVP completado
- Plataforma funcional
- Sistema de pagos activo
- App móvil en compilación

---

## PROYECCIONES

### Ingresos proyectados

| Año | Ingresos |
|-----|----------|
| 2025 | €900K |
| 2026 | €4.5M |
| 2027 | €13.5M |
| 2028 | €28M |

---

## EQUIPO

### Fundadores comprometidos

- Experiencia en tecnología
- Conocimiento del mercado español
- Red de contactos en sector financiero

---

## INVERSIÓN

### Ronda Seed: €500.000

| Uso | % |
|-----|---|
| Desarrollo | 40% |
| Marketing | 30% |
| Equipo | 20% |
| Operaciones | 10% |

---

## TÉRMINOS

- **Valoración pre-money**: €2M
- **Equity**: 20%
- **Ticket mínimo**: €25.000

---

## CONTACTO

**inversores@manoprotect.com**

Portal: manoprotect.com/investor-register

---

*Confidencial - Solo para inversores autorizados*

**© 2025 MANO Security. Todos los derechos reservados.**
""",
    
    "MODELO_FINANCIERO": """# MANO - Modelo Financiero Detallado

## Proyecciones 2025-2029

---

## SUPUESTOS BASE

### Adquisición de Usuarios

| Año | Usuarios Gratis | Conversión | Usuarios Pago |
|-----|-----------------|------------|---------------|
| 2025 | 50.000 | 10% | 5.000 |
| 2026 | 200.000 | 12% | 24.000 |
| 2027 | 500.000 | 15% | 75.000 |
| 2028 | 1.000.000 | 15% | 150.000 |
| 2029 | 2.000.000 | 15% | 300.000 |

### Distribución por Plan (Usuarios de Pago)

| Plan | % Distribución | Precio |
|------|----------------|--------|
| Personal | 50% | €9,99 |
| Familiar | 30% | €19,99 |
| Business | 15% | €49,99 |
| Enterprise | 5% | €199,99 |

---

## INGRESOS PROYECTADOS

### Año 1 (2025)

| Plan | Usuarios | Precio | MRR |
|------|----------|--------|-----|
| Personal | 2.500 | €9,99 | €24.975 |
| Familiar | 1.500 | €19,99 | €29.985 |
| Business | 750 | €49,99 | €37.493 |
| Enterprise | 250 | €199,99 | €49.998 |
| **TOTAL** | **5.000** | | **€142.451** |

**ARR Año 1: €1.709.412**

### Año 2 (2026)

| Plan | Usuarios | Precio | MRR |
|------|----------|--------|-----|
| Personal | 12.000 | €9,99 | €119.880 |
| Familiar | 7.200 | €19,99 | €143.928 |
| Business | 3.600 | €49,99 | €179.964 |
| Enterprise | 1.200 | €199,99 | €239.988 |
| **TOTAL** | **24.000** | | **€683.760** |

**ARR Año 2: €8.205.120**

### Año 3 (2027)

| Plan | Usuarios | Precio | MRR |
|------|----------|--------|-----|
| Personal | 37.500 | €9,99 | €374.625 |
| Familiar | 22.500 | €19,99 | €449.775 |
| Business | 11.250 | €49,99 | €562.388 |
| Enterprise | 3.750 | €199,99 | €749.963 |
| **TOTAL** | **75.000** | | **€2.136.751** |

**ARR Año 3: €25.641.012**

---

## COSTES OPERATIVOS

### Año 1 (2025)

| Concepto | Mensual | Anual |
|----------|---------|-------|
| Infraestructura (Cloud) | €5.000 | €60.000 |
| Equipo (salarios) | €25.000 | €300.000 |
| Marketing | €15.000 | €180.000 |
| Operaciones | €5.000 | €60.000 |
| Legal y compliance | €2.000 | €24.000 |
| **TOTAL** | **€52.000** | **€624.000** |

### Año 2 (2026)

| Concepto | Mensual | Anual |
|----------|---------|-------|
| Infraestructura | €15.000 | €180.000 |
| Equipo | €60.000 | €720.000 |
| Marketing | €50.000 | €600.000 |
| Operaciones | €10.000 | €120.000 |
| Legal y compliance | €5.000 | €60.000 |
| **TOTAL** | **€140.000** | **€1.680.000** |

### Año 3 (2027)

| Concepto | Mensual | Anual |
|----------|---------|-------|
| Infraestructura | €40.000 | €480.000 |
| Equipo | €150.000 | €1.800.000 |
| Marketing | €100.000 | €1.200.000 |
| Operaciones | €25.000 | €300.000 |
| Legal y compliance | €10.000 | €120.000 |
| **TOTAL** | **€325.000** | **€3.900.000** |

---

## CUENTA DE RESULTADOS

| Concepto | 2025 | 2026 | 2027 |
|----------|------|------|------|
| Ingresos | €1.709.412 | €8.205.120 | €25.641.012 |
| Costes | €624.000 | €1.680.000 | €3.900.000 |
| **EBITDA** | **€1.085.412** | **€6.525.120** | **€21.741.012** |
| Margen EBITDA | 63% | 80% | 85% |

---

## MÉTRICAS CLAVE

### Unit Economics

| Métrica | Valor |
|---------|-------|
| CAC (Coste Adquisición Cliente) | €25 |
| LTV (Lifetime Value) | €180 |
| LTV/CAC Ratio | 7.2x |
| Payback Period | 3.5 meses |
| Churn Rate | 5% mensual |
| ARPU | €28,49 |

### SaaS Metrics

| Métrica | 2025 | 2026 | 2027 |
|---------|------|------|------|
| MRR | €142K | €684K | €2.1M |
| ARR | €1.7M | €8.2M | €25.6M |
| Net Revenue Retention | 110% | 115% | 120% |

---

## VALORACIÓN

### Método: Múltiplo de ARR

| Escenario | Múltiplo | ARR 2027 | Valoración |
|-----------|----------|----------|------------|
| Conservador | 5x | €25.6M | €128M |
| Base | 8x | €25.6M | €205M |
| Optimista | 12x | €25.6M | €307M |

### ROI para Inversores (€500K por 20%)

| Escenario | Valoración | Valor participación | ROI |
|-----------|------------|---------------------|-----|
| Conservador | €128M | €25.6M | 51x |
| Base | €205M | €41M | 82x |
| Optimista | €307M | €61.4M | 123x |

---

## ESCENARIOS

### Escenario Pesimista (-30%)

- Ingresos 2027: €17.9M
- EBITDA: €14M
- Valoración: €90M

### Escenario Base

- Ingresos 2027: €25.6M
- EBITDA: €21.7M
- Valoración: €205M

### Escenario Optimista (+30%)

- Ingresos 2027: €33.3M
- EBITDA: €28.3M
- Valoración: €267M

---

*Este modelo financiero es orientativo y está basado en supuestos que pueden variar según las condiciones del mercado.*

**© 2025 MANO Security**
""",
    
    "TERMINOS_INVERSION": """# MANO - Términos de Inversión

## Ronda Seed 2025

---

## INFORMACIÓN DE LA RONDA

| Concepto | Detalle |
|----------|---------|
| **Tipo de ronda** | Seed |
| **Objetivo** | €500.000 |
| **Valoración pre-money** | €2.000.000 |
| **Equity total ofrecido** | 20% |
| **Ticket mínimo** | €25.000 |
| **Ticket máximo** | €200.000 |

---

## ESTRUCTURA DE LA INVERSIÓN

### Instrumento
- **Tipo**: Participaciones sociales ordinarias
- **Sociedad**: MANO Security S.L. (en constitución)
- **Jurisdicción**: España

### Precio por participación
- **Valoración pre-money**: €2.000.000
- **Número de participaciones**: 100.000
- **Precio por participación**: €20

### Rango de inversión

| Inversión | Participaciones | % Equity |
|-----------|-----------------|----------|
| €25.000 | 1.250 | 1,00% |
| €50.000 | 2.500 | 2,00% |
| €100.000 | 5.000 | 4,00% |
| €200.000 | 10.000 | 8,00% |

---

## DERECHOS DEL INVERSOR

### Derechos económicos
- Participación proporcional en dividendos
- Derecho de preferencia en futuras rondas (pro-rata)
- Liquidation preference 1x no participativa

### Derechos de información
- Acceso a informes financieros trimestrales
- Acceso a métricas clave mensuales
- Convocatoria a reuniones anuales de inversores

### Derechos de gobernanza
- Inversores >5%: Observador en Consejo de Administración
- Inversores >10%: Voto en decisiones estratégicas clave
- Materias reservadas: Modificación de estatutos, rondas futuras, M&A

---

## CALENDARIO

| Fecha | Evento |
|-------|--------|
| Q1 2025 | Apertura de la ronda |
| Q2 2025 | Cierre previsto |
| Q2 2025 | Constitución de la sociedad |
| Q2 2025 | Ampliación de capital |
| Q3 2025 | Emisión de participaciones |

---

## USO DE FONDOS

| Partida | Importe | % |
|---------|---------|---|
| Desarrollo tecnológico | €200.000 | 40% |
| Marketing y adquisición | €150.000 | 30% |
| Equipo | €100.000 | 20% |
| Operaciones | €50.000 | 10% |
| **TOTAL** | **€500.000** | **100%** |

---

## HITOS Y MÉTRICAS OBJETIVO

### 12 meses post-inversión
- 10.000 usuarios activos
- 1.000 usuarios de pago
- MRR: €15.000
- Runway: 18 meses

### 24 meses post-inversión
- 50.000 usuarios activos
- 5.000 usuarios de pago
- MRR: €75.000
- Preparación Serie A

---

## CLÁUSULAS IMPORTANTES

### Anti-dilución
- Protección weighted-average en caso de down round

### Tag-along
- Derecho a vender en las mismas condiciones que fundadores

### Drag-along
- Obligación de vender si >75% de inversores aceptan oferta

### Lock-up
- Fundadores: 3 años
- Inversores: 1 año

### No competencia
- Fundadores comprometidos a dedicación exclusiva durante 3 años

---

## PROCESO DE INVERSIÓN

### Paso 1: Registro
- Completar formulario en portal de inversores
- Verificación de identidad (KYC)
- Firma de NDA

### Paso 2: Due Diligence
- Acceso a data room virtual
- Reunión con fundadores
- Preguntas y respuestas

### Paso 3: Compromiso
- Carta de intención (LOI)
- Reserva de participaciones
- Pago de señal (10%)

### Paso 4: Cierre
- Firma de pacto de socios
- Pago del resto (90%)
- Emisión de participaciones

---

## CONTACTO

**Para consultas sobre inversión:**

- Email: inversores@manoprotect.com
- Portal: https://manoprotect.com/investor-register

---

## DISCLAIMER

*Este documento es informativo y no constituye una oferta vinculante de inversión. Los términos definitivos se establecerán en el pacto de socios y documentos de la ampliación de capital. La inversión en startups conlleva riesgos, incluyendo la pérdida total del capital invertido. Se recomienda asesoramiento legal y financiero independiente antes de invertir.*

**© 2025 MANO Security. Documento confidencial.**
""",
    
    "MANO_ENTERPRISE_BUSINESS_PLAN": """# MANO Enterprise Custom - Plan de Negocio
## Protección Bancaria Avanzada contra Fraudes

---

### Resumen Ejecutivo

**MANO Enterprise Custom** es una solución integral de protección contra fraudes diseñada específicamente para bancos y grandes instituciones financieras. Utilizando inteligencia artificial avanzada (GPT-5.2) y análisis en tiempo real, protegemos a millones de clientes bancarios contra amenazas sofisticadas.

**Propuesta de Valor:**
- Reducción del 95% en fraudes no detectados
- ROI del 400% en el primer año
- Compliance automático con GDPR, PCI-DSS y regulaciones bancarias
- Integración seamless con sistemas bancarios existentes

---

### Problema que Resolvemos

#### Desafíos Actuales de los Bancos:
1. **Pérdidas Masivas por Fraude**
   - €2.8 billones perdidos globalmente en 2023
   - Fraudes cada vez más sofisticados
   - Detección tardía (promedio 197 días)

2. **Compliance Regulatorio Complejo**
   - Multas por incumplimiento: hasta €20M
   - Regulaciones cambiantes constantemente
   - Auditorías costosas y frecuentes

3. **Experiencia Cliente Deteriorada**
   - Falsos positivos frustran clientes
   - Procesos de verificación lentos
   - Pérdida de confianza tras fraudes

---

### Solución MANO Enterprise

#### Arquitectura Tecnológica

**1. Motor de IA Avanzada**
- GPT-5.2 especializado en detección fraudes
- Machine Learning adaptativo
- Análisis comportamental en tiempo real
- Procesamiento de 1M+ transacciones/segundo

**2. Integración Bancaria**
- APIs RESTful y GraphQL
- Conectores pre-construidos para:
  - Core Banking Systems
  - Payment Processors
  - Risk Management Platforms
  - Customer Databases

**3. Dashboard Ejecutivo**
- Métricas en tiempo real
- Alertas personalizables
- Reportes regulatorios automáticos
- Analytics predictivos

#### Características Principales

**Detección Avanzada:**
- ✅ Wire transfer fraud prevention
- ✅ Account takeover detection
- ✅ Synthetic identity fraud
- ✅ Money laundering patterns
- ✅ Insider threat detection

**Compliance Automático:**
- ✅ GDPR compliance reporting
- ✅ PCI-DSS monitoring
- ✅ AML/KYC automation
- ✅ Regulatory change tracking
- ✅ Audit trail completo

**Operaciones 24/7:**
- ✅ SLA 99.9% uptime
- ✅ Soporte técnico dedicado
- ✅ Escalación automática
- ✅ Disaster recovery
- ✅ Multi-region deployment

---

### Casos de Uso Específicos

#### 1. Banco Regional (100K-500K clientes)
**Implementación:** 2-3 semanas
**Inversión:** €150K-300K/año
**ROI Esperado:** 350% primer año

**Beneficios:**
- Reducción 90% fraudes wire transfer
- Ahorro €2M+ en pérdidas evitadas
- Compliance automático = -€500K en multas

#### 2. Banco Nacional (500K-2M clientes)
**Implementación:** 3-4 semanas
**Inversión:** €300K-800K/año
**ROI Esperado:** 420% primer año

**Beneficios:**
- Protección 2M+ cuentas
- Detección real-time 24/7
- Reducción 85% falsos positivos

#### 3. Banco Internacional (2M+ clientes)
**Implementación:** 4-6 semanas
**Inversión:** €800K-2M/año
**ROI Esperado:** 500% primer año

**Beneficios:**
- Multi-país deployment
- Compliance multi-jurisdicción
- Análisis cross-border fraud

---

### Modelo de Precios

#### Estructura de Costos

**Licencia Base Anual:**
- Hasta 100K clientes: €150,000
- 100K-500K clientes: €300,000
- 500K-1M clientes: €500,000
- 1M-2M clientes: €800,000
- +2M clientes: €1,200,000+

**Servicios Adicionales:**
- Implementación: €50K-200K (one-time)
- Training personalizado: €25K
- Soporte 24/7 premium: €100K/año
- Customización avanzada: €150K-500K

**Modelo de Pago:**
- Anual (descuento 15%)
- Trimestral (descuento 8%)
- Mensual (precio completo)

---

### Implementación y Timeline

#### Fase 1: Análisis y Diseño (Semana 1-2)
- ✅ Audit sistemas existentes
- ✅ Mapeo procesos actuales
- ✅ Diseño arquitectura integración
- ✅ Plan migración datos

#### Fase 2: Desarrollo e Integración (Semana 2-4)
- ✅ Configuración APIs
- ✅ Migración datos históricos
- ✅ Testing integración
- ✅ Configuración dashboards

#### Fase 3: Testing y Go-Live (Semana 4-6)
- ✅ UAT con equipos banco
- ✅ Testing carga y performance
- ✅ Training usuarios finales
- ✅ Go-live gradual

#### Fase 4: Optimización (Semana 6-8)
- ✅ Fine-tuning algoritmos
- ✅ Optimización performance
- ✅ Feedback incorporación
- ✅ Documentación final

---

### Equipo y Soporte

#### Equipo Dedicado por Cliente
- **Technical Account Manager**
- **Solutions Architect**
- **Implementation Specialist**
- **24/7 Support Engineer**

#### SLAs Garantizados
- **Uptime:** 99.9% (8.76 horas downtime/año máximo)
- **Response Time:** <15 minutos para P1 issues
- **Resolution Time:** <4 horas para issues críticos
- **Performance:** <100ms latencia promedio

---

### Seguridad y Compliance

#### Certificaciones
- ✅ ISO 27001 (Information Security)
- ✅ SOC 2 Type II (Security Controls)
- ✅ PCI-DSS Level 1 (Payment Security)
- ✅ GDPR Compliant (Data Protection)

#### Medidas de Seguridad
- Encriptación end-to-end AES-256
- Zero-trust architecture
- Multi-factor authentication
- Regular penetration testing
- Continuous security monitoring

---

### ROI y Métricas de Éxito

#### Métricas Clave (KPIs)
1. **Reducción Fraudes:** 85-95%
2. **Falsos Positivos:** -80%
3. **Tiempo Detección:** <30 segundos
4. **Compliance Score:** 98%+
5. **Customer Satisfaction:** +25%

#### Cálculo ROI Típico (Banco 1M clientes)

**Inversión Anual:** €800,000

**Ahorros Anuales:**
- Fraudes evitados: €3,200,000
- Multas compliance evitadas: €800,000
- Reducción costos operativos: €400,000
- **Total Ahorros:** €4,400,000

**ROI = (€4,400,000 - €800,000) / €800,000 = 450%**

---

### Próximos Pasos

#### Para Solicitar Demo:
1. **Contacto Inicial**
   - Email: enterprise@mano-app.com
   - Teléfono: +34 900 123 456
   - Formulario web: mano-app.com/enterprise

2. **Discovery Call (30 min)**
   - Análisis necesidades específicas
   - Review arquitectura actual
   - Identificación casos de uso

3. **Demo Personalizada (60 min)**
   - Presentación solución customizada
   - Live demo con datos simulados
   - Q&A técnico detallado

4. **Propuesta Comercial (1 semana)**
   - Pricing personalizado
   - Timeline implementación
   - Términos contractuales

---

### Contacto

**MANO Enterprise Sales Team**
- **Email:** enterprise@mano-app.com
- **Teléfono:** +34 900 123 456
- **LinkedIn:** /company/mano-fraud-protection
- **Web:** https://mano-app.com/enterprise

**Oficinas:**
- **Madrid:** Paseo de la Castellana 123, 28046 Madrid
- **Barcelona:** Av. Diagonal 456, 08006 Barcelona
- **Valencia:** Calle Colón 789, 46004 Valencia

---

*Este documento es confidencial y está destinado únicamente para el uso de instituciones financieras interesadas en MANO Enterprise Custom. Prohibida su distribución sin autorización.*

**© 2024 MANO - Todos los derechos reservados**
"""
}


def generate_pdf(doc_name: str, content: str, output_path: str):
    """Generate a PDF from markdown content"""
    # Convert markdown to HTML
    html_content = markdown2.markdown(
        content, 
        extras=['tables', 'fenced-code-blocks', 'break-on-newline', 'strike', 'task_list']
    )
    
    # Wrap in full HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>{doc_name}</title>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Generate PDF
    css = CSS(string=CSS_STYLE)
    html = HTML(string=full_html)
    html.write_pdf(output_path, stylesheets=[css])
    print(f"✅ Generated: {output_path}")


def main():
    output_dir = "/app/docs/pdf"
    os.makedirs(output_dir, exist_ok=True)
    
    print("🔄 Generating professional PDFs for MANO investors...")
    print("-" * 50)
    
    for doc_name, content in DOCUMENTS.items():
        output_path = os.path.join(output_dir, f"{doc_name}.pdf")
        try:
            generate_pdf(doc_name, content, output_path)
        except Exception as e:
            print(f"❌ Error generating {doc_name}: {e}")
    
    print("-" * 50)
    print("✅ PDF generation complete!")
    print(f"📁 Files saved to: {output_dir}")
    
    # List generated files
    for f in os.listdir(output_dir):
        if f.endswith('.pdf'):
            size = os.path.getsize(os.path.join(output_dir, f)) / 1024
            print(f"   📄 {f} ({size:.1f} KB)")


if __name__ == "__main__":
    main()
