import React, { useState, useCallback } from 'react';
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
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DonationsStackParamList } from '../globals/types';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useUser } from '../context/UserContext';
import GuestModeNotice from '../components/GuestModeNotice';

interface DonationsScreenProps {
  navigation: NavigationProp<DonationsStackParamList>;
}

// New modern categories with icons and descriptions (excluding quick actions)
const donationCategories = [
  {
    id: 'money',
    title: 'כסף',
    subtitle: 'תרומה כספית',
    icon: 'card-outline',
    color: colors.success,
    bgColor: colors.successLight,
    screen: 'MoneyScreen',
    description: 'תרומה כספית לארגונים ופרויקטים',
  },
  {
    id: 'trump',
    title: 'טרמפים',
    subtitle: 'הסעות וטרמפים',
    icon: 'car-outline',
    color: colors.info,
    bgColor: colors.infoLight,
    screen: 'TrumpScreen',
    description: 'הסעת אנשים וטרמפים לקהילה',
  },
  {
    id: 'knowledge',
    title: 'ידע',
    subtitle: 'חונכות ולימוד',
    icon: 'school-outline',
    color: colors.legacyMediumPurple,
    bgColor: colors.backgroundTertiary,
    screen: 'KnowledgeScreen',
    description: 'חונכות, הדרכה ושיתוף ידע',
  },
  {
    id: 'time',
    title: 'זמן',
    subtitle: 'התנדבות',
    icon: 'time-outline',
    color: colors.orange,
    bgColor: colors.backgroundTertiary,
    screen: 'TimeScreen',
    description: 'התנדבות ועזרה בזמן',
  },
  {
    id: 'food',
    title: 'אוכל',
    subtitle: 'תרומת מזון',
    icon: 'restaurant-outline',
    color: colors.textPrimary,
    bgColor: colors.backgroundSecondary,
    screen: '',
    description: 'תרומת מזון לנזקקים',
  },
  {
    id: 'clothes',
    title: 'בגדים',
    subtitle: 'תרומת בגדים',
    icon: 'shirt-outline',
    color: colors.info, // Was blue-gray
    bgColor: colors.infoLight, // Was light blue-gray
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
    color: colors.textPrimary, // Was brown
    bgColor: colors.backgroundSecondary, // Was light brown
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
    bgColor: colors.backgroundTertiary, // Was light orange
    screen: '',
    description: 'עזרה לחיות מחמד',
  },
  {
    id: 'housing',
    title: 'דיור',
    subtitle: 'עזרה בדיור',
    icon: 'home-outline',
    color: colors.info, // Was indigo
    bgColor: colors.infoLight, // Was light indigo
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
    color: colors.info, // Was purple
    bgColor: colors.infoLight, // Was light purple
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
  // --- New categories ---
  {
    id: 'music',
    title: 'מוזיקה',
    subtitle: 'נגינה ושיתוף מוזיקלי',
    icon: 'musical-notes-outline',
    color: colors.pink,
    bgColor: colors.pinkLight,
    screen: '',
    description: 'נגינה, שיתופי פעולה מוזיקליים והופעות קהילתיות',
  },
  {
    id: 'games',
    title: 'משחקים',
    subtitle: 'פעילויות ומשחקי חברה',
    icon: 'game-controller-outline',
    color: colors.orange,
    bgColor: colors.orangeLight,
    screen: '',
    description: 'פעילויות קהילה ומשחקי חברה לכל הגילאים',
  },
  {
    id: 'riddles',
    title: 'חידות',
    subtitle: 'חשיבה ואתגר',
    icon: 'help-circle-outline',
    color: colors.info,
    bgColor: colors.infoLight,
    screen: '',
    description: 'חידות, אתגרים ומשימות חשיבה לקהילה',
  },
  {
    id: 'recipes',
    title: 'מתכונים',
    subtitle: 'בישול ושיתוף',
    icon: 'fast-food-outline',
    color: colors.success,
    bgColor: colors.successLight,
    screen: '',
    description: 'שיתוף מתכונים, ארוחות קהילתיות ובישול יחד',
  },
  {
    id: 'plants',
    title: 'צמחים',
    subtitle: 'גינון ושתילה',
    icon: 'flower-outline',
    color: colors.success,
    bgColor: colors.successLight,
    screen: '',
    description: 'גינון קהילתי, שתילים והחלפת צמחים',
  },
  {
    id: 'waste',
    title: 'פסולת',
    subtitle: 'מיחזור והפרדה',
    icon: 'trash-outline',
    color: colors.warning,
    bgColor: colors.warningLight,
    screen: '',
    description: 'פרויקטי ניקיון, מיחזור והפרדת פסולת',
  },
  {
    id: 'art',
    title: 'אמנות',
    subtitle: 'יצירה ושיתוף',
    icon: 'color-palette-outline',
    color: colors.pink,
    bgColor: colors.pinkLight,
    screen: '',
    description: 'יצירה אומנותית, סדנאות ושיתופי קהילה',
  },
  {
    id: 'sports',
    title: 'ספורט',
    subtitle: 'אורח חיים פעיל',
    icon: 'football-outline',
    color: colors.orange,
    bgColor: colors.orangeLight,
    screen: '',
    description: 'מפגשי ספורט, ריצות קהילתיות ופעילות גופנית',
  },
];

const DonationsScreen: React.FC<DonationsScreenProps> = ({ navigation }) => {
  const { isGuestMode } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('💰 DonationsScreen - Screen focused, refreshing data...');
      // Reset selected category when returning to screen
      setSelectedCategory(null);
    }, [])
  );

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
                {/* Guest Mode Notice */}
                {isGuestMode && <GuestModeNotice />}
                
          {/* Active Screens Section */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>במיוחד בשבילך</Text>
            <View style={styles.activeCategoriesGrid}>
            {donationCategories.filter(category => category.screen).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.activeCategoryCard,
                  { backgroundColor: category.bgColor },
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.activeCategoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon as any} size={28} color="white" />
                </View>
                <Text style={styles.activeCategoryTitle}>{category.title}</Text>
                <Text style={styles.activeCategorySubtitle}>{category.subtitle}</Text>
                <Text style={styles.activeCategoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Inactive Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>כל הדרכים לפעול בקהילה</Text>
          <View style={styles.categoriesGrid}>
            {donationCategories.filter(category => !category.screen).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.bgColor },
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
    backgroundColor: colors.backgroundPrimary,
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
    backgroundColor: colors.backgroundSecondaryPink,
    borderColor: colors.moneyFormBorder,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  activeCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
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
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 0.5,
    borderColor: colors.backgroundTertiary,
  },
  activeCategoryCard: {
    width: '45%',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 140,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
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
  activeCategoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  activeCategoryTitle: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  activeCategorySubtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  activeCategoryDescription: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsSection: {
    marginBottom: 30,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
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
