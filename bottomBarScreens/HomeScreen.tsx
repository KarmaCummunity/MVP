// File overview:
// - Purpose: Main Home screen showing animated bubbles and a draggable panel that reveals the posts feed (`PostsReelsScreen`).
// - Reached from: `HomeTabStack` -> route 'HomeMain' (initial route of the Home tab).
// - Provides: State and gestures to toggle between Home content and Posts feed; updates route params `{ hideTopBar, showPosts }` to control top bar in `TopBarNavigator`.
// - Reads from context: `useUser()` -> selectedUser, isGuestMode, isRealAuth, resetHomeScreenTrigger.
// - Input params: None required; uses navigation params set locally.
// - External deps/services: `EnhancedStatsService` for stats, `FloatingBubblesOverlay`, `PostsReelsScreen`.
import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import colors from "../globals/colors";
import { FontSizes, LAYOUT_CONSTANTS } from "../globals/constants";
import { useTranslation } from 'react-i18next';
import CommunityStatsPanel from "../components/CommunityStatsPanel";
import PostsReelsScreen from "../components/PostsReelsScreen";
import { 
  charities, 
  donations, 
  communityEvents, 
  currentUser 
} from "../globals/fakeData";
import { useUser } from "../context/UserContext";
import GuestModeNotice from "../components/GuestModeNotice";
import CommunityStatsGrid from "../components/CommunityStatsGrid";
import StatDetailsModal, { StatDetails } from "../components/StatDetailsModal";
import { createShadowStyle } from "../globals/styles";
import { scaleSize } from "../globals/responsive";
import { EnhancedStatsService, formatShortNumber } from "../utils/statsService";
import FloatingBubblesOverlay from "../components/FloatingBubblesOverlay";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Panel layout dimensions derived responsively
const PANEL_HEIGHT = SCREEN_HEIGHT - scaleSize(50);
const CLOSED_POSITION = PANEL_HEIGHT - scaleSize(60);
const OPEN_POSITION = 0;
const MID_POSITION = PANEL_HEIGHT / 2;

/**
 * Small animated bubble that gently floats to display a stat item.
 * Styles use global scaling and shadow helpers for cross-platform consistency.
 */
interface FloatingBubbleProps {
  icon: string;
  value: string;
  label: string;
  bubbleStyle: ViewStyle | ViewStyle[];
  delay: number;
}

