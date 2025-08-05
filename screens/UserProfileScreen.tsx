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
import { Ionicons } from '@expo/vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import type { SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useRoute, useNavigation } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { users } from '../globals/fakeData';

// --- Type Definitions ---
type TabRoute = {
  key: string;
  title: string;
};

type UserProfileRouteParams = {
  userId: string;
  userName: string;
};

// --- Tab Components ---
const PostsRoute = () => (
  <ScrollView contentContainerStyle={styles.tabContentContainer}>
    <View style={styles.postsGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <TouchableOpacity
          key={i}
          style={styles.postContainer}
          onPress={() => Alert.alert('פוסט', `פוסט מספר ${i + 1}`)}
        >
          <Image
            source={{ uri: `https://picsum.photos/300/300?random=${i + 100}` }}
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
    <Text style={styles.placeholderSubtext}>המשתמש עדיין לא יצר רילס</Text>
  </View>
);

const TaggedRoute = () => (
  <View style={styles.tabContentPlaceholder}>
    <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
    <Text style={styles.placeholderText}>אין תיוגים עדיין</Text>
    <Text style={styles.placeholderSubtext}>כאשר אנשים יתייגו את המשתמש, זה יופיע כאן</Text>
  </View>
);

// --- Main Component ---
export default function UserProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, userName } = route.params as UserProfileRouteParams;
  
  const [index, setIndex] = useState(0);
  const [routes] = useState<TabRoute[]>([
    { key: 'posts', title: 'פוסטים' },
    { key: 'reels', title: 'רילס' },
    { key: 'tagged', title: 'תיוגים' },
  ]);

  // מציאת המשתמש לפי ID
  const user = users.find(u => u.id === userId);

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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
          <Text style={styles.errorText}>משתמש לא נמצא</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.username}>{user.name}</Text>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => Alert.alert('אפשרויות', 'פתיחת אפשרויות')}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.profilePicture}
          />
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.postsCount || 0}</Text>
              <Text style={styles.statLabel}>פוסטים</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.followersCount || 0}</Text>
              <Text style={styles.statLabel}>עוקבים</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.followingCount || 0}</Text>
              <Text style={styles.statLabel}>עוקב אחרי</Text>
            </View>
          </View>
        </View>

        {/* User Details */}
        <View style={styles.userDetails}>
          <Text style={styles.displayName}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            {' '}{user.location.city}, {user.location.country}
          </Text>
          <Text style={styles.joinDate}>
            הצטרף ב-{new Date(user.joinDate).toLocaleDateString('he-IL')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.followButton}
            onPress={() => Alert.alert('עקיבה', 'התחלת לעקוב אחרי המשתמש')}
          >
            <Text style={styles.followButtonText}>עקוב</Text>
          </TouchableOpacity>
          
                     <TouchableOpacity 
             style={styles.messageButton}
             onPress={() => {
               // ניווט לצ'אט עם המשתמש
               (navigation as any).navigate('ChatDetailScreen', {
                 conversationId: `conv_${userId}`,
                 otherUserId: userId,
                 otherUserName: user.name,
               });
             }}
           >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.messageButtonText}>הודעה</Text>
          </TouchableOpacity>
        </View>

        {/* Karma Points */}
        <View style={styles.karmaSection}>
          <View style={styles.karmaItem}>
            <Ionicons name="star" size={20} color={colors.orange} />
            <Text style={styles.karmaText}>נקודות קארמה: {user.karmaPoints}</Text>
          </View>
        </View>

        {/* Tab View */}
        <View style={styles.tabViewContainer}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={renderTabBar}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    padding: 8,
  },
  username: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
  userDetails: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  displayName: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bio: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  location: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  followButton: {
    flex: 1,
    backgroundColor: colors.pink,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: colors.textPrimary,
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginLeft: 8,
  },
  karmaSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  karmaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  karmaText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  tabViewContainer: {
    flex: 1,
    minHeight: 400,
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
  },
}); 