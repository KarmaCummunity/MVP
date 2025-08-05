import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { texts } from '../globals/texts';

export default function InactiveScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {texts.inactiveMessage}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>{texts.back}</Text>
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
    backgroundColor: colors.pink, // Nice pink
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: colors.white,
    fontSize: FontSizes.medium,
  },
});
