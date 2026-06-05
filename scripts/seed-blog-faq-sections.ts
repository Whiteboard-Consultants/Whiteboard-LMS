/**
 * Seed faq_section JSONB for published blog posts.
 * Run: npx tsx scripts/seed-blog-faq-sections.ts
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { blogDefaultFaqsBySlug } from '../src/lib/blog-default-faqs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Seeding blog FAQ sections...\n');

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const [slug, faqs] of Object.entries(blogDefaultFaqsBySlug)) {
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, faq_section')
      .eq('slug', slug)
      .maybeSingle();

    if (fetchError) {
      console.error(`Error fetching "${slug}":`, fetchError.message);
      continue;
    }

    if (!post) {
      console.warn(`  ⚠ No post found for slug: ${slug}`);
      missing++;
      continue;
    }

    const existing = Array.isArray(post.faq_section) ? post.faq_section : [];
    if (existing.length > 0) {
      console.log(`  ↷ Skipped "${post.title}" — already has ${existing.length} FAQ(s)`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update({ faq_section: faqs, updated_at: new Date().toISOString() })
      .eq('id', post.id);

    if (updateError) {
      console.error(`  ✗ Failed "${slug}":`, updateError.message);
      continue;
    }

    console.log(`  ✓ Updated "${post.title}" with ${faqs.length} FAQs`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, Missing slugs: ${missing}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
