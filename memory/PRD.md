# ManoBank S.A. - PRD

## Estado: Sistema Bancario Completo ✅
**Última actualización:** 24 Enero 2026

---

## Cambios Recientes (24 Enero 2026)

### Arreglado
1. ✅ **Usuario superadmin** - `rrhh.milchollos@gmail.com` ahora es `superadmin`
2. ✅ **Video KYC mejorado** - Nueva UX para permisos de cámara/micrófono:
   - Paso introductorio que explica los requisitos
   - Indicadores visuales del estado de permisos
   - Guía detallada de cómo activar permisos en cada navegador/dispositivo
   - Botón de reintento después de activar permisos
   - Vista previa de cámara antes de iniciar la videollamada
3. ✅ **Panel de Compliance** en portal de empleados
4. ✅ **Dashboard AML** con alertas
5. ✅ **Botón "Ver Alertas"** funcionando
6. ✅ **APK actualizado** v2.0.0 - Compliance Edition

---

## Sistema Completado

### Portal de Clientes (`/manobank`)
- Dashboard con balance total
- Lista de cuentas con IBAN
- Tarjetas con diseño premium
- Transferencias y Bizum
- Historial de movimientos
- Productos y ofertas

### Portal de Empleados (`/banco`)
- Dashboard con estadísticas
- Gestión de aperturas de cuenta
- Verificación KYC por videollamada
- Gestión de clientes
- Gestión de préstamos
- Gestión de tarjetas
- Envíos SEUR
- Gestión de empleados
- **Panel de Compliance** (NUEVO)
- **Dashboard AML** (NUEVO)

### APIs Implementadas
- `/api/auth/*` - Autenticación con 2FA
- `/api/manobank/*` - APIs de clientes
- `/api/manobank/admin/*` - APIs administrativas
- `/api/compliance/*` - Compliance y auditoría
- `/api/ledger/*` - Libro mayor inmutable
- `/api/aml/*` - Anti-Money Laundering
- `/api/kyc/*` - Know Your Customer
- `/api/reporting/*` - Reportes regulatorios

---

## Credenciales

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Director General | rrhh.milchollos@gmail.com | 19862210Des | superadmin |

## URLs
- Landing: `/`
- Dashboard Cliente: `/manobank`
- Login Clientes: `/login-seguro`
- Portal Empleados: `/banco`
- Video KYC: integrado en apertura de cuenta

---

## Proyecto Móvil

**Ubicación:** `/app/mobile/manobank-cliente/`
**ZIP:** `manobank-clientes-v2.zip`
**Versión:** 2.0.0 - Compliance Edition

### Para compilar:
1. Subir ZIP a GitHub
2. Ir a Actions → Run workflow
3. Descargar `ManoBank-Android-APK` y `ManoBank-iOS-IPA`
