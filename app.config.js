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
    }
  }
};
