// File overview:
// - Purpose: Custom hook to track and update unread notification count
// - Reached from: TopBarNavigator and other components that need notification count
// - Provides: Real-time unread notification count with automatic updates
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../stores/userStore';
import { getUnreadNotificationCount, subscribeToNotificationEvents } from '../utils/notificationService';

/**
 * Hook that returns the current unread notification count and automatically updates
 * when notifications change (via event subscription and focus polling)
 */
export function useUnreadNotificationsCount(): number {
  const { selectedUser } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!selectedUser) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadNotificationCount(selectedUser.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Error loading unread notification count:', error);
      setUnreadCount(0);
    }
  }, [selectedUser]);

  // Load count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCount();

      // Subscribe to real-time notification events
      const unsubscribe = subscribeToNotificationEvents((notification) => {
        if (!selectedUser) return;
        if (notification.userId !== selectedUser.id) return;

        // Update count based on notification read status
        if (!notification.read) {
          setUnreadCount((prev) => prev + 1);
        } else {
          // If notification was marked as read, reload count to be accurate
          loadCount();
        }
      });

      // Poll every 5 seconds to ensure count stays in sync
      const interval = setInterval(() => {
        loadCount();
      }, 5000);

      return () => {
        unsubscribe?.();
        clearInterval(interval);
      };
    }, [loadCount, selectedUser])
  );

  // Also load count when selectedUser changes
  useEffect(() => {
    loadCount();
  }, [loadCount]);

  return unreadCount;
}







