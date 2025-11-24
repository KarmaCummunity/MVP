# 🔧 תיקון בעיית Domain ב-Firebase

## הבעיה
המייל `lianbh2004@gmail.com` לא עובד כי ה-domain `karma-community-kc.com` לא מורשה ב-Firebase.

## פתרון - הוספת Domain מורשה

### שלב 1: פתח Firebase Console
1. לך ל: https://console.firebase.google.com
2. בחר את הפרויקט: **Karma Community**

### שלב 2: הוסף Domain מורשה
1. לך ל: **Authentication** → **Settings** → **Authorized domains**
2. לחץ על כפתור **"Add domain"** (כחול, בפינה הימנית העליונה)
3. הוסף את ה-domains הבאים:
   - `karma-community-kc.com`
   - `www.karma-community-kc.com` (אם אתה משתמש ב-www)
   - כל domain אחר שבו האפליקציה רצה (למשל Railway domain אם יש)

### שלב 3: בדוק reCAPTCHA
1. באותו מסך, לך ל: **Fraud prevention** → **reCAPTCHA**
2. ודא ש-reCAPTCHA מופעל
3. אם לא מופעל, הפעל אותו

### שלב 4: בדוק Email/Password Sign-in
1. לך ל: **Authentication** → **Sign-in method**
2. ודא ש-**Email/Password** מופעל
3. אם לא מופעל, לחץ עליו והפעל

### שלב 5: בדוק את ה-Domain הנוכחי
פתח את הקונסולה של הדפדפן (F12) והריץ:
```javascript
console.log('Current domain:', window.location.hostname);
```

זה יראה לך מה ה-domain הנוכחי שבו אתה מנסה להתחבר.

## רשימת Domains שצריכים להיות מורשים:
- ✅ `localhost` (כבר מורשה)
- ✅ `karma-community-app.firebaseapp.com` (כבר מורשה)
- ✅ `karma-community-app.web.app` (כבר מורשה)
- ❌ `karma-community-kc.com` (צריך להוסיף!)
- ❌ `www.karma-community-kc.com` (צריך להוסיף אם משתמשים ב-www)
- ❌ כל Railway domain (אם יש)

## הערות חשובות:
1. **שינויי Domain לוקחים כמה דקות להיכנס לתוקף** - חכה 2-3 דקות אחרי ההוספה
2. **reCAPTCHA חובה** - בלי זה, אימות אימייל לא יעבוד ב-web
3. **Email/Password חובה** - ודא שזה מופעל ב-Sign-in methods

## בדיקה אחרי התיקון:
1. רענן את הדף
2. נסה להתחבר עם `lianbh2004@gmail.com`
3. בדוק את הקונסולה - לא אמורות להיות שגיאות 400
4. אם עדיין יש בעיה, בדוק את הלוגים בקונסולה

