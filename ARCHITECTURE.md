# 🏗️ Safe Paws - System Architecture

## Overview

Safe Paws is built as a modern, scalable web application with real-time capabilities, designed for municipal and NGO deployment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Resident App    │              │ Authority        │         │
│  │  (Mobile-First)  │              │ Dashboard        │         │
│  │                  │              │ (Desktop)        │         │
│  │  - OTP Login     │              │ - Analytics      │         │
│  │  - Report Form   │              │ - Hotspot Map    │         │
│  │  - Location      │              │ - Action Mgmt    │         │
│  │  - History       │              │ - Real-time      │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                 │                    │
│           └─────────────┬───────────────────┘                    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ HTTPS / WebSocket
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
├─────────────────────────┼────────────────────────────────────────┤
│                         │                                         │
│  ┌──────────────────────▼───────────────────────────┐            │
│  │         Express.js Server (Node.js)              │            │
│  │                                                   │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │            │
│  │  │   REST API  │  │  WebSocket  │  │  Static  │ │            │
│  │  │   Routes    │  │   Server    │  │  Files   │ │            │
│  │  └─────────────┘  └─────────────┘  └──────────┘ │            │
│  │                                                   │            │
│  │  ┌───────────────────────────────────────────┐  │            │
│  │  │         Middleware Layer                  │  │            │
│  │  │  - Helmet (Security)                      │  │            │
│  │  │  - CORS                                   │  │            │
│  │  │  - Rate Limiting                          │  │            │
│  │  │  - Body Parser                            │  │            │
│  │  └───────────────────────────────────────────┘  │            │
│  │                                                   │            │
│  │  ┌───────────────────────────────────────────┐  │            │
│  │  │         Business Logic                    │  │            │
│  │  │  - Authentication (OTP)                   │  │            │
│  │  │  - Incident Management                    │  │            │
│  │  │  - Hotspot Calculation                    │  │            │
│  │  │  - Action Tracking                        │  │            │
│  │  │  - Analytics Engine                       │  │            │
│  │  └───────────────────────────────────────────┘  │            │
│  └───────────────────────────────────────────────────┘            │
│                         │                                         │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────┼─────────────────────────────────────────┐
│                    DATA LAYER                                     │
├─────────────────────────┼─────────────────────────────────────────┤
│                         │                                         │
│  ┌──────────────────────▼───────────────────────────┐            │
│  │      Supabase (PostgreSQL + PostGIS)             │            │
│  │                                                   │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │            │
│  │  │   users     │  │  incidents  │  │ hotspots │ │            │
│  │  └─────────────┘  └─────────────┘  └──────────┘ │            │
│  │                                                   │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │            │
│  │  │  otp_logs   │  │   actions   │  │  audit   │ │            │
│  │  └─────────────┘  └─────────────┘  └──────────┘ │            │
│  │                                                   │            │
│  │  ┌───────────────────────────────────────────┐  │            │
│  │  │      PostGIS Spatial Functions            │  │            │
│  │  │  - Distance calculations                  │  │            │
│  │  │  - Geo-location queries                   │  │            │
│  │  │  - Spatial indexing                       │  │            │
│  │  └───────────────────────────────────────────┘  │            │
│  └───────────────────────────────────────────────────┘            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────┼─────────────────────────────────────────┐
│                  EXTERNAL SERVICES                                │
├─────────────────────────┼─────────────────────────────────────────┤
│                         │                                         │
│  ┌──────────────────────▼───────────────────────────┐            │
│  │         SendGrid / SMTP                          │            │
│  │         (Email OTP Delivery)                     │            │
│  └──────────────────────────────────────────────────┘            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Client Layer

#### Resident App (`public/index.html`)
- **Purpose**: Allow citizens to report incidents quickly
- **Features**:
  - Email OTP authentication
  - Incident type selection (barking, chasing, bite, etc.)
  - Severity rating (low, medium, high)
  - Automatic GPS location capture
  - Optional description and media upload
  - View personal report history
- **Technology**: Vanilla JavaScript, HTML5 Geolocation API
- **Design**: Mobile-first, responsive

#### Authority Dashboard (`public/dashboard.html`)
- **Purpose**: Provide authorities with actionable insights
- **Features**:
  - Real-time statistics (incidents, hotspots, actions)
  - Interactive charts (trends, incident types)
  - Hotspot management table
  - Action recording interface
  - Live WebSocket updates
- **Technology**: Chart.js for visualizations
- **Design**: Desktop-optimized, data-dense

### 2. Application Layer

#### Express.js Server (`server.js`)
- **Port**: 3000 (configurable)
- **Protocols**: HTTP/HTTPS + WebSocket
- **Middleware Stack**:
  - `helmet`: Security headers
  - `cors`: Cross-origin resource sharing
  - `express-rate-limit`: DDoS protection (100 req/15min)
  - `express.json()`: JSON body parsing

