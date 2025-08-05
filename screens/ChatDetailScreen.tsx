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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import ChatMessageBubble from '../components/ChatMessageBubble';
import { useUser } from '../context/UserContext';
import { getMessages, sendMessage, markMessagesAsRead, Message, subscribeToMessages } from '../utils/chatService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import Icon from 'react-native-vector-icons/Ionicons';

type ChatDetailRouteParams = {
  conversationId: string;
  userName: string;
  userAvatar: string;
  otherUserId: string;
};

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, ChatDetailRouteParams>, string>>();
  const { conversationId, userName, userAvatar, otherUserId } = route.params;
  const { selectedUser } = useUser();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // טעינת הודעות
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const conversationMessages = await getMessages(conversationId);
      setMessages(conversationMessages);
      
      // סימון הודעות כנקראו
      if (selectedUser) {
        await markMessagesAsRead(conversationId, selectedUser.id);
      }
    } catch (error) {
      console.error('❌ Load messages error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת ההודעות');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, selectedUser]);

  // Real-time subscription
  useEffect(() => {
    loadMessages();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      
      // Mark messages as read when they arrive
      if (selectedUser) {
        markMessagesAsRead(conversationId, selectedUser.id).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, selectedUser]);

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
      });
    } catch (error) {
      console.error('❌ Send fake response error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || !selectedUser || isSending) return;

    try {
      setIsSending(true);
      await sendMessage({
        conversationId,
        senderId: selectedUser.id,
        text: inputText.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
      });
      
      setInputText('');
    } catch (error) {
      console.error('❌ Send message error:', error);
      Alert.alert('שגיאה', 'שגיאה בשליחת ההודעה');
    } finally {
      setIsSending(false);
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
        <View style={styles.headerUserInfo}>
          <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('מידע נוסף', `מידע על ${userName}`)} style={styles.headerButton}>
          <Icon name="information-circle-outline" size={24} color={colors.textPrimary} />
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
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => Alert.alert('תמונה')}>
            <Icon name="camera-outline" size={24} color={colors.pink} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('מדיה')}>
            <Icon name="image-outline" size={24} color={colors.pink} style={styles.icon} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="שלח הודעה..."
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
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
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
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'android' ? 20 : 10, // מרווח נוסף לאנדרואיד
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
    maxHeight: 120,
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
});