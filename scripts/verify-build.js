const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const required = [
  'index.html',
  '404.html',
  '.nojekyll',
  'manifest.webmanifest',
  'service-worker.js',
  'assets/app.css',
  'assets/app.js',
  'assets/icon.svg',
  'embed/melato-concierge-widget.js'
];

const missing = required.filter(file => !fs.existsSync(path.join(dist, file)));
if (missing.length) {
  console.error(`Build verification failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const references = [
  'assets/app.css',
  'embed/melato-concierge-widget.js',
  'assets/app.js',
  'manifest.webmanifest'
];
const broken = references.filter(reference => !index.includes(reference));
if (broken.length) {
  console.error(`Build verification failed. index.html does not reference: ${broken.join(', ')}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
if (!manifest.icons || !manifest.icons.length) {
  console.error('Build verification failed. manifest.webmanifest has no icons.');
  process.exit(1);
}

console.log(`Build verification passed with ${required.length} required files.`);
