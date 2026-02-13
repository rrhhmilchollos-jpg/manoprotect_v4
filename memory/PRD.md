# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect es una plataforma de ciberseguridad española enfocada en proteger familias contra estafas digitales (phishing, vishing, smishing), con un producto físico estrella: el Botón SOS de emergencia.

---

## What's Been Implemented

### ✅ COMPLETED - February 13, 2026

#### Employee Portal System  
- **URL Login:** `/empleados/login`
- **Credenciales Director:** `director@manoprotect.com` / `Director2026!`
- **8 Roles disponibles**
- **EMAIL AUTOMÁTICO ACTIVADO** ✅

#### Blog de Seguridad
- **URL:** `/blog`
- **11 artículos** sobre estafas reales
- **Botón "Descargar Artículos"** en header
- **Sistema de Alertas Trending** con suscripción

#### Planes con Trial de 7 días (NUEVO)
- **Plan Individual (Mensual/Anual):** 7 días de prueba gratis con tarjeta obligatoria
- **Plan Familiar (Mensual/Anual):** 7 días de prueba gratis con tarjeta obligatoria
- **Plan Básico:** Sin trial (gratis siempre)

#### Política de Reembolsos Actualizada
- **Sección 1:** Período de Prueba Gratuito (7 días)
  - Si cancelas dentro de 7 días → Plan Básico automáticamente, sin cargo
  - Si NO cancelas → Cobro automático del importe íntegro
- Tabla de precios incluida en la política

---

## Pricing Structure

| Plan | Mensual | Anual | Trial 7 días |
|------|---------|-------|--------------|
| Básico | €0 | €0 | No |
| Individual | €29,99/mes | €249,99/año | ✅ Sí (tarjeta requerida) |
| Familiar | €49,99/mes | €399,99/año | ✅ Sí (tarjeta requerida) |

---

## URLs Importantes

| Página | URL |
|--------|-----|
| Pricing | `/pricing` |
| Política Reembolsos | `/refund-policy` |
| Blog | `/blog` |
| Portal Empleados | `/empleados/login` |

---

## Credentials

### Employee Portal
- **Director**: `director@manoprotect.com` / `Director2026!`

### SendGrid
- **Status**: CONFIGURED ✅

---

## Pending Tasks

### P1 - High Priority  
- [ ] 2FA para Portal de Empleados
- [ ] Cron job para emails de alertas trending

### P2 - Medium Priority
- [ ] Subdominio admin.manoprotect.com
- [ ] Dashboard analytics

### P3 - Low Priority
- [ ] Videos demo 1 minuto
- [ ] App móvil nativa