#### API Routes

**Authentication** (`routes/auth.js`)
- `POST /api/auth/request-otp`: Generate and send OTP
- `POST /api/auth/verify-otp`: Verify OTP and create session
- `GET /api/auth/profile/:userId`: Get user profile

**Incidents** (`routes/incidents.js`)
- `POST /api/incidents`: Submit new incident
- `GET /api/incidents`: List incidents (with filters)
- `GET /api/incidents/:id`: Get incident details
- `POST /api/incidents/nearby`: Find incidents near location

**Hotspots** (`routes/hotspots.js`)
- `GET /api/hotspots`: List all hotspots
- `GET /api/hotspots/:id`: Get hotspot with incidents
- `PATCH /api/hotspots/:id`: Update hotspot status

**Actions** (`routes/actions.js`)
- `POST /api/actions`: Record authority action
- `GET /api/actions/hotspot/:id`: Get actions for hotspot
- `GET /api/actions/authority/:id`: Get actions by authority

**Analytics** (`routes/analytics.js`)
- `GET /api/analytics/dashboard`: Dashboard statistics
- `GET /api/analytics/trends`: Incident trends over time
- `GET /api/analytics/heatmap`: Heatmap data for visualization

#### WebSocket Server
- **Purpose**: Real-time updates to all connected clients
- **Events**:
  - `new_incident`: Broadcast when incident reported
  - `hotspot_updated`: Broadcast when hotspot recalculated
  - `action_taken`: Broadcast when authority takes action
- **Connection Management**: Automatic reconnection on disconnect

#### Business Logic

**Hotspot Calculation** (`utils/hotspots.js`)
- **Algorithm**: Grid-based clustering
- **Parameters**:
  - Radius: 500m (configurable)
  - Minimum incidents: 3 (configurable)
  - Time window: 7 days (configurable)
- **Risk Score Formula**:
  ```
  score = Σ(severity_points + type_points)
  severity_points: high=10, medium=5, low=2
  type_points: bite=15, pack_aggression=10, chasing=5
  normalized to 0-100 scale
  ```
- **Trigger**: Runs after each incident submission

**OTP System** (`config/email.js`)
- **Generation**: 6-digit random number (100000-999999)
- **Expiry**: 10 minutes
- **Storage**: Hashed in database
- **Delivery**: SendGrid or SMTP
- **Security**: One-time use, automatic cleanup

### 3. Data Layer

#### Database Schema

**users**
```sql
user_id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE
role VARCHAR(50) -- resident, ngo, authority
verification_status VARCHAR(50)
created_at TIMESTAMP
```

**incidents**
```sql
incident_id UUID PRIMARY KEY
user_id UUID FOREIGN KEY
latitude DECIMAL(10,8)
longitude DECIMAL(11,8)
incident_type VARCHAR(50)
severity VARCHAR(20)
description TEXT
media_url TEXT
timestamp TIMESTAMP
```

**hotspots**
```sql
hotspot_id UUID PRIMARY KEY
center_lat DECIMAL(10,8)
center_lng DECIMAL(11,8)
risk_score INTEGER (0-100)
incident_count INTEGER
status VARCHAR(50)
last_updated TIMESTAMP
```

**actions**
```sql
action_id UUID PRIMARY KEY
hotspot_id UUID FOREIGN KEY
authority_id UUID FOREIGN KEY
action_type VARCHAR(100)
notes TEXT
action_date TIMESTAMP
```

**otp_logs**
```sql
otp_id UUID PRIMARY KEY
user_id UUID FOREIGN KEY
otp_code VARCHAR(6)
expiry_time TIMESTAMP
used BOOLEAN
```

**audit_logs**
```sql
log_id UUID PRIMARY KEY
actor_id UUID FOREIGN KEY
action VARCHAR(100)
details JSONB
timestamp TIMESTAMP
```

#### Indexes
- `incidents.timestamp` (DESC) - Fast recent incident queries
- `hotspots.risk_score` (DESC) - Priority sorting
- `incidents.user_id` - User history lookup
- `actions.hotspot_id` - Action history per hotspot

### 4. External Services

#### SendGrid / SMTP
- **Purpose**: OTP email delivery
- **Fallback**: Console logging if not configured
- **Template**: HTML email with branding
- **Rate Limit**: 100 emails/day (SendGrid free tier)

## Data Flow

### Incident Reporting Flow

