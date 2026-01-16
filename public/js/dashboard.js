// API Configuration
const API_URL = window.location.origin;
let currentUser = null;
let ws = null;
let trendsChart = null;
let typeChart = null;
let hotspotMap = null;
let otpTimer = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  connectWebSocket();
});

// Check authentication
function checkAuth() {
  const user = localStorage.getItem('safePawsUser');
  if (user) {
    currentUser = JSON.parse(user);
    if (currentUser.role === 'resident') {
      showToast('⛔ Access denied. Authority/NGO login required.', 'error');
      logout();
      return;
    }
    showScreen('dashboardScreen');
    document.getElementById('userEmail').textContent = `${currentUser.email} (${currentUser.role.toUpperCase()})`;
    loadDashboard();
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('otpRequestForm').addEventListener('submit', requestOTP);
  document.getElementById('otpVerifyForm').addEventListener('submit', verifyOTP);
  document.getElementById('resendOtpBtn').addEventListener('click', resendOTP);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('refreshHotspots').addEventListener('click', loadHotspots);
  document.getElementById('refreshMap').addEventListener('click', initHotspotMap);
  document.getElementById('actionForm').addEventListener('submit', submitAction);
  
  // Modal close
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.getElementById('actionModal').addEventListener('click', (e) => {
    if (e.target.id === 'actionModal') closeModal();
  });
}

// Request OTP
async function requestOTP(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const role = document.getElementById('roleSelect').value;
  const btn = document.getElementById('sendOtpBtn');
  
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending OTP...';

  try {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });

    const data = await response.json();

    if (data.success) {
      showToast('✅ OTP sent! Check your email', 'success');
      document.getElementById('otpVerifySection').style.display = 'block';
      document.getElementById('otpEmailDisplay').textContent = email;
      document.getElementById('otpInput').focus();
      startOtpTimer();
      document.getElementById('otpVerifySection').scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(data.error || 'Failed to send OTP', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Send OTP</span>';
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>Send OTP</span>';
  }
}

// Resend OTP
async function resendOTP() {
  const email = document.getElementById('emailInput').value;
  const role = document.getElementById('roleSelect').value;
  const btn = document.getElementById('resendOtpBtn');
  
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });

    const data = await response.json();

    if (data.success) {
      showToast('✅ New OTP sent!', 'success');
      document.getElementById('otpInput').value = '';
      document.getElementById('otpInput').focus();
      startOtpTimer();
    } else {
      showToast(data.error || 'Failed to resend OTP', 'error');
    }
  } catch (error) {
    showToast('Network error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Resend OTP';
  }
}

