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

export async function POST(request: NextRequest) {
  try {
    console.log('Starting migration of profile data from preferences to student_profiles table...');
    
    // First, get all users with preferences data
    const { data: users, error: usersError } = await supabaseServiceRole
      .from('users')
      .select('id, role, preferences')
      .eq('role', 'student')
      .not('preferences', 'is', null);
    
    if (usersError) {
      throw usersError;
    }
    
    console.log(`Found ${users?.length || 0} students with preferences data`);
    
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with preferences data found to migrate',
        migrated: 0
      });
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const user of users) {
      try {
        const prefs = user.preferences || {};
        
        // Check if user already has a profile in student_profiles table
        const { data: existingProfile, error: profileCheckError } = await supabaseServiceRole
          .from('student_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          // Error other than "not found"
          console.error(`Error checking existing profile for user ${user.id}:`, profileCheckError);
          errors.push(`User ${user.id}: ${profileCheckError.message}`);
          errorCount++;
          continue;
        }
        
        if (existingProfile) {
          console.log(`User ${user.id} already has a profile, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Check if preferences has any meaningful data
        const hasProfileData = prefs.education || 
                              prefs.passingYear || 
                              (prefs.improvementAreas && prefs.improvementAreas.length > 0) || 
                              prefs.careerPlan || 
                              prefs.needsInterviewSupport !== undefined ||
                              prefs.isProfileComplete !== undefined;
        
        if (!hasProfileData) {
          console.log(`User ${user.id} has no meaningful profile data, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Create the profile data
        const profileData = {
          user_id: user.id,
          education: prefs.education || null,
          passing_year: prefs.passingYear || null,
          improvement_areas: prefs.improvementAreas || null,
          career_plan: prefs.careerPlan || null,
          needs_interview_support: Boolean(prefs.needsInterviewSupport),
          is_profile_complete: Boolean(prefs.isProfileComplete),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Insert into student_profiles table
        const { error: insertError } = await supabaseServiceRole
          .from('student_profiles')
          .insert(profileData);
        
        if (insertError) {
          console.error(`Error inserting profile for user ${user.id}:`, insertError);
          errors.push(`User ${user.id}: ${insertError.message}`);
          errorCount++;
          continue;
        }
        
        console.log(`Successfully migrated profile for user ${user.id}`);
        migratedCount++;
        
      } catch (error: any) {
        console.error(`Unexpected error processing user ${user.id}:`, error);
        errors.push(`User ${user.id}: ${error.message}`);
        errorCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`,
      results: {
        total: users.length,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined
      }
    });
    
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Migration failed',
        details: error
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get migration status - show how many users have data in each location
    const { data: usersWithPrefs, error: prefsError } = await supabaseServiceRole
      .from('users')
      .select('id, preferences')
      .eq('role', 'student')
      .not('preferences', 'is', null);
    
    const { data: profilesCount, error: profilesError } = await supabaseServiceRole
      .from('student_profiles')
      .select('user_id', { count: 'exact' });
    
    if (prefsError || profilesError) {
      throw prefsError || profilesError;
    }
    
    const usersWithMeaningfulPrefs = usersWithPrefs?.filter(user => {
      const prefs = user.preferences || {};
      return prefs.education || 
             prefs.passingYear || 
             (prefs.improvementAreas && prefs.improvementAreas.length > 0) || 
             prefs.careerPlan || 
             prefs.needsInterviewSupport !== undefined ||
             prefs.isProfileComplete !== undefined;
    }) || [];
    
    return NextResponse.json({
      status: 'ready',
      stats: {
        usersWithPreferences: usersWithPrefs?.length || 0,
        usersWithMeaningfulPreferences: usersWithMeaningfulPrefs.length,
        studentProfilesCount: profilesCount?.length || 0
      },
      recommendation: usersWithMeaningfulPrefs.length > 0 
        ? 'Migration recommended - users have profile data in preferences'
        : 'No migration needed - no meaningful preference data found'
    });
    
  } catch (error: any) {
    console.error('Migration status error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}