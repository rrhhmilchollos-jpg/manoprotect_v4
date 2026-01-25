# ManoBank - Product Requirements Document

## Original Problem Statement
Build **ManoBank**, a full-fledged, standalone digital banking system designed to operate as a regulated financial entity in Spain with:
- Customer Portal (`/manobank`)
- Employee Back-Office (`/banco`)
- Legal & Compliance Framework (AML, KYC, Audit Logs)
- Mobile App (Android APK, iOS IPA)

## User Language
Spanish

## Current Architecture

```
/app/
├── backend/
│   ├── compliance/
│   │   ├── aml/aml_service.py
│   │   ├── kyc/kyc_service.py
│   │   └── reporting/reporting_service.py
│   ├── ledger/ledger_service.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── manobank_routes.py (✓ BBVA-style registration endpoints)
│   │   ├── manobank_admin_routes.py (✓ Registration management endpoints)
│   │   ├── compliance_routes.py
│   │   └── banking_core_routes.py
│   ├── services/
│   │   └── security_service.py
│   └── server.py
├── frontend/src/pages/
│   ├── ManoBankDashboard.js (Customer dashboard)
│   ├── ManoBankRegistro.js (✓ NEW - BBVA-style 5-step registration)
│   ├── BancoSistema.js (✓ Updated - BBVA registrations in Aperturas tab)
│   ├── BancoEmpleados.js (✓ Fixed - Director login now works)
│   └── LoginSeguro.js
└── mobile/manobank-cliente/
    └── manobank-clientes-v2.zip
```

## Completed Features

### January 25, 2026
- [x] **BBVA-Style Customer Registration Flow (P0)** - Implemented and tested (100% pass)
  - 5-step registration form at `/manobank/registro`
  - Step 1: Personal data (DNI/NIE, name, DOB, nationality)
  - Step 2: Contact & Address (email, phone, full address)
  - Step 3: Employment & Financial (job status, income, source of funds - AML compliance)
  - Step 4: Documentation & Consents (terms, privacy, PEP declaration)
  - Step 5: Video verification with camera/mic permission requests
  - Backend: `POST /api/manobank/registro/nuevo-cliente`
  - Backend: `POST /api/manobank/registro/solicitar-videoverificacion`
  - Backend: `GET /api/manobank/registro/estado/{solicitud_id}`

- [x] **Director General Login Fix (P0)** - Fixed and tested
  - Issue: Login was successful but navigation to `/banco/sistema` failed
  - Root cause: `checkAuth()` not called before navigation
  - Fix: Added `await checkAuth()` before `navigate('/banco/sistema')` in BancoEmpleados.js
  - Director/Superadmin bypasses 2FA and goes directly to system

- [x] **Registration Management in Employee Portal (P0)** - Implemented
  - New endpoints in `manobank_admin_routes.py`:
    - `GET /api/manobank/admin/registrations` - List all registrations
    - `GET /api/manobank/admin/registrations/{id}` - Get registration detail
    - `POST /api/manobank/admin/registrations/{id}/approve` - Approve and create account
    - `POST /api/manobank/admin/registrations/{id}/reject` - Reject registration
    - `POST /api/manobank/admin/registrations/{id}/schedule-kyc` - Schedule video KYC
  - Account approval generates:
    - Spanish IBAN (ES + 22 digits with valid check digits)
    - Customer record with KYC verified status
    - 8-character alphanumeric temporary password (valid 24h)
    - SMS notification with credentials (fallback to debug mode)
  - Aperturas tab shows BBVA badge for new registrations

- [x] **AuthContext Enhancement** - Updated
  - Added `director` role recognition
  - `isAdmin`, `isSuperAdmin` now includes `director` role

### Previous Sessions (January 24, 2026)
- [x] Customer Account Details View
- [x] PDF Account Statement Download
- [x] Functional Customer Settings (Ajustes)
- [x] Functional Offers Page
- [x] Notification & Help Panels
- [x] SMS PIN Verification for employee portal
- [x] Company contact info in footers

## In Progress / Pending

### P1 - Mobile App
- [ ] Guide user to build Android APK via GitHub Actions
- [ ] iOS build requires macOS environment (limitation)

### P2 - Future Tasks
- [ ] ManoProtect.com separate registration (different from ManoBank)
- [ ] 2FA on customer login
- [ ] E2E test card shipping (SEUR - currently MOCKED)
- [ ] "Certificado de Titularidad" PDF download

## Key Credentials
- **Superadmin/Director:** `rrhh.milchollos@gmail.com` / `19862210Des`
- **Test Customer (approved):** DNI `12345678Z` with IBAN `ES02023400010816049310`

## Database Collections
- `manobank_customer_registrations` - NEW: BBVA-style registration requests
- `manobank_accounts` - User bank accounts
- `manobank_customers` - Customer profiles
- `manobank_transactions` - Transaction records
- `manobank_cards` - Virtual/physical cards
- `manobank_employees` - Bank staff
- `manobank_audit_log` - Security audit trail

## 3rd Party Integrations
- Zoom Video SDK (KYC)
- Twilio (2FA SMS, credential delivery)
- ReportLab (PDF generation)
- Capacitor (Mobile hybrid app)
- GitHub Actions (CI/CD for APK)

## Mocked Components
- Card shipping (SEUR)
- AML sanction/PEP lookups
- Regulatory report submission (SEPBLAC)
- Twilio SMS (falls back to debug mode if not configured)

## Test Reports
- `/app/test_reports/iteration_20.json` - Latest (100% pass rate)
- Backend: 14/14 tests passed
- Frontend: All flows working
