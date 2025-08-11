# Database Structure Fix

If you're encountering issues with the "Create Profile" button, it's likely due to missing columns in the users table.

## Steps to Fix:

### 1. Run the Users Table Fix
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update any existing users to have is_active = true by default
UPDATE public.users 
SET is_active = true 
WHERE is_active IS NULL;
```

### 2. Verify Table Structure
Run this query to check your users table structure:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
```

You should see columns for:
- id (uuid)
- email (text)
- name (text)
- role (text)
- agency_id (uuid)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- phone (text)
- address (text)
- is_active (boolean)

### 3. Test Profile Creation
1. Sign out if you're logged in
2. Register a new account or sign in with existing account
3. If you see "Create Profile" button, click it
4. You should be redirected to the dashboard

### 4. Alternative Method
If you're still having issues, you can manually create a profile by running this SQL (replace the values):

```sql
INSERT INTO public.users (id, email, name, role, is_active)
VALUES (
  'your-auth-user-id-here',  -- Get this from auth.users table
  'your-email@example.com',
  'Your Name',
  'citizen',
  true
);
```

## Common Issues:

1. **Table doesn't exist**: Run the main `database-schema.sql` first
2. **Permission denied**: Check RLS policies are properly set
3. **Column doesn't exist**: Run the fix SQL above
4. **Profile still not loading**: Clear browser cache and reload

## Debug Mode:
Open browser Developer Tools (F12) and check the Console tab for error messages when clicking "Create Profile".
