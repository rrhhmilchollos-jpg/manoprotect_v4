# ManoProtect - Product Requirements Document

## Project Overview
ManoProtect is a revolutionary cybersecurity platform for both consumers (B2C) and businesses (B2B). The core philosophy is to build extreme trust by protecting users without being invasive.

**Website**: https://www.manoprotect.com
**Preview URL**: https://manoprotect-shield.preview.emergentagent.com

## Implemented Features

### Core - Real-Time Threat Intelligence (COMPLETED - Feb 11, 2026)
**Status: PRODUCTION READY - 100% REAL APIs**

#### Backend APIs:
- `POST /api/realtime/check/url` - URL verification against LIVE threat databases
- `POST /api/realtime/check/phone` - Phone number verification with community DB
- `POST /api/realtime/check/email` - Email verification with impersonation detection
- `POST /api/realtime/check/ip` - IP address verification
- `POST /api/realtime/report` - Report scam (persists in MongoDB)
- `GET /api/realtime/trending` - Get trending scams
- `GET /api/realtime/status` - API status check
- `POST /api/realtime/check/bulk` - Bulk URL checking (for Chrome Extension)

#### Live API Integrations:
1. **Google Safe Browsing API** - URL malware/phishing detection
2. **VirusTotal API** - 90+ security engine scanning
3. **AbuseIPDB API** - IP abuse reports from global community
4. **AlienVault OTX API** - Open threat intelligence
5. **ManoProtect Community** - MongoDB persistent database

#### Key Files:
- `/app/backend/services/threat_intelligence.py` - API integration services
- `/app/backend/routes/realtime_scam.py` - API endpoints
- `/app/frontend/src/pages/VerificarEstafa.js` - Verification UI

### B2C Features:
- Universal Verifier (URL, Phone, Email, IP) - COMPLETED
- Community reporting system - COMPLETED
- Trending scams - COMPLETED
- Pattern-based threat detection - COMPLETED

### B2B Features:
- Enterprise Landing Page - COMPLETED
- Trust Seal concept - UI ONLY
- Bulk URL checking API - COMPLETED

### TWA Android App:
- Project structure ready at `/app/manoprotect-twa`
- versionCode: 5, targetSdk: 35
- Ready for AAB compilation

## Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: MongoDB (persistent)
- **Mobile**: Android TWA
- **APIs**: Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX

## Database Schema (MongoDB)
```
scam_reports:
  - scam_type: string
  - contact_info: string (normalized)
  - description: string
  - evidence: string (optional)
  - amount_lost: number (optional)
  - reporter_email: string (optional)
  - report_count: number
  - reports: array of individual reports
  - created_at: datetime
  - verified: boolean
  - type: "phone" | "email" | "url"

verification_logs:
  - type: string
  - value: string
  - risk_score: number
  - is_safe: boolean
  - checked_at: datetime

dna_digital:
  - phone: string (optional)
  - email: string (optional)
  - owner_name: string
  - status: "verified" | "pending"
```

## Environment Variables (Backend)
```
MONGO_URL=mongodb://...
DB_NAME=manoprotect
GOOGLE_SAFE_BROWSING_API_KEY=AIza...
VIRUSTOTAL_API_KEY=...
ABUSEIPDB_API_KEY=...
ALIENVAULT_OTX_KEY=...
```

## Testing
- Test report: `/app/test_reports/iteration_34.json`
- Backend: 90% pass rate
- Frontend: 100% pass rate
- All APIs confirmed LIVE (no mocks)

## Backlog

### P1 - High Priority
1. Publish AAB to Google Play Store (blocked on user action)
2. AI Voice Shield implementation
3. Smart Family Locator with behavioral zones
4. Anti-Deepfake Shield

### P2 - Medium Priority
5. Chrome Extension development
6. WhatsApp Business API integration
7. Secure Digital Legacy vault
8. Silent Panic Mode

### P3 - Future
9. Phishing Simulation for enterprises
10. Blockchain Transaction Verifier
11. DNA Digital identity system
12. Community Alert Network expansion

## Changelog

### Feb 11, 2026
- Integrated REAL threat intelligence APIs (Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX)
- Replaced mock database with MongoDB persistent storage
- Updated frontend to show "APIs de Seguridad EN VIVO"
- Added URL verification alongside phone and email
- Implemented smart whitelist for known safe domains
- Fixed false positive issues with AlienVault OTX
- Added risk score visualization with progress bar
- Testing completed with 90%+ pass rate
