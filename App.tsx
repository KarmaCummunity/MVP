import React, { useCallback, useEffect, useState } from 'react';
import MainNavigator from './navigations/MainNavigator';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'; // Import necessary components for a loading screen

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null); // State to catch potential errors

  const loadFonts = useCallback(async () => {
    try {
      await Font.loadAsync({
        ...Ionicons.font,
        // If you're using MaterialIcons (for example, in your TodoListScreen TaskItem)
        // you'll need to load its font as well:
        'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
        // Add any other custom fonts you use here
      });
      setFontsLoaded(true);
    } catch (error: any) { // Type 'any' for the error object
      console.error("Error loading fonts:", error);
      setFontError(error);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]); // Add loadFonts to the dependency array

  if (fontError) {
    // Render an error screen if fonts failed to load
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load app fonts!</Text>
        <Text style={styles.errorText}>Error: {fontError.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    // Render a loading screen while fonts are being loaded
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  // Once fonts are loaded, render the main application
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});