const FloatingBubble: React.FC<FloatingBubbleProps> = ({ icon, value, label, bubbleStyle, delay }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    // Floating up and down animation
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // Scale animation
    scale.value = withDelay(
      delay + 500,
      withRepeat(
        withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // Opacity animation
    opacity.value = withDelay(
      delay + 1000,
      withRepeat(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ] as any,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.floatingBubble, bubbleStyle, animatedStyle]}>
      <Text style={styles.bubbleIcon}>{icon}</Text>
      <Text style={styles.bubbleValue}>{value}</Text>
      <Text style={styles.bubbleLabel}>{label}</Text>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { selectedUser, setSelectedUser, isGuestMode, resetHomeScreenTrigger, isRealAuth } = useUser();
  const [showPosts, setShowPosts] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStat, setSelectedStat] = useState<StatDetails | null>(null);
  const [isStatModalVisible, setIsStatModalVisible] = useState(false);
  
  // No logical difference between guest/user modes other than the header banner
  useEffect(() => {
    if (isGuestMode) {
      console.log('🏠 HomeScreen - Guest mode active (header banner only)');
    }
  }, [isGuestMode]);
  const [hideTopBar, setHideTopBar] = useState(false); // Top bar hiding state

  // Animated values for scrolling
  const scrollY = useSharedValue(0);
  const postsTranslateY = useSharedValue(0);
  const panelHeight = useSharedValue(0);
  const panelStartHeight = useSharedValue(0);
  const HALF_THRESHOLD = SCREEN_HEIGHT * 0.5;

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 HomeScreen - Screen focused, refreshing data...');
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Reset state when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      setShowPosts(false);
    }
  }, [isFocused]);

  // Listen to resetHomeScreenTrigger from context
  useEffect(() => {
    console.log('🏠 HomeScreen - resetHomeScreenTrigger changed, resetting showPosts');
    setShowPosts(false);
  }, [resetHomeScreenTrigger]);

  // Update hideTopBar and showPosts in route params
  useEffect(() => {
    console.log('🏠 HomeScreen - Updating route params with hideTopBar:', hideTopBar, 'showPosts:', showPosts);
    (navigation as any).setParams({ hideTopBar, showPosts });
  }, [hideTopBar, showPosts, navigation]);

  useFocusEffect(
    useCallback(() => {
      setShowPosts(false);
      setHideTopBar(false); // Reset top bar hiding
      postsTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });
      panelHeight.value = withTiming(0, { duration: 0 });
    }, [])
  );

  const handleSelectStat = (details: StatDetails) => {
    setSelectedStat(details);
    setIsStatModalVisible(true);
  };

  /**
   * Handle vertical scrolling; when reaching near the end, open the posts view.
   */
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const offsetY = contentOffset.y;
    scrollY.value = offsetY;
    // Disabled opening posts by scrolling to bottom; opening is only via the drag handle
  };

  /** Animated style for the posts screen */
  const postsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: postsTranslateY.value }] as any,
    };
  });

  // Fade/scale home content as the drag panel grows
  const homeAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(panelHeight.value, [0, HALF_THRESHOLD], [1, 0.2], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(panelHeight.value, [0, HALF_THRESHOLD], [1, 0.98], Extrapolation.CLAMP) }
      ] as any,
    };
  });

  // Animated style for the draggable panel overlay
  const panelAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: panelHeight.value,
    } as any;
  });

  // Drag gesture for opening the posts panel
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      panelStartHeight.value = panelHeight.value;
    })
    .onUpdate((event) => {
      // Upward drag has negative translationY; increase height accordingly
      const newHeight = Math.max(0, Math.min(SCREEN_HEIGHT, panelStartHeight.value - event.translationY));
      panelHeight.value = newHeight;
    })
    .onEnd(() => {
      const shouldOpen = panelHeight.value > HALF_THRESHOLD;
      if (shouldOpen) {
        panelHeight.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        // Replace Home with Posts screen
        runOnJS(setShowPosts)(true);
        runOnJS(setHideTopBar)(false);
      } else {
        panelHeight.value = withTiming(0, { duration: 200 });
      }
    });


  const { t } = useTranslation(['home','common']);

  // Fetch stats from DB
  const [stats, setStats] = useState<StatCardProps[]>([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const communityStats = await EnhancedStatsService.getCommunityStats();
        // Map to stat cards format
        setStats([
          { title: t('home:stats.activeMembers'), value: formatShortNumber(communityStats.activeMembers || 0), change: '+12.5%', changeType: 'up', iconName: 'people-outline', color: colors.primary },
          // Add more mapped stats...
        ]);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      
       {showPosts ? (
        // Posts screen
          <PostsReelsScreen 
            onScroll={(hide) => {
              console.log('🏠 HomeScreen - Setting hideTopBar:', hide);
              setHideTopBar(hide);
            }}
            hideTopBar={hideTopBar}
          />
      ) : (
        // Home screen with enhanced scrolling
        <>
        <Animated.View style={[styles.homeContainer, homeAnimatedStyle]}>
          <FloatingBubblesOverlay />
        </Animated.View>
        {/* Drag Handle Button - the ONLY way to open PostsReelsScreen */}
        {!showPosts && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.dragHandleButton, { zIndex: 1100 }]}>
              <View style={styles.handleBar} />
            </Animated.View>
          </GestureDetector>
        )}
        {/* Draggable Panel Overlay (visual only, replaced by PostsReelsScreen on threshold) */}
        {!showPosts && (
          <Animated.View style={[styles.dragPanel, panelAnimatedStyle]} />
        )}
        </>
      )}
    </SafeAreaView>
  );
}

