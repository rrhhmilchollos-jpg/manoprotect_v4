# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect es una plataforma de ciberseguridad española enfocada en proteger familias contra estafas digitales (phishing, vishing, smishing), con un producto físico estrella: el Botón SOS de emergencia.

## Latest User Request (February 2026)
1. **Homepage Redesign** - Reorganizar la página principal que estaba muy cargada de información
2. **Portal de Empleados** - Sistema completo con roles profesionales
3. **Blog de Estafas** - Sección con casos reales de estafas en España para generar confianza y conversiones
4. **Descargar Artículos** - Botón para descargar ZIP con todos los artículos del blog
5. **Configurar SendGrid** - Activar emails automáticos para invitaciones de empleados

---

## What's Been Implemented

### ✅ COMPLETED - February 13, 2026

#### Homepage Redesign
- Nueva landing page limpia y profesional con componentes modulares
- Sello de confianza "Protegido por ManoProtect" en el footer
- Componentes: HeroSection, FeaturesGrid, SOSProductShowcase, Testimonials, CTA

#### Employee Portal System  
- Login: `/empleados/login`
- Register: `/empleados/registro?token=XXX`
- Dashboard: `/empleados/dashboard`
- **8 Roles disponibles:**
  - Director General (nivel 100)
  - Manager (nivel 80)
  - Analista de Fraude (nivel 60)
  - Logística (nivel 50)
  - Soporte al Cliente (nivel 50)
  - Ventas (nivel 40)
  - Marketing (nivel 40)
  - Empleado básico (nivel 10)
- **Director Account:** `director@manoprotect.com` / `Director2026!`
- **EMAIL AUTOMÁTICO ACTIVADO** - Las invitaciones ahora envían email con SendGrid

#### Blog de Seguridad
- Página principal: `/blog`
- Artículos individuales: `/blog/:slug`
- **11 artículos** sobre estafas reales en España:
  1. SMS falsos de Correos (Smishing)
  2. Llamadas falsas de bancos - Santander/BBVA (Vishing)
  3. WhatsApp "mamá se me rompió el móvil"
  4. Secuestros virtuales
  5. Phishing de Hacienda (Renta)
  6. Criptoestafas con famosos
  7. Secuestro Real Corbera-Xàtiva 2026
  8. INCIBE: 122.223 ciberataques en España 2025
  9. Menores desaparecidos en España 2024
  10. Caídas de ancianos - 4.018 muertes
  11. Estafa del CEO (B2B)
- Filtros por categoría
- Buscador integrado
- **Botón "Descargar Artículos"** en el header del blog
- SEO mejorado con meta tags Open Graph

#### SendGrid Email Integration
- **ACTIVO Y FUNCIONANDO**
- Emails de invitación de empleados con diseño profesional
- Configuración: `SENDGRID_API_KEY` en `.env`
- Sender: `rrhh.milchollos@gmail.com`

#### Archivos Descargables
- `/articulos_manoprotect.zip` - Resumen de todos los artículos del blog

---

## Pending/Blocked Items

### ✅ RESUELTO
- ~~SendGrid API Key~~ - YA CONFIGURADO Y FUNCIONANDO

---

## Prioritized Backlog

### P0 - Critical
- [x] SendGrid email integration activation ✅ COMPLETADO

### P1 - High Priority  
- [ ] 2FA para Portal de Empleados
- [ ] Logs de actividad de empleados
- [ ] Más artículos de blog (actualizar semanalmente)

### P2 - Medium Priority
- [ ] Subdominio admin.manoprotect.com (usuario no puede hacerlo ahora)
- [ ] PageSpeed optimization
- [ ] SSO con Google Workspace

### P3 - Low Priority / Future
- [ ] VPN obligatoria para empleados
- [ ] Restricción por IP España
- [ ] Auditoría de sesiones
- [ ] DNA Digital Identity / Blockchain Verifier
- [ ] Videos demo de 1 minuto (Sora 2)

---

## Technical Architecture

### Frontend Structure
```
/app/frontend/src/
├── components/
│   └── landing/
│       ├── HeroSection.jsx
│       ├── FeaturesGrid.jsx
│       ├── SOSProductShowcase.jsx
│       └── ...
├── pages/
│   ├── LandingPage.js
│   ├── BlogPage.js (with Download button)
│   ├── BlogPostPage.js
│   ├── EmployeeLogin.js
│   ├── EmployeeRegister.js
│   └── EmployeePortalDashboard.js
└── public/
    └── articulos_manoprotect.zip
```

### Backend Structure
```
/app/backend/
├── routes/
│   └── employee_portal.py (8 roles + email integration)
├── services/
│   └── email_service.py (SendGrid + Employee invite templates)
```

---

## API Endpoints

### Employee Portal
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/employee-portal/roles` | Get available roles | No |
| POST | `/api/employee-portal/login` | Employee login | No |
| POST | `/api/employee-portal/register` | Register with token | No |
| POST | `/api/employee-portal/invites` | Create invite + SEND EMAIL | Director |
| GET | `/api/employee-portal/employees` | List employees | Director |

### Email Status
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/email/status` | Check SendGrid configuration |

---

## Credentials for Testing

### Employee Portal
- **Director**: `director@manoprotect.com` / `Director2026!`

### SendGrid
- **Status**: CONFIGURED ✅
- **Sender**: `rrhh.milchollos@gmail.com`

---

## Content Strategy (Blog)

### Objetivos del blog:
1. **Educar** a los usuarios sobre estafas reales
2. **Generar confianza** mostrando expertise
3. **Convertir** visitantes en usuarios mediante CTAs
4. **SEO** - Keywords: "estafas SMS España", "phishing Correos", "estafa WhatsApp Bizum"

### Actualización recomendada:
- Agregar 2-3 artículos nuevos por semana
- Compartir en redes sociales
- Actualizar estadísticas mensualmente

---

## Recent Changes (Feb 13, 2026)
1. Añadido botón "Descargar Artículos" en BlogPage.js
2. Creado archivo `/public/articulos_manoprotect.zip`
3. Integrado SendGrid en employee_portal.py
4. Añadido método `send_employee_invite()` en email_service.py
5. Mejorado SEO del blog con Open Graph tags
