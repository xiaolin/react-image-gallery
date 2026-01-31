#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔨 Building package...${NC}"
npm run build

echo -e "${YELLOW}📦 Creating tarball...${NC}"
TARBALL=$(npm pack --pack-destination /tmp 2>&1 | tail -1)
TARBALL_PATH="/tmp/$TARBALL"
echo "Created: $TARBALL_PATH"

# Create temp directory for test project
TEST_DIR=$(mktemp -d)
echo -e "${YELLOW}📁 Creating test project in $TEST_DIR${NC}"

cd "$TEST_DIR"

# Initialize test project
cat > package.json << 'EOF'
{
  "name": "test-react-image-gallery",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test:esm": "node test-esm.mjs",
    "test:cjs": "node test-cjs.cjs"
  }
}
EOF

# Install the tarball and peer dependencies
echo -e "${YELLOW}📥 Installing package from tarball...${NC}"
npm install "$TARBALL_PATH" react react-dom --silent

# Test ES Module import
echo -e "${YELLOW}🧪 Testing ES Module import...${NC}"
cat > test-esm.mjs << 'EOF'
import ImageGallery from 'react-image-gallery';

// Check default export exists and is a component
if (!ImageGallery) {
  console.error('❌ Default export is undefined');
  process.exit(1);
}

if (typeof ImageGallery !== 'object' && typeof ImageGallery !== 'function') {
  console.error('❌ Default export is not a valid React component');
  process.exit(1);
}

// Check it's a forwardRef component (has $$typeof)
if (!ImageGallery.$$typeof) {
  console.error('❌ ImageGallery is not a React forwardRef component');
  process.exit(1);
}

console.log('✅ ES Module import works correctly');
console.log('   - Default export exists');
console.log('   - Is a React forwardRef component');
EOF

node test-esm.mjs

# Test CommonJS require
echo -e "${YELLOW}🧪 Testing CommonJS require...${NC}"
cat > test-cjs.cjs << 'EOF'
const ImageGallery = require('react-image-gallery');

// Check default export exists
const Component = ImageGallery.default || ImageGallery;

if (!Component) {
  console.error('❌ Default export is undefined');
  process.exit(1);
}

if (typeof Component !== 'object' && typeof Component !== 'function') {
  console.error('❌ Default export is not a valid React component');
  process.exit(1);
}

console.log('✅ CommonJS require works correctly');
console.log('   - Default export exists');
console.log('   - Is a valid component');
EOF

node test-cjs.cjs

# Test CSS imports exist
echo -e "${YELLOW}🧪 Testing CSS file availability...${NC}"
cat > test-css.mjs << 'EOF'
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkgPath = require.resolve('react-image-gallery/package.json');
const pkgDir = dirname(pkgPath);

const cssFiles = [
  'build/image-gallery.css',
  'styles/image-gallery.css'
];

let allExist = true;
for (const file of cssFiles) {
  const fullPath = join(pkgDir, file);
  if (existsSync(fullPath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} is missing`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
}
EOF

node test-css.mjs

# Test TypeScript types exist
echo -e "${YELLOW}🧪 Testing TypeScript types availability...${NC}"
cat > test-types.mjs << 'EOF'
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkgPath = require.resolve('react-image-gallery/package.json');
const pkgDir = dirname(pkgPath);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

// Check types field in package.json
if (!pkg.types) {
  console.error('❌ package.json missing "types" field');
  process.exit(1);
}

const typesPath = join(pkgDir, pkg.types);
if (existsSync(typesPath)) {
  console.log(`✅ TypeScript types file exists: ${pkg.types}`);
} else {
  console.error(`❌ TypeScript types file missing: ${pkg.types}`);
  process.exit(1);
}

// Check types contain essential exports
const typesContent = readFileSync(typesPath, 'utf-8');
const essentialTypes = ['ImageGallery', 'GalleryItem', 'ImageGalleryProps'];

for (const type of essentialTypes) {
  if (typesContent.includes(type)) {
    console.log(`✅ Type "${type}" is exported`);
  } else {
    console.error(`❌ Type "${type}" is missing from types`);
    process.exit(1);
  }
}
EOF

node test-types.mjs

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
cd /
rm -rf "$TEST_DIR"
rm -f "$TARBALL_PATH"

echo ""
echo -e "${GREEN}✅ All package tests passed!${NC}"
echo -e "${GREEN}   The package is ready for publishing.${NC}"
