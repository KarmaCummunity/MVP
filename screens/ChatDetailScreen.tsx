// File overview:
// - Purpose: Conversation detail screen showing messages, input box, and media attachments.
// - Reached from: 'ChatListScreen' and notifications deep links; route name 'ChatDetailScreen'.
// - Expects route params: `{ conversationId: string, userName: string, userAvatar: string, otherUserId: string }`.
// - Provides: Loads messages, subscribes to updates, marks as read, sends text/files, optional fake auto-replies for demo.
// - Reads from context: `useUser()` -> selectedUser.
// - External deps/services: `chatService` (get/subscribe/send/mark), `fileService` (pick/validate), i18n.
// screens/ChatDetailScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import ChatMessageBubble from '../components/ChatMessageBubble';
import { RootStackParamList } from '../globals/types';
import { useUser } from '../stores/userStore';
import { getMessages, sendMessage, markMessagesAsRead, Message, subscribeToMessages } from '../utils/chatService';
import { pickImage, pickVideo, takePhoto, pickDocument, validateFile, FileData } from '../utils/fileService';
import { apiService } from '../utils/apiService';
import { USE_BACKEND } from '../utils/config.constants';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type ChatDetailRouteParams = {
  conversationId: string;
  userName: string;
  userAvatar: string;
  otherUserId: string;
};

