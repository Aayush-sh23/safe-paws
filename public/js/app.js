// API Configuration
const API_URL = window.location.origin;
let currentUser = null;
let currentLocation = null;
let ws = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  getLocation();
  connectWebSocket();
});

// Check if user is already logged in
function checkAuth() {
  const user = localStorage.getItem('safePawsUser');
  if (user) {
    currentUser = JSON.parse(user);
    showScreen('reportScreen');
    document.getElementById('userEmail').textContent = currentUser.email;
    loadRecentReports();
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('otpRequestForm').addEventListener('submit', requestOTP);
  document.getElementById('otpVerifyForm').addEventListener('submit', verifyOTP);
  document.getElementById('incidentForm').addEventListener('submit', submitIncident);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('reportAnotherBtn').addEventListener('click', () => showScreen('reportScreen'));
  document.getElementById('refreshLocation').addEventListener('click', getLocation);
}

// Request OTP
async function requestOTP(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;

  try {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'resident' })
    });

    const data = await response.json();

    if (data.success) {
      showToast('OTP sent to your email!', 'success');
      document.getElementById('otpVerifySection').style.display = 'block';
    } else {
      showToast(data.error || 'Failed to send OTP', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  }
}

// Verify OTP
async function verifyOTP(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const otp = document.getElementById('otpInput').value;

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
      showToast('Login successful!', 'success');
      showScreen('reportScreen');
      document.getElementById('userEmail').textContent = currentUser.email;
      loadRecentReports();
    } else {
      showToast(data.error || 'Invalid OTP', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  }
}

// Get current location
function getLocation() {
  document.getElementById('locationText').textContent = 'Getting location...';
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        document.getElementById('locationText').textContent = 
          `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
      },
      (error) => {
        document.getElementById('locationText').textContent = 'Location unavailable';
        showToast('Please enable location access', 'error');
      }
    );
  } else {
    document.getElementById('locationText').textContent = 'Location not supported';
    showToast('Geolocation not supported', 'error');
  }
}

// Submit incident
async function submitIncident(e) {
  e.preventDefault();

  if (!currentLocation) {
    showToast('Please wait for location to be detected', 'error');
    return;
  }

  const incidentData = {
    userId: currentUser.userId,
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    incidentType: document.getElementById('incidentType').value,
    severity: document.getElementById('severity').value,
    description: document.getElementById('description').value
  };

  try {
    const response = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData)
    });

    const data = await response.json();

    if (data.success) {
      showScreen('successScreen');
      document.getElementById('incidentForm').reset();
      setTimeout(() => {
        showScreen('reportScreen');
        loadRecentReports();
      }, 3000);
    } else {
      showToast(data.error || 'Failed to submit report', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
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
          <h4>${formatIncidentType(incident.incident_type)}</h4>
          <p><strong>Severity:</strong> ${incident.severity}</p>
          <p><strong>Date:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
          ${incident.description ? `<p>${incident.description}</p>` : ''}
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-muted">No reports yet</p>';
    }
  } catch (error) {
    console.error('Failed to load reports:', error);
  }
}

// Connect WebSocket
function connectWebSocket() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'new_incident') {
      showToast('New incident reported in your area', 'info');
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected. Reconnecting...');
    setTimeout(connectWebSocket, 5000);
  };
}

// Logout
function logout() {
  localStorage.removeItem('safePawsUser');
  currentUser = null;
  showScreen('loginScreen');
  document.getElementById('otpRequestForm').reset();
  document.getElementById('otpVerifyForm').reset();
  document.getElementById('otpVerifySection').style.display = 'none';
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
  }, 3000);
}

// Format incident type
function formatIncidentType(type) {
  const types = {
    'barking': 'Excessive Barking',
    'chasing': 'Chasing Pedestrians',
    'pack_aggression': 'Pack Aggression',
    'bite': 'Bite/Attack',
    'other': 'Other'
  };
  return types[type] || type;
}