import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SimpleUserProvider } from './SimpleUserContext';
import SimpleLoginScreen from './SimpleLoginScreen';
import SimpleHomeScreen from './SimpleHomeScreen';

// יצירת ניווט פשוט
const Stack = createStackNavigator();

// ניווט ראשי
const SimpleNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={SimpleLoginScreen} />
      <Stack.Screen name="Home" component={SimpleHomeScreen} />
    </Stack.Navigator>
  );
};

// אפליקציה ראשית
const SimpleTestApp = () => {
  return (
    <SimpleUserProvider>
      <NavigationContainer>
        <SimpleNavigator />
      </NavigationContainer>
    </SimpleUserProvider>
  );
};

export default SimpleTestApp; 