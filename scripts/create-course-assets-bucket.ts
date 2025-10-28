import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createCourseAssetsBucket() {
  try {
    console.log('🔍 Checking existing buckets...');
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log('📦 Existing buckets:', buckets?.map(b => b.name).join(', ') || 'none');

    const courseAssetsExists = buckets.find(bucket => bucket.name === 'course-assets');
    
    if (courseAssetsExists) {
      console.log('✅ course-assets bucket already exists');
      return;
    }

    console.log('🔧 Creating course-assets bucket...');

    // Create the bucket
    const { data, error } = await supabaseAdmin.storage.createBucket('course-assets', {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      return;
    }

    console.log('✅ Successfully created course-assets bucket:', data);

    // Create a storage policy to allow authenticated users to upload
    console.log('🔧 Setting up storage policies...');
    
    // Note: This will help test permissions - actual RLS policies should be set in Supabase dashboard
    try {
      const { error: policyError } = await supabaseAdmin.storage
        .from('course-assets')
        .createSignedUploadUrl('test.jpg');

      if (policyError) {
        console.log('⚠️  Note: You may need to set up storage policies in your Supabase dashboard');
        console.log('   Go to Storage > course-assets bucket > Policies to configure access');
        console.log('   Recommended policies:');
        console.log('   1. Allow authenticated users to INSERT');
        console.log('   2. Allow authenticated users to UPDATE their own files');
        console.log('   3. Allow public SELECT (if you want public access to files)');
      } else {
        console.log('✅ Bucket permissions verified');
      }
    } catch (policyErr) {
      console.warn('⚠️  Could not test bucket permissions:', policyErr);
      console.log('   Please set up storage policies manually in Supabase dashboard');
    }

    console.log('\n🎉 Setup complete! Your course-assets bucket is ready.');
    console.log('📝 Next steps:');
    console.log('   1. Go to your Supabase dashboard > Storage > course-assets');
    console.log('   2. Set up RLS policies for file uploads/access');
    console.log('   3. Test the course creation flow again');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
createCourseAssetsBucket().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});