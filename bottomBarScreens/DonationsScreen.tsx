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
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
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

interface DonationsScreenProps {
  navigation: NavigationProp<DonationsStackParamList>;
}

const RECENT_CATEGORIES_KEY = 'recent_categories_ids';
const RECENT_LIMIT = 3;
const DEFAULT_RECENT_IDS: string[] = ['clothes', 'knowledge', 'food'];
const ANALYTICS_USER_ID = 'global';
const ANALYTICS_COLLECTION = 'analytics';
const ANALYTICS_ITEM_PREFIX = 'category:';
const POPULAR_FALLBACK: string[] = ['money', 'trump', 'items'];

const BASE_CATEGORIES = [
  { id: 'money',      icon: 'card-outline',        color: colors.success, bgColor: colors.successLight, screen: 'MoneyScreen' },
  { id: 'trump',      icon: 'car-outline',         color: colors.info,    bgColor: colors.infoLight,    screen: 'TrumpScreen' },
  { id: 'knowledge',  icon: 'school-outline',      color: colors.legacyMediumPurple, bgColor: colors.backgroundTertiary, screen: 'KnowledgeScreen' },
  { id: 'time',       icon: 'time-outline',        color: colors.orange,  bgColor: colors.backgroundTertiary, screen: 'TimeScreen' },
  { id: 'food',       icon: 'restaurant-outline',  color: colors.textPrimary, bgColor: colors.backgroundSecondary, screen: 'FoodScreen' },
  { id: 'clothes',    icon: 'shirt-outline',       color: colors.info,    bgColor: colors.infoLight,    screen: 'ClothesScreen' },
  { id: 'books',      icon: 'library-outline',     color: colors.success, bgColor: colors.successLight, screen: 'BooksScreen' },
  { id: 'items',      icon: 'cube-outline',        color: colors.textPrimary, bgColor: colors.backgroundSecondary, screen: 'ItemsScreen' },
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
  { id: 'matchmaking', icon: 'people-outline',     color: colors.pink,    bgColor: colors.pinkLight,    screen: 'MatchmakingScreen' },
  { id: 'mentalHealth', icon: 'brain-outline',     color: colors.pinkDark,  bgColor: colors.pinkLight,  screen: 'MentalHealthScreen' },
  { id: 'goldenAge',   icon: 'person-outline',     color: colors.warning, bgColor: colors.warningLight, screen: 'GoldenAgeScreen' },
  { id: 'languages',   icon: 'language-outline',   color: colors.info,    bgColor: colors.infoLight,    screen: 'LanguagesScreen' },
] as const;

