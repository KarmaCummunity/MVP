// File overview:
// - Purpose: Root application entry point for iOS/Android/Web with web mode support.
// - Reached from: App registry (Expo) bootstraps this component.
// - Provides: React Navigation container with `MainNavigator`, global `UserProvider`, gesture and safe-area roots, StatusBar.
// - Reads: AsyncStorage 'app_language' for i18n + RTL, Expo fonts, SplashScreen control, optional notificationService, WebBrowser auth completion.
// - Listens: Push/in-app notification responses and deep links; when clicked, navigates to 'ChatDetailScreen' (with conversationId) or 'NotificationsScreen'.
// - Downstream flow: App -> MainNavigator -> (LandingSiteScreen | LoginScreen | HomeStack/BottomNavigator) -> Tab stacks -> Screens.
// - Side effects: Initializes i18n + RTL, loads fonts, hides splash, installs notification listener, holds a navigationRef for programmatic navigation.
// - Route params: None (this is the top-level container).
// - External deps/services: react-navigation, expo modules, i18n, UserContext, WebModeContext.
//
// IMPORTANT WEB MODE CHANGES:
// - Container padding adjusts for web toggle button in app mode (48px top padding)
// - WebModeToggleOverlay positioned absolutely above all content
// - Navigation container key changes with mode to trigger proper re-renders

// App.tsx

// TODO: Add proper error handling for font loading failures with fallback fonts
// TODO: Implement proper deep linking configuration and testing
// TODO: Add crash reporting integration (Sentry, Bugsnag)
// TODO: Remove magic numbers for padding (48px) - use constants file
// TODO: Add proper accessibility support throughout the app
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
// Disable console logs in production for better performance
import './utils/disableConsoleLogs';
import colors from './globals/colors';
import { useWebMode } from './stores/webModeStore';
import { useAppLoading } from './stores/appLoadingStore';
import WebModeToggleOverlay from './components/WebModeToggleOverlay';
import { FontSizes } from "./globals/constants";
import { logger } from './utils/loggerService';
import ErrorBoundary from './components/ErrorBoundary';
// RTL is controlled via selected language in i18n and Settings

// Initialize notifications only on supported platforms
type NotificationService = {
  setupNotificationResponseListener: (
    callback: (response: { 
      notification: { 
        request: { 
          content: { 
            data?: { 
              type?: string; 
              conversationId?: string; 
            } 
          } 
        } 
      } 
    }) => void
  ) => { remove?: () => void } | null;
} | null;

let notificationService: NotificationService = null;
if (Platform.OS !== 'web') {
  try {
    notificationService = require('./utils/notificationService');
  } catch (error) {
    logger.warn('App', 'Failed to load notification service', { error });
  }
}

// Complete auth session results as early as possible (important for Web OAuth flows)
try { WebBrowser.maybeCompleteAuthSession(); } catch {}

SplashScreen.preventAutoHideAsync();

// Web mode store initializes automatically when created (synchronous)
// No need for early initialization - it reads from localStorage on creation

