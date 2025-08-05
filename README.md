# KC - הקיבוץ הקפיטליסטי של ישראל

אפליקציה חינמית ללא מטרות רווח לחיבור קהילתי בישראל. פלטפורמה המחברת בין עמותות, תורמים ומתנדבים קבועים.

## 🎯 מטרת הפרויקט

האפליקציה מיועדת ליצור קהילה דיגיטלית בישראל שמחברת בין:
- **עמותות** - שמחפשות תורמים ומתנדבים
- **תורמים** - שמחפשים איך לתרום כסף, זמן או ידע
- **מתנדבים קבועים** - שמחפשים הזדמנויות להתנדבות

## 🚀 תכונות עיקריות

### 🔐 מערכת אותנטיקציה
- **15 סוגי דמויות** - בחירת דמות להתחברות (תורמים, משתמשים, עמותות, סטודנטים ועוד)
- **לוגין דמה** - כפתור "התחבר עם Google" שפשוט מתחבר עם הדמות הנבחרת
- **מצב אורח** - אפשרות לגלול באפליקציה ללא התחברות
- **אחסון מקומי** - כל המידע נשמר במכשיר המשתמש עם AsyncStorage

### 🏗️ ארכיטקטורה
- **פרונט בלבד** - אין צורך בשרת או פיירבייס
- **React Native + Expo** - תמיכה ב-Android, iOS ו-Web
- **TypeScript** - טיפוסים חזקים ובטיחות קוד
- **Context API** - ניהול מצב גלובלי

## 👥 סוגי דמויות

### תורמים ומתנדבים
1. **יוסי התורם הגדול** - איש עסקים שתורם הרבה כסף וזמן
2. **שרה המתנדבת הפעילה** - אמא שמתנדבת הרבה זמן ומוסרת חפצים
3. **דני הסטודנט** - סטודנט שמשתמש בידע ומטייל בטרמפים
4. **משה הפרילנסר** - מעצב שמציע שירותים מקצועיים
5. **ליאת הקשישה הפעילה** - קשישה שמתנדבת ומקבלת עזרה
6. **דוד החקלאי** - חקלאי שתורם מזון טרי
7. **נועה הסטודנטית הרפואית** - סטודנטית שמציעה ייעוץ רפואי
8. **מיכל הפסיכולוגית** - פסיכולוגית שמציעה ייעוץ חינם
9. **יוסי הנהג הפעיל** - נהג שמציע טרמפים
10. **דנה המתכנתת הצעירה** - מתכנתת שמציעה שירותי פיתוח
11. **שירה האמנית** - אמנית שמציעה סדנאות יצירה

### עמותות ומקבלי עזרה
12. **עמותת "יד ביד"** - עמותה שמארגנת אירועים קהילתיים
13. **רחל המשפחה החד הורית** - אמא חד הורית שמקבלת עזרה
14. **עומר המשפחה הגדולה** - אבא למשפחה גדולה
15. **אבי המשפחה החדשה** - משפחה חדשה שמקבלת עזרה

## 🏗️ ארכיטקטורת המערכת

### 📁 מבנה הפרויקט
```
MVP/
├── screens/                    # מסכי האפליקציה הראשיים
│   ├── LoginScreen.tsx        # מסך לוגין עם בחירת דמויות
│   ├── UserProfileScreen.tsx  # פרופיל משתמש
│   └── InactiveScreen.tsx     # מסך לא פעיל
├── context/                   # ניהול מצב האפליקציה
│   └── UserContext.tsx        # ניהול משתמשים ואותנטיקציה
├── navigations/               # ניווט האפליקציה
│   ├── MainNavigator.tsx      # ניווט ראשי
│   ├── HomeStack.tsx          # ניווט מסך הבית
│   └── BottomNavigator.tsx    # ניווט תפריט תחתון
├── bottomBarScreens/          # מסכי התפריט התחתון
│   ├── HomeScreen.tsx         # מסך הבית
│   ├── DonationsScreen.tsx    # מסך תרומות
│   ├── SearchScreen.tsx       # מסך חיפוש
│   ├── ProfileScreen.tsx      # מסך פרופיל
│   └── UsersScreen.tsx        # מסך משתמשים
├── donationScreens/           # מסכי תרומות
│   ├── MoneyScreen.tsx        # תרומות כסף
│   ├── TimeScreen.tsx         # תרומות זמן
│   ├── KnowledgeScreen.tsx    # תרומות ידע
│   └── TrumpScreen.tsx        # טרמפים
├── components/                # רכיבים לשימוש חוזר
│   ├── SettingsItem.tsx       # פריט הגדרות
│   ├── HeaderComp.tsx         # כותרת עליונה
│   └── SearchBar.tsx          # סרגל חיפוש
├── globals/                   # נתונים גלובליים
│   ├── characterTypes.ts      # 15 סוגי הדמויות
│   ├── colors.tsx             # פלטת צבעים
│   ├── constants.tsx          # קבועים
│   └── types.tsx              # הגדרות טיפוסים
├── locales/                   # תרגומים
│   ├── he.json                # עברית
│   └── en.json                # אנגלית
└── utils/                     # פונקציות עזר
    ├── i18n.ts                # בינלאומיות
    └── logger.ts              # לוגים
```

### 🔄 מנגנון אותנטיקציה

