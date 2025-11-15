const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://kc-mvp-server-production.up.railway.app';

export default {
  expo: {
    name: "KC - הקיבוץ הקפיטליסטי",
    slug: "karma-community",
    version: "1.7.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "karma-community",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/logo.png",
      resizeMode: "contain",
      backgroundColor: "#F0F8FF"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.navesarussi1.KarmaCommunity"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#F0F8FF"
      },
      package: "com.navesarussi1.KarmaCommunity"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
      name: "KC - הקיבוץ הקפיטליסטי",
      shortName: "KC",
      description: "פלטפורמה חינמית ללא מטרות רווח לקהילה הישראלית",
      lang: "he",
      dir: "rtl",
      themeColor: "#FF69B4",
      backgroundColor: "#F0F8FF"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      EXPO_PUBLIC_API_BASE_URL: DEFAULT_API_BASE_URL,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: "430191522654-jno2tkl1dotil0mkf4h4hahfk4e4gas8.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "430191522654-q05j71a8lu3e1vgf75c2r2jscgckb4mm.apps.googleusercontent.com",
      EXPO_PUBLIC_USE_BACKEND: "1",
      EXPO_PUBLIC_USE_FIRESTORE: "0",
      EXPO_PUBLIC_ADMIN_EMAILS: "navesarussi@gmail.com",
      EXPO_PUBLIC_FIREBASE_API_KEY: "AIzaSyCDwgAVr5IbjXe2vqSEacn_p-ruATfvqIU",
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "karma-community-app.firebaseapp.com",
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: "karma-community-app",
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: "karma-community-app.firebasestorage.app",
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1074950569654",
      EXPO_PUBLIC_FIREBASE_APP_ID: "1:1074950569654:web:490bfd5ab95d10b577f017",
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-20MFNZQS4R",
      firebase: {
        prod: {
          EXPO_PUBLIC_FIREBASE_API_KEY: "AIzaSyCDwgAVr5IbjXe2vqSEacn_p-ruATfvqIU",
          EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "karma-community-app.firebaseapp.com",
          EXPO_PUBLIC_FIREBASE_PROJECT_ID: "karma-community-app",
          EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: "karma-community-app.firebasestorage.app",
          EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1074950569654",
          EXPO_PUBLIC_FIREBASE_APP_ID: "1:1074950569654:web:490bfd5ab95d10b577f017",
          EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-20MFNZQS4R"
        },
        dev: {
          EXPO_PUBLIC_FIREBASE_API_KEY: "AIzaSyCDwgAVr5IbjXe2vqSEacn_p-ruATfvqIU",
          EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "karma-community-app.firebaseapp.com",
          EXPO_PUBLIC_FIREBASE_PROJECT_ID: "karma-community-app",
          EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: "karma-community-app.firebasestorage.app",
          EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1074950569654",
          EXPO_PUBLIC_FIREBASE_APP_ID: "1:1074950569654:web:490bfd5ab95d10b577f017",
          EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-20MFNZQS4R"
        }
      },
      eas: {
        projectId: "e9adde31-7801-4e3c-a709-2454fe511c24"
      }
    }
  }
};
