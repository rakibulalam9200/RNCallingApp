import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChatMessage } from '../../types/call';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onReact?: (messageId: string, emoji: string) => void;
}

const QUICK_MESSAGE_EMOJIS = ['❤️', '👍', '😂', '🔥', '👏'];

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onReact,
}) => {
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const reactionEntries = Object.entries(message.reactions || {}).filter(
    ([, users]) => users && users.length > 0
  );

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

      {/* Quick Emoji Reaction Picker on tap/long-press */}
      {showEmojiBar && (
        <View
          style={[
            styles.emojiPickerRow,
            message.isLocal ? styles.localPicker : styles.remotePicker,
          ]}
        >
          {QUICK_MESSAGE_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiPickBtn}
              onPress={() => {
                onReact?.(message.id, emoji);
                setShowEmojiBar(false);
              }}
            >
              <Text style={styles.emojiPickText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowEmojiBar((prev) => !prev)}
        onLongPress={() => setShowEmojiBar(true)}
        style={[
          styles.bubble,
          message.isLocal ? styles.localBubble : styles.remoteBubble,
        ]}
      >
        <Text style={styles.messageText}>{message.message}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.timestampText}>{formattedTime}</Text>
          <Text style={styles.reactHint}>☺+</Text>
        </View>
      </TouchableOpacity>

      {/* Active Emoji Reactions Pills */}
      {reactionEntries.length > 0 && (
        <View
          style={[
            styles.reactionsContainer,
            message.isLocal
              ? styles.localReactionsRow
              : styles.remoteReactionsRow,
          ]}
        >
          {reactionEntries.map(([emoji, users]) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionChip}
              onPress={() => onReact?.(message.id, emoji)}
            >
              <Text style={styles.reactionChipEmoji}>{emoji}</Text>
              <Text style={styles.reactionChipCount}>{users.length}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    paddingHorizontal: 12,
    maxWidth: '82%',
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 6,
  },
  timestampText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 9,
  },
  reactHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
  },
  emojiPickerRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  localPicker: {
    alignSelf: 'flex-end',
  },
  remotePicker: {
    alignSelf: 'flex-start',
  },
  emojiPickBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emojiPickText: {
    fontSize: 16,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  localReactionsRow: {
    justifyContent: 'flex-end',
  },
  remoteReactionsRow: {
    justifyContent: 'flex-start',
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  reactionChipEmoji: {
    fontSize: 12,
    marginRight: 3,
  },
  reactionChipCount: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
});


