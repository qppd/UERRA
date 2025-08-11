-- Update existing users with missing names
-- Run this in your Supabase SQL Editor

-- Update the user with missing name
UPDATE public.users 
SET name = CASE 
    WHEN email = 'quezon.province.pd@gmail.com' THEN 'Quezon Province PD'
    ELSE COALESCE(name, split_part(email, '@', 1))
END
WHERE name IS NULL OR name = '';

-- Verify the update
SELECT id, email, name, role, agency_id 
FROM public.users 
ORDER BY created_at;
