// screens/ChatListScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView, Platform, Alert, Animated, Pressable } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import ChatListItem from '../components/ChatListItem';
import { users as allUsers, ChatUser } from '../globals/fakeData';
import { useUser } from '../context/UserContext';
import { getConversations, Conversation as ChatConversation, subscribeToConversations, debugDatabaseContent } from '../utils/chatService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const DUMMY_USERS: ChatUser[] = [
  {
    id: 'dummy_user_1',
    name: 'יוזר דמה 1',
    avatar: 'https://i.pravatar.cc/150?u=dummy_user_1',
    isOnline: true,
  },
  {
    id: 'dummy_user_2',
    name: 'יוזר דמה 2',
    avatar: 'https://i.pravatar.cc/150?u=dummy_user_2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

const DUMMY_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'dummy_conv_1',
    participants: ['user001', 'dummy_user_1'],
    lastMessageText: 'זוהי הודעת דמה ראשונה.',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dummy_conv_2',
    participants: ['user001', 'dummy_user_2'],
    lastMessageText: 'הודעת דמה שנייה, קצת יותר ארוכה.',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    unreadCount: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];


export default function ChatListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { selectedUser } = useUser();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const plusButtonScale = useRef(new Animated.Value(1)).current;
  const plusButtonRotation = useRef(new Animated.Value(0)).current;

  const loadConversations = useCallback(async () => {
    if (!selectedUser) {
      Alert.alert('שגיאה', 'יש לבחור יוזר תחילה');
      return;
    }

    setRefreshing(true);
    try {
      console.log('💬 Loading conversations for user:', selectedUser.id);
      const userConversations = await getConversations(selectedUser.id);
      console.log('💬 Found real conversations:', userConversations.length);
      
      const allConversations = [...DUMMY_CONVERSATIONS.map(c => ({...c, participants: [selectedUser.id, c.participants[1]]})), ...userConversations];
      
      setConversations(allConversations);
    } catch (error) {
      console.error('❌ Load conversations error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת השיחות');
    } finally {
      setRefreshing(false);
    }
  }, [selectedUser]);

  useFocusEffect(
    useCallback(() => {
      console.log('💬 ChatListScreen - Screen focused');
      loadConversations();
      
      if (!selectedUser) return;

      const unsubscribe = subscribeToConversations(selectedUser.id, (updatedConversations) => {
        console.log('💬 Received conversation update:', updatedConversations.length);
        setConversations(prev => {
            const realConvs = prev.filter(c => !c.id.startsWith('dummy_'));
            const updatedIds = new Set(updatedConversations.map(uc => uc.id));
            const merged = [
                ...DUMMY_CONVERSATIONS,
                ...realConvs.filter(c => !updatedIds.has(c.id)),
                ...updatedConversations
            ];
            return merged;
        });
      });

      return () => {
        console.log('💬 Cleaning up subscription');
        unsubscribe();
      };
    }, [selectedUser, loadConversations])
  );

  const onRefresh = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  const handlePressChat = (conversationId: string, otherUserId: string, userName: string, userAvatar: string) => {
    navigation.navigate('ChatDetailScreen', {
      conversationId,
      otherUserId,
      userName,
      userAvatar,
    });
  };

  const handlePlusButtonPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.parallel([
      Animated.sequence([
        Animated.timing(plusButtonScale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
        Animated.spring(plusButtonScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      ]),
      Animated.timing(plusButtonRotation, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      plusButtonRotation.setValue(0);
      navigation.navigate('NewChatScreen');
    });
  };

  const renderChatItems = () => {
    const combinedUsers = [...allUsers, ...DUMMY_USERS];

    const sortedConversations = [...conversations].sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return sortedConversations.map((item) => {
      const otherParticipantId = item.participants.find(id => id !== selectedUser?.id);
      const chattingUser = combinedUsers.find(user => user.id === otherParticipantId);
      
      if (!chattingUser) {
        console.warn(`Could not find user for participant ID: ${otherParticipantId}`);
        return null;
      }

      const chatConversation = {
        id: item.id,
        userId: otherParticipantId || '',
        messages: [],
        lastMessageTimestamp: item.lastMessageTime,
        lastMessageText: item.lastMessageText,
        unreadCount: item.unreadCount,
      };

      return (
        <ChatListItem
          key={item.id}
          conversation={chatConversation}
          user={chattingUser}
          onPress={() => handlePressChat(item.id, chattingUser.id, chattingUser.name, chattingUser.avatar)}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>צ'אטים</Text>
        {__DEV__ && (
          <TouchableOpacity 
            onPress={async () => {
              if (selectedUser) {
                await debugDatabaseContent(selectedUser.id);
                Alert.alert('Debug', 'Check console for database content');
              }
            }}
            style={styles.headerButton}
          >
            <Icon name="bug-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
        <Pressable
          onPress={handlePlusButtonPress}
          style={({ pressed }) => [styles.headerButton, pressed && Platform.OS === 'ios' && styles.buttonPressed]}
          android_ripple={{ color: colors.primary + '30', borderless: true }}
        >
          <Animated.View style={{ transform: [{ scale: plusButtonScale }, { rotate: plusButtonRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }] }}>
            <Icon name="add-circle-outline" size={24} color={colors.primary} />
          </Animated.View>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {renderChatItems()}
      </ScrollView>
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
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
