# 🚀 Safe Paws - Production Deployment Guide

This guide covers deploying Safe Paws to production on Railway with all necessary configurations.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] Supabase project created
- [x] Database schema executed
- [x] SendGrid API key (or SMTP credentials)
- [x] Railway account created
- [x] All environment variables ready
- [x] Tested locally

## 🎯 Deployment Steps

### Step 1: Prepare Your Repository

```bash
# Clone the repository
git clone https://github.com/Aayush-sh23/safe-paws.git
cd safe-paws

# Verify all files are present
ls -la
```

### Step 2: Install Railway CLI

```bash
# Install globally
npm install -g @railway/cli

# Verify installation
railway --version
```

### Step 3: Login to Railway

```bash
# Login (opens browser)
railway login

# Verify login
railway whoami
```

### Step 4: Initialize Railway Project

```bash
# Initialize new project
railway init

# Select: "Create new project"
# Name: safe-paws
```

### Step 5: Configure Environment Variables

#### Option A: Using Railway CLI

```bash
# Supabase
railway variables set SUPABASE_URL="https://xxxxx.supabase.co"
railway variables set SUPABASE_SERVICE_KEY="your_service_role_key"
railway variables set SUPABASE_ANON_KEY="your_anon_key"

# SendGrid
railway variables set SENDGRID_API_KEY="SG.xxxxx"
railway variables set SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Application
railway variables set NODE_ENV="production"
railway variables set PORT="3000"

# Hotspot Configuration
railway variables set HOTSPOT_RADIUS_METERS="500"
railway variables set HOTSPOT_MIN_INCIDENTS="3"
railway variables set HOTSPOT_TIME_WINDOW_DAYS="7"
```

#### Option B: Using Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Select your project
3. Click on your service
4. Go to "Variables" tab
5. Click "New Variable"
6. Add each variable:

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY = your_service_role_key
SUPABASE_ANON_KEY = your_anon_key
SENDGRID_API_KEY = SG.xxxxx
SENDGRID_FROM_EMAIL = noreply@yourdomain.com
NODE_ENV = production
PORT = 3000
HOTSPOT_RADIUS_METERS = 500
HOTSPOT_MIN_INCIDENTS = 3
HOTSPOT_TIME_WINDOW_DAYS = 7
```

### Step 6: Deploy to Railway

```bash
# Deploy
railway up

# This will:
# 1. Upload your code
# 2. Install dependencies
# 3. Start the server
# 4. Assign a public URL
```

Wait 2-3 minutes for deployment to complete.

### Step 7: Generate Public Domain

```bash
# Generate domain
railway domain

# Or in dashboard:
# Settings → Networking → Generate Domain
```

Your app will be available at: `https://safe-paws-production.up.railway.app`

### Step 8: Verify Deployment

#### Check Deployment Status

```bash
# View logs
railway logs

# Check status
railway status
```

#### Test Endpoints

```bash
# Health check
curl https://your-app.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2026-01-13T..."}
```

#### Test Web Interface

1. Open `https://your-app.railway.app`
2. Try OTP login
3. Submit a test incident
4. Open `https://your-app.railway.app/dashboard.html`
5. Login as authority
6. Verify real-time updates work

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. In Railway dashboard → Settings → Networking
2. Click "Custom Domain"
3. Enter your domain: `safepaws.yourdomain.com`
4. Add CNAME record in your DNS:
   ```
   CNAME safepaws -> your-app.railway.app
   ```
5. Wait for DNS propagation (5-30 minutes)

### SSL Certificate

