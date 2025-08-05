import React, { useState, useEffect } from "react";
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
  StatusBar
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
import BubbleComp from "../components/BubbleComp";
import colors from "../globals/colors";
import { FontSizes } from "../globals/constants";
import CommunityStatsPanel from "../components/CommunityStatsPanel";
import PostsReelsScreen from "../components/PostsReelsScreen";
import { 
  communityStats, 
  tasks, 
  donations, 
  communityEvents, 
  currentUser 
} from "../globals/fakeData";
import { useUser } from "../context/UserContext";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_HEIGHT = SCREEN_HEIGHT - 50;
const CLOSED_POSITION = PANEL_HEIGHT - 60;
const OPEN_POSITION = 0;
const MID_POSITION = PANEL_HEIGHT / 2;

// קומפוננטה מונפשת לבועה צפה
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
    // אנימציה של ציפה למעלה ולמטה
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // אנימציה של קנה מידה
    scale.value = withDelay(
      delay + 500,
      withRepeat(
        withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // אנימציה של שקיפות
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
      ],
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
  const { selectedUser, setSelectedUser, isGuestMode } = useUser();
  const [showPosts, setShowPosts] = useState(false);
  const [isPersonalMode, setIsPersonalMode] = useState(true); // מצב אישי כברירת מחדל
  const [hideTopBar, setHideTopBar] = useState(false); // מצב הסתרת הטופ בר

  // ערכים מונפשים לגלילה
  const scrollY = useSharedValue(0);
  const postsTranslateY = useSharedValue(0);

  // איפוס מצב כאשר המסך מאבד פוקוס
  React.useEffect(() => {
    if (!isFocused) {
      setShowPosts(false);
    }
  }, [isFocused]);

  // עדכון hideTopBar ב-route params
  React.useEffect(() => {
    console.log('🏠 HomeScreen - Updating route params with hideTopBar:', hideTopBar);
    (navigation as any).setParams({ hideTopBar });
  }, [hideTopBar, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      setShowPosts(false);
      setHideTopBar(false); // איפוס הסתרת הטופ בר
      postsTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });
    }, [])
  );

  /**
   * מטפל בגלילה למטה
   * כאשר הגלילה עוברת סף מסוים, נפתח מסך הפוסטים
   */
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // סף גבוה יותר - צריך גלילה משמעותית
    const threshold = 150;
    
    // אם הגלילה עוברת את הסף, נפתח מסך הפוסטים
    if (offsetY > threshold && !showPosts) {
      setShowPosts(true);
      setHideTopBar(false); // וידוא שהטופ בר מוצג כשנפתח מסך הפוסטים
      postsTranslateY.value = withSpring(0, {
        damping: 25,
        stiffness: 200,
        mass: 0.6,
      });
    }
  };

  /**
   * סגנון מונפש למסך הפוסטים
   */
  const postsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: postsTranslateY.value }],
    };
  });

  // Recent Activities
  const recentActivities = [
    {
      id: '1',
      type: 'task',
      title: 'משימה הושלמה: איסוף מזון',
      description: 'אנה כהן השלימה משימת איסוף מזון',
      time: 'לפני שעה',
      icon: 'checkmark-circle',
      color: colors.success
    },
    {
      id: '2',
      type: 'donation',
      title: 'תרומה חדשה: 500 ₪',
      description: 'דני לוי תרם 500 ₪ לקניית ציוד',
      time: 'לפני 3 שעות',
      icon: 'heart',
      color: colors.error
    },
    {
      id: '3',
      type: 'event',
      title: 'אירוע חדש: יום קהילה',
      description: 'אירוע קהילתי גדול יתקיים בשבוע הבא',
      time: 'לפני יום',
      icon: 'calendar',
      color: colors.info
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      
      {showPosts ? (
        // מסך הפוסטים
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
        // מסך הבית עם גלילה משופרת
        <View style={styles.homeContainer}>
          <ScrollView 
            style={styles.scrollContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* תוכן דינמי בהתאם למצב */}
            {isPersonalMode ? (
              // מצב אישי - המסך המלא
              <View style={styles.personalModeContainer}>
                {/* Guest Mode Notice */}
                {isGuestMode && (
                  <View style={styles.guestModeNotice}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
                    <Text style={styles.guestModeText}>
                      אתה במצב אורח. התחבר כדי לגשת לכל הפיצ'רים
                    </Text>
                  </View>
                )}
                
                {/* Header Section */}
                <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.userInfo}>
                    <Image 
                      source={{ uri: selectedUser?.avatar || currentUser.avatar }} 
                      style={styles.userAvatar}
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.welcomeText}>שלום, {selectedUser?.name || currentUser.name}!</Text>
                      <Text style={styles.karmaText}>קארמה: {selectedUser?.karmaPoints || currentUser.karmaPoints} נקודות</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.notificationButton}
                    onPress={() => Alert.alert('התראות', 'רשימת התראות')}
                  >
                    <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationText}>3</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats Preview */}
              <View style={styles.statsPreview}>
                <View style={styles.statsGrid}>
                  {communityStats.slice(0, 4).map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                      <Text style={styles.statIcon}>{stat.icon}</Text>
                      <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
                      <Text style={styles.statName}>{stat.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Additional Personal Statistics */}
              <View style={styles.personalStatsContainer}>
                <Text style={styles.sectionTitle}>הסטטיסטיקות שלי</Text>
                <View style={styles.personalStatsGrid}>
                  <View style={styles.personalStatCard}>
                    <Text style={styles.personalStatIcon}>🎯</Text>
                    <Text style={styles.personalStatValue}>45</Text>
                    <Text style={styles.personalStatName}>משימות הושלמו</Text>
                  </View>
                  <View style={styles.personalStatCard}>
                    <Text style={styles.personalStatIcon}>💝</Text>
                    <Text style={styles.personalStatValue}>12</Text>
                    <Text style={styles.personalStatName}>תרומות</Text>
                  </View>
                  <View style={styles.personalStatCard}>
                    <Text style={styles.personalStatIcon}>⏰</Text>
                    <Text style={styles.personalStatValue}>156</Text>
                    <Text style={styles.personalStatName}>שעות התנדבות</Text>
                  </View>
                  <View style={styles.personalStatCard}>
                    <Text style={styles.personalStatIcon}>🏆</Text>
                    <Text style={styles.personalStatValue}>8</Text>
                    <Text style={styles.personalStatName}>הישגים</Text>
                  </View>
                </View>
              </View>

              {/* Floating Statistics Bubbles */}
              <View style={styles.floatingStatsContainer}>
                <Text style={styles.sectionTitle}>סטטיסטיקות קהילתיות</Text>
                <View style={styles.bubblesContainer}>
                  {/* Money Donations */}
                  <FloatingBubble
                    icon="💵"
                    value="125K"
                    label="תרומות כספיות"
                    bubbleStyle={styles.moneyBubble}
                    delay={0}
                  />
                  
                  {/* Food Donations */}
                  <FloatingBubble
                    icon="🍎"
                    value="2.1K"
                    label={'ק"ג מזון'}
                    bubbleStyle={styles.foodBubble}
                    delay={200}
                  />
                  
                  {/* Clothing Donations */}
                  <FloatingBubble
                    icon="👕"
                    value="1.5K"
                    label={'ק"ג בגדים'}
                    bubbleStyle={styles.clothingBubble}
                    delay={400}
                  />
                  
                  {/* Blood Donations */}
                  <FloatingBubble
                    icon="🩸"
                    value="350"
                    label="ליטר דם"
                    bubbleStyle={styles.bloodBubble}
                    delay={600}
                  />
                  
                  {/* Time Volunteering */}
                  <FloatingBubble
                    icon="⏰"
                    value="500"
                    label="שעות התנדבות"
                    bubbleStyle={styles.timeBubble}
                    delay={800}
                  />
                  
                  {/* Transportation */}
                  <FloatingBubble
                    icon="🚗"
                    value="1.8K"
                    label="טרמפים"
                    bubbleStyle={styles.transportBubble}
                    delay={1000}
                  />
                  
                  {/* Education */}
                  <FloatingBubble
                    icon="📚"
                    value="67"
                    label="קורסים"
                    bubbleStyle={styles.educationBubble}
                    delay={1200}
                  />
                  
                  {/* Environment */}
                  <FloatingBubble
                    icon="🌳"
                    value="750"
                    label="עצים ניטעו"
                    bubbleStyle={styles.environmentBubble}
                    delay={1400}
                  />
                  
                  {/* Animals */}
                  <FloatingBubble
                    icon="🐕"
                    value="120"
                    label="חיות אומצו"
                    bubbleStyle={styles.animalsBubble}
                    delay={1600}
                  />
                  
                  {/* Events */}
                  <FloatingBubble
                    icon="🎉"
                    value="78"
                    label="אירועים"
                    bubbleStyle={styles.eventsBubble}
                    delay={1800}
                  />
                  
                  {/* Recycling */}
                  <FloatingBubble
                    icon="♻️"
                    value="900"
                    label="שקיות מיחזור"
                    bubbleStyle={styles.recyclingBubble}
                    delay={2000}
                  />
                  
                  {/* Culture */}
                  <FloatingBubble
                    icon="🎭"
                    value="60"
                    label="אירועי תרבות"
                    bubbleStyle={styles.cultureBubble}
                    delay={2200}
                  />
                  
                  {/* Health */}
                  <FloatingBubble
                    icon="🏥"
                    value="45"
                    label="ביקורי רופא"
                    bubbleStyle={styles.healthBubble}
                    delay={2400}
                  />
                  
                  {/* Elderly Care */}
                  <FloatingBubble
                    icon="👴"
                    value="89"
                    label="קשישים נתמכים"
                    bubbleStyle={styles.elderlyBubble}
                    delay={2600}
                  />
                  
                  {/* Children */}
                  <FloatingBubble
                    icon="👶"
                    value="156"
                    label="ילדים נתמכים"
                    bubbleStyle={styles.childrenBubble}
                    delay={2800}
                  />
                  
                  {/* Sports */}
                  <FloatingBubble
                    icon="⚽"
                    value="23"
                    label="קבוצות ספורט"
                    bubbleStyle={styles.sportsBubble}
                    delay={3000}
                  />
                  
                  {/* Music */}
                  <FloatingBubble
                    icon="🎵"
                    value="34"
                    label="שיעורי מוזיקה"
                    bubbleStyle={styles.musicBubble}
                    delay={3200}
                  />
                  
                  {/* Art */}
                  <FloatingBubble
                    icon="🎨"
                    value="45"
                    label="סדנאות יצירה"
                    bubbleStyle={styles.artBubble}
                    delay={3400}
                  />
                  
                  {/* Technology */}
                  <FloatingBubble
                    icon="💻"
                    value="28"
                    label="שיעורי מחשב"
                    bubbleStyle={styles.techBubble}
                    delay={3600}
                  />
                  
                  {/* Gardening */}
                  <FloatingBubble
                    icon="🌱"
                    value="9"
                    label="גינות קהילתיות"
                    bubbleStyle={styles.gardenBubble}
                    delay={3800}
                  />
                  
                  {/* Leadership */}
                  <FloatingBubble
                    icon="👑"
                    value="8"
                    label="הנהגות קהילתיות"
                    bubbleStyle={styles.leadershipBubble}
                    delay={4000}
                  />
                </View>
              </View>
            </View>
          ) : (
            // מצב קהילתי - רק בועות סטטיסטיקות
            <View style={styles.communityModeContainer}>
              <BubbleComp />
            </View>
          )}
          </ScrollView>
          
          {/* Toggle Button */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, isPersonalMode && styles.toggleButtonActive]}
              onPress={() => setIsPersonalMode(!isPersonalMode)}
            >
              <Ionicons 
                name="person" 
                size={18} 
                color={isPersonalMode ? colors.backgroundPrimary : colors.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, !isPersonalMode && styles.toggleButtonActive]}
              onPress={() => setIsPersonalMode(!isPersonalMode)}
            >
              <Ionicons 
                name="people" 
                size={18} 
                color={!isPersonalMode ? colors.backgroundPrimary : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
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
    paddingTop: 50,
    paddingBottom: 20,
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
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
     backgroundColor: '#E3F2FD', // כחול בהיר מאוד
     padding: 15,
     borderRadius: 50, // עגול לחלוטין
     alignItems: 'center',
     flex: 1,
     marginHorizontal: 5,
     shadowColor: colors.shadowLight,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.15,
     shadowRadius: 4,
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
     color: '#1976D2', // כחול כהה יותר לקריאות טובה
     marginBottom: 2,
   },
   statName: {
     fontSize: FontSizes.caption,
     color: '#1565C0', // כחול כהה יותר לקריאות טובה
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  panelHandle: {
    height: 6,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  // סטיילים חדשים למסך הפוסטים וגלילה
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
  // סטיילים לכפתור הטוגל
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
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
  // סטיילים למצב קהילתי
  communityModeContainer: {
    flex: 1,
    paddingTop: 20,
    minHeight: 800, // גובה מינימלי כדי לאפשר גלילה
  },
  communityModeTitle: {
    fontSize: FontSizes.heading2,
  },
  // סטיילים לאינדיקטור יוזר נבחר
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
  // סטייל למיכל הבית
  homeContainer: {
    flex: 1,
    position: 'relative',
  },
  // סטייל למצב אישי
  personalModeContainer: {
    flex: 1,
  },
  // סטייל לתוכן הגלילה
  scrollContent: {
    paddingBottom: 100, // מרווח בתחתית כדי לאפשר גלילה
  },
  // סטיילים לסטטיסטיקות אישיות
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
     backgroundColor: '#E3F2FD', // כחול בהיר מאוד
     padding: 15,
     borderRadius: 50, // עגול לחלוטין
     alignItems: 'center',
     flex: 1,
     marginHorizontal: 5,
     marginBottom: 10,
     shadowColor: colors.shadowLight,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.15,
     shadowRadius: 4,
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
     color: '#1976D2', // כחול כהה יותר לקריאות טובה
     marginBottom: 2,
   },
   personalStatName: {
     fontSize: FontSizes.caption,
     color: '#1565C0', // כחול כהה יותר לקריאות טובה
     textAlign: 'center',
     fontWeight: '500',
   },
  // סטיילים לסטטיסטיקות קהילתיות צפות
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
     backgroundColor: '#E3F2FD', // כחול בהיר מאוד
     padding: 15,
     borderRadius: 50, // עגול לחלוטין
     alignItems: 'center',
     marginHorizontal: 5,
     marginBottom: 10,
     shadowColor: colors.shadowLight,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.15,
     shadowRadius: 4,
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
     color: '#1976D2', // כחול כהה יותר לקריאות טובה
     marginBottom: 2,
   },
   bubbleLabel: {
     fontSize: FontSizes.caption,
     color: '#1565C0', // כחול כהה יותר לקריאות טובה
     textAlign: 'center',
     fontWeight: '500',
   },
     // סטיילים לסוגי תרומות ספציפיות
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
   guestModeNotice: {
     backgroundColor: colors.warningLight,
     borderColor: colors.warning,
     borderWidth: 1,
     borderRadius: 8,
     padding: 12,
     marginHorizontal: 20,
     marginBottom: 15,
     flexDirection: 'row',
     alignItems: 'center',
   },
   guestModeText: {
     color: colors.warning,
     fontSize: FontSizes.small,
     fontWeight: '600',
     marginLeft: 8,
     flex: 1,
   },
 });
