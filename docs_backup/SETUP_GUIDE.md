# UERRA Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Mapbox account (optional, for enhanced maps)

## Step-by-Step Setup

### 1. Clone and Install
```bash
# Navigate to project directory
cd uniapp

# Install dependencies
npm install
```

### 2. Database Setup
1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Copy and execute the entire `database-schema.sql` file
4. Verify tables are created: users, agencies, categories, reports, report_updates

### 3. Storage Setup
1. Go to Storage in Supabase dashboard
2. Create a bucket named `photos`
3. Enable public access for the bucket
4. Follow `STORAGE_SETUP.md` for detailed RLS policies

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here (optional)
```

### 5. Run the Application
```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Test the Citizen Features

### 1. Register as Citizen
1. Click "Create Account"
2. Register with any email (or use Google OAuth)
3. You'll be automatically assigned the 'citizen' role

### 2. Test Emergency Reporting
1. Click "Report Emergency" on dashboard
2. Select emergency type (Fire, Medical, Crime, etc.)
3. Fill in description
4. Test location services (click "Use Current Location")
5. Upload a test photo
6. Submit report

### 3. Verify Report Tracking
1. Go to "My Reports" page
2. Click on your submitted report
3. Check status updates and details

### 4. Explore Emergency Tips
1. Go to "Emergency Tips" page
2. Click on different emergency types
3. Review safety guidelines

## Default Data

The database setup includes:
- **5 default agencies**: PNP, BFP, Hospital, MDRMMO, RHU
- **5 emergency categories**: Fire, Medical, Crime, Natural Disaster, Road Accident
- **Emergency tips and equipment suggestions** for each category

## Troubleshooting

### Common Issues:

1. **"Loading..." stuck on screen**
   - Check Supabase URL and API key in .env
   - Verify database tables exist
   - Check browser console for errors

2. **Can't submit reports**
   - Verify storage bucket exists
   - Check RLS policies
   - Ensure user is authenticated

3. **Location not working**
   - Enable location permissions in browser
   - Add Mapbox token for geocoding
   - Test on HTTPS in production

4. **Photos not uploading**
   - Check storage bucket permissions
   - Verify 5MB file size limit
   - Check network connectivity

### Getting Help

1. Check browser console for detailed errors
2. Review Supabase logs in dashboard
3. Verify all environment variables are set
4. Test with different browsers/devices

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect GitHub repo, auto-deploys
- **Netlify**: Drag and drop `dist` folder
- **Manual**: Upload `dist` folder to any web server

### Environment Variables for Production
Set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MAPBOX_TOKEN`

## Security Checklist for Production

- [ ] RLS policies are properly configured
- [ ] Environment variables are secure
- [ ] File upload limits are enforced
- [ ] HTTPS is enabled
- [ ] Backup strategy is in place

## Next Steps

1. **Test thoroughly** with different user roles
2. **Customize** emergency categories for your location
3. **Add real agency contacts** in the database
4. **Configure** real-time notifications
5. **Train users** on the system

---

🎉 **Congratulations!** Your UERRA emergency reporting system is now ready to help keep your community safe.

For advanced features and customization, see the main README.md file.
