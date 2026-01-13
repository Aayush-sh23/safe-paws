const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Total incidents
    let incidentQuery = supabaseAdmin
      .from('incidents')
      .select('*', { count: 'exact', head: true });
    
    if (startDate) incidentQuery = incidentQuery.gte('timestamp', startDate);
    if (endDate) incidentQuery = incidentQuery.lte('timestamp', endDate);
    
    const { count: totalIncidents } = await incidentQuery;

    // Active hotspots
    const { count: activeHotspots } = await supabaseAdmin
      .from('hotspots')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Actions taken
    let actionQuery = supabaseAdmin
      .from('actions')
      .select('*', { count: 'exact', head: true });
    
    if (startDate) actionQuery = actionQuery.gte('action_date', startDate);
    if (endDate) actionQuery = actionQuery.lte('action_date', endDate);
    
    const { count: actionsTaken } = await actionQuery;

    // Incidents by type
    const { data: incidentsByType } = await supabaseAdmin
      .from('incidents')
      .select('incident_type')
      .gte('timestamp', startDate || '2020-01-01')
      .lte('timestamp', endDate || new Date().toISOString());

    const typeStats = incidentsByType.reduce((acc, inc) => {
      acc[inc.incident_type] = (acc[inc.incident_type] || 0) + 1;
      return acc;
    }, {});

    // Incidents by severity
    const { data: incidentsBySeverity } = await supabaseAdmin
      .from('incidents')
      .select('severity')
      .gte('timestamp', startDate || '2020-01-01')
      .lte('timestamp', endDate || new Date().toISOString());

    const severityStats = incidentsBySeverity.reduce((acc, inc) => {
      acc[inc.severity] = (acc[inc.severity] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalIncidents,
        activeHotspots,
        actionsTaken,
        incidentsByType: typeStats,
        incidentsBySeverity: severityStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get incident trends over time
router.get('/trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: incidents, error } = await supabaseAdmin
      .from('incidents')
      .select('timestamp, severity')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Group by date
    const trendData = incidents.reduce((acc, inc) => {
      const date = inc.timestamp.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, high: 0, medium: 0, low: 0 };
      }
      acc[date].count++;
      acc[date][inc.severity]++;
      return acc;
    }, {});

    res.json({
      success: true,
      trends: Object.values(trendData)
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

// Get heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: incidents, error } = await supabaseAdmin
      .from('incidents')
      .select('latitude, longitude, severity')
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    const heatmapData = incidents.map(inc => ({
      lat: inc.latitude,
      lng: inc.longitude,
      weight: inc.severity === 'high' ? 3 : inc.severity === 'medium' ? 2 : 1
    }));

    res.json({
      success: true,
      heatmap: heatmapData
    });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ error: 'Failed to get heatmap data' });
  }
});

module.exports = router;