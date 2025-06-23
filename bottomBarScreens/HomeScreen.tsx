import React from 'react';
import { View, Text, StyleSheet, BackHandler, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // You can add a specific action here if you want,
        // e.g., show an alert before exiting/going back, or save data.
        // For "do nothing", simply return true.
        Alert.alert(
          'Exit App?',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', onPress: () => null, style: 'cancel' },
            { text: 'YES', onPress: () => BackHandler.exitApp() }
          ]
        );
        console.log('Android back button pressed on Home Screen, preventing default.');
        // Return true to prevent default back button behavior (e.g., navigating back)
        return true;
      };

      // Add the event listener. The addEventListener method now returns a function
      // that can be called to remove the listener.
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Clean up the event listener by calling the function returned by addEventListener
      return () => {
        backHandler.remove(); // This is the correct way to remove the listener now!
      };
    }, [])
  );

  const bottomPadding = 60 + 20 + insets.bottom;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <Text style={styles.title}>Welcome to Home Screen!</Text>
      <Text style={styles.text}>
        This is your main content area.
      </Text>
      <Text style={styles.text}>
        Try pressing the Android back button. It will now prompt to exit instead of going back.
      </Text>
      <View style={{ height: 200, backgroundColor: '#eee', marginTop: 20, width: '80%', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Scrollable Content Placeholder</Text>
        <Text>More content...</Text>
        <Text>More content...</Text>
        <Text>More content...</Text>
        <Text>More content...</Text>
        <Text>More content...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
});