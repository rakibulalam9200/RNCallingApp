import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface MicroTagProps {
  name: string;
  isMuted?: boolean;
  isLocal?: boolean;
  style?: ViewStyle;
}

export const MicroTag: React.FC<MicroTagProps> = ({
  name,
  isMuted = false,
  isLocal = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.micIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
      <Text style={styles.nameText} numberOfLines={1}>
        {name} {isLocal ? '(You)' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: '85%',
  },
  micIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  nameText: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '600',
  },
});

