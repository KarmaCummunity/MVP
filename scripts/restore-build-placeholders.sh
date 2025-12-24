#!/bin/bash
# Restore placeholders in index.html after build (for next build)

set -e

echo "Restoring build placeholders in web/index.html..."

# Restore web/index.html template placeholders
if [ -f "web/index.html" ]; then
  # For macOS compatibility, use different sed syntax
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/content="[0-9]*"/content="__BUILD_TIMESTAMP__"/g' "web/index.html"
    sed -i '' 's/<meta name="app-version" content="[^"]*" \/>/<meta name="app-version" content="__APP_VERSION__" \/>/g' "web/index.html"
  else
    sed -i 's/content="[0-9]*"/content="__BUILD_TIMESTAMP__"/g' "web/index.html"
    sed -i 's/<meta name="app-version" content="[^"]*" \/>/<meta name="app-version" content="__APP_VERSION__" \/>/g' "web/index.html"
  fi
  echo "✓ Placeholders restored in web/index.html"
fi

echo "Placeholders restored successfully!"

