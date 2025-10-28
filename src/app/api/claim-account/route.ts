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

const claimAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  registrationCode: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Claim account request:', JSON.stringify(body, null, 2));
    
    const validatedData = claimAccountSchema.parse(body);
    
    // Step 1: Find the profile with the registration code
    const { data: existingProfile, error: profileError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .ilike('bio', `%${validatedData.registrationCode}%`)
      .single();
      
    if (profileError) {
      console.error('Error looking up profile:', profileError);
      return NextResponse.json({
        error: 'Profile not found with registration code'
      }, { status: 400 });
    }
    
    console.log('Found existing profile:', existingProfile.id);
    
    // Step 2: Check if this email already has an auth account
    const { data: existingUsers } = await supabaseServiceRole.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(u => u.email === validatedData.email);
    
    if (existingAuthUser) {
      console.log('Auth account already exists, linking to profile');
      
      // Update the profile to clear the registration code and approve it
      const { data: updatedProfile, error: updateError } = await supabaseServiceRole
        .from('users')
        .update({
          status: 'approved',
          bio: null, // Clear registration code
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json({
          error: 'Failed to activate profile'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Account linked successfully! You can now log in with your existing credentials.',
        profile: updatedProfile
      });
    }
    
    // Step 3: No auth account exists, create one normally (not through admin API)
    console.log('No auth account exists, creating new auth account');
    
    // Use regular signup which should work for new emails
    const { createClient: createRegularClient } = await import('@supabase/supabase-js');
    const regularSupabase = createRegularClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: authData, error: authError } = await regularSupabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: existingProfile.name,
          role: existingProfile.role
        }
      }
    });

    if (authError) {
      console.error('Regular signup failed:', authError);
      return NextResponse.json({
        error: `Failed to create account: ${authError.message}`
      }, { status: 500 });
    }
    
    console.log('Auth user created successfully via regular signup:', authData.user?.id);
    
    // Step 4: Update the existing profile or link to the new auth user
    if (authData.user) {
      // The trigger should have created a new profile for the auth user
      // We need to merge the admin-created data with the new profile
      
      // First, delete the old admin-created profile
      await supabaseServiceRole
        .from('users')
        .delete()
        .eq('id', existingProfile.id);
      
      // Then update the new profile with admin data
      const { data: finalProfile, error: finalUpdateError } = await supabaseServiceRole
        .from('users')
        .update({
          name: existingProfile.name,
          role: existingProfile.role,
          status: 'approved',
          phone: existingProfile.phone,
          company: existingProfile.company,
          location: existingProfile.location,
          website: existingProfile.website,
          social_links: existingProfile.social_links,
          preferences: existingProfile.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)
        .select()
        .single();
        
      if (finalUpdateError) {
        console.error('Final profile update error:', finalUpdateError);
        return NextResponse.json({
          error: 'Account created but failed to merge profile data'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Account created and profile claimed successfully!',
        profile: finalProfile,
        authUser: authData.user
      });
    }
    
    return NextResponse.json({
      error: 'Unknown error during account creation'
    }, { status: 500 });
    
  } catch (error: any) {
    console.error('Account claim error:', error);
    
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