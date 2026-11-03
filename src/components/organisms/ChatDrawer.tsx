import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage } from '../../types/call';
import { ChatMessageBubble } from '../molecules/ChatMessageBubble';

interface ChatDrawerProps {
  visible: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
  onClose: () => void;
}

const CHAT_QUICK_EMOJIS = ['👋', '❤️', '👍', '🔥', '🎉', '😂', '👏', '🙏'];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  visible,
  messages,
  onSendMessage,
  onReactMessage,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, messages.length]);

  if (!visible) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        styles.overlay,
        { top: Math.max(insets.top + 20, 60) },
      ]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>In-Call Messages ({messages.length})</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet.</Text>
            <Text style={styles.emptySubtext}>
              Messages & emoji reactions sent here are visible to everyone in the call. Tap any message to react!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatMessageBubble
                message={item}
                onReact={onReactMessage}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Quick Emoji Insert Strip */}
        <View style={styles.quickEmojiRow}>
          {CHAT_QUICK_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.quickEmojiBtn}
              onPress={() => setInputText((prev) => `${prev}${emoji}`)}
            >
              <Text style={styles.quickEmojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 60,
    zIndex: 100,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#1E293B',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  quickEmojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickEmojiBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  quickEmojiText: {
    fontSize: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#334155',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
});

