import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { CostType } from '../../data/mockSessions';

interface CostRowProps {
  cost: CostType;
}

export function CostRow({ cost }: CostRowProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />

      {cost.kind === 'free' && (
        <View style={styles.content}>
          <Text style={styles.freeText}>Free</Text>
          <Text style={styles.subText}>No cost to join</Text>
        </View>
      )}

      {cost.kind === 'split' && (
        <View style={styles.content}>
          <Text style={styles.costText}>${cost.perPlayer} each</Text>
          <Text style={styles.subText}>
            ${cost.total} total split between players
          </Text>
        </View>
      )}

      {cost.kind === 'paid' && (
        <View style={styles.content}>
          <Text style={styles.costText}>{cost.rate}</Text>
          <Text style={styles.subText}>Coaching fee</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  freeText: {
    ...typography.bodyMedium,
    color: colors.accent,
  },
  costText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  subText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
