# ManoBank S.A. - Política de Sanciones

## 1. OBJETIVO

Garantizar el cumplimiento de las regulaciones internacionales de sanciones económicas y embargos, evitando que ManoBank S.A. sea utilizado para transacciones prohibidas.

## 2. LISTAS DE SANCIONES MONITOREADAS

| Lista | Emisor | Frecuencia actualización |
|-------|--------|--------------------------|
| OFAC SDN | EE.UU. (Treasury) | Diaria |
| EU Consolidated | Unión Europea | Diaria |
| UN Sanctions | Naciones Unidas | Diaria |
| UK Sanctions | HM Treasury | Diaria |
| España (SEPBLAC) | Gobierno España | Diaria |

## 3. PROCESO DE SCREENING

### 3.1 Onboarding
- Screening obligatorio antes de alta
- Matching automático + revisión manual de alertas
- Rechazo automático si match confirmado

### 3.2 Transacciones
- Screening de beneficiarios en tiempo real
- Bloqueo automático si match
- Revisión manual en <4 horas

### 3.3 Screening Continuo
- Re-screening diario de toda la base de clientes
- Alertas automáticas ante nuevas inclusiones

## 4. PAÍSES DE ALTO RIESGO

### 4.1 Prohibidos (No operar)
- Corea del Norte
- Irán
- Siria
- Crimea/Donetsk/Luhansk

### 4.2 Alto Riesgo (Diligencia reforzada)
- Rusia
- Bielorrusia
- Venezuela
- Myanmar
- Afganistán

## 5. GESTIÓN DE ALERTAS

### 5.1 Niveles de Match
| Nivel | Score | Acción |
|-------|-------|--------|
| Bajo | <70% | Descarte automático |
| Medio | 70-90% | Revisión manual |
| Alto | >90% | Bloqueo + revisión |
| Exacto | 100% | Bloqueo inmediato |

### 5.2 Proceso de Revisión
1. Analista revisa en <4 horas
2. Documentación del análisis
3. Escalado a Compliance si procede
4. Decisión: desbloquear / mantener / reportar

## 6. REPORTING

- Alertas bloqueadas: reporte inmediato a SEPBLAC
- Estadísticas mensuales al Comité de Riesgos
- Informe anual de cumplimiento de sanciones

## 7. FORMACIÓN

- Todo el personal: formación básica anual
- Compliance y operaciones: formación avanzada semestral

---

**Versión:** 1.0
**Fecha:** Enero 2026
