import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { users } from '../globals/fakeData';
import { allUsers } from '../globals/characterTypes';
import { useUser, User } from '../context/UserContext';

interface UsersScreenProps {
  onUserSelect?: (user: User) => void;
  selectedUserId?: string;
}

const UsersScreen: React.FC<UsersScreenProps> = ({ onUserSelect, selectedUserId }) => {
  const navigation = useNavigation();
  const { selectedUser: contextSelectedUser, setSelectedUser } = useUser();
  const [localSelectedUser, setLocalSelectedUser] = useState<string | undefined>(selectedUserId || contextSelectedUser?.id);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('👥 UsersScreen - Screen focused, refreshing users...');
      loadUsers();
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Use the existing allUsers from characterTypes
      setUsers(allUsers);
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לטעון את המשתמשים.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setLocalSelectedUser(user.id);
    setSelectedUser(user);
    onUserSelect?.(user);
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = localSelectedUser === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => handleUserSelect(item)}
      >
        <View style={styles.userHeader}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userLocation}>{item.location.city}</Text>
          </View>
          <View style={styles.userStatus}>
            <View style={[styles.statusDot, item.isActive && styles.activeDot]} />
            <Text style={styles.karmaPoints}>{item.karmaPoints} נקודות</Text>
          </View>
        </View>
        
        <Text style={styles.userBio} numberOfLines={2}>
          {item.bio}
        </Text>
        
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.postsCount}</Text>
            <Text style={styles.statLabel}>פוסטים</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.followersCount}</Text>
            <Text style={styles.statLabel}>עוקבים</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.followingCount}</Text>
            <Text style={styles.statLabel}>עוקב אחרי</Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={styles.selectedText}>נבחר</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>בחר יוזר</Text>
        <Text style={styles.subtitle}>בחר יוזר כדי לראות את האפליקציה מנקודת המבט שלו</Text>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  userItem: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectedUserItem: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.offWhite,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userLocation: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
    marginBottom: 4,
  },
  activeDot: {
    backgroundColor: colors.accent,
  },
  karmaPoints: {
    fontSize: FontSizes.small,
    color: colors.primary,
    fontWeight: '500',
  },
  userBio: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
  selectedText: {
    fontSize: FontSizes.small,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default UsersScreen; 