// New StatCard component
type StatCardProps = {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
};
const StatCard = ({ title, value, change, changeType, iconName, color }: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={styles.statContent}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statChange}>
        <Ionicons name={changeType === 'up' ? "trending-up" : "trending-down"} size={16} color={changeType === 'up' ? colors.success : colors.error} />
        <Text style={[styles.statChangeText, { color: changeType === 'up' ? colors.success : colors.error }]}>{change}</Text>
      </View>
    </View>
    <View style={[styles.statIconContainer, { backgroundColor: color }]}>
      <Ionicons name={iconName} size={24} color="white" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  
  activitiesContainer: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  activitiesScroll: {
    paddingRight: LAYOUT_CONSTANTS.SPACING.LG,
  },
  activityCard: {
    backgroundColor: colors.backgroundPrimary,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
    width: scaleSize(150),
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.1, 2),
  },
  activityIcon: {
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(30) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  activityTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  activityTime: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  statsPreview: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },

     statCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 12, padding: 16, margin: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  statContent: {
    flex: 1,
    marginRight: LAYOUT_CONSTANTS.SPACING.MD,
  },
  statIcon: {
    fontSize: FontSizes.heading1,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
     statValue: {
     fontSize: FontSizes.medium,
     fontWeight: 'bold',
     color: '#1976D2', // Darker blue for better readability
     marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
   },
   statTitle: {
     fontSize: FontSizes.body,
     fontWeight: 'bold',
     color: colors.textPrimary,
     marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
   },
   statChange: {
     flexDirection: 'row',
     alignItems: 'center',
     marginTop: LAYOUT_CONSTANTS.SPACING.XS,
   },
   statChangeText: {
     fontSize: FontSizes.small,
     marginLeft: LAYOUT_CONSTANTS.SPACING.XS,
   },
   statIconContainer: {
     width: scaleSize(50),
     height: scaleSize(50),
     borderRadius: scaleSize(25),
     justifyContent: 'center',
     alignItems: 'center',
   },
   statName: {
     fontSize: FontSizes.caption,
     color: '#1565C0', // Darker blue for better readability
     textAlign: 'center',
     fontWeight: '500',
   },
  panel: {
    height: PANEL_HEIGHT,
    width: "100%",
    backgroundColor: colors.white,
    position: "absolute",
    bottom: LAYOUT_CONSTANTS.SPACING.SM,
    borderTopLeftRadius: scaleSize(250),
    borderTopRightRadius: scaleSize(250),
    ...createShadowStyle(colors.shadowLight, { width: 0, height: -3 }, 0.15, 8),
  },
  panelHandle: {
    height: scaleSize(6),
    borderRadius: scaleSize(3),
    alignSelf: "center",
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  // New styles for posts screen and scrolling
  postsContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  postsTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollContainer: {
    flex: 1,
  },
  pullIndicator: {
    alignItems: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.XL,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
  },
  pullText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  // Toggle button styles
  toggleContainer: {
    position: 'absolute',
    bottom: scaleSize(50),
    right: scaleSize(30),
    zIndex: 1000,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: scaleSize(20),
    padding: scaleSize(3),
    gap: LAYOUT_CONSTANTS.SPACING.XS,
  },
  // Drag handle button (small pill) centered at bottom
  dragHandleButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: colors.pink,
    alignSelf: 'center',
    width: scaleSize(96),
    height: scaleSize(24),
    borderRadius: scaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.15, 4),
  },
  handleBar: {
    alignSelf: 'center',
    width: scaleSize(64),
    height: scaleSize(6),
    borderRadius: scaleSize(3),
    backgroundColor: colors.backgroundTertiary,
  },
  // Draggable white panel overlay that grows with the gesture
  dragPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: scaleSize(24),
    borderTopRightRadius: scaleSize(24),
    ...createShadowStyle(colors.shadowLight, { width: 0, height: -3 }, 0.15, 8),
    zIndex: 900,
  },
  toggleButton: {
    width: scaleSize(32),
    height: scaleSize(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(16),
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.4, 2),
  },
  toggleText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.backgroundPrimary,
  },
  // Community mode styles
  communityModeContainer: {
    flex: 1,
    minHeight: "100%", // Minimum height to enable scrolling
    width: "100%",
  },
  communityModeTitle: {
    fontSize: FontSizes.heading2,
  },
  // Selected user indicator styles
  userSelectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.offWhite,
    marginHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    padding: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  selectedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedUserAvatar: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(16),
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
  },
  selectedUserName: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  selectedUserLocation: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  clearUserButton: {
    padding: LAYOUT_CONSTANTS.SPACING.XS,
  },
  // Home container style
  homeContainer: {
    flex: 1,
    position: 'relative',
  },
  // Personal mode style
  personalModeContainer: {
    flex: 1,
  },
  // Scroll content style
  scrollContent: {
    paddingBottom: scaleSize(100),
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
  },
  // Personal statistics styles
  personalStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  personalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
     personalStatCard: {
     backgroundColor: '#E3F2FD', // Very light blue
     padding: LAYOUT_CONSTANTS.SPACING.MD,
     borderRadius: scaleSize(50), // Fully rounded
     alignItems: 'center',
     flex: 1,
     marginHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
     marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
     ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.15, 4),
     minWidth: scaleSize(80),
     minHeight: scaleSize(80),
     justifyContent: 'center',
   },
  personalStatIcon: {
    fontSize: FontSizes.heading2,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
     personalStatValue: {
     fontSize: FontSizes.large,
     fontWeight: 'bold',
     color: '#1976D2', // Darker blue for better readability
     marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
   },
   personalStatName: {
     fontSize: FontSizes.caption,
     color: '#1565C0', // Darker blue for better readability
     textAlign: 'center',
     fontWeight: '500',
   },
  // Floating community statistics styles
  floatingStatsContainer: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  bubblesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
     floatingBubble: {
     backgroundColor: '#E3F2FD', // Very light blue
     padding: LAYOUT_CONSTANTS.SPACING.MD,
     borderRadius: scaleSize(50), // Fully rounded
     alignItems: 'center',
     marginHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
     marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
     ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.15, 4),
     minWidth: scaleSize(80),
     minHeight: scaleSize(80),
     justifyContent: 'center',
   },
  bubbleIcon: {
    fontSize: FontSizes.heading2,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
     bubbleValue: {
     fontSize: FontSizes.large,
     fontWeight: 'bold',
     color: '#1976D2', // Darker blue for better readability
     marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
   },
   bubbleLabel: {
     fontSize: FontSizes.caption,
     color: '#1565C0', // Darker blue for better readability
     textAlign: 'center',
     fontWeight: '500',
   },
     // Specific donation types styles
   moneyBubble: {
     backgroundColor: colors.legacyLightGreen,
     borderColor: colors.success + '30',
     borderWidth: 1,
   },
   foodBubble: {
     backgroundColor: colors.successLight,
     borderColor: colors.success + '30',
     borderWidth: 1,
   },
   clothingBubble: {
     backgroundColor: colors.infoLight,
     borderColor: colors.info + '30',
     borderWidth: 1,
   },
   bloodBubble: {
     backgroundColor: colors.errorLight,
     borderColor: colors.error + '30',
     borderWidth: 1,
   },
   timeBubble: {
     backgroundColor: colors.warningLight,
     borderColor: colors.warning + '30',
     borderWidth: 1,
   },
   transportBubble: {
     backgroundColor: colors.legacyLightBlue,
     borderColor: colors.info + '30',
     borderWidth: 1,
   },
   educationBubble: {
     backgroundColor: colors.successLight,
     borderColor: colors.success + '30',
     borderWidth: 1,
   },
   environmentBubble: {
     backgroundColor: colors.legacyLightGreen,
     borderColor: colors.success + '30',
     borderWidth: 1,
   },
   animalsBubble: {
     backgroundColor: colors.legacyLightOrange,
     borderColor: colors.warning + '30',
     borderWidth: 1,
   },
   eventsBubble: {
     backgroundColor: colors.legacyLightPink,
     borderColor: colors.pink + '30',
     borderWidth: 1,
   },
   recyclingBubble: {
     backgroundColor: colors.successLight,
     borderColor: colors.success + '30',
     borderWidth: 1,
   },
      cultureBubble: {
     backgroundColor: colors.legacyLightPurple,
     borderColor: colors.info + '30',
     borderWidth: 1,
   },
   healthBubble: {
     backgroundColor: colors.legacyLightRed,
     borderColor: colors.error + '30',
     borderWidth: 1,
   },
   elderlyBubble: {
     backgroundColor: colors.legacyLightBlue,
     borderColor: colors.info + '30',
     borderWidth: 1,
   },
   childrenBubble: {
     backgroundColor: colors.legacyLightPink,
     borderColor: colors.pink + '30',
     borderWidth: 1,
   },
   sportsBubble: {
     backgroundColor: colors.legacyLightGreen,
     borderColor: colors.success + '30',
     borderWidth: 1,
   },
   musicBubble: {
     backgroundColor: colors.legacyLightPurple,
     borderColor: colors.info + '30',
     borderWidth: 1,
   },
   artBubble: {
     backgroundColor: colors.legacyLightOrange,
     borderColor: colors.warning + '30',
     borderWidth: 1,
   },
   techBubble: {
     backgroundColor: colors.legacyLightBlue,
     borderColor: colors.info + '30',
     borderWidth: 1,
   },
   gardenBubble: {
     backgroundColor: colors.successLight,
     borderColor: colors.success + '30',
     borderWidth: 1,
   },
   leadershipBubble: {
     backgroundColor: colors.legacyLightYellow,
     borderColor: colors.warning + '30',
     borderWidth: 1,
   },
  // New styles for dashboard elements
  welcomeSection: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  welcomeTitle: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  // statCard styles are already defined earlier in this StyleSheet.
  chartCard: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    marginHorizontal: LAYOUT_CONSTANTS.SPACING.SM,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.1, 2),
  },
  chartTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  progressContainer: {
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  progressBar: {
    height: scaleSize(8),
    backgroundColor: colors.backgroundTertiary,
    borderRadius: scaleSize(4),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: scaleSize(4),
  },
  updatesSection: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  updatesTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  updatesList: {
    // List of updates will go here
  },
  updateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  updateText: {
    fontSize: FontSizes.small,
    color: colors.textPrimary,
  },
  updateTime: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  chartsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },

 });