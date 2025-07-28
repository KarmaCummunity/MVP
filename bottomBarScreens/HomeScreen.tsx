import React, { useState } from "react";
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
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_HEIGHT = SCREEN_HEIGHT - 50;
const CLOSED_POSITION = PANEL_HEIGHT - 60;
const OPEN_POSITION = 0;
const MID_POSITION = PANEL_HEIGHT / 2;

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const [showPosts, setShowPosts] = useState(false);
  const [isPersonalMode, setIsPersonalMode] = useState(true); // מצב אישי כברירת מחדל

  // ערכים מונפשים לגלילה
  const scrollY = useSharedValue(0);
  const postsTranslateY = useSharedValue(0);

  // איפוס מצב כאשר המסך מאבד פוקוס
  React.useEffect(() => {
    if (!isFocused) {
      setShowPosts(false);
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      setShowPosts(false);
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
    
    // סף נמוך מאוד - מגיב מהר
    const threshold = 20;
    
    // אם הגלילה עוברת את הסף, נפתח מסך הפוסטים
    if (offsetY > threshold && !showPosts) {
      setShowPosts(true);
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

  // Quick Actions
  const quickActions = [
    {
      id: 'create-task',
      title: 'צור משימה',
      icon: 'add-circle-outline',
      color: colors.pink,
      onPress: () => Alert.alert('יצירת משימה', 'פתיחת טופס יצירת משימה חדשה')
    },
    {
      id: 'donate',
      title: 'תרום',
      icon: 'heart-outline',
      color: colors.error,
      onPress: () => Alert.alert('תרומה', 'פתיחת טופס תרומה')
    },
    {
      id: 'join-event',
      title: 'הצטרף לאירוע',
      icon: 'calendar-outline',
      color: colors.success,
      onPress: () => Alert.alert('הצטרפות לאירוע', 'בחירת אירוע להצטרפות')
    },
    {
      id: 'chat',
      title: 'צ\'אט',
      icon: 'chatbubbles-outline',
      color: colors.info,
      onPress: () => Alert.alert('צ\'אט', 'פתיחת רשימת צ\'אטים')
    }
  ];

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
          <PostsReelsScreen />
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
                {/* Header Section */}
                <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.userInfo}>
                    <Image 
                      source={{ uri: currentUser.avatar }} 
                      style={styles.userAvatar}
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.welcomeText}>שלום, {currentUser.name}!</Text>
                      <Text style={styles.karmaText}>קארמה: {currentUser.karmaPoints} נקודות</Text>
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

              {/* Quick Actions */}
              <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>פעולות מהירות</Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={styles.quickActionButton}
                      onPress={action.onPress}
                    >
                      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                        <Ionicons name={action.icon as any} size={24} color={action.color} />
                      </View>
                      <Text style={styles.quickActionText}>{action.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recent Activities */}
              <View style={styles.activitiesContainer}>
                <Text style={styles.sectionTitle}>פעילות אחרונה</Text>
                <View style={styles.activitiesScroll}>
                  {recentActivities.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      style={styles.activityCard}
                      onPress={() => Alert.alert(activity.title, activity.description)}
                    >
                      <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                        <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                      </View>
                      <Text style={styles.activityTitle} numberOfLines={2}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </TouchableOpacity>
                  ))}
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
    backgroundColor: colors.backgroundPrimary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    fontSize: FontSizes.heading1,
    marginBottom: 5,
  },
  statValue: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statName: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
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
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
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
});
