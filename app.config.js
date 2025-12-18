const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://kc-mvp-server-production.up.railway.app';

// Define colors locally for config usage (colors.tsx cannot be imported in JS config)
const colors = {
  secondary: '#FFB6C1',     // Soft Pink - Secondary brand color
  backgroundTertiary: '#E3F2FD', // Very light blue for highlights
};



export default {
  expo: {
    name: "KC - הקיבוץ הקפיטליסטי",
    slug: "karma-community",
    version: "1.9.5",
    orientation: "portrait",
    icon: "./assets/images/new_logo_black.png",
    scheme: "karma-community",
    userInterfaceStyle: "automatic",
    // שמירה על primaryColor שהיה ב-app.json
    primaryColor: colors.secondary,
    splash: {
      image: "./assets/images/new_logo_black.png",
      resizeMode: "contain",
      backgroundColor: colors.backgroundTertiary
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.navesarussi1.KarmaCommunity",
      // Associated domains for Universal Links
      associatedDomains: [
        "applinks:karma-community-kc.com",
        "applinks:www.karma-community-kc.com"
      ],
      // איחוד הרשאות ו־ATS שהיו ב-app.json
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSAllowsLocalNetworking: true
        },
        NSCameraUsageDescription: "האפליקציה זקוקה לגישה למצלמה כדי לצלם תמונות וסרטונים",
        NSMicrophoneUsageDescription: "האפליקציה זקוקה לגישה למיקרופון לצורך הקלטת אודיו",
        NSPhotoLibraryUsageDescription: "האפליקציה זקוקה לגישה לספריית התמונות כדי לבחור ולהעלות קבצים",
        NSLocationWhenInUseUsageDescription: "האפליקציה זקוקה לגישה למיקום כדי לזהות את מיקומך הנוכחי",
        NSLocationAlwaysAndWhenInUseUsageDescription: "האפליקציה זקוקה לגישה למיקום כדי לזהות את מיקומך הנוכחי"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/new_logo_black.png",
        backgroundColor: colors.backgroundTertiary
      },
      package: "com.navesarussi1.KarmaCommunity",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "com.navesarussi1.KarmaCommunity"
            },
            {
              scheme: "karma-community"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      // הרשאות שהוגדרו ב-app.json
      permissions: [
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.WAKE_LOCK",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
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
      themeColor: colors.secondary,
      backgroundColor: colors.backgroundTertiary,
      // הגדרות meta ו-build מה-app.json
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no"
      },
      build: {
        babel: {
          include: ["@expo/vector-icons"]
        }
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/images/new_logo_black.png",
          color: colors.secondary,
          mode: "production",
          androidMode: "default",
          androidCollapsedTitle: "התראה חדשה"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "האפליקציה זקוקה לגישה למיקום כדי לזהות את מיקומך הנוכחי"
        }
      ]
    ],
    experiments: {
      // ב-app.json היה false; אנו שומרים על true לשילוב עם expo-router
      typedRoutes: true
    },
    // שמירה על owner מ-app.json
    owner: "navesarussi1",
    extra: {
      EXPO_PUBLIC_API_BASE_URL: DEFAULT_API_BASE_URL,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: "430191522654-jno2tkl1dotil0mkf4h4hahfk4e4gas8.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "430191522654-o70t2qnqc4bvpvmbpak7unog7pvp9c95.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "430191522654-q05j71a8lu3e1vgf75c2r2jscgckb4mm.apps.googleusercontent.com",
      EXPO_PUBLIC_USE_BACKEND: "1",
      EXPO_PUBLIC_USE_FIRESTORE: "0",
      EXPO_PUBLIC_ADMIN_EMAILS: "navesarussi@gmail.com,mahalalel100@gmail.com,matan7491@gmail.com,ichai1306@gmail.com,lianbh2004@gmail.com",
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
