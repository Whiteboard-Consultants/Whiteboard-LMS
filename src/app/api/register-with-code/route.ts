import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Create regular Supabase client for auth operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

const registerWithCodeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['student', 'instructor']),
  registrationCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Registration with code request:', JSON.stringify(body, null, 2));
    
    const validatedData = registerWithCodeSchema.parse(body);
    
    // If registration code is provided, validate it first but don't create auth user yet
    if (validatedData.registrationCode) {
      console.log('Validating registration code:', validatedData.registrationCode);
      
      // Find existing profile with this registration code
      const { data: existingProfile, error: profileError } = await supabaseServiceRole
        .from('users')
        .select('*')
        .eq('email', validatedData.email)
        .ilike('bio', `%${validatedData.registrationCode}%`)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error looking up profile:', profileError);
        return NextResponse.json({
          error: 'Error validating registration code'
        }, { status: 500 });
      }
      
      if (!existingProfile) {
        return NextResponse.json({
          error: 'Invalid registration code or email does not match'
        }, { status: 400 });
      }
      
      console.log('Found existing profile, proceeding with normal registration');
      
      // Return success for validation - the frontend will handle normal registration
      // and then call a link-profile endpoint
      return NextResponse.json({
        success: true,
        profileExists: true,
        message: 'Registration code validated. Proceeding with account creation.',
        profileId: existingProfile.id
      });
    }
    
    // If no registration code, return error (this endpoint is only for code registration)
    return NextResponse.json({
      error: 'Registration code is required for this endpoint'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}