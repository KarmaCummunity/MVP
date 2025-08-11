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
  Platform,
} from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DonationsStackParamList } from '../globals/types';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS, IconSizes } from '../globals/constants';
import { useUser } from '../context/UserContext';
import GuestModeNotice from '../components/GuestModeNotice';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { donations, charities } from '../globals/fakeData';
import { useTranslation } from 'react-i18next';
import { getScreenInfo, isLandscape, scaleSize } from '../globals/responsive';
import stylesGlobal, { createShadowStyle } from '../globals/styles';

interface DonationsScreenProps {
  navigation: NavigationProp<DonationsStackParamList>;
}

const RECENT_CATEGORIES_KEY = 'recent_categories_ids';
const RECENT_LIMIT = 4;
const DEFAULT_RECENT_IDS: string[] = ['money', 'trump', 'clothes', 'furniture'];

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
  { id: 'dreams',     icon: 'star-outline',        color: colors.pink,    bgColor: colors.pinkLight,    screen: 'DreamsScreen' },
  { id: 'fertility',  icon: 'medkit-outline',      color: colors.error,   bgColor: colors.errorLight,   screen: 'FertilityScreen' },
  { id: 'jobs',       icon: 'briefcase-outline',   color: colors.info,    bgColor: colors.infoLight,    screen: 'JobsScreen' },
] as const;

type CategoryId = typeof BASE_CATEGORIES[number]['id'];

const DonationsScreen: React.FC<DonationsScreenProps> = ({ navigation }) => {
  const { isGuestMode } = useUser();
  const { t } = useTranslation(['donations','common']);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>([]);

  const { isTablet, isDesktop } = getScreenInfo();
  const landscape = isLandscape();
  const recentColumns = isDesktop ? 6 : isTablet || landscape ? 5 : 4;
  const allColumns = isDesktop ? 5 : isTablet || landscape ? 4 : 3;
  const recentCardWidth = `${(100 / recentColumns) - 2}%` as const;
  const allCardWidth = `${(100 / allColumns) - 2}%` as const;
  const categoryIconSize = scaleSize(26);
  const categoryIconOuter = scaleSize(35);

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
        t('donations:comingSoonTitle'),
        t('donations:comingSoonMessage'),
        [{ text: t('common:confirm'), style: 'default' }]
      );
    }
  };

  const handleQuickDonation = (type: string) => {
    console.log('Quick donation pressed:', type);
    
    switch (type) {
      case t('donations:categories.money.title'):
        navigation.navigate('MoneyScreen');
        break;
      case t('donations:categories.trump.title'):
        navigation.navigate('TrumpScreen');
        break;
      case t('donations:categories.knowledge.title'):
        navigation.navigate('KnowledgeScreen');
        break;
      case t('donations:categories.time.title'):
        navigation.navigate('TimeScreen');
        break;
      default:
        Alert.alert(t('donations:quickDonation'), t('donations:quickDonationComingSoon', { type }));
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
        <Text style={styles.sectionTitle}>{t('donations:forYou')}</Text>
        <View style={[styles.categoriesGrid, { flexDirection: 'row' }]}>
          {recentCategories.map((category) => {
            const { title, subtitle } = getCategoryText(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.bgColor, width: recentCardWidth },
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={styles.categoryIconWrapper}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color, width: categoryIconOuter, height: categoryIconOuter, borderRadius: categoryIconOuter / 2 }]}>
                    <Ionicons name={category.icon as any} size={categoryIconSize} color="white" />
                  </View>
                  {category.id === 'money' && (
                    <Ionicons name="pin" size={scaleSize(16)} color={colors.pink} style={styles.pinOverlay} />
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

      <ScrollView style={[styles.content, Platform.OS === 'web' ? ({ overflowY: 'auto' } as any) : null]} showsVerticalScrollIndicator={false} contentContainerStyle={Platform.OS === 'web' ? ({ minHeight: '100vh' } as any) : undefined}>
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{t('donations:allWays')}</Text>
          <View style={[styles.categoriesGrid, { flexDirection: 'row' }]}>
            {otherCategories.map((category) => {
              const { title, subtitle } = getCategoryText(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.bgColor, width: allCardWidth },
                  ]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color, width: categoryIconOuter, height: categoryIconOuter, borderRadius: categoryIconOuter / 2 }]}>
                    <Ionicons name={category.icon as any} size={categoryIconSize} color="white" />
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
                  { label: t('donations:activeDonors'), value: activeDonors, icon: 'people-outline' },
                  { label: t('donations:weeklyDonations'), value: weeklyDonations, icon: 'heart-outline' },
                  { label: t('donations:activeCharities'), value: activeCharities, icon: 'business-outline' },
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
    paddingTop: LAYOUT_CONSTANTS.SPACING.LG,
    paddingBottom: LAYOUT_CONSTANTS.SPACING.MD,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    borderBottomLeftRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    borderBottomRightRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.1, 4),
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
    width: scaleSize(45),
    height: scaleSize(45),
    borderRadius: scaleSize(45) / 2,
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  userName: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  settingsButton: {
    padding: LAYOUT_CONSTANTS.SPACING.SM,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
    paddingTop: LAYOUT_CONSTANTS.SPACING.LG,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL + LAYOUT_CONSTANTS.SPACING.MD,
    paddingBottom: LAYOUT_CONSTANTS.SPACING.XL * 6,
  },
  quickActionsSection: {
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
    alignItems: 'center',

  },
  sectionTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.LG,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.1, 4),
  },
  quickActionText: {
    color: colors.white,
    fontSize: FontSizes.button,
    fontWeight: '600',
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  categoriesSection: {

    backgroundColor: colors.moneyFormBackground,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    borderWidth: 1,
    borderColor: colors.moneyFormBorder,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
    marginHorizontal: LAYOUT_CONSTANTS.SPACING.SM,
    alignItems: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,

    ...createShadowStyle(colors.shadowLight, { width: 0, height: 4 }, 0.1, 8),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.XS,
  },
  activeCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  categoryCard: {
    width: '31.5%',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    alignItems: 'center',
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.08, 3),
    // minHeight: 108,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 0.5,
    borderColor: colors.backgroundTertiary,
  },
  activeCategoryCard: {
    width: '45%',
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 3 }, 0.15, 6),
    minHeight: scaleSize(140),
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: colors.pink,
  },
  categoryIcon: {
    width: scaleSize(35),
    height: scaleSize(35),
    borderRadius: scaleSize(35) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  categoryIconWrapper: {
    position: 'relative',
  },
  pinOverlay: {
    position: 'absolute',
    top: -scaleSize(6),
    right: -scaleSize(6),
  },
  activeCategoryIcon: {
    width: scaleSize(45),
    height: scaleSize(45),
    borderRadius: scaleSize(45) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
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
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: Math.round(FontSizes.small * 1.2),
  },
  activeCategoryTitle: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
    textAlign: 'center',
  },
  activeCategorySubtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    textAlign: 'center',
  },
  activeCategoryDescription: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: Math.round(FontSizes.caption * 1.4),
  },
  statsSection: {
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    marginHorizontal: LAYOUT_CONSTANTS.SPACING.SM,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 4 }, 0.1, 8),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.1, 4),
    borderWidth: 1,
    borderColor: colors.backgroundTertiary,
  },
  statNumber: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.pink,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },

});

export default DonationsScreen;
