const { supabaseAdmin } = require('../config/supabase');

const HOTSPOT_RADIUS = parseInt(process.env.HOTSPOT_RADIUS_METERS) || 500;
const MIN_INCIDENTS = parseInt(process.env.HOTSPOT_MIN_INCIDENTS) || 3;
const TIME_WINDOW_DAYS = parseInt(process.env.HOTSPOT_TIME_WINDOW_DAYS) || 7;

const calculateHotspots = async () => {
  try {
    console.log('🔄 Calculating hotspots...');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - TIME_WINDOW_DAYS);

    // Get recent incidents
    const { data: incidents, error: incidentsError } = await supabaseAdmin
      .from('incidents')
      .select('*')
      .gte('timestamp', startDate.toISOString());

    if (incidentsError) throw incidentsError;

    if (!incidents || incidents.length === 0) {
      console.log('No incidents to process');
      return;
    }

    // Cluster incidents using simple grid-based clustering
    const clusters = clusterIncidents(incidents, HOTSPOT_RADIUS);

    // Filter clusters with minimum incidents
    const validClusters = clusters.filter(c => c.incidents.length >= MIN_INCIDENTS);

    console.log(`Found ${validClusters.length} hotspots`);

    // Update or create hotspots
    for (const cluster of validClusters) {
      const riskScore = calculateRiskScore(cluster.incidents);

      // Check if hotspot exists nearby
      const { data: existingHotspots } = await supabaseAdmin
        .from('hotspots')
        .select('*')
        .limit(100);

      const nearby = existingHotspots?.filter(h => {
        const distance = getDistance(cluster.centerLat, cluster.centerLng, h.center_lat, h.center_lng);
        return distance <= HOTSPOT_RADIUS;
      });

      if (nearby && nearby.length > 0) {
        // Update existing hotspot
        await supabaseAdmin
          .from('hotspots')
          .update({
            risk_score: riskScore,
            incident_count: cluster.incidents.length,
            last_updated: new Date().toISOString()
          })
          .eq('hotspot_id', nearby[0].hotspot_id);
      } else {
        // Create new hotspot
        await supabaseAdmin
          .from('hotspots')
          .insert([{
            center_lat: cluster.centerLat,
            center_lng: cluster.centerLng,
            risk_score: riskScore,
            incident_count: cluster.incidents.length,
            status: 'active'
          }]);
      }
    }

    // Broadcast hotspot update
    if (global.broadcast) {
      global.broadcast({
        type: 'hotspots_updated',
        data: { count: validClusters.length }
      });
    }

    console.log('✅ Hotspots calculated successfully');
  } catch (error) {
    console.error('Calculate hotspots error:', error);
  }
};

const clusterIncidents = (incidents, radiusMeters) => {
  const clusters = [];
  const processed = new Set();

  for (let i = 0; i < incidents.length; i++) {
    if (processed.has(i)) continue;

    const cluster = {
      incidents: [incidents[i]],
      centerLat: incidents[i].latitude,
      centerLng: incidents[i].longitude
    };

    processed.add(i);

    // Find nearby incidents
    for (let j = i + 1; j < incidents.length; j++) {
      if (processed.has(j)) continue;

      const distance = getDistance(
        incidents[i].latitude,
        incidents[i].longitude,
        incidents[j].latitude,
        incidents[j].longitude
      );

      if (distance <= radiusMeters) {
        cluster.incidents.push(incidents[j]);
        processed.add(j);
      }
    }

    // Calculate cluster center
    const avgLat = cluster.incidents.reduce((sum, inc) => sum + inc.latitude, 0) / cluster.incidents.length;
    const avgLng = cluster.incidents.reduce((sum, inc) => sum + inc.longitude, 0) / cluster.incidents.length;

    cluster.centerLat = avgLat;
    cluster.centerLng = avgLng;

    clusters.push(cluster);
  }

  return clusters;
};

const calculateRiskScore = (incidents) => {
  let score = 0;

  incidents.forEach(inc => {
    // Base score by severity
    if (inc.severity === 'high') score += 10;
    else if (inc.severity === 'medium') score += 5;
    else score += 2;

    // Additional weight by incident type
    if (inc.incident_type === 'bite') score += 15;
    else if (inc.incident_type === 'pack_aggression') score += 10;
    else if (inc.incident_type === 'chasing') score += 5;
  });

  // Normalize to 0-100
  return Math.min(100, score);
};

const getDistance = (lat1, lon1, lat2, lon2) => {
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
};

module.exports = { calculateHotspots };