import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type MicroButtonVariant = 'primary' | 'danger' | 'neutral' | 'active' | 'warning';
export type MicroButtonSize = 'small' | 'medium' | 'large';

interface MicroButtonProps {
  onPress: () => void;
  label?: string;
  icon?: string;
  variant?: MicroButtonVariant;
  size?: MicroButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  active?: boolean;
}

export const MicroButton: React.FC<MicroButtonProps> = ({
  onPress,
  label,
  icon,
  variant = 'neutral',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  active = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#374151';
    if (active) return '#10B981';
    switch (variant) {
      case 'primary':
        return '#3B82F6';
      case 'danger':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'active':
        return '#10B981';
      case 'neutral':
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'large':
        return styles.sizeLarge;
      case 'medium':
      default:
        return styles.sizeMedium;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getSizeStyle(),
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {icon ? <Text style={[styles.iconText, textStyle]}>{icon}</Text> : null}
          {label ? <Text style={[styles.labelText, textStyle]}>{label}</Text> : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  sizeSmall: {
    width: 38,
    height: 38,
    marginHorizontal: 3,
  },
  sizeMedium: {
    width: 48,
    height: 48,
    marginHorizontal: 5,
  },
  sizeLarge: {
    width: 60,
    height: 60,
    marginHorizontal: 8,
  },
  iconText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  labelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});

