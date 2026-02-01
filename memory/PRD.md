# ManoProtect - Product Requirements Document

## Original Problem Statement
ManoProtect is a comprehensive family protection and financial security application. The platform provides:
- Family member tracking and emergency SOS features
- AI-powered threat analysis
- Scam/fraud detection and reporting
- Subscription management with Stripe (including 7-day trial)
- Multi-language support (9 languages)
- Superadmin management system

## User Personas
1. **Family Administrators**: Parents/guardians who manage family plans and monitor family members
2. **Family Members**: Users linked to a family plan with access to protection features
3. **Premium Users**: Individual or family plan subscribers with full feature access
4. **Superadmins**: Platform administrators (`info@manoprotect.com`, `rrhh.milchollos@gmail.com`)

## Core Requirements

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (user, family_admin, superadmin)
- Automatic superadmin initialization on server startup
- Account locking after failed attempts with auto-unlock for superadmins

### Subscription System
- Free tier with basic features
- Premium plans (individual, family, enterprise)
- 7-day free trial with card verification (0€ charge)
- Stripe webhooks for subscription lifecycle management
- Automated email notifications for trial events

### Family Features
- Family member invitation system with unique links
- Device linking for family members
- Family-wide SOS emergency alerts
- Location tracking for family members

### Multi-Language Support (i18n)
- 9 languages: Spanish, English, French, German, Italian, Portuguese, Chinese, Russian, Arabic
- Language detection based on user location (ip-api.com)
- Language switcher in header
- Landing page fully internationalized

---

## Completed Work

### December 2025 - Session 1
- ✅ Fixed family invitation flow (end-to-end)
- ✅ Implemented multi-language support (i18n) with 9 languages
- ✅ Implemented Stripe 7-day trial with webhooks
- ✅ Fixed SOS premium plan access for all user types
- ✅ Implemented automatic superadmin initialization
- ✅ Generated Google Ads images

### December 2025 - Session 2
- ✅ **Fixed deployment blocker**: Removed hardcoded Firebase credentials path from `firebase_fraud_service.py`
- ✅ **Fixed deployment blocker**: Removed `*.env` entries from `.gitignore`
- ✅ **Deployment verified**: Application ready for production (deployment_agent passed)

---

## Architecture

### Backend (FastAPI)
```
/app/backend/
├── server.py                    # Main server with startup events (superadmin init)
├── routes/
│   ├── family_sos_routes.py     # Family and SOS features
│   ├── payments_routes.py       # Stripe subscriptions and webhooks
│   └── ...
├── services/
│   ├── firebase_fraud_service.py # Fraud detection (env vars only)
│   ├── email_service.py         # SendGrid notifications
│   └── security_service.py      # Password hashing (bcrypt)
└── tests/
    └── test_trial_subscription.py
```

### Frontend (React)
```
/app/frontend/src/
├── components/
│   ├── LanguageSelector.js      # 9-language switcher
│   └── ui/                      # Shadcn components
├── i18n/
│   ├── I18nContext.js           # i18n provider
│   └── locales/                 # Translation files (9 languages)
└── pages/
    ├── LandingPage.js           # Internationalized
    ├── Pricing.js               # Trial UI
    └── VincularDispositivo.js   # Device linking
```

---

## Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-trial-subscription` | POST | Create Stripe trial session |
| `/api/webhook/stripe` | POST | Handle Stripe webhooks |
| `/api/sos/premium/trigger` | POST | Trigger emergency SOS |
| `/api/family/invite/{memberId}` | GET | Get family invitation info |
| `/api/family/link-device/{memberId}` | POST | Link device to family member |

---

## Third-Party Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| Stripe | Payments & subscriptions | ✅ Active |
| SendGrid | Transactional emails | ✅ Active |
| OpenAI GPT-4o | AI threat analysis | ✅ Active |
| Firebase | Fraud detection database | ✅ Env vars configured |
| ip-api.com | Geolocation for i18n | ✅ Active |
| Twilio | SMS verification | ✅ Configured |

---

## Credentials

### Superadmin Accounts
- `info@manoprotect.com` / `19862210Des`
- `rrhh.milchollos@gmail.com` / `19862210Des`

### Stripe Webhook Secret
- `whsec_yRRSDLvaShBkM8SPwpZA8hQN2jNDBCyW`

---

## Prioritized Backlog

### P0 - Critical (Done)
- ✅ Fix deployment blockers (Firebase credentials, .gitignore)

### P1 - High Priority
- [ ] Translate entire application (Dashboard.js, Pricing.js, Profile.js, etc.)
- [ ] Full audit of MongoDB `_id` serialization

### P2 - Medium Priority
- [ ] Publish mobile app to Google Play and App Store
- [ ] Complete ManoBank integration
- [ ] Refactor large files (family_sos_routes.py, ChildTracking.js)

### P3 - Low Priority
- [ ] Database query optimization
- [ ] Performance audit

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| PostHog `DataCloneError` | Low | Platform issue (not app bug) |
| Large file sizes | Low | Refactoring needed |

---

## Testing

### Test Files
- `/app/backend/tests/test_trial_subscription.py`
- `/app/test_reports/iteration_25.json`

### Test Credentials
- Superadmin: `info@manoprotect.com` / `19862210Des`