// Start OTP timer
function startOtpTimer() {
  if (otpTimer) clearInterval(otpTimer);
  
  let timeLeft = 600;
  const timerDisplay = document.getElementById('otpTimer');
  
  otpTimer = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
      clearInterval(otpTimer);
      timerDisplay.textContent = 'Expired';
      showToast('⏰ OTP expired. Request a new one.', 'error');
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
      if (data.user.role === 'resident') {
        showToast('⛔ Access denied. Authority/NGO login required.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span>Verify & Login</span>';
        return;
      }
      
      currentUser = data.user;
      localStorage.setItem('safePawsUser', JSON.stringify(currentUser));
      showToast('✅ Login successful!', 'success');
      
      if (otpTimer) clearInterval(otpTimer);
      
      setTimeout(() => {
        showScreen('dashboardScreen');
        document.getElementById('userEmail').textContent = `${currentUser.email} (${currentUser.role.toUpperCase()})`;
        loadDashboard();
      }, 1000);
    } else {
      showToast(data.error || 'Invalid OTP', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Verify & Login</span>';
      document.getElementById('otpInput').value = '';
      document.getElementById('otpInput').focus();
    }
  } catch (error) {
    showToast('Network error', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>Verify & Login</span>';
  }
}

// Load dashboard data
async function loadDashboard() {
  showToast('📊 Loading dashboard...', 'info');
  await Promise.all([
    loadStats(),
    loadTrends(),
    loadHotspots(),
    loadRecentIncidents(),
    initHotspotMap()
  ]);
  showToast('✅ Dashboard loaded', 'success');
}

// Load statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/api/analytics/dashboard`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('totalIncidents').textContent = data.stats.totalIncidents || 0;
      document.getElementById('activeHotspots').textContent = data.stats.activeHotspots || 0;
      document.getElementById('actionsTaken').textContent = data.stats.actionsTaken || 0;
      
      const hotspots = await fetch(`${API_URL}/api/hotspots?minRiskScore=70`);
      const hotspotsData = await hotspots.json();
      document.getElementById('highRiskCount').textContent = hotspotsData.count || 0;

      updateTypeChart(data.stats.incidentsByType);
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Load trends
async function loadTrends() {
  try {
    const response = await fetch(`${API_URL}/api/analytics/trends?days=30`);
    const data = await response.json();

    if (data.success) {
      updateTrendsChart(data.trends);
    }
  } catch (error) {
    console.error('Failed to load trends:', error);
  }
}

// Initialize hotspot map
async function initHotspotMap() {
  try {
    const response = await fetch(`${API_URL}/api/hotspots`);
    const data = await response.json();

    if (hotspotMap) {
      hotspotMap.remove();
    }

    // Default center (can be changed based on your location)
    let centerLat = 28.6139;
    let centerLng = 77.2090;

    if (data.hotspots && data.hotspots.length > 0) {
      centerLat = data.hotspots[0].center_lat;
      centerLng = data.hotspots[0].center_lng;
    }

    hotspotMap = L.map('hotspotMap').setView([centerLat, centerLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(hotspotMap);

    // Add hotspot markers
    if (data.hotspots && data.hotspots.length > 0) {
      data.hotspots.forEach(hotspot => {
        const color = hotspot.risk_score >= 70 ? 'red' : hotspot.risk_score >= 40 ? 'orange' : 'yellow';
        
        const circle = L.circle([hotspot.center_lat, hotspot.center_lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.4,
          radius: 500
        }).addTo(hotspotMap);

        circle.bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b;">🔥 Hotspot</h4>
            <p style="margin: 5px 0;"><strong>Risk Score:</strong> <span style="color: ${color}; font-weight: bold;">${hotspot.risk_score}</span></p>
            <p style="margin: 5px 0;"><strong>Incidents:</strong> ${hotspot.incident_count || 0}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${formatStatus(hotspot.status)}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${hotspot.center_lat.toFixed(6)}, ${hotspot.center_lng.toFixed(6)}</p>
            <button onclick="openActionModal('${hotspot.hotspot_id}')" style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%;">Take Action</button>
          </div>
        `);
      });
    }

    showToast('🗺️ Map updated', 'success');
  } catch (error) {
    console.error('Failed to load map:', error);
    showToast('Failed to load map', 'error');
  }
}

// Load hotspots
async function loadHotspots() {
  try {
    const response = await fetch(`${API_URL}/api/hotspots`);
    const data = await response.json();

    const tbody = document.getElementById('hotspotsBody');
    
    if (data.hotspots && data.hotspots.length > 0) {
      tbody.innerHTML = data.hotspots.map(hotspot => `
        <tr>
          <td>📍 ${hotspot.center_lat.toFixed(6)}, ${hotspot.center_lng.toFixed(6)}</td>
          <td><span class="badge badge-${getRiskClass(hotspot.risk_score)}">${hotspot.risk_score}</span></td>
          <td>${hotspot.incident_count || 0}</td>
          <td><span class="badge badge-${hotspot.status}">${formatStatus(hotspot.status)}</span></td>
          <td>${new Date(hotspot.last_updated).toLocaleString()}</td>
          <td>
            <button class="btn btn-primary" onclick="openActionModal('${hotspot.hotspot_id}')" style="padding: 8px 16px; font-size: 14px;">Take Action</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hotspots found</td></tr>';
    }
  } catch (error) {
    console.error('Failed to load hotspots:', error);
  }
}

// Load recent incidents
async function loadRecentIncidents() {
  try {
    const response = await fetch(`${API_URL}/api/incidents?limit=10`);
    const data = await response.json();

    const container = document.getElementById('recentIncidents');
    
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
      container.innerHTML = '<p class="text-muted">No recent incidents</p>';
    }
  } catch (error) {
    console.error('Failed to load incidents:', error);
  }
}

// Update trends chart
function updateTrendsChart(trends) {
  const ctx = document.getElementById('trendsChart').getContext('2d');
  
  if (trendsChart) {
    trendsChart.destroy();
  }

  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trends.map(t => new Date(t.date).toLocaleDateString()),
      datasets: [{
        label: 'Total Incidents',
        data: trends.map(t => t.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Update type chart
function updateTypeChart(typeData) {
  const ctx = document.getElementById('typeChart').getContext('2d');
  
  if (typeChart) {
    typeChart.destroy();
  }

  const labels = Object.keys(typeData).map(formatIncidentType);
  const data = Object.values(typeData);

  typeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Open action modal
function openActionModal(hotspotId) {
  document.getElementById('actionHotspotId').value = hotspotId;
  document.getElementById('actionModal').classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('actionModal').classList.remove('active');
  document.getElementById('actionForm').reset();
}

// Submit action
async function submitAction(e) {
  e.preventDefault();

  const actionData = {
    hotspotId: document.getElementById('actionHotspotId').value,
    authorityId: currentUser.userId,
    actionType: document.getElementById('actionType').value,
    notes: document.getElementById('actionNotes').value
  };

  try {
    const response = await fetch(`${API_URL}/api/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });

    const data = await response.json();

    if (data.success) {
      showToast('✅ Action recorded successfully!', 'success');
      closeModal();
      loadHotspots();
      loadStats();
      initHotspotMap();
    } else {
      showToast(data.error || 'Failed to record action', 'error');
    }
  } catch (error) {
    showToast('Network error', 'error');
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
        showToast('📢 New incident reported!', 'info');
        loadStats();
        loadRecentIncidents();
        initHotspotMap();
      } else if (data.type === 'hotspots_updated') {
        showToast('🔥 Hotspots updated', 'info');
        loadHotspots();
        initHotspotMap();
      } else if (data.type === 'action_taken') {
        showToast('✅ Action recorded', 'info');
        loadHotspots();
        loadStats();
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
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
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('safePawsUser');
    currentUser = null;
    if (hotspotMap) hotspotMap.remove();
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

// Show toast
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

// Helper functions
function getRiskClass(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function formatStatus(status) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatIncidentType(type) {
  const types = {
    'barking': '🔊 Barking',
    'chasing': '🏃 Chasing',
    'pack_aggression': '👥 Pack Aggression',
    'bite': '🩹 Bite',
    'other': '📝 Other'
  };
  return types[type] || type;
}

// Make openActionModal global
window.openActionModal = openActionModal;