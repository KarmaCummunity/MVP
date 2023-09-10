import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigations/MainNavigator';

function App() {
  return (
    <NavigationContainer>
        <MainNavigator />
    </NavigationContainer>
  );
}

export default App;