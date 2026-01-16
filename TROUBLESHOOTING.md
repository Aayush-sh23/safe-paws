# 🔧 Safe Paws - Troubleshooting Guide

## Quick Fixes for Common Issues

---

## 🚨 **ISSUE: "Not Working Fine"**

### **Step 1: Check What's Not Working**

Open your browser console (Press `F12`) and check for errors:

#### **Common Error Messages:**

1. **"Failed to fetch"** or **"Network Error"**
   - ✅ Server is not running
   - ✅ Wrong port number
   - ✅ Firewall blocking connection

2. **"Cannot read property of undefined"**
   - ✅ Missing environment variables
   - ✅ Database connection failed
   - ✅ API response format changed

3. **"Geolocation not available"**
   - ✅ Location permissions denied
   - ✅ HTTPS required for geolocation
   - ✅ Browser doesn't support geolocation

4. **Map not showing**
   - ✅ Leaflet CSS not loaded
   - ✅ Internet connection required for tiles
   - ✅ Container height not set

---

## 🔍 **STEP-BY-STEP DEBUGGING**

### **1. Verify Server is Running**

```bash
# Navigate to project directory
cd C:\Users\Lenovo\Downloads\safe-paws-main\safe-paws-main

# Check if server is running
# You should see: "🐾 Safe Paws server running on port 3000"
```

**If server is NOT running:**
```bash
npm start
```

**Expected output:**
```
🐾 Safe Paws server running on port 3000
📡 WebSocket server ready
✅ Email server is ready to send messages
```

---

### **2. Check Environment Variables**

Create/verify `.env` file in project root:

```env
# Database (Supabase)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_verified_email@example.com

# Server
PORT=3000
NODE_ENV=development
```

**Test if variables are loaded:**
```bash
node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL ? '✅ Env loaded' : '❌ Env missing')"
```

---

### **3. Test Database Connection**

Create a test file `test-db.js`:

```javascript
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

Run it:
```bash
node test-db.js
```

---

### **4. Test Email Sending**

Create `test-email.js`:

```javascript
require('dotenv').config();
const { sendOTP } = require('./config/email');

