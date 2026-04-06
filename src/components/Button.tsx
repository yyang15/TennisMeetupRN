import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minHeight: 32 },
    text: { fontSize: 12, fontWeight: '600' },
  },
  md: {
    container: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, minHeight: 40 },
    text: { fontSize: 14, fontWeight: '600' },
  },
  lg: {
    container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, minHeight: 48 },
    text: { fontSize: 16, fontWeight: '600' },
  },
};

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.accent, ...shadows.accent },
    text: { color: colors.bg },
  },
  secondary: {
    container: { backgroundColor: colors.surface },
    text: { color: colors.textPrimary },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.danger },
    text: { color: colors.danger },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.accent },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    text: { color: '#fff' },
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = useAnimatedPress();
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          sStyle.container,
          vStyle.container,
          disabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.bg : colors.accent}
          />
        ) : (
          <Text style={[styles.text, sStyle.text, vStyle.text, disabled && styles.disabledText]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    ...typography.bodyMedium,
  },
  disabled: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.6,
  },
});
