-- Enable PostGIS extension for geo-location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('resident', 'ngo', 'authority')),
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP logs table
CREATE TABLE otp_logs (
  otp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents table
CREATE TABLE incidents (
  incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('barking', 'chasing', 'pack_aggression', 'bite', 'other')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  media_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for incidents
CREATE INDEX idx_incidents_timestamp ON incidents(timestamp DESC);
CREATE INDEX idx_incidents_user ON incidents(user_id);
CREATE INDEX idx_incidents_severity ON incidents(severity);

-- Hotspots table
CREATE TABLE hotspots (
  hotspot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_lat DECIMAL(10, 8) NOT NULL,
  center_lng DECIMAL(11, 8) NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  incident_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'action_taken', 'resolved', 'monitoring')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for hotspots
CREATE INDEX idx_hotspots_risk_score ON hotspots(risk_score DESC);
CREATE INDEX idx_hotspots_status ON hotspots(status);

-- Actions table
CREATE TABLE actions (
  action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id UUID NOT NULL REFERENCES hotspots(hotspot_id) ON DELETE CASCADE,
  authority_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL CHECK (action_type IN ('vaccination', 'sterilization', 'monitoring', 'relocation', 'feeding_program', 'other')),
  notes TEXT,
  action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_actions_hotspot ON actions(hotspot_id);
CREATE INDEX idx_actions_authority ON actions(authority_id);
CREATE INDEX idx_actions_date ON actions(action_date DESC);

-- Audit logs table
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);