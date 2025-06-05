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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import ChatMessageBubble from '../components/ChatMessageBubble';
import { conversations as initialConversations, Message } from '../globals/fakeData'; // Adjust path
import Colors from '../globals/Colors'; // Adjust path
import Icon from 'react-native-vector-icons/Ionicons'; // Example icon

type ChatDetailRouteParams = {
  conversationId: string;
  userName: string;
  userAvatar: string;
};

type ChatDetailRouteProp = RouteProp<ParamListBase, 'ChatDetailScreen'> & {
  params: ChatDetailRouteParams;
};

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatDetailRouteProp>();
  const { conversationId, userName, userAvatar } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    // Load initial messages for this conversation
    const conversation = initialConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      // Mark messages from the other user as read when opening the chat
      const updatedMessages = conversation.messages.map(msg =>
        msg.senderId !== 'me' ? { ...msg, read: true } : msg
      );
      setMessages(updatedMessages);
      // In a real app, you'd update your global state/backend here
    }
  }, [conversationId]);

  useEffect(() => {
    // Scroll to the end when messages change
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const generateFakeResponse = useCallback(() => {
    const fakeResponses = [
      'קיבלתי, תודה!',
      'מעולה! נדבר על זה בהמשך.',
      'אני בודק/ת את זה.',
      'כן, נשמע טוב.',
      'תודה על המידע!',
      'אוקיי.',
    ];
    const randomResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
    const newMessage: Message = {
      id: `msg-${Date.now()}-fake`,
      senderId: conversationId, // The other user is the sender
      text: randomResponse,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, [conversationId]);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');

    // Simulate fake response after a short delay
    setTimeout(generateFakeResponse, 1500 + Math.random() * 1000); // 1.5 to 2.5 seconds
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessageBubble
      message={item}
      isMyMessage={item.senderId === 'me'}
      userAvatar={userAvatar}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerUserInfo}>
          <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('מידע נוסף', `מידע על ${userName}`)}>
          <Icon name="information-circle-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => Alert.alert('תמונה')}>
            <Icon name="camera-outline" size={24} color={Colors.instagramBlue} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('מדיה')}>
            <Icon name="image-outline" size={24} color={Colors.instagramBlue} style={styles.icon} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="שלח הודעה..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="center" // For Android to center placeholder
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>שלח</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: 30, // Adjust for status bar height
    marginBottom: 40,
    backgroundColor: Colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexGrow: 1, // Ensure content grows to fill space
    justifyContent: 'flex-end', // Stick messages to the bottom
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  icon: {
    paddingHorizontal: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Adjust for Android vertical alignment
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 120, // Limit growth of text input
    textAlign: 'right', // For RTL
    writingDirection: 'rtl', // For RTL
  },
  sendButton: {
    backgroundColor: Colors.instagramBlue,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});