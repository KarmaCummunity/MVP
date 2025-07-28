import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes, UI_TEXT } from '../globals/constants';

export default function InactiveScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {UI_TEXT.inactiveMessage}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>{UI_TEXT.back}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  message: {
    fontSize: FontSizes.large,
    textAlign: 'center',
    marginBottom: 30,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.pink, // ורוד נעים
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: colors.white,
    fontSize: FontSizes.medium,
  },
});
