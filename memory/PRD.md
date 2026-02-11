# ManoProtect - Product Requirements Document

## Project Overview
ManoProtect is a revolutionary cybersecurity platform for both consumers (B2C) and businesses (B2B). The core philosophy is to build extreme trust by protecting users without being invasive.

**Website**: https://www.manoprotect.com
**Preview URL**: https://shield-audio-dev.preview.emergentagent.com

## Implemented Features

### 1. Real-Time Threat Intelligence (COMPLETED)
**Status: PRODUCTION READY - 100% REAL APIs**

#### Backend APIs:
- `POST /api/realtime/check/url` - URL verification against LIVE threat databases
- `POST /api/realtime/check/phone` - Phone number verification
- `POST /api/realtime/check/email` - Email verification
- `POST /api/realtime/check/ip` - IP address verification
- `POST /api/realtime/report` - Report scam (persists in MongoDB)

#### Live API Integrations:
1. **Google Safe Browsing API** - URL malware/phishing detection
2. **VirusTotal API** - 90+ security engine scanning
3. **AbuseIPDB API** - IP abuse reports
4. **AlienVault OTX API** - Open threat intelligence

### 2. AI Voice Shield (COMPLETED - Feb 11, 2026)
**Status: PRODUCTION READY**

#### Backend APIs:
- `POST /api/voice-shield/analyze-transcript` - Analyze phone conversations
- `POST /api/voice-shield/real-time-alert` - Quick alert for live calls
- `GET /api/voice-shield/scam-phrases/{language}` - Common scam phrases (es/en)
- `GET /api/voice-shield/stats` - Usage statistics

#### Frontend:
- `/voice-shield` - Full UI for analyzing conversations

### 3. Smart Family Locator (COMPLETED - Feb 11, 2026)
**Status: PRODUCTION READY**

#### Backend APIs:
- `GET /api/smart-locator/members` - Get family members with locations
- `POST /api/smart-locator/location/update` - Update member location
- `GET /api/smart-locator/zones` - Get safe zones
- `POST /api/smart-locator/zones` - Create safe zone
- `DELETE /api/smart-locator/zones/{zone_id}` - Delete zone
- `GET /api/smart-locator/alerts` - Get location alerts
- `POST /api/smart-locator/sos` - Trigger SOS alert
- `GET /api/smart-locator/history/{member_id}` - Location history

#### Features:
- Behavioral zones (safe, school, work, restricted)
- Zone entry/exit alerts
- SOS button with location
- Location history tracking
- Battery level monitoring
- Schedule-based zone activation

#### Frontend:
- `/smart-locator` - Interactive map, zones management, alerts

### 4. Chrome Extension (COMPLETED)
Location: `/app/chrome-extension/`
Download: `/app/manoprotect-chrome-extension.zip`

### 5. Google AdSense Integration (COMPLETED - Feb 11, 2026)
- `ads.txt` created at `/frontend/public/ads.txt`
- Publisher ID: pub-7713974112203810

### 6. Investor Downloads Portal (UPDATED - Feb 11, 2026)
- Contact Email: inversores@manoprotect.com
- Contact Phone: +34 601 510 950
- Documents: Business Plan, Financial Model, Pitch Deck, B2B Dossier

## Tech Stack
- **Frontend**: React.js with Tailwind CSS, Shadcn/UI
- **Backend**: Python FastAPI with Motor (async MongoDB)
- **Database**: MongoDB
- **Mobile**: Android TWA
- **Extension**: Chrome Extension (Manifest V3)
- **APIs**: Google Safe Browsing, VirusTotal, AbuseIPDB, AlienVault OTX

## Environment Variables
```
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
GOOGLE_SAFE_BROWSING_API_KEY=...
VIRUSTOTAL_API_KEY=...
ABUSEIPDB_API_KEY=...
ALIENVAULT_OTX_KEY=...

# Frontend (.env)
REACT_APP_BACKEND_URL=https://shield-audio-dev.preview.emergentagent.com
```

## Changelog

### Feb 11, 2026 (Session 2)
- **Google AdSense ads.txt** - Created with pub-7713974112203810
- **Smart Family Locator** - Complete backend + frontend
  - Behavioral zones with entry/exit alerts
  - SOS functionality
  - Location history
- **Investor Portal** - Updated contact info
  - Email: inversores@manoprotect.com
  - Phone: +34 601 510 950

### Feb 11, 2026 (Session 1)
- **AI Voice Shield** - COMPLETED
- **Chrome Extension** - COMPLETED
- **Database Cleanup** - Test users removed

## Backlog

### P1 - High Priority
1. ~~Chrome Extension~~ ✅ DONE
2. ~~AI Voice Shield~~ ✅ DONE
3. ~~Smart Family Locator~~ ✅ DONE
4. **Anti-Deepfake Shield** - Detect deepfakes in video/audio
5. **WhatsApp Business API** - Alert notifications

### P2 - Medium Priority
6. CRM interno para inversores (seguimiento de descargas)
7. Admin Panel mejorado
8. Chrome Extension publication guide

### P3 - Future
9. Secure Digital Legacy vault
10. Phishing Simulation for enterprises
11. DNA Digital identity system

## Active Users
1. rrhh.milchollos@gmail.com - Ivan Rubio Cano (superadmin)
2. msolassanchis@gmail.com - Maria Deseada Solas Sanchis (superadmin)
3. ivanrubiosolas@gmail.com - Ivan Rubio cano (superadmin)
4. info@manoprotect.com - ManoProtect Admin (superadmin)
5. vguerolanavarro@gmail.com - Vicente (premium)

## Key Endpoints Summary
| Feature | Endpoint | Status |
|---------|----------|--------|
| Scam Check | /api/realtime/check/* | ✅ LIVE |
| Voice Shield | /api/voice-shield/* | ✅ LIVE |
| Smart Locator | /api/smart-locator/* | ✅ LIVE |
| Family Admin | /api/family/* | ✅ LIVE |
| Investor Downloads | /api/investor/* | ✅ LIVE |
