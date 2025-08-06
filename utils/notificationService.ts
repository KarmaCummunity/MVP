// utils/notificationService.ts
import { Platform, Alert } from 'react-native';
import { db, DB_COLLECTIONS, DatabaseService } from './databaseService';

// Import notifications only on supported platforms
let Notifications: any = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch (error) {
    console.warn('Failed to load expo-notifications:', error);
  }
}

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

// בדיקה אם הפלטפורמה תומכת בהתראות
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
    console.warn('Failed to set notification handler:', error);
  }
}

// פונקציה לבקשת הרשאות התראות
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    // אם זה ווב או אין מודול התראות, לא נבקש הרשאות התראות
    if (Platform.OS === 'web' || !Notifications) {
      console.log('🔔 Web platform or no notifications module - notifications not supported');
      return false;
    }

    console.log('🔔 Requesting notification permissions...');
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // רק אם אין הרשאות, בקש אותן
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions not granted');
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
    
    console.log('✅ Notification permissions granted');
    
    // הגדרת ערוץ התראות ל-Android
    if (Platform.OS === 'android') {
      console.log('🤖 Android platform - setting up notification channel');
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

// פונקציה לבדיקת מצב הרשאות
export const checkNotificationPermissions = async (): Promise<{
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}> => {
  try {
    // אם זה ווב או אין מודול התראות, החזר false
    if (Platform.OS === 'web' || !Notifications) {
      console.log('🌐 Web platform or no notifications module - checking notification permissions (not supported)');
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

// פונקציה לשליחת התראה מקומית
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  type: NotificationData['type'] = 'system'
): Promise<string> => {
  try {
    // אם זה ווב או אין מודול התראות, לא נשלח התראות
    if (Platform.OS === 'web' || !Notifications) {
      console.log('🔔 Web platform or no notifications module - skipping local notification:', title);
      return '';
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('❌ No notification permissions, cannot send notification');
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

    console.log('✅ Local notification sent:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Send local notification error:', error);
    return '';
  }
};

// פונקציה לשליחת התראה על הודעה חדשה
export const sendMessageNotification = async (
  senderName: string,
  messageText: string,
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - sending message notification');
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.messages) {
      console.log('🔕 Message notifications disabled');
      return;
    }

    const title = `הודעה חדשה מ-${senderName}`;
    const body = messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText;
    
    await sendLocalNotification(title, body, {
      conversationId,
      senderName,
      type: 'message',
    }, 'message');

    // שמירת ההתראה בהיסטוריה
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

// פונקציה לשליחת התראה על עוקב חדש
export const sendFollowNotification = async (
  followerName: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - sending follow notification');
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.follows) {
      console.log('🔕 Follow notifications disabled');
      return;
    }

    const title = 'עוקב חדש!';
    const body = `${followerName} התחיל לעקוב אחריך`;
    
    await sendLocalNotification(title, body, {
      followerName,
      type: 'follow',
    }, 'follow');

    // שמירת ההתראה בהיסטוריה
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

// פונקציה לשליחת התראה על לייק
export const sendLikeNotification = async (
  likerName: string,
  postType: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - sending like notification');
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.likes) {
      console.log('🔕 Like notifications disabled');
      return;
    }

    const title = 'לייק חדש!';
    const body = `${likerName} אהב את ה${postType} שלך`;
    
    await sendLocalNotification(title, body, {
      likerName,
      postType,
      type: 'like',
    }, 'like');

    // שמירת ההתראה בהיסטוריה
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

// פונקציה לשליחת התראה על תגובה
export const sendCommentNotification = async (
  commenterName: string,
  postType: string,
  commentText: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - sending comment notification');
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.comments) {
      console.log('🔕 Comment notifications disabled');
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

    // שמירת ההתראה בהיסטוריה
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

// פונקציה לשליחת התראה על משימה חדשה
export const sendTaskNotification = async (
  taskTitle: string,
  taskDescription: string,
  userId: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - sending task notification');
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.system) {
      console.log('🔕 System notifications disabled');
      return;
    }

    const title = 'משימה חדשה!';
    const body = `${taskTitle}: ${taskDescription.substring(0, 50)}${taskDescription.length > 50 ? '...' : ''}`;
    
    await sendLocalNotification(title, body, {
      taskTitle,
      taskDescription,
      type: 'system',
    }, 'system');

    // שמירת ההתראה בהיסטוריה
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

// פונקציה לשליחת התראה על תרומה חדשה
export const sendDonationNotification = async (
  donorName: string,
  donationType: string,
  userId: string,
  amount?: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - sending donation notification');
    }
    
    const settings = await getNotificationSettings(userId);
    if (!settings.system) {
      console.log('🔕 System notifications disabled');
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

    // שמירת ההתראה בהיסטוריה
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

// פונקציה לקבלת הגדרות התראות
export const getNotificationSettings = async (userId?: string): Promise<NotificationSettings> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - getting notification settings');
    }
    
    if (!userId) {
      console.log('🔔 No userId provided, returning default settings');
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
    
    // הגדרות ברירת מחדל
    const defaultSettings: NotificationSettings = {
      messages: true,
      follows: true,
      likes: true,
      comments: true,
      system: true,
      sound: true,
      vibration: true,
    };
    
    // שמירת הגדרות ברירת מחדל
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

// פונקציה לעדכון הגדרות התראות
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>, userId?: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - updating notification settings');
    }
    
    if (!userId) {
      console.log('🔔 No userId provided, cannot update settings');
      return;
    }
    
    const currentSettings = await getNotificationSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    
    const userSettings = { notifications: updatedSettings };
    await db.updateUserSettings(userId, userSettings);
    console.log('✅ Notification settings updated');
  } catch (error) {
    console.error('❌ Update notification settings error:', error);
  }
};

// פונקציה לשמירת התראה בהיסטוריה
export const saveNotification = async (notification: NotificationData): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - saving notification to history');
    }
    
    await db.createNotification(notification.userId, notification.id, notification);
    console.log('✅ Notification saved to history');
  } catch (error) {
    console.error('❌ Save notification error:', error);
  }
};

