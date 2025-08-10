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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DonationsStackParamList } from '../globals/types';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useUser } from '../context/UserContext';
import GuestModeNotice from '../components/GuestModeNotice';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { donations, charities } from '../globals/fakeData';
import { useTranslation } from 'react-i18next';

interface DonationsScreenProps {
  navigation: NavigationProp<DonationsStackParamList>;
}

const RECENT_CATEGORIES_KEY = 'recent_categories_ids';
const RECENT_LIMIT = 4;
const DEFAULT_RECENT_IDS: string[] = ['money', 'trump', 'furniture'];

const BASE_CATEGORIES = [
  { id: 'money',      icon: 'card-outline',        color: colors.success, bgColor: colors.successLight, screen: 'MoneyScreen' },
  { id: 'trump',      icon: 'car-outline',         color: colors.info,    bgColor: colors.infoLight,    screen: 'TrumpScreen' },
  { id: 'knowledge',  icon: 'school-outline',      color: colors.legacyMediumPurple, bgColor: colors.backgroundTertiary, screen: 'KnowledgeScreen' },
  { id: 'time',       icon: 'time-outline',        color: colors.orange,  bgColor: colors.backgroundTertiary, screen: 'TimeScreen' },
  { id: 'food',       icon: 'restaurant-outline',  color: colors.textPrimary, bgColor: colors.backgroundSecondary, screen: 'FoodScreen' },
  { id: 'clothes',    icon: 'shirt-outline',       color: colors.info,    bgColor: colors.infoLight,    screen: 'ClothesScreen' },
  { id: 'books',      icon: 'library-outline',     color: colors.success, bgColor: colors.successLight, screen: 'BooksScreen' },
  { id: 'furniture',  icon: 'bed-outline',         color: colors.textPrimary, bgColor: colors.backgroundSecondary, screen: 'FurnitureScreen' },
  { id: 'medical',    icon: 'medical-outline',     color: colors.error,   bgColor: colors.errorLight,   screen: 'MedicalScreen' },
  { id: 'animals',    icon: 'paw-outline',         color: colors.orangeDark, bgColor: colors.backgroundTertiary, screen: 'AnimalsScreen' },
  { id: 'housing',    icon: 'home-outline',        color: colors.info,    bgColor: colors.infoLight,    screen: 'HousingScreen' },
  { id: 'support',    icon: 'heart-outline',       color: colors.pinkDark, bgColor: colors.pinkLight,   screen: 'SupportScreen' },
  { id: 'education',  icon: 'book-outline',        color: colors.info,    bgColor: colors.infoLight,    screen: 'EducationScreen' },
  { id: 'environment',icon: 'leaf-outline',        color: colors.success, bgColor: colors.successLight, screen: 'EnvironmentScreen' },
  { id: 'technology', icon: 'laptop-outline',      color: colors.info,    bgColor: colors.infoLight,    screen: 'TechnologyScreen' },
  { id: 'music',      icon: 'musical-notes-outline', color: colors.pink,  bgColor: colors.pinkLight,    screen: 'MusicScreen' },
  { id: 'games',      icon: 'game-controller-outline', color: colors.orange, bgColor: colors.orangeLight, screen: 'GamesScreen' },
  { id: 'riddles',    icon: 'help-circle-outline', color: colors.info,    bgColor: colors.infoLight,    screen: 'RiddlesScreen' },
  { id: 'recipes',    icon: 'fast-food-outline',   color: colors.success, bgColor: colors.successLight, screen: 'RecipesScreen' },
  { id: 'plants',     icon: 'flower-outline',      color: colors.success, bgColor: colors.successLight, screen: 'PlantsScreen' },
  { id: 'waste',      icon: 'trash-outline',       color: colors.warning, bgColor: colors.warningLight, screen: 'WasteScreen' },
  { id: 'art',        icon: 'color-palette-outline', color: colors.pink,  bgColor: colors.pinkLight,    screen: 'ArtScreen' },
  { id: 'sports',     icon: 'football-outline',    color: colors.orange,  bgColor: colors.orangeLight,  screen: 'SportsScreen' },
] as const;

type CategoryId = typeof BASE_CATEGORIES[number]['id'];

