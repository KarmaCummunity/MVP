# תיקון שגיאת redirect_uri_mismatch

## הבעיה
Google OAuth מחזיר שגיאה: `Error 400: redirect_uri_mismatch`

זה קורה כי ה-redirect URI שהאפליקציה שולחת ל-Google לא תואם ל-URI שהוגדר ב-Google Cloud Console.

## פתרון

### שלב 1: זיהוי ה-Redirect URI המקומי

כשאתה מריץ את האפליקציה ב-localhost, ה-redirect URI הוא:
- **Web (localhost)**: `http://localhost:8081/oauthredirect` (או פורט אחר)
- **Web (Expo)**: `exp://localhost:8081/--/oauthredirect`
- **iOS Simulator**: `com.navesarussi1.KarmaCommunity://oauthredirect`
- **Android Emulator**: `com.navesarussi1.KarmaCommunity://oauthredirect`

### שלב 2: הוספת Redirect URIs ל-Google Cloud Console

1. לך ל-[Google Cloud Console](https://console.cloud.google.com/)
2. בחר את הפרויקט שלך
3. לך ל-**APIs & Services** > **Credentials**
4. לחץ על ה-**OAuth 2.0 Client ID** שלך (Web client)
5. ב-**Authorized redirect URIs**, הוסף את כל ה-URIs הבאים:

#### ל-Development (Localhost):
```
http://localhost:8081/oauthredirect
http://localhost:19006/oauthredirect
exp://localhost:8081/--/oauthredirect
exp://localhost:19006/--/oauthredirect
com.navesarussi1.KarmaCommunity://oauthredirect
```

#### ל-Production:
```
https://karma-community-kc.com/oauthredirect
https://www.karma-community-kc.com/oauthredirect
```

### שלב 3: בדיקת ה-Redirect URI בפועל

כדי לראות מה ה-redirect URI שהאפליקציה משתמשת בו בפועל:

1. פתח את ה-Console בדפדפן
2. חפש הודעות log עם "redirectUri"
3. או הוסף לוג זמני בקוד:

```typescript
console.log('Redirect URI:', redirectUri);
```

### שלב 4: עדכון הקוד (אם צריך)

אם אתה צריך redirect URI ספציפי ל-localhost, עדכן את הקוד:

**ב-`SimpleGoogleLoginButton.tsx`:**
```typescript
const redirectUri = Platform.OS === 'web' 
  ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081'}/oauthredirect`
  : makeRedirectUri({ scheme: 'com.navesarussi1.KarmaCommunity', path: 'oauthredirect' });
```

**ב-`AuthConfiguration.ts`:**
```typescript
case 'web':
  // For localhost development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}/oauthredirect`;
  }
  // For production
  const webDomain = process.env.EXPO_PUBLIC_WEB_DOMAIN || 'https://karma-community-kc.com';
  return `${webDomain}/oauthredirect`;
```

## רשימת כל ה-Redirect URIs שצריך להוסיף

### Web Client ID (בגוגל קונסול):
```
http://localhost:8081/oauthredirect
http://localhost:19006/oauthredirect
http://127.0.0.1:8081/oauthredirect
http://127.0.0.1:19006/oauthredirect
exp://localhost:8081/--/oauthredirect
exp://localhost:19006/--/oauthredirect
https://karma-community-kc.com/oauthredirect
https://www.karma-community-kc.com/oauthredirect
```

### iOS Client ID:
```
com.navesarussi1.KarmaCommunity://oauthredirect
```

### Android Client ID:
```
com.navesarussi1.KarmaCommunity://oauthredirect
```

## טיפים חשובים

1. **URI חייב להיות זהה בדיוק** - כולל:
   - פרוטוקול (http/https)
   - שם דומיין (localhost/127.0.0.1)
   - פורט (8081/19006)
   - נתיב (/oauthredirect)

2. **אין רווחים** - וודא שאין רווחים לפני או אחרי ה-URI

3. **Case sensitive** - ה-URI רגיש לאותיות גדולות/קטנות

4. **שמירה** - אחרי הוספת URIs, לחץ על **Save** בתחתית הדף

5. **זמן עדכון** - לפעמים לוקח כמה דקות עד שהשינויים נכנסים לתוקף

## בדיקה מהירה

לאחר הוספת ה-URIs:

1. רענן את הדף ב-Google Cloud Console
2. בדוק שה-URIs הופיעו ברשימה
3. נסה להתחבר שוב
4. אם עדיין לא עובד, בדוק את ה-Console לראות מה ה-URI בפועל

## פתרון מהיר לבדיקה

אם אתה רוצה לבדוק מהר, תוכל להוסיף את כל ה-URIs האפשריים:

```
http://localhost:*/oauthredirect
http://127.0.0.1:*/oauthredirect
exp://localhost:*/--/oauthredirect
```

אבל זה לא מומלץ ל-production - עדיף להוסיף רק את ה-URIs שאתה משתמש בהם בפועל.

## אם עדיין לא עובד

1. בדוק את ה-Console בדפדפן - אולי יש שגיאה אחרת
2. בדוק את Network tab - איזה URI נשלח ל-Google
3. ודא שאתה משתמש ב-Client ID הנכון (Web/iOS/Android)
4. נסה לנקות cache ולנסות שוב

---

**תאריך**: 2024
**סטטוס**: פתרון לבעיית redirect_uri_mismatch

