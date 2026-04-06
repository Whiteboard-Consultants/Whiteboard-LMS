#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APP_DIR = '/Users/navnitda/Projects/WhitedgeLMS/src/app';

// Directories to process (with their canonical prefixes)
const TARGET_DIRS = [
  { path: '(main)/admin', prefix: '/admin' },
  { path: '(main)/instructor', prefix: '/instructor' },
  { path: '(main)/student', prefix: '/student' },
  { path: '(main)/settings', prefix: '/settings' },
  { path: 'admin', prefix: '/admin' },
  { path: 'auth', prefix: '/auth' },
];

// Pages to skip (test/debug pages)
const SKIP_PATTERNS = [
  'test-env',
  'test-upload',
  'test-simple-upload',
  'test',
  'direct-test',
  'debug-upload',
  'category-demo',
  'auth-diagnostic',
  'cart',
  'logout-test',
  'student/test-cart',
];

// Track stats
let stats = {
  total: 0,
  skipped: 0,
  alreadyHasCanonical: 0,
  serverComponents: 0,
  clientComponents: 0,
  updated: 0,
  errors: 0,
  details: {
    serverComponents: [],
    clientComponents: [],
    skipped: [],
    errors: [],
  },
};

function shouldSkip(filePath) {
  for (const pattern of SKIP_PATTERNS) {
    if (filePath.includes(`/${pattern}/`) || filePath.includes(`/${pattern}.tsx`)) {
      return true;
    }
  }
  return false;
}

function isClientComponent(content) {
  // Check if 'use client' appears in the first few lines (before any component/function definition)
  const lines = content.split('\n');
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    // Stop searching if we hit a function or class definition (outside of import/use client context)
    if (line.startsWith('export default') || line.startsWith('export function') || 
        line.startsWith('export class') || (line.startsWith('function ') && i > 5)) {
      break;
    }
    if (line === "'use client';" || line === "'use client'") {
      return true;
    }
  }
  return false;
}

function hasCanonicalUrl(content) {
  return content.includes('canonical:');
}

