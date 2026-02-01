#!/bin/bash

# Deploy demo files to linxtion.github.io
# This script copies the demo build files and pushes to the GitHub Pages repo

set -e  # Exit on error

# Get the project root (one level up from scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEMO_SOURCE="$PROJECT_ROOT/demo"
DEMO_DEST="$PROJECT_ROOT/../linxtion.github.io/demo/react-image-gallery"

echo "📦 Copying demo files..."
cp "$DEMO_SOURCE/demo.mini.css" "$DEMO_DEST/app.min.css"
cp "$DEMO_SOURCE/demo.mini.js" "$DEMO_DEST/app.min.js"

echo "📤 Pushing to linxtion.github.io..."
cd "$DEMO_DEST"

# Only commit and push if there are changes
if git diff --quiet app.min.css app.min.js; then
  echo "ℹ️  No demo changes to deploy"
else
  git add app.min.css app.min.js
  git commit -m "Update react-image-gallery demo to $(node -p "require('$PROJECT_ROOT/package.json').version")"
  git push
  echo "✅ Demo deployed!"
fi
