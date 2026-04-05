import React from 'react';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows, spacing } from '../../theme';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.9);
  const insets = useSafeAreaInsets();

  return (
    <Animated.View style={[styles.fabWrapper, animatedStyle, { bottom: Math.max(insets.bottom, spacing.base) + spacing.base }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.fab, shadows.accent]}
        accessibilityLabel="Create session"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={colors.bg} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    right: spacing.base,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
