import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FloatingReaction } from '../../types/call';

interface FloatingReactionsOverlayProps {
  reactions: FloatingReaction[];
  onAnimationComplete: (id: string) => void;
}

const SingleFloatingEmoji: React.FC<{
  item: FloatingReaction;
  onComplete: (id: string) => void;
}> = ({ item, onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -260,
        duration: 2200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.4,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 900,
          delay: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete(item.id);
    });
  }, [item.id, onComplete, opacity, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.emojiContainer,
        {
          left: `${item.xPosition}%`,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.emojiText}>{item.emoji}</Text>
      <Text style={styles.senderText} numberOfLines={1}>
        {item.sender}
      </Text>
    </Animated.View>
  );
};

export const FloatingReactionsOverlay: React.FC<FloatingReactionsOverlayProps> = ({
  reactions,
  onAnimationComplete,
}) => {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {reactions.map((reaction) => (
        <SingleFloatingEmoji
          key={reaction.id}
          item={reaction}
          onComplete={onAnimationComplete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  emojiContainer: {
    position: 'absolute',
    bottom: 90,
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 34,
  },
  senderText: {
    fontSize: 9,
    color: '#E2E8F0',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    fontWeight: '600',
  },
});
