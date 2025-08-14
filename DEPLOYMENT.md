# 🚀 מדריך פריסה לדומיין karma-community-kc.com

## שלבים לפריסה

### 1. הכנת האפליקציה
```bash
# בניית גרסת ווב לפרודקשן
npm run build:web

# או שימוש בסקריפט הפריסה
./scripts/deploy.sh
```

### 2. בחירת ספק אירוח

#### אופציה A: Railway (מומלץ)
- Railway תומך ב-Node.js ו-React Native
- פריסה אוטומטית מ-Git
- SSL אוטומטי
- **צעדים:**
  1. הירשם ל-Railway
  2. חבר את ה-repository
  3. הוסף את הדומיין ב-Railway dashboard
  4. שנה את ה-nameservers בדומיין שלך

#### אופציה B: Vercel
- מתאים לאפליקציות React/Next.js
- פריסה מהירה
- **צעדים:**
  1. הירשם ל-Vercel
  2. חבר את ה-repository
  3. הגדר build command: `npm run build:web`
  4. הוסף את הדומיין

#### אופציה C: Netlify
- מתאים לאפליקציות סטטיות
- **צעדים:**
  1. הירשם ל-Netlify
  2. העלה את תיקיית `web-build`
  3. הוסף את הדומיין

### 3. הגדרת DNS

#### עבור Railway:
```
Nameservers:
- ns1.railway.app
- ns2.railway.app
```

#### עבור Vercel:
```
Nameservers:
- ns1.vercel.com
- ns2.vercel.com
- ns3.vercel.com
- ns4.vercel.com
```

#### עבור Netlify:
```
Nameservers:
- dns1.p01.nsone.net
- dns2.p01.nsone.net
- dns3.p01.nsone.net
- dns4.p01.nsone.net
```

### 4. הגדרת SSL
- רוב הספקים מספקים SSL אוטומטי
- אם לא, השתמש ב-Let's Encrypt

### 5. בדיקת הפריסה
```bash
# בדיקת זמינות האתר
curl -I https://karma-community-kc.com

# בדיקת SSL
openssl s_client -connect karma-community-kc.com:443 -servername karma-community-kc.com
```

## משתני סביבה נדרשים

### Frontend (Expo):
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.karma-community-kc.com
EXPO_PUBLIC_USE_BACKEND=1
EXPO_PUBLIC_USE_FIRESTORE=0
```

### Backend (NestJS):
```bash
NODE_ENV=production
PORT=3001
REDIS_URL=redis://localhost:6379
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=kc
POSTGRES_PASSWORD=kc_password
POSTGRES_DB=kc_db
```

## פתרון בעיות

### בעיה: האתר לא נטען
- בדוק הגדרות DNS
- בדוק שהפריסה הושלמה
- בדוק לוגים של ספק האירוח

### בעיה: API לא עובד
- בדוק שהשרת רץ
- בדוק הגדרות CORS
- בדוק משתני סביבה

### בעיה: SSL לא עובד
- המתן עד 24 שעות להפעלת SSL
- בדוק הגדרות DNS
- פנה לתמיכה של ספק האירוח

## קישורים שימושיים
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Let's Encrypt](https://letsencrypt.org/)
