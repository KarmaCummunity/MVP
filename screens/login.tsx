import * as React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

function login() {
  return (
    <div>
        <Text style={styles.bigText}>login</Text>
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  bottomComponent: {
    backgroundColor: 'blue', // Example background color
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  bigText: {
    fontSize: 24, // Adjust the font size as needed
    color: 'white', // Example text color
  },
});

export default login;