type CategoryId = typeof BASE_CATEGORIES[number]['id'];

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const DonationsScreen: React.FC<DonationsScreenProps> = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const { isGuestMode, isRealAuth } = useUser(); // הסרנו את user כי אינו קיים ב-Type
  const { t } = useTranslation(['donations','common']);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>([]);
  const [popularCategoryIds, setPopularCategoryIds] = useState<string[]>([]);

  const { isTablet, isDesktop } = getScreenInfo();
  const landscape = isLandscape();
  const recentColumns = isDesktop ? 6 : isTablet || landscape ? 5 : 4;
  const allColumns = isDesktop ? 5 : isTablet || landscape ? 4 : 3;
  const recentCardWidth = `${(100 / recentColumns) - 2}%` as const;
  const allCardWidth = `${(100 / allColumns) - 2}%` as const;
  const categoryIconSize = scaleSize(26);
  const categoryIconOuter = scaleSize(35);
  // Precise sizing so 3 cards fit almost fully across the section width on all screens
  const sectionHorizontalMargins = LAYOUT_CONSTANTS.SPACING.SM * 2; // left + right
  const sectionHorizontalPaddings = LAYOUT_CONSTANTS.SPACING.MD * 2; // left + right
  const gridGap = LAYOUT_CONSTANTS.SPACING.XS; // gap between items
  const sectionInnerWidth = SCREEN_WIDTH - sectionHorizontalMargins - sectionHorizontalPaddings;
  const threeColCardWidthPx = Math.max(100, Math.floor((sectionInnerWidth - gridGap * 2) / 4));
  const ITEM_FULL_WIDTH = threeColCardWidthPx + gridGap; // used for snapping and getItemLayout
  const heroTitleSize = scaleSize(isTablet || isDesktop ? 18 : 16);
  const heroSubtitleSize = scaleSize(isTablet || isDesktop ? 13 : 12);
  const otherTitleSize = scaleSize(isTablet || isDesktop ? 16 : 14);
  const otherSubtitleSize = scaleSize(isTablet || isDesktop ? 12 : 11);
  const othersMaxHeight = Math.max(scaleSize(220), Math.min(SCREEN_HEIGHT * 0.45, scaleSize(480)));

  // Infinite horizontal list state (for "All" section)
  const LOOP_BLOCKS = 3; // center block is the natural list; both sides mirror for looping
  const baseAllCategories = useMemo(() => BASE_CATEGORIES.slice(), []);
  const loopedAllCategories = useMemo(
    () => Array.from({ length: LOOP_BLOCKS }).flatMap(() => baseAllCategories),
    [baseAllCategories]
  );
  const baseLen = baseAllCategories.length;
  const middleBlockStartIndex = baseLen; // start of middle block
  const allListRef = useRef<FlatList<any> | null>(null);
  const currentAllIndexRef = useRef<number>(middleBlockStartIndex);

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
          let analytics: any[] = [];
          
          if (USE_BACKEND && isRealAuth) {
            // Use enhanced backend analytics
            const categoryAnalytics = await EnhancedStatsService.getCategoryAnalytics();
            analytics = categoryAnalytics.map((cat: any) => ({
              id: cat.slug,
              categoryId: cat.slug,
              count: cat.donation_count + (cat.clicks || 0),
            }));
          } else {
            // Fallback to legacy analytics
            analytics = await restAdapter.list<any>(ANALYTICS_COLLECTION, ANALYTICS_USER_ID).catch(() => [] as any[]);
            analytics = analytics.map((d: any) => {
              const id: string | undefined = d?.categoryId || (typeof d?.id === 'string' ? d.id.replace(ANALYTICS_ITEM_PREFIX, '') : undefined);
              const count: number = Number(d?.count ?? 0);
              return id ? { id, count } : null;
            }).filter(Boolean);
          }

          const baseIds = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id));
          const topSorted = analytics
            .filter((c) => baseIds.has(c.id))
            .sort((a, b) => b.count - a.count)
            .map((c) => c.id);
          const resolved = (topSorted.length > 0 ? topSorted : POPULAR_FALLBACK).filter((id) => baseIds.has(id));
          setPopularCategoryIds(resolved.slice(0, 3));
        } catch (e) {
          console.error('Failed to load category analytics:', e);
          const baseIds = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id));
          setPopularCategoryIds(POPULAR_FALLBACK.filter((id) => baseIds.has(id)).slice(0, 3));
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
    setRecentCategoryIds((prev) => {
      const next = [category.id, ...prev.filter((id) => id !== category.id)].slice(0, RECENT_LIMIT);
      AsyncStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    // Fire-and-forget analytics increment
    incrementCategoryCounter(category.id).catch(() => {});

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

  const recentIdsBase = (recentCategoryIds.length > 0 ? recentCategoryIds : DEFAULT_RECENT_IDS);
  const baseIdSet = new Set((BASE_CATEGORIES as readonly any[]).map((c) => c.id as string));
  const popularIdSet = new Set(popularIdsResolved as unknown as string[]);
  const recentFillPool = [
    ...recentIdsBase,
    ...DEFAULT_RECENT_IDS,
    ...((BASE_CATEGORIES as readonly any[]).map((c) => c.id as string)),
  ];
  const desiredRecentIds = Array.from(new Set(recentFillPool))
    .filter((id) => baseIdSet.has(id) && !popularIdSet.has(id))
    .slice(0, RECENT_LIMIT) as string[];
  const recentCategories = desiredRecentIds
    .map((id) => BASE_CATEGORIES.find((c) => c.id === id))
    .filter((c): c is typeof BASE_CATEGORIES[number] => Boolean(c));

  const otherCategories = BASE_CATEGORIES.filter((c) => !popularCategories.some((pc) => pc.id === c.id) && !recentCategories.some((rc) => rc.id === c.id));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      {isGuestMode && <GuestModeNotice />}

      {/* Popular (Top 3) */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>{t('donations:popular')}</Text>
        <View style={[styles.categoriesGrid, { flexDirection: 'row' }]}>
          {popularCategories.slice(0, 3).map((category) => {
            const { title, subtitle } = getCategoryText(category.id);
            return (
              <TouchableOpacity
                key={`popular-${category.id}`}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: category.bgColor,
                    width: threeColCardWidthPx,
                    paddingVertical: LAYOUT_CONSTANTS.SPACING.MD,
                  },
                ]}
                onPress={() => handleCategoryPress(category)}
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
                <Text style={[styles.categoryTitle, { fontSize: heroTitleSize }]} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={[styles.categorySubtitle, { fontSize: heroSubtitleSize }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* For You (Last 3) */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>{t('donations:forYou')}</Text>
        <View style={[styles.categoriesGrid, { flexDirection: 'row' }]}>
          {recentCategories.map((category) => {
            const { title, subtitle } = getCategoryText(category.id);
            return (
              <TouchableOpacity
                key={`recent-${category.id}`}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: category.bgColor,
                    width: threeColCardWidthPx,
                    paddingVertical: LAYOUT_CONSTANTS.SPACING.MD,
                  },
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={styles.categoryIconWrapper}>
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
                </View>
                <View style={styles.categoryTitleRow}>
                  <Text style={[styles.categoryTitle, { fontSize: heroTitleSize }]} numberOfLines={1}>
                    {title}
                  </Text>
                </View>
                <Text style={[styles.categorySubtitle, { fontSize: heroSubtitleSize }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
          
      {/* All - Horizontal scroll with infinite loop */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>{t('donations:all')}</Text>
        <FlatList
          ref={(r) => {
            allListRef.current = r;
          }}
          data={loopedAllCategories}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={middleBlockStartIndex}
          getItemLayout={(_, index) => ({ length: ITEM_FULL_WIDTH, offset: ITEM_FULL_WIDTH * index, index })}
          decelerationRate="fast"
          snapToInterval={ITEM_FULL_WIDTH}
          snapToAlignment="start"
          onScrollToIndexFailed={(info) => {
            // Fallback scroll without animation
            allListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
          }}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const approxIndex = Math.round(x / ITEM_FULL_WIDTH);
            currentAllIndexRef.current = approxIndex;
            if (approxIndex < baseLen) {
              // Jump forward by one block to stay in middle
              const target = approxIndex + baseLen;
              allListRef.current?.scrollToIndex({ index: target, animated: false });
              currentAllIndexRef.current = target;
            } else if (approxIndex >= baseLen * 2) {
              // Jump back by one block to stay in middle
              const target = approxIndex - baseLen;
              allListRef.current?.scrollToIndex({ index: target, animated: false });
              currentAllIndexRef.current = target;
            }
          }}
          contentContainerStyle={[styles.horizontalList, { paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS }]}
          renderItem={({ item: category, index }) => {
            const { title, subtitle } = getCategoryText(category.id as CategoryId);
            return (
              <TouchableOpacity
                onPress={() => handleCategoryPress(category as any)}
                style={[
                  styles.categoryCardHorizontal,
                  {
                    backgroundColor: (category as any).bgColor,
                    width: threeColCardWidthPx,
                    marginRight: gridGap,
                    paddingVertical: LAYOUT_CONSTANTS.SPACING.MD,
                  },
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor: (category as any).color,
                      width: categoryIconOuter,
                      height: categoryIconOuter,
                      borderRadius: categoryIconOuter / 2,
                    },
                  ]}
                >
                  <Ionicons name={(category as any).icon as any} size={categoryIconSize} color="white" />
                </View>
                <Text style={[styles.categoryTitle, { fontSize: otherTitleSize }]} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={[styles.categorySubtitle, { fontSize: otherSubtitleSize }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
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
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  horizontalList: {
    paddingVertical: LAYOUT_CONSTANTS.SPACING.XS,
    gap: LAYOUT_CONSTANTS.SPACING.XS,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
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
  categoryCardHorizontal: {
    width: scaleSize(140),
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    alignItems: 'center',
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.08, 3),
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 0.5,
    borderColor: colors.backgroundTertiary,
    marginRight: LAYOUT_CONSTANTS.SPACING.XS,
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
