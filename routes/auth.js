const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { sendOTP } = require('../config/email');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists, if not create
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{ 
          email, 
          role: role || 'resident',
          verification_status: 'pending'
        }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    const { error: otpError } = await supabaseAdmin
      .from('otp_logs')
      .insert([{
        user_id: user.user_id,
        otp_code: otp,
        expiry_time: expiryTime.toISOString(),
        used: false
      }]);

    if (otpError) throw otpError;

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent to your email',
      userId: user.user_id
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_logs')
      .select('*')
      .eq('user_id', user.user_id)
      .eq('otp_code', otp)
      .eq('used', false)
      .gt('expiry_time', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('otp_logs')
      .update({ used: true })
      .eq('otp_id', otpRecord.otp_id);

    // Update user verification status
    await supabaseAdmin
      .from('users')
      .update({ verification_status: 'verified' })
      .eq('user_id', user.user_id);

    // Log audit
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        actor_id: user.user_id,
        action: 'login',
        details: { email, timestamp: new Date().toISOString() }
      }]);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        verificationStatus: user.verification_status
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('user_id, email, role, verification_status, created_at')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

module.exports = router;