
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
