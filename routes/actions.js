const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Record action taken on hotspot
router.post('/', async (req, res) => {
  try {
    const {
      hotspotId,
      authorityId,
      actionType,
      notes
    } = req.body;

    if (!hotspotId || !authorityId || !actionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert action
    const { data: action, error: actionError } = await supabaseAdmin
      .from('actions')
      .insert([{
        hotspot_id: hotspotId,
        authority_id: authorityId,
        action_type: actionType,
        notes,
        action_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (actionError) throw actionError;

    // Update hotspot status
    await supabaseAdmin
      .from('hotspots')
      .update({ 
        status: 'action_taken',
        last_updated: new Date().toISOString()
      })
      .eq('hotspot_id', hotspotId);

    // Log audit
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        actor_id: authorityId,
        action: 'action_recorded',
        details: { hotspotId, actionType }
      }]);

    // Broadcast update
    if (global.broadcast) {
      global.broadcast({
        type: 'action_taken',
        data: action
      });
    }

    res.json({
      success: true,
      message: 'Action recorded successfully',
      action
    });
  } catch (error) {
    console.error('Record action error:', error);
    res.status(500).json({ error: 'Failed to record action' });
  }
});

// Get actions for a hotspot
router.get('/hotspot/:hotspotId', async (req, res) => {
  try {
    const { hotspotId } = req.params;

    const { data: actions, error } = await supabaseAdmin
      .from('actions')
      .select('*, users(email, role)')
      .eq('hotspot_id', hotspotId)
      .order('action_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, actions, count: actions.length });
  } catch (error) {
    console.error('Get actions error:', error);
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

// Get all actions by authority
router.get('/authority/:authorityId', async (req, res) => {
  try {
    const { authorityId } = req.params;

    const { data: actions, error } = await supabaseAdmin
      .from('actions')
      .select('*, hotspots(*)')
      .eq('authority_id', authorityId)
      .order('action_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, actions, count: actions.length });
  } catch (error) {
    console.error('Get authority actions error:', error);
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

module.exports = router;