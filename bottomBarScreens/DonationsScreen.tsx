import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { DonationsStackParamList } from '../globals/types';
import colors from '../globals/colors';
import globalStyles from '../globals/styles';

interface DonationsScreenProps {
  navigation: NavigationProp<DonationsStackParamList>;
}

const recommended = [
  { label: 'כסף', screen: 'MoneyScreen' },
  { label: 'טרמפים', screen: 'TrumpScreen' },
  { label: 'אוכל', screen: '' },
];

const categories = [
  'תחבורה',
  'שיעורים פרטיים',
  'הספרייה',
  'חפצים',
  'חיות',
  'בגדים',
  'דיור',
  'רפואה',
  'משפחה',
  'תמיכה',
  'מלונות',
  'שאריות',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחבורה',
  'תחב1ורה',
];

export default function DonationsScreen({
  navigation,
}: DonationsScreenProps): React.ReactElement {
  return (
    <View style={styles.container}>
      {/* Recommended Section */}
      <Text style={globalStyles.sectionTitle}>מומלצים בשבילך</Text>
      <View style={styles.recommendedContainer}>
        {recommended.map(({ label, screen }, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recommendedButton}
            onPress={() => screen && navigation.navigate(screen as keyof DonationsStackParamList)}
          >
            <Text style={styles.recommendedButtonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* All Categories Section */}
      <Text style={globalStyles.sectionTitle}>כל האפשרויות</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  recommendedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 16,
    marginBottom: 30,
  },
  recommendedButton: {
    // width: '48%',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.09,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 3,
    elevation: 5,
    flex: 1,
  },
  recommendedButtonText: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 60
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 20,
  },
  categoryButton: {
    width: '30%',
    backgroundColor: colors.white,
    paddingVertical: 25,
    paddingHorizontal: 5,
    marginBottom: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  categoryButtonText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
