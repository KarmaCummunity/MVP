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
import colors from './globals/colors';
import { UserProvider } from './context/UserContext';
import { WebModeProvider, useWebMode } from './context/WebModeContext';
import { AppLoadingProvider, useAppLoading } from './context/AppLoadingContext';
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

  logger.info('App', 'App component mounted');
  
  // TODO: Move notification setup to dedicated notification service/hook
  // TODO: Add proper error handling for notification permission failures
  // TODO: Test notification handling on all platforms (iOS/Android/Web)
  // Setup notification response listener (iOS + Android)
  useEffect(() => {
    if (!notificationService) return;

    const subscription = notificationService.setupNotificationResponseListener((response) => {
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

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  // Fast initial setup to show the UI as quickly as possible
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
  }, [markAppReady, setError]);

  // Load heavy resources in the background after the UI is visible
  useEffect(() => {
    const loadBackgroundResources = async () => {
      logger.info('App', 'Starting background resource loading');

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

    if (isAppReady) {
      loadBackgroundResources();
    }
  }, [isAppReady, setLoading, setError]);



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
        {(typeof __DEV__ !== 'undefined' && __DEV__) && <Text style={errorStyles.detailText}>Error: {criticalError.message}</Text>}
      </View>
    );
  }

  if (!isAppReady) {
    return (
      <View style={loadingStyles.container}>
          <ActivityIndicator size="large" color={colors.info}/>
          <Text style={loadingStyles.loadingText}>{t('common:loading')}</Text>
      </View>
    );
  }

  const AppNavigationRoot: React.FC = () => {
    const { mode } = useWebMode();
    
    // Add top padding in app mode to make room for toggle button
    const containerStyle = {
      flex: 1,
      paddingTop: Platform.OS === 'web' && mode === 'app' ? 48 : 0 // Space for toggle button in app mode
    };
    
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
  };

  return (
    <AppNavigationRoot />
  );
}

// Main App component with all providers
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
      <AppLoadingProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <WebModeProvider>
              <UserProvider>
                <AppContent />
              </UserProvider>
            </WebModeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </AppLoadingProvider>
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

