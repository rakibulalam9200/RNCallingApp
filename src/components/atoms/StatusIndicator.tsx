import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface StatusIndicatorProps {
  roomName: string;
  duration?: string;
  participantCount: number;
  style?: ViewStyle;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  roomName,
  duration = '00:00',
  participantCount,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.liveDot} />
      <Text style={styles.roomText} numberOfLines={1}>
        {roomName}
      </Text>
      <Text style={styles.separator}>•</Text>
      <Text style={styles.timerText}>{duration}</Text>
      <Text style={styles.separator}>•</Text>
      <View style={styles.userCountBadge}>
        <Text style={styles.userCountText}>👥 {participantCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  roomText: {
    color: '#F3F4F6',
    fontWeight: '700',
    fontSize: 12,
    maxWidth: 110,
  },
  separator: {
    color: '#9CA3AF',
    marginHorizontal: 6,
    fontSize: 12,
  },
  timerText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  userCountBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userCountText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
});

