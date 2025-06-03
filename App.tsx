import React from 'react';
import MainNavigator from './navigations/MainNavigator';
import { NavigationContainer } from '@react-navigation/native';

function App() {
  return (
    <NavigationContainer>
        <MainNavigator />
    </NavigationContainer>
  );
}

export default App;