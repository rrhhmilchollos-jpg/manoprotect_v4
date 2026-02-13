# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect es una plataforma de ciberseguridad española enfocada en proteger familias contra estafas digitales (phishing, vishing, smishing), con un producto físico estrella: el Botón SOS de emergencia.

## Latest User Request (February 2026)
1. **Homepage Redesign** - Reorganizar la página principal que estaba muy cargada de información para hacerla más profesional y limpia.
2. **Portal de Empleados** - Sistema completo con:
   - Rol de "director general" que crea cuentas
   - Registro por invitación (credenciales enviadas por email)
   - Herramientas para controlar y monitorear todo el sitio

---

## What's Been Implemented

### ✅ COMPLETED - February 13, 2026

#### Homepage Redesign
- **New modular landing page** with clean, professional design
- Components created:
  - `HeroSection.jsx` - Main headline with CTA buttons
  - `FeaturesGrid.jsx` - 5 feature cards in bento grid layout
  - `SOSProductShowcase.jsx` - Apple-style product highlight
  - `TestimonialsSection.jsx` - User reviews
  - `CTASection.jsx` - Final conversion section
  - `LandingHeader.jsx` - Clean navigation
  - `LandingFooter.jsx` - Minimal footer
- Reduced from 1400+ lines to ~60 lines (modular)
- Trust indicators: "7 días gratis", "Sin tarjeta", "Cancela cuando quieras"

#### Employee Portal System
- **Login**: `/empleados/login`
- **Register**: `/empleados/registro?token=XXX`
- **Dashboard**: `/empleados/dashboard`
- **Roles**: director, manager, employee
- **Features**:
  - Director-only invitation creation
  - Secure token-based registration flow
  - Dashboard with statistics (users, orders, threats)
  - Employee management (list, update, deactivate)
  - Role-based access control (RBAC)
- **Director Account Created**:
  - Email: `director@manoprotect.com`
  - Password: `Director2026!`

### ✅ Previously Completed
- SOS Device Order Form with color selectors and dynamic pricing
- Thank You page (`OrderConfirmation.js`) with confetti
- Payment Cancelled page
- User Dashboard "Mis Pedidos" tab for order tracking
- SendGrid email service (code ready, awaiting API key)

---

## Pending/Blocked Items

### 🟡 BLOCKED - Awaiting User Input
1. **SendGrid API Key** - Email notifications implemented but need API key to function
   - Affects: Order confirmations, shipping updates, employee invite emails

---

## Prioritized Backlog

### P0 - Critical
- [ ] SendGrid email integration activation (blocked on API key)

### P1 - High Priority  
- [ ] Employee portal email integration (send invite credentials via email)
- [ ] PageSpeed optimization re-evaluation

### P2 - Medium Priority
- [ ] 1-minute demo videos (Sora 2 limitation workaround)
- [ ] More admin tools in employee portal (content management)

### P3 - Low Priority / Future
- [ ] Company "Intranet" for devices
- [ ] DNA Digital Identity / Blockchain Verifier
- [ ] WhatsApp/Twilio integration

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
│       ├── LandingHeader.jsx
│       └── LandingFooter.jsx
├── pages/
│   ├── LandingPage.js (redesigned)
│   ├── EmployeeLogin.js (NEW)
│   ├── EmployeeRegister.js (NEW)
│   └── EmployeePortalDashboard.js (NEW)
```

### Backend Structure
```
/app/backend/
├── routes/
│   └── employee_portal.py (NEW - complete CRUD + auth)
├── services/
│   └── email_service.py (SendGrid ready)
```

### Database Collections
- `employees` - Employee accounts with roles
- `employee_invites` - Invitation tokens with expiry
- `site_content` - Editable site content (for future CMS)

---

## API Endpoints

### Employee Portal
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/employee-portal/login` | Employee login | No |
| POST | `/api/employee-portal/logout` | Employee logout | Yes |
| GET | `/api/employee-portal/me` | Get current employee | Yes |
| POST | `/api/employee-portal/register` | Register with invite token | No |
| GET | `/api/employee-portal/verify-invite/{token}` | Verify invite token | No |
| POST | `/api/employee-portal/invites` | Create invite | Director |
| GET | `/api/employee-portal/invites` | List invites | Director |
| DELETE | `/api/employee-portal/invites/{id}` | Cancel invite | Director |
| GET | `/api/employee-portal/employees` | List employees | Director |
| PATCH | `/api/employee-portal/employees/{id}` | Update employee | Director |
| DELETE | `/api/employee-portal/employees/{id}` | Deactivate employee | Director |
| GET | `/api/employee-portal/dashboard/stats` | Get dashboard stats | Yes |

---

## Test Coverage
- Backend: 18/18 tests passing (100%)
- Frontend: All features verified
- Test file: `/app/backend/tests/test_employee_portal.py`
- Test report: `/app/test_reports/iteration_37.json`

---

## Third-Party Integrations

| Service | Status | Notes |
|---------|--------|-------|
| Stripe | ✅ Active | Payment processing |
| SendGrid | 🟡 Code Ready | Awaiting API key |
| Twilio | ⏸️ Pending | WhatsApp messaging |
| Sora 2 | ✅ Active | Video generation |
| Firebase | ✅ Active | Auth/Backend |

---

## Credentials for Testing

### Employee Portal
- **Director**: `director@manoprotect.com` / `Director2026!`
- **Employee**: `empleado1@test.com` / `Empleado2026!`
