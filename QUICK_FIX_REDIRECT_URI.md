# ⚡ פתרון מהיר: redirect_uri_mismatch

## הבעיה
```
Error 400: redirect_uri_mismatch
```

## פתרון מהיר (5 דקות)

### שלב 1: זיהוי ה-Redirect URI
1. פתח את האפליקציה בדפדפן
2. לחץ F12 לפתיחת Developer Tools
3. לך ל-Console tab
4. חפש הודעת log: `"Redirect URI configured"` או `"redirectUri"`
5. העתק את ה-URI המדויק (לדוגמה: `http://localhost:8081/oauthredirect`)

**או** הרץ את הסקריפט:
```bash
cd MVP
node scripts/check-redirect-uri.js web 8081
```

### שלב 2: הוספה ל-Google Cloud Console

1. **לך ל-Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **בחר את הפרויקט שלך**

3. **לחץ על ה-OAuth 2.0 Client ID שלך:**
   - Client ID: `430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com`
   - (או חפש "Web client")

4. **ב-"Authorized redirect URIs":**
   - לחץ על **"ADD URI"**
   - הדבק את ה-URI שמצאת בשלב 1
   - לחץ **"SAVE"**

### שלב 3: בדיקה

1. **חכה 1-2 דקות** (לוקח זמן עד שהשינויים נכנסים לתוקף)
2. **רענן את הדף** באפליקציה
3. **נסה להתחבר שוב**

## רשימת URIs מומלצים להוספה

הוסף את כל ה-URIs הבאים ל-Google Cloud Console:

### ל-Development (Localhost):
```
http://localhost:8081/oauthredirect
http://localhost:19006/oauthredirect
http://127.0.0.1:8081/oauthredirect
http://127.0.0.1:19006/oauthredirect
```

### ל-Production:
```
https://karma-community-kc.com/oauthredirect
https://www.karma-community-kc.com/oauthredirect
```

### ל-Mobile:
```
com.navesarussi1.KarmaCommunity://oauthredirect
```

## טיפים חשובים

⚠️ **ה-URI חייב להיות זהה בדיוק:**
- כולל `http://` או `https://`
- כולל `localhost` או `127.0.0.1`
- כולל את הפורט (`:8081` או `:19006`)
- כולל את הנתיב (`/oauthredirect`)

✅ **אחרי הוספה:**
- לחץ **SAVE** בתחתית הדף
- חכה 1-2 דקות
- נסה שוב

## אם עדיין לא עובד

1. **בדוק את ה-Console** - איזה URI נשלח בפועל
2. **ודא שהוספת את ה-URI הנכון** - בדיוק כמו שמופיע בשגיאה
3. **נסה לנקות cache** - Ctrl+Shift+R (Windows) או Cmd+Shift+R (Mac)
4. **בדוק שאתה משתמש ב-Client ID הנכון** - Web client, לא iOS/Android

## קישורים שימושיים

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**זמן משוער לפתרון:** 5 דקות
**קושי:** קל
**תדירות:** פעם אחת (או כל פעם שמשנים פורט/דומיין)

