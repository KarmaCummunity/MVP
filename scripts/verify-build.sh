#!/bin/bash
# Verify Docker build dependencies before building
# Usage: ./scripts/verify-build.sh

set -e

echo "🔍 מאמת דרישות build..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker לא מותקן"
    exit 1
fi
echo "✅ Docker מותקן"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json לא נמצא"
    exit 1
fi
echo "✅ package.json נמצא"

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile לא נמצא"
    exit 1
fi
echo "✅ Dockerfile נמצא"

# Check if app.config.js exists
if [ ! -f "app.config.js" ]; then
    echo "❌ app.config.js לא נמצא"
    exit 1
fi
echo "✅ app.config.js נמצא"

# Verify critical dependencies in package.json
REQUIRED_DEPS=("expo" "expo-router" "expo-linking" "expo-constants")
for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        VERSION=$(grep "\"$dep\"" package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
        echo "✅ $dep נמצא (גרסה: $VERSION)"
    else
        echo "❌ $dep לא נמצא ב-package.json"
        exit 1
    fi
done

# Check version consistency
PACKAGE_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
APP_CONFIG_VERSION=$(grep 'version:' app.config.js | head -1 | sed 's/.*version: "\(.*\)".*/\1/')

echo ""
echo "📦 גרסת package.json: $PACKAGE_VERSION"
echo "⚙️  גרסת app.config.js: $APP_CONFIG_VERSION"

if [ "$PACKAGE_VERSION" != "$APP_CONFIG_VERSION" ]; then
    echo "⚠️  אזהרה: גרסאות לא תואמות!"
else
    echo "✅ גרסאות תואמות"
fi

echo ""
echo "✨ כל הבדיקות עברו בהצלחה!"
echo "📦 אפשר להריץ: docker build -t kc-web:latest ."
echo "או: npm run build:docker"


