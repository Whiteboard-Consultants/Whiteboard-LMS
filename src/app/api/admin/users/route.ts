import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['student', 'instructor', 'admin']),
  status: z.enum(['pending', 'approved']),
  phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Received request body:', JSON.stringify(body, null, 2));
    
    // Validate input
    const validatedData = createUserSchema.parse(body);
    
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));
    
    // Create user profile
    const profileData: any = {
      id: crypto.randomUUID(),
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
      status: validatedData.status || 'pending',
    };
    
    // Add optional fields only if they have values
    if (validatedData.phone) {
      profileData.phone = validatedData.phone;
    }
    
    console.log('Attempting to insert profile data:', profileData);
    
    const { data: userProfile, error: profileError } = await supabaseServiceRole
      .from('users')
      .insert([profileData])
      .select()
      .single();
      
    if (profileError) {
      console.error('Profile creation error:', profileError);
      console.error('Profile error details:', JSON.stringify(profileError, null, 2));
      
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 400 }
      );
    }
    
    console.log('User profile created successfully:', userProfile);

    return NextResponse.json({ 
      success: true, 
      user: userProfile,
      message: `User profile created successfully! The user can now register normally using the sign-up page.`
    });

  } catch (error: any) {
    console.error('User creation error:', error);
    
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