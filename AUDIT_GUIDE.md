# 🔍 מדריך סריקת תשתית - Audit Guide

## מה זה?

מערכת סקריפטים אוטומטיים שסורקת את כל הקוד ב-MVP ומזהה בעיות תשתית:

✅ צבעים קשיחים במקום שימוש ב-`globals/colors.tsx`  
✅ טקסטים קשיחים במקום שימוש ב-i18n  
✅ magic numbers במקום קבועים מ-`globals/constants.tsx`  
✅ בעיות responsive - חוסר שימוש בפונקציות מ-`globals/responsive.ts`  
✅ קבצים לא בשימוש, כפולים וישנים  

## 🚀 התחלה מהירה

### שלב 1: התקנת תלויות

```bash
cd /Users/navesarussi/KC/DEV/MVP
npm install
```

### שלב 2: הרצת הסריקה

```bash
npm run audit:all
```

זה ייקח 2-5 דקות ויסרוק את כל 200 הקבצים.

### שלב 3: קריאת התוצאות

```bash
# פתח את הסיכום
open audit-reports/summary.md
```

או בעורך טקסט:
```bash
cat audit-reports/summary.md
```

## 📊 מה יוצא מהסריקה?

הסקריפטים יוצרים תיקייה `audit-reports/` עם:

```
audit-reports/
├── summary.md              ⭐ התחל כאן! סיכום + תוכנית פעולה
├── colors-issues.json      🎨 כל בעיות הצבעים
├── texts-issues.json        📝 כל בעיות הטקסטים
├── constants-issues.json    🔢 כל בעיות הקבועים
├── responsive-issues.json   📱 כל בעיות ה-responsive
├── unused-files.json        🗑️ קבצים לא בשימוש
└── master-report.json       📦 דוח JSON מאוחד
```

## 🎯 איך לתקן?

### דוגמה: תיקון צבעים קשיחים

**לפני:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16808C',  // ❌ צבע קשיח
  }
});
```

**אחרי:**
```typescript
import colors from '../globals/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,  // ✅ משתמש בגלובלי
  }
});
```

### דוגמה: תיקון טקסטים קשיחים

**לפני:**
```typescript
<Text>שלום עולם</Text>  // ❌ טקסט קשיח
```

**אחרי:**
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<Text>{t('common:hello')}</Text>  // ✅ משתמש ב-i18n
```

ואז הוסף ל-`locales/he.json`:
```json
{
  "common": {
    "hello": "שלום עולם"
  }
}
```

### דוגמה: תיקון responsive

**לפני:**
```typescript
const styles = StyleSheet.create({
  text: {
    fontSize: 16,  // ❌ גודל קבוע
    padding: 20,   // ❌ padding קבוע
  }
});
```

**אחרי:**
```typescript
import { responsiveFontSize, responsiveSpacing } from '../globals/responsive';

const styles = StyleSheet.create({
  text: {
    fontSize: responsiveFontSize(16, 18, 20),  // ✅ responsive
    padding: responsiveSpacing(20, 24, 32),     // ✅ responsive
  }
});
```

## 📋 סדר עדיפויות מומלץ

1. **🔴 Critical** - תקן מיד (חסרים imports, בעיות production)
2. **🟠 High** - תקן בקרוב (צבעים קשיחים, טקסטים בעברית)
3. **🟡 Medium** - תכנן לתקן (קבועים שחוזרים, טקסטים באנגלית)
4. **🟢 Low** - תקן כשיש זמן (קבצים ישנים, קוסמטיקה)

## 🔄 תהליך עבודה מומלץ

```bash
# 1. הרץ סריקה ראשונית
npm run audit:all

# 2. קרא את summary.md
open audit-reports/summary.md

# 3. תקן קובץ אחד
# עבוד על קובץ אחד בכל פעם, תקן את כל הבעיות בו

# 4. הרץ סריקה ספציפית לוודא
npm run audit:colors  # או audit:texts, audit:constants וכו'

# 5. חזור על 3-4 עד שסיימת

# 6. הרץ סריקה מלאה לוודא
npm run audit:all
```

## 🛠️ סקריפטים זמינים

```bash
npm run audit:colors      # רק צבעים
npm run audit:texts       # רק טקסטים
npm run audit:constants   # רק קבועים
npm run audit:responsive  # רק responsive
npm run audit:unused      # רק קבצים לא בשימוש
npm run audit:all         # הכל ביחד (מומלץ)
```

## ❓ שאלות נפוצות

### האם זה בטוח?
כן! הסקריפטים רק **קוראים** ולא משנים שום דבר. הם רק מייצרים דוחות.

### כמה זמן זה לוקח?
2-5 דקות לסריקה מלאה של כל הקוד.

### מה אם יש false positives?
זה יכול לקרות. השתמש בשיקול דעת - אם משהו נראה תקין, אל תשנה אותו.

### האם צריך לתקן הכל?
לא בהכרח. התמקד ב-Critical ו-High. Medium ו-Low הם שיפורים רצויים אבל לא דחופים.

### איך אני יודע שסיימתי?
הרץ `npm run audit:all` שוב. אם יש 0 critical ו-0 high - מצוין! 🎉

## 📚 תיעוד נוסף

- **[scripts/README.md](scripts/README.md)** - תיעוד מפורט של הסקריפטים
- **[globals/colors.tsx](globals/colors.tsx)** - כל הצבעים הזמינים
- **[globals/constants.tsx](globals/constants.tsx)** - כל הקבועים הזמינים
- **[globals/responsive.ts](globals/responsive.ts)** - כל הפונקציות responsive
- **[locales/he.json](locales/he.json)** - כל המפתחות בעברית
- **[locales/en.json](locales/en.json)** - כל המפתחות באנגלית

## 🎯 מטרה

בסוף התהליך, כל הקוד צריך להיות:

✅ משתמש בצבעים מ-`globals/colors.tsx`  
✅ משתמש בטקסטים מ-`locales/*.json` דרך i18n  
✅ משתמש בקבועים מ-`globals/constants.tsx`  
✅ משתמש בפונקציות responsive מ-`globals/responsive.ts`  
✅ נקי מקבצים לא בשימוש  

זה יהפוך את הקוד ל:
- 🎨 אחיד בעיצוב
- 🌍 קל לתרגום
- 📱 responsive לכל המכשירים
- 🧹 נקי ומסודר
- 🚀 קל לתחזוקה

---

**בהצלחה! 💪**

אם יש שאלות, תיצור issue או תשאל בצוות.


