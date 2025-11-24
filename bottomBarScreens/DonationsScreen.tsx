// File overview:
// - Purpose: Entry screen for the Donations tab, surfacing category shortcuts (Popular/For You/All) and quick actions.
// - Reached from: `DonationsStack` -> initial route 'DonationsScreen'.
// - Provides: Navigation to category screens, tracks category analytics, persists recent categories, shows footer stats.
// - Reads from context: `useUser()` -> isGuestMode, isRealAuth for behaviour and analytics source.
// - Storage/services: AsyncStorage for recents; `EnhancedStatsService` or legacy `restAdapter` for analytics, `USE_BACKEND` switch.
// - Params: None required; navigation uses route names listed in `BASE_CATEGORIES` mapping.

// TODO: CRITICAL - This file is extremely long (871 lines). Split into smaller components:
//   - CategoryGrid component for category layout
//   - CategoryCard component for individual categories  
//   - RecentCategoriesSection component
//   - PopularCategoriesSection component
//   - CategoryAnalytics service for tracking
// TODO: Remove hardcoded category data - move to configuration service
// TODO: Add comprehensive error handling for all async operations
// TODO: Implement proper loading states and skeleton screens
// TODO: Add comprehensive TypeScript interfaces instead of basic types
// TODO: Replace fake data with real backend integration
// TODO: Add proper caching mechanism for categories and analytics
// TODO: Implement proper accessibility for all interactive elements
// TODO: Add comprehensive unit tests for all category logic
import { logger } from '../utils/loggerService';
// Removed console.log statements - using proper logging service
import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  Dimensions,
  FlatList,
  Linking,
} from 'react-native';
import ScrollContainer from '../components/ScrollContainer';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DonationsStackParamList } from '../globals/types';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS, IconSizes } from '../globals/constants';
import { useUser } from '../stores/userStore';
import GuestModeNotice from '../components/GuestModeNotice';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { useTranslation } from 'react-i18next';
import { getScreenInfo, isLandscape, scaleSize, responsiveSpacing, responsiveFontSize, responsiveWidth, vw } from '../globals/responsive';
import stylesGlobal, { createShadowStyle } from '../globals/styles';
import { restAdapter } from '../utils/restAdapter';
import { enhancedDB, EnhancedDatabaseService } from '../utils/enhancedDatabaseService';
import { EnhancedStatsService } from '../utils/statsService';
import { USE_BACKEND } from '../utils/dbConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Placeholder datasets (purged demo) – replace with real API data
const donations: any[] = [];
const charities: any[] = [];

interface DonationsScreenProps {
  navigation: NavigationProp<DonationsStackParamList>;
}

const RECENT_CATEGORIES_KEY = 'recent_categories_ids';
const RECENT_LIMIT = 3;
const DEFAULT_RECENT_IDS: string[] = ['clothes', 'knowledge', 'food']; // בגדים, ידע, אוכל
const ANALYTICS_USER_ID = 'global';
const ANALYTICS_COLLECTION = 'analytics';
const ANALYTICS_ITEM_PREFIX = 'category:';
const POPULAR_FALLBACK: string[] = ['money', 'trump', 'furniture']; // כסף, טרמפים, רהיטים

// TODO: URGENT - Move this hardcoded configuration to proper data service
// TODO: Implement proper category management system with backend sync
// TODO: Add internationalization for category names and descriptions
// TODO: Create proper category icon management system
// TODO: Add category access control and permissions
// Primary categories - main and important
const PRIMARY_CATEGORIES = [
  { id: 'money',      icon: 'card-outline',        color: colors.green, bgColor: colors.successLight, screen: 'MoneyScreen' },
  { id: 'items',      icon: 'cube-outline',        color: colors.green, bgColor: colors.successLight, screen: 'ItemsScreen' },
  { id: 'trump',      icon: 'car-outline',         color: colors.blue,    bgColor: colors.infoLight,    screen: 'TrumpScreen' },
  { id: 'knowledge',  icon: 'school-outline',      color: colors.blue, bgColor: colors.infoLight, screen: 'KnowledgeScreen' },
] as const;

