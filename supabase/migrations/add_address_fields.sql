-- Database Schema Migration for Address Fields
-- File: supabase/migrations/[timestamp]_add_address_fields_to_student_profiles.sql

-- Add address fields to student_profiles table
ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS apartment TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index on address fields for faster searches
CREATE INDEX IF NOT EXISTS idx_student_profiles_city ON student_profiles(city);
CREATE INDEX IF NOT EXISTS idx_student_profiles_country ON student_profiles(country);

-- Add comment for documentation
COMMENT ON COLUMN student_profiles.address IS 'Street address from Google Maps autocomplete';
COMMENT ON COLUMN student_profiles.apartment IS 'Apartment, suite, unit number etc';
COMMENT ON COLUMN student_profiles.city IS 'City or locality from Google Maps';
COMMENT ON COLUMN student_profiles.state IS 'State or administrative area from Google Maps';
COMMENT ON COLUMN student_profiles.postal_code IS 'Postal or ZIP code';
COMMENT ON COLUMN student_profiles.country IS 'Country name';

-- If you also want to enable RLS for address queries by instructors/admins
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own addresses
CREATE POLICY IF NOT EXISTS "Users can view their own address" ON student_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own addresses
CREATE POLICY IF NOT EXISTS "Users can update their own address" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);
