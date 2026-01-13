const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { calculateHotspots } = require('../utils/hotspots');

// Submit incident report
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      latitude,
      longitude,
      incidentType,
      severity,
      description,
      mediaUrl
    } = req.body;

    if (!userId || !latitude || !longitude || !incidentType || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert incident
    const { data: incident, error: incidentError } = await supabaseAdmin
      .from('incidents')
      .insert([{
        user_id: userId,
        latitude,
        longitude,
        incident_type: incidentType,
        severity,
        description,
        media_url: mediaUrl
      }])
      .select()
      .single();

    if (incidentError) throw incidentError;

    // Log audit
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        actor_id: userId,
        action: 'incident_reported',
        details: { incidentId: incident.incident_id, type: incidentType }
      }]);

    // Recalculate hotspots in background
    calculateHotspots().catch(console.error);

    // Broadcast real-time update
    if (global.broadcast) {
      global.broadcast({
        type: 'new_incident',
        data: incident
      });
    }

    res.json({
      success: true,
      message: 'Incident reported successfully',
      incident
    });
  } catch (error) {
    console.error('Submit incident error:', error);
    res.status(500).json({ error: 'Failed to submit incident' });
  }
});

// Get incidents with filters
router.get('/', async (req, res) => {
  try {
    const { 
      userId, 
      incidentType, 
      severity, 
      startDate, 
      endDate,
      limit = 50,
      offset = 0
    } = req.query;

    let query = supabaseAdmin
      .from('incidents')
      .select('*, users(email)');

    if (userId) query = query.eq('user_id', userId);
    if (incidentType) query = query.eq('incident_type', incidentType);
    if (severity) query = query.eq('severity', severity);
    if (startDate) query = query.gte('timestamp', startDate);
    if (endDate) query = query.lte('timestamp', endDate);

    const { data: incidents, error } = await query
      .order('timestamp', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({ success: true, incidents, count: incidents.length });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to get incidents' });
  }
});

// Get incident by ID
router.get('/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params;

    const { data: incident, error } = await supabaseAdmin
      .from('incidents')
      .select('*, users(email, role)')
      .eq('incident_id', incidentId)
      .single();

    if (error) throw error;

    res.json({ success: true, incident });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ error: 'Failed to get incident' });
  }
});

// Get nearby incidents
router.post('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radiusMeters = 500 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Simple distance calculation for nearby incidents
    const { data: incidents, error } = await supabaseAdmin
      .from('incidents')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Filter by distance
    const nearby = incidents.filter(inc => {
      const distance = getDistance(latitude, longitude, inc.latitude, inc.longitude);
      return distance <= radiusMeters;
    });

    res.json({ success: true, incidents: nearby, count: nearby.length });
  } catch (error) {
    console.error('Get nearby incidents error:', error);
    res.status(500).json({ error: 'Failed to get nearby incidents' });
  }
});

// Helper function to calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = router;