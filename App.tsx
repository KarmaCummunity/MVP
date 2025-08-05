// App.tsx
'use strict';
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MainNavigator from './navigations/MainNavigator';
import colors from './globals/colors';
import { UserProvider } from './context/UserContext';
import { FontSizes } from "./globals/constants";
import './utils/RTLConfig';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);

  const prepareApp = useCallback(async () => {
    try {
      // Loading fonts with better error handling
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialIcons.font,
        });
              } catch (fontError) {
          console.warn('Font loading failed, continuing without custom fonts');
          // Don't stop the app if fonts fail to load
        }

      // Removed demo data creation that could cause issues
      // await createSampleData();

      setAppIsReady(true);
    } catch (e: any) {
      console.warn("App preparation failed:", e);
      setFontError(e);
    } finally {
      try {
        await SplashScreen.hideAsync();
      } catch (splashError) {
        console.warn('Failed to hide splash screen:', splashError);
      }
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
        <ActivityIndicator size="large" color={colors.info}/>
        <Text style={loadingStyles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
                 <UserProvider>
           <NavigationContainer>
             <View style={{ flex: 1 }}>
               <MainNavigator />
               <StatusBar style="auto" />
             </View>
           </NavigationContainer>
         </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
    fontSize: FontSizes.medium,
    color: colors.textPrimary,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.errorLight,
    padding: 20,
  },
  errorText: {
    fontSize: FontSizes.large,
    fontWeight: "bold",
    color: colors.error,
    textAlign: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    textAlign: "center",
  },
});

