import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AIAssistantStatus } from '../../types/call';

interface AIAssistantPillProps {
  status: AIAssistantStatus;
  isEnabled: boolean;
  onToggle: () => void;
}

export const AIAssistantPill: React.FC<AIAssistantPillProps> = ({
  status,
  isEnabled,
  onToggle,
}) => {
  const getStatusText = () => {
    if (!isEnabled) return 'AI Off';
    switch (status) {
      case 'listening':
        return 'AI Listening...';
      case 'thinking':
        return 'AI Thinking...';
      case 'speaking':
        return 'AI Speaking';
      case 'idle':
      default:
        return 'AI Ready';
    }
  };

  const getStatusDotColor = () => {
    if (!isEnabled) return '#64748B';
    switch (status) {
      case 'listening':
        return '#3B82F6';
      case 'thinking':
        return '#F59E0B';
      case 'speaking':
        return '#10B981';
      case 'idle':
      default:
        return '#8B5CF6';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        isEnabled && styles.containerActive,
      ]}
      onPress={onToggle}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: getStatusDotColor() },
        ]}
      />
      <Text style={styles.icon}>✨</Text>
      <Text style={styles.text}>{getStatusText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  containerActive: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
});
