# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect es una plataforma de ciberseguridad española enfocada en proteger familias contra estafas digitales (phishing, vishing, smishing), con un producto físico estrella: el Botón SOS de emergencia.

---

## What's Been Implemented - February 13, 2026

### Employee Portal System  
- **URL Login:** `/empleados/login`
- **Credenciales Director:** `director@manoprotect.com` / `Director2026!`
- **EMAIL AUTOMÁTICO ACTIVADO** ✅

### Blog de Seguridad
- **URL:** `/blog`
- Sistema de Alertas Trending con suscripción

### Planes con Trial de 7 días
| Plan | Precio | Trial 7 días | Dispositivo SOS |
|------|--------|--------------|-----------------|
| Básico | €0 | No | No incluido |
| Individual | €29,99/mes o €249,99/año | ✅ Sí | Tras pago |
| Familiar | €49,99/mes o €399,99/año | ✅ Sí | GRATIS tras pago |

### Restricciones del Trial
1. **Tarjeta obligatoria** - Se verifica con 3D Secure del banco
2. **Dispositivo SOS NO disponible** durante el trial
3. **Cancelación** → Vuelve automáticamente a Plan Básico
4. **No cancelación** → Cobro automático del importe íntegro

### Política de Reembolsos Actualizada
- Sección 1: Período de Prueba (7 días)
- Verificación bancaria 3D Secure
- Restricción dispositivo SOS durante trial
- Tabla de precios post-trial

---

## URLs Importantes

| Página | URL |
|--------|-----|
| Pricing | `/pricing` |
| Política Reembolsos | `/refund-policy` |
| Dispositivo SOS | `/sos-device-order` |
| Blog | `/blog` |
| Portal Empleados | `/empleados/login` |

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
