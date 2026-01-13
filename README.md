# 🐾 Safe Paws - Street Dog Incident Tracking System

**Data-driven street dog safety management for municipalities and animal welfare NGOs**

![Safe Paws](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-green)

## 🎯 Overview

Safe Paws is a real-time incident tracking system that converts scattered citizen complaints into actionable, location-based evidence. It helps authorities take humane, targeted action (vaccination, sterilization, monitoring) only where necessary, balancing human safety and animal welfare.

### What Makes This Different

❌ **Not** an anti-dog platform  
❌ **Not** a blind removal system  
❌ **Not** based on emotional complaints  

✅ **Data-backed** safety decisions  
✅ **Humane** and targeted interventions  
✅ **Balanced** approach to human safety and animal welfare  
✅ **Evidence-based** risk assessment  
✅ **Real-world** adoption ready  

## ✨ Key Features

### For Residents
- **Quick Incident Reporting**: Report dog-related incidents (barking, chasing, pack aggression, biting)
- **Automatic Location Capture**: GPS coordinates captured automatically
- **Email OTP Authentication**: Secure, password-free login
- **Media Upload**: Attach photos/videos to reports
- **Minimal Friction**: Mobile-first design for easy reporting

### For Authorities & NGOs
- **Real-time Dashboard**: Live hotspot maps and incident trends
- **Risk-based Prioritization**: Hotspots ranked by severity and frequency
- **Action Tracking**: Record interventions (vaccination, sterilization, etc.)
- **Effectiveness Measurement**: Track post-action incidents
- **Analytics**: Incident trends, heatmaps, and statistics

### Technical Highlights
- **Real-time Updates**: WebSocket-based live data refresh
- **Geo-location Queries**: PostGIS-powered spatial analysis
- **Hotspot Detection**: Automatic clustering of incidents
- **Role-based Access**: Resident, NGO, and Authority roles
- **OTP Authentication**: Email-based, no password storage
- **Audit Logging**: Complete action history

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- SendGrid account (free tier) or SMTP credentials
- Railway account (optional, for deployment)

### 1. Clone Repository

```bash
git clone https://github.com/Aayush-sh23/safe-paws.git
cd safe-paws
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the schema from `database/schema.sql`
4. Copy your project URL and API keys from Settings → API

### 4. Environment Configuration

Create `.env` file:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Or SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application
PORT=3000
NODE_ENV=production

# Hotspot Configuration
HOTSPOT_RADIUS_METERS=500
HOTSPOT_MIN_INCIDENTS=3
HOTSPOT_TIME_WINDOW_DAYS=7
```

### 5. Run Locally

```bash
npm start
```

Server runs on `http://localhost:3000`

- **Resident App**: `http://localhost:3000`
- **Authority Dashboard**: `http://localhost:3000/dashboard.html`

## 📦 Deployment

### Deploy to Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add environment variables in Railway dashboard

4. Deploy:
```bash
railway up
```

Your app will be live at: `https://your-app.railway.app`

## 📚 API Documentation

### Authentication

**Request OTP**
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "resident"
}
```

**Verify OTP**
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Incidents

**Submit Incident**
```http
POST /api/incidents
Content-Type: application/json

{
  "userId": "uuid",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "incidentType": "chasing",
  "severity": "medium",
  "description": "Pack of 3 dogs chasing pedestrians"
}
```

**Get Incidents**
```http
GET /api/incidents?severity=high&limit=50
```

**Get Nearby Incidents**
```http
POST /api/incidents/nearby
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "radiusMeters": 500
}
```

### Hotspots

**Get All Hotspots**
```http
GET /api/hotspots?status=active&minRiskScore=50
```

**Get Hotspot Details**
```http
GET /api/hotspots/:hotspotId
```

**Update Hotspot Status**
```http
PATCH /api/hotspots/:hotspotId
Content-Type: application/json

{
  "status": "action_taken"
}
```

### Actions

**Record Action**
```http
POST /api/actions
Content-Type: application/json

{
  "hotspotId": "uuid",
  "authorityId": "uuid",
  "actionType": "vaccination",
  "notes": "Vaccinated 5 dogs in the area"
}
```

### Analytics

**Dashboard Stats**
```http
GET /api/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31
```

**Incident Trends**
```http
GET /api/analytics/trends?days=30
```

**Heatmap Data**
```http
GET /api/analytics/heatmap?days=7
```

## 🗄️ Database Schema

### Tables

- **users**: User accounts with role-based access
- **otp_logs**: OTP verification records
- **incidents**: Reported dog incidents with geo-location
- **hotspots**: Clustered high-risk zones
- **actions**: Interventions taken by authorities
- **audit_logs**: System activity tracking

## 🔌 WebSocket Events

### Server → Client

**New Incident**
```json
{
  "type": "new_incident",
  "data": { ...incident }
}
```

**Hotspot Updated**
```json
{
  "type": "hotspot_updated",
  "data": { ...hotspot }
}
```

**Action Taken**
```json
{
  "type": "action_taken",
  "data": { ...action }
}
```

## ⚙️ Configuration

### Hotspot Parameters

Adjust in `.env`:

```env
HOTSPOT_RADIUS_METERS=500        # Clustering radius
HOTSPOT_MIN_INCIDENTS=3          # Minimum incidents for hotspot
HOTSPOT_TIME_WINDOW_DAYS=7       # Time window for analysis
```

### Risk Score Calculation

- **Severity**: High (10 pts), Medium (5 pts), Low (2 pts)
- **Type**: Bite (+15), Pack Aggression (+10), Chasing (+5)
- **Normalized**: 0-100 scale

## 🔒 Security Features

- ✅ Helmet.js for HTTP headers
- ✅ Rate limiting (100 req/15min)
- ✅ CORS enabled
- ✅ OTP expiry (10 minutes)
- ✅ Role-based access control
- ✅ Audit logging
- ✅ No password storage

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL with PostGIS (via Supabase)
- **Real-time**: WebSocket (ws library)
- **Email**: SendGrid / SMTP
- **Frontend**: Vanilla JavaScript
- **Charts**: Chart.js
- **Deployment**: Railway

## 📱 User Flows

### Resident Flow
1. Login with email OTP
2. Submit incident report (type, severity, description)
3. Location captured automatically
4. View recent reports
5. Receive real-time updates

### Authority Flow
1. Login with email OTP (authority/NGO role)
2. View dashboard with stats and charts
3. Monitor active hotspots
4. Record actions taken (vaccination, sterilization, etc.)
5. Track effectiveness over time

## 🗺️ Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] SMS OTP support
- [ ] Multi-language support
- [ ] Advanced ML-based risk prediction
- [ ] Integration with municipal systems
- [ ] Public awareness campaigns
- [ ] Volunteer coordination
- [ ] Donation management

## 🤝 Contributing

Contributions welcome! This is a humanitarian project aimed at improving both human safety and animal welfare.

## 📄 License

MIT License - Free for municipalities and NGOs

## 📞 Support

For deployment assistance or customization:
- **GitHub**: [Aayush-sh23/safe-paws](https://github.com/Aayush-sh23/safe-paws)
- **Issues**: [Report a bug](https://github.com/Aayush-sh23/safe-paws/issues)

---

**Built with ❤️ for safer communities and happier street dogs**

🐾 Safe Paws - Where data meets compassion