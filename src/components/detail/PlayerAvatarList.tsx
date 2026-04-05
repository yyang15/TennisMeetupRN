import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Avatar } from '../Avatar';
import { Player } from '../../data/mockSessions';

interface PlayerAvatarListProps {
  players: Player[];
  totalSpots: number;
}

export function PlayerAvatarList({ players, totalSpots }: PlayerAvatarListProps) {
  const maxVisible = 6;
  const visible = players.slice(0, maxVisible);
  const overflow = players.length - maxVisible;
  const emptyCount = Math.max(0, totalSpots - players.length);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Players ({players.length}/{totalSpots})
      </Text>

      <View style={styles.avatarRow}>
        {visible.map((player, index) => (
          <View
            key={player.id}
            style={[styles.avatarWrapper, index > 0 && { marginLeft: -8 }]}
          >
            <Avatar name={player.name} size="md" style={styles.avatar} />
          </View>
        ))}

        {overflow > 0 && (
          <View style={[styles.overflowBadge, { marginLeft: -8 }]}>
            <Text style={styles.overflowText}>+{overflow}</Text>
          </View>
        )}

        {/* Empty spots — use dotted border via multiple small views for cross-platform compat */}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <View
            key={`empty-${i}`}
            style={[styles.emptySpot, i === 0 && players.length > 0 && { marginLeft: spacing.sm }]}
          >
            <Text style={styles.emptySpotText}>?</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: colors.bg,
    borderRadius: 20,
  },
  avatar: {
    borderWidth: 0,
  },
  overflowBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  overflowText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  emptySpot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  emptySpotText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
