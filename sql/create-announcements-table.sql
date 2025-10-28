-- SQL to create the announcements table in Supabase
-- Run this in your Supabase SQL Editor

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Info', 'Success', 'Warning', 'Destructive')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements("createdAt");
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);

-- Enable Row Level Security (RLS)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Everyone can view announcements
CREATE POLICY "Anyone can view announcements" ON announcements
    FOR SELECT USING (true);

-- Only admin users can manage announcements
CREATE POLICY "Admin users can manage announcements" ON announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_announcements_updated_at();

-- Grant necessary permissions
GRANT SELECT ON announcements TO authenticated;
GRANT SELECT ON announcements TO anon;
GRANT ALL ON announcements TO service_role;

-- Insert some sample announcements (optional)
INSERT INTO announcements (title, content, type) VALUES
('Welcome to WhitedgeLMS', 'Your learning management system is now powered by Supabase!', 'Success'),
('System Migration Complete', 'We have successfully migrated from Firebase to Supabase for better performance and reliability.', 'Info')
ON CONFLICT DO NOTHING;