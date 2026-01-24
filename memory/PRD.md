# ManoBank S.A. - PRD

## Estado: Sistema Bancario Completo ✅
**Última actualización:** 24 Enero 2026

---

## Cambios Recientes

### 24 Enero 2026
- ✅ **Panel de Compliance** añadido al portal de empleados
- ✅ **Dashboard AML** con alertas y gestión
- ✅ **Botón "Ver Alertas"** arreglado (ahora navega a tab AML)
- ✅ **Tabs de navegación** añadidos: Compliance, Alertas AML
- ✅ **Deployment Health Check** completado - Ready for deployment

### Funcionalidades Implementadas en Frontend

**Tab Compliance:**
- Info de entidad (ManoBank S.A., CIF, Regulador)
- Estadísticas de audit events
- Estado KYC (pendientes, tiempo medio)
- Reportes regulatorios (generar diario/mensual)
- Lista de políticas regulatorias

**Tab Alertas AML:**
- Dashboard con total alertas y pendientes
- SARs del mes
- Alertas por tipo
- Lista de alertas con acciones (aprobar/escalar)
- Alertas de alto riesgo recientes

---

## APIs Disponibles

### Compliance
- GET `/api/compliance/summary`
- GET `/api/compliance/policies`
- GET `/api/compliance/audit-logs`

### AML
- GET `/api/aml/dashboard`
- GET `/api/aml/alerts`
- PATCH `/api/aml/alerts/{id}`
- POST `/api/aml/screen-customer`

### KYC
- GET `/api/kyc/dashboard`
- GET `/api/kyc/pending`
- POST `/api/kyc/initiate`
- POST `/api/kyc/{id}/approve`

### Reporting
- GET `/api/reporting/dashboard`
- POST `/api/reporting/daily-cash`
- POST `/api/reporting/monthly-operations`

---

## Credenciales de Test
| Usuario | Email | Password |
|---------|-------|----------|
| Director General | rrhh.milchollos@gmail.com | 19862210Des |

## URLs
- Portal Clientes: `/manobank`
- Portal Empleados: `/banco`
- Verificar Estafa: `/verificar-estafa`
