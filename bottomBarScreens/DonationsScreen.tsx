import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DonationsStackParamList } from '../globals/types';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';

interface DonationsScreenProps {
  navigation: NavigationProp<DonationsStackParamList>;
}

// New modern categories with icons and descriptions (excluding quick actions)
const donationCategories = [
  {
    id: 'food',
    title: 'אוכל',
    subtitle: 'תרומת מזון',
    icon: 'restaurant-outline',
    color: colors.textPrimary, // היה חום
    bgColor: colors.backgroundSecondary, // היה חום בהיר
    screen: '',
    description: 'תרומת מזון לנזקקים',
  },
  {
    id: 'clothes',
    title: 'בגדים',
    subtitle: 'תרומת בגדים',
    icon: 'shirt-outline',
    color: colors.info, // היה כחול-אפור
    bgColor: colors.infoLight, // היה כחול-אפור בהיר
    screen: '',
    description: 'תרומת בגדים לנזקקים',
  },
  {
    id: 'books',
    title: 'ספרים',
    subtitle: 'תרומת ספרים',
    icon: 'library-outline',
    color: colors.success,
    bgColor: colors.successLight,
    screen: '',
    description: 'תרומת ספרים לספרייה',
  },
  {
    id: 'furniture',
    title: 'רהיטים',
    subtitle: 'תרומת רהיטים',
    icon: 'bed-outline',
    color: colors.textPrimary, // היה חום
    bgColor: colors.backgroundSecondary, // היה חום בהיר
    screen: '',
    description: 'תרומת רהיטים לבית',
  },
  {
    id: 'medical',
    title: 'רפואה',
    subtitle: 'עזרה רפואית',
    icon: 'medical-outline',
    color: colors.error,
    bgColor: colors.errorLight,
    screen: '',
    description: 'עזרה רפואית וטיפולים',
  },
  {
    id: 'animals',
    title: 'חיות',
    subtitle: 'עזרה לחיות',
    icon: 'paw-outline',
    color: colors.orangeDark,
    bgColor: colors.backgroundTertiary, // היה כתום בהיר
    screen: '',
    description: 'עזרה לחיות מחמד',
  },
  {
    id: 'housing',
    title: 'דיור',
    subtitle: 'עזרה בדיור',
    icon: 'home-outline',
    color: colors.info, // היה אינדיגו
    bgColor: colors.infoLight, // היה אינדיגו בהיר
    screen: '',
    description: 'עזרה בדיור וקורת גג',
  },
  {
    id: 'support',
    title: 'תמיכה',
    subtitle: 'תמיכה נפשית',
    icon: 'heart-outline',
    color: colors.pinkDark,
    bgColor: colors.pinkLight,
    screen: '',
    description: 'תמיכה נפשית ורגשית',
  },
  {
    id: 'education',
    title: 'חינוך',
    subtitle: 'עזרה בלימודים',
    icon: 'book-outline',
    color: colors.info, // היה סגול
    bgColor: colors.infoLight, // היה סגול בהיר
    screen: '',
    description: 'עזרה בלימודים וקורסים',
  },
  {
    id: 'environment',
    title: 'סביבה',
    subtitle: 'פרויקטים ירוקים',
    icon: 'leaf-outline',
    color: colors.success,
    bgColor: colors.successLight,
    screen: '',
    description: 'פרויקטים ירוקים וסביבתיים',
  },
  {
    id: 'technology',
    title: 'טכנולוגיה',
    subtitle: 'עזרה טכנית',
    icon: 'laptop-outline',
    color: colors.info,
    bgColor: colors.infoLight,
    screen: '',
    description: 'עזרה טכנית ומחשבים',
  },
];

const DonationsScreen: React.FC<DonationsScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (category: any) => {
    console.log('Category pressed:', category.title);
    setSelectedCategory(category.id);
    
    if (category.screen) {
      navigation.navigate(category.screen as keyof DonationsStackParamList);
    } else {
      Alert.alert(
        'בקרוב',
        `הקטגוריה "${category.title}" תהיה זמינה בקרוב!`,
        [{ text: 'אישור', style: 'default' }]
      );
    }
  };

  const handleQuickDonation = (type: string) => {
    console.log('Quick donation pressed:', type);
    
    switch (type) {
      case 'כסף':
        navigation.navigate('MoneyScreen');
        break;
      case 'טרמפ':
        navigation.navigate('TrumpScreen');
        break;
      case 'ידע':
        navigation.navigate('KnowledgeScreen');
        break;
      case 'זמן':
        navigation.navigate('TimeScreen');
        break;
      default:
        Alert.alert('תרומה מהירה', `תרומת ${type} - בקרוב!`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      


              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>כל הדרכים לפעול בקהילה</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.success }]}
              onPress={() => handleQuickDonation('כסף')}
            >
              <Ionicons name="card" size={24} color="white" />
              <Text style={styles.quickActionText}>כסף</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.info }]}
              onPress={() => handleQuickDonation('טרמפ')}
            >
              <Ionicons name="car" size={24} color="white" />
              <Text style={styles.quickActionText}>טרמפ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.legacyMediumPurple }]}
              onPress={() => handleQuickDonation('ידע')}
            >
              <Ionicons name="school" size={24} color="white" />
              <Text style={styles.quickActionText}>ידע</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.orange }]}
              onPress={() => handleQuickDonation('זמן')}
            >
              <Ionicons name="time" size={24} color="white" />
              <Text style={styles.quickActionText}>זמן</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>כל הקטגוריות</Text>
          <View style={styles.categoriesGrid}>
            {donationCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.bgColor },
                  selectedCategory === category.id && styles.categoryCardSelected
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>סטטיסטיקות קהילתיות</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={colors.pink} />
              <Text style={styles.statNumber}>1,247</Text>
              <Text style={styles.statLabel}>תורמים פעילים</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="heart" size={24} color={colors.pink} />
              <Text style={styles.statNumber}>5,892</Text>
              <Text style={styles.statLabel}>תרומות השבוע</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color={colors.pink} />
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>שביעות רצון</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.backgroundPrimary,
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 40,
    paddingBottom: 200,
  },
  quickActionsSection: {
    marginBottom: 30,
    alignItems: 'center',

  },
  sectionTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 15,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    color: colors.white,
    fontSize: FontSizes.button,
    fontWeight: '600',
    marginTop: 8,
  },
  categoriesSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  categoryCard: {
    width: '30%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 100,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: colors.pink,
  },
  categoryIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 3,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: FontSizes.extraSmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.pink,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DonationsScreen;
