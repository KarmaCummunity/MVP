#!/bin/bash
# סקריפט לפריסה ל-Railway
# השתמש בסקריפט זה לאחר שווידאת שהכל עובד מקומית

set -e

echo "🚀 מכין פריסה ל-Railway..."
echo ""

# בדיקה שאנחנו ב-branch הנכון
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch נוכחי: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  אזהרה: אתה לא ב-branch main/master"
    echo "   Railway בד״כ פורס מ-main/master"
    read -p "   האם להמשיך? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ בוטל על ידי המשתמש"
        exit 1
    fi
fi

# הרצת verify-build
echo ""
echo "🔍 מריץ בדיקות..."
./scripts/verify-build.sh

# הצגת שינויים
echo ""
echo "📝 שינויים להעלאה:"
git status --short

# הוספת קבצים
echo ""
echo "➕ מוסיף קבצים ל-staging..."
git add package.json package-lock.json
git add Dockerfile
git add app.config.js
git add scripts/verify-build.sh
git add BUILD_SUCCESS_REPORT.md

# אם יש שינויים ב-App.tsx, נוסיף גם אותם
if git diff --cached --quiet App.tsx 2>/dev/null; then
    echo "   (App.tsx לא שונה או כבר staged)"
else
    git add App.tsx
    echo "   ✅ App.tsx נוסף"
fi

# הצגת מה staged
echo ""
echo "📦 קבצים ב-staging:"
git diff --cached --name-only

# יצירת commit
echo ""
echo "💾 יוצר commit..."
git commit -m "fix: resolve expo-router dependencies and improve Docker build

Core Changes:
- Update expo-constants: 17.0.6 → 17.1.7
- Update expo-linking: 7.0.5 → 7.1.7
- Update expo-router: ^5.1.4 → ~5.1.7
- Update @expo/metro-runtime: 5.0.4 → 5.0.5

Docker Improvements:
- Add npm cache clean and rebuild steps
- Add detailed logging throughout build process
- Add fallback retry strategy for expo export
- Add healthcheck for Nginx container
- Improve error handling with set -ex

Configuration:
- Convert app.config.js from ES modules to CommonJS
- Add resolutions field to package.json
- Add build verification script
- Add comprehensive build documentation

Testing:
- ✅ Local expo export successful
- ✅ Docker build successful  
- ✅ Container runs and responds on port 8080
- ✅ All dependencies verified

Version: 2.0.1"

echo "✅ Commit נוצר בהצלחה!"

# Push
echo ""
read -p "📤 האם לעשות push ל-$CURRENT_BRANCH? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⬆️  מעלה ל-$CURRENT_BRANCH..."
    git push origin $CURRENT_BRANCH
    echo ""
    echo "✅ Push הושלם!"
    echo ""
    echo "🎉 Railway אמור להתחיל build אוטומטית עכשיו!"
    echo "📊 עקוב אחרי ה-build ב-Railway dashboard"
else
    echo "⏸️  Push בוטל"
    echo "   אפשר להריץ ידנית: git push origin $CURRENT_BRANCH"
fi

echo ""
echo "✨ סיימנו!"

