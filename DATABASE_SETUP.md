# Database Setup Instructions

## Setting up your Supabase Database

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign in to your account
   - Open your project: `bieexexscxkrshdvyuhj`

2. **Run the Database Schema**
   - In your Supabase dashboard, navigate to the **SQL Editor**
   - Copy the entire content from `database-schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the schema

3. **Verify Tables are Created**
   - Go to the **Table Editor** in your Supabase dashboard
   - You should see the following tables:
     - `users`
     - `agencies` 
     - `categories`
     - `reports`
     - `report_updates`

4. **Test the Application**
   - Start your development server: `npm run dev`
   - Try logging in or registering
   - The app should now automatically create a user profile when you first log in

## Database Tables Overview

### `users`
- Stores user profiles linked to Supabase Auth
- Includes role-based access (citizen, admin, agency, superadmin)

### `agencies`
- Government agencies (PNP, BFP, Hospital, MDRMMO, RHU)
- Pre-populated with default agencies for Unisan

### `categories`
- Emergency categories (Fire, Medical, Crime, Natural Disaster, Road Accident)
- Includes emergency tips and suggested equipment

### `reports`
- Emergency reports submitted by citizens
- Links to users, categories, and agencies

### `report_updates`
- Status updates and notes on reports
- Tracks the history of report handling

## Default Data

The schema includes default data for:
- 5 government agencies in Unisan
- 5 emergency categories with tips and equipment suggestions

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Agencies and categories are readable by all authenticated users
- Proper policies are in place to protect sensitive information

## Next Steps

After setting up the database:
1. Test user registration and login
2. Create test emergency reports
3. Test the dashboard functionality
4. Configure agency-specific access if needed
