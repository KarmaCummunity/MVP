import React, { useCallback, useEffect, useState } from 'react';
import MainNavigator from './navigations/MainNavigator';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function App() {

  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = useCallback(async () => {
    await Font.loadAsync({
      ...Ionicons.font,
      // You can load other fonts here too
    });
    setFontsLoaded(true);
  }, []);

  useEffect(() => {
    loadFonts();
  }, []);

  return (
    <NavigationContainer>
        <MainNavigator />
    </NavigationContainer>
  );
}