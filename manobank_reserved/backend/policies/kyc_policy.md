# ManoBank S.A. - Política de Conocimiento del Cliente (KYC)

## 1. OBJETIVO

Establecer los procedimientos de identificación, verificación y conocimiento de clientes de ManoBank S.A. para cumplir con la normativa de prevención de blanqueo de capitales.

## 2. MARCO NORMATIVO

- Ley 10/2010 de prevención del blanqueo de capitales
- Reglamento (UE) 2015/847 (transferencias de fondos)
- RGPD (protección de datos)
- Directrices EBA sobre KYC

## 3. PROCESO DE ONBOARDING

### 3.1 Paso 1: Recopilación de Datos
```
Datos obligatorios:
- Nombre completo
- Fecha de nacimiento
- Nacionalidad
- Documento de identidad (DNI/NIE/Pasaporte)
- Dirección fiscal
- Teléfono móvil
- Email
- Profesión / Actividad económica
- Origen de los fondos
```

### 3.2 Paso 2: Verificación Documental
- Captura del documento de identidad (anverso y reverso)
- Validación automática (OCR + verificación de seguridad)
- Verificación manual si es necesario

### 3.3 Paso 3: Verificación Biométrica
- Selfie en tiempo real
- Comparación facial con documento
- Prueba de vida (liveness detection)

### 3.4 Paso 4: Screening
- Listas de sanciones (OFAC, UE, ONU)
- Bases de datos PEP
- Medios adversos
- Listas internas de riesgo

### 3.5 Paso 5: Evaluación de Riesgo
| Factor | Bajo | Medio | Alto |
|--------|------|-------|------|
| País residencia | UE | Terceros países | Países alto riesgo |
| Profesión | Empleado | Autónomo | Alto patrimonio |
| Productos | Cuenta básica | Inversión | Cripto |
| Origen fondos | Nómina | Ahorros | Herencia/Otros |

### 3.6 Paso 6: Decisión
- **Aprobado:** Alta automática
- **Pendiente:** Revisión manual
- **Rechazado:** Comunicación al cliente

## 4. ESTADOS KYC

| Estado | Descripción | Acciones permitidas |
|--------|-------------|---------------------|
| `pending` | Documentación incompleta | Ninguna |
| `in_review` | En revisión manual | Ninguna |
| `approved` | Verificado | Todas |
| `rejected` | Rechazado | Ninguna |
| `suspended` | Suspendido por alerta | Solo consulta |
| `expired` | Documentación caducada | Solo consulta |

## 5. ACTUALIZACIÓN PERIÓDICA

### 5.1 Frecuencia
| Riesgo | Frecuencia |
|--------|------------|
| Bajo | 5 años |
| Medio | 3 años |
| Alto | 1 año |

### 5.2 Triggers de Actualización
- Caducidad de documento
- Cambio de país de residencia
- Alerta de fraude
- Cambio significativo en operativa

## 6. DOCUMENTACIÓN A CONSERVAR

- Copia del documento de identidad
- Selfie de verificación
- Resultado del screening
- Evaluación de riesgo
- Decisión y justificación
- **Plazo:** 10 años desde fin de relación

## 7. PROTECCIÓN DE DATOS

- Cumplimiento RGPD
- Consentimiento explícito
- Derecho de acceso, rectificación y supresión
- Cifrado de datos sensibles
- Acceso restringido por roles

## 8. PROVEEDORES KYC

| Proveedor | Servicio | Certificaciones |
|-----------|----------|-----------------|
| Onfido | Verificación documental + biométrica | ISO 27001, SOC 2 |
| Veriff | Verificación en tiempo real | ISO 27001 |
| World-Check | Screening PEP/Sanciones | - |

## 9. EXCEPCIONES

Solo el OCI puede aprobar excepciones, documentando:
- Justificación
- Medidas compensatorias
- Plazo de validez

---

**Versión:** 1.0
**Fecha:** Enero 2026
**Aprobado por:** Compliance Officer
