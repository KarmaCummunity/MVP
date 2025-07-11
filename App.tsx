// App.tsx
'use strict';
import React, { useCallback, useEffect, useState } from "react";
import MainNavigator from "./navigations/MainNavigator";
import { NavigationContainer } from "@react-navigation/native";
import * as Font from "expo-font";
// Make sure you import ALL icon sets from @expo/vector-icons that you plan to use this way
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons here too if you're using it from @expo/vector-icons
import * as SplashScreen from "expo-splash-screen";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import styles from "./globals/styles";
import colors from "./globals/colors";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);

  const prepareApp = useCallback(async () => {
    try {
      await Font.loadAsync({
        // CORRECT WAY TO LOAD IONICONS:
        ...Ionicons.font, // This spreads the { 'Ionicons': require(...) } object

        // CORRECT WAY TO LOAD MATERIALICONS (if imported from @expo/vector-icons):
        ...MaterialIcons.font, // This spreads the { 'MaterialIcons': require(...) } object

        // If you had any OTHER custom fonts (e.g., in your assets/fonts folder):
        // 'MyCustomFont-Regular': require('./assets/fonts/MyCustomFont-Regular.ttf'),
        // 'MyCustomFont-Bold': require('./assets/fonts/MyCustomFont-Bold.ttf'),
      });

      setAppIsReady(true);
    } catch (e: any) {
      console.warn("App preparation failed:", e);
      setFontError(e);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    prepareApp();
  }, [prepareApp]);

  if (fontError) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.errorText}>
          Oops! There was an issue loading essential resources.
        </Text>
        <Text style={errorStyles.detailText}>
          Please try restarting the app.
        </Text>
        {/* For debugging, you can re-enable this if needed */}
        {/* <Text style={errorStyles.detailText}>Error: {fontError.message}</Text> */}
      </View>
    );
  }

  if (!appIsReady) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color={colors.primaryBlue}/>
        <Text style={loadingStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundPrimary,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: colors.textPrimary,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.error_Container,
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textError,
    textAlign: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: "center",
  },
});

