// API Configuration
const API_URL = window.location.origin;
let currentUser = null;
let currentLocation = null;
let ws = null;
let map = null;
let marker = null;
let otpTimer = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  connectWebSocket();
});

// Check if user is already logged in
function checkAuth() {
  const user = localStorage.getItem('safePawsUser');
  if (user) {
    currentUser = JSON.parse(user);
    showScreen('reportScreen');
    document.getElementById('userEmail').textContent = currentUser.email;
    getLocation();
    loadRecentReports();
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('otpRequestForm').addEventListener('submit', requestOTP);
  document.getElementById('otpVerifyForm').addEventListener('submit', verifyOTP);
  document.getElementById('resendOtpBtn').addEventListener('click', resendOTP);
  document.getElementById('incidentForm').addEventListener('submit', submitIncident);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('reportAnotherBtn').addEventListener('click', () => {
    showScreen('reportScreen');
    document.getElementById('incidentForm').reset();
    getLocation();
  });
  document.getElementById('refreshLocation').addEventListener('click', getLocation);
}

// Request OTP
async function requestOTP(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const btn = document.getElementById('sendOtpBtn');
  
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending OTP...';

  try {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'resident' })
    });

    const data = await response.json();

    if (data.success) {
      showToast('✅ OTP sent! Check your email inbox (and spam folder)', 'success');
      document.getElementById('otpVerifySection').style.display = 'block';
      document.getElementById('otpEmailDisplay').textContent = email;
      document.getElementById('otpInput').focus();
      startOtpTimer();
      
      // Scroll to OTP section
      document.getElementById('otpVerifySection').scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(data.error || 'Failed to send OTP. Please try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Send OTP</span>';
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>Send OTP</span>';
  }
}

// Resend OTP
async function resendOTP() {
  const email = document.getElementById('emailInput').value;
  const btn = document.getElementById('resendOtpBtn');
  
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'resident' })
    });

    const data = await response.json();

    if (data.success) {
      showToast('✅ New OTP sent! Check your email', 'success');
      document.getElementById('otpInput').value = '';
      document.getElementById('otpInput').focus();
      startOtpTimer();
    } else {
      showToast(data.error || 'Failed to resend OTP', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Resend OTP';
  }
}

// Start OTP timer
function startOtpTimer() {
  if (otpTimer) clearInterval(otpTimer);
  
  let timeLeft = 600; // 10 minutes in seconds
  const timerDisplay = document.getElementById('otpTimer');
  
  otpTimer = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
      clearInterval(otpTimer);
      timerDisplay.textContent = 'Expired';
      showToast('⏰ OTP expired. Please request a new one.', 'error');
    }
  }, 1000);
}

