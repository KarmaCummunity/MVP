import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../../globals/colors';
import { fontSizes as FontSizes } from '../../globals/appConstants';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ברוך הבא ל-KC_ID! 🎉</Text>
      <Text style={styles.subtitle}>
        הקיבוץ הקפיטליסטי של ישראל
      </Text>
      <Text style={styles.description}>
        פלטפורמה חינמית ללא מטרות רווח לחיבור קהילתי בישראל
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    padding: 20,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: colors.info,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});