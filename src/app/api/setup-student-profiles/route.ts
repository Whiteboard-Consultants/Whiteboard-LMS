import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  // Return the SQL for manual execution
  const fullSQL = `
-- Create the student_profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    education TEXT,
    passing_year INTEGER,
    improvement_areas TEXT[],
    career_plan TEXT,
    needs_interview_support BOOLEAN DEFAULT false,
    is_profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_is_complete ON public.student_profiles(is_profile_complete);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER handle_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can update own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can insert own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.student_profiles;

-- Create RLS policies
CREATE POLICY "Students can view own profile" ON public.student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile" ON public.student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile" ON public.student_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.student_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.student_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert profiles" ON public.student_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
    `;
    
  return NextResponse.json({
    sql: fullSQL.trim(),
    instructions: [
      '1. Go to your Supabase Dashboard',
      '2. Navigate to SQL Editor',
      '3. Copy and paste the SQL below',
      '4. Click "Run" to execute',
      '5. Use POST method to verify creation'
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    // Test if table exists and is functional
    const { error: testError } = await supabaseServiceRole
      .from('student_profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      return NextResponse.json({
        success: false,
        tableExists: false,
        message: 'student_profiles table does not exist',
        error: testError.message,
        action: 'Use GET method to retrieve SQL for table creation'
      });
    }
    
    // Table exists, test its functionality
    const { data: users } = await supabaseServiceRole
      .from('users')
      .select('id')
      .limit(1);
    
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        tableExists: true,
        message: 'student_profiles table exists but no users available for testing'
      });
    }
    
    // Test full CRUD operations
    const testUserId = users[0].id;
    const { data: profile, error: insertError } = await supabaseServiceRole
      .from('student_profiles')
      .upsert({
        user_id: testUserId,
        education: 'Bachelor of Science in Computer Science',
        passing_year: 2023,
        improvement_areas: ['IELTS', 'Interview Skills', 'Resume Writing'],
        career_plan: 'Software Developer in Canada',
        needs_interview_support: true,
        is_profile_complete: false
      })
      .select()
      .single();
    
    if (insertError) {
      return NextResponse.json({
        success: false,
        tableExists: true,
        error: 'Table exists but has structural issues',
        details: insertError
      }, { status: 500 });
    }
    
    // Test update
    const { error: updateError } = await supabaseServiceRole
      .from('student_profiles')
      .update({ is_profile_complete: true })
      .eq('id', profile.id);
    
    // Clean up test record
    await supabaseServiceRole
      .from('student_profiles')
      .delete()
      .eq('id', profile.id);
    
    if (updateError) {
      return NextResponse.json({
        success: false,
        tableExists: true,
        error: 'Update operation failed',
        details: updateError
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      message: 'student_profiles table is fully functional!',
      testResult: 'All CRUD operations successful',
      structure: {
        table: 'student_profiles',
        columns: [
          'id: UUID (Primary Key)',
          'user_id: UUID (Foreign Key to auth.users, Unique)',
          'education: TEXT',
          'passing_year: INTEGER',
          'improvement_areas: TEXT[] (Array)',
          'career_plan: TEXT',
          'needs_interview_support: BOOLEAN',
          'is_profile_complete: BOOLEAN',
          'created_at: TIMESTAMP WITH TIME ZONE',
          'updated_at: TIMESTAMP WITH TIME ZONE'
        ],
        features: [
          'RLS policies for students and admins',
          'Automatic updated_at trigger',
          'Performance indexes',
          'Foreign key constraints'
        ]
      }
    });
    
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}