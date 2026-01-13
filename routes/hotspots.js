const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Get all hotspots
router.get('/', async (req, res) => {
  try {
    const { status, minRiskScore } = req.query;

    let query = supabaseAdmin
      .from('hotspots')
      .select('*');

    if (status) query = query.eq('status', status);
    if (minRiskScore) query = query.gte('risk_score', minRiskScore);

    const { data: hotspots, error } = await query
      .order('risk_score', { ascending: false });

    if (error) throw error;

    res.json({ success: true, hotspots, count: hotspots.length });
  } catch (error) {
    console.error('Get hotspots error:', error);
    res.status(500).json({ error: 'Failed to get hotspots' });
  }
});

// Get hotspot by ID with incidents
router.get('/:hotspotId', async (req, res) => {
  try {
    const { hotspotId } = req.params;

    const { data: hotspot, error: hotspotError } = await supabaseAdmin
      .from('hotspots')
      .select('*')
      .eq('hotspot_id', hotspotId)
      .single();

    if (hotspotError) throw hotspotError;

    // Get nearby incidents
    const { data: allIncidents } = await supabaseAdmin
      .from('incidents')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200);

    const incidents = allIncidents.filter(inc => {
      const distance = getDistance(hotspot.center_lat, hotspot.center_lng, inc.latitude, inc.longitude);
      return distance <= 500;
    });

    // Get actions taken
    const { data: actions, error: actionsError } = await supabaseAdmin
      .from('actions')
      .select('*, users(email)')
      .eq('hotspot_id', hotspotId)
      .order('action_date', { ascending: false });

    if (actionsError) throw actionsError;

    res.json({
      success: true,
      hotspot: {
        ...hotspot,
        incidents,
        actions
      }
    });
  } catch (error) {
    console.error('Get hotspot error:', error);
    res.status(500).json({ error: 'Failed to get hotspot' });
  }
});

// Update hotspot status
router.patch('/:hotspotId', async (req, res) => {
  try {
    const { hotspotId } = req.params;
    const { status } = req.body;

    const { data: hotspot, error } = await supabaseAdmin
      .from('hotspots')
      .update({ status, last_updated: new Date().toISOString() })
      .eq('hotspot_id', hotspotId)
      .select()
      .single();

    if (error) throw error;

    // Broadcast update
    if (global.broadcast) {
      global.broadcast({
        type: 'hotspot_updated',
        data: hotspot
      });
    }

    res.json({ success: true, hotspot });
  } catch (error) {
    console.error('Update hotspot error:', error);
    res.status(500).json({ error: 'Failed to update hotspot' });
  }
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
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