function getCanonicalPath(filePath, prefix) {
  // Remove /src/app from the path
  let relativePath = filePath.replace(/^.*?\/src\/app\//, '');
  
  // Remove /page.tsx
  relativePath = relativePath.replace(/\/page\.tsx$/, '');
  
  // Remove route groups like (main), (public), (auth)
  relativePath = relativePath.replace(/\([^)]+\)\//g, '');
  
  // Build canonical path based on the prefix and remaining path
  let canonical = '';
  const prefixName = prefix.substring(1); // Remove leading slash
  
  if (prefix === '/settings') {
    canonical = '/settings';
  } else {
    // Extract the first segment of the relative path
    const segments = relativePath.split('/');
    const firstSegment = segments[0];
    
    // Check if the path starts with the prefix name (e.g., 'admin', 'instructor', 'auth')
    if (firstSegment === prefixName && segments.length > 1) {
      // Path is like 'admin/dashboard' when prefix is '/admin'
      // Build from relativePath directly
      canonical = '/' + relativePath;
    } else if (firstSegment === prefixName && segments.length === 1) {
      // Path is just 'admin' when prefix is '/admin'
      canonical = '/' + firstSegment;
    } else {
      // Path doesn't start with prefix, need to add it
      canonical = prefix + (relativePath ? '/' + relativePath : '');
    }
  }
  
  // Normalize: remove duplicate slashes and trailing slashes
  canonical = canonical.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  
  return canonical;
}

function addMetadataToServerComponent(content, canonical) {
  // This function should ONLY be called for server components
  // Check if metadata already exists
  if (content.includes('export const metadata')) {
    // Add to existing metadata
    const metadataPattern = /(export const metadata:\s*Metadata\s*=\s*\{)/;
    const replacement = `$1\n  alternates: {\n    canonical: '${canonical}',\n  },`;
    
    if (!content.includes('alternates:')) {
      return content.replace(metadataPattern, replacement);
    }
    return content; // Already has alternates
  }
  
  // No metadata export, we need to add it
  // Find the import section
  const importMatch = content.match(/^((?:import[^;]*;|\s)*)/m);
  const importEndIndex = importMatch ? importMatch[0].length : 0;
  const beforeImports = content.substring(0, importEndIndex);
  const afterImports = content.substring(importEndIndex);
  
  // Add metadata import if not present
  let updatedContent = content;
  if (!updatedContent.includes("import type { Metadata }")) {
    updatedContent = "import type { Metadata } from 'next';\n" + updatedContent;
  }
  
  // Add metadata export before the default function
  const metadataExport = `\nexport const metadata: Metadata = {\n  alternates: {\n    canonical: '${canonical}',\n  },\n};\n`;
  
  // Insert metadata after imports and before the default export
  updatedContent = updatedContent.replace(
    /(\n(?:import[^;]*;|\s)*\n+)(export default)/,
    `$1${metadataExport}\n$2`
  );
  
  return updatedContent;
}

function createOrUpdateLayout(dirPath, canonical) {
  const layoutPath = path.join(dirPath, 'layout.tsx');
  const layoutExists = fs.existsSync(layoutPath);
  
  if (layoutExists) {
    const content = fs.readFileSync(layoutPath, 'utf-8');
    if (hasCanonicalUrl(content)) {
      return null; // Already has canonical
    }
    
    // Add to existing layout
    if (content.includes("export const metadata")) {
      // Update existing metadata
      if (!content.includes('alternates:')) {
        const updated = content.replace(
          /(export const metadata[^=]*=\s*\{)/,
          `$1\n  alternates: {\n    canonical: '${canonical}',\n  },`
        );
        fs.writeFileSync(layoutPath, updated);
        return 'updated';
      }
      return null;
    }
  }
  
  // Create new layout or update existing one
  const newLayout = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '${canonical}',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`;
  
  if (layoutExists) {
    // Check if it's a use client layout
    const existingContent = fs.readFileSync(layoutPath, 'utf-8');
    if (existingContent.includes("'use client'")) {
      // Can't add metadata to use client layout, skip
      return 'skip-client-layout';
    }
  }
  
  fs.writeFileSync(layoutPath, newLayout);
  return 'created';
}

function processFile(filePath) {
  try {
    stats.total++;
    
    // Check if should skip
    if (shouldSkip(filePath)) {
      stats.skipped++;
      stats.details.skipped.push(filePath);
      return;
    }
    
    // Read file
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if already has canonical
    if (hasCanonicalUrl(content)) {
      stats.alreadyHasCanonical++;
      return;
    }
    
    // Determine target directory and prefix
    let targetPrefix = null;
    let targetDir = null;
    
    for (const targetConfig of TARGET_DIRS) {
      if (filePath.includes(`/src/app/${targetConfig.path}/`)) {
        targetPrefix = targetConfig.prefix;
        targetDir = targetConfig.path;
        break;
      }
    }
    
    if (!targetPrefix) {
      return;
    }
    
    // Get canonical path
    const canonical = getCanonicalPath(filePath, targetPrefix);
    
    // Check if client or server component
    const isClient = isClientComponent(content);
    
    if (isClient) {
      stats.clientComponents++;
      stats.details.clientComponents.push({
        file: filePath,
        canonical: canonical,
      });
      
      // Create layout in the page's directory
      const pageDir = path.dirname(filePath);
      const result = createOrUpdateLayout(pageDir, canonical);
      if (result === 'created' || result === 'updated') {
        stats.updated++;
      }
    } else {
      stats.serverComponents++;
      stats.details.serverComponents.push({
        file: filePath,
        canonical: canonical,
      });
      
      // Add metadata to page file
      const updated = addMetadataToServerComponent(content, canonical);
      fs.writeFileSync(filePath, updated);
      stats.updated++;
    }
  } catch (err) {
    stats.errors++;
    stats.details.errors.push({
      file: filePath,
      error: err.message,
    });
  }
}

function findAllPages() {
  const pages = [];
  
  for (const targetConfig of TARGET_DIRS) {
    const dir = path.join(APP_DIR, targetConfig.path);
    
    if (!fs.existsSync(dir)) {
      continue;
    }
    
    // Use find command to get all page.tsx files
    try {
      const result = execSync(
        `find "${dir}" -name "page.tsx" -type f`,
        { encoding: 'utf-8' }
      );
      
      result.split('\n').forEach(file => {
        if (file.trim()) {
          pages.push(file.trim());
        }
      });
    } catch (err) {
      // Directory might not exist or other error
    }
  }
  
  return pages;
}

// Main execution
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔍 Starting canonical URL addition process...\n');
console.log(`📁 App directory: ${APP_DIR}`);
if (DRY_RUN) console.log('🔒 DRY RUN MODE - No files will be modified\n');
else console.log('\n');

const allPages = findAllPages();
console.log(`📄 Found ${allPages.length} page files\n`);

// Override file write in dry-run mode
if (DRY_RUN) {
  const oldWriteFileSync = fs.writeFileSync;
  fs.writeFileSync = function(path, content, ...args) {
    // Don't actually write, just track it
    return;
  };
}

// Process each page
allPages.forEach(page => {
  processFile(page);
});

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`Total pages found:           ${stats.total}`);
console.log(`Skipped (test/debug):        ${stats.skipped}`);
console.log(`Already have canonical:      ${stats.alreadyHasCanonical}`);
console.log(`Server components updated:   ${stats.serverComponents}`);
console.log(`Client components updated:   ${stats.clientComponents}`);
console.log(`Total updated:               ${stats.updated}`);
console.log(`Errors:                      ${stats.errors}`);
console.log('='.repeat(60) + '\n');

if (stats.details.serverComponents.length > 0) {
  console.log('✅ SERVER COMPONENTS UPDATED (' + stats.details.serverComponents.length + '):');
  stats.details.serverComponents.forEach(item => {
    console.log(`   ${item.file.replace(APP_DIR, '')} → ${item.canonical}`);
  });
  console.log();
}

if (stats.details.clientComponents.length > 0) {
  console.log('✅ CLIENT COMPONENTS (layout created) (' + stats.details.clientComponents.length + '):');
  stats.details.clientComponents.forEach(item => {
    console.log(`   ${item.file.replace(APP_DIR, '')} → ${item.canonical}`);
  });
  console.log();
}

if (stats.details.errors.length > 0) {
  console.log('❌ ERRORS (' + stats.details.errors.length + '):');
  stats.details.errors.forEach(err => {
    console.log(`   ${err.file}: ${err.error}`);
  });
  console.log();
}

console.log('✨ Process complete!');
