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
│   │   ├── manobank_routes.py (✓ Updated with account transactions endpoint)
│   │   ├── manobank_admin_routes.py
│   │   ├── compliance_routes.py
│   │   └── banking_core_routes.py
│   ├── services/compliance_service.py
│   └── server.py
├── frontend/src/pages/
│   ├── ManoBankDashboard.js (✓ Updated with account detail view)
│   ├── BancoSistema.js
│   └── KYCVideoVerification.js
└── mobile/manobank-cliente/
    └── manobank-clientes-v2.zip
```

## Completed Features

### January 24, 2026
- [x] **Customer Account Details View (P0)** - Implemented and tested
  - Backend endpoint: `GET /api/manobank/accounts/{account_id}/transactions`
  - Frontend: Clickable accounts → detail view with IBAN, BIC/SWIFT, transactions
  - UI shows: Account info, quick actions (Transfer, Bizum, Extract, Certificate)

### Previous Sessions
- [x] Employee portal login fixed
- [x] Full banking backend (Ledger, AML, KYC, Reporting)
- [x] Employee portal with Compliance/AML tabs
- [x] Customer detail modal for employees
- [x] Video KYC improved UX
- [x] Customer dashboard reorganized
- [x] "Ver Alertas" button fixed
- [x] SEUR shipping location changed to "Novetle"
- [x] Superadmin role for `rrhh.milchollos@gmail.com`

## In Progress / Pending

### P1 - Mobile App
- [ ] Guide user to build Android APK via GitHub Actions (`manobank-clientes-v2.zip`)
- [ ] iOS build requires macOS environment (limitation)

### P2 - Future Tasks
- [ ] ManoProtect.com features (awaiting user clarification)
- [ ] 2FA on customer login
- [ ] E2E test card shipping (SEUR - currently MOCKED)

## Key Credentials
- **Superadmin:** `rrhh.milchollos@gmail.com` / `19862210Des`

## Database Collections
- `manobank_accounts` - User bank accounts
- `manobank_transactions` - Transaction records
- `manobank_cards` - Virtual/physical cards
- `manobank_ledger` - Immutable audit trail
- `manobank_aml_alerts` - AML monitoring
- `manobank_kyc_cases` - KYC verification
- `manobank_employees` - Bank staff

## 3rd Party Integrations
- Zoom Video SDK (KYC)
- Twilio (2FA SMS)
- ReportLab (PDF generation)
- Capacitor (Mobile hybrid app)
- GitHub Actions (CI/CD for APK)

## Mocked Components
- Card shipping (SEUR)
- AML sanction/PEP lookups
- Regulatory report submission (SEPBLAC)
