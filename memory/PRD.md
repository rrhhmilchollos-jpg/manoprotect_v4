# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect es una plataforma de ciberseguridad española enfocada en proteger familias contra estafas digitales (phishing, vishing, smishing), con un producto físico estrella: el Botón SOS de emergencia.

## Latest User Request (February 2026)
1. **Homepage Redesign** - Reorganizar la página principal que estaba muy cargada de información
2. **Portal de Empleados** - Sistema completo con roles profesionales
3. **Blog de Estafas** - Sección con casos reales de estafas en España para generar confianza y conversiones

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
- **Departamentos:** Dirección, Atención al Cliente, Ventas, Logística, Marketing, Seguridad, Tecnología, Administración
- **Director Account:** `director@manoprotect.com` / `Director2026!`

#### Blog de Seguridad (NUEVO)
- Página principal: `/blog`
- Artículos individuales: `/blog/:slug`
- **6 artículos iniciales** sobre estafas reales en España:
  1. SMS falsos de Correos (Smishing)
  2. Llamadas falsas de bancos - Santander/BBVA (Vishing)
  3. WhatsApp "mamá se me rompió el móvil"
  4. Secuestros virtuales
  5. Phishing de Hacienda (Renta)
  6. Criptoestafas con famosos
- Filtros por categoría (Smishing, Vishing, Phishing, WhatsApp, Secuestro Virtual)
- Buscador integrado
- Botones de compartir en redes sociales
- CTA de conversión en cada artículo
- **Botón "Blog Estafas" en el header** (color amarillo destacado)

#### Trust Badge
- Sello "Sitio Verificado - Protegido por ManoProtect" en el footer
- Indicador de estado "ACTIVO" animado

---

## Pending/Blocked Items

### 🟡 BLOCKED - Awaiting User Input
1. **SendGrid API Key** - Email notifications implemented but need API key
   - Affects: Order confirmations, shipping updates, employee invite emails

---

## Prioritized Backlog

### P0 - Critical
- [ ] SendGrid email integration activation (blocked on API key)

### P1 - High Priority  
- [ ] 2FA para Portal de Empleados
- [ ] Logs de actividad de empleados
- [ ] Más artículos de blog (actualizar semanalmente)

### P2 - Medium Priority
- [ ] Subdominio admin.manoprotect.com
- [ ] PageSpeed optimization
- [ ] SSO con Google Workspace

### P3 - Low Priority / Future
- [ ] VPN obligatoria para empleados
- [ ] Restricción por IP España
- [ ] Auditoría de sesiones
- [ ] DNA Digital Identity / Blockchain Verifier

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
│       ├── TestimonialsSection.jsx
│       ├── CTASection.jsx
│       ├── LandingHeader.jsx (with Blog button)
│       └── LandingFooter.jsx (with Trust Badge)
├── pages/
│   ├── LandingPage.js
│   ├── BlogPage.js (NEW)
│   ├── BlogPostPage.js (NEW)
│   ├── EmployeeLogin.js
│   ├── EmployeeRegister.js
│   └── EmployeePortalDashboard.js
```

### Backend Structure
```
/app/backend/
├── routes/
│   └── employee_portal.py (8 roles + permissions)
```

### New Dependencies
- `react-markdown` - For rendering blog post content

---

## API Endpoints

### Employee Portal
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/employee-portal/roles` | Get available roles | No |
| POST | `/api/employee-portal/login` | Employee login | No |
| POST | `/api/employee-portal/register` | Register with token | No |
| POST | `/api/employee-portal/invites` | Create invite | Director |
| GET | `/api/employee-portal/employees` | List employees | Director |
| GET | `/api/employee-portal/dashboard/stats` | Dashboard stats | Yes |

---

## Test Coverage
- All features verified via screenshots
- Employee portal login/dashboard working
- Blog pages loading correctly
- Trust badge visible in footer

---

## Credentials for Testing

### Employee Portal
- **Director**: `director@manoprotect.com` / `Director2026!`

---

## Content Strategy (Blog)

El blog tiene como objetivo:
1. **Educar** a los usuarios sobre estafas reales
2. **Generar confianza** mostrando que ManoProtect conoce las amenazas
3. **Convertir** visitantes en usuarios mediante CTAs estratégicos
4. **SEO** - Posicionar para búsquedas como "estafas SMS España", "phishing Correos", etc.

### Actualización recomendada:
- Agregar 2-3 artículos nuevos por semana
- Actualizar estadísticas mensualmente
- Añadir casos reales de noticias españolas
