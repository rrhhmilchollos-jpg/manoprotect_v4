# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect es una plataforma de ciberseguridad española enfocada en proteger familias contra estafas digitales.

---

## Implementado - Febrero 13, 2026

### Employee Portal System  
- **URL Login:** `/empleados/login`
- **Credenciales Director:** `director@manoprotect.com` / `Director2026!`
- **Tabs:** Resumen, Empleados, Invitaciones, Documentos, Pedidos

### Contrato de Trabajo (NUEVO)
- **Ubicación:** `/contrato_empleado_manoprotect.zip`
- **Contenido:**
  - `Contrato_Trabajo_ManoProtect.pdf` - Modelo estándar
  - `Contrato_Trabajo_ManoProtect_Sellado.pdf` - Con cuño oficial de ManoProtect
- **Características:**
  - Conforme al RD Legislativo 2/2015 (Estatuto de los Trabajadores)
  - 10 cláusulas completas (objeto, duración, jornada, retribución, confidencialidad, etc.)
  - Sello oficial de STARTBOOKING SL / ManoProtect
  - Espacio para firmas de ambas partes
- **Acceso:** Portal de Empleados → Tab "Documentos"

### Planes con Trial de 7 días
| Plan | Precio | Trial | Dispositivo SOS |
|------|--------|-------|-----------------|
| Básico | €0 | No | No |
| Individual | €29,99/mes | ✅ Sí | Tras pago |
| Familiar | €49,99/mes | ✅ Sí | GRATIS tras pago |

### Restricciones
- Tarjeta verificada con 3D Secure del banco
- Dispositivo SOS NO disponible durante trial
- Cancelación → Plan Básico automático

---

## URLs de Descarga

| Archivo | URL |
|---------|-----|
| Contrato empleados | `/contrato_empleado_manoprotect.zip` |
| Artículos del blog | `/articulos_manoprotect.zip` |

---

## Pending Tasks

### P1
- [ ] 2FA para Portal de Empleados
- [ ] Cron job alertas trending

### P2
- [ ] Subdominio admin.manoprotect.com

### P3
- [ ] Videos demo
- [ ] App móvil
