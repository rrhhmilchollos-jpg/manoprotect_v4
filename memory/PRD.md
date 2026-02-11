# ManoProtect - Product Requirements Document

## Project Overview
ManoProtect is a revolutionary cybersecurity platform for both consumers (B2C) and businesses (B2B). The core philosophy is to build extreme trust by protecting users without being invasive.

**Website**: https://www.manoprotect.com
**Preview URL**: https://shield-audio-dev.preview.emergentagent.com

## Production Deployment Notes
To deploy to production with custom domain:
1. Click "Deploy" in Emergent platform
2. Select "Custom Domain" → www.manoprotect.com
3. Configure DNS: Add CNAME record pointing to Emergent URL
4. SSL is automatic

## Implemented Features

### Real-Time Threat Intelligence (COMPLETED)
**Status: PRODUCTION READY - 100% REAL APIs**

#### Backend APIs:
- `POST /api/realtime/check/url` - URL verification against LIVE threat databases
- `POST /api/realtime/check/phone` - Phone number verification
- `POST /api/realtime/check/email` - Email verification
- `POST /api/realtime/check/ip` - IP address verification
- `POST /api/realtime/report` - Report scam (persists in MongoDB)
- `GET /api/realtime/trending` - Get trending scams
- `GET /api/realtime/status` - API status check
- `GET /api/public/users-count` - Public user count
- `GET /api/public/active-users` - Public active users list

#### Live API Integrations:
1. **Google Safe Browsing API** - URL malware/phishing detection
2. **VirusTotal API** - 90+ security engine scanning
3. **AbuseIPDB API** - IP abuse reports
4. **AlienVault OTX API** - Open threat intelligence
5. **ManoProtect Community** - MongoDB persistent database

### Chrome Extension (COMPLETED - Feb 11, 2026)
Location: `/app/chrome-extension/`
Features:
- Real-time URL verification
- Context menu for checking links
- Visual notifications for threats
- Statistics tracking
- Suspicious link highlighting

Download: `/app/manoprotect-chrome-extension.zip`

### User Management
- Total REAL users: 5 (test users cleaned)
- Public API for user stats (privacy protected)
- Admin dashboard for user management

## Active Users (Production)
1. rrhh.milchollos@gmail.com - Ivan Rubio Cano (superadmin)
2. msolassanchis@gmail.com - Maria Deseada Solas Sanchis (superadmin)
3. ivanrubiosolas@gmail.com - Ivan Rubio cano (superadmin)
4. info@manoprotect.com - ManoProtect Admin (superadmin)
5. vguerolanavarro@gmail.com - Vicente (premium)

## Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: MongoDB (test_database)
- **Mobile**: Android TWA
- **Extension**: Chrome Extension (Manifest V3)
- **APIs**: Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX

## Database Schema (MongoDB)
```
users:
  - user_id: string
  - email: string
  - name: string
  - role: "user" | "premium" | "admin" | "superadmin"
  - plan: string
  - status: "active" | "inactive"
  - created_at: datetime

scam_reports:
  - scam_type: string
  - contact_info: string
  - description: string
  - report_count: number
  - created_at: datetime

verification_logs:
  - type: "url" | "phone" | "email" | "ip"
  - value: string
  - risk_score: number
  - is_safe: boolean
  - checked_at: datetime
```

## Environment Variables (Backend)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
GOOGLE_SAFE_BROWSING_API_KEY=...
VIRUSTOTAL_API_KEY=...
ABUSEIPDB_API_KEY=...
ALIENVAULT_OTX_KEY=...
```

## Changelog

### Feb 11, 2026
- Created Chrome Extension with full functionality
- Cleaned ALL test users from database (28 → 5)
- Added public API endpoints for user stats
- Updated threat intelligence to handle whitelisted domains
- Fixed false positives for known safe sites

### Previous
- Integrated REAL threat intelligence APIs
- Replaced mock database with MongoDB persistent storage
- Updated frontend to show "APIs de Seguridad EN VIVO"

## Backlog

### P1 - High Priority
1. ~~Chrome Extension~~ ✅ DONE
2. AI Voice Shield implementation
3. Smart Family Locator with behavioral zones
4. Anti-Deepfake Shield

### P2 - Medium Priority
5. WhatsApp Business API integration
6. Secure Digital Legacy vault
7. Silent Panic Mode

### P3 - Future
8. Phishing Simulation for enterprises
9. Blockchain Transaction Verifier
10. DNA Digital identity system
