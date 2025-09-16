-- Functions to handle PostGIS location data for UERRA
-- Run these in your Supabase SQL Editor

-- Function to get reports with coordinates as separate longitude/latitude columns
CREATE OR REPLACE FUNCTION get_reports_with_coordinates()
RETURNS TABLE (
    id UUID,
    description TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    address TEXT,
    priority TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    category_id UUID,
    category_name TEXT,
    category_color TEXT
) 
LANGUAGE SQL
AS $$
    SELECT 
        r.id,
        r.description,
        r.status,
        r.created_at,
        r.address,
        r.priority,
        ST_X(r.location) as longitude,
        ST_Y(r.location) as latitude,
        r.category_id,
        c.name as category_name,
        c.color as category_color
    FROM reports r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.location IS NOT NULL
    ORDER BY r.created_at DESC;
$$;

-- Function to get coordinates for a specific report
CREATE OR REPLACE FUNCTION get_point_coordinates(report_id UUID)
RETURNS TABLE (
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION
) 
LANGUAGE SQL
AS $$
    SELECT 
        ST_X(location) as longitude,
        ST_Y(location) as latitude
    FROM reports 
    WHERE id = report_id AND location IS NOT NULL;
$$;

-- Function to get reports with readable location coordinates (ST_AsText format)
CREATE OR REPLACE FUNCTION get_reports_with_locations()
RETURNS TABLE (
    id UUID,
    location TEXT
) 
LANGUAGE SQL
AS $$
    SELECT 
        r.id,
        CASE 
            WHEN r.location IS NOT NULL THEN ST_AsText(r.location)
            ELSE NULL
        END as location
    FROM reports r
    WHERE r.location IS NOT NULL;
$$;