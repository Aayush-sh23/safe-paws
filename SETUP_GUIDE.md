# 🚀 Safe Paws - Complete Setup Guide

This guide will walk you through setting up Safe Paws from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] A Supabase account (free)
- [ ] A SendGrid account (free) OR Gmail with App Password
- [ ] A Railway account (optional, for deployment)

---

## Step 1: Get Your API Keys

### 1.1 Supabase Setup (Database)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Fill in:
   - Project name: `safe-paws`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait 2-3 minutes for project creation
5. Go to **Settings → API**
6. Copy these three values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 1.2 SendGrid Setup (Email OTP)

**Option A: SendGrid (Recommended)**

1. Go to [sendgrid.com](https://sendgrid.com) and sign up
2. Verify your email
3. Go to **Settings → API Keys**
4. Click **"Create API Key"**
5. Name it `safe-paws` and select **Full Access**
6. Copy the key (starts with `SG.`)
7. **Important**: Go to **Settings → Sender Authentication**
8. Click **"Verify a Single Sender"**
9. Fill in your email (this will be the "from" address)
10. Check your email and verify

**Option B: Gmail SMTP**

1. Enable 2-Factor Authentication on your Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail"
4. Copy the 16-character password

---

## Step 2: Database Setup

### 2.1 Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content from `database/schema.sql` in this repo
4. Paste it into the SQL editor
5. Click **"Run"**
6. You should see: "Success. No rows returned"

### 2.2 Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - users
   - otp_logs
   - incidents
   - hotspots
   - actions
   - audit_logs

---

## Step 3: Local Development Setup

### 3.1 Clone and Install

```bash
# Clone the repository
git clone https://github.com/Aayush-sh23/safe-paws.git
cd safe-paws

# Install dependencies
npm install
```

### 3.2 Configure Environment

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Email Configuration - Choose ONE option below

# Option A: SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Option B: Gmail SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_16_char_app_password

# Application Settings
PORT=3000
NODE_ENV=development

# Hotspot Configuration (optional - these are defaults)
HOTSPOT_RADIUS_METERS=500
HOTSPOT_MIN_INCIDENTS=3
HOTSPOT_TIME_WINDOW_DAYS=7
```

### 3.3 Start the Server

```bash
npm start
```

You should see:
```
🐾 Safe Paws server running on port 3000
📡 WebSocket server ready
```

### 3.4 Test the Application

Open your browser:

- **Resident App**: http://localhost:3000
- **Authority Dashboard**: http://localhost:3000/dashboard.html

---

## Step 4: Test the Complete Flow

### 4.1 Test Resident Flow

1. Open http://localhost:3000
2. Enter your email
3. Click "Send OTP"
4. Check your email for the 6-digit code
5. Enter the OTP
6. You should see the incident reporting form
7. Allow location access when prompted
8. Fill in:
   - Incident Type: "Chasing"
   - Severity: "Medium"
   - Description: "Test incident"
9. Click "Submit Report"
10. You should see a success message

### 4.2 Test Authority Dashboard

1. Open http://localhost:3000/dashboard.html
2. Enter your email
3. Select Role: "Municipal Authority"
4. Click "Send OTP"
5. Enter the OTP from your email
6. You should see the dashboard with:
   - Statistics cards
   - Charts
   - Hotspots table
   - Recent incidents

### 4.3 Test Real-time Updates

1. Keep the dashboard open
2. In another tab, submit a new incident as a resident
3. Watch the dashboard update automatically (WebSocket)
4. Statistics should increment
5. New incident should appear in "Recent Incidents"

---

## Step 5: Deploy to Railway

### 5.1 Install Railway CLI

```bash
npm install -g @railway/cli
```

### 5.2 Login to Railway

```bash
railway login
```

This will open your browser for authentication.

### 5.3 Initialize Project

```bash
railway init
```

- Select: "Create new project"
- Name it: `safe-paws`

### 5.4 Add Environment Variables

```bash
railway variables set SUPABASE_URL=https://xxxxx.supabase.co
railway variables set SUPABASE_SERVICE_KEY=your_service_key
railway variables set SUPABASE_ANON_KEY=your_anon_key
railway variables set SENDGRID_API_KEY=SG.your_key
railway variables set SENDGRID_FROM_EMAIL=noreply@yourdomain.com
railway variables set NODE_ENV=production
```

Or add them in the Railway dashboard:
1. Go to your project on railway.app
2. Click on your service
3. Go to "Variables" tab
4. Add all environment variables

### 5.5 Deploy

```bash
railway up
```

Wait 2-3 minutes for deployment.

### 5.6 Get Your Live URL

```bash
railway domain
```

Or in the Railway dashboard:
1. Go to "Settings" tab
2. Click "Generate Domain"
3. Your app will be live at: `https://your-app.railway.app`

---

## Step 6: Post-Deployment Verification

### 6.1 Test Live Application

1. Visit your Railway URL
2. Test resident flow (OTP login + incident report)
3. Test authority dashboard
4. Verify real-time updates work

### 6.2 Check Logs

```bash
railway logs
```

Or in Railway dashboard → "Deployments" → Click latest deployment → "View Logs"

---

## 🎯 Common Issues & Solutions

### Issue: OTP emails not sending

**Solution:**
- Check SendGrid API key is correct
- Verify sender email in SendGrid
- Check spam folder
- Look at server logs: `railway logs`

### Issue: Database connection error

**Solution:**
- Verify Supabase URL and keys
- Check if database schema was run
- Ensure PostGIS extension is enabled

### Issue: Location not working

**Solution:**
- Use HTTPS (Railway provides this automatically)
- Allow location permissions in browser
- Test on mobile device

### Issue: WebSocket not connecting

**Solution:**
- Check if Railway domain supports WebSocket (it does)
- Verify no firewall blocking WebSocket
- Check browser console for errors

---

## 📊 Usage Tips

### For Municipalities

1. **Create Authority Accounts**: Use official email addresses
2. **Set Hotspot Parameters**: Adjust in `.env` based on your city size
3. **Train Staff**: Show them the dashboard and action recording
4. **Monitor Trends**: Check analytics weekly

### For NGOs

1. **Coordinate with Authorities**: Share dashboard access
2. **Track Actions**: Record all interventions
3. **Measure Impact**: Use post-action incident tracking
4. **Generate Reports**: Export data for funding proposals

### For Residents

1. **Report Accurately**: Choose correct incident type and severity
2. **Add Details**: Description helps authorities understand context
3. **Enable Location**: Ensures accurate hotspot detection
4. **Follow Up**: Check if action was taken in your area

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** to Git
2. **Use strong Supabase passwords**
3. **Rotate API keys** every 6 months
4. **Monitor audit logs** regularly
5. **Limit authority access** to trusted users

---

## 📈 Scaling Considerations

### For Small Cities (< 100k population)
- Default settings work fine
- Free tier Supabase sufficient
- Railway free tier adequate

### For Medium Cities (100k - 500k)
- Increase `HOTSPOT_RADIUS_METERS` to 1000
- Upgrade Supabase to Pro ($25/month)
- Railway Pro plan ($20/month)

### For Large Cities (> 500k)
- Consider dedicated PostgreSQL server
- Implement caching (Redis)
- Use CDN for static assets
- Add load balancer

---

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/Aayush-sh23/safe-paws/issues)
- **Documentation**: Check README.md
- **Email**: Contact repository owner

---

## ✅ Setup Complete!

You now have a fully functional Safe Paws system running!

**Next Steps:**
1. Customize branding (logo, colors)
2. Add your municipality/NGO name
3. Train your team
4. Start collecting data
5. Make data-driven decisions

**Remember**: This system is about balancing human safety and animal welfare through evidence-based action, not emotional reactions.

🐾 **Happy tracking!**