// Secondary categories - under construction
const SECONDARY_CATEGORIES = [
  { id: 'time',       icon: 'time-outline',        color: colors.pink,  bgColor: colors.pinkLight, screen: 'TimeScreen' },
  { id: 'challenges', icon: 'trophy-outline',      color: colors.warning, bgColor: colors.warningLight, screen: null, externalApp: 'timrsapp' },
  { id: 'food',       icon: 'restaurant-outline',  color: colors.green, bgColor: colors.successLight, screen: 'FoodScreen' },
  { id: 'clothes',    icon: 'shirt-outline',       color: colors.pink,    bgColor: colors.pinkLight,    screen: 'ClothesScreen' },
  { id: 'books',      icon: 'library-outline',     color: colors.blue, bgColor: colors.infoLight, screen: 'BooksScreen' },
  { id: 'furniture',  icon: 'bed-outline',         color: colors.pink, bgColor: colors.pinkLight, screen: 'FurnitureScreen' },
  { id: 'medical',    icon: 'medical-outline',     color: colors.error,   bgColor: colors.errorLight,   screen: 'MedicalScreen' },
  { id: 'animals',    icon: 'paw-outline',         color: colors.green, bgColor: colors.successLight, screen: 'AnimalsScreen' },
  { id: 'housing',    icon: 'home-outline',        color: colors.blue,    bgColor: colors.infoLight,    screen: 'HousingScreen' },
  { id: 'support',    icon: 'heart-outline',       color: colors.pink, bgColor: colors.pinkLight,   screen: 'SupportScreen' },
  { id: 'education',  icon: 'book-outline',        color: colors.blue,    bgColor: colors.infoLight,    screen: 'EducationScreen' },
  { id: 'environment',icon: 'leaf-outline',        color: colors.green, bgColor: colors.successLight, screen: 'EnvironmentScreen' },
  { id: 'technology', icon: 'laptop-outline',      color: colors.blue,    bgColor: colors.infoLight,    screen: 'TechnologyScreen' },
  { id: 'music',      icon: 'musical-notes-outline', color: colors.pink,  bgColor: colors.pinkLight,    screen: 'MusicScreen' },
  { id: 'games',      icon: 'game-controller-outline', color: colors.blue, bgColor: colors.infoLight, screen: 'GamesScreen' },
  { id: 'riddles',    icon: 'help-circle-outline', color: colors.pink,    bgColor: colors.pinkLight,    screen: 'RiddlesScreen' },
  { id: 'recipes',    icon: 'fast-food-outline',   color: colors.green, bgColor: colors.successLight, screen: 'RecipesScreen' },
  { id: 'plants',     icon: 'flower-outline',      color: colors.green, bgColor: colors.successLight, screen: 'PlantsScreen' },
  { id: 'waste',      icon: 'trash-outline',       color: colors.warning, bgColor: colors.warningLight, screen: 'WasteScreen' },
  { id: 'art',        icon: 'color-palette-outline', color: colors.pink,  bgColor: colors.pinkLight,    screen: 'ArtScreen' },
  { id: 'sports',     icon: 'football-outline',    color: colors.blue,  bgColor: colors.infoLight,  screen: 'SportsScreen' },
  { id: 'dreams',     icon: 'star-outline',        color: colors.pink,    bgColor: colors.pinkLight,    screen: 'DreamsScreen' },
  { id: 'fertility',  icon: 'medkit-outline',      color: colors.error,   bgColor: colors.errorLight,   screen: 'FertilityScreen' },
  { id: 'jobs',       icon: 'briefcase-outline',   color: colors.blue,    bgColor: colors.infoLight,    screen: 'JobsScreen' },
  { id: 'matchmaking', icon: 'people-outline',     color: colors.pink,    bgColor: colors.pinkLight,    screen: 'MatchmakingScreen' },
  { id: 'mentalHealth', icon: 'pulse-outline',     color: colors.pink,  bgColor: colors.pinkLight,  screen: 'MentalHealthScreen' },
  { id: 'goldenAge',   icon: 'person-outline',     color: colors.warning, bgColor: colors.warningLight, screen: 'GoldenAgeScreen' },
  { id: 'languages',   icon: 'language-outline',   color: colors.blue,    bgColor: colors.infoLight,    screen: 'LanguagesScreen' },
] as const;

// Combined categories for backward compatibility
const BASE_CATEGORIES = [...PRIMARY_CATEGORIES, ...SECONDARY_CATEGORIES] as const;

