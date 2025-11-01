#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogPosts() {
  console.log('🔍 Checking blog posts...\n');
  
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, featured_image_url, featured_image, featured, status')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    if (!posts || posts.length === 0) {
      console.log('No posts found');
      return;
    }
    
    console.log(`Found ${posts.length} posts:\n`);
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Featured: ${post.featured}`);
      console.log(`   Featured Image URL: ${post.featured_image_url || '(empty)'}`);
      console.log(`   Featured Image: ${post.featured_image || '(empty)'}`);
      
      if (post.featured_image_url) {
        // Check if URL is valid
        const isValidUrl = post.featured_image_url.startsWith('http');
        console.log(`   URL Valid: ${isValidUrl ? '✅' : '❌'}`);
        
        // Check if it's from course-assets bucket
        const isCourseAssets = post.featured_image_url.includes('course-assets');
        const isUploads = post.featured_image_url.includes('/uploads');
        console.log(`   Bucket: ${isCourseAssets ? '📦 course-assets' : isUploads ? '📦 uploads' : '❓ unknown'}`);
      }
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBlogPosts();
