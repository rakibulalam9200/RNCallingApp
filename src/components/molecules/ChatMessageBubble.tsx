import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../../types/call';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={[
        styles.container,
        message.isLocal ? styles.localContainer : styles.remoteContainer,
      ]}
    >
      {!message.isLocal && (
        <Text style={styles.senderName}>{message.sender}</Text>
      )}
      <View
        style={[
          styles.bubble,
          message.isLocal ? styles.localBubble : styles.remoteBubble,
        ]}
      >
        <Text style={styles.messageText}>{message.message}</Text>
        <Text style={styles.timestampText}>{formattedTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    maxWidth: '80%',
  },
  localContainer: {
    alignSelf: 'flex-end',
  },
  remoteContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  localBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 2,
  },
  remoteBubble: {
    backgroundColor: '#374151',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
  },
  timestampText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});