type CategoryId = typeof BASE_CATEGORIES[number]['id'];

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const DonationsScreen: React.FC<DonationsScreenProps> = ({ navigation }) => {
  // TODO: Extract state management to custom hooks (useDonationsState, useCategoryAnalytics)
  // TODO: Implement proper state validation and error boundaries
  // TODO: Add comprehensive performance optimization with React.memo and useMemo
  // TODO: Remove Hebrew comment - implement proper internationalization
  const tabBarHeight = useBottomTabBarHeight();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { isGuestMode, isRealAuth } = useUser(); // הסרנו את user כי אינו קיים ב-Type
  const { t } = useTranslation(['donations','common']);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>([]);
  const [popularCategoryIds, setPopularCategoryIds] = useState<string[]>([]);

  const screenInfo = getScreenInfo();
  const { isTablet, isDesktop, isLargeDesktop, isMobile, isSmallPhone, width: screenWidth } = screenInfo;
  const landscape = isLandscape();
  
  // Enhanced responsive calculations
  const isMobileWebView = Platform.OS === 'web' && screenWidth <= 768;
  const isSmallScreen = isMobile || isSmallPhone || screenWidth < 375;
  const isMediumScreen = !isSmallScreen && !isTablet && !isDesktop;
  
  // Calculate available height for better responsive sizing
  const availableHeight = SCREEN_HEIGHT - (insets?.top ?? 0) - (insets?.bottom ?? 0) - (tabBarHeight ?? 0) - (headerHeight ?? 0);
  
  // Responsive grid columns - optimized for each screen size
  const getPrimaryColumns = () => {
    if (isLargeDesktop) return 4;
    if (isDesktop) return 4;
    if (isTablet && landscape) return 4;
    if (isTablet) return 4;
    if (isMobileWebView) return 2;
    if (landscape) return 4;
    return 2; // Mobile portrait - 2 columns for better visibility
  };
  
  const primaryColumns = getPrimaryColumns();
  
  // Responsive spacing using helper functions
  const sectionHorizontalMargin = responsiveSpacing(
    LAYOUT_CONSTANTS.SPACING.SM,  // mobile
    LAYOUT_CONSTANTS.SPACING.MD,  // tablet
    LAYOUT_CONSTANTS.SPACING.LG   // desktop
  );
  
  const sectionHorizontalPadding = responsiveSpacing(
    LAYOUT_CONSTANTS.SPACING.MD,  // mobile
    LAYOUT_CONSTANTS.SPACING.LG,  // tablet
    LAYOUT_CONSTANTS.SPACING.XL   // desktop
  );
  
  // Calculate card width dynamically based on columns and available space
  const sectionInnerWidth = screenWidth - (sectionHorizontalMargin * 2) - (sectionHorizontalPadding * 2);
  const gridGap = responsiveSpacing(
    LAYOUT_CONSTANTS.SPACING.SM,  // mobile
    LAYOUT_CONSTANTS.SPACING.MD,  // tablet
    LAYOUT_CONSTANTS.SPACING.MD   // desktop
  );
  
  // Card width calculation - ensures cards fit nicely with proper spacing
  const primaryCardWidth = Math.max(
    isSmallScreen ? 140 : 160,
    Math.floor((sectionInnerWidth - (gridGap * (primaryColumns - 1))) / primaryColumns)
  );
  
  // Horizontal scroll card width - optimized for different screens
  const getHorizontalCardWidth = () => {
    if (isSmallScreen) return 120;
    if (isTablet) return 160;
    if (isDesktop || isLargeDesktop) return 180;
    return 140; // default
  };
  const horizontalCardWidth = getHorizontalCardWidth();
  
  // Responsive icon sizing
  const categoryIconSize = responsiveFontSize(
    24,  // mobile
    28,  // tablet
    32   // desktop
  );
  
  const categoryIconOuter = responsiveFontSize(
    40,  // mobile
    48,  // tablet
    56   // desktop
  );
  
  // Responsive typography
  const heroTitleSize = responsiveFontSize(
    16,  // mobile
    18,  // tablet
    20   // desktop
  );
  
  const heroSubtitleSize = responsiveFontSize(
    12,  // mobile
    13,  // tablet
    14   // desktop
  );
  
  const otherTitleSize = responsiveFontSize(
    14,  // mobile
    16,  // tablet
    18   // desktop
  );
  
  const otherSubtitleSize = responsiveFontSize(
    11,  // mobile
    12,  // tablet
    13   // desktop
  );
  
  // Responsive padding
  const cardVerticalPad = responsiveSpacing(
    LAYOUT_CONSTANTS.SPACING.MD,  // mobile
    LAYOUT_CONSTANTS.SPACING.LG,  // tablet
    LAYOUT_CONSTANTS.SPACING.LG    // desktop
  );
  
  const cardHorizontalPad = responsiveSpacing(
    LAYOUT_CONSTANTS.SPACING.SM,  // mobile
    LAYOUT_CONSTANTS.SPACING.MD,  // tablet
    LAYOUT_CONSTANTS.SPACING.MD   // desktop
  );
  
  const sectionVerticalPad = responsiveSpacing(
    LAYOUT_CONSTANTS.SPACING.MD,  // mobile
    LAYOUT_CONSTANTS.SPACING.LG,  // tablet
    LAYOUT_CONSTANTS.SPACING.XL    // desktop
  );
  
  const sectionTitleFontSize = responsiveFontSize(
    FontSizes.heading3,  // mobile
    FontSizes.heading2,  // tablet
    FontSizes.heading2   // desktop
  );
  
  const sectionTitleMarginBottom = responsiveSpacing(
    LAYOUT_CONSTANTS.SPACING.MD,  // mobile
    LAYOUT_CONSTANTS.SPACING.LG,  // tablet
    LAYOUT_CONSTANTS.SPACING.LG    // desktop
  );
  
  // Compact mode for very small screens
  const isCompact = availableHeight < 600 || isSmallScreen;

  // Simplified horizontal scroll for "All" section
  const allScrollViewRef = useRef<ScrollView | null>(null);

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

        // Fetch popular categories analytics (top 3 globally)
        try {
          logger.info('DonationsScreen', 'Loading popular categories');
          let analytics: any[] = [];
          
          if (USE_BACKEND && isRealAuth) {
            logger.info('DonationsScreen', 'Using enhanced backend analytics');
            // Use enhanced backend analytics
            const categoryAnalytics = await EnhancedStatsService.getCategoryAnalytics();
            analytics = categoryAnalytics.map((cat: any) => ({
              id: cat.slug,
              categoryId: cat.slug,
              count: cat.donation_count + (cat.clicks || 0),
            }));
            logger.debug('DonationsScreen', 'Backend analytics loaded', { analytics });
          } else {
            logger.info('DonationsScreen', 'Using legacy analytics fallback');
            // Fallback to legacy analytics
            analytics = await restAdapter.list<any>(ANALYTICS_COLLECTION, ANALYTICS_USER_ID).catch(() => [] as any[]);
            analytics = analytics.map((d: any) => {
              const id: string | undefined = d?.categoryId || (typeof d?.id === 'string' ? d.id.replace(ANALYTICS_ITEM_PREFIX, '') : undefined);
              const count: number = Number(d?.count ?? 0);
              return id ? { id, count } : null;
            }).filter(Boolean);
            logger.debug('DonationsScreen', 'Legacy analytics loaded', { analytics });
          }

          const baseIds = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id));
          const topSorted = analytics
            .filter((c) => baseIds.has(c.id) && c.count > 0) // רק עם נתונים אמיתיים
            .sort((a, b) => b.count - a.count)
            .map((c) => c.id);
            
          logger.debug('DonationsScreen', 'Top sorted analytics', { topSorted });
          logger.debug('DonationsScreen', 'Analytics count with data', { count: topSorted.length });
          
          // 🚨 כעת נשתמש תמיד בדיפולט כי זה מה שהמשתמש מבקש
          const resolved = POPULAR_FALLBACK.filter((id) => baseIds.has(id));
          logger.info('DonationsScreen', 'Popular categories set', { categories: resolved });
          setPopularCategoryIds(resolved);
        } catch (e) {
          logger.error('DonationsScreen', 'Failed to load category analytics', { error: e });
          // במקרה של שגיאה, השתמש בדיפולט
          const baseIds = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id));
          const resolved = POPULAR_FALLBACK.filter((id) => baseIds.has(id));
          logger.info('DonationsScreen', 'Popular categories fallback', { categories: resolved });
          setPopularCategoryIds(resolved);
        }
      })();
    }, [])
  );

  const getCategoryText = (id: CategoryId) => ({
    title: t(`donations:categories.${id}.title`),
    subtitle: t(`donations:categories.${id}.subtitle`),
    description: t(`donations:categories.${id}.description`),
  });

  const incrementCategoryCounter = async (categoryId: string) => {
    try {
      if (USE_BACKEND && isRealAuth) {
        // Use enhanced stats service with user tracking
        await EnhancedStatsService.trackCategoryView(categoryId);
      } else {
        // Fallback to legacy analytics
        const itemId = `${ANALYTICS_ITEM_PREFIX}${categoryId}`;
        const existing = await restAdapter.read<any>(ANALYTICS_COLLECTION, ANALYTICS_USER_ID, itemId).catch(() => null);
        const next = { id: itemId, categoryId, count: Number(existing?.count ?? 0) + 1, updatedAt: new Date().toISOString() };
        if (!existing) {
          await restAdapter.create(ANALYTICS_COLLECTION, ANALYTICS_USER_ID, itemId, next);
        } else {
          await restAdapter.update(ANALYTICS_COLLECTION, ANALYTICS_USER_ID, itemId, next);
        }
      }
    } catch (e) {
      logger.warn('DonationsScreen', 'Failed to track category view', { error: e });
    }
  };

  const handleCategoryPress = async (category: { id: CategoryId; screen?: string; externalApp?: string }) => {
    setSelectedCategory(category.id);
    // עדכון "בשבילך" - הוסף את הקטגוריה שנלחצה לראש הרשימה
    setRecentCategoryIds((prev) => {
      const next = [category.id, ...prev.filter((id) => id !== category.id)].slice(0, RECENT_LIMIT);
      AsyncStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(next)).catch((err) => {
        logger.warn('DonationsScreen', 'Failed to save recent categories', { error: err });
      });
      return next;
    });

    // Fire-and-forget analytics increment  
    incrementCategoryCounter(category.id).catch(() => {});
    
    logger.info('DonationsScreen', 'Category pressed', {
      id: category.id,
      title: getCategoryText(category.id).title,
      screen: category.screen,
      externalApp: category.externalApp
    });

    // Handle external app (TimrsApp for challenges)
    if (category.externalApp === 'timrsapp') {
      try {
        const timrsScheme = 'timrsapp://';
        const canOpen = await Linking.canOpenURL(timrsScheme);
        
        if (canOpen) {
          await Linking.openURL(timrsScheme);
          logger.info('DonationsScreen', 'Opened TimrsApp successfully');
        } else {
          // Fallback: try with package name
          const packageUrl = Platform.OS === 'android' 
            ? 'intent://#Intent;scheme=timrsapp;package=com.timrsapp;end'
            : 'com.timrsapp://';
          
          try {
            await Linking.openURL(packageUrl);
            logger.info('DonationsScreen', 'Opened TimrsApp via package name');
          } catch (fallbackError) {
            logger.warn('DonationsScreen', 'Failed to open TimrsApp', { error: fallbackError });
            Alert.alert(
              'אפליקציית האתגרים',
              'אפליקציית האתגרים לא מותקנת במכשיר. אנא התקן את האפליקציה כדי להשתמש בקטגוריה זו.',
              [{ text: t('common:confirm'), style: 'default' }]
            );
          }
        }
      } catch (error) {
        logger.error('DonationsScreen', 'Failed to open TimrsApp', { error });
        Alert.alert(
          'שגיאה',
          'לא ניתן לפתוח את אפליקציית האתגרים. אנא ודא שהאפליקציה מותקנת במכשיר.',
          [{ text: t('common:confirm'), style: 'default' }]
        );
      }
      return;
    }

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
    logger.info('DonationsScreen', 'Quick donation pressed', { type });
    
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

  const popularIdsResolved: CategoryId[] = (popularCategoryIds.length > 0 ? popularCategoryIds : POPULAR_FALLBACK).slice(0, 3).filter((id, idx, arr) => arr.indexOf(id) === idx) as CategoryId[];
  const popularCategories = popularIdsResolved
    .map((id) => BASE_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is typeof BASE_CATEGORIES[number] => Boolean(c));

  // שיפור הלוגיקה של "בשבילך" - אחרונים שהיוזר השתמש
  logger.info('DonationsScreen', 'Processing "בשבילך" categories');
  logger.debug('DonationsScreen', 'Recent category IDs from storage', { recentCategoryIds });
  logger.debug('DonationsScreen', 'DEFAULT_RECENT_IDS', { ids: DEFAULT_RECENT_IDS });
  logger.debug('DonationsScreen', 'Popular categories to avoid', { popularIds: popularIdsResolved });
  
  const baseIdSet = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id as string));
  const popularIdSet = new Set(popularIdsResolved as unknown as string[]);
  
  // 🚨 נשתמש תמיד בדיפולט כמו שהמשתמש מבקש
  let finalRecentIds = [...DEFAULT_RECENT_IDS];
  
  // סנן רק אם יש חפיפה עם פופולרים
  finalRecentIds = finalRecentIds.filter((id) => !popularIdSet.has(id));
  
  // אם עדיין לא מספיק אחרי הסינון, קח מכל הקטגוריות
  if (finalRecentIds.length < RECENT_LIMIT) {
    const additionalIds = BASE_CATEGORIES
      .map(c => c.id)
      .filter((id) => !finalRecentIds.includes(id) && !popularIdSet.has(id))
      .slice(0, RECENT_LIMIT - finalRecentIds.length);
    finalRecentIds = [...finalRecentIds, ...additionalIds];
  }
  
  logger.info('DonationsScreen', 'Recent categories set', { categories: finalRecentIds });
  
  const recentCategories = finalRecentIds
    .map((id) => BASE_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is typeof BASE_CATEGORIES[number] => Boolean(c));
    
  logger.debug('DonationsScreen', 'Recent categories objects', { categoryIds: recentCategories.map(c => c.id) });

  const otherCategories = BASE_CATEGORIES.filter((c) => !popularCategories.some((pc) => pc.id === c.id) && !recentCategories.some((rc) => rc.id === c.id));
  
  logger.info('DonationsScreen', 'Final categories summary');
  logger.debug('DonationsScreen', 'Popular categories', { categories: popularCategories.map(c => `${c.id}(${getCategoryText(c.id).title})`) });
  logger.debug('DonationsScreen', 'Recent categories', { categories: recentCategories.map(c => `${c.id}(${getCategoryText(c.id).title})`) });
  logger.debug('DonationsScreen', 'Other categories count', { count: otherCategories.length });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      {isGuestMode && <GuestModeNotice showLoginButton={false} />}
      
      <ScrollContainer style={styles.scrollContainer} contentStyle={styles.scrollContent}>
      {/* Primary Categories - Main and Important */}
      <View style={[styles.categoriesSection, { 
        paddingVertical: sectionVerticalPad,
        marginHorizontal: sectionHorizontalMargin,
        paddingHorizontal: sectionHorizontalPadding,
      }]}>
        <View style={[styles.categoriesGrid, { 
          flexDirection: 'row', 
          gap: gridGap, 
          flexWrap: 'wrap',
          justifyContent: primaryColumns === 2 ? 'space-around' : 'center',
        }]}>
          {PRIMARY_CATEGORIES.map((category) => {
            const { title, subtitle } = getCategoryText(category.id);
            return (
              <TouchableOpacity
                key={`primary-${category.id}`}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: category.bgColor,
                    width: primaryCardWidth,
                    paddingVertical: cardVerticalPad,
                    paddingHorizontal: cardHorizontalPad,
                  },
                  selectedCategory === category.id && styles.categoryCardActive,
                ]}
                onPress={() => handleCategoryPress(category as any)}
                accessibilityRole="button"
                accessibilityLabel={`${title} - ${subtitle}`}
                accessibilityHint={t('donations:categoryAccessibilityHint', 'לחץ לפתיחת קטגוריה')}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor: category.color,
                      width: categoryIconOuter,
                      height: categoryIconOuter,
                      borderRadius: categoryIconOuter / 2,
                    },
                    selectedCategory === category.id && styles.categoryIconSelected,
                  ]}
                  accessibilityRole="image"
                  accessibilityLabel={`${title} icon`}
                >
                  <Ionicons name={category.icon as any} size={categoryIconSize} color="white" />
                </View>
                <Text style={[styles.categoryTitle, { fontSize: heroTitleSize }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {title}
                </Text>
                <Text style={[styles.categorySubtitle, { fontSize: heroSubtitleSize }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Secondary Categories - Under Construction */}
      <View style={[styles.categoriesSection, { 
        paddingVertical: sectionVerticalPad,
        marginHorizontal: sectionHorizontalMargin,
        paddingHorizontal: sectionHorizontalPadding,
      }]}>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: sectionTitleMarginBottom, fontSize: sectionTitleFontSize }]}>
            {t('donations:underConstruction', 'בבניה')}
          </Text>
          <View style={styles.underConstructionBadge}>
            <Ionicons name="construct-outline" size={responsiveFontSize(12, 14, 16)} color={colors.warning} />
          </View>
        </View>
        <View style={styles.horizontalScrollContainer}>
          <ScrollView
            ref={allScrollViewRef}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            bounces={Platform.OS === 'ios'}
            directionalLockEnabled={true}
            alwaysBounceVertical={false}
            alwaysBounceHorizontal={true}
            scrollEnabled={true}
            contentContainerStyle={styles.horizontalScrollContent}
            style={styles.horizontalScrollView}
            onScrollBeginDrag={() => logger.debug('DonationsScreen', 'Horizontal scroll started')}
            onScrollEndDrag={() => logger.debug('DonationsScreen', 'Horizontal scroll ended')}
            onScroll={() => logger.debug('DonationsScreen', 'Horizontal scrolling')}
            scrollEventThrottle={100}
            {...(Platform.OS === 'web' && {
              style: [styles.horizontalScrollView, { scrollBehavior: 'smooth' as any }],
            })}
          >
            {SECONDARY_CATEGORIES.map((category, index) => {
              const { title, subtitle } = getCategoryText(category.id as CategoryId);
              logger.debug('DonationsScreen', 'Rendering secondary category', { index, categoryId: category.id, title });
              return (
                <TouchableOpacity
                  key={`secondary-${category.id}`}
                  onPress={() => {
                    logger.info('DonationsScreen', 'Category pressed in secondary section', { categoryId: category.id, title });
                    handleCategoryPress(category as any);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${title} - ${subtitle}`}
                  accessibilityHint={t('donations:categoryAccessibilityHint', 'לחץ לפתיחת קטגוריה')}
                  style={[
                    styles.categoryCardHorizontal,
                    {
                      backgroundColor: category.bgColor,
                      width: horizontalCardWidth,
                      marginRight: index === SECONDARY_CATEGORIES.length - 1 ? 0 : gridGap,
                      paddingVertical: cardVerticalPad,
                      paddingHorizontal: cardHorizontalPad,
                    },
                    selectedCategory === category.id && styles.categoryCardActive,
                  ]}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor: category.color,
                        width: categoryIconOuter,
                        height: categoryIconOuter,
                        borderRadius: categoryIconOuter / 2,
                      },
                      selectedCategory === category.id && styles.categoryIconSelected,
                    ]}
                    accessibilityRole="image"
                    accessibilityLabel={`${title} icon`}
                  >
                    <Ionicons name={category.icon as any} size={categoryIconSize} color="white" />
                  </View>
                  <Text style={[styles.categoryTitle, { fontSize: otherTitleSize }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {title}
                  </Text>
                  <Text style={[styles.categorySubtitle, { fontSize: otherSubtitleSize }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
              compact={isCompact}
              stats={[
                { label: t('donations:activeDonors'), value: activeDonors, icon: 'people-outline' },
                { label: t('donations:weeklyDonations'), value: weeklyDonations, icon: 'heart-outline' },
                { label: t('donations:activeCharities'), value: activeCharities, icon: 'business-outline' },
              ]}
            />
        );
      })()}
      </ScrollContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary, // עודכן לכחול בהיר
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
    } as any),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: responsiveSpacing(40, 50, 60), // Responsive bottom padding
    paddingTop: responsiveSpacing(LAYOUT_CONSTANTS.SPACING.SM, LAYOUT_CONSTANTS.SPACING.MD, LAYOUT_CONSTANTS.SPACING.LG), // Responsive top padding
    paddingHorizontal: responsiveSpacing(0, LAYOUT_CONSTANTS.SPACING.XS, LAYOUT_CONSTANTS.SPACING.SM), // Responsive horizontal padding
  },
  // Web-specific scroll wrappers
  webScrollContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && { 
      overflow: 'auto' as any,
      WebkitOverflowScrolling: 'touch' as any,
      overscrollBehavior: 'contain' as any,
      height: SCREEN_HEIGHT as any,
      maxHeight: SCREEN_HEIGHT as any,
      width: '100%' as any,
      touchAction: 'auto' as any,
    }),
  } as any,
  webScrollContent: {
    minHeight: SCREEN_HEIGHT * 1.2,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
    paddingTop: LAYOUT_CONSTANTS.SPACING.LG,
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
    fontWeight: '800', // פונט עבה יותר
    color: colors.pink, // צבע ורוד מהלוגו החדש
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG, // More margin for better spacing
    marginTop: LAYOUT_CONSTANTS.SPACING.XS, // Small top margin
    textAlign: 'center', // מרכוז הכותרת
    letterSpacing: 0.5, // Better letter spacing
    lineHeight: Math.round(FontSizes.heading2 * 1.4), // Better line height
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
    backgroundColor: colors.backgroundPrimary, // רקע לבן נקי לקטגוריות
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE + 4, // עיגול גדול יותר
    borderWidth: 1.5,
    borderColor: colors.borderSecondary, // גבול עדין
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG, // Better spacing
    alignItems: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.LG, // Will be overridden by inline style
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD, // Will be overridden by inline style
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 6 }, 0.2, 12), // Enhanced shadow for depth
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center items for better visual balance
    alignItems: 'center',
    gap: LAYOUT_CONSTANTS.SPACING.MD, // Will be overridden by inline style
    width: '100%',
  },
  horizontalScrollContainer: {
    minHeight: 140, // Minimum height for mobile
    height: 'auto', // Auto height for better responsiveness
    width: '100%',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.XS, // Small vertical padding
    ...(Platform.OS === 'web' && {
      minHeight: '160px' as any,
    } as any),
  },
  horizontalScrollView: {
    flex: 1,
    height: '100%',
    ...(Platform.OS === 'web' && {
      overflowX: 'auto' as any,
      overflowY: 'hidden' as any,
      WebkitOverflowScrolling: 'touch' as any,
    }),
  } as any,
  horizontalScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.SM, // More padding
    paddingRight: LAYOUT_CONSTANTS.SPACING.MD, // Extra right padding for last item
    height: '100%',
  },
  horizontalList: {
    paddingVertical: LAYOUT_CONSTANTS.SPACING.XS,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
    flexDirection: 'row',
    ...(Platform.OS === 'web' && {
      display: 'flex' as any,
      flexWrap: 'nowrap' as any,
    }),
  },
  othersSection: {
    alignSelf: 'stretch',
    width: '100%',
  },
  verticalScrollNative: {
    alignSelf: 'stretch',
    width: '100%',
  },
  verticalScrollContent: {
    paddingBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  verticalScrollWeb: {
    width: '100%',
  },
  activeCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  categoryCard: {
    minWidth: 140, // Minimum width for touch targets
    maxWidth: 200, // Maximum width for large screens
    paddingVertical: LAYOUT_CONSTANTS.SPACING.MD, // Will be overridden by inline style
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.SM, // Will be overridden by inline style
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE, // More rounded for modern look
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 4 }, 0.18, 8), // Enhanced shadow for depth
    backgroundColor: colors.backgroundPrimary, // רקע לבן נקי
    borderWidth: 1.5,
    borderColor: colors.borderSecondary, // גבול עדין יותר
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease' as any,
      cursor: 'pointer' as any,
    } as any),
  },
  categoryCardHorizontal: {
    minWidth: 120, // Minimum width for touch targets
    maxWidth: 200, // Maximum width for large screens
    paddingVertical: LAYOUT_CONSTANTS.SPACING.MD, // Will be overridden by inline style
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.SM, // Will be overridden by inline style
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE, // More rounded
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 4 }, 0.18, 8), // Enhanced shadow
    backgroundColor: colors.backgroundPrimary, // רקע לבן נקי
    borderWidth: 1.5,
    borderColor: colors.borderSecondary, // גבול עדין יותר
    marginRight: LAYOUT_CONSTANTS.SPACING.MD, // More spacing between cards
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease' as any,
      cursor: 'pointer' as any,
    } as any),
  },
  activeCategoryCard: {
    width: '45%',
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 3 }, 0.15, 6),
    minHeight: scaleSize(140),
    backgroundColor: colors.categoryCardBackground,
    borderWidth: 1,
    borderColor: colors.categoryBorder,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: colors.categoryIconBackground,
  },
  categoryCardActive: {
    borderWidth: 2,
    borderColor: colors.pink,
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 6 }, 0.25, 10),
    ...(Platform.OS === 'web' && {
      transform: 'translateY(-3px)' as any,
    } as any),
  },
  categoryIcon: {
    minWidth: 36, // Minimum for small screens
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD, // מרווח גדול יותר מתחת לאיקון
    ...createShadowStyle(colors.shadowMedium, { width: 0, height: 3 }, 0.35, 6), // Enhanced shadow for icon
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease' as any,
    } as any),
  },
  categoryIconSelected: {
    transform: [{ scale: 1.1 }],
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 4 }, 0.4, 8),
    ...(Platform.OS === 'web' && {
      transform: 'scale(1.1)' as any,
    } as any),
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
    fontWeight: '700', // פונט עבה יותר
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: LAYOUT_CONSTANTS.SPACING.XS, // מרווח קטן מעל הכותרת
    letterSpacing: 0.2, // Better letter spacing for readability
    lineHeight: Math.round(FontSizes.medium * 1.3), // Better line height
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
    marginTop: LAYOUT_CONSTANTS.SPACING.XS / 2, // Small margin for better spacing
    lineHeight: Math.round(FontSizes.small * 1.4), // Better line height
    opacity: 0.85, // Slightly softer for hierarchy
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    gap: LAYOUT_CONSTANTS.SPACING.XS,
    flexWrap: 'wrap', // Allow wrapping on small screens
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS, // Small padding for very small screens
  },
  underConstructionBadge: {
    backgroundColor: colors.warningLight,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    paddingHorizontal: responsiveSpacing(LAYOUT_CONSTANTS.SPACING.XS, LAYOUT_CONSTANTS.SPACING.SM, LAYOUT_CONSTANTS.SPACING.SM),
    paddingVertical: responsiveSpacing(LAYOUT_CONSTANTS.SPACING.XS / 2, LAYOUT_CONSTANTS.SPACING.XS, LAYOUT_CONSTANTS.SPACING.XS),
    borderWidth: 1,
    borderColor: colors.warning,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.1, 2),
  },

});

export default DonationsScreen;
