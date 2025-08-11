-- Fix for agencies table data structure
-- Run this in your Supabase SQL Editor

-- Current structure issue: 
-- Your data has 'type' values (PNP, BFP, etc.) in the 'name' column
-- and actual locations/addresses in the 'location' column

-- Add the type column if it doesn't exist
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('PNP', 'BFP', 'Hospital', 'MDRMMO', 'RHU', 'Other'));

-- Add a proper address column if it doesn't exist  
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Fix the data structure
-- Step 1: Move current 'name' (which contains type) to 'type' column
-- Step 2: Move current 'location' (which contains address) to 'address' column  
-- Step 3: Set proper names for agencies
UPDATE public.agencies 
SET 
  type = name,
  address = location,
  name = CASE 
    WHEN name = 'PNP' THEN 'Philippine National Police - Unisan'
    WHEN name = 'BFP' THEN 'Bureau of Fire Protection - Unisan'
    WHEN name = 'Hospital' THEN 'Unisan District Hospital'
    WHEN name = 'MDRMMO' THEN 'Municipal Disaster Risk Reduction and Management Office'
    WHEN name = 'RHU' THEN 'Rural Health Unit - Unisan'
    ELSE location  -- fallback to current location value
  END
WHERE type IS NULL;

-- Clear the location column since we moved that data to address
-- (location should be used for coordinates, not text addresses)
UPDATE public.agencies SET location = NULL;

-- Verify the changes
SELECT id, name, type, address, contact FROM public.agencies ORDER BY type;
