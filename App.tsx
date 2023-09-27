import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigations/MainNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Import SafeAreaProvider

function App() {
  return (
    <SafeAreaProvider> 
    <NavigationContainer>
        <MainNavigator />
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;