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
  Platform
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
import { FontSizes } from "../globals/constants";
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");


const PANEL_HEIGHT = SCREEN_HEIGHT - 50;
const CLOSED_POSITION = PANEL_HEIGHT - 60;
const OPEN_POSITION = 0;
const MID_POSITION = PANEL_HEIGHT / 2;

// Animated floating bubble component
const FloatingBubble: React.FC<{
  icon: string;
  value: string;
  label: string;
  bubbleStyle: any;
  delay: number;
}> = ({ icon, value, label, bubbleStyle, delay }) => {
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
   * Handles downward scrolling. When the user reaches near the bottom,
   * the posts screen is opened.
   */
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const offsetY = contentOffset.y;
    scrollY.value = offsetY;

    // Open posts screen when the user scrolls to the end of the content
    const nearBottomBuffer = 24;
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      
       {showPosts ? (
        // Posts screen
        <View style={styles.postsContainer}>
          <PostsReelsScreen 
            onScroll={(hide) => {
              console.log('🏠 HomeScreen - Setting hideTopBar:', hide);
              setHideTopBar(hide);
            }}
            hideTopBar={hideTopBar}
          />
        </View>
      ) : (
        // Home screen with enhanced scrolling
        <View style={styles.homeContainer}>
          <ScrollView 
            style={[styles.scrollContainer, Platform.OS === 'web' ? ({ overflowY: 'auto' } as any) : null]}
            onScroll={handleScroll}
            scrollEventThrottle={50}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, Platform.OS === 'web' ? ({ minHeight: '100vh' } as any) : null]}
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
                    <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  karmaText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: colors.white,
    fontSize: FontSizes.small,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: FontSizes.small,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  activitiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activitiesScroll: {
    paddingRight: 20,
  },
  activityCard: {
    backgroundColor: colors.backgroundPrimary,
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
    width: 150,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  statsPreview: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
     statCard: {
     backgroundColor: '#E3F2FD',
     padding: 15,
     borderRadius: 50,
     alignItems: 'center',
     flex: 1,
     marginHorizontal: 5,
         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
     elevation: 3,
     minWidth: 80,
     minHeight: 80,
     justifyContent: 'center',
   },
  statIcon: {
    fontSize: FontSizes.heading1,
    marginBottom: 5,
  },
     statValue: {
     fontSize: FontSizes.medium,
     fontWeight: 'bold',
     color: '#1976D2', // Darker blue for better readability
     marginBottom: 2,
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
    bottom: 10,
    borderTopLeftRadius: 250,
    borderTopRightRadius: 250,
    boxShadow: '0 -3px 8px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  panelHandle: {
    height: 6,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    paddingVertical: 30,
    marginBottom: 50,
  },
  pullText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
  // Toggle button styles
  toggleContainer: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    zIndex: 1000,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  toggleButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
    elevation: 3,
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
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  selectedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  selectedUserName: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedUserLocation: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  clearUserButton: {
    padding: 4,
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
    paddingBottom: 100, // Bottom margin to enable scrolling
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
     padding: 15,
     borderRadius: 50, // Fully rounded
     alignItems: 'center',
     flex: 1,
     marginHorizontal: 5,
     marginBottom: 10,
     boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
     elevation: 3,
     minWidth: 80,
     minHeight: 80,
     justifyContent: 'center',
   },
  personalStatIcon: {
    fontSize: FontSizes.heading2,
    marginBottom: 5,
  },
     personalStatValue: {
     fontSize: FontSizes.large,
     fontWeight: 'bold',
     color: '#1976D2', // Darker blue for better readability
     marginBottom: 2,
   },
   personalStatName: {
     fontSize: FontSizes.caption,
     color: '#1565C0', // Darker blue for better readability
     textAlign: 'center',
     fontWeight: '500',
   },
  // Floating community statistics styles
  floatingStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bubblesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
     floatingBubble: {
     backgroundColor: '#E3F2FD', // Very light blue
     padding: 15,
     borderRadius: 50, // Fully rounded
     alignItems: 'center',
     marginHorizontal: 5,
     marginBottom: 10,
     boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
     elevation: 3,
     minWidth: 80,
     minHeight: 80,
     justifyContent: 'center',
   },
  bubbleIcon: {
    fontSize: FontSizes.heading2,
    marginBottom: 5,
  },
     bubbleValue: {
     fontSize: FontSizes.large,
     fontWeight: 'bold',
     color: '#1976D2', // Darker blue for better readability
     marginBottom: 2,
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
