// Simple admin user creation via Supabase Dashboard
// This is the most reliable method

console.log('🔧 Creating Admin User - Step by Step Guide');
console.log('');
console.log('1️⃣ Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2️⃣ Select your WhitedgeLMS project');
console.log('3️⃣ Go to Authentication > Users');
console.log('4️⃣ Click "Add user" button');
console.log('5️⃣ Enter these details:');
console.log('   📧 Email: admin@whitedgelms.com');
console.log('   🔑 Password: Admin@123456');
console.log('   ✅ Auto Confirm User: YES');
console.log('6️⃣ Click "Create user"');
console.log('');
console.log('7️⃣ Copy the User ID from the created user');
console.log('8️⃣ Go to Database > Table Editor > users table');
console.log('9️⃣ Click "Insert" > "Insert row"');
console.log('🔟 Fill in these values:');
console.log('   id: [paste the User ID from step 7]');
console.log('   name: Admin User');
console.log('   email: admin@whitedgelms.com');
console.log('   role: admin');
console.log('   status: approved');
console.log('   isProfileComplete: true');
console.log('   createdAt: [leave empty - will auto-fill]');
console.log('');
console.log('✅ Then you can login with:');
console.log('📧 Email: admin@whitedgelms.com');
console.log('🔑 Password: Admin@123456');
console.log('');
console.log('🚀 Alternative: Run the automated script below if supabase is available');

// Automated version if supabase client is accessible
async function createAdminUserAutomated() {
  try {
    // Try to find supabase client in various ways
    let supabase = null;
    
    // Method 1: Global window object
    if (window && window.supabase) {
      supabase = window.supabase;
    }
    
    // Method 2: Try to import from module if available
    if (!supabase && window && window.require) {
      try {
        const { createClient } = window.require('@supabase/supabase-js');
        // You'll need your actual Supabase URL and anon key here
        console.log('❌ Need Supabase credentials - use manual method above instead');
        return;
      } catch (e) {
        // Module not available
      }
    }
    
    // Method 3: Check React DevTools or app context
    if (!supabase) {
      console.log('🔍 Searching for supabase client in app context...');
      
      // Try to find React root
      const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
      if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('📱 Found React root, but cannot safely access context from console');
        console.log('📋 Please use the manual steps above instead');
        return;
      }
    }
    
    if (!supabase) {
      console.log('❌ Supabase client not accessible from console');
      console.log('📋 Please follow the manual steps above');
      return;
    }
    
    console.log('🚀 Found supabase client, creating admin user...');
    
    // Create auth user
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
      console.log('📋 Please try the manual method above');
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
      console.log('📋 You may need to manually add the user record to the database');
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@whitedgelms.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 User ID:', authData.user.id);
    console.log('🎉 You can now log in!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('📋 Please use the manual method above');
  }
}

console.log('⚡ To try the automated method: createAdminUserAutomated()');