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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, NavigationProp, ParamListBase } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { allUsers, CharacterType } from '../globals/characterTypes';
import { 
  getFollowSuggestions, 
  getPopularUsers,
  followUser, 
  unfollowUser,
  getFollowStats 
} from '../utils/followService';
import { useUser } from '../context/UserContext';

export default function DiscoverPeopleScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { selectedUser } = useUser();
  const [suggestions, setSuggestions] = useState<CharacterType[]>([]);
  const [popularUsers, setPopularUsers] = useState<CharacterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'popular'>('suggestions');
  const [refreshKey, setRefreshKey] = useState(0);
  const [followStats, setFollowStats] = useState<Record<string, { isFollowing: boolean }>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 DiscoverPeopleScreen - Screen focused, refreshing data...');
      loadUsers();
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (selectedUser) {
        const userSuggestions = await getFollowSuggestions(selectedUser.id, 20);
        setSuggestions(userSuggestions);
      } else {
        setSuggestions(allUsers.slice(0, 20));
      }
      
      const popular = await getPopularUsers(20);
      setPopularUsers(popular);
      
      // Load follow stats for all users
      const allUsersToCheck = [...suggestions, ...popular];
      const stats: Record<string, { isFollowing: boolean }> = {};
      
      for (const user of allUsersToCheck) {
        if (selectedUser) {
          const userStats = await getFollowStats(user.id, selectedUser.id);
          stats[user.id] = { isFollowing: userStats.isFollowing };
        }
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

  const renderUserItem = ({ item }: { item: CharacterType }) => {
    const currentStats = followStats[item.id] || { isFollowing: false };
    const isCurrentUser = selectedUser?.id === item.id;

    return (
      <View style={styles.userItem}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => {
            navigation.navigate('UserProfileScreen' as any, {
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
              {item.roles.slice(0, 2).map((role, index) => (
                <View key={index} style={styles.roleTag}>
                  <Text style={styles.roleText}>{role}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {!isCurrentUser && (
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>אין המלצות כרגע</Text>
      <Text style={styles.emptyStateSubtitle}>
        נסה שוב מאוחר יותר או חפש משתמשים ספציפיים
      </Text>
    </View>
  );

  const currentData = activeTab === 'suggestions' ? suggestions : popularUsers;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>גלה אנשים</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Users List */}
      <FlatList
        data={currentData}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={loadUsers}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
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
  listContainer: {
    flexGrow: 1,
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