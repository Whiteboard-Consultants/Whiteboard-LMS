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

async function checkBlogPost() {
  console.log('🔍 Checking IELTS vs TOEFL blog post...\n');
  
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('id, title, featured_image_url, featured_image, content')
      .ilike('title', '%IELTS%TOEFL%')
      .single();
    
    if (error) {
      console.error('❌ Error fetching post:', error);
      return;
    }
    
    if (!post) {
      console.log('Post not found');
      return;
    }
    
    console.log(`📝 Post: "${post.title}"`);
    console.log(`\n📸 Featured Image URL: ${post.featured_image_url || '(empty)'}`);
    console.log(`📸 Featured Image: ${post.featured_image || '(empty)'}`);
    
    console.log(`\n📄 Content Preview (first 300 chars):`);
    console.log(post.content?.substring(0, 300) || '(empty)');
    
    if (post.content?.includes('img')) {
      console.log('\n✅ Content contains <img> tags (images in editor)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBlogPost();
