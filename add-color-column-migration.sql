-- Migration script to add color column to categories table
-- Run this in your Supabase SQL Editor if the color column is missing

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
