[![UERRA Logo](public/vite.svg)](https://github.com/qppd/UERRA)

# Unisan Emergency Reporting and Response App (UERRA)

A real-time, cross-platform emergency reporting system for Unisan citizens and agencies. UERRA enables fast, category-based report routing to the appropriate authorities, provides emergency tips, and suggests equipment for responders.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture &amp; Database](#architecture--database)
- [Setup &amp; Installation](#setup--installation)
- [Usage](#usage)
- [Screenshots &amp; UI Overview](#screenshots--ui-overview)
- [Contribution Guide](#contribution-guide)
- [Roadmap &amp; Future Plans](#roadmap--future-plans)
- [License &amp; Credits](#license--credits)
- [Contact &amp; Support](#contact--support)

---

## Features

### 👥 User Roles

- **Super Admin**: Full backend access, manage agencies, roles, and system configs.
- **Municipal Admin**: View/manage all reports, categories, and agencies.
- **Agencies**: (PNP, BFP, Hospital, MDRMMO, RHU) Dashboard for assigned reports, live map, equipment suggestions.
- **Citizens**: Real-time incident reporting, emergency tips, report tracking, hotline shortcuts.

### 📲 App Features

- Email/Google login (Supabase Auth)
- Quick report form (category, description, photo/video, auto-location)
- Real-time report status tracking (MyReports)
- Emergency tips and safety instructions (EmergencyTips)
- Report history and status timeline
- Emergency hotline shortcut (EmergencyHotlines)
- Agency dashboards with live map and report management (AgencyDashboard)
- Equipment checklist suggestions per report
- Admin analytics and export tools (AdminPanel, StatsCards, ReportsGraph)
- Role-based dashboards and Row-Level Security
- Push notifications for report updates (planned)

---

## Tech Stack

- **Frontend**: React (ReactJS for web, React Native for mobile planned)
- **Backend & DB**: Supabase (PostgreSQL, Realtime, Functions, RLS)
- **Authentication**: Supabase Auth (Email/Password, Google OAuth)
- **Push Notifications**: Firebase Cloud Messaging (FCM, planned)
- **Geo-location**: Mapbox (web), React Native Location (mobile, planned), Supabase PostGIS
- **Maps & Routing**: Mapbox, Google Maps API (planned)
- **UI**: Material-UI (MUI)
- **AI/Rule-Based Suggestions**: Rules engine (upgradeable to ML)

---

## Architecture & Database

### Main Folders & Files

- `src/components/`: All main UI components (dashboard, reports, management, tips, etc.)
- `src/services/`: Business logic (e.g., `CitizenReportService.js`)
- `src/utils/`: Utility functions (e.g., `authUtils.js`)
- `src/useAuthSession.js`, `src/useUserProfile.js`: React hooks for session and user profile
- `src/supabaseClient.js`: Supabase client setup

### Database Schema (Simplified)

- **users**: id, role, email, name, agency_id, online, phone, address
- **reports**: id, user_id, category_id, description, photo_url, location, status, assigned_agency_ids, priority, created_at, resolved_at
- **categories**: id, name, assigned_agencies, emergency_tips, suggested_equipment
- **agencies**: id, name, location, contact
- **report_updates**: id, report_id, status, notes, created_at, user_id

> See `database-schema.sql` for full details.

### Auto-Routing Engine

- Fire → BFP
- Medical → Hospital/RHU
- Crime → PNP
- Disaster → MDRMMO

### Equipment & Tips

- Predefined per category (e.g., Fire: Hose, Ladder; Medical: First Aid)
- Emergency tips pulled from Supabase by category

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Supabase project (see [DATABASE_SETUP.md](DATABASE_SETUP.md))
- Firebase project for FCM (optional)
- Mapbox or Google Maps API key

### Local Development

```sh
# Clone the repo
git clone https://github.com/qppd/UERRA.git
cd uniapp

# Install dependencies
npm install

# Configure environment variables
# (Supabase, FCM, Mapbox, etc.)
# See SETUP_GUIDE.md for details

# Start the development server
npm run dev
```

---

## Usage

### Citizens

- Register/login via email or Google
- Submit reports with category, description, location, and optional photo
- Track report status and view emergency tips
- View report history and timeline
- Call emergency hotlines directly from the app

### Agencies

- Login to dashboard
- View incoming and assigned reports by category
- Accept, assign, and update reports (status, notes)
- View live map and equipment suggestions

### Admins

- Manage agencies and categories
- View analytics and export data
- Manage users (EnhancedUsersManagement)

### Super Admin

- Full backend and database access
- Role management and system updates

---

## Screenshots & UI Overview

- **DashboardHome**: Stats cards, live map, reports graph, and category pie chart
- **MyReports**: Citizen’s report list, status timeline, and details dialog
- **ReportFormDialog**: Emergency report submission with category, location, and photo upload
- **AgencyDashboard**: Agency view of assigned reports, update dialogs, and map
- **AdminPanel**: User, agency, and category management, analytics (coming soon)
- **EmergencyTips**: Category-based safety tips and equipment
- **EmergencyHotlines**: Quick access to all emergency contact numbers

---

## Contribution Guide

- Fork the repo and create a feature branch
- Follow code style in `.eslintrc.js` and `eslint.config.js`
- Write clear commit messages
- Submit a pull request with a description of your changes

---

## Roadmap & Future Plans

- [ ] React Native mobile app
- [ ] Push notifications (FCM)
- [ ] Real-time responder GPS tracking
- [ ] Emergency simulation tools for agencies
- [ ] SMS fallback system
- [ ] Analytics per barangay/time
- [ ] AI-powered suggestions and analytics

---

## License & Credits

- MIT License
- Built with [React](https://reactjs.org/), [Supabase](https://supabase.com/), [Firebase](https://firebase.google.com/), [Mapbox](https://www.mapbox.com/), [Material-UI](https://mui.com/)

---

## Contact & Support

- For issues, open a GitHub issue or contact the maintainers.
- [Unisan LGU](mailto:unisan.lgu@gmail.com)
- [Project Lead](mailto:qppd@protonmail.com)

---

> For more details, see the documentation files in this repo.

# UERRA Web Dashboard

This project is the ReactJS web dashboard for the Unisan Emergency Reporting and Response App (UERRA).

## Getting Started

1. Install dependencies:

   ```sh
   npm install
   ```
2. Set up environment variables:

   ```sh
   cp .env.example .env
   ```

   Fill in your Supabase and Mapbox credentials in the `.env` file.
3. Run the database setup:

   - Go to your Supabase project SQL Editor
   - Execute the `database-schema.sql` file to create all necessary tables
4. Start the development server:

   ```sh
   npm run dev
   ```

## Features

### 🧍 Citizen Features (Complete)

- **Emergency Report Submission**: Full-featured form with category selection, location services, photo upload
- **My Reports Page**: Track all submitted reports with status updates and details view
- **Emergency Tips**: Category-specific safety guidelines and general emergency tips
- **Emergency Hotlines**: Quick access to all emergency contact numbers
- **Real-time Status Tracking**: Live updates on report progress
- **Location Services**: Automatic location detection with manual override
- **Photo Evidence**: Upload photos with reports (stored in Supabase Storage)

### 🏢 Admin Features

- Real-time emergency report dashboard with maps and analytics
- Role-based dashboards for agencies and admins
- User, Agency, and Category management
- Reports management and tracking

### 🔐 Authentication & Security

- Supabase authentication with email/password and Google OAuth
- Row-Level Security (RLS) policies
- Role-based access control (citizen, admin, agency, superadmin)

## Tech Stack

- **Frontend**: ReactJS (Vite) with Material-UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Maps**: Mapbox GL JS for location services
- **State Management**: React hooks and Supabase real-time subscriptions

## Citizen User Flow

### 1. Registration & Login

- Citizens can register with email/password or Google OAuth
- Default role is automatically set to 'citizen'
- Profile is automatically created on first login

### 2. Dashboard

- Emergency action buttons (Report Emergency, Emergency Hotlines)
- Recent reports overview with status indicators
- Emergency tips from all categories
- Location access notifications

### 3. Report Emergency

- Category selection with visual indicators
- Real-time emergency tips display based on selected category
- Title and detailed description fields
- Priority level selection (Low, Medium, High, Critical)
- Location services with current location detection
- Photo upload capability (max 5MB)
- Address entry with geocoding support

### 4. My Reports

- Tabbed view: All, Active, Resolved, Cancelled
- Detailed report information in expandable cards
- Status timeline with updates from responders
- Photo evidence viewing
- Emergency tips specific to each report type

### 5. Emergency Tips

- General emergency guidelines
- Category-specific safety tips
- Visual icons and color coding
- Detailed view with step-by-step instructions
- Equipment information for reference

### 6. Emergency Hotlines

- All emergency contact numbers
- One-click calling (on mobile/HTTPS)
- Agency descriptions and availability
- Quick access from dashboard

## Database Schema

The app uses PostgreSQL with PostGIS for location data:

- **users**: User profiles with roles and agency assignments
- **agencies**: Emergency response agencies (PNP, BFP, Hospital, etc.)
- **categories**: Emergency types with tips and equipment suggestions
- **reports**: Citizen-submitted emergency reports with location and media
- **report_updates**: Status tracking and communication timeline

## Environment Variables

Create a `.env` file with:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## Storage Setup

Create a storage bucket in Supabase:

1. Go to Storage in your Supabase dashboard
2. Create a bucket named `photos`
3. Set public access for viewing uploaded images
4. Configure RLS policies as needed

## Deployment

1. Build the project:

   ```sh
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)
3. Set environment variables in your hosting platform

## Next Steps

### Phase 2 Features (Planned)

- [ ] Push notifications using Firebase Cloud Messaging
- [ ] Real-time responder GPS tracking
- [ ] SMS fallback system for offline areas
- [ ] Voice-to-text report submission
- [ ] Multi-language support (Filipino/English)
- [ ] Offline report queuing
- [ ] Analytics dashboard for administrators
- [ ] Mobile app using React Native

### Advanced Features (Future)

- [ ] AI-powered emergency classification
- [ ] Predictive analytics for emergency patterns
- [ ] Integration with existing government systems
- [ ] Emergency simulation and training tools
- [ ] Community emergency preparedness features

---

For technical support or contributions, please contact the development team or create an issue in the repository.
