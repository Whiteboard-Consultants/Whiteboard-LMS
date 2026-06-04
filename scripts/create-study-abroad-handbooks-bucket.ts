/**
 * Creates the private `study-abroad-handbooks` Supabase Storage bucket.
 *
 * Usage (from project root, with .env.local present):
 *   npx tsx scripts/create-study-abroad-handbooks-bucket.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const BUCKET_ID = 'study-abroad-handbooks';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Checking existing buckets...');
  const { data: buckets, error: listError } =
    await supabaseAdmin.storage.listBuckets();

  if (listError) {
    console.error('Failed to list buckets:', listError.message);
    process.exit(1);
  }

  const exists = buckets?.some((b) => b.name === BUCKET_ID);
  if (exists) {
    console.log(`Bucket "${BUCKET_ID}" already exists.`);
  } else {
    console.log(`Creating bucket "${BUCKET_ID}"...`);
    const { data, error } = await supabaseAdmin.storage.createBucket(BUCKET_ID, {
      public: false,
      fileSizeLimit: 15728640, // 15 MB
      allowedMimeTypes: ['application/pdf'],
    });

    if (error) {
      console.error('Failed to create bucket:', error.message);
      console.log(
        '\nIf the API fails, run sql/create-study-abroad-handbooks-bucket.sql in the Supabase SQL Editor instead.'
      );
      process.exit(1);
    }

    console.log('Bucket created:', data);
  }

  console.log('\nNext steps:');
  console.log('  1. Run sql/create-study-abroad-handbooks-bucket.sql in Supabase SQL Editor (policies).');
  console.log('  2. Upload PDFs in Dashboard → Storage → study-abroad-handbooks');
  console.log('     Example path: ireland/study-in-ireland-handbook.pdf');
  console.log('\nVerify:');
  const { data: verify } = await supabaseAdmin.storage.listBuckets();
  const bucket = verify?.find((b) => b.name === BUCKET_ID);
  console.log(
    bucket
      ? `  ✓ ${BUCKET_ID} (public: ${bucket.public})`
      : `  ✗ ${BUCKET_ID} not found`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
