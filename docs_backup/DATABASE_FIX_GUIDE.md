# Database Structure Fix

If you're encountering database-related issues, this guide will help you fix common problems.

## Common Issues:

### Issue 1: "column categories.color does not exist"
This happens when the categories table is missing the color column.

**Fix:**
```sql
-- Add color column to categories table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'color' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN color TEXT DEFAULT '#007bff';
        
        -- Update existing categories with appropriate colors
        UPDATE public.categories 
        SET color = CASE 
            WHEN name = 'Fire Emergency' THEN '#ff4757'
            WHEN name = 'Medical Emergency' THEN '#2ed573'
            WHEN name = 'Crime/Security' THEN '#3742fa'
            WHEN name = 'Natural Disaster' THEN '#ffa502'
            WHEN name = 'Road Accident' THEN '#ff6b6b'
            ELSE '#007bff'
        END;
        
        RAISE NOTICE 'Color column added to categories table successfully';
    ELSE
        RAISE NOTICE 'Color column already exists in categories table';
    END IF;
END $$;
```

### Issue 2: Missing columns in users table
This happens when the users table is missing required columns.

**Fix:**
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
