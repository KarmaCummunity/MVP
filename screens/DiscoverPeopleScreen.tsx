// File overview:
// - Purpose: Discover/suggest people to follow and view popular users; follow/unfollow inline.
// - Reached from: Profile actions and navigation routes as 'DiscoverPeopleScreen'.
// - Provides: Two tabs (suggestions/popular), list items navigate to 'UserProfileScreen'.
// - Reads from context: `useUser()` -> `selectedUser`, `isRealAuth` controls demo data fallbacks.
// - External deps/services: `followService` (suggestions/popular/follow/unfollow/stats).
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, NavigationProp, ParamListBase } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { UserPreview as CharacterType } from '../globals/types';
import {
  getFollowSuggestions,
  getPopularUsers,
  followUser,
  unfollowUser,
  getFollowStats
} from '../utils/followService';
import { createConversation, conversationExists } from '../utils/chatService';
import { useUser } from '../stores/userStore';
import apiService from '../utils/apiService';

import { getScreenInfo, isLandscape } from '../globals/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverPeopleScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { isTablet, isDesktop } = getScreenInfo();
  const landscape = isLandscape();
  const estimatedTabBarHeight = landscape ? 40 : (isDesktop ? 56 : isTablet ? 54 : 46);
  const bottomPadding = (Platform.OS === 'web' ? estimatedTabBarHeight : 0) + 24;
  const { selectedUser, isRealAuth } = useUser();
  const [suggestions, setSuggestions] = useState<CharacterType[]>([]);
  const [popularUsers, setPopularUsers] = useState<CharacterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'popular'>('suggestions');
  const [followStats, setFollowStats] = useState<Record<string, { isFollowing: boolean }>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 DiscoverPeopleScreen - Screen focused, refreshing data...');
      loadUsers();
    }, [])
  );

  // Helper function to check if a user is the current user
  const isCurrentUserCheck = useCallback((
    userId: string,
    userEmail: string | undefined,
    currentUserId: string,
    currentUserEmail: string
  ): boolean => {
    const normalizedUserId = String(userId || '').trim().toLowerCase();
    const normalizedUserEmail = userEmail ? String(userEmail).trim().toLowerCase() : '';

    return normalizedUserId === currentUserId ||
      (currentUserEmail && normalizedUserEmail === currentUserEmail) ||
      normalizedUserId === '';
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (!selectedUser) {
        setSuggestions([]);
        setPopularUsers([]);
        setLoading(false);
        return;
      }

      const currentUserId = String(selectedUser.id).trim().toLowerCase();
      const currentUserEmail = selectedUser.email ? String(selectedUser.email).trim().toLowerCase() : '';

      console.log('🔍 DiscoverPeopleScreen - Filtering users. Current user ID:', currentUserId, 'Email:', currentUserEmail);

      let filteredSuggestions: any[] = [];
      // Get ALL users (no limit) - use high limit to get all users from database
      const userSuggestions = await getFollowSuggestions(currentUserId, 1000, currentUserEmail);
      // Filter out current user from suggestions - check both ID and email
      filteredSuggestions = (userSuggestions as any[]).filter((user) => {
        const isCurrentUser = isCurrentUserCheck(user.id, user.email, currentUserId, currentUserEmail);

        if (isCurrentUser) {
          console.log('🚫 Filtered out current user from suggestions:', {
            userId: user.id,
            userEmail: user.email,
            name: user.name
          });
        }

        return !isCurrentUser;
      });
      setSuggestions(filteredSuggestions);

      // Get popular users excluding current user - get ALL users (no limit)
      const popular = await getPopularUsers(1000, currentUserId, currentUserEmail);
      // Additional filter as safety measure - check both ID and email
      const filteredPopular = (popular as any[]).filter((user) => {
        const isCurrentUser = isCurrentUserCheck(user.id, user.email, currentUserId, currentUserEmail);

        if (isCurrentUser) {
          console.log('🚫 Filtered out current user from popular:', {
            userId: user.id,
            userEmail: user.email,
            name: user.name
          });
        }

        return !isCurrentUser;
      });
      setPopularUsers(filteredPopular);

      // Get total users count from server
      let totalUsersInDatabase = 0;
      try {
        const summaryResponse = await apiService.getUsersSummary();
        if (summaryResponse && summaryResponse.success && summaryResponse.data) {
          totalUsersInDatabase = parseInt(summaryResponse.data.total_users || '0', 10);
        }
      } catch (error) {
        console.error('❌ Error fetching users summary:', error);
        // Try to get count from the actual response
        try {
          const allUsersResponse = await apiService.getUsers({ limit: 1000, offset: 0 });
          if (allUsersResponse && allUsersResponse.success && allUsersResponse.data) {
            totalUsersInDatabase = (allUsersResponse.data as any[]).length;
          }
        } catch (fallbackError) {
          console.error('❌ Error fetching all users as fallback:', fallbackError);
        }
      }

      // Log total users found - ALWAYS log this, even if summary failed
      const totalUsersFound = filteredSuggestions.length + filteredPopular.length;
      const uniqueUsersCount = new Set([...filteredSuggestions.map(u => u.id), ...filteredPopular.map(u => u.id)]).size;
      console.log('👥 DiscoverPeopleScreen - ספירת משתמשים:', {
        סך_כול_יוזרים_במסד_נתונים: totalUsersInDatabase || 'לא זמין',
        המלצות: filteredSuggestions.length,
        פופולריים: filteredPopular.length,
        סך_כול_נטענו: totalUsersFound,
        משתמשים_ייחודיים: uniqueUsersCount
      });

      // Load follow stats for all users (use filtered lists)
      const allUsersToCheck = [...filteredSuggestions, ...filteredPopular];
      const stats: Record<string, { isFollowing: boolean }> = {};

      for (const user of allUsersToCheck) {
        const userStats = await getFollowStats(user.id, currentUserId);
        stats[user.id] = { isFollowing: userStats.isFollowing };
      }

      setFollowStats(stats);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת המשתמשים');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש להתחבר תחילה');
      return;
    }

    try {
      const currentStats = followStats[targetUserId] || { isFollowing: false };

      if (currentStats.isFollowing) {
        const success = await unfollowUser(selectedUser.id, targetUserId);
        if (success) {
          setFollowStats(prev => ({
            ...prev,
            [targetUserId]: { isFollowing: false }
          }));
          Alert.alert('ביטול עקיבה', 'ביטלת את העקיבה בהצלחה');
        }
      } else {
        const success = await followUser(selectedUser.id, targetUserId);
        if (success) {
          setFollowStats(prev => ({
            ...prev,
            [targetUserId]: { isFollowing: true }
          }));
          Alert.alert('עקיבה', 'התחלת לעקוב בהצלחה');
        }
      }
    } catch (error) {
      console.error('❌ Follow toggle error:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בביצוע הפעולה');
    }
  };

  const handleMessage = async (targetUser: CharacterType) => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש להתחבר תחילה');
      return;
    }

    try {
      const existingConvId = await conversationExists(selectedUser.id, targetUser.id);
      let conversationId: string;

      if (existingConvId) {
        console.log('💬 Conversation already exists:', existingConvId);
        conversationId = existingConvId;
      } else {
        console.log('💬 Creating new conversation...');
        conversationId = await createConversation([selectedUser.id, targetUser.id]);
      }

      navigation.navigate('ChatDetailScreen', {
        conversationId,
        otherUserId: targetUser.id,
        userName: targetUser.name || 'ללא שם',
        userAvatar: targetUser.avatar || 'https://i.pravatar.cc/150?img=1',
      });
    } catch (error) {
      console.error('❌ Create chat error:', error);
      Alert.alert('שגיאה', 'שגיאה ביצירת השיחה');
    }
  };

  const renderUserItem = ({ item }: { item: CharacterType }) => {
    const currentStats = followStats[item.id] || { isFollowing: false };
    const isCurrentUser = selectedUser?.id === item.id;

    return (
      <View style={styles.userItem}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => {
            navigation.navigate('UserProfileScreen', {
              userId: item.id,
              userName: item.name,
              characterData: item
            });
          }}
        >
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <View style={styles.userHeader}>
              <Text style={styles.userName}>{item.name}</Text>
              {item.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.info} />
              )}
            </View>
            <Text style={styles.userBio} numberOfLines={2}>
              {item.bio}
            </Text>
            <View style={styles.userStats}>
              <Text style={styles.statText}>
                {item.karmaPoints} נקודות קארמה
              </Text>
              <Text style={styles.statText}>
                {item.completedTasks} משימות הושלמו
              </Text>
            </View>
            <View style={styles.rolesContainer}>
              {(item.roles ?? []).slice(0, 2).map((role, index) => (
                <View key={index} style={styles.roleTag}>
                  <Text style={styles.roleText}>{role}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {!isCurrentUser && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.followButton,
                currentStats.isFollowing && styles.followingButton
              ]}
              onPress={() => handleFollowToggle(item.id)}
            >
              <Text style={[
                styles.followButtonText,
                currentStats.isFollowing && styles.followingButtonText
              ]}>
                {currentStats.isFollowing ? 'עוקב' : 'עקוב'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => handleMessage(item)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.textPrimary} />
              <Text style={styles.messageButtonText}>הודעה</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'suggestions' && styles.activeTabButton
        ]}
        onPress={() => setActiveTab('suggestions')}
      >
        <Text style={[
          styles.tabButtonText,
          activeTab === 'suggestions' && styles.activeTabButtonText
        ]}>
          המלצות
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'popular' && styles.activeTabButton
        ]}
        onPress={() => setActiveTab('popular')}
      >
        <Text style={[
          styles.tabButtonText,
          activeTab === 'popular' && styles.activeTabButtonText
        ]}>
          פופולריים
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>
      {renderTabBar()}
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>אין המלצות כרגע</Text>
      <Text style={styles.emptyStateSubtitle}>
        נסה שוב מאוחר יותר או חפש משתמשים ספציפיים
      </Text>
    </View>
  );

  // Data is already filtered in loadUsers, no need to filter again
  const currentData = activeTab === 'suggestions' ? suggestions : popularUsers;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={currentData}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={true}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={loadUsers}
        style={styles.flatList}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={21}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  flatList: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: 16,
    marginVertical: 12,
    minWidth: 200,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: colors.pink,
  },
  tabButtonText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 4,
  },
  userBio: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 16,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  statText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  roleTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: FontSizes.small,
    color: colors.primary,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    backgroundColor: colors.pink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.white,
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.textPrimary,
  },
  messageButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageButtonText: {
    color: colors.textPrimary,
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 