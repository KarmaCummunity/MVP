import { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'KarmaCommunity',
  slug: 'karma-community',
  version: '1.4.0',
  orientation: 'portrait',
  icon: './assets/images/logo.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  primaryColor: '#ffffff',
  splash: {
    image: './assets/images/logo.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.navesarussi1.KarmaCommunity',
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSAllowsLocalNetworking: true,
      },
      NSCameraUsageDescription: 'האפליקציה זקוקה לגישה למצלמה כדי לצלם תמונות וסרטונים',
      NSMicrophoneUsageDescription: 'האפליקציה זקוקה לגישה למיקרופון לצורך הקלטת אודיו',
      NSPhotoLibraryUsageDescription: 'האפליקציה זקוקה לגישה לספריית התמונות כדי לבחור ולהעלות קבצים',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/logo.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.navesarussi1.KC_ID',
    permissions: [
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
    ],
  },
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon-32x32.png',
    build: {
      babel: {
        include: ['@expo/vector-icons'],
      },
    },
    meta: {
      viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
    },
    themeColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/images/logo.png',
        color: '#ffffff',
        mode: 'production',
        androidMode: 'default',
        androidCollapsedTitle: 'התראה חדשה',
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    eas: {
      projectId: 'e9adde31-7801-4e3c-a709-2454fe511c24',
    },
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    googleAuth: {
      iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      // For Expo auth proxy on web, add this redirect URI to Google OAuth Web Client
      webRedirectUri: `https://auth.expo.io/@navesarussi1/karma-community`,
    },
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  },
  owner: 'navesarussi1',
};

export default config;


