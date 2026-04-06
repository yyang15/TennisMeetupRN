import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Avatar } from '../Avatar';

interface HostRowProps {
  hostName: string;
  reliabilityScore: number;
}

function getReliabilityColor(score: number): string {
  if (score >= 90) return colors.reliability.high;
  if (score >= 70) return colors.reliability.medium;
  return colors.reliability.low;
}

function getReliabilityBg(score: number): string {
  if (score >= 90) return 'rgba(82, 196, 26, 0.15)';
  if (score >= 70) return colors.warningMuted;
  return colors.dangerMuted;
}

export function HostRow({ hostName, reliabilityScore }: HostRowProps) {
  const relColor = getReliabilityColor(reliabilityScore);
  const relBg = getReliabilityBg(reliabilityScore);

  return (
    <View style={styles.container}>
      <Avatar name={hostName} size="lg" />

      <View style={styles.info}>
        <Text style={styles.name}>{hostName}</Text>
        <Text style={styles.label}>Host</Text>
      </View>

      <View style={[styles.reliabilityBadge, { backgroundColor: relBg }]}>
        {reliabilityScore < 70 && (
          <Ionicons name="warning" size={12} color={colors.danger} />
        )}
        <Text style={[styles.reliabilityText, { color: relColor }]}>
          {reliabilityScore}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  reliabilityText: {
    ...typography.captionMedium,
  },
});
