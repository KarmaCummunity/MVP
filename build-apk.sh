#!/bin/bash

echo "🚀 מתחיל בניית APK..."
echo ""

# בדיקה אם EAS CLI מותקן
if ! command -v eas &> /dev/null; then
    echo "📦 מתקין EAS CLI..."
    npm install -g @expo/eas-cli
fi

# בדיקה אם התלויות מותקנות
if [ ! -d "node_modules" ]; then
    echo "📦 מתקין תלויות..."
    npm install
fi

echo "🔧 בונה APK..."
echo "⏳ זה ייקח 10-15 דקות..."
echo ""

# בניית APK
eas build --platform android --profile preview

echo ""
echo "✅ הבנייה הושלמה!"
echo "📱 תקבל לינק להורדה בטרמינל"
echo "📥 הורד את הקובץ לפלאפון והתקן אותו"