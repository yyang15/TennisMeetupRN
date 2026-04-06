import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Chip({ label, active = false, onPress, style }: ChipProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress(0.95);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          active ? styles.active : styles.inactive,
        ]}
      >
        <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  active: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  inactive: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  text: {
    ...typography.captionMedium,
  },
  activeText: {
    color: colors.bg,
    fontWeight: '700',
  },
  inactiveText: {
    color: colors.textPrimary,
  },
});