export default function ChatDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<Record<string, ChatDetailRouteParams>, string>>();
  const routeParams = route.params || {};
  const { conversationId: initialConversationId, userName: initialUserName, userAvatar: initialUserAvatar, otherUserId } = routeParams;
  const { selectedUser } = useUser();
  const { t } = useTranslation(['chat']);
  const tabBarHeight = useBottomTabBarHeight() || 0;
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [userName, setUserName] = useState(initialUserName);
  const [userAvatar, setUserAvatar] = useState(initialUserAvatar);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load user profile for the other user
  const loadUserProfile = useCallback(async () => {
    if (!USE_BACKEND || !otherUserId || isLoadingProfile) return;
    
    setIsLoadingProfile(true);
    try {
      const response = await apiService.getUserById(otherUserId);
      if (response.success && response.data) {
        const userData = response.data;
        // Only update if we got valid data and the initial name was "unknown user"
        const newName = userData.name || initialUserName || t('chat:unknownUser');
        const newAvatar = userData.avatar_url || userData.avatar || initialUserAvatar || '';
        
        // Always update, but prioritize loaded data
        setUserName(newName);
        setUserAvatar(newAvatar);
      } else {
        // If user not found, keep initial values but log warning
        console.warn('User not found:', otherUserId);
        if (initialUserName && initialUserName !== t('chat:unknownUser')) {
          // Keep the initial name if it's not "unknown user"
          setUserName(initialUserName);
          setUserAvatar(initialUserAvatar);
        }
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
      // Keep the initial values if loading fails, but only if they're not "unknown user"
      if (initialUserName && initialUserName !== t('chat:unknownUser')) {
        setUserName(initialUserName);
        setUserAvatar(initialUserAvatar);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  }, [otherUserId, initialUserName, initialUserAvatar, t]);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      if (selectedUser) {
        const conversationMessages = await getMessages(conversationId, selectedUser.id);
        setMessages(conversationMessages);
        
        await markMessagesAsRead(conversationId, selectedUser.id);
      }
    } catch (error) {
      console.error('❌ Load messages error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת ההודעות');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, selectedUser]);

  // Update state when screen comes into focus (e.g., when returning from profile)
  useFocusEffect(
    React.useCallback(() => {
      const params = route.params;
      if (params) {
        // Update userName if provided and different
        if (params.userName) {
          setUserName(prev => params.userName !== prev ? params.userName : prev);
        }
        // Update userAvatar if provided and different
        if (params.userAvatar) {
          setUserAvatar(prev => params.userAvatar !== prev ? params.userAvatar : prev);
        }
        // Update conversationId if provided and different
        if (params.conversationId) {
          setConversationId(prev => params.conversationId !== prev ? params.conversationId : prev);
        }
      }
    }, [route.params])
  );

  // Load user profile on mount - prioritize loading if initial name is "unknown user"
  useEffect(() => {
    // If initial name is "unknown user", load immediately
    if (initialUserName === t('chat:unknownUser') || !initialUserName) {
      loadUserProfile();
    } else {
      // Otherwise, still try to load to get latest data, but don't block
      loadUserProfile();
    }
  }, [loadUserProfile, initialUserName, t]);

  // Real-time subscription
  useEffect(() => {
    loadMessages();

    let unsubscribe: (() => void) | undefined;

    // Subscribe to real-time updates
    if (selectedUser) {
      unsubscribe = subscribeToMessages(conversationId, selectedUser.id, (newMessages) => {
        setMessages(newMessages);
        
        // Mark messages as read when they arrive
        markMessagesAsRead(conversationId, selectedUser.id).catch(console.error);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [conversationId, selectedUser, loadMessages]);

  const generateFakeResponse = async () => {
    const responses = [
      'תודה על המידע! מתי אפשר לבוא לקחת?',
      'האם אפשר לקבל תמונה של הספה?',
      'מה המידות של הספה?',
      'האם יש אפשרות למשלוח?',
    ];
    
    const responseText = responses[Math.floor(Math.random() * responses.length)];
    
    try {
      await sendMessage({
        conversationId,
        senderId: otherUserId,
        text: responseText,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
        status: 'sent',
      });
    } catch (error) {
      console.error('❌ Send fake response error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || !selectedUser || isSending) return;

    const messageText = inputText.trim();
    const tempMessageId = `temp_${Date.now()}`;
    
    // Add message to local state immediately with "sending" status
    const tempMessage: Message = {
      id: tempMessageId,
      conversationId,
      senderId: selectedUser.id,
      text: messageText,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
      status: 'sending',
    };

    setMessages(prev => [...prev, tempMessage]);
    setInputText('');
    setIsSending(true);

    try {
      // Send the message with fallback participants in case conversation not found
      // Note: sendMessage may update conversationId if backend creates new conversation
      let currentConversationId = conversationId;
      const messageId = await sendMessage({
        conversationId: currentConversationId,
        senderId: selectedUser.id,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
        status: 'sent',
      }, [selectedUser.id, otherUserId]); // Provide fallback participants

      // Check if conversation was updated (backend may have created new UUID)
      // We'll reload messages to get the updated conversation
      await loadMessages();

      // Extract the actual message ID (handle both string and object return types)
      const actualMessageId = typeof messageId === 'string' ? messageId : messageId.messageId;
      
      // Update the temp message with the real message ID and status
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessageId 
          ? { ...msg, id: actualMessageId, status: 'sent' as const }
          : msg
      ));

    } catch (error) {
      console.error('❌ Send message error:', error);
      
      // Remove the temp message and restore the text
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setInputText(messageText);
      
      Alert.alert(
        'שגיאה', 
        'שגיאה בשליחת ההודעה. אנא נסה שוב.',
        [{ text: 'אישור', style: 'default' }]
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendFile = async (fileData: FileData) => {
    if (!selectedUser) return;

    try {
      setIsSending(true);

      const validation = validateFile(fileData);
      if (!validation.isValid) {
        Alert.alert('שגיאה', validation.error || 'הקובץ אינו תקין');
        return;
      }

      await sendMessage({
        conversationId,
        senderId: selectedUser.id,
        text: '',
        timestamp: new Date().toISOString(),
        read: false,
        type: fileData.type,
        status: 'sent',
        fileData,
      });

      console.log('✅ File message sent');

    } catch (error) {
      console.error('❌ Send file error:', error);
      Alert.alert('שגיאה', 'שגיאה בשליחת הקובץ');
    } finally {
      setIsSending(false);
    }
  };

  const handlePickImage = async () => {
    setShowMediaOptions(false);
    const result = await pickImage();
    
    if (result.success && result.fileData) {
      await handleSendFile(result.fileData);
    } else if (result.error) {
      Alert.alert('שגיאה', result.error);
    }
  };

  const handleTakePhoto = async () => {
    setShowMediaOptions(false);
    const result = await takePhoto();
    
    if (result.success && result.fileData) {
      await handleSendFile(result.fileData);
    } else if (result.error) {
      Alert.alert('שגיאה', result.error);
    }
  };

  const handlePickVideo = async () => {
    setShowMediaOptions(false);
    const result = await pickVideo();
    
    if (result.success && result.fileData) {
      await handleSendFile(result.fileData);
    } else if (result.error) {
      Alert.alert('שגיאה', result.error);
    }
  };

  const handlePickDocument = async () => {
    setShowMediaOptions(false);
    const result = await pickDocument();
    
    if (result.success && result.fileData) {
      await handleSendFile(result.fileData);
    } else if (result.error) {
      Alert.alert('שגיאה', result.error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessageBubble
      message={item}
      isMyMessage={item.senderId === selectedUser?.id}
      userAvatar={userAvatar}
    />
  );

  const renderLoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.pink} />
      <Text style={styles.loadingText}>טוען הודעות...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.backgroundSecondary} barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('UserProfileScreen', {
              userId: otherUserId,
              userName: userName,
              userAvatar: userAvatar,
            });
          }}
          style={styles.headerUserInfo}
          activeOpacity={0.7}
        >
          <Image source={{ uri: userAvatar || 'https://i.pravatar.cc/150?img=1' }} style={styles.headerAvatar} />
          <Text style={styles.headerTitle}>{userName}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('UserProfileScreen', {
              userId: otherUserId,
              userName: userName,
              userAvatar: userAvatar,
            });
          }} 
          style={styles.headerButton}
        >
          <Icon name="person-circle-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
        {isLoading ? (
          renderLoadingIndicator()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[styles.messagesContainer, { paddingBottom: tabBarHeight + 80 }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={[styles.inputContainer, { marginBottom: tabBarHeight + 10 }]}>
          <TouchableOpacity onPress={() => setShowMediaOptions(!showMediaOptions)}>
            <Icon name="add-circle-outline" size={24} color={colors.primary} style={styles.icon} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('chat:placeholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="center"
            editable={!isSending}
          />
          <TouchableOpacity 
            onPress={handleSendMessage} 
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.backgroundPrimary} />
            ) : (
              <Text style={styles.sendButtonText}>שלח</Text>
            )}
          </TouchableOpacity>
        </View>

        {showMediaOptions && (
          <View style={[styles.mediaOptionsContainer, { marginBottom: tabBarHeight + 10 }]}>
            <TouchableOpacity style={styles.mediaOption} onPress={handleTakePhoto}>
              <Icon name="camera" size={24} color={colors.primary} />
              <Text style={styles.mediaOptionText}>צלם תמונה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaOption} onPress={handlePickImage}>
              <Icon name="image" size={24} color={colors.primary} />
              <Text style={styles.mediaOptionText}>בחר תמונה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaOption} onPress={handlePickVideo}>
              <Icon name="videocam" size={24} color={colors.primary} />
              <Text style={styles.mediaOptionText}>בחר סרטון</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaOption} onPress={handlePickDocument}>
              <Icon name="document" size={24} color={colors.primary} />
              <Text style={styles.mediaOptionText}>בחר קובץ</Text>
            </TouchableOpacity>
          </View>
        )}
        {Platform.OS === 'android' && <View style={styles.androidBottomSpacer} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  headerTitle: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  // Loading indicator
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  loadingText: {
    marginTop: 10,
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
  // Chat messages container
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 10,
  },
  // Input container at bottom
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'android' ? 20 : 10, 
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  icon: {
    paddingHorizontal: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginHorizontal: 8,
    fontSize: FontSizes.body,
    maxHeight: "80%",
    textAlign: 'right',
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.pink,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  sendButtonText: {
    color: colors.backgroundPrimary,
    fontWeight: 'bold',
    fontSize: FontSizes.body,
  },
  androidBottomSpacer: {
    height: 20,
    backgroundColor: colors.backgroundPrimary,
  },
  mediaOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mediaOption: {
    alignItems: 'center',
    padding: 8,
  },
  mediaOptionText: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});