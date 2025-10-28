import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createUploadsBucket() {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const uploadsExists = buckets.find(bucket => bucket.name === 'uploads');
    
    if (uploadsExists) {
      console.log('✅ Uploads bucket already exists');
      return;
    }

    // Create the bucket
    const { data, error } = await supabaseAdmin.storage.createBucket('uploads', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      return;
    }

    console.log('✅ Successfully created uploads bucket:', data);

    // Set up RLS policy to allow public uploads
    const { error: policyError } = await supabaseAdmin.storage
      .from('uploads')
      .createSignedUploadUrl('test.jpg'); // This will help test permissions

    if (policyError) {
      console.log('⚠️  Note: You may need to set up storage policies in your Supabase dashboard');
      console.log('   Go to Storage > uploads bucket > Policies to configure access');
    } else {
      console.log('✅ Bucket permissions verified');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createUploadsBucket();