export default {
  expo: {
    name: "KC - הקיבוץ הקפיטליסטי",
    slug: "karma-community",
    version: "1.6.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "karma-community",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
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
        backgroundColor: "#ffffff"
      },
      package: "com.navesarussi1.KarmaCommunity"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon-32x32.png",
      name: "KC - הקיבוץ הקפיטליסטי",
      shortName: "KC",
      description: "פלטפורמה חינמית ללא מטרות רווח לקהילה הישראלית",
      lang: "he",
      dir: "rtl",
      themeColor: "#ffffff",
      backgroundColor: "#ffffff"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};
