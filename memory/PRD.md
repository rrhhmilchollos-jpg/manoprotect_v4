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

### AI Voice Shield (COMPLETED - Feb 11, 2026)
**Status: PRODUCTION READY**

#### Backend APIs:
- `POST /api/voice-shield/analyze-transcript` - Analyze phone conversation for scam indicators
- `POST /api/voice-shield/real-time-alert` - Quick alert for live calls
- `GET /api/voice-shield/scam-phrases/{language}` - Get common scam phrases (es/en)
- `GET /api/voice-shield/stats` - Usage statistics

#### Features:
- Pattern detection for urgency, authority impersonation, financial pressure
- Emotional manipulation detection
- Personal info request detection
- Risk score 0-100 with CRITICAL/HIGH/MEDIUM/LOW levels
- Spanish and English support
- Integration with ManoProtect community database

#### Frontend:
- `/voice-shield` - Full UI for analyzing conversations
- Speech recognition for live transcription
- Visual risk score display
- Scam phrase education section

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

voice_analysis_logs:
  - transcript_length: number
  - caller_number: string
  - risk_score: number
  - risk_level: string
  - alerts_count: number
  - analyzed_at: datetime
```

## Environment Variables (Backend)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
GOOGLE_SAFE_BROWSING_API_KEY=...
VIRUSTOTAL_API_KEY=...
ABUSEIPDB_API_KEY=...
ALIENVAULT_OTX_KEY=...
EMERGENT_LLM_KEY=...
```

## Changelog

### Feb 11, 2026 (Latest)
- **AI Voice Shield** - COMPLETED
  - Created `/app/backend/routes/voice_shield.py` with full scam detection
  - Created `/app/frontend/src/pages/VoiceShield.js` with analysis UI
  - Added route in App.js for `/voice-shield` and `/escudo-voz`
  - Added AI Voice Shield section to landing page
  - Fixed MongoDB boolean check bug (db is not None)
  - Test results: 94% backend, 100% frontend passed

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

### P0 - Urgent (Pending User Input)
1. **Google Ads 24% Optimization Loss** - Need user's Google Ads report to diagnose
   - Placeholder IDs (XXXX) in public/index.html need real values
   - Performance optimization (LCP, CLS) pending

### P1 - High Priority
1. ~~Chrome Extension~~ ✅ DONE
2. ~~AI Voice Shield~~ ✅ DONE
3. Smart Family Locator with behavioral zones
4. Anti-Deepfake Shield
5. Admin Panel Frontend for user list

### P2 - Medium Priority
6. WhatsApp Business API integration
7. Secure Digital Legacy vault
8. Silent Panic Mode
9. Guide for Chrome Extension publication

### P3 - Future
10. Phishing Simulation for enterprises
11. Blockchain Transaction Verifier
12. DNA Digital identity system
