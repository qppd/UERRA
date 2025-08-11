-- UERRA Database Schema
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'agency', 'superadmin')),
    agency_id UUID REFERENCES public.agencies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PNP', 'BFP', 'Hospital', 'MDRMMO', 'RHU', 'Other')),
    contact TEXT,
    location POINT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    assigned_agencies UUID[] DEFAULT '{}',
    emergency_tips TEXT[] DEFAULT '{}',
    suggested_equipment TEXT[] DEFAULT '{}',
    color TEXT DEFAULT '#007bff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    location POINT,
    address TEXT,
    photo_url TEXT,
    video_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'cancelled')),
    assigned_agency_ids UUID[] DEFAULT '{}',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_updates table for tracking status changes
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default agencies
INSERT INTO public.agencies (name, type, contact, address) VALUES
    ('Philippine National Police - Unisan', 'PNP', '(042) 123-4567', 'Municipal Hall, Unisan, Quezon'),
    ('Bureau of Fire Protection - Unisan', 'BFP', '(042) 765-4321', 'Fire Station, Unisan, Quezon'),
    ('Unisan District Hospital', 'Hospital', '(042) 111-2222', 'Hospital Road, Unisan, Quezon'),
    ('Municipal Disaster Risk Reduction and Management Office', 'MDRMMO', '(042) 333-4444', 'Municipal Hall, Unisan, Quezon'),
    ('Rural Health Unit - Unisan', 'RHU', '(042) 555-6666', 'Health Center, Unisan, Quezon')
ON CONFLICT (name) DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, description, assigned_agencies, emergency_tips, suggested_equipment, color) VALUES
    ('Fire Emergency', 'Fire incidents and related emergencies', 
     ARRAY[(SELECT id FROM public.agencies WHERE type = 'BFP' LIMIT 1)],
     ARRAY['Stay low to avoid smoke', 'Use stairs, never elevators', 'Cover nose and mouth with cloth', 'Feel doors before opening'],
     ARRAY['Fire extinguisher', 'Fire hose', 'Ladder', 'Water tank', 'Protective gear'],
     '#ff4757'),
    
    ('Medical Emergency', 'Medical incidents requiring immediate attention',
     ARRAY[(SELECT id FROM public.agencies WHERE type = 'Hospital' LIMIT 1), (SELECT id FROM public.agencies WHERE type = 'RHU' LIMIT 1)],
     ARRAY['Apply pressure to bleeding wounds', 'Keep patient calm and still', 'Do not move injured person unless in immediate danger', 'Monitor breathing and pulse'],
     ARRAY['First aid kit', 'Stretcher', 'Oxygen tank', 'Defibrillator', 'Ambulance'],
     '#2ed573'),
     
    ('Crime/Security', 'Criminal activities and security incidents',
     ARRAY[(SELECT id FROM public.agencies WHERE type = 'PNP' LIMIT 1)],
     ARRAY['Do not confront suspects', 'Move to a safe location', 'Preserve evidence if safe to do so', 'Provide detailed description'],
     ARRAY['Patrol vehicle', 'Communication radio', 'Investigation kit', 'Protective equipment'],
     '#3742fa'),
     
    ('Natural Disaster', 'Floods, typhoons, earthquakes and other natural disasters',
     ARRAY[(SELECT id FROM public.agencies WHERE type = 'MDRMMO' LIMIT 1)],
     ARRAY['Move to higher ground during floods', 'Stock food and clean water', 'Secure important documents', 'Follow evacuation orders'],
     ARRAY['Rescue boat', 'Life vests', 'Emergency supplies', 'Communication equipment', 'Evacuation vehicle'],
     '#ffa502'),
     
    ('Road Accident', 'Vehicle accidents and traffic incidents',
     ARRAY[(SELECT id FROM public.agencies WHERE type = 'PNP' LIMIT 1), (SELECT id FROM public.agencies WHERE type = 'Hospital' LIMIT 1)],
     ARRAY['Turn on hazard lights', 'Move to safety if possible', 'Check for injuries', 'Do not move seriously injured persons'],
     ARRAY['Traffic cones', 'First aid kit', 'Tow truck', 'Ambulance', 'Fire extinguisher'],
     '#ff6b6b')
ON CONFLICT (name) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for agencies table (readable by all authenticated users)
CREATE POLICY "Agencies are viewable by authenticated users" ON public.agencies
    FOR SELECT TO authenticated USING (true);

-- RLS Policies for categories table (readable by all authenticated users)
CREATE POLICY "Categories are viewable by authenticated users" ON public.categories
    FOR SELECT TO authenticated USING (true);

-- RLS Policies for reports table
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for report_updates table
CREATE POLICY "Users can view updates for their reports" ON public.report_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reports 
            WHERE reports.id = report_updates.report_id 
            AND reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add updates to reports" ON public.report_updates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON public.reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_report_updates_report_id ON public.report_updates(report_id);
