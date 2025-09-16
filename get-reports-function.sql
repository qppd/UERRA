-- Function to get reports with readable coordinates
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_reports_with_coordinates()
RETURNS TABLE (
    id UUID,
    description TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    priority TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    category_name TEXT,
    category_color TEXT,
    category_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.description,
        r.status,
        r.created_at,
        r.priority,
        ST_X(r.location) as longitude,
        ST_Y(r.location) as latitude,
        c.name as category_name,
        c.color as category_color,
        c.id as category_id
    FROM public.reports r
    LEFT JOIN public.categories c ON r.category_id = c.id
    WHERE r.location IS NOT NULL
    ORDER BY r.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_reports_with_coordinates() TO authenticated;