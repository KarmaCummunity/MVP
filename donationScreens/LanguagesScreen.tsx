import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { useTranslation } from 'react-i18next';

export default function LanguagesScreen() {
  const { t } = useTranslation(['donations']);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('donations:categories.languages.title')}</Text>
      <Text style={styles.subtitle}>{t('donations:categories.languages.subtitle')}</Text>
      <Text style={styles.description}>{t('donations:categories.languages.description')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: Math.round(FontSizes.body * 1.4),
  },
});
