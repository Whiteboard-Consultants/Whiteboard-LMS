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

const linkExistingSchema = z.object({
  email: z.string().email(),
  registrationCode: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Link existing auth user request:', JSON.stringify(body, null, 2));
    
    const validatedData = linkExistingSchema.parse(body);
    
    // Find existing profile with this registration code and email
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
    
    console.log('Found existing profile for linking:', existingProfile);
    
    // Find the auth user with this email
    const { data: authUsers, error: authListError } = await supabaseServiceRole.auth.admin.listUsers();
    
    if (authListError) {
      console.error('Error listing auth users:', authListError);
      return NextResponse.json({
        error: 'Could not find auth user'
      }, { status: 500 });
    }
    
    const authUser = authUsers.users.find(user => user.email === validatedData.email);
    
    if (!authUser) {
      return NextResponse.json({
        error: 'No auth account found for this email. Please register first.'
      }, { status: 400 });
    }
    
    console.log('Found auth user:', authUser.id);
    
    // Update the existing profile to use the auth user ID and remove registration code
    const { data: updatedProfile, error: updateError } = await supabaseServiceRole
      .from('users')
      .update({
        id: authUser.id, // Update to use auth user ID
        status: 'approved', // Change from pending to approved
        bio: null, // Remove registration code from bio
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProfile.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({
        error: 'Failed to link profile with account'
      }, { status: 500 });
    }
    
    console.log('Profile updated and linked successfully:', updatedProfile);
    
    return NextResponse.json({
      success: true,
      message: 'Existing account linked to profile successfully!',
      user: updatedProfile
    });
    
  } catch (error: any) {
    console.error('Profile linking error:', error);
    
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