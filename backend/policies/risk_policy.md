# ManoBank S.A. - Política de Gestión de Riesgos

## 1. MARCO DE GESTIÓN DE RIESGOS

### 1.1 Principios
- Identificación proactiva de riesgos
- Evaluación continua
- Mitigación proporcional
- Reporting transparente

### 1.2 Categorías de Riesgo

| Categoría | Descripción |
|-----------|-------------|
| Riesgo de Crédito | Impago de préstamos |
| Riesgo Operacional | Fallos en procesos, sistemas, personas |
| Riesgo de Mercado | Fluctuaciones de tipos/divisas |
| Riesgo de Liquidez | Incapacidad de atender obligaciones |
| Riesgo de Cumplimiento | Sanciones regulatorias |
| Riesgo Reputacional | Daño a la imagen |
| Riesgo Tecnológico | Ciberataques, fallos IT |

## 2. GOBERNANZA

### 2.1 Tres Líneas de Defensa
1. **Primera línea:** Negocio (gestión del riesgo)
2. **Segunda línea:** Riesgos y Compliance (supervisión)
3. **Tercera línea:** Auditoría Interna (aseguramiento)

### 2.2 Comité de Riesgos
- Reunión: Mensual
- Miembros: CEO, CRO, CFO, CISO, Compliance
- Funciones: Revisión de indicadores, aprobación de límites

## 3. RIESGO DE CRÉDITO

### 3.1 Scoring
- Modelo interno de scoring
- Variables: historial, ingresos, endeudamiento
- Actualización del modelo: anual

### 3.2 Límites
| Producto | Límite individual | Límite cartera |
|----------|-------------------|----------------|
| Préstamo personal | 50.000€ | 10M€ |
| Línea de crédito | 10.000€ | 5M€ |
| Descubierto | 500€ | 500K€ |

### 3.3 Provisiones
- Según IFRS 9
- Modelo de pérdida esperada

## 4. RIESGO OPERACIONAL

### 4.1 Identificación
- Registro de incidentes
- Autoevaluaciones de control (RCSA)
- Indicadores clave de riesgo (KRI)

### 4.2 KRIs Principales
| Indicador | Umbral Amarillo | Umbral Rojo |
|-----------|-----------------|-------------|
| Downtime sistemas | >1h/mes | >4h/mes |
| Errores en transacciones | >0.1% | >0.5% |
| Reclamaciones | >50/mes | >100/mes |
| Incidentes de seguridad | >1/mes | >3/mes |

## 5. RIESGO DE FRAUDE

### 5.1 Controles Preventivos
- Verificación de identidad robusta
- Autenticación de dos factores
- Límites de transacción
- Listas negras

### 5.2 Controles Detectivos
- Monitoreo en tiempo real
- Reglas de detección de patrones
- Machine Learning para anomalías
- Alertas automáticas

### 5.3 Reglas de Fraude Activas
```
REGLA 001: Transferencia > 5.000€ sin historial → Revisión manual
REGLA 002: >3 transferencias en 1 hora → Alerta
REGLA 003: Login desde país diferente → 2FA obligatorio
REGLA 004: Cambio de datos + transferencia en 24h → Bloqueo
REGLA 005: Beneficiario en lista de riesgo → Bloqueo
```

## 6. RIESGO TECNOLÓGICO

### 6.1 Ciberseguridad
- Pen testing anual
- Escaneo de vulnerabilidades mensual
- Cifrado TLS 1.3 / AES-256
- WAF activo

### 6.2 Continuidad de Negocio
- RPO: 1 hora
- RTO: 4 horas
- Pruebas DRP: semestral

## 7. APETITO DE RIESGO

| Riesgo | Apetito |
|--------|---------|
| Crédito | Conservador (mora <2%) |
| Operacional | Bajo (pérdidas <0.5% ingresos) |
| Fraude | Muy bajo (<0.1% transacciones) |
| Cumplimiento | Cero tolerancia |
| Reputacional | Bajo |

## 8. REPORTING

### 8.1 Interno
- Dashboard diario de riesgos
- Informe mensual al Comité
- Informe trimestral al Consejo

### 8.2 Externo
- Reporting regulatorio (Banco de España)
- Informe anual de gestión de riesgos

---

**Versión:** 1.0
**Fecha:** Enero 2026
**Aprobado por:** Comité de Riesgos
