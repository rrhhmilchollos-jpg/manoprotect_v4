# ManoBank & ManoProtect - Product Requirements Document

## Original Problem Statement
Build **ManoBank** (digital banking) and **ManoProtect** (digital protection) as separate services with distinct registration flows, designs, and features.

## Current Architecture

```
/app/
├── backend/
│   └── routes/
│       ├── manobank_routes.py      // Customer registration, deposits, accounts
│       ├── manobank_admin_routes.py // Employee management, KYC approval
│       └── auth_routes.py          // Authentication
├── frontend/src/pages/
│   ├── ManoBankRegistro.js         // BBVA-style 5-step registration (BLUE)
│   ├── ManoProtectRegistro.js      // Plan-based 2-step registration (PURPLE)
│   ├── ManoBankDashboard.js        // Customer dashboard + deposit modal
│   ├── BancoSistema.js             // Employee portal
│   ├── BancoEmpleados.js           // Employee login
│   └── LoginSeguro.js              // 3-tab login (Email/DNI/Register)
```

## Completed Features (January 28, 2026)

### ✅ BBVA-Style Customer Registration (ManoBank)
- 5-step form: Personal Data → Contact → Employment → Documents → Video Verification
- Camera/microphone permission requests for KYC
- Data collection matching BBVA standards
- Route: `/manobank/registro`

### ✅ DNI/NIE Login for New Customers
- Tab "DNI/NIE" in `/login-seguro`
- Accepts DNI with letter + temporary password from SMS
- Forces password change on first login
- After password change, creates user in main system for email login

### ✅ Temporary Credentials System
- New customers receive: DNI/NIE + 8-char alphanumeric password
- Valid for 24 hours
- SMS notification (falls back to console if Twilio unavailable)
- Password change required before accessing dashboard

### ✅ Initial Deposit €25 (Stripe)
- Modal appears when account status = "pending_deposit"
- Stripe Checkout integration
- Creates transaction on success
- Activates account with €25 balance

### ✅ Employee SMS Credentials
- When superadmin creates new employee, system generates:
  - 10-char temporary password
  - SMS with login credentials
- Employee credentials returned in API response

### ✅ ManoProtect Separate Registration
- Different design (purple/indigo vs blue)
- Plan selection (Individual €4.99, Familiar €9.99, Premium €19.99)
- Simplified 2-step process
- Route: `/manoprotect/registro` or `/registro`

## Employee Credentials

| Name | Email | Password | Role |
|------|-------|----------|------|
| Ivan Rubio Cano | rrhh.milchollos@gmail.com | 19862210Des | Director |
| Ana García López | ana.garcia@manobank.es | bm6TRCzJQH | Gestor Comercial |
| Juan Martínez Ruiz | juan.martinez@manobank.es | zHWmD6MJnG | Cajero |
| Laura Sánchez Pérez | laura.sanchez@manobank.es | in9zdl1x7X | Atención Cliente |
| Carlos López García | carlos.lopez@manobank.es | gH163tRjNX | Compliance |

## API Endpoints

### Customer Registration (ManoBank)
- `POST /api/manobank/registro/nuevo-cliente` - Submit registration
- `POST /api/manobank/registro/solicitar-videoverificacion` - Schedule KYC
- `GET /api/manobank/registro/estado/{id}` - Check status
- `POST /api/manobank/registro/login-temporal` - Login with DNI + temp password
- `POST /api/manobank/registro/cambiar-password` - Change temp password

### Initial Deposit
- `POST /api/manobank/deposito-inicial/crear-sesion` - Create Stripe session
- `POST /api/manobank/deposito-inicial/confirmar` - Confirm payment
- `GET /api/manobank/deposito-inicial/estado/{account_id}` - Check status

### Admin (Employee Portal)
- `POST /api/manobank/admin/employees` - Create employee (sends SMS)
- `GET /api/manobank/admin/registrations` - List customer registrations
- `POST /api/manobank/admin/registrations/{id}/approve` - Approve & generate IBAN
- `POST /api/manobank/admin/registrations/{id}/reject` - Reject registration

## Pending Tasks

### 🟡 Landing Page Optimization (User Request)
Based on user feedback about conversion issues:
1. Above the fold clarity - what is ManoProtect, what it protects, CTA
2. Visual separation between ManoProtect and ManoBank
3. Testimonials and trust logos
4. Unified CTAs per section
5. Floating WhatsApp Business button
6. Limited offers / urgency elements
7. Mobile optimization

### 🟢 Future Tasks
- Mobile apps (Android APK, iOS)
- 2FA on customer login
- "Certificado de Titularidad" PDF
- Full E2E card shipping test

## Database Collections
- `manobank_customer_registrations` - BBVA-style registrations
- `manobank_accounts` - Bank accounts with IBAN
- `manobank_customers` - KYC-verified customers
- `manobank_employees` - Bank staff with temp passwords
- `manobank_payment_sessions` - Stripe payment sessions
- `manobank_transactions` - All transactions
- `manobank_audit_log` - Security events

## 3rd Party Integrations
- **Stripe** - Payment processing for initial deposit
- **Twilio** - SMS for credentials (fallback to debug mode)
- **Zoom Video SDK** - KYC video calls
- **ReportLab** - PDF generation

## Mocked Components
- Card shipping (SEUR)
- AML sanction/PEP lookups
- Regulatory reports (SEPBLAC)
- Twilio SMS (falls back to console output)

## Test Reports
- `/app/test_reports/iteration_20.json` - Backend 100% pass