// פונקציה לקבלת היסטוריית התראות
export const getNotifications = async (userId: string): Promise<NotificationData[]> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - getting notifications for user:', userId);
    }
    
    const notifications = await db.getUserNotifications(userId);
    return (notifications as NotificationData[]) || [];
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    return [];
  }
};

// פונקציה לסימון התראה כנקראה
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - marking notification as read:', notificationId);
    }
    
    await db.markNotificationAsRead(userId, notificationId);
    console.log('✅ Notification marked as read');
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
  }
};

// פונקציה לסימון כל ההתראות כנקראו
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - marking all notifications as read for user:', userId);
    }
    
    const notifications = await getNotifications(userId);
    for (const notification of notifications) {
      await db.markNotificationAsRead(userId, notification.id);
    }
    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
  }
};

// פונקציה למחיקת התראה
export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - deleting notification:', notificationId);
    }
    
    await db.deleteNotification(userId, notificationId);
    console.log('✅ Notification deleted');
  } catch (error) {
    console.error('❌ Delete notification error:', error);
  }
};

// פונקציה למחיקת כל ההתראות
export const clearAllNotifications = async (userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - clearing all notifications for user:', userId);
    }
    
    const notifications = await getNotifications(userId);
    const notificationIds = notifications.map(n => n.id);
    await DatabaseService.batchDelete(DB_COLLECTIONS.NOTIFICATIONS, userId, notificationIds);
    console.log('✅ All notifications cleared');
  } catch (error) {
    console.error('❌ Clear all notifications error:', error);
  }
};

// פונקציה לקבלת מספר ההתראות שלא נקראו
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform - getting unread notification count for user:', userId);
    }
    
    const notifications = await getNotifications(userId);
    const unreadCount = notifications.filter(notification => !notification.read).length;
    console.log('📊 Unread notifications count:', unreadCount);
    return unreadCount;
  } catch (error) {
    console.error('❌ Get unread notification count error:', error);
    return 0;
  }
};

// פונקציה להגדרת listener להתראות
export const setupNotificationListener = (callback: (notification: any) => void) => {
  if (!isNotificationsSupported() || !Notifications) {
    console.log('🔔 Notifications not supported on this platform');
    return null;
  }
  
  if (Platform.OS === 'web') {
    console.log('🌐 Web platform - setting up notification listener (will be ignored)');
    return null;
  }
  
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return subscription;
};

// פונקציה להגדרת listener ללחיצה על התראה
export const setupNotificationResponseListener = (callback: (response: any) => void) => {
  if (!isNotificationsSupported()) {
    console.log('🔔 Notifications not supported on this platform');
    return null;
  }
  
  if (Platform.OS === 'web') {
    console.log('🌐 Web platform - setting up notification response listener (will be ignored)');
    return null;
  }
  
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return subscription;
}; 