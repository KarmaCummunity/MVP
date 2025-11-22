import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../stores/userStore';
import { sendMessage, getMessages, Message } from '../utils/chatService';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useTranslation } from 'react-i18next';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  postUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function CommentsModal({ 
  visible, 
  onClose, 
  postId, 
  postTitle, 
  postUser 
}: CommentsModalProps) {
  const { selectedUser } = useUser();
  const { t } = useTranslation(['common','comments']);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const messages = await getMessages(`post-${postId}`, selectedUser?.id || 'guest');
      
      const commentsData: Comment[] = messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        userId: msg.senderId,
        userName: msg.senderId === postUser.id ? postUser.name : 'משתמש אחר',
        userAvatar: msg.senderId === postUser.id ? postUser.avatar : 'https://picsum.photos/seed/user/100/100',
        timestamp: msg.timestamp,
        likes: Math.floor(Math.random() * 10),
        isLiked: Math.random() < 0.3,
      }));
      
      setComments(commentsData);
    } catch (error) {
      console.error('❌ Load comments error:', error);
      Alert.alert(t('common:errorTitle'), t('comments:loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadComments();
    }
  }, [visible, postId]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedUser) return;

    try {
      await sendMessage({
        conversationId: `post-${postId}`,
        senderId: selectedUser.id,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
        status: 'sent',
      });

      setNewComment('');
      loadComments(); 
    } catch (error) {
      console.error('❌ Send comment error:', error);
      Alert.alert(t('common:errorTitle'), t('comments:sendError'));
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('common:time.now');
    if (diffInHours < 24) return t('common:time.hoursAgo', { count: diffInHours });
    return date.toLocaleDateString('he-IL');
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUserName}>{item.userName}</Text>
          <Text style={styles.commentTimestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction} 
            onPress={() => handleLikeComment(item.id)}
          >
            <Ionicons 
              name={item.isLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={item.isLiked ? colors.error : colors.textSecondary} 
            />
            <Text style={[styles.commentActionText, item.isLiked && styles.likedText]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.commentActionText}>{t('comments:reply')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('comments:title')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Post Info */}
        <View style={styles.postInfo}>
          <Image source={{ uri: postUser.avatar }} style={styles.postUserAvatar} />
          <View style={styles.postInfoContent}>
            <Text style={styles.postUserName}>{postUser.name}</Text>
            <Text style={styles.postTitle}>{postTitle}</Text>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder={t('comments:placeholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!newComment.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newComment.trim() ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  postInfo: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  postUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInfoContent: {
    flex: 1,
  },
  postUserName: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  postTitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  commentTimestamp: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  commentText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  likedText: {
    color: colors.error,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    maxHeight: 100,
    textAlign: 'right',
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 