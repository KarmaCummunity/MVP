import React from 'react';
import MainNavigator from './navigations/MainNavigator';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Import SafeAreaProvider

function App() {
  return (
    <SafeAreaProvider> 
      <NavigationContainer>
        <MainNavigator/>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;