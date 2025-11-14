import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { Ionicons } from '@expo/vector-icons';

interface AdminPeopleScreenProps {
  navigation: NavigationProp<any>;
}

export default function AdminPeopleScreen({ navigation }: AdminPeopleScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.title}>ניהול אנשים</Text>
        <Text style={styles.subtitle}>מסך זה יהיה זמין בקרוב</Text>
        <Text style={styles.description}>
          כאן תוכל לנהל עובדים ומתנדבים
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.LG,
  },
  title: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  subtitle: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  description: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

