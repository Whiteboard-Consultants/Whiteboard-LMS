-- Create announcements table to store system-wide announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
    target_roles TEXT[] DEFAULT ARRAY['admin', 'instructor', 'student'], -- Which roles can see this announcement
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_priority ON announcements(priority DESC);
CREATE INDEX idx_announcements_expires_at ON announcements(expires_at);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);
CREATE INDEX idx_announcements_target_roles ON announcements USING GIN(target_roles);

-- Insert a sample welcome announcement
INSERT INTO announcements (title, message, type, priority, created_by) 
VALUES (
    'Welcome to Whitedge LMS!', 
    'Our Learning Management System has been successfully migrated to Supabase. Enjoy the improved performance and reliability!',
    'success',
    1,
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
);