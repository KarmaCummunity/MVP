// screens/WebViewScreen.tsx
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
  Text // Needed for loading message on web
} from 'react-native';

// Re-import WebView for native platforms (iOS/Android)
import { WebView } from 'react-native-webview';

// useNavigation is still needed for navigating back on the web side
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
// WebBrowser is no longer needed as we are using WebView for native.
// import * as WebBrowser from 'expo-web-browser';

interface WebViewScreenProps {
  // If you want to pass the URL as a prop, you would define it here
  // For example: route: { params?: { url?: string } };
}

const J_GIVE_URL = "https://www.jgive.com/"; // The URL you want to open

const WebViewScreen: React.FC<WebViewScreenProps> = (
  // If you pass URL as a prop, uncomment this line:
  // { route }
) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // Conditional logic for Web platform only
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, jgive.com refuses to connect within an iframe due to security policies.
      // The only reliable way to open it on web is in a new browser tab.
      window.open(J_GIVE_URL, '_blank');
      // After opening, navigate back in the app's history
      navigation.goBack();
    }
    // No need for WebBrowser.openBrowserAsync() on native here,
    // as the WebView component handles native rendering below.
  }, [navigation]);

  // Render a loading indicator for the web, as it immediately opens a new tab and navigates back
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>
            Opening JGive in a new browser tab...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render the WebView for iOS and Android
  const renderLoading = () => (
    <View style={styles.nativeLoadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: J_GIVE_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={renderLoading}
        // You can keep your error and loadEnd handlers here for native
        // onError={(syntheticEvent) => {
        //   const { nativeEvent } = syntheticEvent;
        //   console.warn('WebView error: ', nativeEvent);
        // }}
        // onLoadEnd={() => console.log('WebView finished loading')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Or your app's background color
  },
  webview: {
    flex: 1,
  },
  // This loading container is for when the WebView itself is loading on native
  nativeLoadingContainer: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Match your screen background
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999, // Ensure it's on top
  },
  // This loading container is for the web version (briefly shown before new tab opens)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default WebViewScreen;