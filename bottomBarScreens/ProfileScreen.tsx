// screens/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import type { SceneRendererProps, NavigationState } from 'react-native-tab-view';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { currentUser, tasks, donations, communityEvents } from '../globals/fakeData';
import { useUser } from '../context/UserContext';

// --- Type Definitions ---
type TabRoute = {
  key: string;
  title: string;
};

// --- Tab Components ---
const PostsRoute = () => (
  <ScrollView contentContainerStyle={styles.tabContentContainer}>
    <View style={styles.postsGrid}>
      {Array.from({ length: 12 }).map((_, i) => (
        <TouchableOpacity
          key={i}
          style={styles.postContainer}
          onPress={() => Alert.alert('פוסט', `פוסט מספר ${i + 1}`)}
        >
          <Image
            source={{ uri: `https://picsum.photos/300/300?random=${i}` }}
            style={styles.postImage}
          />
          <View style={styles.postOverlay}>
            <View style={styles.postStats}>
              <Ionicons name="heart" size={16} color={colors.white} />
              <Text style={styles.postStatsText}>{Math.floor(Math.random() * 100) + 10}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

const ReelsRoute = () => (
  <View style={styles.tabContentPlaceholder}>
    <Ionicons name="videocam-outline" size={60} color={colors.textSecondary} />
    <Text style={styles.placeholderText}>אין סרטוני רילס עדיין</Text>
    <Text style={styles.placeholderSubtext}>צור רילס ראשון כדי לשתף עם הקהילה</Text>
    <TouchableOpacity style={styles.createButton}>
      <Ionicons name="add" size={20} color={colors.white} />
      <Text style={styles.createButtonText}>צור רילס</Text>
    </TouchableOpacity>
  </View>
);

const TaggedRoute = () => (
  <View style={styles.tabContentPlaceholder}>
    <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
    <Text style={styles.placeholderText}>אין תיוגים עדיין</Text>
    <Text style={styles.placeholderSubtext}>כאשר אנשים יתייגו אותך, זה יופיע כאן</Text>
  </View>
);

// --- Main Component ---
export default function ProfileScreen() {
  const { selectedUser } = useUser();
  const [index, setIndex] = useState(0);
  const [routes] = useState<TabRoute[]>([
    { key: 'posts', title: 'פוסטים' },
    { key: 'reels', title: 'רילס' },
    { key: 'tagged', title: 'תיוגים' },
  ]);

  const renderScene = SceneMap({
    posts: PostsRoute,
    reels: ReelsRoute,
    tagged: TaggedRoute,
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabBarIndicator}
      style={styles.tabBar}
      activeColor={colors.pink}
      inactiveColor={colors.textSecondary}
      pressColor={colors.backgroundSecondary}
      renderTabBarItem={({ route, key }) => {
        const routeIndex = props.navigationState.routes.findIndex(r => r.key === route.key);
        const isFocused = props.navigationState.index === routeIndex;

        return (
          <TouchableOpacity
            key={key}
            style={styles.tabBarItem}
            onPress={() => props.jumpTo(route.key)}
          >
            <Text
              style={[
                styles.tabBarText,
                { 
                  color: isFocused ? colors.pink : colors.textSecondary,
                  fontWeight: isFocused ? 'bold' : 'normal',
                }
              ]}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  // User Statistics
  const userStats = {
    posts: 24,
    followers: 156,
    following: 89,
    karmaPoints: currentUser.karmaPoints,
    completedTasks: currentUser.completedTasks,
    totalDonations: currentUser.totalDonations,
  };

  // Recent Activities
  const recentActivities = [
    {
      id: '1',
      type: 'task',
      title: 'השלמת משימה: איסוף מזון',
      time: 'לפני שעה',
      icon: 'checkmark-circle',
      color: colors.success
    },
    {
      id: '2',
      type: 'donation',
      title: 'תרמת 200 ₪ לקניית ציוד',
      time: 'לפני 3 שעות',
      icon: 'heart',
      color: colors.error
    },
    {
      id: '3',
      type: 'event',
      title: 'הצטרפת לאירוע: יום קהילה',
      time: 'לפני יום',
      icon: 'calendar',
      color: colors.info
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => Alert.alert('תפריט', 'פתיחת תפריט')}
          >
            <Ionicons name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.username}>{selectedUser?.name || currentUser.name}</Text>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => Alert.alert('הוסף', 'הוספת תוכן חדש')}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: selectedUser?.avatar || currentUser.avatar }}
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{selectedUser?.postsCount || userStats.posts}</Text>
              <Text style={styles.statLabel}>פוסטים</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{selectedUser?.followersCount || userStats.followers}</Text>
              <Text style={styles.statLabel}>עוקבים</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{selectedUser?.followingCount || userStats.following}</Text>
              <Text style={styles.statLabel}>עוקב/ת</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.fullName}>{selectedUser?.name || currentUser.name}</Text>
          <Text style={styles.bioText}>{selectedUser?.bio || currentUser.bio}</Text>
          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            {' '}{selectedUser?.location.city || currentUser.location}
          </Text>
          
          {/* Karma Points */}
          <View style={styles.karmaSection}>
            <View style={styles.karmaCard}>
              <Ionicons name="star" size={20} color={colors.warning} />
              <Text style={styles.karmaText}>{selectedUser?.karmaPoints || userStats.karmaPoints} נקודות קארמה</Text>
            </View>
          </View>

          {/* Activity Icons */}
          <View style={styles.activityIcons}>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert('פעילות', 'צפייה בפעילות שלך')}
            >
              <Ionicons name="star-outline" size={24} color={colors.pink} />
              <Text style={styles.activityIconText}>פעילות</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert('היסטוריה', 'היסטוריית פעילות')}
            >
              <MaterialCommunityIcons name="history" size={24} color={colors.pink} />
              <Text style={styles.activityIconText}>היסטוריה</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityIconItem}
              onPress={() => Alert.alert('מועדפים', 'המועדפים שלך')}
            >
              <Ionicons name="heart-outline" size={24} color={colors.pink} />
              <Text style={styles.activityIconText}>מועדפים</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.discoverPeopleButton}
            onPress={() => Alert.alert('גילוי אנשים', 'מציאת אנשים חדשים')}
          >
            <Ionicons name="person-add-outline" size={18} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('שתף פרופיל', 'שיתוף הפרופיל שלך')}
          >
            <Text style={styles.actionButtonText}>שתף פרופיל</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('ערוך פרופיל', 'עריכת פרטי הפרופיל')}
          >
            <Text style={styles.actionButtonText}>ערוך פרופיל</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>פעילות אחרונה</Text>
          {recentActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => Alert.alert(activity.title, activity.time)}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Ionicons name={activity.icon as any} size={16} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Story Highlights */}
        <View style={styles.highlightsSection}>
          <Text style={styles.sectionTitle}>היילייטים</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyHighlightsContentContainer}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.storyHighlightItem}
                onPress={() => Alert.alert('היילייט', `היילייט ${i + 1}`)}
              >
                <View style={styles.storyHighlightCircle}>
                  {i === 0 ? (
                    <Ionicons name="add" size={24} color={colors.pink} />
                  ) : (
                    <Image
                      source={{ uri: `https://picsum.photos/60/60?random=${i + 10}` }}
                      style={styles.highlightImage}
                    />
                  )}
                </View>
                <Text style={styles.storyHighlightText}>
                  {i === 0 ? 'חדש' : `היילייט ${i}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab View */}
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.backgroundPrimary 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  username: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerIcon: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.pink,
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statItem: { 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: FontSizes.medium, 
    fontWeight: 'bold', 
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: { 
    fontSize: FontSizes.small, 
    color: colors.textSecondary,
  },
  bioSection: { 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  fullName: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bioText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  karmaSection: {
    marginBottom: 15,
  },
  karmaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  karmaText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  activityIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  activityIconItem: { 
    alignItems: 'center',
    padding: 10,
  },
  activityIconText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: FontSizes.body,
    color: colors.textPrimary,
  },
  discoverPeopleButton: {
    backgroundColor: colors.pink,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 5,
  },
  activitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  highlightsSection: {
    marginBottom: 20,
  },
  storyHighlightsContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  storyHighlightItem: { 
    alignItems: 'center', 
    marginHorizontal: 8 
  },
  storyHighlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginBottom: 8,
  },
  highlightImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  storyHighlightText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBarIndicator: {
    backgroundColor: colors.pink,
    height: 2,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabBarText: {
    fontSize: FontSizes.body,
    paddingVertical: 12,
  },
  tabContentContainer: { 
    minHeight: 400 
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  postContainer: {
    width: Dimensions.get('window').width / 3 - 2,
    height: Dimensions.get('window').width / 3 - 2,
    margin: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  postOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  postStatsText: {
    color: colors.white,
    fontSize: FontSizes.small,
    marginLeft: 4,
  },
  tabContentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    padding: 20,
  },
  placeholderText: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 15,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.pink,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: 8,
  },
});
