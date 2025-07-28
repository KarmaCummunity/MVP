// components/ChatMessageBubble.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Message, ChatUser } from '../globals/fakeData'; // Adjust path
import colors from '../globals/colors'; // Assuming you have a Colors file
import { FontSizes } from '../globals/constants';

interface ChatMessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  userAvatar: string;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isMyMessage, userAvatar }) => {
  const bubbleStyle = isMyMessage ? styles.myBubble : styles.otherBubble;
  const textStyle = isMyMessage ? styles.myText : styles.otherText;
  const containerStyle = isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={containerStyle}>
      {!isMyMessage && (
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
      )}
      <View style={[styles.bubble, bubbleStyle]}>
        {message.text && <Text style={[styles.messageText, textStyle]}>{message.text}</Text>}
        {message.image && (
          <Image source={{ uri: message.image }} style={styles.messageImage} />
        )}
        <Text style={[styles.timestamp, isMyMessage ? styles.myTimestamp : styles.otherTimestamp]}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  myMessageContainer: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
    marginVertical: 4,
  },
  otherMessageContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
    alignSelf: 'flex-end', // Align avatar to bottom of bubble
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxWidth: '75%',
    // Shadows
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: colors.chatSent, // Your brand blue/purple
    borderBottomRightRadius: 5, // Pointy end
  },
  otherBubble: {
    backgroundColor: colors.chatReceived, // Light grey for incoming
    borderBottomLeftRadius: 5, // Pointy end
  },
  messageText: {
    fontSize: FontSizes.body,
    lineHeight: 22,
  },
  myText: {
    color: colors.white,
  },
  otherText: {
    color: colors.chatText,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: FontSizes.caption,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: colors.white,
    opacity: 0.8,
  },
  otherTimestamp: {
    color: colors.chatTime,
  },
});

export default ChatMessageBubble;