// Verify OTP
async function verifyOTP(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const otp = document.getElementById('otpInput').value;
  const btn = document.getElementById('verifyOtpBtn');

  if (otp.length !== 6) {
    showToast('Please enter a 6-digit OTP', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Verifying...';

  try {
    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('safePawsUser', JSON.stringify(currentUser));
      showToast('✅ Login successful! Welcome to Safe Paws', 'success');
      
      if (otpTimer) clearInterval(otpTimer);
      
      setTimeout(() => {
        showScreen('reportScreen');
        document.getElementById('userEmail').textContent = currentUser.email;
        getLocation();
        loadRecentReports();
      }, 1000);
    } else {
      showToast(data.error || 'Invalid OTP. Please check and try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Verify & Login</span>';
      document.getElementById('otpInput').value = '';
      document.getElementById('otpInput').focus();
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    showToast('Network error. Please try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>Verify & Login</span>';
  }
}

// Get current location
function getLocation() {
  const locationText = document.getElementById('locationText');
  locationText.textContent = '📍 Getting your location...';
  locationText.classList.add('loading');
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        locationText.textContent = `📍 ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
        locationText.classList.remove('loading');
        initMap();
        showToast('✅ Location captured successfully', 'success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        locationText.textContent = '❌ Location unavailable - Please enable location access';
        locationText.classList.remove('loading');
        showToast('⚠️ Please enable location access in your browser settings', 'error');
        
        // Fallback to default location (can be changed)
        currentLocation = {
          latitude: 28.6139,
          longitude: 77.2090
        };
        initMap();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    locationText.textContent = '❌ Geolocation not supported by your browser';
    locationText.classList.remove('loading');
    showToast('Your browser doesn\'t support geolocation', 'error');
  }
}

// Initialize map
function initMap() {
  if (!currentLocation) return;

  const mapContainer = document.getElementById('map');
  
  // Remove existing map if any
  if (map) {
    map.remove();
  }

  // Create new map
  map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Add marker
  marker = L.marker([currentLocation.latitude, currentLocation.longitude], {
    draggable: true
  }).addTo(map);

  marker.bindPopup('<b>📍 Incident Location</b><br>Drag to adjust').openPopup();

  // Update location when marker is dragged
  marker.on('dragend', function(e) {
    const position = marker.getLatLng();
    currentLocation = {
      latitude: position.lat,
      longitude: position.lng
    };
    document.getElementById('locationText').textContent = 
      `📍 ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
    showToast('📍 Location updated', 'info');
  });
}

// Submit incident
async function submitIncident(e) {
  e.preventDefault();

  if (!currentLocation) {
    showToast('⚠️ Please wait for location to be detected or enable location access', 'error');
    getLocation();
    return;
  }

  const btn = document.getElementById('submitIncidentBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Submitting...';

  const incidentData = {
    userId: currentUser.userId,
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    incidentType: document.getElementById('incidentType').value,
    severity: document.getElementById('severity').value,
    description: document.getElementById('description').value || null
  };

  try {
    const response = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData)
    });

    const data = await response.json();

    if (data.success) {
      showToast('✅ Report submitted successfully!', 'success');
      showScreen('successScreen');
      document.getElementById('incidentForm').reset();
      
      setTimeout(() => {
        showScreen('reportScreen');
        loadRecentReports();
        getLocation();
      }, 5000);
    } else {
      showToast(data.error || 'Failed to submit report. Please try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Submit Report</span>';
    }
  } catch (error) {
    console.error('Submit incident error:', error);
    showToast('Network error. Please check your connection and try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>Submit Report</span>';
  }
}

// Load recent reports
async function loadRecentReports() {
  try {
    const response = await fetch(`${API_URL}/api/incidents?userId=${currentUser.userId}&limit=5`);
    const data = await response.json();

    const container = document.getElementById('recentReports');
    
    if (data.incidents && data.incidents.length > 0) {
      container.innerHTML = data.incidents.map(incident => `
        <div class="incident-item">
          <h4>${formatIncidentType(incident.incident_type)} <span class="badge badge-${incident.severity}">${incident.severity.toUpperCase()}</span></h4>
          <p><strong>📍 Location:</strong> ${incident.latitude.toFixed(6)}, ${incident.longitude.toFixed(6)}</p>
          <p><strong>📅 Date:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
          ${incident.description ? `<p><strong>📝 Details:</strong> ${incident.description}</p>` : ''}
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-muted">No reports yet. Submit your first incident report above.</p>';
    }
  } catch (error) {
    console.error('Failed to load reports:', error);
    document.getElementById('recentReports').innerHTML = 
      '<p class="text-muted">Failed to load reports. Please refresh the page.</p>';
  }
}

// Connect WebSocket
function connectWebSocket() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

  ws.onopen = () => {
    console.log('✅ WebSocket connected');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'new_incident') {
        showToast('📢 New incident reported in your area', 'info');
        if (currentUser) loadRecentReports();
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected. Reconnecting in 5 seconds...');
    setTimeout(connectWebSocket, 5000);
  };
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('safePawsUser');
    currentUser = null;
    currentLocation = null;
    if (map) map.remove();
    if (otpTimer) clearInterval(otpTimer);
    
    showScreen('loginScreen');
    document.getElementById('otpRequestForm').reset();
    document.getElementById('otpVerifyForm').reset();
    document.getElementById('otpVerifySection').style.display = 'none';
    
    showToast('👋 Logged out successfully', 'success');
  }
}

// Show screen
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

// Format incident type
function formatIncidentType(type) {
  const types = {
    'barking': '🔊 Excessive Barking',
    'chasing': '🏃 Chasing Pedestrians',
    'pack_aggression': '👥 Pack Aggression',
    'bite': '🩹 Bite/Attack',
    'other': '📝 Other'
  };
  return types[type] || type;
}