# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect es una plataforma de ciberseguridad española enfocada en proteger familias contra estafas digitales (phishing, vishing, smishing), con un producto físico estrella: el Botón SOS de emergencia.

## Latest User Request (February 2026)
1. **Homepage Redesign** - Reorganizar la página principal ✅
2. **Portal de Empleados** - Sistema completo con roles ✅
3. **Blog de Estafas** - Casos reales de estafas en España ✅
4. **Descargar Artículos** - Botón para descargar ZIP ✅
5. **Activar SendGrid** - Emails automáticos para invitaciones ✅
6. **Notificaciones Push de Estafas** - Alertas trending en tiempo real ✅

---

## What's Been Implemented

### ✅ COMPLETED - February 13, 2026

#### Employee Portal System  
- **URL Login:** `/empleados/login`
- **URL Register:** `/empleados/registro?token=XXX`
- **URL Dashboard:** `/empleados/dashboard`
- **Credenciales Director:** `director@manoprotect.com` / `Director2026!`
- **8 Roles disponibles:** Director, Manager, Analista de Fraude, Logística, Soporte, Ventas, Marketing, Empleado
- **EMAIL AUTOMÁTICO ACTIVADO** ✅

#### Blog de Seguridad
- **URL:** `/blog`
- **11 artículos** sobre estafas reales en España
- **Botón "Descargar Artículos"** en header
- **SEO optimizado** con Open Graph

#### Sistema de Alertas de Estafas Trending (NUEVO)
- **Suscripción por email** sin necesidad de registro
- **Trending scams en tiempo real** con estadísticas
- **API endpoints:**
  - `GET /api/scam-alerts/trending` - Estafas actuales
  - `GET /api/scam-alerts/stats` - Estadísticas
  - `POST /api/scam-alerts/subscribe` - Suscribirse
  - `DELETE /api/scam-alerts/unsubscribe/{email}` - Cancelar
- **Componente visual** en BlogPage con:
  - Formulario de suscripción
  - Cards de estafas trending
  - Severidad por colores (crítica/alta/media)
  - Contador de afectados

---

## API Endpoints

### Employee Portal
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/employee-portal/login` | Login empleado |
| POST | `/api/employee-portal/invites` | Crear invitación + EMAIL |
| GET | `/api/employee-portal/roles` | Roles disponibles |

### Scam Alerts (NUEVO)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scam-alerts/trending` | Estafas trending |
| GET | `/api/scam-alerts/stats` | Estadísticas |
| POST | `/api/scam-alerts/subscribe` | Suscribirse (público) |
| DELETE | `/api/scam-alerts/unsubscribe/{email}` | Cancelar |

---

## Credentials for Testing

### Employee Portal
- **Director**: `director@manoprotect.com` / `Director2026!`

### SendGrid
- **Status**: CONFIGURED ✅
- **Sender**: `rrhh.milchollos@gmail.com`

---

## Prioritized Backlog

### P1 - High Priority  
- [ ] 2FA para Portal de Empleados
- [ ] Envío real de emails de alertas trending (cron job)
- [ ] Más artículos de blog semanalmente

### P2 - Medium Priority
- [ ] Subdominio admin.manoprotect.com
- [ ] PageSpeed optimization
- [ ] Dashboard analytics de suscripciones

### P3 - Low Priority / Future
- [ ] Videos demo 1 minuto (Sora 2)
- [ ] DNA Digital Identity / Blockchain
- [ ] App móvil nativa

---

## Technical Architecture

### New Files Created (Feb 13, 2026)
- `/app/frontend/src/components/ScamAlertSubscription.jsx` - Componente de alertas
- `/app/frontend/public/articulos_manoprotect.zip` - Artículos descargables
- `/app/backend/routes/notifications_routes.py` - Rutas de alertas actualizadas
- `/app/backend/services/email_service.py` - Método `send_employee_invite()` añadido

### Database Collections
- `scam_alert_subscriptions` - Suscripciones a alertas de estafas
- `employee_invites` - Invitaciones de empleados
- `employees` - Empleados registrados

---

## Recent Changes Log

### Feb 13, 2026
1. ✅ Botón "Descargar Artículos" añadido al blog
2. ✅ ZIP de artículos creado
3. ✅ SendGrid integrado en invitaciones de empleados
4. ✅ Sistema de alertas de estafas trending implementado
5. ✅ Componente ScamAlertSubscription.jsx creado
6. ✅ APIs de scam-alerts funcionando
