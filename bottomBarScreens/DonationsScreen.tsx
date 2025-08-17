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
// TODO: Remove console.log statements and use proper logging service
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
import { useUser } from '../context/UserContext';
import GuestModeNotice from '../components/GuestModeNotice';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { donations, charities } from '../globals/fakeData';
import { useTranslation } from 'react-i18next';
import { getScreenInfo, isLandscape, scaleSize } from '../globals/responsive';
import stylesGlobal, { createShadowStyle } from '../globals/styles';
import { restAdapter } from '../utils/restAdapter';
import { enhancedDB, EnhancedDatabaseService } from '../utils/enhancedDatabaseService';
import { EnhancedStatsService } from '../utils/statsService';
import { USE_BACKEND } from '../utils/dbConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
const BASE_CATEGORIES = [
  { id: 'money',      icon: 'card-outline',        color: colors.green, bgColor: colors.successLight, screen: 'MoneyScreen' },
  { id: 'trump',      icon: 'car-outline',         color: colors.blue,    bgColor: colors.infoLight,    screen: 'TrumpScreen' },
  { id: 'knowledge',  icon: 'school-outline',      color: colors.blue, bgColor: colors.infoLight, screen: 'KnowledgeScreen' },
  { id: 'time',       icon: 'time-outline',        color: colors.pink,  bgColor: colors.pinkLight, screen: 'TimeScreen' },
  { id: 'food',       icon: 'restaurant-outline',  color: colors.green, bgColor: colors.successLight, screen: 'FoodScreen' },
  { id: 'clothes',    icon: 'shirt-outline',       color: colors.pink,    bgColor: colors.pinkLight,    screen: 'ClothesScreen' },
  { id: 'books',      icon: 'library-outline',     color: colors.blue, bgColor: colors.infoLight, screen: 'BooksScreen' },
  { id: 'items',      icon: 'cube-outline',        color: colors.green, bgColor: colors.successLight, screen: 'ItemsScreen' },
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

  const { isTablet, isDesktop } = getScreenInfo();
  const landscape = isLandscape();
  // Better mobile web responsive columns
  const isMobileWebView = Platform.OS === 'web' && SCREEN_WIDTH <= 768;
  const recentColumns = isMobileWebView ? 3 : isDesktop ? 6 : isTablet || landscape ? 5 : 4;
  const allColumns = isMobileWebView ? 3 : isDesktop ? 5 : isTablet || landscape ? 4 : 3;
  const recentCardWidth = `${(100 / recentColumns) - 2}%` as const;
  const allCardWidth = `${(100 / allColumns) - 2}%` as const;
  const baseCategoryIconSize = scaleSize(26);
  const baseCategoryIconOuter = scaleSize(35);
  // Precise sizing so 3 cards fit almost fully across the section width on all screens
  const sectionHorizontalMargins = LAYOUT_CONSTANTS.SPACING.SM * 2; // left + right
  const sectionHorizontalPaddings = LAYOUT_CONSTANTS.SPACING.MD * 2; // left + right
  let gridGap = LAYOUT_CONSTANTS.SPACING.XS; // gap between items (will be scaled later)
  const sectionInnerWidth = SCREEN_WIDTH - sectionHorizontalMargins - sectionHorizontalPaddings;
  let threeColCardWidthPx = Math.max(100, Math.floor((sectionInnerWidth - gridGap * 2) / 4));
  let ITEM_FULL_WIDTH = threeColCardWidthPx + gridGap; // used for snapping and getItemLayout
  const baseHeroTitleSize = scaleSize(isTablet || isDesktop ? 18 : 16);
  const baseHeroSubtitleSize = scaleSize(isTablet || isDesktop ? 13 : 12);
  const baseOtherTitleSize = scaleSize(isTablet || isDesktop ? 16 : 14);
  const baseOtherSubtitleSize = scaleSize(isTablet || isDesktop ? 12 : 11);
  const othersMaxHeight = Math.max(scaleSize(220), Math.min(SCREEN_HEIGHT * 0.45, scaleSize(480)));

  // Simplified responsive sizing for mobile web
  const availableHeight = SCREEN_HEIGHT - (insets?.top ?? 0) - (insets?.bottom ?? 0) - (tabBarHeight ?? 0) - (headerHeight ?? 0);
  
  // For mobile web, use simplified scaling
  let sizeScale = 1;
  let paddingScale = 1;
  
  if (isMobileWebView) {
    // Mobile web gets smaller, more compact layout
    sizeScale = 0.9;
    paddingScale = 0.8;
  } else if (availableHeight < 600) {
    // Very small screens get more aggressive scaling
    const rawScale = Math.max(0.65, Math.min(1.35, availableHeight / 800));
    sizeScale = rawScale;
    paddingScale = rawScale;
  }
  
  const isCompact = sizeScale < 0.98;

  const categoryIconSize = Math.max(18, Math.round(baseCategoryIconSize * sizeScale));
  const categoryIconOuter = Math.max(28, Math.round(baseCategoryIconOuter * sizeScale));
  const heroTitleSize = Math.max(12, Math.round(baseHeroTitleSize * sizeScale));
  const heroSubtitleSize = Math.max(10, Math.round(baseHeroSubtitleSize * sizeScale));
  const otherTitleSize = Math.max(11, Math.round(baseOtherTitleSize * sizeScale));
  const otherSubtitleSize = Math.max(9, Math.round(baseOtherSubtitleSize * sizeScale));
  const sectionTitleMarginBottom = Math.max(LAYOUT_CONSTANTS.SPACING.XS, Math.round(LAYOUT_CONSTANTS.SPACING.MD * paddingScale));
  const cardVerticalPad = Math.max(LAYOUT_CONSTANTS.SPACING.XS, Math.round(LAYOUT_CONSTANTS.SPACING.MD * paddingScale));
  const sectionVerticalPad = Math.max(LAYOUT_CONSTANTS.SPACING.XS, Math.round(LAYOUT_CONSTANTS.SPACING.SM * paddingScale));
  const sectionTitleFontSize = Math.max(14, Math.round(FontSizes.heading2 * sizeScale));

  // Scale gaps and card width to consume remaining width nicely
  gridGap = Math.max(2, Math.round(LAYOUT_CONSTANTS.SPACING.XS * paddingScale));
  threeColCardWidthPx = Math.max(100, Math.floor((sectionInnerWidth - gridGap * 2) / 4));

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
          console.log('🔄 Loading popular categories...');
          let analytics: any[] = [];
          
          if (USE_BACKEND && isRealAuth) {
            console.log('📊 Using enhanced backend analytics');
            // Use enhanced backend analytics
            const categoryAnalytics = await EnhancedStatsService.getCategoryAnalytics();
            analytics = categoryAnalytics.map((cat: any) => ({
              id: cat.slug,
              categoryId: cat.slug,
              count: cat.donation_count + (cat.clicks || 0),
            }));
            console.log('📊 Backend analytics loaded:', analytics);
          } else {
            console.log('📊 Using legacy analytics fallback');
            // Fallback to legacy analytics
            analytics = await restAdapter.list<any>(ANALYTICS_COLLECTION, ANALYTICS_USER_ID).catch(() => [] as any[]);
            analytics = analytics.map((d: any) => {
              const id: string | undefined = d?.categoryId || (typeof d?.id === 'string' ? d.id.replace(ANALYTICS_ITEM_PREFIX, '') : undefined);
              const count: number = Number(d?.count ?? 0);
              return id ? { id, count } : null;
            }).filter(Boolean);
            console.log('📊 Legacy analytics loaded:', analytics);
          }

          const baseIds = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id));
          const topSorted = analytics
            .filter((c) => baseIds.has(c.id) && c.count > 0) // רק עם נתונים אמיתיים
            .sort((a, b) => b.count - a.count)
            .map((c) => c.id);
            
          console.log('📈 Top sorted analytics:', topSorted);
          console.log('📈 Analytics count with data:', topSorted.length);
          
          // 🚨 כעת נשתמש תמיד בדיפולט כי זה מה שהמשתמש מבקש
          const resolved = POPULAR_FALLBACK.filter((id) => baseIds.has(id));
          console.log('🎯 POPULAR categories set to:', resolved);
          setPopularCategoryIds(resolved);
        } catch (e) {
          console.error('❌ Failed to load category analytics:', e);
          // במקרה של שגיאה, השתמש בדיפולט
          const baseIds = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id));
          const resolved = POPULAR_FALLBACK.filter((id) => baseIds.has(id));
          console.log('🎯 POPULAR categories fallback to:', resolved);
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
      console.warn('Failed to track category view:', e);
    }
  };

  const handleCategoryPress = (category: { id: CategoryId; screen?: string }) => {
    setSelectedCategory(category.id);
    // עדכון "בשבילך" - הוסף את הקטגוריה שנלחצה לראש הרשימה
    setRecentCategoryIds((prev) => {
      const next = [category.id, ...prev.filter((id) => id !== category.id)].slice(0, RECENT_LIMIT);
      AsyncStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(next)).catch((err) => {
        console.warn('Failed to save recent categories:', err);
      });
      return next;
    });

    // Fire-and-forget analytics increment  
    incrementCategoryCounter(category.id).catch(() => {});
    
    console.log('🔥 Category pressed:', {
      id: category.id,
      title: getCategoryText(category.id).title,
      screen: category.screen
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

  const popularIdsResolved: CategoryId[] = (popularCategoryIds.length > 0 ? popularCategoryIds : POPULAR_FALLBACK).slice(0, 3).filter((id, idx, arr) => arr.indexOf(id) === idx) as CategoryId[];
  const popularCategories = popularIdsResolved
    .map((id) => BASE_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is typeof BASE_CATEGORIES[number] => Boolean(c));

  // שיפור הלוגיקה של "בשבילך" - אחרונים שהיוזר השתמש
  console.log('🔄 Processing "בשבילך" categories...');
  console.log('📝 Recent category IDs from storage:', recentCategoryIds);
  console.log('📝 DEFAULT_RECENT_IDS:', DEFAULT_RECENT_IDS);
  console.log('📝 Popular categories (to avoid):', popularIdsResolved);
  
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
  
  console.log('🎯 RECENT categories set to:', finalRecentIds);
  
  const recentCategories = finalRecentIds
    .map((id) => BASE_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is typeof BASE_CATEGORIES[number] => Boolean(c));
    
  console.log('🎯 RECENT categories objects:', recentCategories.map(c => c.id));

  const otherCategories = BASE_CATEGORIES.filter((c) => !popularCategories.some((pc) => pc.id === c.id) && !recentCategories.some((rc) => rc.id === c.id));
  
  console.log('📊 Final categories summary:');
  console.log('🌟 Popular categories:', popularCategories.map(c => `${c.id}(${getCategoryText(c.id).title})`));
  console.log('👤 Recent categories:', recentCategories.map(c => `${c.id}(${getCategoryText(c.id).title})`));
  console.log('📝 Other categories count:', otherCategories.length);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
      {isGuestMode && <GuestModeNotice showLoginButton={false} />}
      
      <ScrollContainer style={styles.scrollContainer} contentStyle={styles.scrollContent}>
      {/* Popular (Top 3) */}
      <View style={[styles.categoriesSection, { paddingVertical: sectionVerticalPad }]}>
        <Text style={[styles.sectionTitle, { marginBottom: sectionTitleMarginBottom, fontSize: sectionTitleFontSize }]}>{t('donations:popular')}</Text>
        <View style={[styles.categoriesGrid, { flexDirection: 'row', gap: gridGap }]}>
          {popularCategories.slice(0, 3).map((category) => {
            const { title, subtitle } = getCategoryText(category.id);
            return (
              <TouchableOpacity
                key={`popular-${category.id}`}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: category.bgColor, // השתמש בצבע הרקע של הקטגוריה
                    width: threeColCardWidthPx,
                    paddingVertical: cardVerticalPad,
                  },
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor: category.color, // השתמש בצבע הקטגוריה
                      width: categoryIconOuter,
                      height: categoryIconOuter,
                      borderRadius: categoryIconOuter / 2,
                    },
                  ]}
                >
                  <Ionicons name={category.icon as any} size={categoryIconSize} color="white" />
                </View>
                 <Text style={[styles.categoryTitle, { fontSize: heroTitleSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
                  {title}
                </Text>
                 <Text style={[styles.categorySubtitle, { fontSize: heroSubtitleSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
                  {subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* For You (Last 3) */}
      <View style={[styles.categoriesSection, { paddingVertical: sectionVerticalPad }]}>
        <Text style={[styles.sectionTitle, { marginBottom: sectionTitleMarginBottom, fontSize: sectionTitleFontSize }]}>{t('donations:forYou')}</Text>
        <View style={[styles.categoriesGrid, { flexDirection: 'row', gap: gridGap }]}>
          {recentCategories.map((category) => {
            const { title, subtitle } = getCategoryText(category.id);
            return (
              <TouchableOpacity
                key={`recent-${category.id}`}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: category.bgColor, // השתמש בצבע הרקע של הקטגוריה
                    width: threeColCardWidthPx,
                    paddingVertical: cardVerticalPad,
                  },
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={styles.categoryIconWrapper}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor: category.color, // השתמש בצבע הקטגוריה
                        width: categoryIconOuter,
                        height: categoryIconOuter,
                        borderRadius: categoryIconOuter / 2,
                      },
                    ]}
                  >
                    <Ionicons name={category.icon as any} size={categoryIconSize} color="white" />
                  </View>
                </View>
                <View style={styles.categoryTitleRow}>
                  <Text style={[styles.categoryTitle, { fontSize: heroTitleSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
                    {title}
                  </Text>
                 </View>
                 <Text style={[styles.categorySubtitle, { fontSize: heroSubtitleSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
                  {subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
          
      {/* All - Horizontal scroll (improved) */}
      <View style={[styles.categoriesSection, { paddingVertical: sectionVerticalPad }]}>
        <Text style={[styles.sectionTitle, { marginBottom: sectionTitleMarginBottom, fontSize: sectionTitleFontSize }]}>{t('donations:all')}</Text>
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
            onScrollBeginDrag={() => console.log('🔄 Horizontal scroll started')}
            onScrollEndDrag={() => console.log('⏸️ Horizontal scroll ended')}
            onScroll={() => console.log('📜 Horizontal scrolling...')}
            scrollEventThrottle={100}
          >
            {otherCategories.map((category, index) => {
              const { title, subtitle } = getCategoryText(category.id as CategoryId);
              console.log(`🎯 Rendering "All" category ${index}:`, category.id, title);
              return (
                <TouchableOpacity
                  key={`all-${category.id}`}
                  onPress={() => {
                    console.log('🔥 Category pressed in "All":', category.id, title);
                    handleCategoryPress(category as any);
                  }}
                  style={[
                    styles.categoryCardHorizontal,
                    {
                      backgroundColor: category.bgColor,
                      width: threeColCardWidthPx,
                      marginRight: index === otherCategories.length - 1 ? 0 : gridGap,
                      paddingVertical: cardVerticalPad,
                    },
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
                    ]}
                  >
                    <Ionicons name={category.icon as any} size={categoryIconSize} color="white" />
                  </View>
                  <Text style={[styles.categoryTitle, { fontSize: otherTitleSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
                    {title}
                  </Text>
                  <Text style={[styles.categorySubtitle, { fontSize: otherSubtitleSize }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
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
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    textAlign: 'center', // מרכוז הכותרת
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
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE, // עיגול גדול יותר
    borderWidth: 1,
    borderColor: colors.borderSecondary, // גבול עדין
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.SM : LAYOUT_CONSTANTS.SPACING.MD, // Less margin on web
    marginHorizontal: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.XS : LAYOUT_CONSTANTS.SPACING.SM, // Less margin on web
    alignItems: 'center',
    paddingVertical: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.MD : LAYOUT_CONSTANTS.SPACING.LG, // Less padding on web
    paddingHorizontal: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.SM : LAYOUT_CONSTANTS.SPACING.MD, // Less padding on web
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 4 }, 0.15, 8), // צל צבעוני
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  horizontalScrollContainer: {
    height: Math.max(120, scaleSize(140)), // גובה קבוע
    width: '100%',
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
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
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
    width: '31.5%',
    paddingVertical: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.SM : LAYOUT_CONSTANTS.SPACING.MD, // Less padding on web
    paddingHorizontal: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.XS : LAYOUT_CONSTANTS.SPACING.SM, // Less padding on web
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM, // עיגול יותר מעוגל
    alignItems: 'center',
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 2 }, 0.12, 4), // צל צבעוני
    backgroundColor: colors.backgroundPrimary, // רקע לבן נקי
    borderWidth: 1,
    borderColor: colors.borderSecondary, // גבול עדין יותר
  },
  categoryCardHorizontal: {
    width: Platform.OS === 'web' ? scaleSize(120) : scaleSize(140), // Smaller on web
    paddingVertical: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.SM : LAYOUT_CONSTANTS.SPACING.MD, // Less padding on web
    paddingHorizontal: Platform.OS === 'web' ? LAYOUT_CONSTANTS.SPACING.XS : LAYOUT_CONSTANTS.SPACING.SM, // Less padding on web
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM, // עיגול יותר מעוגל
    alignItems: 'center',
    ...createShadowStyle(colors.shadowColored, { width: 0, height: 2 }, 0.12, 4), // צל צבעוני
    backgroundColor: colors.backgroundPrimary, // רקע לבן נקי
    borderWidth: 1,
    borderColor: colors.borderSecondary, // גבול עדין יותר
    marginRight: LAYOUT_CONSTANTS.SPACING.XS,
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
  categoryIcon: {
    width: scaleSize(35),
    height: scaleSize(35),
    borderRadius: scaleSize(35) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM, // מרווח גדול יותר מתחת לאיקון
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.3, 4), // צל לאיקון
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
