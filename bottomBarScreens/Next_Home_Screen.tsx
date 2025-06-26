import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Next_Home_Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>מסך חדש נפתח!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cce5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