Railway automatically provides SSL certificates for:
- Railway domains (*.railway.app)
- Custom domains (via Let's Encrypt)

No additional configuration needed!

### Environment-Specific Settings

#### Production Settings

```env
NODE_ENV=production
PORT=3000
```

#### Staging Settings (if needed)

```env
NODE_ENV=staging
PORT=3000
```

## 📊 Monitoring & Maintenance

### View Logs

```bash
# Real-time logs
railway logs --follow

# Last 100 lines
railway logs --tail 100

# Filter by level
railway logs | grep ERROR
```

### Check Metrics

In Railway dashboard:
1. Go to your service
2. Click "Metrics" tab
3. View:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### Database Monitoring

In Supabase dashboard:
1. Go to "Database" → "Usage"
2. Monitor:
   - Database size
   - Active connections
   - Query performance

### Set Up Alerts

#### Railway Alerts

1. Go to project settings
2. Enable notifications for:
   - Deployment failures
   - High resource usage
   - Service downtime

#### Supabase Alerts

1. Go to project settings
2. Enable alerts for:
   - Database size > 80%
   - High query latency
   - Connection pool exhaustion

## 🔄 Updates & Rollbacks

### Deploy Updates

```bash
# Make changes to code
git add .
git commit -m "Update: description"
git push

# Deploy to Railway
railway up
```

### Rollback to Previous Version

```bash
# View deployments
railway deployments

# Rollback to specific deployment
railway rollback <deployment-id>
```

Or in dashboard:
1. Go to "Deployments"
2. Find previous working deployment
3. Click "Redeploy"

## 🔒 Security Hardening

### Environment Variables

✅ **DO:**
- Store all secrets in Railway variables
- Use different keys for staging/production
- Rotate keys every 6 months

❌ **DON'T:**
- Commit `.env` file to Git
- Share keys in chat/email
- Use same keys across environments

### Database Security

1. **Enable Row Level Security (RLS)** in Supabase:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
-- etc for all tables
```

2. **Create policies** for each table

3. **Use service role key** only on server

### API Security

Already implemented:
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation

Additional recommendations:
- [ ] Add API key authentication for external integrations
- [ ] Implement request signing
- [ ] Add IP whitelisting for admin endpoints

## 📈 Scaling

### Current Capacity

With Railway free tier:
- **Requests**: ~10,000/day
- **Concurrent users**: ~500
- **Database**: 500MB
- **Bandwidth**: 100GB/month

### When to Scale

Scale up when you see:
- Response time > 1 second
- CPU usage > 80%
- Memory usage > 80%
- Database size > 400MB

### Scaling Options

#### Railway Pro Plan ($20/month)

- More CPU/memory
- Higher bandwidth
- Priority support
- Custom domains

#### Supabase Pro Plan ($25/month)

- 8GB database
- 250GB bandwidth
- Daily backups
- Point-in-time recovery

#### Horizontal Scaling

1. Deploy multiple instances
2. Use Railway's load balancer
3. Enable sticky sessions for WebSocket

## 🐛 Troubleshooting

### Deployment Fails

**Error: "Build failed"**
```bash
# Check logs
railway logs

# Common fixes:
# 1. Verify package.json is correct
# 2. Check Node version compatibility
# 3. Ensure all dependencies are listed
```

**Error: "Port already in use"**
```bash
# Railway assigns PORT automatically
# Make sure your code uses process.env.PORT
```

### Application Errors

**Error: "Database connection failed"**
```bash
# Verify environment variables
railway variables

# Check Supabase status
# Visit status.supabase.com
```

**Error: "OTP emails not sending"**
```bash
# Check SendGrid API key
railway variables | grep SENDGRID

# Verify sender email is verified in SendGrid
# Check SendGrid activity logs
```

### Performance Issues

**Slow response times**
```bash
# Check Railway metrics
# Look for CPU/memory spikes

# Optimize database queries
# Add indexes if needed

# Enable caching
# Consider Redis for session storage
```

## 📱 Mobile App Deployment (Future)

When mobile apps are ready:

### iOS App Store
1. Build with Xcode
2. Submit to App Store Connect
3. Wait for review (1-3 days)

### Google Play Store
1. Build with Android Studio
2. Upload to Play Console
3. Wait for review (few hours)

### API Endpoint
Update mobile apps to use:
```
https://your-app.railway.app/api
```

## 🌍 Multi-Region Deployment (Advanced)

For global deployment:

1. **Deploy to multiple regions**:
   - US: Railway US region
   - EU: Railway EU region
   - Asia: Railway Asia region

2. **Use geo-routing**:
   - Cloudflare for DNS
   - Route users to nearest region

3. **Database replication**:
   - Supabase read replicas
   - Sync data across regions

## 📞 Support

### Getting Help

1. **Check logs first**:
```bash
railway logs --tail 200
```

2. **Search existing issues**:
   - [GitHub Issues](https://github.com/Aayush-sh23/safe-paws/issues)

3. **Create new issue**:
   - Include logs
   - Describe steps to reproduce
   - Mention environment (Railway, Supabase versions)

### Emergency Contacts

- **Railway Support**: support@railway.app
- **Supabase Support**: support@supabase.io
- **SendGrid Support**: support@sendgrid.com

## ✅ Deployment Checklist

Before going live:

- [ ] Database schema executed
- [ ] All environment variables set
- [ ] OTP emails working
- [ ] Test incident submission
- [ ] Test dashboard access
- [ ] WebSocket real-time updates working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Team trained on system
- [ ] Documentation shared with stakeholders

## 🎉 You're Live!

Congratulations! Safe Paws is now deployed and ready to help your community.

**Next Steps:**
1. Share URLs with your team
2. Train municipal staff
3. Onboard NGO partners
4. Start collecting data
5. Make data-driven decisions

---

**Need help?** Open an issue or contact the maintainers.

**Deployment successful?** Star the repo and share with other municipalities! ⭐