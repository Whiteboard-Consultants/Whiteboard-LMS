-- SQL to create the coupons table in Supabase
-- Run this in your Supabase SQL Editor

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER CHECK (usage_limit > 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON public.coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Everyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons" ON public.coupons
    FOR SELECT USING (is_active = true);

-- Only admin users can manage coupons
CREATE POLICY "Admin users can manage coupons" ON public.coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON public.coupons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_coupons_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.coupons TO authenticated;
GRANT SELECT ON public.coupons TO anon;
GRANT ALL ON public.coupons TO service_role;

-- Insert some sample coupons (optional)
INSERT INTO public.coupons (code, type, value, usage_limit, is_active) VALUES
('WELCOME10', 'percentage', 10.00, 100, true),
('SAVE20', 'fixed', 20.00, 50, true),
('STUDENT15', 'percentage', 15.00, NULL, true)
ON CONFLICT (code) DO NOTHING;