const DonationsScreen: React.FC<DonationsScreenProps> = ({ navigation }) => {
  const { isGuestMode } = useUser();
  const { t } = useTranslation(['donations','common']);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSelectedCategory(null);
      (async () => {
        try {
          const stored = await AsyncStorage.getItem(RECENT_CATEGORIES_KEY);
          if (stored) {
            const parsed: string[] = JSON.parse(stored);
            setRecentCategoryIds(Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, RECENT_LIMIT) : DEFAULT_RECENT_IDS);
            if (!stored || (Array.isArray(JSON.parse(stored)) && JSON.parse(stored).length === 0)) {
              await AsyncStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(DEFAULT_RECENT_IDS));
            }
          } else {
            setRecentCategoryIds(DEFAULT_RECENT_IDS);
            await AsyncStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(DEFAULT_RECENT_IDS));
          }
        } catch {
          setRecentCategoryIds(DEFAULT_RECENT_IDS);
        }
      })();
    }, [])
  );

  const getCategoryText = (id: CategoryId) => ({
    title: t(`donations:categories.${id}.title`),
    subtitle: t(`donations:categories.${id}.subtitle`),
    description: t(`donations:categories.${id}.description`),
  });

  const handleCategoryPress = (category: { id: CategoryId; screen?: string }) => {
    setSelectedCategory(category.id);
    setRecentCategoryIds((prev) => {
      const next = [category.id, ...prev.filter((id) => id !== category.id)].slice(0, RECENT_LIMIT);
      AsyncStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    if (category.screen) {
      (navigation as any).navigate(category.screen);
    } else {
      Alert.alert(
        t('donations:comingSoonTitle', 'בקרוב'),
        t('donations:comingSoonMessage', 'הקטגוריה תהיה זמינה בקרוב!'),
        [{ text: t('common:confirm', 'אישור'), style: 'default' }]
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

  const recentIdsBase = (recentCategoryIds.length > 0 ? recentCategoryIds : DEFAULT_RECENT_IDS);
  const recentIdsWithMoneyFirst = ['money', ...recentIdsBase.filter((id) => id !== 'money')].slice(0, RECENT_LIMIT) as CategoryId[];
  const recentCategories = recentIdsWithMoneyFirst
    .map((id) => BASE_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is typeof BASE_CATEGORIES[number] => Boolean(c));

  const otherCategories = BASE_CATEGORIES.filter((c) => !recentCategories.some((rc) => rc.id === c.id));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      {isGuestMode && <GuestModeNotice />}

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>{t('donations:forYou', 'במיוחד בשבילך')}</Text>
        <View style={[styles.categoriesGrid, { flexDirection: 'row' }]}>
          {recentCategories.map((category) => {
            const { title, subtitle } = getCategoryText(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: category.bgColor, width: '23%' }]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={styles.categoryIconWrapper}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as any} size={26} color="white" />
                  </View>
                  {category.id === 'money' && (
                    <Ionicons name="pin" size={16} color={colors.pink} style={styles.pinOverlay} />
                  )}
                </View>
                <View style={styles.categoryTitleRow}>
                  <Text style={styles.categoryTitle}>{title}</Text>
                </View>
                <Text style={styles.categorySubtitle}>{subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{t('donations:allWays', 'כל הדרכים לפעול בקהילה')}</Text>
          <View style={[styles.categoriesGrid, { flexDirection: 'row' }]}>
            {otherCategories.map((category) => {
              const { title, subtitle } = getCategoryText(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: category.bgColor, width: '31.5%' }]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as any} size={26} color="white" />
                  </View>
                  <Text style={styles.categoryTitle}>{title}</Text>
                  <Text style={styles.categorySubtitle}>{subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Stats Section */}
          {(() => {
            const now = Date.now();
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
            const weeklyDonations = donations.filter((d: any) => {
              const t = new Date(d.createdAt || Date.now()).getTime();
              return t >= weekAgo;
            }).length;
            const activeDonors = new Set(donations.map((d: any) => d.createdBy).filter(Boolean)).size;
            const activeCharities = charities.length;
            return (
              <DonationStatsFooter
                stats={[
                  { label: t('donations:activeDonors', 'תורמים פעילים'), value: activeDonors, icon: 'people-outline' },
                  { label: t('donations:weeklyDonations', 'תרומות השבוע'), value: weeklyDonations, icon: 'heart-outline' },
                  { label: t('donations:activeCharities', 'עמותות פעילות'), value: activeCharities, icon: 'business-outline' },
                ]}
              />
            );
          })()}
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
    paddingHorizontal: 5,
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

    backgroundColor: colors.moneyFormBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.moneyFormBorder,
    marginTop: 10,
    marginBottom: 5,
    marginHorizontal: 10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,

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
    gap: 6,
  },
  activeCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryCard: {
    width: '31.5%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    // minHeight: 108,
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
    marginBottom: 4,
  },
  categoryIconWrapper: {
    position: 'relative',
  },
  pinOverlay: {
    position: 'absolute',
    top: -6,
    right: -6,
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
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  categorySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 10,
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
