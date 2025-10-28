-- SQL to create the carts table in Supabase
-- Run this in your Supabase SQL Editor

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    courses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_updated_at ON carts(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own cart
CREATE POLICY "Users can view their own cart" ON carts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart" ON carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON carts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart" ON carts
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON carts TO authenticated;
GRANT ALL ON carts TO service_role;