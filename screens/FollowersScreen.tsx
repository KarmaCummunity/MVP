import React, { useState, useEffect } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { allUsers, CharacterType } from '../globals/characterTypes';
import { 
  getFollowers, 
  getFollowing, 
  followUser, 
  unfollowUser,
  getFollowStats 
} from '../utils/followService';
import { useUser } from '../context/UserContext';

type FollowersScreenRouteParams = {
  userId: string;
  type: 'followers' | 'following';
  title: string;
};

export default function FollowersScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, type, title } = route.params as FollowersScreenRouteParams;
  const { selectedUser } = useUser();
  const [users, setUsers] = useState<CharacterType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  const loadUsers = () => {
    setLoading(true);
    try {
      let userList: CharacterType[] = [];
      
      if (type === 'followers') {
        userList = getFollowers(userId);
      } else {
        userList = getFollowing(userId);
      }
      
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת המשתמשים');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = (targetUserId: string) => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש להתחבר תחילה');
      return;
    }

    const currentStats = getFollowStats(targetUserId, selectedUser.id);
    
    if (currentStats.isFollowing) {
      // ביטול עקיבה
      const success = unfollowUser(selectedUser.id, targetUserId);
      if (success) {
        Alert.alert('ביטול עקיבה', 'ביטלת את העקיבה בהצלחה');
        loadUsers(); // רענון הרשימה
      }
    } else {
      // התחלת עקיבה
      const success = followUser(selectedUser.id, targetUserId);
      if (success) {
        Alert.alert('עקיבה', 'התחלת לעקוב בהצלחה');
        loadUsers(); // רענון הרשימה
      }
    }
  };

  const renderUserItem = ({ item }: { item: CharacterType }) => {
    const currentStats = getFollowStats(item.id, selectedUser?.id || '');
    const isCurrentUser = selectedUser?.id === item.id;

    return (
      <View style={styles.userItem}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => {
            navigation.navigate('UserProfileScreen' as never, {
              userId: item.id,
              userName: item.name,
              characterData: item
            } as never);
          }}
        >
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={type === 'followers' ? 'people-outline' : 'person-add-outline'} 
        size={60} 
        color={colors.textSecondary} 
      />
      <Text style={styles.emptyStateTitle}>
        {type === 'followers' ? 'אין עוקבים עדיין' : 'לא עוקב אחרי אף אחד עדיין'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {type === 'followers' 
          ? 'כאשר אנשים יתחילו לעקוב אחריך, הם יופיעו כאן'
          : 'התחל לעקוב אחרי אנשים כדי לראות את הפעילות שלהם'
        }
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Users List */}
      <FlatList
        data={users}
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
  userName: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
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
  },
  statText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
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