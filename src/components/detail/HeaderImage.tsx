import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { SessionType } from '../../data/mockSessions';

interface HeaderImageProps {
  sessionType: SessionType;
  distance: string;
}

const typeLabels: Record<SessionType, string> = {
  singles: 'Singles',
  doubles: 'Doubles',
  hitting: 'Hitting',
  coaching: 'Coaching',
};

export function HeaderImage({ sessionType, distance }: HeaderImageProps) {
  const typeColor = colors.sessionType[sessionType];

  return (
    <View style={styles.container}>
      {/* Placeholder court image */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="tennisball-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.placeholderText}>Court Photo</Text>
      </View>

      {/* Top-left: Session type badge */}
      <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
        <Text style={styles.typeBadgeText}>{typeLabels[sessionType]}</Text>
      </View>

      {/* Top-right: Distance */}
      <View style={styles.distanceBadge}>
        <Ionicons name="navigate-outline" size={12} color={colors.textPrimary} />
        <Text style={styles.distanceText}>{distance} away</Text>
      </View>

      {/* Bottom gradient overlay */}
      <View style={styles.bottomGradient} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    ...typography.captionMedium,
    color: colors.bg,
  },
  distanceBadge: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: 'rgba(14, 17, 22, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  distanceText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: colors.bg,
    opacity: 0.6,
  },
});
