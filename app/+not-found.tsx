import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'אופס! לא נמצא' }} />
      <View style={styles.container}>
        <Text style={styles.title}>הדף לא נמצא</Text>
        <Text style={styles.description}>
          הדף שאתה מחפש לא קיים
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>חזור לעמוד הבית</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.backgroundPrimary,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: FontSizes.body,
    color: colors.info,
    fontWeight: '600',
  },
});