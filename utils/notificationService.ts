// utils/notificationService.ts
import { Platform, Alert } from 'react-native';
import { db, DB_COLLECTIONS, DatabaseService } from './databaseService';

// Import notifications only on supported platforms
let Notifications: any = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch (error) {
    // console removed
  }
}

// --- Simple in-app notification event bus ---
type NotificationEventListener = (notification: NotificationData) => void;
const notificationEventListeners: Set<NotificationEventListener> = new Set();

export const subscribeToNotificationEvents = (listener: NotificationEventListener): (() => void) => {
  notificationEventListeners.add(listener);
  return () => notificationEventListeners.delete(listener);
};

const emitNotificationEvent = (notification: NotificationData) => {
  notificationEventListeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (err) {
      // console removed
    }
  });
};

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'message' | 'follow' | 'like' | 'comment' | 'system';
  timestamp: string;
  read: boolean;
  userId: string;
}

export interface NotificationSettings {
  messages: boolean;
  follows: boolean;
  likes: boolean;
  comments: boolean;
  system: boolean;
  sound: boolean;
  vibration: boolean;
}

// Storage keys - deprecated, using database service now
// const NOTIFICATIONS_COLLECTION = 'notifications';
// const NOTIFICATION_SETTINGS = 'notification_settings';

const isNotificationsSupported = () => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

// Configure notification behavior רק אם הפלטפורמה תומכת
if (isNotificationsSupported() && Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    // console removed
  }
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web' || !Notifications) {
      // console removed
      return false;
    }

    // console removed
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      // console removed
      Alert.alert(
        'הרשאות התראות',
        'כדי לקבל התראות על הודעות חדשות ועוקבים, אנא אשר גישה להתראות בהגדרות המכשיר',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'הגדרות', onPress: () => {} }
        ]
      );
      return false;
    }
    
    // console removed
    
    if (Platform.OS === 'android') {
      // console removed
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Request notification permissions error:', error);
    return false;
  }
};

export const checkNotificationPermissions = async (): Promise<{
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}> => {
  try {
    if (Platform.OS === 'web' || !Notifications) {
      // console removed');
      return {
        granted: false,
        canAskAgain: false,
        status: 'web_not_supported',
      };
    }

    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
      status,
    };
  } catch (error) {
    console.error('❌ Check notification permissions error:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'unknown',
    };
  }
};

export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  type: NotificationData['type'] = 'system'
): Promise<string> => {
  try {
    if (Platform.OS === 'web' || !Notifications) {
      // console removed
      return '';
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      // console removed
      return '';
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, type },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    // console removed
    return notificationId;
  } catch (error) {
    console.error('❌ Send local notification error:', error);
    return '';
  }
};

export const sendMessageNotification = async (
  senderName: string,
  messageText: string,
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.messages) {
      // console removed
      return;
    }

    const title = `הודעה חדשה מ-${senderName}`;
    const body = messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText;
    
    await sendLocalNotification(title, body, {
      conversationId,
      senderName,
      type: 'message',
    }, 'message');

    await saveNotification({
      id: `msg_${Date.now()}`,
      title,
      body,
      data: { conversationId, senderName },
      type: 'message',
      timestamp: new Date().toISOString(),
      read: false,
      userId,
    });

  } catch (error) {
    console.error('❌ Send message notification error:', error);
  }
};

export const sendFollowNotification = async (
  followerName: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.follows) {
      // console removed
      return;
    }

    const title = 'עוקב חדש!';
    const body = `${followerName} התחיל לעקוב אחריך`;
    
    await sendLocalNotification(title, body, {
      followerName,
      type: 'follow',
    }, 'follow');

    await saveNotification({
      id: `follow_${Date.now()}`,
      title,
      body,
      data: { followerName },
      type: 'follow',
      timestamp: new Date().toISOString(),
      read: false,
      userId,
    });

  } catch (error) {
    console.error('❌ Send follow notification error:', error);
  }
};

export const sendLikeNotification = async (
  likerName: string,
  postType: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.likes) {
      // console removed
      return;
    }

    const title = 'לייק חדש!';
    const body = `${likerName} אהב את ה${postType} שלך`;
    
    await sendLocalNotification(title, body, {
      likerName,
      postType,
      type: 'like',
    }, 'like');

    await saveNotification({
      id: `like_${Date.now()}`,
      title,
      body,
      data: { likerName, postType },
      type: 'like',
      timestamp: new Date().toISOString(),
      read: false,
      userId,
    });

  } catch (error) {
    console.error('❌ Send like notification error:', error);
  }
};

export const sendCommentNotification = async (
  commenterName: string,
  postType: string,
  commentText: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.comments) {
      // console removed
      return;
    }

    const title = 'תגובה חדשה!';
    const body = `${commenterName} הגיב על ה${postType} שלך: ${commentText.substring(0, 30)}${commentText.length > 30 ? '...' : ''}`;
    
    await sendLocalNotification(title, body, {
      commenterName,
      postType,
      commentText,
      type: 'comment',
    }, 'comment');

    await saveNotification({
      id: `comment_${Date.now()}`,
      title,
      body,
      data: { commenterName, postType, commentText },
      type: 'comment',
      timestamp: new Date().toISOString(),
      read: false,
      userId,
    });

  } catch (error) {
    console.error('❌ Send comment notification error:', error);
  }
};

