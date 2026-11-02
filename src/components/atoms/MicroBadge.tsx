import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface MicroBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  style?: ViewStyle;
}

export const MicroBadge: React.FC<MicroBadgeProps> = ({
  label,
  variant = 'info',
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return '#065F46';
      case 'warning':
        return '#92400E';
      case 'danger':
        return '#991B1B';
      case 'info':
      default:
        return 'rgba(0, 0, 0, 0.6)';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return '#34D399';
      case 'warning':
        return '#FBBF24';
      case 'danger':
        return '#F87171';
      case 'info':
      default:
        return '#E5E7EB';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

