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
import { conversations as initialConversations, Message } from '../globals/fakeData';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import Icon from 'react-native-vector-icons/Ionicons';

type ChatDetailRouteParams = {
  conversationId: string;
  userName: string;
  userAvatar: string;
};

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, ChatDetailRouteParams>, string>>();
  const { userName, userAvatar } = route.params;
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        senderId: 'other',
        text: 'היי, אשמח לקבל פרטים נוספים על התרומה שלך',
        timestamp: new Date().toISOString(),
        read: true,
      },
      {
        id: '2',
        senderId: 'me',
        text: 'בטח! אני תורם ספה במצב מצוין. היא בת שנתיים, צבע אפור, ואפשר לאסוף מתל אביב',
        timestamp: new Date().toISOString(),
        read: true,
      },
    ]);
  }, []);

  const generateFakeResponse = () => {
    const responses = [
      'תודה על המידע! מתי אפשר לבוא לקחת?',
      'האם אפשר לקבל תמונה של הספה?',
      'מה המידות של הספה?',
      'האם יש אפשרות למשלוח?',
    ];
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'other',
      text: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

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

    setTimeout(generateFakeResponse, 1500 + Math.random() * 1000);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
  },
  sendButtonText: {
    color: colors.backgroundPrimary,
    fontWeight: 'bold',
    fontSize: FontSizes.body,
  },
});