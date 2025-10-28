#!/usr/bin/env node
/**
 * Simple favicon generator
 * - Reads `public/logo.png` or `public/favicon.png` as source
 * - Outputs a set of favicon-sized PNGs into `public/`
 * - Uses jimp (no native deps)
 */
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const pngToIco = require('png-to-ico');

const PUBLIC = path.join(__dirname, '..', 'public');
const candidates = ['logo.png', 'favicon.png', 'og-image-home.png'];

async function findSource() {
  for (const c of candidates) {
    const p = path.join(PUBLIC, c);
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No source image found in public/. Expected one of: ' + candidates.join(', '));
}

async function run() {
  try {
    const src = await findSource();
    console.log('Using source image:', src);
    const img = await Jimp.read(src);

    const outputs = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-48x48.png', size: 48 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
    ];

    for (const o of outputs) {
      const outPath = path.join(PUBLIC, o.name);
      const clone = img.clone();
      // Resize with cover to maintain aspect and fill background when needed
      clone.cover(o.size, o.size, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
      await clone.writeAsync(outPath);
      console.log('Wrote', outPath);
    }

    // Create favicon.ico from 16/32/48 PNGs (png-to-ico expects buffers or file paths)
    try {
      const icoSources = [
        path.join(PUBLIC, 'favicon-16x16.png'),
        path.join(PUBLIC, 'favicon-32x32.png'),
        path.join(PUBLIC, 'favicon-48x48.png'),
      ];
      const icoBuffer = await pngToIco(icoSources);
      const icoPath = path.join(PUBLIC, 'favicon.ico');
      fs.writeFileSync(icoPath, icoBuffer);
      console.log('Wrote', icoPath);
    } catch (icoErr) {
      console.warn('Could not create favicon.ico:', icoErr && icoErr.message ? icoErr.message : icoErr);
    }

    console.log('Favicon generation complete.');
  } catch (err) {
    console.error('Error generating favicons:', err.message || err);
    process.exitCode = 1;
  }
}

run();
