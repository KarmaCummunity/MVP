#!/bin/bash
# Script to fix all possible Google OAuth issues

cd /Users/matanya.a/git/MVP

echo "🔧 מתקן את כל בעיות Google OAuth..."
echo ""

echo "🛑 שלב 1/6: עוצר תהליכים..."
killall node 2>/dev/null || true
lsof -ti :8081 | xargs kill -9 2>/dev/null || true
lsof -ti :19006 | xargs kill -9 2>/dev/null || true

echo "🧹 שלב 2/6: מנקה cache..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf dist
rm -rf web-build
rm -rf ~/.expo 2>/dev/null || true
watchman watch-del-all 2>/dev/null || true

echo "📝 שלב 3/6: בודק תצורה..."
if [ -f "check-google-config.js" ]; then
    node check-google-config.js
else
    echo "⚠️  check-google-config.js לא נמצא"
fi

echo ""
echo "✅ שלב 4/6: מוודא שה-Client IDs נכונים ב-app.config.js..."
if grep -q "430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95" app.config.js; then
    echo "   ✅ Web Client ID נמצא"
else
    echo "   ❌ Web Client ID חסר!"
fi

echo ""
echo "🚀 שלב 5/6: מתחיל את השרת..."
echo "   זה ייקח כ-20 שניות..."
echo ""

# Start server in background
npm run web &
SERVER_PID=$!

# Wait for server to start
echo "⏳ מחכה שהשרת יעלה..."
ATTEMPTS=0
until curl -s http://localhost:8081 > /dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [ $ATTEMPTS -gt 40 ]; then
        echo "❌ השרת לא עלה אחרי 20 שניות"
        echo "   הרץ ידנית: npm run web"
        exit 1
    fi
    sleep 0.5
done

echo "✅ שלב 6/6: השרת רץ!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 הכל מוכן!"
echo ""
echo "📍 פתח בדפדפן:"
echo "   🌐 האפליקציה: http://localhost:8081"
echo "   🔍 דף בדיקה: http://localhost:8081/debug-google.html"
echo ""
echo "⚠️  אל תשכח:"
echo "   צריך להוסיף Redirect URIs ב-Google Cloud Console!"
echo "   ראה: GOOGLE_LOGIN_FIX_INSTRUCTIONS.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open browser
sleep 2
open http://localhost:8081 2>/dev/null || echo "פתח בעצמך: http://localhost:8081"

