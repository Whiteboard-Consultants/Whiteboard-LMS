// Quick admin user creation script
// Run this in your browser console while on your LMS site

// Copy and paste this entire function into your browser console, then call createAdminUser()

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');
    
    // First, let's check if supabase is available
    if (typeof window === 'undefined' || !window.supabase) {
      // Try to get supabase from the global scope or import it
      const supabaseLib = window.supabase || await import('@supabase/supabase-js');
      if (!supabaseLib) {
        console.error('❌ Supabase not found. Make sure you are on your LMS site.');
        return;
      }
    }
    
    // Get the supabase client - try different ways to access it
    let supabase = window.supabase;
    if (!supabase) {
      // Try to access it from React DevTools or global scope
      const reactFiber = document.querySelector('#__next')?._reactInternalFiber ||
                        document.querySelector('#__next')?._reactInternalInstance;
      if (reactFiber) {
        console.log('⚠️  Trying to access supabase from React context...');
      }
      
      // If still not found, we need to use the configuration directly
      if (!supabase) {
        console.error('❌ Could not access supabase client. Please run this on your LMS site while logged in.');
        console.log('💡 Alternative: Use the Supabase Dashboard to create the user instead.');
        return;
      }
    }
    
    // Create auth user with a proper email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@whitedgelms.com',
      password: 'Admin@123456',
      options: {
        data: {
          name: 'Admin User',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user created');
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create database user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        name: 'Admin User',
        email: 'admin@whitedgelms.com',
        role: 'admin',
        status: 'approved',
        isProfileComplete: true,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (userError) {
      console.error('❌ Database error:', userError);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@whitedgelms.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 User ID:', authData.user.id);
    console.log('🎉 You can now log in!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

console.log('Admin user creation function loaded. Run: createAdminUser()');