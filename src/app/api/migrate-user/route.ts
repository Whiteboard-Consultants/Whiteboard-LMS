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

const migrateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['student', 'instructor']),
  registrationCode: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Migrate user request:', JSON.stringify(body, null, 2));
    
    const validatedData = migrateUserSchema.parse(body);
    
    // Step 1: Find and backup the existing profile
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
    
    console.log('Found existing profile, backing up data:', existingProfile);
    
    // Step 2: Delete the existing profile temporarily
    const { error: deleteError } = await supabaseServiceRole
      .from('users')
      .delete()
      .eq('id', existingProfile.id);
      
    if (deleteError) {
      console.error('Error deleting existing profile:', deleteError);
      return NextResponse.json({
        error: 'Failed to prepare for user migration'
      }, { status: 500 });
    }
    
    console.log('Existing profile deleted, creating auth user');
    
    // Step 3: Create auth user using service role (bypass normal constraints)
    const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: validatedData.name,
        role: validatedData.role
      }
    });

    if (authError) {
      console.error('Auth user creation failed, restoring profile:', authError);
      
      // Restore the original profile if auth creation fails
      await supabaseServiceRole
        .from('users')
        .insert([existingProfile]);
        
      return NextResponse.json({
        error: `Failed to create auth account: ${authError.message}`
      }, { status: 500 });
    }
    
    console.log('Auth user created successfully:', authData.user?.id);
    
    // Step 4: Check if profile was auto-created by trigger, if not create it
    let { data: newProfile, error: profileCheckError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('id', authData.user!.id)
      .single();
    
    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // No profile exists, create one
      console.log('No profile auto-created, creating new profile');
      const { data: createdProfile, error: createProfileError } = await supabaseServiceRole
        .from('users')
        .insert([{
          id: authData.user!.id,
          email: validatedData.email,
          name: existingProfile.name,
          role: existingProfile.role,
          status: 'approved',
          phone: existingProfile.phone,
          company: existingProfile.company,
          location: existingProfile.location,
          website: existingProfile.website,
          social_links: existingProfile.social_links,
          preferences: existingProfile.preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (createProfileError) {
        console.error('Profile creation error:', createProfileError);
        return NextResponse.json({
          error: 'Account created but failed to create profile'
        }, { status: 500 });
      }
      
      newProfile = createdProfile;
    } else if (profileCheckError) {
      console.error('Unexpected profile check error:', profileCheckError);
      return NextResponse.json({
        error: 'Account created but failed to verify profile'
      }, { status: 500 });
    } else {
      // Profile exists, update it with admin data
      console.log('Profile auto-created, updating with admin data');
      const { data: updatedProfile, error: updateError } = await supabaseServiceRole
        .from('users')
        .update({
          name: existingProfile.name, // Use admin-created name
          role: existingProfile.role, // Use admin-created role  
          status: 'approved', // Set to approved
          phone: existingProfile.phone,
          bio: null, // Clear registration code
          company: existingProfile.company,
          location: existingProfile.location,
          website: existingProfile.website,
          social_links: existingProfile.social_links,
          preferences: existingProfile.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user!.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json({
          error: 'Account created but failed to migrate profile data'
        }, { status: 500 });
      }
      
      newProfile = updatedProfile;
    }
    
    console.log('Profile migrated successfully:', newProfile);
    
    return NextResponse.json({
      success: true,
      message: 'Account created and profile migrated successfully!',
      user: newProfile,
      authUser: authData.user
    });
    
  } catch (error: any) {
    console.error('User migration error:', error);
    
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