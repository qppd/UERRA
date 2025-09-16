[![UERRA Logo](public/vite.svg)](https://github.com/qppd/UERRA)

# UERRA - Unisan Emergency Reporting and Response App

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.0+-61dafb.svg)
![Supabase](https://img.shields.io/badge/supabase-latest-3ecf8e.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A **real-time, cross-platform emergency reporting system** for Unisan citizens and agencies. UERRA enables fast, category-based report routing to appropriate authorities, provides emergency tips, and suggests equipment for responders.

---

## 📑 Table of Contents

- [🎯 Overview & Features](#-overview--features)
- [⚡ Quick Start Guide](#-quick-start-guide)
- [🔧 Complete Setup Guide](#-complete-setup-guide)
- [📱 User Guides](#-user-guides)
- [🛠️ Development & Technical](#️-development--technical)
- [❗ Troubleshooting](#-troubleshooting)
- [🚀 Deployment & Production](#-deployment--production)
- [📈 Features by Role](#-features-by-role)
- [🤝 Contributing & Support](#-contributing--support)

---

## 🎯 Overview & Features

### 👥 User Roles

| Role | Capabilities | Dashboard Features |
|------|-------------|-------------------|
| **🧍 Citizens** | Submit reports, track status, emergency tips | Report emergency, view my reports, emergency hotlines |
| **🏢 Agencies** | Manage assigned reports, equipment suggestions | Live map, report management, status updates |
| **🏛️ Municipal Admin** | Oversee all reports, manage categories | Analytics, agency management, report oversight |
| **⚡ Super Admin** | Full system access, user management | Complete system control, advanced analytics |

### ✨ Core Features

- 📱 **Real-time Emergency Reporting** with photo upload and GPS location
- 🗺️ **Live Map Integration** with Mapbox for location services
- 🔔 **Intelligent Auto-routing** (Fire→BFP, Medical→Hospital, Crime→PNP, etc.)
- 📊 **Analytics Dashboard** with reports statistics and trends
- 🔐 **Role-based Security** with Supabase Row-Level Security
- 💬 **Real-time Updates** using Supabase realtime subscriptions
- 📞 **Emergency Hotlines** quick access for all agencies
- 💡 **Context-aware Tips** emergency guidelines by category
- 📈 **Equipment Suggestions** for responders based on emergency type

---

## ⚡ Quick Start Guide

### 🚀 Get Running in 5 Minutes

```bash
# 1. Clone and install
git clone https://github.com/qppd/UERRA.git
cd uniapp
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Database setup (run in Supabase SQL Editor)
# Execute: database-schema.sql

# 4. Start development
npm run dev
```

**🎉 That's it!** Open http://localhost:5173 and start reporting emergencies.

### 📋 Prerequisites Checklist

- [x] Node.js 18+ installed
- [x] Supabase account created
- [x] Project environment variables configured
- [x] Database schema executed

---

## 🔧 Complete Setup Guide

<details>
<summary><strong>📦 Installation & Dependencies</strong></summary>

### Prerequisites
- **Node.js** (v18+ recommended) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase account** - [Sign up at supabase.com](https://supabase.com)
- **Mapbox account** (optional) - [For enhanced maps](https://www.mapbox.com/)

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/qppd/UERRA.git
cd uniapp

# Install all dependencies
npm install

# Verify installation
npm run dev
```

</details>

<details>
<summary><strong>🗄️ Database Configuration</strong></summary>

### Step 1: Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose organization and set project name: `uerra-unisan`
4. Wait for database to initialize

### Step 2: Execute Database Schema
1. Navigate to **SQL Editor** in Supabase dashboard
2. Copy entire content from `database-schema.sql`
3. Paste and click **"Run"**
4. Verify tables created: `users`, `agencies`, `categories`, `reports`, `report_updates`

### Step 3: Verify Database Structure
Run this verification query:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
```

### Expected Tables:
- **users**: User profiles with roles and agency assignments
- **agencies**: Emergency response agencies (PNP, BFP, Hospital, etc.)
- **categories**: Emergency types with tips and equipment suggestions  
- **reports**: Citizen-submitted emergency reports with location and media
- **report_updates**: Status tracking and communication timeline

</details>

<details>
<summary><strong>🗃️ Storage Setup</strong></summary>

### Configure Supabase Storage for Photo Uploads

#### Step 1: Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **"Create bucket"**
3. Configure:
   - **Name**: `photos`
   - **Public bucket**: ✅ Enable
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

#### Step 2: Set Row Level Security Policies

```sql
-- Policy 1: Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload photos" 
ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'photos');

-- Policy 2: Allow public viewing of photos
CREATE POLICY "Allow public viewing of photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

-- Policy 3: Allow users to update their own photos
CREATE POLICY "Allow users to update own photos" 
ON storage.objects 
FOR UPDATE TO authenticated 
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

#### Step 3: Test Photo Upload
1. Register/login to your app
2. Submit a test emergency report with photo
3. Check Storage → photos bucket for uploaded file

</details>

<details>
<summary><strong>🔑 OAuth Configuration</strong></summary>

### Google OAuth Setup

#### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (if none exists)

#### Configure Authorized Origins:
```
http://localhost:5173
http://localhost:5174
https://yourdomain.vercel.app
```

#### Configure Authorized Redirect URIs:
```
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
https://yourdomain.vercel.app/auth/callback
https://YOUR_SUPABASE_URL.supabase.co/auth/v1/callback
```

#### Step 2: Supabase Configuration
1. Go to **Authentication** → **Providers** → **Google**
2. Enable the provider: Toggle **ON**
3. Enter **Client ID** and **Client Secret** from Google Console
4. Configure **Site URL**: `https://yourdomain.vercel.app`
5. Configure **Redirect URLs**: 
   ```
   http://localhost:5173/**,https://yourdomain.vercel.app/**
   ```

#### Step 3: Environment Variables
Add to your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

</details>

<details>
<summary><strong>🌍 Environment Configuration</strong></summary>

### Create Environment File

```bash
# Copy environment template
cp .env.example .env
```

### Required Environment Variables

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Mapbox for Maps (Optional - app works without it)
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Development Settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Get Your Supabase Credentials:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon/public key**

### Get Mapbox Token (Optional):
1. Create account at [Mapbox](https://www.mapbox.com/)
2. Go to **Account** → **Access Tokens**
3. Copy default public token or create new one

</details>

---

## 📱 User Guides

<details>
<summary><strong>🧍 Citizen User Guide</strong></summary>

### 🆘 Emergency Reporting Made Simple

#### Getting Started
1. **Create Account**: Register with email/password or Google OAuth
2. **Profile Setup**: Automatic citizen role assignment on first login
3. **Dashboard Access**: Navigate your personalized citizen dashboard

#### How to Report an Emergency

##### 🚨 When to Use UERRA
- **Fire emergencies** (house fires, forest fires)
- **Medical emergencies** (accidents, health crises)  
- **Crime incidents** (theft, violence, suspicious activity)
- **Natural disasters** (floods, landslides, severe weather)
- **Road accidents** (vehicle crashes, blocked roads)

##### 📝 Step-by-Step Reporting
1. **Click "Report Emergency"** on your dashboard
2. **Select Emergency Type**: Choose from available categories
3. **Emergency Tips Display**: Read safety guidelines that appear
4. **Describe the Emergency**:
   - Add brief title (optional)
   - Provide detailed description
   - Select priority level (Low, Medium, High, Critical)
5. **Add Location**:
   - Click "Use Current Location" for GPS detection
   - Or manually enter address
6. **Upload Photo** (optional but helpful):
   - Take photo of emergency scene
   - Max file size: 5MB
   - Supported: JPG, PNG, WebP
7. **Submit Report**: Review and submit

#### 📋 Track Your Reports (My Reports)
- **All Reports**: Complete history of submissions
- **Active Reports**: Currently being handled
- **Resolved Reports**: Completed cases
- **Report Details**: Click any report to see:
  - Status timeline and updates
  - Responder notes and communication
  - Photo evidence
  - Emergency tips specific to your report type

#### 💡 Emergency Tips
Access category-specific safety guidelines:
- **Fire Safety**: Stay low, avoid elevators, call for help
- **Medical Emergencies**: First aid basics, when to move victim
- **Crime Safety**: Personal safety, evidence preservation
- **Natural Disasters**: Preparation and response guidelines
- **Road Accidents**: Scene safety, first aid priorities

#### 📞 Emergency Hotlines
Quick access to all emergency contacts:
- **PNP (Police)**: Crime, security incidents
- **BFP (Fire)**: Fire emergencies, rescue operations  
- **Hospital**: Medical emergencies, ambulance
- **MDRMMO**: Disaster management, evacuation
- **RHU**: Health services, medical consultation

</details>

<details>
<summary><strong>🏢 Agency User Guide</strong></summary>

### Agency Dashboard Overview
- **Statistics Cards**: Total assigned, pending, in progress, resolved reports
- **Live Map View**: Geographic distribution of reports with pins
- **Reports Table**: Detailed list of assigned reports with status management
- **Equipment Suggestions**: Context-aware equipment recommendations

### Report Management Workflow
1. **New Report Notification**: Receive alerts for new assignments
2. **Accept Report**: Acknowledge and begin response
3. **Update Status**: Progress through stages (Pending → In Progress → Resolved)
4. **Add Notes**: Communicate updates to citizens and other responders
5. **Equipment Checklist**: Review suggested equipment for response

### Status Management
- **Pending**: Newly assigned, awaiting response
- **In Progress**: Actively being handled
- **Resolved**: Successfully completed
- **Cancelled**: No longer applicable

</details>

<details>
<summary><strong>🏛️ Admin User Guide</strong></summary>

### Municipal Admin Capabilities
- **Reports Overview**: Monitor all emergency reports across agencies
- **Agency Management**: Create, edit, and manage response agencies
- **Category Management**: Configure emergency types, tips, and equipment
- **Analytics Dashboard**: View response metrics and trends
- **User Oversight**: Basic user management capabilities

### System Administration Tasks
1. **Monitor Response Times**: Track agency performance
2. **Manage Resources**: Update equipment lists and emergency tips
3. **Generate Reports**: Export data for municipal planning
4. **Coordinate Agencies**: Ensure proper report distribution

</details>

---

## 🛠️ Development & Technical

<details>
<summary><strong>🏗️ Architecture & Tech Stack</strong></summary>

### Frontend Architecture
- **Framework**: React 18+ with Vite build tool
- **UI Library**: Material-UI (MUI) for consistent design
- **State Management**: React hooks + Supabase realtime
- **Routing**: React Router for navigation
- **Maps**: Mapbox GL JS for location services
- **Forms**: React Hook Form with validation

### Backend Architecture  
- **Database**: PostgreSQL with PostGIS for location data
- **Backend-as-a-Service**: Supabase for auth, API, realtime, storage
- **Authentication**: Supabase Auth with email/password + Google OAuth
- **File Storage**: Supabase Storage for photo uploads
- **Security**: Row-Level Security (RLS) policies

### Database Schema

```sql
-- Core tables structure
users: id, email, name, role, agency_id, phone, address, is_active
agencies: id, name, type, location, contact, is_active  
categories: id, name, color, assigned_agencies, emergency_tips, suggested_equipment
reports: id, user_id, category_id, title, description, location, address, status, priority, photo_url
report_updates: id, report_id, status, notes, created_at, user_id
```

### Auto-Routing Engine
Smart report distribution based on emergency category:
- **Fire Emergency** → BFP (Bureau of Fire Protection)
- **Medical Emergency** → Hospital + RHU (Rural Health Unit)
- **Crime/Security** → PNP (Philippine National Police)
- **Natural Disaster** → MDRMMO (Municipal Disaster Risk Reduction Management Office)
- **Road Accident** → PNP + Hospital (dual assignment)

</details>

<details>
<summary><strong>📱 Responsive Design Implementation</strong></summary>

### Mobile-First Approach
- **Breakpoints**: xs (0px), sm (600px), md (960px), lg (1280px), xl (1920px)
- **Grid System**: Material-UI responsive grid throughout
- **Touch Optimization**: Large touch targets, swipe gestures
- **Performance**: Optimized images, lazy loading, efficient re-renders

### Component Responsiveness
- **Dashboard Layout**: Collapsible sidebar, responsive drawer
- **Data Tables**: Horizontal scroll on mobile, priority column hiding
- **Forms**: Stacked inputs on mobile, side-by-side on desktop  
- **Maps**: Full-width on mobile, proportional on desktop
- **Cards**: Single column mobile, multi-column desktop

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: Progressive Web App (PWA) ready

</details>

<details>
<summary><strong>🔐 Security Features</strong></summary>

### Authentication & Authorization
- **Multi-factor Options**: Email/password, Google OAuth
- **Session Management**: Secure JWT tokens with refresh
- **Role-based Access**: Granular permissions per user role
- **Password Security**: Supabase handles hashing and validation

### Database Security
- **Row-Level Security**: Users only see data they're authorized for
- **API Security**: All requests authenticated through Supabase
- **SQL Injection Prevention**: Parameterized queries only
- **Data Encryption**: At rest and in transit

### Application Security
- **Input Validation**: All forms validated client and server-side
- **File Upload Security**: Type restrictions, size limits, virus scanning
- **XSS Prevention**: React's built-in protections + content sanitization
- **HTTPS Enforcement**: SSL/TLS required for all communications

</details>

---

## ❗ Troubleshooting

<details>
<summary><strong>🚨 Common Issues & Quick Fixes</strong></summary>

### "Create Profile" Button Not Working
**Symptoms**: Clicking create profile shows loading but doesn't proceed

**Solution**:
```sql
-- Fix missing columns in users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users
UPDATE public.users SET is_active = true WHERE is_active IS NULL;
```

### App Not Loading / Blank Screen
**Check**:
1. Environment variables in `.env` file
2. Supabase project status (not paused)
3. Browser console for JavaScript errors
4. Network tab for failed API requests

**Fix**:
```bash
# Clear cache and restart
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Cannot read properties of undefined"
**Cause**: Usually missing data from database or failed API calls

**Debug Steps**:
1. Open browser Developer Tools (F12)
2. Check Console tab for specific error
3. Check Network tab for failed requests
4. Verify Supabase project is active

</details>

<details>
<summary><strong>🗄️ Database Issues</strong></summary>

### Column Does Not Exist Errors

#### Categories Table Missing Color Column
```sql
-- Add color column to categories table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'color'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN color TEXT DEFAULT '#007bff';
        
        -- Update with appropriate colors
        UPDATE public.categories SET color = CASE 
            WHEN name = 'Fire Emergency' THEN '#ff4757'
            WHEN name = 'Medical Emergency' THEN '#2ed573'
            WHEN name = 'Crime/Security' THEN '#3742fa'
            WHEN name = 'Natural Disaster' THEN '#ffa502'
            WHEN name = 'Road Accident' THEN '#ff6b6b'
            ELSE '#007bff'
        END;
    END IF;
END $$;
```

#### Users Table Missing Columns
```sql
-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Set default values for existing users
UPDATE public.users 
SET is_active = true 
WHERE is_active IS NULL;
```

### Verify Database Structure
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check users table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
```

### Reset Database (Nuclear Option)
```sql
-- ⚠️ WARNING: This deletes ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run database-schema.sql
```

</details>

<details>
<summary><strong>🔑 Authentication Issues</strong></summary>

### OAuth 500 "unexpected_failure" Error

**Root Cause**: Misconfigured redirect URLs between Google Cloud Console and Supabase

#### Fix in Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials** → **OAuth 2.0 Client ID**
3. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://yourdomain.vercel.app
   ```
4. **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   https://yourdomain.vercel.app/auth/callback
   https://YOUR_SUPABASE_URL.supabase.co/auth/v1/callback
   ```

#### Fix in Supabase Dashboard:
1. **Authentication** → **Providers** → **Google**
2. **Site URL**: `https://yourdomain.vercel.app` (single URL only)
3. **Redirect URLs**: `http://localhost:5173/**,https://yourdomain.vercel.app/**`

### Email Verification Not Working

#### Enable Email Confirmations:
1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **User Management**:
   - ✅ Enable email confirmations: **ON**
   - ✅ Enable email change confirmations: **ON**

#### Configure Site URL:
- Development: `http://localhost:5173`
- Production: `https://yourdomain.vercel.app`

#### Custom Email Templates:
1. **Authentication** → **Email Templates**
2. Customize **Confirm signup** template with your branding

### Logout 403 Forbidden Error

**Symptoms**: Users can't log out, 403 error in network tab

**Solution**: Enhanced logout with fallback mechanisms
```javascript
// Multiple logout strategies implemented in utils/logoutUtils.js
// Tries local logout first, then global, with complete cleanup
```

</details>

<details>
<summary><strong>🎨 UI/UX Issues</strong></summary>

### Sidebar Not Closing on Mobile

**Fix Applied**: Enhanced mobile sidebar behavior
- Automatic close after navigation on mobile
- Backdrop click to close
- Window resize handling
- Proper variant switching (temporary/permanent)

### Responsive Design Issues

**Components Fixed**:
- **DashboardLayout**: Responsive width calculations, overflow control
- **Tables**: Horizontal scroll on mobile, responsive columns
- **Forms**: Stacked inputs on mobile, side-by-side on desktop
- **Cards**: Single column mobile, multi-column desktop

### Performance Issues

**Optimizations**:
- Lazy loading of components
- Efficient re-renders with React.memo
- Optimized database queries
- Image compression for uploads

</details>

---

## 🚀 Deployment & Production

<details>
<summary><strong>🌐 Vercel Deployment</strong></summary>

### Automated Deployment
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_MAPBOX_TOKEN=pk.your_mapbox_token
   ```
3. **Deploy**: Automatic deployment on git push to main branch

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Post-Deployment Checklist
- [ ] Environment variables configured
- [ ] OAuth redirect URLs updated with production domain
- [ ] Supabase Site URL updated to production domain
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (optional)

</details>

<details>
<summary><strong>⚙️ Production Configuration</strong></summary>

### Supabase Production Settings
1. **Disable Email Confirmations** (if desired for faster testing)
2. **Configure Rate Limiting** for API endpoints
3. **Set up Database Backups**
4. **Monitor Usage**: Check quotas and upgrade plan if needed

### Performance Optimization
- **Image Optimization**: Compress uploaded photos
- **CDN**: Leverage Vercel's edge network
- **Caching**: Implement service worker for offline functionality
- **Monitoring**: Set up error tracking (Sentry, LogRocket)

### Security Hardening
- **Content Security Policy**: Implement CSP headers
- **CORS Configuration**: Restrict to production domains only
- **Rate Limiting**: Implement per-user rate limits
- **Audit Logs**: Enable comprehensive logging

</details>

---

## 📈 Features by Role

<details>
<summary><strong>🧍 Citizen Features (Complete ✅)</strong></summary>

### Dashboard Features
- [x] Emergency action buttons (Report Emergency, Emergency Hotlines)
- [x] Recent reports overview with status indicators  
- [x] Emergency tips from all categories
- [x] Location access notifications
- [x] Real-time data fetching from Supabase

### Emergency Report Submission
- [x] Category selection with visual color indicators
- [x] Real-time emergency tips display based on selected category
- [x] Title and detailed description fields
- [x] Priority level selection (Low, Medium, High, Critical)
- [x] Location services with current location detection
- [x] Photo upload capability (max 5MB)
- [x] Address entry with geocoding support
- [x] Form validation and error handling

### My Reports Page
- [x] Tabbed view: All, Active, Resolved, Cancelled
- [x] Comprehensive report listing with status indicators
- [x] Detailed report information in modal dialogs
- [x] Status timeline with updates from responders
- [x] Photo evidence viewing
- [x] Emergency tips specific to each report type

### Emergency Features
- [x] Emergency Tips: Category-specific safety guidelines
- [x] Emergency Hotlines: Quick access to all emergency contacts
- [x] Real-time Status Tracking: Live updates on report progress

</details>

<details>
<summary><strong>🏢 Agency Features (Complete ✅)</strong></summary>

### Agency Dashboard
- [x] Statistics cards (Total Assigned, Pending, In Progress, Resolved)
- [x] Assigned reports table with detailed information
- [x] Map widget showing report locations with pins
- [x] Equipment suggestions based on report categories

### Report Management
- [x] Accept pending reports assigned to agency
- [x] Update report status with detailed notes
- [x] View comprehensive report information and timeline
- [x] Equipment checklist suggestions per emergency type
- [x] Real-time notifications for new assignments

### Enhanced Reports View
- [x] Advanced filtering and sorting capabilities
- [x] Status-based tabs for better organization
- [x] Bulk operations for multiple reports
- [x] Export functionality for record keeping

</details>

<details>
<summary><strong>🏛️ Municipal Admin Features (Complete ✅)</strong></summary>

### Administrative Dashboard
- [x] System-wide analytics and overview charts
- [x] Cross-agency report monitoring
- [x] Response time analytics
- [x] Trend analysis and reporting

### Management Capabilities
- [x] **Agency Management**: Create, edit, delete emergency response agencies
- [x] **Category Management**: Manage emergency types, tips, and equipment lists
- [x] **Reports Oversight**: View and manage all reports across agencies
- [x] **Assignment Control**: Assign/reassign reports to appropriate agencies

### Analytics & Reporting
- [x] Advanced reports table with filtering and search
- [x] Export capabilities for municipal planning
- [x] Statistical analysis of emergency patterns
- [x] Response time tracking and optimization

</details>

<details>
<summary><strong>⚡ Super Admin Features (Complete ✅)</strong></summary>

### Enhanced User Management
- [x] Advanced user table with role-based filtering
- [x] Create, edit, delete users with full profile information
- [x] User status management (activate/deactivate)
- [x] Role assignment and agency linking
- [x] Comprehensive search and filter capabilities

### System Administration
- [x] Complete database access and management
- [x] System logs and audit trails
- [x] Advanced analytics with drill-down capabilities
- [x] Backup and restore functionality
- [x] Security monitoring and user activity tracking

### Development Tools
- [x] Debug panels for troubleshooting
- [x] System health monitoring
- [x] Performance metrics and optimization tools
- [x] Database query optimization

</details>

---

## 🤝 Contributing & Support

<details>
<summary><strong>💻 Development Guidelines</strong></summary>

### Code Standards
- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Commit Messages**: Use conventional commits format
- **Testing**: Write tests for new features
- **Documentation**: Update README for new features

### Development Workflow
1. **Fork**: Fork the repository
2. **Branch**: Create feature branch (`git checkout -b feature/amazing-feature`)
3. **Develop**: Make your changes
4. **Test**: Ensure all tests pass
5. **Commit**: Commit changes (`git commit -m 'Add amazing feature'`)
6. **Push**: Push to branch (`git push origin feature/amazing-feature`)
7. **PR**: Open a Pull Request

### Project Structure
```
src/
├── components/          # Reusable UI components
├── services/           # Business logic and API calls
├── utils/              # Utility functions
├── assets/             # Images, icons, static files
└── App.jsx            # Main application component
```

</details>

<details>
<summary><strong>🐛 Bug Reports & Feature Requests</strong></summary>

### Reporting Bugs
1. **Check Existing Issues**: Search for similar problems
2. **Create Issue**: Use the bug report template
3. **Provide Details**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/device information
   - Screenshots if applicable

### Feature Requests
1. **Check Roadmap**: Review planned features
2. **Create Issue**: Use feature request template
3. **Provide Context**:
   - Use case description
   - Expected behavior
   - Alternative solutions considered

### Priority Levels
- **Critical**: Security issues, data loss, app crashes
- **High**: Major functionality broken
- **Medium**: Minor functionality issues
- **Low**: Enhancements, nice-to-have features

</details>

<details>
<summary><strong>📞 Support & Contact</strong></summary>

### Technical Support
- **GitHub Issues**: For bugs and feature requests
- **Documentation**: Check this README first
- **Community**: Join our developer community

### Contact Information
- **Project Lead**: [qppd@protonmail.com](mailto:qppd@protonmail.com)
- **Unisan LGU**: [unisan.lgu@gmail.com](mailto:unisan.lgu@gmail.com)
- **Repository**: [GitHub.com/qppd/UERRA](https://github.com/qppd/UERRA)

### Response Times
- **Critical Issues**: Within 24 hours
- **Bug Reports**: Within 48 hours
- **Feature Requests**: Within 1 week
- **General Questions**: Within 3 days

</details>

---

## 🛣️ Roadmap & Future Features

### 📱 Phase 2: Mobile App
- [ ] React Native mobile application
- [ ] Offline report queuing
- [ ] Push notifications with Firebase Cloud Messaging
- [ ] Voice-to-text report submission
- [ ] GPS tracking for responders

### 🚀 Phase 3: Advanced Features
- [ ] AI-powered emergency classification
- [ ] Predictive analytics for emergency patterns
- [ ] Integration with existing government systems
- [ ] Emergency simulation and training tools
- [ ] Multi-language support (Filipino/English)

### 🌐 Phase 4: Scale & Integration
- [ ] SMS fallback system for offline areas
- [ ] Integration with national emergency systems
- [ ] Community emergency preparedness features
- [ ] Advanced analytics and reporting dashboard
- [ ] Real-time responder GPS tracking

---

## 📄 License & Credits

### License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Built With
- [React](https://reactjs.org/) - Frontend framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Material-UI](https://mui.com/) - React component library
- [Mapbox](https://www.mapbox.com/) - Maps and location services
- [Vite](https://vitejs.dev/) - Build tool and development server

### Acknowledgments
- **Unisan Municipal Government** for project requirements and support
- **Open Source Community** for the amazing tools and libraries
- **Contributors** who help improve this emergency response system

---

<div align="center">

**🆘 UERRA - Making Emergency Response Faster and More Effective**

Built with ❤️ for the people of Unisan, Quezon Province

[Report Bug](https://github.com/qppd/UERRA/issues) • [Request Feature](https://github.com/qppd/UERRA/issues) • [Documentation](https://github.com/qppd/UERRA)

</div>