async function testEmail() {
  try {
    await sendOTP('your-test-email@example.com', '123456');
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testEmail();
```

Run it:
```bash
node test-email.js
```

---

### **5. Check Browser Console**

1. Open your app: http://localhost:3000
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for errors (red text)

**Common console errors and fixes:**

| Error | Fix |
|-------|-----|
| `Uncaught ReferenceError: L is not defined` | Leaflet not loaded - check internet connection |
| `Failed to execute 'getCurrentPosition'` | Allow location permissions in browser |
| `WebSocket connection failed` | Server not running or wrong port |
| `404 Not Found` | Check file paths in HTML |

---

## 🗺️ **MAP NOT SHOWING?**

### **Checklist:**

✅ **Internet connection active** (map tiles load from internet)  
✅ **Leaflet CSS loaded** (check Network tab in F12)  
✅ **Container has height** (check in Elements tab)  
✅ **JavaScript has no errors** (check Console tab)  

### **Quick Fix:**

Add this to your HTML `<head>`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
      crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
```

### **Test Map Manually:**

Open browser console and run:
```javascript
// Test if Leaflet is loaded
console.log(typeof L !== 'undefined' ? '✅ Leaflet loaded' : '❌ Leaflet missing');

// Test map initialization
const testMap = L.map('map').setView([28.6139, 77.2090], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(testMap);
```

---

## 📧 **OTP NOT ARRIVING?**

### **Checklist:**

1. **Check spam/junk folder**
2. **Verify SendGrid API key is valid**
3. **Confirm sender email is verified in SendGrid**
4. **Check server console for OTP** (it's logged there too)

### **Quick Test:**

Look at server console when you request OTP. You should see:
```
✅ OTP sent to user@example.com (Message ID: <...>)
```

Or if email fails:
```
📧 FALLBACK: OTP for user@example.com: 123456
⏰ Expires: 1/14/2026, 3:45:00 PM
```

### **SendGrid Troubleshooting:**

1. **Login to SendGrid Dashboard**
2. Go to **Activity** → **Email Activity**
3. Search for recipient email
4. Check delivery status

**Common SendGrid issues:**
- ❌ API key expired → Generate new key
- ❌ Sender not verified → Verify sender email
- ❌ Daily limit reached → Upgrade plan or wait 24h
- ❌ Recipient blocked → Check suppression list

---

## 🔐 **LOGIN NOT WORKING?**

### **Symptoms & Fixes:**

#### **"Invalid OTP" error**
- ✅ OTP expired (10 min limit)
- ✅ Typo in OTP
- ✅ OTP already used
- ✅ Database connection issue

**Fix:** Request new OTP

#### **"Failed to send OTP"**
- ✅ Email configuration wrong
- ✅ Network issue
- ✅ SendGrid API key invalid

**Fix:** Check `.env` file and SendGrid dashboard

#### **OTP sent but can't verify**
- ✅ Database not storing OTP
- ✅ Timestamp mismatch
- ✅ Wrong email format

**Fix:** Check database `otp_verifications` table

---

## 🎨 **UI LOOKS BROKEN?**

### **Quick Fixes:**

1. **Hard refresh:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear cache:** `Ctrl + Shift + Delete`
3. **Try incognito mode:** `Ctrl + Shift + N`
4. **Check CSS loaded:** F12 → Network tab → Filter by CSS

### **CSS Not Loading?**

Check file path in HTML:
```html
<!-- Should be: -->
<link rel="stylesheet" href="/css/styles.css">

<!-- NOT: -->
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="./css/styles.css">
```

---

## 📱 **MOBILE ISSUES?**

### **Location not working on mobile:**

1. **Use HTTPS** (required for geolocation on mobile)
2. **Allow location permissions** in browser settings
3. **Enable location services** in phone settings

### **UI too small/large:**

Check viewport meta tag in HTML:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 🔄 **WEBSOCKET ISSUES?**

### **Symptoms:**
- Real-time updates not working
- "WebSocket connection failed" in console

### **Fixes:**

1. **Check server is running**
2. **Verify port is correct**
3. **Check firewall settings**

**Test WebSocket manually:**
```javascript
// Open browser console and run:
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('✅ WebSocket connected');
ws.onerror = (e) => console.error('❌ WebSocket error:', e);
```

---

## 🗄️ **DATABASE ISSUES?**

### **Tables not found:**

Run this SQL in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Expected tables:**
- users
- incidents
- hotspots
- actions
- otp_verifications

### **Missing tables?**

Re-run the setup SQL from `SETUP_GUIDE.md`

---

## 🚀 **PERFORMANCE ISSUES?**

### **Slow loading:**

1. **Check internet speed**
2. **Reduce map zoom level**
3. **Limit number of markers**
4. **Enable browser caching**

### **High memory usage:**

1. **Close unused tabs**
2. **Restart browser**
3. **Clear browser cache**
4. **Update browser to latest version**

---

## 🔧 **COMPLETE RESET**

If nothing works, try a complete reset:

```bash
# 1. Stop server (Ctrl + C)

# 2. Delete node_modules
rm -rf node_modules

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall dependencies
npm install

# 5. Restart server
npm start

# 6. Clear browser cache (Ctrl + Shift + Delete)

# 7. Hard refresh page (Ctrl + Shift + R)
```

---

## 📞 **STILL NOT WORKING?**

### **Collect Debug Information:**

1. **Server console output** (copy all text)
2. **Browser console errors** (F12 → Console → screenshot)
3. **Network tab** (F12 → Network → screenshot failed requests)
4. **Environment variables** (hide sensitive data)
5. **Node version:** `node --version`
6. **NPM version:** `npm --version`

### **Create GitHub Issue:**

Go to: https://github.com/Aayush-sh23/safe-paws/issues/new

Include:
- What you tried to do
- What happened instead
- Error messages
- Screenshots
- Debug information above

---

## ✅ **VERIFICATION CHECKLIST**

Use this to verify everything is working:

### **Server:**
- [ ] Server starts without errors
- [ ] Port 3000 is accessible
- [ ] Environment variables loaded
- [ ] Database connection successful
- [ ] Email configuration valid

### **Resident App:**
- [ ] Page loads with gradient background
- [ ] OTP request form works
- [ ] Email arrives within 5 seconds
- [ ] OTP timer counts down
- [ ] OTP verification works
- [ ] Location detected automatically
- [ ] Map shows with marker
- [ ] Marker is draggable
- [ ] Form submission works
- [ ] Success screen appears

### **Authority Dashboard:**
- [ ] Login with authority/NGO role works
- [ ] Dashboard loads with stats
- [ ] Hotspot map shows circles
- [ ] Charts render properly
- [ ] Tables display data
- [ ] Action modal opens
- [ ] Real-time updates work

---

## 🎯 **EXPECTED BEHAVIOR**

### **Resident App Flow:**
1. Open http://localhost:3000
2. See beautiful gradient background
3. Enter email → Click "Send OTP"
4. OTP arrives in < 5 seconds
5. Timer starts counting down from 10:00
6. Enter OTP → Click "Verify & Login"
7. Redirected to report screen
8. Location detected automatically
9. Map shows with draggable marker
10. Fill form → Submit
11. Success screen appears
12. Auto-redirect after 5 seconds

### **Authority Dashboard Flow:**
1. Open http://localhost:3000/dashboard.html
2. Login with authority/NGO email
3. See dashboard with 4 stat cards
4. Hotspot map shows colored circles
5. Charts display trends and types
6. Table lists all hotspots
7. Click "Take Action" → Modal opens
8. Submit action → Success toast
9. Real-time updates when new incidents arrive

---

## 📚 **ADDITIONAL RESOURCES**

- **Setup Guide:** `SETUP_GUIDE.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Updates Log:** `UPDATES.md`
- **GitHub Issues:** https://github.com/Aayush-sh23/safe-paws/issues

---

**Safe Paws v2.0** - If you're still stuck, create a GitHub issue with debug info! 🐾