export const sendTaskNotification = async (
  taskTitle: string,
  taskDescription: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.system) {
      // console removed
      return;
    }

    const title = 'משימה חדשה!';
    const body = `${taskTitle}: ${taskDescription.substring(0, 50)}${taskDescription.length > 50 ? '...' : ''}`;
    
    await sendLocalNotification(title, body, {
      taskTitle,
      taskDescription,
      type: 'system',
    }, 'system');

    await saveNotification({
      id: `task_${Date.now()}`,
      title,
      body,
      data: { taskTitle, taskDescription },
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      userId,
    });

  } catch (error) {
    console.error('❌ Send task notification error:', error);
  }
};

export const sendDonationNotification = async (
  donorName: string,
  donationType: string,
  userId: string,
  amount?: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.system) {
      // console removed
      return;
    }

    const title = 'תרומה חדשה!';
    const body = amount 
      ? `${donorName} תרם ${amount} ${donationType}`
      : `${donorName} תרם ${donationType}`;
    
    await sendLocalNotification(title, body, {
      donorName,
      donationType,
      amount,
      type: 'system',
    }, 'system');

    await saveNotification({
      id: `donation_${Date.now()}`,
      title,
      body,
      data: { donorName, donationType, amount },
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      userId,
    });

  } catch (error) {
    console.error('❌ Send donation notification error:', error);
  }
};

export const getNotificationSettings = async (userId?: string): Promise<NotificationSettings> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    if (!userId) {
      // console removed
      return {
        messages: true,
        follows: true,
        likes: true,
        comments: true,
        system: true,
        sound: true,
        vibration: true,
      };
    }
    
    const settings = await db.getUserSettings(userId);
    if (settings && (settings as any).notifications) {
      return (settings as any).notifications;
    }
    
    const defaultSettings: NotificationSettings = {
      messages: true,
      follows: true,
      likes: true,
      comments: true,
      system: true,
      sound: true,
      vibration: true,
    };
    
    const userSettings = { notifications: defaultSettings };
    await db.updateUserSettings(userId, userSettings);
    return defaultSettings;
  } catch (error) {
    console.error('❌ Get notification settings error:', error);
    return {
      messages: true,
      follows: true,
      likes: true,
      comments: true,
      system: true,
      sound: true,
      vibration: true,
    };
  }
};

export const updateNotificationSettings = async (settings: Partial<NotificationSettings>, userId?: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    if (!userId) {
      // console removed
      return;
    }
    
    const currentSettings = await getNotificationSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    
    const userSettings = { notifications: updatedSettings };
    await db.updateUserSettings(userId, userSettings);
    // console removed
  } catch (error) {
    console.error('❌ Update notification settings error:', error);
  }
};

export const saveNotification = async (notification: NotificationData): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    await db.createNotification(notification.userId, notification.id, notification);
    // console removed

    // Emit in-app event so UI can update in real-time
    emitNotificationEvent(notification);
  } catch (error) {
    console.error('❌ Save notification error:', error);
  }
};

export const getNotifications = async (userId: string): Promise<NotificationData[]> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const notifications = await db.getUserNotifications(userId);
    return (notifications as NotificationData[]) || [];
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    await db.markNotificationAsRead(userId, notificationId);
    // console removed
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const notifications = await getNotifications(userId);
    for (const notification of notifications) {
      await db.markNotificationAsRead(userId, notification.id);
    }
    // console removed
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
  }
};

export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    await db.deleteNotification(userId, notificationId);
    // console removed
  } catch (error) {
    console.error('❌ Delete notification error:', error);
  }
};

export const clearAllNotifications = async (userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const notifications = await getNotifications(userId);
    const notificationIds = notifications.map(n => n.id);
    await DatabaseService.batchDelete(DB_COLLECTIONS.NOTIFICATIONS, userId, notificationIds);
    // console removed
  } catch (error) {
    console.error('❌ Clear all notifications error:', error);
  }
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    if (Platform.OS === 'web') {
      // console removed
    }
    
    const notifications = await getNotifications(userId);
    const unreadCount = notifications.filter(notification => !notification.read).length;
    // console removed
    return unreadCount;
  } catch (error) {
    console.error('❌ Get unread notification count error:', error);
    return 0;
  }
};

export const setupNotificationListener = (callback: (notification: any) => void) => {
  if (!isNotificationsSupported() || !Notifications) {
    // console removed
    return null;
  }
  
  if (Platform.OS === 'web') {
    // console removed');
    return null;
  }
  
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return subscription;
};

export const setupNotificationResponseListener = (callback: (response: any) => void) => {
  if (!isNotificationsSupported()) {
    // console removed
    return null;
  }
  
  if (Platform.OS === 'web') {
    // console removed');
    return null;
  }
  
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return subscription;
}; 