# מדריך Cache Busting - פתרון בעיית העדכונים

## הבעיה שנפתרה
משתמשים לא ראו עדכונים חדשים באתר אלא רק לאחר מחיקת cache או גלישה בסתר.

## הפתרון
יישום מערכת cache busting מקיפה עם 3 שכבות:

### 1. HTTP Cache Headers (nginx.conf)
- **HTML files**: לעולם לא נשמרים ב-cache (`no-cache, must-revalidate`)
- **JS/CSS/Images עם hash**: נשמרים ל-1 שנה (כי ה-hash משתנה כשהקוד משתנה)
- **manifest.json**: לעולם לא נשמר ב-cache

### 2. Version Tracking (versionChecker.ts)
- בודק כל 5 דקות אם יש עדכון חדש
- בודק כשהמשתמש חוזר לטאב
- בודק כשהמשתמש חוזר אונליין
- מציג הודעה ידידותית כשיש עדכון
- המשתמש יכול ללחוץ על ההודעה כדי לרענן

### 3. Build Versioning (scripts)
- `update-build-version.sh`: רץ לפני build, מוסיף timestamp וגרסה
- `restore-build-placeholders.sh`: רץ אחרי build, מחזיר placeholders

## איך להשתמש

### בניית הפרויקט
```bash
npm run build:web
```

הסקריפטים ירוצו אוטומטית:
1. `prebuild:web` - מעדכן גרסה ו-timestamp
2. `build:web` - בונה את הפרויקט
3. `postbuild:web` - מחזיר placeholders

### בדיקה מקומית
```bash
npm run build:web:local
```

### מה קורה בפועל

1. **לפני Build**:
   - הסקריפט קורא את הגרסה מ-`package.json` (כרגע: 2.3.0)
   - יוצר timestamp של זמן ה-build
   - מחליף `__APP_VERSION__` ו-`__BUILD_TIMESTAMP__` ב-`web/index.html`
   - מעדכן `web/manifest.json` עם הגרסה והזמן

2. **בזמן הטעינה**:
   - האפליקציה מאתחלת את `versionChecker`
   - הוא קורא את הגרסה והזמן מה-meta tags
   - מתחיל לבדוק תקופתית אם יש עדכון

3. **כשיש עדכון**:
   - המערכת מזהה ש-ETag או Last-Modified השתנו
   - מציגה הודעה יפה למשתמש: "🎉 גרסה חדשה זמינה!"
   - המשתמש לוחץ -> הדף מתרענן -> הוא רואה את הגרסה החדשה

## קבצים שהשתנו

### קבצים חדשים
- ✅ `utils/versionChecker.ts` - מערכת בדיקת עדכונים
- ✅ `scripts/update-build-version.sh` - עדכון גרסה לפני build
- ✅ `scripts/restore-build-placeholders.sh` - שחזור placeholders אחרי build

### קבצים ששונו
- ✅ `web/nginx.conf` - cache headers מותאמים
- ✅ `web/index.html` - meta tags לגרסה וזמן
- ✅ `app.config.js` - סנכרון גרסה עם package.json
- ✅ `package.json` - הוספת prebuild ו-postbuild scripts
- ✅ `App.tsx` - אתחול versionChecker

## עדכון גרסה

כשאתה מוכן לפרסם גרסה חדשה:

```bash
# עדכן את הגרסה ב-package.json
npm version patch  # 2.3.0 -> 2.3.1
npm version minor  # 2.3.0 -> 2.4.0
npm version major  # 2.3.0 -> 3.0.0

# בנה ופרסם
npm run build:web
git add .
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
git push
```

## פונקציות שימושיות

ב-`versionChecker.ts` יש פונקציות שימושיות:

```typescript
import { getVersionInfo, forceAppUpdate } from './utils/versionChecker';

// קבלת מידע על הגרסה הנוכחית
const info = getVersionInfo();
console.log(info);
// { version: "2.3.0", buildTimestamp: "1703420000", buildDate: "24/12/2025, 10:00:00" }

// כפיית רענון (שימושי בדף אדמין)
await forceAppUpdate();
```

## בדיקה

### בדיקה שהכל עובד:

1. **Build ראשון**:
```bash
npm run build:web
```

2. **בדוק שהקבצים עודכנו**:
```bash
cat web/index.html | grep "app-version"
cat web/manifest.json | grep "version"
```

3. **Build שני** (אחרי שינוי כלשהו):
```bash
# שנה משהו בקוד
npm version patch
npm run build:web
```

4. **פתח את האתר בדפדפן**:
   - פתח DevTools -> Console
   - אמור לראות: `KC App Version: 2.3.0`
   - אמור לראות: `Build Timestamp: ...`

5. **בדוק עדכון אוטומטי**:
   - השאר את האתר פתוח
   - עשה build חדש ופרסם
   - תוך 5 דקות אמורה להופיע הודעה על עדכון

## Troubleshooting

### המשתמשים עדיין לא רואים עדכונים
- בדוק ש-nginx.conf מותקן נכון ב-container
- בדוק את ה-response headers בדפדפן (Network tab)
- ודא ש-Cache-Control headers נכונים

### ההודעה על עדכון לא מופיעה
- פתח Console ובדוק שגיאות
- ודא ש-versionChecker אתחל (חפש "Version checker initialized" בלוגים)
- בדוק ש-Platform.OS === 'web'

### הגרסה לא מתעדכנת
- ודא ש-prebuild script רץ (צריך לראות הודעות בזמן build)
- בדוק ש-placeholders הוחלפו ב-web/index.html
- ודא שהסקריפטים מסומנים כ-executable

## הערות חשובות

1. **אל תעשה git commit של web/index.html עם timestamp אמיתי** - הסקריפט restore-placeholders מטפל בזה
2. **הגרסה ב-package.json היא המקור האמת** - כל השאר מסתנכרן ממנה
3. **Web בלבד** - המערכת פועלת רק ב-web, לא ב-iOS/Android (שם יש update mechanisms אחרים)

## תחזוקה עתידית

- שקול להוסיף webhook ל-Railway שיבצע build אוטומטי כשיש push
- אפשר להוסיף analytics לעקוב אחרי כמה משתמשים מרעננים
- ניתן להוסיף A/B testing לסגנונות שונים של הודעת העדכון

