import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ReactionPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
}

const POPULAR_EMOJIS = ['❤️', '👍', '👏', '🔥', '🎉', '😂', '😮'];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelectEmoji,
}) => {
  return (
    <View style={styles.container}>
      {POPULAR_EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          style={styles.emojiBtn}
          activeOpacity={0.6}
          onPress={() => onSelectEmoji(emoji)}
        >
          <Text style={styles.emojiText}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  emojiBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  emojiText: {
    fontSize: 22,
  },
});
