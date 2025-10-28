import { supabase } from '../src/lib/supabase';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@whitedge.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    });

    if (authError) {
      throw authError;
    }

    console.log('Auth user created:', authData.user?.id);

    // Create database user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        name: 'Admin User',
        email: 'admin@whitedge.com',
        role: 'admin',
        status: 'approved',
        isProfileComplete: true,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@whitedge.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 User ID:', authData.user.id);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();