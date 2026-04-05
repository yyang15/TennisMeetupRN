import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.surfaceElevated, text: colors.textSecondary },
  success: { bg: 'rgba(82, 196, 26, 0.15)', text: colors.success },
  warning: { bg: colors.warningMuted, text: colors.warning },
  danger: { bg: colors.dangerMuted, text: colors.danger },
  accent: { bg: colors.accentMuted, text: colors.accent },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const v = variantStyles[variant];

  return (
    <View style={[styles.base, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

/** Small numeric dot badge (for notification bell, etc.) */
export function DotBadge({ count, style }: { count: number; style?: ViewStyle }) {
  if (count <= 0) return null;

  return (
    <View style={[styles.dot, style]}>
      <Text style={styles.dotText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.captionMedium,
    fontSize: 11,
  },
  dot: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  dotText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
