// File overview:
// - Purpose: Root application entry point for iOS/Android/Web.
// - Reached from: App registry (Expo) bootstraps this component.
// - Provides: React Navigation container with `MainNavigator`, global `UserProvider`, gesture and safe-area roots, StatusBar.
// - Reads: AsyncStorage 'app_language' for i18n + RTL, Expo fonts, SplashScreen control, optional notificationService, WebBrowser auth completion.
// - Listens: Push/in-app notification responses and deep links; when clicked, navigates to 'ChatDetailScreen' (with conversationId) or 'NotificationsScreen'.
// - Downstream flow: App -> MainNavigator -> (LoginScreen | HomeStack/BottomNavigator) -> Tab stacks -> Screens.
// - Side effects: Initializes i18n + RTL, loads fonts, hides splash, installs notification listener, holds a navigationRef for programmatic navigation.
// - Route params: None (this is the top-level container).
// - External deps/services: react-navigation, expo modules, i18n, UserContext.

// App.tsx
'use strict';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './app/i18n';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';

import MainNavigator from './navigations/MainNavigator';
// Ensure tslib default interop for certain vendor bundles
import './polyfills/tslib-default';
import colors from './globals/colors';
import { UserProvider } from './context/UserContext';
import { FontSizes } from "./globals/constants";
// RTL is controlled via selected language in i18n and Settings

// Initialize notifications only on supported platforms
let notificationService: any = null;
if (Platform.OS !== 'web') {
  try {
    notificationService = require('./utils/notificationService');
  } catch (error) {
    console.warn('Failed to load notification service:', error);
  }
}

// Complete auth session results as early as possible (important for Web OAuth flows)
try { WebBrowser.maybeCompleteAuthSession(); } catch {}

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { t } = useTranslation(['common']);
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  console.log('🚀 App component mounted');
  // Setup notification response listener (iOS + Android)
  useEffect(() => {
    if (!notificationService) return;

    const subscription = notificationService.setupNotificationResponseListener((response: any) => {
      try {
        console.log('📱 Notification clicked:', response);
        const data = response?.notification?.request?.content?.data || {};
        const type = data?.type;
        const conversationId = data?.conversationId;

        if (navigationRef.current?.isReady()) {
          if (type === 'message' && conversationId) {
            navigationRef.current.navigate('ChatDetailScreen', { conversationId });
          } else {
            navigationRef.current.navigate('NotificationsScreen');
          }
        }
      } catch (err) {
        console.warn('Failed to handle notification response:', err);
      }
    });

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  const prepareApp = useCallback(async () => {
    try {
      console.log('🚀 Starting app preparation...');

      // Apply stored language before UI mounts
      try {
        const storedLang = await AsyncStorage.getItem('app_language');
        const lang = storedLang === 'he' || storedLang === 'en' ? storedLang : null;
        if (lang) {
          await i18n.changeLanguage(lang);
          const isRTL = lang === 'he';
          if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
          }
        }
      } catch (e) {
        console.warn('Language load failed, using defaults');
      }
      
      // Loading fonts with better error handling
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialIcons.font,
        });
        console.log('✅ Fonts loaded successfully');
      } catch (fontError) {
        console.warn('Font loading failed, continuing without custom fonts');
      }

      console.log('✅ App preparation completed');
      setAppIsReady(true);
    } catch (e: any) {
      console.error("App preparation failed:", e);
      setFontError(e);
    } finally {
      try {
        await SplashScreen.hideAsync();
        console.log('✅ Splash screen hidden');
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
          <Text style={loadingStyles.loadingText}>{t('common:loading')}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider
          children={
            <NavigationContainer
              ref={navigationRef}
              children={
                <View style={{ flex: 1 }}>
                  <MainNavigator />
                  <StatusBar style="auto" />
                </View>
              }
            />
          }
        />
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