```
1. Resident opens app
   ↓
2. Requests OTP via email
   ↓
3. Enters OTP, authenticated
   ↓
4. Fills incident form
   ↓
5. Browser captures GPS location
   ↓
6. Submits to POST /api/incidents
   ↓
7. Server validates and stores in DB
   ↓
8. Triggers hotspot recalculation
   ↓
9. Broadcasts via WebSocket
   ↓
10. Dashboard updates in real-time
```

### Hotspot Detection Flow

```
1. New incident submitted
   ↓
2. Fetch recent incidents (7 days)
   ↓
3. Cluster by distance (500m radius)
   ↓
4. Filter clusters (min 3 incidents)
   ↓
5. Calculate risk scores
   ↓
6. Check for existing hotspots nearby
   ↓
7. Update existing OR create new
   ↓
8. Broadcast update via WebSocket
   ↓
9. Dashboard refreshes hotspot table
```

### Action Recording Flow

```
1. Authority views hotspot on dashboard
   ↓
2. Clicks "Take Action"
   ↓
3. Fills action form (type, notes)
   ↓
4. Submits to POST /api/actions
   ↓
5. Server stores action in DB
   ↓
6. Updates hotspot status
   ↓
7. Logs in audit_logs
   ↓
8. Broadcasts via WebSocket
   ↓
9. All dashboards update
```

## Security Architecture

### Authentication
- **Method**: Email OTP (no passwords)
- **Session**: Client-side storage (localStorage)
- **Expiry**: OTP valid for 10 minutes
- **Rate Limiting**: 100 requests per 15 minutes per IP

### Authorization
- **Roles**: resident, ngo, authority
- **Enforcement**: Server-side role checks
- **Separation**: Residents can't access dashboard

### Data Protection
- **Transport**: HTTPS only in production
- **Headers**: Helmet.js security headers
- **CORS**: Configured for specific origins
- **SQL Injection**: Parameterized queries via Supabase

### Audit Trail
- All actions logged in `audit_logs`
- Includes: actor, action type, timestamp, details
- Immutable records for compliance

## Scalability Considerations

### Current Capacity
- **Incidents**: 10,000+ per day
- **Concurrent Users**: 1,000+
- **WebSocket Connections**: 500+
- **Database**: 1GB (Supabase free tier)

### Scaling Strategies

**Horizontal Scaling**
- Deploy multiple server instances
- Use load balancer (Railway auto-scales)
- Sticky sessions for WebSocket

**Database Optimization**
- Add read replicas for analytics
- Implement caching (Redis)
- Archive old incidents (> 1 year)

**Performance Optimization**
- CDN for static assets
- Compress responses (gzip)
- Lazy load dashboard charts
- Paginate large result sets

## Monitoring & Observability

### Logs
- Application logs: Railway logs
- Database logs: Supabase dashboard
- Error tracking: Console errors

### Metrics
- Request rate: Express middleware
- Response time: Built-in timing
- Database queries: Supabase analytics
- WebSocket connections: In-memory counter

### Alerts
- High error rate: Manual monitoring
- Database full: Supabase alerts
- Service down: Railway health checks

## Deployment Architecture

### Railway Deployment

```
┌─────────────────────────────────────┐
│         Railway Platform            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Auto-scaling Instances      │ │
│  │   (Node.js containers)        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Load Balancer               │ │
│  │   (HTTPS + WebSocket)         │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Environment Variables       │ │
│  │   (Encrypted storage)         │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
           │
           │ Secure connection
           ↓
┌─────────────────────────────────────┐
│      Supabase (Managed DB)          │
│      PostgreSQL + PostGIS           │
└─────────────────────────────────────┘
```

## Technology Choices Rationale

### Why Node.js + Express?
- Fast development
- JavaScript everywhere (frontend + backend)
- Excellent WebSocket support
- Large ecosystem

### Why Supabase?
- PostgreSQL with PostGIS built-in
- Free tier generous
- Real-time subscriptions
- Easy to use
- No DevOps required

### Why WebSocket?
- True real-time updates
- Low latency
- Bidirectional communication
- Better than polling

### Why Vanilla JavaScript?
- No build step required
- Fast page loads
- Easy to understand
- No framework lock-in

### Why Railway?
- Simple deployment
- Auto-scaling
- Free tier available
- WebSocket support
- Environment variables management

## Future Architecture Enhancements

### Phase 2
- [ ] Mobile apps (React Native)
- [ ] Push notifications (FCM)
- [ ] Offline support (Service Workers)
- [ ] Image upload (S3/Cloudinary)

### Phase 3
- [ ] Machine learning (risk prediction)
- [ ] SMS OTP (Twilio)
- [ ] Multi-language (i18n)
- [ ] Advanced analytics (BigQuery)

### Phase 4
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Event sourcing
- [ ] CQRS pattern

---

**Architecture Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: Safe Paws Team