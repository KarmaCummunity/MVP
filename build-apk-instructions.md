# 🚀 הוראות לבניית APK לפלאפון

## אפשרות 1: בנייה מקומית (מהירה)

### שלב 1: התקנת EAS CLI
```bash
npm install -g @expo/eas-cli
```

### שלב 2: התחברות ל-Expo
```bash
eas login
```

### שלב 3: בניית APK
```bash
eas build --platform android --profile preview
```

### שלב 4: הורדת הקובץ
- תקבל לינק להורדה
- הורד את הקובץ לפלאפון
- התקן אותו (אפשר התקנה ממקורות לא ידועים)

## אפשרות 2: בנייה בענן (מומלץ)

### שלב 1: הגדרת EAS
```bash
eas build:configure
```

### שלב 2: בנייה בענן
```bash
eas build --platform android
```

### שלב 3: מעקב אחרי הבנייה
- תקבל לינק למעקב אחרי הבנייה
- הבנייה תיקח 10-15 דקות
- תקבל לינק להורדה

## אפשרות 3: בנייה מהירה עם Expo Go

### שלב 1: הרצת הפרויקט
```bash
npx expo start
```

### שלב 2: סריקת QR Code
- פתח Expo Go על הפלאפון
- סרוק את ה-QR code
- האפליקציה תיפתח מיד!

## ⚠️ הערות חשובות

1. **בפעם הראשונה** - הבנייה תיקח יותר זמן
2. **חיבור לאינטרנט** - נדרש לכל האפשרויות
3. **Expo Go** - הדרך הכי מהירה לבדיקה
4. **APK** - נדרש לפרסום או הפצה

## 🔧 פתרון בעיות

### אם הבנייה נכשלת:
```bash
eas build --platform android --clear-cache
```

### אם יש בעיות עם התלויות:
```bash
npm install
npx expo install --fix
```

## 📱 התקנה על הפלאפון

1. הורד את קובץ ה-APK
2. פתח הגדרות > אבטחה
3. אפשר "התקנה ממקורות לא ידועים"
4. התקן את האפליקציה

---
**המלצה**: התחל עם Expo Go לבדיקה מהירה, ואז בנה APK לפרסום!