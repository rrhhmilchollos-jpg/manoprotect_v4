# ManoBank S.A. - PRD (Product Requirements Document)

## Estado: Producción Lista ✅
**Última actualización:** 23 Enero 2026

---

## 1. Descripción del Producto

**ManoBank** es un sistema bancario digital completo que incluye:
- Portal de clientes para operaciones bancarias
- Portal de empleados para gestión administrativa
- Sistema de detección de fraude en tiempo real
- Verificación KYC con video llamada (Zoom SDK)
- Sistema de notificaciones (Twilio SMS)
- **Framework de Compliance y Audit Logs** para regulación bancaria

---

## 2. Funcionalidades Implementadas ✅

### 2.1 Portal de Clientes
- ✅ Dashboard estilo CaixaBank con balance, tarjetas y operaciones
- ✅ Transferencias entre cuentas
- ✅ Consulta de movimientos
- ✅ Gestión de tarjetas virtuales/físicas
- ✅ Solicitud de préstamos

### 2.2 Portal de Empleados (/banco)
- ✅ Login con 2FA obligatorio (SMS real via Twilio)
- ✅ Dashboard con estadísticas del banco
- ✅ Gestión de solicitudes de cuenta
- ✅ Verificación KYC con video (Zoom SDK)
- ✅ Gestión de préstamos (crear/aprobar/rechazar)
- ✅ Gestión de empleados con múltiples roles
- ✅ Alertas de fraude en tiempo real
- ✅ Poderes completos para Director General

### 2.3 Sistema de Compliance y Audit (NUEVO ✅)
- ✅ **Servicio de Compliance** integrado para auditoría regulatoria
- ✅ **Audit Logs inmutables** con hash criptográfico (SHA-256)
- ✅ **6 políticas regulatorias** documentadas:
  - KYC Policy
  - AML Policy (Anti-Money Laundering)
  - Risk Policy
  - Sanctions Policy
  - Incident Response
  - DRP/BCP (Disaster Recovery / Business Continuity)
- ✅ **APIs de Compliance**:
  - `GET /api/compliance/summary` - Resumen de compliance
  - `GET /api/compliance/policies` - Lista de políticas
  - `GET /api/compliance/audit-logs` - Logs de auditoría
  - `POST /api/compliance/reports` - Generar reportes regulatorios
- ✅ **Información legal del banco**:
  - Entidad: ManoBank S.A.
  - CIF: B19427723
  - Regulador: Banco de España
  - Licencia: Entidad de Dinero Electrónico

### 2.4 Sistema de Préstamos
- ✅ Crear solicitudes de préstamo desde el portal de empleados
- ✅ Tipos: Personal, Hipotecario, Vehículo, Empresarial, Estudios, Rápido
- ✅ Cálculo automático de tasa sugerida y cuota mensual
- ✅ Risk scoring automático
- ✅ Aprobar/Rechazar préstamos con notas

### 2.5 Seguridad
- ✅ Rate limiting para prevenir ataques brute-force
- ✅ Validación de fortaleza de contraseñas
- ✅ Logs de auditoría de seguridad
- ✅ Recuperación de contraseña por email
- ✅ 2FA obligatorio para empleados (SMS Twilio)
- ✅ Roles múltiples para empleados

---

## 3. Arquitectura Técnica

### Backend (FastAPI + Python)
```
/app/backend/
├── routes/
│   ├── auth_routes.py          # Autenticación, 2FA, rate limiting
│   ├── manobank_routes.py      # APIs públicas del banco
│   ├── manobank_admin_routes.py # APIs administrativas
│   └── compliance_routes.py    # NUEVO: APIs de compliance
├── services/
│   ├── compliance_service.py   # NUEVO: Servicio de audit logs
│   └── security_service.py     # Rate limiting y seguridad
├── policies/                    # NUEVO: Políticas regulatorias
│   ├── aml_policy.md
│   ├── kyc_policy.md
│   ├── risk_policy.md
│   ├── sanctions_policy.md
│   ├── incident_response.md
│   └── drp_bcp.md
└── compliance/                  # Estructura para módulos de compliance
    ├── aml/
    ├── kyc/
    ├── audit/
    ├── reporting/
    └── sanctions/
```

