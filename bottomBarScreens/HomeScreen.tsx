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
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { selectedUser, setSelectedUser, isGuestMode, resetHomeScreenTrigger } = useUser();
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

    // Open posts screen when the user scrolls to the end of the content
    const nearBottomBuffer = LAYOUT_CONSTANTS.SPACING.MD;
    const reachedEnd = offsetY + layoutMeasurement.height >= contentSize.height - nearBottomBuffer;

    if (reachedEnd && !showPosts) {
      console.log('🏠 HomeScreen - Opening posts screen (scrolled past categories to bottom)');
      setShowPosts(true);
      setHideTopBar(false);
      postsTranslateY.value = withSpring(0, {
        damping: 25,
        stiffness: 200,
        mass: 0.6,
      });
    }
  };

  /** Animated style for the posts screen */
  const postsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: postsTranslateY.value }] as any,
    };
  });


  const { t } = useTranslation(['home','common']);

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' ? ({ height: '100vh' } as any) : null]}>
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
        <View style={[styles.homeContainer, Platform.OS === 'web' ? ({ height: '100%' } as any) : null]}>
          <ScrollView 
            style={[styles.scrollContainer, Platform.OS === 'web' ? ({ overflowY: 'auto', height: '100%' } as any) : null]}
            onScroll={handleScroll}
            scrollEventThrottle={50}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            contentContainerStyle={[styles.scrollContent, Platform.OS === 'web' ? ({ flexGrow: 1 } as any) : null]}
          >
            {/* Header */}
            {isGuestMode ? (
                  <GuestModeNotice />
            ) : (
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.userInfo}>
                    <Image 
                      source={{ uri: selectedUser?.avatar || currentUser.avatar }} 
                      style={styles.userAvatar}
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.welcomeText}>{`${t('home:welcome')}, ${selectedUser?.name || currentUser.name}!`}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.notificationButton}
                    onPress={() => Alert.alert(t('common:notifications'), t('common:notificationsList'))}
                  >
                    <Ionicons name="notifications-outline" size={scaleSize(24)} color={colors.textPrimary} />
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationText}>3</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Community Stats Grid - press to open details */}
            <CommunityStatsGrid onSelect={handleSelectStat} />
          </ScrollView>
          {/* Details modal */}
          <StatDetailsModal 
            visible={isStatModalVisible} 
            onClose={() => setIsStatModalVisible(false)} 
            details={selectedStat}
          />
          {/* Toggle Button - Hidden in guest mode */}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    backgroundColor: colors.backgroundPrimary,
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
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(50) / 2,
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  karmaText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
  notificationButton: {
    position: 'relative',
    padding: LAYOUT_CONSTANTS.SPACING.SM,
  },
  notificationBadge: {
    position: 'absolute',
    top: LAYOUT_CONSTANTS.SPACING.XS,
    right: LAYOUT_CONSTANTS.SPACING.XS,
    backgroundColor: colors.error,
    borderRadius: scaleSize(10),
    minWidth: scaleSize(20),
    height: scaleSize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: colors.white,
    fontSize: FontSizes.small,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    padding: LAYOUT_CONSTANTS.SPACING.LG,
  },
  sectionTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
  },
  quickActionIcon: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(50) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  quickActionText: {
    fontSize: FontSizes.small,
    color: colors.textPrimary,
    textAlign: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
     statCard: {
     backgroundColor: '#E3F2FD',
     padding: LAYOUT_CONSTANTS.SPACING.MD,
     borderRadius: scaleSize(50),
     alignItems: 'center',
     flex: 1,
     marginHorizontal: LAYOUT_CONSTANTS.SPACING.XS,
     ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.15, 4),
     minWidth: scaleSize(80),
     minHeight: scaleSize(80),
     justifyContent: 'center',
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
    paddingBottom: scaleSize(100), // Bottom margin to enable scrolling
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

 });
