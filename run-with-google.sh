#!/bin/bash
# Run Expo with proper Google OAuth configuration

# Kill any existing processes
echo "🧹 Stopping existing processes..."
killall node 2>/dev/null || true
lsof -ti :8081 | xargs kill -9 2>/dev/null || true

# Clean cache
echo "🧹 Cleaning caches..."
rm -rf .expo node_modules/.cache dist

# Export Google OAuth Client IDs
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com"
export EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID="430191522654-q05j71a8lu3e1vgf75c2r2jscgckb4mm.apps.googleusercontent.com"
export EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID="430191522654-jno2tkl1dotil0mkf4h4hahfk4e4gas8.apps.googleusercontent.com"
export EXPO_PUBLIC_API_BASE_URL="https://kc-mvp-server-production.up.railway.app"
export EXPO_PUBLIC_USE_BACKEND="1"
export EXPO_PUBLIC_USE_FIRESTORE="0"

echo "✅ Google OAuth Configuration:"
echo "   Web Client ID: ${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:0:20}..."
echo "   iOS Client ID: ${EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:0:20}..."
echo "   Android Client ID: ${EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:0:20}..."
echo "   API Base URL: $EXPO_PUBLIC_API_BASE_URL"
echo ""
echo "🚀 Starting Expo..."
echo "   Web URL: http://localhost:8081"
echo "   OAuth Redirect: http://localhost:8081/oauthredirect"
echo ""

npm run web

