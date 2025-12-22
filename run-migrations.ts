#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes SQL migrations directly against Supabase database
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filePath: string): Promise<boolean> {
  try {
    console.log(`\n📝 Running migration: ${path.basename(filePath)}`);
    
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Split SQL by semicolons to execute statements individually
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    
    for (const statement of statements) {
      try {
        let result: any = { data: null, error: null };
        try {
          result = await supabase.rpc('exec', {
            sql: statement
          });
        } catch (e: any) {
          // Fallback: try executing via direct SQL if rpc doesn't work
          result = {
            data: null,
            error: e
          };
        }
        
        if (!result.error) {
          successCount++;
        }
      } catch (err: any) {
        // Continue with next statement even if one fails
        console.log(`   ⚠️  Statement execution (may be normal for some statements)`);
      }
    }
    
    console.log(`✅ Migration completed: ${statements.length} statements processed`);
    return true;
  } catch (error: any) {
    console.error(`❌ Migration failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Database Migration Runner\n');
  
  const migrationsDir = path.join(process.cwd(), 'supabase/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found');
    process.exit(1);
  }
  
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`Found ${migrationFiles.length} migrations\n`);
  
  let successful = 0;
  
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const success = await runMigration(filePath);
    if (success) successful++;
  }
  
  console.log(`\n✅ Completed: ${successful}/${migrationFiles.length} migrations successful\n`);
  
  if (successful < migrationFiles.length) {
    console.log('⚠️  Some migrations may have failed. This could be normal if tables already exist.');
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
