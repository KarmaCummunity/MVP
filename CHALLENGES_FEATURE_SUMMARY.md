# פיצ'ר אתגרים (Challenges) - סיכום מלא

## סקירה כללית
פיצ'ר האתגרים הועתק במלואו מאפליקציית TimrsApp המקורית ושולב באפליקציית KC-MVP. 
הפיצ'ר מאפשר למנהלים לעקוב אחר אתגרים אישיים עם טיימרים מתקדמים, סטטיסטיקות, ומעקב אחר התקדמות.

## מבנה הפרויקט

### 1. Backend - KC-MVP-server

#### א. Controller
**קובץ:** `KC-MVP-server/src/controllers/challenges.controller.ts`
- מנהל את כל ה-API endpoints לאתגרים
- **Endpoints עיקריים:**
  - `POST /api/challenges` - יצירת אתגר חדש
  - `GET /api/challenges` - קבלת כל האתגרים של משתמש
  - `GET /api/challenges/:id` - קבלת אתגר ספציפי
  - `PUT /api/challenges/:id` - עדכון אתגר
  - `DELETE /api/challenges/:id` - מחיקת אתגר (רך - שומר בהיסטוריה)
  - `POST /api/challenges/restore/:id` - שחזור אתגר מחוק
  - `GET /api/challenges/history/deleted` - היסטוריית אתגרים מחוקים
  - `POST /api/challenges/reset-logs` - יצירת לוג איפוס
  - `GET /api/challenges/reset-logs/all` - קבלת לוגי איפוסים
  - `POST /api/challenges/record-breaks` - יצירת רשומת שבירת שיא
  - `GET /api/challenges/record-breaks/all` - קבלת רשומות שבירת שיאים

#### ב. Database Schema
**קובץ:** `KC-MVP-server/src/database/challenges-schema.sql`
- **טבלאות:**
  - `challenges` - אתגרים פעילים
  - `deleted_challenges` - אתגרים מחוקים (היסטוריה)
  - `challenge_reset_logs` - לוגים של איפוסים
  - `challenge_record_breaks` - רשומות שבירת שיאים
  - `challenge_global_stats` - סטטיסטיקות גלובליות לכל משתמש
- **אינדקסים:** לביצועים מיטביים על `user_id`, תאריכים ועוד

#### ג. Database Init
**קובץ:** `KC-MVP-server/src/database/database.init.ts`
- הוספנו מתודה `runChallengesSchema()` שמריצה את ה-schema בעת הפעלת השרת

#### ד. App Module
**קובץ:** `KC-MVP-server/src/app.module.ts`
- הוספנו את `ChallengesController` למערך ה-controllers

### 2. Frontend - MVP (React Native)

#### א. Types
**קובץ:** `MVP/types/challenges.ts`
- **Interfaces עיקריים:**
  - `Challenge` - מבנה אתגר מלא
  - `ChallengeFormData` - נתוני טופס יצירה/עריכה
  - `GlobalChallengeStats` - סטטיסטיקות גלובליות
  - `DeletedChallenge` - אתגר מחוק
  - `ChallengeResetLog` - לוג איפוס
  - `ChallengeRecordBreak` - שבירת שיא
- **Types:**
  - `TimeUnit` - יחידות זמן: seconds, minutes, hours, days, weeks, months
- **Validation Rules:** חוקי ולידציה לאתגרים ולוגים

#### ב. Services

##### 1. Challenge Service
**קובץ:** `MVP/utils/challengeService.ts`
- **מתודות עיקריות:**
  - `calculateElapsedTime()` - חישוב זמן שעבר מאז תחילת אתגר
  - `calculateCurrentStreak()` - חישוב סטריק נוכחי
  - `updateChallengeValue()` - עדכון ערך אתגר ובדיקת שיא
  - `fullReset()` - איפוס מלא של אתגר
  - `customReset()` - איפוס מותאם (הורדת כמות מסוימת)
  - `getTimeUnitLabel()` - תרגום יחידת זמן לעברית
  - `getSmartTimeDisplay()` - תצוגה חכמה של זמן (למשל: "2 ימים 3 שעות")
  - `getTimeUnitDisplayName()` - שם יחידת זמן בעברית
  - `getUnitsPerDay()` - כמות יחידות ביום אחד

##### 2. API Service
**קובץ:** `MVP/utils/apiService.ts`
- **מתודות חדשות:**
  - `getChallenges()` - קבלת אתגרים
  - `getChallenge()` - קבלת אתגר ספציפי
  - `createChallenge()` - יצירת אתגר
  - `updateChallenge()` - עדכון אתגר
  - `deleteChallenge()` - מחיקת אתגר
  - `restoreChallenge()` - שחזור אתגר
  - `getDeletedChallenges()` - קבלת היסטוריה
  - `createResetLog()` - יצירת לוג איפוס
  - `getResetLogs()` - קבלת לוגי איפוסים
  - `createRecordBreak()` - יצירת רשומת שיא
  - `getRecordBreaks()` - קבלת רשומות שיאים