### Frontend (React)
```
/app/frontend/src/
├── pages/
│   ├── ManoBankDashboard.js    # Dashboard cliente
│   ├── BancoSistema.js         # Portal empleados
│   ├── BancoEmpleados.js       # Login empleados con 2FA
│   ├── VerificarEstafa.js      # Verificador público de fraude
│   └── SolicitarCuenta.js      # Apertura de cuenta con KYC
└── components/ui/              # Shadcn components
```

### Base de Datos
- **MongoDB**: Datos principales (usuarios, cuentas, transacciones, audit_logs)

---

## 4. Integraciones de Terceros

| Servicio | Estado | Uso |
|----------|--------|-----|
| Zoom Video SDK | ✅ Integrado | Video KYC |
| Twilio | ✅ Integrado | SMS 2FA (funciona con +34601510950) |
| ReportLab | ✅ Integrado | Generación de PDFs |
| Stripe | ✅ Integrado | Pagos de suscripción |

---

## 5. Tareas Pendientes (Backlog)

### P1 - Alta Prioridad
- [ ] **BaaS Integration (Swan)**: Conectar con proveedor bancario para transacciones reales
- [ ] **Test flujo de envío de tarjetas (SEUR)**: E2E test del proceso de shipping

### P2 - Media Prioridad
- [ ] **2FA para clientes**: Opcional para el portal de clientes
- [ ] **Grabación de llamadas KYC**: Para compliance
- [ ] **Open Banking**: Integración con otras entidades

### P3 - Baja Prioridad
- [ ] **Refactoring BancoSistema.js**: Dividir archivo de 2500+ líneas
- [ ] **App móvil**: APK de ManoBank Clientes via GitHub Actions

---

## 6. Credenciales de Test

| Usuario | Email | Password | Notas |
|---------|-------|----------|-------|
| Director General | rrhh.milchollos@gmail.com | 19862210Des | 2FA SMS a +34601510950 |

---

## 7. URLs Importantes

- **Landing**: `/`
- **Dashboard Cliente**: `/dashboard`
- **Login Empleados**: `/banco`
- **Sistema Empleados**: `/banco/sistema`
- **Verificador Estafas**: `/verificar-estafa`
- **Abrir Cuenta**: `/abrir-cuenta`
- **Promo ManoBank**: `/manobank-promo`

---

## 8. Compliance APIs

```
GET  /api/compliance/summary        # Resumen con info de entidad
GET  /api/compliance/policies       # Lista de políticas regulatorias
GET  /api/compliance/audit-logs     # Logs de auditoría con filtros
POST /api/compliance/audit-logs     # Crear entrada manual de auditoría
POST /api/compliance/reports        # Generar reporte AML/KYC/Transactions
GET  /api/compliance/event-types    # Lista de tipos de eventos de auditoría
```

---

## Changelog

### 23 Enero 2026
- ✅ Implementado **Compliance Service** completo para regulación bancaria
- ✅ Creadas **APIs de compliance** (summary, policies, audit-logs, reports)
- ✅ **Audit logs inmutables** con hash SHA-256 para integridad
- ✅ Corregido bug de verificación de DB en compliance service
- ✅ Actualizado `require_admin` para incluir rol `director`
- ✅ Todos los tests pasados (12/12 backend + frontend 100%)

### 21 Enero 2026
- ✅ Implementado sistema de detección de fraude
- ✅ Creado algoritmo automático de detección de patrones sospechosos
- ✅ Añadida UI para selección múltiple de roles para empleados
- ✅ Añadida ruta `/verificar-estafa` al router
- ✅ 13/13 tests pasados en iteration_16
