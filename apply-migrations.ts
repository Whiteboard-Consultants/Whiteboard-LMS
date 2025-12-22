#!/usr/bin/env node

/**
 * Apply Migrations Using Supabase HTTP API
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

async function executeSql(sql: string): Promise<any> {
  const headers: HeadersInit = {
    'apikey': supabaseKey || '',
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}

async function applyMigrations() {
  console.log('🚀 Applying Database Migrations\n');
  
  const migrationsDir = path.join(process.cwd(), 'supabase/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    console.log(`📝 Applying: ${file}`);
    
    try {
      await executeSql(sql);
      console.log(`✅ Success\n`);
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

applyMigrations().catch(console.error);
