// screens/NotificationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  NotificationData,
  getUnreadNotificationCount,
  getNotificationSettings,
  updateNotificationSettings,
} from '../utils/notificationService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { Ionicons as Icon } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { selectedUser } = useUser();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  console.log('🔔 NotificationsScreen - Component rendered, selectedUser:', selectedUser?.name || 'null');

  // טעינת התראות
  const loadNotifications = useCallback(async () => {
    console.log('🔔 NotificationsScreen - loadNotifications - selectedUser:', selectedUser?.name || 'null');
    
    if (!selectedUser) {
      console.log('🔔 NotificationsScreen - No selected user, cannot load notifications');
      return;
    }

    try {
      const userNotifications = await getNotifications(selectedUser.id);
      setNotifications(userNotifications);
      
      const count = await getUnreadNotificationCount(selectedUser.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Load notifications error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת ההתראות');
    }
  }, [selectedUser]);

  // רענון נתונים כשהמסך מתמקד
  useFocusEffect(
    useCallback(() => {
      console.log('🔔 NotificationsScreen - Screen focused, loading notifications...');
      console.log('🔔 NotificationsScreen - selectedUser in useFocusEffect:', selectedUser?.name || 'null');
      loadNotifications();
    }, [loadNotifications, selectedUser])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications().finally(() => setRefreshing(false));
  }, [loadNotifications]);

  // סימון התראה כנקראה
  const handleMarkAsRead = async (notificationId: string) => {
    if (!selectedUser) return;

    try {
      await markNotificationAsRead(notificationId, selectedUser.id);
      await loadNotifications(); // רענון הנתונים
    } catch (error) {
      console.error('❌ Mark as read error:', error);
    }
  };

  // סימון כל ההתראות כנקראו
  const handleMarkAllAsRead = async () => {
    if (!selectedUser) return;

    try {
      await markAllNotificationsAsRead(selectedUser.id);
      await loadNotifications(); // רענון הנתונים
      Alert.alert('הושלם', 'כל ההתראות סומנו כנקראו');
    } catch (error) {
      console.error('❌ Mark all as read error:', error);
      Alert.alert('שגיאה', 'שגיאה בסימון ההתראות');
    }
  };

  // מחיקת התראה
  const handleDeleteNotification = async (notificationId: string) => {
    if (!selectedUser) return;

    try {
      await deleteNotification(notificationId, selectedUser.id);
      await loadNotifications(); // רענון הנתונים
    } catch (error) {
      console.error('❌ Delete notification error:', error);
    }
  };

  // מחיקת כל ההתראות
  const handleClearAllNotifications = async () => {
    if (!selectedUser) return;

    Alert.alert(
      'מחיקת כל ההתראות',
      'האם אתה בטוח שברצונך למחוק את כל ההתראות?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllNotifications(selectedUser.id);
              await loadNotifications(); // רענון הנתונים
              Alert.alert('הושלם', 'כל ההתראות נמחקו');
            } catch (error) {
              console.error('❌ Clear all notifications error:', error);
              Alert.alert('שגיאה', 'שגיאה במחיקת ההתראות');
            }
          },
        },
      ]
    );
  };

  // קבלת אייקון לפי סוג התראה
  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'message':
        return 'chatbubble-outline';
      case 'follow':
        return 'person-add-outline';
      case 'like':
        return 'heart-outline';
      case 'comment':
        return 'chatbubble-ellipses-outline';
      case 'system':
        return 'notifications-outline';
      default:
        return 'notifications-outline';
    }
  };

  // קבלת צבע לפי סוג התראה
  const getNotificationColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'message':
        return colors.primary;
      case 'follow':
        return colors.success;
      case 'like':
        return colors.error;
      case 'comment':
        return colors.warning;
      case 'system':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  // פורמט זמן
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'עכשיו';
    } else if (diffMinutes < 60) {
      return `לפני ${diffMinutes} דקות`;
    } else if (diffHours < 24) {
      return `לפני ${diffHours} שעות`;
    } else if (diffDays < 7) {
      return `לפני ${diffDays} ימים`;
    } else {
      return date.toLocaleDateString('he-IL');
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIconContainer}>
          <Icon
            name={getNotificationIcon(item.type)}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Icon name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-off-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>אין התראות</Text>
      <Text style={styles.emptyStateSubtitle}>
        כאשר תקבל התראות חדשות, הן יופיעו כאן
      </Text>
    </View>
  );

  return (
    <>
      <ScreenWrapper navigation={navigation} style={styles.safeArea}>
      {/* Additional header actions for notifications */}
      <View style={styles.additionalHeaderSection}>
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)} style={styles.headerButton}>
          <Icon name="settings-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerButton}>
            <Icon name="checkmark-done" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAllNotifications} style={styles.headerButton}>
            <Icon name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{unreadCount} התראות חדשות</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  additionalHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: FontSizes.caption,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    backgroundColor: colors.backgroundPrimary,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadNotification: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FontSizes.body,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.text,
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