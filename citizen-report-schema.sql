-- Enhanced Schema for Citizen-Only Report Submission
-- UERRA (Unisan Emergency Reporting and Response App)
-- This schema ensures only citizens can submit reports while maintaining security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enhanced reports table with citizen-specific validation
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    location GEOMETRY(POINT, 4326), -- PostGIS point for geographical coordinates (WGS84)
    address TEXT,
    photo_url TEXT,
    video_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'cancelled')),
    assigned_agency_ids UUID[] DEFAULT '{}',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Citizen-specific fields
    citizen_contact TEXT, -- Contact number for follow-up
    is_anonymous BOOLEAN DEFAULT false, -- Allow anonymous reporting
    emergency_level TEXT DEFAULT 'standard' CHECK (emergency_level IN ('standard', 'urgent', 'life_threatening')),
    
    -- Metadata
    submitted_via TEXT DEFAULT 'web' CHECK (submitted_via IN ('web', 'mobile', 'sms')),
    ip_address INET, -- For tracking and security
    user_agent TEXT, -- Browser/device info
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
    -- Convert location column to PostGIS geometry if it exists as POINT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'location' AND data_type = 'point') THEN
        -- Create temporary column
        ALTER TABLE public.reports ADD COLUMN location_temp GEOMETRY(POINT, 4326);
        
        -- Convert existing POINT data to PostGIS geometry (if any data exists)
        UPDATE public.reports SET location_temp = ST_SetSRID(ST_MakePoint(location[0], location[1]), 4326) WHERE location IS NOT NULL;
        
        -- Drop old column and rename new one
        ALTER TABLE public.reports DROP COLUMN location;
        ALTER TABLE public.reports RENAME COLUMN location_temp TO location;
    END IF;
    
    -- Add location column as PostGIS geometry if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'location') THEN
        ALTER TABLE public.reports ADD COLUMN location GEOMETRY(POINT, 4326);
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'priority') THEN
        ALTER TABLE public.reports ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));
    END IF;
    
    -- Add emergency_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'emergency_level') THEN
        ALTER TABLE public.reports ADD COLUMN emergency_level TEXT DEFAULT 'standard' CHECK (emergency_level IN ('standard', 'urgent', 'life_threatening'));
    END IF;
    
    -- Add citizen_contact column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'citizen_contact') THEN
        ALTER TABLE public.reports ADD COLUMN citizen_contact TEXT;
    END IF;
    
    -- Add is_anonymous column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'is_anonymous') THEN
        ALTER TABLE public.reports ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
    END IF;
    
    -- Add submitted_via column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'submitted_via') THEN
        ALTER TABLE public.reports ADD COLUMN submitted_via TEXT DEFAULT 'web' CHECK (submitted_via IN ('web', 'mobile', 'sms'));
    END IF;
    
    -- Add ip_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'ip_address') THEN
        ALTER TABLE public.reports ADD COLUMN ip_address INET;
    END IF;
    
    -- Add user_agent column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'user_agent') THEN
        ALTER TABLE public.reports ADD COLUMN user_agent TEXT;
    END IF;
END $$;

-- Enhanced report_updates table for tracking status changes
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    update_type TEXT DEFAULT 'status_change' CHECK (update_type IN ('status_change', 'note', 'assignment', 'location_update')),
    is_public BOOLEAN DEFAULT true, -- Whether citizen can see this update
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Citizen report verification table for quality control
CREATE TABLE IF NOT EXISTS public.report_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    verified_by UUID REFERENCES public.users(id) NOT NULL,
    verification_status TEXT CHECK (verification_status IN ('verified', 'false_alarm', 'duplicate', 'spam')),
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced RLS Policies - CITIZEN ONLY SUBMISSION
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own reports" ON public.reports;
DROP POLICY IF EXISTS "Citizens can create reports" ON public.reports;
DROP POLICY IF EXISTS "Only citizens can submit reports" ON public.reports;

-- STRICT CITIZEN-ONLY REPORT SUBMISSION POLICY
CREATE POLICY "Only citizens can submit reports" ON public.reports
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'citizen'
        )
    );

-- Citizens can view their own reports
CREATE POLICY "Citizens can view their own reports" ON public.reports
    FOR SELECT USING (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'citizen'
        )
    );

-- Citizens can update their own pending reports only
CREATE POLICY "Citizens can update their own pending reports" ON public.reports
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND status = 'pending'
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'citizen'
        )
    );

-- Agencies and admins can view all reports (existing policy)
CREATE POLICY "Agencies and admins can view reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'agency', 'superadmin')
        )
    );

-- Agencies and admins can update reports they're assigned to
CREATE POLICY "Agencies can update assigned reports" ON public.reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'agency', 'superadmin')
        )
    );

-- Report Updates Policies
CREATE POLICY "Citizens can view updates for their reports" ON public.report_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reports 
            WHERE reports.id = report_updates.report_id 
            AND reports.user_id = auth.uid()
            AND report_updates.is_public = true
        )
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'agency', 'superadmin')
        )
    );

CREATE POLICY "All authenticated users can add report updates" ON public.report_updates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Report Verification Policies (Admin/Agency only)
CREATE POLICY "Admins and agencies can manage verifications" ON public.report_verifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'agency', 'superadmin')
        )
    );

-- Function to validate citizen role before report insertion
CREATE OR REPLACE FUNCTION validate_citizen_report()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is a citizen
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = NEW.user_id 
        AND users.role = 'citizen'
    ) THEN
        RAISE EXCEPTION 'Only citizens can submit emergency reports';
    END IF;
    
    -- Set default values
    NEW.status := COALESCE(NEW.status, 'pending');
    NEW.priority := COALESCE(NEW.priority, 'medium');
    NEW.submitted_via := COALESCE(NEW.submitted_via, 'web');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce citizen-only submission
CREATE TRIGGER enforce_citizen_only_reports
    BEFORE INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION validate_citizen_report();

-- Function to auto-assign agencies based on category
CREATE OR REPLACE FUNCTION auto_assign_agencies()
RETURNS TRIGGER AS $$
BEGIN
    -- Get assigned agencies from category and update the report
    UPDATE public.reports 
    SET assigned_agency_ids = (
        SELECT assigned_agencies 
        FROM public.categories 
        WHERE id = NEW.category_id
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign agencies on report creation
CREATE TRIGGER auto_assign_agencies_trigger
    AFTER INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_agencies();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status_priority ON public.reports(status, priority);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reports_emergency_level ON public.reports(emergency_level);
CREATE INDEX IF NOT EXISTS idx_reports_created_at_desc ON public.reports(created_at DESC);

-- Create view for citizen reports with category information
CREATE OR REPLACE VIEW citizen_reports_view AS
SELECT 
    r.*,
    c.name as category_name,
    c.emergency_tips,
    u.name as citizen_name,
    u.email as citizen_email,
    ST_X(r.location) as longitude,
    ST_Y(r.location) as latitude
FROM public.reports r
JOIN public.categories c ON r.category_id = c.id
JOIN public.users u ON r.user_id = u.id
WHERE u.role = 'citizen';

-- Grant necessary permissions
GRANT SELECT ON citizen_reports_view TO authenticated;
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT SELECT, INSERT ON public.report_updates TO authenticated;
