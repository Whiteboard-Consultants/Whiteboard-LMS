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

const finalTestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  registrationCode: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Final test request:', JSON.stringify(body, null, 2));
    
    const validatedData = finalTestSchema.parse(body);
    
    // Step 1: Find the profile with registration code
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .ilike('bio', `%${validatedData.registrationCode}%`)
      .single();
      
    if (profileError) {
      console.error('Profile not found:', profileError);
      return NextResponse.json({
        error: 'Invalid registration code or email'
      }, { status: 400 });
    }
    
    console.log('Found profile:', profile.id);
    
    // Step 2: Delete the existing profile temporarily
    console.log('Deleting existing profile temporarily...');
    const { error: deleteError } = await supabaseServiceRole
      .from('users')
      .delete()
      .eq('id', profile.id);
      
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({
        error: 'Failed to prepare for registration'
      }, { status: 500 });
    }
    
    // Step 3: Check if auth user already exists first
    console.log('Checking if auth user already exists...');
    const { data: existingUsers } = await supabaseServiceRole.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(u => u.email === validatedData.email);
    
    if (existingAuthUser) {
      console.log('Auth user already exists:', existingAuthUser.id, 'Email confirmed:', existingAuthUser.email_confirmed_at ? 'Yes' : 'No');
      
      if (!existingAuthUser.email_confirmed_at) {
        // User exists but email not confirmed - we can work with this
        console.log('Existing user found but email not confirmed, updating profile...');
        
        // Update the existing auth user's metadata
        const { error: updateAuthError } = await supabaseServiceRole.auth.admin.updateUserById(
          existingAuthUser.id,
          {
            email_confirm: true, // Confirm the email
            user_metadata: {
              name: profile.name,
              role: profile.role
            }
          }
        );
        
        if (updateAuthError) {
          console.error('Failed to update existing auth user:', updateAuthError);
          return NextResponse.json({
            error: 'Failed to activate existing account'
          }, { status: 500 });
        }
        
        // Check if profile exists for this auth user
        const { data: existingProfile, error: profileCheckError } = await supabaseServiceRole
          .from('users')
          .select('*')
          .eq('id', existingAuthUser.id)
          .single();
        
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('Error checking existing auth user profile:', profileCheckError);
          return NextResponse.json({
            error: 'Failed to verify existing account profile'
          }, { status: 500 });
        }
        
        if (existingProfile) {
          // Profile exists, update it with admin data
          console.log('Updating existing profile with admin data...');
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
            .eq('id', existingAuthUser.id)
            .select()
            .single();
            
          if (updateError) {
            console.error('Profile update error:', updateError);
            return NextResponse.json({
              error: 'Failed to update existing profile'
            }, { status: 500 });
          }
          
          // Delete the admin-created profile
          await supabaseServiceRole
            .from('users')
            .delete()
            .eq('id', profile.id);
          
          return NextResponse.json({
            success: true,
            message: 'Existing account activated and linked successfully! You can now log in.',
            profile: updatedProfile,
            authUser: existingAuthUser
          });
        } else {
          // No profile exists, create one with admin data
          console.log('Creating profile for existing auth user...');
          const { data: newProfile, error: createError } = await supabaseServiceRole
            .from('users')
            .insert([{
              id: existingAuthUser.id,
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
            
          if (createError) {
            console.error('Profile creation error:', createError);
            return NextResponse.json({
              error: 'Failed to create profile for existing account'
            }, { status: 500 });
          }
          
          // Delete the admin-created profile
          await supabaseServiceRole
            .from('users')
            .delete()
            .eq('id', profile.id);
          
          return NextResponse.json({
            success: true,
            message: 'Existing account activated successfully! You can now log in.',
            profile: newProfile,
            authUser: existingAuthUser
          });
        }
      } else {
        // User exists and is confirmed - this is a conflict
        return NextResponse.json({
          error: 'An account with this email already exists and is active. Please try logging in instead.'
        }, { status: 400 });
      }
    }
    
    // Step 4: Create auth user using admin method with auto-confirmation
    console.log('Creating auth user with admin method (auto-confirmed)...');
    const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        name: profile.name,
        role: profile.role,
        registration_code: validatedData.registrationCode
      }
    });

    if (authError) {
      console.error('Auth creation failed:', authError);
      
      // Restore the profile
      await supabaseServiceRole
        .from('users')
        .insert([profile]);
        
      return NextResponse.json({
        error: `Failed to create auth account: ${authError.message}`
      }, { status: 500 });
    }
    
    console.log('Auth user created:', authData.user?.id);
    
    // Step 5: Wait for trigger to create profile, then update it
    console.log('Waiting for trigger to create profile...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if profile was created by trigger
    const { data: newProfile, error: checkError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('id', authData.user!.id)
      .single();
    
    if (checkError) {
      console.error('Profile not created by trigger:', checkError);
      return NextResponse.json({
        error: 'Account created but profile setup failed'
      }, { status: 500 });
    }
    
    // Step 6: Update the new profile with admin data
    console.log('Updating profile with admin data...');
    const { data: finalProfile, error: updateError } = await supabaseServiceRole
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
      .eq('id', authData.user!.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({
        error: 'Account created but failed to merge admin data'
      }, { status: 500 });
    }
    
    console.log('Registration completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      profile: finalProfile,
      authUser: authData.user
    });
    
  } catch (error: any) {
    console.error('Final test error:', error);
    
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