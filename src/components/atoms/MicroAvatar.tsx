import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface MicroAvatarProps {
  name: string;
  size?: number;
  isSpeaking?: boolean;
  style?: ViewStyle;
}

export const MicroAvatar: React.FC<MicroAvatarProps> = ({
  name,
  size = 54,
  isSpeaking = false,
  style,
}) => {
  const getInitials = (text: string) => {
    if (!text) return '?';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  // Generate a consistent vibrant color based on the name
  const getAvatarColor = (str: string) => {
    const colors = [
      '#4F46E5',
      '#7C3AED',
      '#DB2777',
      '#EA580C',
      '#059669',
      '#0891B2',
      '#2563EB',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getAvatarColor(name || 'User');

  return (
    <View
      style={[
        styles.outerRing,
        {
          width: size + 8,
          height: size + 8,
          borderRadius: (size + 8) / 2,
          borderColor: isSpeaking ? '#10B981' : 'transparent',
          borderWidth: isSpeaking ? 3 : 0,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: avatarColor,
          },
        ]}
      >
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>
          {getInitials(name)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

