-- Fix for users table - add missing columns
-- Run this in your Supabase SQL Editor

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

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