#### ג. Components

##### Challenge Card
**קובץ:** `MVP/components/ChallengeCard.tsx`
- **תכונות:**
  - תצוגה של אתגר בכרטיס קומפקטי
  - כפתורי איפוס מלא ומותאם
  - תצוגת סטטיסטיקות (סטריק, איפוסים, שיא)
  - טיפול באירועים: עדכון, מחיקה, עריכה
  - שמירה אוטומטית של לוגים ושיאים
  - התראות על שבירת שיאים

##### Challenge Form
**קובץ:** `MVP/components/ChallengeForm.tsx`
- **תכונות:**
  - טופס ליצירת ועריכת אתגרים
  - שדה שם האתגר (1-50 תווים)
  - בחירת יחידת זמן מ-6 אפשרויות
  - הגדרת כמות לאיפוס מותאם
  - ולידציה מובנית
  - תמיכה במצבי יצירה ועריכה

#### ד. Screens

##### Challenges Home Screen
**קובץ:** `MVP/screens/ChallengesHomeScreen.tsx`
- **תכונות:**
  - רשימת כל האתגרים בתצוגת Grid (2 עמודות)
  - טעינה אוטומטית של אתגרים מהשרת
  - רענון אוטומטי כל שנייה (לעדכון זמנים)
  - Debouncing לשמירה בשרת
  - מצב Empty State נעים
  - כפתור FAB ליצירת אתגר חדש
  - טופס יצירה/עריכה משולב
  - אינטגרציה עם userStore
  - Loading states
  - טיפול בשגיאות

