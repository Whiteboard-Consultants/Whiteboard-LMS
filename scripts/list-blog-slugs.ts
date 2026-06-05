import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function main() {
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await s.from('posts').select('slug, title, faq_section').order('title');
  for (const p of data ?? []) {
    const faqCount = Array.isArray(p.faq_section) ? p.faq_section.length : 0;
    console.log(`${p.slug} (${faqCount} FAQs) — ${p.title}`);
  }
}

main();