#### UserContext.tsx
```typescript
interface UserContextType {
  selectedUser: User | null;           // משתמש נוכחי
  isGuestMode: boolean;                // מצב אורח
  isLoading: boolean;                  // מצב טעינה
  isAuthenticated: boolean;            // אותנטיקציה
  setSelectedUser: (user: User) => void; // הגדרת משתמש
  setGuestMode: () => void;            // כניסה כאורח
  signOut: () => void;                 // התנתקות
}
```

#### זרימת אותנטיקציה
1. **טעינה ראשונית** - `checkAuthStatus()` בודק AsyncStorage
2. **כניסה עם משתמש** - `setSelectedUser()` שומר במטמון ומנווט
3. **כניסה כאורח** - `setGuestMode()` מפעיל מצב אורח
4. **התנתקות** - `signOut()` מנקה מטמון ומחזיר ללוגין

#### LoginScreen.tsx
```typescript
// useEffect לניווט אוטומטי
useEffect(() => {
  if (selectedUser || isGuestMode) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }
}, [selectedUser, isGuestMode, navigation]);
```

### 🧭 מערכת ניווט

#### MainNavigator.tsx
- **ניווט ראשי** - Stack Navigator עם מסכי לוגין ובית
- **טעינה** - מציג מסך טעינה בזמן בדיקת אותנטיקציה
- **ניווט אוטומטי** - LoginScreen מנווט אוטומטית ל-Home

#### BottomNavigator.tsx
- **5 מסכים עיקריים** - בית, תרומות, חיפוש, פרופיל, משתמשים
- **ניווט חלק** - עם אנימציות ומעברים

## 🛠️ התקנה והרצה

### דרישות מקדימות
- Node.js (גרסה 16 ומעלה)
- npm או yarn
- Expo CLI: `npm install -g @expo/cli`

### התקנה
```bash
# שכפול הפרויקט
git clone <repository-url>
cd MVP

# התקנת תלויות
npm install

# הרצת האפליקציה
npm start
```

### הרצה על פלטפורמות שונות
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# מכשיר פיזי
# סרוק את ה-QR code עם Expo Go
```

## 🎨 עיצוב וממשק

### פלטת צבעים
```typescript
const colors = {
  pink: '#FF6B9D',           // צבע ראשי
  orange: '#FF8A65',         // צבע משני
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#FFF8F8',
  textPrimary: '#2C2C2C',
  textSecondary: '#666666',
  // ... ועוד
};
```

### תמיכה ב-RTL
- כל הטקסטים מיושרים לימין
- ניווט מימין לשמאל
- תמיכה מלאה בעברית

### רספונסיביות
- תמיכה במסכים שונים
- התאמה למובייל וטאבלט
- תמיכה ב-Web

## 🔧 פיתוח ותחזוקה

### הוספת דמות חדשה
1. הוסף ל-`globals/characterTypes.ts`
2. הוסף תמונה ל-`assets/images/`
3. עדכן תרגומים ב-`locales/`

### הוספת מסך חדש
1. צור קובץ ב-`screens/` או `bottomBarScreens/`
2. הוסף לניווט המתאים
3. הוסף תרגומים

### לוגים ודיבוג
```typescript
// לוגים עם emoji לזיהוי קל
console.log('🔐 LoginScreen - character:', character);
console.log('🔄 settingsData created with', settingsData.length, 'items');
```

## 📱 תכונות טכניות

### אחסון מקומי
- **AsyncStorage** - שמירת נתוני משתמש
- **מצב אורח** - שמירה ב-`guest_mode`
- **נתוני משתמש** - שמירה ב-`current_user`

### ביצועים
- **Lazy Loading** - טעינה לפי דרישה
- **Memoization** - שימוש ב-React.memo
- **Optimized Images** - תמונות מותאמות

### אבטחה
- **אחסון מקומי בלבד** - אין שליחה לשרת
- **ניקוי נתונים** - פונקציה לניקוי מטמון
- **טיפול בשגיאות** - try-catch בכל הפונקציות

## 🚀 עתיד הפרויקט

### תכונות מתוכננות
- [ ] אינטגרציה עם Google Auth
- [ ] הודעות push
- [ ] צ'אט בין משתמשים
- [ ] מערכת דירוגים
- [ ] מפות ואינטגרציה GPS

### שיפורים טכניים
- [ ] Unit Tests
- [ ] E2E Tests
- [ ] CI/CD Pipeline
- [ ] Performance Monitoring
- [ ] Error Tracking

## 📄 רישיון

הפרויקט הוא חינמי לחלוטין ללא מטרות רווח. מיועד לקהילה הישראלית בלבד.

## 🤝 תרומה לפרויקט

1. Fork את הפרויקט
2. צור branch חדש: `git checkout -b feature/amazing-feature`
3. Commit את השינויים: `git commit -m 'Add amazing feature'`
4. Push ל-branch: `git push origin feature/amazing-feature`
5. פתח Pull Request

## 📞 תמיכה

- **דוחות באגים** - פתח Issue ב-GitHub
- **בקשות תכונות** - פתח Feature Request
- **שאלות** - פתח Discussion

---

**KC - הקיבוץ הקפיטליסטי של ישראל** 🇮🇱
*חיבור קהילתי דיגיטלי*