function AppContent() {
  const { t } = useTranslation(['common']);
  // Define proper navigation param list type
  type RootParamList = {
    ChatDetailScreen: { conversationId: string };
    NotificationsScreen: undefined;
    [key: string]: any; // Allow other routes for now
  };
  
  const navigationRef = useRef<NavigationContainerRef<RootParamList>>(null);
  
  // Use centralized loading state instead of local state
  const { 
    state: { isAppReady }, 
    setLoading, 
    setError, 
    markAppReady,
    getCriticalError 
  } = useAppLoading();
  
  // Must call all hooks before any conditional returns
  const { mode } = useWebMode();
  
  // Initialize stores on mount (run only once)
  useEffect(() => {
    const initializeStores = async () => {
      try {
        logger.info('App', 'Initializing Zustand stores');
        
        // Initialize web mode store (reads from localStorage synchronously on creation)
        if (Platform.OS === 'web') {
          const { useWebModeStore } = await import('./stores/webModeStore');
          useWebModeStore.getState().initialize();
        }
        
        // Initialize user store
        const { useUserStore } = await import('./stores/userStore');
        await useUserStore.getState().initialize();
        
        logger.info('App', 'Zustand stores initialized');
      } catch (error) {
        logger.error('App', 'Failed to initialize stores', { error });
      }
    };
    
    // Initialize immediately - no delay needed
    initializeStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  logger.info('App', 'App component mounted');
  
  // Setup notification response listener (iOS + Android) (run only once)
  // MEMORY LEAK FIX: Properly cleanup subscription on unmount
  useEffect(() => {
    if (!notificationService) return;

    let subscription: any = null;
    
    try {
      subscription = notificationService.setupNotificationResponseListener((response) => {
        try {
          logger.info('App', 'Notification clicked', { response });
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
          logger.warn('App', 'Failed to handle notification response', { error: err });
        }
      });
    } catch (err) {
      logger.error('App', 'Failed to setup notification listener', { error: err });
    }

    // CLEANUP: Remove subscription when component unmounts
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        try {
          subscription.remove();
          logger.debug('App', 'Notification subscription cleaned up');
        } catch (err) {
          logger.warn('App', 'Error cleaning up notification subscription', { error: err });
        }
      }
    };
  }, []); // Run only once on mount

  // Fast initial setup to show the UI as quickly as possible (run only once)
  useEffect(() => {
    const showUiQuickly = async () => {
      try {
        logger.info('App', 'Performing fast initial setup');
        markAppReady();
        await SplashScreen.hideAsync();
        logger.info('App', 'Splash screen hidden');
      } catch (e) {
        logger.error('App', 'Fast initial setup failed', { error: e });
        setError('app', e instanceof Error ? e : new Error('Unknown error during fast setup'));
      }
    };
    
    showUiQuickly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Load heavy resources in the background after the UI is visible (run only once when app is ready)
  useEffect(() => {
    if (!isAppReady) return;
    
    const loadBackgroundResources = async () => {
      logger.info('App', 'Starting background resource loading');

      // Validate configuration after all modules are loaded
      try {
        const { validateConfig } = await import('./utils/dbConfig');
        validateConfig();
      } catch (e) {
        logger.warn('App', 'Config validation failed', { error: e });
      }

      // Apply stored language
      try {
        setLoading('language', true);
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
        logger.warn('App', 'Language load failed, using defaults');
        setError('language', e as Error);
      } finally {
        setLoading('language', false);
      }
      
      // Loading fonts
      try {
        setLoading('fonts', true);
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialIcons.font,
        });
        logger.info('App', 'Fonts loaded successfully');
      } catch (fontError) {
        logger.warn('App', 'Font loading failed, continuing without custom fonts');
        setError('fonts', fontError as Error);
      } finally {
        setLoading('fonts', false);
      }
    };

    loadBackgroundResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAppReady]); // Run only once when app is ready

    // Memoize container style to prevent unnecessary re-renders
    const containerStyle = React.useMemo(
      () => ({
        flex: 1,
        paddingTop: Platform.OS === 'web' && mode === 'app' ? 48 : 0, // Space for toggle button in app mode
      }),
      [mode],
    );

    // Check for critical errors
    const criticalError = getCriticalError();
    if (criticalError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.errorText}>
            Oops! There was an issue loading essential resources.
          </Text>
          <Text style={errorStyles.detailText}>
            Please try restarting the app.
          </Text>
          {/* For debugging, you can re-enable this if needed */}
          {typeof __DEV__ !== 'undefined' && __DEV__ && (
            <Text style={errorStyles.detailText}>Error: {criticalError.message}</Text>
          )}
        </View>
      );
    }

    if (!isAppReady) {
      return (
        <View style={loadingStyles.container}>
          <ActivityIndicator size="large" color={colors.info} />
          <Text style={loadingStyles.loadingText}>{t('common:loading')}</Text>
        </View>
      );
    }

  return (
    <NavigationContainer
      key={`nav-${mode}`}
      ref={navigationRef}
      children={
        <View style={containerStyle}>
          <MainNavigator />
          <WebModeToggleOverlay />
          <StatusBar style="auto" />
        </View>
      }
    />
  );
}

// Main App component (no providers needed with Zustand)
export default function App() {
  return (
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        logger.error('App', 'React component tree crashed', {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo: {
            componentStack: errorInfo.componentStack
          }
        });
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
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

