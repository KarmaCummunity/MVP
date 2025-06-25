// screens/WebViewScreen.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebViewScreenProps {
  // You can pass the URL as a prop if you want to make this component reusable
  // For now, we'll hardcode jgive.com
  // url: string;
}

const WebViewScreen: React.FC<WebViewScreenProps> = () => {
  const J_GIVE_URL = "https://www.jgive.com/"; // The URL you want to display

  // Optional: Add a loading indicator while the page loads
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: J_GIVE_URL }}
        style={styles.webview}
        // Optional: Add props for better user experience
        javaScriptEnabled={true} // Enable JavaScript on the page
        domStorageEnabled={true} // Enable DOM storage (e.g., local storage)
        startInLoadingState={true} // Show loading indicator initially
        renderLoading={renderLoading} // Custom loading component
        // onError={(syntheticEvent) => {
        //   const { nativeEvent } = syntheticEvent;
        //   console.warn('WebView error: ', nativeEvent);
        //   // You could display an error message to the user here
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
  loadingContainer: {
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
});

export default WebViewScreen;