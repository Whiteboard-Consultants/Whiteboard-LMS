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

const completeSetupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  setupToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Complete setup request:', JSON.stringify(body, null, 2));
    
    const validatedData = completeSetupSchema.parse(body);
    
    // Step 1: Find and validate the setup token
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .eq('status', 'approved')
      .ilike('bio', `%${validatedData.setupToken}%`)
      .single();
      
    if (profileError) {
      console.error('Error looking up profile with setup token:', profileError);
      return NextResponse.json({
        error: 'Invalid setup token or email'
      }, { status: 400 });
    }
    
    console.log('Found activated profile for setup completion:', profile.id);
    
    // Step 2: Create auth account with a unique approach
    // First, try normal signup (this will create a new user with a new UUID)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: profile.name,
          role: profile.role,
          linkToProfileId: profile.id // Custom metadata to link back
        }
      }
    });

    if (authError) {
      console.error('Auth signup failed:', authError);
      return NextResponse.json({
        error: `Failed to create login credentials: ${authError.message}`
      }, { status: 500 });
    }
    
    console.log('Auth user created successfully:', authData.user?.id);
    
    // Step 3: Handle the profile linking
    if (authData.user) {
      // The auth creation will trigger creation of a new profile
      // We need to merge the admin profile data into the new profile and delete the old one
      
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the new profile created by the trigger
      const { data: newProfile, error: newProfileError } = await supabaseServiceRole
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (newProfileError) {
        console.error('New profile not found, creating manually:', newProfileError);
        
        // Create the profile manually if trigger failed
        const { data: manualProfile, error: manualError } = await supabaseServiceRole
          .from('users')
          .insert([{
            id: authData.user.id,
            email: validatedData.email,
            name: profile.name,
            role: profile.role,
            status: 'approved',
            phone: profile.phone,
            company: profile.company,
            location: profile.location,
            website: profile.website,
            social_links: profile.social_links,
            preferences: profile.preferences,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (manualError) {
          console.error('Manual profile creation failed:', manualError);
          // Clean up auth user
          await supabaseServiceRole.auth.admin.deleteUser(authData.user.id);
          return NextResponse.json({
            error: 'Failed to complete account setup'
          }, { status: 500 });
        }
        
        // Delete the old admin profile
        await supabaseServiceRole
          .from('users')
          .delete()
          .eq('id', profile.id);
        
        return NextResponse.json({
          success: true,
          message: 'Account setup completed successfully! You can now log in.',
          profile: manualProfile,
          authUser: authData.user
        });
      }
      
      // Update the new profile with admin data
      const { data: updatedProfile, error: updateError } = await supabaseServiceRole
        .from('users')
        .update({
          name: profile.name,
          role: profile.role,
          status: 'approved',
          phone: profile.phone,
          company: profile.company,
          location: profile.location,
          website: profile.website,
          social_links: profile.social_links,
          preferences: profile.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json({
          error: 'Account created but failed to merge profile data'
        }, { status: 500 });
      }
      
      // Delete the old admin profile
      await supabaseServiceRole
        .from('users')
        .delete()
        .eq('id', profile.id);
      
      return NextResponse.json({
        success: true,
        message: 'Account setup completed successfully! You can now log in.',
        profile: updatedProfile,
        authUser: authData.user
      });
    }
    
    return NextResponse.json({
      error: 'Unknown error during account setup'
    }, { status: 500 });
    
  } catch (error: any) {
    console.error('Setup completion error:', error);
    
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