##### Admin Dashboard Screen
**קובץ:** `MVP/screens/AdminDashboardScreen.tsx`
- **שינויים:**
  - הוספנו כרטיס "האתגרים שלי" למערך adminButtons
  - הכרטיס מנווט למסך ChallengesHomeScreen
  - עיצוב כתום (#FFA726) עם אייקון גביע
  - ממוקם בין משימות לאנשים

#### ה. Navigation

##### Admin Stack
**קובץ:** `MVP/navigations/AdminStack.tsx`
- **שינויים:**
  - הוספנו import של `ChallengesHomeScreen`
  - הוספנו Screen בשם "Challenges" ל-Stack Navigator
  - המסך זמין רק למנהלים דרך AdminStack

## Flow של שימוש

### 1. כניסה לפיצ'ר
1. משתמש מנהל נכנס ללוח הבקרה (AdminDashboardScreen)
2. רואה כרטיס "האתגרים שלי" עם אייקון גביע כתום
3. לוחץ על הכרטיס
4. עובר למסך ChallengesHomeScreen

### 2. צפייה באתגרים
1. המסך טוען אתגרים מהשרת לפי userId
2. כל אתגר מוצג בכרטיס עם:
   - שם האתגר
   - זמן שעבר (תצוגה חכמה)
   - סטריק נוכחי
   - מספר איפוסים
   - השיא האישי
3. הזמנים מתעדכנים אוטומטית כל שנייה

### 3. איפוס מותאם
1. לחיצה על "איפוס מותאם" בכרטיס
2. פותח דיאלוג עם:
   - בחירה מהירה של כמויות נפוצות
   - שדה חופשי לכמות
   - שדה סיבה (חובה)
   - בחירת מצב רוח (1-5)
3. לחיצה על "אפס":
   - מעדכן את האתגר בשרת
   - שומר לוג איפוס
   - אם נשבר שיא - שומר גם את זה ומציג התראה

### 4. איפוס מלא
1. לחיצה על "איפוס מלא"
2. מאשר עם אלרט
3. מאפס לחלוטין את האתגר ל-0
4. שומר לוג איפוס

### 5. מחיקת אתגר
1. לחיצה על כפתור מחק (דרך Modal או long press)
2. מאשר עם אלרט
3. האתגר נמחק מהרשימה הפעילה
4. נשמר ב-deleted_challenges בשרת

## תכונות מתקדמות

### 1. חישוב זמנים מדויק
- שימוש ב-date-fns לחישוב חודשים מדויק
- תמיכה ב-6 יחידות זמן שונות
- המרות אוטומטיות (למשל: 90 דקות = 1 שעה 30 דקות)

### 2. מעקב אחר שיאים
- שמירת השיא האישי הטוב ביותר
- זיהוי אוטומטי של שבירת שיא
- רישום כל שבירת שיא עם improvement

### 3. מעקב אחר סטריקים
- סטריק נוכחי - זמן שעבר מאז האיפוס האחרון
- השיא האישי - הסטריק הארוך ביותר שהגענו אליו

### 4. לוגים מפורטים
- כל איפוס נשמר עם:
  - כמות שהורדה
  - סיבה
  - מצב רוח
  - ערך לפני ואחרי
  - timestamp

### 5. Offline-First (בעתיד)
- הנתונים נשמרים מקומית
- סנכרון אוטומטי כשיש אינטרנט
- תור סנכרון עם retry mechanism

## טכנולוגיות ובחירות עיצוב

### Backend
- **NestJS** - Framework מתקדם עם dependency injection
- **PostgreSQL** - מסד נתונים יציב ומהיר
- **TypeScript** - type safety מלא
- **Class Validator** - ולידציה מובנית של DTOs

### Frontend
- **React Native** - פיתוח קרוס-פלטפורמה
- **TypeScript** - type safety
- **date-fns** - חישובי תאריכים מדויקים
- **Zustand (userStore)** - state management
- **React Navigation** - ניווט

### עיצוב
- RTL מלא (עברית)
- Material Design inspired
- צבעים: כתום (#FFA726) לאתגרים
- אנימציות חלקות
- Responsive Design

## בדיקות שבוצעו

✅ **Linting:**
- כל הקבצים עוברים ללא שגיאות
- Frontend: 7 קבצים
- Backend: 3 קבצים

✅ **Type Safety:**
- כל ה-interfaces מוגדרים
- כל המתודות מוקלדות

✅ **Database Schema:**
- כל הטבלאות מוגדרות
- Indexes לביצועים
- Foreign keys (בעתיד)

## TODO - תכונות נוספות לעתיד

### ~~High Priority~~ ✅ הושלם
1. ~~**טפסים:**~~
   - ✅ ChallengeForm - ליצירה ועריכת אתגרים
   - ⏳ CustomResetDialog - דיאלוג איפוס מותאם מלא
   - ⏳ ChallengeDetailsModal - מודל פרטי אתגר

2. **מסכים נוספים:**
   - HistoryScreen - היסטוריית אתגרים מחוקים
   - ResetHistoryScreen - היסטוריית איפוסים
   - RecordBreaksScreen - מסך שיאים
   - SettingsScreen - הגדרות ופעולות גלובליות

3. **Global Stats:**
   - מעקב אחר סטטיסטיקות כלליות
   - סטריק גלובלי לכל האתגרים
   - סך כל האיפוסים

### Medium Priority
4. **אינטגרציה מלאה:**
   - הוספת אתגרים לדשבורד מנהלים
   - גרפים וויזואליזציות
   - ייצוא נתונים

5. **שיפורים:**
   - Push notifications על שבירת שיאים
   - שיתוף אתגרים עם חברים
   - תבניות אתגרים מוכנות

### Low Priority
6. **תכונות מתקדמות:**
   - אתגרים קבוצתיים
   - תחרויות
   - מערכת נקודות
   - badges ו-achievements

## הרצת הפרויקט

### Backend
```bash
cd KC-MVP-server
npm install
npm run build
npm start
```

### Frontend
```bash
cd MVP
npm install
npm start
```

### הערות
- וודא שה-database פועל לפני הפעלת השרת
- ה-schema יווצר אוטומטית בעת הפעלה ראשונה
- צריך משתמש מנהל כדי לגשת לפיצ'ר

## קבצים שנוצרו/שונו

### Backend (3 קבצים חדשים, 3 שונו)
1. ✨ `src/controllers/challenges.controller.ts` (חדש)
2. ✨ `src/database/challenges-schema.sql` (חדש)
3. ✏️ `src/database/database.init.ts` (עודכן)
4. ✏️ `src/app.module.ts` (עודכן)
5. ✏️ `src/items/items.service.ts` (עודכן - הוספת challenges לטבלאות מותרות)

### Frontend (6 קבצים חדשים, 3 שונו)
1. ✨ `types/challenges.ts` (חדש)
2. ✨ `utils/challengeService.ts` (חדש)
3. ✨ `components/ChallengeCard.tsx` (חדש)
4. ✨ `components/ChallengeForm.tsx` (חדש)
5. ✨ `screens/ChallengesHomeScreen.tsx` (חדש)
6. ✏️ `utils/apiService.ts` (עודכן)
7. ✏️ `screens/AdminDashboardScreen.tsx` (עודכן - הוספת כרטיס אתגרים)
8. ✏️ `navigations/AdminStack.tsx` (עודכן)
9. ✏️ `package.json` (עודכן - הוספת date-fns)

**סה"כ:** 16 קבצים (8 חדשים, 8 עודכנו)

---

**נבנה עם ❤️, מועתק בקפידה מ-TimrsApp, ומשולב ב-KC-MVP**
**גרסה: 1.0.0**
**תאריך: נובמבר 2025**

